export async function fetchAuthData(endpoint: string, options: RequestInit = {}) {
  // In a real app, this would get the token from cookies/localStorage
  // For now, it just calls the backend
  const baseUrl = process.env.NEXT_PUBLIC_CONTENT_API_URL || 'http://localhost:8081/v1';
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`,
      // For local testing in Phase 1B, using X-User-Id header for auth propagation bypass
      'X-User-Id': '123e4567-e89b-12d3-a456-426614174000',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}
