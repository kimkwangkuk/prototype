# 주뷰 (Weekly View) 정책 문서

> **이 문서를 먼저 읽으세요.**
> 주뷰를 수정하거나 새 기능을 추가할 때, 아래 정책을 반드시 확인하고 준수하세요.
> **기존 정책을 깨야 하는 상황이 생기면 반드시 먼저 물어보세요.**

---

## 파일 위치

| 역할 | 파일 |
|------|------|
| 컴포넌트 | `src/components/Content/WeeklyContent.jsx` |
| 스타일 | `src/styles.css` — `/* ─── Weekly View ─── */` 섹션 |

---

## 1. 그리드 구조

```
PAIRS = [['nav', 0], [1, 2], [3, 4], [5, 6]]
```

- 총 **4개 행(week-row)**, 각 행은 **2칸**
- 1행: 미니 캘린더(nav) + 일요일(인덱스 0)
- 2~4행: 월~토 (각 2개씩 쌍)
- 요일 인덱스 0=일, 1=월, 2=화, 3=수, 4=목, 5=금, 6=토

**⚠️ 정책: 행/열 구조(PAIRS)를 바꾸면 스와이프 애니메이션, 높이 고정 로직 등 연관 코드가 전부 깨집니다. 변경 전 반드시 확인하세요.**

---

## 2. 레이아웃 높이 정책

### 핵심 규칙: 모든 flex 컨테이너에 `min-height: 0` 필수

flex 컨테이너가 스크롤 가능한 자식을 가지려면 `min-height: 0`이 없으면 overflow: auto가 동작하지 않음.

```
.weekly-content      position: absolute; inset: 0; bottom: 96px
  .week-row          flex: 1; min-height: 0; overflow: hidden
    .week-day-col    flex: 1 1 0; min-height: 0; overflow: hidden   ← ⚠️
      .week-cell-content   flex: 1; min-height: 0                   ← ⚠️
        .week-day-col-header  flex-shrink: 0
        .week-day-col-todos   flex: 1; min-height: 0; overflow-y: auto  ← 스크롤 발생
```

**⚠️ 정책: `week-day-col`에 `min-height: 0` 대신 `min-height: 50vw` 같은 고정값을 넣으면 스크롤 컨테이너가 가시 영역보다 커져서 마지막 할일이 스크롤로 도달 불가능해집니다. 절대 넣지 마세요.**
(실제 발생한 버그. 2026-03-07 수정)

### 탭바 여백

`.weekly-content`의 `bottom: 96px` = tabbar-inner(62px) + tabbar-indicator(34px).
탭바 높이가 바뀌면 이 값도 함께 변경해야 합니다.

### 키보드 등장 시 행 높이 고정

```js
// useLayoutEffect (WeeklyContent.jsx)
// 초기 렌더 시 각 .week-row의 높이를 px로 고정
row.style.minHeight = `${rowHeight}px`;
row.style.flexShrink = '0';
```

키보드가 올라와 `.weekly-content` 높이가 줄어도 각 행 높이가 줄어들지 않도록 합니다.
덕분에 각 날짜 블록의 스크롤 컨테이너 높이가 유지되어 스크롤이 계속 동작합니다.

**⚠️ 정책: 이 useLayoutEffect를 제거하거나 조건을 바꾸면 키보드 등장 시 행이 찌그러집니다.**

### 키보드 등장 시 포커스된 블럭 스크롤

키보드가 열리면 `.weekly-content`가 키보드 위까지 줄어들고, 포커스된 블럭이 보이도록 자동 스크롤됩니다.

```css
/* 키보드 열릴 때: tabbar가 숨겨지므로 96px 여백 제거 + 수직 스크롤 허용 */
/* ⚠️ bottom: var(--vv-offset-bottom) 금지 — app-layout이 padding-bottom으로 이미 수축 처리하므로 이중 수축 발생 */
.keyboard-open .weekly-content {
  bottom: 0;
  overflow-y: auto;
}
```

```js
// editingTodoId 변경 시, 키보드 애니메이션 완료(400ms) 후 포커스된 .week-row를 스크롤
setTimeout(() => {
  container.scrollTo({ top: rowBottom - container.clientHeight, behavior: 'smooth' });
}, 400);
```

- `app-layout`의 `padding-bottom: var(--vv-offset-bottom)`이 키보드 높이를 이미 흡수 → `app-body`가 키보드 위까지 자동 수축
- `bottom: 0`은 tabbar 96px 여백을 없애는 용도 (tabbar는 keyboard-open 시 display: none)
- 400ms delay: iOS 키보드 애니메이션 완료 후 clientHeight가 확정된 시점에 스크롤

---

## 3. 스와이프 (주 전환) 정책

### 방향 판단

```js
// 10px 미만은 방향 결정 보류
// 가로가 세로의 2배 이상일 때만 수평으로 확정
s.direction = adx >= ady * 2 ? 'h' : 'v';
```

**⚠️ 정책: 이 비율(2배)을 낮추면 세로 스크롤 중 오판이 잦아집니다.**

### 임계값

```js
const SWIPE_THRESHOLD = 55;   // 주 전환 실행 최소 거리(px)
const FADE_DISTANCE   = 120;  // 이 거리에서 투명도 최대 도달
```

### 애니메이션 타겟

- **`.week-cell-content`만** opacity + translateX 애니메이션 적용
- **`.week-day-col`(외부 블록)은 고정** — 테두리·배경이 깜빡이지 않도록

```js
// 슬라이드 아웃: 0.12s
// 슬라이드 인:  0.22s
// 드래그 이동비율: dx * 0.18 (실제 손가락 이동량의 18%만 이동)
```

**⚠️ 정책: 애니메이션 대상을 `.week-day-col` 전체로 바꾸면 테두리가 함께 페이드되어 레이아웃이 흔들려 보입니다.**

