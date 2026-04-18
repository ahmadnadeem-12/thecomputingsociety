
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await register({ name, email, password });
      nav("/tickets");
    } catch (e2) {
      setErr(e2.response?.data?.message || e2.message || "Registration failed.");
    }
  };

  return (
    <section className="section">
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
          <input className="input" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div style={{ marginTop: ".7rem" }}>
          <div className="label">Email</div>
          <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} />
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
          <button className="btn btnPrimary" type="submit">Create Account</button>
          <button className="btn btnGhost" type="button" onClick={() => nav("/login")}>Back to login</button>
        </div>
      </form>
    </section>
  );
}
