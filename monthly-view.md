# 월뷰 (Monthly View) 정책 문서

> **이 문서를 먼저 읽으세요.**
> 월뷰를 수정하거나 새 기능을 추가할 때, 아래 정책을 반드시 확인하고 준수하세요.
> **기존 정책을 깨야 하는 상황이 생기면 반드시 먼저 물어보세요.**

---

## 파일 위치

| 역할 | 파일 |
|------|------|
| 컴포넌트 | `src/components/Content/MonthlyContent.jsx` |
| 스타일 | `src/styles.css` — `/* ─── Monthly View ─── */` 섹션 |

---

## 1. 그리드 구조

```
.monthly-content
  .monthly-day-labels    요일 헤더 (월~일, flex-shrink: 0)
  .monthly-body          나머지 전체 (flex: 1, 스와이프 애니메이션 대상)
    .monthly-week-row × N  각 주 (flex: 1)
      .monthly-day-cell × 7  각 날짜 (flex: 1)
        .monthly-date-num    날짜 숫자 (flex-shrink: 0)
        .monthly-todos       할일 목록 (flex: 1, 스크롤 발생)
  div[spacerRef]         키패드 오픈 시 스크롤 여지 확보용 빈 div
```

- 주 수는 월에 따라 4~5행 (6행은 마지막 주가 다음 달이면 잘림)
- 요일 인덱스: 0=월, 1=화, 2=수, 3=목, 4=금, 5=토, 6=일
- 주말(5, 6) → `.weekend` 클래스

**⚠️ 정책: `.monthly-body` 하위 구조를 바꾸면 스와이프 애니메이션, 행 높이 고정 로직이 깨집니다.**

---

## 2. 레이아웃 높이 정책

### 핵심 규칙: 모든 flex 컨테이너에 `min-height: 0` 필수

```
.monthly-content     position: absolute; inset: 0; bottom: 96px; overflow: hidden
  .monthly-body      flex: 1; min-height: 0; overflow: hidden
    .monthly-week-row   flex: 1; min-height: 0              ← ⚠️
      .monthly-day-cell flex: 1; min-height: 0; overflow: hidden  ← ⚠️
        .monthly-date-num  flex-shrink: 0
        .monthly-todos     flex: 1; min-height: 0; overflow-y: auto  ← 스크롤 발생
```

### 탭바 여백

`.monthly-content`의 `bottom: 96px` = tabbar-inner(62px) + tabbar-indicator(34px).
탭바 높이가 바뀌면 이 값도 함께 변경해야 합니다.

### 키보드 등장 시 행 높이 고정

```js
// useLayoutEffect (MonthlyContent.jsx)
// weeks.length 변경 시마다 각 .monthly-week-row 높이를 px로 고정
row.style.minHeight = `${rowHeight}px`;
row.style.flexShrink = '0';
// body도 함께 고정: flex:1로 수축해 rows를 clip하는 것 방지
body.style.minHeight = `${rowHeight * rows.length}px`;
body.style.flexShrink = '0';
```

키보드가 올라와 `.monthly-content` 높이가 줄어도 각 행 높이가 줄어들지 않도록 합니다.
**`.monthly-body`도 함께 고정**해야 body가 flex:1로 수축하며 rows를 clip하는 것을 막을 수 있습니다.

**⚠️ 정책: 이 useLayoutEffect를 제거하거나 조건을 바꾸면 키보드 등장 시 콘텐츠가 잘립니다.**
**⚠️ 정책: rows만 고정하고 body를 고정하지 않으면, body가 수축해 rows를 overflow:hidden으로 clip합니다.**

### NumpadPopup 오픈 시 포커스 블록 센터링 + 콘텐츠 스크롤

OS 키보드 대신 커스텀 NumpadPopup을 사용합니다. visualViewport resize가 발생하지 않으므로 `--numpad-h` CSS 변수로 직접 계산합니다.

