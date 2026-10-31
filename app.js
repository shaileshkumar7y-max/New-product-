import { loadState, saveState, clearState, DEFAULT_STATE, snapshotState } from './store.js';
import { encryptBackup, decryptBackup, downloadText } from './security.js';

let state = loadState();
let currentRoute = 'home';
let challengeIndex = 0;
let quizAnswered = false;
let previewMode = state.previewMode || 'reviewer';

const appContent = document.getElementById('appContent');
const mainNav = document.getElementById('mainNav');
const mobileNav = document.getElementById('mobileNav');
const pageTitle = document.getElementById('pageTitle');
const sectionEyebrow = document.getElementById('sectionEyebrow');
const sidebar = document.getElementById('sidebar');
const toastRegion = document.getElementById('toastRegion');

const navGroups = [
  { label: 'OVERVIEW', items: [
    ['home', '⌂', 'Command Center'], ['control', '◈', 'Privacy Control Room'], ['consent', '◎', 'Consent Universe'], ['preview', '◉', 'Reality Preview Lens'], ['room', '▣', 'Private Room Studio']
  ]},
  { label: 'EXPERIMENTS', items: [
    ['time', '◷', 'Privacy Time Machine'], ['boundary', '✳', 'Boundary DNA'], ['translator', '✎', 'Feedback Translator'], ['shield', '♡', 'Emotion Shield'], ['blind', '◌', 'Blind Review Theater'], ['insights', '⌁', 'Rating DNA Map'], ['replay', '↺', 'Consent Replay'], ['weather', '☼', 'Feedback Weather'], ['whatif', '⌘', 'What-If Studio']
  ]},
  { label: 'CREATIVE LAB', items: [
    ['shadow', '◐', 'Digital Privacy Shadow'], ['safety', '⚑', 'Safety Playground'], ['escape', '◇', 'Privacy Escape Room'], ['composer', '＋', 'Feedback Composer'], ['simulator', '▣', 'Consent Simulator'], ['museum', '▤', 'Personal Score Museum'], ['challenge', '⚑', 'Boundary Challenge']
  ]}
];
const titles = Object.fromEntries(navGroups.flatMap(group => group.items.map(item => [item[0], item[2]])));
titles.settings = 'Settings & Data';