### touch-action

```css
.weekly-content { touch-action: pan-y; }
```

```js
// touchmove: passive: true
// → 브라우저가 세로 스크롤을 즉시 처리, JS는 가로 판별만 담당
```

**⚠️ 정책: `touch-action: none`이나 `passive: false`로 바꾸면 세로 스크롤이 버벅입니다.**

### 클릭 차단

```js
if (stateRef.current.animating) return;   // 애니메이션 중 클릭 무시
if (stateRef.current.didScroll) return;   // 세로 스크롤 후 클릭 무시
```

**⚠️ 정책: 이 두 가드를 제거하면 스와이프·스크롤 후 의도치 않은 할일 추가가 발생합니다.**

---

## 4. 날짜 블록 클릭 정책

날짜 블록(`.week-day-col`) 클릭 시:
1. `selectDate(dateStr)` — 해당 날짜로 선택
2. `addTodo(subjects[0].id)` — 첫 번째 과목으로 할일 즉시 추가
3. `document.body.classList.add('keyboard-open')` — 리렌더 전에 미리 클래스 추가 (탭바 플래시 방지)

**⚠️ 정책: 클릭 → 할일 추가는 즉각적이어야 합니다. 확인 팝업이나 모달을 끼워 넣지 마세요.**

---

## 5. 편집 중 자동 스크롤

```js
// editingTodoId 변경 시, 편집 중인 할일이 스크롤 영역 밖으로 나가면 자동 스크롤
todosContainer.scrollBy({ top: elRect.bottom - containerRect.bottom + 4, behavior: 'smooth' });
```

- 50ms delay 후 실행 (DOM 반영 대기)
- 스크롤 기준: `.week-day-col-todos` (날짜별 독립 스크롤 컨테이너)

---

## 6. 미니 캘린더 (NavCell) 정책

- 위치: 1행 왼쪽, `flex: 0 0 50%` (행의 절반 고정)
- 역할: 현재 월의 주 목록 표시 + 주 선택 네비게이션
- 현재 주 표시: `.week-nav-indicator` (절대 위치, `top`/`height`를 % 단위로 애니메이션)
- 클릭 시: 해당 주로 `baseDate` 변경

**⚠️ 정책: NavCell은 스와이프 페이드 애니메이션에서 제외됩니다.** 캘린더 배경/테두리가 스와이프마다 깜빡이면 안 됩니다.

---

## 7. 할일 아이템 표시 정책

### 텍스트
- 1줄 ellipsis: `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`
- **⚠️ 정책: 주간뷰에서 텍스트를 2줄로 늘리면 한 화면에 보이는 할일 수가 급감합니다. 변경 시 반드시 확인하세요.**

### 체크박스 크기
- 주간뷰 전용 축소: 16px (일반뷰보다 작게)
- `.week-todo-check .todo-checkbox { width: 16px; height: 16px; }`

### 완료 상태
- `done`, `skip`, `cancel` → 취소선 + `var(--label-quaternary)` 색상

### 편집 중 상태
- `.week-todo-item.editing`: 배경 강조 + `pulseBackgroundDay` 애니메이션 (1.4s 무한)
- 너비: `calc(100% + 8px)`, `margin-left: -4px` (좌우로 4px씩 삐져나와 강조)

### 새로 추가된 할일 (pulse-in)
- `.week-todo-item.pulse-in::before` — 1회성 배경 펄스 애니메이션
- `pulseTodoId` state로 관리, `onAnimationEnd` 후 초기화

---

## 8. 포커스/오늘 날짜 표시 정책

| 상태 | 스타일 |
|------|--------|
| 오늘 날짜 | 회색 배경 원 `rgba(0,0,0,0.13)`, 24×24px |
| 포커스된 날짜 | 검정 배경 원 `#000`, 흰 텍스트, 24×24px |

- `focusedDay`: 기본값은 오늘. 할일 추가 클릭 시 해당 날짜로 변경. 편집 종료(`editingTodoId === null`) 시 오늘로 복귀.

---

## 9. 상태 관리 정책

- 터치 제스처 상태: `stateRef` (useRef) — React 렌더 루프 밖에서 관리, 60fps 보장
- 주간 이동 액션: `actionsRef` — 클로저 stale 방지용

**⚠️ 정책: 스와이프 관련 상태를 `useState`로 바꾸면 렌더마다 이벤트 핸들러가 재등록되어 성능 저하가 발생합니다.**

---

## 변경 시 체크리스트

주뷰를 수정할 때 아래 항목을 확인하세요:

- [ ] 각 날짜 블록 스크롤이 끝까지 되는가? (마지막 할일까지 스크롤 가능)
- [ ] 세로 스크롤과 가로 스와이프가 충돌하지 않는가?
- [ ] 스와이프 중 배경/테두리가 깜빡이지 않는가?
- [ ] 키보드 열릴 때 탭바가 순간 깜빡이지 않는가?
- [ ] 키보드 열린 상태에서 각 날짜 블록 스크롤이 동작하는가?
- [ ] 편집 중인 할일이 자동으로 스크롤되어 보이는가?

---

## ⛔ 절대 하지 말 것

1. `.week-day-col`에 `min-height: 50vw` 같은 vw/vh 고정값 추가 → 스크롤 버그 재발
2. `.week-cell-content` 또는 `week-day-col-todos`에서 `min-height: 0` 제거 → overflow-y: auto 미작동
3. 스와이프 핸들러를 `passive: false`로 변경 → 세로 스크롤 버벅임
4. `.week-day-col` 전체에 opacity/transform 애니메이션 → 테두리 깜빡임
5. `stateRef`를 `useState`로 교체 → 렌더 루프 성능 저하
