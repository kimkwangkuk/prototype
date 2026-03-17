import { useEffect, useRef, useState } from 'react';
import { Target, Hamburger, Square, Gamepad2, Zap, Users } from 'lucide-react';
import useTodoStore from '../../store/useTodoStore';
import HomeEventDetailSheet from '../Home/HomeEventDetailSheet';
import HomeGroupDetailSheet from '../Home/HomeGroupDetailSheet';
import ChallengeSheet from '../Home/ChallengeSheet';

const HOUR_HEIGHT = 60;
const START_HOUR = 5;
const LABEL_W = 70;     // 시간 레이블 열 너비
const CONT_PAD = 16;    // .timeline-container 좌우 패딩
const EVENTS_LEFT = CONT_PAD + LABEL_W; // 86px — 이벤트 영역 시작점 (절대 기준)
const EVENTS_RIGHT_PAD = CONT_PAD;      // 16px — 오른쪽 여백
// 25개: 5am → 5am (다음날) — 마지막 행에 AM 5 레이블 표시
const DISPLAY_HOURS = Array.from({ length: 25 }, (_, i) => (START_HOUR + i) % 24);

// 이벤트 시각 → 타임라인 기준 분(0=5am, 1440=5am 다음날)
function toTimelineMins(h, m = 0) {
  let offset = h - START_HOUR;
  if (offset < 0) offset += 24;
  return offset * 60 + m;
}

// 타임라인 분 → "HH:MM" 문자열
function minsToTimeStr(mins) {
  const realMins = (mins + START_HOUR * 60) % (24 * 60);
  const h = Math.floor(realMins / 60);
  const m = realMins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function hourLabel(h) {
  if (h === 0) return 'AM 12';
  if (h < 12) return `AM ${h}`;
  if (h === 12) return 'PM 12';
  return `PM ${h - 12}`;
}

function toMin(h, m = 0) { return h * 60 + m; }

const STUDY_TYPES = new Set(['focus', 'task']);

function getStudyFill(ev) {
  const nowTop   = getNowTop();
  const startTop = timeToTop(ev.startH, ev.startM);
  const endTop   = timeToTop(ev.endH,   ev.endM);
  if (nowTop >= endTop)   return 1;
  if (nowTop <= startTop) return 0;
  return (nowTop - startTop) / (endTop - startTop);
}

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

// ─── 연속 이벤트 그룹핑 (종료~시작 0~15분 이내면 하나의 블록으로 합침) ───
const MAX_MERGE_GAP = 15;

function groupNearbyEvents(events) {
  if (!events.length) return { singles: [], merged: [] };

  const sorted = [...events].sort(
    (a, b) => toMin(a.startH, a.startM) - toMin(b.startH, b.startM)
  );

  const chains = [];
  let current = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = current[current.length - 1];
    const gap = toMin(sorted[i].startH, sorted[i].startM) - toMin(prev.endH, prev.endM);
    if (gap >= 0 && gap <= MAX_MERGE_GAP) {
      current.push(sorted[i]);
    } else {
      chains.push([...current]);
      current = [sorted[i]];
    }
  }
  chains.push([...current]);

  const singles = [];
  const merged = [];

  for (const chain of chains) {
    if (chain.length === 1) {
      singles.push(chain[0]);
    } else {
      const maxEndEv = chain.reduce((best, ev) =>
        toMin(ev.endH, ev.endM) > toMin(best.endH, best.endM) ? ev : best
      );
      merged.push({
        id: `group-${chain[0].id}`,
        type: 'group',
        events: chain,
        startH: chain[0].startH,
        startM: chain[0].startM,
        endH: maxEndEv.endH,
        endM: maxEndEv.endM,
        title: chain[0].title,
        extraCount: chain.length - 1,
      });
    }
  }

  return { singles, merged };
}

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