```css
/* 키패드 열릴 때: .monthly-content 수직 스크롤 허용 */
.keyboard-open .monthly-content {
  overflow-y: auto;
}
```

```js
// editingTodoId 변경 시, --numpad-h 확정 후 포커스 블록을 가시 영역 중앙으로 스크롤
setTimeout(() => {
  const numpadH  = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--numpad-h')) || 0;
  const headerH  = document.querySelector('.header')?.getBoundingClientRect().bottom ?? 0;
  const visibleH = window.innerHeight - numpadH - headerH;

  spacer.style.height = `${visibleH}px`;   // 어떤 행이든 중앙 정렬 + 전체 스크롤 가능
  container.scrollTo({ top: rowMid - visibleH / 2, behavior: 'smooth' });
}, 50);
```

**스페이서 역할**: `spacer.height = visibleH`로 콘텐츠 하단에 여백 추가.
- 마지막 행도 visibleH/2 중앙 정렬 가능 (스크롤 여지 확보)
- 키패드 뒤에 숨은 행을 위로 끌어올릴 수 있는 overflow 생성

**편집 종료 시** spacer를 0으로 리셋하고 scrollTop을 0으로 복귀.

### 오버레이를 통한 콘텐츠 스크롤 전달

`bottom-sheet-overlay`가 콘텐츠 영역 전체를 덮으므로 네이티브 터치 스크롤이 차단됩니다.
오버레이의 `touchmove` 핸들러에서 수동으로 스크롤을 전달합니다.

```js
// BottomSheet.jsx — findScrollTarget
// 1. 터치 위치의 .monthly-todos → 할일 목록 내부 스크롤
// 2. 그 외 영역 → .monthly-content → 행 간 스크롤

// onTouchMove — 스크롤 체이닝
scrollTarget.scrollTop -= dy;
const scrolled = scrollTarget.scrollTop - before;
// 내부 스크롤이 경계에 닿으면 잔여분을 .monthly-content로 전파
if (Math.abs(scrolled) < Math.abs(dy)) {
  outer.scrollTop -= (dy + scrolled);
}
```

**⚠️ 정책: 오버레이는 `touchstart`에 `e.preventDefault()`를 사용해야 iOS blur를 방지합니다. 제거하면 키패드가 닫힙니다.**

---

## 3. 스와이프 (월 전환) 정책

### 애니메이션 대상

- **`.monthly-body` 전체**에 opacity + translateX 적용 (요일 헤더는 고정)

### 방향 판단

```js
// 10px 미만은 방향 결정 보류
// 가로가 세로의 2배 이상일 때만 수평으로 확정
s.direction = adx >= ady * 2 ? 'h' : 'v';
```

**⚠️ 정책: 이 비율(2배)을 낮추면 세로 스크롤 중 오판이 잦아집니다.**

### 임계값

```js
const SWIPE_THRESHOLD = 55;   // 월 전환 실행 최소 거리(px)
const FADE_DISTANCE   = 130;  // 이 거리에서 투명도 최대 도달
```

### 애니메이션 타이밍

```js
// 슬라이드 아웃: 0.12s
// 슬라이드 인:  0.22s
// 드래그 이동비율: dx * 0.18
```

---

## 4. 날짜 블록 클릭 정책

날짜 블록(`.monthly-day-cell`) 클릭 시:
1. `setFocusedDay(ds)` — 해당 날짜 포커스
2. `document.body.classList.add('keyboard-open')` — 리렌더 전에 미리 클래스 추가 (탭바 플래시 방지)
3. `addTodoForDate(ds)` — 해당 날짜에 할일 즉시 추가

**⚠️ 정책: 클릭 → 할일 추가는 즉각적이어야 합니다. 확인 팝업이나 모달을 끼워 넣지 마세요.**
**⚠️ 정책: 월 바깥 날짜(`.out-of-month`)는 클릭 무시.**

