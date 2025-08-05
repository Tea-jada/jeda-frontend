const API_BASE_URL = 'http://localhost:8080';

export async function signup({ email, username, password }) {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });
  const data = await response.json();
  return { status: response.status, ...data };
}

export async function login({ username, password }) {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  const authorization = response.headers.get('Authorization');
  const refreshToken = response.headers.get('Refresh-Token');
  return { status: response.status, ...data, authorization, refreshToken };
}

export async function adminSignup({ email, username, password, adminCode }) {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/signup/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password, adminCode }),
  });
  const data = await response.json();
  return { status: response.status, ...data };
}

export async function getUserInfo(userId) {
  const token = localStorage.getItem('Authorization');
  const response = await fetch(`${API_BASE_URL}/api/v1/users/info/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
  });
  const result = await response.json();
  return { status: response.status, ...result };
}

export async function updateUserInfo(userId, updateData) {
  const token = localStorage.getItem('Authorization');
  const response = await fetch(`${API_BASE_URL}/api/v1/users/info/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(updateData),
  });
  const result = await response.json();
  return { status: response.status, ...result };
} 