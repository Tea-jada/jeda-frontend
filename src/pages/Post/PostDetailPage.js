import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getPostById } from '../../api/post';
import MainLayout from '../../components/MainLayout';
import './PostDetailPage.css';

// 카테고리별 subSection 매핑
const subSectionOrder = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN'];

const subSectionMapBySection = {
  OPINION: [
    '사설',
    '칼럼',
    '송강스님의 세계의 명차',
    '세운스님의 차로 마음을 보다.',
    '한남호목사의 차와 인문학',
    '장미향선생의 제다이야기',
    '김대호교수가 만난 차인과 제다인',
  ],
  TEA_AND_NEWS: [
    '차계', '농업', '산업', '제다', '단체 소식'
  ],
  TEA_AND_CULTURE: [
    '교육', '여행', '학술', '출판'
  ],
  TEA_AND_PEOPLE: [
    '차인', '제다인', '차공예인', '티소믈리에'
  ],
  TEA_WORLD: [
    '세계의 차', '한국의 차', '대용차', '브랜딩차', '티-가든', '티-카페/티-하우스'
  ],
  TEA_AND_ART: [
    '전시', '다례', '도예', '공예', '공연', '정원'
  ],
};

const SECTION_MAP = {
  OPINION: '오피니언',
  TEA_AND_NEWS: '차와 뉴스',
  TEA_AND_CULTURE: '차와 문화',
  TEA_AND_PEOPLE: '차와 사람',
  TEA_WORLD: '차의 세계',
  TEA_AND_ART: '차와 예술',
  // 필요시 추가
};

function getSubSectionKor(sectionEng, subSectionEng) {
  const arr = subSectionMapBySection[sectionEng];
  if (!arr) return subSectionEng;
  const idx = subSectionOrder.indexOf(subSectionEng);
  if (idx === -1 || idx >= arr.length) return subSectionEng;
  return arr[idx];
}

function getUsernameFromToken() {
  const token = localStorage.getItem('Authorization');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username; // 또는 payload.email, 실제 JWT 구조에 맞게 수정
  } catch {
    return null;
  }
}

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const userEmail = getUsernameFromToken();
  const isOwner = userEmail && post?.email && userEmail === post.email;

  // mock data for sidebar
  const mainArticles = [
    '차로 그려내는 100년 미래',
    '고려청자 14세기 초 왜구들에 의해 일본으로 유입',
    '세계사를 바꾼 와인 이야기',
  ];
  const latestArticles = [
    '건축으로 미학하기',
    '질문의 격',
    '식탁위의 권력 미식 경제학',
  ];
  const popularArticles = [
    '문경다원',
    '한국농촌경제연구원장 하동 방문',
    '중국 운남농업대학 보성군 방문',
    '고려다완이 일본으로 간 까닭은',
    '보이차 란 무엇인가',
  ];

  useEffect(() => {
    setLoading(true);
    getPostById(postId).then(data => {
      setPost(data);
      setLoading(false);
    });
  }, [postId]);

  const sectionKor = post?.section ? SECTION_MAP[post.section] || post.section : '';
  const subSectionKor = post?.subSection ? getSubSectionKor(post.section, post.subSection) : '';

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
                  <button>삭제</button>
                </div>
              )}
              <div className="tea-news-breadcrumb">
                <span>홈</span> &gt; <span>게시글</span>
                {sectionKor && <><span>&gt;</span><span>{sectionKor}</span></>}
                {subSectionKor && <><span>&gt;</span><span>{subSectionKor}</span></>}
                <span className="tea-news-date">| {new Date(post.updatedAt).toLocaleString('ko-KR')}</span>
              </div>
              {post.thumbnailUrl && (
                <div className="tea-news-thumbnail">
                  <img src={post.thumbnailUrl} alt={post.title} />
                </div>
              )}
              <div className="tea-news-content" dangerouslySetInnerHTML={{ __html: post.content }} />
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
    </MainLayout>
  );
}
