import useTodoStore from '../../store/useTodoStore';

export default function StatusSection() {
  const data = useTodoStore(state => state.bottomSheetData);
  const updateBottomSheetField = useTodoStore(state => state.updateBottomSheetField);
  const saveBottomSheet = useTodoStore(state => state.saveBottomSheet);

  const statuses = [
    { id: 'empty', label: '미완료', icon: 'empty' },
    { id: 'progress', label: '진행중', icon: 'progress' },
    { id: 'done', label: '완료', icon: 'done' },
    { id: 'skip', label: '건너뜀', icon: 'skip' },
    { id: 'cancel', label: '취소', icon: 'cancel' },
  ];

  const handleStatusClick = (statusId) => {
    updateBottomSheetField('status', statusId);
    // status-only 모드에서는 즉시 저장
    setTimeout(() => saveBottomSheet(), 100);
  };

  return (
    <div className="bottom-sheet-section">
      <div className="section-label">Status</div>
      <div className="status-list">
        {statuses.map(s => (
          <button
            key={s.id}
            className={`status-chip${data.status === s.id ? ' active' : ''}`}
            onClick={() => handleStatusClick(s.id)}
          >
            <div className="status-icon">
              {s.icon === 'empty' && <div className="cb-empty"></div>}
              {s.icon === 'progress' && (
                <div className="cb-progress">
                  <div className="cb-progress-fill" style={{ background: '#5570f7' }}></div>
                </div>
              )}
              {s.icon === 'done' && <div className="cb-done" style={{ borderColor: '#5570f7' }}></div>}
              {s.icon === 'skip' && (
                <div className="cb-skip">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#5570f7" strokeWidth="1.8">
                    <polygon points="12,4 22,20 2,20"/>
                  </svg>
                </div>
              )}
              {s.icon === 'cancel' && (
                <div className="cb-cancel">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#5570f7" strokeWidth="2" strokeLinecap="round">
                    <line x1="5" y1="5" x2="19" y2="19"/>
                    <line x1="19" y1="5" x2="5" y2="19"/>
                  </svg>
                </div>
              )}
            </div>
            <span>{s.label}</span>
            {data.status === s.id && (
              <svg className="status-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
