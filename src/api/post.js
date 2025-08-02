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

export async function postPost({ title, content, section, subSection, thumbnailUrl, token }) {
  // section 매핑
  const sectionMap = {
    '오피니언': 'OPINION',
    '차와 뉴스': 'TEA_AND_NEWS',
    '차와 문화': 'TEA_AND_CULTURE',
    '차와 사람': 'TEA_AND_PEAPLE',
    '차의 세계': 'TEA_AND_WORLD',
    '차와 예술': 'TEA_AND_ART',
  };
  // subSection 매핑 (항목 순서대로 ONE, TWO, ...)
  const subSectionMap = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN'];
  const sectionValue = sectionMap[section] || 'OPINION';
  const subSectionValue = subSectionMap[subSection] || 'ONE';
  const response = await fetch(`${API_BASE_URL}/api/v1/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({
      type: 'NOTICE',
      title,
      content,
      category: 'NOTICE',
      thumbnailUrl,
      section: sectionValue,
      subSection: subSectionValue,
    }),
  });
  const result = await response.json();
  return { status: response.status, ...result };
}

export async function getPostsByCategory(category, page = 0, size = 10) {
  // section 매핑
  const sectionMap = {
    '오피니언': 'OPINION',
    '차와 뉴스': 'TEA_AND_NEWS',
    '차와 문화': 'TEA_AND_CULTURE',
    '차와 사람': 'TEA_AND_PEAPLE',
    '차의 세계': 'TEA_AND_WORLD',
    '차와 예술': 'TEA_AND_ART',
  };
  const section = sectionMap[category] || 'OPINION';
  const response = await fetch(`${API_BASE_URL}/api/v1/posts/section/${section}?page=${page}&size=${size}`);
  if (!response.ok) return { content: [], totalPages: 0, totalElements: 0 };
  const result = await response.json();
  return {
    content: result.data?.content || [],
    totalPages: result.data?.totalPages || 0,
    totalElements: result.data?.totalElements || 0,
    currentPage: result.data?.number || 0
  };
}

export async function getPostsByCategoryAndSub(category, subCategory) {
  // section 매핑
  const sectionMap = {
    '오피니언': 'OPINION',
    '차와 뉴스': 'TEA_AND_NEWS',
    '차와 문화': 'TEA_AND_CULTURE',
    '차와 사람': 'TEA_AND_PEAPLE',
    '차의 세계': 'TEA_AND_WORLD',
    '차와 예술': 'TEA_AND_ART',
  };
  // subSection 매핑 (항목 순서대로 ONE, TWO, ...)
  const subSectionMapByCategory = {
    '오피니언': ['사설', '칼럼', '송강스님의 세계의 명차', '세운스님의 차로 마음을 보다', '한남호목사의 차와 인문학', '장미향선생의 제다이야기', '김대호교수가 만난 차인과 제다인'],
    '차와 뉴스': ['차계', '농업', '산업', '제다', '단체 소식'],
    '차와 문화': ['교육', '여행', '학술', '출판'],
    '차와 사람': ['차인', '제다인', '차공예인', '티소믈리에'],
    '차의 세계': ['세계의 차', '한국의 차', '대용차', '브랜딩차', '티-가든', '티-카페/티-하우스'],
    '차와 예술': ['전시', '다례', '도예', '공예', '공연', '정원'],
  };
  const section = sectionMap[category] || 'OPINION';
  const subList = subSectionMapByCategory[category] || [];
  const subIdx = subList.findIndex(s => s === subCategory);
  const subSectionEnum = ['ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN'][subIdx] || 'ONE';
  const response = await fetch(`${API_BASE_URL}/api/v1/posts/section/${section}/sub-section/${subSectionEnum}?page=0&size=10`);
  if (!response.ok) return [];
  const result = await response.json();
  return result.data?.content || [];
}

export async function getPostById(postId) {
  const response = await fetch(`${API_BASE_URL}/api/v1/posts/${postId}`);
  if (!response.ok) return null;
  const result = await response.json();
  return result.data;
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

export async function deleteComment(postId, commentId) {
  const token = localStorage.getItem('Authorization');
  const response = await fetch(`${API_BASE_URL}/api/v1/posts/${postId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: token,
    },
  });
  return response;
} 