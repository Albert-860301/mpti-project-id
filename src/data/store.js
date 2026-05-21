/* ═══════════════════════════════════════════════════════════════
   MPTI Data Layer — store.js
   ═══════════════════════════════════════════════════════════════ */

// ─── DEFAULT QUESTIONS ──────────────────────────────────────────

export const DEFAULT_QUESTIONS = [
  { id:1, dim:"AP", th:"Apakah kamu tahu biaya paket HP-mu per bulan?", en:"Do you know your monthly mobile plan cost?",
    opts:[
      {th:"Tahu persis, termasuk pajak",en:"Exactly, including tax",s:"A"},
      {th:"Kira-kira, ratusan ribu",en:"Roughly, a few hundred thousand",s:"P"},
      {th:"Tahu semua, bahkan top-up data",en:"I track everything, even top-ups",s:"A"},
      {th:"Potong otomatis, tidak pernah cek",en:"Auto-deducted, never checked",s:"P"},
    ]},
  { id:2, dim:"AP", th:"Kapan terakhir kali kamu cek tagihan HP?", en:"When did you last check your phone bill?",
    opts:[
      {th:"Bulan ini sudah cek",en:"Checked this month",s:"A"},
      {th:"Mungkin tahun lalu?",en:"Maybe last year?",s:"P"},
      {th:"Punya aplikasi pencatat pengeluaran",en:"I have an expense tracking app",s:"A"},
      {th:"Tagihan apa? Gimana cara ceknya?",en:"What bill? How do I check?",s:"P"},
    ]},
  { id:3, dim:"AP", th:"Sekarang ada berapa aplikasi yang auto-debit kamu?", en:"How many apps are auto-charging you right now?",
    opts:[
      {th:"Tahu jumlah pasti dan harga tiap-tiap satu",en:"I know the exact count and price",s:"A"},
      {th:"Beberapa mungkin... tidak yakin",en:"A few maybe... not sure",s:"P"},
      {th:"Cek setiap awal bulan",en:"I check every month",s:"A"},
      {th:"Mungkin ada? Tidak tahu caranya",en:"Maybe? I don't know how to check",s:"P"},
    ]},
  { id:4, dim:"AP", th:"Dapat notifikasi 'kuota hampir habis', kamu ngapain?", en:"What do you do when you get a data alert?",
    opts:[
      {th:"Nggak mungkin, aku kelola dengan baik",en:"Never happens, I manage well",s:"A"},
      {th:"Lagi? Langsung beli paket tambahan",en:"Again? Just buy more data",s:"P"},
      {th:"Cek aplikasi mana yang boros data",en:"Check which app & restrict it",s:"A"},
      {th:"Abaikan, pencet sesuatu entah apa",en:"Ignored it, tapped something",s:"P"},
    ]},
  { id:5, dim:"AP", th:"Bisa sebutin total pengeluaran HP-mu per bulan?", en:"Can you tell me your total monthly phone spending?",
    opts:[
      {th:"Bisa, sekitar Rp___",en:"Yes, roughly Rp___",s:"A"},
      {th:"Cuma tahu biaya paket, sisanya nggak yakin",en:"Just the plan, rest unclear",s:"P"},
      {th:"Ada catatannya, bisa langsung cek",en:"I have records",s:"A"},
      {th:"Sama sekali tidak bisa",en:"Can't tell at all",s:"P"},
    ]},
  { id:6, dim:"HL", type:"open-amount",
    th:"Berapa biaya paket HP-mu per bulan?", en:"How much is your monthly mobile plan?",
    unit:"Rp", placeholder:"mis. 100.000", priceKey:"planCost", dimThresh:80000, maxVal:1500000, opts:[]},
  { id:7, dim:"HL", th:"Punya aplikasi berbayar atau langganan apa saja?", en:"Do you have paid apps or subscriptions?",
    opts:[
      {th:"3 atau lebih",en:"3+ subscriptions",s:"H"},
      {th:"1–2, dipakai rutin",en:"1–2, use regularly",s:"H"},
      {th:"Dulu punya, sudah dibatalkan semua",en:"Had some, cancelled all",s:"L"},
      {th:"Tidak pernah beli aplikasi berbayar",en:"Never bought paid apps",s:"L"},
    ]},
  { id:8, dim:"HL", th:"Akhir bulan kuota hampir habis, ngapain?", en:"End of month, data's not enough?",
    opts:[
      {th:"Beli paket terbesar, gak peduli",en:"Buy the biggest pack",s:"H"},
      {th:"Beli paket kecil buat bertahan",en:"Buy a small pack",s:"H"},
      {th:"Tahan, tunggu awal bulan, pakai WiFi",en:"Wait, use WiFi",s:"L"},
      {th:"Tidak pernah, paket cukup / pakai WiFi",en:"Never happens",s:"L"},
    ]},
  { id:9, dim:"HL", th:"Pernah top-up di game atau aplikasi?", en:"Spent money in games or apps?",
    opts:[
      {th:"Rutin, ratusan ribu per bulan",en:"Regularly",s:"H"},
      {th:"Sesekali, sedikit",en:"A little",s:"H"},
      {th:"Pernah sekali dua kali",en:"Once or twice",s:"L"},
      {th:"Tidak pernah, yang gratis cukup",en:"Never",s:"L"},
    ]},
  { id:10, dim:"HL", th:"Habis berapa buat beli casing/aksesori?", en:"Spend on cases/accessories?",
    opts:[
      {th:"Ratusan hingga jutaan, harus yang bagus",en:"Hundreds to millions",s:"H"},
      {th:"50–100 ribu, yang penting ada",en:"50–100k",s:"L"},
      {th:"Termurah di Shopee/Tokopedia",en:"Cheapest on Shopee",s:"L"},
      {th:"Tidak pakai casing",en:"No case",s:"L"},
    ]},
  { id:11, dim:"SK", th:"Sudah berapa lama pakai HP yang sekarang?", en:"How long using current phone?",
    opts:[
      {th:"Kurang dari 1 tahun",en:"Less than 1 year",s:"S",val:0.5},
      {th:"1–2 tahun",en:"1–2 years",s:"S",val:1.5},
      {th:"2–3 tahun",en:"2–3 years",s:"K",val:2.5},
      {th:"3 tahun lebih",en:"3+ years",s:"K",val:4},
    ]},
  { id:12, dim:"SK", th:"Lihat HP baru diluncurkan, gimana perasaanmu?", en:"How do you feel when a new phone launches?",
    opts:[
      {th:"Sudah cek harga dan tanggal pre-order",en:"Already checking price",s:"S"},
      {th:"Deg-degan, tapi lihat dulu",en:"Tempted",s:"S"},
      {th:"Biasa aja, HP aku masih oke",en:"Mine still works",s:"K"},
      {th:"Tidak peduli, tidak ada hubungannya",en:"Don't care",s:"K"},
    ]},
  { id:13, dim:"SK", th:"HP lamamu ke mana?", en:"Where's your old phone?",
    opts:[
      {th:"Sudah dijual / trade-in",en:"Sold or traded in",s:"S"},
      {th:"Diberikan ke keluarga / teman",en:"Gave away",s:"S"},
      {th:"Di dalam laci",en:"In a drawer",s:"K"},
      {th:"Masih pakai HP pertama",en:"Still using first phone",s:"K"},
    ]},
  { id:14, dim:"SK", th:"Layar retak — mau ngapain?", en:"Screen cracked — what now?",
    opts:[
      {th:"Saatnya ganti HP baru!",en:"Time for a new phone",s:"S"},
      {th:"Cek harga HP baru dulu...",en:"Check new phone prices",s:"S"},
      {th:"Bawa ke tukang servis",en:"Get it fixed",s:"K"},
      {th:"Tempel tempered glass, pakai terus",en:"Use it anyway",s:"K"},
    ]},
  { id:15, dim:"SK", type:"open-amount",
    th:"Berapa harga HP lamamu?", en:"How much did your previous phone cost?",
    unit:"Rp", placeholder:"mis. 3.000.000", priceKey:"phoneCost", dimThresh:3000000, maxVal:25000000, opts:[]},
  { id:16, dim:"MC", th:"Sekarang ada berapa foto di HP-mu?", en:"How many photos on your phone?",
    opts:[
      {th:"Kurang dari 1.000, rutin dihapus",en:"Under 1,000",s:"C"},
      {th:"1.000–5.000",en:"1,000–5,000",s:"M"},
      {th:"5.000–10.000",en:"5,000–10,000",s:"M"},
      {th:"10.000+, HP-mu kayak museum",en:"10,000+",s:"M"},
    ]},
  { id:17, dim:"MC", th:"Berapa aplikasi di HP-mu?", en:"How many apps?",
    opts:[
      {th:"Kurang dari 30, semuanya dipakai",en:"Under 30",s:"C"},
      {th:"Sekitar 50",en:"About 50",s:"M"},
      {th:"Tidak terhitung",en:"Countless",s:"M"},
      {th:"Halaman kedua tidak berani lihat",en:"Afraid to look",s:"M"},
    ]},
  { id:18, dim:"MC", th:"Berapa notifikasi yang belum dibaca?", en:"Unread notifications?",
    opts:[
      {th:"0 — titik merah bikin gelisah",en:"0",s:"C"},
      {th:"Hanya beberapa",en:"A few",s:"C"},
      {th:"Puluhan",en:"Dozens",s:"M"},
      {th:"999+, jangan bahas",en:"999+",s:"M"},
    ]},
  { id:19, dim:"MC", th:"Tampilan home screen-mu gimana?", en:"Home screen look?",
    opts:[
      {th:"Satu halaman, folder rapi",en:"One page",s:"C"},
      {th:"Dua halaman, cukup rapi",en:"Two pages",s:"C"},
      {th:"3 halaman lebih",en:"3+ pages",s:"M"},
      {th:"Wallpaper? Sudah tidak kelihatan",en:"Can't see wallpaper",s:"M"},
    ]},
  { id:20, dim:"MC", th:"Kapasitas penyimpanan-mu sekarang?", en:"Storage status?",
    opts:[
      {th:"🟢 Hijau — masih banyak",en:"Green",s:"C"},
      {th:"🟡 Kuning — masih oke",en:"Yellow",s:"C"},
      {th:"🟠 Oranye — sering tidak cukup",en:"Orange",s:"M"},
      {th:"🔴 Merah — HP minta tolong tiap hari",en:"Red",s:"M"},
    ]},
];

