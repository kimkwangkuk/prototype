import { useMemo, useEffect, useRef } from 'react';
import useTodoStore from '../../../store/useTodoStore';
import { formatDate } from '../../../utils/dateUtils';

const todayStr = formatDate(new Date());

function buildDateItems() {
  const today = new Date();
  const items = [];
  for (let i = -1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const ds = formatDate(d);
    let label;
    if (i === -1) label = '어제';
    else if (i === 0) label = '오늘';
    else if (i === 1) label = '내일';
    else if (i === 2) label = '모레';
    else label = `${d.getMonth() + 1}/${d.getDate()}`;
    items.push({ ds, label });
  }
  return items;
}

export default function DatePopup({ visible, onClose, style }) {
  const data = useTodoStore(state => state.bottomSheetData);
  const updateBottomSheetField = useTodoStore(state => state.updateBottomSheetField);
  const stripRef = useRef(null);
  const activeChipRef = useRef(null);

  const dateItems = useMemo(() => buildDateItems(), []);

  // 현재 선택값 정규화 ('today' → 오늘 날짜 문자열)
  const currentDate = data.date === 'today' ? todayStr : data.date;
  const isRepeat = currentDate === 'repeat';

  // 팝업 열릴 때 선택된 칩이 보이도록 스크롤
  useEffect(() => {
    if (visible && activeChipRef.current) {
      activeChipRef.current.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
    }
  }, [visible]);

  if (!visible) return null;

  const handleDateSelect = (ds) => {
    updateBottomSheetField('date', ds);
    onClose();
  };

  const handleRepeat = () => {
    updateBottomSheetField('date', isRepeat ? todayStr : 'repeat');
    onClose();
  };

  return (
    <>
      <div
        className="popup-overlay"
        onMouseDown={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
        onTouchEnd={(e) => { e.preventDefault(); onClose(); }}
        onClick={onClose}
      />
      <div className="context-popup" data-popup="date" style={style}>
        <div className="popup-content">

          {/* 반복 */}
          <button
            className="popup-item"
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
            onTouchEnd={(e) => { e.preventDefault(); handleRepeat(); }}
            onClick={handleRepeat}
          >
            <span>반복</span>
            {isRepeat && (
              <svg className="popup-item-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>

          {/* 날짜 가로 스크롤 스트립 */}
          <div className="date-strip-wrapper" ref={stripRef}>
            <div className="date-strip">
              {dateItems.map(({ ds, label }) => {
                const isActive = !isRepeat && currentDate === ds;
                return (
                  <button
                    key={ds}
                    ref={isActive ? activeChipRef : null}
                    className={`date-chip${isActive ? ' active' : ''}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.preventDefault()}
                    onTouchEnd={(e) => { e.preventDefault(); handleDateSelect(ds); }}
                    onClick={() => handleDateSelect(ds)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
