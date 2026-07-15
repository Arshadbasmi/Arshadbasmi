/* ===== AB Workspace — Mail, Calendar, Reminders, Notes, Contacts =====
 * All data persists in localStorage under a single key. No servers, no tracking.
 */
(() => {
"use strict";

const STORE_KEY = "ab-workspace-v1";
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- State ---------- */
function defaultState() {
  const now = Date.now();
  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const plus = (days) => { const d = new Date(today); d.setDate(d.getDate() + days); return iso(d); };
  return {
    theme: "auto",
    accounts: [
      { id: "acc-personal", label: "Personal", email: "arshad@abkreative.com", type: "personal" },
      { id: "acc-business", label: "ABKreative (Business)", email: "hello@abkreative.com", type: "business" },
    ],
    emails: [
      { id: uid(), accountId: "acc-business", folder: "inbox", from: "Sarah Mitchell", fromEmail: "sarah@clientco.com", to: "hello@abkreative.com", subject: "Project kickoff — brand refresh", body: "Hi Arshad,\n\nGreat speaking with you today. We're excited to kick off the brand refresh project next week.\n\nCould you send over the proposal and timeline by Friday?\n\nBest,\nSarah", date: now - 3600e3, read: false, starred: true },
      { id: uid(), accountId: "acc-business", folder: "inbox", from: "Invoice Bot", fromEmail: "billing@toolstack.io", to: "hello@abkreative.com", subject: "Your June invoice is ready", body: "Your invoice for June is attached.\n\nAmount due: $49.00\nDue date: July 15\n\nThank you for your business.", date: now - 7200e3, read: false, starred: false },
      { id: uid(), accountId: "acc-personal", folder: "inbox", from: "Amina", fromEmail: "amina@family.com", to: "arshad@abkreative.com", subject: "Weekend plans 🎉", body: "Hey!\n\nAre we still on for dinner Saturday? Let me know what time works.\n\nSee you soon!", date: now - 5400e3, read: false, starred: false },
      { id: uid(), accountId: "acc-personal", folder: "inbox", from: "App Store", fromEmail: "no-reply@apple.com", to: "arshad@abkreative.com", subject: "Your receipt from Apple", body: "Receipt for your recent purchase.\n\niCloud+ 200GB — $2.99\n\nThank you.", date: now - 86400e3, read: true, starred: false },
      { id: uid(), accountId: "acc-business", folder: "sent", from: "Me", fromEmail: "hello@abkreative.com", to: "sarah@clientco.com", subject: "Re: Availability this week", body: "Hi Sarah,\n\nThursday 2pm works great. Sending a calendar invite now.\n\nArshad", date: now - 172800e3, read: true, starred: false },
    ],
    events: [
      { id: uid(), title: "Client kickoff — ClientCo", date: plus(2), time: "14:00", cat: "business", notes: "Brand refresh project" },
      { id: uid(), title: "Family dinner", date: plus(3), time: "19:30", cat: "personal", notes: "" },
      { id: uid(), title: "Invoice due — Toolstack", date: plus(12), time: "09:00", cat: "business", notes: "$49" },
    ],
    reminders: [
      { id: uid(), title: "Send proposal to Sarah", date: plus(1), cat: "business", done: false },
      { id: uid(), title: "Renew domain abkreative.com", date: plus(7), cat: "business", done: false },
      { id: uid(), title: "Book dentist appointment", date: plus(4), cat: "personal", done: false },
    ],
    notes: [
      { id: uid(), title: "Welcome to AB Workspace 👋", body: "This is your private hub for personal + business life:\n\n• Mail — track both inboxes, compose via your real mail app\n• Calendar — personal (green) & business (purple) events\n• Reminders — with due dates\n• Notes — like this one\n• Contacts — with one-tap email & call\n\nEverything is saved on this device. Use Settings → Export to back up.\n\nTip: On iPhone/iPad, open in Safari → Share → Add to Home Screen to install it like a native app.", updated: now },
    ],
    contacts: [
      { id: uid(), name: "Sarah Mitchell", email: "sarah@clientco.com", phone: "+1 555 0142", company: "ClientCo", type: "business" },
      { id: uid(), name: "Amina", email: "amina@family.com", phone: "+1 555 0198", company: "", type: "personal" },
    ],
  };
}

let S;
try {
  S = JSON.parse(localStorage.getItem(STORE_KEY)) || defaultState();
} catch { S = defaultState(); }
const save = () => localStorage.setItem(STORE_KEY, JSON.stringify(S));

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg) {
  $("#toast")?.remove();
  const el = document.createElement("div");
  el.id = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 2600);
}

