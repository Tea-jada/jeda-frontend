import Home from './pages/Home/Home';
import SignupAgreement from './pages/Signup/SignupAgreement';
import UserInfoPage from './pages/Signup/UserInfoPage';
import LoginPage from './pages/Login/LoginPage';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

function App() {
  // useNavigate는 Router 내부에서만 사용 가능하므로, 래퍼 컴포넌트로 분리
  function SignupAgreementWithNav() {
    const navigate = useNavigate();
    return <SignupAgreement onAgree={() => navigate('/signup/user-info')} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup-agreement" element={<SignupAgreementWithNav />} />
        <Route path="/signup/user-info" element={<UserInfoPage />} />
      </Routes>
    </Router>
  );
}

export default App;
