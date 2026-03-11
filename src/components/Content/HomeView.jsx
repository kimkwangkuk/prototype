import { useEffect, useRef } from 'react';

const HOUR_HEIGHT = 60;
const START_HOUR = 5;
const HOURS = Array.from({ length: 24 }, (_, i) => (START_HOUR + i) % 24);

function hourLabel(h) {
  if (h === 0) return 'AM 12';
  if (h < 12) return `AM ${h}`;
  if (h === 12) return 'PM 12';
  return `PM ${h - 12}`;
}

function timeToTop(h, m = 0) {
  return ((h - START_HOUR + 24) % 24) * HOUR_HEIGHT + (m / 60) * HOUR_HEIGHT;
}

function formatTimeRange(startH, startM, endH, endM) {
  const f = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
  return `${f(startH, startM)}~${f(endH, endM)}`;
}

function getNowTop() {
  const d = new Date();
  return timeToTop(d.getHours(), d.getMinutes());
}

function getNowLabel() {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes();
  const hh = h % 12 || 12;
  return `${hh}:${String(m).padStart(2, '0')}`;
}

// Emoji indicators per hour (from Figma design)
const HOUR_EMOJIS = {
  5: ['🌞', '💧'],
  9: ['🏃🏻‍♂️'],
};

// Inline SVG icons for event types
const FocusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1.5C7 1.5 4.5 4.5 4.5 7C4.5 8.38 5.62 9.5 7 9.5C8.38 9.5 9.5 8.38 9.5 7C9.5 4.5 7 1.5 7 1.5Z" fill="rgba(0,0,0,0.86)"/>
    <path d="M7 9.5V12.5" stroke="rgba(0,0,0,0.86)" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M5.2 11.5H8.8" stroke="rgba(0,0,0,0.86)" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const MealIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5 1.5V5C5 6.1 4.1 7 3 7V12.5" stroke="rgba(0,0,0,0.86)" strokeWidth="1.1" strokeLinecap="round"/>
    <path d="M3 1.5V4M5 1.5V4" stroke="rgba(0,0,0,0.86)" strokeWidth="1.1" strokeLinecap="round"/>
    <path d="M10 1.5C10 1.5 11.5 3.2 11.5 5.5C11.5 6.66 10.7 7.5 9.5 7.5V12.5" stroke="rgba(0,0,0,0.86)" strokeWidth="1.1" strokeLinecap="round"/>
  </svg>
);

const TaskCheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1.44" y="1.44" width="11.12" height="11.12" rx="2.5" stroke="rgba(0,0,0,0.4)" strokeWidth="0.88"/>
  </svg>
);

const GameIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="4" width="12" height="7.5" rx="3.75" stroke="rgba(0,0,0,0.86)" strokeWidth="1.1"/>
    <path d="M4.5 6.5V8.5M3.5 7.5H5.5" stroke="rgba(0,0,0,0.86)" strokeWidth="1.1" strokeLinecap="round"/>
    <circle cx="9.5" cy="7.5" r="0.75" fill="rgba(0,0,0,0.86)"/>
  </svg>
);

const SmallCheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <rect x="1" y="1" width="10" height="10" rx="2" stroke="rgba(0,0,0,0.4)" strokeWidth="0.75"/>
  </svg>
);

const GroupCheckIcon = () => (
  <div style={{ position: 'relative', width: 14, height: 13, flexShrink: 0 }}>
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" style={{ position: 'absolute', top: 0, left: 0 }}>
      <rect x="0.5" y="0.5" width="8" height="8" rx="1.5" stroke="rgba(0,0,0,0.4)" strokeWidth="0.75"/>
    </svg>
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" style={{ position: 'absolute', top: 3, left: 4.5 }}>
      <rect x="0.5" y="0.5" width="8" height="8" rx="1.5" stroke="rgba(0,0,0,0.4)" strokeWidth="0.75"/>
    </svg>
  </div>
);

const CalCheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <rect x="1" y="1" width="10" height="10" rx="2" stroke="rgba(0,0,0,0.4)" strokeWidth="0.75"/>
  </svg>
);

const ICON_MAP = {
  focus: FocusIcon,
  meal: MealIcon,
  task: TaskCheckIcon,
  game: GameIcon,
};

// Column layout helpers
function getColStyle(col) {
  if (col === 'left') return { left: 86, right: 'calc(50% + 1px)' };
  if (col === 'right') return { left: 'calc(50% + 2px)', right: 16 };
  return { left: 86, right: 16 }; // full
}

