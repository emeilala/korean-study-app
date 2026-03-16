import { useState, useMemo } from "react";

const ACTIVITY_TAGS = [
  { id: "class", label: "Korean Class", emoji: "🏫", color: "#3a5a40" },
  { id: "pimsleur", label: "Pimsleur", emoji: "🎧", color: "#6b4c3b" },
  { id: "ttmik", label: "TTMIK", emoji: "📘", color: "#2c4a6e" },
  { id: "writing", label: "Writing", emoji: "🔥", color: "#7a3b1e" },
  { id: "reading", label: "Reading", emoji: "📖", color: "#4a5568" },
  { id: "listening", label: "Listening", emoji: "💡", color: "#744210" },
  { id: "vocabulary", label: "Vocabulary", emoji: "🍒", color: "#702459" },
  { id: "speaking", label: "Speaking", emoji: "🗣️", color: "#2d6a4f" },
  { id: "video", label: "Video", emoji: "🎬", color: "#1b4f72" },
  { id: "games", label: "Games", emoji: "🎮", color: "#6c3483" },
  { id: "bootcamp", label: "Bootcamp", emoji: "🚀", color: "#553c9a" },
  { id: "exam", label: "Exam / Quiz", emoji: "📝", color: "#b7410e" },
  { id: "other", label: "Other", emoji: "💬", color: "#555" },
];

const DURATIONS = [15, 30, 45, 60, 90];

const RESOURCES = [
  { icon: "📘", name: "Talk To Me In Korean", desc: "Beginner Extended + 50-day package" },
  { icon: "🎧", name: "Pimsleur", desc: "Lifetime access via app" },
  { icon: "🎓", name: "Coursera", desc: "Access through professional org" },
  { icon: "✍️", name: "Writing Workbooks", desc: "Currently in use" },
];

// Bootcamp starts April 1 2026
const BOOTCAMP_START = "2026-04-01";
const BOOTCAMP_WEEKS = 6;

