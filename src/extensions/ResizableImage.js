import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ResizableImageComponent from './ResizableImageComponent';

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
}); 