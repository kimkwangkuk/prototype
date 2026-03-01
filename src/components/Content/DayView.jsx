import { useRef, useEffect } from 'react';
import useTodoStore from '../../store/useTodoStore';
import { subjects } from '../../config';
import SubjectSection from './SubjectSection';

const SWIPE_THRESHOLD = 50;
const FADE_DISTANCE   = 150;

export default function DayView() {
  const todos        = useTodoStore(state => state.todos);
  const selectedDate = useTodoStore(state => state.selectedDate);
  const nextDay      = useTodoStore(state => state.nextDay);
  const prevDay      = useTodoStore(state => state.prevDay);

  const wrapRef   = useRef(null);
  const stateRef  = useRef({
    startX    : 0,
    startY    : 0,
    direction : null,   // null | 'h' | 'v'
    animating : false,
  });

  // Zustand 액션은 안정적이지만 최신 참조 보장
  const actionsRef = useRef({ nextDay, prevDay });
  useEffect(() => { actionsRef.current = { nextDay, prevDay }; });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const s = stateRef.current;

    function applyStyle(opacity, tx, transition = 'none') {
      el.style.transition = transition;
      el.style.opacity    = String(opacity);
      el.style.transform  = `translateX(${tx}px)`;
    }

    function onStart(e) {
      s.direction = null;               // 항상 리셋
      if (s.animating) return;
      s.startX = e.touches[0].clientX;
      s.startY = e.touches[0].clientY;
      el.style.transition = 'none';    // 진행 중인 transition 즉시 중단
    }

    function onMove(e) {
      if (s.animating) return;

      const dx  = e.touches[0].clientX - s.startX;
      const dy  = e.touches[0].clientY - s.startY;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);

      // 방향 미확정 구간: 둘 다 10px 미만이면 대기
      if (s.direction === null) {
        if (adx < 10 && ady < 10) return;

        // 수평 확정: x가 y의 2배 이상
        if (adx >= ady * 2) {
          s.direction = 'h';
        } else {
          s.direction = 'v';
          return;
        }
      }

      if (s.direction !== 'h') return;

      // 수평 확정 이후 → 브라우저 스크롤 차단 + 페이드 적용
      e.preventDefault();
      const progress = Math.min(adx / FADE_DISTANCE, 1);
      el.style.transition = 'none';
      el.style.opacity    = String(1 - progress * 0.85);
      el.style.transform  = `translateX(${dx * 0.12}px)`;
    }

    function onEnd(e) {
      if (s.animating) return;
      if (s.direction !== 'h') return;   // 수직·탭: 스타일 이미 정상

      const dx     = e.changedTouches[0].clientX - s.startX;
      const goLeft = dx < 0;

      if (Math.abs(dx) < SWIPE_THRESHOLD) {
        // 스냅백
        applyStyle(1, 0, 'opacity 0.2s ease, transform 0.2s ease');
        return;
      }

      // ── 날짜 전환 애니메이션 ────────────────────────
      s.animating = true;

      // 1) 페이드 아웃
      applyStyle(0, goLeft ? -24 : 24, 'opacity 0.14s ease, transform 0.14s ease');

      setTimeout(() => {
        // 2) 날짜 변경 (React 리렌더)
        goLeft ? actionsRef.current.nextDay() : actionsRef.current.prevDay();

        // 3) 반대편 시작 위치 (transition 없이)
        applyStyle(0, goLeft ? 28 : -28, 'none');

        // 4) 페이드 인 (두 프레임 뒤 적용 → 리렌더 이후 보장)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            applyStyle(1, 0, 'opacity 0.22s ease, transform 0.22s ease');

            setTimeout(() => {
              el.style.transition = '';
              el.style.opacity    = '';
              el.style.transform  = '';
              s.animating = false;
            }, 240);
          });
        });
      }, 150);
    }

    function onCancel() {
      s.direction = null;
      if (!s.animating) applyStyle(1, 0, 'opacity 0.15s ease, transform 0.15s ease');
    }

    el.addEventListener('touchstart',  onStart,  { passive: true  });
    el.addEventListener('touchmove',   onMove,   { passive: false }); // ← preventDefault 위해 필수
    el.addEventListener('touchend',    onEnd,    { passive: true  });
    el.addEventListener('touchcancel', onCancel, { passive: true  });

    return () => {
      el.removeEventListener('touchstart',  onStart);
      el.removeEventListener('touchmove',   onMove);
      el.removeEventListener('touchend',    onEnd);
      el.removeEventListener('touchcancel', onCancel);
    };
  }, []); // mount/unmount 시에만 (day view 컴포넌트이므로 안전)

  const list    = todos[selectedDate] || [];
  const grouped = subjects.reduce((acc, subj) => {
    acc[subj.id] = list.filter(t => t.subjectId === subj.id);
    return acc;
  }, {});

  return (
    <div
      ref={wrapRef}
      style={{ position: 'relative', height: '100%', willChange: 'opacity, transform', touchAction: 'pan-y' }}
    >
      <div className="content" id="content">
        {subjects.map(subj => (
          <SubjectSection
            key={subj.id}
            subject={subj}
            todos={grouped[subj.id]}
          />
        ))}
      </div>
    </div>
  );
}
