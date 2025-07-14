const API_BASE_URL = 'http://localhost:8080';

export async function uploadPostImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('Authorization');
  const response = await fetch(`${API_BASE_URL}/api/v1/posts/upload`, {
    method: 'POST',
    headers: token ? { Authorization: token } : {},
    body: formData,
  });
  const result = await response.json();
  return { status: response.status, ...result };
} 