// ─── DEFAULT TYPES ──────────────────────────────────────────────

export const DEFAULT_TYPES = {
  SUCKER:     { name:"SUCKER",      e:"💸", th:"Korban",            en:"The Mark",        min:150000, max:400000,  equivTh:"HP Redmi baru 1 unit",          tagTh:"Kamu tidak pakai HP, kamu diperas",               color:"#FF4444", img:"SUCKER.png" },
  ADDICT:     { name:"ADDICT",      e:"🔥", th:"Kecanduan",         en:"The Addict",      min:200000, max:600000,  equivTh:"Tiket pesawat PP 6 kali",        tagTh:"Kamu scrolling bukan layar, tapi saldo",           color:"#FF6B00", img:"ADDICT.png" },
  FLEXER:     { name:"FLEXER",      e:"💅", th:"Pamer",             en:"The Flexer",      min:250000, max:750000,  equivTh:"iPad baru 1 unit",               tagTh:"Kamu beli HP bukan buat dipakai, tapi buat dilihat", color:"#E91E63", img:"FLEXER.png" },
  SWITCHER:   { name:"SWITCHER",    e:"🔄", th:"Pindah-pindah",     en:"The Switcher",    min:200000, max:500000,  equivTh:"Beli HP satu keluarga",          tagTh:"Kamu ganti bukan HP-nya, tapi penyesalannya",      color:"#9C27B0", img:"SWITCHER.png" },
  HOARDER:    { name:"HOARDER",     e:"🗑",  th:"Penumpuk",          en:"Digital Hoarder", min:75000,  max:200000,  equivTh:"Sate 360 tusuk",                 tagTh:"HP lambat bukan karena tua, tapi karena kamu nggak mau hapus", color:"#795548", img:"HOARDER.png" },
  TRYHARD:    { name:"TRY HARD",    e:"🤡", th:"Sok Hemat",         en:"The Try Hard",    min:100000, max:250000,  equivTh:"Member gym 3 tahun",             tagTh:"Kamu berusaha keras, tapi tidak ada yang benar-benar hemat", color:"#FF9800", img:"TRYHARD.png" },
  SUBSCRIBER: { name:"SUBSCRIBER",  e:"📦", th:"Pelanggan",         en:"Sub Victim",      min:100000, max:300000,  equivTh:"Starbucks 24 cup",               tagTh:"Kamu bayar sewa aplikasi yang tidak pernah dipakai", color:"#2196F3", img:"SUBSCRIBER.png" },
  DATABURNER: { name:"DATA BURNER", e:"📡", th:"Boros Data",        en:"Data Burner",     min:150000, max:350000,  equivTh:"Kontrakan dibagi 4 bulan",       tagTh:"Kamu scrolling bukan video, tapi kuota",           color:"#00BCD4", img:"DATABURNER.png" },
  BABY:       { name:"BABY",        e:"👶", th:"Si Polos",          en:"The Baby",        min:150000, max:400000,  equivTh:"Boba 120 cup",                   tagTh:"Kamu bayar mahal bukan karena mau, tapi karena tidak tahu", color:"#4CAF50", img:"BABY.png" },
  LOST:       { name:"LOST",        e:"🤯", th:"Tersesat",          en:"The Lost",        min:125000, max:300000,  equivTh:"Naik MRT 600 kali",              tagTh:"Kamu tidak tahu bayar apa, tidak tahu bayar di mana", color:"#607D8B", img:"LOST.png" },
  CHEAPO:     { name:"CHEAPO",      e:"🪙", th:"Hemat Ekstrem",     en:"The Cheapo",      min:25000,  max:100000,  equivTh:"Casing HP 1 buah",               tagTh:"Kamu hemat uang, tapi buang waktu",                color:"#8BC34A", img:"CHEAPO.png" },
  ADDONKING:  { name:"ADD-ON KING", e:"👑", th:"Raja Paket",        en:"Add-On King",     min:150000, max:450000,  equivTh:"Liburan Bali 1 trip",            tagTh:"Kamu beli paket di atas paket",                    color:"#FFC107", img:"ADDONKING.png" },
  CHAOS:      { name:"CHAOS",       e:"🌀", th:"Kacau Balau",       en:"Pure Chaos",      min:150000, max:400000,  equivTh:"Kopi 200 gelas",                 tagTh:"HP seperti hidup, susah dikontrol",                color:"#673AB7", img:"CHAOS.png" },
  GHOSTUSER:  { name:"GHOST USER",  e:"👻", th:"Pengguna Hantu",    en:"Ghost User",      min:75000,  max:250000,  equivTh:"Nike 2 pasang",                  tagTh:"Kamu bahkan tidak sadar kamu pakai HP",            color:"#94A3B8", img:"GHOSTUSER.png" },
  OVERKILL:   { name:"OVERKILL",    e:"💣", th:"Berlebihan",        en:"Overkill",        min:200000, max:500000,  equivTh:"12 bulan Netflix+Spotify",       tagTh:"Kamu pakai flagship cuma buat scroll TikTok",      color:"#F44336", img:"OVERKILL.png" },
  BROKELOOP:  { name:"BROKE LOOP",  e:"🔁", th:"Lingkaran Setan",   en:"Broke Loop",      min:150000, max:450000,  equivTh:"HP murah 3 unit",                tagTh:"Kamu hemat terus tapi pengeluaran makin besar",    color:"#FF5722", img:"BROKELOOP.png" },
};

