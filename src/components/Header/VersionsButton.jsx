import { useState, useEffect, useRef } from 'react';

function formatDate(ts) {
  const d = new Date(ts);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${mins}`;
}

export default function VersionsButton() {
  const [open, setOpen] = useState(false);
  const [deployments, setDeployments] = useState([]);
  const [iframeUrl, setIframeUrl] = useState(null);
  const ref = useRef(null);

  const fetchDeployments = () => {
    fetch('/deployments.json?t=' + Date.now())
      .then(r => r.json())
      .then(setDeployments)
      .catch(() => {});
  };

  useEffect(() => { fetchDeployments(); }, []);

  // 드롭다운 열 때마다 최신 목록 재fetch
  useEffect(() => {
    if (open) fetchDeployments();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  // 현재 실제 호스트에 해당하는 배포 URL
  const currentHostname = window.location.hostname;
  const hostUrl = deployments.find(d => {
    try { return new URL(d.url).hostname === currentHostname; } catch { return false; }
  })?.url;

  // 체크 기준: iframe 열려있으면 iframe URL, 아니면 호스트 URL
  const checkedUrl = iframeUrl ?? hostUrl;

  const latest = deployments[0];

  const handleItemClick = (e, depUrl) => {
    e.preventDefault();
    setOpen(false);
    if (iframeUrl && depUrl === hostUrl) {
      // 현재 실제 버전 선택 → iframe 닫기
      setIframeUrl(null);
    } else {
      setIframeUrl(depUrl);
    }
  };

  return (
    <>
      <div className="versions-float-wrap" ref={ref}>
        <button
          className="versions-pill-btn"
          onClick={() => setOpen(v => !v)}
          aria-label="버전 목록"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="2" y1="4" x2="14" y2="4" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="2" y1="8" x2="14" y2="8" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="2" y1="12" x2="14" y2="12" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {open && (
          <div className="versions-dropdown">
            <div className="versions-dropdown-header">버전 목록</div>
            {deployments.map((dep) => {
              const isCurrent = dep.url === checkedUrl;
              const isHost = dep.url === hostUrl;
              return (
                <a
                  key={dep.url}
                  href={dep.url}
                  className={`versions-dropdown-item${isCurrent ? ' versions-dropdown-item-current' : ''}`}
                  onClick={(e) => handleItemClick(e, dep.url)}
                >
                  <div className="versions-dropdown-item-left">
                    <span className="versions-dropdown-msg">{dep.message || '(메시지 없음)'}</span>
                    <span className="versions-dropdown-meta">
                      {dep.sha && <span className="versions-dropdown-sha">{dep.sha}</span>}
                      <span className="versions-dropdown-date">{formatDate(dep.createdAt)}</span>
                    </span>
                  </div>
                  {isCurrent && (
                    <svg className="versions-dropdown-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                  {!isCurrent && isHost && iframeUrl && (
                    <span className="versions-dropdown-back">돌아가기</span>
                  )}
                </a>
              );
            })}
          </div>
        )}
      </div>

      {iframeUrl && (
        <div className="versions-iframe-overlay">
          <iframe src={iframeUrl} className="versions-iframe" />
        </div>
      )}
    </>
  );
}