/* ---------- Theme ---------- */
function applyTheme() {
  document.documentElement.dataset.theme = S.theme;
  $$("#theme-picker button").forEach((b) => b.classList.toggle("active", b.dataset.t === S.theme));
}

/* ---------- Navigation ---------- */
function switchApp(name) {
  $$(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.app === name));
  $$(".app-view").forEach((v) => v.classList.toggle("hidden", v.id !== "view-" + name));
}
$$(".nav-btn").forEach((b) => b.addEventListener("click", () => switchApp(b.dataset.app)));

/* ---------- Modals ---------- */
function openModal(id) {
  $("#modal-backdrop").classList.remove("hidden");
  $("#" + id).classList.remove("hidden");
  $("#" + id).querySelector("input, select, textarea")?.focus();
}
function closeModals() {
  $("#modal-backdrop").classList.add("hidden");
  $$(".modal").forEach((m) => m.classList.add("hidden"));
}
$("#modal-backdrop").addEventListener("click", closeModals);
$$("[data-close]").forEach((b) => b.addEventListener("click", closeModals));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModals(); });

/* ---------- Helpers ---------- */
const acct = (id) => S.accounts.find((a) => a.id === id);
const fmtTime = (ts) => {
  const d = new Date(ts), now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};
const fmtDate = (isoStr) =>
  new Date(isoStr + "T00:00").toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
const avatarColor = (name) => {
  const colors = ["#0071e3", "#34c759", "#ff9500", "#af52de", "#ff3b30", "#5ac8fa", "#ffcc00"];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return colors[h % colors.length];
};

/* ============================================================
   APPLE HAND-OFF (.ics events, .vcf contacts)
   ============================================================ */
function downloadFile(name, content, mime) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
const icsEsc = (s) => String(s ?? "").replace(/\\/g, "\\\\").replace(/[,;]/g, (c) => "\\" + c).replace(/\n/g, "\\n");

function icsForEvent(e) {
  const d = e.date.replace(/-/g, "");
  let dtStart, dtEnd;
  if (e.time) {
    const t = e.time.replace(":", "");
    dtStart = `DTSTART:${d}T${t}00`;
    const [h, m] = e.time.split(":").map(Number);
    const end = new Date(2000, 0, 1, h + 1, m);
    dtEnd = `DTEND:${d}T${String(end.getHours()).padStart(2, "0")}${String(end.getMinutes()).padStart(2, "0")}00`;
  } else {
    dtStart = `DTSTART;VALUE=DATE:${d}`;
    dtEnd = "";
  }
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//AB Workspace//EN", "BEGIN:VEVENT",
    `UID:${e.id || uid()}@ab-workspace`, dtStart, dtEnd,
    `SUMMARY:${icsEsc(e.title)}`,
    e.notes ? `DESCRIPTION:${icsEsc(e.notes)}` : "",
    `CATEGORIES:${e.cat === "business" ? "Business" : "Personal"}`,
    "END:VEVENT", "END:VCALENDAR"].filter(Boolean).join("\r\n");
}

function vcfForContact(c) {
  return ["BEGIN:VCARD", "VERSION:3.0",
    `FN:${c.name}`, `N:${c.name};;;;`,
    c.company ? `ORG:${c.company}` : "",
    c.email ? `EMAIL;TYPE=INTERNET:${c.email}` : "",
    c.phone ? `TEL;TYPE=CELL:${c.phone}` : "",
    "END:VCARD"].filter(Boolean).join("\r\n");
}

/* ============================================================
   TODAY
   ============================================================ */