// ─── DEFAULT COMBO MAP (all 16 possible 4-dim combos) ───────────

export const DEFAULT_COMBO_MAP = {
  // Aware + High spend
  AHSM:"ADDICT",    AHSC:"FLEXER",      AHKM:"SUCKER",    AHKC:"SUBSCRIBER",
  // Aware + Low spend
  ALSM:"BROKELOOP", ALSC:"TRYHARD",     ALKM:"HOARDER",   ALKC:"TRYHARD",
  // Passive + High spend
  PHSM:"CHAOS",     PHSC:"SWITCHER",    PHKM:"SUCKER",    PHKC:"SUBSCRIBER",
  // Passive + Low spend
  PLSM:"BROKELOOP", PLSC:"CHEAPO",      PLKM:"HOARDER",   PLKC:"CHEAPO",
  // Note: PLSC changed from SWITCHER → CHEAPO (passive low-spend cleaner ≠ switcher)
  // Rare types via disambiguation: OVERKILL, BABY, LOST, GHOSTUSER, DATABURNER, ADDONKING
};

// ─── DEFAULT RECOVERY CARDS ─────────────────────────────────────

export const DEFAULT_RECOVERY_CARDS = [
  { no:"01", icon:"📦", title:"BIG GAMES.\nZERO STORAGE.", bodyTh:"Jalankan semua di cloud, tidak perlu download", saveRatio:0.35, tags:["No storage","Less data"] },
  { no:"02", icon:"🌙", title:"SLEEP.\nIT KEEPS RUNNING.", bodyTh:"Roblox jalan 24 jam, baterai aman, tidak panas", saveRatio:0.30, tags:["24/7","No battery"] },
  { no:"03", icon:"💬", title:"YOU CHAT.\nIT WORKS SILENTLY.", bodyTh:"Misi jalan di cloud, HP masih bisa dipakai WA", saveRatio:0.20, tags:["Silent","Multitask"] },
  { no:"04", icon:"⚡", title:"TAP.\nPLAY INSTANTLY.", bodyTh:"Coba game baru langsung 1 detik, tidak buang waktu", saveRatio:0.15, tags:["1 sec","No install"] },
];

