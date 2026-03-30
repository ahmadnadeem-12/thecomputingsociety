
import React from "react";
import { downloadCertificatePDF } from "../services/pdfService";
import "../assets/styles/pages/certificate-preview.css";

// Sample data for the certificate preview
const SAMPLE_DATA = {
    name: "Muhammad Ahmad",
    agNo: "2022-AG-9800",
    eventTitle: "Tech Fusion 2025",
    eventDate: "March 15, 2025",
    eventTime: "10:00 AM",
    venue: "UAF Auditorium",
    organizer: "The Computing Society",
    description:
        'For outstanding participation in "Tech Fusion 2025" — a flagship technology event organized by The Computing Society, Department of Computer Science, University of Agriculture Faisalabad. This certificate recognizes your dedication and contribution to the advancement of computing knowledge.',
};

export default function CertificatePreview() {
    const handleDownload = () => {
        downloadCertificatePDF(SAMPLE_DATA);
    };

    return (
        <section className="section">
            <div className="certPreviewPage">
                {/* Header */}
                <div className="certPreviewHeader">
                    <div className="sectionTitle">Certificate Preview</div>
                    <div className="sectionSubtitle">
                        Participants who attend events will receive this official certificate
                        of participation from The Computing Society.
                    </div>
                </div>

                {/* Certificate Visual Card */}
                <div className="certificateCard">
                    {/* Background Image */}

                    {/* Red Corner Decorations */}
                    <div className="certCornerTL" />
                    <div className="certCornerBR" />

                    {/* Gold Seal Badge */}
                    <div className="certSeal">
                        <div className="certSealCircle">
                            <span>TCS</span>
                            <span>AWARD</span>
                        </div>
                        <div className="certSealRibbon" />
                    </div>

                    {/* Main Content Overlay */}
                    <div className="certOverlay">
                        <h1 className="certTitle">CERTIFICATE</h1>
                        <div className="certOfText">OF PARTICIPATION</div>
                        <div className="certGoldLine" />

                        <div className="certPresentedTo">PROUDLY PRESENTED TO</div>
                        <div className="certName">{SAMPLE_DATA.name}</div>
                        <div className="certAgNo">AG No: {SAMPLE_DATA.agNo}</div>

                        <div className="certDescription">{SAMPLE_DATA.description}</div>

                        {/* Event Details — Event & Date centered side by side */}
                        <div className="certEventBox">
                            <div className="certEventCol">
                                <span className="certEventLabel">Event</span>
                                <span className="certEventValue">
                                    {SAMPLE_DATA.eventTitle}
                                </span>
                            </div>
                            <div className="certEventCol">
                                <span className="certEventLabel">Date</span>
                                <span className="certEventValue">{SAMPLE_DATA.eventDate}</span>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="certSignatures">
                            <div className="certSigBlock">
                                <div className="certSigValue">{SAMPLE_DATA.eventDate}</div>
                                <div className="certSigLine" />
                                <div className="certSigLabel">DATE</div>
                            </div>
                            <div className="certSigBlock">
                                <div className="certSigValue">{SAMPLE_DATA.organizer}</div>
                                <div className="certSigLine" />
                                <div className="certSigLabel">SIGNATURE</div>
                            </div>
                        </div>
                    </div>

                    {/* Footer — outside overlay, pinned to bottom of card */}
                    <div className="certFooter">
                        © The Computing Society — Department of Computer Science,
                        University of Agriculture Faisalabad
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="certActions">
                    <button className="btn btnPrimary" onClick={handleDownload}>
                        📥 Download Sample Certificate
                    </button>
                    <button
                        className="btn btnGhost"
                        onClick={() => window.history.back()}
                    >
                        ← Go Back
                    </button>
                </div>

                {/* Info Cards */}
                <div className="certInfoSection">
                    <div className="sectionTitle" style={{ fontSize: "1.2rem" }}>
                        How to Get Your Certificate
                    </div>
                    <div className="certInfoGrid">
                        <div className="certInfoCard">
                            <h4>🎟️ Register for Event</h4>
                            <p>
                                Go to the Tickets page and register for an upcoming event with
                                your AG Number.
                            </p>
                        </div>
                        <div className="certInfoCard">
                            <h4>✅ Attend the Event</h4>
                            <p>
                                Show your QR ticket at the event entrance. Your attendance will
                                be marked automatically.
                            </p>
                        </div>
                        <div className="certInfoCard">
                            <h4>📜 Download Certificate</h4>
                            <p>
                                After attending, go to My Tickets and click the "Certificate"
                                button to download your PDF certificate.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
