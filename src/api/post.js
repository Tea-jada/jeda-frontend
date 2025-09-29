const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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

export async function postPost({ title, content, category, subCategory, thumbnailUrl, token }) {
  const response = await fetch(`${API_BASE_URL}/api/v1/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({
      type: '공지사항', 
      title,
      content,
      thumbnailUrl,
      category,        
      subCategory,      
    }),
  });

  const result = await response.json();
  return { status: response.status, ...result };
}

// 카테고리 목록 조회
export async function getCategories() {
  // const token = localStorage.getItem('Authorization');
  const response = await fetch(`${API_BASE_URL}/api/v1/categories`, {
    method: 'GET',
    // headers: token ? { Authorization: token } : {},
  });
  const result = await response.json();
  return { status: response.status, ...result };
}

// 특정 카테고리의 서브카테고리 조회
export async function getSubCategories(categoryId) {
  // const token = localStorage.getItem('Authorization');
  const response = await fetch(`${API_BASE_URL}/api/v1/categories/${categoryId}/subcategories`, {
    method: 'GET',
    // headers: token ? { Authorization: token } : {},
  });
  const result = await response.json();
  return { status: response.status, ...result };
}

// 카테고리별 게시글 조회
export async function getPostsByCategory(category, page = 0, size = 10) {
  const response = await fetch(`${API_BASE_URL}/api/v1/posts/section?page=${page}&size=${size}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ category }),
  });

  if (!response.ok) return { content: [], totalPages: 0, totalElements: 0 };

  const result = await response.json();
  return {
    content: result.data?.content || [],
    totalPages: result.data?.totalPages || 0,
    totalElements: result.data?.totalElements || 0,
    currentPage: result.data?.number || 0
  };
}

// 기존 getPostsByCategoryAndSub 대체
export async function getPostsByCategoryAndSub(category, subCategory, page = 0, size = 10) {
  const response = await fetch(`${API_BASE_URL}/api/v1/posts/sub-section?page=${page}&size=${size}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ category, subCategory }),
  });

  if (!response.ok) return { content: [], totalPages: 0, totalElements: 0 };

  const result = await response.json();
  return {
    content: result.data?.content || [],
    totalPages: result.data?.totalPages || 0,
    totalElements: result.data?.totalElements || 0,
    currentPage: result.data?.number || 0
  };
}


export async function getPostById(postId) {
  const response = await fetch(`${API_BASE_URL}/api/v1/posts/${postId}`);
  if (!response.ok) return null;
  const result = await response.json();
  return result.data;
}

// 게시글 수정 API
export async function updatePost(postId, { title, content }) {
  const token = localStorage.getItem('Authorization');
  const response = await fetch(`${API_BASE_URL}/api/v1/posts/${postId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: token } : {}),
    },
    body: JSON.stringify({ title, content }),
  });
  const result = await response.json();
  return { status: response.status, ...result };
} 

export async function deletePost(postId) {
  const token = localStorage.getItem('Authorization');
  const response = await fetch(`${API_BASE_URL}/api/v1/posts/${postId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token,
    },
  });
  return response;
}

export async function searchPosts(keyword, page = 0, size = 10) {
  const response = await fetch(`${API_BASE_URL}/api/v1/posts/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
  if (!response.ok) return { content: [], totalPages: 0, totalElements: 0 };
  const result = await response.json();
  return {
    content: result.data?.content || [],
    totalPages: result.data?.totalPages || 0,
    totalElements: result.data?.totalElements || 0,
    currentPage: result.data?.number || 0
  };
}

// 댓글 관련 API 함수들
export async function createComment(postId, content) {
  const token = localStorage.getItem('Authorization');
  const response = await fetch(`${API_BASE_URL}/api/v1/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({ comment: content }),
  });
  const result = await response.json();
  return { status: response.status, ...result };
}

export async function getComments(postId) {
  const response = await fetch(`${API_BASE_URL}/api/v1/posts/${postId}/comments?page=0`);
  if (!response.ok) return [];
  const result = await response.json();
  return result.data?.content || [];
}

export async function deleteComment(commentId) {
  const token = localStorage.getItem('Authorization');
  const response = await fetch(`${API_BASE_URL}/api/v1/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: token,
    },
  });
  return response;
}

export async function updateComment(commentId, content) {
  const token = localStorage.getItem('Authorization');
  const response = await fetch(`${API_BASE_URL}/api/v1/comments/${commentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({ comment: content }),
  });
  const result = await response.json();
  return { status: response.status, ...result };
}