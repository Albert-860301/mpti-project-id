import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getQuestions, getTypes, getRecoveryCards, getStats, getImages,
  getQuestionImages, getCoverImage, getCoverContent,
  getSettings, getStrings, getEquivRefs, calcEquivLabel,
  getCardImages, loadFromServer,
  calculateResult, recordTest, recordShare,
} from "../data/store";

// Return stored URL/base64, or fall back to the standard public path
function imgSrc(stored, publicPath) {
  return stored && stored !== "" ? stored : publicPath;
}
// On image load error: hide the image but keep the wrapper space to avoid layout shift
function hideOnErr(e) {
  e.currentTarget.style.visibility = "hidden";
}

const C = {
  bg: "#F5F7FB", phone: "#FFFFFF", card2: "#F3F6FC",
  line: "rgba(15,23,42,0.08)", text: "#0F172A",
  muted: "rgba(15,23,42,0.62)", faint: "rgba(15,23,42,0.38)",
  red: "#FF3D5A", orange: "#FF7A33", green: "#06C755",
};

function primaryBtn(a = C.red, b = C.orange) {
  return { width: "100%", padding: "15px 16px", borderRadius: 18, border: "none", background: `linear-gradient(135deg,${a},${b})`, color: "#fff", fontSize: 15, fontWeight: 950, cursor: "pointer", boxShadow: `0 10px 28px ${a}40` };
}
function outlineBtn(color) {
  return { width: "100%", padding: 13, borderRadius: 17, border: `1px solid ${color}66`, background: "transparent", color, fontSize: 14, fontWeight: 900, cursor: "pointer" };
}
function ghostBtn() {
  return { background: "none", border: "none", color: C.muted, fontSize: 28, fontWeight: 800, cursor: "pointer", padding: "2px 10px" };
}
function modalBtn(bg, color) {
  return { padding: 12, borderRadius: 16, border: "none", background: bg, color, fontSize: 13, fontWeight: 800, cursor: "pointer" };
}