export default function HomeView() {
  const scrollRef = useRef(null);
  const homeEvents = useTodoStore(state => state.homeEvents);
  const homeAddMode = useTodoStore(state => state.homeAddMode);
  const openHomeSheet = useTodoStore(state => state.openHomeSheet);
  const newlyAddedHomeEventId = useTodoStore(state => state.newlyAddedHomeEventId);
  const clearNewlyAddedHomeEventId = useTodoStore(state => state.clearNewlyAddedHomeEventId);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [pressedId, setPressedId] = useState(null);
  const [pressedSlot, setPressedSlot] = useState(null);      // { startMins, endMins }
  const [pressedConfirmed, setPressedConfirmed] = useState(false); // 롱탭 완료 → 보더 표시
  const longPressTimerRef = useRef(null);
  const longPressSlotRef = useRef(null);
  const confirmedSlotRef = useRef(null);
  const pointerStartRef  = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    const top = getNowTop();
    const h = scrollRef.current.clientHeight;
    scrollRef.current.scrollTop = Math.max(0, top - h / 3);
  }, []);

  // 신규 이벤트 점멸 후 플래그 해제 (페이지 닫힘 350ms + 점멸 750ms)
  useEffect(() => {
    if (!newlyAddedHomeEventId) return;
    const t = setTimeout(clearNewlyAddedHomeEventId, 1500);
    return () => clearTimeout(t);
  }, [newlyAddedHomeEventId]);

  const nowY    = getNowTop();
  const nowLabel = getNowLabel();

  // 샘플 + 동적 이벤트 합치기
  const allEvents = [
    ...SAMPLE_EVENTS,
    ...homeEvents.map(e => ({ ...e, id: String(e.id) })),
  ];

  // 연속 이벤트 그룹핑
  const { singles, merged: mergedGroups } = groupNearbyEvents(allEvents);
  const layoutEvents = [...singles, ...mergedGroups];

  // 포인터 위치 → 빈 슬롯 계산 (없으면 null)
  const getSlotFromPointer = (e) => {
    if (
      e.target.closest('.timeline-event') ||
      e.target.closest('.timeline-label-col') ||
      e.target.closest('.timeline-hour-emojis') ||
      e.target.closest('.timeline-now-pill')
    ) return null;

    const containerEl = e.currentTarget;
    const rect = containerEl.getBoundingClientRect();
    const clickY = e.clientY - rect.top;

    const rawMins = (clickY / HOUR_HEIGHT) * 60;
    const startMins = Math.max(0, Math.min(Math.round(rawMins / 10) * 10, 24 * 60 - 10));

    const intervals = allEvents.map(ev => ({
      start: toTimelineMins(ev.startH, ev.startM),
      end: toTimelineMins(ev.endH, ev.endM),
    }));
    if (intervals.some(iv => startMins >= iv.start && startMins < iv.end)) return null;

    const nextStart = intervals
      .filter(iv => iv.start > startMins)
      .reduce((min, iv) => (iv.start < min ? iv.start : min), Infinity);

    const endMins = nextStart < startMins + 60 ? nextStart : startMins + 60;
    return { startMins, endMins };
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressSlotRef.current = null;
    confirmedSlotRef.current = null;
    pointerStartRef.current = null;
    setPressedSlot(null);
    setPressedConfirmed(false);
  };

  const handleTimelinePointerDown = (e) => {
    const slot = getSlotFromPointer(e);
    if (!slot) return;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    longPressSlotRef.current = slot;
    // 즉시 슬롯 표시 (애니메이션 시작)
    setPressedSlot(slot);
    setPressedConfirmed(false);
    longPressTimerRef.current = setTimeout(() => {
      confirmedSlotRef.current = longPressSlotRef.current;
      setPressedConfirmed(true); // 보더 등장
      longPressTimerRef.current = null;
    }, 400);
  };

  const handleTimelinePointerMove = (e) => {
    if (!pointerStartRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 8) {
      cancelLongPress();
    }
  };

  const handleTimelinePointerUp = () => {
    const slot = confirmedSlotRef.current;
    cancelLongPress();
    if (slot) {
      openHomeSheet(minsToTimeStr(slot.startMins), minsToTimeStr(Math.min(slot.endMins, 24 * 60)));
    }
  };

  const layout = computeLayout(layoutEvents);

  // 추가 모드: 이벤트 사이 빈 시간 구간을 하나의 블록으로 계산
  const MIN_GAP_MINS = 30; // 30분 이상의 빈 시간만 표시
  const TIMELINE_END = 24 * 60;
  let emptyGaps = [];
  if (homeAddMode) {
    const intervals = allEvents
      .map(ev => ({ start: toTimelineMins(ev.startH, ev.startM), end: toTimelineMins(ev.endH, ev.endM) }))
      .filter(iv => iv.end > iv.start)
      .sort((a, b) => a.start - b.start);
    const merged = [];
    for (const iv of intervals) {
      if (!merged.length || iv.start >= merged[merged.length - 1].end) {
        merged.push({ ...iv });
      } else {
        merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, iv.end);
      }
    }
    let cursor = 0;
    for (const iv of merged) {
      if (iv.start - cursor >= MIN_GAP_MINS) emptyGaps.push({ startMins: cursor, endMins: iv.start });
      cursor = Math.max(cursor, iv.end);
    }
    if (TIMELINE_END - cursor >= MIN_GAP_MINS) emptyGaps.push({ startMins: cursor, endMins: TIMELINE_END });
  }

  return (
    <>
    <div className="home-view" ref={scrollRef}>
      <div
        className={`timeline-container${homeAddMode ? ' adding-mode' : ''}`}
        onPointerDown={handleTimelinePointerDown}
        onPointerMove={handleTimelinePointerMove}
        onPointerUp={handleTimelinePointerUp}
        onPointerCancel={cancelLongPress}
      >

        {/* 시간 그리드 (25행: AM5 ~ AM5 다음날) */}
        {DISPLAY_HOURS.map((h, idx) => (
          <div key={idx} className="timeline-row">
            <div className="timeline-label-col">
              <span className="timeline-time-label">{hourLabel(h)}</span>
              {idx < 24 && HOUR_EMOJIS[h] && (
                <button className="timeline-hour-emojis" onClick={() => setChallengeOpen(true)}>
                  {HOUR_EMOJIS[h].map((emoji, i) => (
                    <span key={i} className="timeline-hour-emoji">{emoji}</span>
                  ))}
                </button>
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

        {/* 빈 시간 갭 블록 (추가 모드) */}
        {emptyGaps.map((gap, i) => {
          const top = (gap.startMins / 60) * HOUR_HEIGHT;
          const height = ((gap.endMins - gap.startMins) / 60) * HOUR_HEIGHT;
          return (
            <div
              key={`gap-${i}`}
              className="timeline-empty-slot"
              style={getEventStyle(top, height, 0, 1)}
              onPointerDown={e => e.stopPropagation()}
              onClick={e => {
                e.stopPropagation();
                openHomeSheet(minsToTimeStr(gap.startMins), minsToTimeStr(Math.min(gap.endMins, 24 * 60)));
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <line x1="8" y1="2" x2="8" y2="14" stroke="rgba(0,0,0,0.25)" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="2" y1="8" x2="14" y2="8" stroke="rgba(0,0,0,0.25)" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
          );
        })}

        {/* 빈 영역 pressed 효과 */}
        {pressedSlot && (() => {
          const top = (pressedSlot.startMins / 60) * HOUR_HEIGHT;
          const height = ((pressedSlot.endMins - pressedSlot.startMins) / 60) * HOUR_HEIGHT;
          return (
            <div
              className={`timeline-pressed-slot${pressedConfirmed ? ' confirmed' : ''}`}
              style={getEventStyle(top, height, 0, 1)}
            />
          );
        })()}

        {/* 단일 이벤트 카드 */}
        {singles.map(ev => {
          const { col = 0, numCols = 1 } = layout[ev.id] || {};
          const top    = timeToTop(ev.startH, ev.startM);
          const height = Math.max(timeToTop(ev.endH, ev.endM) - top, 30);
          const Icon   = ICON_MAP[ev.type] || Square;

          const canFill = STUDY_TYPES.has(ev.type);
          const fill   = canFill ? getStudyFill(ev) : 0;

          const isNew = ev.id === String(newlyAddedHomeEventId);
          return (
            <div
              key={ev.id}
              className={`timeline-event has-bar${pressedId === ev.id ? ' pressed' : ''}${isNew ? ' newly-added' : ''}`}
              style={getEventStyle(top, height, col, numCols)}
              onPointerDown={() => setPressedId(ev.id)}
              onPointerUp={() => { setPressedId(null); setSelectedEvent(ev); }}
              onPointerLeave={() => setPressedId(null)}
              onPointerCancel={() => setPressedId(null)}
            >
              <div className="study-time-bar">
                <div className="study-time-gauge" style={{ transform: `scaleY(${fill})` }} />
              </div>
              <div className="timeline-event-inner">
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
            </div>
          );
        })}

        {/* 그룹 블록 (0~15분 이내 연속 이벤트 합치기) */}
        {mergedGroups.map(group => {
          const { col = 0, numCols = 1 } = layout[group.id] || {};
          const top    = timeToTop(group.startH, group.startM);
          const height = Math.max(timeToTop(group.endH, group.endM) - top, 30);
          const mergedTitle = `0/${group.events.length} (${group.events.map(e => e.title).join(', ')})`;
          return (
            <div
              key={group.id}
              className={`timeline-event has-bar${pressedId === group.id ? ' pressed' : ''}`}
              style={getEventStyle(top, height, col, numCols)}
              onPointerDown={() => setPressedId(group.id)}
              onPointerUp={() => { setPressedId(null); setSelectedGroup(group); }}
              onPointerLeave={() => setPressedId(null)}
              onPointerCancel={() => setPressedId(null)}
            >
              <div className="study-time-bar" />
              <div className="timeline-event-inner">
                <div className="timeline-event-title-row">
                  <div className="timeline-event-icon">
                    <div className="timeline-event-group-checkbox" />
                  </div>
                  <span className="timeline-event-title">{mergedTitle}</span>
                </div>
                <div className="timeline-event-meta">
                  <span className="timeline-event-time">
                    {formatRange(group.startH, group.startM, group.endH, group.endM)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

      </div>
    </div>

    <HomeEventDetailSheet event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    <HomeGroupDetailSheet group={selectedGroup} onClose={() => setSelectedGroup(null)} />
    <ChallengeSheet visible={challengeOpen} onClose={() => setChallengeOpen(false)} />
    </>
  );
}
