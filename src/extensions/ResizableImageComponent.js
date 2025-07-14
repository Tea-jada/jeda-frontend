import React, { useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';

export default function ResizableImageComponent({ node, updateAttributes, selected }) {
  const { src, width, height, alt } = node.attrs;
  const imgRef = useRef();

  // 핸들 드래그 이벤트
  const onMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width;
    const startHeight = height;

    const onMouseMove = (moveEvent) => {
      const newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(50, startHeight + (moveEvent.clientY - startY));
      updateAttributes({ width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <NodeViewWrapper as="span" style={{ display: 'inline-block', position: 'relative', border: selected ? '2px solid #2d7a2d' : 'none' }}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={{ width, height, display: 'block', maxWidth: '100%' }}
        data-resizable-image="true"
      />
      {/* 우측하단 리사이즈 핸들 */}
      {selected && (
        <span
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 16,
            height: 16,
            background: '#fff',
            border: '2px solid #2d7a2d',
            borderRadius: 4,
            cursor: 'nwse-resize',
            zIndex: 10,
          }}
          onMouseDown={onMouseDown}
        />
      )}
    </NodeViewWrapper>
  );
} 