/**
 * Builds certificate HTML with ALL styles inline + SVG for gradient text.
 * This ensures html2canvas captures everything perfectly — no CSS limitations.
 */
import cornerTLImg from '../assets/images/corner-tl.png';
import bottomBarImg from '../assets/images/bottom-bar.png';
import awardSealImg from '../assets/images/award-seal.png';

const GRAD = `<linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#D92C8A"/><stop offset="50%" stop-color="#6A35B8"/><stop offset="100%" stop-color="#3C63D9"/></linearGradient>`;

function svgText(text, fontSize, fontFamily, fontWeight, extraAttrs = '') {
  return `<svg width="100%" height="${fontSize * 1.6}px" style="overflow:visible;display:block;margin:0 auto;">
    <defs>${GRAD}</defs>
    <text x="50%" y="${fontSize * 1.15}" text-anchor="middle" fill="url(#g1)"
      font-family="${fontFamily}" font-size="${fontSize}px" font-weight="${fontWeight}"
      ${extraAttrs}>${text}</text>
  </svg>`;
}

export function buildCertificateHTML(data) {
  const name = (data.name || 'STUDENT NAME').toUpperCase();
  const agNo = data.agNo || 'XXXX-AG-XXXX';
  const eventTitle = data.eventTitle || 'Event';
  const eventDate = data.eventDate || 'TBA';

  const W = 1060, H = 750;

  return `<div id="cert-offscreen" style="position:fixed;left:-9999px;top:0;z-index:-1;font-family:'Poppins',sans-serif;">
  <div style="padding:3px;border-radius:28px;background:linear-gradient(135deg,#D92C8A 0%,#6A35B8 50%,#3C63D9 100%);width:${W}px;">
    <div style="position:relative;width:100%;height:${H}px;background:linear-gradient(135deg,#fff 80%,#f4f6fb 100%);border-radius:24px;overflow:hidden;border:1.5px solid rgba(10,8,37,0.08);">

      <!-- Corner TL -->
      <img src="${cornerTLImg}" style="position:absolute;top:0;left:0;width:250px;height:250px;border-top-left-radius:24px;z-index:10;" crossorigin="anonymous"/>

      <!-- Top-right L-border (was ::after) -->
      <div style="position:absolute;top:15px;right:15px;width:180px;height:170px;border-top:2px solid #000;border-right:2px solid #000;border-top-right-radius:12px;z-index:8;pointer-events:none;"></div>

      <!-- Diagonal hatching (was ::before) -->
      <div style="position:absolute;top:0;right:0;width:40%;height:50%;background:repeating-linear-gradient(45deg,rgba(10,8,37,0.03) 0px,rgba(10,8,37,0.03) 1px,transparent 1px,transparent 10px);z-index:1;pointer-events:none;"></div>

      <!-- Bottom bar -->
      <div style="position:absolute;top:0;left:0;right:0;bottom:0;z-index:5;pointer-events:none;">
        <img src="${bottomBarImg}" style="position:absolute;bottom:0;left:0;width:100%;height:auto;" crossorigin="anonymous"/>
      </div>

      <!-- CONTENT BODY -->
      <div style="position:relative;z-index:12;height:100%;display:flex;flex-direction:column;align-items:center;padding:1.5% 10% 2.8%;box-sizing:border-box;">

        <!-- Society name (gradient SVG) -->
        ${svgText('THE COMPUTING SOCIETY', 24, "'Poppins',sans-serif", 600, 'letter-spacing="0.16em"')}

        <!-- Header lines: pink dot + line + line + blue dot -->
        <div style="display:flex;align-items:center;justify-content:center;width:100%;max-width:520px;margin:0 0 4px;">
          <div style="width:6px;height:6px;background:#D92C8A;border-radius:50%;box-shadow:0 0 6px rgba(217,44,138,0.4);flex-shrink:0;"></div>
          <div style="width:250px;height:1.5px;background:linear-gradient(to right,#D92C8A,#6A35B8);"></div>
          <div style="width:250px;height:1.5px;background:linear-gradient(to right,#6A35B8,#3C63D9);"></div>
          <div style="width:6px;height:6px;background:#3C63D9;border-radius:50%;box-shadow:0 0 6px rgba(60,99,217,0.4);flex-shrink:0;"></div>
        </div>

        <!-- Department -->
        <div style="font-family:'Poppins',sans-serif;font-size:10px;font-weight:600;color:#555a7e;text-align:center;line-height:1.5;letter-spacing:0.04em;text-transform:uppercase;margin-top:1px;">
          DEPT. OF COMPUTER SCIENCE,<br/>UNIVERSITY OF AGRICULTURE FAISALABAD
        </div>

        <!-- AWARD CERTIFICATE title -->
        <h1 style="font-family:'Playfair Display','Cinzel',serif;font-size:46px;font-weight:normal;color:#070726;margin:0.2% 0;letter-spacing:0.12em;text-shadow:1px 1.5px 2px rgba(7,7,38,0.12);">AWARD CERTIFICATE</h1>

        <!-- OF PARTICIPATION subtitle -->
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.8%;">
          <div style="width:70px;height:1.2px;background:linear-gradient(to left,#D92C8A,transparent);"></div>
          <div style="width:6px;height:6px;background:linear-gradient(135deg,#D92C8A,#6A35B8,#3C63D9);transform:rotate(45deg);flex-shrink:0;"></div>
          ${svgText('OF PARTICIPATION', 11, "'Poppins',sans-serif", 500, 'letter-spacing="0.38em"')}
          <div style="width:6px;height:6px;background:linear-gradient(135deg,#D92C8A,#6A35B8,#3C63D9);transform:rotate(45deg);flex-shrink:0;"></div>
          <div style="width:70px;height:1.2px;background:linear-gradient(to right,#3C63D9,transparent);"></div>
        </div>

        <!-- PROUDLY PRESENTED TO -->
        <div style="font-family:'Poppins',sans-serif;font-size:10px;font-weight:600;color:#555a7e;letter-spacing:0.18em;margin-top:2%;text-transform:uppercase;">PROUDLY PRESENTED TO</div>

        <!-- Recipient NAME (gradient SVG) -->
        <div style="margin:0.7% 0;transform:translateY(-10px);">
          ${svgText(name, 50, "'Playfair Display','Cinzel',serif", 'normal', 'letter-spacing="0.12em" font-style="normal" text-transform="uppercase"')}
        </div>

        <!-- AG No hexagonal badge -->
        <div style="position:relative;z-index:10;margin:1% 0;transform:translateY(-10px);display:flex;align-items:center;justify-content:center;">
          <div style="width:70px;height:1.2px;background:linear-gradient(to right,transparent,#D92C8A);"></div>
          <svg width="auto" height="32" viewBox="0 0 240 32" style="overflow:visible;">
            <defs>${GRAD}</defs>
            <polygon points="11,0 229,0 240,16 229,32 11,32 0,16" fill="#070726" stroke="url(#g1)" stroke-width="2"/>
            <text x="120" y="20" text-anchor="middle" fill="#fff" font-family="Poppins,sans-serif" font-size="10" font-weight="500" letter-spacing="0.3em">
              <tspan fill="#ff2f92">♦</tspan> AG No: ${agNo} <tspan fill="#4169ff">♦</tspan>
            </text>
          </svg>
          <div style="width:70px;height:1.2px;background:linear-gradient(to left,transparent,#3C63D9);"></div>
        </div>

        <!-- Description -->
        <p style="font-family:'Poppins',sans-serif;font-size:10px;color:#4f566b;text-align:center;max-width:75%;line-height:1.6;margin-top:8px;transform:translateY(-10px);">
          For participating in
          <svg width="auto" height="14" style="display:inline;vertical-align:middle;overflow:visible;">
            <defs>${GRAD}</defs>
            <text x="0" y="11" fill="url(#g1)" font-family="Poppins,sans-serif" font-size="10" font-weight="700">"${eventTitle}"</text>
          </svg>
          organized by The Computing Society, University of Agriculture Faisalabad.
        </p>

        <!-- Diamond divider -->
        <div style="display:flex;align-items:center;justify-content:center;width:calc(100% - 8%);max-width:580px;margin:1.5% auto;transform:translateY(-12px);">
          <div style="flex:1;height:1.5px;background:linear-gradient(to left,rgba(85,90,126,0.3),transparent 90%);"></div>
          <div style="width:6px;height:6px;border:1.5px solid #555a7e;transform:rotate(45deg);background:#fff;flex-shrink:0;margin:0 10px;"></div>
          <div style="flex:1;height:1.5px;background:linear-gradient(to right,rgba(85,90,126,0.3),transparent 90%);"></div>
        </div>

        <!-- FOOTER -->
        <div style="margin-top:2%;width:100%;display:flex;justify-content:space-between;align-items:flex-start;padding:0 4% 3rem;box-sizing:border-box;position:relative;">

          <!-- Event Date Column -->
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;transform:translateY(-15px);">
            <div style="width:54px;height:54px;border-radius:50%;background:#070726;display:flex;align-items:center;justify-content:center;margin-bottom:8px;border:2px solid #D92C8A;box-shadow:inset 0 0 0 1.5px #fff,0 0 12px rgba(217,44,138,0.45);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><rect x="7" y="14" width="3" height="3" rx="0.5" fill="#fff" stroke="none"/></svg>
            </div>
            <div style="font-family:'Poppins',sans-serif;font-weight:600;font-size:9px;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:14px;color:#D92C8A;">EVENT DATE</div>
            <div style="font-family:'Poppins',sans-serif;font-size:8px;font-weight:500;color:#4f566b;max-width:150px;line-height:1.4;">${eventTitle}</div>
            <div style="font-family:'Poppins',sans-serif;font-size:8px;font-weight:500;color:#4f566b;max-width:150px;line-height:1.4;">${eventDate}</div>
          </div>

          <!-- Divider 1 -->
          <div style="width:2px;height:100px;background:rgba(10,8,37,0.12);flex-shrink:0;align-self:center;margin:0 1.5%;position:relative;transform:translateY(-20px);">
            <div style="position:absolute;top:50%;left:50%;width:5px;height:5px;border:1px solid #ff2f92;background:#fff;transform:translate(-50%,-50%) rotate(45deg);"></div>
          </div>

          <!-- Venue Column -->
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;transform:translateY(-25px);">
            <div style="width:54px;height:54px;border-radius:50%;background:#070726;display:flex;align-items:center;justify-content:center;margin-bottom:8px;border:2px solid #3C63D9;box-shadow:inset 0 0 0 1.5px #fff,0 0 12px rgba(60,99,217,0.45);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div style="font-family:'Poppins',sans-serif;font-weight:600;font-size:9px;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:14px;color:#3C63D9;">VENUE</div>
            <div style="font-family:'Poppins',sans-serif;font-size:8px;font-weight:500;color:#4f566b;max-width:150px;line-height:1.4;">according to event</div>
            <div style="font-family:'Poppins',sans-serif;font-size:8px;font-weight:500;color:#4f566b;max-width:150px;line-height:1.4;">${eventDate}</div>
          </div>

          <!-- Divider 2 -->
          <div style="width:2px;height:100px;background:rgba(10,8,37,0.12);flex-shrink:0;align-self:center;margin:0 1.5%;position:relative;transform:translateY(-20px);">
            <div style="position:absolute;top:50%;left:50%;width:5px;height:5px;border:1px solid #ff2f92;background:#fff;transform:translate(-50%,-50%) rotate(45deg);"></div>
          </div>

          <!-- Signature Column -->
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;transform:translateY(-15px);">
            <div style="width:54px;height:54px;border-radius:50%;background:#070726;display:flex;align-items:center;justify-content:center;margin-bottom:8px;border:2px solid #3C63D9;box-shadow:inset 0 0 0 1.5px #fff,0 0 12px rgba(60,99,217,0.45);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            <div style="font-family:'Poppins',sans-serif;font-weight:600;font-size:9px;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:14px;color:#3C63D9;">SIGNATURE</div>
            <div style="font-family:'Dancing Script',cursive;font-size:18px;font-weight:500;color:#070726;transform:rotate(-2deg);margin-top:-13px;">The Computing Society</div>
            <div style="width:140px;height:1px;background:linear-gradient(to right,#D92C8A 0%,#6A35B8 50%,#3C63D9 100%);margin-top:1px;"></div>
          </div>

          <!-- Award Seal Badge -->
          <img src="${awardSealImg}" style="display:block;position:absolute;top:68%;left:50%;transform:translateX(-50%);width:135px;height:auto;z-index:25;" crossorigin="anonymous"/>
        </div>

      </div>
    </div>
  </div>
</div>`;

  return html;
}