// ─── DEFAULT COVER CONTENT ──────────────────────────────────────

export const DEFAULT_COVER_CONTENT = {
  badge: "MONEY LEAK TEST",
  titleLine1: "WHERE IS YOUR",
  titleLine2: "MONEY GOING?",
  descLine1: "Berapa banyak uang yang kamu buang tanpa sadar?",
  descLine2: "20 pertanyaan · 16 tipe kepribadian · 3 menit",
  feat1: "4 dimensi analisis perilaku pengeluaran",
  feat2: "Hitung jumlah uang yang benar-benar terbuang",
  feat3: "Rencana pemulihan keuangan khusus untukmu",
  ctaBtn: "Mulai tes sekarang! 🚀",
  footer: "🔒 Aman · Gratis · Tanpa daftar",
};

// ─── DEFAULT SCORING CONFIG ─────────────────────────────────────
// Controls all pricing/scoring logic.
// Formula: waste = planCost + subEstimate + dataOverage + depreciation - baseline
//          depreciation = phoneCost / (phoneYears * 12)

export const DEFAULT_SCORING = {
  // Dimension thresholds: score >= thresh → first letter of pair
  threshAP: 3,  // A if scores.A >= 3, else P
  threshHL: 3,  // H if scores.H >= 3, else L
  threshSK: 3,  // S if scores.S >= 3, else K
  threshMC: 3,  // M if scores.M >= 3, else C

  // Default costs when quiz answers don't provide a value
  defaultPlanCost: 100000,
  defaultPhoneCost: 3000000,
  defaultPhoneYears: 2.5,

  // Monthly subscription estimate (by H/L result)
  subHigh: 80000,
  subLow: 20000,

  // Data overage estimate (by Q8 answer)
  dataHigh: 50000,
  dataLow: 15000,

  // Baseline deduction (H spenders have higher baseline)
  baselineL: 35000,
  baselineH: 70000,

  // Round final result to nearest N rupiah
  roundTo: 1000,

  // Disambiguation rule thresholds (override base combo map for specific combos)
  disambig: {
    // AHKM: H score ≥ thresh → ADDONKING (limited); else q8=H → DATABURNER (limited); else SUCKER
    // H score checked FIRST so ADDONKING isn't blocked by the more-common q8=H path
    AHKM_addOnThresh: 4,
    // PHKM same logic: passive high-keeper-messy gets a second path to ADDONKING/DATABURNER
    PHKM_addOnThresh: 4,
    AHSC_priceThresh: 8000000, // AHSC: phoneCost > X → OVERKILL (else FLEXER)
    PHKC_pThresh: 4,         // PHKC: P score >= X → BABY (else SUBSCRIBER)
    PLKM_pThresh: 4,         // PLKM: P score >= X → LOST
    PLKM_mThresh: 4,         // PLKM: M score >= X → GHOSTUSER (else HOARDER)
    ALKC_lThresh: 4,         // ALKC: L score >= X → CHEAPO (else TRYHARD)
  },
};

// ─── DEFAULT GENERAL SETTINGS ───────────────────────────────────

export const DEFAULT_SETTINGS = {
  adminPass: "mpti2024",
  redfingerUrl: "https://www.cloudemulator.net/app/sign-in?channelCode=web",
  socialProofFallback: 52431,
  siteName: "MPTI",
  localeBadge: "ID 🇮🇩",
  fakeCountMin: 10000,
  fakeCountMax: 15000,
  fakeCountThreshold: 13324,
  // Cloudinary image hosting (required for image uploads on Vercel)
  cloudinaryCloudName: "dglzki3sy",
  cloudinaryUploadPreset: "mpti_upload",
  lineOaUrl: "",
  showLoginSheet: true,
  // Share image overlay bar
  overlayEnabled: true,
  overlayQrUrl: "",
  overlayText: "Scan test MPTI kamu",
  overlayText2: "Temukan kepribadian keuanganmu →",
  overlayBarColor: "#1B2FA0",
  // JSONBin — cloud config sync (set via admin panel for Indonesia deployment)
  jsonbinId: "",
  jsonbinKey: "",
};

