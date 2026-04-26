
import React, { useState, useEffect } from "react";
import { api } from "../../../services/api";
import { Skeleton, SkeletonTitle, SkeletonText } from "../../../components/ui/Skeleton";

export default function AuditLogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/auth/audit-logs");
      if (data.success) setLogs(data.data || []);
    } catch (e) {
      console.error("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionColor = (action) => {
    if (action.includes("DELETE")) return "#ff4d4d";
    if (action.includes("UPDATE") || action.includes("EDIT")) return "var(--accent-cyan)";
    if (action.includes("CREATE")) return "#4ade80";
    return "var(--text-muted)";
  };

  return (
    <div className="tabContent">
      <div className="sectionHeader" style={{ border: 'none', padding: 0, marginBottom: '1.5rem' }}>
        <div>
          <h2 className="sectionTitle">Admin Activity Logs</h2>
          <p className="sectionSubtitle">Recent administrative actions and changes tracked across the system.</p>
        </div>
        <button className="btn btnGhost" onClick={fetchLogs} disabled={loading}>
          {loading ? "..." : "🔄 Refresh"}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="card">
              <SkeletonTitle style={{ width: '30%' }} />
              <SkeletonText style={{ width: '60%', marginTop: '0.5rem' }} />
            </div>
          ))
        ) : logs.length > 0 ? (
          logs.map(log => (
            <div key={log._id} className="card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ 
                    padding: '0.3rem 0.6rem', 
                    borderRadius: '6px', 
                    fontSize: '0.7rem', 
                    fontWeight: 800, 
                    background: getActionColor(log.action) + '22',
                    color: getActionColor(log.action),
                    border: `1px solid ${getActionColor(log.action)}33`
                  }}>
                    {log.action}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{log.details}</div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
              <div style={{ marginTop: '0.6rem', display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }}>
                <div style={{ color: 'var(--text-muted)' }}>👤 Admin: <span style={{ color: 'var(--text-dim)' }}>{log.adminName}</span></div>
                <div style={{ color: 'var(--text-muted)' }}>🎯 Target: <span style={{ color: 'var(--accent-cyan)' }}>{log.targetType}</span></div>
                {log.ipAddress && <div style={{ color: 'var(--text-muted)' }}>🌐 IP: <span style={{ color: 'var(--text-dim)' }}>{log.ipAddress}</span></div>}
              </div>
            </div>
          ))
        ) : (
          <div className="sectionSubtitle" style={{ textAlign: 'center', padding: '2rem' }}>No activity logs recorded yet.</div>
        )}
      </div>
    </div>
  );
}