function renderToday() {
  const now = new Date();
  const h = now.getHours();
  $("#today-greeting").textContent = h < 12 ? "Good morning ☀️" : h < 18 ? "Good afternoon 🌤" : "Good evening 🌙";
  $("#today-date").textContent = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  // Mail summary per account
  const parts = S.accounts.map((a) => {
    const n = S.emails.filter((m) => m.accountId === a.id && m.folder === "inbox" && !m.read).length;
    return `<div class="today-row"><span class="acct-tag ${a.type}">${a.type === "business" ? "Biz" : "Me"}</span> ${esc(a.label)}: <strong>${n} unread</strong></div>`;
  });
  $("#today-mail-summary").innerHTML = parts.join("") || `<p class="hint">No accounts set up.</p>`;

  // Events today + tomorrow
  const iso = (d) => d.toLocaleDateString("sv");
  const todayIso = iso(now);
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  const tomorrowIso = iso(tomorrow);
  const evs = S.events
    .filter((e) => e.date === todayIso || e.date === tomorrowIso)
    .sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
  $("#today-events").innerHTML = evs.length ? evs.map((e) => `
    <div class="today-row">
      <span class="up-dot ${e.cat}"></span>
      <span class="today-when">${e.date === todayIso ? "Today" : "Tomorrow"}${e.time ? " " + e.time : ""}</span>
      <span class="today-what">${esc(e.title)}</span>
      <button class="icon-btn" data-ics="${e.id}" title="Add to Apple Calendar"></button>
    </div>`).join("")
    : `<p class="hint">Nothing scheduled — clear runway.</p>`;
  $$("#today-events [data-ics]").forEach((b) => b.addEventListener("click", () => {
    const e = S.events.find((x) => x.id === b.dataset.ics);
    if (e) { downloadFile(`${e.title}.ics`, icsForEvent(e), "text/calendar"); toast("Open the download to add it to Apple Calendar"); }
  }));

  // Tasks: overdue + today + undated (top 8)
  const tasks = S.reminders
    .filter((r) => !r.done && (!r.date || r.date <= todayIso))
    .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"))
    .slice(0, 8);
  $("#today-tasks").innerHTML = tasks.length ? tasks.map((r) => `
    <div class="today-row">
      <button class="rem-check" data-tcheck="${r.id}" title="Done">✓</button>
      <span class="today-what">${esc(r.title)}</span>
      ${r.date && r.date < todayIso ? `<span class="rem-due overdue">Overdue</span>` : ""}
    </div>`).join("")
    : `<p class="hint">All caught up ✅</p>`;
  $$("#today-tasks [data-tcheck]").forEach((b) => b.addEventListener("click", () => {
    const r = S.reminders.find((x) => x.id === b.dataset.tcheck);
    if (r) { r.done = true; save(); renderReminders(); renderToday(); toast("Nice — done!"); }
  }));
}

$("#today-open-mail").addEventListener("click", () => switchApp("mail"));
$("#today-compose").addEventListener("click", () => openCompose());
$("#today-quick-task").addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const title = e.target.value.trim();
  if (!title) return;
  S.reminders.push({ id: uid(), title, date: new Date().toLocaleDateString("sv"), cat: "personal", done: false });
  e.target.value = "";
  save(); renderReminders(); renderToday(); toast("Task added for today");
});

/* ============================================================
   MAIL
   ============================================================ */
let mailFolder = "inbox";
let mailAccount = "all";
let mailSelected = null;

const FOLDERS = [
  ["inbox", "📥 Inbox"], ["starred", "⭐ Starred"], ["sent", "📤 Sent"],
  ["drafts", "📝 Drafts"], ["archive", "🗂 Archive"], ["trash", "🗑 Trash"],
];

function mailMatches(m) {
  if (mailAccount !== "all" && m.accountId !== mailAccount) return false;
  if (mailFolder === "starred") return m.starred && m.folder !== "trash";
  return m.folder === mailFolder;
}

function renderMailAccounts() {
  const sel = $("#mail-account-filter");
  sel.innerHTML = `<option value="all">All Inboxes</option>` +
    S.accounts.map((a) => `<option value="${a.id}">${esc(a.label)}</option>`).join("");
  sel.value = mailAccount;
  const from = $("#compose-from");
  from.innerHTML = S.accounts.map((a) => `<option value="${a.id}">${esc(a.label)} — ${esc(a.email)}</option>`).join("");
}

function renderFolders() {
  $("#mail-folders").innerHTML = FOLDERS.map(([f, label]) => {
    const count = f === "inbox"
      ? S.emails.filter((m) => m.folder === "inbox" && !m.read && (mailAccount === "all" || m.accountId === mailAccount)).length
      : 0;
    return `<button class="folder-chip ${f === mailFolder ? "active" : ""}" data-f="${f}">${label}${count ? " · " + count : ""}</button>`;
  }).join("");
  $$(".folder-chip").forEach((b) => b.addEventListener("click", () => {
    mailFolder = b.dataset.f; mailSelected = null; renderMail();
  }));
}

