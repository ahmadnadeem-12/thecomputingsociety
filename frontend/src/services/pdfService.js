import jsPDF from 'jspdf';

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

const TK_BG   = [8, 11, 30];
const TK_CARD = [12, 16, 42];
const TK_PINK = [255, 45, 149];
const TK_CYAN = [34, 211, 238];
const TK_PRP  = [138, 92, 246];
const TK_WHT  = [255, 255, 255];
const TK_GRY  = [148, 163, 184];

function drawPageHeader(doc, W, H) {
  doc.setFillColor(TK_BG[0], TK_BG[1], TK_BG[2]);
  doc.rect(0, 0, W, H, 'F');
  
  let hy = 20;
  // Header Arrows
  doc.setDrawColor(TK_PINK[0], TK_PINK[1], TK_PINK[2]); doc.setLineWidth(0.4);
  doc.line(15, hy, 50, hy);
  doc.triangle(49, hy - 0.8, 49, hy + 0.8, 52, hy, 'F');

  doc.setDrawColor(TK_CYAN[0], TK_CYAN[1], TK_CYAN[2]);
  doc.line(W - 15, hy, W - 50, hy);
  doc.triangle(W - 49, hy - 0.8, W - 49, hy + 0.8, W - 52, hy, 'F');

  doc.setFont('helvetica', 'bold'); doc.setFontSize(20);
  const title = 'THE COMPUTING SOCIETY';
  const tw = doc.getTextWidth(title);
  const tx = (W - tw) / 2;
  doc.setTextColor(TK_PINK[0], TK_PINK[1], TK_PINK[2]); doc.text('THE ', tx, hy + 1);
  doc.setTextColor(TK_PRP[0], TK_PRP[1], TK_PRP[2]); doc.text('COMPUTING ', tx + doc.getTextWidth('THE '), hy + 1);
  doc.setTextColor(TK_CYAN[0], TK_CYAN[1], TK_CYAN[2]); doc.text('SOCIETY', tx + doc.getTextWidth('THE COMPUTING '), hy + 1);

  hy += 7;
  doc.setFontSize(8); doc.setTextColor(TK_GRY[0], TK_GRY[1], TK_GRY[2]);
  doc.text('DEPT. OF COMPUTER SCIENCE, UNIVERSITY OF AGRICULTURE FAISALABAD', W / 2, hy, { align: 'center' });

  hy += 10;
  doc.setTextColor(TK_PRP[0], TK_PRP[1], TK_PRP[2]); doc.setFontSize(7); doc.setFont('helvetica', 'italic');
  doc.text('»»»»» Kindly show this ticket at the entry desk for verification. «««««', W / 2, hy, { align: 'center' });
  
  return hy + 5;
}

function drawPageFooter(doc, W, H) {
  const fy = H - 12;
  doc.setFontSize(8); doc.setTextColor(TK_GRY[0], TK_GRY[1], TK_GRY[2]);
  doc.text('Thank you for being a part of our community.', 15, fy);
  doc.setTextColor(TK_CYAN[0], TK_CYAN[1], TK_CYAN[2]);
  doc.text('Learn. Connect. Innovate.', W - 15, fy, { align: 'right' });

  const bx = W/2, by = fy;
  doc.setDrawColor(TK_PRP[0], TK_PRP[1], TK_PRP[2]); doc.setLineWidth(0.3);
  doc.circle(bx, by, 6, 'S');
  doc.setTextColor(TK_CYAN[0], TK_CYAN[1], TK_CYAN[2]); doc.setFontSize(6);
  doc.text('</>', bx, by + 1.2, { align: 'center' });
}

