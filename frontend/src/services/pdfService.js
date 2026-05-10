import jsPDF from 'jspdf';
import footerLogo from '../assets/images/footer-logo.png';
import headerLogo from '../assets/images/header-logo.png';
import pageBorder from '../assets/images/page-border.png';
import cornerTlImg from '../assets/images/corner-tl.png';
import bottomBarImg from '../assets/images/bottom-bar.png';
import awardSealImg from '../assets/images/award-seal.png';

// ════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════

function lerp(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

// ════════════════════════════════════════════════════════════
//  TICKET PDF
// ════════════════════════════════════════════════════════════

const TK_BG = [5, 8, 22]; // Dark Navy Page Background (#050816)
const TK_CARD = [5, 8, 22]; // Dark Cyberpunk Ticket Background
const TK_PINK = [255, 45, 170];
const TK_CYAN = [0, 217, 255];
const TK_PRP = [139, 92, 255];
const TK_WHT = [255, 255, 255];
const TK_GRY = [148, 163, 184]; // Standard Gray for high contrast on Dark Navy

function drawPageHeader(doc, W, H) {
  doc.setFillColor(TK_BG[0], TK_BG[1], TK_BG[2]);
  doc.rect(0, 0, W, H, 'F');

  // Draw the custom cyberpunk page border image covering the entire A4 canvas
  doc.addImage(pageBorder, 'PNG', 0, 0, W, H);

  // Draw the gorgeous custom header image at the top center with a 5% (15mm) top margin
  const headW = 150;
  const headH = 34;
  doc.addImage(headerLogo, 'PNG', W / 2 - headW / 2, 13, headW, headH);

  return 55;
}

function drawPageFooter(doc, W, H) {
  // 1. Center Footer Logo (Adjusted to sit precisely at 8mm bottom margin)
  const logoW = 85;
  const logoH = 45;
  doc.addImage(footerLogo, 'PNG', W / 2 - logoW / 2, H - logoH + 3, logoW, logoH);

  // 2. Left Side Slogan: "Thank you for being a" & "part of our community."
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  const footerY1 = H - 20; // Set precisely with a 10mm bottom margin
  const footerY2 = H - 15;
  const footerX = 23;

  // Line 1: "Thank you for being a" (White)
  doc.setTextColor(255, 255, 255);
  doc.text("Thank you for being a", footerX, footerY1);

  // Line 2: "part of our community."
  doc.setTextColor(255, 255, 255);
  doc.text("part of ", footerX, footerY2);
  let curX = footerX + doc.getTextWidth("part of ");

  doc.setTextColor(TK_PRP[0], TK_PRP[1], TK_PRP[2]); // Purple
  doc.text("our ", curX, footerY2);
  curX += doc.getTextWidth("our ");

  doc.setTextColor(TK_PINK[0], TK_PINK[1], TK_PINK[2]); // Pink
  doc.text("community.", curX, footerY2);

  // 3. Right Side Slogan: "Learn. Connect. Innovate." with dynamic word spacing
  doc.setFontSize(11.5);
  doc.setFont('helvetica', 'bold');

  const rightXEnd = W - 15;
  const wLearn = doc.getTextWidth("Learn. ");
  const wConnect = doc.getTextWidth("Connect. ");
  const wInnovate = doc.getTextWidth("Innovate.");
  const totalRightW = wLearn + wConnect + wInnovate;

  const startRightX = rightXEnd - totalRightW;
  const rightY = H - 16; // Perfectly aligned with a 10mm bottom margin

  doc.setTextColor(TK_PINK[0], TK_PINK[1], TK_PINK[2]); // Pink
  doc.text("Learn. ", startRightX, rightY);

  doc.setTextColor(TK_PRP[0], TK_PRP[1], TK_PRP[2]); // Purple
  doc.text("Connect. ", startRightX + wLearn, rightY);

  doc.setTextColor(TK_CYAN[0], TK_CYAN[1], TK_CYAN[2]); // Cyan
  doc.text("Innovate.", startRightX + wLearn + wConnect, rightY);
}

function drawOneTicketCard(doc, t, qrUrl, x, y, w, h) {
  // 1. Deep Dark Navy Background (#050816)
  doc.setFillColor(5, 8, 22);
  doc.roundedRect(x, y, w, h, 6, 6, 'F');

  // 2. High Resolution Smooth Rounded Linear Gradient Border (Pink -> Purple -> Cyan)
  doc.setLineWidth(0.45);

  // Function to get gradient color at any X position relative to the card width
  function getGradientColor(posX) {
    const t = Math.max(0, Math.min(1, (posX - x) / w));
    if (t < 0.5) {
      return lerp(TK_PINK, TK_PRP, t * 2);
    } else {
      return lerp(TK_PRP, TK_CYAN, (t - 0.5) * 2);
    }
  }

  // A. Top straight section (from x + 6 to x + w - 6)
  for (let i = 6; i < w - 6; i += 0.5) {
    const rgb = getGradientColor(x + i);
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.line(x + i, y, x + i + 0.6, y);
  }

  // B. Bottom straight section (from x + 6 to x + w - 6)
  for (let i = 6; i < w - 6; i += 0.5) {
    const rgb = getGradientColor(x + i);
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.line(x + i, y + h, x + i + 0.6, y + h);
  }

  // C. Left vertical straight section (from y + 6 to y + h - 6)
  for (let j = 6; j < h - 6; j += 0.5) {
    const rgb = getGradientColor(x); // Pink side
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.line(x, y + j, x, y + j + 0.6);
  }

  // D. Right vertical straight section (from y + 6 to y + h - 6)
  for (let j = 6; j < h - 6; j += 0.5) {
    const rgb = getGradientColor(x + w); // Cyan side
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.line(x + w, y + j, x + w, y + j + 0.6);
  }

  // E. Rounded Corners (drawn as tiny color-interpolated line segments!)
  const r = 6; // radius
  const segments = 16;

  // 1. Top-Left Corner (Center: x + 6, y + 6. Angle: PI to 1.5 * PI)
  for (let i = 0; i < segments; i++) {
    const a1 = Math.PI + (i / segments) * (Math.PI / 2);
    const a2 = Math.PI + ((i + 1) / segments) * (Math.PI / 2);
    const px1 = x + r + r * Math.cos(a1);
    const py1 = y + r + r * Math.sin(a1);
    const px2 = x + r + r * Math.cos(a2);
    const py2 = y + r + r * Math.sin(a2);
    const rgb = getGradientColor((px1 + px2) / 2);
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.line(px1, py1, px2, py2);
  }

  // 2. Top-Right Corner (Center: x + w - 6, y + 6. Angle: 1.5 * PI to 2 * PI)
  for (let i = 0; i < segments; i++) {
    const a1 = 1.5 * Math.PI + (i / segments) * (Math.PI / 2);
    const a2 = 1.5 * Math.PI + ((i + 1) / segments) * (Math.PI / 2);
    const px1 = x + w - r + r * Math.cos(a1);
    const py1 = y + r + r * Math.sin(a1);
    const px2 = x + w - r + r * Math.cos(a2);
    const py2 = y + r + r * Math.sin(a2);
    const rgb = getGradientColor((px1 + px2) / 2);
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.line(px1, py1, px2, py2);
  }

  // 3. Bottom-Right Corner (Center: x + w - 6, y + h - 6. Angle: 0 to 0.5 * PI)
  for (let i = 0; i < segments; i++) {
    const a1 = (i / segments) * (Math.PI / 2);
    const a2 = ((i + 1) / segments) * (Math.PI / 2);
    const px1 = x + w - r + r * Math.cos(a1);
    const py1 = y + h - r + r * Math.sin(a1);
    const px2 = x + w - r + r * Math.cos(a2);
    const py2 = y + h - r + r * Math.sin(a2);
    const rgb = getGradientColor((px1 + px2) / 2);
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.line(px1, py1, px2, py2);
  }

  // 4. Bottom-Left Corner (Center: x + 6, y + h - 6. Angle: 0.5 * PI to PI)
  for (let i = 0; i < segments; i++) {
    const a1 = 0.5 * Math.PI + (i / segments) * (Math.PI / 2);
    const a2 = 0.5 * Math.PI + ((i + 1) / segments) * (Math.PI / 2);
    const px1 = x + r + r * Math.cos(a1);
    const py1 = y + h - r + r * Math.sin(a1);
    const px2 = x + r + r * Math.cos(a2);
    const py2 = y + h - r + r * Math.sin(a2);
    const rgb = getGradientColor((px1 + px2) / 2);
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.line(px1, py1, px2, py2);
  }

  // 3. LEFT QR SECTION (25% of ticket width)
  const qrAreaW = w * 0.23;
  const qW = 26;
  const qX = x + (qrAreaW - qW) / 2;
  const qY = y + (h - qW - 10) / 2;

  if (qrUrl) {
    // Rounded white QR container
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qX, qY, qW, qW, 4, 4, 'F');
    doc.addImage(qrUrl, 'PNG', qX + 2, qY + 2, qW - 4, qW - 4);
  }

  // Text below: "SCAN AT ENTRY" in White
  const scanY = qY + qW + 6.5;
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255); // White

  const scanTxt = 'SCAN AT ENTRY';
  const scanTxtW = doc.getTextWidth(scanTxt);
  doc.setFillColor(TK_PRP[0], TK_PRP[1], TK_PRP[2]);
  doc.roundedRect(qX + qW / 2 - scanTxtW / 2 - 4, scanY - 2, 2.5, 2.5, 0.5, 0.5, 'F');
  doc.text(scanTxt, qX + qW / 2 - scanTxtW / 2 + 1, scanY);

  // 4. Dashed Vertical Divider (Gradient Pink)
  const divX = x + qrAreaW;
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.setDrawColor(TK_PINK[0], TK_PINK[1], TK_PINK[2]); // Pink
  doc.setLineWidth(0.35);
  doc.line(divX, y + 5, divX, y + h - 5);
  doc.setLineDashPattern([], 0); // Reset

  // 5. RIGHT CONTENT SECTION
  const dX = divX + 6.5;
  const dW = w - qrAreaW - 12;

  // Event Title: Dynamically fetched from t.eventTitle (with Fallback to "OFFICIAL PASS")
  const fullTitle = String(t.eventTitle || t.eventName || 'OFFICIAL PASS').toUpperCase();
  doc.setFontSize(11.5);
  doc.setFont('helvetica', 'bold');

  const titleWords = fullTitle.split(' ');
  const word1 = titleWords[0] || '';
  const word2 = titleWords[1] || '';
  const restWords = titleWords.slice(2).join(' ');

  doc.setTextColor(TK_PRP[0], TK_PRP[1], TK_PRP[2]); // Purple
  doc.text(word1 + ' ', dX, y + 9.5);
  let curOffset = doc.getTextWidth(word1 + ' ');

  if (word2) {
    doc.setTextColor(TK_PINK[0], TK_PINK[1], TK_PINK[2]); // Pink
    doc.text(word2 + ' ', dX + curOffset, y + 9.5);
    curOffset += doc.getTextWidth(word2 + ' ');
  }

  if (restWords) {
    doc.setTextColor(255, 255, 255); // White
    doc.text(restWords, dX + curOffset, y + 9.5);
  }

  // 6. DETAILS GRID (With even distribution and a small comfortable gap between Department and Semester)
  const gy = y + 21;
  const colXOffsets = [
    0,                  // DATE (0% offset)
    dW * 0.20,          // TIME/DURATION (20% offset)
    dW * 0.40,          // DEPARTMENT (40% offset)
    dW * 0.64,          // SEMESTER (64% offset - giving DEPARTMENT a 4% extra gap to prevent collision)
    dW * 0.82           // AG NO (82% offset)
  ];
  const items = [
    { L: 'DATE', V: t.eventDate, C: TK_PRP }, // Purple
    { L: 'TIME/DURATION', V: t.eventTime, C: TK_PINK }, // Pink
    { L: 'DEPARTMENT', V: t.department, C: TK_PRP },
    { L: 'SEMESTER', V: t.semester, C: TK_PINK },
    { L: 'AG NO', V: t.agNo, C: TK_PRP }
  ];

  items.forEach((item, i) => {
    const ix = dX + colXOffsets[i];

    // Label (Increased font size)
    doc.setFontSize(7.6);
    doc.setTextColor(item.C[0], item.C[1], item.C[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(item.L, ix, gy - 2);

    // Value (Increased font size)
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    let val = String(item.V || 'N/A');
    if (item.L === 'DEPARTMENT') {
      // Written FULLY! No truncation to support Software Engineering completely!
    } else {
      if (val.length > 13) val = val.substring(0, 11) + '..';
    }
    doc.text(val, ix, gy + 2.5);
  });

  // 7. BOTTOM ROW
  const ey = gy + 12;

  // TICKET ID Capsule with Solid Purple border (No flat cut lines, narrower pW = 44 for reduced padding)
  const pW = 44, pH = 5.2;
  const pX = dX;
  const pY = ey - 0.8; // Slightly shifted down to give a nice top margin from the label

  doc.setFillColor(15, 30, 50);
  doc.setDrawColor(TK_PRP[0], TK_PRP[1], TK_PRP[2]); // Solid Purple
  doc.setLineWidth(0.35);
  doc.roundedRect(pX, pY, pW, pH, 2.5, 2.5, 'FD');

  // Label above capsule (Increased font size)
  doc.setFontSize(7.6);
  doc.setTextColor(TK_PRP[0], TK_PRP[1], TK_PRP[2]); // Purple accent
  doc.setFont('helvetica', 'bold');
  doc.text('TICKET ID', dX, ey - 3.2);

  // White bold value inside capsule (Increased font size)
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(t.publicTicketId || t.id || 'N/A', pX + pW / 2, pY + 3.6, { align: 'center' });

  // EMAIL COLUMN (Pink Accent)
  const emailX = dX + pW + 6;
  doc.setFontSize(7.6);
  doc.setTextColor(TK_PINK[0], TK_PINK[1], TK_PINK[2]); // Pink accent
  doc.setFont('helvetica', 'bold');
  doc.text('EMAIL', emailX, ey - 3.2);

  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  let emailVal = t.email || 'N/A';
  if (emailVal.length > 25) emailVal = emailVal.substring(0, 23) + '..';
  doc.text(emailVal, emailX, ey + 2.1);

  // ISSUED TO COLUMN (Blue Accent)
  const issuedToX = emailX + dW * 0.32;
  doc.setFontSize(7.6);
  doc.setTextColor(TK_CYAN[0], TK_CYAN[1], TK_CYAN[2]); // Blue accent
  doc.setFont('helvetica', 'bold');
  doc.text('ISSUED TO', issuedToX, ey - 3.2);

  doc.setFontSize(7.3);
  doc.setFont('helvetica', 'bold');
  const name = (t.name || '').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  const nameParts = name.split(' ');
  const firstWord = nameParts[0] || '';
  const restName = nameParts.slice(1).join(' ');

  doc.setTextColor(TK_PINK[0], TK_PINK[1], TK_PINK[2]); // Unique Pink
  doc.text(firstWord, issuedToX, ey + 2.1);
  if (restName) {
    const firstW = doc.getTextWidth(firstWord + ' ');
    doc.setTextColor(TK_CYAN[0], TK_CYAN[1], TK_CYAN[2]); // Cyan Blue
    doc.text(restName, issuedToX + firstW, ey + 2.1);
  }
}

export function downloadTicketPDF(t, qr) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
  drawPageHeader(doc, W, H);

  // Position ticket (at 55mm Y-coordinate, centered with 180mm width)
  const ch = 48;
  drawOneTicketCard(doc, t, qr, 15, 55, 180, ch);

  drawPageFooter(doc, W, H);
  doc.save(`TCS_Pass_${t.name || 'User'}.pdf`);
}

