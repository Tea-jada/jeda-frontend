import React from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('Authorization');
  const isLoggedIn = !!token;
  let isAdmin = false;
  if (token) {
    const payload = parseJwt(token);
    console.log('JWT payload:', payload);
    if (payload) {
      console.log('JWT role:', payload.role);
    }
    isAdmin = payload && payload.role === 'ADMIN';
  }

  const handleLogout = React.useCallback(() => {
    localStorage.removeItem('Authorization');
    localStorage.removeItem('Refresh-Token');
    navigate('/');
  }, [navigate]);

  // 카테고리 클릭 시 이동
  const handleCategoryClick = (category) => {
    navigate(`/posts?category=${encodeURIComponent(category)}`);
  };

  // 서브카테고리 클릭 시 이동
  const handleSubCategoryClick = (category, subCategory) => {
    navigate(`/posts/sub?category=${encodeURIComponent(category)}&sub=${encodeURIComponent(subCategory)}`);
  };

  React.useEffect(() => {
    const token = localStorage.getItem('Authorization');
    if (!token) return;
    const payload = parseJwt(token);
    if (!payload || !payload.exp) return;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      handleLogout();
      return;
    }
    const timeout = (payload.exp - now) * 1000;
    const timer = setTimeout(() => {
      handleLogout();
    }, timeout);
    return () => clearTimeout(timer);
  }, [handleLogout]);

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate('/')}>제다</div>
      <ul className="navbar-menu">
        <li className="navbar-item" onClick={() => handleCategoryClick('오피니언')}>
          오피니언
          <ul className="dropdown-menu">
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('오피니언', '사설'); }}>사설</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('오피니언', '칼럼'); }}>칼럼</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('오피니언', '송강스님의 세계의 명차'); }}>송강스님의 세계의 명차</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('오피니언', '세운스님의 차로 마음을 보다'); }}>세운스님의 차로 마음을 보다</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('오피니언', '한남호목사의 차와 인문학'); }}>한남호목사의 차와 인문학</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('오피니언', '장미향선생의 제다이야기'); }}>장미향선생의 제다이야기</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('오피니언', '김대호교수가 만난 차인과 제다인'); }}>김대호교수가 만난 차인과 제다인</li>
          </ul>
        </li>
        <li className="navbar-item" onClick={() => handleCategoryClick('차와 뉴스')}>
          차와 뉴스
          <ul className="dropdown-menu">
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차와 뉴스', '차계'); }}>차계</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차와 뉴스', '농업'); }}>농업</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차와 뉴스', '산업'); }}>산업</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차와 뉴스', '제다'); }}>제다</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차와 뉴스', '단체 소식'); }}>단체 소식</li>
          </ul>
        </li>
        <li className="navbar-item" onClick={() => handleCategoryClick('차와 문화')}>
          차와 문화
          <ul className="dropdown-menu">
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차와 문화', '교육'); }}>교육</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차와 문화', '여행'); }}>여행</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차와 문화', '학술'); }}>학술</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차와 문화', '출판'); }}>출판</li>
          </ul>
        </li>
        <li className="navbar-item" onClick={() => handleCategoryClick('차와 사람')}>
          차와 사람
          <ul className="dropdown-menu">
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차와 사람', '차인'); }}>차인</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차와 사람', '제다인'); }}>제다인</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차와 사람', '차공예인'); }}>차공예인</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차와 사람', '티소믈리에'); }}>티소믈리에</li>
          </ul>
        </li>
        <li className="navbar-item" onClick={() => handleCategoryClick('차의 세계')}>
          차의 세계
          <ul className="dropdown-menu">
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차의 세계', '세계의 차'); }}>세계의 차</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차의 세계', '한국의 차'); }}>한국의 차</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차의 세계', '대용차'); }}>대용차</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차의 세계', '브랜딩차'); }}>브랜딩차</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차의 세계', '티-가든'); }}>티-가든</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차의 세계', '티-카페/티-하우스'); }}>티-카페/티-하우스</li>
          </ul>
        </li>
        <li className="navbar-item" onClick={() => handleCategoryClick('차와 예술')}>
          차와 예술
          <ul className="dropdown-menu">
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차와 예술', '전시'); }}>전시</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차와 예술', '다례'); }}>다례</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차와 예술', '도예'); }}>도예</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차와 예술', '공예'); }}>공예</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차와 예술', '공연'); }}>공연</li>
            <li onClick={e => { e.stopPropagation(); handleSubCategoryClick('차와 예술', '정원'); }}>정원</li>
          </ul>
        </li>
      </ul>
      <div className="navbar-actions">
        {isLoggedIn ? (
          <>
            <button onClick={() => navigate('/user-info')}>정보수정</button>
            {isAdmin && (
              <button onClick={() => navigate('/post-create')}>게시글 작성</button>
            )}
            <button onClick={handleLogout}>로그아웃</button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')}>로그인</button>
            <button onClick={() => navigate('/signup-agreement')}>회원가입</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;