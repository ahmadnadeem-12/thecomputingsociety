
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useModal } from "../context/ModalContext";

export default function Register() {
  const { register } = useAuth();
  const { showConfirm } = useModal();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agNo, setAgNo] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const ALLOWED_DOMAINS = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "uaf.edu.pk", "icloud.com"];
  
  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setIsLoading(true);

    const emailDomain = email.split("@")[1]?.toLowerCase();
    if (!ALLOWED_DOMAINS.includes(emailDomain)) {
      setErr(`Registration restricted. Please use an official email (Gmail, Outlook, Hotmail, or UAF Official).`);
      setIsLoading(false);
      return;
    }

    try {
      await register({ name, email, agNo, password, department, semester });
      // Store agNo for auto-fill in Login page
      localStorage.setItem("tcs_last_agNo", agNo);
      
      setIsLoading(false);
      showConfirm(
        "Email Sent Successfully",
        "Verification email has been sent successfully!",
        () => { nav("/verify-email"); },
        { type: "success", confirmText: "PROCEED", cancelText: "CLOSE", onCancel: () => { nav("/verify-email"); } }
      );
    } catch (e2) {
      setIsLoading(false);
      setErr(e2.response?.data?.message || e2.message || "Registration failed.");
    }
  };

  return (
    <section className="section auth-responsive">
      <div className="sectionHeader">
        <div>
          <div className="sectionTitle">Student Register</div>
          <div className="sectionSubtitle">Create account for tickets & registrations</div>
        </div>
        <div className="pill">Auth</div>
      </div>

      <form className="card" onSubmit={onSubmit} style={{ maxWidth: 560 }}>
        <div>
          <div className="label">Full Name</div>
          <input 
            className="input" 
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
        <div style={{ marginTop: ".7rem" }}>
          <div className="label">Email</div>
          <input 
            type="email" 
            className="input" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="example@gmail.com"
            required 
          />
        </div>
        <div style={{ marginTop: ".7rem" }}>
          <div className="label">AG Number</div>
          <input className="input" value={agNo} onChange={e => setAgNo(e.target.value)} placeholder="20xx-AG-xxxx" required />
        </div>
        <div className="formRow" style={{ marginTop: ".7rem" }}>
          <div>
            <div className="label">Department</div>
            <select className="input" value={department} onChange={e => setDepartment(e.target.value)} required>
              <option value="">Select Dept</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Bioinformatics">Bioinformatics</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Data Science">Data Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Software Engineering">Software Engineering</option>
            </select>
          </div>
          <div>
            <div className="label">Semester</div>
            <select className="input" value={semester} onChange={e => setSemester(e.target.value)} required>
              <option value="">Select</option>
              {[1,2,3,4,5,6,7,8].map(s => {
                const suffix = s === 1 ? 'st' : s === 2 ? 'nd' : s === 3 ? 'rd' : 'th';
                return <option key={s} value={`${s}${suffix}`}>{s}{suffix}</option>
              })}
            </select>
          </div>
        </div>
        <div style={{ marginTop: ".7rem" }}>
          <div className="label">Password</div>
          <div style={{ position: "relative" }}>
            <input 
              type={showPassword ? "text" : "password"} 
              className="input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="At least 6 characters"
              style={{ paddingRight: "2.5rem" }}
              required 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ 
                position: "absolute", 
                right: "10px", 
                top: "50%", 
                transform: "translateY(-50%)", 
                background: "none", 
                border: "none", 
                cursor: "pointer", 
                fontSize: "1.1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              title={showPassword ? "Hide Password" : "Show Password"}
            >
              {showPassword ? "👁️" : "🙈"}
            </button>
          </div>
        </div>

        {err && <div style={{ marginTop: ".7rem", color: "#ffd2d7" }}>{err}</div>}

        <div style={{ marginTop: "1rem", display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
          <button className="btn btnPrimary" type="submit" disabled={isLoading}>
            {isLoading ? "⏳ Creating Account..." : "Create Account"}
          </button>
          <button className="btn btnGhost" type="button" onClick={() => nav("/login")} disabled={isLoading}>Back to login</button>
        </div>
      </form>
    </section>
  );
}
