import { useState, useEffect, useRef, useMemo } from 'react';
import useTodoStore from '../../../store/useTodoStore';
import { formatDate, getDayOfWeekKR } from '../../../utils/dateUtils';

const todayStr = formatDate(new Date());
const ITEM_H = 44;

function buildDates() {
  const today = new Date();
  const items = [];
  for (let i = -1; i <= 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const ds = formatDate(d);
    let suffix;
    if (i === -1) suffix = '(어제)';
    else if (i === 0) suffix = '(오늘)';
    else if (i === 1) suffix = '(내일)';
    else if (i === 2) suffix = '(모레)';
    else suffix = getDayOfWeekKR(d);
    items.push({ ds, label: `${d.getMonth() + 1}.${d.getDate()} ${suffix}` });
  }
  return items;
}

export default function DatePopup({ visible, onClose, style }) {
  const data = useTodoStore(state => state.bottomSheetData);
  const updateBottomSheetField = useTodoStore(state => state.updateBottomSheetField);

  const dates = useMemo(() => buildDates(), []);
  const scrollRef = useRef(null);
  const scrollTimer = useRef(null);
  const [centerIdx, setCenterIdx] = useState(0);

  const isRepeat = data.date === 'repeat';
  const [tab, setTab] = useState(isRepeat ? 'repeat' : 'date');

  const currentDate = (data.date === 'today' || data.date === 'repeat') ? todayStr : data.date;

  // 팝업 열릴 때 선택된 날짜로 스크롤 초기화
  useEffect(() => {
    if (!visible || tab !== 'date') return;
    const idx = Math.max(0, dates.findIndex(d => d.ds === currentDate));
    setCenterIdx(idx);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = idx * ITEM_H;
    }
  }, [visible, tab]);

  useEffect(() => () => clearTimeout(scrollTimer.current), []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const idx = Math.max(0, Math.min(dates.length - 1, Math.round(scrollRef.current.scrollTop / ITEM_H)));
    setCenterIdx(idx);

    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      if (!scrollRef.current || !dates[idx]) return;
      scrollRef.current.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
      updateBottomSheetField('date', dates[idx].ds);
    }, 150);
  };

  const handleTabSelect = (t) => {
    setTab(t);
    if (t === 'repeat') {
      updateBottomSheetField('date', 'repeat');
      onClose();
    }
  };

  const handleItemClick = (ds, i) => {
    setCenterIdx(i);
    scrollRef.current?.scrollTo({ top: i * ITEM_H, behavior: 'smooth' });
    updateBottomSheetField('date', ds);
  };

  if (!visible) return null;

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

        {/* 탭 스위처 */}
        <div className="date-tab-row">
          <button
            className={`date-tab${tab === 'date' ? ' active' : ''}`}
            onClick={() => handleTabSelect('date')}
          >
            <span className="date-tab-dot" />
            날짜
          </button>
          <div className="date-tab-divider" />
          <button
            className={`date-tab${tab === 'repeat' ? ' active' : ''}`}
            onClick={() => handleTabSelect('repeat')}
          >
            <span className="date-tab-dot" />
            반복
          </button>
        </div>

        {/* 드럼롤 피커 */}
        {tab === 'date' && (
          <div className="drum-picker-wrap">
            <div className="drum-picker-highlight" />
            <div className="drum-picker" ref={scrollRef} onScroll={handleScroll}>
              <div style={{ height: ITEM_H * 2 }} />
              {dates.map(({ ds, label }, i) => {
                const dist = Math.abs(i - centerIdx);
                return (
                  <div
                    key={ds}
                    className={`drum-item${i === centerIdx ? ' selected' : ''}`}
                    style={{ opacity: dist === 0 ? 1 : dist === 1 ? 0.35 : 0.12 }}
                    onClick={() => handleItemClick(ds, i)}
                  >
                    {label}
                  </div>
                );
              })}
              <div style={{ height: ITEM_H * 2 }} />
            </div>
          </div>
        )}

      </div>
    </>
  );
}
