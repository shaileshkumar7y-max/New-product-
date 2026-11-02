'use strict';

const ART_RAW = 'https://raw.githubusercontent.com/lewdry/artflip/main/public';
const POSE_RAW = 'https://raw.githubusercontent.com/wquguru/shisei/main/images/line/w600';

const artworks = [
  {
    id: 'met-438013', title: 'Reclining Nude', artist: 'Auguste Renoir', year: '1883', medium: 'Oil on canvas',
    museum: 'The Metropolitan Museum of Art', category: 'painting', kind: 'Painting',
    thumb: `${ART_RAW}/thumbs/438013.webp`, image: `${ART_RAW}/images/438013.jpg`,
    fallback: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP-14976-001.jpg',
    sourceUrl: 'https://www.metmuseum.org/art/collection/search/438013', rights: 'Public domain — Met record marks this object as public domain.',
    tags: ['classical', 'figure study', 'reclining', 'female nude']
  },
  {
    id: 'met-438661', title: 'Study of a Female Nude', artist: 'Henri Lehmann', year: '1840', medium: 'Oil on canvas',
    museum: 'The Metropolitan Museum of Art', category: 'painting', kind: 'Painting',
    thumb: `${ART_RAW}/thumbs/438661.webp`, image: `${ART_RAW}/images/438661.jpg`,
    fallback: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP103071.jpg',
    sourceUrl: 'https://www.metmuseum.org/art/collection/search/438661', rights: 'Public domain — Met record marks this object as public domain.',
    tags: ['classical', 'figure study', 'academic', 'female nude']
  },
  {
    id: 'met-337063', title: 'Reclining Female Nude', artist: 'Rembrandt van Rijn', year: '1658', medium: 'Etching, drypoint and engraving',
    museum: 'The Metropolitan Museum of Art', category: 'drawing', kind: 'Print',
    thumb: `${ART_RAW}/thumbs/337063.webp`, image: `${ART_RAW}/images/337063.jpg`,
    fallback: 'https://images.metmuseum.org/CRDImages/dp/web-large/DP815606.jpg',
    sourceUrl: 'https://www.metmuseum.org/art/collection/search/337063', rights: 'Public domain — Met record marks this object as public domain.',
    tags: ['classical', 'print', 'etching', 'reclining']
  },
  {
    id: 'mia-1655', title: 'Nude on a Couch', artist: 'Gustave Caillebotte', year: 'c. 1880', medium: 'Oil on canvas',
    museum: 'Minneapolis Institute of Art', category: 'painting', kind: 'Painting',
    thumb: `${ART_RAW}/thumbs/mia-1655.webp`, image: `${ART_RAW}/images/mia-1655.jpg`,
    fallback: '', sourceUrl: 'https://collections.artsmia.org/art/1655',
    rights: 'ArtFlip metadata marks this record as public domain. Verify the museum record before commercial reuse.',
    tags: ['classical', 'figure study', 'interior']
  }
];

const angleLabels = { front: 'FRONT VIEW', diag: 'THREE-QUARTER VIEW', side: 'SIDE VIEW', above: 'ABOVE VIEW', below: 'BELOW VIEW' };
const poseSets = [
  { id: 'P001', title: 'Sitting, one knee raised', category: 'sitting', description: 'A relaxed seated pose with one knee raised and the torso gently leaning back.', views: { front: 'std_P001_front.webp', diag: 'std_P001_diag.webp', side: 'std_P001_side.webp', above: 'std_P001_above.webp', below: 'std_P001_below.webp' } },
  { id: 'P015', title: 'Standing contrapposto', category: 'standing', description: 'A balanced standing pose with weight shifted to one leg and one hand resting at the hip.', views: { front: 'std_P015_front.webp', diag: 'std_P015_diag.webp', side: 'std_P015_side.webp', above: null, below: 'std_P015_below.webp' } },
  { id: 'P032', title: 'Kneeling, hands behind head', category: 'kneeling', description: 'A kneeling pose for studying the line of the shoulders, elbows and torso.', views: { front: 'std_P032_front.webp', diag: 'std_P032_diag.webp', side: 'std_P032_side.webp', above: 'std_P032_above.webp', below: null } },
  { id: 'P049', title: 'Lying on back, arms overhead', category: 'lying', description: 'A reclining full-body silhouette with both arms extended overhead.', views: { front: 'std_P049_front.webp', diag: 'std_P049_diag.webp', side: 'std_P049_side.webp', above: null, below: 'std_P049_below.webp' } },
  { id: 'P058', title: 'Squatting, hands on knees', category: 'dynamic', description: 'A compact squat that makes the balance of the torso and lower body easy to compare.', views: { front: 'std_P058_front.webp', diag: 'std_P058_diag.webp', side: 'std_P058_side.webp', above: 'std_P058_above.webp', below: 'std_P058_below.webp' } },
  { id: 'P064', title: 'Bent forward, hands on knees', category: 'dynamic', description: 'A forward hinge useful for studying the spine curve and weight distribution.', views: { front: 'std_P064_front.webp', diag: 'std_P064_diag.webp', side: 'std_P064_side.webp', above: 'std_P064_above.webp', below: 'std_P064_below.webp' } },
  { id: 'P073', title: 'Standing twist, arms spread', category: 'dynamic', description: 'A twisting standing pose for studying rotation through the shoulders and waist.', views: { front: 'std_P073_front.webp', diag: 'std_P073_diag.webp', side: null, above: null, below: 'std_P073_below.webp' } },
  { id: 'P070', title: 'Standing, arched backward', category: 'dynamic', description: 'A controlled back-arching pose that highlights the curve of the torso.', views: { front: null, diag: null, side: 'std_P070_side.webp', above: null, below: 'std_P070_below.webp' } }
].map(p => ({ ...p, image: `${POSE_RAW}/${p.views.diag || p.views.front || p.views.side || p.views.below}` }));