// Sample events matching the Figma design
const EVENTS = [
  {
    id: 'ev1', type: 'task', title: '오답노트',
    startH: 8, startM: 0, endH: 9, endM: 0,
    col: 'left',
  },
  {
    id: 'ev2', type: 'focus', title: '집중계획',
    startH: 8, startM: 30, endH: 10, endM: 30,
    todoCount: 3, col: 'right',
  },
  {
    id: 'ev3', type: 'task', title: '영어단어 30개',
    startH: 9, startM: 30, endH: 10, endM: 30,
    col: 'right',
  },
  {
    id: 'ev4', type: 'focus', title: '집중계획',
    startH: 12, startM: 0, endH: 12, endM: 43,
    note: '버스에서 줄리아 만남!', todoCount: 3, col: 'left',
  },
  {
    id: 'ev5', type: 'task', title: '영어단어 30개',
    startH: 12, startM: 0, endH: 12, endM: 43,
    col: 'right',
  },
  {
    id: 'ev6', type: 'meal', title: '점심식사',
    startH: 14, startM: 0, endH: 14, endM: 40,
    col: 'left',
  },
  {
    id: 'ev7', type: 'focus', title: '집중계획',
    startH: 17, startM: 0, endH: 17, endM: 43,
    note: '버스에서 줄리아 만남!', todoCount: 3, col: 'left',
  },
  {
    id: 'ev8', type: 'meal', title: '저녁식사',
    startH: 22, startM: 0, endH: 22, endM: 43,
    col: 'left',
  },
  {
    id: 'ev9', type: 'game', title: '게임 한판',
    startH: 22, startM: 0, endH: 22, endM: 43,
    col: 'right',
  },
];

// Compact todo chips (thin horizontal strips)
const CHIPS = [
  // AM 6 – grouped chip (full width)
  { id: 'ch0', title: '할 일 +2', startH: 6, startM: 0, col: 'full', grouped: true },
  // AM 9 – right column chips
  { id: 'ch1', title: '영어 단어 30개', startH: 9, startM: 0, col: 'right' },
  { id: 'ch2', title: '수학 공식 3개', startH: 9, startM: 16, col: 'right' },
  // PM 2 – right column chips
  { id: 'ch3', title: '영어 단어 30개', startH: 14, startM: 0, col: 'right' },
  { id: 'ch4', title: '수학 공식 3개', startH: 14, startM: 16, col: 'right' },
  // PM 5 – right column chips
  { id: 'ch5', title: '영어 단어 30개', startH: 17, startM: 0, col: 'right' },
  { id: 'ch6', title: '수학 공식 3개', startH: 17, startM: 16, col: 'right' },
  { id: 'ch7', title: '과학 오답노트 작성', startH: 17, startM: 32, col: 'right' },
  // PM 8 – full width chips
  { id: 'ch8', title: '영어 단어 30개', startH: 20, startM: 0, col: 'full' },
  { id: 'ch9', title: '수학 공식 3개', startH: 20, startM: 16, col: 'full' },
  { id: 'ch10', title: '과학 오답노트 작성', startH: 20, startM: 32, col: 'full' },
];

export default function HomeView() {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    // Auto-scroll so current time is visible ~1/3 from top
    const top = getNowTop();
    const containerH = scrollRef.current.clientHeight;
    scrollRef.current.scrollTop = Math.max(0, top - containerH / 3);
  }, []);

  const nowY = getNowTop();
  const nowLabel = getNowLabel();

  return (
    <div className="home-view" ref={scrollRef}>
      <div className="timeline-container">
        {/* Hour grid rows */}
        {HOURS.map((h) => (
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

        {/* Current time indicator */}
        <div
          className="timeline-now-pill"
          style={{ top: nowY - 9 }}
        >
          <span className="timeline-now-pill-text">{nowLabel}</span>
        </div>
        <div
          className="timeline-now-line"
          style={{ top: nowY }}
        />

        {/* Event cards */}
        {EVENTS.map((ev) => {
          const Icon = ICON_MAP[ev.type];
          const top = timeToTop(ev.startH, ev.startM);
          const height = Math.max(timeToTop(ev.endH, ev.endM) - top, 30);
          const colStyle = getColStyle(ev.col);

          return (
            <div
              key={ev.id}
              className="timeline-event"
              style={{ position: 'absolute', top, height, ...colStyle }}
            >
              <div className="timeline-event-title-row">
                <div className="timeline-event-icon">
                  {Icon && <Icon />}
                </div>
                <span className="timeline-event-title">{ev.title}</span>
              </div>
              <div className="timeline-event-meta">
                <span className="timeline-event-time">
                  {formatTimeRange(ev.startH, ev.startM, ev.endH, ev.endM)}
                </span>
                {ev.todoCount && (
                  <div className="timeline-event-count-row">
                    <CalCheckIcon />
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

        {/* Compact todo chips */}
        {CHIPS.map((chip) => {
          const top = timeToTop(chip.startH, chip.startM);
          const colStyle = getColStyle(chip.col);

          if (chip.grouped) {
            return (
              <div
                key={chip.id}
                className="timeline-grouped-chip"
                style={{ position: 'absolute', top, ...colStyle }}
              >
                <GroupCheckIcon />
                <span className="timeline-grouped-chip-label">{chip.title}</span>
              </div>
            );
          }

          return (
            <div
              key={chip.id}
              className="timeline-chip"
              style={{ position: 'absolute', top, ...colStyle }}
            >
              <SmallCheckIcon />
              <span className="timeline-chip-label">{chip.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
