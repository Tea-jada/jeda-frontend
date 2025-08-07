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
    };
  },

  parseHTML() {
    return [{ tag: 'img[data-resizable-image]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'img',
      mergeAttributes(HTMLAttributes, { 'data-resizable-image': 'true' }),
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