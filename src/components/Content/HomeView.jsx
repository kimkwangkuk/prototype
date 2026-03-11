import { useEffect, useRef, useState } from 'react';
import { Target, Hamburger, Square, Gamepad2, Zap, ListChecks, Users } from 'lucide-react';
import useTodoStore from '../../store/useTodoStore';
import HomeEventDetailSheet from '../Home/HomeEventDetailSheet';

const HOUR_HEIGHT = 60;
const START_HOUR = 5;
const LABEL_W = 70;     // 시간 레이블 열 너비
const CONT_PAD = 16;    // .timeline-container 좌우 패딩
const EVENTS_LEFT = CONT_PAD + LABEL_W; // 86px — 이벤트 영역 시작점 (절대 기준)
const EVENTS_RIGHT_PAD = CONT_PAD;      // 16px — 오른쪽 여백
const HOURS = Array.from({ length: 24 }, (_, i) => (START_HOUR + i) % 24);

function hourLabel(h) {
  if (h === 0) return 'AM 12';
  if (h < 12) return `AM ${h}`;
  if (h === 12) return 'PM 12';
  return `PM ${h - 12}`;
}

function toMin(h, m = 0) { return h * 60 + m; }

function timeToTop(h, m = 0) {
  return ((h - START_HOUR + 24) % 24) * HOUR_HEIGHT + (m / 60) * HOUR_HEIGHT;
}

function formatRange(sh, sm, eh, em) {
  const f = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
  return `${f(sh, sm)}~${f(eh, em)}`;
}

function getNowTop() {
  const d = new Date();
  return timeToTop(d.getHours(), d.getMinutes());
}

