import React, { useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';

export default function ResizableImageComponent({ node, updateAttributes, selected, editor, getPos }) {
  const { src, width, height, alt, align = 'left' } = node.attrs;
  const imgRef = useRef();

  // Wrapper 클릭 시 커서 이동
  const onWrapperClick = (e) => {
    // 이미지 DOM의 bounding box
    const imgRect = imgRef.current?.getBoundingClientRect();
    if (!imgRect) return;
    // 클릭 위치가 이미지의 우측(오른쪽 바깥)일 때만 동작
    if (e.clientX > imgRect.right) {
      // getPos가 함수일 때만 사용
      if (typeof getPos === 'function' && editor) {
        const pos = getPos();
        // 이미지 노드 다음 위치로 selection 이동
        editor.commands.focus();
        editor.commands.setTextSelection(pos + 1);
      }
    }
  };

  // 핸들 드래그 이벤트 (방향별)
  const onHandleMouseDown = (direction) => (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width;
    const startHeight = height;

    const onMouseMove = (moveEvent) => {
      let newWidth = startWidth;
      let newHeight = startHeight;
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      switch (direction) {
        case 'right':
          newWidth = Math.max(50, startWidth + dx);
          break;
        case 'left':
          newWidth = Math.max(50, startWidth - dx);
          break;
        case 'bottom':
          newHeight = Math.max(50, startHeight + dy);
          break;
        case 'top':
          newHeight = Math.max(50, startHeight - dy);
          break;
        case 'top-left':
          newWidth = Math.max(50, startWidth - dx);
          newHeight = Math.max(50, startHeight - dy);
          break;
        case 'top-right':
          newWidth = Math.max(50, startWidth + dx);
          newHeight = Math.max(50, startHeight - dy);
          break;
        case 'bottom-left':
          newWidth = Math.max(50, startWidth - dx);
          newHeight = Math.max(50, startHeight + dy);
          break;
        case 'bottom-right':
          newWidth = Math.max(50, startWidth + dx);
          newHeight = Math.max(50, startHeight + dy);
          break;
        default:
          break;
      }
      updateAttributes({ width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // 핸들 스타일 공통 (작은 원형, 그림자 추가)
  // const handleStyle = { ... } // 삭제

  // 각 핸들 위치 및 커서 (이미지 바깥쪽 끝에 위치)
  const offset = -7; // 이미지 바깥쪽에 위치하도록 오프셋
  const handles = [
    { dir: 'top-left', style: { left: offset, top: offset, cursor: 'nwse-resize' } },
    { dir: 'top', style: { left: '50%', top: offset, transform: 'translateX(-50%)', cursor: 'ns-resize' } },
    { dir: 'top-right', style: { right: offset, top: offset, cursor: 'nesw-resize' } },
    { dir: 'right', style: { right: offset, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' } },
    { dir: 'bottom-right', style: { right: offset, bottom: offset, cursor: 'nwse-resize' } },
    { dir: 'bottom', style: { left: '50%', bottom: offset, transform: 'translateX(-50%)', cursor: 'ns-resize' } },
    { dir: 'bottom-left', style: { left: offset, bottom: offset, cursor: 'nesw-resize' } },
    { dir: 'left', style: { left: offset, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' } },
  ];

  return (
    <NodeViewWrapper
      as="span"
      className={`tiptap-resizable-image-wrapper${selected ? ' selected' : ''}`}
      onClick={onWrapperClick}
    >
      {/* 정렬 버튼 삭제됨 */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={{
          width,
          height,
          display: 'block',
          maxWidth: '100%',
          marginLeft: align === 'center' ? 'auto' : align === 'right' ? 'auto' : 0,
          marginRight: align === 'center' ? 'auto' : align === 'left' ? 'auto' : 0,
        }}
        data-resizable-image="true"
        onDragStart={() => {
          if (typeof getPos === 'function') {
            window._draggedImagePos = getPos();
          }
        }}
      />
      {/* 8방향 리사이즈 핸들 */}
      {selected && handles.map(h => (
        <span
          key={h.dir}
          className={`tiptap-resizable-image__handle tiptap-resizable-image__handle--${h.dir}`}
          style={h.style}
          onMouseDown={onHandleMouseDown(h.dir)}
        />
      ))}
    </NodeViewWrapper>
  );
} 