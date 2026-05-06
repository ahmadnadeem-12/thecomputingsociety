import React from "react";
import "../../../assets/styles/pages/cabinet.css";

const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238c7f9c'><path fill-rule='evenodd' d='M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' clip-rule='evenodd' /></svg>";

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
                    <div key={m._id || m.id} className="card">
                        <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
                            <div className="dpWrap" style={{ width: 50, height: 50 }}>
                                <div className="dpInner">
                                    <img 
                                        src={m.avatar || DEFAULT_AVATAR} 
                                        alt={`${m.name} profile`} 
                                        loading="lazy" 
                                        onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                                    />
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
                                onClick={() => deletePerson(m._id || m.id, "cabinet")}
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