const STORAGE_KEY = 'naked-canvas-phase2-favourites';
const CONSENT_KEY = 'naked-canvas-18plus-confirmed';
let saved = readSaved();
let currentArtIndex = 0;
let currentPose = null;
let currentAngle = 'front';
let artFilter = 'all';
let poseFilter = 'all';

const $ = id => document.getElementById(id);
const safeText = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const artImage = artwork => artwork.image;
const poseImage = (pose, angle) => pose.views[angle] ? `${POSE_RAW}/${pose.views[angle]}` : '';

function readSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function persistSaved() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); }
  catch { showToast('Browser storage is unavailable. Your favourites may not persist.'); }
  updateSavedCount();
}
function isSaved(id) { return saved.some(item => item.id === id); }
function toggleSaved(item) {
  if (isSaved(item.id)) saved = saved.filter(entry => entry.id !== item.id);
  else saved = [...saved, item];
  persistSaved();
  renderSaved();
  renderArtworks();
  renderPoses();
  updateModalSaveState();
  showToast(isSaved(item.id) ? 'Saved to your private shelf.' : 'Removed from your shelf.');
}
function updateSavedCount() { $('savedCount').textContent = String(saved.length); }
function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2100);
}
function markImageUnavailable(img) {
  img.classList.add('image-error');
  const frame = img.closest('.art-card-image, .pose-image, .pose-stage, .modal-image-wrap, .saved-item');
  if (frame) frame.classList.add('load-failed');
}
function withFallback(img, fallback) {
  img.addEventListener('error', () => {
    if (fallback && !img.dataset.fallbackUsed) {
      img.dataset.fallbackUsed = '1';
      img.src = fallback;
      return;
    }
    markImageUnavailable(img);
  });
}
function artCard(artwork, index) {
  const savedClass = isSaved(artwork.id) ? 'saved' : '';
  return `<article class="art-card" data-art-id="${safeText(artwork.id)}" tabindex="0" role="button" aria-label="Open ${safeText(artwork.title)}">
    <div class="art-card-image"><img loading="lazy" src="${safeText(artwork.thumb)}" data-full="${safeText(artwork.image)}" data-fallback="${safeText(artwork.fallback)}" alt="${safeText(artwork.title)} by ${safeText(artwork.artist)}"><span class="art-tag">${safeText(artwork.kind.toUpperCase())}</span><button class="heart-button ${savedClass}" data-save-art="${safeText(artwork.id)}" aria-label="${savedClass ? 'Remove saved artwork' : 'Save artwork'}">${savedClass ? '♥' : '♡'}</button></div>
    <div class="art-card-info"><h3>${safeText(artwork.title)}</h3><p>${safeText(artwork.artist)} · ${safeText(artwork.year)}</p><div class="card-foot"><span>${safeText(artwork.museum)}</span><span>VIEW ↗</span></div></div>
  </article>`;
}
function renderArtworks() {
  const q = $('artSearch').value.trim().toLowerCase();
  const filtered = artworks.filter(a => (artFilter === 'all' || a.category === artFilter) && [a.title,a.artist,a.year,a.medium,a.museum,...a.tags].join(' ').toLowerCase().includes(q));
  $('artGrid').innerHTML = filtered.map(a => artCard(a, artworks.indexOf(a))).join('');
  $('artEmpty').classList.toggle('hidden', filtered.length !== 0);
  $('artCount').textContent = String(artworks.length).padStart(2, '0');
  $('artGrid').querySelectorAll('img').forEach(img => withFallback(img, img.dataset.fallback));
}
function poseCard(pose) {
  const savedClass = isSaved(pose.id) ? 'saved' : '';
  const src = pose.image;
  return `<article class="pose-card" data-pose-id="${safeText(pose.id)}">
    <div class="pose-image" data-open-pose="${safeText(pose.id)}" tabindex="0" role="button" aria-label="Open ${safeText(pose.title)} pose angles"><img loading="lazy" src="${safeText(src)}" alt="${safeText(pose.title)} — mannequin pose study"></div>
    <div class="pose-card-info"><div class="pose-topline"><span class="pose-id">${safeText(pose.id)} / SHISEI</span><button class="heart-button ${savedClass}" data-save-pose="${safeText(pose.id)}" aria-label="${savedClass ? 'Remove saved pose' : 'Save pose'}">${savedClass ? '♥' : '♡'}</button></div><h3>${safeText(pose.title)}</h3><p>${safeText(pose.description)}</p><div class="pose-card-actions"><span class="pose-id">${Object.values(pose.views).filter(Boolean).length} VIEWPOINT${Object.values(pose.views).filter(Boolean).length === 1 ? '' : 'S'}</span><button class="text-button" data-open-pose="${safeText(pose.id)}">Explore angles ↗</button></div></div>
  </article>`;
}
function renderPoses() {
  const q = $('poseSearch').value.trim().toLowerCase();
  const filtered = poseSets.filter(p => (poseFilter === 'all' || p.category === poseFilter || (poseFilter === 'dynamic' && ['squatting','leaning','twist','arching'].includes(p.category))) && [p.id,p.title,p.description,p.category].join(' ').toLowerCase().includes(q));
  $('poseGrid').innerHTML = filtered.map(poseCard).join('');
  $('poseGrid').querySelectorAll('img').forEach(img => img.addEventListener('error', () => markImageUnavailable(img), { once: true }));
  $('poseEmpty').classList.toggle('hidden', filtered.length !== 0);
  $('poseCount').textContent = String(poseSets.length).padStart(2, '0');
}
function renderSaved() {
  const grid = $('savedGrid');
  grid.innerHTML = saved.map(item => `<div class="saved-item"><img src="${safeText(item.thumb || item.image || '')}" alt=""><div><strong>${safeText(item.title)}</strong><small>${safeText(item.type === 'pose' ? 'Pose reference' : (item.artist || 'Fine art'))}</small></div><button data-remove-saved="${safeText(item.id)}" aria-label="Remove ${safeText(item.title)}">×</button></div>`).join('');
  $('savedEmpty').classList.toggle('hidden', saved.length !== 0);
  grid.querySelectorAll('img').forEach(img => img.addEventListener('error', () => markImageUnavailable(img), { once: true }));
}
function openArt(artwork) {
  currentArtIndex = artworks.indexOf(artwork);
  fillArtModal();
  $('artModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  $('closeArtModal').focus();
}
function fillArtModal() {
  const artwork = artworks[currentArtIndex];
  $('modalImage').src = artwork.image;
  $('modalImage').alt = `${artwork.title} by ${artwork.artist}`;
  $('modalImage').onerror = () => {
    if (artwork.fallback && $('modalImage').dataset.fallbackUsed !== '1') {
      $('modalImage').dataset.fallbackUsed = '1';
      $('modalImage').src = artwork.fallback;
    } else markImageUnavailable($('modalImage'));
  };
  $('modalImage').dataset.fallbackUsed = '';
  $('imageIndex').textContent = `${currentArtIndex + 1} / ${artworks.length}`;
  $('modalMuseum').textContent = artwork.museum.toUpperCase();
  $('modalTitle').textContent = artwork.title;
  $('modalArtist').textContent = `${artwork.artist} · ${artwork.year}`;
  $('modalMeta').innerHTML = `<dt>Medium</dt><dd>${safeText(artwork.medium)}</dd><dt>Collection</dt><dd>${safeText(artwork.museum)}</dd><dt>Category</dt><dd>${safeText(artwork.kind)}</dd>`;
  $('sourceLink').href = artwork.sourceUrl;
  $('modalRights').textContent = artwork.rights;
  $('modalSave').textContent = isSaved(artwork.id) ? '♥ Saved' : '♡ Save artwork';
  $('modalSave').dataset.id = artwork.id;
}
function updateModalSaveState() {
  if (!$('artModal').classList.contains('hidden')) {
    const item = artworks[currentArtIndex];
    $('modalSave').textContent = isSaved(item.id) ? '♥ Saved' : '♡ Save artwork';
  }
  if (currentPose && !$('poseModal').classList.contains('hidden')) $('poseModalSave').textContent = isSaved(currentPose.id) ? '♥' : '♡';
}
function closeModal(id) {
  $(id).classList.add('hidden');
  if ($('artModal').classList.contains('hidden') && $('poseModal').classList.contains('hidden')) document.body.style.overflow = '';
}
function changeArtwork(direction) {
  currentArtIndex = (currentArtIndex + direction + artworks.length) % artworks.length;
  fillArtModal();
}
function openPose(pose) {
  currentPose = pose;
  currentAngle = pose.views.front ? 'front' : Object.keys(pose.views).find(k => pose.views[k]);
  $('poseModalId').textContent = pose.id;
  $('poseModalTitle').textContent = pose.title;
  $('poseModalDesc').textContent = pose.description;
  $('poseModalSave').textContent = isSaved(pose.id) ? '♥' : '♡';
  renderPoseAngle();
  $('poseModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  $('closePoseModal').focus();
}
function renderPoseAngle() {
  if (!currentPose) return;
  const src = poseImage(currentPose, currentAngle);
  const img = $('poseModalImage');
  if (src) {
    img.src = src;
    img.alt = `${currentPose.title}, ${angleLabels[currentAngle].toLowerCase()}`;
    img.classList.remove('image-error');
    $('poseStage')?.classList.remove('load-failed');
    img.onerror = () => markImageUnavailable(img);
  }
  $('poseAngleLabel').textContent = angleLabels[currentAngle];
  $('angleSwitcher').querySelectorAll('[data-angle]').forEach(btn => {
    const available = Boolean(currentPose.views[btn.dataset.angle]);
    btn.disabled = !available;
    btn.classList.toggle('active', btn.dataset.angle === currentAngle);
    btn.title = available ? angleLabels[btn.dataset.angle] : 'This angle is not available for this pose';
  });
}
function selectFilter(containerId, value) {
  $(containerId).querySelectorAll('[data-filter]').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === value));
}

