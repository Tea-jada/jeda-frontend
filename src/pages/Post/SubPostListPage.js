import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getPostsByCategoryAndSub } from '../../api/post';
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

export default function SubPostListPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || '오피니언';
  const subCategory = searchParams.get('sub') || '';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPostsByCategoryAndSub(category, subCategory).then(data => {
      setPosts(data || []);
      setLoading(false);
    });
  }, [category, subCategory]);

  return (
    <MainLayout>
      <div className="post-list-wrapper">
        <h2 className="post-list-title">{category} - {subCategory} 게시글</h2>
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
                    <span className="post-subcategory">{subCategory}</span>
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