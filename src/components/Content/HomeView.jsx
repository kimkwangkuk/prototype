import { useEffect, useRef, useState, useCallback } from 'react';
import { Target, Hamburger, Square, Gamepad2, Zap } from 'lucide-react';

function StudyIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M7 2.99602C6.49326 2.23802 5.32556 1.75 3.98894 1.75C2.86104 1.75 1.77201 2.11629 1.12742 2.69577C0.947878 2.85722 0.875 3.08546 0.875 3.31342L0.875 11.7439C0.875037 11.92 1.09764 12.0279 1.27217 11.9471C2.01214 11.6042 2.97726 11.3997 3.98894 11.3997C5.14196 11.3997 6.25825 11.7557 7 12.25M7 2.99602V12.25M7 2.99602C7.50674 2.23802 8.67444 1.75 10.0111 1.75C11.139 1.75 12.228 2.11629 12.8726 2.69577C13.0521 2.85722 13.125 3.08546 13.125 3.31342V11.7439C13.125 11.92 12.9024 12.0279 12.7278 11.9471C11.9879 11.6042 11.0227 11.3997 10.0111 11.3997C8.85804 11.3997 7.74175 11.7557 7 12.25" stroke={color} strokeWidth="1"/>
    </svg>
  );
}

function TaskDoneIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="12" height="12" rx="3" fill="rgba(0,0,0,0.18)"/>
      <path d="M4 7L6 9.5L10 4.5" stroke="rgba(0,0,0,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SmallTaskIcon({ checked = false }) {
  if (checked) {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="1" y="1" width="10" height="10" rx="2.5" fill="rgba(0,0,0,0.15)"/>
        <path d="M3.5 6L5 7.5L8.5 4" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="1" width="10" height="10" rx="2.5" stroke="rgba(0,0,0,0.45)" strokeWidth="0.75"/>
    </svg>
  );
}
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

const STUDY_TYPES = new Set(['focus', 'study', 'task']);

function getStudyFill(ev) {
  const nowTop   = getNowTop();
  const startTop = timeToTop(ev.startH, ev.startM);
  const endTop   = timeToTop(ev.endH,   ev.endM);
  if (nowTop >= endTop)   return 1;
  if (nowTop <= startTop) return 0;
  return (nowTop - startTop) / (endTop - startTop);
}

// study-group 바 세그먼트: 각 이벤트 구간별 { topPct, heightPct, fill }
function getStudyGroupBarSegments(sg) {
  const blockStartMins = toMin(sg.startH, sg.startM);
  const blockDurMins   = toMin(sg.endH, sg.endM) - blockStartMins;
  if (blockDurMins <= 0) return [];
  const allEvents = [sg.studyEvent, ...sg.tasks];
  return allEvents.map(ev => {
    const evStartMins = toMin(ev.startH, ev.startM);
    const evDurMins   = toMin(ev.endH, ev.endM) - evStartMins;
    return {
      topPct:    (evStartMins - blockStartMins) / blockDurMins * 100,
      heightPct: evDurMins / blockDurMins * 100,
      fill:      getStudyFill(ev),
    };
  });
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
  focus:  Target,
  study:  StudyIcon,
  meal:   Hamburger,
  task:   Square,
  game:   Gamepad2,
  custom: Zap,
};

// ─── 연속 이벤트 그룹핑 (종료~시작 0~15분 이내면 하나의 블록으로 합침) ───
const MAX_MERGE_GAP = 15;

