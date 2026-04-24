/**
 * PDF Service for TCS Tickets
 * Generates professional PDF tickets with logo, QR code, and all details
 */

import { jsPDF } from 'jspdf';

// TCS Logo as base64 (gradient circle with TCS text)
// This is a simplified version - in production, use actual logo file
const TCS_LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF8WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDg4LCAyMDIwLzA3LzEwLTIyOjA2OjUzICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjIuMCAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDI0LTAxLTE1VDEyOjAwOjAwKzA1OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNC0wMS0xNVQxMjowMDowMCswNTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNC0wMS0xNVQxMjowMDowMCswNTowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6YTEyMzQ1NjctODkwYS0xMWVkLTAwMDAtMDAwMDAwMDAwMDAwIiB4bXBNTTpEb2N1bWVudElEPSJ4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';

/**
 * Draw the TCS logo (white circle with TCS text - like website)
 * @param {jsPDF} doc - The PDF document
 * @param {number} x - X position (center)
 * @param {number} y - Y position (center)
 * @param {number} size - Logo size (diameter)
 */
function drawTCSLogo(doc, x, y, size) {
    const radius = size / 2;

    // White circle background (main logo)
    doc.setFillColor(255, 255, 255);
    doc.circle(x, y, radius, 'F');

    // TCS Text in red/pink gradient color
    doc.setFontSize(size * 0.38);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 39, 67); // Primary red
    doc.text('TCS', x, y + size * 0.13, { align: 'center' });
}

/**
 * Draw one ticket card on the doc at position (oX, oY)
 * Card size: 190mm wide × 88mm tall — matches frontend .horizontalTicket
 */
