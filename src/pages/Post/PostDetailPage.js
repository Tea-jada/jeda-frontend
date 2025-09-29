import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById, deletePost } from '../../api/post';
import MainLayout from '../../components/MainLayout';
import Comment from '../../components/Comment/Comment';
import './PostDetailPage.css';

// JWT 토큰에서 사용자 이메일 추출
function getUsernameFromToken() {
  const token = localStorage.getItem('Authorization');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username || payload.email; // 실제 JWT 구조에 맞게 수정
  } catch {
    return null;
  }
}

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const userEmail = getUsernameFromToken();
  const isOwner = userEmail && post?.email && userEmail === post.email;

  // 사이드바 더미 데이터
  const mainArticles = ['차로 그려내는 100년 미래', '고려청자 14세기 초 왜구들에 의해 일본으로 유입', '세계사를 바꾼 와인 이야기'];
  const latestArticles = ['건축으로 미학하기', '질문의 격', '식탁위의 권력 미식 경제학'];
  const popularArticles = ['문경다원', '한국농촌경제연구원장 하동 방문', '중국 운남농업대학 보성군 방문', '고려다완이 일본으로 간 까닭은', '보이차 란 무엇인가'];

  useEffect(() => {
    setLoading(true);
    getPostById(postId).then(data => {
      setPost(data);
      setLoading(false);
    });
  }, [postId]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deletePost(postId);
      navigate('/');
    } catch (e) {
      alert('삭제에 실패했습니다.');
      setDeleting(false);
    }
  }

  return (
    <MainLayout>
      <div className="tea-news-grid">
        <div className="tea-news-body">
          {loading ? (
            <div className="tea-post-detail-loading">로딩 중...</div>
          ) : !post ? (
            <div className="tea-post-detail-empty">게시글을 찾을 수 없습니다.</div>
          ) : (
            <>
              <h1 className="tea-news-title">{post.title}</h1>
              <div className="tea-news-meta">
                <span className="tea-news-author">{post.username} 기자</span>
                <span className="tea-news-email">{post.email}</span>
              </div>

              {isOwner && (
                <div className="tea-news-actions">
                  <button onClick={() => navigate(`/post/edit/${postId}`)}>수정</button>
                  <button onClick={() => setShowDeleteModal(true)}>삭제</button>
                </div>
              )}

              {/* 카테고리 & 서브카테고리: 한글 그대로 사용 */}
              <div className="tea-news-breadcrumb">
                <span>홈</span> &gt; <span>게시글</span>
                {post.category && <><span>&gt;</span><span>{post.category}</span></>}
                {post.subCategory && <><span>&gt;</span><span>{post.subCategory}</span></>}
                <span className="tea-news-date">| {new Date(post.updatedAt).toLocaleString('ko-KR')}</span>
              </div>

              {post.thumbnailUrl && (
                <div className="tea-news-thumbnail">
                  <img src={post.thumbnailUrl} alt={post.title} />
                </div>
              )}

              <div className="tea-news-content" dangerouslySetInnerHTML={{ __html: post.content }} />

              {/* 댓글 컴포넌트 */}
              <Comment postId={postId} />
            </>
          )}
        </div>

        <aside className="tea-news-sidebar">
          <div className="tea-news-box tea-news-box-main">
            <h3>주요기사</h3>
            <ul>{mainArticles.map((title, i) => <li key={i}>{title}</li>)}</ul>
          </div>
          <div className="tea-news-box tea-news-box-latest">
            <h3>최신기사</h3>
            <ul>{latestArticles.map((title, i) => <li key={i}>{title}</li>)}</ul>
          </div>
          <div className="tea-news-box tea-news-box-popular">
            <h3>많이 본 기사</h3>
            <ul>{popularArticles.map((title, i) => <li key={i}>{title}</li>)}</ul>
          </div>
        </aside>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <p>정말 삭제하시겠습니까?</p>
            <div className="modal-actions">
              <button onClick={handleDelete} disabled={deleting}>삭제</button>
              <button onClick={() => setShowDeleteModal(false)} disabled={deleting}>취소</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
