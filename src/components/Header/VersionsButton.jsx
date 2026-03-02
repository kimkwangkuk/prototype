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

  const latest = deployments[0];

  return (
    <div className="versions-btn-wrap" ref={ref}>
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
          {deployments.map((dep, i) => (
            <a
              key={dep.url}
              href={dep.url}
              target="_blank"
              rel="noreferrer"
              className={`versions-dropdown-item${i === 0 ? ' versions-dropdown-item-latest' : ''}`}
              onClick={() => setOpen(false)}
            >
              <span className="versions-dropdown-msg">{dep.message || '(메시지 없음)'}</span>
              <span className="versions-dropdown-meta">
                {dep.sha && <span className="versions-dropdown-sha">{dep.sha}</span>}
                <span className="versions-dropdown-date">{formatDate(dep.createdAt)}</span>
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
