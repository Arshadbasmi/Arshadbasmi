# AB Workspace

A private, Apple-style productivity hub for managing **personal and business life** in one place — right in the browser, with no servers and no sign-up.

## Apps included

| App | What it does |
|---|---|
| ✉️ **Mail** | Manage multiple email accounts (personal + company) with a unified inbox, folders (Inbox, Starred, Sent, Drafts, Archive, Trash), search, reply, and compose. Sending hands off to your real mail app (Apple Mail, Gmail, Outlook…) via `mailto:`, so messages go out from your actual account. |
| 📅 **Calendar** | Month view with color-coded personal (green) and business (purple) events, an upcoming-events list, and quick add/edit/delete. |
| ✅ **Reminders** | Personal and business lists, due dates, overdue highlighting, and a badge for what's due today. |
| 📝 **Notes** | Searchable notes with autosave, Apple Notes-style list + editor layout. |
| 👤 **Contacts** | Personal/business contacts with one-tap **email** and **call** links. |
| ⚙️ **Settings** | Add/remove email accounts, light/dark/auto theme, and full backup export/import as JSON. |

## Privacy

All data lives in your browser's `localStorage` on your device. Nothing is uploaded anywhere. Use **Settings → Export Backup** to save a JSON backup or move your data to another device.

## Run it

No build step — it's plain HTML/CSS/JS:

- **Locally:** open `index.html` in any browser, or serve the folder (`python3 -m http.server`).
- **GitHub Pages:** the included workflow (`.github/workflows/pages.yml`) deploys automatically on every push to `main`. Enable it once under **Settings → Pages → Source → GitHub Actions**.

## Use it like a native Apple app

1. Open the deployed URL in **Safari** on iPhone, iPad, or Mac.
2. Tap **Share → Add to Home Screen** (or **Add to Dock** on macOS).
3. It launches full-screen with its own icon, like an App Store app.

Works in light and dark mode, on phones, tablets, and desktops.