function renderMailList() {
  const q = $("#mail-search").value.trim().toLowerCase();
  let list = S.emails.filter(mailMatches);
  if (q) list = list.filter((m) =>
    (m.from + m.fromEmail + m.subject + m.body + m.to).toLowerCase().includes(q));
  list.sort((a, b) => b.date - a.date);
  const el = $("#mail-list");
  if (!list.length) {
    el.innerHTML = `<div class="empty-state" style="padding:40px 0"><div class="empty-icon">📭</div><p>No messages</p></div>`;
    return;
  }
  el.innerHTML = list.map((m) => {
    const a = acct(m.accountId);
    return `<div class="mail-item ${m.read ? "read" : ""} ${m.id === mailSelected ? "selected" : ""}" data-id="${m.id}">
      <div class="mail-top">
        ${m.read ? "" : `<span class="unread-dot"></span>`}
        <span class="mail-from">${esc(m.from)}</span>
        ${a ? `<span class="acct-tag ${a.type}">${a.type === "business" ? "Biz" : "Me"}</span>` : ""}
        <span class="mail-meta">${fmtTime(m.date)}</span>
      </div>
      <div class="mail-subject">${m.starred ? "⭐ " : ""}${esc(m.subject) || "(no subject)"}</div>
      <div class="mail-preview">${esc(m.body.slice(0, 90))}</div>
    </div>`;
  }).join("");
  $$(".mail-item").forEach((it) => it.addEventListener("click", () => openMail(it.dataset.id)));
}

function openMail(id) {
  const m = S.emails.find((x) => x.id === id);
  if (!m) return;
  mailSelected = id;
  if (!m.read) { m.read = true; save(); }
  const a = acct(m.accountId);
  $("#mail-detail").innerHTML = `
    <div class="mail-detail-head">
      <h2>${esc(m.subject) || "(no subject)"}</h2>
      <div class="mail-detail-row">
        <strong style="color:var(--text)">${esc(m.from)}</strong>
        <span>&lt;${esc(m.fromEmail)}&gt;</span>
        ${a ? `<span class="acct-tag ${a.type}">${esc(a.label)}</span>` : ""}
        <span style="margin-left:auto">${new Date(m.date).toLocaleString()}</span>
      </div>
      <div class="mail-detail-row">To: ${esc(m.to)}</div>
      <div class="mail-actions">
        <button class="btn" id="mail-reply">↩️ Reply</button>
        <button class="btn" id="mail-star">${m.starred ? "★ Unstar" : "☆ Star"}</button>
        <button class="btn" id="mail-unread">Mark Unread</button>
        ${m.folder !== "archive" ? `<button class="btn" id="mail-archive">🗂 Archive</button>` : ""}
        <button class="btn btn-danger" id="mail-trash">${m.folder === "trash" ? "Delete Forever" : "🗑 Trash"}</button>
      </div>
    </div>
    <div class="mail-body">${esc(m.body)}</div>`;
  $("#mail-reply").addEventListener("click", () => {
    openCompose({
      from: m.accountId,
      to: m.fromEmail,
      subject: (m.subject.startsWith("Re:") ? "" : "Re: ") + m.subject,
      body: `\n\n---- On ${new Date(m.date).toLocaleString()}, ${m.from} wrote:\n${m.body}`,
    });
  });
  $("#mail-star").addEventListener("click", () => { m.starred = !m.starred; save(); renderMail(); openMail(id); });
  $("#mail-unread").addEventListener("click", () => { m.read = false; mailSelected = null; save(); renderMail(); resetMailDetail(); });
  $("#mail-archive")?.addEventListener("click", () => { m.folder = "archive"; mailSelected = null; save(); renderMail(); resetMailDetail(); toast("Archived"); });
  $("#mail-trash").addEventListener("click", () => {
    if (m.folder === "trash") S.emails = S.emails.filter((x) => x.id !== id);
    else m.folder = "trash";
    mailSelected = null; save(); renderMail(); resetMailDetail(); toast("Deleted");
  });
  renderMailList();
}

function resetMailDetail() {
  $("#mail-detail").innerHTML = `<div class="empty-state"><div class="empty-icon">✉️</div><p>Select a message to read</p></div>`;
}

function renderMail() {
  renderMailAccounts();
  renderFolders();
  renderMailList();
  updateBadges();
}

function openCompose(prefill = {}) {
  renderMailAccounts();
  $("#contact-emails").innerHTML = S.contacts.filter((c) => c.email)
    .map((c) => `<option value="${esc(c.email)}">${esc(c.name)}</option>`).join("");
  $("#compose-from").value = prefill.from || (mailAccount !== "all" ? mailAccount : S.accounts[0]?.id) || "";
  $("#compose-to").value = prefill.to || "";
  $("#compose-subject").value = prefill.subject || "";
  $("#compose-body").value = prefill.body || "";
  openModal("modal-compose");
}

