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
//  AWARD CERTIFICATE — PURE jsPDF (reliable on ALL devices)
// ════════════════════════════════════════════════════════════

const CP = [217, 44, 138];   // Pink
const CV = [106, 53, 184];   // Purple
const CB = [60, 99, 217];    // Blue
const CN = [7, 7, 38];       // Navy
const CG = [85, 90, 126];    // Gray
const CW = [255, 255, 255];  // White
const CT = [79, 86, 107];    // Text gray

function certGradColor(t) {
  if (t < 0.5) return lerp(CP, CV, t * 2);
  return lerp(CV, CB, (t - 0.5) * 2);
}

function drawCertGradientBorder(doc, bx, by, bw, bh, br) {
  doc.setLineWidth(1.2);
  const seg = 120;
  // Top
  for (let i = 0; i < seg; i++) {
    const t1 = i / seg, t2 = (i + 1) / seg;
    const rgb = certGradColor(t1);
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.line(bx + br + (bw - 2 * br) * t1, by, bx + br + (bw - 2 * br) * t2, by);
  }
  // Bottom
  for (let i = 0; i < seg; i++) {
    const t1 = i / seg, t2 = (i + 1) / seg;
    const rgb = certGradColor(t1);
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.line(bx + br + (bw - 2 * br) * t1, by + bh, bx + br + (bw - 2 * br) * t2, by + bh);
  }
  // Left
  for (let j = 0; j < seg; j++) {
    const t1 = j / seg, t2 = (j + 1) / seg;
    const rgb = certGradColor(t1 * 0.3);
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.line(bx, by + br + (bh - 2 * br) * t1, bx, by + br + (bh - 2 * br) * t2);
  }
  // Right
  for (let j = 0; j < seg; j++) {
    const t1 = j / seg, t2 = (j + 1) / seg;
    const rgb = certGradColor(0.7 + t1 * 0.3);
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.line(bx + bw, by + br + (bh - 2 * br) * t1, bx + bw, by + br + (bh - 2 * br) * t2);
  }
  // Corners
  const cs = 16;
  [[bx + br, by + br, Math.PI, 1.5 * Math.PI, 0],
   [bx + bw - br, by + br, 1.5 * Math.PI, 2 * Math.PI, 1],
   [bx + bw - br, by + bh - br, 0, 0.5 * Math.PI, 1],
   [bx + br, by + bh - br, 0.5 * Math.PI, Math.PI, 0]
  ].forEach(([cx, cy, a1, a2, tBase]) => {
    for (let i = 0; i < cs; i++) {
      const ang1 = a1 + (i / cs) * (a2 - a1);
      const ang2 = a1 + ((i + 1) / cs) * (a2 - a1);
      const rgb = certGradColor(tBase);
      doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
      doc.line(cx + br * Math.cos(ang1), cy + br * Math.sin(ang1),
               cx + br * Math.cos(ang2), cy + br * Math.sin(ang2));
    }
  });
}

function drawGradText(doc, words, cx, y, size, font) {
  doc.setFontSize(size);
  doc.setFont(font || 'helvetica', 'bold');
  const full = words.join(' ');
  const tw = doc.getTextWidth(full);
  let x = cx - tw / 2;
  const colors = [CP, CV, CB];
  words.forEach((w, i) => {
    const c = colors[i % 3];
    doc.setTextColor(c[0], c[1], c[2]);
    const sp = (i < words.length - 1) ? ' ' : '';
    doc.text(w + sp, x, y);
    x += doc.getTextWidth(w + sp);
  });
}

