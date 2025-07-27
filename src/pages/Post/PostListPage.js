import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getPostsByCategory } from '../../api/post';
import MainLayout from '../../components/MainLayout';
import './PostListPage.css';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function extractTextFromHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.innerText.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
}

function getTwoLineSummary(text, maxLen = 80) {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

// 카테고리별 subSection 매핑
const subSectionMapByCategory = {
  '오피니언': [
    '사설',
    '칼럼',
    '송강스님의 세계의 명차',
    '세운스님의 차로 마음을 보다.',
    '한남호목사의 차와 인문학',
    '장미향선생의 제다이야기',
    '김대호교수가 만난 차인과 제다인',
  ],
  '차와 뉴스': [
    '차계', '농업', '산업', '제다', '단체 소식'
  ],
  '차와 문화': [
    '교육', '여행', '학술', '출판'
  ],
  '차와 사람': [
    '차인', '제다인', '차공예인', '티소믈리에'
  ],
  '차의 세계': [
    '세계의 차', '한국의 차', '대용차', '브랜딩차', '티-가든', '티-카페/티-하우스'
  ],
  '차와 예술': [
    '전시', '다례', '도예', '공예', '공연', '정원'
  ],
};

function getSubCategoryName(category, subSection) {
  const arr = subSectionMapByCategory[category] || [];
  const idxMap = { ONE: 0, TWO: 1, THREE: 2, FOUR: 3, FIVE: 4, SIX: 5, SEVEN: 6 };
  return arr[idxMap[subSection]] || subSection;
}

export default function PostListPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || '오피니언';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPostsByCategory(category).then(data => {
      setPosts(data || []);
      setLoading(false);
    });
  }, [category]);

  return (
    <MainLayout>
      <div className="post-list-wrapper">
        <h2 className="post-list-title">{category} 게시글</h2>
        {loading ? (
          <div className="post-list-loading">로딩 중...</div>
        ) : posts.length === 0 ? (
          <div className="post-list-empty">게시글이 없습니다.</div>
        ) : (
          <div className="post-list">
            {posts.map(post => (
              <Link to={`/post/${post.id}`} key={post.id} className="post-card-link">
                <div className="post-card">
                  <img src={post.thumbnailUrl} alt="썸네일" className="post-thumbnail" />
                  <div className="post-meta">
                    <span className="post-subcategory">{getSubCategoryName(category, post.subSection)}</span>
                    <span className="post-author">김우진</span>
                    <span className="post-date">{formatDate(post.updatedAt)}</span>
                  </div>
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-summary">{getTwoLineSummary(extractTextFromHtml(post.content))}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
} 