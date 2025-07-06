import Home from './pages/Home/Home';
import SignupAgreement from './pages/Signup/AgreementPage';
import UserInfoPage from './pages/Signup/UserInfoPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup-agreement" element={<SignupAgreement />} />
        <Route path="/signup/user-info" element={<UserInfoPage />} />
      </Routes>
    </Router>
  );
}

export default App;