function drawTicketCard(doc, t, qr, oX, oY) {
    const CW = 190; // card width
    const CH = 55;   // Ultra-slim height to fit 5 per page

    // --- Card Background ---
    doc.setFillColor(22, 14, 38);
    doc.roundedRect(oX, oY, CW, CH, 4, 4, 'F');

    // Card border
    doc.setDrawColor(255, 255, 255, 0.1);
    doc.setLineWidth(0.2);
    doc.roundedRect(oX, oY, CW, CH, 4, 4, 'S');

    // --- Left Glow Bar ---
    doc.setFillColor(220, 39, 67);
    doc.rect(oX, oY + 3, 1, CH - 6, 'F');

    // === QR CODE SECTION ===
    const qrBoxSize = 30; // Compact QR
    const qrPad = 1.5;
    const qrX = oX + 10;
    const qrY = oY + (CH - qrBoxSize - 6) / 2;

    doc.setFillColor(248, 248, 248);
    doc.roundedRect(qrX, qrY, qrBoxSize, qrBoxSize, 2, 2, 'F');

    if (qr) {
        doc.addImage(qr, 'PNG', qrX + qrPad, qrY + qrPad, qrBoxSize - qrPad * 2, qrBoxSize - qrPad * 2);
    }

    doc.setFontSize(5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(130, 120, 145);
    doc.text('SCAN AT ENTRY', qrX + qrBoxSize / 2, qrY + qrBoxSize + 5, { align: 'center' });

    // === DETAILS SECTION ===
    const dx = qrX + qrBoxSize + 10;
    let dy = oY + 9;

    // Event Title
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 77, 109);
    const maxTitleW = CW - (dx - oX) - 10;
    const titleLines = doc.splitTextToSize(String(t.eventTitle || 'TCS Event'), maxTitleW);
    doc.text(titleLines[0], dx, dy);

    dy += 6;

    // --- Detail Grid ---
    const cols = [
        { label: 'DATE',           value: String(t.eventDate || 'TBA'),     x: 0   },
        { label: 'TIME',           value: String(t.eventTime || 'TBA'),     x: 25  },
        { label: 'DEPARTMENT',     value: String(t.department || 'CS'),      x: 52  },
        { label: 'SEMESTER',       value: String(t.semester || '-'),         x: 76  },
        { label: 'AG NO',          value: String(t.agNo || '-'),            x: 92 },
    ];

    doc.setFontSize(4.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(130, 120, 145);
    cols.forEach(c => doc.text(c.label, dx + c.x, dy));

    dy += 3;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(240, 240, 255);
    cols.forEach(c => doc.text(c.value, dx + c.x, dy));

    dy += 6;
    // Email row
    doc.setFontSize(4.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(130, 120, 145);
    doc.text('EMAIL', dx, dy);
    dy += 3;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(240, 240, 255);
    doc.text(String(t.email || '-'), dx, dy);

    dy += 6;
    // Issued to
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 210);
    doc.text('Issued to:', dx, dy);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(String(t.name || '-'), dx + doc.getTextWidth('Issued to: ') + 0.5, dy);

    dy += 6;
    // Ticket ID pill
    const tidStr = String(t.publicTicketId || t.id || '-');
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    const labelPart = 'Ticket ID:  ';
    doc.setFont('courier', 'bold');
    const pillTextW = doc.getTextWidth(labelPart + tidStr);
    const pillW = pillTextW + 8;
    const pillH = 6;

    // Pill background
    doc.setFillColor(0, 30, 50);
    doc.setDrawColor(0, 180, 220);
    doc.setLineWidth(0.2);
    doc.roundedRect(dx, dy - 4, pillW, pillH, 3, 3, 'FD');

    // "Ticket ID:" in gray
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(130, 120, 145);
    doc.text('Ticket ID:', dx + 3, dy);

    // Actual ID in cyan
    doc.setTextColor(0, 217, 255);
    doc.setFont('courier', 'bold');
    doc.text(tidStr, dx + 3 + doc.getTextWidth('Ticket ID:  '), dy);

    // --- Subtle Watermark ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255, 0.05);
    doc.text('THE COMPUTING SOCIETY', CW - 5, CH - 5, { align: 'right' });
}

// -------------------------------------------------------
// PUBLIC API
// -------------------------------------------------------

/**
 * Generate a single-ticket PDF (one card centered on A4)
 */
export function generateTicketPDF(ticketData, qrCodeDataUrl) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const cardW = 190;
    const cardH = 55;
    const oX = (pageW - cardW) / 2;
    const oY = 10;

    // Page background
    doc.setFillColor(10, 8, 18);
    doc.rect(0, 0, pageW, doc.internal.pageSize.getHeight(), 'F');

    drawTicketCard(doc, ticketData, qrCodeDataUrl, oX, oY);
    return doc;
}

/**
 * Download single ticket
 */
export function downloadTicketPDF(ticketData, qrCodeDataUrl) {
    try {
        const doc = generateTicketPDF(ticketData, qrCodeDataUrl);
        const fileName = `TCS_Ticket_${(ticketData.agNo || 'ticket')}.pdf`;
        doc.save(fileName);
        return fileName;
    } catch (err) {
        console.error("Ticket download failed:", err);
        return null;
    }
}

/**
 * Download ALL tickets — A4 portrait, up to 3 tickets stacked per page
 */
export function downloadAllTicketsPDF(tickets, qrCodeDataUrls) {
    if (!tickets || tickets.length === 0) return;

    try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageW = 210;
        const pageH = 297;
        const cardW = 190;
        const cardH = 55;
        const oX = (pageW - cardW) / 2;
        const gap = 3;
        const topMargin = 5;
        const cardsPerPage = 5;

        tickets.forEach((t, index) => {
            const posOnPage = index % cardsPerPage;
            if (index > 0 && posOnPage === 0) {
                doc.addPage('a4', 'portrait');
            }

            if (posOnPage === 0) {
                doc.setFillColor(10, 8, 18);
                doc.rect(0, 0, pageW, pageH, 'F');
            }

            const oY = topMargin + posOnPage * (cardH + gap);
            drawTicketCard(doc, t, qrCodeDataUrls[index], oX, oY);
        });

        const fileName = `TCS_All_Tickets_${new Date().toISOString().slice(0, 10)}.pdf`;
        doc.save(fileName);
    } catch (err) {
        console.error("Multi-ticket download failed:", err);
    }
}

