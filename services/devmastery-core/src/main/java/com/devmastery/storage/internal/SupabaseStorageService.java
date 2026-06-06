package com.devmastery.storage.internal;

import com.devmastery.storage.api.StorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.core.io.buffer.DefaultDataBufferFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.io.InputStream;

/**
 * Supabase Storage adapter using their REST API.
 * Docs: https://supabase.com/docs/guides/storage/uploads
 *
 * <p>Authentication is via the service-role key (never exposed to clients).
 * Files are uploaded via POST /storage/v1/object/{bucket}/{path}.</p>
 *
 * <p>No credit card required — 1 GB included in the free tier.</p>
 */
@Service
class SupabaseStorageService implements StorageService {

    private static final int MAX_FILE_SIZE = 200 * 1024; // 200 KB hard limit

    private final WebClient client;
    private final String supabaseUrl;

    SupabaseStorageService(
            @Value("${app.storage.supabase.url}") String supabaseUrl,
            @Value("${app.storage.supabase.service-role-key}") String serviceRoleKey) {
        this.supabaseUrl = supabaseUrl;
        this.client = WebClient.builder()
                .baseUrl(supabaseUrl + "/storage/v1")
                .defaultHeader("Authorization", "Bearer " + serviceRoleKey)
                .defaultHeader("apikey", serviceRoleKey)
                .build();
    }

    @Override
    public String upload(String bucket, String path, InputStream content, long size, String contentType) {
        if (size > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File exceeds 200KB limit (got " + size + " bytes)");
        }

        Flux<DataBuffer> body = DataBufferUtils.readInputStream(
                () -> content, new DefaultDataBufferFactory(), 8192);

        client.post()
                .uri("/object/{bucket}/{path}", bucket, path)
                .contentType(MediaType.parseMediaType(contentType))
                .header("x-upsert", "true")
                .body(body, DataBuffer.class)
                .retrieve()
                .toBodilessEntity()
                .block();

        return publicUrl(bucket, path);
    }

    @Override
    public void delete(String bucket, String path) {
        client.delete()
                .uri("/object/{bucket}/{path}", bucket, path)
                .retrieve()
                .toBodilessEntity()
                .block();
    }

    @Override
    public String publicUrl(String bucket, String path) {
        return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + path;
    }
}