// ─── DEFAULT EQUIV REFERENCES ───────────────────────────────────

export const DEFAULT_EQUIV_REFS = [
  { label: "Netflix/bulan",    price: 186000 },
  { label: "Spotify/bulan",    price: 69000  },
  { label: "Telkomsel/bulan",  price: 150000 },
  { label: "Tiket bioskop",    price: 50000  },
  { label: "Boba",             price: 35000  },
  { label: "iPhone 16",        price: 17000000 },
];

// Pick the reference item whose ratio gives the most readable comparison
export function calcEquivLabel(monthlyWaste, refs) {
  if (!refs || refs.length === 0) return "";
  const scored = refs.map(ref => {
    const ratio = monthlyWaste / ref.price;
    const inRange = ratio >= 1 && ratio <= 36;
    const dist = Math.abs(Math.log2(Math.max(ratio, 0.01)) - Math.log2(6));
    return { ref, ratio, score: inRange ? dist : dist + 100 };
  });
  scored.sort((a, b) => a.score - b.score);
  const { ref, ratio } = scored[0];
  if (ratio >= 12) return `${(ratio / 12).toFixed(1)} tahun ${ref.label}`;
  if (ratio >= 1)  return `${Math.round(ratio)} bulan ${ref.label}`;
  return `${Math.round(ratio * 30)} hari ${ref.label}`;
}

// ─── DEFAULT UI STRINGS ─────────────────────────────────────────

export const DEFAULT_STRINGS = {
  // Calc screen loading messages (shown in sequence)
  calcMsg1: "🔍 Menganalisis jawaban...",
  calcMsg2: "📊 Memproses 4 dimensi...",
  calcMsg3: "🧮 Menghitung uang yang terbuang...",
  calcMsg4: "💸 Hasilnya mengejutkan...",

  // Result screen
  shareBtn: "📤 Bagikan hasil via WhatsApp",
  shareBtnNoLine: "💾 Simpan hasil",
  shareSaveBtn: "💾 Simpan gambar",
  shareCopyBtn: "📋 Salin gambar",
  shareLongPress: "Tekan lama → Simpan ke galeri",
  shareLongPressNoLine: "Tekan lama untuk simpan ke galeri",
  planCtaBtn: "🎯 Lihat rencana ambil uang kembali ↓",
  resultLabel: "MPTI RESULT",
  wasteLabel: "Kamu telah membuang uang tanpa sadar",
  perMonth: "/bulan",
  perYear: "/tahun",

  // Plan screen
  recoveryTitle: "RECOVERY PLAN",
  recoverySubtitle: "Ambil kembali",
  recoverySuffix: "uangmu!",
  recoveryHint: "Geser kiri-kanan untuk lihat cara hemat",
  planCardBtn: "Coba gratis 7 hari",
  planFooter: "Daftar gratis · Tanpa kartu kredit · Bisa dibatalkan kapan saja",

  // Login sheet
  loginTitle: "Simpan hasil MPTI",
  loginSubtitle: "Daftar gratis dan lihat berapa hemat kamu dalam 7 hari",
  loginLineBtn: "LINE Daftar dengan LINE",
  loginEmailBtn: "atau gunakan email",
  loginPrivacy1: "Tidak posting",
  loginPrivacy2: "Tidak baca pesan",
  loginPrivacy3: "Hanya simpan hasil",

  // Result screen extras
  restartBtn: "Ulangi tes",

  // Success modal
  successTitle: "Berhasil!",
  successSubtitle: "Coba Cloud Phone gratis 7 hari, siap digunakan",
  successCta: "Pergi ke Cloud Phone",
};

// ─── LOCAL STORAGE HELPERS ──────────────────────────────────────

const KEYS = {
  stats:          "mpti-stats",
  questions:      "mpti-questions",
  types:          "mpti-types",
  recovery:       "mpti-recovery",
  users:          "mpti-users",
  images:         "mpti-images",
  imagesRaw:      "mpti-images-raw",   // original (pre-overlay) URLs for re-baking
  questionImages: "mpti-question-images",
  coverImage:     "mpti-cover-image",
  coverContent:   "mpti-cover-content",
  scoring:        "mpti-scoring",
  comboMap:       "mpti-combo-map",
  settings:       "mpti-settings",
  strings:        "mpti-strings",
  equivRefs:      "mpti-equiv-refs",
  cardImages:     "mpti-card-images",
};

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function writeJSON(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); return true; } catch { return false; }
}

// Stats
export function getStats() { return readJSON(KEYS.stats, { total:0, shares:0, types:{} }); }
export function saveStats(data) { writeJSON(KEYS.stats, data); }

// Questions
export function getQuestions() { return readJSON(KEYS.questions, null) || DEFAULT_QUESTIONS; }
export function saveQuestions(qs) { writeJSON(KEYS.questions, qs); }
export function resetQuestions() { localStorage.removeItem(KEYS.questions); }

// Types
export function getTypes() { return readJSON(KEYS.types, null) || DEFAULT_TYPES; }
export function saveTypes(ts) { writeJSON(KEYS.types, ts); }
export function resetTypes() { localStorage.removeItem(KEYS.types); }

// Recovery cards
export function getRecoveryCards() { return readJSON(KEYS.recovery, null) || DEFAULT_RECOVERY_CARDS; }
export function saveRecoveryCards(cards) { writeJSON(KEYS.recovery, cards); }

