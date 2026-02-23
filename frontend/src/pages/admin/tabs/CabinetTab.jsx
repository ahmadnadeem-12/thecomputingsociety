
import React from "react";

export default function CabinetTab({
    cabinet,
    openPersonCreate,
    openPersonEdit,
    deletePerson
}) {
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".6rem" }}>
                <div className="sectionSubtitle">Manage cabinet members</div>
                <button
                    className="btn btnPrimary"
                    onClick={() => openPersonCreate("cabinet")}
                    aria-label="Add new cabinet member"
                >
                    + Add Member
                </button>
            </div>
            <div className="hr" />
            <div className="cardGrid">
                {cabinet.map(m => (
                    <div key={m.id} className="card">
                        <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
                            <div className="dpWrap" style={{ width: 50, height: 50 }}>
                                <div className="dpInner">
                                    <img src={m.avatar} alt={`${m.name} profile`} loading="lazy" />
                                </div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 900 }}>{m.name}</div>
                                <div className="sectionSubtitle">{m.role}</div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: ".5rem", marginTop: ".75rem" }}>
                            <button
                                className="btn btnGhost"
                                onClick={() => openPersonEdit(m, "cabinet")}
                                aria-label={`Edit ${m.name}`}
                            >
                                Edit
                            </button>
                            <button
                                className="btn btnGhost"
                                onClick={() => deletePerson(m.id, "cabinet")}
                                aria-label={`Delete ${m.name}`}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
                {cabinet.length === 0 && (
                    <div className="sectionSubtitle">No cabinet members yet. Add one to get started.</div>
                )}
            </div>
        </div>
    );
}
