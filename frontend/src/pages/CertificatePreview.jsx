import { useLocation, useNavigate } from "react-router-dom";
import { downloadCertificatePDF } from "../services/pdfService";
import "../assets/styles/pages/certificate-preview.css";

/* ── Small SVG icons (exactly like the reference image) ── */
const CalendarSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <rect x="7" y="14" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const PenSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const Dots = ({ n = 18 }) =>
  Array.from({ length: n }, (_, i) => <div key={i} className="dotG" />);

export default function CertificatePreview() {
  const location = useLocation();
  const nav = useNavigate();
  
  // Get data from location state or fallback to hardcoded (for testing)
  const d = location.state || {
    name: "Sample Name",
    agNo: "20xx-AG-xxxx",
    eventTitle: "Industry Expert Talk Series",
    eventDate: "2026-01-10",
    description: 'For participating in "Industry Expert Talk Series" organized by The Computing Society, University of Agriculture Faisalabad.'
  };

  return (
    <section className="section">
      <div className="certPreviewPage">
        <div className="certFrame">
          <div className="certCard">
            {/* corners */}
            <div className="cornerTL" />
            <div className="cornerBL" />
            <div className="cornerBR" />
            <div className="accentBar" />

            {/* dot grids */}
            <div className="dotGrid dotGrid--tl"><Dots /></div>
            <div className="dotGrid dotGrid--br"><Dots /></div>

            {/* ── content ── */}
            <div className="certBody">
              {/* Society header */}
              <div className="certSociety">THE COMPUTING SOCIETY</div>
              <div className="certHeaderLines">
                <div className="hLine hLine--pink" />
                <div className="hDot hDot--pink" />
                <div className="hDot hDot--blue" />
                <div className="hLine hLine--blue" />
              </div>
              <div className="certDept">
                DEPT. OF COMPUTER SCIENCE,<br />
                UNIVERSITY OF AGRICULTURE FAISALABAD
              </div>

              {/* Title */}
              <h1 className="certTitle">AWARD CERTIFICATE</h1>

              {/* Subtitle */}
              <div className="certSubRow">
                <div className="diamLine diamLine--l" />
                <div className="diam" />
                <span className="certSubText">OF PARTICIPATION</span>
                <div className="diam" />
                <div className="diamLine diamLine--r" />
              </div>

              {/* Recipient */}
              <div className="certPresented">PROUDLY PRESENTED TO</div>
              <h2 className="certName">{d.name}</h2>

              {/* AG pill */}
              <div className="certAg">AG No: {d.agNo}</div>

              {/* Description */}
              <p className="certDesc">
                For participating in <strong>"{d.eventTitle}"</strong> organized by
                The Computing Society, University of Agriculture Faisalabad.
              </p>

              {/* ══ Footer ══ */}
              <div className="certFooter">
                {/* Left — Event Date */}
                <div className="fCol">
                  <div className="fIcon"><CalendarSvg /></div>
                  <div className="fLabel fLabel--pink">EVENT DATE</div>
                  <div className="fValue">{d.eventTitle}</div>
                  <div className="fValue">{d.eventDate}</div>
                </div>

                <div className="fDiv" />

                {/* Centre — Date + Badge */}
                <div className="fCol fCentre">
                  <div className="fIcon"><CalendarSvg /></div>
                  <div className="fLabel fLabel--blue">DATE</div>
                  <div className="fValue" style={{ marginBottom: "0.8rem" }}>
                    {d.eventDate}
                  </div>

                  {/* Badge seal */}
                  <div className="badgeSeal">
                    <div className="badgeStar" />
                    <div className="badgeRing">
                      <span className="badgeStars">★ ★ ★</span>
                      <span className="badgeCode">&lt;/&gt;</span>
                    </div>
                  </div>
                </div>

                <div className="fDiv" />

                {/* Right — Signature */}
                <div className="fCol">
                  <div className="fIcon"><PenSvg /></div>
                  <div className="fLabel fLabel--blue">SIGNATURE</div>
                  <div className="fSig">The Computing Society</div>
                  <div className="fSigLine" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="certActions">
          <button
            className="btn btnPrimary"
            style={{ padding: "0.9rem 2.5rem", borderRadius: 50, fontSize: "1rem" }}
            onClick={() => downloadCertificatePDF(d)}
          >
            📥 Download PDF Certificate
          </button>
          <button className="btn btnGhost" onClick={() => window.history.back()}>
            ← Go Back
          </button>
        </div>
      </div>
    </section>
  );
}
