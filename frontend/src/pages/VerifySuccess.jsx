
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function VerifySuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth(); // We'll add this hook method

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Save token to localStorage and update auth state
      localStorage.setItem("tcs_token", token);
      // Wait for localStorage to propagate and backend to settle
      setTimeout(() => {
        window.location.href = "/tickets?verified=true";
      }, 1500);
    }
  }, [searchParams]);

  return (
    <div className="section" style={{ textAlign: "center", minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div className="card" style={{ maxWidth: 500, margin: "0 auto", padding: "3rem" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</h1>
        <h2 className="sectionTitle">Email Verified!</h2>
        <p className="sectionSubtitle">Your account has been verified successfully. Logging you in automatically...</p>
        <div style={{ marginTop: "2rem" }} className="loader-small"></div>
      </div>
    </div>
  );
}
