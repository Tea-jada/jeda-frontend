import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ResizableImageComponent from './ResizableImageComponent';
import { Plugin } from 'prosemirror-state';

export const ResizableImage = Node.create({
  name: 'resizableImage',
  group: 'block',
  draggable: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: 300 },
      height: { default: 200 },
      alt: { default: null },
      caption: { default: '' }, // 캡션 속성 추가
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) return {};
          const img = node.querySelector('img[data-resizable-image]');
          const figcaption = node.querySelector('figcaption');
          return {
            src: img?.getAttribute('src') || null,
            width: img?.getAttribute('width') ? parseInt(img.getAttribute('width')) : 300,
            height: img?.getAttribute('height') ? parseInt(img.getAttribute('height')) : 200,
            alt: img?.getAttribute('alt') || null,
            caption: figcaption ? figcaption.textContent.replace(/^▲\s*/, '') : '',
          };
        },
      },
      { tag: 'img[data-resizable-image]' },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const children = [];
    children.push([
      'img',
      mergeAttributes(HTMLAttributes, { 'data-resizable-image': 'true' }),
    ]);
    if (node.attrs.caption && node.attrs.caption.trim() !== '') {
      children.push([
        'figcaption',
        { style: 'font-size:13px;color:#888;margin-top:4px;' },
        `▲ ${node.attrs.caption}`
      ]);
    }
    return [
      'figure',
      {},
      ...children
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDrop(view, event, slice, moved) {
            // moved: true면 ProseMirror가 이동으로 처리함
            // moved: false면 복사로 처리됨(이때 원본 삭제)
            if (!moved && slice.content.childCount === 1) {
              const node = slice.content.child(0);
              if (node.type.name === 'resizableImage' && window._draggedImagePos != null) {
                const { state, dispatch } = view;
                dispatch(state.tr.delete(window._draggedImagePos, window._draggedImagePos + 1));
                window._draggedImagePos = null;
              }
            }
            return false; // 기본 동작도 실행
          },
        },
      }),
    ];
  },
}); 