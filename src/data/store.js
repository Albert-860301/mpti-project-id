/* ═══════════════════════════════════════════════════════════════
   MPTI Data Layer — store.js
   ═══════════════════════════════════════════════════════════════ */

// ─── DEFAULT QUESTIONS ──────────────────────────────────────────

export const DEFAULT_QUESTIONS = [
  { id:1, dim:"AP", th:"คุณรู้ไหมว่าแพ็กมือถือเดือนละเท่าไหร่?", en:"Do you know your monthly mobile plan cost?",
    opts:[
      {th:"รู้แม่นเลย รวมภาษีด้วย",en:"Exactly, including tax",s:"A"},
      {th:"รู้คร่าวๆ หลายร้อยมั้ง",en:"Roughly, a few hundred baht",s:"P"},
      {th:"รู้หมด แม้แต่เติมเน็ตจ่ายเท่าไหร่",en:"I track everything, even top-ups",s:"A"},
      {th:"หักอัตโนมัติ ไม่เคยสนใจ",en:"Auto-deducted, never checked",s:"P"},
    ]},
  { id:2, dim:"AP", th:"ครั้งสุดท้ายที่เช็คบิลมือถือคือเมื่อไหร่?", en:"When did you last check your phone bill?",
    opts:[
      {th:"เดือนนี้เช็คแล้ว",en:"Checked this month",s:"A"},
      {th:"น่าจะปีที่แล้ว?",en:"Maybe last year?",s:"P"},
      {th:"มีแอปบันทึกค่าใช้จ่ายโดยเฉพาะ",en:"I have an expense tracking app",s:"A"},
      {th:"บิลอะไร? เช็คยังไง?",en:"What bill? How do I check?",s:"P"},
    ]},
  { id:3, dim:"AP", th:"ตอนนี้มีกี่แอปที่ตัดเงินอัตโนมัติอยู่?", en:"How many apps are auto-charging you right now?",
    opts:[
      {th:"รู้จำนวนแน่นอน รู้ราคาทุกตัว",en:"I know the exact count and price",s:"A"},
      {th:"มีหลายตัวมั้ง... ไม่แน่ใจ",en:"A few maybe... not sure",s:"P"},
      {th:"เช็คทุกต้นเดือน",en:"I check every month",s:"A"},
      {th:"อาจจะมี? ไม่รู้วิธีเช็ค",en:"Maybe? I don't know how to check",s:"P"},
    ]},
  { id:4, dim:"AP", th:"ได้แจ้งเตือน 'เน็ตใกล้หมด' ทำยังไง?", en:"What do you do when you get a data alert?",
    opts:[
      {th:"ไม่มีทาง คุมได้ดี",en:"Never happens, I manage well",s:"A"},
      {th:"เออ มาอีกแล้ว ซื้อเน็ตเพิ่มเลย",en:"Again? Just buy more data",s:"P"},
      {th:"เช็คว่าแอปไหนกินเน็ต",en:"Check which app & restrict it",s:"A"},
      {th:"ไม่สนใจ กดอะไรไปก็ไม่รู้",en:"Ignored it, tapped something",s:"P"},
    ]},
  { id:5, dim:"AP", th:"บอกได้ไหมว่าเดือนนึงจ่ายมือถือทั้งหมดเท่าไหร่?", en:"Can you tell me your total monthly phone spending?",
    opts:[
      {th:"ได้เลย ประมาณ ฿___",en:"Yes, roughly ฿___",s:"A"},
      {th:"รู้แค่ค่าแพ็ก ที่เหลือไม่แน่ใจ",en:"Just the plan, rest unclear",s:"P"},
      {th:"มีบันทึกไว้ เปิดดูได้เลย",en:"I have records",s:"A"},
      {th:"บอกไม่ได้เลย",en:"Can't tell at all",s:"P"},
    ]},
  { id:6, dim:"HL", type:"open-amount",
    th:"ค่าแพ็กมือถือต่อเดือนของคุณเท่าไหร่?", en:"How much is your monthly mobile plan?",
    unit:"฿", placeholder:"เช่น 299", priceKey:"planCost", dimThresh:200, maxVal:3000, opts:[]},
  { id:7, dim:"HL", th:"มีแอปเสียเงินหรือ subscription อะไรบ้าง?", en:"Do you have paid apps or subscriptions?",
    opts:[
      {th:"3 ตัวขึ้นไป",en:"3+ subscriptions",s:"H"},
      {th:"1–2 ตัว ใช้ประจำ",en:"1–2, use regularly",s:"H"},
      {th:"เคยมี แต่ยกเลิกหมดแล้ว",en:"Had some, cancelled all",s:"L"},
      {th:"ไม่เคยซื้อแอปเสียเงิน",en:"Never bought paid apps",s:"L"},
    ]},
  { id:8, dim:"HL", th:"ปลายเดือนเน็ตไม่พอ ทำไง?", en:"End of month, data's not enough?",
    opts:[
      {th:"ซื้อแพ็กใหญ่สุดเลย ไม่แคร์",en:"Buy the biggest pack",s:"H"},
      {th:"ซื้อแพ็กเล็กๆ ประคอง",en:"Buy a small pack",s:"H"},
      {th:"ทน รอต้นเดือน เกาะ WiFi",en:"Wait, use WiFi",s:"L"},
      {th:"ไม่เคยเจอ แพ็กพอ / ใช้ WiFi",en:"Never happens",s:"L"},
    ]},
  { id:9, dim:"HL", th:"เคยเติมเงินในเกมหรือแอปไหม?", en:"Spent money in games or apps?",
    opts:[
      {th:"ประจำ เดือนละหลายร้อย",en:"Regularly",s:"H"},
      {th:"บ้างนิดหน่อย",en:"A little",s:"H"},
      {th:"เคยสักครั้งสองครั้ง",en:"Once or twice",s:"L"},
      {th:"ไม่เคย ของฟรีเล่นได้",en:"Never",s:"L"},
    ]},
  { id:10, dim:"HL", th:"ซื้อเคส/อุปกรณ์เสริมประมาณเท่าไหร่?", en:"Spend on cases/accessories?",
    opts:[
      {th:"หลายร้อยถึงพัน ต้องของดี",en:"Hundreds to thousands",s:"H"},
      {th:"ร้อยสองร้อย พอใช้ก็พอ",en:"100–200",s:"L"},
      {th:"ถูกสุดใน Shopee",en:"Cheapest on Shopee",s:"L"},
      {th:"ไม่ใช้เคส ใช้เปล่า",en:"No case",s:"L"},
    ]},
  { id:11, dim:"SK", th:"มือถือตัวปัจจุบันใช้มานานแค่ไหน?", en:"How long using current phone?",
    opts:[
      {th:"ไม่ถึงปี",en:"Less than 1 year",s:"S",val:0.5},
      {th:"1–2 ปี",en:"1–2 years",s:"S",val:1.5},
      {th:"2–3 ปี",en:"2–3 years",s:"K",val:2.5},
      {th:"3 ปีขึ้นไป",en:"3+ years",s:"K",val:4},
    ]},
  { id:12, dim:"SK", th:"เห็นมือถือรุ่นใหม่เปิดตัว รู้สึกยังไง?", en:"How do you feel when a new phone launches?",
    opts:[
      {th:"เช็คราคาและวันพรีออเดอร์แล้ว",en:"Already checking price",s:"S"},
      {th:"ใจสั่น แต่ดูก่อน",en:"Tempted",s:"S"},
      {th:"ดูเฉยๆ ของเรายังใช้ได้",en:"Mine still works",s:"K"},
      {th:"ไม่สนใจ ไม่เกี่ยวกับเรา",en:"Don't care",s:"K"},
    ]},
  { id:13, dim:"SK", th:"มือถือเก่าไปไหน?", en:"Where's your old phone?",
    opts:[
      {th:"ขายแล้ว / เทิร์นแล้ว",en:"Sold or traded in",s:"S"},
      {th:"ให้คนในครอบครัว / เพื่อน",en:"Gave away",s:"S"},
      {th:"อยู่ในลิ้นชัก",en:"In a drawer",s:"K"},
      {th:"ใช้เครื่องแรกอยู่",en:"Still using first phone",s:"K"},
    ]},
  { id:14, dim:"SK", th:"หน้าจอร้าว ทำไง?", en:"Screen cracked — what now?",
    opts:[
      {th:"ได้เวลาเปลี่ยนเครื่องใหม่!",en:"Time for a new phone",s:"S"},
      {th:"เช็คราคาเครื่องใหม่ดูก่อน...",en:"Check new phone prices",s:"S"},
      {th:"เอาไปซ่อม",en:"Get it fixed",s:"K"},
      {th:"แปะฟิล์มทับ ใช้ต่อ",en:"Use it anyway",s:"K"},
    ]},
  { id:15, dim:"SK", type:"open-amount",
    th:"มือถือเครื่องก่อนราคาเท่าไหร่?", en:"How much did your previous phone cost?",
    unit:"฿", placeholder:"เช่น 8990", priceKey:"phoneCost", dimThresh:8000, maxVal:60000, opts:[]},
  { id:16, dim:"MC", th:"ตอนนี้มีรูปในมือถือกี่รูป?", en:"How many photos on your phone?",
    opts:[
      {th:"ไม่ถึง 1,000 ลบเป็นประจำ",en:"Under 1,000",s:"C"},
      {th:"1,000–5,000",en:"1,000–5,000",s:"M"},
      {th:"5,000–10,000",en:"5,000–10,000",s:"M"},
      {th:"10,000+ มือถือคือพิพิธภัณฑ์",en:"10,000+",s:"M"},
    ]},
  { id:17, dim:"MC", th:"มีแอปในมือถือกี่ตัว?", en:"How many apps?",
    opts:[
      {th:"ไม่เกิน 30 ใช้ทุกตัว",en:"Under 30",s:"C"},
      {th:"ประมาณ 50",en:"About 50",s:"M"},
      {th:"นับไม่ถ้วน",en:"Countless",s:"M"},
      {th:"หน้าที่สองไม่กล้าดู",en:"Afraid to look",s:"M"},
    ]},
  { id:18, dim:"MC", th:"แจ้งเตือนที่ยังไม่ได้อ่านกี่อัน?", en:"Unread notifications?",
    opts:[
      {th:"0 — จุดแดงทำให้กังวล",en:"0",s:"C"},
      {th:"ไม่กี่อัน",en:"A few",s:"C"},
      {th:"หลายสิบ",en:"Dozens",s:"M"},
      {th:"999+ เราไม่พูดเรื่องนี้",en:"999+",s:"M"},
    ]},
  { id:19, dim:"MC", th:"หน้าจอหลักเป็นยังไง?", en:"Home screen look?",
    opts:[
      {th:"หน้าเดียว โฟลเดอร์จัดระเบียบ",en:"One page",s:"C"},
      {th:"สองหน้า พอเป็นระเบียบ",en:"Two pages",s:"C"},
      {th:"สามหน้าขึ้น",en:"3+ pages",s:"M"},
      {th:"วอลเปเปอร์? มองไม่เห็นแล้ว",en:"Can't see wallpaper",s:"M"},
    ]},
  { id:20, dim:"MC", th:"พื้นที่เก็บข้อมูลตอนนี้เป็นยังไง?", en:"Storage status?",
    opts:[
      {th:"🟢 เขียว — เหลือเยอะ",en:"Green",s:"C"},
      {th:"🟡 เหลือง — ยังไหว",en:"Yellow",s:"C"},
      {th:"🟠 ส้ม — พื้นที่ไม่พอบ่อย",en:"Orange",s:"M"},
      {th:"🔴 แดง — มือถือขอร้องทุกวัน",en:"Red",s:"M"},
    ]},
];