const todayISO = () => new Date().toISOString().slice(0, 10);
const parseDate = (iso) => new Date(iso + "T00:00:00");
const fmt = (iso) => parseDate(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const fmtShort = (iso) => parseDate(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const getWeekStart = (iso) => {
  const d = parseDate(iso);
  const day = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  return mon.toISOString().slice(0, 10);
};

const fmtWeekLabel = (iso) =>
  "Week of " + parseDate(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

const getTag = (id) => ACTIVITY_TAGS.find((t) => t.id === id);
const fmtMin = (m) => m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${m % 60 ? " " + (m % 60) + "m" : ""}`;

// Add days to a date ISO string (using local date to avoid timezone slip)
const addDays = (iso, n) => {
  const d = parseDate(iso);
  d.setDate(d.getDate() + n);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Build bootcamp week structure: array of 6 weeks, each with 7 day ISO strings
const buildBootcampWeeks = () => {
  const weeks = [];
  for (let w = 0; w < BOOTCAMP_WEEKS; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      days.push(addDays(BOOTCAMP_START, w * 7 + d));
    }
    weeks.push(days);
  }
  return weeks;
};

const BOOTCAMP_WEEKS_DATA = buildBootcampWeeks();
const BOOTCAMP_END = addDays(BOOTCAMP_START, 41);

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

function Dashboard({ sessions }) {
  const today = todayISO();
  const weekStart = getWeekStart(today);
  const weekGoalMin = 210;

  const todayMin = sessions.filter((s) => s.date === today).reduce((a, s) => a + s.duration, 0);
  const weekMin = sessions.filter((s) => s.date >= weekStart).reduce((a, s) => a + s.duration, 0);

  let streak = 0;
  const seen = new Set(sessions.map((s) => s.date));
  const check = new Date();
  while (seen.has(check.toISOString().slice(0, 10))) {
    streak++;
    check.setDate(check.getDate() - 1);
  }

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
          { val: `${streak}일`, label: "DAY STREAK", sub: streak > 0 ? "Keep going!" : "Start today!", accent: "#3a5a40" },
          { val: fmtMin(todayMin || 0), label: "TODAY", sub: todayMin >= 30 ? "Goal met ✓" : "Goal: 30m", accent: "#553c9a" },
          { val: fmtMin(weekMin), label: "THIS WEEK", sub: `${pct}% of 3.5hr goal`, accent: "#2c4a6e" },
          { val: sessions.length, label: "TOTAL SESSIONS", sub: "", accent: "#744210" },
        ].map((c) => (
          <div key={c.label} style={{ background: "#fff", borderRadius: 10, padding: "13px 14px", borderLeft: `3px solid ${c.accent}` }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a", lineHeight: 1 }}>{c.val}</div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "#888", marginTop: 5, textTransform: "uppercase" }}>{c.label}</div>
            {c.sub && <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{c.sub}</div>}
          </div>
        ))}
      </div>

      <div style={ss.sectionLabel}>WEEKLY PROGRESS</div>
      <div style={{ background: "#e5e5e5", borderRadius: 4, height: 7, marginBottom: 5 }}>
        <div style={{ width: `${pct}%`, background: "#3a5a40", height: "100%", borderRadius: 4 }} />
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
      <div style={{ background: "#f0ede4", borderRadius: "16px 16px 0 0", padding: "24px 16px 32px", width: "100%", maxWidth: 540, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={ss.sectionLabel}>LOG SESSION</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#2d3a2e" }}>{fmt(date)}</div>
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
        style={{ width: "100%", accentColor: "#3a5a40", marginBottom: 4 }} />
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
            return found ? found.id : null;
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
  return (
    <div style={{ padding: "16px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={ss.sectionLabel}>SESSION HISTORY</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {(exportFeedback || importFeedback) && (
            <span style={{ fontSize: 11, color: "#3a5a40", fontWeight: 600 }}>{exportFeedback || importFeedback}</span>
          )}
          <label style={{ ...ss.outlineBtn, display: "inline-block", cursor: "pointer" }}>
            ⬆ Import CSV
            <input type="file" accept=".csv" onChange={importCSV} style={{ display: "none" }} />
          </label>
          <button onClick={exportCSV} style={ss.outlineBtn}>⬇ Export CSV</button>
        </div>
      </div>

      {grouped.length === 0 && <div style={{ color: "#aaa", textAlign: "center", padding: 40 }}>No sessions yet.</div>}

      {grouped.map(([wk, wkSessions]) => {
        const total = wkSessions.reduce((a, s) => a + s.duration, 0);
        return (
          <div key={wk} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 7, borderBottom: "1.5px solid #d0cec6", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#3a5a40" }}>{fmtWeekLabel(wk)}</span>
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
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [modalDate, setModalDate] = useState(null);
  const today = todayISO();

  // Which dates have sessions logged?
  const loggedDates = new Set(sessions.map((s) => s.date));

  // Bootcamp status
  const bootcampStarted = today >= BOOTCAMP_START;
  const bootcampEnded = today > BOOTCAMP_END;

  // Current week index (0-based)
  const currentWeekIdx = bootcampStarted
    ? Math.min(Math.floor((parseDate(today) - parseDate(BOOTCAMP_START)) / (7 * 86400000)), 5)
    : null;

  // Auto-expand current week
  const effectiveExpanded = expandedWeek !== null ? expandedWeek : currentWeekIdx;

  const dayOfWeekLabel = (iso) =>
    parseDate(iso).toLocaleDateString("en-US", { weekday: "short" });

  return (
    <div style={{ padding: "16px 14px" }}>
      {/* Bootcamp header */}
      <div style={{ background: "#2d3a2e", borderRadius: 12, padding: "18px 16px", marginBottom: 16, color: "#f5f2eb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>🚀</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>6-Week Bootcamp</div>
            <div style={{ fontSize: 12, opacity: 0.65 }}>
              {bootcampEnded ? "Completed!" : bootcampStarted ? "In progress" : `Starts ${fmtShort(BOOTCAMP_START)}`}
            </div>
          </div>
        </div>
        {/* Overall progress bar */}
        {bootcampStarted && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.65, marginBottom: 5 }}>
              <span>{fmtShort(BOOTCAMP_START)}</span>
              <span>{loggedDates.size} days logged</span>
              <span>{fmtShort(BOOTCAMP_END)}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 4, height: 7 }}>
              <div style={{
                width: `${Math.min(100, (loggedDates.size / 42) * 100)}%`,
                background: "#6b8f71", height: "100%", borderRadius: 4,
              }} />
            </div>
          </>
        )}
      </div>

      {/* Week accordions */}
      {BOOTCAMP_WEEKS_DATA.map((days, wIdx) => {
        const weekNum = wIdx + 1;
        const weekStart = days[0];
        const weekEnd = days[6];
        const isExpanded = effectiveExpanded === wIdx;
        const isCurrent = currentWeekIdx === wIdx;
        const weekLogged = days.filter((d) => loggedDates.has(d)).length;
        const weekLocked = today < weekStart;

        return (
          <div key={wIdx} style={{ background: "#fff", borderRadius: 10, marginBottom: 10, overflow: "hidden", border: isCurrent ? "2px solid #3a5a40" : "1.5px solid #e0ddd5" }}>
            {/* Week header — tap to expand */}
            <button
              onClick={() => setExpandedWeek(isExpanded ? null : wIdx)}
              style={{ width: "100%", background: "none", border: "none", cursor: weekLocked ? "default" : "pointer", padding: "13px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: weekLocked ? "#aaa" : "#2d3a2e" }}>
                  Week {weekNum}
                </span>
                {isCurrent && <span style={{ background: "#3a5a40", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "2px 8px" }}>NOW</span>}
                <span style={{ fontSize: 11, color: "#aaa" }}>{fmtShort(weekStart)} – {fmtShort(weekEnd)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: weekLogged === 7 ? "#3a5a40" : "#aaa", fontWeight: 600 }}>{weekLogged}/7</span>
                <span style={{ color: "#aaa", fontSize: 14 }}>{isExpanded ? "▲" : "▼"}</span>
              </div>
            </button>

            {/* Day grid */}
            {isExpanded && (
              <div style={{ padding: "4px 14px 14px", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                {days.map((dayISO) => {
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
                        padding: "8px 4px", borderRadius: 8, border: isToday ? "2px solid #3a5a40" : "1.5px solid #e0ddd5",
                        background: isLogged ? "#3a5a40" : isFuture ? "#faf9f6" : "#fff",
                        cursor: isFuture ? "default" : "pointer",
                        opacity: isFuture ? 0.4 : 1,
                      }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: isLogged ? "rgba(255,255,255,0.7)" : "#aaa", textTransform: "uppercase" }}>
                        {dayOfWeekLabel(dayISO)}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: isLogged ? "#fff" : isToday ? "#3a5a40" : isPast ? "#ccc" : "#2d2d2d", marginTop: 2 }}>
                        {parseDate(dayISO).getDate()}
                      </span>
                      {isLogged && <span style={{ fontSize: 10, marginTop: 2 }}>✓</span>}
                    </button>
                  );
                })}
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

      {/* Log session modal */}
      {modalDate && (
        <LogSessionModal
          date={modalDate}
          onSave={onLogSession}
          onClose={() => setModalDate(null)}
        />
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
  const [sessions, setSessions] = useState(() => loadFromStorage("ks_sessions", []));

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

  const importSessions = (imported) => {
    setSessions_((prev) => {
      const existingIds = new Set(prev.map((s) => s.date + "_" + s.duration));
      const deduped = imported.filter((s) => !existingIds.has(s.date + "_" + s.duration));
      return [...deduped, ...prev];
    });
  };

  return (
    // Max width 390px matches Samsung Fold 4 cover screen width
    <div style={{ fontFamily: "'Georgia', serif", background: "#f0ede4", minHeight: "100vh", maxWidth: 600, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#2d3a2e", color: "#f5f2eb", padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
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
              borderBottom: tab === t.id ? "2px solid #3a5a40" : "2px solid transparent",
              color: tab === t.id ? "#3a5a40" : "#999",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            }}>
            <span style={{ fontSize: 15 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "dashboard" && <Dashboard sessions={sessions} />}
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
  input: { width: "100%", padding: "9px 11px", border: "1px solid #d8d5cd", borderRadius: 8, fontSize: 13, fontFamily: "Georgia, serif", background: "#faf9f5", boxSizing: "border-box", marginBottom: 4 },
  chip: { padding: "5px 12px", border: "1.5px solid #d0cfc8", borderRadius: 20, background: "#fff", cursor: "pointer", fontSize: 12, color: "#555", fontFamily: "Georgia, serif" },
  chipActive: { background: "#3a5a40", color: "#fff", borderColor: "#3a5a40" },
  primaryBtn: { width: "100%", padding: "13px", background: "#6b8f71", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif", marginTop: 14 },
  outlineBtn: { padding: "6px 14px", border: "1.5px solid #3a5a40", borderRadius: 20, background: "#fff", color: "#3a5a40", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Georgia, serif" },
};
