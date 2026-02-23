
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminLogin() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@tcs.uaf");
  const [password, setPassword] = useState("admin123");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const u = await login({ email, password });
      if (u.role !== "admin") throw new Error("Not an admin account.");
      nav("/admin/dashboard");
    } catch (e2) {
      setErr(e2.message || "Login failed.");
    }
  };

  return (
    <section className="section">
      <div className="sectionHeader">
        <div>
          <div className="sectionTitle">Admin Login</div>
          <div className="sectionSubtitle">Manage events, tickets, theme & website content</div>
        </div>
        <div className="pill pillRed">Admin</div>
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
          <button className="btn btnGhost" type="button" onClick={() => nav("/")}>Back</button>
        </div>

        <div className="hr" />
        <div className="sectionSubtitle">
          Demo creds prefilled. Later MERN: replace with real auth + JWT.
        </div>
      </form>
    </section>
  );
}
