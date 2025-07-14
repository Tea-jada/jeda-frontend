import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminSignup } from '../../api/user';

function AdminSignupPage() {
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    adminCode: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // 비밀번호 또는 비밀번호 확인 입력 시 실시간 비교
      if (
        (name === 'password' || name === 'confirmPassword') &&
        updated.confirmPassword &&
        updated.password !== updated.confirmPassword
      ) {
        setPasswordError('비밀번호가 일치하지 않습니다.');
      } else {
        setPasswordError('');
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.username || !form.password || !form.confirmPassword || !form.adminCode) {
      setError('모든 항목을 입력해주세요.');
      setSuccess('');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
      setError('');
      return;
    }
    setError('');
    setPasswordError('');
    setSuccess('');
    try {
      const { status, message } = await adminSignup({
        email: form.email,
        username: form.username,
        password: form.password,
        adminCode: form.adminCode,
      });
      alert(message);
      if (status === 201) {
        setForm({ email: '', username: '', password: '', confirmPassword: '', adminCode: '' });
        setSuccess('어드민 회원가입이 완료되었습니다!');
        navigate('/');
      }
    } catch (err) {
      setError('회원가입 요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 32, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 32 }}>어드민 회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>이메일</label>
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
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>이름</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
            placeholder="이름 입력"
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
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>비밀번호 확인</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
            placeholder="비밀번호 확인"
            required
          />
          {passwordError && <div style={{ color: 'red', marginTop: 6 }}>{passwordError}</div>}
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>어드민 코드</label>
          <input
            type="text"
            name="adminCode"
            value={form.adminCode}
            onChange={handleChange}
            style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
            placeholder="어드민 코드 입력"
            required
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: 12 }}>{success}</div>}
        <button type="submit" style={{ width: '100%', padding: '12px 0', background: '#2d7a2d', color: '#fff', border: 'none', borderRadius: 4, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', marginBottom: 12 }}>
          어드민 회원가입
        </button>
      </form>
    </div>
  );
}

export default AdminSignupPage; 