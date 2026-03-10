import { useState, useMemo, useEffect } from "react";

const ACTIVITY_TAGS = [
  { id: "hangeul", label: "한글 Class", emoji: "🏠", color: "#3a5a40" },
  { id: "pimsleur", label: "Pimsleur", emoji: "🎧", color: "#6b4c3b" },
  { id: "ttmik", label: "TTMIK", emoji: "📘", color: "#2c4a6e" },
  { id: "writing", label: "Writing", emoji: "🔥", color: "#7a3b1e" },
  { id: "reading", label: "Reading", emoji: "📖", color: "#4a5568" },
  { id: "listening", label: "Listening", emoji: "💡", color: "#744210" },
  { id: "vocabulary", label: "Vocabulary", emoji: "🍒", color: "#702459" },
  { id: "bootcamp", label: "Bootcamp", emoji: "🚀", color: "#553c9a" },
  { id: "other", label: "Other", emoji: "📝", color: "#555" },
];

const DURATIONS = [15, 30, 45, 60, 90];

const RESOURCES = [
  { icon: "📘", name: "Talk To Me In Korean", desc: "Beginner Extended + 50-day package" },
  { icon: "🎧", name: "Pimsleur", desc: "Lifetime access via app" },
  { icon: "🎓", name: "Coursera", desc: "Access through professional org" },
  { icon: "✍️", name: "Writing Workbooks", desc: "Currently in use" },
];

const todayISO = () => new Date().toISOString().slice(0, 10);
const parseDate = (iso) => new Date(iso + "T00:00:00");
const fmt = (iso) => parseDate(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

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

// ── localStorage helpers ──────────────────────────────────────────────────────
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — fail silently
  }
}

// ── Components ────────────────────────────────────────────────────────────────

function TagBadge({ id }) {
  const tag = getTag(id);
  if (!tag) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: tag.color, color: "#fff",
      borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600,
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
    <div style={{ padding: "20px 16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { val: `${streak}일`, label: "DAY STREAK", sub: streak > 0 ? "Keep going!" : "Start today!", accent: "#3a5a40" },
          { val: fmtMin(todayMin || 0), label: "TODAY", sub: todayMin >= 30 ? "Goal met ✓" : "Goal: 30m", accent: "#553c9a" },
          { val: fmtMin(weekMin), label: "THIS WEEK", sub: `${pct}% of 3.5hr goal`, accent: "#2c4a6e" },
          { val: sessions.length, label: "TOTAL SESSIONS", sub: "", accent: "#744210" },
        ].map((c) => (
          <div key={c.label} style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", borderLeft: `3px solid ${c.accent}` }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a", lineHeight: 1 }}>{c.val}</div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#888", marginTop: 6, textTransform: "uppercase" }}>{c.label}</div>
            {c.sub && <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>{c.sub}</div>}
          </div>
        ))}
      </div>

      <div style={ss.sectionLabel}>WEEKLY PROGRESS</div>
      <div style={{ background: "#e5e5e5", borderRadius: 4, height: 8, marginBottom: 6 }}>
        <div style={{ width: `${pct}%`, background: "#3a5a40", height: "100%", borderRadius: 4 }} />
      </div>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 20 }}>{fmtMin(weekMin)} / 3h 30m target</div>

      {Object.keys(weekActivities).length > 0 && (
        <>
          <div style={ss.sectionLabel}>THIS WEEK'S ACTIVITIES</div>
          {Object.entries(weekActivities).map(([id, min]) => (
            <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <TagBadge id={id} />
              <span style={{ fontSize: 14, color: "#555" }}>{fmtMin(min)}</span>
            </div>
          ))}
          <div style={{ height: 8 }} />
        </>
      )}

      <div style={ss.sectionLabel}>RECENT</div>
      {recent.length === 0 && <div style={{ color: "#aaa", fontSize: 13, fontStyle: "italic" }}>No sessions yet — log your first one!</div>}
      {recent.map((session) => (
        <div key={session.id} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #ece9e0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#888", width: 90, flexShrink: 0 }}>{fmt(session.date)}</span>
            {session.tags.slice(0, 1).map((t) => <TagBadge key={t} id={t} />)}
            <span style={{ fontSize: 13, color: "#555" }}>{session.duration}m</span>
          </div>
          {session.notes && <div style={{ fontSize: 12, color: "#999", paddingLeft: 100, marginTop: 4 }}>{session.notes}</div>}
        </div>
      ))}
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
    <div style={{ padding: "20px 16px" }}>
      <div style={ss.sectionLabel}>LOG A STUDY SESSION</div>

      <label style={ss.fieldLabel}>Date</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={ss.input} />

      <label style={ss.fieldLabel}>Duration (minutes)</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
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
      <div style={{ textAlign: "center", fontSize: 13, color: "#888", marginBottom: 16 }}>{duration} minutes</div>

      <label style={ss.fieldLabel}>What did you work on?</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
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
        style={{ ...ss.input, resize: "vertical", minHeight: 80 }} />

      <button onClick={save}
        style={{ ...ss.primaryBtn, opacity: selectedTags.length === 0 ? 0.5 : 1 }}
        disabled={selectedTags.length === 0}>
        Save Session
      </button>
    </div>
  );
}

