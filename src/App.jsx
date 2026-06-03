import { useState, useMemo } from "react";

const parseDate = (iso) => {
  if (!iso || typeof iso !== "string") return new Date();
  const clean = iso.trim().slice(0, 10);
  const d = new Date(clean + "T00:00:00");
  return isNaN(d.getTime()) ? new Date() : d;
};

const addDays = (iso, n) => {
  const d = parseDate(iso);
  d.setDate(d.getDate() + n);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return yyyy + "-" + mm + "-" + dd;
};

const nextMonday = (iso) => {
  const d = parseDate(iso);
  const day = d.getDay();
  const diff = day === 1 ? 7 : (8 - day) % 7 || 7;
  return addDays(iso, diff);
};

const buildWeek = (monISO) => {
  const days = [];
  for (let d = 0; d < 5; d++) days.push(addDays(monISO, d));
  return days;
};



const ACTIVITY_TAGS = [
  { id: "class", label: "Korean Class", emoji: "🏫", color: "#9b7fb6" },
  { id: "pimsleur", label: "Pimsleur", emoji: "🎧", color: "#b07aaa" },
  { id: "ttmik", label: "TTMIK", emoji: "📘", color: "#7a9cc4" },
  { id: "writing", label: "Writing", emoji: "🔥", color: "#c47a9a" },
  { id: "reading", label: "Reading", emoji: "📖", color: "#8a9cc4" },
  { id: "listening", label: "Listening", emoji: "💡", color: "#a08fc4" },
  { id: "vocabulary", label: "Vocabulary", emoji: "🍒", color: "#c47aaa" },
  { id: "speaking", label: "Speaking", emoji: "🗣️", color: "#7ab4c4" },
  { id: "video", label: "Video", emoji: "🎬", color: "#7a8fc4" },
  { id: "games", label: "Games", emoji: "🎮", color: "#b49ac4" },
  { id: "bootcamp", label: "Bootcamp", emoji: "🚀", color: "#9a7fc4" },
  { id: "exam", label: "Exam / Quiz", emoji: "📝", color: "#c49ab4" },
  { id: "other", label: "Other", emoji: "💬", color: "#a4a0b4" },
];

const DURATIONS = [15, 30, 45, 60, 90];

const RESOURCES = [
  { icon: "📘", name: "Talk To Me In Korean", desc: "Beginner Extended + 50-day package" },
  { icon: "🎧", name: "Pimsleur", desc: "Lifetime access via app" },
  { icon: "🦌", name: "LingoDeer", desc: "3-year subscription" },
  { icon: "📗", name: "TTMIK", desc: "1-year subscription" },
  { icon: "🏫", name: "King Sejong Institute", desc: "Free online course" },
  { icon: "🌹", name: "Rosetta Stone", desc: "Lifetime access" },
  { icon: "🎓", name: "Coursera", desc: "Access through professional org" },
];

// ── Bootcamp schedule ────────────────────────────────────────────────────────
// 23 weeks · TTMIK L1+L2 (all 55 lessons) · Mon–Fri · starts Jun 1 2026
// Holiday week: Jun 7–13 (greyed out, not counted)
// Break week: after W11 (between levels)

const HOLIDAY_START = "2026-06-07";
const HOLIDAY_END   = "2026-06-13";