$('confirmAge').addEventListener('click', () => {
  try { localStorage.setItem(CONSENT_KEY, 'yes'); } catch {}
  $('ageGate').classList.add('hidden');
});
try { if (localStorage.getItem(CONSENT_KEY) === 'yes') $('ageGate').classList.add('hidden'); } catch {}

$('artGrid').addEventListener('click', event => {
  const saveButton = event.target.closest('[data-save-art]');
  if (saveButton) {
    event.stopPropagation();
    const artwork = artworks.find(a => a.id === saveButton.dataset.saveArt);
    if (artwork) toggleSaved({ id: artwork.id, title: artwork.title, artist: artwork.artist, thumb: artwork.thumb, type: 'art' });
    return;
  }
  const card = event.target.closest('[data-art-id]');
  if (card) openArt(artworks.find(a => a.id === card.dataset.artId));
});
$('artGrid').addEventListener('keydown', event => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-art-id]')) {
    event.preventDefault(); openArt(artworks.find(a => a.id === event.target.dataset.artId));
  }
});
$('poseGrid').addEventListener('keydown', event => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-open-pose]')) {
    event.preventDefault();
    openPose(poseSets.find(p => p.id === event.target.dataset.openPose));
  }
});
$('poseGrid').addEventListener('click', event => {
  const saveButton = event.target.closest('[data-save-pose]');
  if (saveButton) {
    const pose = poseSets.find(p => p.id === saveButton.dataset.savePose);
    if (pose) toggleSaved({ id: pose.id, title: pose.title, thumb: poseImage(pose, 'diag'), type: 'pose' });
    return;
  }
  const openButton = event.target.closest('[data-open-pose]');
  if (openButton) openPose(poseSets.find(p => p.id === openButton.dataset.openPose));
});
$('savedGrid').addEventListener('click', event => {
  const button = event.target.closest('[data-remove-saved]');
  if (!button) return;
  const id = button.dataset.removeSaved;
  saved = saved.filter(item => item.id !== id);
  persistSaved(); renderSaved(); renderArtworks(); renderPoses(); showToast('Removed from your shelf.');
});
$('artFilters').addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  artFilter = button.dataset.filter; selectFilter('artFilters', artFilter); renderArtworks();
});
$('poseFilters').addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  poseFilter = button.dataset.filter; selectFilter('poseFilters', poseFilter); renderPoses();
});
$('artSearch').addEventListener('input', renderArtworks);
$('poseSearch').addEventListener('input', renderPoses);
$('modalSave').addEventListener('click', () => {
  const item = artworks[currentArtIndex];
  toggleSaved({ id: item.id, title: item.title, artist: item.artist, thumb: item.thumb, type: 'art' });
});
$('poseModalSave').addEventListener('click', () => {
  if (!currentPose) return;
  toggleSaved({ id: currentPose.id, title: currentPose.title, thumb: poseImage(currentPose, 'diag'), type: 'pose' });
});
$('angleSwitcher').addEventListener('click', event => {
  const btn = event.target.closest('[data-angle]');
  if (!btn || btn.disabled || !currentPose) return;
  currentAngle = btn.dataset.angle; renderPoseAngle();
});
$('closeArtModal').addEventListener('click', () => closeModal('artModal'));
$('closePoseModal').addEventListener('click', () => closeModal('poseModal'));
$('prevArtwork').addEventListener('click', () => changeArtwork(-1));
$('nextArtwork').addEventListener('click', () => changeArtwork(1));
$('artModal').addEventListener('click', event => { if (event.target === $('artModal')) closeModal('artModal'); });
$('poseModal').addEventListener('click', event => { if (event.target === $('poseModal')) closeModal('poseModal'); });