export function downloadAllTicketsPDF(tickets, qrs) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();

  const ch = 48;
  const maxPerPage = 4;
  const total = tickets.length;

  tickets.forEach((t, i) => {
    const pageIndex = Math.floor(i / maxPerPage);
    const itemOnPageIndex = i % maxPerPage;

    // Total items on current page
    const itemsOnThisPage = Math.min(maxPerPage, total - pageIndex * maxPerPage);

    if (itemOnPageIndex === 0) {
      if (pageIndex > 0) doc.addPage();
      drawPageHeader(doc, W, H);
      drawPageFooter(doc, W, H);
    }

    // Position tickets with a consistent, premium 8mm gap to keep them perfectly grouped and compact
    const gap = 6;
    const py = 50 + itemOnPageIndex * (ch + gap);

    drawOneTicketCard(doc, t, qrs[i], 15, py, 180, ch);
  });

  doc.save('TCS_Pass_Batch.pdf');
}

// ════════════════════════════════════════════════════════════
//  AWARD CERTIFICATE — 100% EXACT SCREEN CAPTURE → PDF
// ════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════
//  AWARD CERTIFICATE — NATIVE jsPDF GENERATION (100% MOBILE STABLE)
// ════════════════════════════════════════════════════════════

// Premium Branding Constants
const C_PINK = [217, 44, 138];
const C_PRP = [106, 53, 184];
const C_BLU = [60, 99, 217];
const C_DRK = [7, 7, 38];
const C_GRY = [85, 90, 126];

