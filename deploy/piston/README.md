# Self-hosting Piston (code execution) — free, open source, ~5 min

DevMastery uses [Piston](https://github.com/engineer-man/piston) to compile and
run code for languages like Java, C++, Go, Rust, Kotlin, and SQL.

**JavaScript & Python don't need this** — they run entirely in the user's
browser via Web Workers + Pyodide.

Piston is a battle-tested open-source sandbox (uses `isolate` for kernel-level
isolation) — the same engine used by countless learning platforms. No API key,
no rate limit, no vendor lock-in.

---

## Option A — Fly.io (recommended, free)

Fly's free tier includes 3× shared-CPU-1x VMs with 256 MB RAM each. Piston
runs comfortably on one.

```bash
# 1. Install the Fly CLI:  https://fly.io/docs/hands-on/install-flyctl/
fly auth signup           # or `fly auth login`

# 2. Copy this repo's fly.toml
cp deploy/piston/fly.toml .

# 3. Launch (accept the defaults; use a unique app name)
fly launch --copy-config --no-deploy
fly volumes create piston_data --size 3    # 3 GB persistent volume for language packages
fly deploy

# 4. Install the language runtimes you want (one-time, ~30 s each):
APP=<your-app-name>
fly ssh console -a "$APP" -C "cd /piston/packages && piston ppman install java=15.0.2"
fly ssh console -a "$APP" -C "cd /piston/packages && piston ppman install c++=10.2.0"
fly ssh console -a "$APP" -C "cd /piston/packages && piston ppman install go=1.16.2"
fly ssh console -a "$APP" -C "cd /piston/packages && piston ppman install kotlin=1.8.20"
fly ssh console -a "$APP" -C "cd /piston/packages && piston ppman install rust=1.68.2"
fly ssh console -a "$APP" -C "cd /piston/packages && piston ppman install typescript=5.0.3"
fly ssh console -a "$APP" -C "cd /piston/packages && piston ppman install sqlite3=3.36.0"

# 5. Verify:
curl https://$APP.fly.dev/api/v2/runtimes
```

Then set the URL in your Next.js env:

```
# apps/web/.env.local           (local development)
# Cloudflare Pages → Settings → Environment Variables  (production)

PISTON_URL=https://<your-app-name>.fly.dev
```

Restart / redeploy — done.

---

## Option B — Render (also free)

1. New → Web Service → **Deploy an existing image**
2. Image URL: `ghcr.io/engineer-man/piston:latest`
3. Instance Type: **Free**
4. Add a persistent disk (1 GB is enough) mounted at `/piston/packages`
5. After it's live, open the Render shell and run the `ppman install …`
   commands above.
6. Copy the service URL and set `PISTON_URL` in your app's env vars.

---

## Option C — Any VPS (Docker)

```bash
docker run -d --name piston \
  --restart unless-stopped \
  -p 2000:2000 \
  -v piston_data:/piston/packages \
  --privileged \
  ghcr.io/engineer-man/piston:latest

# Install runtimes:
docker exec -it piston ppman install java=15.0.2 c++=10.2.0 go=1.16.2 kotlin=1.8.20

# Point your app at http://<vps-ip>:2000  (put a reverse proxy + TLS in front for prod)
```

Set `PISTON_URL=https://your-vps-domain` in your Next.js env.

---

## Option D — Local dev only (docker-compose)

For local testing, just run:

```bash
cd deploy/piston
docker compose up -d
docker compose exec piston ppman install java=15.0.2
```

Then in `apps/web/.env.local`:

```
PISTON_URL=http://localhost:2000
```

---

## Sanity check

Any Piston deployment should respond to:

```bash
curl -X POST $PISTON_URL/api/v2/execute \
  -H 'Content-Type: application/json' \
  -d '{
    "language": "java",
    "version":  "15.0.2",
    "files": [{
      "name": "Main.java",
      "content": "public class Main { public static void main(String[] a){ System.out.println(\"hello piston\"); } }"
    }]
  }'
```

Expected output includes `"stdout":"hello piston\n"`.

---

## Cost & scale

- **Fly.io free tier:** ~3 M requests/month before you'd need to add a card.
- **Render free tier:** spins down after 15 min idle (~30 s cold start).
- **VPS:** whatever your host bills for the VM.

For a learning platform with a few hundred DAU, the free tier is more than enough.

