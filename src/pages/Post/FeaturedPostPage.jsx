import React, { useState, useEffect } from 'react';
import { getAllPosts, setFeaturedPost } from '../../api/post';
import MainLayout from '../../components/MainLayout';
import './FeaturedPostPage.css';

function FeaturedPostPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const fetchPosts = async (pageNumber) => {
    setLoading(true);
    const res = await getAllPosts(pageNumber, 10);
    setPosts(res.content);
    setTotalPages(res.totalPages);
    setLoading(false);
  };

  const handleSetFeatured = async (postId) => {
    const res = await setFeaturedPost(postId);
    if (res.status === 200) setMessage(res.message);
    else setMessage('대표 게시글 지정 실패');
  };

  const removeHtmlTags = (html) => html?.replace(/<[^>]*>/g, '') || '';

  if (loading) return <MainLayout><div>로딩 중...</div></MainLayout>;

  return (
    <MainLayout>
      <div className="featured-post-container">
        <h1>대표 기사 등록</h1>
        {message && <div className="message">{message}</div>}

        <div className="post-list">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="thumbnail">
                {post.thumbnailUrl ? (
                  <img src={post.thumbnailUrl} alt={post.title} />
                ) : (
                  <div className="placeholder">이미지 없음</div>
                )}
              </div>
              <div className="post-info">
                <h3>{removeHtmlTags(post.title)}</h3>
                <p>{removeHtmlTags(post.content)?.substring(0, 150)}...</p>
                <p>카테고리: {post.category} / {post.subCategory}</p>
                <p>업데이트: {new Date(post.updatedAt).toLocaleString()}</p>
                <button onClick={() => handleSetFeatured(post.id)}>
                  대표 게시글 지정
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pagination">
          <button onClick={() => setPage((p) => Math.max(p - 1, 0))} disabled={page === 0}>이전</button>
          <span>{page + 1} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))} disabled={page + 1 >= totalPages}>다음</button>
        </div>
      </div>
    </MainLayout>
  );
}

export default FeaturedPostPage;
