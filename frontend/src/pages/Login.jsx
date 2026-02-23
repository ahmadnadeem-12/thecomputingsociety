
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const u = await login({ email, password });
      if (u.role === "admin") nav("/admin/dashboard");
      else nav("/tickets");
    } catch (e2) {
      setErr(e2.message || "Login failed.");
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
          <div className="label">Email</div>
          <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div style={{ marginTop: ".7rem" }}>
          <div className="label">Password</div>
          <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {err && <div style={{ marginTop: ".7rem", color: "#ffd2d7" }}>{err}</div>}
        <div style={{ marginTop: "1rem", display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
          <button className="btn btnPrimary" type="submit">Login</button>
          <button className="btn btnGhost" type="button" onClick={() => nav("/register")}>Create account</button>
        </div>

        <div className="hr" />
        <div className="sectionSubtitle">
          Admin demo login: <b>admin@tcs.uaf</b> / <b>admin123</b>
        </div>
      </form>
    </section>
  );
}
