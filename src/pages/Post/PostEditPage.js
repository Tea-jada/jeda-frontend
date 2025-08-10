import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById } from '../../api/post';
import { uploadPostImage } from '../../api/post';
import { updatePost } from '../../api/post';
import './PostCreatePage.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { Extension } from '@tiptap/core';
import { ResizableImage } from '../../extensions/ResizableImage';

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

// MenuBar 컴포넌트 (PostCreatePage.js에서 복사)
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
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()}>S</button>
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

// 이미지 업로드 및 본문 삽입 핸들러 (PostCreatePage.js와 동일하게)
function useImageUpload(editor, setLoading) {
  return useCallback(() => {
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
  }, [editor, setLoading]);
}

function PostEditPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
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
      EnterAsParagraph,
    ],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  const handleImageUpload = useImageUpload(editor, setLoading);

  // 기존 게시글 데이터 불러오기
  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      try {
        const data = await getPostById(postId);
        setTitle(data.title);
        let fixedContent = data.content?.replace(
          /<img((?:(?!data-resizable-image)[^>])*)>/g,
          '<img data-resizable-image="true"$1>'
        );
        setContent(fixedContent);
        if (editor) {
          editor.commands.setContent(fixedContent || '');
        }
      } catch (err) {
        alert('게시글 정보를 불러오지 못했습니다.');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
    // eslint-disable-next-line
  }, [postId, editor]);

  // 수정 요청
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await updatePost(postId, { title, content });
      if (result.status === 200) {
        alert('게시글이 성공적으로 수정되었습니다.');
        navigate(`/post/${postId}`);
      } else {
        alert(result.message || '수정에 실패했습니다.');
      }
    } catch (err) {
      alert('수정 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 취소 시 상세페이지로 이동
  const handleCancel = () => {
    navigate(`/post/${postId}`);
  };

  return (
    <div className="post-create-wrapper">
      {loading && (
        <div className="post-create-overlay">
          <div className="post-create-overlay-content">
            <div className="spinner" />
            로딩 중...
          </div>
        </div>
      )}
      <h2 className="post-create-title">게시글 수정</h2>
      <form onSubmit={handleSubmit}>
        <div className="post-create-field">
          <label className="post-create-label">제목</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="post-create-input"
            placeholder="제목을 입력하세요"
            required
          />
        </div>
        <div className="post-create-field">
          <label className="post-create-label">본문</label>
          <MenuBar editor={editor} onImageUpload={handleImageUpload} />
          <div className="post-create-editor-wrapper" onClick={() => editor && editor.commands.focus()}>
            <EditorContent editor={editor} className="tiptap-editor" />
          </div>
        </div>
        <div className="post-create-actions">
          <button type="button" onClick={handleCancel} className="post-create-cancel">취소</button>
          <button type="submit" className="post-create-submit">수정</button>
        </div>
      </form>
    </div>
  );
}

export default PostEditPage; 