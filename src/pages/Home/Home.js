import React from 'react';
import MainLayout from '../../components/MainLayout';
import './Home.css';

function Home() {
  return (
    <MainLayout>
      <header className="main-header">
        <h1>티라운지에서 느끼는 모던티의 향연</h1>
        <p>올 여름 모던티의 향미에 빠져볼 수 있는 티라운지가 선보여 화제가 되고 있다...</p>
      </header>
      <main className="main-content">
        <section className="articles">
          <h2>주요 기사</h2>
          <ul>
            <li>유태근의 함函, 김제원의 사진전</li>
            <li>중남미 차茶 비즈니스 리더들, 하동 티투어</li>
            <li>칠불사 선차학술발표회 개최</li>
            <li>하동전통발효차 '잭살' 상품화</li>
          </ul>
        </section>
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