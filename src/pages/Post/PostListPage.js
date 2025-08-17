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
    '뉴스', '차계', '농업', '산업', '제다', '단체 소식'
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
  // totalPages가 0이거나 undefined인 경우 표시하지 않음
  if (!totalPages || totalPages <= 0) {
    return null;
  }

  const pages = [];
  const maxVisiblePages = 5; // 표시할 페이지 수를 줄임
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <ul className="pagination-list">
        {/* 처음 페이지 버튼 */}
        <li className="pagination-item">
          <button 
            className="pagination-btn pagination-nav" 
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="첫 페이지로 이동"
          >
            ≪
          </button>
        </li>
        
        {/* 이전 페이지 버튼 */}
        <li className="pagination-item">
          <button 
            className="pagination-btn pagination-nav" 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="이전 페이지로 이동"
          >
            ‹
          </button>
        </li>
        
        {/* 페이지 번호들 */}
        {startPage > 1 && (
          <>
            <li className="pagination-item">
              <button
                className="pagination-btn"
                onClick={() => onPageChange(1)}
                aria-label="1페이지로 이동"
              >
                1
              </button>
            </li>
            {startPage > 2 && (
              <li className="pagination-item">
                <span className="pagination-ellipsis" aria-hidden="true">...</span>
              </li>
            )}
          </>
        )}
        
        {pages.map(page => (
          <li key={page} className="pagination-item">
            <button
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
              aria-label={`${page}페이지로 이동`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          </li>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <li className="pagination-item">
                <span className="pagination-ellipsis" aria-hidden="true">...</span>
              </li>
            )}
            <li className="pagination-item">
              <button
                className="pagination-btn"
                onClick={() => onPageChange(totalPages)}
                aria-label={`${totalPages}페이지로 이동`}
              >
                {totalPages}
              </button>
            </li>
          </>
        )}
        
        {/* 다음 페이지 버튼 */}
        <li className="pagination-item">
          <button 
            className="pagination-btn pagination-nav" 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="다음 페이지로 이동"
          >
            ›
          </button>
        </li>
        
        {/* 마지막 페이지 버튼 */}
        <li className="pagination-item">
          <button 
            className="pagination-btn pagination-nav" 
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="마지막 페이지로 이동"
          >
            ≫
          </button>
        </li>
      </ul>
    </nav>
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
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    setLoading(true);
    getPostsByCategory(category, currentPage - 1, 10).then(data => {
      setPosts(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
      setLoading(false);
    }).catch(error => {
      console.error('게시글 로딩 중 오류 발생:', error);
      setPosts([]);
      setLoading(false);
    });
  }, [category, currentPage]);

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
              <span className="category-count">(총 : {totalElements}건)</span>
            </div>
          </div>
          {/* section-body: 게시글 리스트 */}
          <div className="section-body">
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
                      <div className="post-content">
                        <h3 className="post-title">{post.title}</h3>
                        <p className="post-summary">{getTwoLineSummary(extractTextFromHtml(post.content))}</p>
                        <div className="post-meta">
                          <span className="post-subcategory">{getSubCategoryName(category, post.subSection)}</span>
                          <span className="post-author">{post.username || '작성자'}</span>
                          <span className="post-date">{formatDateTime(post.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
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
      {/* 페이지네이션 - 컨테이너 밖에 배치 */}
      {!loading && posts.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </MainLayout>
  );
} 