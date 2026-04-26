
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [identifier, setIdentifier] = useState(localStorage.getItem("tcs_last_agNo") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const u = await login({ identifier, password });
      // Update last agNo for next time if it looks like an AG No
      if (identifier.includes("-AG-")) {
        localStorage.setItem("tcs_last_agNo", identifier);
      }
      
      if (u.role === "admin") nav("/admin/dashboard");
      else nav("/tickets");
    } catch (e2) {
      setErr(e2.response?.data?.message || e2.message || "Login failed.");
    }
  };

  return (
    <section className="section">
      <div className="sectionHeader">
        <div>
          <div className="sectionTitle">Student Login</div>
          <div className="sectionSubtitle">Login to register & generate QR tickets</div>
        </div>
        <div className="pill">Auth</div>
      </div>

      <form className="card" onSubmit={onSubmit} style={{ maxWidth: 560 }}>
        <div>
          <div className="label">Email or AG Number</div>
          <input className="input" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="Email or 20xx-AG-xxxx" required />
        </div>
        <div style={{ marginTop: ".7rem" }}>
          <div className="label">Password</div>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
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
          <div style={{ textAlign: "right", marginTop: "0.3rem" }}>
            <Link
              to="/forgot-password"
              className="link-cyan"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
        {err && <div style={{ marginTop: ".7rem", color: "#ffd2d7" }}>{err}</div>}
        <div style={{ marginTop: "1rem", display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
          <button className="btn btnPrimary" type="submit">Login</button>
          <button className="btn btnGhost" type="button" onClick={() => nav("/register")}>Create account</button>
        </div>
      </form>

    </section>
  );
}
