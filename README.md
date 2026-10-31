# PRIVATE RATE LAB — Experimental Edition

A mobile-first, frontend-only prototype for exploring consent, privacy controls, respectful feedback and personal data awareness.

**This is a local interactive concept demo, not a production adult-content platform.** It uses synthetic sample data only. It has no backend, no user accounts, no remote reviewer network, no intimate-media upload, no third-party AI API and no public gallery.

## Included experiences

- Privacy Control Room — live local permission switches and consequence preview.
- Consent Universe — interactive radial permission controls.
- Privacy Time Machine — simulated session lifecycle and expiry previews.
- Private Room Studio — local room preview, sample invite code and consent receipt.
- Reality Preview Lens — owner, reviewer and limited preview modes.
- Boundary DNA — configurable local preference profile.
- Feedback Translator — local phrase rules, no AI API.
- Emotion Shield — check-in, results hiding and a break timer.
- Blind Review Theater — simulated reviewer, safety reviewer and owner perspectives.
- Rating DNA Map — synthetic feedback-quality radar chart.
- Consent Replay — local event timeline.
- Feedback Weather — visual summary of fictional sample feedback.
- What-If Studio — compare hypothetical settings.
- Digital Privacy Shadow — inspect app-scoped browser storage.
- Safety Playground — practice moderation actions on fictional reports.
- Quick Exit — neutral-screen visual demo (not a device-security feature).
- Privacy Escape Room — privacy learning mini-game.
- Feedback Composer — build a custom checklist.
- Consent Simulator — apply local consent presets.
- Personal Score Museum — synthetic feedback-quality exhibit history.
- Boundary Challenge — short respectful-interaction scenarios.
- Settings & Data — JSON export, password-protected encrypted backup, restore and reset.

## Run it on your phone or computer

The app uses JavaScript ES modules and browser APIs. Run it from a local web server (not by opening `index.html` as a `file://` URL).

### Option A — GitHub Codespaces

1. Create a repository named `private-rate-lab` on GitHub.
2. Upload this project folder's contents to the repository root.
3. Open the repository on GitHub and choose **Code → Codespaces → Create codespace on main**.
4. In the terminal, run:

   ```bash
   python3 -m http.server 8000
   ```

5. Open the forwarded port 8000 preview. On mobile, open the forwarded URL in Chrome.

### Option B — GitHub Pages (static demo only)

1. Push the project files to the repository root.
2. Open **Settings → Pages**.
3. Choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Wait for GitHub Pages to publish the static demo.

Use only synthetic demo data. Review GitHub Pages terms and your legal/compliance obligations before publishing any adult-oriented or sensitive-data product. GitHub Pages is static hosting and does not provide a backend, private user accounts or server-side access control.

## Test the project

Node.js 20+ is recommended for the included smoke tests:

```bash
npm test
npm run check
```

No npm dependencies are required.

## Local data and encryption

- Demo settings and event history are stored in this browser's `localStorage` namespace.
- The app does not sync data to a server.
- The encrypted backup feature uses Web Crypto PBKDF2-SHA-256 (310,000 iterations) to derive an AES-256-GCM key. The password is not stored.
- A forgotten backup password cannot be recovered.
- Local browser storage is not a secure vault. Anyone with access to your unlocked browser profile may be able to inspect it.
- The readable JSON export is not encrypted.
- Resetting the app does not delete downloaded exports or copies outside this app's storage namespace.

## Important technical boundaries

- The age confirmation dialog is a prototype gate, not identity or age verification.
- Preview modes, role simulation, consent replay and expiry are local demonstrations. They do not enforce remote access permissions.
- Browser-side deletion cannot revoke screenshots or copies made outside the app.
- The feedback translator uses a small local rule set. It is not a trained AI model.
- The radar map, weather summary and museum entries use fictional sample values.
- No photos or other intimate media can be uploaded in this version.

## Folder structure

```text
private-rate-lab/
├── index.html
├── manifest.webmanifest
├── sw.js
├── package.json
├── README.md
├── css/styles.css
├── js/app.js
├── js/store.js
├── js/security.js
├── assets/icon.svg
├── tests/smoke.test.js
└── .github/workflows/tests.yml
```

## Version

`0.1.0` — Experimental frontend prototype.
