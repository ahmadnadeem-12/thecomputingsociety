
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
                className={`card userCard flex-stack ${isSelected ? 'selectedCard' : ''} ${isAdmin ? 'adminCard' : 'selectableCard'}`}
                onClick={(e) => toggleSelect(u._id, u.role, e)}
                style={{ 
                  display: 'flex', 
                  gap: '1.25rem',
                  alignItems: 'center',
                  cursor: isAdmin ? 'default' : 'pointer',
                  padding: '1.25rem',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: isSelected ? '1px solid var(--accent-pink)' : '1px solid rgba(255,255,255,0.08)',
                  background: isSelected ? 'rgba(255,45,149,0.06)' : 'var(--card-bg)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Visual indicator for selection */}
                {isSelected && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--accent-pink)' }} />}

                {!isAdmin ? (
                  <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", width: "100%" }}>
                    <div style={{ marginTop: "4px" }}>
                      <input 
                        type="checkbox" 
                        className="tcs-checkbox"
                        checked={isSelected}
                        onChange={(e) => toggleSelect(u._id, u.role, e)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: "wrap", marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: isSelected ? 'var(--accent-pink)' : 'var(--text-bright)' }}>{u.name}</span>
                        <span style={{ 
                          fontSize: '0.6rem', 
                          padding: '0.15rem 0.4rem', 
                          borderRadius: '4px',
                          background: u.isVerified ? 'rgba(74,222,128,0.1)' : 'rgba(255,165,0,0.1)',
                          color: u.isVerified ? '#4ade80' : '#ffa500',
                          border: `1px solid ${u.isVerified ? 'rgba(74,222,128,0.2)' : 'rgba(255,165,0,0.2)'}`,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {u.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{u.agNo || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.8rem' }}>🔒</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ color: 'var(--text-bright)' }}>{u.name}</span>
                        <span className="pill pillRed" style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>ADMIN</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                )}

                {!isAdmin && (
                  <div className="flex-stack" style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', width: 'auto' }}>
                    {!u.isVerified && (
                      <>
                        <button 
                          className="btn btnGhost" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderColor: 'rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}
                          onClick={async (e) => {
                            e.stopPropagation();
                            showConfirm(
                              "Manual Verification",
                              `Verify ${u.name} manually? This user will be able to generate tickets and certificates.`,
                              async () => {
                                await manualVerifyUser(u._id);
                                fetchUsers();
                                showAlert("Verified", "User has been verified successfully.", "success");
                              }
                            );
                          }}
                        >
                          Manual Verify
                        </button>
                        <button 
                          className="btn btnGhost" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderColor: 'rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}
                          onClick={async (e) => {
                            e.stopPropagation();
                            await resendVerifyEmail(u._id);
                            showAlert("Link Sent", "The verification email has been resent successfully.", "success");
                          }}
                        >
                          Resend Link
                        </button>
                      </>
                    )}
                    <button 
                      className="btn btnGhost" 
                      style={{ 
                        color: isSelected ? 'var(--text-bright)' : '#ff4d4d', 
                        borderColor: isSelected ? 'transparent' : 'rgba(255,77,77,0.1)', 
                        padding: '0.5rem', 
                        borderRadius: '10px',
                        minWidth: '40px',
                        background: isSelected ? 'rgba(255,255,255,0.1)' : 'transparent'
                      }}
                      onClick={(e) => handleDelete(u._id, u.name, e)}
                      disabled={deletingId === u._id}
                    >
                      {deletingId === u._id ? "..." : "🗑️"}
                    </button>
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
        }
        .selectableCard:hover {
          border-color: var(--accent-pink) !important;
          background: rgba(255,45,149,0.02) !important;
          transform: translateX(5px);
        }
        .selectedCard {
          box-shadow: 0 10px 30px rgba(255,45,149,0.12);
          transform: translateX(8px);
        }
        .adminCard {
          opacity: 0.85;
        }
      `}</style>
    </div>
  );
}
