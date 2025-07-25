import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/user';

function LoginPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('아이디(이메일)와 비밀번호를 입력해주세요.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const data = await login({
        username: form.email,
        password: form.password,
      });
      alert(data.message);
      if (data.status === 200 && data.authorization) {
        localStorage.setItem('Authorization', data.authorization);
        localStorage.setItem('Refresh-Token', data.refreshToken);
        if (data.role) {
          localStorage.setItem('role', data.role);
        } else {
          localStorage.removeItem('role');
        }
        navigate('/');
      }
    } catch (err) {
      setError('로그인 요청 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 32, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          color: 'white',
          fontSize: '24px'
        }}>
          로그인 중입니다...
        </div>
      )}
      <h2 style={{ textAlign: 'center', marginBottom: 32 }}>로그인</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>아이디(이메일)</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
            placeholder="이메일 입력"
            required
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>비밀번호</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
            placeholder="비밀번호 입력"
            required
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: '12px 0', background: '#2d7a2d', color: '#fff', border: 'none', borderRadius: 4, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', marginBottom: 12 }}>
          로그인
        </button>
      </form>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
        <span style={{ color: '#2d7a2d', cursor: 'pointer' }} onClick={() => navigate('/signup-agreement')}>회원가입</span>
        <span style={{ color: '#888', cursor: 'pointer' }} onClick={() => alert('아이디/비밀번호 찾기 준비중')}>아이디/비밀번호 찾기</span>
      </div>
    </div>
  );
}

export default LoginPage;