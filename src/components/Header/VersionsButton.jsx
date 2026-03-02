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

  useEffect(() => {
    fetch('/deployments.json')
      .then(r => r.json())
      .then(setDeployments)
      .catch(() => {});
  }, []);

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

  const currentHostname = window.location.hostname;
  const currentUrl = deployments.find(d => {
    try { return new URL(d.url).hostname === currentHostname; } catch { return false; }
  })?.url;

  const latest = deployments[0];

  return (
    <>
      <div className="versions-float-wrap" ref={ref}>
        <button
          className="versions-pill-btn"
          onClick={() => setOpen(v => !v)}
        >
          <span className="versions-pill-dot" />
          <span className="versions-pill-sha">{latest?.sha || '···'}</span>
        </button>

        {open && (
          <div className="versions-dropdown">
            <div className="versions-dropdown-header">버전 목록</div>
            {deployments.map((dep) => {
              const isCurrent = dep.url === currentUrl;
              return (
                <a
                  key={dep.url}
                  href={dep.url}
                  className={`versions-dropdown-item${isCurrent ? ' versions-dropdown-item-current' : ''}`}
                  onClick={(e) => { e.preventDefault(); setIframeUrl(dep.url); setOpen(false); }}
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
                </a>
              );
            })}
          </div>
        )}
      </div>

      {iframeUrl && (
        <div className="versions-iframe-overlay">
          <button className="versions-iframe-close" onClick={() => setIframeUrl(null)}>✕</button>
          <iframe src={iframeUrl} className="versions-iframe" />
        </div>
      )}
    </>
  );
}
