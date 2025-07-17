import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { uploadPostImage, postPost } from '../../api/post';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // section, subSection 매핑
    const section = category;
    const subSectionIdx = categoryData.find(c => c.name === category)?.sub.findIndex(s => s === subCategory) ?? 0;
    const token = localStorage.getItem('Authorization');
    try {
      const result = await postPost({
        title,
        content,
        section,
        subSection: subSectionIdx,
        thumbnailUrl,
        token,
      });
      if (result.status === 200 || result.status === 201) {
        alert('게시글이 등록되었습니다!');
        window.location.href = '/';
      } else {
        alert(result.message || '게시글 등록에 실패했습니다.');
      }
    } catch (err) {
      alert(err.message || '게시글 등록 중 오류가 발생했습니다.');
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="post-create-wrapper">
      {/* 핸들 스타일 추가 */}
      {/* 전체 오버레이 */}
      {loading && (
        <div className="post-create-overlay">
          <div className="post-create-overlay-content">
            <div className="spinner" />
            이미지 업로드 중...
          </div>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      <h2 className="post-create-title">게시글 작성</h2>
      <form onSubmit={handleSubmit}>
        <div className="post-create-field">
          <label className="post-create-label">카테고리</label>
          <select
            value={category}
            onChange={handleCategoryChange}
            className="post-create-select"
          >
            {categoryData.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          {/* 서브카테고리 드롭다운: 해당 카테고리에 서브카테고리가 있을 때만 표시 */}
          {categoryData.find(c => c.name === category)?.sub.length > 0 && (
            <>
              <label className="post-create-label">서브 카테고리</label>
              <select
                value={subCategory}
                onChange={e => setSubCategory(e.target.value)}
                className="post-create-select"
              >
                {categoryData.find(c => c.name === category).sub.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </>
          )}
        </div>
        <div className="post-create-field">
          <label className="post-create-label">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="post-create-input"
            placeholder="제목을 입력하세요"
            required
          />
        </div>
        {/* 썸네일 업로드 */}
        <div className="post-create-field">
          <label className="post-create-label">썸네일 이미지</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="post-create-file"
          />
          {thumbnailPreview && (
            <div className="post-create-thumbnail-preview-wrapper">
              <img src={thumbnailPreview} alt="썸네일 미리보기" className="post-create-thumbnail-preview" />
              {thumbnailUrl && (
                <div className="post-create-thumbnail-success">썸네일 업로드 완료</div>
              )}
            </div>
          )}
        </div>
        <div className="post-create-field">
          <label className="post-create-label">본문</label>
          <MenuBar editor={editor} onImageUpload={handleImageUpload} />
          {loading && <div className="post-create-loading">이미지 업로드 중...</div>}
          <div
            className="post-create-editor-wrapper"
            onClick={() => editor && editor.commands.focus()}
          >
            <EditorContent editor={editor} className="tiptap-editor" />
          </div>
        </div>
        <div className="post-create-actions">
          <button type="button" onClick={handleCancel} className="post-create-cancel">취소</button>
          <button type="submit" className="post-create-submit">등록</button>
        </div>
      </form>
    </div>
  );
}

export default PostCreatePage;