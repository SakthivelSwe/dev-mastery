package com.devmastery.storage.api;

import java.io.InputStream;

/**
 * Public storage API. Backed by Supabase Storage (free, no credit card).
 * Other modules call this interface — never the internal implementation.
 */
public interface StorageService {

    /** Upload a file to the given bucket/path. Returns the public URL. */
    String upload(String bucket, String path, InputStream content, long size, String contentType);

    /**
     * Upload raw bytes to the given bucket/path without enforcing the multipart size limit.
     * Use this for server-side generated content (e.g. PDF certificates).
     * Returns the public URL.
     */
    String uploadBytes(String bucket, String path, byte[] content, String contentType);

    /** Delete a file from the given bucket/path. */
    void delete(String bucket, String path);

    /** Get the public URL for an existing file. */
    String publicUrl(String bucket, String path);
}