// Touch-first navigation: swipe the artwork image to move through the collection,
// or swipe the pose stage to move between available camera angles.
function addSwipeNavigation(element, onSwipe) {
  let start = null;
  element.addEventListener('pointerdown', event => {
    if (event.target.closest('button, a, input')) return;
    start = { x: event.clientX, y: event.clientY };
  });
  element.addEventListener('pointerup', event => {
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.25) onSwipe(dx < 0 ? 1 : -1);
    start = null;
  });
  element.addEventListener('pointercancel', () => { start = null; });
}
addSwipeNavigation($('modalImage'), direction => changeArtwork(direction));
addSwipeNavigation($('poseModalImage'), direction => {
  if (!currentPose) return;
  const available = ['front','diag','side','above','below'].filter(angle => currentPose.views[angle]);
  const current = available.indexOf(currentAngle);
  currentAngle = available[(current + direction + available.length) % available.length];
  renderPoseAngle();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { closeModal('artModal'); closeModal('poseModal'); }
  if (!$('artModal').classList.contains('hidden')) {
    if (event.key === 'ArrowLeft') changeArtwork(-1);
    if (event.key === 'ArrowRight') changeArtwork(1);
  }
  if (event.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName) && $('ageGate').classList.contains('hidden')) {
    event.preventDefault(); $('artSearch').focus();
  }
});
$('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  try { localStorage.setItem('naked-canvas-theme', document.body.classList.contains('light-theme') ? 'light' : 'dark'); } catch {}
});
try { if (localStorage.getItem('naked-canvas-theme') === 'light') document.body.classList.add('light-theme'); } catch {}
document.querySelectorAll('[data-scroll]').forEach(button => button.addEventListener('click', () => $(button.dataset.scroll).scrollIntoView({ behavior: 'smooth' })));
document.querySelectorAll('.nav-link').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.nav-link').forEach(item => item.classList.toggle('active', item === button));
  $(button.dataset.target).scrollIntoView({ behavior: 'smooth' });
}));

// Reuse every image already present in the gallery as an optional AI reference.
// These are source-hosted links; no third-party binaries are copied into this ZIP.
window.NAKED_CANVAS_CREATOR_REFERENCES = [
  ...artworks.map(art => ({
    id: art.id,
    title: `${art.title} — ${art.artist}`,
    type: 'Artwork',
    image: art.image,
    thumb: art.thumb,
    sourceUrl: art.sourceUrl,
    rights: art.rights
  })),
  ...poseSets.flatMap(pose => Object.entries(pose.views)
    .filter(([, file]) => Boolean(file))
    .map(([angle, file]) => ({
      id: `${pose.id}-${angle}`,
      title: `${pose.title} — ${angleLabels[angle]}`,
      type: 'Shisei CC0 pose reference',
      image: `${POSE_RAW}/${file}`,
      thumb: `${POSE_RAW}/${file}`,
      sourceUrl: 'https://github.com/wquguru/shisei',
      rights: 'Shisei image assets — CC0 1.0 Universal.'
    })))
];

renderArtworks(); renderPoses(); renderSaved(); updateSavedCount();