export async function downloadCertificatePDF(d) {
  try {
  // 1. Create high-fidelity A4 Landscape Canvas
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // 2. DRAW THE CYBERPUNK BACKGROUND FRAME
  doc.setFillColor(7, 7, 38); // Solid Deep Navy Background
  doc.rect(0, 0, W, H, 'F');

  // 3. NATIVE GRADIENT BORDER (Iterative Line Interpolation for Premium Sharpness)
  const m = 6; // Main safe margin
  const fw = W - 2 * m; // Frame width
  const fh = H - 2 * m; // Frame height
  const r = 6; // Radius match

  // Helper to find the precise color step across horizontal span
  function getGradStep(pos, total) {
    const t = Math.max(0, Math.min(1, pos / total));
    return t < 0.5 ? lerp(C_PINK, C_PRP, t * 2) : lerp(C_PRP, C_BLU, (t - 0.5) * 2);
  }

  doc.setLineWidth(0.8);
  // Top horizontal gradient line
  for (let x = m + r; x < m + fw - r; x += 0.5) {
    const rgb = getGradStep(x - m, fw);
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.line(x, m, x + 0.6, m);
  }
  // Bottom horizontal gradient line
  for (let x = m + r; x < m + fw - r; x += 0.5) {
    const rgb = getGradStep(x - m, fw);
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.line(x, m + fh, x + 0.6, m + fh);
  }
  // Solid side bars connecting the gradient ends
  doc.setDrawColor(C_BLU[0], C_BLU[1], C_BLU[2]); // Cyan right edge
  doc.line(m + fw, m + r, m + fw, m + fh - r);
  doc.setDrawColor(C_PINK[0], C_PINK[1], C_PINK[2]); // Pink left edge
  doc.line(m, m + r, m, m + fh - r);

  // 4. WHITE INNER BODY CARD (Beautifully rounded & inset)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(m + 0.8, m + 0.8, fw - 1.6, fh - 1.6, 4.5, 4.5, 'F');

  // 5. RENDER PREMIUM GRAPHIC ASSETS
  // Top-Left Futuristic Logo Design
  doc.addImage(cornerTlImg, 'PNG', m + 1, m + 1, 62, 62);
  
  // Bottom Geometric Border Bar
  const bBarH = 28; // Height allocated for Bottom Bar
  doc.addImage(bottomBarImg, 'PNG', m + 2, m + fh - bBarH, fw - 4, bBarH);

  // 6. DYNAMIC HEADER RENDERING
  // Main Title "THE COMPUTING SOCIETY"
  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.setTextColor(C_DRK[0], C_DRK[1], C_DRK[2]); 
  doc.text("THE COMPUTING SOCIETY", W / 2, 33, { align: 'center', charSpace: 1.2 });

  // Elegant decorative divider line under the society name
  const lineHalfW = 38;
  doc.setLineWidth(0.4);
  doc.setDrawColor(C_PINK[0], C_PINK[1], C_PINK[2]);
  doc.line(W / 2 - lineHalfW, 37.5, W / 2, 37.5);
  doc.setDrawColor(C_BLU[0], C_BLU[1], C_BLU[2]);
  doc.line(W / 2, 37.5, W / 2 + lineHalfW, 37.5);

  // Department Details
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(C_GRY[0], C_GRY[1], C_GRY[2]);
  doc.text("DEPT. OF COMPUTER SCIENCE,", W / 2, 43.5, { align: 'center' });
  doc.text("UNIVERSITY OF AGRICULTURE FAISALABAD", W / 2, 47.5, { align: 'center' });

  // 7. THE OFFICIAL TITLE DESIGN
  // Absolute High-Fidelity "AWARD CERTIFICATE" rendering using Serif
  doc.setFont("times", "bold");
  doc.setFontSize(44);
  doc.setTextColor(C_DRK[0], C_DRK[1], C_DRK[2]);
  doc.text("AWARD CERTIFICATE", W / 2, 72, { align: 'center', charSpace: 1.8 });

  // Subline "OF PARTICIPATION" flanked by accent diamonds
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(C_PRP[0], C_PRP[1], C_PRP[2]);
  doc.text("♦   OF PARTICIPATION   ♦", W / 2, 81, { align: 'center', charSpace: 2.5 });

  // 8. THE RECIPIENT CORE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(C_GRY[0], C_GRY[1], C_GRY[2]);
  doc.text("PROUDLY PRESENTED TO", W / 2, 96, { align: 'center', charSpace: 0.8 });

  // The Recipient's Dynamic Name: Big, Elegant, Accented
  doc.setFont("times", "bolditalic");
  doc.setFontSize(38);
  doc.setTextColor(C_PINK[0], C_PINK[1], C_PINK[2]); // Keep the core identity accent
  const recipientName = (d.name || "PARTICIPANT NAME").toUpperCase();
  doc.text(recipientName, W / 2, 111, { align: 'center' });

  // 9. AG NUMBER ACCENT BADGE (Drawn via vector geometry polygons)
  const agId = `AG No: ${d.agNo || "20XX-AG-XXXX"}`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  
  const badgeWidth = doc.getTextWidth(agId) + 18; // Automatic fit-to-width
  const badgeHeight = 8.5;
  const bx = W / 2 - badgeWidth / 2;
  const by = 119;

  // Create clean dark vector hexagon
  doc.setFillColor(7, 7, 38);
  doc.polygon([
    [bx + 3, by],
    [bx + badgeWidth - 3, by],
    [bx + badgeWidth, by + badgeHeight / 2],
    [bx + badgeWidth - 3, by + badgeHeight],
    [bx + 3, by + badgeHeight],
    [bx, by + badgeHeight / 2]
  ], 'F');

  // Add subtle gradient frame to the hexagon
  doc.setLineWidth(0.3);
  doc.setDrawColor(C_PRP[0], C_PRP[1], C_PRP[2]);
  doc.polygon([
    [bx + 3, by],
    [bx + badgeWidth - 3, by],
    [bx + badgeWidth, by + badgeHeight / 2],
    [bx + badgeWidth - 3, by + badgeHeight],
    [bx + 3, by + badgeHeight],
    [bx, by + badgeHeight / 2]
  ], 'D');

  // Badge Text
  doc.setTextColor(255, 255, 255);
  doc.text(agId, W / 2, by + 5.8, { align: 'center' });

  // 10. DESCRIPTION DYNAMICS
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(65, 70, 95);
  
  const mainDesc = `For participating in "${d.eventTitle || "Event Title"}" organized by The Computing Society,`;
  const subDesc = `University of Agriculture Faisalabad.`;
  doc.text(mainDesc, W / 2, 138, { align: 'center' });
  doc.text(subDesc, W / 2, 143.5, { align: 'center' });

  // Vector accent divider
  doc.setDrawColor(210, 210, 225);
  doc.setLineWidth(0.2);
  doc.line(W / 2 - 40, 152, W / 2 + 40, 152);

  // 11. TRIPLE-COLUMN FOOTER ECOSYSTEM
  const fLocY = 173; // Primary baseline for icons
  const colX1 = W * 0.24;
  const colX2 = W * 0.5;
  const colX3 = W * 0.76;

  // Helper to draw circular icon frames
  function drawIconFr(cx, cy, clr) {
    doc.setFillColor(7, 7, 38);
    doc.circle(cx, cy, 5.5, 'F');
    doc.setDrawColor(clr[0], clr[1], clr[2]);
    doc.setLineWidth(0.45);
    doc.circle(cx, cy, 5.5, 'D');
  }

  // Draw frames
  drawIconFr(colX1, fLocY - 12, C_PINK);
  drawIconFr(colX2, fLocY - 12, C_BLU);
  drawIconFr(colX3, fLocY - 12, C_BLU);

  // -- Column 1: Event Meta --
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(C_PINK[0], C_PINK[1], C_PINK[2]);
  doc.text("EVENT DATE", colX1, fLocY, { align: 'center' });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  const evTitleShort = d.eventTitle && d.eventTitle.length > 25 ? d.eventTitle.substring(0,22) + ".." : (d.eventTitle || "");
  doc.text(evTitleShort, colX1, fLocY + 5, { align: 'center' });
  doc.text(d.eventDate || "2026", colX1, fLocY + 9, { align: 'center' });

  // -- Column 2: Venue --
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(C_BLU[0], C_BLU[1], C_BLU[2]);
  doc.text("VENUE", colX2, fLocY, { align: 'center' });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  doc.text(d.eventVenue || "University Auditorium", colX2, fLocY + 5, { align: 'center' });

  // -- Column 3: Signature --
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(C_BLU[0], C_BLU[1], C_BLU[2]);
  doc.text("SIGNATURE", colX3, fLocY, { align: 'center' });
  
  doc.setFont("times", "italic");
  doc.setTextColor(7, 7, 38);
  doc.setFontSize(12.5);
  doc.text("The Computing Society", colX3, fLocY + 6.5, { align: 'center' });
  
  // The elegant line under signature
  doc.setDrawColor(C_PRP[0], C_PRP[1], C_PRP[2]);
  doc.setLineWidth(0.35);
  doc.line(colX3 - 22, fLocY + 8.5, colX3 + 22, fLocY + 8.5);

  // 12. THE CENTER EMBOSSED AWARD SEAL (FINAL OVERLAY)
  const sealSz = 33; // Optimal dimension for A4 scaling
  doc.addImage(awardSealImg, 'PNG', W / 2 - sealSz / 2, H - 48, sealSz, sealSz);

  // 13. FIREWORKS! EXPORT COMPLETED VECTOR FILE!
  doc.save(`TCS_Certificate_${(d.name || 'Student').replace(/[^a-z0-9]/gi, '_')}.pdf`);
  } catch (err) {
    console.error("Certificate Vector Generator Failed:", err);
    alert("Oops! We couldn't create the PDF: " + err.message);
  }
}

