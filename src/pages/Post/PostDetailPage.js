import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPostById } from '../../api/post';
import MainLayout from '../../components/MainLayout';
import './PostDetailPage.css';

export default function PostDetailPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPostById(postId).then(data => {
      setPost(data);
      setLoading(false);
    });
  }, [postId]);

  return (
    <MainLayout>
      <div className="post-detail-wrapper">
        {loading ? (
          <div className="post-detail-loading">로딩 중...</div>
        ) : !post ? (
          <div className="post-detail-empty">게시글을 찾을 수 없습니다.</div>
        ) : (
          <div className="post-detail">
            <div className="post-detail-header">
              <div className="post-detail-breadcrumb">
                <a href="/">홈</a> &gt; <a href="/posts">게시글</a>
              </div>
              <h2 className="post-detail-title">{post.title}</h2>
              <div className="post-detail-meta">
                <span className="post-detail-author">김우진</span>
                <span className="post-detail-date">{new Date(post.updatedAt).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
            <div className="post-detail-content" dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        )}
      </div>
    </MainLayout>
  );
}