function useIsMobile() {
  const [m, setM] = useState(() => window.innerWidth < 520);
  useEffect(() => {
    const fn = () => setM(window.innerWidth < 520);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return m;
}

function Shell({ children }) {
  return (
    <main style={{ height: "100svh", background: C.bg, color: C.text, fontFamily: "Kanit, system-ui, sans-serif", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: "radial-gradient(circle at 18% 8%, rgba(255,61,90,.10), transparent 34%), radial-gradient(circle at 85% 92%, rgba(255,122,51,.10), transparent 36%)" }} />
      {children}
    </main>
  );
}

function PhoneShell({ children, isMobile }) {
  if (isMobile) {
    return (
      <div style={{ width: "100%", height: "100%", background: C.phone, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </div>
    );
  }
  return (
    <div style={{ width: "100%", maxWidth: 400, minHeight: "min(92dvh,780px)", maxHeight: 820, margin: "0 auto", borderRadius: 34, overflow: "hidden", background: C.phone, boxShadow: "0 20px 60px rgba(15,23,42,.12), inset 0 0 0 1px rgba(15,23,42,.04)", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 22px 4px", fontSize: 11, fontWeight: 700, color: C.faint }}>
        <span>9:41</span>
        <span style={{ width: 76, height: 22, borderRadius: 16, background: C.card2 }} />
        <span>📶 🔋</span>
      </div>
      {children}
    </div>
  );
}

function Screen({ children, name, isMobile }) {
  if (isMobile) {
    return (
      <motion.div key={name} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}
        style={{ position: "relative", zIndex: 1, height: "100svh" }}>
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div key={name} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}
      style={{ position: "relative", zIndex: 1, display: "grid", placeItems: "center", minHeight: "100dvh", padding: 12 }}>
      {children}
    </motion.div>
  );
}

// (Overlay compositing has been moved to admin — images come pre-baked from Cloudinary)

/* ── START ───────────────────────────────────────────────────── */
function StartScreen({ onStart, stats, fakeCount, coverImage, coverContent, settings, isMobile, types, images }) {
  const c = coverContent;
  const feats = [["🎯", c.feat1], ["💸", c.feat2], ["📊", c.feat3]];
  const threshold = settings.fakeCountThreshold ?? 13324;
  const displayCount = stats.total >= threshold ? stats.total : fakeCount;

  // No background preloading on start — first-time visitors should not download images they haven't earned yet
  return (
    <Screen name="start" isMobile={isMobile}>
      <PhoneShell isMobile={isMobile}>
        {/* Scrollable content area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <b style={{ fontSize: 24, letterSpacing: -1, color: C.text }}>{settings.siteName}</b>
            <span style={{ fontSize: 11, fontWeight: 900, padding: "6px 12px", borderRadius: 999, background: C.card2, color: C.muted }}>{settings.localeBadge}</span>
          </div>
          <div style={{ marginTop: 16, alignSelf: "flex-start", display: "inline-block", padding: "7px 14px", borderRadius: 999, background: `linear-gradient(135deg,${C.red},${C.orange})`, fontSize: 10, fontWeight: 950, letterSpacing: 1.4, color: "#fff", boxShadow: "0 10px 30px rgba(255,61,90,.22)" }}>{c.badge}</div>
          <h1 style={{ margin: "12px 0 0", fontSize: "clamp(40px,10vw,56px)", lineHeight: 0.92, letterSpacing: -1.6, fontWeight: 950, color: C.text }}>
            {c.titleLine1}<br /><span style={{ color: C.red }}>{c.titleLine2}</span>
          </h1>
          <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.55, color: C.muted, fontWeight: 650 }}>
            {c.descLine1}<br />{c.descLine2}
          </p>
          <div style={{ marginTop: 14, borderRadius: 14, overflow: "hidden", aspectRatio: "5/3" }}>
            <img src={imgSrc(coverImage, "/images/cover/cover.jpg")} alt="cover" onError={hideOnErr}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} decoding="async" />
          </div>
          <div style={{ marginTop: 14, display: "grid", gap: 8, paddingBottom: 16 }}>
            {feats.map(([icon, txt]) => (
              <div key={txt} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, fontWeight: 700, color: C.muted }}>
                <span style={{ width: 28, height: 28, borderRadius: 10, display: "grid", placeItems: "center", background: "rgba(255,61,90,.10)", flexShrink: 0 }}>{icon}</span>
                {txt}
              </div>
            ))}
          </div>
        </div>
        {/* CTA always visible at bottom */}
        <div style={{ padding: "12px 22px", paddingBottom: "max(22px, env(safe-area-inset-bottom, 22px))", background: C.phone, borderTop: `1px solid ${C.line}`, flexShrink: 0 }}>
          <div style={{ padding: "10px 12px", borderRadius: 18, background: C.phone, border: `1px solid ${C.line}`, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.muted, fontWeight: 750 }}>
              <span>🧑 👩 🧒</span>
              <span>ทดสอบแล้ว <b style={{ color: C.red }}>{displayCount.toLocaleString()}</b> คน</span>
            </div>
          </div>
          <motion.button onClick={onStart} whileTap={{ scale: 0.96 }} style={primaryBtn()}>{c.ctaBtn}</motion.button>
          <p style={{ margin: "8px 0 0", textAlign: "center", color: C.faint, fontSize: 10, fontWeight: 700 }}>{c.footer}</p>
        </div>
      </PhoneShell>
    </Screen>
  );
}

/* ── QUIZ ────────────────────────────────────────────────────── */
function QuizScreen({ questions, questionImages, onDone, onBack, isMobile }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);   // for choice questions
  const [openInput, setOpenInput] = useState("");    // for open-amount questions
  const [dir, setDir] = useState(1);
  const q = questions[index];
  const qImg = questionImages?.[String(q.id)];
  const isOpen = q.type === "open-amount";
  const progress = ((index + 1) / questions.length) * 100;

  // Preload next question's image so transition is instant
  useEffect(() => {
    const next = questions[index + 1];
    if (!next) return;
    const src = questionImages?.[String(next.id)] || `/images/questions/q${next.id}.jpg`;
    const img = new Image(); img.src = src;
  }, [index]);

  // Reset open input when question changes
  useEffect(() => { setOpenInput(""); }, [q.id]);

  const advance = (answer) => {
    const next = [...answers, answer];
    if (index + 1 >= questions.length) onDone(next);
    else { setAnswers(next); setIndex(index + 1); setSelected(null); setDir(1); }
  };

  const pickChoice = oi => {
    if (selected !== null) return;
    setSelected(oi);
    if (navigator?.vibrate) navigator.vibrate(18);
    setTimeout(() => advance({ qid: q.id, optIndex: oi }), 360);
  };

  const confirmOpen = () => {
    const val = parseFloat(openInput);
    if (!val || val <= 0) return;
    advance({ qid: q.id, openValue: val });
  };

  const goBack = () => {
    if (index > 0) { setIndex(index - 1); setAnswers(answers.slice(0, -1)); setSelected(null); setDir(-1); }
    else onBack();
  };

  const openValid = parseFloat(openInput) > 0;

  return (
    <Screen name="quiz" isMobile={isMobile}>
      <PhoneShell isMobile={isMobile}>
        <div style={{ padding: "2px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={goBack} style={ghostBtn()}>‹</button>
          <b style={{ fontSize: 13, color: C.text }}>{index + 1} <span style={{ color: C.faint }}>/ {questions.length}</span></b>
          <span />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 16px 16px" }}>
          <div style={{ height: 5, borderRadius: 99, overflow: "hidden", background: C.card2, marginBottom: 14 }}>
            <motion.div animate={{ width: `${progress}%` }} style={{ height: "100%", background: `linear-gradient(90deg,${C.red},${C.orange},#FFD600)` }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={q.id} initial={{ opacity: 0, x: dir * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -dir * 40 }} transition={{ duration: 0.24 }}>
              <div style={{ display: "flex", gap: 9 }}>
                <div style={{ width: 34, height: 34, borderRadius: 17, display: "grid", placeItems: "center", background: "rgba(255,61,90,.12)", flexShrink: 0 }}>🤖</div>
                <div style={{ flex: 1, padding: "13px 14px", borderRadius: "18px 18px 18px 5px", background: C.card2, border: `1px solid ${C.line}` }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.text, lineHeight: 1.35 }}>{q.th}</div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>{q.en}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Image: always attempt public path; onError hides wrapper if file missing */}
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "10px 0" }}>
            <div style={{ borderRadius: 14, overflow: "hidden", aspectRatio: "4/3", width: "100%" }}>
              <img src={imgSrc(qImg, `/images/questions/q${q.id}.jpg`)} alt="" onError={hideOnErr}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} decoding="async" />
            </div>
          </div>

          <div>
          {isOpen ? (
            /* ── Open-amount input ── */
            <div style={{ borderRadius: 20, border: `2px solid ${openValid ? C.red : C.line}`, background: C.phone, overflow: "hidden", transition: "border-color .2s, box-shadow .2s", boxShadow: openValid ? `0 0 0 4px ${C.red}18` : "none" }}>
              <div style={{ padding: "14px 18px 10px" }}>
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1, color: C.faint, marginBottom: 6 }}>Masukkan jumlah</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: 26, fontWeight: 950, color: openValid ? C.red : C.faint }}>{q.unit || "Rp"}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={openInput}
                    onChange={e => {
                      const v = e.target.value;
                      const num = parseFloat(v);
                      if (q.maxVal && num > q.maxVal) setOpenInput(String(q.maxVal));
                      else setOpenInput(v);
                    }}
                    onKeyDown={e => e.key === "Enter" && confirmOpen()}
                    placeholder={q.placeholder || "0"}
                    max={q.maxVal || undefined}
                    autoFocus
                    style={{
                      flex: 1, border: "none", outline: "none", background: "transparent",
                      fontSize: 38, fontWeight: 950, color: C.text, fontFamily: "inherit",
                      width: "100%", minWidth: 0,
                    }}
                  />
                </div>
                {q.maxVal && parseFloat(openInput) > q.maxVal && (
                  <div style={{ fontSize: 10, color: C.orange, marginTop: 5, fontWeight: 700 }}>
                    ⚠️ Melebihi Rp{q.maxVal.toLocaleString()}, akan dihitung pada nilai maksimum
                  </div>
                )}
              </div>
              <motion.button
                onClick={confirmOpen}
                disabled={!openValid}
                whileTap={openValid ? { scale: 0.98 } : {}}
                style={{
                  display: "block", width: "100%", padding: "13px",
                  border: "none",
                  background: openValid ? `linear-gradient(135deg,${C.red},${C.orange})` : C.card2,
                  color: openValid ? "#fff" : C.faint,
                  fontSize: 15, fontWeight: 950,
                  cursor: openValid ? "pointer" : "not-allowed",
                  transition: "background .2s, color .2s",
                  letterSpacing: 0.5,
                }}
              >
                {openValid ? "ยืนยัน ›" : "กรอกตัวเลขก่อน"}
              </motion.button>
            </div>
          ) : (
            /* ── Choice buttons ── */
            <div style={{ display: "grid", gap: 8 }}>
              {q.opts.map((opt, i) => (
                <motion.button key={opt.th} onClick={() => pickChoice(i)} disabled={selected !== null} whileTap={{ scale: 0.96 }}
                  animate={selected === i ? { scale: [1, 0.96, 1.02, 1], backgroundColor: C.red } : {}}
                  style={{ textAlign: "left", padding: "13px 15px", borderRadius: 15, border: `1px solid ${selected === i ? C.red : C.line}`, background: selected === i ? C.red : C.phone, color: selected === i ? "#fff" : C.text, opacity: selected !== null && selected !== i ? 0.38 : 1, fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: selected === i ? "0 10px 24px rgba(255,61,90,.22)" : "0 6px 18px rgba(15,23,42,.04)" }}>
                  <span style={{ opacity: 0.45, marginRight: 8 }}>{String.fromCharCode(65 + i)}.</span>{opt.th}
                  <span style={{ display: "block", fontSize: 10, opacity: 0.6, marginTop: 3, paddingLeft: 22 }}>{opt.en}</span>
                </motion.button>
              ))}
            </div>
          )}
          </div>
        </div>
      </PhoneShell>
    </Screen>
  );
}

