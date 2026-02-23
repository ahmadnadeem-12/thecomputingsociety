
import React, { useContext, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { EventContext } from "../context/EventContext";
import { formatDate } from "../utils/helpers";

export default function EventDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const eventsCtx = useContext(EventContext);

  const event = useMemo(() => (eventsCtx.events || []).find(e => (e._id || e.id) === id), [eventsCtx.events, eventsCtx.version, id]);

  if (!event) {
    return (
      <section className="section">
        <div className="sectionTitle">Event not found</div>
        <div className="sectionSubtitle" style={{ marginTop: ".4rem" }}>The event id is invalid.</div>
        <div style={{ marginTop: ".9rem" }}>
          <button className="btn btnGhost" onClick={() => nav(-1)}>Go Back</button>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="sectionHeader">
        <div>
          <div className="sectionTitle">{event.title}</div>
          <div className="sectionSubtitle">
            {formatDate(event.date)} • {event.time} • {event.venue}
          </div>
        </div>
        {event.featured ? <div className="pill pillRed">Featured</div> : <div className="pill">Event</div>}
      </div>

      <div className="card">
        <div style={{ color: "var(--text-muted)", fontSize: ".92rem", lineHeight: 1.6 }}>
          {event.description}
        </div>

        <div className="hr" />

        <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
          <Link to="/tickets" className="btn btnPrimary">Register / Ticket</Link>
          <button className="btn btnGhost" onClick={() => nav(-1)}>Back</button>
        </div>
      </div>
    </section>
  );
}