// Build a week of Mon–Fri ISO dates from a Monday ISO string
// SCHEDULE — each entry: { label, phase, subtitle, monISO, isHoliday?, isBreak? }
const buildSchedule = () => {
  const entries = [];
  let cursor = "2026-06-01"; // first Monday

  const weeks = [
    // Phase 1 — Level 1 Foundations
    { label: "W1",  phase: 1, sub: "L1 · L3 · L4 — Greetings · Pimsleur 1–2" },
    // Holiday
    null,
    { label: "W2",  phase: 1, sub: "L5 · L2 · L6 — 이에요/예요 · Pimsleur 3–4" },
    { label: "W3",  phase: 1, sub: "L7 · L8 · L10 — 이/저/그 · 있어요/없어요 · Pimsleur 5–6" },
    { label: "W4",  phase: 1, sub: "L9 — 은/는 · 이/가 (full week) · Pimsleur 7–8" },
    { label: "W5",  phase: 1, sub: "L11 · L13 · L14 — 주세요 · 고 싶어요 · Pimsleur 9–10" },
    { label: "W6",  phase: 1, sub: "L15 · L20 — Numbers sino-Korean + native · Pimsleur 11–12" },
    { label: "W7",  phase: 1, sub: "L16 — Present tense 아/어/여요 (full week) · Pimsleur 13–14" },
    { label: "W8",  phase: 1, sub: "L17 — Past tense 았/었/였어요 (full week) · Pimsleur 15–16" },
    { label: "W9",  phase: 1, sub: "L18 · L19 · L23 — Location particles · 에 · 에서 · Pimsleur 17–18" },
    { label: "W10", phase: 1, sub: "L24 · L21 · L22 — Why/how · negation · 하다 · Pimsleur 19–20" },
    { label: "W11", phase: 1, sub: "L25 · Review — 에서/부터/까지 · Level 1 review · Pimsleur 21–22" },
    // Break between levels
    null,
    // Phase 2 — Level 2
    { label: "W13", phase: 2, sub: "L1 — Future tense (으)ㄹ 거예요 · Pimsleur 25–26" },
    { label: "W14", phase: 2, sub: "L2 — Object particles 을/를 · Pimsleur 27–28" },
    { label: "W15", phase: 2, sub: "L3 · L6 · L4 — Connectors 그리고 · 그래서 · 그렇지만 · Pimsleur 29–30" },
    { label: "W16", phase: 2, sub: "L5 · L7 · L10 — 요일 · 한테/한테서 · 고 있어요 · Pimsleur L2 1–2" },
    { label: "W17", phase: 2, sub: "L8 · L9 · L12 — Telling time · counters · dates · Pimsleur L2 3–4" },
    { label: "W18", phase: 2, sub: "L11 · L13 · L14 — 자기소개 · 도 parts 1 & 2 · Pimsleur L2 5–6" },
    { label: "W19", phase: 2, sub: "L15 · L16 · L18 — 만 · adverbs · 잘하다/못하다 · Pimsleur L2 7–8" },
    { label: "W20", phase: 2, sub: "L17 · L19 · L22 — Can/cannot · -는 것 · 좋다 vs 좋아하다 · Pimsleur L2 9–10" },
    { label: "W21", phase: 2, sub: "L20 · L21 · L23 — Must · more than · if/conditionals · Pimsleur L2 11–12" },
    { label: "W22", phase: 2, sub: "L24 · L25 · L26 · L27 — Still/already · imperative · please do · Pimsleur L2 13–14" },
    { label: "W23", phase: 2, sub: "L28 · L29 · L30 — Method · all/more · don't · 자기소개 capstone · Pimsleur L2 15–16" },
  ];

  weeks.forEach((w, i) => {
    if (w === null) {
      // null = special week
      if (i === 1) {
        // Holiday week
        entries.push({ label: "Holiday", isHoliday: true, monISO: HOLIDAY_START, days: [] });
        cursor = nextMonday(HOLIDAY_END);
      } else {
        // Break between levels (after W11)
        const breakMon = cursor;
        entries.push({ label: "Break", isBreak: true, monISO: breakMon, days: buildWeek(breakMon) });
        cursor = nextMonday(addDays(breakMon, 4));
      }
    } else {
      const days = buildWeek(cursor);
      entries.push({ ...w, monISO: cursor, days });
      cursor = nextMonday(addDays(cursor, 4));
    }
  });

  return entries;
};

const SCHEDULE = buildSchedule();
const BOOTCAMP_START = SCHEDULE.find(e => e.days && e.days.length > 0)?.days[0] || "2026-06-01";
const lastStudyWeek = [...SCHEDULE].reverse().find(e => e.days && e.days.length > 0);
const BOOTCAMP_END = lastStudyWeek ? lastStudyWeek.days[4] : "2026-09-30";

