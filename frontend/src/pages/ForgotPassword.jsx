
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function ForgotPassword() {
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        setLoading(true);
        try {
            await api.post("/auth/forgot-password", { email });
            setSent(true);
        } catch (e2) {
            setErr(e2.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <section className="section">
                <div className="sectionHeader">
                    <div>
                        <div className="sectionTitle">Check Your Email</div>
                        <div className="sectionSubtitle">We've sent a password reset link</div>
                    </div>
                    <div className="pill">📧 Sent</div>
                </div>

                <div className="card" style={{ maxWidth: 560 }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem", textAlign: "center" }}>📬</div>
                    <div style={{ textAlign: "center", color: "var(--text-muted)", lineHeight: 1.6 }}>
                        If an account with <strong style={{ color: "var(--accent-cyan)" }}>{email}</strong> exists,
                        you'll receive a password reset link. Check your inbox (and spam folder).
                    </div>
                    <div style={{ textAlign: "center", marginTop: "1rem" }}>
                        <div className="sectionSubtitle">The link will expire in <strong>15 minutes</strong></div>
                    </div>
                    <div className="hr" />
                    <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
                        <button className="btn btnPrimary" onClick={() => nav("/login")}>Back to Login</button>
                        <button className="btn btnGhost" onClick={() => { setSent(false); setEmail(""); }}>Try Another Email</button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="section">
            <div className="sectionHeader">
                <div>
                    <div className="sectionTitle">Forgot Password</div>
                    <div className="sectionSubtitle">Enter your email to receive a reset link</div>
                </div>
                <div className="pill">🔐 Reset</div>
            </div>

            <form className="card" onSubmit={onSubmit} style={{ maxWidth: 560 }}>
                <div>
                    <div className="label">Email Address</div>
                    <input
                        type="email"
                        className="input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your registered email"
                        required
                    />
                </div>

                {err && <div style={{ marginTop: ".7rem", color: "#ffd2d7" }}>{err}</div>}

                <div style={{ marginTop: "1rem", display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
                    <button className="btn btnPrimary" type="submit" disabled={loading}>
                        {loading ? "⏳ Sending..." : "Send Reset Link"}
                    </button>
                    <button className="btn btnGhost" type="button" onClick={() => nav("/login")}>
                        Back to Login
                    </button>
                </div>
            </form>
        </section>
    );
}
