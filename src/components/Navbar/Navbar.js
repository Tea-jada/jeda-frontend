import React, { useState, useCallback, useEffect } from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';
import { getCategories, getSubCategories } from '../../api/post';

// JWT 파싱 함수
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
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  // 로그인 상태 및 관리자 여부 확인
  const token = localStorage.getItem('Authorization');
  const isLoggedIn = !!token;
  let isAdmin = false;
  if (token) {
    const payload = parseJwt(token);
    isAdmin = payload && payload.role === 'ADMIN';
  }

  const [openDropdown, setOpenDropdown] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategoriesMap, setSubCategoriesMap] = useState({});

  // 드롭다운 hover 시 하위 카테고리 로드
  const handleDropdownMouseEnter = async (category) => {
    setOpenDropdown(category.categoryId);
    if (!subCategoriesMap[category.categoryId]) {
      const res = await getSubCategories(category.categoryId);
      if (res.status === 200) {
        setSubCategoriesMap((prev) => ({
          ...prev,
          [category.categoryId]: res.data || [],
        }));
      }
    }
  };

  const handleDropdownMouseLeave = () => {
    setOpenDropdown(null);
  };

  // 로그아웃
  const handleLogout = useCallback(() => {
    localStorage.removeItem('Authorization');
    localStorage.removeItem('Refresh-Token');
    navigate('/');
  }, [navigate]);

  // 카테고리 클릭 시 게시글 목록 이동
  const handleCategoryClick = (categoryName) => {
    navigate(`/posts?category=${encodeURIComponent(categoryName)}`);
  };

  // 서브카테고리 클릭 시 이동
  const handleSubCategoryClick = (categoryName, subCategoryName) => {
    navigate(
      `/posts/sub?category=${encodeURIComponent(categoryName)}&sub=${encodeURIComponent(
        subCategoryName
      )}`
    );
    setOpenDropdown(null);
  };

  // 검색
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // 토큰 만료 체크 (자동 로그아웃)
  useEffect(() => {
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
  }, [handleLogout, token]);

  // 카테고리 목록 가져오기
  useEffect(() => {
    (async () => {
      const res = await getCategories();
      if (res.status === 200) {
        setCategories(res.data || []);
      }
    })();
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-header">
        <img
          className="navbar-logo"
          src="https://res.cloudinary.com/dy25l3y1v/image/upload/v1759050643/%EC%9B%94%EA%B0%84%EC%A0%9C%EB%8B%A4_-Photoroom_ma1xpf.png"
          alt="제다 로고"
          onClick={() => navigate('/')}
        />

        {/* PC 전용 검색창 */}
        <form className="search-bar desktop-only" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="검색어를 입력하세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">검색</button>
        </form>

        {/* 모바일 메뉴 토글 */}
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>

      <div className={`user-nav ${menuOpen ? 'open' : ''}`}>
        {/* 모바일 검색창 */}
        <form className="search-bar mobile-only" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="검색어를 입력하세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">검색</button>
        </form>

        {/* 카테고리 메뉴 */}
        <ul className="navbar-menu">
          {categories.map((category) => (
            <li
              key={category.categoryId}
              className="navbar-item"
              onMouseEnter={() => handleDropdownMouseEnter(category)}
              onMouseLeave={handleDropdownMouseLeave}
              onClick={() => handleCategoryClick(category.categoryName)}
            >
              {category.categoryName}
              <ul
                className="dropdown-menu"
                style={{ display: openDropdown === category.categoryId ? 'block' : 'none' }}
              >
                {(subCategoriesMap[category.categoryId] || []).map((sub) => (
                  <li
                    key={sub.subCategoryId}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubCategoryClick(category.categoryName, sub.subCategoryName);
                    }}
                  >
                    {sub.subCategoryName}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        {/* 사용자 액션 영역 */}
        <div className="navbar-actions">
          {isLoggedIn ? (
            <>
              {/* ✅ 대표 기사 등록 버튼 (Admin 전용) */}
              {isAdmin && (
                <button className="nav-btn" onClick={() => navigate('/featured-post')}>
                  대표 기사 등록
                </button>
              )}

              <button onClick={() => navigate('/user-info')}>정보수정</button>

              {/* 어드민 전용 게시글 작성 버튼 */}
              {isAdmin && (
                <button onClick={() => navigate('/post-create')}>
                  게시글 작성
                </button>
              )}

              <button onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')}>로그인</button>
              <button onClick={() => navigate('/signup-agreement')}>
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;