/* ── CALC ────────────────────────────────────────────────────── */
function CalcScreen({ onDone, strings, isMobile, result, images }) {
  const [step, setStep] = useState(0);
  const msgs = [strings.calcMsg1, strings.calcMsg2, strings.calcMsg3, strings.calcMsg4];
  useEffect(() => {
    const id = setInterval(() => setStep(s => {
      if (s >= msgs.length - 1) { clearInterval(id); setTimeout(onDone, 650); return s; }
      return s + 1;
    }), 650);
    return () => clearInterval(id);
  }, []);

  // Use the calc animation time (≈3s) to preload the result type image
  useEffect(() => {
    if (!result?.typeKey) return;
    const src = imgSrc(images?.[result.typeKey], `/images/types/${result.typeKey}.jpg`);
    const img = new Image(); img.src = src;
  }, []);

  return (
    <Screen name="calc" isMobile={isMobile}>
      <PhoneShell isMobile={isMobile}>
        <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 28, textAlign: "center" }}>
          <div>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              style={{ width: 54, height: 54, borderRadius: 99, border: "4px solid rgba(15,23,42,.08)", borderTopColor: C.red, margin: "0 auto 22px" }} />
            {msgs.map((m, i) => (
              <motion.div key={m} animate={{ opacity: i <= step ? 1 : 0.28, y: i <= step ? 0 : 8 }}
                style={{ fontSize: 15, fontWeight: 850, color: C.text, marginBottom: 10 }}>{m}</motion.div>
            ))}
          </div>
        </div>
      </PhoneShell>
    </Screen>
  );
}