/**
 * Get PDF as base64 string (for email attachment)
 * @param {Object} ticketData - Ticket information
 * @param {string} qrCodeDataUrl - QR code as base64
 * @returns {string} - PDF as base64 string
 */
export function getPDFAsBase64(ticketData, qrCodeDataUrl) {
    const doc = generateTicketPDF(ticketData, qrCodeDataUrl);
    return doc.output('datauristring');
}

/**
 * Get PDF as Blob (for email attachment)
 * @param {Object} ticketData - Ticket information
 * @param {string} qrCodeDataUrl - QR code as base64
 * @returns {Blob} - PDF as Blob
 */
export function getPDFAsBlob(ticketData, qrCodeDataUrl) {
    const doc = generateTicketPDF(ticketData, qrCodeDataUrl);
    return doc.output('blob');
}

// ============================================
// CERTIFICATE OF PARTICIPATION
// Premium dark/gold design
// ============================================

/**
 * Generate a premium event participation certificate
 * @param {Object} data
 * @param {string} data.name - Participant name
 * @param {string} data.agNo - AG number
 * @param {string} data.eventTitle - Event title
 * @param {string} data.eventDate - Event date (formatted string)
 * @param {string} data.eventTime - Event time
 * @param {string} data.venue - Event venue
 * @param {string} data.organizer - Organizer name (for signature)
 * @param {string} data.description - Brief event description
 * @returns {jsPDF}
 */
