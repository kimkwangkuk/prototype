import { useEffect } from 'react';
import './styles.css';
import Header from './components/Header/Header';
import Content from './components/Content/Content';
import CalendarContent from './components/Content/CalendarContent';
import BottomSheet from './components/BottomSheet/BottomSheet';
import Tabbar from './components/Tabbar/Tabbar';
import useTodoStore from './store/useTodoStore';
import { formatDate, getWeekDates } from './utils/dateUtils';
import { formatTime, formatDuration } from './utils/timeUtils';

export default function App() {
  const todos = useTodoStore(state => state.todos);
  const nextId = useTodoStore(state => state.nextId);
  const currentTab = useTodoStore(state => state.currentTab);

  // 샘플 데이터 로드 (최초 1회)
  useEffect(() => {
    if (Object.keys(todos).length === 0) {
      const today = new Date();
      const weekDates = getWeekDates(today);
      const fmt = (d) => formatDate(d);

      let id = nextId;

      // 요일 인덱스: 0=월, 1=화, 2=수, 3=목, 4=금, 5=토, 6=일
      const weeklyData = [
        // 월요일
        [
          { subjectId: 'math', text: '수학 공식 암기', status: 'done' },
          { subjectId: 'english', text: '영어 회화 참여', status: 'done' },
          { subjectId: 'science', text: '과학 개념 정리', status: 'progress' },
          { subjectId: 'history', text: '역사 연표 외우기', status: 'empty' },
        ],
        // 화요일
        [
          { subjectId: 'math', text: '수학 개념 다시 보기', status: 'empty' },
          { subjectId: 'english', text: '단어 암기 30분', status: 'progress' },
          { subjectId: 'history', text: '문답 완벽하게 정리', status: 'empty' },
          { subjectId: 'math', text: '문제집 풀기', status: 'empty' },
          { subjectId: 'english', text: '영어 원서 정독하기', status: 'empty' },
        ],
        // 수요일
        [
          { subjectId: 'science', text: '배경지식 넓히기', status: 'empty' },
          { subjectId: 'math', text: '핵심 개념 암기', status: 'empty' },
          { subjectId: 'english', text: '영자 신문 읽기', status: 'empty' },
          { subjectId: 'english', text: '단어 암기 30분', status: 'empty' },
          { subjectId: 'science', text: '영어 팟캐스트 듣기', status: 'empty' },
        ],
        // 목요일
        [
          { subjectId: 'math', text: '수학 취약점 보완하기', status: 'empty' },
          { subjectId: 'english', text: '수학 속독 분석하기', status: 'empty' },
          { subjectId: 'history', text: '과학 지도 받기', status: 'empty' },
          { subjectId: 'english', text: '국어 필기 노트 만들기', status: 'empty' },
        ],
        // 금요일
        [
          { subjectId: 'math', text: '수학 개념 다시 보기', status: 'empty' },
          { subjectId: 'english', text: '영어 어휘 퀴즈 보기', status: 'empty' },
          { subjectId: 'science', text: '수모고사 오답 분석', status: 'empty' },
          { subjectId: 'history', text: '국어 중요 내용 요약', status: 'empty' },
        ],
        // 토요일
        [
          { subjectId: 'math', text: '실전 모의고사 풀기', status: 'empty' },
          { subjectId: 'history', text: '오답노트 완벽 분석', status: 'empty' },
          { subjectId: 'english', text: '고전 시가 분석하기', status: 'empty' },
        ],
        // 일요일
        [
          { subjectId: 'english', text: '영어 문법 총정리', status: 'empty' },
          { subjectId: 'math', text: '수학 킬러 문제 풀기', status: 'empty' },
          { subjectId: 'history', text: '국어 실전 모의고사', status: 'empty' },
        ],
      ];

      const allTodos = {};
      weekDates.forEach((date, idx) => {
        const ds = fmt(date);
        const items = weeklyData[idx] || [];
        allTodos[ds] = items.map(item => ({
          id: id++,
          subjectId: item.subjectId,
          text: item.text,
          status: item.status,
          time: null,
          duration: null,
          overdue: false,
        }));
      });

      useTodoStore.setState({ todos: allTodos, nextId: id });
    }
  }, []);

  return (
    <>
      <Header />
      {currentTab === 'calendar' ? <CalendarContent /> : <Content />}
      <Tabbar />
      {currentTab !== 'calendar' && <BottomSheet />}
    </>
  );
}