function drawHexBadge(doc, text, cx, y, pw, ph) {
  const hx = cx - pw / 2;
  doc.setFillColor(CN[0], CN[1], CN[2]);
  doc.setLineWidth(0.8);
  // Hexagon path
  const pts = [
    [hx + 8, y], [hx + pw - 8, y], [hx + pw, y + ph / 2],
    [hx + pw - 8, y + ph], [hx + 8, y + ph], [hx, y + ph / 2]
  ];
  // Fill
  doc.setFillColor(CN[0], CN[1], CN[2]);
  doc.triangle(pts[0][0], pts[0][1], pts[1][0], pts[1][1], pts[5][0], pts[5][1], 'F');
  doc.triangle(pts[1][0], pts[1][1], pts[2][0], pts[2][1], pts[5][0], pts[5][1], 'F');
  doc.triangle(pts[2][0], pts[2][1], pts[4][0], pts[4][1], pts[5][0], pts[5][1], 'F');
  doc.triangle(pts[2][0], pts[2][1], pts[3][0], pts[3][1], pts[4][0], pts[4][1], 'F');
  // Border
  for (let i = 0; i < pts.length; i++) {
    const t = i / pts.length;
    const rgb = certGradColor(t);
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    const ni = (i + 1) % pts.length;
    doc.line(pts[i][0], pts[i][1], pts[ni][0], pts[ni][1]);
  }
  // Left line
  doc.setDrawColor(CP[0], CP[1], CP[2]);
  doc.setLineWidth(0.5);
  doc.line(hx - 30, y + ph / 2, hx, y + ph / 2);
  // Right line
  doc.setDrawColor(CB[0], CB[1], CB[2]);
  doc.line(hx + pw, y + ph / 2, hx + pw + 30, y + ph / 2);
  // Diamonds
  doc.setTextColor(CP[0], CP[1], CP[2]);
  doc.setFontSize(8);
  doc.text('♦', hx + 8, y + ph / 2 + 2.5, { align: 'center' });
  doc.setTextColor(CB[0], CB[1], CB[2]);
  doc.text('♦', hx + pw - 8, y + ph / 2 + 2.5, { align: 'center' });
  // Text
  doc.setTextColor(CW[0], CW[1], CW[2]);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(text, cx, y + ph / 2 + 2.8, { align: 'center' });
}

function drawCertFooterIcon(doc, cx, y, borderColor) {
  // Circle icon badge
  doc.setFillColor(CN[0], CN[1], CN[2]);
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.8);
  doc.circle(cx, y, 8, 'FD');
  // Inner white ring
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.circle(cx, y, 6.5, 'S');
}

