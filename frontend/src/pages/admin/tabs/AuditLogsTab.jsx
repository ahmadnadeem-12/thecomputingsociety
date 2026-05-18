
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
            <div key={log._id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ 
                    padding: '0.3rem 0.6rem', 
                    borderRadius: '6px', 
                    fontSize: '0.7rem', 
                    fontWeight: 800, 
                    background: getActionColor(log.action) + '22',
                    color: getActionColor(log.action),
                    border: `1px solid ${getActionColor(log.action)}33`,
                    whiteSpace: 'nowrap'
                  }}>
                    {log.action}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', wordBreak: 'break-word', color: '#fff' }}>{log.details}</div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
              
              <div style={{ 
                marginTop: '0.75rem', 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
                gap: '0.75rem', 
                fontSize: '0.8rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                paddingTop: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1rem' }}>👤</span>
                  <div>
                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: 700 }}>Admin</div>
                    <div style={{ color: 'var(--text-dim)', fontWeight: 600 }}>{log.adminName}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1rem' }}>🎯</span>
                  <div>
                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: 700 }}>Target</div>
                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{log.targetType}</div>
                  </div>
                </div>
                {log.ipAddress && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1rem' }}>🌐</span>
                    <div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: 700 }}>IP Address</div>
                      <div style={{ color: 'var(--text-dim)', fontWeight: 600 }}>{log.ipAddress}</div>
                    </div>
                  </div>
                )}
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