$("#btn-compose").addEventListener("click", () => openCompose());
$("#mail-account-filter").addEventListener("change", (e) => { mailAccount = e.target.value; renderMail(); });
$("#mail-search").addEventListener("input", renderMailList);

$("#compose-send").addEventListener("click", () => {
  const a = acct($("#compose-from").value);
  const to = $("#compose-to").value.trim();
  const subject = $("#compose-subject").value.trim();
  const body = $("#compose-body").value;
  if (!to) { toast("Add a recipient"); return; }
  S.emails.push({
    id: uid(), accountId: a?.id || "", folder: "sent",
    from: "Me", fromEmail: a?.email || "", to, subject, body,
    date: Date.now(), read: true, starred: false,
  });
  save(); renderMail(); closeModals();
  // Hand off to the user's real mail app so it actually sends.
  window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  toast("Opening your mail app to send…");
});

$("#compose-save-draft").addEventListener("click", () => {
  const a = acct($("#compose-from").value);
  S.emails.push({
    id: uid(), accountId: a?.id || "", folder: "drafts",
    from: "Me", fromEmail: a?.email || "",
    to: $("#compose-to").value.trim(),
    subject: $("#compose-subject").value.trim(),
    body: $("#compose-body").value,
    date: Date.now(), read: true, starred: false,
  });
  save(); renderMail(); closeModals(); toast("Draft saved");
});

/* ============================================================
   CALENDAR
   ============================================================ */
let calCursor = new Date();
let editingEventId = null;

function renderCalendar() {
  const y = calCursor.getFullYear(), mo = calCursor.getMonth();
  $("#cal-title").textContent = calCursor.toLocaleDateString([], { month: "long", year: "numeric" });
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  $("#cal-grid-head").innerHTML = days.map((d) => `<div>${d}</div>`).join("");

  const first = new Date(y, mo, 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  const todayIso = new Date().toLocaleDateString("sv");
  let html = "";
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const isoD = d.toLocaleDateString("sv");
    const evs = S.events.filter((e) => e.date === isoD).sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    html += `<div class="cal-cell ${d.getMonth() !== mo ? "other" : ""} ${isoD === todayIso ? "today" : ""} ${evs.length ? "has-ev" : ""}" data-date="${isoD}">
      <div class="d">${d.getDate()}</div>
      ${evs.slice(0, 3).map((e) => `<div class="cal-ev ${e.cat}" data-ev="${e.id}" title="${esc(e.title)}">${e.time ? e.time + " " : ""}${esc(e.title)}</div>`).join("")}
      ${evs.length > 3 ? `<div class="cal-ev" style="background:var(--text-2)">+${evs.length - 3} more</div>` : ""}
    </div>`;
  }
  $("#cal-grid").innerHTML = html;

  $$(".cal-cell").forEach((c) => c.addEventListener("click", (e) => {
    const evId = e.target.closest(".cal-ev")?.dataset.ev;
    if (evId) { openEventModal(evId); return; }
    openEventModal(null, c.dataset.date);
  }));

  // Upcoming (next 14 days)
  const now = new Date().toLocaleDateString("sv");
  const upcoming = S.events
    .filter((e) => e.date >= now)
    .sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")))
    .slice(0, 8);
  $("#cal-upcoming-list").innerHTML = upcoming.length
    ? upcoming.map((e) => `<div class="up-item" data-ev="${e.id}">
        <span class="up-dot ${e.cat}"></span>
        <span class="up-date">${fmtDate(e.date)}${e.time ? " · " + e.time : ""}</span>
        <span>${esc(e.title)}</span>
      </div>`).join("")
    : `<p class="hint">No upcoming events.</p>`;
  $$(".up-item").forEach((el) => el.addEventListener("click", () => openEventModal(el.dataset.ev)));
}

function openEventModal(id, presetDate) {
  editingEventId = id;
  const e = id ? S.events.find((x) => x.id === id) : null;
  $("#event-modal-title").textContent = e ? "Edit Event" : "New Event";
  $("#event-title").value = e?.title || "";
  $("#event-date").value = e?.date || presetDate || new Date().toLocaleDateString("sv");
  $("#event-time").value = e?.time || "";
  $("#event-cat").value = e?.cat || "personal";
  $("#event-notes").value = e?.notes || "";
  $("#event-delete").classList.toggle("hidden", !e);
  openModal("modal-event");
}

