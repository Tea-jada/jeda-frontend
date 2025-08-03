import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/MainLayout';
import { getPostsByCategory } from '../../api/post';
import './Home.css';

function Home() {
  const [featuredPost, setFeaturedPost] = useState(null);
  const [opinionPosts, setOpinionPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // 오피니언 게시글 가져오기
        const result = await getPostsByCategory('오피니언', 0, 5);
        console.log('API 응답:', result); // 디버깅용
        
        if (result.content && result.content.length > 0) {
          setFeaturedPost(result.content[0]); // 첫 번째 게시글을 주요 게시글로
          setOpinionPosts(result.content.slice(1, 5)); // 나머지 4개를 작은 카드로
        }
      } catch (error) {
        console.error('게시글을 불러오는 중 오류가 발생했습니다:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const getThreeLineContent = (content) => {
    if (!content) return '';
    const lines = content.split('\n').filter(line => line.trim());
    return lines.slice(0, 3).join('\n');
  };

  const removeHtmlTags = (htmlString) => {
    if (!htmlString) return '';
    return htmlString.replace(/<[^>]*>/g, '');
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="loading">로딩 중...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* 주요 게시글 배너 */}
      {featuredPost && (
        <div className="main-content">
          <header className="main-header">
            <div className="featured-post-banner" onClick={() => handlePostClick(featuredPost.id)}>
              <div className="banner-image">
                {featuredPost.thumbnailUrl ? (
                  <img src={featuredPost.thumbnailUrl} alt={featuredPost.title} />
                ) : (
                  <div className="placeholder-image">
                    <div className="placeholder-content">
                      <h2>티라운지에서 느끼는 모던티의 향연</h2>
                    </div>
                  </div>
                )}
              </div>
              <div className="banner-overlay">
                <h1>{removeHtmlTags(featuredPost.title)}</h1>
                <p>{removeHtmlTags(featuredPost.content)?.substring(0, 100)}...</p>
              </div>
            </div>
          </header>
        </div>
      )}

      {/* 4개의 작은 카드 섹션 */}
      <main className="main-content">
        <section className="opinion-cards">
          {opinionPosts.map((post, index) => (
            <article key={post.id} className="opinion-card" onClick={() => handlePostClick(post.id)}>
              <div className="card-image">
                {post.thumbnailUrl ? (
                  <img src={post.thumbnailUrl} alt={post.title} />
                ) : (
                  <div className="card-placeholder">
                    <div className="placeholder-icon">🍵</div>
                  </div>
                )}
              </div>
              <div className="card-content">
                <h3>{removeHtmlTags(post.title)}</h3>
                <p>{getThreeLineContent(removeHtmlTags(post.content))}</p>
              </div>
            </article>
          ))}
        </section>

        {/* 기존 사이드바 */}
        <aside className="sidebar">
          <h3>많이 본 기사</h3>
          <ol>
            <li>유태근의 함函, 김제원의 사진전</li>
            <li>티라운지에서 느끼는 모던티의 향연</li>
          </ol>
        </aside>
      </main>
    </MainLayout>
  );
}

export default Home;