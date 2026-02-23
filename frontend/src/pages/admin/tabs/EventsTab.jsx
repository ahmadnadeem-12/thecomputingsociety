
import React from "react";
import { formatDate } from "../../../utils/helpers";

export default function EventsTab({
    events,
    eventsCtx,
    openEventCreate,
    openEventEdit
}) {
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".6rem" }}>
                <div className="sectionSubtitle">Manage events</div>
                <button
                    className="btn btnPrimary"
                    onClick={openEventCreate}
                    aria-label="Add new event"
                >
                    + Add Event
                </button>
            </div>
            <div className="hr" />
            <div className="cardGrid">
                {events.map(e => (
                    <div key={e.id} className="card">
                        <div style={{ fontWeight: 900 }}>{e.title}</div>
                        <div className="sectionSubtitle" style={{ marginTop: ".25rem" }}>
                            {formatDate(e.date)} • {e.venue}
                        </div>
                        <div style={{ display: "flex", gap: ".35rem", flexWrap: "wrap", marginTop: ".5rem" }}>
                            {e.featured && <span className="pill pillRed">Featured</span>}
                            <span className="pill">{e.status}</span>
                        </div>
                        <div style={{ display: "flex", gap: ".5rem", marginTop: ".75rem" }}>
                            <button
                                className="btn btnGhost"
                                onClick={() => openEventEdit(e)}
                                aria-label={`Edit ${e.title}`}
                            >
                                Edit
                            </button>
                            <button
                                className="btn btnGhost"
                                onClick={() => eventsCtx.remove(e.id)}
                                aria-label={`Delete ${e.title}`}
                            >
                                Delete
                            </button>
                            <button
                                className="btn btnPrimary"
                                style={{ fontSize: ".75rem", padding: ".4rem .7rem" }}
                                onClick={() => eventsCtx.update(e.id, { featured: !e.featured })}
                                aria-label={e.featured ? "Remove from featured" : "Add to featured"}
                            >
                                {e.featured ? "Unfeature" : "Feature"}
                            </button>
                        </div>
                    </div>
                ))}
                {events.length === 0 && (
                    <div className="sectionSubtitle">No events yet. Create your first event!</div>
                )}
            </div>
        </div>
    );
}
