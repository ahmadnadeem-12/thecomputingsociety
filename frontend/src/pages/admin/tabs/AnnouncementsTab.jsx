
import React from "react";
import { deleteAnnouncement } from "../../../services/announcementService";

export default function AnnouncementsTab({
    announcements,
    openAnnouncementCreate,
    openAnnouncementEdit,
    refresh
}) {
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".6rem" }}>
                <div className="sectionSubtitle">Manage announcements (full CRUD access)</div>
                <button
                    className="btn btnPrimary"
                    onClick={openAnnouncementCreate}
                    aria-label="Add new announcement"
                >
                    + Add Announcement
                </button>
            </div>
            <div className="hr" />
            <div style={{ display: "grid", gap: "1rem" }}>
                {announcements.map(a => (
                    <div key={a.id} className="card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                                    <div style={{ fontWeight: 900 }}>{a.title}</div>
                                    <span
                                        className={`pill ${a.priority === "urgent" ? "pillRed" : ""}`}
                                        style={{ fontSize: ".65rem" }}
                                    >
                                        {a.priority}
                                    </span>
                                </div>
                                <div className="sectionSubtitle" style={{ marginTop: ".3rem" }}>
                                    {a.body?.slice(0, 100)}...
                                </div>
                                <div style={{ display: "flex", gap: ".35rem", flexWrap: "wrap", marginTop: ".5rem" }}>
                                    {(a.tags || []).map(t => (
                                        <span key={t} className="pill" style={{ fontSize: ".65rem" }}>{t}</span>
                                    ))}
                                </div>
                            </div>
                            <div style={{ fontSize: ".75rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                                {a.date}
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: ".5rem", marginTop: ".75rem" }}>
                            <button
                                className="btn btnGhost"
                                onClick={() => openAnnouncementEdit(a)}
                                aria-label={`Edit ${a.title}`}
                            >
                                Edit
                            </button>
                            <button
                                className="btn btnGhost"
                                onClick={() => { deleteAnnouncement(a.id); refresh(); }}
                                aria-label={`Delete ${a.title}`}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
                {announcements.length === 0 && (
                    <div className="sectionSubtitle">No announcements yet.</div>
                )}
            </div>
        </div>
    );
}