function drawOneTicketCard(doc, t, qrUrl, x, y, w, h) {
  const pad = 8;
  doc.setFillColor(10, 15, 35);
  doc.roundedRect(x, y, w, h, 8, 8, 'F');
  
  // Outer glow border
  doc.setDrawColor(TK_PINK[0], TK_PINK[1], TK_PINK[2], 0.1);
  doc.setLineWidth(0.5);
  doc.roundedRect(x-0.5, y-0.5, w+1, h+1, 8.5, 8.5, 'S');

  // Simulated Side Cutouts
  doc.setFillColor(TK_BG[0], TK_BG[1], TK_BG[2]);
  doc.circle(x, y + h/2, 4, 'F');
  doc.circle(x + w, y + h/2, 4, 'F');

  // QR Section
  const qW = h - pad * 2.5;
  const qX = x + pad, qY = y + pad;
  if (qrUrl) {
    doc.setFillColor(255, 255, 255); doc.roundedRect(qX, qY, qW, qW, 4, 4, 'F');
    doc.addImage(qrUrl, 'PNG', qX + 3, qY + 3, qW - 6, qW - 6);
  }
  doc.setFontSize(6); doc.setTextColor(TK_GRY[0], TK_GRY[1], TK_GRY[2]); doc.setFont('helvetica', 'bold');
  doc.text('SCAN AT ENTRY', qX + qW/2, qY + qW + 6, { align: 'center', charSpace: 1 });

  const dX = qX + qW + 12, dW = w - (dX - x) - pad;
  let dy = y + pad + 8;

  // Title
  doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(TK_PINK[0], TK_PINK[1], TK_PINK[2]);
  doc.text((t.eventTitle || 'TCS OFFICIAL PASS').toUpperCase(), dX, dy);

  dy += 12;
  const colW = (dW / 5);
  const items = [
    { L: 'DATE', V: t.eventDate }, { L: 'TIME/DURATION', V: t.eventTime }, 
    { L: 'DEPARTMENT', V: t.department }, { L: 'SEMESTER', V: t.semester }, { L: 'AG NO', V: t.agNo }
  ];

  items.forEach((item, i) => {
    const ix = dX + i * colW;
    doc.setFontSize(6); doc.setTextColor(TK_GRY[0], TK_GRY[1], TK_GRY[2]); doc.setFont('helvetica', 'bold');
    doc.text(item.L, ix, dy - 4);
    doc.setFontSize(7.5); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
    let val = String(item.V || 'N/A');
    if (val.length > 15) val = val.substring(0, 13) + '..';
    doc.text(val, ix, dy + 0.5);
  });

  dy += 16;
  doc.setFontSize(6); doc.setTextColor(TK_GRY[0], TK_GRY[1], TK_GRY[2]); doc.setFont('helvetica', 'bold');
  doc.text('VERIFIED EMAIL ADDRESS', dX, dy);
  doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text(t.email || '', dX, dy + 5);

  const issuedToX = dX + dW * 0.45;
  doc.setFontSize(6); doc.setTextColor(TK_GRY[0], TK_GRY[1], TK_GRY[2]); doc.setFont('helvetica', 'bold');
  doc.text('ISSUED TO (VERIFIED DELEGATE)', issuedToX, dy);
  doc.setTextColor(TK_CYAN[0], TK_CYAN[1], TK_CYAN[2]); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  const name = (t.name || '').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  doc.text(name, issuedToX, dy + 5.5);

  const pW = 65, pH = 7, pX = x + w - pW - pad;
  doc.setFillColor(34, 211, 238, 0.05);
  doc.setDrawColor(TK_CYAN[0], TK_CYAN[1], TK_CYAN[2]); doc.setLineWidth(0.3);
  doc.roundedRect(pX, dy + 1, pW, pH, 3.5, 3.5, 'S');
  doc.setFontSize(5); doc.setTextColor(TK_CYAN[0], TK_CYAN[1], TK_CYAN[2]); doc.setFont('helvetica', 'bold');
  doc.text('TICKET ID: ' + (t.publicTicketId || t.id || 'N/A'), pX + pW/2, dy + 5.5, { align: 'center', charSpace: 0.5 });
}

export function downloadTicketPDF(t, qr) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
  const sy = drawPageHeader(doc, W, H);
  drawOneTicketCard(doc, t, qr, 15, sy + 15, W - 30, 52);
  drawPageFooter(doc, W, H);
  doc.save(`TCS_Pass_${t.name || 'User'}.pdf`);
}