const todayISO = () => new Date().toISOString().slice(0, 10);
const fmt = (iso) => parseDate(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const fmtShort = (iso) => parseDate(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const getWeekStart = (iso) => {
  const d = parseDate(iso);
  const day = d.getDay(); // 0=Sun
  const sun = new Date(d);
  sun.setDate(d.getDate() - day);
  const yyyy = sun.getFullYear();
  const mm = String(sun.getMonth() + 1).padStart(2, "0");
  const dd = String(sun.getDate()).padStart(2, "0");
  return yyyy + "-" + mm + "-" + dd;
};

const fmtWeekLabel = (iso) => {
  const start = parseDate(iso);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt1 = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const fmt2 = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return fmt1 + " – " + fmt2;
};

const getTag = (id) => ACTIVITY_TAGS.find((t) => t.id === id);
// Map legacy tag labels/ids to current ones
const LEGACY_TAG_MAP = {
  "한글 class": "class",
  "hangeul": "class",
  "한글class": "class",
};

const resolveTagLabel = (label) => {
  const lower = label.toLowerCase().trim();
  if (LEGACY_TAG_MAP[lower]) return LEGACY_TAG_MAP[lower];
  const found = ACTIVITY_TAGS.find((t) => t.label.toLowerCase() === lower || t.id === lower);
  return found ? found.id : null;
};

const fmtMin = (m) => m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${m % 60 ? " " + (m % 60) + "m" : ""}`;



// ── Streak freeze helpers ─────────────────────────────────────────────────────
const FREEZE_KEY = "ks_freezeDays";
const FREEZE_MONTH_KEY = "ks_freezeMonth";
const MAX_FREEZES = 3;

const getCurrentMonth = () => new Date().toISOString().slice(0, 7); // "YYYY-MM"

const getFreezeDays = () => loadFromStorage(FREEZE_KEY, []);
const getFreezeMonth = () => loadFromStorage(FREEZE_MONTH_KEY, "");

const refreshFreezes = () => {
  // Reset on new month
  const month = getCurrentMonth();
  if (getFreezeMonth() !== month) {
    saveToStorage(FREEZE_KEY, []);
    saveToStorage(FREEZE_MONTH_KEY, month);
  }
};

// localStorage helpers
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function saveToStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── Components ────────────────────────────────────────────────────────────────

function TagBadge({ id }) {
  const tag = getTag(id);
  if (!tag) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: tag.color, color: "#fff",
      borderRadius: 20, padding: "3px 9px", fontSize: 11, fontWeight: 600,
    }}>
      {tag.emoji} {tag.label}
    </span>
  );
}

function Dashboard({ sessions, freezeDays, onFreeze, onUnfreeze }) {
  const today = todayISO();
  const weekStart = getWeekStart(today);
  const weekGoalMin = 210;

  const todayMin = sessions.filter((s) => s.date === today).reduce((a, s) => a + s.duration, 0);
  const weekMin = sessions.filter((s) => s.date >= weekStart).reduce((a, s) => a + s.duration, 0);

  // Streak: frozen days count as studied
  const seen = new Set([...sessions.map((s) => s.date), ...freezeDays]);
  let streak = 0;
  const check = new Date();
  while (seen.has(check.toISOString().slice(0, 10))) {
    streak++;
    check.setDate(check.getDate() - 1);
  }

  const isTodayFrozen = freezeDays.includes(today);
  const freezesUsed = freezeDays.filter(d => d.startsWith(getCurrentMonth())).length;
  const freezesLeft = MAX_FREEZES - freezesUsed;

  const weekActivities = {};
  sessions.filter((s) => s.date >= weekStart).forEach((s) =>
    s.tags.forEach((t) => { weekActivities[t] = (weekActivities[t] || 0) + s.duration; })
  );

  const recent = [...sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const pct = Math.min(100, Math.round((weekMin / weekGoalMin) * 100));

  return (
    <div style={{ padding: "16px 14px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { val: `${streak}일`, label: "DAY STREAK", sub: streak > 0 ? "Keep going!" : "Start today!", accent: "#b07aaa" },
          { val: fmtMin(todayMin || 0), label: "TODAY", sub: todayMin >= 30 ? "Goal met ✓" : "Goal: 30m", accent: "#9a7fc4" },
          { val: fmtMin(weekMin), label: "THIS WEEK", sub: `${pct}% of 3.5hr goal`, accent: "#7a9cc4" },
        ].map((c) => (
          <div key={c.label} style={{ background: "#fff", borderRadius: 10, padding: "13px 14px", borderLeft: `3px solid ${c.accent}` }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a", lineHeight: 1 }}>{c.val}</div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "#888", marginTop: 5, textTransform: "uppercase" }}>{c.label}</div>
            {c.sub && <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{c.sub}</div>}
          </div>
        ))}
      </div>

      {/* Streak freeze */}
      <div style={{ background: "#fff", borderRadius: 10, padding: "13px 14px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6b5b8a" }}>
            🧊 Streak Freeze
          </div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>
            {freezesLeft} of {MAX_FREEZES} remaining this month
            {isTodayFrozen ? " · today is frozen ❄️" : ""}
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 24, height: 8, borderRadius: 4,
                background: i < freezesLeft ? "#b49ac4" : "#e8e0f0"
              }} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {isTodayFrozen ? (
            <button onClick={onUnfreeze} style={{ ...ss.outlineBtn, fontSize: 11, padding: "5px 10px", borderColor: "#c47aaa", color: "#c47aaa" }}>
              Unfreeze
            </button>
          ) : (
            <button
              onClick={onFreeze}
              disabled={freezesLeft === 0}
              style={{ ...ss.outlineBtn, fontSize: 11, padding: "5px 10px", opacity: freezesLeft === 0 ? 0.4 : 1 }}>
              Freeze today
            </button>
          )}
        </div>
      </div>

      <div style={ss.sectionLabel}>WEEKLY PROGRESS</div>
      <div style={{ background: "#e5e5e5", borderRadius: 4, height: 7, marginBottom: 5 }}>
        <div style={{ width: `${pct}%`, background: "#7a6aaa", height: "100%", borderRadius: 4 }} />
      </div>
      <div style={{ fontSize: 11, color: "#888", marginBottom: 16 }}>{fmtMin(weekMin)} / 3h 30m target</div>

      {Object.keys(weekActivities).length > 0 && (
        <>
          <div style={ss.sectionLabel}>THIS WEEK'S ACTIVITIES</div>
          {Object.entries(weekActivities).map(([id, min]) => (
            <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <TagBadge id={id} />
              <span style={{ fontSize: 13, color: "#555" }}>{fmtMin(min)}</span>
            </div>
          ))}
          <div style={{ height: 8 }} />
        </>
      )}

      <div style={ss.sectionLabel}>RECENT</div>
      {recent.length === 0 && <div style={{ color: "#aaa", fontSize: 12, fontStyle: "italic" }}>No sessions yet — log your first one!</div>}
      {recent.map((session) => (
        <div key={session.id} style={{ paddingBottom: 10, marginBottom: 10, borderBottom: "1px solid #ece9e0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#888", width: 80, flexShrink: 0 }}>{fmt(session.date)}</span>
            {session.tags.slice(0, 1).map((t) => <TagBadge key={t} id={t} />)}
            <span style={{ fontSize: 12, color: "#555" }}>{session.duration}m</span>
          </div>
          {session.notes && <div style={{ fontSize: 11, color: "#999", paddingLeft: 88, marginTop: 3 }}>{session.notes}</div>}
        </div>
      ))}
    </div>
  );
}

// Modal for logging a session from a bootcamp day tap
function LogSessionModal({ date, onSave, onClose }) {
  const [duration, setDuration] = useState(30);
  const [selectedTags, setSelectedTags] = useState(["bootcamp"]);
  const [notes, setNotes] = useState("");

  const toggle = (id) =>
    setSelectedTags((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);

  const save = () => {
    if (selectedTags.length === 0) return;
    onSave({ id: Date.now(), date, duration, tags: selectedTags, notes: notes.trim() });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end" }}>
      <div style={{ background: "#f5f0f8", borderRadius: "16px 16px 0 0", padding: "24px 16px 32px", width: "100%", maxWidth: 540, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={ss.sectionLabel}>LOG SESSION</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#6b5b8a" }}>{fmt(date)}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, color: "#aaa", cursor: "pointer" }}>×</button>
        </div>

        <label style={ss.fieldLabel}>Duration</label>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>
          {DURATIONS.map((d) => (
            <button key={d} onClick={() => setDuration(d)}
              style={{ ...ss.chip, ...(duration === d ? ss.chipActive : {}) }}>
              {d < 60 ? `${d}m` : `${d / 60}h`}
            </button>
          ))}
        </div>

        <label style={ss.fieldLabel}>Activities</label>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
          {ACTIVITY_TAGS.map((t) => (
            <button key={t.id} onClick={() => toggle(t.id)}
              style={{
                ...ss.chip,
                ...(selectedTags.includes(t.id) ? { background: t.color, color: "#fff", borderColor: t.color } : {}),
              }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        <label style={ss.fieldLabel}>Notes (optional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you cover?"
          style={{ ...ss.input, resize: "none", height: 64 }} />

        <button onClick={save}
          style={{ ...ss.primaryBtn, opacity: selectedTags.length === 0 ? 0.5 : 1 }}
          disabled={selectedTags.length === 0}>
          Save Session
        </button>
      </div>
    </div>
  );
}

function LogSession({ onSave }) {
  const [date, setDate] = useState(todayISO());
  const [duration, setDuration] = useState(30);
  const [selectedTags, setSelectedTags] = useState([]);
  const [notes, setNotes] = useState("");

  const toggle = (id) =>
    setSelectedTags((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);

  const save = () => {
    if (!date || selectedTags.length === 0) return;
    onSave({ id: Date.now(), date, duration, tags: selectedTags, notes: notes.trim() });
    setSelectedTags([]);
    setNotes("");
    setDate(todayISO());
    setDuration(30);
  };

  return (
    <div style={{ padding: "16px 14px" }}>
      <div style={ss.sectionLabel}>LOG A STUDY SESSION</div>

      <label style={ss.fieldLabel}>Date</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={ss.input} />

      <label style={ss.fieldLabel}>Duration (minutes)</label>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>
        {DURATIONS.map((d) => (
          <button key={d} onClick={() => setDuration(d)}
            style={{ ...ss.chip, ...(duration === d ? ss.chipActive : {}) }}>
            {d < 60 ? `${d}m` : `${d / 60}h`}
          </button>
        ))}
      </div>
      <input type="range" min={5} max={180} step={5} value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#7a6aaa", marginBottom: 4 }} />
      <div style={{ textAlign: "center", fontSize: 12, color: "#888", marginBottom: 14 }}>{duration} minutes</div>

      <label style={ss.fieldLabel}>What did you work on?</label>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 16 }}>
        {ACTIVITY_TAGS.map((t) => (
          <button key={t.id} onClick={() => toggle(t.id)}
            style={{
              ...ss.chip,
              ...(selectedTags.includes(t.id) ? { background: t.color, color: "#fff", borderColor: t.color } : {}),
            }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <label style={ss.fieldLabel}>Notes (optional)</label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
        placeholder="What did you learn? Any observations?"
        style={{ ...ss.input, resize: "vertical", minHeight: 72 }} />

      <button onClick={save}
        style={{ ...ss.primaryBtn, opacity: selectedTags.length === 0 ? 0.5 : 1 }}
        disabled={selectedTags.length === 0}>
        Save Session
      </button>
    </div>
  );
}

function History({ sessions, onDelete, onImport }) {
  const [exportFeedback, setExportFeedback] = useState("");
  const [importFeedback, setImportFeedback] = useState("");

  const grouped = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
    const map = {};
    sorted.forEach((s) => {
      const wk = getWeekStart(s.date);
      if (!map[wk]) map[wk] = [];
      map[wk].push(s);
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [sessions]);

  const exportCSV = () => {
    if (sessions.length === 0) {
      setExportFeedback("No sessions to export.");
      setTimeout(() => setExportFeedback(""), 2500);
      return;
    }
    const header = ["Date", "Duration (min)", "Activities", "Notes"];
    const rows = [...sessions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((s) => [
        s.date,
        s.duration,
        s.tags.map((t) => getTag(t)?.label ?? t).join("; "),
        `"${(s.notes || "").replace(/"/g, '""')}"`,
      ]);
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `korean-study-log-${todayISO()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExportFeedback(`✓ ${sessions.length} sessions exported`);
    setTimeout(() => setExportFeedback(""), 3000);
  };


  const importCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const lines = ev.target.result.trim().split("\n");
        const rows = lines.slice(1); // skip header
        const imported = rows.map((line) => {
          // Handle quoted fields (notes may contain commas)
          const match = line.match(/^([^,]+),([^,]+),([^,]*),(.*)$/s);
          if (!match) return null;
          const [, date, duration, activities, notes] = match;
          const cleanNotes = notes.replace(/^"|"$/g, "").replace(/""/g, '"').trim();
          const tagLabels = activities.split(";").map((a) => a.trim()).filter(Boolean);
          const tags = tagLabels.map((label) => {
            const found = ACTIVITY_TAGS.find((t) => t.label.toLowerCase() === label.toLowerCase());
            // Keep unknown tags as a slugified id so the session still imports
            return found ? found.id : label.toLowerCase().replace(/\s+/g, "_");
          }).filter(Boolean);
          return {
            id: Date.now() + Math.random(),
            date: date.trim(),
            duration: parseInt(duration.trim(), 10),
            tags,
            notes: cleanNotes,
          };
        }).filter(Boolean);
        onImport(imported);
        setImportFeedback(`✓ Imported ${imported.length} sessions`);
        setTimeout(() => setImportFeedback(""), 3000);
      } catch {
        setImportFeedback("Error reading file.");
        setTimeout(() => setImportFeedback(""), 3000);
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  };
  const totalMin = sessions.reduce((a, s) => a + s.duration, 0);

  return (
    <div style={{ padding: "16px 14px" }}>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={{ background: "#fff", borderRadius: 10, padding: "13px 14px", borderLeft: "3px solid #b07aaa" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", lineHeight: 1 }}>{fmtMin(totalMin)}</div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "#888", marginTop: 5, textTransform: "uppercase" }}>Total Study Time</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 10, padding: "13px 14px", borderLeft: "3px solid #9a7fc4" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", lineHeight: 1 }}>{sessions.length}</div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "#888", marginTop: 5, textTransform: "uppercase" }}>Total Sessions</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={ss.sectionLabel}>SESSION HISTORY</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          {(exportFeedback || importFeedback) && (
            <span style={{ fontSize: 11, color: "#7a6aaa", fontWeight: 600 }}>{exportFeedback || importFeedback}</span>
          )}
          <button onClick={exportCSV} style={ss.outlineBtn}>⬆ Export CSV</button>
          <label style={{ ...ss.outlineBtn, display: "inline-block", cursor: "pointer" }}>
            ⬇ Import CSV
            <input type="file" accept=".csv,text/csv,text/plain,application/vnd.ms-excel" onChange={importCSV} style={{ display: "none" }} />
          </label>
        </div>
      </div>

      {grouped.length === 0 && <div style={{ color: "#aaa", textAlign: "center", padding: 40 }}>No sessions yet.</div>}

      {grouped.map(([wk, wkSessions]) => {
        const total = wkSessions.reduce((a, s) => a + s.duration, 0);
        return (
          <div key={wk} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 7, borderBottom: "1.5px solid #d0cec6", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#7a6aaa" }}>{fmtWeekLabel(wk)}</span>
              <span style={{ fontSize: 11, color: "#aaa" }}>{wkSessions.length} sessions · {fmtMin(total)}</span>
            </div>
            {wkSessions.map((session) => (
              <div key={session.id} style={{ position: "relative", paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #ece9e0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: session.notes ? 5 : 0 }}>
                  <span style={{ fontSize: 12, color: "#888", width: 80, flexShrink: 0 }}>{fmt(session.date)}</span>
                  {session.tags.slice(0, 2).map((t) => <TagBadge key={t} id={t} />)}
                  <span style={{ fontSize: 12, color: "#555" }}>{session.duration}m</span>
                </div>
                {session.notes && <div style={{ fontSize: 12, color: "#888", paddingLeft: 88 }}>{session.notes}</div>}
                <button onClick={() => onDelete(session.id)}
                  style={{ position: "absolute", top: 0, right: 0, background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 18, padding: "0 2px", lineHeight: 1 }}>
                  ×
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Programs({ sessions, onLogSession }) {
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [modalDate, setModalDate] = useState(null);
  const today = todayISO();

  // Only sessions within bootcamp date range count for day grid
  const loggedDates = new Set(
    sessions
      .filter((s) => s.date >= BOOTCAMP_START && s.date <= BOOTCAMP_END)
      .map((s) => s.date)
  );

  const totalStudyDays = loggedDates.size;
  const totalStudyWeeks = SCHEDULE.filter(e => !e.isHoliday && !e.isBreak);
  const totalPossibleDays = totalStudyWeeks.reduce((a, e) => a + e.days.length, 0);

  // Current week index in SCHEDULE
  const currentIdx = SCHEDULE.findIndex(e =>
    e.days && e.days.length > 0 && e.days[0] <= today && e.days[e.days.length - 1] >= today
  );
  const effectiveExpanded = expandedIdx !== null ? expandedIdx : (currentIdx >= 0 ? currentIdx : null);

  const dayOfWeekLabel = (iso) =>
    parseDate(iso).toLocaleDateString("en-US", { weekday: "short" });

  const fmtShortRange = (days) =>
    days.length > 0 ? fmtShort(days[0]) + " – " + fmtShort(days[days.length - 1]) : "";

  // Phase labels
  // Precompute which indices should show a phase label
  const phaseHeaderAt = new Set();
  let _lastPhase = null;
  SCHEDULE.forEach((entry, idx) => {
    if (!entry.isHoliday && !entry.isBreak && entry.phase !== _lastPhase) {
      phaseHeaderAt.add(idx);
      _lastPhase = entry.phase;
    }
  });

  return (
    <div style={{ padding: "16px 14px" }}>
      {/* Header */}
      <div style={{ background: "#6b5b8a", borderRadius: 12, padding: "18px 16px", marginBottom: 16, color: "#f5f2eb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 28 }}>🚀</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>20-Week Bootcamp</div>
            <div style={{ fontSize: 12, opacity: 0.65 }}>TTMIK Level 1 & 2 · Mon–Fri · 55 Lessons</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.65, marginBottom: 5 }}>
          <span>{fmtShort(BOOTCAMP_START)}</span>
          <span>{totalStudyDays} / {totalPossibleDays} days logged</span>
          <span>{fmtShort(BOOTCAMP_END)}</span>
        </div>
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 4, height: 7 }}>
          <div style={{ width: `${Math.min(100, (totalStudyDays / totalPossibleDays) * 100)}%`, background: "#c4a8d8", height: "100%", borderRadius: 4 }} />
        </div>
      </div>

      {/* Schedule */}
      {SCHEDULE.map((entry, idx) => {
        const showPhaseLabel = phaseHeaderAt.has(idx);

        const isExpanded = effectiveExpanded === idx;
        const isCurrent = idx === currentIdx;
        const weekLogged = entry.days ? entry.days.filter(d => loggedDates.has(d)).length : 0;
        const weekLocked = entry.days && entry.days.length > 0 && today < entry.days[0];

        return (
          <div key={idx}>
            {/* Phase label */}
            {showPhaseLabel && (
              <div style={{ ...ss.sectionLabel, marginTop: idx > 0 ? 20 : 4 }}>
                {entry.phase === 1 ? "PHASE 1 — LEVEL 1 FOUNDATIONS" : "PHASE 2 — LEVEL 2 GRAMMAR"}
              </div>
            )}

            {/* Holiday week */}
            {entry.isHoliday && (
              <div style={{ background: "#fdf8fe", borderRadius: 10, marginBottom: 8, padding: "12px 14px", border: "1.5px dashed #d0c8d8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#bbb", fontStyle: "italic" }}>✈️ Holiday — {fmtShort(HOLIDAY_START)} to {fmtShort(HOLIDAY_END)}</span>
                <span style={{ fontSize: 11, color: "#ccc" }}>away</span>
              </div>
            )}

            {/* Break week */}
            {entry.isBreak && (
              <div style={{ marginTop: 20 }}>
                <div style={{ ...ss.sectionLabel }}>BREAK — BETWEEN LEVELS</div>
                <div style={{ background: "#fdf8fe", borderRadius: 10, marginBottom: 8, padding: "14px", border: "1.5px dashed #b49ac4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, color: "#9a7fc4", fontWeight: 600 }}>Rest week</div>
                    <div style={{ fontSize: 11, color: "#bbb" }}>{fmtShortRange(entry.days)} · Revisit anything wobbly</div>
                  </div>
                  {isCurrent && <span style={{ background: "#7a6aaa", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "2px 8px" }}>NOW</span>}
                </div>
              </div>
            )}

            {/* Study week accordion */}
            {!entry.isHoliday && !entry.isBreak && (
              <div style={{ background: "#fff", borderRadius: 10, marginBottom: 8, overflow: "hidden", border: isCurrent ? "2px solid #7a6aaa" : "1.5px solid #e8e0f0" }}>
                <button
                  onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                  style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: weekLocked ? "#bbb" : "#6b5b8a", flexShrink: 0 }}>{entry.label}</span>
                    {isCurrent && <span style={{ background: "#7a6aaa", color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 10, padding: "2px 7px", flexShrink: 0 }}>NOW</span>}
                    <span style={{ fontSize: 10, color: "#bbb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.sub}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: 8 }}>
                    <span style={{ fontSize: 11, color: weekLogged === 5 ? "#9b7fb6" : "#bbb", fontWeight: 600 }}>{weekLogged}/5</span>
                    <span style={{ color: "#bbb", fontSize: 12 }}>{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div style={{ padding: "2px 14px 14px" }}>
                    <div style={{ fontSize: 10, color: "#aaa", marginBottom: 8 }}>{fmtShortRange(entry.days)}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                      {entry.days.map((dayISO) => {
                        const isLogged = loggedDates.has(dayISO);
                        const isToday = dayISO === today;
                        const isFuture = dayISO > today;
                        const isPast = dayISO < today && !isLogged;

                        return (
                          <button
                            key={dayISO}
                            onClick={() => !isFuture && setModalDate(dayISO)}
                            style={{
                              display: "flex", flexDirection: "column", alignItems: "center",
                              padding: "8px 4px", borderRadius: 8,
                              border: isToday ? "2px solid #7a6aaa" : "1.5px solid #e8e0f0",
                              background: isLogged ? "#9b7fb6" : isFuture ? "#fdf8fe" : "#fff",
                              cursor: isFuture ? "default" : "pointer",
                              opacity: isFuture ? 0.4 : 1,
                            }}>
                            <span style={{ fontSize: 9, fontWeight: 700, color: isLogged ? "rgba(255,255,255,0.75)" : "#bbb", textTransform: "uppercase" }}>
                              {dayOfWeekLabel(dayISO)}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: isLogged ? "#fff" : isToday ? "#7a6aaa" : isPast ? "#ccc" : "#2d2d2d", marginTop: 2 }}>
                              {parseDate(dayISO).getDate()}
                            </span>
                            {isLogged && <span style={{ fontSize: 10, marginTop: 1 }}>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Resources */}
      <div style={{ marginTop: 24 }}>
        <div style={ss.sectionLabel}>YOUR RESOURCES</div>
        {RESOURCES.map((r) => (
          <div key={r.name} style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 22 }}>{r.icon}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
              <div style={{ fontSize: 11, color: "#aaa" }}>{r.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {modalDate && (
        <LogSessionModal date={modalDate} onSave={onLogSession} onClose={() => setModalDate(null)} />
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "◎" },
  { id: "log", label: "Log Session", icon: "+" },
  { id: "programs", label: "Programs", icon: "⊞" },
  { id: "history", label: "History", icon: "≡" },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [sessions, setSessions] = useState(() => {
    refreshFreezes();
    return loadFromStorage("ks_sessions", []);
  });
  const [freezeDays, setFreezeDays] = useState(() => loadFromStorage(FREEZE_KEY, []));

  const setSessions_ = (updater) => {
    setSessions((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveToStorage("ks_sessions", next);
      return next;
    });
  };

  const addSession = (s) => {
    setSessions_((prev) => [s, ...prev]);
    setTab("dashboard");
  };

  const addSessionFromPrograms = (s) => {
    setSessions_((prev) => [s, ...prev]);
  };

  const deleteSession = (id) => setSessions_((prev) => prev.filter((s) => s.id !== id));

  const freezeToday = () => {
    const today = todayISO();
    const month = getCurrentMonth();
    const current = loadFromStorage(FREEZE_KEY, []);
    const thisMonth = current.filter(d => d.startsWith(month));
    if (thisMonth.length >= MAX_FREEZES || current.includes(today)) return;
    const updated = [...current, today];
    saveToStorage(FREEZE_KEY, updated);
    setFreezeDays(updated);
  };

  const unfreezeToday = () => {
    const today = todayISO();
    const updated = freezeDays.filter(d => d !== today);
    saveToStorage(FREEZE_KEY, updated);
    setFreezeDays(updated);
  };

  const importSessions = (imported) => {
    setSessions_((prev) => {
      const existingIds = new Set(prev.map((s) => s.date + "_" + s.duration));
      const deduped = imported.filter((s) => !existingIds.has(s.date + "_" + s.duration));
      return [...deduped, ...prev];
    });
  };

  return (
    // Max width 390px matches Samsung Fold 4 cover screen width
    <div style={{ fontFamily: "'Georgia', serif", background: "#f5f0f8", minHeight: "100vh", maxWidth: 600, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#6b5b8a", color: "#f5f2eb", padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: -1 }}>공부</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Korean Study Log</div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 1 }}>매일 조금씩</div>
        </div>
      </div>

      <div style={{ background: "#fff", display: "flex", borderBottom: "1px solid #e0ddd5" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: "10px 4px 8px", border: "none", background: "none", cursor: "pointer",
              borderBottom: tab === t.id ? "2px solid #7a6aaa" : "2px solid transparent",
              color: tab === t.id ? "#3a5a40" : "#999",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            }}>
            <span style={{ fontSize: 15 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "dashboard" && <Dashboard sessions={sessions} freezeDays={freezeDays} onFreeze={freezeToday} onUnfreeze={unfreezeToday} />}
        {tab === "log" && <LogSession onSave={addSession} />}
        {tab === "history" && <History sessions={sessions} onDelete={deleteSession} onImport={importSessions} />}
        {tab === "programs" && <Programs sessions={sessions} onLogSession={addSessionFromPrograms} />}
      </div>
    </div>
  );
}

const ss = {
  sectionLabel: { fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "#aaa", textTransform: "uppercase", marginBottom: 10 },
  fieldLabel: { display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 5, marginTop: 12 },
  input: { width: "100%", padding: "9px 11px", border: "1px solid #d8d5cd", borderRadius: 8, fontSize: 13, fontFamily: "Georgia, serif", background: "#fdf8fe", boxSizing: "border-box", marginBottom: 4 },
  chip: { padding: "5px 12px", border: "1.5px solid #d0cfc8", borderRadius: 20, background: "#fff", cursor: "pointer", fontSize: 12, color: "#555", fontFamily: "Georgia, serif" },
  chipActive: { background: "#7a6aaa", color: "#fff", borderColor: "#7a6aaa" },
  primaryBtn: { width: "100%", padding: "13px", background: "#9b7fb6", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif", marginTop: 14 },
  outlineBtn: { padding: "6px 14px", border: "1.5px solid #7a6aaa", borderRadius: 20, background: "#fff", color: "#7a6aaa", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Georgia, serif" },
};
