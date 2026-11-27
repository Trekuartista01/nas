/**
 * Web copies for the homepage Sport Line intro (components/home/SportLineIntro.tsx):
 *   public/nas-images/01-center-rider.jpg -> nas-images/web/sport-intro-rider.webp (983 x 941)
 *     A near-square crop around the rider: the 9 strips show the image at 648:620 (background-size 1080%
 *     of a 540:620 box), so the source must have that ratio or the rider is squashed.
 *   public/nas-images/02-helmet.png       -> nas-images/web/sport-intro-helmet.webp (3:4 crop on the helmet)
 * The headlight / glove / wheel tiles are CSS crops of nas-images/web/sport-line-night-1280.webp (same photo).
 * Then upload with `node scripts/upload-media.mjs`.
 */
import sharp from "sharp";

const OUT = "public/nas-images/web";
const RIDER = "public/nas-images/01-center-rider.jpg";
const HELMET = "public/nas-images/02-helmet.png";

// 983 x 941 = 648:620, centred on the bike (the source is 1672 x 941).
const riderCrop = { left: 340, top: 0, width: 983, height: 941 };
await sharp(RIDER).extract(riderCrop).webp({ quality: 78 }).toFile(`${OUT}/sport-intro-rider.webp`);
// 3:4 around the helmet (the source is 1920 x 1080).
await sharp(HELMET).extract({ left: 580, top: 0, width: 810, height: 1080 }).resize({ width: 600 }).webp({ quality: 76 }).toFile(`${OUT}/sport-intro-helmet.webp`);
console.log("done");
