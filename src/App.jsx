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
  { id: "apps", label: "Apps", emoji: "📱", color: "#7ab4c4" },
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

// ── KSI 1A Class schedule ────────────────────────────────────────────────────
// 10 weeks · Online Sejong Institute Beginner 1A
// Sundays 12:00–14:00 Berlin · Jul 27 – Oct 4 2026
// Each week: VOD + Activities (+ Writing assignment on W3, W6) + Live class
// tasks: vod, activities, writing (optional), liveClass

const KSI_WEEKS = [
  { num: 1,  start: "2026-07-27", sunday: "2026-08-02", topic: "자기소개",   title: "저는 한국 사람이에요",          grammar: "이다 / 은",                    noClass: true },
  { num: 2,  start: "2026-07-28", sunday: "2026-08-02", topic: "가족, 직업", title: "회사원이 아니에요",             grammar: "이 / 이 아니다" },
  { num: 3,  start: "2026-08-03", sunday: "2026-08-09", topic: "일상생활",   title: "저도 드라마를 좋아합니다",       grammar: "-습니다/습니까 / 을 / 도", hasWriting: true },
  { num: 4,  start: "2026-08-10", sunday: "2026-08-16", topic: "학교",       title: "여기가 지훈 씨의 학교입니까?",  grammar: "과, 하고 / 의" },
  { num: 5,  start: "2026-08-17", sunday: "2026-08-23", topic: "날씨",       title: "날씨가 좋지 않아요",            grammar: "-어요 / -지 않다" },
  { num: 6,  start: "2026-08-24", sunday: "2026-08-30", topic: "친구",       title: "친구한테 편지를 써요",           grammar: "에게, 한테 / 만", hasWriting: true },
  { num: 7,  start: "2026-08-31", sunday: "2026-09-06", topic: "장소, 위치", title: "지금 어디에 있어요?",           grammar: "(장소)에 / 에서" },
  { num: 8,  start: "2026-09-07", sunday: "2026-09-13", topic: "과거",       title: "토요일에 친구를 만났어요",       grammar: "-었- / (시간)에" },
  { num: 9,  start: "2026-09-14", sunday: "2026-09-20", topic: "운동",       title: "저는 수영을 못해요",             grammar: "부터 / -지 못하다" },
  { num: 10, start: "2026-09-21", sunday: "2026-09-27", topic: "약속",       title: "같이 점심을 먹을까요?",          grammar: "-을까요 / -읍시다 / -고" },
];

const KSI_TOTAL_TASKS = KSI_WEEKS.reduce((a, w) => a + (w.prepOnly ? 2 : w.hasWriting ? 4 : 3), 0);

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

