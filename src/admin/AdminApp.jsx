import React, { useState, useRef } from "react";
import QRCode from "qrcode";
import {
  DEFAULT_QUESTIONS, DEFAULT_TYPES, DEFAULT_RECOVERY_CARDS,
  DEFAULT_COVER_CONTENT, DEFAULT_SCORING, DEFAULT_COMBO_MAP,
  DEFAULT_SETTINGS, DEFAULT_STRINGS, DEFAULT_EQUIV_REFS,
  syncToServer,
  getStats, getQuestions, saveQuestions, resetQuestions,
  getTypes, saveTypes, resetTypes,
  getRecoveryCards, saveRecoveryCards,
  getUsers, clearUsers,
  getImages, saveImage, removeImage,
  getImagesRaw, saveImageRaw,
  getQuestionImages, saveQuestionImage, removeQuestionImage,
  getCoverImage, saveCoverImage, removeCoverImage,
  getCoverContent, saveCoverContent, resetCoverContent,
  getScoring, saveScoring, resetScoring,
  getComboMap, saveComboMap, resetComboMap,
  getSettings, saveSettings, resetSettings,
  getStrings, saveStrings, resetStrings,
  getEquivRefs, saveEquivRefs,
  getCardImages, saveCardImage, removeCardImage,
  getOverlayLogo, saveOverlayLogo, removeOverlayLogo,
  exportAllData,
} from "../data/store";

/* ─── THEME ─────────────────────────────────────────────────────── */
const S = {
  bg: "#F8FAFC", card: "#FFFFFF", border: "#E2E8F0",
  text: "#0F172A", muted: "#64748B",
  accent: "#FF3D5A", accent2: "#FF6B35",
  green: "#10B981", blue: "#3B82F6", red: "#EF4444",
  purple: "#8B5CF6", orange: "#F59E0B",
};

const MODULES = [
  { key: "dashboard", label: "📊 Dashboard" },
  { key: "cover",     label: "🏠 Cover" },
  { key: "questions", label: "❓ Questions" },
  { key: "types",     label: "🎭 Types" },
  { key: "images",    label: "🖼 Images" },
  { key: "cards",     label: "💳 Cards" },
  { key: "scoring",   label: "🧮 Scoring" },
  { key: "strings",   label: "📝 Strings" },
  { key: "settings",  label: "⚙️ Settings" },
  { key: "data",      label: "📦 Data" },
];

