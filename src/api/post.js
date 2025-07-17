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

export async function getPostsByCategory(category) {
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
  const response = await fetch(`${API_BASE_URL}/api/v1/posts/section/${section}?page=0&size=10`);
  if (!response.ok) return [];
  const result = await response.json();
  return result.data?.content || [];
} 