function groupNearbyEvents(events) {
  if (!events.length) return { singles: [], merged: [] };

  // task 타입만 그룹핑 대상, 나머지는 항상 단독
  const taskEvents = events.filter(e => e.type === 'task');
  const nonTaskEvents = events.filter(e => e.type !== 'task');

  const sorted = [...taskEvents].sort(
    (a, b) => toMin(a.startH, a.startM) - toMin(b.startH, b.startM)
  );

  const chains = [];
  if (sorted.length) {
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
  }

  const singles = [...nonTaskEvents];
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

// ─── 공부시간 + 인접 할일 그룹핑 (완료된 할일만 흡수) ───
function groupStudyWithTasks(singles, doneHomeEventIds) {
  const studyEvents = singles.filter(e => e.type === 'study');
  if (!studyEvents.length) return { studyGroups: [], pairedStudyIds: new Set() };

  const taskEvents = singles.filter(e => e.type === 'task');
  if (!taskEvents.length) return { studyGroups: [], pairedStudyIds: new Set() };

  const studyGroups = [];
  const pairedStudyIds = new Set();

  for (const study of studyEvents) {
    const studyEndMins = toMin(study.endH, study.endM);
    const studyStartMins = toMin(study.startH, study.startM);

    // 인접 할일 전체 (완료 여부 무관) — 분모에 사용
    const allNearTasks = taskEvents.filter(task => {
      const taskStartMins = toMin(task.startH, task.startM);
      const taskEndMins = toMin(task.endH, task.endM);
      const taskAfterStudy = taskStartMins >= studyEndMins && taskStartMins - studyEndMins <= MAX_MERGE_GAP;
      const taskBeforeStudy = taskEndMins <= studyStartMins && studyStartMins - taskEndMins <= MAX_MERGE_GAP;
      return taskAfterStudy || taskBeforeStudy;
    });

    // 완료된 할일만 그룹에 흡수
    const doneTasks = allNearTasks.filter(t => doneHomeEventIds.has(String(t.id)));

    if (doneTasks.length > 0) {
      doneTasks.forEach(t => pairedStudyIds.add(t.id));
      pairedStudyIds.add(study.id);

      // 공부시간 + 완료된 할일 전체 범위로 블록 크기 결정
      const allGroupEvents = [study, ...doneTasks];
      const minStart = Math.min(...allGroupEvents.map(e => toMin(e.startH, e.startM)));
      const maxEnd   = Math.max(...allGroupEvents.map(e => toMin(e.endH,   e.endM)));

      studyGroups.push({
        id: `study-group-${study.id}`,
        type: 'study-group',
        studyEvent: study,
        tasks: doneTasks,
        totalNearTasks: allNearTasks.length,
        startH: Math.floor(minStart / 60),
        startM: minStart % 60,
        endH:   Math.floor(maxEnd / 60),
        endM:   maxEnd % 60,
      });
    }
  }

  return { studyGroups, pairedStudyIds };
}

// ─── 집중계획 + 내부 할일 그룹핑 (완전히 포함되는 할일, 완료 여부 무관) ───
function groupFocusWithTasks(events) {
  const focusEvents = events.filter(e => e.type === 'focus');
  const taskEvents  = events.filter(e => e.type === 'task');
  if (!focusEvents.length || !taskEvents.length) return { focusGroups: [], pairedIds: new Set() };

  const focusGroups = [];
  const pairedIds   = new Set();

  for (const focus of focusEvents) {
    const fs = toMin(focus.startH, focus.startM);
    const fe = toMin(focus.endH,   focus.endM);
    const contained = taskEvents.filter(t => {
      const ts = toMin(t.startH, t.startM);
      const te = toMin(t.endH,   t.endM);
      return ts >= fs && te <= fe;
    });
    if (contained.length > 0) {
      pairedIds.add(focus.id);
      contained.forEach(t => pairedIds.add(t.id));
      focusGroups.push({
        id: `focus-group-${focus.id}`,
        type: 'focus-group',
        focusEvent: focus,
        tasks: contained,
        startH: focus.startH, startM: focus.startM,
        endH:   focus.endH,   endM:   focus.endM,
      });
    }
  }
  return { focusGroups, pairedIds };
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

  // 3단계: 연결된 클러스터 내 모든 이벤트의 numCols를 동일하게 전파
  // (A↔B, B↔C가 겹치면 A도 C의 열 수를 반영해야 블록이 겹치지 않음)
  const visited = new Set();
  for (const ev of sorted) {
    if (visited.has(ev.id)) continue;
    const cluster = [];
    const queue = [ev];
    while (queue.length) {
      const curr = queue.shift();
      if (visited.has(curr.id)) continue;
      visited.add(curr.id);
      cluster.push(curr);
      const cs = toMin(curr.startH, curr.startM);
      const ce = toMin(curr.endH,   curr.endM);
      for (const other of sorted) {
        if (!visited.has(other.id)) {
          const os = toMin(other.startH, other.startM);
          const oe = toMin(other.endH,   other.endM);
          if (cs < oe && ce > os) queue.push(other);
        }
      }
    }
    const maxNumCols = Math.max(...cluster.map(e => result[e.id].numCols));
    cluster.forEach(e => { result[e.id].numCols = maxNumCols; });
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
  { id: 'evS1', type: 'study', title: '수학',       startH: 9,  startM: 10, endH: 10, endM: 30 },
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
  const removedSampleIds = useTodoStore(state => state.removedSampleIds);
  const doneHomeEventIds = useTodoStore(state => state.doneHomeEventIds);
  const previewHomeEvent = useTodoStore(state => state.previewHomeEvent);
  const homeAddMode = useTodoStore(state => state.homeAddMode);
  const openHomeSheet = useTodoStore(state => state.openHomeSheet);
  const newlyAddedHomeEventId = useTodoStore(state => state.newlyAddedHomeEventId);
  const clearNewlyAddedHomeEventId = useTodoStore(state => state.clearNewlyAddedHomeEventId);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventEditMode, setSelectedEventEditMode] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [selectedStudyGroup, setSelectedStudyGroup] = useState(null);
  const [selectedFocusGroup, setSelectedFocusGroup] = useState(null);
  const handleEventClose = useCallback(() => { setSelectedEvent(null); setSelectedEventEditMode(false); }, []);
  const handleGroupClose = useCallback(() => setSelectedGroup(null), []);
  const handleStudyGroupClose = useCallback(() => setSelectedStudyGroup(null), []);
  const handleFocusGroupClose = useCallback(() => setSelectedFocusGroup(null), []);
  const handleEditGroupEvent = useCallback((ev) => {
    setSelectedGroup(null);
    setSelectedStudyGroup(null);
    setSelectedFocusGroup(null);
    setSelectedEventEditMode(true);
    setSelectedEvent(ev);
  }, []);
  const [pressedId, setPressedId] = useState(null);
  const [pressedSlot, setPressedSlot] = useState(null);       // 탭 피드백용 하이라이트
  const [dragSlot, setDragSlot] = useState(null);             // 롱탭 드래그 슬롯
  const containerRef = useRef(null);
  const pointerStartRef = useRef(null);
  const pointerMovedRef = useRef(false);
  const longPressTimerRef = useRef(null);
  const longPressConfirmedRef = useRef(false);
  const longPressStartMinsRef = useRef(null);
  const dragSlotRef = useRef(null);
  const tapSlotRef = useRef(null); // pointerDown 에서 계산한 슬롯 저장

  useEffect(() => {
    if (!scrollRef.current) return;
    const top = getNowTop();
    const h = scrollRef.current.clientHeight;
    scrollRef.current.scrollTop = Math.max(0, top - h / 3);
  }, []);

  // 롱탭 확정 후 touchmove 스크롤 방지 (passive:false 필요)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onTouchMove = (e) => {
      if (longPressConfirmedRef.current) e.preventDefault();
    };
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
  }, []);

  // 신규 이벤트: 바텀시트 닫힌 후 해당 이벤트 중앙 스크롤 + 점멸
  useEffect(() => {
    if (!newlyAddedHomeEventId) return;
    const ev = homeEvents.find(e => String(e.id) === String(newlyAddedHomeEventId));
    // 350ms 후 (바텀시트 닫힘): 이벤트 시작 시간을 뷰 중앙으로 스크롤
    const scrollTimer = setTimeout(() => {
      if (!ev || !scrollRef.current) return;
      const eventTop = timeToTop(ev.startH, ev.startM);
      const viewH = scrollRef.current.clientHeight;
      scrollRef.current.scrollTo({ top: Math.max(0, eventTop - viewH / 2), behavior: 'smooth' });
    }, 350);
    // 350(delay) + 1100(animation) + 여유 = 1600ms 후 점멸 클래스 제거
    const clearTimer = setTimeout(clearNewlyAddedHomeEventId, 1600);
    return () => { clearTimeout(scrollTimer); clearTimeout(clearTimer); };
  }, [newlyAddedHomeEventId]);

  const nowY    = getNowTop();
  const nowLabel = getNowLabel();

  // 샘플 + 동적 이벤트 합치기 (삭제된 샘플 제외, 편집 중인 이벤트는 preview로 교체)
  const allEvents = [
    ...SAMPLE_EVENTS.filter(e => !removedSampleIds.has(e.id)),
    ...homeEvents,
  ].map(e => previewHomeEvent && String(e.id) === String(previewHomeEvent.id) ? previewHomeEvent : e);

  // 편집 중에는 그룹핑 해제
  const isEditing = !!previewHomeEvent;
  let filteredSingles, mergedGroups, studyGroups, focusGroups;
  if (isEditing) {
    filteredSingles = allEvents;
    mergedGroups = [];
    studyGroups  = [];
    focusGroups  = [];
  } else {
    // 집중계획 내부 할일 먼저 분리
    const { focusGroups: fg, pairedIds: focusPairedIds } = groupFocusWithTasks(allEvents);
    focusGroups = fg;
    const remaining = allEvents.filter(e => !focusPairedIds.has(e.id));
    const { singles, merged } = groupNearbyEvents(remaining);
    const { studyGroups: sg, pairedStudyIds } = groupStudyWithTasks(singles, doneHomeEventIds);
    filteredSingles = singles.filter(e => !pairedStudyIds.has(e.id));
    mergedGroups = merged;
    studyGroups  = sg;
  }
  // 드래그 슬롯을 가상 이벤트로 변환 → computeLayout에 포함해 실시간 레이아웃 반영
  let dragVirtualEvent = null;
  if (dragSlot) {
    const sActual = (dragSlot.startMins + START_HOUR * 60) % (24 * 60);
    const eCapped  = Math.min(dragSlot.endMins, 24 * 60 - 1);
    const eActual  = (eCapped + START_HOUR * 60) % (24 * 60);
    if (eActual > sActual) {
      dragVirtualEvent = {
        id: 'drag-virtual',
        type: 'drag',
        startH: Math.floor(sActual / 60), startM: sActual % 60,
        endH:   Math.floor(eActual / 60), endM:   eActual % 60,
      };
    }
  }

  const layoutEvents = [
    ...filteredSingles, ...mergedGroups, ...studyGroups, ...focusGroups,
    ...(dragVirtualEvent ? [dragVirtualEvent] : []),
  ];

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

  // clientY → 타임라인 분(0=AM5 기준)
  const getTimelineMins = (clientY) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const clickY = clientY - rect.top;
    const rawMins = (clickY / HOUR_HEIGHT) * 60;
    return Math.max(0, Math.min(Math.round(rawMins / 10) * 10, 24 * 60));
  };

  const cancelAll = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressConfirmedRef.current = false;
    longPressStartMinsRef.current = null;
    dragSlotRef.current = null;
    tapSlotRef.current = null;
    pointerStartRef.current = null;
    setDragSlot(null);
    setPressedSlot(null);
  };

  const handleTimelinePointerDown = (e) => {
    const slot = getSlotFromPointer(e);
    if (!slot) return;

    // 포인터 캡처: 롱탭 드래그 중 포인터가 벗어나도 이벤트 수신
    e.currentTarget.setPointerCapture(e.pointerId);

    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    pointerMovedRef.current = false;
    tapSlotRef.current = slot;
    setPressedSlot(slot); // 탭 피드백 하이라이트

    longPressStartMinsRef.current = slot.startMins;
    longPressTimerRef.current = setTimeout(() => {
      if (pointerMovedRef.current) return;
      longPressConfirmedRef.current = true;
      const endMins = Math.min(slot.startMins + 60, 24 * 60);
      const dragSlotVal = { startMins: slot.startMins, endMins };
      dragSlotRef.current = dragSlotVal;
      setDragSlot(dragSlotVal);
      setPressedSlot(null); // 드래그 슬롯으로 교체
      longPressTimerRef.current = null;
    }, 400);
  };

  const handleTimelinePointerMove = (e) => {
    if (!pointerStartRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 8) {
      pointerMovedRef.current = true;
      if (!longPressConfirmedRef.current) {
        cancelAll();
        return;
      }
    }
    if (longPressConfirmedRef.current && longPressStartMinsRef.current !== null) {
      const currentMins = getTimelineMins(e.clientY);
      const newEndMins = Math.max(longPressStartMinsRef.current + 10, currentMins);
      const slot = { startMins: longPressStartMinsRef.current, endMins: newEndMins };
      dragSlotRef.current = slot;
      setDragSlot(slot);
    }
  };

  const handleTimelinePointerUp = (e) => {
    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;

    if (longPressConfirmedRef.current) {
      const slot = dragSlotRef.current;
      cancelAll();
      if (slot) {
        openHomeSheet(minsToTimeStr(slot.startMins), minsToTimeStr(Math.min(slot.endMins, 24 * 60)));
      }
      return;
    }

    const tapped = tapSlotRef.current;
    cancelAll();
    if (tapped) {
      openHomeSheet(minsToTimeStr(tapped.startMins), minsToTimeStr(Math.min(tapped.endMins, 24 * 60)));
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
        ref={containerRef}
        className={`timeline-container${homeAddMode ? ' adding-mode' : ''}`}
        onPointerDown={handleTimelinePointerDown}
        onPointerMove={handleTimelinePointerMove}
        onPointerUp={handleTimelinePointerUp}
        style={{ touchAction: 'pan-y' }}
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

        {/* 탭 피드백 하이라이트 */}
        {pressedSlot && (() => {
          const top = (pressedSlot.startMins / 60) * HOUR_HEIGHT;
          const height = Math.max(((pressedSlot.endMins - pressedSlot.startMins) / 60) * HOUR_HEIGHT, 10);
          return (
            <div
              className="timeline-pressed-slot"
              style={getEventStyle(top, height, 0, 1)}
            />
          );
        })()}

        {/* 롱탭 드래그 슬롯 */}
        {dragSlot && (() => {
          const top = (dragSlot.startMins / 60) * HOUR_HEIGHT;
          const height = Math.max(((dragSlot.endMins - dragSlot.startMins) / 60) * HOUR_HEIGHT, 10);
          const { col = 0, numCols = 1 } = layout['drag-virtual'] || {};
          return (
            <div
              className="timeline-drag-slot"
              style={getEventStyle(top, height, col, numCols)}
            >
              <span className="timeline-drag-slot-time">
                {minsToTimeStr(dragSlot.startMins)} ~ {minsToTimeStr(Math.min(dragSlot.endMins, 24 * 60))}
              </span>
            </div>
          );
        })()}

        {/* 단일 이벤트 카드 */}
        {filteredSingles.map(ev => {
          const { col = 0, numCols = 1 } = layout[ev.id] || {};
          const top    = timeToTop(ev.startH, ev.startM);
          const height = Math.max(timeToTop(ev.endH, ev.endM) - top, 30);
          const isDoneTask = ev.type === 'task' && doneHomeEventIds.has(String(ev.id));
          const Icon = isDoneTask ? TaskDoneIcon : (ICON_MAP[ev.type] || Square);

          const canFill = STUDY_TYPES.has(ev.type);
          const fill   = canFill ? getStudyFill(ev) : 0;

          const isNew = String(ev.id) === String(newlyAddedHomeEventId);
          const isEditing = previewHomeEvent && String(ev.id) === String(previewHomeEvent.id);
          return (
            <div
              key={ev.id}
              className={`timeline-event has-bar${pressedId === ev.id ? ' pressed' : ''}${isNew ? ' newly-added' : ''}${isEditing ? ' editing-preview' : ''}`}
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
          const doneCount = group.events.filter(e => doneHomeEventIds.has(String(e.id))).length;
          const allDone = doneCount === group.events.length;
          const mergedTitle = `${doneCount}/${group.events.length} (${group.events.map(e => e.title).join(', ')})`;
          const isGroupNew = newlyAddedHomeEventId != null &&
            group.events.some(e => String(e.id) === String(newlyAddedHomeEventId));
          return (
            <div
              key={group.id}
              className={`timeline-event has-bar${pressedId === group.id ? ' pressed' : ''}${isGroupNew ? ' newly-added' : ''}`}
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
                  <span className={`timeline-event-title${allDone ? ' done' : ''}`}>{mergedTitle}</span>
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

        {/* 공부시간 + 할일 대표 블록 */}
        {studyGroups.map(sg => {
          const { col = 0, numCols = 1 } = layout[sg.id] || {};
          const top      = timeToTop(sg.startH, sg.startM);
          const height   = Math.max(timeToTop(sg.endH, sg.endM) - top, 30);
          const segments = getStudyGroupBarSegments(sg);
          const allDone = sg.tasks.length === sg.totalNearTasks && sg.totalNearTasks > 0;
          const isNew = String(sg.studyEvent.id) === String(newlyAddedHomeEventId) ||
            sg.tasks.some(t => String(t.id) === String(newlyAddedHomeEventId));
          return (
            <div
              key={sg.id}
              className={`timeline-event has-bar${pressedId === sg.id ? ' pressed' : ''}${isNew ? ' newly-added' : ''}`}
              style={getEventStyle(top, height, col, numCols)}
              onPointerDown={() => setPressedId(sg.id)}
              onPointerUp={() => { setPressedId(null); setSelectedStudyGroup(sg); }}
              onPointerLeave={() => setPressedId(null)}
              onPointerCancel={() => setPressedId(null)}
            >
              <div className="study-time-bar study-time-bar--group">
                {segments.map((seg, i) => (
                  <div
                    key={i}
                    className="study-time-segment"
                    style={{ top: `${seg.topPct}%`, height: `${seg.heightPct}%` }}
                  >
                    <div className="study-time-gauge" style={{ transform: `scaleY(${seg.fill})` }} />
                  </div>
                ))}
              </div>
              <div className="timeline-event-inner">
                <div className="timeline-event-title-row">
                  <div className="timeline-event-icon">
                    <StudyIcon size={14} color="rgba(0,0,0,0.75)" />
                  </div>
                  <span className="timeline-event-title">{sg.studyEvent.title}</span>
                </div>
                <div className="timeline-event-meta">
                  <span className="timeline-event-time">
                    {formatRange(sg.startH, sg.startM, sg.endH, sg.endM)}
                  </span>
                  <div className="timeline-event-count-row">
                    <SmallTaskIcon checked={allDone} />
                    <span className={`timeline-event-time${allDone ? ' count-done' : ''}`}>
                      {sg.tasks.length}/{sg.totalNearTasks}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* 집중계획 + 할일 그룹 블록 */}
        {focusGroups.map(fg => {
          const { col = 0, numCols = 1 } = layout[fg.id] || {};
          const top    = timeToTop(fg.startH, fg.startM);
          const height = Math.max(timeToTop(fg.endH, fg.endM) - top, 30);
          const fill   = getStudyFill(fg.focusEvent);
          const doneCount = fg.tasks.filter(t => doneHomeEventIds.has(String(t.id))).length;
          const allDone = doneCount === fg.tasks.length;
          const isNew = String(fg.focusEvent.id) === String(newlyAddedHomeEventId) ||
            fg.tasks.some(t => String(t.id) === String(newlyAddedHomeEventId));
          return (
            <div
              key={fg.id}
              className={`timeline-event has-bar${pressedId === fg.id ? ' pressed' : ''}${isNew ? ' newly-added' : ''}`}
              style={getEventStyle(top, height, col, numCols)}
              onPointerDown={() => setPressedId(fg.id)}
              onPointerUp={() => { setPressedId(null); setSelectedFocusGroup(fg); }}
              onPointerLeave={() => setPressedId(null)}
              onPointerCancel={() => setPressedId(null)}
            >
              <div className="study-time-bar">
                <div className="study-time-gauge" style={{ transform: `scaleY(${fill})` }} />
              </div>
              <div className="timeline-event-inner">
                <div className="timeline-event-title-row">
                  <div className="timeline-event-icon">
                    <Target size={14} strokeWidth={1.8} color="rgba(0,0,0,0.75)" />
                  </div>
                  <span className={`timeline-event-title${allDone ? ' done' : ''}`}>{fg.focusEvent.title}</span>
                </div>
                <div className="timeline-event-meta">
                  <span className="timeline-event-time">
                    {formatRange(fg.startH, fg.startM, fg.endH, fg.endM)}
                  </span>
                  <div className="timeline-event-count-row">
                    <SmallTaskIcon checked={allDone} />
                    <span className={`timeline-event-time${allDone ? ' count-done' : ''}`}>
                      {doneCount}/{fg.tasks.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

      </div>
    </div>

    <HomeEventDetailSheet event={selectedEvent} openInEditMode={selectedEventEditMode} onClose={handleEventClose} />
    <HomeGroupDetailSheet group={selectedGroup} onClose={handleGroupClose} onEditEvent={handleEditGroupEvent} />
    <HomeGroupDetailSheet
      group={selectedStudyGroup ? {
        ...selectedStudyGroup,
        events: [
          { ...selectedStudyGroup.studyEvent, isAnchor: true },
          ...selectedStudyGroup.tasks,
        ]
      } : null}
      onClose={handleStudyGroupClose}
      onEditEvent={handleEditGroupEvent}
    />
    <HomeGroupDetailSheet
      group={selectedFocusGroup ? {
        ...selectedFocusGroup,
        events: [
          { ...selectedFocusGroup.focusEvent, isAnchor: true },
          ...selectedFocusGroup.tasks,
        ]
      } : null}
      onClose={handleFocusGroupClose}
      onEditEvent={handleEditGroupEvent}
    />
    <ChallengeSheet visible={challengeOpen} onClose={() => setChallengeOpen(false)} />
    </>
  );
}