/* ── RESULT ──────────────────────────────────────────────────── */
function ResultScreen({ result, equivRefs, onShare, onPlan, onRestart, strings, isMobile, showLineMode }) {
  const { personality: p, monthlyWaste } = result;
  const yearly = monthlyWaste * 12;
  const equivLabel = calcEquivLabel(monthlyWaste, equivRefs);

  return (
    <Screen name="result" isMobile={isMobile}>
      <PhoneShell isMobile={isMobile}>
        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", background: `linear-gradient(180deg, ${p.color}18 0%, #fff 55%)` }}>
          <div style={{ padding: "28px 20px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 950, letterSpacing: 2, color: `${p.color}99`, marginBottom: 12 }}>{strings.resultLabel}</div>
            <motion.div initial={{ scale: 0.75, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ fontSize: "clamp(52px,13vw,72px)", lineHeight: 1 }}>
              {p.e}
            </motion.div>
            <motion.div initial={{ scale: 0.75, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.08 }}
              style={{ fontSize: "clamp(38px,10vw,56px)", fontWeight: 950, color: p.color, lineHeight: 1, letterSpacing: -1.5, marginTop: 6 }}>
              {p.name}
            </motion.div>
            <div style={{ fontSize: 13, color: C.muted, fontWeight: 750, marginTop: 8 }}>{p.th} — {p.en}</div>

            <div style={{ margin: "20px 0 0", height: 1, background: `linear-gradient(90deg, transparent, ${p.color}44, transparent)` }} />

            <div style={{ marginTop: 20 }}>
              <div style={{ color: `${p.color}99`, fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>{strings.wasteLabel}</div>
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: [0.5, 1.12, 1], opacity: 1 }} transition={{ duration: 0.55, delay: 0.2 }}
                style={{ fontSize: "clamp(52px,14vw,76px)", color: p.color, fontWeight: 950, lineHeight: 1, marginTop: 8 }}>
                Rp{monthlyWaste.toLocaleString()}
              </motion.div>
              <div style={{ color: p.color, fontSize: 18, fontWeight: 900, marginTop: 2 }}>{strings.perMonth}</div>
            </div>

            <div style={{ margin: "16px 0", height: 1, background: `linear-gradient(90deg, transparent, ${p.color}44, transparent)` }} />

            <div style={{ color: C.muted, fontSize: 13 }}>= Rp{yearly.toLocaleString()}{strings.perYear}</div>
            {equivLabel && <div style={{ color: p.color, fontSize: 15, fontWeight: 900, marginTop: 4 }}>≈ {equivLabel}</div>}

            <div style={{ marginTop: 20, color: C.muted, fontSize: 13, lineHeight: 1.6, fontStyle: "italic" }}>"{p.tagTh}"</div>
          </div>
        </div>

        {/* Sticky buttons */}
        <div style={{ padding: "12px 16px", paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))", borderTop: `1px solid ${C.line}`, flexShrink: 0 }}>
          <motion.button onClick={onShare} whileTap={{ scale: 0.96 }} style={{ ...primaryBtn(C.green, "#00B843"), marginBottom: 8 }}>{showLineMode ? strings.shareBtn : (strings.shareBtnNoLine || "💾 Simpan hasil")}</motion.button>
          <motion.button onClick={onPlan} whileTap={{ scale: 0.96 }} style={outlineBtn(p.color)}>{strings.planCtaBtn}</motion.button>
          <div style={{ textAlign: "center", marginTop: 10 }}>
            <button onClick={onRestart} style={{ background: "none", border: "none", color: C.faint, fontSize: 11, fontWeight: 700, cursor: "pointer", padding: "4px 8px" }}>{strings.restartBtn || "Ulangi tes"}</button>
          </div>
        </div>
      </PhoneShell>
    </Screen>
  );
}

/* ── PLAN ────────────────────────────────────────────────────── */
function PlanScreen({ result, cards, cardImages, onBack, onClaim, strings, isMobile }) {
  const [active, setActive] = useState(0);
  const { monthlyWaste } = result;
  const next = () => setActive(x => (x + 1) % cards.length);
  const prev = () => setActive(x => (x + cards.length - 1) % cards.length);

  // Preload all card images on mount
  useEffect(() => {
    cards.forEach(card => {
      const src = imgSrc(cardImages?.[card.no], `/images/cards/card${card.no}.jpg`);
      const img = new Image(); img.src = src;
    });
  }, []);

  return (
    <Screen name="plan" isMobile={isMobile}>
      <PhoneShell isMobile={isMobile}>
        <div style={{ padding: "4px 16px" }}><button onClick={onBack} style={ghostBtn()}>‹</button></div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 16px 16px", overflow: "hidden" }}>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 950, letterSpacing: 2, color: C.faint }}>{strings.recoveryTitle}</div>
            <div style={{ fontSize: "clamp(22px,5dvh,30px)", fontWeight: 950, color: C.text, marginTop: 4 }}>
              {strings.recoverySubtitle} <span style={{ color: C.red }}>Rp{monthlyWaste.toLocaleString()}</span> {strings.recoverySuffix}
            </div>
            <p style={{ fontSize: 11, color: C.faint, marginTop: 5 }}>{strings.recoveryHint}</p>
          </div>

          <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
            {cards.map((card, i) => {
              const offset = (i - active + cards.length) % cards.length;
              if (![0, 1, cards.length - 1].includes(offset)) return null;
              return (
                <motion.div key={card.no}
                  drag={offset === 0 ? "x" : false} dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => { if (info.offset.x < -60) next(); if (info.offset.x > 60) prev(); }}
                  onClick={() => offset !== 0 && setActive(i)}
                  animate={{ x: offset===0?0:offset===1?30:-30, y: offset===0?0:12, scale: offset===0?1:0.93, opacity: offset===0?1:0.9, zIndex: offset===0?5:1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  style={{ position: "absolute", inset: 0, borderRadius: 26, padding: 16, background: C.phone, border: `1px solid ${C.line}`, display: "flex", flexDirection: "column", cursor: offset===0?"grab":"pointer", boxShadow: "0 14px 40px rgba(15,23,42,.10)" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                    <span style={{ padding: "5px 12px", borderRadius: 999, background: "rgba(255,61,90,.10)", color: C.red, fontSize: 10, fontWeight: 900 }}>{card.no}</span>
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 950, color: C.text, whiteSpace: "pre-line", lineHeight: 1.03, marginBottom: 6 }}>{card.title}</h3>
                  <p style={{ fontSize: 12, color: C.muted, fontWeight: 700, lineHeight: 1.45 }}>{card.bodyTh}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                    {card.tags.map(t => <span key={t} style={{ fontSize: 9, color: C.muted, fontWeight: 800, padding: "4px 8px", borderRadius: 8, background: C.card2 }}>{t}</span>)}
                  </div>
                  <div style={{ flex: 1, minHeight: 100, maxHeight: 200, padding: "8px 0" }}>
                    <div style={{ borderRadius: 12, overflow: "hidden", width: "100%", height: "100%" }}>
                      <img src={imgSrc(cardImages?.[card.no], `/images/cards/card${card.no}.jpg`)} alt="" onError={hideOnErr}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} decoding="async" />
                    </div>
                  </div>
                  <div style={{ padding: "8px 12px", borderRadius: 14, background: "rgba(255,61,90,.07)", border: "1px solid rgba(255,61,90,.13)", marginBottom: 8 }}>
                    <div style={{ color: C.faint, fontSize: 9, fontWeight: 900, letterSpacing: 1 }}>Bisa hemat</div>
                    <div style={{ color: C.red, fontWeight: 950, fontSize: 22 }}>
                      {card.saveRatio
                        ? `Rp${Math.round(monthlyWaste * card.saveRatio / 1000) * 1000}`
                        : (typeof card.save === "string" && card.save.startsWith("Rp") ? card.save : `Rp${card.save}`)}
                      <span style={{ fontSize: 12 }}>/bulan</span>
                    </div>
                  </div>
                  <motion.button onClick={e => { e.stopPropagation(); onClaim(); }} whileTap={{ scale: 0.96 }} style={primaryBtn()}>
                    {strings.planCardBtn} <span style={{ float: "right" }}>›</span>
                  </motion.button>
                </motion.div>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
            {cards.map((_, i) => (
              <button key={i} onClick={() => setActive(i)}
                style={{ width: i===active?28:6, height: 6, borderRadius: 99, border: 0, background: i===active?C.red:"rgba(15,23,42,.16)", transition: "all .25s", cursor: "pointer" }} />
            ))}
          </div>
          <p style={{ textAlign: "center", color: C.faint, fontSize: 10, marginTop: 8, fontWeight: 700 }}>{strings.planFooter}</p>
        </div>
      </PhoneShell>
    </Screen>
  );
}

/* ── SHARE PREVIEW ──────────────────────────────────────────── */
// Overlay is pre-baked into images by admin — no client-side canvas needed.
// Mobile long-press saves the image directly (no blob URL blocking).
function SharePreview({ result, images, strings, onClose, showLineMode }) {
  const { personality: p, typeKey } = result;
  const src = imgSrc(images[typeKey], `/images/types/${typeKey}.jpg`);
  const isTouch = navigator.maxTouchPoints > 0;
  const [status, setStatus] = useState("idle");

  const handleCopy = async () => {
    setStatus("loading");
    try {
      // Use no-cors-safe approach: fetch with cors, fallback to opening in new tab
      const res = await fetch(src, { mode: "cors" });
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type || "image/jpeg"]: blob })]);
      setStatus("done");
      setTimeout(() => { setStatus("idle"); onClose(); }, 1400);
    } catch (_) {
      // Fallback: open image in new tab for manual save
      window.open(src, "_blank");
      setStatus("idle");
    }
  };

  const copyLabel = status === "loading" ? "กำลังโหลด…"
    : status === "done" ? "คัดลอกแล้ว ✓"
    : (strings?.shareCopyBtn || "📋 คัดลอกรูป");

  const longPressHint = showLineMode
    ? (strings?.shareLongPress || "长按图片 → 储存至相册")
    : (strings?.shareLongPressNoLine || "长按图片保存到相册");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "grid", placeItems: "center", padding: 16, background: "rgba(15,23,42,.36)", backdropFilter: "blur(10px)" }}>
      <motion.div onClick={e => e.stopPropagation()} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        style={{ width: "100%", maxWidth: 360, borderRadius: 24, overflow: "hidden", background: C.phone, boxShadow: "0 24px 70px rgba(15,23,42,.25)" }}>
        <div style={{ overflow: "hidden", position: "relative", background: C.card2 }}>
          <img src={src} alt={p.name} onError={hideOnErr} decoding="async"
            style={{ width: "100%", height: "auto", display: "block" }} />
          {isTouch && (
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 14px", background: "rgba(15,23,42,.62)", backdropFilter: "blur(4px)", textAlign: "center" }}>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>{longPressHint}</div>
            </div>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: 12 }}>
          <button onClick={onClose} style={modalBtn(C.card2, C.muted)}>ปิด</button>
          {isTouch ? (
            <button onClick={onClose} style={modalBtn(C.green, "#fff")}>OK</button>
          ) : (
            <button onClick={handleCopy} disabled={status !== "idle"} style={modalBtn(status === "done" ? "#06C755" : C.green, "#fff")}>
              {copyLabel}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── LOGIN SHEET ─────────────────────────────────────────────── */
function LoginSheet({ onClose, onSuccess, strings, monthlyWaste, lineOaUrl }) {
  const handleLine = () => {
    if (lineOaUrl) window.open(lineOaUrl, "_blank");
    onSuccess();
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 12, background: "rgba(15,23,42,.34)", backdropFilter: "blur(8px)" }}>
      <motion.div onClick={e => e.stopPropagation()} initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
        style={{ width: "100%", maxWidth: 420, borderRadius: 30, background: C.phone, padding: "20px 20px 28px", border: `1px solid ${C.line}`, boxShadow: "0 -10px 40px rgba(15,23,42,.18)" }}>
        <div style={{ width: 42, height: 4, borderRadius: 4, background: "rgba(15,23,42,.14)", margin: "0 auto 16px" }} />
        {monthlyWaste > 0 && (
          <div style={{ padding: "10px 14px", borderRadius: 14, background: "rgba(255,61,90,.08)", border: "1px solid rgba(255,61,90,.18)", marginBottom: 14, textAlign: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1, color: C.red, opacity: 0.7 }}>Kamu telah membuang uang tanpa sadar</div>
            <div style={{ fontSize: 28, fontWeight: 950, color: C.red, lineHeight: 1.1 }}>Rp{monthlyWaste.toLocaleString()}<span style={{ fontSize: 12, fontWeight: 700 }}>/bulan</span></div>
          </div>
        )}
        <div style={{ fontSize: 30 }}>🔒</div>
        <h3 style={{ fontSize: 25, fontWeight: 950, margin: "4px 0 0", color: C.text }}>{strings.loginTitle}</h3>
        <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5, marginTop: 5 }}>{strings.loginSubtitle}</p>
        <motion.button onClick={handleLine} whileTap={{ scale: 0.96 }} style={{ ...primaryBtn(C.green, "#00B843"), marginTop: 16 }}>{strings.loginLineBtn}</motion.button>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12, textAlign: "center", color: C.faint, fontSize: 10, fontWeight: 700 }}>
          {[strings.loginPrivacy1, strings.loginPrivacy2, strings.loginPrivacy3].map(t => (
            <div key={t} style={{ padding: 10, borderRadius: 12, background: C.card2 }}>✓<br />{t}</div>
          ))}
        </div>
        <button disabled style={{ ...modalBtn(C.card2, C.faint), width: "100%", marginTop: 10, cursor: "not-allowed", opacity: 0.5 }}>{strings.loginEmailBtn}</button>
      </motion.div>
    </motion.div>
  );
}

