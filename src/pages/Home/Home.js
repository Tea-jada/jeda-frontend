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

  // 페이지 인덱스 상태 (각 카테고리마다)
  const [indexes, setIndexes] = useState({
    opinion: 0,
    news: 0,
    culture: 0,
    people: 0,
    world: 0,
    art: 0,
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const [opinionResult, newsResult, cultureResult, peopleResult, worldResult, artResult] = await Promise.all([
          getPostsByCategory('오피니언', 0, 20), // 넉넉히 가져오기
          getPostsByCategory('차와 뉴스', 0, 20),
          getPostsByCategory('차와 문화', 0, 20),
          getPostsByCategory('차와 사람', 0, 20),
          getPostsByCategory('차의 세계', 0, 20),
          getPostsByCategory('차와 예술', 0, 20)
        ]);

        if (opinionResult.content?.length > 0) {
          setFeaturedPost(opinionResult.content[0]);
          setOpinionPosts(opinionResult.content.slice(1)); // 대표 제외 나머지 저장
        }
        if (newsResult.content) setNewsPosts(newsResult.content);
        if (cultureResult.content) setCulturePosts(cultureResult.content);
        if (peopleResult.content) setPeoplePosts(peopleResult.content);
        if (worldResult.content) setWorldPosts(worldResult.content);
        if (artResult.content) setArtPosts(artResult.content);

      } catch (error) {
        console.error('게시글을 불러오는 중 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const removeHtmlTags = (html) => html?.replace(/<[^>]*>/g, '') || '';
  const handlePostClick = (id) => navigate(`/post/${id}`);

  // 카드
  const PostCard = ({ post }) => (
    <article className="opinion-card" onClick={() => handlePostClick(post.id)}>
      <div className="card-image">
        {post.thumbnailUrl ? (
          <img src={post.thumbnailUrl} alt={post.title} />
        ) : (
          <div className="card-placeholder"><div className="placeholder-icon">🍵</div></div>
        )}
      </div>
      <div className="card-content">
        <h3>{removeHtmlTags(post.title)}</h3>
      </div>
    </article>
  );

  // 카테고리 섹션 (좌우 화살표 추가)
  const PostSection = ({ title, posts, categoryKey }) => {
    const index = indexes[categoryKey]; // 현재 페이지
    const pageSize = 4;
    const pagedPosts = posts.slice(index * pageSize, index * pageSize + pageSize);

    const handlePrev = () => {
      setIndexes((prev) => ({
        ...prev,
        [categoryKey]: Math.max(prev[categoryKey] - 1, 0),
      }));
    };

    const handleNext = () => {
      setIndexes((prev) => ({
        ...prev,
        [categoryKey]: (prev[categoryKey] + 1 < Math.ceil(posts.length / pageSize))
          ? prev[categoryKey] + 1
          : prev[categoryKey],
      }));
    };

    return (
      posts.length > 0 && (
        <section className="post-section">
          <h2 className="section-title">{title}</h2>
          <div className="carousel-container">
            <button className="arrow left" onClick={handlePrev}>⮜</button>
            <div className="opinion-cards">
              {pagedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <button className="arrow right" onClick={handleNext}>⮞</button>
          </div>
        </section>
      )
    );
  };

  if (loading) return <MainLayout><div className="loading">로딩 중...</div></MainLayout>;

  return (
    <MainLayout>
      <div className="main-content">
        {featuredPost && (
          <header className="main-header">
            <div className="featured-post-banner" onClick={() => handlePostClick(featuredPost.id)}>
              <div className="banner-image">
                {featuredPost.thumbnailUrl ? (
                  <img src={featuredPost.thumbnailUrl} alt={featuredPost.title} />
                ) : (
                  <div className="placeholder-image"><div className="placeholder-content"><h2>대표 이미지 없음</h2></div></div>
                )}
              </div>
              <div className="banner-overlay">
                <h1>{removeHtmlTags(featuredPost.title)}</h1>
                <p>{removeHtmlTags(featuredPost.content)?.substring(0, 100)}...</p>
              </div>
            </div>
          </header>
        )}

        {/* 카테고리 */}
        <main>
          <PostSection title="오피니언" posts={opinionPosts} categoryKey="opinion" />
          <PostSection title="차와 뉴스" posts={newsPosts} categoryKey="news" />
          <PostSection title="차와 문화" posts={culturePosts} categoryKey="culture" />
          <PostSection title="차와 사람" posts={peoplePosts} categoryKey="people" />
          <PostSection title="차의 세계" posts={worldPosts} categoryKey="world" />
          <PostSection title="차와 예술" posts={artPosts} categoryKey="art" />
        </main>
      </div>
    </MainLayout>
  );
}

export default Home;