---

## 5. 편집 중 자동 스크롤

`editingTodoId` 변경 시 두 가지 스크롤이 50ms delay 후 함께 실행됩니다.

**① 할일 아이템 내부 스크롤** — `.monthly-todos` 안에서 편집 중인 항목이 잘리지 않도록
```js
todosContainer.scrollBy({ top: elRect.bottom - containerRect.bottom + 4, behavior: 'smooth' });
```

**② 행 센터링 스크롤** — `.monthly-content` 전체를 스크롤해 포커스 행을 가시 영역 중앙으로
```js
container.scrollTo({ top: rowMid - visibleH / 2, behavior: 'smooth' });
```

---

## 6. 할일 아이템 표시 정책

### 텍스트
- 1줄 ellipsis: `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`

### 완료 상태
- `done`, `skip`, `cancel` → 취소선 + `var(--label-tertiary)` 색상

### 편집 중 상태
- `.monthly-todo-item.editing`: `pulseBackgroundDay` 애니메이션 (1.4s 무한)

### 새로 추가된 할일 (pulse-in)
- `.monthly-todo-item.pulse-in::before` — 1회성 배경 펄스 애니메이션
- `pulseTodoId` state로 관리, `onAnimationEnd` 후 초기화

---

## 7. 포커스/오늘 날짜 표시 정책

| 상태 | 스타일 |
|------|--------|
| 오늘 날짜 | 회색 배경 원 `rgba(0,0,0,0.13)`, 18×18px |
| 포커스된 날짜 | 검정 배경 원 `#000`, 흰 텍스트, 18×18px |
| 월 바깥 날짜 | `opacity: 0.3` |

- `focusedDay`: 기본값은 오늘. 할일 추가 클릭 시 해당 날짜로 변경. 편집 종료(`editingTodoId === null`) 시 오늘로 복귀.

---

## 8. 상태 관리 정책

- 터치 제스처 상태: `stateRef` (useRef) — React 렌더 루프 밖에서 관리, 60fps 보장
- 월 이동 액션: `actionsRef` — 클로저 stale 방지용

**⚠️ 정책: 스와이프 관련 상태를 `useState`로 바꾸면 렌더마다 이벤트 핸들러가 재등록되어 성능 저하가 발생합니다.**

---

## 변경 시 체크리스트

월뷰를 수정할 때 아래 항목을 확인하세요:

- [ ] 각 날짜 블록 스크롤이 끝까지 되는가? (마지막 할일까지 스크롤 가능)
- [ ] 세로 스크롤과 가로 스와이프가 충돌하지 않는가?
- [ ] 스와이프 중 요일 헤더가 움직이지 않는가?
- [ ] 키보드 열릴 때 탭바가 순간 깜빡이지 않는가?
- [ ] 키보드 열린 상태에서 각 날짜 블록 스크롤이 동작하는가?
- [ ] 편집 중인 할일이 자동으로 스크롤되어 보이는가?
- [ ] 월 바깥 날짜 클릭이 무시되는가?

---

## ⛔ 절대 하지 말 것

1. `.monthly-day-cell`에 `min-height: 0` 제거 → overflow-y: auto 미작동
2. `.monthly-todos`에서 `overflow-y: auto` → `overflow: hidden` 으로 변경 → 스크롤 불가
3. `spacerRef` div 제거 → 마지막 행 키패드 오픈 시 중앙 정렬 불가
4. `bottom-sheet-overlay`의 `touchstart` `e.preventDefault()` 제거 → iOS에서 키패드 닫힘
5. `findScrollTarget`에서 `.monthly-content` 반환 제거 → 키패드 오픈 중 행 간 스크롤 불가
6. `stateRef`를 `useState`로 교체 → 렌더 루프 성능 저하
7. `.monthly-content`에 `bottom: 96px` 제거 → 탭바 뒤에 콘텐츠 가려짐
