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
 * Generate a ticket PDF
 * @param {Object} ticketData - All ticket information
 * @param {string} qrCodeDataUrl - QR code as base64 data URL
 * @returns {jsPDF} - The generated PDF document
 */
export function generateTicketPDF(ticketData, qrCodeDataUrl) {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = margin;

    // Background - Dark theme
    doc.setFillColor(15, 15, 26);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Header gradient bar - Left side (Red)
    doc.setFillColor(220, 39, 67);
    doc.rect(0, 0, pageWidth / 2, 50, 'F');

    // Header gradient bar - Right side (Pink/Magenta)
    doc.setFillColor(194, 52, 165);
    doc.rect(pageWidth / 2, 0, pageWidth / 2, 50, 'F');

    // Draw TCS Logo (centered at top)
    const logoY = 25;
    drawTCSLogo(doc, pageWidth / 2, logoY, 30);

    y = 65;

    // Title: THE COMPUTING SOCIETY
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');

    // Calculate positions for centered title
    const theText = 'THE ';
    const computingText = 'COMPUTING ';
    const societyText = 'SOCIETY';

    doc.setTextColor(255, 77, 109); // Red for THE
    const theWidth = doc.getTextWidth(theText);
    doc.setTextColor(199, 125, 255); // Purple for COMPUTING
    const computingWidth = doc.getTextWidth(computingText);
    doc.setTextColor(0, 217, 255); // Cyan for SOCIETY
    const societyWidth = doc.getTextWidth(societyText);

    const totalWidth = theWidth + computingWidth + societyWidth;
    const startX = (pageWidth - totalWidth) / 2;

    // Draw each word with its color
    doc.setTextColor(255, 77, 109);
    doc.text(theText, startX, y);

    doc.setTextColor(199, 125, 255);
    doc.text(computingText, startX + theWidth, y);

    doc.setTextColor(0, 217, 255);
    doc.text(societyText, startX + theWidth + computingWidth, y);

    y += 8;

    // Department subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(154, 143, 166);
    doc.text('Department of Computer Science, UAF', pageWidth / 2, y, { align: 'center' });

    y += 15;

    // Divider line
    doc.setDrawColor(58, 32, 80);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);

    y += 12;

    // Event Ticket Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('EVENT TICKET', pageWidth / 2, y, { align: 'center' });

    y += 10;

    // Event name
    doc.setFontSize(14);
    doc.setTextColor(0, 217, 255);
    doc.text(ticketData.eventTitle || 'TCS Event', pageWidth / 2, y, { align: 'center' });

    y += 15;

    // Ticket details box
    const boxX = margin;
    const boxY = y;
    const boxWidth = pageWidth - (margin * 2);
    const boxHeight = 65;

    // Box background
    doc.setFillColor(18, 12, 28);
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 5, 5, 'F');

    // Box border (gradient effect)
    doc.setDrawColor(194, 52, 165);
    doc.setLineWidth(0.8);
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 5, 5, 'S');

    // Details inside box - 2 columns
    const col1X = boxX + 12;
    const col2X = pageWidth / 2 + 10;
    let detailY = boxY + 15;

    const leftDetails = [
        { label: 'Full Name', value: ticketData.name },
        { label: 'Email', value: ticketData.email },
        { label: 'Semester', value: ticketData.semester },
    ];

    const rightDetails = [
        { label: 'AG Number', value: ticketData.agNo },
        { label: 'Department', value: ticketData.department },
        { label: 'Event Date', value: ticketData.eventDate || 'TBA' },
    ];

    doc.setFontSize(8);
    leftDetails.forEach((detail, index) => {
        const currentY = detailY + (index * 17);

        // Label
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(154, 143, 166);
        doc.text(detail.label + ':', col1X, currentY);

        // Value
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(String(detail.value || '-'), col1X, currentY + 5);
    });

    rightDetails.forEach((detail, index) => {
        const currentY = detailY + (index * 17);

        // Label
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(154, 143, 166);
        doc.text(detail.label + ':', col2X, currentY);

        // Value
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(String(detail.value || '-'), col2X, currentY + 5);
    });

    y = boxY + boxHeight + 15;

    // QR Code Section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 77, 109);
    doc.text('SCAN QR CODE AT ENTRY', pageWidth / 2, y, { align: 'center' });

    y += 8;

    // QR Code
    if (qrCodeDataUrl) {
        const qrSize = 45;
        const qrX = (pageWidth - qrSize) / 2;
        doc.addImage(qrCodeDataUrl, 'PNG', qrX, y, qrSize, qrSize);
        y += qrSize + 8;
    }

    // Ticket ID
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(154, 143, 166);
    doc.text('Ticket ID:', pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.setFontSize(9);
    doc.setTextColor(0, 217, 255);
    doc.text(ticketData.publicTicketId || ticketData.id, pageWidth / 2, y, { align: 'center' });

    y += 12;

    // Footer divider
    doc.setDrawColor(58, 32, 80);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);

    y += 6;

    // Footer text
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 95, 120);
    doc.text('This ticket is valid for one-time entry only. Present this QR code at the event entrance.', pageWidth / 2, y, { align: 'center' });
    y += 6;
    doc.setTextColor(154, 143, 166);
    doc.text('© The Computing Society - UAF | thecomputingsociety@gmail.com', pageWidth / 2, y, { align: 'center' });

    return doc;
}