function Programs({ ksiProgress, onToggleTask }) {
  const [expandedIdx, setExpandedIdx] = useState(null);
  const today = todayISO();

  // Total completed tasks
  const totalDone = Object.values(ksiProgress).reduce((a, tasks) => a + tasks.length, 0);
  const pct = Math.min(100, Math.round((totalDone / KSI_TOTAL_TASKS) * 100));
  const weeksCompleted = KSI_WEEKS.filter((w, i) => {
    const required = w.prepOnly
      ? ["vod", "activities"]
      : w.hasWriting
      ? ["vod", "activities", "writing", "liveClass"]
      : ["vod", "activities", "liveClass"];
    const done = ksiProgress[i] || [];
    return required.every(t => done.includes(t));
  }).length;

  // Auto-expand current week based on start date
  const autoIdx = (() => {
    for (let i = 0; i < KSI_WEEKS.length; i++) {
      const w = KSI_WEEKS[i];
      const weekEnd = w.sunday || addDays(w.start, 6);
      if (today >= w.start && today <= weekEnd) return i;
    }
    // First incomplete
    for (let i = 0; i < KSI_WEEKS.length; i++) {
      const w = KSI_WEEKS[i];
      const required = w.noClass
        ? (w.hasWriting ? ["vod","activities","writing"] : ["vod","activities"])
        : (w.hasWriting ? ["vod","activities","writing","liveClass"] : ["vod","activities","liveClass"]);
      const done = ksiProgress[i] || [];
      if (!required.every(t => done.includes(t))) return i;
    }
    return 0;
  })();

  const effectiveExpanded = expandedIdx !== null ? expandedIdx : autoIdx;

  const TASKS = [
    { id: "vod",       label: "VOD",        emoji: "📹", desc: "Watch pre-class video" },
    { id: "activities",label: "Activities", emoji: "✏️", desc: "Complete practice exercises" },
    { id: "writing",   label: "Writing",    emoji: "📝", desc: "Submit writing assignment" },
    { id: "liveClass", label: "Live Class", emoji: "🎙️", desc: "Attend Sunday Zoom · 12:00–14:00" },
  ];

  return (
    <div style={{ padding: "16px 14px" }}>
      {/* Header */}
      <div style={{ background: "#6b5b8a", borderRadius: 12, padding: "18px 16px", marginBottom: 16, color: "#f5f2eb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 28 }}>🏫</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>KSI 한국어 1A</div>
            <div style={{ fontSize: 12, opacity: 0.65 }}>Online Sejong Institute · 10 Weeks · Jul 27 – Sep 27 · Sun 12:00–14:00</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.75, marginBottom: 6 }}>
          <span>{weeksCompleted} / {KSI_WEEKS.length} weeks complete</span>
          <span>{pct}%</span>
        </div>
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 4, height: 8 }}>
          <div style={{ width: `${pct}%`, background: "#c4a8d8", height: "100%", borderRadius: 4, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Week cards */}
      {KSI_WEEKS.map((week, idx) => {
        const required = week.prepOnly
          ? ["vod", "activities"]
          : week.hasWriting
          ? ["vod", "activities", "writing", "liveClass"]
          : ["vod", "activities", "liveClass"];
        const done = ksiProgress[idx] || [];
        const weekDone = required.every(t => done.includes(t));
        const isExpanded = effectiveExpanded === idx;
        const weekEnd = week.sunday || addDays(week.start, 6);
        const isCurrent = today >= week.start && today <= weekEnd;
        const isPast = today > weekEnd;
        const isFuture = today < week.start;

        return (
          <div key={idx} style={{ background: "#fff", borderRadius: 10, marginBottom: 8, overflow: "hidden",
            border: weekDone ? "2px solid #9b7fb6" : isCurrent ? "2px solid #b49ac4" : "1.5px solid #e8e0f0" }}>

            {/* Week header */}
            <button onClick={() => setExpandedIdx(isExpanded ? null : idx)}
              style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "12px 14px",
                display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: weekDone ? "#9b7fb6" : isFuture ? "#bbb" : "#6b5b8a", flexShrink: 0 }}>
                  {weekDone ? "✓ " : ""}W{week.num}
                </span>
                {isCurrent && <span style={{ background: "#7a6aaa", color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 10, padding: "2px 7px", flexShrink: 0 }}>NOW</span>}
                <span style={{ fontSize: 11, color: "#aaa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {week.topic} · {week.grammar}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: 8 }}>
                <span style={{ fontSize: 11, color: weekDone ? "#9b7fb6" : "#bbb", fontWeight: 600 }}>
                  {done.length}/{required.length}
                </span>
                <span style={{ color: "#bbb", fontSize: 12 }}>{isExpanded ? "▲" : "▼"}</span>
              </div>
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div style={{ padding: "0 14px 16px" }}>
                {/* Lesson info */}
                <div style={{ background: "#fdf8fe", borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#6b5b8a", marginBottom: 2 }}>{week.title}</div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>{week.grammar}</div>
                  {week.prepOnly ? (
                    <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>
                      📅 Prep week · Materials released {fmtShort(week.prepStart)} · First class {fmtShort(week.sunday)}
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>
                      🎙️ Live class: Sun {fmtShort(week.sunday)} · 12:00–14:00 Berlin
                    </div>
                  )}
                </div>

                {/* Task checkboxes */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {TASKS.filter(t => (t.id !== "writing" || week.hasWriting) && (t.id !== "liveClass" || !week.prepOnly)).map(task => {
                    const isChecked = done.includes(task.id);
                    const isLiveClass = task.id === "liveClass";
                    const liveDisabled = isLiveClass && (isFuture || week.noClass);
                    return (
                      <button key={task.id}
                        onClick={() => !liveDisabled && onToggleTask(idx, task.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "10px 12px", borderRadius: 8, border: "1.5px solid",
                          borderColor: isChecked ? "#9b7fb6" : "#e8e0f0",
                          background: isChecked ? "#f8f4ff" : "#fff",
                          cursor: liveDisabled ? "default" : "pointer",
                          opacity: liveDisabled ? 0.4 : 1, textAlign: "left",
                        }}>
                        <span style={{ fontSize: 18, flexShrink: 0 }}>
                          {isChecked ? "✅" : task.emoji}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: isChecked ? "#9b7fb6" : "#2d2d2d" }}>
                            {task.label}
                          </div>
                          <div style={{ fontSize: 11, color: "#aaa" }}>{task.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
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
  const [ksiProgress, setKsiProgress] = useState(() => loadFromStorage('ks_ksi_progress', {}));

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

  const toggleTask = (weekIdx, taskId) => {
    setKsiProgress((prev) => {
      const weekTasks = prev[weekIdx] || [];
      const updated = weekTasks.includes(taskId)
        ? weekTasks.filter(t => t !== taskId)
        : [...weekTasks, taskId];
      const next = { ...prev, [weekIdx]: updated };
      saveToStorage('ks_ksi_progress', next);
      return next;
    });
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
        {tab === "programs" && <Programs ksiProgress={ksiProgress} onToggleTask={toggleTask} />}
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
