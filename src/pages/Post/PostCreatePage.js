import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { uploadPostImage } from '../../api/post';
import { ResizableImage } from '../../extensions/ResizableImage';
import './PostCreatePage.css';
import { Extension } from '@tiptap/core';

// Enter 시 항상 새 줄을 paragraph로 만드는 커스텀 익스텐션
const EnterAsParagraph = Extension.create({
  name: 'enterAsParagraph',
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (editor.isActive('heading') || editor.isActive('blockquote')) {
          editor.commands.splitBlock();
          editor.commands.setParagraph();
          return true;
        }
        return false;
      },
    };
  },
});

// 카테고리/서브카테고리 데이터
const categoryData = [
  {
    name: '오피니언',
    sub: [
      '사설',
      '칼럼',
      '송강스님의 세계의 명차',
      '세운스님의 차로 마음을 보다.',
      '한남호목사의 차와 인문학',
      '장미향선생의 제다이야기',
      '김대호교수가 만난 차인과 제다인',
    ],
  },
  {
    name: '차와 뉴스',
    sub: [
      '차계',
      '농업',
      '산업',
      '제다',
      '단체 소식',
    ],
  },
  {
    name: '차와 문화',
    sub: [
      '교육',
      '여행',
      '학술',
      '출판',
    ],
  },
  {
    name: '차와 사람',
    sub: [
      '차인',
      '제다인',
      '차공예인',
      '티소믈리에',
    ],
  },
  {
    name: '차의 세계',
    sub: [
      '세계의 차',
      '한국의 차',
      '대용차',
      '브랜딩차',
      '티-가든',
      '티-카페/티-하우스',
    ],
  },
  {
    name: '차와 예술',
    sub: [
      '전시',
      '다례',
      '도예',
      '공예',
      '공연',
      '정원',
    ],
  },
];

// TODO: 이미지 리사이즈 버튼이 우측하단만 나옴, 이미지 위치를 옮길 수 없음, 이미지를 드래그하면 위치가 변경되는 게 아니라 복사가 됨.

const MenuBar = ({ editor, onImageUpload }) => {
  if (!editor) return null;
  return (
    <div style={{ marginBottom: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {/* 문단/제목 드롭다운 */}
      <select
        onChange={e => {
          const value = e.target.value;
          if (value === 'paragraph') editor.chain().focus().setParagraph().run();
          else editor.chain().focus().toggleHeading({ level: Number(value) }).run();
        }}
        value={
          editor.isActive('heading', { level: 1 }) ? '1' :
          editor.isActive('heading', { level: 2 }) ? '2' :
          editor.isActive('heading', { level: 3 }) ? '3' :
          editor.isActive('heading', { level: 4 }) ? '4' :
          'paragraph'
        }
        style={{ marginRight: 8 }}
      >
        <option value="paragraph">문단</option>
        <option value="1">제목1</option>
        <option value="2">제목2</option>
        <option value="3">제목3</option>
        <option value="4">제목4</option>
      </select>
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}>“인용구”</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>• 리스트</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. 리스트</button>
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}>― 수평선</button>
      {/* 정렬 버튼 */}
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()}>좌</button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()}>가운데</button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()}>우</button>
      <button type="button" onClick={onImageUpload}>🖼 이미지 삽입</button>
    </div>
  );
};

