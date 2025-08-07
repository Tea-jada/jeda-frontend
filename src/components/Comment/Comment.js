import React, { useState, useEffect, useCallback } from 'react';
import { createComment, getComments, deleteComment, updateComment } from '../../api/post';
import './Comment.css';

function getUsernameFromToken() {
  const token = localStorage.getItem('Authorization');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username;
  } catch {
    return null;
  }
}

export default function Comment({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showMenu, setShowMenu] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const userEmail = getUsernameFromToken();
  const isLoggedIn = !!userEmail;

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const commentsData = await getComments(postId);
      // API 응답이 배열인지 확인하고 안전하게 설정
      if (Array.isArray(commentsData)) {
        setComments(commentsData);
      } else {
        console.warn('댓글 데이터가 배열이 아닙니다:', commentsData);
        setComments([]);
      }
    } catch (error) {
      console.error('댓글을 불러오는데 실패했습니다:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId, loadComments]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      const result = await createComment(postId, newComment);
      if (result.status === 200 || result.status === 201) {
        setNewComment('');
        await loadComments(); // 댓글 목록 새로고침
      } else {
        alert('댓글 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('댓글 등록 실패:', error);
      alert('댓글 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    setShowDeleteModal(commentId);
    setShowMenu(null);
  };

  const confirmDelete = async () => {
    const commentId = showDeleteModal;
    if (!commentId) return;
    
    setDeleting(commentId);
    try {
      const response = await deleteComment(commentId);
      if (response.status === 200) {
        await loadComments(); // 댓글 목록 새로고침
      } else {
        alert('댓글 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    } finally {
      setDeleting(null);
      setShowDeleteModal(null);
    }
  };

  const isCommentOwner = (comment) => {
    return userEmail && comment.email;
  };

  const handleEdit = (comment) => {
    setEditing(comment.id);
    setEditContent(comment.comment);
    setShowMenu(null);
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setEditContent('');
    setShowMenu(null);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) return;
    
    setUpdating(commentId);
    try {
      const result = await updateComment(commentId, editContent);
      if (result.status === 200 || result.status === 201) {
        setEditing(null);
        setEditContent('');
        await loadComments(); // 댓글 목록 새로고침
      } else {
        alert('댓글 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      alert('댓글 수정에 실패했습니다.');
    } finally {
      setUpdating(null);
    }
  };

  const toggleMenu = (commentId) => {
    setShowMenu(showMenu === commentId ? null : commentId);
  };

  if (!isLoggedIn) {
    return (
      <div className="comment-section">
        <h3>댓글</h3>
        <div className="comment-login-required">
          댓글을 작성하려면 로그인이 필요합니다.
        </div>
      </div>
    );
  }

  return (
    <div className="comment-section">
      <h3>댓글</h3>
      
      {/* 댓글 작성 영역 */}
      <div className="comment-writer">
        <div className="comment-input-container">
          <textarea
            className="comment-input"
            placeholder="댓글을 입력하세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button
            className="comment-submit-btn"
            onClick={handleSubmit}
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? '등록 중...' : '등록'}
          </button>
        </div>
      </div>

      {/* 댓글 목록 */}
      <div className="comment-list">
        {loading ? (
          <div className="comment-loading">댓글을 불러오는 중...</div>
        ) : !Array.isArray(comments) || comments.length === 0 ? (
          <div className="comment-empty">첫 번째 댓글을 작성해보세요!</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              {/* 메뉴 버튼 */}
              {isCommentOwner(comment) && (
                <button
                  className="comment-menu-btn"
                  onClick={() => toggleMenu(comment.id)}
                >
                  ⋯
                </button>
              )}
              
              {/* 메뉴 드롭다운 */}
              {showMenu === comment.id && isCommentOwner(comment) && (
                <div className="comment-menu-dropdown">
                  <button onClick={() => handleEdit(comment)}>수정</button>
                  <button onClick={() => handleDelete(comment.id)}>삭제</button>
                </div>
              )}
              
              <div className="comment-author">{comment.username}</div>
              
              {editing === comment.id ? (
                <div className="comment-edit-container">
                  <textarea
                    className="comment-edit-input"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div className="comment-edit-actions">
                    <button
                      className="comment-cancel-btn"
                      onClick={handleCancelEdit}
                    >
                      취소
                    </button>
                    <button
                      className="comment-update-btn"
                      onClick={() => handleUpdateComment(comment.id)}
                      disabled={updating === comment.id || !editContent.trim()}
                    >
                      {updating === comment.id ? '수정 중...' : '등록'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="comment-content">{comment.comment}</div>
              )}
              
              <div className="comment-date">
                {new Date(comment.updatedAt).toLocaleString('ko-KR')}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <p>댓글을 삭제하시겠습니까?</p>
            <div className="modal-actions">
              <button onClick={confirmDelete} disabled={deleting}>
                {deleting ? '삭제 중...' : '삭제'}
              </button>
              <button onClick={() => setShowDeleteModal(null)} disabled={deleting}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 