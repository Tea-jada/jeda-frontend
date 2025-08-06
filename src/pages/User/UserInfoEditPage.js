import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/MainLayout';
import { getUserInfo, updateUserInfo, deleteUser } from '../../api/user';
import './UserInfoEditPage.css';

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

function UserInfoEditPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('Authorization');
    if (!token) {
      navigate('/login');
      return;
    }

    const payload = parseJwt(token);
    if (!payload || !payload.userId) {
      navigate('/login');
      return;
    }

    fetchUserInfo(payload.userId);
  }, [navigate]);

  const fetchUserInfo = async (userId) => {
    try {
      setLoading(true);
      const result = await getUserInfo(userId);
      
      if (result.status === 200 && result.data) {
        setUserInfo(result.data);
        setFormData({
          email: result.data.email,
          username: result.data.username,
          password: ''
        });
      } else {
        setError('사용자 정보를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
      setError('사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      email: userInfo.email,
      username: userInfo.username,
      password: ''
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userInfo) return;

    try {
      setError('');
      setSuccess('');

      // 변경된 필드만 수집
      const updateData = {};
      if (formData.email !== userInfo.email) {
        updateData.email = formData.email;
      }
      if (formData.username !== userInfo.username) {
        updateData.username = formData.username;
      }
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      // 변경사항이 없으면 에러
      if (Object.keys(updateData).length === 0) {
        setError('변경사항이 없습니다.');
        return;
      }

      const result = await updateUserInfo(userInfo.id, updateData);
      
      if (result.status === 200) {
        setSuccess('정보가 성공적으로 수정되었습니다.');
        setIsEditing(false);

        // localStorage 속 토큰 지우기
        localStorage.removeItem('Authorization');
        localStorage.removeItem('Refresh-Token');

        // 다시 로그인
        navigate('/login');
        return;
      } else {
        setError(result.message || '정보 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('정보 수정 오류:', error);
      setError('정보 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteUser = async () => {
    setDeleteError('');
    try {
      const data = await deleteUser(userInfo.id);
      if (data.status === 200) {
        alert('회원탈퇴가 완료되었습니다.');
        localStorage.clear();
        navigate('/');
      } else {
        setDeleteError(data.message || '회원탈퇴에 실패했습니다.');
      }
    } catch (err) {
      setDeleteError('회원탈퇴 요청 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="user-info-loading">로딩 중...</div>
      </MainLayout>
    );
  }

  if (!userInfo) {
    return (
      <MainLayout>
        <div className="user-info-error">사용자 정보를 불러올 수 없습니다.</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="user-info-container">
        <h1 className="user-info-title">정보 수정</h1>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit} className="user-info-form">
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="username">사용자명</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              disabled={!isEditing}
              required
            />
          </div>
          
          {isEditing && (
            <div className="form-group">
              <label htmlFor="password">새 비밀번호 (변경하지 않으려면 비워두세요)</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="변경하지 않으려면 비워두세요"
              />
            </div>
          )}
          
          <div className="form-actions">
            {!isEditing ? (
              <button type="button" onClick={handleEdit} className="edit-btn">
                수정
              </button>
            ) : (
              <>
                <button type="submit" className="save-btn">
                  저장
                </button>
                <button type="button" onClick={handleCancel} className="cancel-btn">
                  취소
                </button>
              </>
            )}
          </div>
        </form>
        {/* 회원탈퇴 버튼 */}
        <button
          type="button"
          style={{
            width: '100%',
            padding: '12px 0',
            background: '#ff3b30',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            fontSize: 16,
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: 32,
          }}
          onClick={() => setShowDeleteModal(true)}
        >
          회원탈퇴
        </button>
        {/* 탈퇴 확인 모달 */}
        {showDeleteModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}>
            <div style={{ background: '#fff', padding: 32, borderRadius: 8, minWidth: 300, textAlign: 'center' }}>
              <div style={{ fontSize: 18, marginBottom: 24 }}>정말로 회원을 탈퇴하시겠습니까?</div>
              {deleteError && <div style={{ color: 'red', marginBottom: 12 }}>{deleteError}</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <button
                  style={{ flex: 1, padding: '10px 0', background: '#ff3b30', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={handleDeleteUser}
                >
                  탈퇴
                </button>
                <button
                  style={{ flex: 1, padding: '10px 0', background: '#ccc', color: '#333', border: 'none', borderRadius: 4, fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => setShowDeleteModal(false)}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default UserInfoEditPage; 