// ─── DEFAULT TYPES ──────────────────────────────────────────────

export const DEFAULT_TYPES = {
  SUCKER:     { name:"SUCKER",      e:"💸", th:"คนโดนเก็บ",        en:"The Mark",        min:300, max:800,  equivTh:"Redmi ใหม่ 1 เครื่อง",       tagTh:"คุณไม่ได้ใช้มือถือ คุณถูกเก็บเกี่ยว",        color:"#FF4444", img:"SUCKER.png" },
  ADDICT:     { name:"ADDICT",      e:"🔥", th:"คนติด",            en:"The Addict",      min:400, max:1200, equivTh:"บินเชียงใหม่ 6 รอบ",         tagTh:"คุณเลื่อนไม่ใช่หน้าจอ แต่เลื่อนยอดเงิน",  color:"#FF6B00", img:"ADDICT.png" },
  FLEXER:     { name:"FLEXER",      e:"💅", th:"คนอวด",            en:"The Flexer",      min:500, max:1500, equivTh:"iPad ใหม่ 1 เครื่อง",         tagTh:"คุณซื้อมือถือไม่ใช่เพื่อใช้ แต่เพื่อให้คนเห็น", color:"#E91E63", img:"FLEXER.png" },
  SWITCHER:   { name:"SWITCHER",    e:"🔄", th:"คนเปลี่ยนใจ",      en:"The Switcher",    min:400, max:1000, equivTh:"ซื้อให้ทั้งบ้านคนละเครื่อง",    tagTh:"คุณเปลี่ยนไม่ใช่มือถือ แต่เปลี่ยนความเสียใจ", color:"#9C27B0", img:"SWITCHER.png" },
  HOARDER:    { name:"HOARDER",     e:"🗑",  th:"คนสะสม",           en:"Digital Hoarder", min:150, max:400,  equivTh:"หมูปิ้ง 360 ไม้",             tagTh:"มือถือช้าไม่ใช่เพราะเก่า แต่เพราะคุณไม่ยอมลบ", color:"#795548", img:"HOARDER.png" },
  TRYHARD:    { name:"TRY HARD",    e:"🤡", th:"คนพยายาม",         en:"The Try Hard",    min:200, max:500,  equivTh:"สมาชิกฟิตเนส 3 ปี",         tagTh:"คุณพยายามมาก แต่ไม่มีอะไรประหยัดจริง",    color:"#FF9800", img:"TRYHARD.png" },
  SUBSCRIBER: { name:"SUBSCRIBER",  e:"📦", th:"คนสมัครสมาชิก",    en:"Sub Victim",      min:200, max:600,  equivTh:"Starbucks 24 แก้ว",          tagTh:"คุณจ่ายค่าเช่าให้แอปที่ไม่ได้ใช้",         color:"#2196F3", img:"SUBSCRIBER.png" },
  DATABURNER: { name:"DATA BURNER", e:"📡", th:"คนเผาเน็ต",        en:"Data Burner",     min:300, max:700,  equivTh:"ค่าห้องหาร 4 เดือน",        tagTh:"คุณเลื่อนไม่ใช่วิดีโอ แต่เลื่อนเน็ต",      color:"#00BCD4", img:"DATABURNER.png" },
  BABY:       { name:"BABY",        e:"👶", th:"เด็กน้อย",          en:"The Baby",        min:300, max:800,  equivTh:"ชานม 120 แก้ว",             tagTh:"คุณจ่ายแพง ไม่ใช่เพราะอยาก แต่เพราะไม่รู้", color:"#4CAF50", img:"BABY.png" },
  LOST:       { name:"LOST",        e:"🤯", th:"คนหลงทาง",         en:"The Lost",        min:250, max:600,  equivTh:"นั่ง BTS 600 เที่ยว",        tagTh:"คุณไม่รู้ว่าจ่ายอะไร ไม่รู้จ่ายที่ไหน",      color:"#607D8B", img:"LOST.png" },
  CHEAPO:     { name:"CHEAPO",      e:"🪙", th:"คนประหยัดสุดโต่ง",  en:"The Cheapo",      min:50,  max:200,  equivTh:"เคสมือถือ 1 อัน",            tagTh:"คุณประหยัดเงิน แต่เสียเวลา",              color:"#8BC34A", img:"CHEAPO.png" },
  ADDONKING:  { name:"ADD-ON KING", e:"👑", th:"ราชาแพ็กเสริม",     en:"Add-On King",     min:300, max:900,  equivTh:"เที่ยวภูเก็ต 1 ทริป",       tagTh:"คุณซื้อแพ็กซ้อนแพ็ก",                      color:"#FFC107", img:"ADDONKING.png" },
  CHAOS:      { name:"CHAOS",       e:"🌀", th:"คนวุ่นวาย",         en:"Pure Chaos",      min:300, max:800,  equivTh:"กาแฟ 200 แก้ว",             tagTh:"มือถือเหมือนชีวิต สุดจะควบคุม",            color:"#673AB7", img:"CHAOS.png" },
  GHOSTUSER:  { name:"GHOST USER",  e:"👻", th:"ผู้ใช้ล่องหน",      en:"Ghost User",      min:150, max:500,  equivTh:"Nike 2 คู่",                tagTh:"คุณไม่รู้ด้วยซ้ำว่าคุณใช้มือถือ",           color:"#94A3B8", img:"GHOSTUSER.png" },
  OVERKILL:   { name:"OVERKILL",    e:"💣", th:"คนเกินจำเป็น",      en:"Overkill",        min:400, max:1000, equivTh:"12 เดือน Netflix+Spotify",   tagTh:"คุณใช้เรือธง แค่เลื่อน TikTok",             color:"#F44336", img:"OVERKILL.png" },
  BROKELOOP:  { name:"BROKE LOOP",  e:"🔁", th:"วนซ้ำ",            en:"Broke Loop",      min:300, max:900,  equivTh:"มือถือราคาถูก 3 เครื่อง",     tagTh:"คุณประหยัดตลอด แต่จ่ายมากขึ้นเรื่อยๆ",     color:"#FF5722", img:"BROKELOOP.png" },
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
  { no:"01", icon:"📦", title:"BIG GAMES.\nZERO STORAGE.", bodyTh:"รันทุกอย่างบนคลาวด์ ไม่ต้องโหลด", saveRatio:0.35, tags:["No storage","Less data"] },
  { no:"02", icon:"🌙", title:"SLEEP.\nIT KEEPS RUNNING.", bodyTh:"Roblox รัน 24 ชม. ไม่กินแบต ไม่ร้อน", saveRatio:0.30, tags:["24/7","No battery"] },
  { no:"03", icon:"💬", title:"YOU CHAT.\nIT WORKS SILENTLY.", bodyTh:"ภารกิจรันบนคลาวด์ มือถือยังใช้ LINE ได้", saveRatio:0.20, tags:["Silent","Multitask"] },
  { no:"04", icon:"⚡", title:"TAP.\nPLAY INSTANTLY.", bodyTh:"ลองเกมใหม่ทันที 1 วินาที ไม่เสียเวลา", saveRatio:0.15, tags:["1 sec","No install"] },
];

