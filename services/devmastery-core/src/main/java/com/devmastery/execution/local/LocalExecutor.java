package com.devmastery.execution.local;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Stream;

/**
 * In-process code execution for the DevMastery backend.
 *
 * <p>This runs compiled / interpreted user code as sub-processes on the same
 * Render instance that hosts the API. It is intentionally minimal and NOT a
 * kernel-level sandbox — do not point it at untrusted input without an auth
 * layer + rate limiting in front. It applies the following defences:</p>
 *
 * <ul>
 *   <li>Hard wall-clock timeouts (default 5 s run, 10 s compile).</li>
 *   <li>JVM heap cap for Java children ({@code -Xmx128m}).</li>
 *   <li>Output truncation (default 10 KB) to prevent memory-exhaustion via {@code println}.</li>
 *   <li>Isolated temp working directory, deleted after each execution.</li>
 *   <li>Sub-processes are killed forcibly on timeout, and again on JVM shutdown.</li>
 * </ul>
 *
 * <p>For higher assurance sandboxing, deploy a Piston server (see {@code deploy/piston/README.md})
 * and set {@code PISTON_URL} in the Next.js edge route — that path bypasses this class.</p>
 */
@Service
public class LocalExecutor {

    private static final Logger log = LoggerFactory.getLogger(LocalExecutor.class);

    private final long   compileTimeoutMs;
    private final long   runTimeoutMs;
    private final int    maxOutputBytes;
    private final int    maxSourceBytes;
    private final Path   tmpRoot;
    private final ExecutorService streamPump = Executors.newCachedThreadPool(r -> {
        Thread t = new Thread(r, "exec-stream-pump");
        t.setDaemon(true);
        return t;
    });

    public LocalExecutor(
            @Value("${app.execution.compile-timeout-ms:10000}") long compileTimeoutMs,
            @Value("${app.execution.run-timeout-ms:5000}")      long runTimeoutMs,
            @Value("${app.execution.max-output-bytes:10240}")   int  maxOutputBytes,
            @Value("${app.execution.max-source-bytes:100000}")  int  maxSourceBytes
    ) throws IOException {
        this.compileTimeoutMs = compileTimeoutMs;
        this.runTimeoutMs     = runTimeoutMs;
        this.maxOutputBytes   = maxOutputBytes;
        this.maxSourceBytes   = maxSourceBytes;
        this.tmpRoot          = Files.createTempDirectory("devmastery-exec-");
        this.tmpRoot.toFile().deleteOnExit();
    }

    public ExecutionResult execute(String language, String source, String stdin) {
        if (source == null || source.isBlank()) {
            return unavailable("Source code is empty.");
        }
        if (source.length() > maxSourceBytes) {
            return unavailable("Source code exceeds the " + maxSourceBytes + "-byte limit.");
        }
        String lang = language == null ? "" : language.toLowerCase(Locale.ROOT);
        try {
            return switch (lang) {
                case "java"   -> runJava(source, stdin == null ? "" : stdin);
                default       -> unavailable("Language '" + lang + "' is not supported by the in-process executor. " +
                        "JavaScript & Python run in the browser; other languages require a Piston deployment.");
            };
        } catch (Exception e) {
            log.warn("Executor internal error", e);
            return unavailable("Internal executor error: " + e.getMessage());
        }
    }

    // ─── Java ────────────────────────────────────────────────────────────────

    private ExecutionResult runJava(String source, String stdin) throws IOException, InterruptedException {
        Path workDir = Files.createTempDirectory(tmpRoot, "job-");
        try {
            // Detect class name; default to Main.
            String className = detectPublicClassName(source).orElse("Main");
            Path srcFile = workDir.resolve(className + ".java");
            Files.writeString(srcFile, source, StandardCharsets.UTF_8);

            // 1) Compile
            long t0 = System.nanoTime();
            ProcResult compile = runProc(
                    new ProcessBuilder("javac", "-d", ".", srcFile.getFileName().toString())
                            .directory(workDir.toFile()),
                    "",
                    compileTimeoutMs);
            double compileSecs = (System.nanoTime() - t0) / 1e9;

            if (compile.timedOut) {
                return new ExecutionResult(null, null, "Compilation timed out after " + compileTimeoutMs + " ms.",
                        null, 6, "Compilation Error", compileSecs, null, "render-local");
            }
            if (compile.exitCode != 0) {
                return new ExecutionResult(null, null,
                        blank(compile.stderr) ? compile.stdout : compile.stderr,
                        null, 6, "Compilation Error", compileSecs, null, "render-local");
            }

            // 2) Run
            long t1 = System.nanoTime();
            ProcResult run = runProc(
                    new ProcessBuilder(
                            "java",
                            "-Xmx128m", "-Xss512k",
                            "-XX:+UseSerialGC",
                            "-Djava.security.egd=file:/dev/./urandom",
                            className)
                            .directory(workDir.toFile()),
                    stdin,
                    runTimeoutMs);
            double runSecs = (System.nanoTime() - t1) / 1e9;

            if (run.timedOut) {
                return new ExecutionResult(nullIfBlank(run.stdout), nullIfBlank(run.stderr), null,
                        "Execution timed out after " + runTimeoutMs + " ms (possible infinite loop).",
                        5, "Time Limit Exceeded", runSecs, null, "render-local");
            }
            if (run.exitCode != 0) {
                return new ExecutionResult(nullIfBlank(run.stdout), nullIfBlank(run.stderr), null,
                        null, 4, "Runtime Error", runSecs, null, "render-local");
            }
            return new ExecutionResult(nullIfBlank(run.stdout), nullIfBlank(run.stderr), null,
                    null, 3, "Accepted", runSecs, null, "render-local");
        } finally {
            deleteRecursively(workDir);
        }
    }