/* ── SUCCESS ─────────────────────────────────────────────────── */
function SuccessModal({ onClose, strings, autoRedirect }) {
  const [countdown, setCountdown] = useState(autoRedirect ? 3 : null);

  useEffect(() => {
    if (!autoRedirect) return;
    if (countdown <= 0) { onClose(); return; }
    const id = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown, autoRedirect]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 60, display: "grid", placeItems: "center", padding: 12, background: "rgba(15,23,42,.34)", backdropFilter: "blur(12px)" }}>
      <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }}
        style={{ width: "100%", maxWidth: 360, borderRadius: 30, padding: 24, textAlign: "center", background: C.phone, border: `1px solid ${C.line}`, boxShadow: "0 24px 70px rgba(15,23,42,.22)" }}>
        <div style={{ width: 58, height: 58, borderRadius: 99, display: "grid", placeItems: "center", margin: "0 auto", background: `linear-gradient(135deg,${C.red},${C.orange})`, color: "#fff", fontSize: 28 }}>✓</div>
        <h2 style={{ fontSize: 28, fontWeight: 950, marginTop: 12, color: C.text }}>{strings.successTitle}</h2>
        <p style={{ color: C.muted, fontSize: 13 }}>{strings.successSubtitle}</p>
        <div style={{ display: "grid", gap: 7, marginTop: 16, textAlign: "left" }}>
          {[["☁️","Cloud Phone","Sedang menyiapkan perangkat"],["✅","Siap digunakan","Mulai sekarang"],["🎁","Pantau penghematan","Lihat hasil dalam 7 hari"]].map(([icon,title,sub]) => (
            <div key={title} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 14, background: C.card2 }}>
              <span>{icon}</span>
              <div><b style={{ fontSize: 13, color: C.text }}>{title}</b><div style={{ fontSize: 10, color: C.faint }}>{sub}</div></div>
            </div>
          ))}
        </div>
        <motion.button onClick={onClose} whileTap={{ scale: 0.96 }} style={{ ...primaryBtn(), marginTop: 16 }}>
          {autoRedirect && countdown > 0 ? `${strings.successCta} (${countdown})` : strings.successCta}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ── MAIN APP ────────────────────────────────────────────────── */
