import "server-only";
import fontkit from "@pdf-lib/fontkit";
import { readFile } from "node:fs/promises";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { BUSINESS } from "@/data/business";
import { modelSpecSheet, TYPE_LABEL, type Model } from "@/data/models";

/**
 * Spec brochure PDF for one model (the "Download brochure" button in the SPECS section).
 * One landscape A4 page laid out like the manufacturer's Technical Data sheet: three column groups
 * (Complete Vehicle / Power System / Suspension System), dark header band, label/value rows,
 * blank cells under the shorter groups. No design yet: uses the site tokens (ink, red) and Publica Sans.
 */

const W = 842; // A4 landscape, points
const H = 595;
const M = 36;

const INK = rgb(0x0a / 255, 0x0a / 255, 0x0a / 255);
const RED = rgb(0xe1 / 255, 0x06 / 255, 0);
const TEXT = rgb(0.2, 0.2, 0.2);
const MUTED = rgb(0.45, 0.45, 0.45);
const LINE = rgb(0.84, 0.84, 0.84);
const WHITE = rgb(1, 1, 1);

/** Label/value width per group, in the proportions of the reference sheet. */
const COLUMNS: [number, number][] = [
  [298, 69],
  [199, 197],
  [276, 80],
];

// One literal `readFile(new URL(..., import.meta.url))` per font, so the bundler ships exactly these three
// files with the route. (Reading from a variable made it trace the whole project, public/ included, into the function.)
const loadFonts = () =>
  Promise.all([
    readFile(new URL("../app/fonts/PublicaSans-Regular.otf", import.meta.url)),
    readFile(new URL("../app/fonts/PublicaSans-Bold.otf", import.meta.url)),
    readFile(new URL("../app/fonts/PublicaSans-ExtraBold.otf", import.meta.url)),
  ]);

export async function brochurePdf(m: Model): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const [regular, bold, heavy] = await Promise.all((await loadFonts()).map((bytes) => doc.embedFont(bytes, { subset: true })));
  const title = `${m.brand} ${m.name}`;
  doc.setTitle(`${title} · Technical Data`);
  doc.setAuthor(BUSINESS.name);
  doc.setSubject(`${title}: technical data`);

  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });

  // Heading: brand line, model name with a red full stop, "Technical Data" on the right.
  let y = H - M;
  page.drawText(`${m.brand} · ${TYPE_LABEL[m.type]} · ${m.cc} cc`.toUpperCase(), { x: M, y: y - 9, size: 9, font: bold, color: MUTED });
  const nameSize = 26;
  const name = title.toUpperCase();
  page.drawText(name, { x: M, y: y - 38, size: nameSize, font: heavy, color: INK });
  page.drawText(".", { x: M + heavy.widthOfTextAtSize(name, nameSize), y: y - 38, size: nameSize, font: heavy, color: RED });
  const label = "TECHNICAL DATA";
  page.drawText(label, { x: W - M - heavy.widthOfTextAtSize(label, 16), y: y - 36, size: 16, font: heavy, color: INK });
  y -= 52;
  slashBar(page, M, y, W - 2 * M);
  y -= 14;

  // Table.
  const groups = modelSpecSheet(m);
  const tableW = W - 2 * M;
  const scale = tableW / COLUMNS.flat().reduce((a, b) => a + b, 0);
  const cols = COLUMNS.map(([l, v]) => [l * scale, v * scale] as const);
  const headerH = 22;
  const rowCount = Math.max(...groups.map((g) => g.rows.length));
  const footerH = 34;
  const rowH = Math.min(24, (y - headerH - M - footerH) / rowCount);

  let x = M;
  groups.forEach((g, gi) => {
    const [lw, vw] = cols[gi];
    const gw = lw + vw;
    page.drawRectangle({ x, y: y - headerH, width: gw, height: headerH, color: INK, borderColor: WHITE, borderWidth: gi ? 0.5 : 0 });
    centered(page, g.title, bold, 9, WHITE, x, gw, y - headerH / 2);
    for (let r = 0; r < rowCount; r++) {
      const top = y - headerH - r * rowH;
      const row = g.rows[r];
      for (const [cx, cw, text, font] of [
        [x, lw, row?.label ?? "", regular],
        [x + lw, vw, row?.value ?? "", regular],
      ] as const) {
        page.drawRectangle({ x: cx, y: top - rowH, width: cw, height: rowH, borderColor: LINE, borderWidth: 0.5 });
        if (text) centered(page, text, font, 8, TEXT, cx, cw, top - rowH / 2);
      }
    }
    x += gw;
  });

  // Footer: dealer and a red rule.
  const fy = M;
  page.drawRectangle({ x: M, y: fy + 18, width: 28, height: 3, color: RED });
  const dealer = `${BUSINESS.name} · ${BUSINESS.phoneDisplay}`;
  page.drawText(dealer, { x: M, y: fy + 4, size: 8, font: bold, color: INK });

  return doc.save();
}

/** Text centred in a cell, shrunk to fit its width (long values like "Constant mesh 6-speed"). */
function centered(page: PDFPage, text: string, font: PDFFont, size: number, color: ReturnType<typeof rgb>, x: number, w: number, midY: number) {
  const pad = 6;
  let s = size;
  while (s > 5 && font.widthOfTextAtSize(text, s) > w - 2 * pad) s -= 0.25;
  const tw = font.widthOfTextAtSize(text, s);
  page.drawText(text, { x: x + (w - tw) / 2, y: midY - s * 0.35, size: s, font, color });
}

/** Thin red rule ending in two slanted marks, like the SPECS card tops on the site. */
function slashBar(page: PDFPage, x: number, y: number, w: number) {
  const h = 6;
  const k = 3; // slant
  const marks = [40, 26];
  const gap = 4;
  const barW = w - marks.reduce((a, b) => a + b + gap, 0);
  page.drawSvgPath(`M0 0 L${barW} 0 L${barW - k} ${h} L0 ${h} Z`, { x, y, color: RED });
  let mx = x + barW + gap;
  for (const mw of marks) {
    page.drawSvgPath(`M${k} 0 L${mw} 0 L${mw - k} ${h} L0 ${h} Z`, { x: mx, y, color: RED });
    mx += mw + gap;
  }
}