// Scoring config
export function getScoring() {
  const stored = readJSON(KEYS.scoring, null);
  if (!stored) return DEFAULT_SCORING;
  // Deep merge disambig so partial overrides still work
  return { ...DEFAULT_SCORING, ...stored, disambig: { ...DEFAULT_SCORING.disambig, ...(stored.disambig || {}) } };
}
export function saveScoring(sc) { writeJSON(KEYS.scoring, sc); }
export function resetScoring() { localStorage.removeItem(KEYS.scoring); }

// Combo map
export function getComboMap() { return readJSON(KEYS.comboMap, null) || DEFAULT_COMBO_MAP; }
export function saveComboMap(map) { writeJSON(KEYS.comboMap, map); }
export function resetComboMap() { localStorage.removeItem(KEYS.comboMap); }

// General settings
export function getSettings() {
  const stored = readJSON(KEYS.settings, null);
  return stored ? { ...DEFAULT_SETTINGS, ...stored } : DEFAULT_SETTINGS;
}
export function saveSettings(s) { writeJSON(KEYS.settings, s); }
export function resetSettings() { localStorage.removeItem(KEYS.settings); }

// UI strings
export function getStrings() {
  const stored = readJSON(KEYS.strings, null);
  return stored ? { ...DEFAULT_STRINGS, ...stored } : DEFAULT_STRINGS;
}
export function saveStrings(s) { writeJSON(KEYS.strings, s); }
export function resetStrings() { localStorage.removeItem(KEYS.strings); }

// Equiv references
export function getEquivRefs() { return readJSON(KEYS.equivRefs, null) || DEFAULT_EQUIV_REFS; }
export function saveEquivRefs(refs) { writeJSON(KEYS.equivRefs, refs); }

// Card images (keyed by card.no e.g. "01")
export function getCardImages() { return readJSON(KEYS.cardImages, {}); }
export function saveCardImage(no, url) {
  const imgs = getCardImages();
  imgs[no] = url;
  return writeJSON(KEYS.cardImages, imgs);
}
export function removeCardImage(no) {
  const imgs = getCardImages();
  delete imgs[no];
  writeJSON(KEYS.cardImages, imgs);
}

// User results
export function getUsers() { return readJSON(KEYS.users, []); }
export function addUser(data) {
  const users = getUsers();
  users.unshift({ ...data, timestamp: new Date().toISOString(), id: Date.now() });
  if (users.length > 5000) users.length = 5000;
  writeJSON(KEYS.users, users);
}
export function clearUsers() { writeJSON(KEYS.users, []); }

// Overlay logo image (stored under key "__overlay_logo__")
export function getOverlayLogo() { return readJSON(KEYS.images, {}).__overlay_logo__ || ""; }
export function saveOverlayLogo(dataUrl) {
  const imgs = readJSON(KEYS.images, {});
  imgs.__overlay_logo__ = dataUrl;
  return writeJSON(KEYS.images, imgs);
}
export function removeOverlayLogo() {
  const imgs = readJSON(KEYS.images, {});
  delete imgs.__overlay_logo__;
  writeJSON(KEYS.images, imgs);
}

// Type poster images
export function getImages() { return readJSON(KEYS.images, {}); }
export function saveImage(typeKey, dataUrl) {
  const imgs = getImages();
  imgs[typeKey] = dataUrl;
  return writeJSON(KEYS.images, imgs);
}
export function removeImage(typeKey) {
  const imgs = getImages();
  delete imgs[typeKey];
  writeJSON(KEYS.images, imgs);
}

// Raw (pre-overlay) type image URLs — admin only, used for re-baking
export function getImagesRaw() { return readJSON(KEYS.imagesRaw, {}); }
export function saveImageRaw(typeKey, url) {
  const imgs = getImagesRaw();
  imgs[typeKey] = url;
  return writeJSON(KEYS.imagesRaw, imgs);
}

// Question images
export function getQuestionImages() { return readJSON(KEYS.questionImages, {}); }
export function saveQuestionImage(qid, dataUrl) {
  const imgs = getQuestionImages();
  imgs[String(qid)] = dataUrl;
  return writeJSON(KEYS.questionImages, imgs);
}
export function removeQuestionImage(qid) {
  const imgs = getQuestionImages();
  delete imgs[String(qid)];
  writeJSON(KEYS.questionImages, imgs);
}

// Cover image
export function getCoverImage() {
  try { return localStorage.getItem(KEYS.coverImage) || null; } catch { return null; }
}
export function saveCoverImage(dataUrl) {
  try { localStorage.setItem(KEYS.coverImage, dataUrl); return true; } catch { return false; }
}
export function removeCoverImage() { localStorage.removeItem(KEYS.coverImage); }

// Cover text content
export function getCoverContent() { return readJSON(KEYS.coverContent, null) || DEFAULT_COVER_CONTENT; }
export function saveCoverContent(data) { writeJSON(KEYS.coverContent, data); }
export function resetCoverContent() { localStorage.removeItem(KEYS.coverContent); }

// ─── SCORING ENGINE ─────────────────────────────────────────────
// Formula: waste = planCost + subEstimate + dataOverage + depreciation - baseline
// depreciation = phoneCost / (phoneYears × 12)