/**
 * Generate and download ticket PDF
 * @param {Object} ticketData - Ticket information
 * @param {string} qrCodeDataUrl - QR code as base64
 * @returns {string} - File name
 */
export function downloadTicketPDF(ticketData, qrCodeDataUrl) {
    try {
        const doc = generateTicketPDF(ticketData, qrCodeDataUrl);
        const fileName = `TCS_Ticket_${(ticketData.agNo || 'ticket')}.pdf`;

        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);

        return fileName;
    } catch (err) {
        console.error("Ticket download failed:", err);
        return null;
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
    // Dark gradient background
    doc.setFillColor(15, 15, 26);
    doc.rect(0, 0, W, H, 'F');

    // Subtle darker overlay for depth
    doc.setFillColor(20, 10, 35);
    doc.rect(0, 0, W, H * 0.6, 'F');

    // ---- GOLD ACCENT CORNERS ----
    // Top-left gold triangle
    doc.setFillColor(212, 175, 55); // Gold #D4AF37
    doc.triangle(0, 0, 55, 0, 0, 55, 'F');
    // Darker inner triangle
    doc.setFillColor(178, 134, 0);
    doc.triangle(0, 0, 35, 0, 0, 35, 'F');

    // Top-right red accent
    doc.setFillColor(180, 30, 50);
    doc.triangle(W, 0, W - 55, 0, W, 55, 'F');
    doc.setFillColor(140, 20, 40);
    doc.triangle(W, 0, W - 35, 0, W, 35, 'F');

    // Bottom-left small accent
    doc.setFillColor(180, 30, 50);
    doc.triangle(0, H, 30, H, 0, H - 30, 'F');

    // Bottom-right gold accent
    doc.setFillColor(212, 175, 55);
    doc.triangle(W, H, W - 55, H, W, H - 55, 'F');
    doc.setFillColor(178, 134, 0);
    doc.triangle(W, H, W - 35, H, W, H - 35, 'F');

    // ---- GOLD ACCENT LINES ----
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.8);
    // Top sweeping line
    doc.line(55, 0, 0, 55);
    doc.line(W - 55, 0, W, 55);
    // Bottom sweeping line
    doc.line(0, H - 30, 30, H);
    doc.line(W, H - 55, W - 55, H);

    // ---- INNER BORDER ----
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.4);
    const bx = 18, by = 18;
    doc.roundedRect(bx, by, W - bx * 2, H - by * 2, 3, 3, 'S');
    // Inner double border
    doc.setLineWidth(0.2);
    doc.setDrawColor(212, 175, 55, 0.4);
    doc.roundedRect(bx + 3, by + 3, W - (bx + 3) * 2, H - (by + 3) * 2, 2, 2, 'S');

    // ---- TCS LOGO (top center) ----
    const logoY = 32;
    doc.setFillColor(212, 175, 55);
    doc.circle(W / 2, logoY, 12, 'F');
    doc.setFillColor(15, 15, 26);
    doc.circle(W / 2, logoY, 10, 'F');
    doc.setFillColor(212, 175, 55);
    doc.circle(W / 2, logoY, 9, 'F');
    // TCS Text inside badge
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 15, 26);
    doc.text('TCS', W / 2, logoY + 3.5, { align: 'center' });

    let y = logoY + 20;

    // ---- "CERTIFICATE" heading ----
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(212, 175, 55); // Gold
    doc.text('CERTIFICATE', W / 2, y, { align: 'center' });

    y += 10;

    // ---- "OF PARTICIPATION" ----
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 210);
    doc.text('OF PARTICIPATION', W / 2, y, { align: 'center' });

    y += 10;

    // ---- Gold divider ----
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.line(W / 2 - 50, y, W / 2 + 50, y);

    y += 10;

    // ---- "THIS CERTIFICATE IS PROUDLY PRESENTED TO" ----
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(154, 143, 166);
    doc.text('THIS CERTIFICATE IS PROUDLY PRESENTED TO', W / 2, y, { align: 'center' });

    y += 12;

    // ---- PARTICIPANT NAME (large elegant) ----
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text((data.name || 'Name').toUpperCase(), W / 2, y, { align: 'center' });

    y += 8;

    // ---- AG Number ----
    if (data.agNo) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(212, 175, 55);
        doc.text(`AG No: ${data.agNo}`, W / 2, y, { align: 'center' });
        y += 6;
    }

    y += 4;

    // ---- Event description text ----
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 180, 190);

    const descText = data.description
        ? data.description
        : `For participating in "${data.eventTitle || 'TCS Event'}" organized by The Computing Society, Department of Computer Science, University of Agriculture Faisalabad.`;

    // Word wrap the description
    const descLines = doc.splitTextToSize(descText, W - 100);
    doc.text(descLines, W / 2, y, { align: 'center' });
    y += descLines.length * 5 + 4;

    // ---- Event Details Box ----
    const boxW = 160;
    const boxX = (W - boxW) / 2;
    doc.setFillColor(25, 18, 40);
    doc.roundedRect(boxX, y, boxW, 16, 3, 3, 'F');
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.3);
    doc.roundedRect(boxX, y, boxW, 16, 3, 3, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(212, 175, 55);
    const col1 = boxX + 10;
    const col2 = boxX + boxW / 3 + 5;
    const col3 = boxX + (boxW * 2) / 3 + 5;
    const detY = y + 6;

    doc.text('EVENT', col1, detY);
    doc.text('DATE', col2, detY);
    doc.text('VENUE', col3, detY);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(data.eventTitle || 'TCS Event', col1, detY + 5);
    doc.text(data.eventDate || 'TBA', col2, detY + 5);
    doc.text(data.venue || 'UAF', col3, detY + 5);

    y += 26;

    // ---- SIGNATURE SECTION ----
    const sigY = y;
    const sigLeftX = W / 2 - 60;
    const sigRightX = W / 2 + 20;
    const sigWidth = 65;

    // Date (left side)
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.3);
    doc.line(sigLeftX, sigY + 5, sigLeftX + sigWidth, sigY + 5);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(154, 143, 166);
    doc.text('Date', sigLeftX + sigWidth / 2, sigY + 10, { align: 'center' });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(data.eventDate || new Date().toLocaleDateString(), sigLeftX + sigWidth / 2, sigY + 3, { align: 'center' });

    // Organizer Signature (right side)
    doc.setDrawColor(212, 175, 55);
    doc.line(sigRightX, sigY + 5, sigRightX + sigWidth, sigY + 5);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(154, 143, 166);
    doc.text("Organizer's Signature", sigRightX + sigWidth / 2, sigY + 10, { align: 'center' });
    // Organizer name
    if (data.organizer) {
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(data.organizer, sigRightX + sigWidth / 2, sigY + 3, { align: 'center' });
    }

    // ---- FOOTER ----
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 110, 140);
    doc.text('© The Computing Society — Department of Computer Science, University of Agriculture Faisalabad', W / 2, H - 15, { align: 'center' });
    doc.setFontSize(6);
    doc.text('This certificate is digitally generated and verifiable.', W / 2, H - 11, { align: 'center' });

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