function PostCreatePage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categoryData[0].name);
  const [subCategory, setSubCategory] = useState(categoryData[0].sub[0] || '');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(''); // 썸네일 미리보기 URL
  const [thumbnailUrl, setThumbnailUrl] = useState(''); // 서버 업로드된 썸네일 URL

  const editor = useEditor({
    extensions: [
      StarterKit,
      ResizableImage,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Color,
      Link,
      Highlight,
      Table,
      TableRow,
      TableCell,
      TableHeader,
      EnterAsParagraph, // ← 추가
    ],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  // 이미지 업로드 및 본문 삽입
  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setLoading(true);
      try {
        const result = await uploadPostImage(file);
        setLoading(false);
        alert(result.message);
        if (result.status === 200 && result.data && result.data.imgUrl) {
          editor.chain().focus().insertContent({
            type: 'resizableImage',
            attrs: { src: result.data.imgUrl, width: 300, height: 200 }
          }).run();
        } else {
          throw new Error(result.message || '이미지 업로드에 실패했습니다.');
        }
      } catch (err) {
        setLoading(false);
        alert(err.message || '이미지 업로드 중 오류가 발생했습니다.');
      }
    };
    input.click();
  }, [editor]);

  // 썸네일 이미지 업로드 핸들러
  const handleThumbnailChange = async (e) => {
    // 파일 선택 취소 시 아무 동작도 하지 않음
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      try {
        const result = await uploadPostImage(file);
        setLoading(false);
        if (result.status === 200 && result.data && result.data.imgUrl) {
          setThumbnailUrl(result.data.imgUrl);
          setThumbnailPreview(result.data.imgUrl); // 서버 URL로 미리보기 교체
        } else {
          setThumbnailUrl('');
          alert(result.message || '썸네일 업로드에 실패했습니다.');
        }
      } catch (err) {
        setLoading(false);
        setThumbnailUrl('');
        alert(err.message || '썸네일 업로드 중 오류가 발생했습니다.');
      }
    }
  };

  // 카테고리 변경 시 서브카테고리도 초기화
  const handleCategoryChange = (e) => {
    const selected = e.target.value;
    setCategory(selected);
    const found = categoryData.find(c => c.name === selected);
    setSubCategory(found && found.sub.length > 0 ? found.sub[0] : '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: API 연동 시 thumbnailUrl을 함께 전송
    alert('게시글이 등록되었습니다!');
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div style={{ maxWidth: 700, margin: '60px auto', padding: 32, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', position: 'relative' }}>
      {/* 핸들 스타일 추가 */}
      {/* 전체 오버레이 */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
        }}>
          <div style={{
            background: '#fff',
            padding: '32px 48px',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontSize: 20,
            fontWeight: 'bold',
            color: '#2d7a2d',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}>
            <div className="spinner" style={{ width: 40, height: 40, border: '4px solid #eee', borderTop: '4px solid #2d7a2d', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            이미지 업로드 중...
          </div>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      <h2 style={{ textAlign: 'center', marginBottom: 32 }}>게시글 작성</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>카테고리</label>
          <select
            value={category}
            onChange={handleCategoryChange}
            style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4, marginBottom: 8 }}
          >
            {categoryData.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          {/* 서브카테고리 드롭다운: 해당 카테고리에 서브카테고리가 있을 때만 표시 */}
          {categoryData.find(c => c.name === category)?.sub.length > 0 && (
            <>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>서브 카테고리</label>
              <select
                value={subCategory}
                onChange={e => setSubCategory(e.target.value)}
                style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
              >
                {categoryData.find(c => c.name === category).sub.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </>
          )}
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
            placeholder="제목을 입력하세요"
            required
          />
        </div>
        {/* 썸네일 업로드 */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>썸네일 이미지</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            style={{ marginBottom: 8 }}
          />
          {thumbnailPreview && (
            <div style={{ marginTop: 8 }}>
              <img src={thumbnailPreview} alt="썸네일 미리보기" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, border: '1px solid #ccc' }} />
              {thumbnailUrl && (
                <div style={{ color: '#2d7a2d', fontSize: 12, marginTop: 4 }}>썸네일 업로드 완료</div>
              )}
            </div>
          )}
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>본문</label>
          <MenuBar editor={editor} onImageUpload={handleImageUpload} />
          {loading && <div style={{ color: '#2d7a2d', marginBottom: 8 }}>이미지 업로드 중...</div>}
          <div
            style={{ minHeight: 250, marginBottom: 20, border: '1px solid #ccc', borderRadius: 4, padding: 10, cursor: 'text' }}
            onClick={() => editor && editor.commands.focus()}
          >
            <EditorContent editor={editor} className="tiptap-editor" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" onClick={handleCancel} style={{ padding: '10px 24px', background: '#eee', color: '#333', border: 'none', borderRadius: 4, fontWeight: 'bold', cursor: 'pointer' }}>취소</button>
          <button type="submit" style={{ padding: '10px 24px', background: '#2d7a2d', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 'bold', cursor: 'pointer' }}>등록</button>
        </div>
      </form>
    </div>
  );
}

export default PostCreatePage;