function icon(name) { return `<span class="nav-icon" aria-hidden="true">${name}</span>`; }
function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function persist() {
  const ok = saveState(state);
  if (!ok) toast('Browser storage is full or unavailable. Export your work and clear unused data.', 'warn');
}
function logEvent(title, detail, type = 'activity') {
  state.events.unshift({ time: Date.now(), title, detail, type });
  state.events = state.events.slice(0, 40);
  persist();
}
function toast(message, type = 'ok') {
  const node = document.createElement('div');
  node.className = 'toast';
  node.textContent = message;
  if (type === 'warn') node.style.borderColor = '#f3c77b70';
  if (type === 'error') node.style.borderColor = '#fa818d70';
  toastRegion.appendChild(node);
  window.setTimeout(() => node.remove(), 3400);
}
function fmtTime(timestamp) {
  try { return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp)); }
  catch { return 'Recently'; }
}
function fmtDate(timestamp) {
  try { return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp)); }
  catch { return 'Recently'; }
}
function pageIntro(kicker, title, description, actions = '') {
  return `<div class="page-intro"><div><div class="eyebrow">${kicker}</div><h2>${title}</h2><p>${description}</p></div>${actions ? `<div class="page-actions">${actions}</div>` : ''}</div>`;
}
function card(title, description, body, symbol = '✦', extraClass = '') {
  return `<section class="card ${extraClass}"><div class="card-header"><div><h3>${title}</h3>${description ? `<p>${description}</p>` : ''}</div><span class="card-symbol">${symbol}</span></div>${body}</section>`;
}
function metric(label, value, detail, iconText = '✦') {
  return `<div class="card metric-card"><div class="row-label"><span class="card-symbol">${iconText}</span><span class="metric-label">${label}</span></div><div class="metric-value">${value}</div><div class="metric-foot">${detail}</div></div>`;
}
function button(label, action, cls = 'btn-secondary', extra = '') {
  return `<button class="btn ${cls}" data-action="${action}" ${extra}>${label}</button>`;
}
function toggle(label, key, sub, checked) {
  return `<div class="list-row"><div class="row-label"><span class="row-icon">${label.icon || '◈'}</span><div><div class="row-title">${label.title}</div><div class="row-sub">${sub}</div></div></div><button class="toggle" role="switch" aria-checked="${checked}" aria-pressed="${checked}" data-toggle="${key}" aria-label="Toggle ${label.title}"></button></div>`;
}
function renderNav() {
  mainNav.innerHTML = navGroups.map(group => `<div class="nav-group-label">${group.label}</div>${group.items.map(([route, ico, label]) => `<button class="nav-link ${currentRoute === route ? 'active' : ''}" data-route="${route}">${icon(ico)}<span>${label}</span>${route === 'control' ? '<span class="nav-count">5</span>' : ''}</button>`).join('')}`).join('');
  const mobileItems = [['home','⌂','Home'],['control','◈','Control'],['consent','◎','Consent'],['insights','⌁','Insights']];
  mobileNav.innerHTML = mobileItems.map(([route, ico, label]) => `<button class="nav-link ${currentRoute === route ? 'active' : ''}" data-route="${route}">${icon(ico)}<span>${label}</span></button>`).join('');
  document.querySelectorAll('[data-route]').forEach(el => el.classList.toggle('active', el.dataset.route === currentRoute));
}
function setRoute(route) {
  if (!titles[route]) route = 'home';
  currentRoute = route;
  pageTitle.textContent = titles[route];
  sectionEyebrow.textContent = route === 'home' ? 'YOUR PRIVATE WORKSPACE' : route === 'settings' ? 'LOCAL DATA & PREFERENCES' : 'EXPERIMENTAL FEATURE';
  sidebar.classList.remove('open');
  renderNav();
  renderPage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function permissionsEnabledCount() {
  return Object.values(state.permissions).filter(Boolean).length;
}
function consentPreview() {
  const entries = [
    ['view', 'View approved demo card', 'Reviewer can see the synthetic preview.'],
    ['feedback', 'Submit feedback', 'Reviewer can complete the feedback form.'],
    ['comments', 'Write comments', 'Reviewer can add a written note.'],
    ['save', 'Save a local copy', 'Reviewer can save a demo summary.'],
    ['expiry', 'Use session expiry', 'This demo session has a simulated end time.']
  ];
  return entries.filter(([key]) => state.permissions[key]);
}

function pageHome() {
  const lastEvent = state.events[0];
  const recent = state.events.slice(0, 4).map(event => `<div class="list-row"><div class="row-label"><span class="row-icon">${event.type === 'consent' ? '◎' : event.type === 'preview' ? '◉' : '✦'}</span><div><div class="row-title">${escapeHtml(event.title)}</div><div class="row-sub">${escapeHtml(event.detail)}</div></div></div><span class="row-sub">${fmtTime(event.time)}</span></div>`).join('');
  const shortcuts = [
    ['control','◈','Privacy Control Room','Operate all demo permissions in one place.'],
    ['consent','◎','Consent Universe','Explore the interactive permission wheel.'],
    ['preview','◉','Reality Preview Lens','Switch between owner and reviewer views.'],
    ['whatif','⌘','What-If Studio','Compare different hypothetical session setups.'],
    ['shadow','◐','Digital Privacy Shadow','Inspect what this browser stores locally.'],
    ['escape','◇','Privacy Escape Room','Learn privacy basics through mini challenges.']
  ];
  return `${pageIntro('EXPERIMENTAL WORKSPACE', 'A calmer, more controlled feedback space.', 'Explore an interactive product concept built around personal boundaries, informed choices and private-by-default experiences.', button('Open Control Room →','go-control','btn-primary'))}
    <div class="grid grid-4" style="margin-bottom:15px">${metric('ACTIVE DEMO SESSION', state.sessionActive ? 'Active' : 'Paused', 'Local simulation only', '◉')}${metric('PERMISSIONS ENABLED', `${permissionsEnabledCount()} / 5`, 'You control each switch', '◎')}${metric('BOUNDARY PREFERENCES', state.boundaries.length + state.customBoundaries.length, 'Personal settings selected', '✳')}${metric('ACTIVITY EVENTS', state.events.length, 'Stored in this browser', '↺')}</div>
    <div class="grid grid-2" style="margin-bottom:15px"><section class="card hero-card span-2"><div class="hero-content"><span class="tag tag-violet">SIGNATURE EXPERIENCE</span><h2>Your choices. Your boundaries.<br>Your control room.</h2><p>Try live consent controls, preview what a reviewer would see, and experiment with session scenarios. Every interaction here is a local simulation using synthetic demo data.</p><div class="hero-actions">${button('Launch Privacy Control Room →','go-control','btn-primary')}${button('Explore all experiments','go-challenge','btn-secondary')}</div></div></section></div>
    <div class="grid grid-2"><div>${card('Explore the Lab','Six starting points for the experience',shortcuts.map(([route,ico,title,desc])=>`<button class="feature-tile" data-route="${route}" style="width:100%;text-align:left;margin-bottom:8px;color:inherit"><span class="tile-icon">${ico}</span><span><strong>${title}</strong><small>${desc}</small></span><span style="margin-left:auto;color:#858098">↗</span></button>`).join(''),'✦')}</div>
    <div>${card('Recent activity','A local-only event trail',recent || '<div class="empty-state">No activity yet.</div>','↺')}${card('Prototype boundaries','What this version does and does not do',`<div class="notice notice-success"><strong>Works now:</strong> local interactions, simulated reviewer views, browser storage, export/import, responsive layout and offline shell.</div><div class="divider"></div><div class="notice notice-warn"><strong>Not included:</strong> real accounts, backend, remote reviewers, real intimate-media uploads, identity checks or guaranteed screenshot prevention.</div>`,'盾')}</div></div>`;
}

function pageControl() {
  const defs = [
    ['view','View permission','Allow the simulated reviewer to see the demo card','◉'],
    ['feedback','Feedback permission','Allow the simulated reviewer to submit a response','✎'],
    ['comments','Comment permission','Allow optional written feedback','≋'],
    ['save','Save permission','Allow a demo summary to be saved in this browser','▣'],
    ['expiry','Session expiry','Show the simulated automatic expiry timer','◷']
  ];
  const switches = defs.map(([key,title,desc,ico]) => toggle({ title, icon: ico }, key, desc, state.permissions[key])).join('');
  const preview = consentPreview();
  return `${pageIntro('SIGNATURE FEATURE · 01', 'Privacy Control Room', 'One control surface for the entire demo experience. Change a permission and watch the reviewer preview respond immediately.', button('Emergency revoke','revoke-all','btn-danger'))}
    <div class="grid grid-2"><div>${card('Permission console','Each switch controls a separate demo capability',`${switches}<div class="divider"></div><div class="progress-label"><span>Enabled permissions</span><strong>${permissionsEnabledCount()} / 5</strong></div><div class="progress"><span style="width:${permissionsEnabledCount()*20}%"></span></div>`,'◈')}
    ${card('Live consequence preview','What the simulated reviewer can access right now',`<div class="preview-frame"><div class="preview-top"><div><strong style="font-size:11px">Reviewer access</strong><div class="row-sub">SIMULATED VIEW</div></div><span class="tag ${state.sessionActive ? 'tag-green':'tag-red'}">${state.sessionActive?'SESSION ACTIVE':'REVOKED'}</span></div>${state.sessionActive && state.permissions.view ? `<div class="preview-placeholder"><div><strong>Approved demo card</strong>Synthetic placeholder content only</div></div>` : `<div class="preview-placeholder"><div><strong>Content unavailable</strong>View permission is off or the session was revoked.</div></div>`}<div class="tag-list" style="margin-top:12px">${preview.map(item=>`<span class="stat-chip">✓ ${item[1]}</span>`).join('') || '<span class="muted small">No permissions enabled.</span>'}</div></div><div class="small muted" style="margin-top:10px">This is a same-device preview, not a real remote access-control system.</div>`,'◉')}</div>
    <div class="grid grid-2">${card('Session controls','Manage the simulated review room',`<div class="list-row"><div><div class="row-title">Session status</div><div class="row-sub">Start or pause the demo session</div></div><span class="tag ${state.sessionActive?'tag-green':'tag-amber'}">${state.sessionActive?'ACTIVE':'PAUSED'}</span></div><div class="row" style="display:flex;gap:8px;margin-top:14px">${button(state.sessionActive?'Pause session':'Resume session','toggle-session','btn-secondary')}${button('Reset permissions','reset-permissions','btn-ghost')}</div>`,'◷')}
    ${card('Live control summary','A consequence is shown before a setting is relied on',`<div class="notice"><strong>Design principle</strong><br>Every permission should have a clear purpose, an understandable consequence and an easy off switch.</div><div class="divider"></div><div class="row-label"><span class="row-icon">⌁</span><div><div class="row-title">Session expiry</div><div class="row-sub">${state.expiryMinutes} minutes in this simulation</div></div></div><input type="range" min="5" max="120" step="5" value="${state.expiryMinutes}" data-range="expiryMinutes" style="width:100%;accent-color:#9b83ff;margin:14px 0 5px"><div class="progress-label"><span>5 min</span><strong id="expiryValue">${state.expiryMinutes} min</strong><span>120 min</span></div>`,'⌁')}</div></div>`;
}

function pageConsent() {
  const nodes = [
    ['view','◉','View','See demo card'],['feedback','✎','Feedback','Submit response'],['comments','≋','Comments','Write a note'],['save','▣','Save','Save summary'],['expiry','◷','Expiry','Timed session']
  ];
  return `${pageIntro('EXPERIMENTAL FEATURE · 02', 'Consent Universe', 'Explore consent as a visual system. Tap each orbit to enable or disable one simulated permission, then inspect the consequence.', button('Reset universe','reset-permissions','btn-secondary'))}
    <div class="grid grid-2"><div class="card"><div class="card-header"><div><h3>Permission orbit</h3><p>Every orbit represents a separate choice.</p></div><span class="tag tag-violet">INTERACTIVE</span></div><div class="radial-stage"><div class="radial-center"><div><strong>YOUR<br>BOUNDARIES</strong><small>CONTROL CENTER</small></div></div>${nodes.map(([key,ico,label,desc])=>`<button class="orbit-node ${state.permissions[key]?'on':''}" data-node="${key}" aria-pressed="${state.permissions[key]}"><span>${ico}</span>${label}<small style="display:block;color:#9c96b7;font-size:8px">${state.permissions[key]?'ENABLED':'DISABLED'}</small></button>`).join('')}</div><div class="small muted" style="text-align:center;margin-top:12px">Tap any orbit node to change its state.</div></div>
    <div>${card('Live consent map','Your current choices',nodes.map(([key,ico,label,desc])=>`<div class="list-row"><div class="row-label"><span class="row-icon">${ico}</span><div><div class="row-title">${label}</div><div class="row-sub">${desc}</div></div></div><span class="tag ${state.permissions[key]?'tag-green':'tag-amber'}">${state.permissions[key]?'ON':'OFF'}</span></div>`).join(''),'◎')}${card('Consequence note','A clear choice is better than a hidden default',`<div class="notice notice-success">${permissionsEnabledCount()} capabilities are enabled. The live reviewer preview uses only these demo choices.</div>`,'✦')}</div></div>`;
}

function pageTime() {
  const points = [
    ['Now','Current simulated access','Permissions match your current control settings.','done'],
    ['+ 1 minute','Session still active','A reviewer preview remains available while the session is active.','done'],
    [`+ ${state.expiryMinutes} minutes`,'Scheduled expiry','The simulated session reaches its selected expiry point.',''],
    ['After expiry','No active session','The preview should show that the session has ended.',''],
    ['After revoke','Owner ends access','The owner can end the session immediately in this prototype.','']
  ];
  return `${pageIntro('EXPERIMENTAL FEATURE · 03', 'Privacy Time Machine', 'Move along a simulated timeline to understand how access changes over time. This is a visual what-if model, not a real remote timer.', button('Run expiry simulation','simulate-expiry','btn-primary'))}
    <div class="grid grid-2"><div>${card('Session timeline','Choose a moment to preview',`<div class="timeline">${points.map((point,i)=>`<div class="timeline-item ${i < 2?'done':''}"><strong>${point[0]} · ${point[1]}</strong><small>${point[2]}</small></div>`).join('')}</div><div class="divider"></div><div class="field"><label class="field-label">Session duration · ${state.expiryMinutes} minutes</label><input type="range" min="5" max="120" step="5" value="${state.expiryMinutes}" data-range="expiryMinutes" style="width:100%;accent-color:#9b83ff"></div>`,'◷')}</div>
    <div>${card('Time travel preview','Select a scenario',`<div class="grid grid-2"><button class="feature-tile" data-time="now"><span class="tile-icon">◉</span><span><strong>Right now</strong><small>Show current session</small></span></button><button class="feature-tile" data-time="expired"><span class="tile-icon">⌛</span><span><strong>After expiry</strong><small>Preview expired state</small></span></button><button class="feature-tile" data-time="revoked"><span class="tile-icon">⊘</span><span><strong>After revoke</strong><small>Preview revoked state</small></span></button><button class="feature-tile" data-time="extended"><span class="tile-icon">↗</span><span><strong>Extended</strong><small>Preview duration change</small></span></button></div><div class="preview-frame" id="timePreview" style="margin-top:14px"><div class="preview-placeholder"><div><strong>Current state</strong>Choose a moment above to travel through the demo timeline.</div></div></div>`,'⌁')}</div></div>`;
}

function pagePreview() {
  const modes = [['reviewer','Reviewer view','What an invited reviewer would see'],['owner','Owner view','Your controls and session summary'],['limited','Limited preview','Only the minimum approved information']];
  return `${pageIntro('EXPERIMENTAL FEATURE · 04', 'Reality Preview Lens', 'Switch perspectives before sharing a demo session. This helps make hidden assumptions visible.', button('Return to Control Room','go-control','btn-secondary'))}
    <div class="grid grid-2"><div>${card('Perspective selector','Change the view mode',modes.map(([id,title,desc])=>`<button class="feature-tile ${previewMode===id?'selected':''}" data-preview="${id}" style="width:100%;text-align:left;margin-bottom:8px;color:inherit;border-color:${previewMode===id?'#9b83ff88':''}"><span class="tile-icon">${id==='reviewer'?'◉':id==='owner'?'♙':'◌'}</span><span><strong>${title}</strong><small>${desc}</small></span>${previewMode===id?'<span class="tag tag-violet">ACTIVE</span>':''}</button>`).join(''),'◉')}</div>
    ${card('Live lens','Synthetic reviewer experience',`<div class="preview-frame" id="lensPreview">${renderLens()}</div><div class="notice" style="margin-top:12px">The lens only changes this local preview. No content is shared with another person.</div>`,'◌')}</div>`;
}
function renderLens() {
  if (previewMode === 'owner') return `<div class="preview-top"><div><strong style="font-size:12px">Owner console</strong><div class="row-sub">FULL LOCAL CONTROLS</div></div><span class="tag tag-violet">OWNER</span></div><div class="grid grid-2"><div class="metric-card card"><div class="metric-label">PERMISSIONS</div><div class="metric-value">${permissionsEnabledCount()}/5</div></div><div class="metric-card card"><div class="metric-label">SESSION</div><div class="metric-value" style="font-size:19px">${state.sessionActive?'Active':'Paused'}</div></div></div><p style="margin-top:12px">You can change consent, set boundaries, review local activity and export your data.</p>`;
  if (previewMode === 'limited') return `<div class="preview-top"><div><strong style="font-size:12px">Limited preview</strong><div class="row-sub">MINIMUM INFORMATION</div></div><span class="tag tag-amber">LIMITED</span></div><div class="preview-placeholder"><div><strong>Session invitation</strong>Feedback session · ${state.sessionActive?'Available':'Unavailable'}<br>No extra profile details shown.</div></div><div class="tag-list" style="margin-top:10px"><span class="stat-chip">No identity profile</span><span class="stat-chip">No sensitive details</span></div>`;
  return `<div class="preview-top"><div><strong style="font-size:12px">Reviewer preview</strong><div class="row-sub">SIMULATED INVITEE</div></div><span class="tag ${state.sessionActive && state.permissions.view?'tag-green':'tag-red'}">${state.sessionActive && state.permissions.view?'CAN VIEW':'NO ACCESS'}</span></div>${state.sessionActive && state.permissions.view?`<div class="preview-placeholder"><div><strong>Approved demo card</strong>Synthetic content placeholder<br><span class="small">No real images or personal data</span></div></div><div class="tag-list" style="margin-top:12px">${state.permissions.feedback?'<span class="stat-chip">Feedback form available</span>':''}${state.permissions.comments?'<span class="stat-chip">Comment box available</span>':''}${state.permissions.save?'<span class="stat-chip">Save option available</span>':''}</div>`:`<div class="preview-placeholder"><div><strong>Access unavailable</strong>The owner has disabled viewing or paused this session.</div></div>`}`;
}

function pageRoom() {
  const room = state.room;
  const currentRoom = room ? `<div class="preview-frame"><div class="preview-top"><div><strong style="font-size:12px">${escapeHtml(room.name)}</strong><div class="row-sub">LOCAL DEMO ROOM</div></div><span class="tag ${room.status==='active'?'tag-green':'tag-red'}">${room.status.toUpperCase()}</span></div><div class="metric-value" style="letter-spacing:3px">${escapeHtml(room.code)}</div><div class="row-sub">Locally generated preview code · not a real invitation</div><div class="divider"></div><div class="grid grid-2"><div><div class="row-sub">REVIEWER SLOTS</div><strong>${room.reviewers}</strong></div><div><div class="row-sub">SIMULATED EXPIRY</div><strong>${room.expiry} min</strong></div></div><div class="tag-list" style="margin-top:12px"><span class="stat-chip">${room.oneTime?'One-time':'Reusable'} demo code</span><span class="stat-chip">${room.createdAt ? fmtDate(room.createdAt) : 'Just created'}</span></div><div class="row" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">${button('Copy demo code','copy-room-code','btn-secondary')}${button('Export consent receipt','export-receipt','btn-primary')}${button('Revoke room','revoke-room','btn-danger')}</div></div>` : `<div class="empty-state"><div class="empty-icon">▣</div><strong>No demo room created yet</strong><br>Create a local room preview to generate a sample code and consent receipt.</div>`;
  return `${pageIntro('EXPERIMENTAL FEATURE · PRIVATE ROOM', 'Private Room Studio', 'Prototype a private feedback session with a simulated invite code, one-time access option, expiry and consent receipt. Nothing is sent to another device.')}
    <div class="grid grid-2"><div>${card('Room configuration','Create a local session preview',`<div class="field"><label class="field-label" for="roomName">Room name</label><input class="text-input" id="roomName" maxlength="40" placeholder="e.g. Feedback Session 01" value="${room?escapeHtml(room.name):''}"></div><div class="field"><label class="field-label" for="roomReviewers">Reviewer slots</label><select class="select-input" id="roomReviewers"><option value="1">1 reviewer</option><option value="2" selected>2 reviewers</option><option value="3">3 reviewers</option><option value="5">5 reviewers</option></select></div><div class="field"><label class="field-label" for="roomExpiry">Session expiry</label><select class="select-input" id="roomExpiry"><option value="15">15 minutes</option><option value="30" selected>30 minutes</option><option value="60">1 hour</option><option value="120">2 hours</option></select></div><label class="check-row"><input type="checkbox" id="roomOneTime" checked><span>Mark the demo invitation as one-time use</span></label>${button('Create local room preview →','create-room','btn-primary','style="margin-top:16px"')}<div class="notice" style="margin-top:13px">The code is generated and stored only in this browser. It cannot invite or authenticate a real remote reviewer.</div>`,'▣')}</div>
    ${card('Room preview & consent receipt','Local-only simulation',currentRoom,'◎')}</div>`;
}

function pageSafety() {
  const samples = [
    { id:'sample-a', who:'Demo reviewer A', text:'Repeatedly asks questions after a boundary was set.', type:'Boundary pressure' },
    { id:'sample-b', who:'Demo reviewer B', text:'Uses insulting or humiliating language in feedback.', type:'Harassing language' },
    { id:'sample-c', who:'Demo reviewer C', text:'Attempts to request information outside the session scope.', type:'Scope violation' }
  ];
  return `${pageIntro('EXPERIMENTAL FEATURE · SAFETY', 'Safety Playground', 'Practice moderation decisions using fictional reports. This does not connect to users or send reports to a service.')}
    <div class="grid grid-2"><div>${card('Synthetic moderation queue','Choose how the sample report should be handled',samples.map(item=>{const status=state.safetyActions[item.id]||'pending';return `<div class="list-row" style="align-items:flex-start"><div style="min-width:0"><div class="row-title">${item.who}</div><div class="row-sub">${item.type}</div><p style="color:#c3bfd2;font-size:10px;margin:7px 0">${item.text}</p><span class="tag ${status==='pending'?'tag-amber':status==='hidden'?'tag-red':'tag-green'}">${status.toUpperCase()}</span><div class="tag-list" style="margin-top:9px"><button class="tag-button" data-safety-action="hide" data-safety-id="${item.id}">Hide sample</button><button class="tag-button" data-safety-action="resolve" data-safety-id="${item.id}">Resolve</button><button class="tag-button" data-safety-action="block" data-safety-id="${item.id}">Block demo user</button></div></div></div>`;}).join(''),'⚑')}</div>
    ${card('Safety design principles','Moderation must be consistent and reviewable',`<div class="timeline"><div class="timeline-item done"><strong>Clear report categories</strong><small>Users should know what they can report.</small></div><div class="timeline-item done"><strong>Immediate protective action</strong><small>Hide or restrict clearly harmful content while a review takes place.</small></div><div class="timeline-item"><strong>Human review and appeal</strong><small>Automated flags should not be the only decision-maker.</small></div><div class="timeline-item"><strong>Auditable outcomes</strong><small>Record the action, reason and time without exposing extra personal data.</small></div></div><div class="notice notice-warn">All items in this queue are fictional. A production moderation system needs a secure backend, trained reviewers and a documented complaints process.</div>`,'盾')}</div>`;
}

function pageBoundary() {
  const choices = ['Respectful tone','No personal questions','No unsolicited advice','No appearance comparisons','No pressure to respond','No direct messages','No public sharing','No score-only feedback'];
  const selected = [...state.boundaries, ...state.customBoundaries];
  return `${pageIntro('EXPERIMENTAL FEATURE · 05', 'Boundary DNA', 'Build a personal feedback preference profile. Your settings are local and can be changed any time.', button('Clear selected boundaries','clear-boundaries','btn-ghost'))}
    <div class="grid grid-2"><div>${card('Choose your boundaries','Select the experience you are comfortable with',`<div class="tag-list">${choices.map(choice=>`<button class="tag-button ${selected.includes(choice)?'active':''}" data-boundary="${escapeHtml(choice)}">${selected.includes(choice)?'✓ ':''}${choice}</button>`).join('')}</div><div class="divider"></div><div class="field"><label class="field-label" for="customBoundary">Add a custom preference</label><div style="display:flex;gap:8px"><input class="text-input" id="customBoundary" placeholder="e.g. Keep feedback brief" maxlength="50"><button class="btn btn-primary" data-action="add-boundary">Add</button></div></div><div class="notice">Selected preferences: <strong>${selected.length}</strong>. These are guidance settings for this prototype, not enforced rules for remote users.</div>`,'✳')}</div>
    ${card('Your Boundary DNA','A visual summary of your choices',`<div class="metric-value">${selected.length}<span style="font-size:12px;color:var(--muted);font-weight:400"> preferences</span></div><div class="progress" style="margin:13px 0 16px"><span style="width:${Math.min(100,selected.length/8*100)}%"></span></div>${selected.length?selected.map(item=>`<div class="list-row"><div class="row-label"><span class="row-icon">✓</span><span class="row-title">${escapeHtml(item)}</span></div><button class="btn btn-ghost btn-small" data-remove-boundary="${escapeHtml(item)}">Remove</button></div>`).join(''):'<div class="empty-state">Choose the boundaries that matter to you.</div>'}`,'✧')}</div></div>`;
}

const translations = [
  [/you are stupid|idiot|dumb/gi, 'This feedback feels harsh and may be more useful when it focuses on a specific point.'],
  [/ugly|disgusting|gross/gi, 'This wording comments on appearance in a hurtful way. Consider sharing a respectful, specific observation instead.'],
  [/must|have to|should obviously/gi, 'This sounds directive. Consider presenting it as an optional suggestion.'],
  [/lol|haha|whatever/gi, 'This may feel dismissive. Consider explaining what you actually mean.']
];
function translateText(input, mode) {
  let output = input;
  translations.forEach(([pattern, replacement]) => { output = output.replace(pattern, replacement); });
  if (mode === 'gentle') output = `A gentle reframe: ${output}`;
  if (mode === 'direct') output = `Clear and respectful version: ${output}`;
  if (mode === 'short') output = output.split(/[.!?]/).filter(Boolean).slice(0, 1).join('. ') + (output ? '.' : '');
  return output;
}
function pageTranslator() {
  return `${pageIntro('EXPERIMENTAL FEATURE · 06', 'Feedback Translator', 'A local wording assistant that reframes harsh phrases into more constructive language. Nothing is sent to an AI service.', '<span class="tag tag-green">NO API · LOCAL RULES</span>')}
    <div class="grid grid-2"><div>${card('Original message','Use a fictional example. Avoid private or identifying details.',`<div class="field"><label class="field-label" for="feedbackInput">Feedback text</label><textarea class="text-area" id="feedbackInput" maxlength="800" placeholder="Try: You are stupid, this is useless..."></textarea><div class="progress-label"><span>Local demo text</span><span id="charCount">0 / 800</span></div></div><div class="field"><label class="field-label" for="translationMode">Writing style</label><select class="select-input" id="translationMode"><option value="constructive">Constructive</option><option value="gentle">Gentle</option><option value="direct">Clear and direct</option><option value="short">Short version</option></select></div>${button('Reframe wording →','translate-feedback','btn-primary')}`,'✎')}</div>
    ${card('Constructive version','Rule-based preview',`<div class="preview-frame" id="translationOutput"><div class="empty-state"><div class="empty-icon">✧</div>Your rephrased message will appear here.</div></div><div class="notice" style="margin-top:12px">This is a simple local phrase-rule demo, not an AI model. Always review the result before using it.</div>`,'✦')}</div>`;
}

function pageShield() {
  const moods = [['calm','☁','Calm'],['curious','✦','Curious'],['uncertain','◌','Uncertain'],['overwhelmed','≈','Overwhelmed']];
  return `${pageIntro('EXPERIMENTAL FEATURE · 07', 'Emotion Shield', 'A gentle layer between you and feedback. Choose how you want to approach results, or hide them until you feel ready.', button(state.hideResults?'Show results':'Hide results','toggle-results','btn-secondary'))}
    <div class="grid grid-2">${card('Quick emotional check-in','No judgement, no scores',`<div class="grid grid-2">${moods.map(([id,ico,label])=>`<button class="feature-tile" data-mood="${id}" style="border-color:${state.mood===id?'#9b83ff88':''}"><span class="tile-icon">${ico}</span><span><strong>${label}</strong><small>${state.mood===id?'Selected':'Tap to select'}</small></span></button>`).join('')}</div><div class="notice" style="margin-top:14px">${state.mood==='overwhelmed'?'Consider taking a pause. You do not need to read or respond to feedback now.':state.mood==='uncertain'?'You can hide results, read one item at a time, or leave the session.':state.mood==='curious'?'Take your time and look for specific, useful observations.':'Your pace matters. You can choose when and whether to view feedback.'}</div>`,'♡')}
    ${card('Shield controls','Choose a calmer results experience',`<div class="list-row"><div><div class="row-title">Hide numerical results</div><div class="row-sub">Keep the demo scores out of view</div></div><button class="toggle" data-toggle="hideResults" aria-pressed="${state.hideResults}" aria-checked="${state.hideResults}"></button></div><div class="list-row"><div><div class="row-title">Gentle reading mode</div><div class="row-sub">Use a softer feedback layout</div></div><button class="toggle" data-toggle="gentleMode" aria-pressed="${state.gentleMode}" aria-checked="${state.gentleMode}"></button></div><div class="divider"></div><div class="notice ${state.gentleMode?'':'notice-warn'}">${state.hideResults?'Numerical demo results are hidden.':'Sample results are visible in this local preview.'} ${state.gentleMode?'Gentle reading mode is enabled.':'Gentle reading mode is disabled.'}</div><div class="divider"></div><div class="field"><label class="field-label">Take a short break</label><div class="row-label"><span class="metric-value" id="breakTimer" style="font-size:22px">05:00</span><span class="muted small">Five-minute breathing break timer</span></div><div class="row" style="display:flex;gap:8px;margin-top:12px">${button('Start timer','start-break','btn-primary')}${button('Reset','reset-break','btn-secondary')}</div></div>`,'☾')}</div>`;
}

function pageBlind() {
  const cards = [
    ['reviewer','Reviewer','A limited review screen, without owner controls.'],
    ['moderator','Safety reviewer','A report-focused view showing only the information needed to assess a concern.'],
    ['owner','Owner','A full control and permission summary.']
  ];
  const mode = state.blindMode || 'reviewer';
  let preview = mode === 'owner' ? 'Owner controls, session settings and privacy history.' : mode === 'moderator' ? 'A demo report reference, report category and review status. No intimate content or identity details.' : 'A synthetic feedback card and only the permissions the owner enabled.';
  return `${pageIntro('EXPERIMENTAL FEATURE · 08', 'Blind Review Theater', 'Experience how different roles should see different amounts of information. This is a local role simulation, not an actual reviewer network.')}
    <div class="grid grid-2">${card('Choose a perspective','Switch between simplified demo roles',cards.map(([id,title,desc])=>`<button class="feature-tile" data-blind="${id}" style="width:100%;text-align:left;margin-bottom:8px;color:inherit;border-color:${mode===id?'#9b83ff88':''}"><span class="tile-icon">${id==='reviewer'?'◉':id==='moderator'?'⚑':'♙'}</span><span><strong>${title}</strong><small>${desc}</small></span></button>`).join(''),'◌')}
    ${card('Role preview','Visible information changes by role',`<div class="preview-frame"><div class="preview-top"><strong style="font-size:11px">${cards.find(c=>c[0]===mode)[1]} mode</strong><span class="tag tag-violet">SIMULATION</span></div><div class="preview-placeholder"><div><strong>${mode==='reviewer'?'Approved demo card':mode==='moderator'?'Report review reference':'Owner dashboard'}</strong>${preview}</div></div></div><div class="notice" style="margin-top:12px">Principle: show each role the minimum information needed for its task.</div>`,'◉')}</div>`;
}

function pageInsights() {
  const sampleDelta = Math.max(0, (state.insightSampleCount || 3) - 3);
  const axes = [
    ['Respectfulness', Math.min(98, 92 + sampleDelta)], ['Clarity', Math.min(94, 78 + sampleDelta)], ['Usefulness', Math.min(96, 85 + sampleDelta)], ['Specificity', Math.min(90, 69 + sampleDelta)], ['Actionability', Math.min(93, 74 + sampleDelta)]
  ];
  const points = axes.map((axis,i)=>{
    const angle = (-Math.PI/2) + (i*2*Math.PI/axes.length);
    const radius = axis[1] * 1.05;
    return `${190 + Math.cos(angle)*radius},${170 + Math.sin(angle)*radius}`;
  }).join(' ');
  return `${pageIntro('EXPERIMENTAL FEATURE · 09', 'Rating DNA Map', 'Replace a single number with a multi-dimensional quality map. The chart uses fictional feedback-quality data, not body ratings or real user rankings.', button('Add demo sample','add-sample','btn-secondary'))}
    <div class="grid grid-2"><div class="card"><div class="card-header"><div><h3>Feedback quality constellation</h3><p>Five dimensions · ${state.insightSampleCount || 3} fictional sample sets</p></div><span class="tag tag-violet">DEMO DATA</span></div><svg class="radar" viewBox="0 0 380 340" role="img" aria-label="Radar chart showing fictional feedback quality dimensions"><g fill="none" stroke="#ffffff1c" stroke-width="1"><polygon points="190,65 290,137 252,254 128,254 90,137"/><polygon points="190,91 265,145 237,228 143,228 115,145"/><polygon points="190,117 240,153 221,201 159,201 140,153"/><path d="M190 170V65 M190 170L290 137 M190 170L252 254 M190 170L128 254 M190 170L90 137"/></g><polygon points="${points}" fill="#9b83ff35" stroke="#aa95ff" stroke-width="2.5"/><g fill="#d8ccff">${points.split(' ').map(point=>{const [x,y]=point.split(',');return `<circle cx="${x}" cy="${y}" r="4"/>`;}).join('')}</g><g fill="#aaa5bc" font-size="10" text-anchor="middle"><text x="190" y="30">Respectfulness</text><text x="320" y="132">Clarity</text><text x="272" y="282">Usefulness</text><text x="106" y="282">Specificity</text><text x="55" y="132">Actionability</text></g></svg></div>
    ${card('Dimension breakdown','Use the map to inspect patterns, not judge people',axes.map(([name,value])=>`<div style="margin-bottom:15px"><div class="progress-label"><span>${name}</span><strong>${value}%</strong></div><div class="progress"><span style="width:${value}%"></span></div></div>`).join('')+`<div class="notice">Synthetic sample only. These values are not a real person's assessment.</div>`,'⌁')}</div>`;
}

function pageReplay() {
  const events = state.events.map(event=>`<div class="timeline-item"><strong>${escapeHtml(event.title)}</strong><small>${fmtDate(event.time)} · ${escapeHtml(event.detail)}</small></div>`).join('');
  return `${pageIntro('EXPERIMENTAL FEATURE · 10', 'Consent Replay', 'Replay the local event trail so you can understand how demo permissions and settings changed over time.', button('Add replay marker','add-marker','btn-secondary'))}
    <div class="grid grid-2">${card('Session event stream','Newest events appear at the top',`<div class="timeline">${events || '<div class="empty-state">No events yet.</div>'}</div>`,'↺')}
    ${card('Replay controls','Move through a fictional session timeline',`<div class="field"><label class="field-label" for="replayRange">Replay position</label><input id="replayRange" type="range" min="0" max="${Math.max(0,state.events.length-1)}" value="0" style="width:100%;accent-color:#9b83ff"></div><div class="preview-frame" id="replayPreview"><div class="preview-placeholder"><div><strong>${escapeHtml(state.events[0]?.title || 'No events')}</strong>${escapeHtml(state.events[0]?.detail || 'Create an event to begin.')}</div></div></div><div class="small muted" style="margin-top:10px">Move the slider to inspect each local event. Event history can be cleared in Settings.</div>`,'◷')}</div>`;
}

function pageWeather() {
  const samples = [
    { label: 'Useful and respectful', count: 7, icon: '☀', mood: 'Clear skies', note: 'The sample feedback is specific, respectful and actionable.' },
    { label: 'Mixed signals', count: 3, icon: '⛅', mood: 'Partly cloudy', note: 'The sample feedback contains different levels of detail.' },
    { label: 'Needs a rewrite', count: 2, icon: '🌧', mood: 'A little rain', note: 'Some sample wording could be more constructive.' }
  ];
  const total = samples.reduce((sum,x)=>sum+x.count,0);
  return `${pageIntro('EXPERIMENTAL FEATURE · 11', 'Feedback Weather', "A visual metaphor for feedback patterns. It describes the sample text quality, not a person’s value, attractiveness or emotional state.")}
    <div class="grid grid-2"><div class="weather-card"><div class="eyebrow">TODAY'S DEMO FORECAST</div><div class="weather-icon">☀</div><div class="weather-word">Clear skies</div><div class="weather-sub">Mostly constructive sample feedback</div><div class="tag-list" style="justify-content:center;margin-top:15px"><span class="stat-chip">${total} synthetic items</span><span class="stat-chip">3 sample groups</span></div></div>
    ${card('Forecast details','How the synthetic feedback is distributed',samples.map(item=>`<div class="list-row"><div class="row-label"><span class="row-icon">${item.icon}</span><div><div class="row-title">${item.label}</div><div class="row-sub">${item.note}</div></div></div><strong class="metric-value" style="font-size:17px">${Math.round(item.count/total*100)}%</strong></div>`).join('')+`<div class="divider"></div><div class="progress-label"><span>Constructive sample share</span><strong>${Math.round(samples[0].count/total*100)}%</strong></div><div class="progress"><span style="width:${samples[0].count/total*100}%"></span></div>`,'☼')}</div>`;
}

function pageWhatIf() {
  const current = { comments: state.permissions.comments, reviewers: 2, duration: state.expiryMinutes };
  const scenario = state.whatIf;
  const impact = (scenario.comments ? 1 : 0) + Math.min(3, Number(scenario.reviewers)) + (Number(scenario.duration) > 45 ? 1 : 0);
  const label = impact <= 2 ? 'Focused setup' : impact <= 4 ? 'Balanced setup' : 'More moving parts';
  return `${pageIntro('EXPERIMENTAL FEATURE · 12', 'What-If Studio', 'Change hypothetical session settings and compare the results with your current local configuration. Nothing is shared or applied to another person.', button('Reset scenario','reset-whatif','btn-ghost'))}
    <div class="grid grid-2"><div>${card('Scenario builder','Tune the demo variables',`<div class="list-row"><div><div class="row-title">Allow comments</div><div class="row-sub">Optional written feedback</div></div><button class="toggle" data-toggle="whatIf.comments" aria-pressed="${scenario.comments}" aria-checked="${scenario.comments}"></button></div><div class="field" style="margin-top:17px"><label class="field-label">Number of reviewers · <strong id="reviewerValue">${scenario.reviewers}</strong></label><input type="range" min="1" max="5" step="1" value="${scenario.reviewers}" data-range="whatIf.reviewers" style="width:100%;accent-color:#9b83ff"></div><div class="field"><label class="field-label">Session duration · <strong id="durationValue">${scenario.duration} min</strong></label><input type="range" min="5" max="120" step="5" value="${scenario.duration}" data-range="whatIf.duration" style="width:100%;accent-color:#9b83ff"></div><div class="notice">Try smaller settings first. More reviewers or longer sessions can add complexity; they are not automatically better.</div>`,'⌘')}</div>
    ${card('Side-by-side comparison','Current setup vs. hypothetical setup',`<div class="grid grid-2"><div class="preview-frame"><span class="tag">CURRENT</span><div class="metric-value" style="font-size:18px">${current.reviewers}</div><div class="row-sub">reviewers simulated</div><div class="divider"></div><div class="row-title">Comments: ${current.comments?'On':'Off'}</div><div class="row-sub">${current.duration} min</div></div><div class="preview-frame"><span class="tag tag-violet">WHAT-IF</span><div class="metric-value" style="font-size:18px">${scenario.reviewers}</div><div class="row-sub">reviewers simulated</div><div class="divider"></div><div class="row-title">Comments: ${scenario.comments?'On':'Off'}</div><div class="row-sub">${scenario.duration} min</div></div></div><div class="divider"></div><div class="row-label"><span class="row-icon">✦</span><div><div class="row-title">Scenario profile: ${label}</div><div class="row-sub">A simple interface complexity estimate</div></div></div><div class="progress" style="margin-top:12px"><span style="width:${impact/6*100}%"></span></div>`,'⌁')}</div>`;
}

function pageShadow() {
  const keys = Object.keys(localStorage).filter(key=>key.startsWith('private-rate-lab'));
  const localBytes = keys.reduce((sum,key)=>sum+(localStorage.getItem(key)||'').length*2,0);
  const mb = (localBytes/1024).toFixed(1);
  return `${pageIntro('EXPERIMENTAL FEATURE · 13', 'Digital Privacy Shadow', 'Inspect the demo app data this browser currently stores. This is an app-scoped local storage view, not a complete browser privacy audit.', button('Refresh scan','refresh-shadow','btn-secondary'))}
    <div class="grid grid-2">${card('Local data inventory','Only app-specific keys are inspected',`<div class="grid grid-2"><div class="metric-card card"><div class="metric-label">APP STORAGE KEYS</div><div class="metric-value">${keys.length}</div></div><div class="metric-card card"><div class="metric-label">APP DATA SIZE</div><div class="metric-value">${mb}<span style="font-size:12px"> KB</span></div></div></div><div class="divider"></div>${keys.length?keys.map(key=>`<div class="list-row"><div class="row-label"><span class="row-icon">▣</span><div><div class="row-title">${escapeHtml(key)}</div><div class="row-sub">Local browser storage · app namespace</div></div></div><span class="tag tag-green">LOCAL</span></div>`).join(''):'<div class="empty-state">No app data found.</div>'}`,'◐')}
    ${card('Data flow map','Where demo information goes',`<div class="timeline"><div class="timeline-item done"><strong>App interaction</strong><small>Buttons and form values are processed in this browser tab.</small></div><div class="timeline-item done"><strong>Local state</strong><small>Demo preferences and event history are saved in localStorage.</small></div><div class="timeline-item"><strong>Optional encrypted export</strong><small>You can create a password-protected backup file manually.</small></div><div class="timeline-item"><strong>No server transfer</strong><small>This prototype has no backend integration or network submission code.</small></div></div><div class="notice notice-warn">Browser storage is not a secure vault by itself. Anyone with access to your unlocked device/browser profile may be able to inspect it.</div>`,'⌁')}</div>`;
}

const escapeQuestions = [
  { q: 'A reviewer asks to keep a copy of a private demo card. What is the safer default?', options: ['Allow automatically', 'Keep saving off unless explicitly selected', 'Hide the setting'], correct: 1, why: 'A clear opt-in gives the owner control over saving.' },
  { q: 'A session is no longer needed. What should be easy to find?', options: ['A hard-to-find help page', 'An immediate revoke or end-session control', 'A public share button'], correct: 1, why: 'Ending access should be straightforward and visible.' },
  { q: 'What should a reviewer see by default?', options: ['All profile information', 'The minimum information needed for the task', 'Every previous session'], correct: 1, why: 'Data minimisation reduces unnecessary exposure.' }
];
function pageEscape() {
  const item = escapeQuestions[challengeIndex % escapeQuestions.length];
  return `${pageIntro('CREATIVE LAB · 14', 'Privacy Escape Room', 'Solve short privacy scenarios and unlock the next room. This is a learning game using fictional examples.')}
    <div class="grid grid-2"><div class="card"><div class="card-header"><div><span class="tag tag-violet">ROOM ${challengeIndex+1} / ${escapeQuestions.length}</span><h3 style="margin-top:10px">Think before you unlock</h3><p>Choose the most privacy-preserving answer.</p></div><span class="card-symbol">◇</span></div><h3 style="font-size:17px;line-height:1.35;margin:18px 0">${item.q}</h3><div id="escapeOptions">${item.options.map((option,index)=>`<button class="quiz-option" data-quiz="${index}"><span class="row-icon">${String.fromCharCode(65+index)}</span>${option}</button>`).join('')}</div><div id="quizFeedback" class="form-message"></div><div class="row" style="display:flex;justify-content:space-between;margin-top:16px"><span class="small muted">Completed: ${state.challengeDone.length} rooms</span>${button('Next room →','next-room','btn-primary','disabled')}</div></div>
    ${card('Privacy principles','What the game teaches',`<div class="list-row"><div class="row-label"><span class="row-icon">◎</span><div><div class="row-title">Meaningful consent</div><div class="row-sub">A choice that is clear and specific.</div></div></div></div><div class="list-row"><div class="row-label"><span class="row-icon">▣</span><div><div class="row-title">Data minimisation</div><div class="row-sub">Only collect what is needed.</div></div></div></div><div class="list-row"><div class="row-label"><span class="row-icon">⊘</span><div><div class="row-title">Easy withdrawal</div><div class="row-sub">Make it simple to stop sharing.</div></div></div></div>`,'✦')}</div>`;
}

function pageComposer() {
  return `${pageIntro('CREATIVE LAB · 15', 'Feedback Composer', 'Build your own quality checklist and preview how it would appear in a feedback form. Criteria are stored locally.', button('Reset criteria','reset-criteria','btn-ghost'))}
    <div class="grid grid-2">${card('Create your criteria','Add dimensions that matter to your experience',`<div class="field"><label class="field-label" for="criterionInput">New criterion</label><div style="display:flex;gap:8px"><input class="text-input" id="criterionInput" maxlength="30" placeholder="e.g. Kindness"><button class="btn btn-primary" data-action="add-criterion">Add</button></div></div><div class="tag-list">${state.customCriteria.map(item=>`<button class="tag-button active" data-remove-criterion="${escapeHtml(item)}">✓ ${escapeHtml(item)} ×</button>`).join('')}</div><div class="notice" style="margin-top:14px">Click a criterion to remove it. Keep labels neutral, useful and respectful.</div>`,'＋')}
    ${card('Live form preview','A synthetic reviewer form',`<div class="preview-frame"><div class="preview-top"><strong style="font-size:11px">Your feedback checklist</strong><span class="tag tag-violet">PREVIEW</span></div>${state.customCriteria.length?state.customCriteria.map((item,i)=>`<div class="field"><div class="progress-label"><span>${escapeHtml(item)}</span><span>Not rated</span></div><div class="tag-list">${[1,2,3,4,5].map(n=>`<span class="tag-button">${n}</span>`).join('')}</div></div>`).join(''):'<div class="empty-state">Add a criterion to preview the form.</div>'}</div>`,'▤')}</div>`;
}

function pageSimulator() {
  const scenarios = [
    ['minimum','Minimum sharing','Only viewing is enabled. Comments and saving remain disabled.'],
    ['balanced','Balanced feedback','Viewing and feedback are enabled, but saving is off.'],
    ['high-control','High-control session','No viewing, no feedback and no comments.']
  ];
  const active = state.simScenario || 'minimum';
  return `${pageIntro('CREATIVE LAB · 16', 'Consent Simulator', 'Try preset consent configurations and inspect what changes. Applying a preset updates only this local demo.')}
    <div class="grid grid-2"><div>${card('Choose a scenario','Select one preset to see the consequences',scenarios.map(([id,title,desc])=>`<button class="feature-tile" data-scenario="${id}" style="width:100%;text-align:left;margin-bottom:8px;color:inherit;border-color:${active===id?'#9b83ff88':''}"><span class="tile-icon">${id==='minimum'?'◌':id==='balanced'?'◎':'⊘'}</span><span><strong>${title}</strong><small>${desc}</small></span></button>`).join(''),'▣')}</div>
    ${card('Scenario result','Preview the selected permission set',`<div class="preview-frame"><div class="preview-top"><strong style="font-size:11px">${scenarios.find(x=>x[0]===active)[1]}</strong><span class="tag tag-violet">SIMULATION</span></div>${Object.entries(state.permissions).map(([key,value])=>`<div class="list-row"><span class="row-title">${key[0].toUpperCase()+key.slice(1)}</span><span class="tag ${value?'tag-green':'tag-amber'}">${value?'ON':'OFF'}</span></div>`).join('')}</div>${button('Apply selected scenario','apply-scenario','btn-primary')}<div class="small muted" style="margin-top:9px">Applying a preset changes your local permission switches.</div>`,'◎')}</div>`;
}

function pageMuseum() {
  const items = state.museum.map((item,index)=>`<div class="list-row"><div class="row-label"><span class="row-icon">${String(index+1).padStart(2,'0')}</span><div><div class="row-title">${escapeHtml(item.title)}</div><div class="row-sub">${escapeHtml(item.date)} · ${escapeHtml(item.note)}</div></div></div><div style="text-align:right"><strong class="metric-value" style="font-size:17px">${item.quality}%</strong><div class="row-sub">quality</div></div></div>`).join('');
  return `${pageIntro('CREATIVE LAB · 17', 'Personal Score Museum', 'A timeline of fictional session-quality snapshots. It tracks the quality of the feedback experience, not the value or appearance of a person.', button('Add sample exhibit','add-museum','btn-secondary'))}
    <div class="grid grid-2">${card('Your exhibit wall','Demo milestones',items || '<div class="empty-state">No exhibits yet.</div>','▤')}
    ${card('Museum note','What these snapshots mean',`<div class="metric-value">${state.museum.length}</div><div class="metric-label">Local demo exhibits</div><div class="divider"></div><div class="notice">Each exhibit is synthetic sample data. This concept intentionally avoids public rankings, body scores or searchable profiles.</div><div class="divider"></div>${button('Clear museum','clear-museum','btn-danger')}`,'✦')}</div>`;
}

const boundaryChallenges = [
  { q:'Someone says they are uncomfortable with a question. What should happen?', options:['Ask again in a different way','Respect the boundary and move on','Tell them they are too sensitive'], answer:1, why:'A boundary is not a negotiation prompt. Respect it.' },
  { q:'A user wants to withdraw permission. What is the best interaction?', options:['Make withdrawal immediate and easy','Require a public explanation','Hide the revoke control'], answer:0, why:'Consent should be reversible without unnecessary friction.' },
  { q:'A demo session needs a reviewer. What should be shared?', options:['Every available detail','Only the minimum approved information','A complete device profile'], answer:1, why:'Share only what is necessary for the chosen task.' }
];
function pageChallenge() {
  const item = boundaryChallenges[challengeIndex % boundaryChallenges.length];
  return `${pageIntro('CREATIVE LAB · 18', 'Boundary Challenge', 'A quick scenario game about clear communication, consent and thoughtful interaction.', '<span class="tag tag-violet">LOCAL MINI GAME</span>')}
    <div class="grid grid-2"><div class="card"><div class="card-header"><div><span class="eyebrow">CHALLENGE ${challengeIndex+1}</span><h3 style="font-size:18px;margin-top:7px">Make the respectful choice</h3></div><span class="card-symbol">⚑</span></div><h3 style="font-size:16px;line-height:1.4;margin:17px 0">${item.q}</h3><div id="challengeOptions">${item.options.map((option,index)=>`<button class="quiz-option" data-challenge="${index}">${option}</button>`).join('')}</div><div id="challengeFeedback" class="form-message"></div><div class="row" style="display:flex;justify-content:space-between;margin-top:16px"><span class="small muted">${state.challengeDone.length} scenarios completed</span>${button('Next challenge →','next-challenge','btn-primary','disabled')}</div></div>
    ${card('Your progress','Practice, not a test',`<div class="metric-value">${Math.min(state.challengeDone.length,3)} / 3</div><div class="progress"><span style="width:${Math.min(100,state.challengeDone.length/3*100)}%"></span></div><div class="divider"></div><div class="notice">The goal is to build habits around clear choices, respectful language and easy withdrawal—not to maximise a score.</div>`,'✧')}</div>`;
}

function pageSettings() {
  return `${pageIntro('LOCAL DATA & PREFERENCES', 'Settings & Data', 'Manage local demo information, create an encrypted backup, restore a backup or reset this browser prototype.')}
    <div class="grid grid-2">${card('Backup & restore','Your data does not sync to another device',`<div class="notice notice-success">An encrypted backup is created in your browser using AES-256-GCM. The password is never stored by this app.</div><div class="row" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:15px">${button('Create encrypted backup','open-vault','btn-primary')}${button('Import encrypted backup','import-backup','btn-secondary')}</div><div class="divider"></div>${button('Export readable demo JSON','export-json','btn-secondary')}<p class="small muted" style="margin-top:10px">Readable JSON is not encrypted. Only export it when you understand where the file will be saved.</p>`,'▣')}
    ${card('Storage & reset','Clear information stored by this prototype',`<div class="list-row"><div><div class="row-title">Local app storage</div><div class="row-sub">Preferences, demo events and custom criteria</div></div><span class="tag tag-green">ON DEVICE</span></div><div class="list-row"><div><div class="row-title">Network sync</div><div class="row-sub">No backend or sync configured</div></div><span class="tag tag-amber">OFF</span></div><div class="divider"></div>${button('Delete all local demo data','reset-all','btn-danger')}<div class="notice notice-warn" style="margin-top:12px">Reset cannot remove browser downloads or copies you exported manually. It also cannot clear data outside this app's storage namespace.</div>`,'⚙')}</div>
    <div class="grid grid-2" style="margin-top:15px">${card('Compatibility','Browser capabilities',`<div class="list-row"><span class="row-title">Web Crypto API</span><span class="tag ${globalThis.crypto?.subtle?'tag-green':'tag-amber'}">${globalThis.crypto?.subtle?'AVAILABLE':'UNAVAILABLE'}</span></div><div class="list-row"><span class="row-title">Service Worker</span><span class="tag ${'serviceWorker' in navigator?'tag-green':'tag-amber'}">${'serviceWorker' in navigator?'SUPPORTED':'UNAVAILABLE'}</span></div><div class="list-row"><span class="row-title">IndexedDB</span><span class="tag ${'indexedDB' in window?'tag-green':'tag-amber'}">${'indexedDB' in window?'SUPPORTED':'UNAVAILABLE'}</span></div><div class="list-row"><span class="row-title">Online status</span><span class="tag ${navigator.onLine?'tag-green':'tag-amber'}">${navigator.onLine?'ONLINE':'OFFLINE'}</span></div>`,'⌘')}
    ${card('Project information','GitHub Pages-ready, static frontend',`<div class="row-title">Private Rate Lab · Experimental Edition</div><div class="row-sub">Version 0.1.0 · No backend · No external API required</div><div class="divider"></div><div class="small muted">For development use only. Do not publish sensitive data, real user content or private submissions through GitHub Pages. Check applicable hosting terms before deployment.</div>`,'ⓘ')}</div>`;
}

function renderPage() {
  const renderers = {
    home: pageHome, control: pageControl, consent: pageConsent, time: pageTime, preview: pagePreview, room: pageRoom, safety: pageSafety,
    boundary: pageBoundary, translator: pageTranslator, shield: pageShield, blind: pageBlind,
    insights: pageInsights, replay: pageReplay, weather: pageWeather, whatif: pageWhatIf,
    shadow: pageShadow, escape: pageEscape, composer: pageComposer, simulator: pageSimulator,
    museum: pageMuseum, challenge: pageChallenge, settings: pageSettings
  };
  appContent.innerHTML = (renderers[currentRoute] || pageHome)();
  bindRangeLabels();
}

function bindRangeLabels() {
  const range = document.querySelector('[data-range="expiryMinutes"]');
  if (range) range.addEventListener('input', () => {
    const label = document.getElementById('expiryValue');
    if (label) label.textContent = `${range.value} min`;
  });
  const reviewer = document.querySelector('[data-range="whatIf.reviewers"]');
  if (reviewer) reviewer.addEventListener('input', () => { const el=document.getElementById('reviewerValue'); if(el) el.textContent=reviewer.value; });
  const duration = document.querySelector('[data-range="whatIf.duration"]');
  if (duration) duration.addEventListener('input', () => { const el=document.getElementById('durationValue'); if(el) el.textContent=`${duration.value} min`; });
  const feedbackInput = document.getElementById('feedbackInput');
  if (feedbackInput) feedbackInput.addEventListener('input', () => { const el=document.getElementById('charCount'); if(el) el.textContent=`${feedbackInput.value.length} / 800`; });
}

function setNested(obj, path, value) {
  const parts = path.split('.');
  let target = obj;
  for (let i=0;i<parts.length-1;i++) target = target[parts[i]];
  target[parts[parts.length-1]] = value;
}
function getNested(obj, path) { return path.split('.').reduce((result,key)=>result?.[key],obj); }
function afterChange(title, detail, type='activity') {
  logEvent(title, detail, type);
  renderPage();
}

// Central interaction handling: every control is implemented in the browser.
document.addEventListener('click', async event => {
  const routeButton = event.target.closest('[data-route]');
  if (routeButton) { setRoute(routeButton.dataset.route); return; }
  const nodeButton = event.target.closest('[data-node]');
  if (nodeButton) {
    const key = nodeButton.dataset.node;
    state.permissions[key] = !state.permissions[key];
    afterChange(`${key[0].toUpperCase()+key.slice(1)} permission ${state.permissions[key]?'enabled':'disabled'}`, 'Changed in Consent Universe', 'consent');
    toast(`${key[0].toUpperCase()+key.slice(1)} permission ${state.permissions[key]?'enabled':'disabled'}.`);
    return;
  }
  const toggleButton = event.target.closest('[data-toggle]');
  if (toggleButton) {
    const key = toggleButton.dataset.toggle;
    if (key.startsWith('whatIf.')) setNested(state,key,!getNested(state,key));
    else if (key === 'hideResults') state.hideResults = !state.hideResults;
    else if (key === 'gentleMode') state.gentleMode = !state.gentleMode;
    else if (state.permissions[key] !== undefined) state.permissions[key] = !state.permissions[key];
    else return;
    afterChange('Setting updated', `${key} changed`, key.includes('permission')?'consent':'settings');
    return;
  }
  const boundaryButton = event.target.closest('[data-boundary]');
  if (boundaryButton) {
    const value = boundaryButton.dataset.boundary;
    state.boundaries = state.boundaries.includes(value) ? state.boundaries.filter(item=>item!==value) : [...state.boundaries,value];
    persist(); renderPage(); return;
  }
  const removeCriterion = event.target.closest('[data-remove-criterion]');
  if (removeCriterion) {
    const value = removeCriterion.dataset.removeCriterion;
    state.customCriteria = state.customCriteria.filter(item => item !== value);
    persist(); renderPage(); return;
  }
  const removeBoundary = event.target.closest('[data-remove-boundary]');
  if (removeBoundary) {
    const value = removeBoundary.dataset.removeBoundary;
    state.boundaries = state.boundaries.filter(item=>item!==value);
    state.customBoundaries = state.customBoundaries.filter(item=>item!==value);
    persist(); renderPage(); return;
  }
  const preview = event.target.closest('[data-preview]');
  if (preview) { previewMode=preview.dataset.preview; state.previewMode=previewMode; persist(); renderPage(); return; }
  const blind = event.target.closest('[data-blind]');
  if (blind) { state.blindMode=blind.dataset.blind; persist(); renderPage(); return; }
  const mood = event.target.closest('[data-mood]');
  if (mood) { state.mood=mood.dataset.mood; persist(); renderPage(); return; }
  const time = event.target.closest('[data-time]');
  if (time) {
    const box=document.getElementById('timePreview');
    const content={now:['Current simulated state',state.sessionActive?'Session is active.':'Session is paused.'],expired:['After expiry','The simulated access would be unavailable after the selected duration.'],revoked:['After revoke','The owner ends the session. Reviewer access becomes unavailable in this model.'],extended:['Extended session',`The hypothetical duration is ${Math.min(120,state.expiryMinutes+30)} minutes.`]}[time.dataset.time];
    if(box) box.innerHTML=`<div class="preview-placeholder"><div><strong>${content[0]}</strong>${content[1]}</div></div>`;
    return;
  }
  const safetyAction = event.target.closest('[data-safety-action]');
  if (safetyAction) {
    const id = safetyAction.dataset.safetyId;
    const action = safetyAction.dataset.safetyAction;
    state.safetyActions[id] = action === 'hide' ? 'hidden' : action === 'block' ? 'blocked' : 'resolved';
    logEvent('Safety demo action', `${id} marked ${state.safetyActions[id]}`, 'safety');
    renderPage();
    toast(`Sample report marked ${state.safetyActions[id]}.`);
    return;
  }
  const scenario = event.target.closest('[data-scenario]');
  if (scenario) { state.simScenario=scenario.dataset.scenario; persist(); renderPage(); return; }
  const quiz = event.target.closest('[data-quiz]');
  if (quiz) {
    const item=escapeQuestions[challengeIndex%escapeQuestions.length];
    const answer=Number(quiz.dataset.quiz);
    document.querySelectorAll('[data-quiz]').forEach(btn=>{btn.disabled=true; if(Number(btn.dataset.quiz)===item.correct)btn.classList.add('correct'); if(Number(btn.dataset.quiz)===answer && answer!==item.correct)btn.classList.add('wrong');});
    const feedback=document.getElementById('quizFeedback');
    feedback.textContent=(answer===item.correct?'Correct. ':'Not quite. ')+item.why;
    if(answer===item.correct && !state.challengeDone.includes(`escape-${challengeIndex}`)) state.challengeDone.push(`escape-${challengeIndex}`);
    const next=document.querySelector('[data-action="next-room"]'); if(next)next.disabled=false;
    persist(); return;
  }
  const challenge = event.target.closest('[data-challenge]');
  if (challenge) {
    const item=boundaryChallenges[challengeIndex%boundaryChallenges.length];
    const answer=Number(challenge.dataset.challenge);
    document.querySelectorAll('[data-challenge]').forEach(btn=>{btn.disabled=true;if(Number(btn.dataset.challenge)===item.answer)btn.classList.add('correct');if(Number(btn.dataset.challenge)===answer && answer!==item.answer)btn.classList.add('wrong');});
    const feedback=document.getElementById('challengeFeedback'); feedback.textContent=(answer===item.answer?'Good choice. ':'Try another perspective. ')+item.why;
    if(answer===item.answer && !state.challengeDone.includes(`boundary-${challengeIndex}`))state.challengeDone.push(`boundary-${challengeIndex}`);
    const next=document.querySelector('[data-action="next-challenge"]'); if(next)next.disabled=false;
    persist(); return;
  }
  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) return;
  const action=actionButton.dataset.action;
  if (action.startsWith('go-')) { setRoute(action.replace('go-','')); return; }
  switch(action) {
    case 'revoke-all': state.sessionActive=false; Object.keys(state.permissions).forEach(key=>state.permissions[key]=false); afterChange('Emergency revoke activated','All simulated permissions disabled','consent'); toast('All demo permissions revoked.'); break;
    case 'toggle-session': state.sessionActive=!state.sessionActive; afterChange(`Session ${state.sessionActive?'resumed':'paused'}`,'Session status changed','consent'); break;
    case 'reset-permissions': state.permissions={...DEFAULT_STATE.permissions}; state.sessionActive=true; afterChange('Permissions reset','Restored the default demo permission set','consent'); break;
    case 'simulate-expiry': state.sessionActive=false; Object.keys(state.permissions).forEach(key=>state.permissions[key]=false); afterChange('Expiry simulation completed','The demo session was marked as expired','consent'); toast('Expiry simulation completed.'); break;
    case 'clear-boundaries': state.boundaries=[]; state.customBoundaries=[]; persist(); renderPage(); toast('Boundary preferences cleared.'); break;
    case 'add-boundary': { const input=document.getElementById('customBoundary'); const value=input?.value.trim(); if(value && ![...state.boundaries,...state.customBoundaries].includes(value)){state.customBoundaries.push(value);persist();renderPage();toast('Custom preference added.');} else toast('Enter a new preference first.','warn'); break; }
    case 'translate-feedback': {const input=document.getElementById('feedbackInput'); const mode=document.getElementById('translationMode')?.value||'constructive';const text=input?.value.trim()||'';const output=document.getElementById('translationOutput');if(!text){toast('Enter some fictional sample text first.','warn');break;}if(output)output.innerHTML=`<div class="eyebrow">LOCAL REFRAME</div><p style="font-size:12px;color:#e5e1f2;line-height:1.7">${escapeHtml(translateText(text,mode))}</p><button class="btn btn-secondary btn-small" data-action="copy-translation">Copy text</button>`;state.lastTranslation=translateText(text,mode);persist();break;}
    case 'copy-translation': if(state.lastTranslation && navigator.clipboard?.writeText){await navigator.clipboard.writeText(state.lastTranslation);toast('Reframed text copied.');}else toast('Clipboard is not available in this browser.','warn');break;
    case 'toggle-results': state.hideResults=!state.hideResults; persist();renderPage();break;
    case 'start-break': startBreakTimer(); break;
    case 'reset-break': if(breakInterval)clearInterval(breakInterval);breakSeconds=300;updateBreakTimer();break;
    case 'add-marker': logEvent('Manual replay marker','You added a local timeline marker','consent');renderPage();toast('Replay marker added.');break;
    case 'reset-whatif': state.whatIf={...DEFAULT_STATE.whatIf};persist();renderPage();break;
    case 'refresh-shadow': renderPage();toast('Local app storage scan refreshed.');break;
    case 'next-room': challengeIndex=(challengeIndex+1)%escapeQuestions.length;renderPage();break;
    case 'add-criterion': {const input=document.getElementById('criterionInput');const value=input?.value.trim();if(value && !state.customCriteria.includes(value)){state.customCriteria.push(value);persist();renderPage();}else toast('Enter a new criterion first.','warn');break;}
    case 'add-sample': state.insightSampleCount=(state.insightSampleCount||3)+1; logEvent('Synthetic insight sample added','Updated the fictional rating-quality demo data','insight'); renderPage(); toast('A synthetic sample set was added.'); break;
    case 'reset-criteria': state.customCriteria=[...DEFAULT_STATE.customCriteria];persist();renderPage();break;
    case 'apply-scenario': {const scenario=state.simScenario||'minimum';if(scenario==='minimum')state.permissions={view:true,feedback:false,comments:false,save:false,expiry:true};if(scenario==='balanced')state.permissions={view:true,feedback:true,comments:false,save:false,expiry:true};if(scenario==='high-control')state.permissions={view:false,feedback:false,comments:false,save:false,expiry:true};afterChange('Consent preset applied',`Applied the ${scenario} demo scenario`,'consent');toast('Scenario applied to the local demo.');break;}
    case 'add-museum': state.museum.unshift({title:'New sample exhibit',date:'Just now',quality:Math.floor(70+Math.random()*26),note:'Generated synthetic sample'});persist();renderPage();toast('Sample exhibit added.');break;
    case 'clear-museum': state.museum=[];persist();renderPage();break;
    case 'next-challenge': challengeIndex=(challengeIndex+1)%boundaryChallenges.length;renderPage();break;
    case 'create-room': {
      const name = document.getElementById('roomName')?.value.trim() || 'Private demo room';
      const reviewers = Number(document.getElementById('roomReviewers')?.value || 2);
      const expiry = Number(document.getElementById('roomExpiry')?.value || 30);
      const oneTime = Boolean(document.getElementById('roomOneTime')?.checked);
      const bytes = globalThis.crypto?.getRandomValues ? crypto.getRandomValues(new Uint8Array(4)) : new Uint8Array([21,42,63,84]);
      const code = Array.from(bytes, byte => byte.toString(16).padStart(2,'0')).join('').toUpperCase();
      state.room = { name, reviewers, expiry, oneTime, code, createdAt: Date.now(), status: 'active' };
      state.sessionActive = true;
      logEvent('Local demo room created', `${name} · ${reviewers} reviewer slots`, 'consent');
      renderPage(); toast('Local room preview created. The code is not a real invitation.'); break;
    }
    case 'copy-room-code': if(state.room?.code && navigator.clipboard?.writeText){await navigator.clipboard.writeText(state.room.code);toast('Demo code copied. It cannot be used for a real invitation.');}else toast('Clipboard unavailable or no room exists.','warn');break;
    case 'export-receipt': if(state.room){const receipt={format:'private-rate-lab-consent-receipt-demo',createdAt:new Date().toISOString(),room:{name:state.room.name,code:state.room.code,reviewers:state.room.reviewers,expiryMinutes:state.room.expiry,oneTime:state.room.oneTime,status:state.room.status},permissions:{...state.permissions},note:'Local prototype receipt only. Not a cryptographic proof or a record of remote consent.'};downloadText('private-rate-consent-receipt.json',JSON.stringify(receipt,null,2));toast('Demo consent receipt downloaded.');}else toast('Create a room first.','warn');break;
    case 'revoke-room': if(state.room){state.room.status='revoked';state.sessionActive=false;logEvent('Demo room revoked','Local room preview marked revoked','consent');renderPage();toast('Local room preview revoked.');}break;
    case 'open-vault': document.getElementById('vaultModal').showModal();break;
    case 'import-backup': document.getElementById('importFile').click();break;
    case 'export-json': downloadText('private-rate-demo-export.json',JSON.stringify({format:'private-rate-demo-readable-export',exportedAt:new Date().toISOString(),state:snapshotState(state)},null,2));toast('Readable JSON export created.');break;
    case 'reset-all': if(confirm('Delete all Private Rate Lab demo data from this browser and return to defaults?')){clearState();state=loadState();state.entered=true;persist();setRoute('home');toast('Local demo data reset.');}break;
  }
});

let breakSeconds=300;
let breakInterval=null;
function updateBreakTimer(){const el=document.getElementById('breakTimer');if(el)el.textContent=`${String(Math.floor(breakSeconds/60)).padStart(2,'0')}:${String(breakSeconds%60).padStart(2,'0')}`;}
function startBreakTimer(){if(breakInterval)clearInterval(breakInterval);breakInterval=setInterval(()=>{if(breakSeconds>0){breakSeconds--;updateBreakTimer();}else{clearInterval(breakInterval);breakInterval=null;toast('Your break timer is complete. Take care.');}},1000);toast('Break timer started.');}

document.addEventListener('input', event=>{
  const range=event.target.closest('[data-range]');
  if(range){const path=range.dataset.range;const value=Number(range.value);if(path==='expiryMinutes')state.expiryMinutes=value;else setNested(state,path,value);persist();}
});

document.getElementById('mobileMenu').addEventListener('click',()=>sidebar.classList.toggle('open'));
document.getElementById('profileButton').addEventListener('click',()=>setRoute('settings'));
document.getElementById('quickExit').addEventListener('click',()=>document.getElementById('quickExitModal').showModal());
document.getElementById('returnFromQuickExit').addEventListener('click',()=>document.getElementById('quickExitModal').close());
document.getElementById('returnFromQuickExitButton').addEventListener('click',()=>document.getElementById('quickExitModal').close());
document.getElementById('adultConfirm').addEventListener('change',event=>{document.getElementById('enterApp').disabled=!event.target.checked;});
document.getElementById('enterApp').addEventListener('click',()=>{state.entered=true;persist();document.getElementById('welcomeModal').close();});
document.getElementById('cancelVault').addEventListener('click',()=>document.getElementById('vaultModal').close());
document.getElementById('createBackup').addEventListener('click',async()=>{
  const password=document.getElementById('vaultPassword').value;
  const message=document.getElementById('vaultMessage');
  try{message.textContent='Encrypting locally…';const backup=await encryptBackup(snapshotState(state),password);downloadText('private-rate-backup.prvault',JSON.stringify(backup), 'application/octet-stream');message.textContent='Encrypted backup created. Keep your password safe.';document.getElementById('vaultPassword').value='';toast('Encrypted backup downloaded.');}
  catch(error){message.textContent=error.message;}
});
document.getElementById('importFile').addEventListener('change',async event=>{
  const file=event.target.files?.[0];if(!file)return;
  try{const text=await file.text();const object=JSON.parse(text);const password=prompt('Enter the password for this encrypted backup:');if(!password){toast('Import cancelled.','warn');return;}state=await decryptBackup(object,password);previewMode=state.previewMode||'reviewer';setRoute('home');toast('Encrypted backup restored to this browser.');}
  catch(error){toast(error.message||'Could not import backup.','error');}
  finally{event.target.value='';}
});

document.getElementById('replayRange')?.addEventListener('input',()=>{});
document.addEventListener('input',event=>{
  if(event.target.id==='replayRange'){
    const index=Number(event.target.value);const item=state.events[index];const box=document.getElementById('replayPreview');
    if(box&&item)box.innerHTML=`<div class="preview-placeholder"><div><strong>${escapeHtml(item.title)}</strong>${escapeHtml(item.detail)}<br><span class="small">${fmtDate(item.time)}</span></div></div>`;
  }
});

// Install a small offline app shell. This caches only static app files.
if ('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost')) {
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(error=>console.warn('Service worker registration failed:',error)));
}

renderNav();
renderPage();
if(!state.entered){document.getElementById('welcomeModal').showModal();}
