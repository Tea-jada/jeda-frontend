import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { uploadPostImage, postPost, getCategories, getSubCategories } from '../../api/post';
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

const MenuBar = ({ editor, onImageUpload }) => {
  if (!editor) return null;
  return (
    <div style={{ marginBottom: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
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
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()}>좌</button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()}>가운데</button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()}>우</button>
      <button type="button" onClick={onImageUpload}>🖼 이미지 삽입</button>
    </div>
  );
};

function PostCreatePage() {
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState([]); 
  const [category, setCategory] = useState(''); 
  const [subCategories, setSubCategories] = useState([]);
  const [subCategory, setSubCategory] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

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
      EnterAsParagraph,
    ],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  // 카테고리 불러오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        if (res.status === 200) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setCategory(res.data[0].categoryId); // 기본 선택: 첫 번째 카테고리
          }
        } else {
          alert(res.message || '카테고리 조회 실패');
        }
      } catch (err) {
        alert('카테고리 조회 중 오류가 발생했습니다.');
      }
    };
    fetchCategories();
  }, []);

  // 서브카테고리 불러오기
  useEffect(() => {
    if (!category) return;
    const fetchSubCategories = async () => {
      try {
        const res = await getSubCategories(category);
        if (res.status === 200) {
          setSubCategories(res.data);
          if (res.data.length > 0) {
            setSubCategory(res.data[0].subCategoryId); // 기본 선택: 첫 번째 서브카테고리
          } else {
            setSubCategory('');
          }
        } else {
          alert(res.message || '서브카테고리 조회 실패');
        }
      } catch (err) {
        alert('서브카테고리 조회 중 오류가 발생했습니다.');
      }
    };
    fetchSubCategories();
  }, [category]);

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

  // 썸네일 업로드
  const handleThumbnailChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      try {
        const result = await uploadPostImage(file);
        setLoading(false);
        if (result.status === 200 && result.data && result.data.imgUrl) {
          setThumbnailUrl(result.data.imgUrl);
          setThumbnailPreview(result.data.imgUrl);
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

  // 게시글 등록
  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegistering(true);
    const token = localStorage.getItem('Authorization');

    // ✅ 선택된 ID를 name으로 변환
    const selectedCategory = categories.find(cat => cat.categoryId === Number(category));
    const categoryName = selectedCategory ? selectedCategory.categoryName : '';

    const selectedSubCategory = subCategories.find(sub => sub.subCategoryId === Number(subCategory));
    const subCategoryName = selectedSubCategory ? selectedSubCategory.subCategoryName : '';

    try {
      const result = await postPost({
        title,
        content,
        category: categoryName,       // 이름으로 전달
        subCategory: subCategoryName, // 이름으로 전달
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
    } finally {
      setRegistering(false);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="post-create-wrapper">
      {loading && (
        <div className="post-create-overlay">
          <div className="post-create-overlay-content">
            <div className="spinner" />
            이미지 업로드 중...
          </div>
        </div>
      )}
      {registering && (
        <div className="post-create-overlay">
          <div className="post-create-overlay-content">
            <div className="spinner" />
            게시글 등록 중...
          </div>
        </div>
      )}
      <h2 className="post-create-title">게시글 작성</h2>
      <form onSubmit={handleSubmit}>
        <div className="post-create-field">
          <label className="post-create-label">카테고리</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="post-create-select"
          >
            {categories.map(cat => (
              <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
            ))}
          </select>
          {subCategories.length > 0 && (
            <>
              <label className="post-create-label">서브 카테고리</label>
              <select
                value={subCategory}
                onChange={e => setSubCategory(e.target.value)}
                className="post-create-select"
              >
                {subCategories.map(sub => (
                  <option key={sub.subCategoryId} value={sub.subCategoryId}>{sub.subCategoryName}</option>
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
