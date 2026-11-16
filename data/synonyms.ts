/**
 * Search synonym groups for the catalog (/modelet, /aksesoret).
 *
 * Each item is tagged with group ids; every word in a tagged group then finds that item.
 * Write terms in any form: accents, case, hyphens and spaces are normalised away
 * (so "kaskë", "kaske", "KASKA" are the same). Albanian (standard + Gheg/Kosovo usage),
 * English, and common misspellings all belong here. Add freely: more words = more hits.
 */
export const SYNONYMS: Record<string, string[]> = {
  /* ───── Vehicle types ───── */
  // Everyday words for any vehicle we sell: in Kosovo "motorr" covers scooters and ATVs too.
  vehicle: [
    "motor", "motorr", "motorra", "motorë", "motori", "motorat", "motoret", "moto", "mottor", "motorrr",
    "mjet", "mjete", "mjeti", "automjet", "vehicle", "vehicles",
  ],
  // Specifically motorcycles (not scooters / ATVs).
  motorcycle: [
    "motocikletë", "motocikleta", "motocikel", "motoçikletë", "motorcycle", "motorcycles", "motorbike", "motorbikes", "bike", "bikes",
  ],
  sport: [
    "sport", "sporte", "sportiv", "sportive", "supersport", "super sport", "sport bike", "sportbike", "racing", "race",
    "garë", "gara", "pistë", "pista", "track", "naked", "streetfighter", "street", "rr", "i shpejtë", "shpejt", "fast",
  ],
  dirt: [
    "dirt", "dirt bike", "dirtbike", "enduro", "endur", "cross", "kros", "motocross", "motokros", "mx", "terren", "terrenor",
    "off road", "offroad", "jashtë rrugës", "mal", "male", "trail", "scrambler", "baltë", "pluhur",
  ],
  scooter: [
    "skuter", "skuterë", "skutera", "skuteri", "skuterat", "skuterin", "scooter", "scooters", "scoter", "skooter", "skutter",
    "vespa", "vespë", "maxi scooter", "maxiscooter", "maxi skuter", "qytet", "qytetit", "city", "urban",
  ],
  atv: [
    "atv", "atvs", "atv-ja", "quad", "quads", "kuad", "kuadër", "quadbike", "quad bike", "kuadricikël", "kuadricikel",
    "katër rrota", "kater rrota", "katërrrotësh", "4 rrota", "4rrota", "4x4", "four wheeler", "utility", "fermë", "ferme",
  ],

  /* ───── Licence ───── */
  "licence-am": ["am", "patenta am", "kategoria am", "pa patentë", "pa patente", "moped", "mopedë", "për 16 vjeç", "16 vjeç"],
  "licence-a1": ["a1", "patenta a1", "kategoria a1", "për 16 vjeç"],
  "licence-a2": ["a2", "patenta a2", "kategoria a2", "35kw", "35 kw"],
  "licence-a": ["patenta a", "kategoria a", "full licence", "big bike"],

  /* ───── Brands ───── */
  "brand-nas": ["nas", "nas moto", "nasmoto"],
  "brand-zontes": ["zontes", "zonte", "zontez", "zontess", "zonetes"],
  "brand-mrz": ["mrz", "m r z", "mr z"],
  "brand-dazzle": ["dazzle", "dazle", "dazel", "dazzel", "dasle", "dezzle"],
  "brand-qjmotor": ["qjmotor", "qj motor", "qj", "q j", "qjmoto", "qj moto", "qiangjiang", "kjmotor", "qjmotors"],

  /* ───── Accessory categories ───── */
  accessory: [
    "aksesor", "aksesorë", "aksesore", "aksesorët", "aksesori", "accessory", "accessories", "acc", "pajisje", "pajisjet",
    "gear", "equipment", "shtesa",
  ],
  helmet: [
    "kaskë", "kaska", "kaske", "kaskën", "kaskat", "kasket", "kasketa", "kasko", "helmet", "helmets", "helmeta", "helmete",
    "helm", "helmetë", "kacidhe", "kacidë", "kokë", "per koke", "shlem", "šlem", "casco",
  ],
  "helmet-full-face": ["full face", "fullface", "full-face", "integral", "integrale", "e mbyllur", "mbyllur", "racing helmet"],
  "helmet-modular": ["modulare", "modular", "flip", "flip up", "flipup", "hapet", "që hapet", "e hapshme", "modularja"],
  "helmet-open-face": ["open face", "openface", "open-face", "jet", "e hapur", "hapur", "3/4", "tre të katërtat", "demi jet"],
  apparel: [
    "veshje", "veshja", "veshjet", "rroba", "rrobe", "teshë", "tesha", "apparel", "clothing", "clothes", "wear", "mbrojtëse",
    "protektor", "protektorë", "protection", "armor", "armour",
  ],
  jacket: ["xhaketë", "xhaketa", "xhakete", "xhaketat", "jakne", "jakna", "jaknë", "jacket", "jackets", "jakete", "bluzë", "duks"],
  trousers: ["pantallona", "pantallonat", "pantallon", "pantolla", "pantollat", "pantalla", "pants", "trousers", "jeans", "xhinse"],
  gloves: [
    "dorëza", "doreza", "dorëzat", "dorezat", "doreze", "dorashka", "dorashkat", "rukavica", "rukavice", "gloves", "glove",
    "per duar", "duar", "dorë",
  ],
  boots: ["çizme", "cizme", "çizmet", "cizmet", "çizma", "chizme", "qizme", "boots", "boot", "këpucë", "kepuce", "shoes", "patika"],
  parts: [
    "pjesë", "pjese", "pjesët", "pjeset", "pjes", "pjesë rezervë", "rezervë", "rezerve", "parts", "spare", "spare parts",
    "bike parts", "delovi", "dele", "komponentë", "komponente", "servis",
  ],
  luggage: ["bagazh", "bagazhi", "luggage", "ngarkesë", "ngarkese", "transport", "mbajtëse", "valixhe"],
  "top-case": ["top case", "topcase", "kuti", "kutia", "kuti e pasme", "baule", "baulë", "bauli", "box", "case", "bisht"],
  bag: ["çantë", "çanta", "cante", "canta", "çantat", "torbë", "torba", "bag", "bags", "tank bag", "tankbag", "çantë tanku", "rukzak", "backpack"],
  cover: ["mbulesë", "mbulese", "mbulesa", "mbules", "cover", "covers", "çarçaf", "pëlhurë", "mbrojtje nga shiu", "shi", "rain cover", "pluhur"],

  /* ───── Materials / seasons ───── */
  leather: ["lëkurë", "lekure", "lëkure", "lekur", "leather", "koža", "koza"],
  textile: ["tekstil", "tekstili", "textile", "pëlhurë", "cordura", "kordura"],
  summer: ["verë", "vere", "vera", "veror", "verore", "summer", "e ftohtë", "ajrosje", "mesh", "nxehtë"],
  winter: ["dimër", "dimer", "dimri", "dimëror", "dimerore", "winter", "e ngrohtë", "ngrohte", "ftohtë", "termike", "thermal"],
  touring: ["touring", "turizëm", "turizem", "udhëtim", "udhetim", "travel", "adventure", "aventurë", "aventure", "rrugë e gjatë"],

  /* ───── Misc ───── */
  new: ["e re", "i ri", "të reja", "te reja", "të rejat", "te rejat", "të rinj", "risi", "new", "latest", "2025", "2026"],
};
