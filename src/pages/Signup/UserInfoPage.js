import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../../api/user';

function UserInfoPage() {
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    passwordConfirm: '',
  });
  const [error, setError] = useState('');
  const [pwError, setPwError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'passwordConfirm') {
      if (form.password.length === value.length && value !== form.password) {
        setPwError('비밀번호가 일치하지 않습니다.');
      } else {
        setPwError('');
      }
    }
    if (name === 'password') {
      if (form.passwordConfirm.length === value.length && value !== form.passwordConfirm) {
        setPwError('비밀번호가 일치하지 않습니다.');
      } else {
        setPwError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.username || !form.password || !form.passwordConfirm) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setPwError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setError('');
    setPwError('');
    try {
      const data = await signup({
        email: form.email,
        username: form.username,
        password: form.password,
      });
      alert(data.message);
      if (data.status === 201) {
        navigate('/');
      }
    } catch (err) {
      setError('회원가입 요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <h2 style={{ marginBottom: 24 }}>회원정보 입력</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>이메일(ID)</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>이름</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>비밀번호</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
            required
          />
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
            비밀번호는 최소 8자 이상, 영어/숫자/특수문자를 모두 포함해야 합니다.
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>비밀번호 확인</label>
          <input
            type="password"
            name="passwordConfirm"
            value={form.passwordConfirm}
            onChange={handleChange}
            style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
            required
          />
          {pwError && <div style={{ color: 'red', fontSize: 13, marginTop: 4 }}>{pwError}</div>}
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: '12px 0', background: '#2d7a2d', color: '#fff', border: 'none', borderRadius: 4, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }}>
          회원가입 완료
        </button>
      </form>
      <button
        type="button"
        style={{
          display: 'block',
          margin: '16px auto 0',
          fontSize: 12,
          color: '#2d7a2d',
          background: 'none',
          border: '1px solid #2d7a2d',
          borderRadius: 4,
          padding: '4px 12px',
          cursor: 'pointer',
          opacity: 0.7
        }}
        onClick={() => navigate('/admin-signup')}
      >
        어드민 회원가입
      </button>
    </div>
  );
}

export default UserInfoPage; 