export function downloadCertificatePDF(data) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  const W = doc.internal.pageSize.getWidth();   // 297
  const H = doc.internal.pageSize.getHeight();  // 210
  const cx = W / 2; // center x = 148.5

  // ── 1. White page background ──
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, 'F');

  // ── 2. Gradient border frame ──
  drawCertGradientBorder(doc, 5, 5, W - 10, H - 10, 6);

  // ── 3. Inner thin black corner accent (top-right) ──
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.6);
  const acX = W - 20, acY = 12;
  doc.line(acX - 40, acY, acX, acY);               // horizontal
  doc.line(acX, acY, acX, acY + 40);               // vertical
  doc.line(acX - 40, acY, acX - 40, acY + 3);      // small vertical tick

  // ── 4. Diagonal fine lines (top-right area) ──
  doc.setDrawColor(200, 200, 210);
  doc.setLineWidth(0.15);
  for (let i = 0; i < 8; i++) {
    const off = i * 8;
    doc.line(W - 80 + off, 10, W - 10, 10 + 70 - off);
  }

  // ── 5. THE COMPUTING SOCIETY ──
  drawGradText(doc, ['THE', 'COMPUTING', 'SOCIETY'], cx, 30, 18, 'helvetica');

  // ── 6. Decorative header line with dots ──
  const lineY = 34;
  // Pink dot
  doc.setFillColor(CP[0], CP[1], CP[2]);
  doc.circle(cx - 60, lineY, 1.2, 'F');
  // Pink → Purple line
  doc.setLineWidth(0.6);
  for (let i = 0; i < 30; i++) {
    const t = i / 30;
    const rgb = lerp(CP, CV, t);
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.line(cx - 58 + i * 2, lineY, cx - 56 + i * 2, lineY);
  }
  // Purple → Blue line
  for (let i = 0; i < 30; i++) {
    const t = i / 30;
    const rgb = lerp(CV, CB, t);
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.line(cx + 2 + i * 2, lineY, cx + 4 + i * 2, lineY);
  }
  // Blue dot
  doc.setFillColor(CB[0], CB[1], CB[2]);
  doc.circle(cx + 62, lineY, 1.2, 'F');

  // ── 7. Department ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(CG[0], CG[1], CG[2]);
  doc.text('DEPT. OF COMPUTER SCIENCE,', cx, 40, { align: 'center' });
  doc.text('UNIVERSITY OF AGRICULTURE FAISALABAD', cx, 45, { align: 'center' });

  // ── 8. AWARD CERTIFICATE ──
  doc.setFont('times', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(CN[0], CN[1], CN[2]);
  doc.text('AWARD CERTIFICATE', cx, 63, { align: 'center' });

  // ── 9. OF PARTICIPATION subtitle ──
  const subY = 71;
  // Left diamond line
  doc.setDrawColor(CP[0], CP[1], CP[2]);
  doc.setLineWidth(0.4);
  doc.line(cx - 62, subY - 2, cx - 28, subY - 2);
  // Left diamond
  doc.setFillColor(CV[0], CV[1], CV[2]);
  const ds = 1.8;
  // Diamond 1
  doc.triangle(cx - 24, subY - 2 - ds, cx - 24 + ds, subY - 2, cx - 24, subY - 2 + ds, 'F');
  doc.triangle(cx - 24, subY - 2 - ds, cx - 24 - ds, subY - 2, cx - 24, subY - 2 + ds, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  // Gradient "OF PARTICIPATION"
  const subWords = ['OF', 'PARTICIPATION'];
  let subX = cx - doc.getTextWidth(subWords.join(' ')) / 2;
  doc.setTextColor(CP[0], CP[1], CP[2]);
  doc.text('OF ', subX, subY);
  subX += doc.getTextWidth('OF ');
  doc.setTextColor(CB[0], CB[1], CB[2]);
  doc.text('PARTICIPATION', subX, subY);

  // Diamond 2
  doc.setFillColor(CV[0], CV[1], CV[2]);
  doc.triangle(cx + 24, subY - 2 - ds, cx + 24 + ds, subY - 2, cx + 24, subY - 2 + ds, 'F');
  doc.triangle(cx + 24, subY - 2 - ds, cx + 24 - ds, subY - 2, cx + 24, subY - 2 + ds, 'F');
  // Right diamond line
  doc.setDrawColor(CB[0], CB[1], CB[2]);
  doc.line(cx + 28, subY - 2, cx + 62, subY - 2);

  // ── 10. PROUDLY PRESENTED TO ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(CG[0], CG[1], CG[2]);
  doc.text('PROUDLY PRESENTED TO', cx, 81, { align: 'center' });

  // ── 11. Recipient Name (gradient) ──
  const nameStr = (data.name || 'STUDENT NAME').toUpperCase();
  const nameWords = nameStr.split(' ');
  drawGradText(doc, nameWords, cx, 97, 30, 'times');

  // ── 12. AG No Hexagonal Badge ──
  drawHexBadge(doc, 'AG No: ' + (data.agNo || 'N/A'), cx, 105, 80, 10);

  // ── 13. Description Text ──
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(CT[0], CT[1], CT[2]);
  const eventTitle = data.eventTitle || 'Event';
  const descLine1 = `For participating in "${eventTitle}" organized by The Computing Society,`;
  const descLine2 = 'University of Agriculture Faisalabad.';
  doc.text(descLine1, cx, 125, { align: 'center' });
  doc.text(descLine2, cx, 131, { align: 'center' });

  // ── 14. Description Divider ──
  const divY = 137;
  doc.setDrawColor(CG[0], CG[1], CG[2]);
  doc.setLineWidth(0.3);
  doc.line(cx - 70, divY, cx - 5, divY);
  doc.line(cx + 5, divY, cx + 70, divY);
  // Center diamond
  doc.setDrawColor(CG[0], CG[1], CG[2]);
  doc.setLineWidth(0.5);
  doc.line(cx - 2.5, divY, cx, divY - 2.5);
  doc.line(cx, divY - 2.5, cx + 2.5, divY);
  doc.line(cx + 2.5, divY, cx, divY + 2.5);
  doc.line(cx, divY + 2.5, cx - 2.5, divY);

  // ── 15. Footer Columns ──
  const fY = 152;
  const col1X = 60, col2X = cx, col3X = W - 60;

  // Column 1: Event Date (pink accent)
  drawCertFooterIcon(doc, col1X, fY, CP);
  // Calendar icon inside circle
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.rect(col1X - 3, fY - 3, 6, 6);
  doc.line(col1X - 1.5, fY - 3, col1X - 1.5, fY - 1.5);
  doc.line(col1X + 1.5, fY - 3, col1X + 1.5, fY - 1.5);
  doc.line(col1X - 3, fY - 0.5, col1X + 3, fY - 0.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(CP[0], CP[1], CP[2]);
  doc.text('EVENT DATE', col1X, fY + 14, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setTextColor(CT[0], CT[1], CT[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(eventTitle, col1X, fY + 20, { align: 'center', maxWidth: 55 });
  doc.text(data.eventDate || 'N/A', col1X, fY + 26, { align: 'center' });

  // Divider line 1
  doc.setDrawColor(200, 200, 210);
  doc.setLineWidth(0.3);
  doc.line(col1X + 40, fY - 8, col1X + 40, fY + 30);
  // Divider diamond
  doc.setFillColor(CP[0], CP[1], CP[2]);
  doc.circle(col1X + 40, fY + 11, 1, 'F');

  // Column 2: Venue (blue accent)
  drawCertFooterIcon(doc, col2X, fY - 5, CB);
  // Location pin inside circle
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.circle(col2X, fY - 5, 2, 'S');
  doc.circle(col2X, fY - 6, 0.8, 'F');
  doc.setFillColor(255, 255, 255);
  doc.triangle(col2X - 1.5, fY - 4, col2X + 1.5, fY - 4, col2X, fY - 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(CB[0], CB[1], CB[2]);
  doc.text('VENUE', col2X, fY + 9, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setTextColor(CT[0], CT[1], CT[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(data.eventVenue || 'Location', col2X, fY + 15, { align: 'center', maxWidth: 55 });

  // Divider line 2
  doc.setDrawColor(200, 200, 210);
  doc.setLineWidth(0.3);
  doc.line(col3X - 40, fY - 8, col3X - 40, fY + 30);
  doc.setFillColor(CB[0], CB[1], CB[2]);
  doc.circle(col3X - 40, fY + 11, 1, 'F');

  // Column 3: Signature (blue accent)
  drawCertFooterIcon(doc, col3X, fY, CB);
  // Pen icon inside circle
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.line(col3X - 2, fY + 3, col3X + 3, fY - 2);
  doc.line(col3X - 3, fY + 2, col3X + 2, fY + 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(CB[0], CB[1], CB[2]);
  doc.text('SIGNATURE', col3X, fY + 14, { align: 'center' });
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(13);
  doc.setTextColor(CN[0], CN[1], CN[2]);
  doc.text('The Computing Society', col3X, fY + 22, { align: 'center' });
  // Signature gradient line
  doc.setLineWidth(0.5);
  for (let i = 0; i < 30; i++) {
    const t = i / 30;
    const rgb = certGradColor(t);
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    doc.line(col3X - 25 + i * 1.67, fY + 24, col3X - 23.33 + i * 1.67, fY + 24);
  }

  // ── 16. Bottom accent bar (gradient line at bottom) ──
  doc.setLineWidth(2);
  for (let i = 0; i < 100; i++) {
    const t = i / 100;
    const rgb = certGradColor(t);
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    const lx = 8 + (W - 16) * t;
    doc.line(lx, H - 8, lx + (W - 16) / 100 + 0.5, H - 8);
  }

  // ── 17. Download ──
  const isMobile = window.innerWidth <= 768;
  const fileName = `TCS_Certificate_${data.name || 'Student'}.pdf`;
  if (isMobile) {
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 1000);
  } else {
    doc.save(fileName);
  }
}
