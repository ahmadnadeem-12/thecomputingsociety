
import React, { useState, useEffect } from "react";
import { getAllUsers, deleteUser, bulkDeleteUsers, manualVerifyUser, resendVerifyEmail } from "../../../services/authService";
import { Skeleton, SkeletonTitle, SkeletonText } from "../../../components/ui/Skeleton";
import { useModal } from "../../../context/ModalContext";

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const { showAlert, showConfirm } = useModal();
  
  // Multi-select state
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setSelectedIds([]);
    try {
      const res = await getAllUsers();
      if (res.success) {
        setUsers(res.data || []);
      }
    } catch (e) {
      setErr("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id, name, e) => {
    if (e) e.stopPropagation(); // Prevent card click selection
    showConfirm(
      "Confirm Deletion",
      `Are you sure you want to delete user "${name}"? This will also delete ALL their tickets!`,
      async () => {
        setDeletingId(id);
        try {
          const res = await deleteUser(id);
          if (res.success) {
            setUsers(users.filter(u => u._id !== id));
            setSelectedIds(prev => prev.filter(sid => sid !== id));
          }
        } catch (e2) {
          showAlert("Error", e2.response?.data?.message || "Failed to delete user.", "error");
        } finally {
          setDeletingId(null);
        }
      },
      { type: "error" }
    );
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.length;
    showConfirm(
      "Bulk Deletion",
      `Are you sure you want to delete ${count} selected users and ALL their associated data?`,
      async () => {
        setIsBulkDeleting(true);
        try {
          const res = await bulkDeleteUsers(selectedIds);
          if (res.success) {
            setUsers(users.filter(u => !selectedIds.includes(u._id)));
            setSelectedIds([]);
            showAlert("Deleted", res.message, "success");
          }
        } catch (e) {
          showAlert("Error", e.response?.data?.message || "Bulk deletion failed.", "error");
        } finally {
          setIsBulkDeleting(false);
        }
      },
      { type: "error" }
    );
  };

  const toggleSelect = (id, role, e) => {
    if (role === 'admin') return;
    if (e) e.stopPropagation(); // Prevents multiple triggers if clicking checkbox vs div
    
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const nonAdmins = filteredUsers.filter(u => u.role !== 'admin').map(u => u._id);
    if (selectedIds.length === nonAdmins.length && nonAdmins.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(nonAdmins);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(query.toLowerCase()) || 
    u.email?.toLowerCase().includes(query.toLowerCase()) ||
    u.agNo?.toLowerCase().includes(query.toLowerCase())
  );

  const nonAdminFilteredCount = filteredUsers.filter(u => u.role !== 'admin').length;

  return (
    <div className="tabContent">
      <div className="sectionHeader" style={{ border: 'none', padding: 0, marginBottom: '1.5rem' }}>
        <div>
          <h2 className="sectionTitle">User Management ({users.length})</h2>
          <p className="sectionSubtitle">Click on any card to select. Manage student accounts efficiently.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="btn btnGhost" onClick={fetchUsers} disabled={loading}>
            {loading ? "..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, padding: '0.6rem 1rem' }}>
          <input 
            className="input" 
            placeholder="Search by Name, Email or AG Number..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ border: 'none', padding: 0, background: 'transparent' }}
          />
        </div>
        
        {selectedIds.length > 0 && (
          <button 
            className="btn btnPrimary" 
            style={{ background: 'rgba(255,77,77,0.15)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.3)', boxShadow: '0 4px 15px rgba(255,77,77,0.1)' }}
            onClick={handleBulkDelete}
            disabled={isBulkDeleting}
          >
            {isBulkDeleting ? "Deleting..." : `🗑️ Delete Selected (${selectedIds.length})`}
          </button>
        )}
      </div>

      {!loading && filteredUsers.length > 0 && (
        <div 
          style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1rem', cursor: 'pointer', width: 'fit-content' }} 
          onClick={toggleSelectAll}
        >
          <input 
            type="checkbox" 
            checked={selectedIds.length > 0 && selectedIds.length === nonAdminFilteredCount} 
            onChange={(e) => { e.stopPropagation(); toggleSelectAll(); }}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
          <span className="sectionSubtitle" style={{ fontSize: '0.9rem', fontWeight: 600, color: selectedIds.length === nonAdminFilteredCount && nonAdminFilteredCount > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
            {selectedIds.length === nonAdminFilteredCount && nonAdminFilteredCount > 0 ? "Deselect All Users" : "Select All Student Users"}
          </span>
        </div>
      )}

      {err && <div className="card" style={{ color: '#ffd2d7', marginBottom: '1.5rem' }}>{err}</div>}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="card">
              <SkeletonTitle style={{ width: '40%' }} />
              <SkeletonText style={{ width: '70%', marginTop: '0.5rem' }} />
            </div>
          ))
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map(u => {
            const isSelected = selectedIds.includes(u._id);
            const isAdmin = u.role === 'admin';
            
            return (
              <div 
                key={u._id} 
                className={`card userCard ${isSelected ? 'selectedCard' : ''} ${isAdmin ? 'adminCard' : 'selectableCard'}`}
                onClick={(e) => toggleSelect(u._id, u.role, e)}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '1rem',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: isSelected ? '1px solid var(--accent-pink)' : '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(15, 10, 25, 0.4)',
                  boxShadow: isSelected ? '0 0 20px rgba(194,52,165,0.1)' : 'none',
                  position: 'relative'
                }}
              >
                <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                  <div style={{ marginTop: "4px" }}>
                    <input 
                      type="checkbox" 
                      className="tcs-checkbox"
                      checked={isSelected}
                      onChange={(e) => toggleSelect(u._id, u.role, e)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ borderRadius: '6px' }}
                    />
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: "wrap", marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#fff', letterSpacing: '-0.3px', wordBreak: 'break-word' }}>{u.name}</span>
                      {!isAdmin && (
                        <span style={{ 
                          fontSize: '0.65rem', 
                          padding: '0.2rem 0.6rem', 
                          borderRadius: '6px',
                          background: u.isVerified ? 'rgba(74,222,128,0.1)' : 'rgba(255,165,0,0.08)',
                          color: u.isVerified ? '#4ade80' : '#ffa500',
                          border: `1px solid ${u.isVerified ? 'rgba(74,222,128,0.3)' : 'rgba(255,165,0,0.3)'}`,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}>
                         ● {u.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      )}
                      {isAdmin && <span className="pill pillRed" style={{ borderRadius: '4px', fontSize: '0.65rem' }}>ADMIN</span>}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500, wordBreak: 'break-all' }}>{u.email}</div>
                      <div style={{ fontSize: '1rem', color: 'var(--accent-cyan)', fontWeight: 800 }}>{u.agNo || 'N/A'}</div>
                    </div>
                  </div>

                  {!isAdmin && (
                    <button 
                      className="btn actionBtnDelete" 
                      onClick={(e) => handleDelete(u._id, u.name, e)}
                      disabled={deletingId === u._id}
                      style={{ alignSelf: 'center', flexShrink: 0 }}
                      aria-label="Delete User"
                    >
                      {deletingId === u._id ? (
                        <span className="loader-small"></span>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      )}
                    </button>
                  )}

                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.2rem', cursor: 'pointer', alignSelf: 'center', marginLeft: 'auto' }}>⋮</div>
                </div>

                {!isAdmin && (
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {!u.isVerified && (
                      <>
                        <button 
                          className="btn" 
                          style={{ 
                            padding: '0.6rem 1.2rem', 
                            fontSize: '0.85rem', 
                            background: 'transparent',
                            border: '1.5px solid #00d9ff',
                            color: '#00d9ff',
                            fontWeight: 800,
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            textTransform: 'uppercase'
                          }}
                          onClick={async (e) => {
                            e.stopPropagation();
                            showConfirm("Manual Verification", `Verify ${u.name} manually?`, async () => {
                              await manualVerifyUser(u._id); fetchUsers();
                              showAlert("Verified", "User verified successfully.", "success");
                            });
                          }}
                        >
                          <span style={{ fontSize: '1.1rem' }}>🛡️</span> MANUAL VERIFY
                        </button>
                        <button 
                          className="btn" 
                          style={{ 
                            padding: '0.6rem 1.2rem', 
                            fontSize: '0.85rem', 
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.7)',
                            fontWeight: 700,
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            textTransform: 'uppercase'
                          }}
                          onClick={async (e) => {
                            e.stopPropagation();
                            await resendVerifyEmail(u._id);
                            showAlert("Sent", "Link resent successfully.", "success");
                          }}
                        >
                          <span style={{ fontSize: '1.1rem' }}>🚀</span> RESEND LINK
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="sectionSubtitle" style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            No users found matching your search.
          </div>
        )}
      </div>
      
      <style>{`
        .userCard {
          transform-origin: left;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .selectableCard:hover {
          border-color: var(--accent-pink) !important;
          background: rgba(255,45,149,0.03) !important;
          transform: translateX(5px);
        }
        .selectedCard {
          box-shadow: 0 10px 30px rgba(255,45,149,0.12);
          transform: translateX(8px);
        }
        .adminCard {
          opacity: 0.85;
          border-color: rgba(255,255,255,0.05) !important;
        }
        .actionBtnDelete {
          width: 44px;
          height: 44px;
          padding: 0 !important;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 77, 77, 0.08) !important;
          border: 1.5px solid rgba(255, 77, 77, 0.2) !important;
          color: #ff4d4d !important;
          border-radius: 12px !important;
          transition: all 0.2s ease !important;
          box-shadow: 0 4px 12px rgba(255, 77, 77, 0.1);
        }
        .actionBtnDelete:hover:not(:disabled) {
          background: #ff4d4d !important;
          color: #fff !important;
          border-color: #ff4d4d !important;
          box-shadow: 0 0 20px rgba(255, 77, 77, 0.4);
          transform: translateY(-2px);
        }
        .actionBtnDelete:active {
          transform: scale(0.95);
        }
        .loader-small {
          width: 18px;
          height: 18px;
          border: 2px solid currentColor;
          border-bottom-color: transparent;
          border-radius: 50%;
          display: inline-block;
          animation: rotation 1s linear infinite;
        }
        @keyframes rotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 480px) {
          .userCard {
            padding: 1rem !important;
          }
          .userCard > div {
            gap: 0.75rem !important;
          }
          .actionBtnDelete {
            width: 38px !important;
            height: 38px !important;
            border-radius: 8px !important;
          }
          .actionBtnDelete svg {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>
    </div>
  );
}
