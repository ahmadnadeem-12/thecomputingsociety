import jsPDF from 'jspdf';
import footerLogo from '../assets/images/footer-logo.png';
import headerLogo from '../assets/images/header-logo.png';
import pageBorder from '../assets/images/page-border.png';

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
//  AWARD CERTIFICATE — ULTRA PREMIUM VERSION
// ════════════════════════════════════════════════════════════

export function downloadCertificatePDF(data) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();

  const NAVY = [26, 17, 69], PINK = [220, 38, 114], BLUE = [37, 99, 235], GREY = [107, 114, 128], SLATE = [241, 245, 249];

  // 1. COMPLEX BACKGROUND ACCENTS (Matching dots and curve aesthetics)
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  // Top Left Dark Section
  doc.triangle(0, 0, 50, 0, 0, 50, 'F');
  doc.setFillColor(PINK[0], PINK[1], PINK[2]);
  doc.circle(5, 5, 1, 'F'); doc.circle(10, 5, 1, 'F'); doc.circle(5, 10, 1, 'F');

  // Bottom Right Dark Section
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.triangle(W, H, W - 70, H, W, H - 70, 'F');
  doc.setFillColor(PINK[0], PINK[1], PINK[2]);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) doc.circle(W - 15 + i * 4, H - 15 + j * 4, 0.6, 'F');

  // 2. MULTI-LINE BORDER
  doc.setLineWidth(0.5);
  for (let i = 0; i < 10; i++) {
    const c = lerp([15, 20, 50], PINK, i / 10);
    doc.setDrawColor(c[0], c[1], c[2]);
    doc.rect(2 + i * 0.3, 2 + i * 0.3, W - 4 - i * 0.6, H - 4 - i * 0.6, 'S');
  }

  // 3. HEADER
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
  doc.text('THE COMPUTING SOCIETY', W / 2, 25, { align: 'center', charSpace: 1.2 });

  doc.setDrawColor(PINK[0], PINK[1], PINK[2]); doc.setLineWidth(0.4);
  doc.line(W / 2 - 35, 28, W / 2 + 35, 28);
  doc.setFillColor(PINK[0], PINK[1], PINK[2]); doc.circle(W / 2 - 35, 28, 0.7, 'F'); doc.circle(W / 2 + 35, 28, 0.7, 'F');

  doc.setFontSize(8.5); doc.setTextColor(GREY[0], GREY[1], GREY[2]);
  doc.text('DEPT. OF COMPUTER SCIENCE,', W / 2, 35, { align: 'center' });
  doc.text('UNIVERSITY OF AGRICULTURE FAISALABAD', W / 2, 40, { align: 'center' });

  // 4. MAIN TITLE
  doc.setFont('times', 'bold');
  doc.setFontSize(46);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text('AWARD CERTIFICATE', W / 2, 65, { align: 'center' });

  // 5. SUBTITLE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(PINK[0], PINK[1], PINK[2]);
  doc.text('OF PARTICIPATION', W / 2, 78, { align: 'center', charSpace: 2 });
  doc.setDrawColor(PINK[0], PINK[1], PINK[2]); doc.setLineWidth(0.3);
  doc.line(W / 2 - 45, 78, W / 2 - 30, 78); doc.line(W / 2 + 30, 78, W / 2 + 45, 78);
  doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]); doc.triangle(W / 2 - 28, 77.2, W / 2 - 28, 78.8, W / 2 - 26, 78, 'F');
  doc.triangle(W / 2 + 28, 77.2, W / 2 + 28, 78.8, W / 2 + 26, 78, 'F');

  // 6. PROUDLY PRESENTED
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(GREY[0], GREY[1], GREY[2]);
  doc.text('PROUDLY PRESENTED TO', W / 2, 95, { align: 'center' });

  // 7. NAME (Gradient-ish effect via shadow)
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(54);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text((data.name || 'User Name').toUpperCase(), W / 2, 118, { align: 'center' });
  // Subtle glow
  doc.setTextColor(BLUE[0], BLUE[1], BLUE[2]); doc.setFontSize(54.2);
  doc.text((data.name || 'User Name').toUpperCase(), W / 2 + 0.1, 118.1, { align: 'center', opacity: 0.1 });

  // 8. AG NO
  const ag = `AG No: ${data.agNo || 'XXXX-AG-XXXX'}`;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5);
  const aw = doc.getTextWidth(ag) + 12;
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.roundedRect(W / 2 - aw / 2, 128, aw, 8, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(ag, W / 2, 133.5, { align: 'center' });

  // 9. EVENT TEXT
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  const text = `For participating in "${data.eventTitle || 'Event'}" organized by\nThe Computing Society, University of Agriculture Faisalabad.`;
  doc.text(text, W / 2, 150, { align: 'center', lineHeightFactor: 1.4 });

  // 10. VECTOR ICONS (No emojis)
  const iy = 188, c1 = W * 0.25, c2 = W * 0.5, c3 = W * 0.75;

  function drawIcon(x, y, type) {
    doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2]); doc.setLineWidth(0.4);
    doc.circle(x, y - 10, 6.5, 'S');
    doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]); doc.circle(x, y - 10, 6, 'F');
    doc.setDrawColor(255, 255, 255); doc.setLineWidth(0.5);
    if (type === 'date') {
      doc.rect(x - 2.5, y - 12.5, 5, 4.5, 'S'); doc.line(x - 2.5, y - 10.5, x + 2.5, y - 10.5);
    } else if (type === 'pen') {
      doc.line(x - 2, y - 8.5, x + 2, y - 11.5); doc.line(x + 2, y - 11.5, x + 1, y - 12.5);
    }
  }
  drawIcon(c1, iy, 'date'); drawIcon(c2, iy, 'date'); drawIcon(c3, iy, 'pen');

  doc.setTextColor(PINK[0], PINK[1], PINK[2]); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold');
  doc.text('EVENT DATE', c1, iy, { align: 'center' });
  doc.text('DATE', c2, iy, { align: 'center' });
  doc.text('SIGNATURE', c3, iy, { align: 'center' });

  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]); doc.setFontSize(9.5); doc.setFont('helvetica', 'normal');
  doc.text(data.eventTitle || 'TCS Event', c1, iy + 6, { align: 'center' });
  doc.text(data.eventDate || '2026-01-10', c1, iy + 11, { align: 'center' });
  doc.text(data.eventDate || '2026-01-10', c2, iy + 6, { align: 'center' });

  doc.setFont('times', 'bolditalic'); doc.setFontSize(13);
  doc.text('The Computing Society', c3, iy + 8, { align: 'center' });
  doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2]); doc.setLineWidth(0.4);
  doc.line(c3 - 18, iy + 11, c3 + 18, iy + 11);

  // 11. SEAL (Vector)
  const sx = W / 2, sy = H - 22;
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  // Star seal effect
  for (let i = 0; i < 12; i++) {
    const ang = (i * 30) * Math.PI / 180;
    doc.triangle(sx + 10 * Math.cos(ang), sy + 10 * Math.sin(ang),
      sx + 12 * Math.cos(ang + 0.2), sy + 12 * Math.sin(ang + 0.2),
      sx + 12 * Math.cos(ang - 0.2), sy + 12 * Math.sin(ang - 0.2), 'F');
  }
  doc.circle(sx, sy, 10, 'F');
  doc.setDrawColor(PINK[0], PINK[1], PINK[2]); doc.setLineWidth(0.8);
  doc.circle(sx, sy, 10.5, 'S');
  doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text('</>', sx, sy + 1.5, { align: 'center' });

  doc.save(`TCS_Certificate_${data.name || 'Student'}.pdf`);
}