export function calculateResult(answers, questions = null, types = null) {
  const qs = questions || getQuestions();
  const ts = types || getTypes();
  const sc = getScoring();
  const comboMap = getComboMap();

  const scores = { A:0, P:0, H:0, L:0, S:0, K:0, M:0, C:0 };
  let planCost = sc.defaultPlanCost;
  let phoneCost = sc.defaultPhoneCost;
  let phoneYears = sc.defaultPhoneYears;
  let q8Answer = "";

  answers.forEach(({ qid, optIndex, openValue }) => {
    const q = qs.find(x => x.id === qid);
    if (!q) return;

    if (q.type === "open-amount") {
      // Open-amount question: use the entered value directly for pricing (capped at maxVal)
      // Absolute failsafe caps prevent astronomical values even if q.maxVal is missing (e.g. old localStorage data)
      const HARD_CAPS = { planCost: 9999, phoneCost: 99999, phoneYears: 20 };
      const raw = typeof openValue === "number" && openValue > 0 ? openValue : 0;
      const cap = q.maxVal || HARD_CAPS[q.priceKey] || 999999;
      const val = raw > cap ? cap : raw;
      const [highLetter, lowLetter] = q.dim.split("");
      const letter = val >= (q.dimThresh || 0) ? highLetter : lowLetter;
      scores[letter] = (scores[letter] || 0) + 1;
      if (q.priceKey === "planCost"   && val > 0) planCost   = val;
      if (q.priceKey === "phoneCost"  && val > 0) phoneCost  = val;
      if (q.priceKey === "phoneYears" && val > 0) phoneYears = val;
    } else {
      // Choice question: use the selected option
      const opt = q.opts?.[optIndex];
      if (!opt) return;
      scores[opt.s] = (scores[opt.s] || 0) + 1;
      if (q.id === 6  && opt.val) planCost   = opt.val;
      if (q.id === 15 && opt.val) phoneCost  = opt.val;
      if (q.id === 11 && opt.val) phoneYears = opt.val;
      if (q.id === 8) q8Answer = opt.s;
    }
  });

  const combo = [
    scores.A >= sc.threshAP ? "A" : "P",
    scores.H >= sc.threshHL ? "H" : "L",
    scores.S >= sc.threshSK ? "S" : "K",
    scores.M >= sc.threshMC ? "M" : "C",
  ].join("");

  let typeKey = comboMap[combo] || "SUCKER";

  // Disambiguation — configurable thresholds override base combo map
  const d = sc.disambig;
  // ADDONKING (limited): H score checked FIRST so high-scorers aren't blocked by q8 path
  if (combo === "AHKM") typeKey = scores.H >= d.AHKM_addOnThresh ? "ADDONKING" : q8Answer === "H" ? "DATABURNER" : "SUCKER";
  // PHKM: passive high-spender keeper messy → same rare ladder as AHKM
  if (combo === "PHKM") typeKey = scores.H >= d.PHKM_addOnThresh ? "ADDONKING" : q8Answer === "H" ? "DATABURNER" : "SUCKER";
  if (combo === "AHSC") typeKey = phoneCost > d.AHSC_priceThresh ? "OVERKILL" : "FLEXER";
  if (combo === "PHKC") typeKey = scores.P >= d.PHKC_pThresh ? "BABY" : "SUBSCRIBER";
  if (combo === "PLKM") typeKey = scores.P >= d.PLKM_pThresh ? "LOST" : scores.M >= d.PLKM_mThresh ? "GHOSTUSER" : "HOARDER";
  if (combo === "ALKC") typeKey = scores.L >= d.ALKC_lThresh ? "CHEAPO" : "TRYHARD";

  const personality = ts[typeKey] || ts.SUCKER;
  const subEstimate  = scores.H >= sc.threshHL ? sc.subHigh  : sc.subLow;
  const dataOverage  = q8Answer === "H"         ? sc.dataHigh : sc.dataLow;
  const depreciation = phoneYears > 0 ? Math.round(phoneCost / (phoneYears * 12)) : 0;
  const baseline     = scores.L >= sc.threshHL  ? sc.baselineL : sc.baselineH;
  const raw = planCost + subEstimate + dataOverage + depreciation - baseline;
  const monthlyWaste = Math.max(0, Math.round(raw / sc.roundTo) * sc.roundTo);

  return { typeKey, personality, monthlyWaste, combo, scores };
}

// Record a completed test
export function recordTest(result) {
  const stats = getStats();
  stats.total = (stats.total || 0) + 1;
  stats.types = stats.types || {};
  stats.types[result.typeKey] = (stats.types[result.typeKey] || 0) + 1;
  saveStats(stats);
  addUser({ typeKey: result.typeKey, monthlyWaste: result.monthlyWaste, combo: result.combo });
  return stats;
}

// Record a share
export function recordShare() {
  const stats = getStats();
  stats.shares = (stats.shares || 0) + 1;
  saveStats(stats);
}

// ─── SERVER SYNC (text config only — images already in public/) ──
function collectTextData() {
  // Strip base64 overlay logo from images object before syncing
  // (it can be several hundred KB and would bloat the JSONBin payload)
  const rawImgs = readJSON(KEYS.images, null);
  let imagesForSync = null;
  if (rawImgs) {
    imagesForSync = { ...rawImgs };
    delete imagesForSync.__overlay_logo__;
  }

  return {
    coverContent:  readJSON(KEYS.coverContent,  null),
    coverImage:    (() => { try { return localStorage.getItem(KEYS.coverImage) || null; } catch { return null; } })(),
    strings:       readJSON(KEYS.strings,       null),
    settings:      readJSON(KEYS.settings,      null),
    questions:     readJSON(KEYS.questions,     null),
    types:         readJSON(KEYS.types,         null),
    recovery:      readJSON(KEYS.recovery,      null),
    scoring:       readJSON(KEYS.scoring,       null),
    comboMap:      readJSON(KEYS.comboMap,      null),
    equivRefs:     readJSON(KEYS.equivRefs,     null),
    // image URL paths (Cloudinary short strings — no base64)
    images:        imagesForSync,
    imagesRaw:     readJSON(KEYS.imagesRaw,     null),  // original pre-overlay URLs
    questionImages:readJSON(KEYS.questionImages,null),
    cardImages:    readJSON(KEYS.cardImages,    null),
  };
}