function History({ sessions, onDelete }) {
  const [exportFeedback, setExportFeedback] = useState("");

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

  return (
    <div style={{ padding: "20px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={ss.sectionLabel}>SESSION HISTORY</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {exportFeedback && <span style={{ fontSize: 12, color: "#3a5a40", fontWeight: 600 }}>{exportFeedback}</span>}
          <button onClick={exportCSV} style={ss.outlineBtn}>⬇ Export CSV</button>
        </div>
      </div>

      {grouped.length === 0 && <div style={{ color: "#aaa", textAlign: "center", padding: 40 }}>No sessions yet.</div>}

      {grouped.map(([wk, wkSessions]) => {
        const total = wkSessions.reduce((a, s) => a + s.duration, 0);
        return (
          <div key={wk} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: "1.5px solid #d0cec6", marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#3a5a40" }}>{fmtWeekLabel(wk)}</span>
              <span style={{ fontSize: 12, color: "#aaa" }}>{wkSessions.length} sessions · {fmtMin(total)}</span>
            </div>
            {wkSessions.map((session) => (
              <div key={session.id} style={{ position: "relative", paddingBottom: 14, marginBottom: 14, borderBottom: "1px solid #ece9e0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: session.notes ? 6 : 0 }}>
                  <span style={{ fontSize: 13, color: "#888", width: 90, flexShrink: 0 }}>{fmt(session.date)}</span>
                  {session.tags.slice(0, 2).map((t) => <TagBadge key={t} id={t} />)}
                  <span style={{ fontSize: 13, color: "#555" }}>{session.duration}m</span>
                </div>
                {session.notes && <div style={{ fontSize: 13, color: "#888", paddingLeft: 100 }}>{session.notes}</div>}
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

function Programs({ hangeulDay, setHangeulDay, bootcampIn, setBootcampIn }) {
  return (
    <div style={{ padding: "20px 16px" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: "20px", marginBottom: 16, border: "2px solid #3a5a40" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <span style={{ fontSize: 32 }}>🏠</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>한글 Class</div>
            <div style={{ fontSize: 13, color: "#888" }}>7-day pronunciation &amp; handwriting</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 12 }}>
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <button key={d} onClick={() => setHangeulDay(d)}
              style={{
                width: 36, height: 36, borderRadius: "50%", border: "1.5px solid",
                borderColor: d <= hangeulDay ? "#3a5a40" : "#d0cfc8",
                background: d <= hangeulDay ? "#3a5a40" : "#fff",
                color: d <= hangeulDay ? "#fff" : "#aaa",
                fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}>{d}</button>
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: 13, color: "#888" }}>Day {hangeulDay} of 7</div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: "20px", marginBottom: 24, border: "1.5px solid #e0ddd5" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <span style={{ fontSize: 32 }}>🚀</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>6-Week Bootcamp</div>
            <div style={{ fontSize: 13, color: "#888" }}>Starts April 1 · In progress</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => setBootcampIn(!bootcampIn)}
            style={{ ...ss.outlineBtn, borderColor: bootcampIn ? "#3a5a40" : "#bbb", color: bootcampIn ? "#3a5a40" : "#888", fontWeight: bootcampIn ? 700 : 400 }}>
            {bootcampIn ? "✓ I'm in" : "I'm in"}
          </button>
          {!bootcampIn && <span style={{ fontSize: 13, color: "#aaa" }}>Click to commit when you're ready.</span>}
        </div>
      </div>

      <div style={ss.sectionLabel}>YOUR RESOURCES</div>
      {RESOURCES.map((r) => (
        <div key={r.name} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 24 }}>{r.icon}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
            <div style={{ fontSize: 12, color: "#aaa" }}>{r.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "◎" },
  { id: "log", label: "Log Session", icon: "+" },
  { id: "history", label: "History", icon: "≡" },
  { id: "programs", label: "Programs", icon: "⊞" },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");

  // All state loaded from localStorage on first render, saved on every change
  const [sessions, setSessions] = useState(() => loadFromStorage("ks_sessions", []));
  const [hangeulDay, setHangeulDayRaw] = useState(() => loadFromStorage("ks_hangeulDay", 2));
  const [bootcampIn, setBootcampInRaw] = useState(() => loadFromStorage("ks_bootcampIn", false));

  // Wrap setters to also persist to localStorage
  const setSessions_ = (updater) => {
    setSessions((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveToStorage("ks_sessions", next);
      return next;
    });
  };

  const setHangeulDay = (val) => {
    setHangeulDayRaw(val);
    saveToStorage("ks_hangeulDay", val);
  };

  const setBootcampIn = (val) => {
    setBootcampInRaw(val);
    saveToStorage("ks_bootcampIn", val);
  };

  const addSession = (s) => {
    setSessions_((prev) => [s, ...prev]);
    setTab("dashboard");
  };

  const deleteSession = (id) => setSessions_((prev) => prev.filter((s) => s.id !== id));

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#f0ede4", minHeight: "100vh", maxWidth: 540, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#2d3a2e", color: "#f5f2eb", padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: -1 }}>공부</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Korean Study Log</div>
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 1 }}>매일 조금씩</div>
        </div>
      </div>

      <div style={{ background: "#fff", display: "flex", borderBottom: "1px solid #e0ddd5" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: "12px 4px 10px", border: "none", background: "none", cursor: "pointer",
              borderBottom: tab === t.id ? "2px solid #3a5a40" : "2px solid transparent",
              color: tab === t.id ? "#3a5a40" : "#999",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            }}>
            <span style={{ fontSize: 16 }}>{t.icon}</span>
            <span style={{ fontSize: 11, fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "dashboard" && <Dashboard sessions={sessions} />}
        {tab === "log" && <LogSession onSave={addSession} />}
        {tab === "history" && <History sessions={sessions} onDelete={deleteSession} />}
        {tab === "programs" && (
          <Programs hangeulDay={hangeulDay} setHangeulDay={setHangeulDay}
            bootcampIn={bootcampIn} setBootcampIn={setBootcampIn} />
        )}
      </div>
    </div>
  );
}

const ss = {
  sectionLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: "#aaa", textTransform: "uppercase", marginBottom: 12 },
  fieldLabel: { display: "block", fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 6, marginTop: 14 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d8d5cd", borderRadius: 8, fontSize: 14, fontFamily: "Georgia, serif", background: "#faf9f5", boxSizing: "border-box", marginBottom: 4 },
  chip: { padding: "6px 14px", border: "1.5px solid #d0cfc8", borderRadius: 20, background: "#fff", cursor: "pointer", fontSize: 13, color: "#555", fontFamily: "Georgia, serif" },
  chipActive: { background: "#3a5a40", color: "#fff", borderColor: "#3a5a40" },
  primaryBtn: { width: "100%", padding: "14px", background: "#6b8f71", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif", marginTop: 16 },
  outlineBtn: { padding: "7px 16px", border: "1.5px solid #3a5a40", borderRadius: 20, background: "#fff", color: "#3a5a40", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Georgia, serif" },
};
