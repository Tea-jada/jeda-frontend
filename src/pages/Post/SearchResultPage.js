import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchPosts } from '../../api/post';
import MainLayout from '../../components/MainLayout';
import './SearchResultPage.css';

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

// 페이지네이션 컴포넌트
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 0) return null;

  const pages = [];
  const maxVisiblePages = 5;
  
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
        <li className="pagination-item">
          <button 
            className="pagination-btn pagination-nav" 
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            ≪
          </button>
        </li>
        <li className="pagination-item">
          <button 
            className="pagination-btn pagination-nav" 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ‹
          </button>
        </li>

        {startPage > 1 && (
          <>
            <li className="pagination-item">
              <button
                className="pagination-btn"
                onClick={() => onPageChange(1)}
              >
                1
              </button>
            </li>
            {startPage > 2 && (
              <li className="pagination-item">
                <span className="pagination-ellipsis">...</span>
              </li>
            )}
          </>
        )}

        {pages.map(page => (
          <li key={page} className="pagination-item">
            <button
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </li>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <li className="pagination-item">
                <span className="pagination-ellipsis">...</span>
              </li>
            )}
            <li className="pagination-item">
              <button
                className="pagination-btn"
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </button>
            </li>
          </>
        )}

        <li className="pagination-item">
          <button 
            className="pagination-btn pagination-nav" 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
        </li>
        <li className="pagination-item">
          <button 
            className="pagination-btn pagination-nav" 
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            ≫
          </button>
        </li>
      </ul>
    </nav>
  );
}

// 사이드바 뉴스 아이템
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

export default function SearchResultPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    if (!query.trim()) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    searchPosts(query, currentPage - 1, 10).then(data => {
      setPosts(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
      setLoading(false);
    }).catch(error => {
      console.error('검색 중 오류 발생:', error);
      setPosts([]);
      setLoading(false);
    });
  }, [query, currentPage]);

  const sidebarNews = posts.slice(0, 4);
  const latestNews = posts.slice(0, 4);
  const popularNews = posts.slice(0, 5);

  return (
    <MainLayout>
      <div id="sections" className="post-list-container">
        <section className="section">
          <div className="header">
            <div className="category-header">
              <h1 className="category-title">검색 결과: "{query}"</h1>
              <span className="category-count">(총 : {totalElements}건)</span>
            </div>
          </div>
          <div className="section-body">
            {loading ? (
              <div className="post-list-loading">검색 중...</div>
            ) : posts.length === 0 ? (
              <div className="post-list-empty">
                <p>검색 결과가 없습니다.</p>
                <p>다른 키워드로 검색해보세요.</p>
              </div>
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
                          {/* API에서 한글로 내려주는 category, subCategory 사용 */}
                          <span className="post-subcategory">{post.subCategory}</span>
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

        <aside className="sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">주요뉴스</h3>
            <div className="sidebar-news-list">
              {sidebarNews.map(post => (
                <SidebarNewsItem key={post.id} post={post} />
              ))}
            </div>
          </div>
          <div className="sidebar-section">
            <h3 className="sidebar-title">최신기사</h3>
            <div className="sidebar-news-list">
              {latestNews.map(post => (
                <SidebarNewsItem key={post.id} post={post} />
              ))}
            </div>
          </div>
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
