
import React from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyEmailNotice() {
  const navigate = useNavigate();

  return (
    <div className="section" style={{ textAlign: "center", minHeight: "70vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div className="card" style={{ maxWidth: 550, margin: "0 auto", padding: "3.5rem 2.5rem" }}>
        <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>📧</div>
        <h2 className="sectionTitle">Verify Your Email</h2>
        <p className="sectionSubtitle" style={{ fontSize: "1.05rem", lineHeight: "1.6", marginBottom: "2rem" }}>
          We've sent a verification link to your email address. 
          Please click the link in the email to verify your account and enable ticket generation.
        </p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.1)", fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Done verifying? The page will refresh once you click the link.
          </div>
          
          <button className="btn btnPrimary" onClick={() => navigate("/login")}>
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
