import React from 'react';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';

function MainLayout({ children }) {
  return (
    <div className="main-wrapper">
      <Navbar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      <Footer />
    </div>
  );
}

export default MainLayout; 