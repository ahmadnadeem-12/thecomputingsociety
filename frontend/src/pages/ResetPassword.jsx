
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";

export default function ResetPassword() {
    const nav = useNavigate();
    const { token } = useParams();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [done, setDone] = useState(false);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    if (!token) {
        return (
            <section className="section">
                <div className="sectionTitle">Invalid Link</div>
                <div className="sectionSubtitle" style={{ marginTop: ".5rem" }}>
                    This reset link is invalid or has expired.
                </div>
                <button className="btn btnPrimary" style={{ marginTop: "1rem" }} onClick={() => nav("/forgot-password")}>
                    Request New Link
                </button>
            </section>
        );
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");

        if (password.length < 6) {
            setErr("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirm) {
            setErr("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await api.post("/auth/reset-password", { token, newPassword: password });
            setDone(true);
        } catch (e2) {
            setErr(e2.response?.data?.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    if (done) {
        return (
            <section className="section" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
                <div className="sectionTitle" style={{ color: "#4ade80" }}>Password Reset Successful!</div>
                <div className="sectionSubtitle" style={{ marginTop: ".5rem" }}>
                    Your password has been updated. You can now login with your new password.
                </div>
                <button className="btn btnPrimary" style={{ marginTop: "1.5rem" }} onClick={() => nav("/login")}>
                    Go to Login
                </button>
            </section>
        );
    }

    return (
        <section className="section">
            <div className="sectionHeader">
                <div>
                    <div className="sectionTitle">Set New Password</div>
                    <div className="sectionSubtitle">Enter your new password below</div>
                </div>
                <div className="pill">🔑 Reset</div>
            </div>

            <form className="card" onSubmit={onSubmit} style={{ maxWidth: 560 }}>
                <div>
                    <div className="label">New Password</div>
                    <input
                        type="password"
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                        minLength={6}
                    />
                </div>
                <div style={{ marginTop: ".7rem" }}>
                    <div className="label">Confirm Password</div>
                    <input
                        type="password"
                        className="input"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Re-enter your password"
                        required
                    />
                </div>

                {err && <div style={{ marginTop: ".7rem", color: "#ffd2d7" }}>{err}</div>}

                <div style={{ marginTop: "1rem" }}>
                    <button className="btn btnPrimary" type="submit" disabled={loading}>
                        {loading ? "⏳ Updating..." : "Update Password"}
                    </button>
                </div>
            </form>
        </section>
    );
}