$("#btn-new-event").addEventListener("click", () => openEventModal(null));
$("#cal-prev").addEventListener("click", () => { calCursor.setMonth(calCursor.getMonth() - 1); renderCalendar(); });
$("#cal-next").addEventListener("click", () => { calCursor.setMonth(calCursor.getMonth() + 1); renderCalendar(); });
$("#cal-today").addEventListener("click", () => { calCursor = new Date(); renderCalendar(); });

$("#event-save").addEventListener("click", () => {
  const title = $("#event-title").value.trim();
  if (!title) { toast("Give the event a title"); return; }
  const data = {
    title,
    date: $("#event-date").value,
    time: $("#event-time").value,
    cat: $("#event-cat").value,
    notes: $("#event-notes").value,
  };
  if (editingEventId) Object.assign(S.events.find((x) => x.id === editingEventId), data);
  else S.events.push({ id: uid(), ...data });
  save(); renderCalendar(); renderToday(); closeModals(); toast("Event saved");
});
$("#event-delete").addEventListener("click", () => {
  S.events = S.events.filter((x) => x.id !== editingEventId);
  save(); renderCalendar(); renderToday(); closeModals(); toast("Event deleted");
});
$("#event-apple").addEventListener("click", () => {
  const title = $("#event-title").value.trim() || "Event";
  const ev = {
    id: editingEventId || uid(), title,
    date: $("#event-date").value, time: $("#event-time").value,
    cat: $("#event-cat").value, notes: $("#event-notes").value,
  };
  if (!ev.date) { toast("Pick a date first"); return; }
  downloadFile(`${title}.ics`, icsForEvent(ev), "text/calendar");
  toast("Open the download — it lands in Apple Calendar & syncs everywhere");
});

/* ============================================================
   REMINDERS
   ============================================================ */
let reminderFilter = "all";

function renderReminders() {
  let list = [...S.reminders];
  if (reminderFilter === "done") list = list.filter((r) => r.done);
  else {
    if (reminderFilter !== "all") list = list.filter((r) => r.cat === reminderFilter);
    list = list.filter((r) => !r.done).concat(list.filter((r) => r.done));
  }
  list.sort((a, b) => (a.done - b.done) || (a.date || "9999").localeCompare(b.date || "9999"));
  const todayIso = new Date().toLocaleDateString("sv");
  $("#reminder-list").innerHTML = list.length ? list.map((r) => `
    <div class="rem-item ${r.done ? "done" : ""}">
      <button class="rem-check" data-id="${r.id}" title="Toggle">✓</button>
      <div class="rem-body">
        <div class="rem-title">${esc(r.title)}</div>
        ${r.date ? `<div class="rem-due ${!r.done && r.date < todayIso ? "overdue" : ""}">${fmtDate(r.date)}${!r.done && r.date < todayIso ? " · Overdue" : ""}</div>` : ""}
      </div>
      <span class="acct-tag ${r.cat}">${r.cat === "business" ? "Biz" : "Me"}</span>
      <button class="icon-btn" data-del="${r.id}" title="Delete">🗑</button>
    </div>`).join("")
    : `<div class="empty-state" style="padding:60px 0"><div class="empty-icon">✅</div><p>Nothing here — enjoy the calm</p></div>`;

  $$(".rem-check").forEach((b) => b.addEventListener("click", () => {
    const r = S.reminders.find((x) => x.id === b.dataset.id);
    r.done = !r.done; save(); renderReminders(); updateBadges();
  }));
  $$("[data-del]").forEach((b) => b.addEventListener("click", () => {
    S.reminders = S.reminders.filter((x) => x.id !== b.dataset.del);
    save(); renderReminders(); updateBadges();
  }));
  updateBadges();
}

$$("#reminder-filter button").forEach((b) => b.addEventListener("click", () => {
  reminderFilter = b.dataset.f;
  $$("#reminder-filter button").forEach((x) => x.classList.toggle("active", x === b));
  renderReminders();
}));
$("#btn-new-reminder").addEventListener("click", () => {
  $("#reminder-title").value = "";
  $("#reminder-date").value = "";
  $("#reminder-cat").value = "personal";
  openModal("modal-reminder");
});
$("#reminder-save").addEventListener("click", () => {
  const title = $("#reminder-title").value.trim();
  if (!title) { toast("Give the reminder a title"); return; }
  S.reminders.push({ id: uid(), title, date: $("#reminder-date").value, cat: $("#reminder-cat").value, done: false });
  save(); renderReminders(); closeModals(); toast("Reminder added");
});

/* ============================================================
   NOTES
   ============================================================ */
let noteSelected = null;