// ─── DEFAULT COVER CONTENT ──────────────────────────────────────

export const DEFAULT_COVER_CONTENT = {
  badge: "MONEY LEAK TEST",
  titleLine1: "WHERE IS YOUR",
  titleLine2: "MONEY GOING?",
  descLine1: "คุณเสียเงินไปเท่าไหร่โดยไม่รู้ตัว?",
  descLine2: "แบบทดสอบ 20 ข้อ · 16 ประเภทบุคลิก · 3 นาที",
  feat1: "4 มิติวิเคราะห์พฤติกรรมการใช้เงิน",
  feat2: "คำนวณยอดเงินที่เสียไปจริงๆ",
  feat3: "แผนเอาเงินคืนเฉพาะคุณ",
  ctaBtn: "เริ่มทดสอบเลย! 🚀",
  footer: "🔒 ปลอดภัย · ฟรี · ไม่ต้องสมัคร",
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
  defaultPlanCost: 250,
  defaultPhoneCost: 8000,
  defaultPhoneYears: 2.5,

  // Monthly subscription estimate (by H/L result)
  subHigh: 180,
  subLow: 50,

  // Data overage estimate (by Q8 answer)
  dataHigh: 120,
  dataLow: 30,

  // Baseline deduction (H spenders have higher baseline)
  baselineL: 80,
  baselineH: 150,

  // Round final result to nearest N baht
  roundTo: 10,

  // Disambiguation rule thresholds (override base combo map for specific combos)
  disambig: {
    // AHKM: H score ≥ thresh → ADDONKING (limited); else q8=H → DATABURNER (limited); else SUCKER
    // H score checked FIRST so ADDONKING isn't blocked by the more-common q8=H path
    AHKM_addOnThresh: 4,
    // PHKM same logic: passive high-keeper-messy gets a second path to ADDONKING/DATABURNER
    PHKM_addOnThresh: 4,
    AHSC_priceThresh: 18000, // AHSC: phoneCost > X → OVERKILL (else FLEXER)
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
  localeBadge: "TH 🇹🇭",
  fakeCountMin: 10000,
  fakeCountMax: 15000,
  fakeCountThreshold: 13324,
  // Cloudinary image hosting (required for image uploads on Vercel)
  cloudinaryCloudName: "",
  cloudinaryUploadPreset: "",
};

// ─── DEFAULT EQUIV REFERENCES ───────────────────────────────────

export const DEFAULT_EQUIV_REFS = [
  { label: "Netflix/เดือน",  price: 349 },
  { label: "Spotify/เดือน",  price: 129 },
  { label: "AIS/เดือน",      price: 599 },
  { label: "ตั๋วหนัง",        price: 220 },
  { label: "ชานม",            price: 65  },
  { label: "iPhone 16",      price: 35900 },
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
  if (ratio >= 12) return `${(ratio / 12).toFixed(1)} ปี ${ref.label}`;
  if (ratio >= 1)  return `${Math.round(ratio)} เดือน ${ref.label}`;
  return `${Math.round(ratio * 30)} วัน ${ref.label}`;
}

// ─── DEFAULT UI STRINGS ─────────────────────────────────────────

export const DEFAULT_STRINGS = {
  // Calc screen loading messages (shown in sequence)
  calcMsg1: "🔍 วิเคราะห์คำตอบ...",
  calcMsg2: "📊 ประมวลผล 4 มิติ...",
  calcMsg3: "🧮 คำนวณเงินที่เสียไป...",
  calcMsg4: "💸 ผลลัพธ์น่าตกใจ...",

  // Result screen
  shareBtn: "📤 แชร์ผลลัพธ์ใน LINE",
  shareSaveBtn: "💾 บันทึกรูป",
  shareCopyBtn: "📋 คัดลอกรูป",
  shareLongPress: "长按图片 → 储存至相册",
  planCtaBtn: "🎯 ดูแผนเอาเงินคืน ↓",
  resultLabel: "MPTI RESULT",
  wasteLabel: "คุณเสียเงินไปโดยไม่รู้ตัว",
  perMonth: "/เดือน",
  perYear: "/ปี",

  // Plan screen
  recoveryTitle: "RECOVERY PLAN",
  recoverySubtitle: "เอาเงิน",
  recoverySuffix: "คืน!",
  recoveryHint: "ปัดซ้าย-ขวา เพื่อดูวิธีประหยัด",
  planCardBtn: "ทดลองฟรี 7 วัน",
  planFooter: "สมัครฟรี · ไม่ต้องบัตรเครดิต · ยกเลิกได้ตลอด",

  // Login sheet
  loginTitle: "บันทึกผลลัพธ์ MPTI",
  loginSubtitle: "สมัครฟรี แล้วดูว่า 7 วันถัดไปคุณประหยัดได้เท่าไหร่",
  loginLineBtn: "LINE ลงทะเบียนด้วย LINE",
  loginEmailBtn: "หรือใช้อีเมล",
  loginPrivacy1: "ไม่โพสต์",
  loginPrivacy2: "ไม่อ่านข้อความ",
  loginPrivacy3: "บันทึกผลเท่านั้น",

  // Result screen extras
  restartBtn: "ทำแบบทดสอบใหม่",

  // Success modal
  successTitle: "สำเร็จ!",
  successSubtitle: "ทดลองใช้ Cloud Phone ฟรี 7 วัน พร้อมแล้ว",
  successCta: "ไปที่ Cloud Phone",
};

// ─── LOCAL STORAGE HELPERS ──────────────────────────────────────

const KEYS = {
  stats:          "mpti-stats",
  questions:      "mpti-questions",
  types:          "mpti-types",
  recovery:       "mpti-recovery",
  users:          "mpti-users",
  images:         "mpti-images",
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
  return {
    coverContent:  readJSON(KEYS.coverContent,  null),
    strings:       readJSON(KEYS.strings,       null),
    settings:      readJSON(KEYS.settings,      null),
    questions:     readJSON(KEYS.questions,     null),
    types:         readJSON(KEYS.types,         null),
    recovery:      readJSON(KEYS.recovery,      null),
    scoring:       readJSON(KEYS.scoring,       null),
    comboMap:      readJSON(KEYS.comboMap,      null),
    equivRefs:     readJSON(KEYS.equivRefs,     null),
    // image URL paths (small strings, already served from public/)
    images:        readJSON(KEYS.images,        null),
    questionImages:readJSON(KEYS.questionImages,null),
    cardImages:    readJSON(KEYS.cardImages,    null),
  };
}

export async function syncToServer() {
  try {
    await fetch("/api/save-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collectTextData()),
    });
  } catch (_) { /* dev server not available — silently ignore */ }
}

export async function loadFromServer() {
  try {
    const res = await fetch(`/data/store.json?t=${Date.now()}`);
    if (!res.ok) return false;
    const d = await res.json();
    if (d.coverContent)   writeJSON(KEYS.coverContent,   d.coverContent);
    if (d.strings)        writeJSON(KEYS.strings,        d.strings);
    if (d.settings)       writeJSON(KEYS.settings,       d.settings);
    if (d.questions)      writeJSON(KEYS.questions,      d.questions);
    if (d.types)          writeJSON(KEYS.types,          d.types);
    if (d.recovery)       writeJSON(KEYS.recovery,       d.recovery);
    if (d.scoring)        writeJSON(KEYS.scoring,        d.scoring);
    if (d.comboMap)       writeJSON(KEYS.comboMap,       d.comboMap);
    if (d.equivRefs)      writeJSON(KEYS.equivRefs,      d.equivRefs);
    if (d.images)         writeJSON(KEYS.images,         d.images);
    if (d.questionImages) writeJSON(KEYS.questionImages, d.questionImages);
    if (d.cardImages)     writeJSON(KEYS.cardImages,     d.cardImages);
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
