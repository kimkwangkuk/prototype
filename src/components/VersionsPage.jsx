import { useState, useEffect } from 'react';

function formatDate(ts) {
  const d = new Date(ts);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${mins}`;
}

export default function VersionsPage() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/deployments.json')
      .then(r => r.json())
      .then(data => {
        setDeployments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="versions-page">
      <div className="versions-header">
        <h1 className="versions-title">버전 목록</h1>
        <p className="versions-subtitle">각 버전을 탭해 확인하세요</p>
      </div>

      <div className="versions-list">
        {loading && (
          <div className="versions-empty">불러오는 중...</div>
        )}
        {!loading && deployments.length === 0 && (
          <div className="versions-empty">배포 이력이 없습니다</div>
        )}
        {deployments.map((dep, i) => (
          <a
            key={dep.url}
            href={dep.url + '#/app'}
            className={`version-item${i === 0 ? ' version-item-latest' : ''}`}
          >
            <div className="version-item-left">
              <span className="version-message">{dep.message || '(메시지 없음)'}</span>
              <span className="version-meta">
                {dep.sha && <span className="version-sha">{dep.sha}</span>}
                <span className="version-date">{formatDate(dep.createdAt)}</span>
              </span>
            </div>
            {i === 0 && <span className="version-badge">최신</span>}
          </a>
        ))}
      </div>
    </div>
  );
}