/* ─── STYLE HELPERS ─────────────────────────────────────────────── */
function btn(bg = S.accent, color = "#fff") {
  return { padding: "10px 18px", borderRadius: 10, border: "none", background: bg, color, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all .15s" };
}
function inputStyle(mono = false) {
  return { width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${S.border}`, fontSize: 13, fontFamily: mono ? "monospace" : "inherit", background: "#fff", color: S.text, boxSizing: "border-box" };
}
function cardStyle() {
  return { background: S.card, borderRadius: 14, padding: 18, border: `1px solid ${S.border}`, boxShadow: "0 1px 3px rgba(15,23,42,.06)" };
}
function sectionCard(title, children) {
  return (
    <div style={{ ...cardStyle(), marginBottom: 14 }}>
      <h3 style={{ fontSize: 13, fontWeight: 800, color: S.muted, marginBottom: 12, letterSpacing: .5 }}>{title}</h3>
      {children}
    </div>
  );
}
function SizeHint({ text }) {
  return <span style={{ fontSize: 10, fontWeight: 700, color: S.muted, background: "#F1F5F9", padding: "2px 7px", borderRadius: 6, display: "inline-block", marginTop: 4 }}>📐 {text}</span>;
}
function NumInput({ label, value, onChange, min, step, unit }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>{label}{unit ? <span style={{ color: S.accent }}> ({unit})</span> : ""}</label>
      <input type="number" value={value} min={min} step={step || 1} onChange={e => onChange(+e.target.value)} style={inputStyle()} />
    </div>
  );
}

/* ─── IMAGE HELPERS ──────────────────────────────────────────────── */
function compressImg(dataUrl, maxW, maxH, quality = 0.82) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      let { width: w, height: h } = img;
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      if (h > maxH) { w = Math.round(w * maxH / h); h = maxH; }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = dataUrl;
  });
}

// Save image — uses Cloudinary when configured (production), falls back to local Vite API (dev)
async function saveImageToDisk(folder, filename, dataUrl) {
  const settings = getSettings();
  const cloudName = settings.cloudinaryCloudName?.trim();
  const preset = settings.cloudinaryUploadPreset?.trim();

  // ── Cloudinary path (production) ──────────────────────────────
  if (cloudName && preset) {
    try {
      const publicId = `mpti/${folder}/${filename.replace(/\.[^.]+$/, "")}`;
      const formData = new FormData();
      formData.append("file", dataUrl);
      formData.append("upload_preset", preset);
      formData.append("public_id", publicId);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) return data.secure_url;
    } catch { /* fall through */ }
  }

  // ── Local Vite dev server API (development) ───────────────────
  try {
    const res = await fetch("/api/save-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder, filename, dataUrl }),
    });
    const data = await res.json();
    return data.ok ? data.url : null;
  } catch { return null; }
}

/* ─── OVERLAY COMPOSITING ────────────────────────────────────────────
   Runs in the admin browser — no CORS issues, no mobile tainting.
   The baked Cloudinary URL is then synced to all frontend users.     */
function loadImgAdmin(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function buildShareImageAdmin(src, { overlayText, overlayQrUrl, logoSrc }) {
  const img = await loadImgAdmin(src);
  const W = img.naturalWidth  || img.width;
  const H = img.naturalHeight || img.height;
  const barH = Math.round(H * 0.07);
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, W, H);

  // Logo — top-left, small
  if (logoSrc) {
    try {
      const logoImg = await loadImgAdmin(logoSrc);
      const logoH = Math.round(W * 0.07);
      const logoW = Math.round(logoImg.naturalWidth * (logoH / logoImg.naturalHeight));
      const pad   = Math.round(W * 0.03);
      ctx.drawImage(logoImg, pad, pad, logoW, logoH);
    } catch (_) {}
  }

  // Bottom bar — light gray semi-transparent
  ctx.fillStyle = "rgba(235, 235, 235, 0.72)";
  ctx.fillRect(0, H - barH, W, barH);
  const barY = H - barH;
  const vPad = Math.round(barH * 0.12);
  const hPad = Math.round(barH * 0.10);

  // QR code — right side
  const qrSize = barH - vPad * 2;
  let qrLeftEdge = W - hPad;
  if (overlayQrUrl) {
    try {
      const qrDataUrl = await QRCode.toDataURL(overlayQrUrl, {
        width: qrSize * 2, margin: 1,
        color: { dark: "#1a1a1a", light: "#EBEBEB" },
      });
      const qrImg = await loadImgAdmin(qrDataUrl);
      qrLeftEdge = W - qrSize - hPad;
      ctx.drawImage(qrImg, qrLeftEdge, barY + vPad, qrSize, qrSize);
    } catch (_) {}
  }

  // Text — left of QR, auto-shrink font
  const textAreaW = qrLeftEdge - hPad - 8;
  const textX     = hPad + textAreaW / 2;
  const textY     = barY + barH / 2;
  const text      = overlayText || "";
  let fontSize = barH - vPad * 2;
  ctx.font = `600 ${fontSize}px 'Kanit', 'Noto Sans Thai', sans-serif`;
  while (fontSize > 8 && ctx.measureText(text).width > textAreaW) {
    fontSize -= 1;
    ctx.font = `600 ${fontSize}px 'Kanit', 'Noto Sans Thai', sans-serif`;
  }
  ctx.fillStyle = "#1a1a1a";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, textX, textY);

  return new Promise(resolve => canvas.toBlob(b => resolve(URL.createObjectURL(b)), "image/jpeg", 0.92));
}

// Convert a blob URL → data URL so it can be re-uploaded to Cloudinary
async function blobUrlToDataUrl(blobUrl) {
  const res  = await fetch(blobUrl);
  const blob = await res.blob();
  URL.revokeObjectURL(blobUrl);
  return new Promise(resolve => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.readAsDataURL(blob);
  });
}

// Bake overlay into one image and upload to Cloudinary; returns new URL or null
async function bakeAndUpload(key, rawUrl, settings) {
  const logoSrc = getOverlayLogo() || null;
  const blobUrl = await buildShareImageAdmin(rawUrl, {
    overlayText:  settings.overlayText,
    overlayQrUrl: settings.overlayQrUrl,
    logoSrc,
  });
  const dataUrl = await blobUrlToDataUrl(blobUrl);
  return saveImageToDisk("types", `${key}_baked.jpg`, dataUrl);
}

/* ─── LOGIN ──────────────────────────────────────────────────────── */
function LoginGate({ onAuth }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const submit = () => {
    const stored = getSettings().adminPass;
    if (pw === stored) onAuth(true); else setErr(true);
  };
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: S.bg, fontFamily: "Kanit, system-ui, sans-serif" }}>
      <div style={{ ...cardStyle(), width: "100%", maxWidth: 360, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: S.text }}>MPTI Admin</h2>
        <p style={{ color: S.muted, fontSize: 13, margin: "6px 0 16px" }}>Enter password to access admin panel</p>
        <input type="password" value={pw} onChange={e => { setPw(e.target.value); setErr(false); }}
          onKeyDown={e => e.key === "Enter" && submit()} placeholder="Password" style={{ ...inputStyle(), marginBottom: 10 }} />
        {err && <p style={{ color: S.red, fontSize: 12, margin: "0 0 8px" }}>Wrong password</p>}
        <button onClick={submit} style={{ ...btn(), width: "100%" }}>Login</button>
      </div>
    </div>
  );
}

/* ─── DASHBOARD ──────────────────────────────────────────────────── */
function Dashboard() {
  const stats = getStats();
  const users = getUsers();
  const dist  = stats.types || {};
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]);
  const types  = getTypes();

  const statCards = [
    { label: "Total Tests",   value: stats.total || 0, icon: "🧪", color: S.accent },
    { label: "Total Shares",  value: stats.shares || 0, icon: "📤", color: S.blue },
    { label: "Top Type",      value: sorted[0] ? sorted[0][0] : "—", icon: "🏆", color: S.green },
    { label: "User Records",  value: users.length, icon: "👥", color: S.accent2 },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>📊 Dashboard</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
        {statCards.map(s => (
          <div key={s.label} style={{ ...cardStyle(), borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 11, color: S.muted }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: S.text }}>{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</div>
          </div>
        ))}
      </div>

      {sorted.length > 0 && (
        <div style={{ ...cardStyle(), marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>📈 Type Distribution</h3>
          {sorted.map(([tk, count]) => {
            const t = types[tk];
            const pct = sorted[0][1] > 0 ? (count / sorted[0][1]) * 100 : 0;
            return (
              <div key={tk} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}>
                  <span>{t?.e} {t?.name || tk}</span>
                  <span style={{ color: S.muted }}>{count}</span>
                </div>
                <div style={{ height: 6, background: "#F1F5F9", borderRadius: 3 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: t?.color || S.accent, borderRadius: 3, transition: "width .4s" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={cardStyle()}>
        <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>👥 Recent Users ({users.length})</h3>
        {users.length === 0 ? <p style={{ color: S.muted, fontSize: 13 }}>No data yet</p> : (
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ borderBottom: `1px solid ${S.border}` }}>
                <th style={{ padding: 6, textAlign: "left" }}>Type</th>
                <th style={{ padding: 6, textAlign: "right" }}>฿/month</th>
                <th style={{ padding: 6, textAlign: "right" }}>Date</th>
              </tr></thead>
              <tbody>
                {users.slice(0, 100).map((u, i) => {
                  const t = types[u.typeKey];
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${S.border}` }}>
                      <td style={{ padding: 6 }}>{t?.e} {t?.name || u.typeKey}</td>
                      <td style={{ padding: 6, textAlign: "right" }}>฿{u.monthlyWaste}</td>
                      <td style={{ padding: 6, textAlign: "right", color: S.muted }}>
                        {u.timestamp ? new Date(u.timestamp).toLocaleDateString("th-TH", { day: "numeric", month: "short" }) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── COVER EDITOR ───────────────────────────────────────────────── */
function CoverEditor() {
  const [coverImage, setCoverImage] = useState(() => getCoverImage());
  const [content, setContent] = useState(() => getCoverContent());
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);

  const save = () => { saveCoverContent(content); setSaved(true); syncToServer(); setTimeout(() => setSaved(false), 2000); };
  const reset = () => { if (confirm("Reset cover text to defaults?")) { resetCoverContent(); setContent(DEFAULT_COVER_CONTENT); } };
  const update = (f, v) => setContent(c => ({ ...c, [f]: v }));

  const onFile = e => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      const compressed = await compressImg(ev.target.result, 750, 450, 0.85);
      const diskUrl = await saveImageToDisk("cover", "cover.jpg", compressed);
      const toStore = diskUrl || compressed;
      const ok = saveCoverImage(toStore);
      if (!ok) alert("❌ 储存失败：浏览器储存空间不足，请先删除其他图片再试。");
      else { setCoverImage(toStore); syncToServer(); }
    };
    reader.readAsDataURL(file); e.target.value = "";
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>🏠 Cover Settings</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={reset} style={btn("#F1F5F9", S.muted)}>Reset Text</button>
          <button onClick={save} style={btn()}>{saved ? "✓ Saved!" : "Save Text"}</button>
        </div>
      </div>

      {sectionCard("🖼 Cover Image", (
        <>
          <SizeHint text="推荐尺寸：750×450px（5:3 横版）" />
          <div style={{ marginTop: 10 }}>
            {coverImage ? (
              <div style={{ position: "relative", maxWidth: 340 }}>
                <img src={coverImage} alt="cover" style={{ width: "100%", borderRadius: 12, aspectRatio: "5/3", objectFit: "cover", display: "block" }} />
                <button onClick={() => { if (confirm("Remove cover image?")) { removeCoverImage(); setCoverImage(null); } }}
                  style={{ position: "absolute", top: 6, right: 6, width: 26, height: 26, borderRadius: 13, background: S.red, color: "#fff", border: "none", fontSize: 12, cursor: "pointer" }}>✕</button>
                <button onClick={() => fileRef.current?.click()} style={{ ...btn("#F1F5F9", S.text), marginTop: 6, fontSize: 11 }}>Replace Image</button>
              </div>
            ) : (
              <>
                <div onClick={() => fileRef.current?.click()}
                  style={{ maxWidth: 340, aspectRatio: "5/3", borderRadius: 12, border: `2px dashed ${S.border}`, display: "grid", placeItems: "center", cursor: "pointer", background: "#FAFBFC" }}>
                  <div style={{ textAlign: "center", color: S.muted }}>
                    <div style={{ fontSize: 32 }}>🖼</div>
                    <div style={{ fontSize: 12, marginTop: 6, fontWeight: 700 }}>点击上传封面图片</div>
                    <div style={{ fontSize: 10, marginTop: 2 }}>推荐 750×450px</div>
                  </div>
                </div>
                <button onClick={() => fileRef.current?.click()} style={{ ...btn("#F1F5F9", S.text), marginTop: 8 }}>Upload Image</button>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
          </div>
        </>
      ))}

      {sectionCard("✏️ Cover Text", (
        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Badge（徽章文字）</label>
            <input value={content.badge} onChange={e => update("badge", e.target.value)} style={inputStyle()} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Title Line 1（白色）</label>
              <input value={content.titleLine1} onChange={e => update("titleLine1", e.target.value)} style={inputStyle()} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Title Line 2（红色高亮）</label>
              <input value={content.titleLine2} onChange={e => update("titleLine2", e.target.value)} style={inputStyle()} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>描述第 1 行</label>
              <input value={content.descLine1} onChange={e => update("descLine1", e.target.value)} style={inputStyle()} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>描述第 2 行（测试说明）</label>
              <input value={content.descLine2} onChange={e => update("descLine2", e.target.value)} style={inputStyle()} />
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${S.border}`, paddingTop: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: S.muted, marginBottom: 8 }}>Feature Bullets（三条卖点）</div>
            {["feat1","feat2","feat3"].map((f, i) => (
              <div key={f} style={{ marginBottom: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>卖点 {i+1}</label>
                <input value={content[f]} onChange={e => update(f, e.target.value)} style={inputStyle()} />
              </div>
            ))}
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>CTA Button（开始按钮）</label>
            <input value={content.ctaBtn} onChange={e => update("ctaBtn", e.target.value)} style={inputStyle()} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Footer Note（底部说明）</label>
            <input value={content.footer} onChange={e => update("footer", e.target.value)} style={inputStyle()} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── QUESTIONS EDITOR ───────────────────────────────────────────── */
function QuestionsEditor() {
  const [questions, setQuestions] = useState(() => getQuestions());
  const [qImages, setQImages] = useState(() => getQuestionImages());
  const [editing, setEditing] = useState(null);
  const [saved, setSaved] = useState(false);
  const [uploadingQid, setUploadingQid] = useState(null);
  const uploadingQidRef = useRef(null);
  const fileRef = useRef(null);

  const save = () => { saveQuestions(questions); setSaved(true); syncToServer(); setTimeout(() => setSaved(false), 2000); };
  const reset = () => { if (confirm("Reset all questions to defaults?")) { resetQuestions(); setQuestions(DEFAULT_QUESTIONS); } };
  const updateQ = (qid, field, val) => setQuestions(qs => qs.map(q => q.id === qid ? { ...q, [field]: val } : q));
  const updateOpt = (qid, oi, field, val) => {
    setQuestions(qs => qs.map(q => {
      if (q.id !== qid) return q;
      const opts = [...q.opts]; opts[oi] = { ...opts[oi], [field]: val };
      return { ...q, opts };
    }));
  };

  const triggerImgUpload = qid => {
    uploadingQidRef.current = qid;
    setUploadingQid(qid);
    fileRef.current?.click();
  };
  const onFile = e => {
    const file = e.target.files?.[0];
    const qid = uploadingQidRef.current;
    if (!file || !qid) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      const compressed = await compressImg(ev.target.result, 600, 450, 0.82);
      const diskUrl = await saveImageToDisk("questions", `q${qid}.jpg`, compressed);
      const toStore = diskUrl || compressed;
      const ok = saveQuestionImage(qid, toStore);
      if (!ok) { alert("❌ 储存失败：浏览器储存空间不足，请先删除其他图片再试。"); }
      else { setQImages(prev => ({ ...prev, [String(qid)]: toStore })); }
      uploadingQidRef.current = null;
      setUploadingQid(null);
    };
    reader.readAsDataURL(file); e.target.value = "";
  };
  const removeQImg = qid => {
    if (!confirm(`Remove image for Q${qid}?`)) return;
    removeQuestionImage(qid);
    setQImages(prev => { const n = { ...prev }; delete n[String(qid)]; return n; });
  };

  const dims = ["AP","HL","SK","MC"];
  const dimLabels = { AP:"💡 Aware vs Passive", HL:"💰 High vs Low", SK:"📱 Switch vs Keep", MC:"🗂 Messy vs Clean" };

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>❓ Questions Editor</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={reset} style={btn("#F1F5F9", S.muted)}>Reset Defaults</button>
          <button onClick={save} style={btn()}>{saved ? "✓ Saved!" : "Save Changes"}</button>
        </div>
      </div>

      {dims.map(dim => (
        <div key={dim} style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: S.accent, marginBottom: 10 }}>{dimLabels[dim]}</h3>
          {questions.filter(q => q.dim === dim).map(q => {
            const qImg = qImages[String(q.id)];
            return (
              <div key={q.id} style={{ ...cardStyle(), marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: S.muted }}>Q{q.id} · {q.dim}</span>
                    {q.type === "open-amount"
                      ? <span style={{ fontSize: 10, fontWeight: 700, color: S.blue, background: "#EFF6FF", padding: "2px 7px", borderRadius: 6 }}>🔢 开放输入</span>
                      : <span style={{ fontSize: 10, fontWeight: 700, color: S.muted, background: "#F1F5F9", padding: "2px 7px", borderRadius: 6 }}>📋 选择题</span>
                    }
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {qImg
                      ? <span style={{ fontSize: 10, fontWeight: 700, color: S.green, background: "#ECFDF5", padding: "2px 7px", borderRadius: 6 }}>📷 有图</span>
                      : <span style={{ fontSize: 10, fontWeight: 700, color: S.muted, background: "#F1F5F9", padding: "2px 7px", borderRadius: 6 }}>无图</span>
                    }
                    <button onClick={() => setEditing(editing === q.id ? null : q.id)}
                      style={{ ...btn("#F1F5F9", S.text), padding: "4px 10px", fontSize: 11 }}>
                      {editing === q.id ? "Close" : "Edit"}
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{q.th}</div>
                <div style={{ fontSize: 11, color: S.muted }}>{q.en}</div>

                {editing === q.id && (
                  <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Thai text</label>
                      <input value={q.th} onChange={e => updateQ(q.id, "th", e.target.value)} style={inputStyle()} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>English text</label>
                      <input value={q.en} onChange={e => updateQ(q.id, "en", e.target.value)} style={inputStyle()} />
                    </div>

                    {/* Question type selector */}
                    <div style={{ background: "#F8FAFC", borderRadius: 8, padding: 10, border: `1px solid ${S.border}` }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: S.muted, marginBottom: 8 }}>Question Type:</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {[["choice","📋 选择题"],["open-amount","🔢 开放输入金额"]].map(([t, label]) => (
                          <button key={t} onClick={() => updateQ(q.id, "type", t)}
                            style={{ ...btn(q.type === t ? S.blue : "#E2E8F0", q.type === t ? "#fff" : S.text), padding: "6px 14px", fontSize: 12 }}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {q.type === "open-amount" ? (
                      /* Open-amount config */
                      <div style={{ background: "#EFF6FF", borderRadius: 8, padding: 10, border: `1px solid #BFDBFE`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Unit（单位前缀，如 ฿）</label>
                          <input value={q.unit || "฿"} onChange={e => updateQ(q.id, "unit", e.target.value)} style={inputStyle()} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Placeholder（示例文字）</label>
                          <input value={q.placeholder || ""} onChange={e => updateQ(q.id, "placeholder", e.target.value)} style={inputStyle()} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Dimension Threshold（≥ 此值得高分）</label>
                          <input type="number" value={q.dimThresh || 0} onChange={e => updateQ(q.id, "dimThresh", +e.target.value)} style={inputStyle()} min={0} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Max Value 上限（超过此值按上限计算，0=无上限）</label>
                          <input type="number" value={q.maxVal || 0} onChange={e => updateQ(q.id, "maxVal", +e.target.value || undefined)} style={inputStyle()} min={0} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Price Key（带入计价公式的变量）</label>
                          <select value={q.priceKey || "none"} onChange={e => updateQ(q.id, "priceKey", e.target.value === "none" ? "" : e.target.value)}
                            style={{ ...inputStyle(), cursor: "pointer" }}>
                            <option value="none">— 不带入公式 —</option>
                            <option value="planCost">planCost（月套餐费）</option>
                            <option value="phoneCost">phoneCost（手机价格）</option>
                            <option value="phoneYears">phoneYears（使用年数）</option>
                          </select>
                        </div>
                        <p style={{ gridColumn: "1/-1", fontSize: 11, color: S.blue, margin: 0 }}>
                          💡 用户输入的数值将直接用于计价计算，维度判断以 Threshold 为界。
                        </p>
                      </div>
                    ) : (
                      /* Choice options editor */
                      <>
                        <div style={{ fontSize: 12, fontWeight: 800, color: S.muted, marginTop: 4 }}>Options:</div>
                        {q.opts.map((opt, oi) => (
                          <div key={oi} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 50px", gap: 6, alignItems: "center" }}>
                            <input value={opt.th} onChange={e => updateOpt(q.id, oi, "th", e.target.value)} placeholder="Thai" style={inputStyle()} />
                            <input value={opt.en} onChange={e => updateOpt(q.id, oi, "en", e.target.value)} placeholder="English" style={inputStyle()} />
                            <span style={{ fontSize: 12, fontWeight: 800, textAlign: "center", color: ["A","H","S","M"].includes(opt.s) ? S.accent : S.blue }}>{opt.s}</span>
                          </div>
                        ))}
                      </>
                    )}
                    <div style={{ borderTop: `1px solid ${S.border}`, paddingTop: 10, marginTop: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div>
                          <span style={{ fontSize: 12, fontWeight: 800, color: S.muted }}>Question Image</span>
                          <div style={{ marginTop: 3 }}><SizeHint text="600×450px（4:3 横版）" /></div>
                        </div>
                        {qImg && <button onClick={() => removeQImg(q.id)} style={{ ...btn(S.red), padding: "4px 10px", fontSize: 11 }}>Remove</button>}
                      </div>
                      {qImg ? (
                        <>
                          <img src={qImg} alt={`Q${q.id}`} style={{ width: "100%", borderRadius: 10, aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                          <button onClick={() => triggerImgUpload(q.id)} style={{ ...btn("#F1F5F9", S.text), marginTop: 6, fontSize: 11 }}>Replace Image</button>
                        </>
                      ) : (
                        <div onClick={() => triggerImgUpload(q.id)}
                          style={{ aspectRatio: "4/3", borderRadius: 10, border: `2px dashed ${S.border}`, display: "grid", placeItems: "center", cursor: "pointer", background: "#FAFBFC" }}>
                          <div style={{ textAlign: "center", color: S.muted }}>
                            <div style={{ fontSize: 24 }}>📷</div>
                            <div style={{ fontSize: 10, marginTop: 4 }}>点击上传题目图片</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ─── TYPES EDITOR ───────────────────────────────────────────────── */
function TypesEditor() {
  const [types, setTypes] = useState(() => getTypes());
  const [editing, setEditing] = useState(null);
  const [saved, setSaved] = useState(false);

  const save = () => { saveTypes(types); setSaved(true); syncToServer(); setTimeout(() => setSaved(false), 2000); };
  const reset = () => { if (confirm("Reset all types to defaults?")) { resetTypes(); setTypes(DEFAULT_TYPES); } };
  const updateType = (key, field, val) => setTypes(ts => ({ ...ts, [key]: { ...ts[key], [field]: val } }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>🎭 Types Editor ({Object.keys(types).length})</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={reset} style={btn("#F1F5F9", S.muted)}>Reset</button>
          <button onClick={save} style={btn()}>{saved ? "✓ Saved!" : "Save"}</button>
        </div>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {Object.entries(types).map(([key, t]) => (
          <div key={key} style={{ ...cardStyle(), borderLeft: `3px solid ${t.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 20 }}>{t.e}</span>
                <span style={{ fontSize: 16, fontWeight: 900, marginLeft: 8, color: t.color }}>{t.name}</span>
                <span style={{ fontSize: 12, color: S.muted, marginLeft: 8 }}>{t.th}</span>
              </div>
              <button onClick={() => setEditing(editing === key ? null : key)} style={{ ...btn("#F1F5F9", S.text), padding: "4px 10px", fontSize: 11 }}>
                {editing === key ? "Close" : "Edit"}
              </button>
            </div>
            <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>฿{t.min}–{t.max}/month · {t.equivTh}</div>
            {editing === key && (
              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["Name","name"],["Emoji","e"],["Thai label","th"],["English label","en"]].map(([label,f]) => (
                  <div key={f}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>{label}</label>
                    <input value={t[f]} onChange={e => updateType(key, f, e.target.value)} style={inputStyle()} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Min ฿/month</label>
                  <input type="number" value={t.min} onChange={e => updateType(key, "min", +e.target.value)} style={inputStyle()} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Max ฿/month</label>
                  <input type="number" value={t.max} onChange={e => updateType(key, "max", +e.target.value)} style={inputStyle()} />
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Tagline (Thai)</label>
                  <input value={t.tagTh} onChange={e => updateType(key, "tagTh", e.target.value)} style={inputStyle()} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Equivalent (Thai)</label>
                  <input value={t.equivTh} onChange={e => updateType(key, "equivTh", e.target.value)} style={inputStyle()} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Color</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input type="color" value={t.color} onChange={e => updateType(key, "color", e.target.value)} style={{ width: 40, height: 36, border: "none", cursor: "pointer" }} />
                    <input value={t.color} onChange={e => updateType(key, "color", e.target.value)} style={inputStyle()} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── IMAGE MANAGER ──────────────────────────────────────────────── */
function ImageManager() {
  const [images, setImages] = useState(() => getImages());
  const types = getTypes();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(null);
  const [status, setStatus] = useState("");

  const handleUpload = key => { setUploading(key); fileRef.current?.click(); };
  const onFile = e => {
    const file = e.target.files?.[0]; if (!file || !uploading) return;
    const key = uploading;
    const reader = new FileReader();
    reader.onload = async ev => {
      setStatus(`上传 ${key}…`);
      const compressed = await compressImg(ev.target.result, 540, 960, 0.82);
      const rawDiskUrl = await saveImageToDisk("types", `${key}.jpg`, compressed);
      const rawUrl = rawDiskUrl || compressed;

      // Always persist the original (pre-overlay) URL for future re-baking
      saveImageRaw(key, rawUrl);

      // Auto-bake overlay if fully configured
      let finalUrl = rawUrl;
      const settings = getSettings();
      if (settings.overlayEnabled && settings.overlayQrUrl) {
        setStatus(`合成 ${key}…`);
        try {
          const bakedUrl = await bakeAndUpload(key, rawUrl, settings);
          if (bakedUrl) finalUrl = bakedUrl;
        } catch (_) { /* fall back to raw */ }
      }

      const ok = saveImage(key, finalUrl);
      if (!ok) alert("❌ 储存失败：浏览器储存空间不足，请先删除其他图片再试。");
      else setImages(prev => ({ ...prev, [key]: finalUrl }));
      setUploading(null);
      setStatus("");
      syncToServer(); // push image URL mapping to JSONBin
    };
    reader.readAsDataURL(file); e.target.value = "";
  };
  const handleRemove = key => {
    if (!confirm(`Remove image for ${key}?`)) return;
    removeImage(key); const n = { ...images }; delete n[key]; setImages(n);
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>🖼 Image Manager</h2>
      <p style={{ color: S.muted, fontSize: 13, marginBottom: 4 }}>为每种人格类型上传海报图片。如果后台已配置 Overlay，上传时会自动合成。</p>
      <div style={{ marginBottom: 16 }}><SizeHint text="实际储存尺寸：540×960px（9:16 竖版海报）" /></div>
      {status && <div style={{ padding: "8px 14px", background: "#EFF6FF", borderRadius: 8, fontSize: 12, fontWeight: 700, color: S.blue, marginBottom: 12 }}>⏳ {status}</div>}
      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
        {Object.entries(types).map(([key, t]) => {
          const img = images[key];
          return (
            <div key={key} style={{ ...cardStyle(), textAlign: "center", padding: 12 }}>
              {img ? (
                <div style={{ position: "relative", marginBottom: 8 }}>
                  <img src={img} alt={t.name} style={{ width: "100%", borderRadius: 10, aspectRatio: "9/16", objectFit: "cover" }} />
                  <button onClick={() => handleRemove(key)} style={{ position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: 12, background: S.red, color: "#fff", border: "none", fontSize: 12, cursor: "pointer" }}>✕</button>
                </div>
              ) : (
                <div onClick={() => handleUpload(key)} style={{ aspectRatio: "9/16", borderRadius: 10, border: `2px dashed ${S.border}`, display: "grid", placeItems: "center", cursor: "pointer", marginBottom: 8, background: "#FAFBFC" }}>
                  <div style={{ textAlign: "center", color: S.muted }}>
                    <div style={{ fontSize: 28 }}>📷</div>
                    <div style={{ fontSize: 10, marginTop: 4 }}>Click to upload</div>
                  </div>
                </div>
              )}
              <div style={{ fontSize: 18 }}>{t.e}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: t.color }}>{t.name}</div>
              <div style={{ marginTop: 4 }}><SizeHint text="540×960px (9:16)" /></div>
              {!img && <button onClick={() => handleUpload(key)} style={{ ...btn("#F1F5F9", S.text), padding: "6px 12px", fontSize: 11, marginTop: 6, width: "100%" }}>Upload</button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── CARDS EDITOR ───────────────────────────────────────────────── */
function CardsEditor() {
  const [cards, setCards] = useState(() => getRecoveryCards());
  const [cardImgs, setCardImgs] = useState(() => getCardImages());
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);
  const uploadingNoRef = useRef(null);

  const save = () => { saveRecoveryCards(cards); setSaved(true); syncToServer(); setTimeout(() => setSaved(false), 2000); };
  const reset = () => { if (confirm("Reset?")) { setCards(DEFAULT_RECOVERY_CARDS); saveRecoveryCards(DEFAULT_RECOVERY_CARDS); } };
  const update = (i, f, v) => setCards(cs => cs.map((c, ci) => ci === i ? { ...c, [f]: v } : c));

  const triggerUpload = no => { uploadingNoRef.current = no; fileRef.current?.click(); };

  const onFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const no = uploadingNoRef.current;
    const reader = new FileReader();
    reader.onload = async ev => {
      const compressed = await compressImg(ev.target.result, 640, 360, 0.82);
      const diskUrl = await saveImageToDisk("cards", `card${no}.jpg`, compressed);
      const url = diskUrl || compressed;
      saveCardImage(no, url);
      setCardImgs(prev => ({ ...prev, [no]: url }));
      syncToServer(); // push card image URL to JSONBin
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeImg = no => { removeCardImage(no); setCardImgs(prev => { const n = { ...prev }; delete n[no]; return n; }); };

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFile} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>💳 Recovery Cards Editor</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={reset} style={btn("#F1F5F9", S.muted)}>Reset</button>
          <button onClick={save} style={btn()}>{saved ? "✓ Saved!" : "Save"}</button>
        </div>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {cards.map((card, i) => {
          const img = cardImgs[card.no];
          return (
            <div key={i} style={cardStyle()}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 28 }}>{card.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 800 }}>Card {card.no}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Icon (emoji)</label><input value={card.icon} onChange={e => update(i,"icon",e.target.value)} style={inputStyle()} /></div>
                <div><label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>No.</label><input value={card.no} onChange={e => update(i,"no",e.target.value)} style={inputStyle()} /></div>
                <div style={{ gridColumn:"1/-1" }}><label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Title (\n = line break)</label><input value={card.title} onChange={e => update(i,"title",e.target.value)} style={inputStyle()} /></div>
                <div style={{ gridColumn:"1/-1" }}><label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Body (Thai)</label><input value={card.bodyTh} onChange={e => update(i,"bodyTh",e.target.value)} style={inputStyle()} /></div>
                <div><label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Save ratio (0–1, e.g. 0.65)</label><input type="number" min="0" max="1" step="0.05" value={card.saveRatio ?? ""} onChange={e => update(i,"saveRatio",parseFloat(e.target.value)||0)} style={inputStyle()} /><div style={{ fontSize: 10, color: S.muted, marginTop: 3 }}>= 用户浪费额 × 比例，留空则用 save 字段固定文字</div></div>
                <div><label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Save text (固定文字，saveRatio 优先)</label><input value={card.save ?? ""} onChange={e => update(i,"save",e.target.value)} style={inputStyle()} /></div>
                <div><label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Tags (comma separated)</label><input value={card.tags.join(", ")} onChange={e => update(i,"tags",e.target.value.split(",").map(t=>t.trim()).filter(Boolean))} style={inputStyle()} /></div>
                <div style={{ gridColumn:"1/-1", borderTop: `1px solid ${S.border}`, paddingTop: 10, marginTop: 2 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: S.muted }}>Card Image</span>
                      <div style={{ marginTop: 3 }}><SizeHint text="640×360px（16:9 横版）" /></div>
                    </div>
                    {img && <button onClick={() => removeImg(card.no)} style={{ ...btn(S.red), padding: "4px 10px", fontSize: 11 }}>Remove</button>}
                  </div>
                  {img ? (
                    <>
                      <img src={img} alt={`Card ${card.no}`} style={{ width: "100%", borderRadius: 10, aspectRatio: "16/9", objectFit: "cover", display: "block" }} />
                      <button onClick={() => triggerUpload(card.no)} style={{ ...btn("#F1F5F9", S.text), marginTop: 6, fontSize: 11 }}>Replace Image</button>
                    </>
                  ) : (
                    <div onClick={() => triggerUpload(card.no)}
                      style={{ aspectRatio: "16/9", borderRadius: 10, border: `2px dashed ${S.border}`, display: "grid", placeItems: "center", cursor: "pointer", background: "#FAFBFC" }}>
                      <div style={{ textAlign: "center", color: S.muted }}>
                        <div style={{ fontSize: 24 }}>📷</div>
                        <div style={{ fontSize: 10, marginTop: 4 }}>点击上传卡片图片</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── SCORING EDITOR ─────────────────────────────────────────────── */
function ScoringEditor() {
  const [sc, setSc] = useState(() => getScoring());
  const [comboMap, setComboMap] = useState(() => getComboMap());
  const [saved, setSaved] = useState(false);
  const [savedCombo, setSavedCombo] = useState(false);

  const saveAll = () => { saveScoring(sc); setSaved(true); syncToServer(); setTimeout(() => setSaved(false), 2000); };
  const resetAll = () => { if (confirm("Reset scoring to defaults?")) { resetScoring(); setSc(getScoring()); } };
  const saveCombo = () => { saveComboMap(comboMap); setSavedCombo(true); syncToServer(); setTimeout(() => setSavedCombo(false), 2000); };
  const resetCombo = () => { if (confirm("Reset combo map to defaults?")) { resetComboMap(); setComboMap(DEFAULT_COMBO_MAP); } };

  const upSc = (f, v) => setSc(s => ({ ...s, [f]: v }));
  const upDis = (f, v) => setSc(s => ({ ...s, disambig: { ...s.disambig, [f]: v } }));
  const upCombo = (k, v) => setComboMap(m => ({ ...m, [k]: v }));

  const typeKeys = Object.keys(DEFAULT_TYPES);
  const ALL_COMBOS = ["AHSM","AHSC","AHKM","AHKC","ALSM","ALSC","ALKM","ALKC","PHSM","PHSC","PHKM","PHKC","PLSM","PLSC","PLKM","PLKC"];
  const DISAMBIG_COMBOS = new Set(["AHKM","AHSC","PHKM","PHKC","PLKM","ALKC"]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>🧮 Scoring & Pricing Logic</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={resetAll} style={btn("#F1F5F9", S.muted)}>Reset</button>
          <button onClick={saveAll} style={btn()}>{saved ? "✓ Saved!" : "Save Scoring"}</button>
        </div>
      </div>

      {/* Formula preview */}
      <div style={{ ...cardStyle(), marginBottom: 14, background: "#0F172A", color: "#E2E8F0" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", letterSpacing: 1, marginBottom: 8 }}>💡 FORMULA</div>
        <div style={{ fontFamily: "monospace", fontSize: 12, lineHeight: 2 }}>
          <span style={{ color: "#F59E0B" }}>waste</span> = planCost + <span style={{ color: "#60A5FA" }}>subEstimate</span> + <span style={{ color: "#34D399" }}>dataOverage</span> + depreciation − baseline<br/>
          <span style={{ color: "#A78BFA" }}>depreciation</span> = phoneCost ÷ (phoneYears × 12)<br/>
          <span style={{ color: "#F87171" }}>result</span> = round(<span style={{ color: "#F59E0B" }}>waste</span>, roundTo)
        </div>
      </div>

      {sectionCard("📏 Dimension Score Thresholds", (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <NumInput label="A/P threshold (A if score ≥ X)" value={sc.threshAP} onChange={v => upSc("threshAP", v)} min={1} />
          <NumInput label="H/L threshold (H if score ≥ X)" value={sc.threshHL} onChange={v => upSc("threshHL", v)} min={1} />
          <NumInput label="S/K threshold (S if score ≥ X)" value={sc.threshSK} onChange={v => upSc("threshSK", v)} min={1} />
          <NumInput label="M/C threshold (M if score ≥ X)" value={sc.threshMC} onChange={v => upSc("threshMC", v)} min={1} />
        </div>
      ))}

      {sectionCard("💰 Default Cost Baselines（题目无数值时使用）", (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <NumInput label="Default plan cost" value={sc.defaultPlanCost} onChange={v => upSc("defaultPlanCost", v)} unit="฿" />
          <NumInput label="Default phone cost" value={sc.defaultPhoneCost} onChange={v => upSc("defaultPhoneCost", v)} unit="฿" />
          <NumInput label="Default phone years" value={sc.defaultPhoneYears} onChange={v => upSc("defaultPhoneYears", v)} step={0.5} unit="yr" />
        </div>
      ))}

      {sectionCard("📊 Monthly Estimates（每月费用估算）", (
        <>
          <div style={{ fontSize: 11, color: S.muted, marginBottom: 10 }}>
            subEstimate = H ≥ threshHL → subHigh，否则 subLow<br/>
            dataOverage = Q8 选 H → dataHigh，否则 dataLow<br/>
            baseline = L ≥ threshHL → baselineL，否则 baselineH（从总数扣除）
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <NumInput label="Subscription estimate (High)" value={sc.subHigh} onChange={v => upSc("subHigh", v)} unit="฿/mo" />
            <NumInput label="Subscription estimate (Low)" value={sc.subLow} onChange={v => upSc("subLow", v)} unit="฿/mo" />
            <NumInput label="Data overage (Q8 = H)" value={sc.dataHigh} onChange={v => upSc("dataHigh", v)} unit="฿/mo" />
            <NumInput label="Data overage (Q8 = L)" value={sc.dataLow} onChange={v => upSc("dataLow", v)} unit="฿/mo" />
            <NumInput label="Baseline deduction (L spender)" value={sc.baselineL} onChange={v => upSc("baselineL", v)} unit="฿" />
            <NumInput label="Baseline deduction (H spender)" value={sc.baselineH} onChange={v => upSc("baselineH", v)} unit="฿" />
          </div>
        </>
      ))}

      {sectionCard("🎯 Result Rounding", (
        <div style={{ maxWidth: 240 }}>
          <NumInput label="Round final result to nearest N baht" value={sc.roundTo} onChange={v => upSc("roundTo", v)} min={1} unit="฿" />
        </div>
      ))}

      {sectionCard("🔀 Disambiguation Rules（特殊组合覆盖规则）", (
        <>
          <div style={{ fontSize: 11, color: S.muted, marginBottom: 12, lineHeight: 1.8 }}>
            当 combo 落入特定组合时，以下规则会覆盖 Combo Map 的基础映射：<br/>
            <b>AHKM / PHKM</b>：H ≥ X → ADDONKING（稀有）；else q8=H → DATABURNER（稀有）；else SUCKER<br/>
            <b>AHSC</b>：phoneCost &gt; X → OVERKILL（稀有）；否则 FLEXER<br/>
            <b>PHKC</b>：P ≥ X → BABY（稀有）；否则 SUBSCRIBER<br/>
            <b>PLKM</b>：P ≥ X → LOST（稀有）；M ≥ X → GHOSTUSER（稀有）；否则 HOARDER<br/>
            <b>ALKC</b>：L ≥ X → CHEAPO；否则 TRYHARD
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <NumInput label="AHKM/PHKM → ADDONKING if H score ≥" value={sc.disambig.AHKM_addOnThresh} onChange={v => { upDis("AHKM_addOnThresh", v); upDis("PHKM_addOnThresh", v); }} min={1} />
            <NumInput label="AHSC → OVERKILL if phoneCost >" value={sc.disambig.AHSC_priceThresh} onChange={v => upDis("AHSC_priceThresh", v)} unit="฿" min={1} />
            <NumInput label="PHKC → BABY if P score ≥" value={sc.disambig.PHKC_pThresh} onChange={v => upDis("PHKC_pThresh", v)} min={1} />
            <NumInput label="PLKM → LOST if P score ≥" value={sc.disambig.PLKM_pThresh} onChange={v => upDis("PLKM_pThresh", v)} min={1} />
            <NumInput label="PLKM → GHOSTUSER if M score ≥" value={sc.disambig.PLKM_mThresh} onChange={v => upDis("PLKM_mThresh", v)} min={1} />
            <NumInput label="ALKC → CHEAPO if L score ≥" value={sc.disambig.ALKC_lThresh} onChange={v => upDis("ALKC_lThresh", v)} min={1} />
          </div>
        </>
      ))}

      {/* Combo Map */}
      <div style={{ ...cardStyle(), marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h3 style={{ fontSize: 13, fontWeight: 800, color: S.muted, letterSpacing: .5 }}>🗺 COMBO MAP（16 维度组合 → 人格类型）</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={resetCombo} style={{ ...btn("#F1F5F9", S.muted), padding: "6px 12px", fontSize: 11 }}>Reset</button>
            <button onClick={saveCombo} style={{ ...btn(S.purple), padding: "6px 12px", fontSize: 11 }}>{savedCombo ? "✓ Saved!" : "Save Combo"}</button>
          </div>
        </div>
        <div style={{ fontSize: 11, color: S.muted, marginBottom: 12 }}>
          标 ⚠️ 的组合有消歧规则，Combo Map 的设定可能被上方规则覆盖。
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 8 }}>
          {ALL_COMBOS.map(combo => (
            <div key={combo} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 13, minWidth: 46, color: S.text }}>
                {combo}
                {DISAMBIG_COMBOS.has(combo) && <span style={{ color: S.orange, marginLeft: 3 }}>⚠️</span>}
              </span>
              <span style={{ color: S.muted, fontSize: 12 }}>→</span>
              <select value={comboMap[combo] || "SUCKER"} onChange={e => upCombo(combo, e.target.value)}
                style={{ flex: 1, padding: "6px 8px", borderRadius: 7, border: `1px solid ${S.border}`, fontSize: 12, background: "#fff", cursor: "pointer" }}>
                {typeKeys.map(tk => <option key={tk} value={tk}>{tk}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── STRINGS EDITOR ─────────────────────────────────────────────── */
function StringsEditor() {
  const [str, setStr] = useState(() => getStrings());
  const [saved, setSaved] = useState(false);
  const [refs, setRefs] = useState(() => getEquivRefs());
  const [refSaved, setRefSaved] = useState(false);

  const save = () => { saveStrings(str); setSaved(true); syncToServer(); setTimeout(() => setSaved(false), 2000); };
  const reset = () => { if (confirm("Reset all UI strings to defaults?")) { resetStrings(); setStr(DEFAULT_STRINGS); } };
  const upStr = (f, v) => setStr(s => ({ ...s, [f]: v }));

  const saveRefs = () => { saveEquivRefs(refs); setRefSaved(true); syncToServer(); setTimeout(() => setRefSaved(false), 2000); };
  const resetRefs = () => { if (confirm("Reset to defaults?")) { setRefs(DEFAULT_EQUIV_REFS); saveEquivRefs(DEFAULT_EQUIV_REFS); } };
  const upRef = (i, field, val) => setRefs(r => r.map((x, j) => j === i ? { ...x, [field]: field === "price" ? +val : val } : x));
  const addRef = () => setRefs(r => [...r, { label: "ชื่อ", price: 100 }]);
  const removeRef = i => setRefs(r => r.filter((_, j) => j !== i));

  const field = (label, key, mono = false) => (
    <div key={key}>
      <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>{label}</label>
      <input value={str[key] ?? ""} onChange={e => upStr(key, e.target.value)} style={inputStyle(mono)} />
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>📝 UI Strings Editor</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={reset} style={btn("#F1F5F9", S.muted)}>Reset All</button>
          <button onClick={save} style={btn()}>{saved ? "✓ Saved!" : "Save Strings"}</button>
        </div>
      </div>

      {sectionCard("⏳ Calc Screen（Loading Messages）", (
        <div style={{ display: "grid", gap: 8 }}>
          {field("Message 1", "calcMsg1")}
          {field("Message 2", "calcMsg2")}
          {field("Message 3", "calcMsg3")}
          {field("Message 4", "calcMsg4")}
        </div>
      ))}

      {sectionCard("📊 Result Screen", (
        <div style={{ display: "grid", gap: 8 }}>
          {field("Result label (header)", "resultLabel")}
          {field("Waste label (above amount)", "wasteLabel")}
          {field("Per month suffix", "perMonth")}
          {field("Per year suffix", "perYear")}
          {field("分享按钮（LINE 模式开启）", "shareBtn")}
          {field("分享按钮（LINE 模式关闭）", "shareBtnNoLine")}
          {field("长按提示（LINE 模式开启）", "shareLongPress")}
          {field("长按提示（LINE 模式关闭）", "shareLongPressNoLine")}
          {field("Share modal — desktop copy button", "shareCopyBtn")}
          {field("Plan CTA button", "planCtaBtn")}
        </div>
      ))}

      {sectionCard("🔄 Equiv References（≈ 换算参考）", (
        <div>
          <p style={{ fontSize: 12, color: S.muted, marginBottom: 10 }}>
            系统会根据月亏损金额自动选出最合适的参考项显示「≈ X เดือน Netflix」。
          </p>
          {refs.map((ref, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 100px 32px", gap: 6, marginBottom: 6, alignItems: "center" }}>
              <input value={ref.label} onChange={e => upRef(i, "label", e.target.value)}
                placeholder="ชื่อ" style={inputStyle()} />
              <input type="number" value={ref.price} onChange={e => upRef(i, "price", e.target.value)}
                placeholder="ราคา" style={inputStyle()} />
              <button onClick={() => removeRef(i)} style={{ ...btn(S.red), padding: "8px 10px" }}>✕</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={addRef} style={btn("#F1F5F9", S.text)}>+ เพิ่ม</button>
            <button onClick={resetRefs} style={btn("#F1F5F9", S.muted)}>Reset</button>
            <button onClick={saveRefs} style={btn(S.green)}>{refSaved ? "✓ Saved!" : "Save Refs"}</button>
          </div>
        </div>
      ))}

      {sectionCard("🎯 Plan / Recovery Screen", (
        <div style={{ display: "grid", gap: 8 }}>
          {field("Recovery title", "recoveryTitle")}
          {field("Subtitle prefix（เอาเงิน）", "recoverySubtitle")}
          {field("Subtitle suffix（คืน!）", "recoverySuffix")}
          {field("Swipe hint text", "recoveryHint")}
          {field("Card CTA button", "planCardBtn")}
          {field("Footer note", "planFooter")}
        </div>
      ))}

      {sectionCard("🔒 Login Sheet", (
        <div style={{ display: "grid", gap: 8 }}>
          {field("Title", "loginTitle")}
          {field("Subtitle", "loginSubtitle")}
          {field("LINE button text", "loginLineBtn")}
          {field("Email button text", "loginEmailBtn")}
          {field("Privacy bullet 1", "loginPrivacy1")}
          {field("Privacy bullet 2", "loginPrivacy2")}
          {field("Privacy bullet 3", "loginPrivacy3")}
        </div>
      ))}

      {sectionCard("🔁 Result Screen", (
        <div style={{ display: "grid", gap: 8 }}>
          {field("Restart / retake button", "restartBtn")}
        </div>
      ))}

      {sectionCard("✅ Success Modal", (
        <div style={{ display: "grid", gap: 8 }}>
          {field("Title", "successTitle")}
          {field("Subtitle", "successSubtitle")}
          {field("CTA button", "successCta")}
        </div>
      ))}
    </div>
  );
}

/* ─── SETTINGS EDITOR ────────────────────────────────────────────── */
/* ─── OVERLAY SETTINGS SUB-COMPONENT ────────────────────────────── */
function OverlaySettings({ settings, upSetting }) {
  const logoRef = useRef();
  const [logo, setLogo] = useState(() => getOverlayLogo());
  const [rebaking, setRebaking] = useState(false);
  const [rebakeLog, setRebakeLog] = useState([]);

  const handleLogoUpload = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target.result;
      saveOverlayLogo(dataUrl);
      setLogo(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const reBakeAll = async () => {
    if (!settings.overlayEnabled) { alert("请先开启 Overlay"); return; }
    if (!settings.overlayQrUrl)   { alert("请先填写二维码 URL 并保存 Settings"); return; }
    setRebaking(true);
    setRebakeLog([]);
    const log = [];
    const push = msg => { log.push(msg); setRebakeLog([...log]); };

    const images    = getImages();
    const rawImages = getImagesRaw();
    const settingsNow = getSettings(); // re-read to get latest saved settings

    for (const [key, url] of Object.entries(images)) {
      if (!url || key === "__overlay_logo__") continue;
      const srcUrl = rawImages[key] || url; // prefer stored raw; fall back to current
      push(`合成 ${key}…`);
      try {
        const bakedUrl = await bakeAndUpload(key, srcUrl, settingsNow);
        if (bakedUrl) {
          saveImageRaw(key, srcUrl);  // preserve original for future re-bakes
          saveImage(key, bakedUrl);
          push(`✓ ${key}`);
        } else {
          push(`✗ ${key}：上传失败`);
        }
      } catch (err) {
        push(`✗ ${key}：${err.message || "合成失败"}`);
      }
    }

    await syncToServer();
    push("✅ 全部完成！前端刷新后即可看到新图片。");
    setRebaking(false);
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <p style={{ fontSize: 12, color: S.muted, margin: 0 }}>
        在分享图底部压上固定 bar（文字 + 二维码）+ 左上角 Logo。<br />
        改完设置后点「合成到所有图片」即可更新，前端用户无需任何操作。
      </p>
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <input type="checkbox" checked={settings.overlayEnabled !== false}
          onChange={e => upSetting("overlayEnabled", e.target.checked)} style={{ width: 18, height: 18 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: S.text }}>启用底栏 Overlay</span>
      </label>
      {settings.overlayEnabled !== false && (<>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>引导文字</label>
          <input value={settings.overlayText || ""} onChange={e => upSetting("overlayText", e.target.value)} style={inputStyle()} />
          <p style={{ fontSize: 10, color: S.muted, marginTop: 4 }}>底栏背景为半透明浅灰色（固定），文字为深色。</p>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>二维码 URL（扫码跳转的链接）</label>
          <input value={settings.overlayQrUrl || ""} onChange={e => upSetting("overlayQrUrl", e.target.value)}
            placeholder="https://your-site.vercel.app" style={inputStyle(true)} />
          {!settings.overlayQrUrl && <p style={{ fontSize: 10, color: S.orange, margin: "4px 0 0", fontWeight: 700 }}>⚠️ 未填写则不显示二维码</p>}
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Logo 图片</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
            {logo ? (
              <>
                <img src={logo} alt="logo" style={{ height: 36, maxWidth: 120, objectFit: "contain", background: settings.overlayBarColor || "#1B2FA0", borderRadius: 6, padding: 4 }} />
                <button onClick={() => { removeOverlayLogo(); setLogo(""); }} style={{ ...btn(S.red), padding: "6px 12px", fontSize: 11 }}>移除</button>
              </>
            ) : (
              <button onClick={() => logoRef.current?.click()} style={{ ...btn("#F1F5F9", S.text), fontSize: 11 }}>📁 上传 Logo</button>
            )}
            <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
          </div>
          <p style={{ fontSize: 10, color: S.muted, marginTop: 4 }}>推荐白色透明 PNG，高度约 40px</p>
        </div>

        {/* Re-bake button */}
        <div style={{ borderTop: `1px solid ${S.border}`, paddingTop: 12 }}>
          <p style={{ fontSize: 11, color: S.muted, margin: "0 0 8px" }}>
            设置完毕后，点击下方按钮将 Overlay 合成到所有人格图片中并上传 Cloudinary。
            前端用户无需任何操作，刷新后立即看到更新。
          </p>
          <button
            onClick={reBakeAll}
            disabled={rebaking}
            style={{ ...btn(rebaking ? "#94A3B8" : S.blue), fontSize: 13 }}
          >
            {rebaking ? "⏳ 合成中…" : "🖼 合成到所有图片"}
          </button>
          {rebakeLog.length > 0 && (
            <div style={{ marginTop: 10, padding: "10px 12px", background: "#0F172A", borderRadius: 10, maxHeight: 200, overflowY: "auto" }}>
              {rebakeLog.map((line, i) => (
                <div key={i} style={{ fontSize: 11, fontFamily: "monospace", color: line.startsWith("✓") ? "#4ADE80" : line.startsWith("✗") ? "#F87171" : line.startsWith("✅") ? "#4ADE80" : "#94A3B8", marginBottom: 2 }}>{line}</div>
              ))}
            </div>
          )}
        </div>
      </>)}
    </div>
  );
}

function SettingsEditor() {
  const [settings, setSettings] = useState(() => getSettings());
  const [saved, setSaved] = useState(false);
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwErr, setPwErr] = useState("");

  const upSetting = (f, v) => setSettings(s => ({ ...s, [f]: v }));

  const save = () => {
    if (settings.adminPass !== pwConfirm && pwConfirm !== "") {
      setPwErr("两次密码不一致"); return;
    }
    setPwErr("");
    saveSettings(settings);
    syncToServer(); // ← push settings to JSONBin so frontend sees changes
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };
  const reset = () => { if (confirm("Reset settings to defaults?")) { resetSettings(); setSettings(DEFAULT_SETTINGS); setPwConfirm(""); } };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>⚙️ General Settings</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={reset} style={btn("#F1F5F9", S.muted)}>Reset</button>
          <button onClick={save} style={btn()}>{saved ? "✓ Saved!" : "Save Settings"}</button>
        </div>
      </div>

      {sectionCard("🔐 Admin Password", (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>New Password</label>
            <input type="password" value={settings.adminPass} onChange={e => upSetting("adminPass", e.target.value)} style={inputStyle()} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Confirm Password</label>
            <input type="password" value={pwConfirm} onChange={e => { setPwConfirm(e.target.value); setPwErr(""); }} style={inputStyle()} />
          </div>
          {pwErr && <p style={{ gridColumn:"1/-1", color: S.red, fontSize: 12, margin: 0 }}>{pwErr}</p>}
          <p style={{ gridColumn:"1/-1", fontSize: 11, color: S.muted, margin: 0 }}>⚠️ 密码保存在 localStorage，更改后刷新页面需重新登录。</p>
        </div>
      ))}

      {sectionCard("🔄 JSONBin 云同步（上线必填）", (
        <div style={{ display: "grid", gap: 10 }}>
          <p style={{ fontSize: 12, color: S.muted, margin: 0 }}>
            配置后，Admin 的所有改动会实时同步给所有用户，无需重新部署。<br />
            免费注册 → <b>jsonbin.io</b> → 创建 Bin → 拿到 Bin ID 和 Master Key。
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Bin ID</label>
              <input value={settings.jsonbinId || ""} onChange={e => upSetting("jsonbinId", e.target.value)} placeholder="e.g. 6649a1..." style={inputStyle(true)} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Master Key（X-Master-Key）</label>
              <input type="password" value={settings.jsonbinKey || ""} onChange={e => upSetting("jsonbinKey", e.target.value)} placeholder="$2a$10$..." style={inputStyle(true)} />
            </div>
          </div>
          {settings.jsonbinId && settings.jsonbinKey ? (
            <p style={{ fontSize: 11, color: S.green, margin: 0, fontWeight: 700 }}>✅ 已配置，保存后改动立即同步到所有用户</p>
          ) : (
            <p style={{ fontSize: 11, color: S.red, margin: 0, fontWeight: 700 }}>❌ 未配置，Admin 改动不会同步给其他用户</p>
          )}
        </div>
      ))}

      {sectionCard("☁️ Cloudinary 图片托管（上线必填）", (
        <div style={{ display: "grid", gap: 10 }}>
          <p style={{ fontSize: 12, color: S.muted, margin: 0 }}>
            在 Vercel 等静态托管上，图片上传需要 Cloudinary。<br />
            注册免费账号 → <b>cloudinary.com</b> → Dashboard 拿 Cloud Name，Settings → Upload → Add upload preset（Mode: Unsigned）拿 Preset Name。
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Cloud Name</label>
              <input value={settings.cloudinaryCloudName || ""} onChange={e => upSetting("cloudinaryCloudName", e.target.value)} placeholder="e.g. my-cloud-abc" style={inputStyle(true)} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Upload Preset（Unsigned）</label>
              <input value={settings.cloudinaryUploadPreset || ""} onChange={e => upSetting("cloudinaryUploadPreset", e.target.value)} placeholder="e.g. mpti_unsigned" style={inputStyle(true)} />
            </div>
          </div>
          {settings.cloudinaryCloudName && settings.cloudinaryUploadPreset ? (
            <p style={{ fontSize: 11, color: S.green, margin: 0, fontWeight: 700 }}>✅ 已配置，图片上传将走 Cloudinary</p>
          ) : (
            <p style={{ fontSize: 11, color: S.orange, margin: 0, fontWeight: 700 }}>⚠️ 未配置，图片只保存在本地浏览器（上线后会丢失）</p>
          )}
        </div>
      ))}

      {sectionCard("🖼 分享图底栏 Overlay", (
        <OverlaySettings settings={settings} upSetting={upSetting} />
      ))}

      {sectionCard("🔒 LINE 登录弹窗", (
        <div style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={settings.showLoginSheet !== false} onChange={e => upSetting("showLoginSheet", e.target.checked)}
              style={{ width: 18, height: 18, cursor: "pointer" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: S.text }}>显示 LINE 登录弹窗</span>
          </label>
          <p style={{ fontSize: 11, color: S.muted, margin: 0 }}>
            <b>开启：</b>结果页显示「分享到LINE」→ 弹出 LINE 登录引导 → 跳转 LINE OA<br />
            <b>关闭：</b>结果页改为「保存图片」引导（不提LINE）→ 卖点卡片按钮直接追踪跳 LINE OA → 弹出成功弹窗 → 引导去 H5
          </p>
        </div>
      ))}

      {sectionCard("💚 LINE Official Account URL", (
        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>点击「LINE 登录」按钮跳转的加好友链接</label>
          <input value={settings.lineOaUrl || ""} onChange={e => upSetting("lineOaUrl", e.target.value)} placeholder="https://line.me/R/ti/p/@xxxxxxxx 或 https://lin.ee/xxxxxx" style={inputStyle(true)} />
          <p style={{ fontSize: 11, color: S.muted, margin: 0 }}>在 LINE Official Account Manager → 加好友链接 中获取。留空则仅显示成功弹窗不跳转。</p>
        </div>
      ))}

      {sectionCard("🔗 Redfinger CTA URL", (
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>点击「Cloud Phone」按钮跳转的链接</label>
          <input value={settings.redfingerUrl} onChange={e => upSetting("redfingerUrl", e.target.value)} style={inputStyle(true)} />
        </div>
      ))}

      {sectionCard("📊 Social Proof 人数显示逻辑", (
        <div style={{ display: "grid", gap: 10 }}>
          <p style={{ fontSize: 12, color: S.muted, margin: 0 }}>
            真实人数 &lt; 门槛 → 随机显示「假数字下限～上限」间的数字（每次打开页面固定一个值）<br />
            真实人数 ≥ 门槛 → 显示真实数字
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <NumInput label="假数字下限" value={settings.fakeCountMin ?? 10000} onChange={v => upSetting("fakeCountMin", v)} min={0} />
            <NumInput label="假数字上限" value={settings.fakeCountMax ?? 15000} onChange={v => upSetting("fakeCountMax", v)} min={0} />
            <NumInput label="切换真实数字的门槛" value={settings.fakeCountThreshold ?? 13324} onChange={v => upSetting("fakeCountThreshold", v)} min={0} />
          </div>
        </div>
      ))}

      {sectionCard("🎨 Site Branding", (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Site Name（左上角品牌名）</label>
            <input value={settings.siteName} onChange={e => upSetting("siteName", e.target.value)} style={inputStyle()} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: S.muted }}>Locale Badge（右上角标签）</label>
            <input value={settings.localeBadge} onChange={e => upSetting("localeBadge", e.target.value)} style={inputStyle()} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── DATA PANEL ─────────────────────────────────────────────────── */
function DataPanel() {
  const stats = getStats();
  const users = getUsers();
  const [migrating, setMigrating] = useState(false);
  const [migrateLog, setMigrateLog] = useState([]);

  const migrateImages = async () => {
    setMigrating(true);
    setMigrateLog([]);
    const log = [];

    const pushLog = msg => { log.push(msg); setMigrateLog([...log]); };

    // Question images
    const qImgs = getQuestionImages();
    for (const [qid, val] of Object.entries(qImgs)) {
      if (!val || !val.startsWith("data:")) { pushLog(`Q${qid} 已是 URL，跳过`); continue; }
      const url = await saveImageToDisk("questions", `q${qid}.jpg`, val);
      if (url) { saveQuestionImage(qid, url); pushLog(`✓ Q${qid} → ${url}`); }
      else pushLog(`✗ Q${qid} 迁移失败`);
    }

    // Cover image
    const coverVal = getCoverImage();
    if (coverVal && coverVal.startsWith("data:")) {
      const url = await saveImageToDisk("cover", "cover.jpg", coverVal);
      if (url) { saveCoverImage(url); pushLog(`✓ 封面 → ${url}`); }
      else pushLog("✗ 封面迁移失败");
    }

    // Type poster images
    const typeImgs = getImages();
    for (const [key, val] of Object.entries(typeImgs)) {
      if (!val || !val.startsWith("data:")) { pushLog(`${key} 已是 URL，跳过`); continue; }
      const url = await saveImageToDisk("types", `${key}.jpg`, val);
      if (url) { saveImage(key, url); pushLog(`✓ ${key} → ${url}`); }
      else pushLog(`✗ ${key} 迁移失败`);
    }

    pushLog("🎉 迁移完成！请刷新手机页面查看图片。");
    setMigrating(false);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(exportAllData(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `mpti-export-${new Date().toISOString().slice(0,10)}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const exportCSV = () => {
    const header = "ID,Type,Monthly Waste,Combo,Timestamp\n";
    const rows = users.map(u => `${u.id},${u.typeKey},${u.monthlyWaste},${u.combo||""},${u.timestamp||""}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `mpti-users-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };
  const clearAll = () => { if (confirm("Clear ALL user data? This cannot be undone.")) { clearUsers(); alert("Cleared."); } };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>📦 Data Management</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 20 }}>
        <div style={cardStyle()}><div style={{ fontSize: 28, marginBottom: 8 }}>📊</div><h3 style={{ fontSize: 14, fontWeight: 800 }}>Export Full JSON</h3><p style={{ fontSize: 12, color: S.muted, margin: "4px 0 12px" }}>Stats, users, all config</p><button onClick={exportJSON} style={{ ...btn(S.blue), width:"100%" }}>Download JSON</button></div>
        <div style={cardStyle()}><div style={{ fontSize: 28, marginBottom: 8 }}>📋</div><h3 style={{ fontSize: 14, fontWeight: 800 }}>Export Users CSV</h3><p style={{ fontSize: 12, color: S.muted, margin: "4px 0 12px" }}>{users.length} records</p><button onClick={exportCSV} style={{ ...btn(S.green), width:"100%" }}>Download CSV</button></div>
        <div style={cardStyle()}><div style={{ fontSize: 28, marginBottom: 8 }}>🗑</div><h3 style={{ fontSize: 14, fontWeight: 800 }}>Clear User Data</h3><p style={{ fontSize: 12, color: S.muted, margin: "4px 0 12px" }}>{users.length} records</p><button onClick={clearAll} style={{ ...btn(S.red), width:"100%" }}>Clear All Users</button></div>
      </div>
      <div style={{ ...cardStyle(), marginBottom: 12, borderLeft: `3px solid ${S.blue}` }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>📂 迁移图片到 Public 文件夹</h3>
        <p style={{ fontSize: 12, color: S.muted, margin: "0 0 12px" }}>把之前上传的 localStorage 图片转存到服务器文件夹，让手机也能访问。</p>
        <button onClick={migrateImages} disabled={migrating} style={{ ...btn(S.blue), opacity: migrating ? 0.6 : 1 }}>
          {migrating ? "⏳ 迁移中..." : "🚀 一键迁移图片"}
        </button>
        {migrateLog.length > 0 && (
          <div style={{ marginTop: 10, background: "#0F172A", borderRadius: 8, padding: 10, maxHeight: 180, overflowY: "auto" }}>
            {migrateLog.map((line, i) => (
              <div key={i} style={{ fontSize: 11, fontFamily: "monospace", color: line.startsWith("✓") ? "#34D399" : line.startsWith("✗") ? "#F87171" : "#94A3B8", lineHeight: 1.8 }}>{line}</div>
            ))}
          </div>
        )}
      </div>

      <div style={cardStyle()}>
        <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>🔧 Production Notes</h3>
        <div style={{ fontSize: 13, color: S.muted, lineHeight: 1.7 }}>
          <p>Currently using <b>localStorage</b>. For production:</p>
          <p>1. Replace with <b>Firebase / Supabase</b></p>
          <p>2. Move images to <b>CDN</b> (Cloudflare R2 / AWS S3)</p>
          <p>3. Add <b>real LINE OAuth</b> · Set up <b>GA4 / Meta Pixel</b></p>
        </div>
      </div>
    </div>
  );
}

/* ─── ADMIN LAYOUT ───────────────────────────────────────────────── */
export default function AdminApp() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(true);

  if (!authed) return <LoginGate onAuth={setAuthed} />;

  return (
    <div style={{ minHeight: "100vh", background: S.bg, fontFamily: "Kanit, system-ui, sans-serif", color: S.text }}>
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#fff", borderBottom: `1px solid ${S.border}`, padding: "10px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setSideOpen(!sideOpen)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>☰</button>
        <span style={{ fontSize: 18, fontWeight: 900 }}>MPTI Admin</span>
        <div style={{ flex: 1 }} />
        <a href="/" target="_blank" style={{ fontSize: 12, color: S.blue, fontWeight: 700, textDecoration: "none" }}>View Quiz →</a>
      </div>

      <div style={{ display: "flex" }}>
        {sideOpen && (
          <div style={{ width: 200, minHeight: "calc(100vh - 50px)", background: "#fff", borderRight: `1px solid ${S.border}`, padding: "12px 8px", flexShrink: 0 }}>
            {MODULES.map(m => (
              <button key={m.key} onClick={() => setTab(m.key)}
                style={{ display: "block", width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", textAlign: "left", fontSize: 13, fontWeight: tab === m.key ? 800 : 600, background: tab === m.key ? `${S.accent}12` : "transparent", color: tab === m.key ? S.accent : S.text, cursor: "pointer", marginBottom: 2, transition: "all .15s" }}>
                {m.label}
              </button>
            ))}
          </div>
        )}
        <div style={{ flex: 1, padding: "20px 24px", maxWidth: 960 }}>
          {tab === "dashboard" && <Dashboard />}
          {tab === "cover"     && <CoverEditor />}
          {tab === "questions" && <QuestionsEditor />}
          {tab === "types"     && <TypesEditor />}
          {tab === "images"    && <ImageManager />}
          {tab === "cards"     && <CardsEditor />}
          {tab === "scoring"   && <ScoringEditor />}
          {tab === "strings"   && <StringsEditor />}
          {tab === "settings"  && <SettingsEditor />}
          {tab === "data"      && <DataPanel />}
        </div>
      </div>
    </div>
  );
}
