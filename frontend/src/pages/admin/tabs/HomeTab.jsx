
import React from "react";
import { getHomeContent, resetHomeContent } from "../../../services/homeService";

export default function HomeTab({
    homeContent,
    openHomeEdit,
    refresh
}) {
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".6rem" }}>
                <div className="sectionSubtitle">Edit home page content (hero, stats, notices, features)</div>
                <button
                    className="btn btnPrimary"
                    onClick={openHomeEdit}
                    aria-label="Edit home content"
                >
                    ✏️ Edit Home Content
                </button>
            </div>
            <div className="hr" />

            <div className="cardGrid">
                <div className="card">
                    <div style={{ fontWeight: 900 }}>Hero Title</div>
                    <div className="sectionSubtitle" style={{ marginTop: ".3rem" }}>
                        {homeContent.heroTitle?.line1} {homeContent.heroTitle?.line2} {homeContent.heroTitle?.line3}
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontWeight: 900 }}>Stats ({homeContent.stats?.length || 0})</div>
                    <div className="sectionSubtitle" style={{ marginTop: ".3rem" }}>
                        {homeContent.stats?.map(s => s.number).join(" • ")}
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontWeight: 900 }}>Notices ({homeContent.notices?.length || 0})</div>
                    <div className="sectionSubtitle" style={{ marginTop: ".3rem" }}>
                        {homeContent.notices?.map(n => n.title).join(", ")}
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontWeight: 900 }}>Features ({homeContent.features?.length || 0})</div>
                    <div className="sectionSubtitle" style={{ marginTop: ".3rem" }}>
                        {homeContent.features?.map(f => f.title).join(", ")}
                    </div>
                </div>
            </div>

            <button
                className="btn btnGhost"
                style={{ marginTop: "1rem" }}
                onClick={() => { resetHomeContent(); refresh(); }}
                aria-label="Reset home content to defaults"
            >
                Reset to Defaults
            </button>
        </div>
    );
}
