import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/MainLayout';
import { getPostsByCategory } from '../../api/post';
import './Home.css';

function Home() {
  const [featuredPost, setFeaturedPost] = useState(null);
  const [opinionPosts, setOpinionPosts] = useState([]);
  const [newsPosts, setNewsPosts] = useState([]);
  const [culturePosts, setCulturePosts] = useState([]);
  const [peoplePosts, setPeoplePosts] = useState([]);
  const [worldPosts, setWorldPosts] = useState([]);
  const [artPosts, setArtPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // 각 카테고리별로 게시글 가져오기
        const [opinionResult, newsResult, cultureResult, peopleResult, worldResult, artResult] = await Promise.all([
          getPostsByCategory('오피니언', 0, 5),
          getPostsByCategory('차와 뉴스', 0, 4),
          getPostsByCategory('차와 문화', 0, 4),
          getPostsByCategory('차와 사람', 0, 4),
          getPostsByCategory('차의 세계', 0, 4),
          getPostsByCategory('차와 예술', 0, 4)
        ]);

        console.log('API 응답들:', { opinionResult, newsResult, cultureResult, peopleResult, worldResult, artResult });
        
        // 오피니언 - 첫 번째는 featured, 나머지는 opinionPosts
        if (opinionResult.content && opinionResult.content.length > 0) {
          setFeaturedPost(opinionResult.content[0]);
          setOpinionPosts(opinionResult.content.slice(1, 5));
        }

        // 다른 카테고리들
        if (newsResult.content) setNewsPosts(newsResult.content.slice(0, 4));
        if (cultureResult.content) setCulturePosts(cultureResult.content.slice(0, 4));
        if (peopleResult.content) setPeoplePosts(peopleResult.content.slice(0, 4));
        if (worldResult.content) setWorldPosts(worldResult.content.slice(0, 4));
        if (artResult.content) setArtPosts(artResult.content.slice(0, 4));

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

  const PostCard = ({ post }) => (
    <article className="opinion-card" onClick={() => handlePostClick(post.id)}>
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
  );

  const PostSection = ({ title, posts }) => (
    posts.length > 0 && (
      <section className="post-section">
        <h2 className="section-title">{title}</h2>
        <div className="opinion-cards">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    )
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="loading">로딩 중...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="main-content">
        {/* 주요 게시글 배너 */}
        {featuredPost && (
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
        )}
  
        {/* 카테고리별 게시글 섹션들 */}
        <main>
          <PostSection title="오피니언" posts={opinionPosts} />
          <PostSection title="차와 뉴스" posts={newsPosts} />
          <PostSection title="차와 문화" posts={culturePosts} />
          <PostSection title="차와 사람" posts={peoplePosts} />
          <PostSection title="차의 세계" posts={worldPosts} />
          <PostSection title="차와 예술" posts={artPosts} />
        </main>
      </div>
    </MainLayout>
  );
}

export default Home;