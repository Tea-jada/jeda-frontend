import React from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-logo">제다</div>
      <ul className="navbar-menu">
        <li className="navbar-item">
          오피니언
          <ul className="dropdown-menu">
            <li>사설</li>
            <li>칼럼</li>
            <li>송강스님의 세계의 명차</li>
            <li>세운스님의 차로 마음을 보다</li>
            <li>한남호목사의 차와 인문학</li>
            <li>장미향선생의 제다이야기</li>
            <li>김대호교수가 만난 차인과 제다인</li>
          </ul>
        </li>
        <li className="navbar-item">
          차와 뉴스
          <ul className="dropdown-menu">
            <li>차계</li>
            <li>농업</li>
            <li>산업</li>
            <li>제다</li>
            <li>단체 소식</li>
          </ul>
        </li>
        <li className="navbar-item">
          차와 문화
          <ul className="dropdown-menu">
            <li>교육</li>
            <li>여행</li>
            <li>학술</li>
            <li>출판</li>
          </ul>
        </li>
        <li className="navbar-item">
          차와 사람
          <ul className="dropdown-menu">
            <li>차인</li>
            <li>제다인</li>
            <li>차공예인</li>
            <li>티소믈리에</li>
          </ul>
        </li>
        <li className="navbar-item">
          차의 세계
          <ul className="dropdown-menu">
            <li>세계의 차</li>
            <li>한국의 차</li>
            <li>대용차</li>
            <li>브랜딩차</li>
            <li>티-가든</li>
            <li>티-카페/티-하우스</li>
          </ul>
        </li>
        <li className="navbar-item">
          차와 예술
          <ul className="dropdown-menu">
            <li>전시</li>
            <li>다례</li>
            <li>도예</li>
            <li>공예</li>
            <li>공연</li>
            <li>정원</li>
          </ul>
        </li>
      </ul>
      <div className="navbar-actions">
        <button onClick={() => navigate('/login')}>로그인</button>
        <button onClick={() => navigate('/signup-agreement')}>회원가입</button>
      </div>
    </nav>
  );
}

export default Navbar;