function applyServerData(d) {
  if (d.coverContent)   writeJSON(KEYS.coverContent,   d.coverContent);
  if (d.coverImage != null) {
    try { localStorage.setItem(KEYS.coverImage, d.coverImage); } catch { /* ignore */ }
  }
  if (d.strings)        writeJSON(KEYS.strings,        d.strings);
  if (d.settings)       writeJSON(KEYS.settings,       d.settings);
  if (d.questions)      writeJSON(KEYS.questions,      d.questions);
  if (d.types)          writeJSON(KEYS.types,          d.types);
  if (d.recovery)       writeJSON(KEYS.recovery,       d.recovery);
  if (d.scoring)        writeJSON(KEYS.scoring,        d.scoring);
  if (d.comboMap)       writeJSON(KEYS.comboMap,       d.comboMap);
  if (d.equivRefs)      writeJSON(KEYS.equivRefs,      d.equivRefs);
  if (d.images)         writeJSON(KEYS.images,         d.images);
  if (d.imagesRaw)      writeJSON(KEYS.imagesRaw,      d.imagesRaw);
  if (d.questionImages) writeJSON(KEYS.questionImages, d.questionImages);
  if (d.cardImages)     writeJSON(KEYS.cardImages,     d.cardImages);
}

export async function syncToServer() {
  const { jsonbinId, jsonbinKey } = getSettings();
  const data = collectTextData();

  // ── JSONBin (production) ──────────────────────────────────────
  if (jsonbinId && jsonbinKey) {
    try {
      // SAFEGUARD: fetch existing server data first and merge —
      // never overwrite non-empty server fields with empty local fields
      // (prevents incognito/cleared localStorage from wiping server data)
      try {
        const existing = await fetch(`https://api.jsonbin.io/v3/b/${jsonbinId}/latest`, {
          headers: { "X-Master-Key": jsonbinKey },
        });
        if (existing.ok) {
          const ej = await existing.json();
          const server = ej.record ?? ej;
          // For each key: if local value is null/empty but server has data, keep server's
          for (const key of Object.keys(server)) {
            const local  = data[key];
            const remote = server[key];
            const localEmpty  = local == null || (typeof local === "object" && Object.keys(local).length === 0);
            const remoteHasData = remote != null && !(typeof remote === "object" && Object.keys(remote).length === 0);
            if (localEmpty && remoteHasData) {
              console.log(`[MPTI] syncToServer: keeping server value for "${key}" (local is empty)`);
              data[key] = remote;
            }
          }
        }
      } catch (_) { /* merge failed, proceed with local data */ }

      const res = await fetch(`https://api.jsonbin.io/v3/b/${jsonbinId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Master-Key": jsonbinKey },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        console.log("[MPTI] syncToServer → JSONBin OK");
        return true;
      }
      const errBody = await res.text().catch(() => "");
      console.error("[MPTI] syncToServer → JSONBin FAILED:", res.status, errBody);
      return false;
    } catch (err) {
      console.error("[MPTI] syncToServer → Network error:", err);
      return false;
    }
  }

  // ── Local Vite dev server (development) ───────────────────────
  try {
    const res = await fetch("/api/save-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (_) { return false; }
}

export async function loadFromServer() {
  // Always read credentials from DEFAULT_SETTINGS as the authoritative source —
  // don't rely on potentially stale localStorage overrides
  const jsonbinId  = DEFAULT_SETTINGS.jsonbinId;
  const jsonbinKey = DEFAULT_SETTINGS.jsonbinKey;

  console.log("[MPTI] loadFromServer: binId =", jsonbinId ? jsonbinId.slice(0, 8) + "…" : "(empty)");

  // ── JSONBin (production) ──────────────────────────────────────
  if (jsonbinId && jsonbinKey) {
    try {
      const res = await fetch(`https://api.jsonbin.io/v3/b/${jsonbinId}/latest`, {
        headers: { "X-Master-Key": jsonbinKey },
      });
      console.log("[MPTI] JSONBin response:", res.status);
      if (res.ok) {
        const json = await res.json();
        const record = json.record ?? json;
        console.log("[MPTI] Loaded from JSONBin, keys:", Object.keys(record).join(", "));
        applyServerData(record);
        return true;
      }
      console.warn("[MPTI] JSONBin returned", res.status);
    } catch (err) {
      console.warn("[MPTI] JSONBin fetch failed:", err.message || err);
    }
  }

  // ── Static store.json fallback ────────────────────────────────
  try {
    const res = await fetch(`/data/store.json?t=${Date.now()}`);
    if (!res.ok) { console.warn("[MPTI] store.json fallback:", res.status); return false; }
    applyServerData(await res.json());
    console.log("[MPTI] Loaded from store.json fallback");
    return true;
  } catch (_) { return false; }
}

// Export all data as JSON
export function exportAllData() {
  return {
    stats: getStats(),
    users: getUsers(),
    questions: getQuestions(),
    types: getTypes(),
    recoveryCards: getRecoveryCards(),
    scoring: getScoring(),
    comboMap: getComboMap(),
    settings: { ...getSettings(), adminPass: "***" }, // mask password
    strings: getStrings(),
    exportedAt: new Date().toISOString(),
  };
}