function getNowLabel() {
  const d = new Date();
  const h = d.getHours();
  const hh = h % 12 || 12;
  return `${hh}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// 시간대별 이모지
const HOUR_EMOJIS = {
  5: ['🌞', '💧'],
  9: ['🏃🏻‍♂️'],
};

// Lucide 아이콘 매핑
const ICON_MAP = {
  focus: Target,
  meal:  Hamburger,
  task:  Square,
  game:  Gamepad2,
  custom: Zap,
};

// ─── 겹침 감지 레이아웃 알고리즘 (Google Calendar 방식) ───
function computeLayout(events) {
  if (!events.length) return {};

  const sorted = [...events].sort(
    (a, b) => toMin(a.startH, a.startM) - toMin(b.startH, b.startM)
  );

  // 1단계: 그리디 열 배정
  const colEndMin = []; // 각 열의 마지막 이벤트 종료 시각(분)
  const result = {};

  for (const ev of sorted) {
    const start = toMin(ev.startH, ev.startM);
    const end   = toMin(ev.endH,   ev.endM);

    let col = colEndMin.findIndex(t => t <= start);
    if (col === -1) col = colEndMin.length;
    colEndMin[col] = end;
    result[ev.id] = { col, numCols: 1 };
  }

  // 2단계: 각 이벤트의 numCols = 동시 중첩 클러스터 내 최대 열 + 1
  for (const ev of sorted) {
    const evStart = toMin(ev.startH, ev.startM);
    const evEnd   = toMin(ev.endH,   ev.endM);
    let maxCol = result[ev.id].col;

    for (const other of sorted) {
      if (other.id === ev.id) continue;
      const os = toMin(other.startH, other.startM);
      const oe = toMin(other.endH,   other.endM);
      if (evStart < oe && evEnd > os) {
        maxCol = Math.max(maxCol, result[other.id].col);
      }
    }
    result[ev.id].numCols = maxCol + 1;
  }

  return result;
}

// 이벤트 절대 포지션 스타일 (컨테이너 기준)
// 100% = 컨테이너 전체 너비(패딩 포함). 이벤트 영역 = 86px ~ (100% - 16px)
function getEventStyle(top, height, col, numCols) {
  const totalReserved = EVENTS_LEFT + EVENTS_RIGHT_PAD; // 102px
  const gap = numCols > 1 ? 1 : 0; // 겹칠 때만 1px 간격
  const left = `calc(${EVENTS_LEFT}px + ${col} * ((100% - ${totalReserved}px) / ${numCols} + ${gap}px))`;
  const width = `calc((100% - ${totalReserved}px) / ${numCols} - ${gap}px)`;
  return { position: 'absolute', top, height, left, width };
}

// ─── 샘플 이벤트 ───
const SAMPLE_EVENTS = [
  { id: 'ev1', type: 'task',  title: '오답노트',    startH: 8,  startM: 0,  endH: 9,  endM: 0  },
  { id: 'ev2', type: 'focus', title: '집중계획',    startH: 8,  startM: 30, endH: 10, endM: 30, todoCount: 3 },
  { id: 'ev3', type: 'task',  title: '영어단어 30개', startH: 9, startM: 30, endH: 10, endM: 30 },
  { id: 'ev4', type: 'focus', title: '집중계획',    startH: 12, startM: 0,  endH: 12, endM: 43, note: '버스에서 줄리아 만남!', todoCount: 3 },
  { id: 'ev5', type: 'task',  title: '영어단어 30개', startH: 12, startM: 0, endH: 12, endM: 43 },
  { id: 'ev6', type: 'meal',  title: '점심식사',    startH: 14, startM: 0,  endH: 14, endM: 40 },
  { id: 'ev7', type: 'focus', title: '집중계획',    startH: 17, startM: 0,  endH: 17, endM: 43, note: '버스에서 줄리아 만남!', todoCount: 3 },
  { id: 'ev8', type: 'meal',  title: '저녁식사',    startH: 22, startM: 0,  endH: 22, endM: 43 },
  { id: 'ev9', type: 'game',  title: '게임 한판',   startH: 22, startM: 0,  endH: 22, endM: 43 },
];

// 컴팩트 투두 칩
const CHIPS = [
  { id: 'ch0', title: '할 일 +2',       startH: 6,  startM: 0,  col: 'full', grouped: true },
  { id: 'ch1', title: '영어 단어 30개', startH: 9,  startM: 0,  col: 'right' },
  { id: 'ch2', title: '수학 공식 3개',  startH: 9,  startM: 16, col: 'right' },
  { id: 'ch3', title: '영어 단어 30개', startH: 14, startM: 0,  col: 'right' },
  { id: 'ch4', title: '수학 공식 3개',  startH: 14, startM: 16, col: 'right' },
  { id: 'ch5', title: '영어 단어 30개', startH: 17, startM: 0,  col: 'right' },
  { id: 'ch6', title: '수학 공식 3개',  startH: 17, startM: 16, col: 'right' },
  { id: 'ch7', title: '과학 오답노트',  startH: 17, startM: 32, col: 'right' },
  { id: 'ch8', title: '영어 단어 30개', startH: 20, startM: 0,  col: 'full' },
  { id: 'ch9', title: '수학 공식 3개',  startH: 20, startM: 16, col: 'full' },
  { id:'ch10', title: '과학 오답노트',  startH: 20, startM: 32, col: 'full' },
];

function getChipStyle(col, top) {
  if (col === 'full')  return { position: 'absolute', top, left: EVENTS_LEFT, right: EVENTS_RIGHT_PAD };
  if (col === 'right') return { position: 'absolute', top, left: `calc(50% + 2px)`, right: EVENTS_RIGHT_PAD };
  return { position: 'absolute', top, left: EVENTS_LEFT, right: `calc(50% + 1px)` };
}

export default function HomeView() {
  const scrollRef = useRef(null);
  const homeEvents = useTodoStore(state => state.homeEvents);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    const top = getNowTop();
    const h = scrollRef.current.clientHeight;
    scrollRef.current.scrollTop = Math.max(0, top - h / 3);
  }, []);

  const nowY    = getNowTop();
  const nowLabel = getNowLabel();

  // 샘플 + 동적 이벤트 합치기
  const allEvents = [
    ...SAMPLE_EVENTS,
    ...homeEvents.map(e => ({ ...e, id: String(e.id) })),
  ];

  const layout = computeLayout(allEvents);

  return (
    <div className="home-view" ref={scrollRef}>
      <div className="timeline-container">

        {/* 시간 그리드 */}
        {HOURS.map(h => (
          <div key={h} className="timeline-row">
            <div className="timeline-label-col">
              <span className="timeline-time-label">{hourLabel(h)}</span>
              {HOUR_EMOJIS[h] && (
                <div className="timeline-hour-emojis">
                  {HOUR_EMOJIS[h].map((emoji, i) => (
                    <span key={i} className="timeline-hour-emoji">{emoji}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="timeline-content-col" />
          </div>
        ))}

        {/* 현재 시각 인디케이터 */}
        <div className="timeline-now-pill" style={{ top: nowY - 9 }}>
          <span className="timeline-now-pill-text">{nowLabel}</span>
        </div>
        <div className="timeline-now-line" style={{ top: nowY }} />

        {/* 이벤트 카드 (겹침 감지 레이아웃 적용) */}
        {allEvents.map(ev => {
          const { col = 0, numCols = 1 } = layout[ev.id] || {};
          const top    = timeToTop(ev.startH, ev.startM);
          const height = Math.max(timeToTop(ev.endH, ev.endM) - top, 30);
          const Icon   = ICON_MAP[ev.type] || Square;

          return (
            <div
              key={ev.id}
              className="timeline-event"
              style={getEventStyle(top, height, col, numCols)}
              onClick={() => setSelectedEvent(ev)}
            >
              <div className="timeline-event-title-row">
                <div className="timeline-event-icon">
                  <Icon size={14} strokeWidth={1.8} color="rgba(0,0,0,0.75)" />
                </div>
                <span className="timeline-event-title">{ev.title}</span>
              </div>
              <div className="timeline-event-meta">
                <span className="timeline-event-time">
                  {formatRange(ev.startH, ev.startM, ev.endH, ev.endM)}
                </span>
                {ev.todoCount && (
                  <div className="timeline-event-count-row">
                    <Users size={12} strokeWidth={1.5} color="rgba(0,0,0,0.4)" />
                    <span className="timeline-event-time">{ev.todoCount}</span>
                  </div>
                )}
              </div>
              {ev.note && (
                <span className="timeline-event-note">{ev.note}</span>
              )}
            </div>
          );
        })}

        {/* 투두 칩 */}
        {CHIPS.map(chip => {
          const top = timeToTop(chip.startH, chip.startM);
          const style = getChipStyle(chip.col, top);

          if (chip.grouped) {
            return (
              <div key={chip.id} className="timeline-grouped-chip" style={style}>
                <ListChecks size={13} strokeWidth={1.8} color="rgba(0,0,0,0.6)" style={{ flexShrink: 0 }} />
                <span className="timeline-grouped-chip-label">{chip.title}</span>
              </div>
            );
          }
          return (
            <div key={chip.id} className="timeline-chip" style={style}>
              <Square size={10} strokeWidth={1.5} color="rgba(0,0,0,0.35)" style={{ flexShrink: 0 }} />
              <span className="timeline-chip-label">{chip.title}</span>
            </div>
          );
        })}
      </div>
    </div>

    <HomeEventDetailSheet event={selectedEvent} onClose={() => setSelectedEvent(null)} />
  );
}
