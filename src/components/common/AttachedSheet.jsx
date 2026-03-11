import { useState, useEffect } from 'react';

/**
 * AttachedSheet — 좌우 마진 없이 화면 하단에 붙는 바텀시트
 * Props:
 *   visible   {boolean}   표시 여부
 *   onClose   {function}  오버레이 클릭 시 호출
 *   children  {node}      시트 내부 콘텐츠
 */
export default function AttachedSheet({ visible, onClose, children }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (visible) setTimeout(() => setAnimate(true), 10);
    else setAnimate(false);
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <div className="attached-sheet-overlay" onClick={onClose} />
      <div className={`attached-sheet${animate ? ' visible' : ''}`}>
        <div className="attached-sheet-grabber-row">
          <svg width="36" height="4" viewBox="0 0 36 4" fill="none">
            <rect width="36" height="4" rx="2" fill="rgba(0,0,0,0.18)" />
          </svg>
        </div>
        <div className="attached-sheet-content">
          {children}
        </div>
      </div>
    </>
  );
}
