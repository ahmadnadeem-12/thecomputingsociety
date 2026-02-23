
import React from "react";
import { deleteProgram } from "../../../services/programService";

export default function ProgramsTab({
    programs,
    openProgramCreate,
    openProgramEdit,
    refresh
}) {
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".6rem" }}>
                <div className="sectionSubtitle">Manage programs (full CRUD access)</div>
                <button
                    className="btn btnPrimary"
                    onClick={openProgramCreate}
                    aria-label="Add new program"
                >
                    + Add Program
                </button>
            </div>
            <div className="hr" />
            <div className="cardGrid">
                {programs.map(p => (
                    <div key={p.id} className="card">
                        <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
                            <div style={{ fontSize: "2rem" }}>{p.icon}</div>
                            <div>
                                <div style={{ fontWeight: 900 }}>{p.title}</div>
                                <div className="sectionSubtitle">{p.type} • {p.duration}</div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: ".35rem", flexWrap: "wrap", marginTop: ".5rem" }}>
                            <span className="pill">{p.status}</span>
                            {(p.tags || []).slice(0, 2).map(t => (
                                <span key={t} className="pill" style={{ fontSize: ".65rem" }}>{t}</span>
                            ))}
                        </div>
                        <div style={{ display: "flex", gap: ".5rem", marginTop: ".75rem" }}>
                            <button
                                className="btn btnGhost"
                                onClick={() => openProgramEdit(p)}
                                aria-label={`Edit ${p.title}`}
                            >
                                Edit
                            </button>
                            <button
                                className="btn btnGhost"
                                onClick={() => { deleteProgram(p.id); refresh(); }}
                                aria-label={`Delete ${p.title}`}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
                {programs.length === 0 && (
                    <div className="sectionSubtitle">No programs yet.</div>
                )}
            </div>
        </div>
    );
}
