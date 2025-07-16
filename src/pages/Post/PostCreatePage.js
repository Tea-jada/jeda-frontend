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

const categories = [
  '자유게시판',
  '공지사항',
  '질문답변',
  '후기',
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
  const [category, setCategory] = useState(categories[0]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: API 연동
    alert('게시글이 등록되었습니다!');
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div style={{ maxWidth: 700, margin: '60px auto', padding: 32, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', position: 'relative' }}>
      {/* 핸들 스타일 추가 */}
      <style>{`
        .tiptap-resizable-image__handle {
          position: absolute;
          width: 12px;
          height: 12px;
          background: #fff;
          border: 2px solid #2d7a2d;
          border-radius: 50%;
          z-index: 10;
        }
        /* 에디터 본문 줄간격/단락간격 조정 */
        .tiptap-editor {
          line-height: 1.5;
        }
        .tiptap-editor p {
          margin: 0;
        }
      `}</style>
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
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
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