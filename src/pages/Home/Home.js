import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/MainLayout';
import { getCategories, getPostsByCategory, getLatestPost } from '../../api/post';
import './Home.css';

function Home() {
  const [categories, setCategories] = useState([]); // 카테고리 목록
  const [postsByCategory, setPostsByCategory] = useState({}); // {카테고리명: 게시글목록}
  const [featuredPost, setFeaturedPost] = useState(null); // 대표 게시글
  const [indexes, setIndexes] = useState({}); // 각 카테고리별 인덱스

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. 최신 게시글 1개 가져오기 (대표 게시글)
        const latestPost = await getLatestPost();
        if (latestPost) {
          setFeaturedPost(latestPost);
        }
  
        // 2. 카테고리 목록 가져오기
        const categoryRes = await getCategories();
        if (categoryRes.status !== 200) throw new Error(categoryRes.message || '카테고리 조회 실패');
  
        const categoryList = categoryRes.data;
        setCategories(categoryList);
  
        // 초기 인덱스 설정
        const initIndexes = {};
        categoryList.forEach(cat => {
          initIndexes[cat.categoryName] = 0;
        });
        setIndexes(initIndexes);
  
        // 3. 각 카테고리별 게시글 가져오기
        const postsResult = {};
        for (const cat of categoryList) {
          const res = await getPostsByCategory(cat.categoryName, 0, 20);
          postsResult[cat.categoryName] = res.content || [];
        }
  
        setPostsByCategory(postsResult);
      } catch (error) {
        console.error('게시글을 불러오는 중 오류:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);  

  const removeHtmlTags = (html) => html?.replace(/<[^>]*>/g, '') || '';
  const handlePostClick = (id) => navigate(`/post/${id}`);

  // 카드 컴포넌트
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

  // 카테고리 섹션
  const PostSection = ({ title, posts }) => {
    const index = indexes[title] || 0;
    const pageSize = 4;
    const pagedPosts = posts.slice(index * pageSize, index * pageSize + pageSize);

    const handlePrev = () => {
      setIndexes((prev) => ({
        ...prev,
        [title]: Math.max(prev[title] - 1, 0),
      }));
    };

    const handleNext = () => {
      setIndexes((prev) => ({
        ...prev,
        [title]: (prev[title] + 1 < Math.ceil(posts.length / pageSize))
          ? prev[title] + 1
          : prev[title],
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

        {/* 동적으로 카테고리 렌더링 */}
        <main>
          {categories.map(cat => (
            <PostSection
              key={cat.categoryId}
              title={cat.categoryName}
              posts={postsByCategory[cat.categoryName] || []}
            />
          ))}
        </main>
      </div>
    </MainLayout>
  );
}

export default Home;
