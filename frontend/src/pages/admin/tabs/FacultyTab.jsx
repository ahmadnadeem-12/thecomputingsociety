import React from "react";
export default function FacultyTab({
    faculty,
    openPersonCreate,
    openPersonEdit,
    deletePerson
}) {
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".6rem" }}>
                <div className="sectionSubtitle">Manage faculty members</div>
                <button
                    className="btn btnPrimary"
                    onClick={() => openPersonCreate("faculty")}
                    aria-label="Add new faculty member"
                >
                    + Add Faculty
                </button>
            </div>
            <div className="hr" />
            <div className="cardGrid">
                {faculty.map(f => (
                    <div key={f.id} className="card">
                        <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
                            <div className="dpWrap" style={{ width: 50, height: 50 }}>
                                <div className="dpInner">
                                    <img src={f.avatar} alt={`${f.name} profile`} loading="lazy" />
                                </div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 900 }}>{f.name}</div>
                                <div className="sectionSubtitle">{f.departmentRole}</div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: ".5rem", marginTop: ".75rem" }}>
                            <button
                                className="btn btnGhost"
                                onClick={() => openPersonEdit(f, "faculty")}
                                aria-label={`Edit ${f.name}`}
                            >
                                Edit
                            </button>
                            <button
                                className="btn btnGhost"
                                onClick={() => deletePerson(f.id, "faculty")}
                                aria-label={`Delete ${f.name}`}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
                {faculty.length === 0 && (
                    <div className="sectionSubtitle">No faculty members yet. Add one to get started.</div>
                )}
            </div>
        </div>
    );
}