export default function MPTIApp() {
  const [ready, setReady] = useState(false);
  useEffect(() => { loadFromServer().finally(() => setReady(true)); }, []);
  if (!ready) return (
    <main style={{ minHeight: "100svh", display: "grid", placeItems: "center", background: C.bg, fontFamily: "Kanit, system-ui, sans-serif" }}>
      <div style={{ textAlign: "center", color: C.faint }}>
        <div style={{ width: 40, height: 40, borderRadius: 99, border: `4px solid ${C.line}`, borderTopColor: C.red, margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </main>
  );
  return <MPTIAppContent />;
}

function MPTIAppContent() {
  const [phase, setPhase] = useState("start");
  const [result, setResult] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [stats, setStats] = useState(() => getStats());
  const [questions]     = useState(() => getQuestions());
  const [types]         = useState(() => getTypes());
  const [cards]         = useState(() => getRecoveryCards());
  const [images]        = useState(() => getImages());
  const [questionImages] = useState(() => getQuestionImages());
  const [coverImage]    = useState(() => getCoverImage());
  const [coverContent]  = useState(() => getCoverContent());
  const [settings]      = useState(() => getSettings());
  const [strings]       = useState(() => getStrings());
  const [equivRefs]     = useState(() => getEquivRefs());
  const [cardImages]    = useState(() => getCardImages());
  const [fakeCount]     = useState(() => {
    const min = settings.fakeCountMin ?? 10000;
    const max = settings.fakeCountMax ?? 15000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  });

  const handleDone = answers => {
    const res = calculateResult(answers, questions, types);
    setResult(res);
    setPhase("calc");
  };

  const handleCalc = () => {
    if (result) { const newStats = recordTest(result); setStats(newStats); }
    setPhase("result");
  };

  const isMobile = useIsMobile();

  const isLineMode = settings.showLoginSheet !== false;

  const closeSuccess = () => {
    setShowSuccess(false);
    // Open LINE OA if configured (for tracking), then redirect to product
    if (settings.lineOaUrl && !isLineMode) window.open(settings.lineOaUrl, "_blank");
    if (settings.redfingerUrl) window.open(settings.redfingerUrl, "_blank");
  };

  // No-LINE mode: show success first, LINE OA opens after countdown via closeSuccess
  const handleClaimNoLine = () => {
    setShowSuccess(true);
  };

  return (
    <Shell>
      <AnimatePresence mode="wait">
        {phase === "start"  && <StartScreen onStart={() => setPhase("quiz")} stats={stats} fakeCount={fakeCount} coverImage={coverImage} coverContent={coverContent} settings={settings} isMobile={isMobile} types={types} images={images} />}
        {phase === "quiz"   && <QuizScreen questions={questions} questionImages={questionImages} onDone={handleDone} onBack={() => setPhase("start")} isMobile={isMobile} />}
        {phase === "calc"   && <CalcScreen onDone={handleCalc} strings={strings} isMobile={isMobile} result={result} images={images} />}
        {phase === "result" && result && <ResultScreen result={result} equivRefs={equivRefs} onShare={() => { recordShare(); setShowShare(true); }} onPlan={() => setPhase("plan")} onRestart={() => { setResult(null); setPhase("start"); }} strings={strings} isMobile={isMobile} showLineMode={settings.showLoginSheet !== false} />}
        {phase === "plan"   && result && <PlanScreen result={result} cards={cards} cardImages={cardImages} onBack={() => setPhase("result")} onClaim={() => isLineMode ? setShowLogin(true) : handleClaimNoLine()} strings={strings} isMobile={isMobile} />}
      </AnimatePresence>
      <AnimatePresence>{showShare && result && <SharePreview result={result} images={images} strings={strings} onClose={() => setShowShare(false)} showLineMode={settings.showLoginSheet !== false} />}</AnimatePresence>
      <AnimatePresence>{showLogin && <LoginSheet onClose={() => setShowLogin(false)} onSuccess={() => { setShowLogin(false); setShowSuccess(true); }} strings={strings} monthlyWaste={result?.monthlyWaste} lineOaUrl={settings.lineOaUrl} />}</AnimatePresence>
      <AnimatePresence>{showSuccess && <SuccessModal onClose={closeSuccess} strings={strings} autoRedirect={!isLineMode} />}</AnimatePresence>
    </Shell>
  );
}
