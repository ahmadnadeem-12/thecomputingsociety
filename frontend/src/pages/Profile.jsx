import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { updateProfile, updatePassword, deleteMe, resendVerifyEmail } from "../services/authService";
import { useModal } from "../context/ModalContext";
import { motion, AnimatePresence } from "framer-motion";
import MajesticModal from "../components/ui/MajesticModal";

export default function Profile() {
  const { user, logout, refreshUser, isAdmin } = useAuth();
  const { showAlert, showConfirm } = useModal();
  
  const [name, setName] = useState(user?.name || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [semester, setSemester] = useState(user?.semester || "");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const lastResend = localStorage.getItem("verification_resend_cooldown");
    if (lastResend) {
      const remaining = Math.ceil((parseInt(lastResend) - Date.now()) / 1000);
      if (remaining > 0) {
        setCooldown(remaining);
      }
    }
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleResendMail = async () => {
    if (cooldown > 0) return;
    setResendLoading(true);
    setResendMessage("");
    try {
      await resendVerifyEmail(user._id || user.id);
      setResendMessage("✉️ Verification email resent successfully!");
      const targetTime = Date.now() + 120 * 1000;
      localStorage.setItem("verification_resend_cooldown", targetTime);
      setCooldown(120);
    } catch (err) {
      setResendMessage(err.response?.data?.message || "Failed to resend email.");
    } finally {
      setResendLoading(false);
    }
  };
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  // Deletion logic
  const [delPass, setDelPass] = useState("");
  const [delLoading, setDelLoading] = useState(false);
  const [showDelPass, setShowDelPass] = useState(false);
  const [isDelModalOpen, setIsDelModalOpen] = useState(false);

  const toggleShow = (field) => setShowPass(prev => ({ ...prev, [field]: !prev[field] }));

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const nameChanged = name !== user.name;
    const infoChanged = department !== user.department || semester !== user.semester;
    
    if (!nameChanged && !infoChanged) return;

    const performUpdate = async () => {
      setMsg({ text: "🔄 Synchronizing your data with the server...", type: "" });
      setIsLoading(true);
      try {
        const res = await updateProfile({ name, department, semester });
        await refreshUser(); // Sync central auth state
        setMsg({ text: res.message || "Profile updated successfully!", type: "success" });
        showAlert("Success", "Profile updated successfully.", "success");
      } catch (err) {
        const errMsg = err.response?.data?.message || "Could not update profile. Please try again.";
        setMsg({ text: errMsg, type: "error" });
        showAlert("Update Failed", errMsg, "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (nameChanged) {
      showConfirm(
        "Identity Synchronization", 
        "Changing your Full Name will PERMANENTLY DELETE all your currently generated tickets as they are tied to your primary identity. Proceed?",
        performUpdate
      );
    } else {
      // Just department or semester changed - update without warning
      performUpdate();
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMsg({ text: "New passwords do not match", type: "error" });
      return;
    }
    setMsg({ text: "🛡️ Securing your new credentials...", type: "" });
    setIsLoading(true);
    try {
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setMsg({ text: "Password changed successfully!", type: "success" });
      showAlert("Success", "Your password has been updated. Keep it safe!", "success");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Failed to change password", type: "error" });
      showAlert("Security Error", err.response?.data?.message || "Failed to update password.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalDeletion = async () => {
    if (!delPass) return showAlert("Input Required", "Please enter your password to confirm.", "error");

    setDelLoading(true);
    try {
      await deleteMe(delPass);
      logout();
      window.location.href = "/"; 
    } catch (err) {
      const errMsg = err.response?.data?.message || "Incorrect password. Deletion failed.";
      showAlert("Security Error", errMsg, "error");
      setDelPass(""); 
    } finally {
      setDelLoading(false);
    }
  }

  const handleDeleteAccount = () => {
    setDelPass(""); 
    setIsDelModalOpen(true);
  }

  if (!user) return <div className="section" style={{ color: "#fff", textAlign: "center", padding: "100px" }}>Please login to view profile.</div>;

  const isLocked = user.role === "student" && !user.isVerified;

  return (
    <section className="section profileSection">
      {/* LOCAL MAJESTIC MODAL FOR PASSWORD PROMPT */}
      <MajesticModal
        isOpen={isDelModalOpen}
        type="error"
        title="Identity Verification"
        message="This action is PERMANENT. Please enter your account password to confirm your identity before we erase your data."
        isConfirm={true}
        confirmText={delLoading ? "DELETING..." : "YES, DELETE FOREVER"}
        onConfirm={handleFinalDeletion}
        onClose={() => setIsDelModalOpen(false)}
      >
        <div className="passContainer" style={{ maxWidth: "350px", margin: "1.5rem auto 0" }}>
          <input 
            type={showDelPass ? "text" : "password"} 
            className="sexyInput" 
            placeholder="Your Account Password" 
            style={{ textAlign: "center", paddingRight: "50px", background: "rgba(0,0,0,0.3) !important", borderColor: "rgba(239, 68, 68, 0.3) !important" }}
            value={delPass}
            onChange={e => setDelPass(e.target.value)}
            required
            autoFocus
          />
          <span className="passToggle" style={{ right: "1rem" }} onClick={() => setShowDelPass(!showDelPass)}>
            {showDelPass ? "👁️" : "🙈"}
          </span>
        </div>
      </MajesticModal>

      <style>{`
        .glassCard {
          background: rgba(10, 15, 35, 0.4);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 25px;
          padding: 3.5rem;
          margin-bottom: 2.5rem;
          box-shadow: 0 15px 40px rgba(0,0,0,0.4);
        }
        .infoGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
        }
        .fieldCell {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 1.8rem 2.2rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          position: relative;
        }
        .iconCircle {
          width: 55px;
          height: 55px;
          border-radius: 16px;
          background: rgba(34, 211, 238, 0.08);
          color: var(--accent-cyan);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          border: 1px solid rgba(34, 211, 238, 0.15);
          flex-shrink: 0;
        }
        .sexyInput {
          background: rgba(0, 0, 0, 0.4) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 14px !important;
          color: #fff !important;
          padding: 1.2rem 1.6rem !important;
          font-size: 1.1rem !important;
          transition: all 0.3s ease !important;
          width: 100%;
          line-height: 1.5;
        }
        .sexyInput:focus {
          border-color: var(--accent-cyan) !important;
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.3) !important;
          outline: none;
        }
        .inputLabel {
          font-size: 0.9rem;
          font-weight: 900;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 12px;
          display: block;
        }
        .passContainer {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }
        .passToggle {
          position: absolute;
          right: 1.5rem;
          cursor: pointer;
          opacity: 0.6;
          transition: all 0.3s;
          font-size: 1.5rem;
          user-select: none;
          z-index: 10;
          color: var(--accent-cyan);
        }
        .passToggle:hover { 
          opacity: 1;
          transform: scale(1.1);
        }
        .verifiedBadge {
          position: absolute;
          right: 2rem;
          background: rgba(74, 222, 128, 0.15);
          color: #4ade80;
          border: 1px solid rgba(74, 222, 128, 0.3);
          padding: 8px 18px;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 900;
          white-space: nowrap;
        }
        .cardHeader {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 3.5rem;
        }
        .headerIcon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid var(--accent-cyan);
          color: var(--accent-cyan);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          box-shadow: 0 0 15px rgba(34, 211, 238, 0.2);
        }
        .btnMajestic {
          background: linear-gradient(135deg, var(--accent-cyan), #0ea5e9);
          color: #000;
          font-weight: 950;
          height: 55px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          text-transform: uppercase;
          padding: 0 2rem;
          width: 100%;
          box-shadow: 0 10px 20px rgba(34, 211, 238, 0.2);
          letter-spacing: 1px;
        }
        .btnMajestic:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(34, 211, 238, 0.4);
          background: #fff;
        }
        select.sexyInput {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2322d3ee' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") !important;
          background-repeat: no-repeat !important;
          background-position: right 1.5rem center !important;
          background-size: 1.2rem !important;
        }
        .btnSecurity {
          padding: 0 2rem;
          height: 55px;
          border-radius: 15px;
          font-size: 1.1rem;
          font-weight: 950;
          letter-spacing: 1.5px;
          border: 1px solid var(--accent-pink);
          background: rgba(255, 45, 149, 0.08);
          color: var(--accent-pink);
          transition: all 0.3s ease;
          cursor: pointer;
          text-transform: uppercase;
          width: 100%;
          margin-top: 1.5rem;
        }
        .btnSecurity:hover {
          background: var(--accent-pink);
          color: #fff;
          box-shadow: 0 0 30px rgba(255, 45, 149, 0.4);
        }
        .btnDelete {
          padding: 0.8rem 1.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 900;
          background: rgba(255, 77, 77, 0.08);
          color: #ff4d4d;
          border: 1px solid rgba(255, 77, 77, 0.2);
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
          margin-top: 2rem;
        }
        .btnDelete:hover {
          background: #ff4d4d;
          color: #fff;
          box-shadow: 0 0 20px rgba(255, 77, 77, 0.3);
        }

        .profileTitle {
          font-size: 3rem;
        }
        .profileSection {
          min-height: 90vh;
          padding: 1.5rem 2rem;
        }

        @media (max-width: 1024px) {
          .infoGrid { grid-template-columns: 1fr; }
          .glassCard { padding: 2.5rem; }
          .profileTitle { font-size: 2.5rem; }
        }

        @media (max-width: 768px) {
          .glassCard { padding: 1.5rem; border-radius: 20px; }
          .cardHeader h2 { font-size: 1.5rem !important; }
          .infoGrid { gap: 1rem; }
          .fieldCell { padding: 1.2rem; flex-direction: column; align-items: flex-start; gap: 1rem; }
          .verifiedBadge { position: static; margin-top: 0.5rem; display: inline-block; }
          .sexyInput { padding: 0.8rem 1rem !important; font-size: 1rem !important; }
          .btnMajestic, .btnSecurity { height: 50px; font-size: 0.9rem; }
          .infoGrid div div div { font-size: 1.2rem !important; }
          .formRowMobileStack { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
          .profileTitle { font-size: 2rem; }
          .profileSection { padding: 1rem 0.5rem; }
        }

        @media (max-width: 480px) {
          .cardHeader { margin-bottom: 2rem; }
          .cardHeader h2 { font-size: 1.2rem !important; }
          .iconCircle { width: 45px; height: 45px; font-size: 1.2rem; }
          .profileTitle { font-size: 1.6rem; }
        }
      `}</style>

      {isLocked ? (
        <div style={{ maxWidth: "1000px", margin: "4rem auto" }}>
          <div className="card shadow-glass" style={{ textAlign: "center", padding: "6rem 2rem", borderRadius: "40px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(10, 15, 35, 0.4)", backdropFilter: "blur(25px)" }}>
            <div style={{ fontSize: "6rem", marginBottom: "1.5rem" }}>🛡️</div>
            <h2 className="sectionTitle" style={{ fontSize: "2.2rem", fontWeight: 950, color: "#fff", letterSpacing: "1.5px", textTransform: "uppercase" }}>VERIFICATION REQUIRED</h2>
            <p className="sectionSubtitle" style={{ maxWidth: "500px", margin: "0 auto 2.5rem", color: "#94a3b8", fontSize: "1.1rem" }}>
              Please check your email and verify your account to access your official profile and sync your society data.
            </p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
              <button className="btn btnPrimary" style={{ padding: "1rem 3rem", borderRadius: "15px", background: "linear-gradient(135deg, #dc2743, #c234a5)", border: "none", color: "#fff", fontWeight: 800, cursor: "pointer" }} onClick={() => window.location.reload()}>🔄 I'VE VERIFIED</button>
              <button 
                className="btn btnGhost" 
                style={{ padding: "0.8rem 2.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)", fontSize: "0.9rem", color: "#fff", background: "transparent", cursor: cooldown > 0 ? "not-allowed" : "pointer" }} 
                onClick={handleResendMail}
                disabled={resendLoading || cooldown > 0}
              >
                {resendLoading ? "⏳ SENDING..." : cooldown > 0 ? `📧 RESEND IN ${Math.floor(cooldown / 60)}:${(cooldown % 60).toString().padStart(2, "0")}` : "📧 RESEND EMAIL"}
              </button>
              {resendMessage && (
                <p style={{ fontSize: "0.9rem", color: "var(--accent-cyan)", fontWeight: 700, margin: "0.5rem 0 0 0" }}>
                  {resendMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

      <div className="sectionHeader" style={{ textAlign: "left", marginBottom: "1rem", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="profileTitle" style={{ fontWeight: 950, color: "#ff2d95", letterSpacing: "2px", textTransform: "uppercase" }}>MY PROFILE</h1>
        <button className="btn btnGhost" style={{ padding: "0.6rem 1.5rem", borderRadius: "12px", fontSize: '0.8rem' }} onClick={() => { logout(); window.location.href = "/login"; }}>🚪 LOGOUT</button>
      </div>

        {/* ACCOUNT INFORMATION CARD */}
        <div className="glassCard">
          <div className="cardHeader">
             <div className="headerIcon">👤</div>
             <h2 style={{ fontSize: "2.2rem", fontWeight: 950, color: "#fff", letterSpacing: "1.5px" }}>ACCOUNT INFORMATION</h2>
          </div>

          <div className="infoGrid">
             <div className="fieldCell">
                <div className="iconCircle">🪪</div>
                <div>
                   <span className="inputLabel">Registered AG Number</span>
                   <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--accent-cyan)" }}>{user.agNo}</div>
                </div>
             </div>

             <div className="fieldCell">
                <div className="iconCircle">✉️</div>
                <div>
                   <span className="inputLabel">Email Address</span>
                   <div style={{ fontSize: "1.3rem", fontWeight: 600, color: "#e2e8f0" }}>{user.email}</div>
                </div>
             </div>

             <div className="fieldCell">
                <div className="iconCircle">🏢</div>
                <div>
                    <span className="inputLabel">Department</span>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff" }}>{user.department}</div>
                 </div>
                 <span className="verifiedBadge" style={{ 
                     background: (isAdmin || user.isVerified) ? "rgba(74, 222, 128, 0.12)" : "rgba(255, 45, 149, 0.12)",
                     color: (isAdmin || user.isVerified) ? "#4ade80" : "var(--accent-pink)",
                     border: `1px solid ${(isAdmin || user.isVerified) ? "rgba(74, 222, 128, 0.2)" : "rgba(255, 45, 149, 0.2)"}`
                 }}>
                     {isAdmin ? "VERIFIED ADMIN ✓" : (user.isVerified ? "VERIFIED USER ✓" : "UNVERIFIED ACCOUNT ⚠")}
                 </span>
             </div>

             <div className="fieldCell">
                <div className="iconCircle">🎓</div>
                <div>
                   <span className="inputLabel">Semester</span>
                   <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--accent-pink)" }}>{user.semester}</div>
                </div>
             </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "25px", padding: "2.5rem 3rem" }}>
             <form onSubmit={handleUpdateProfile} style={{ display: "grid", gap: "2rem" }}>
                <div className="formRowMobileStack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                   <div>
                      <span className="inputLabel" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Full Name 
                        <span 
                          title="⚠️ Warning: Changing your name will permanently delete all your existing tickets." 
                          style={{ cursor: 'help', color: '#ff4d4d', fontSize: '1rem', display: 'inline-flex', alignItems: 'center' }}
                        >
                          ⓘ
                        </span>
                      </span>
                      <input 
                        className="sexyInput" 
                        value={name} 
                        onChange={e => {
                          const val = e.target.value;
                          const titleCased = val.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                          setName(titleCased);
                        }} 
                        placeholder="Full Name"
                        required
                      />
                   </div>
                   <div>
                      <span className="inputLabel">Department</span>
                      <select className="sexyInput" value={department} onChange={e => setDepartment(e.target.value)} required>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                        <option value="Bioinformatics">Bioinformatics</option>
                        <option value="Data Science">Data Science</option>
                      </select>
                   </div>
                </div>

                <div className="formRowMobileStack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "flex-end" }}>
                  <div>
                    <span className="inputLabel">Current Semester</span>
                    <select className="sexyInput" value={semester} onChange={e => setSemester(e.target.value)} required>
                      {[1,2,3,4,5,6,7,8].map(s => {
                        const suffix = s === 1 ? 'st' : s === 2 ? 'nd' : s === 3 ? 'rd' : 'th';
                        return <option key={s} value={`${s}${suffix}`}>{s}{suffix}</option>
                      })}
                    </select>
                  </div>
                  <button type="submit" className="btnMajestic" style={{ height: "55px", width: "100%" }} disabled={isLoading}>
                    {isLoading ? "SYNCING..." : "UPDATE PROFILE DATA"}
                  </button>
                </div>
             </form>
           </div>
           
           {msg.text && (
             <div style={{ padding: "1.2rem", borderRadius: "18px", marginTop: "2rem", fontSize: "1rem", fontWeight: 800, background: msg.type === "success" ? "rgba(34, 211, 238, 0.12)" : "rgba(255, 45, 149, 0.12)", color: msg.type === "success" ? "var(--accent-cyan)" : "var(--accent-pink)", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
               {msg.text}
             </div>
           )}
        </div>

        {/* SECURITY HUB CARD */}
        <div className="glassCard">
          <div className="cardHeader">
             <div className="headerIcon" style={{ color: "var(--accent-cyan)", borderColor: "var(--accent-cyan)" }}>🔒</div>
             <h2 style={{ fontSize: "2.2rem", fontWeight: 950, color: "#fff", letterSpacing: "1.5px" }}>SECURITY HUB</h2>
          </div>

          <form onSubmit={handleUpdatePassword} style={{ display: "grid", gap: "2rem" }}>
            <div className="fieldCell">
               <span style={{ fontSize: "1.8rem", opacity: 0.7 }}>🔒</span>
               <div style={{ flex: 1 }}>
                  <span className="inputLabel" style={{ marginBottom: "8px" }}>Current Password</span>
                  <div className="passContainer">
                    <input 
                        type={showPass.current ? "text" : "password"} 
                        className="sexyInput" 
                        style={{ background: "transparent !important", border: "none !important", paddingLeft: 0, paddingRight: "50px" }} 
                        value={passwordForm.currentPassword} 
                        onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} 
                        required 
                        placeholder="••••••••" 
                    />
                    <span className="passToggle" onClick={() => toggleShow('current')}>{showPass.current ? "👁️" : "🙈"}</span>
                  </div>
               </div>
            </div>

            <div className="fieldCell">
               <span style={{ fontSize: "1.8rem", opacity: 0.7 }}>🔒</span>
               <div style={{ flex: 1 }}>
                  <span className="inputLabel" style={{ marginBottom: "8px" }}>New Password</span>
                  <div className="passContainer">
                    <input 
                        type={showPass.new ? "text" : "password"} 
                        className="sexyInput" 
                        style={{ background: "transparent !important", border: "none !important", paddingLeft: 0, paddingRight: "50px" }} 
                        value={passwordForm.newPassword} 
                        onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                        required 
                        minLength={6} 
                        placeholder="••••••••" 
                    />
                    <span className="passToggle" onClick={() => toggleShow('new')}>{showPass.new ? "👁️" : "🙈"}</span>
                  </div>
               </div>
            </div>

            <div className="fieldCell">
               <span style={{ fontSize: "1.8rem", opacity: 0.7 }}>🔒</span>
               <div style={{ flex: 1 }}>
                  <span className="inputLabel" style={{ marginBottom: "8px" }}>Confirm New Password</span>
                  <div className="passContainer">
                    <input 
                        type={showPass.confirm ? "text" : "password"} 
                        className="sexyInput" 
                        style={{ background: "transparent !important", border: "none !important", paddingLeft: 0, paddingRight: "50px" }} 
                        value={passwordForm.confirmPassword} 
                        onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                        required 
                        placeholder="••••••••" 
                    />
                    <span className="passToggle" onClick={() => toggleShow('confirm')}>{showPass.confirm ? "👁️" : "🙈"}</span>
                  </div>
               </div>
            </div>

            <button type="submit" className="btnSecurity" disabled={isLoading}>
              {isLoading ? "DATA PROTECTING..." : "UPDATE SECURITY SETTINGS"}
            </button>
          </form>

          {!isAdmin && (
            <div style={{ textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: "3rem" }}>
               <button className="btnDelete" onClick={handleDeleteAccount} disabled={isLoading}>
                  {isLoading ? "PROCESSSING..." : "⚠ DELETE MY ACCOUNT PERMANENTLY"}
               </button>
            </div>
          )}
          </div>
        </div>
      )}
    </section>
  );
}