export function downloadAllTicketsPDF(tickets, qrs) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
  const PER = 3, ch = 52, gap = 12;
  tickets.forEach((t, i) => {
    if (i % PER === 0) {
      if (i > 0) doc.addPage();
      drawPageHeader(doc, W, H);
      drawPageFooter(doc, W, H);
    }
    const py = 55 + (i % PER) * (ch + gap);
    drawOneTicketCard(doc, t, qrs[i], 15, py, W - 30, ch);
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
  for(let i=0; i<3; i++) for(let j=0; j<3; j++) doc.circle(W-15+i*4, H-15+j*4, 0.6, 'F');

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
  doc.text('THE COMPUTING SOCIETY', W/2, 25, { align: 'center', charSpace: 1.2 });
  
  doc.setDrawColor(PINK[0], PINK[1], PINK[2]); doc.setLineWidth(0.4);
  doc.line(W/2 - 35, 28, W/2 + 35, 28);
  doc.setFillColor(PINK[0], PINK[1], PINK[2]); doc.circle(W/2 - 35, 28, 0.7, 'F'); doc.circle(W/2 + 35, 28, 0.7, 'F');

  doc.setFontSize(8.5); doc.setTextColor(GREY[0], GREY[1], GREY[2]);
  doc.text('DEPT. OF COMPUTER SCIENCE,', W/2, 35, { align: 'center' });
  doc.text('UNIVERSITY OF AGRICULTURE FAISALABAD', W/2, 40, { align: 'center' });

  // 4. MAIN TITLE
  doc.setFont('times', 'bold');
  doc.setFontSize(46);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text('AWARD CERTIFICATE', W/2, 65, { align: 'center' });

  // 5. SUBTITLE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(PINK[0], PINK[1], PINK[2]);
  doc.text('OF PARTICIPATION', W/2, 78, { align: 'center', charSpace: 2 });
  doc.setDrawColor(PINK[0], PINK[1], PINK[2]); doc.setLineWidth(0.3);
  doc.line(W/2 - 45, 78, W/2 - 30, 78); doc.line(W/2 + 30, 78, W/2 + 45, 78);
  doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]); doc.triangle(W/2-28, 77.2, W/2-28, 78.8, W/2-26, 78, 'F');
  doc.triangle(W/2+28, 77.2, W/2+28, 78.8, W/2+26, 78, 'F');

  // 6. PROUDLY PRESENTED
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(GREY[0], GREY[1], GREY[2]);
  doc.text('PROUDLY PRESENTED TO', W/2, 95, { align: 'center' });

  // 7. NAME (Gradient-ish effect via shadow)
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(54);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text((data.name || 'User Name').toUpperCase(), W/2, 118, { align: 'center' });
  // Subtle glow
  doc.setTextColor(BLUE[0], BLUE[1], BLUE[2]); doc.setFontSize(54.2);
  doc.text((data.name || 'User Name').toUpperCase(), W/2 + 0.1, 118.1, { align: 'center' , opacity: 0.1 });

  // 8. AG NO
  const ag = `AG No: ${data.agNo || 'XXXX-AG-XXXX'}`;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5);
  const aw = doc.getTextWidth(ag) + 12;
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.roundedRect(W/2 - aw/2, 128, aw, 8, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(ag, W/2, 133.5, { align: 'center' });

  // 9. EVENT TEXT
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  const text = `For participating in "${data.eventTitle || 'Event'}" organized by\nThe Computing Society, University of Agriculture Faisalabad.`;
  doc.text(text, W/2, 150, { align: 'center', lineHeightFactor: 1.4 });

  // 10. VECTOR ICONS (No emojis)
  const iy = 188, c1 = W*0.25, c2 = W*0.5, c3 = W*0.75;
  
  function drawIcon(x, y, type) {
    doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2]); doc.setLineWidth(0.4);
    doc.circle(x, y-10, 6.5, 'S');
    doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]); doc.circle(x, y-10, 6, 'F');
    doc.setDrawColor(255, 255, 255); doc.setLineWidth(0.5);
    if(type === 'date') {
       doc.rect(x-2.5, y-12.5, 5, 4.5, 'S'); doc.line(x-2.5, y-10.5, x+2.5, y-10.5);
    } else if(type === 'pen') {
       doc.line(x-2, y-8.5, x+2, y-11.5); doc.line(x+2, y-11.5, x+1, y-12.5);
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
  const sx = W/2, sy = H - 22;
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  // Star seal effect
  for(let i=0; i<12; i++){
    const ang = (i * 30) * Math.PI / 180;
    doc.triangle(sx + 10*Math.cos(ang), sy + 10*Math.sin(ang), 
                 sx + 12*Math.cos(ang+0.2), sy + 12*Math.sin(ang+0.2),
                 sx + 12*Math.cos(ang-0.2), sy + 12*Math.sin(ang-0.2), 'F');
  }
  doc.circle(sx, sy, 10, 'F');
  doc.setDrawColor(PINK[0], PINK[1], PINK[2]); doc.setLineWidth(0.8);
  doc.circle(sx, sy, 10.5, 'S');
  doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text('</>', sx, sy + 1.5, { align: 'center' });

  doc.save(`TCS_Certificate_${data.name || 'Student'}.pdf`);
}