export function generateCertificatePDF(data) {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
    });

    const W = doc.internal.pageSize.getWidth();   // 297
    const H = doc.internal.pageSize.getHeight();   // 210

    // ---- BACKGROUND ----
    doc.setFillColor(20, 20, 22); // Charcoal / Almost Black
    doc.rect(0, 0, W, H, 'F');

    // ---- CORNER CURVES (Using large circles for smooth curves) ----

    // 1. Top-Left Red Curve Area
    // Dark Shadow Layer
    doc.setFillColor(35, 35, 40);
    doc.circle(-20, -20, 110, 'F');
    // Red Layer
    doc.setFillColor(180, 20, 35); // Vibrant Red
    doc.circle(-20, -20, 100, 'F');

    // 2. Bottom-Right Red Curve Area
    // Dark Shadow Layer
    doc.setFillColor(35, 35, 40);
    doc.circle(W + 20, H + 20, 110, 'F');
    // Red Layer
    doc.setFillColor(180, 20, 35);
    doc.circle(W + 20, H + 20, 100, 'F');

    // Add some sharp accent triangles for depth (Standard methods)
    doc.setFillColor(140, 15, 30);
    doc.triangle(0, 0, 50, 0, 0, 50, 'F');
    doc.triangle(W, H, W - 50, H, W, H - 50, 'F');

    // ---- GOLD SEAL / BADGE (Top Left) ----
    const sealX = 45;
    const sealY = 45;

    // Ribbons
    doc.setFillColor(212, 175, 55); // Gold
    doc.triangle(sealX - 8, sealY + 10, sealX - 15, sealY + 35, sealX - 2, sealY + 25, 'F');
    doc.triangle(sealX + 8, sealY + 10, sealX + 15, sealY + 35, sealX + 2, sealY + 25, 'F');

    // Circle Badge
    doc.setFillColor(212, 175, 55);
    doc.circle(sealX, sealY, 15, 'F');
    doc.setDrawColor(180, 140, 40);
    doc.setLineWidth(0.5);
    doc.circle(sealX, sealY, 13, 'S');

    // TCS Text in Badge
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 22);
    doc.text('TCS', sealX, sealY + 1, { align: 'center' });
    doc.setFontSize(4);
    doc.text('AWARD', sealX, sealY + 4, { align: 'center' });

    // ---- MAIN TEXT CONTENT ----
    let y = 60;

    // "CERTIFICATE"
    doc.setFontSize(48);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('CERTIFICATE', W / 2 + 20, y, { align: 'center' });

    y += 12;
    // "OF PARTICIPATION"
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('OF PARTICIPATION', W / 2 + 15, y, { align: 'center' });

    y += 15;
    // Gold Thin Line
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.line(W / 2 - 50, y, W / 2 + 80, y);

    y += 20;
    // "PROUDLY PRESENTED TO"
    doc.setFontSize(10);
    doc.setTextColor(180, 180, 190);
    doc.text('PROUDLY PRESENTED TO', W / 2 + 15, y, { align: 'center' });

    y += 18;
    // Participant Name (Elegant Script-like)
    doc.setFontSize(42);
    doc.setFont('times', 'bolditalic');
    doc.setTextColor(212, 175, 55); // Gold
    doc.text((data.name || 'Name').toUpperCase(), W / 2 + 20, y, { align: 'center' });

    y += 12;
    // AG No
    if (data.agNo) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(212, 175, 55);
        doc.text(`AG No: ${data.agNo}`, W / 2 + 20, y, { align: 'center' });
    }

    y += 15;
    // Short Description (Enlarged)
    doc.setFontSize(11);
    doc.setTextColor(160, 160, 170);
    const descText = data.certificateDescription || data.description || `For participating in "${data.eventTitle || 'TCS Event'}" organized by The Computing Society, University of Agriculture Faisalabad.`;
    const descLines = doc.splitTextToSize(descText, 170);
    doc.text(descLines, W / 2 + 20, y, { align: 'center' });

    // ---- Event Details Box (Clean) ----
    y += 18;
    const boxW = 160;
    const boxX = (W - boxW) / 2 + 20;
    doc.setDrawColor(212, 175, 55, 0.5);
    doc.setLineWidth(0.2);
    doc.roundedRect(boxX, y, boxW, 18, 2, 2, 'S');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(212, 175, 55);
    const col1 = boxX + boxW / 4;
    const col2 = boxX + (boxW * 3) / 4;
    doc.text('EVENT', col1, y + 6, { align: 'center' });
    doc.text('DATE', col2, y + 6, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(data.eventTitle || 'TCS Event', col1, y + 13, { align: 'center' });
    doc.text(data.eventDate || 'TBA', col2, y + 13, { align: 'center' });

    // ---- SIGNATURES ----
    y += 28; // Reduced from 35 to prevent overlap with footer at bottom
    const sigWidth = 60;
    const leftSigX = W / 2 - 50;
    const rightSigX = W / 2 + 60;

    // Left: Date
    doc.setDrawColor(212, 175, 55);
    doc.line(leftSigX - sigWidth / 2, y, leftSigX + sigWidth / 2, y);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 160);
    doc.text('DATE', leftSigX, y + 5, { align: 'center' });
    doc.setTextColor(255, 255, 255);
    doc.text(data.eventDate || new Date().toLocaleDateString(), leftSigX, y - 3, { align: 'center' });

    // Right: Signature
    doc.line(rightSigX - sigWidth / 2, y, rightSigX + sigWidth / 2, y);
    doc.setTextColor(150, 150, 160);
    doc.text('SIGNATURE', rightSigX, y + 5, { align: 'center' });
    doc.setTextColor(255, 255, 255);
    doc.text(data.organizer || 'The Computing Society', rightSigX, y - 3, { align: 'center' });

    // ---- FOOTER ----
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 110);
    doc.text('© The Computing Society — Department of Computer Science, University of Agriculture Faisalabad', W / 2, H - 10, { align: 'center' });

    return doc;
}

export function downloadCertificatePDF(data) {
    try {
        const doc = generateCertificatePDF(data);

        // Final filename
        const safeName = (data.name || 'Participant').trim().replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `TCS_Certificate_${safeName}.pdf`;

        // Manual download method (more robust for filename/extension)
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);

        return fileName;
    } catch (err) {
        console.error("Certificate download failed:", err);
        return null;
    }
}
