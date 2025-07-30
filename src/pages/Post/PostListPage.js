import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getPostsByCategory } from '../../api/post';
import MainLayout from '../../components/MainLayout';
import './PostListPage.css';

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\./g, '.').replace(/,/g, '');
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

// 페이지네이션 컴포넌트
function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  const maxVisiblePages = 10;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <button 
        className="pagination-btn" 
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        처음
      </button>
      
      {pages.map(page => (
        <button
          key={page}
          className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      
      <button 
        className="pagination-btn" 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        다음
      </button>
      <button 
        className="pagination-btn" 
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        끝
      </button>
    </div>
  );
}

// 사이드바 뉴스 아이템 컴포넌트
function SidebarNewsItem({ post, index }) {
  return (
    <div className="sidebar-news-item">
      {index && <span className="sidebar-news-rank">{index}</span>}
      <div className="sidebar-news-content">
        <h4 className="sidebar-news-title">{post.title}</h4>
      </div>
    </div>
  );
}

export default function PostListPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || '오피니언';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 10;

  useEffect(() => {
    setLoading(true);
    getPostsByCategory(category).then(data => {
      setPosts(data || []);
      setTotalPages(Math.ceil((data || []).length / postsPerPage));
      setLoading(false);
    });
  }, [category]);

  // 현재 페이지의 게시글들
  const currentPosts = posts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  // 사이드바용 뉴스 (임시 데이터)
  const sidebarNews = posts.slice(0, 4);
  const latestNews = posts.slice(0, 4);
  const popularNews = posts.slice(0, 5);

  return (
    <MainLayout>
      <div id="sections" className="post-list-container">
        {/* section: 본문 */}
        <section className="section">
          {/* header: 카테고리명 + 뷰옵션 */}
          <div className="header">
            <div className="category-header">
              <h1 className="category-title">{category} 목록</h1>
              <span className="category-count">(총 : {posts.length}건)</span>
            </div>
          </div>
          {/* section-body: 게시글 리스트 */}
          <div className="section-body">
            {loading ? (
              <div className="post-list-loading">로딩 중...</div>
            ) : currentPosts.length === 0 ? (
              <div className="post-list-empty">게시글이 없습니다.</div>
            ) : (
              <>
                <div className="post-list">
                  {currentPosts.map(post => (
                    <Link to={`/post/${post.id}`} key={post.id} className="post-card-link">
                      <div className="post-card">
                        <img src={post.thumbnailUrl} alt="썸네일" className="post-thumbnail" />
                        <div className="post-content">
                          <h3 className="post-title">{post.title}</h3>
                          <p className="post-summary">{getTwoLineSummary(extractTextFromHtml(post.content))}</p>
                          <div className="post-meta">
                            <span className="post-subcategory">{getSubCategoryName(category, post.subSection)}</span>
                            <span className="post-author">윤미연 기자</span>
                            <span className="post-date">{formatDateTime(post.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </div>
        </section>
        {/* sidebar */}
        <aside className="sidebar">
          {/* 주요뉴스 */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">주요뉴스</h3>
            <div className="sidebar-news-list">
              {sidebarNews.map(post => (
                <SidebarNewsItem key={post.id} post={post} />
              ))}
            </div>
          </div>
          {/* 최신기사 */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">최신기사</h3>
            <div className="sidebar-news-list">
              {latestNews.map(post => (
                <SidebarNewsItem key={post.id} post={post} />
              ))}
            </div>
          </div>
          {/* 많이 본 기사 */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">많이 본 기사</h3>
            <div className="sidebar-news-list">
              {popularNews.map((post, index) => (
                <SidebarNewsItem key={post.id} post={post} index={index + 1} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
} 