function renderNoteList() {
  const q = $("#note-search").value.trim().toLowerCase();
  let list = [...S.notes].sort((a, b) => b.updated - a.updated);
  if (q) list = list.filter((n) => (n.title + n.body).toLowerCase().includes(q));
  $("#note-list").innerHTML = list.length ? list.map((n) => `
    <div class="note-item ${n.id === noteSelected ? "selected" : ""}" data-id="${n.id}">
      <div class="t">${esc(n.title) || "New Note"}</div>
      <div class="p">${esc(n.body.replace(/\n/g, " ").slice(0, 60)) || "No additional text"}</div>
    </div>`).join("")
    : `<div class="empty-state" style="padding:40px 0"><div class="empty-icon">📝</div><p>No notes</p></div>`;
  $$(".note-item").forEach((it) => it.addEventListener("click", () => openNote(it.dataset.id)));
}

function openNote(id) {
  const n = S.notes.find((x) => x.id === id);
  if (!n) return;
  noteSelected = id;
  $("#note-editor").innerHTML = `
    <div class="note-toolbar">
      <span class="note-date">Edited ${new Date(n.updated).toLocaleString()}</span>
      <button class="btn btn-danger" id="note-delete">🗑 Delete</button>
    </div>
    <input id="note-title-input" placeholder="Title" value="${esc(n.title)}">
    <textarea id="note-body-input" placeholder="Start writing…">${esc(n.body)}</textarea>`;
  const persist = () => {
    n.title = $("#note-title-input").value;
    n.body = $("#note-body-input").value;
    n.updated = Date.now();
    save(); renderNoteList();
  };
  $("#note-title-input").addEventListener("input", persist);
  $("#note-body-input").addEventListener("input", persist);
  $("#note-delete").addEventListener("click", () => {
    S.notes = S.notes.filter((x) => x.id !== id);
    noteSelected = null; save(); renderNoteList();
    $("#note-editor").innerHTML = `<div class="empty-state"><div class="empty-icon">📝</div><p>Select or create a note</p></div>`;
    toast("Note deleted");
  });
  renderNoteList();
}

$("#btn-new-note").addEventListener("click", () => {
  const n = { id: uid(), title: "", body: "", updated: Date.now() };
  S.notes.push(n); save();
  openNote(n.id);
  $("#note-title-input").focus();
});
$("#note-search").addEventListener("input", renderNoteList);

/* ============================================================
   CONTACTS
   ============================================================ */
let editingContactId = null;

function renderContacts() {
  const q = $("#contact-search").value.trim().toLowerCase();
  let list = [...S.contacts].sort((a, b) => a.name.localeCompare(b.name));
  if (q) list = list.filter((c) => (c.name + c.email + c.company).toLowerCase().includes(q));
  $("#contact-list").innerHTML = list.length ? list.map((c) => {
    const initials = c.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    return `<div class="contact-item" data-id="${c.id}">
      <div class="avatar" style="background:${avatarColor(c.name)}">${esc(initials)}</div>
      <div class="contact-body">
        <div class="contact-name">${esc(c.name)}</div>
        <div class="contact-sub">${esc([c.company, c.email, c.phone].filter(Boolean).join(" · "))}</div>
      </div>
      <span class="acct-tag ${c.type}">${c.type === "business" ? "Biz" : "Me"}</span>
      <div class="contact-actions">
        ${c.email ? `<a href="mailto:${esc(c.email)}" title="Email" onclick="event.stopPropagation()">✉️</a>` : ""}
        ${c.phone ? `<a href="tel:${esc(c.phone.replace(/\s/g, ""))}" title="Call" onclick="event.stopPropagation()">📞</a>` : ""}
      </div>
    </div>`;
  }).join("")
    : `<div class="empty-state" style="padding:60px 0"><div class="empty-icon">👤</div><p>No contacts yet</p></div>`;
  $$(".contact-item").forEach((it) => it.addEventListener("click", () => openContactModal(it.dataset.id)));
}

function openContactModal(id) {
  editingContactId = id;
  const c = id ? S.contacts.find((x) => x.id === id) : null;
  $("#contact-modal-title").textContent = c ? "Edit Contact" : "New Contact";
  $("#contact-name").value = c?.name || "";
  $("#contact-email").value = c?.email || "";
  $("#contact-phone").value = c?.phone || "";
  $("#contact-company").value = c?.company || "";
  $("#contact-type").value = c?.type || "personal";
  $("#contact-delete").classList.toggle("hidden", !c);
  openModal("modal-contact");
}