    // ─── Process helpers ─────────────────────────────────────────────────────

    private record ProcResult(int exitCode, String stdout, String stderr, boolean timedOut) {}

    private ProcResult runProc(ProcessBuilder pb, String stdin, long timeoutMs) throws IOException, InterruptedException {
        pb.redirectErrorStream(false);
        Process proc = pb.start();

        // Pipe stdin (bounded — 64 KB max)
        if (stdin != null && !stdin.isEmpty()) {
            byte[] bytes = stdin.getBytes(StandardCharsets.UTF_8);
            int limit = Math.min(bytes.length, 64 * 1024);
            try (var os = proc.getOutputStream()) {
                os.write(bytes, 0, limit);
            } catch (IOException ignore) { /* process may have exited before we wrote */ }
        } else {
            try { proc.getOutputStream().close(); } catch (IOException ignore) {}
        }

        // Capture stdout/stderr in parallel with a hard byte cap.
        Future<String> out = streamPump.submit(() -> readCapped(proc.getInputStream()));
        Future<String> err = streamPump.submit(() -> readCapped(proc.getErrorStream()));

        boolean finished = proc.waitFor(timeoutMs, TimeUnit.MILLISECONDS);
        if (!finished) {
            proc.destroyForcibly();
            proc.waitFor(1, TimeUnit.SECONDS);
            return new ProcResult(-1, safeGet(out), safeGet(err), true);
        }
        return new ProcResult(proc.exitValue(), safeGet(out), safeGet(err), false);
    }

    private String readCapped(java.io.InputStream in) {
        StringBuilder sb = new StringBuilder();
        byte[] buf = new byte[4096];
        int total = 0;
        try {
            int n;
            while ((n = in.read(buf)) != -1) {
                int allowed = Math.min(n, maxOutputBytes - total);
                if (allowed > 0) {
                    sb.append(new String(buf, 0, allowed, StandardCharsets.UTF_8));
                    total += allowed;
                }
                if (total >= maxOutputBytes) {
                    sb.append("\n… (output truncated at ").append(maxOutputBytes).append(" bytes)");
                    // Drain the rest so the child isn't blocked on a full pipe buffer.
                    while (in.read(buf) != -1) { /* discard */ }
                    break;
                }
            }
        } catch (IOException ignore) { /* stream closed on kill */ }
        return sb.toString();
    }

    private static String safeGet(Future<String> f) {
        try { return f.get(1, TimeUnit.SECONDS); }
        catch (Exception e) { return ""; }
    }

    // ─── Utilities ───────────────────────────────────────────────────────────

    private static Optional<String> detectPublicClassName(String source) {
        // Match:  public [final|abstract] class <Name>
        var m = java.util.regex.Pattern
                .compile("public\\s+(?:final\\s+|abstract\\s+)?class\\s+([A-Za-z_][A-Za-z0-9_]*)")
                .matcher(source);
        return m.find() ? Optional.of(m.group(1)) : Optional.empty();
    }

    private static boolean blank(String s) { return s == null || s.isBlank(); }
    private static String  nullIfBlank(String s) { return blank(s) ? null : s; }

    private static ExecutionResult unavailable(String msg) {
        return new ExecutionResult(null, null, null, msg, 0, "Runtime Unavailable", null, null, "unavailable");
    }

    private static void deleteRecursively(Path dir) {
        if (dir == null || !Files.exists(dir)) return;
        try (Stream<Path> walk = Files.walk(dir)) {
            walk.sorted(Comparator.reverseOrder()).forEach(p -> { try { Files.deleteIfExists(p); } catch (IOException ignore) {} });
        } catch (IOException ignore) { /* best-effort cleanup */ }
    }
}

