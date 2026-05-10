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
//  AWARD CERTIFICATE — 100% EXACT SCREEN CAPTURE → PDF
// ════════════════════════════════════════════════════════════

export async function downloadCertificatePDF(data) {
  const html2canvas = (await import('html2canvas')).default;

  // 1. Ensure all custom fonts are fully loaded before rendering
  if (document.fonts) {
    await document.fonts.ready;
  }

  // Find the actual rendered certificate frame on the page (includes gradient border)
  const container = document.querySelector('.certFrameContainer');
  const certCard = document.querySelector('.certFrame');
  if (!certCard) {
    alert('Certificate preview not found on page. Please try again.');
    return;
  }

  const originalContainerStyle = container ? container.getAttribute('style') || '' : '';
  const originalCardStyle = certCard ? certCard.getAttribute('style') || '' : '';

  // ALWAYS simulate high-resolution fixed desktop dimensions to ensure identical rendering regardless of device viewport
  const simulatedWidth = 1536;
  const simulatedHeight = 900;

  let canvas;
  try {
    if (container) {
      container.style.setProperty('display', 'block', 'important');
      container.style.setProperty('position', 'absolute', 'important');
      container.style.setProperty('left', '-9999px', 'important');
      container.style.setProperty('top', '-9999px', 'important');
      container.style.setProperty('width', '1060px', 'important');
      container.style.setProperty('height', '750px', 'important'); // 🔥 HEAVY FIX: Never allow collapse
      container.style.setProperty('min-height', '750px', 'important');
      container.style.setProperty('opacity', '0.001', 'important');
    }
    if (certCard) {
      certCard.style.setProperty('display', 'block', 'important');
      certCard.style.setProperty('width', '1060px', 'important');
      certCard.style.setProperty('height', '750px', 'important'); // 🔥 HEAVY FIX: Match desktop height inline
      certCard.style.setProperty('min-height', '750px', 'important');
    }

    // Wait for all images inside the card to be fully loaded and measured by the browser now that they are block!
    const imgElements = Array.from(certCard.querySelectorAll('img'));
    await Promise.all(
      imgElements.map(img => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      })
    );

    canvas = await html2canvas(certCard, {
      scale: 2,                 // Consistent 2x resolution on all devices for high-resolution crispness
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width: 1060,              // 🔥 EXPLICIT CANVAS DIMENSIONS: Prevents 0-size calculation crash
      height: 750,             // 🔥 EXPLICIT CANVAS DIMENSIONS: Force deterministic snapshot area
      windowWidth: simulatedWidth,        // Dynamically simulate standard laptop screen width (1536px) on mobile so clamp() and vw typography evaluate to their full large desktop proportions!
      windowHeight: simulatedHeight,       // Dynamically simulate standard screen height
      onclone: (clonedDoc) => {
      // ── 0. DISABLE PSEUDO-ELEMENT ROUND BACKGROUNDS & PREVENT CLIPPING ──
      const style = clonedDoc.createElement('style');
      style.innerHTML = `
        /* 1. Force Desktop Sizing & Position (Nullifies responsive resets) */
        .certMobileNotice {
          display: none !important;
        }
        .certFrameContainer {
          display: block !important;
          position: static !important;
          visibility: visible !important;
          width: 1060px !important;
          max-width: 1060px !important;
          height: 750px !important;
          margin: 0 auto !important;
          left: 0 !important;
          top: 0 !important;
          opacity: 1 !important;
          overflow: visible !important;
        }
        .certFrame {
          display: block !important;
          width: 1060px !important;
          height: 750px !important;
          aspect-ratio: 1.414 !important;
          border-radius: 28px !important;
          padding: 3px !important;
        }
        .certCard {
          height: 750px !important;
          min-height: 750px !important;
          border-radius: 24px !important;
        }
        .certBody {
          padding: 1.5% 10% 2.8% !important;
        }
        
        /* 2. Corner Graphics (Restore desktop display/sizing) */
        .cornerTL {
          width: 250px !important;
          height: 250px !important;
        }
        .cornerBL, .cornerBR {
          display: none !important;
        }
        
        /* 3. Fixed Desktop Typography (Calculated for 1536px simulated width to completely override mobile queries) */
        .certTitle {
          font-size: 67px !important;
          margin: -1.2% 0 0.2% !important;
        }
        .certDept {
          font-size: 13.5px !important;
        }
        .certPresented {
          font-size: 12.5px !important;
          margin-bottom: 8px !important;
        }
        .certDesc {
          font-size: 12.5px !important;
          max-width: 75% !important;
          display: block !important;
          transform: translateY(-10px) !important;
        }
        .fLabel {
          font-size: 11px !important;
        }
        .fValue {
          font-size: 11px !important;
        }
        .fSig {
          font-size: 22px !important;
        }

        /* 4. Element Resets and Restorations */
        .fDiv {
          display: block !important;
          width: 2px !important;
          height: 100px !important;
        }
        .dotGrid {
          display: block !important;
        }
        .badgeSeal {
          width: 145px !important;
          height: 145px !important;
          top: 62% !important;
        }
        .badgeRing {
          inset: 12px !important;
        }

        /* Remove the unclipped rectangular gradient backgrounds rendered by html2canvas for clean look */
        .certAg::before, .certAg::after {
          display: none !important;
          content: none !important;
          background: transparent !important;
          background-color: transparent !important;
          border: none !important;
          opacity: 0 !important;
          box-shadow: none !important;
        }
      `;
      clonedDoc.head.appendChild(style);

      // ── WIPE ALL MEDIA QUERIES FROM CLONED DOC ──
      // Prevents browser from accidentally evaluating real device width against stylesheets during snapshot
      try {
        Array.from(clonedDoc.styleSheets).forEach(sheet => {
          try {
            const rules = sheet.cssRules || sheet.rules;
            if (!rules) return;
            for (let i = rules.length - 1; i >= 0; i--) {
              if (rules[i] instanceof CSSMediaRule) {
                sheet.deleteRule(i);
              }
            }
          } catch (err) { /* Silent fail for cross-origin sheets that don't hold layout logic */ }
        });
      } catch (err) { }

      // ── ADVANCED GRAPHICS OVERRIDES FOR PERFECT FIDELITY ──

      // A. "THE COMPUTING SOCIETY" Gradient Text
      const societyEl = clonedDoc.querySelector('.certSociety');
      if (societyEl) {
        const socText = societyEl.textContent || 'THE COMPUTING SOCIETY';
        societyEl.innerHTML = `
          <svg width="100%" height="45" viewBox="0 0 600 45" style="overflow:visible !important; display:block; margin:0 auto; width:100% !important;">
            <defs>
              <linearGradient id="socGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#D92C8A" />
                <stop offset="50%" stop-color="#6A35B8" />
                <stop offset="100%" stop-color="#3C63D9" />
              </linearGradient>
            </defs>
            <text x="300" y="32" text-anchor="middle" fill="url(#socGrad)" font-family="'Poppins', sans-serif" font-size="30px" font-weight="600" letter-spacing="0.16em">${socText}</text>
          </svg>
        `;
        societyEl.style.background = 'none';
        societyEl.style.webkitBackgroundClip = 'unset';
        societyEl.style.webkitTextFillColor = 'unset';
        societyEl.style.width = '100%';
        societyEl.style.display = 'block';
      }

      // B. "OF PARTICIPATION" Subtitle
      const subTextEl = clonedDoc.querySelector('.certSubText');
      if (subTextEl) {
        const subText = subTextEl.textContent || 'OF PARTICIPATION';
        subTextEl.innerHTML = `
          <svg width="200" height="20" viewBox="0 0 200 20" style="overflow:visible !important; display:inline-block; width:200px !important;">
            <defs>
              <linearGradient id="subGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#D92C8A" />
                <stop offset="50%" stop-color="#6A35B8" />
                <stop offset="100%" stop-color="#3C63D9" />
              </linearGradient>
            </defs>
            <text x="100" y="18" text-anchor="middle" fill="url(#subGrad)" font-family="'Poppins', sans-serif" font-size="13px" font-weight="600" letter-spacing="0.38em">${subText}</text>
          </svg>
        `;
        subTextEl.style.background = 'none';
        subTextEl.style.webkitBackgroundClip = 'unset';
        subTextEl.style.webkitTextFillColor = 'unset';
        subTextEl.style.width = '200px';
        subTextEl.style.display = 'inline-block';
        subTextEl.style.margin = '0 auto';
      }

      // C. Participant Name
      const nameEl = clonedDoc.querySelector('.certName');
      if (nameEl) {
        const nameText = nameEl.textContent || 'STUDENT NAME';
        nameEl.innerHTML = `
          <svg width="100%" height="75" viewBox="0 0 800 75" style="overflow:visible !important; display:block; margin:0 auto; width:100% !important;">
            <defs>
              <linearGradient id="nameGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#D92C8A" />
                <stop offset="50%" stop-color="#6A35B8" />
                <stop offset="100%" stop-color="#3C63D9" />
              </linearGradient>
            </defs>
            <text x="400" y="55" text-anchor="middle" fill="url(#nameGrad)" font-family="'Playfair Display', 'Cinzel', serif" font-size="60px" font-weight="700" letter-spacing="0.12em">${nameText.toUpperCase()}</text>
          </svg>
        `;
        nameEl.style.background = 'none';
        nameEl.style.webkitBackgroundClip = 'unset';
        nameEl.style.webkitTextFillColor = 'unset';
        nameEl.style.filter = 'none';
        nameEl.style.width = '100%';
        nameEl.style.display = 'block';
        nameEl.style.setProperty('margin', '0.7% 0 18px 0', 'important');
      }

      // D. AG No Hexagon Badge
      const agEl = clonedDoc.querySelector('.certAg');
      if (agEl) {
        const agNoText = agEl.textContent.replace(/♦/g, '').replace(/AG No:/i, '').trim();
        const newAgEl = clonedDoc.createElement('div');
        newAgEl.innerHTML = `
          <svg width="390" height="32" viewBox="0 0 390 32" style="display:block; margin:0 auto; overflow:visible !important; width:390px !important; height:32px !important;">
            <defs>
              <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#D92C8A" />
                <stop offset="50%" stop-color="#6A35B8" />
                <stop offset="100%" stop-color="#3C63D9" />
              </linearGradient>
            </defs>
            <line x1="0" y1="16" x2="70" y2="16" stroke="#D92C8A" stroke-width="1.2" />
            <line x1="320" y1="16" x2="390" y2="16" stroke="#3C63D9" stroke-width="1.2" />
            <g transform="translate(70, 0)">
              <polygon points="11,1 239,1 249,16 239,31 11,31 1,16" fill="#070726" stroke="url(#hexGrad)" stroke-width="2"/>
              <text x="32" y="21" fill="#ff2f92" font-family="'Poppins', sans-serif" font-size="14px" text-anchor="middle">♦</text>
              <text x="125" y="21" fill="#ffffff" font-family="'Poppins', sans-serif" font-size="12px" font-weight="600" letter-spacing="0.18em" text-anchor="middle">AG No: ${agNoText}</text>
              <text x="218" y="21" fill="#3C63D9" font-family="'Poppins', sans-serif" font-size="14px" text-anchor="middle">♦</text>
            </g>
          </svg>
        `;
        newAgEl.style.display = 'block';
        newAgEl.style.width = '100%';
        newAgEl.style.textAlign = 'center';
        newAgEl.style.margin = '0.2% auto 16px auto';
        newAgEl.style.transform = 'translateY(-10px)';
        agEl.parentNode.insertBefore(newAgEl, agEl);
        agEl.style.setProperty('display', 'none', 'important');
      }

      // E. Event Name Gradient
      const strongEl = clonedDoc.querySelector('.certDesc strong');
      if (strongEl) {
        const eventText = (strongEl.textContent || '').trim();
        const canvasCtx = document.createElement('canvas').getContext('2d');
        canvasCtx.font = "bold 13px 'Poppins', sans-serif";
        const measuredWidth = canvasCtx.measureText(eventText).width;
        strongEl.innerHTML = `
          <svg width="${measuredWidth + 2}" height="18" viewBox="0 0 ${measuredWidth + 2} 18" style="overflow:visible !important; display:inline-block; vertical-align:middle; margin:0; padding:0; width:${measuredWidth + 2}px !important;">
            <defs>
              <linearGradient id="eventGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#D92C8A" />
                <stop offset="50%" stop-color="#6A35B8" />
                <stop offset="100%" stop-color="#3C63D9" />
              </linearGradient>
            </defs>
            <text x="0" y="14" fill="url(#eventGrad)" font-family="'Poppins', sans-serif" font-weight="700" font-size="13px">${eventText}</text>
          </svg>
        `;
        strongEl.style.background = 'none';
        strongEl.style.webkitBackgroundClip = 'unset';
        strongEl.style.webkitTextFillColor = 'unset';
        strongEl.style.margin = '0';
        strongEl.style.padding = '0';
      }

      // F. Self-Contained SVG Badges Injection
      const fIcons = clonedDoc.querySelectorAll('.fIcon');
      if (fIcons.length >= 3) {
        if (fIcons[0]) {
          fIcons[0].innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 54 54" style="display:block; margin:auto; width:54px; height:54px; overflow:visible;">
              <circle cx="27" cy="27" r="25" fill="#070726" stroke="#D92C8A" stroke-width="2" />
              <g transform="translate(15, 15)" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <rect x="7" y="14" width="3" height="3" rx="0.5" fill="#ffffff" stroke="none"></rect>
              </g>
            </svg>
          `;
          fIcons[0].style.setProperty('background', 'none', 'important');
          fIcons[0].style.setProperty('border', 'none', 'important');
          fIcons[0].style.setProperty('box-shadow', 'none', 'important');
          fIcons[0].style.setProperty('display', 'block', 'important');
          fIcons[0].style.setProperty('width', '54px', 'important');
          fIcons[0].style.setProperty('height', '54px', 'important');
        }
        if (fIcons[1]) {
          fIcons[1].innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 54 54" style="display:block; margin:auto; width:54px; height:54px; overflow:visible;">
              <circle cx="27" cy="27" r="25" fill="#070726" stroke="#3C63D9" stroke-width="2" />
              <g transform="translate(15, 15)" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </g>
            </svg>
          `;
          fIcons[1].style.setProperty('background', 'none', 'important');
          fIcons[1].style.setProperty('border', 'none', 'important');
          fIcons[1].style.setProperty('box-shadow', 'none', 'important');
          fIcons[1].style.setProperty('display', 'block', 'important');
          fIcons[1].style.setProperty('width', '54px', 'important');
          fIcons[1].style.setProperty('height', '54px', 'important');
        }
        if (fIcons[2]) {
          fIcons[2].innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 54 54" style="display:block; margin:auto; width:54px; height:54px; overflow:visible;">
              <circle cx="27" cy="27" r="25" fill="#070726" stroke="#3C63D9" stroke-width="2" />
              <g transform="translate(15, 15)" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </g>
            </svg>
          `;
          fIcons[2].style.setProperty('background', 'none', 'important');
          fIcons[2].style.setProperty('border', 'none', 'important');
          fIcons[2].style.setProperty('box-shadow', 'none', 'important');
          fIcons[2].style.setProperty('display', 'block', 'important');
          fIcons[2].style.setProperty('width', '54px', 'important');
          fIcons[2].style.setProperty('height', '54px', 'important');
        }
      }
    }
  });

  const roundedCanvas = document.createElement('canvas');
  roundedCanvas.width = canvas.width;
  roundedCanvas.height = canvas.height;
  const ctx = roundedCanvas.getContext('2d');

  ctx.fillStyle = '#070726';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const r = 10 * (canvas.width / 297);
  const w = canvas.width;
  const h = canvas.height;

  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r);
  ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(r, h);
  ctx.quadraticCurveTo(0, h, 0, h - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(canvas, 0, 0);

  // Use a highly compressed JPEG and scale down quality heavily
  const imgData = roundedCanvas.toDataURL('image/jpeg', 0.65);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  doc.setFillColor(7, 7, 38);
  doc.rect(0, 0, W, H, 'F');

  const imgAspect = canvas.width / canvas.height;
  const pageAspect = W / H;

  let imgW, imgH, imgX, imgY;
  if (imgAspect > pageAspect) {
    imgW = W;
    imgH = W / imgAspect;
    imgX = 0;
    imgY = (H - imgH) / 2;
  } else {
    imgH = H;
    imgW = H * imgAspect;
    imgX = (W - imgW) / 2;
    imgY = 0;
  }

  // Use FAST compression to aggressively minimize jsPDF blob size
  doc.addImage(imgData, 'JPEG', imgX, imgY, imgW, imgH, undefined, 'FAST');
  doc.save(`TCS_Certificate_${data.name || 'Student'}.pdf`);
  } catch (err) {
    console.error("Certificate PDF generation failed:", err);
    alert("Error downloading PDF: " + err.message);
  } finally {
    if (container) {
      if (originalContainerStyle) {
        container.setAttribute('style', originalContainerStyle);
      } else {
        container.removeAttribute('style');
      }
    }
    if (certCard) {
      if (originalCardStyle) {
        certCard.setAttribute('style', originalCardStyle);
      } else {
        certCard.removeAttribute('style');
      }
    }
  }
}