$("#btn-new-contact").addEventListener("click", () => openContactModal(null));
$("#contact-search").addEventListener("input", renderContacts);
$("#contact-save").addEventListener("click", () => {
  const name = $("#contact-name").value.trim();
  if (!name) { toast("Name is required"); return; }
  const data = {
    name,
    email: $("#contact-email").value.trim(),
    phone: $("#contact-phone").value.trim(),
    company: $("#contact-company").value.trim(),
    type: $("#contact-type").value,
  };
  if (editingContactId) Object.assign(S.contacts.find((x) => x.id === editingContactId), data);
  else S.contacts.push({ id: uid(), ...data });
  save(); renderContacts(); closeModals(); toast("Contact saved");
});
$("#contact-delete").addEventListener("click", () => {
  S.contacts = S.contacts.filter((x) => x.id !== editingContactId);
  save(); renderContacts(); closeModals(); toast("Contact deleted");
});
$("#contact-apple").addEventListener("click", () => {
  const c = {
    name: $("#contact-name").value.trim() || "Contact",
    email: $("#contact-email").value.trim(),
    phone: $("#contact-phone").value.trim(),
    company: $("#contact-company").value.trim(),
  };
  downloadFile(`${c.name}.vcf`, vcfForContact(c), "text/vcard");
  toast("Open the download — it saves into Apple Contacts & syncs everywhere");
});

/* ============================================================
   SETTINGS
   ============================================================ */
function renderAccounts() {
  $("#account-list").innerHTML = S.accounts.map((a) => `
    <div class="account-row">
      <div class="avatar" style="width:34px;height:34px;font-size:12px;background:${a.type === "business" ? "var(--purple)" : "var(--green)"}">${a.type === "business" ? "B" : "P"}</div>
      <div class="account-info">
        <div class="account-label">${esc(a.label)}</div>
        <div class="account-email">${esc(a.email)}</div>
      </div>
      <button class="icon-btn" data-acc-del="${a.id}" title="Remove">🗑</button>
    </div>`).join("") || `<p class="hint">No accounts yet.</p>`;
  $$("[data-acc-del]").forEach((b) => b.addEventListener("click", () => {
    if (S.accounts.length <= 1) { toast("Keep at least one account"); return; }
    S.accounts = S.accounts.filter((a) => a.id !== b.dataset.accDel);
    if (mailAccount === b.dataset.accDel) mailAccount = "all";
    save(); renderAccounts(); renderMail();
  }));
}

$("#btn-add-account").addEventListener("click", () => {
  $("#account-label").value = "";
  $("#account-email").value = "";
  $("#account-type").value = "business";
  openModal("modal-account");
});
$("#account-save").addEventListener("click", () => {
  const label = $("#account-label").value.trim();
  const email = $("#account-email").value.trim();
  if (!label || !email) { toast("Label and email are required"); return; }
  S.accounts.push({ id: uid(), label, email, type: $("#account-type").value });
  save(); renderAccounts(); renderMail(); closeModals(); toast("Account added");
});

$$("#theme-picker button").forEach((b) => b.addEventListener("click", () => {
  S.theme = b.dataset.t; save(); applyTheme();
}));

$("#btn-export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `ab-workspace-backup-${new Date().toLocaleDateString("sv")}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast("Backup downloaded");
});
$("#btn-import").addEventListener("click", () => $("#import-file").click());
$("#import-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data.accounts || !data.emails) throw new Error("bad format");
      S = data; save(); renderAll(); toast("Backup restored");
    } catch { toast("That file doesn't look like a Workspace backup"); }
  };
  reader.readAsText(file);
  e.target.value = "";
});
$("#btn-reset").addEventListener("click", () => {
  if (!confirm("Erase all Workspace data on this device? Export a backup first if you want to keep it.")) return;
  S = defaultState(); save(); renderAll(); toast("Workspace reset");
});

/* ============================================================
   BADGES + INIT
   ============================================================ */
function updateBadges() {
  const unread = S.emails.filter((m) => m.folder === "inbox" && !m.read).length;
  $("#badge-mail").textContent = unread || "";
  const todayIso = new Date().toLocaleDateString("sv");
  const due = S.reminders.filter((r) => !r.done && r.date && r.date <= todayIso).length;
  $("#badge-reminders").textContent = due || "";
  renderToday();
}

function renderAll() {
  applyTheme();
  renderMail();
  renderCalendar();
  renderReminders();
  renderNoteList();
  renderContacts();
  renderAccounts();
  renderToday();
  updateBadges();
}

renderAll();
})();
