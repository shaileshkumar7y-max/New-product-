'use strict';

(() => {
  const API_BASE = 'https://gen.pollinations.ai';
  const OAUTH_DISCOVERY = 'https://enter.pollinations.ai/.well-known/oauth-authorization-server';
  const CLIENT_ID_STORAGE = 'naked-canvas-pollinations-client-id';
  const TOKEN_STORAGE = 'naked-canvas-pollinations-session-token';
  const TOKEN_EXPIRY_STORAGE = 'naked-canvas-pollinations-session-expiry';
  const VERIFIER_STORAGE = 'naked-canvas-pollinations-pkce-verifier';
  const STATE_STORAGE = 'naked-canvas-pollinations-oauth-state';
  const REDIRECT_STORAGE = 'naked-canvas-pollinations-oauth-redirect';
  const CLIENT_TEMP_STORAGE = 'naked-canvas-pollinations-oauth-client';
  const SAVED_OUTPUTS_STORAGE = 'naked-canvas-creator-saved-outputs';
  const MODEL_PREF_STORAGE = 'naked-canvas-creator-last-model';

  const $ = id => document.getElementById(id);
  const controls = [
    'pollinationsClientId', 'creatorBudget', 'creatorExpiry', 'creatorPreset',
    'creatorMedium', 'creatorPose', 'creatorLighting', 'creatorPalette',
    'creatorSubject', 'creatorModel', 'creatorSize', 'creatorPrompt',
    'creatorReference', 'creatorSeed', 'creatorSavedShelf', 'creatorSavedEmpty'
  ];
  if (!controls.every(id => $(id))) return;

  let accessToken = '';
  let currentImageUrl = '';
  let currentImageBlobUrl = '';
  let modelCatalog = [];
  let generationController = null;
  let generationTimeout = 0;
  let savedOutputs = readSavedOutputs();

  const presetDescriptions = {
    academic: 'A museum-quality academic figure study with careful observation of gesture, balance, proportion and silhouette; tasteful, non-explicit classical art direction',
    draped: 'A dignified classical adult figure with elegant draped fabric, sculptural folds and a timeless atelier atmosphere; tasteful, non-explicit fine art',
    gesture: 'A professional life-drawing session with a clearly adult, fully clothed artist model; expressive gesture, confident line and natural body mechanics',
    portrait: 'An intimate but non-sexual fine-art portrait of a clearly adult subject; expressive eyes, thoughtful character and painterly presence',
    sculpture: 'A classical marble sculpture study of an idealised adult human form; museum lighting, sculptural planes and respectful academic presentation',
    duo: 'Two clearly adult art models in a graceful, non-romantic studio composition; coordinated gesture, balanced silhouettes and respectful personal space'
  };

  const inspirationIdeas = [
    'A confident adult art model in a calm studio, elegant posture and expressive silhouette',
    'A thoughtful adult model beside a tall atelier window, quiet presence and graceful gesture',
    'A classical adult figure study with flowing fabric, natural posture and sculptural light',
    'An adult portrait subject in a moody artist studio, subtle expression and rich atmosphere',
    'Two adult models arranged in a balanced, non-contact composition for a life-drawing study'
  ];

  function cleanPageUrl() {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    return url.href;
  }

  function setAuthStatus(message, state = '') {
    const status = $('creatorAuthStatus');
    status.classList.remove('connected', 'error');
    if (state) status.classList.add(state);
    status.lastElementChild.textContent = message;
  }

  function setGenerationStatus(message, state = '') {
    const status = $('creatorGenerationStatus');
    status.classList.remove('error', 'success');
    if (state) status.classList.add(state);
    status.textContent = message;
  }

  function getLiveToken() {
    try {
      const expiry = Number(sessionStorage.getItem(TOKEN_EXPIRY_STORAGE) || 0);
      const token = sessionStorage.getItem(TOKEN_STORAGE) || '';
      if (token && Number.isFinite(expiry) && expiry > Date.now()) return token;
      sessionStorage.removeItem(TOKEN_STORAGE);
      sessionStorage.removeItem(TOKEN_EXPIRY_STORAGE);
    } catch (_) {}
    return '';
  }

  function setConnectedUI(connected) {
    $('connectPollinations').classList.toggle('hidden', connected);
    $('disconnectPollinations').classList.toggle('hidden', !connected);
    $('generateCreatorImage').disabled = !connected || !modelCatalog.length;
    $('creatorConnectionTitle').textContent = connected ? 'Your image studio is connected' : 'Connect your image studio';
    if (connected) setAuthStatus('Connected for this tab · user-approved Pollen budget applies', 'connected');
    else setAuthStatus('Not connected · prompt builder is ready');
  }

  async function discoverOAuthMetadata() {
    const response = await fetch(OAUTH_DISCOVERY, { method: 'GET', cache: 'no-store' });
    if (!response.ok) throw new Error(`Could not load Pollinations sign-in details (${response.status}).`);
    const metadata = await response.json();
    if (!metadata.authorization_endpoint || !metadata.token_endpoint) {
      throw new Error('Pollinations sign-in metadata is missing required OAuth endpoints.');
    }
    return metadata;
  }

  function randomBase64Url(byteCount = 32) {
    const bytes = new Uint8Array(byteCount);
    crypto.getRandomValues(bytes);
    let binary = '';
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  async function createCodeChallenge(verifier) {
    const input = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', input);
    const bytes = new Uint8Array(digest);
    let binary = '';
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  async function connectPollinations() {
    const clientId = $('pollinationsClientId').value.trim();
    if (!/^pk_[A-Za-z0-9_-]{8,}$/.test(clientId)) {
      setAuthStatus('Enter a valid Pollinations App Key beginning with pk_.', 'error');
      $('pollinationsClientId').focus();
      return;
    }
    if (!window.isSecureContext && location.hostname !== 'localhost') {
      setAuthStatus('Sign-in needs HTTPS. Open the published GitHub Pages URL, not a local file.', 'error');
      return;
    }

    const budget = Number($('creatorBudget').value);
    if (!Number.isFinite(budget) || budget < 0.1 || budget > 100) {
      setAuthStatus('Set a consent budget between 0.1 and 100 Pollen.', 'error');
      $('creatorBudget').focus();
      return;
    }

    $('connectPollinations').disabled = true;
    setAuthStatus('Preparing secure sign-in…');
    try {
      const metadata = await discoverOAuthMetadata();
      const verifier = randomBase64Url(48);
      const challenge = await createCodeChallenge(verifier);
      const state = randomBase64Url(32);
      const redirectUri = cleanPageUrl();
      const expiry = $('creatorExpiry').value;

      sessionStorage.setItem(VERIFIER_STORAGE, verifier);
      sessionStorage.setItem(STATE_STORAGE, state);
      sessionStorage.setItem(REDIRECT_STORAGE, redirectUri);
      sessionStorage.setItem(CLIENT_TEMP_STORAGE, clientId);
      try { localStorage.setItem(CLIENT_ID_STORAGE, clientId); } catch (_) { /* The current OAuth attempt can still proceed without remembering this public ID. */ }

      const authorizeUrl = new URL(metadata.authorization_endpoint);
      authorizeUrl.searchParams.set('response_type', 'code');
      authorizeUrl.searchParams.set('client_id', clientId);
      authorizeUrl.searchParams.set('redirect_uri', redirectUri);
      authorizeUrl.searchParams.set('state', state);
      authorizeUrl.searchParams.set('code_challenge', challenge);
      authorizeUrl.searchParams.set('code_challenge_method', 'S256');
      authorizeUrl.searchParams.set('models', 'image');
      authorizeUrl.searchParams.set('budget', String(budget));
      authorizeUrl.searchParams.set('expiry', expiry);
      window.location.assign(authorizeUrl.toString());
    } catch (error) {
      $('connectPollinations').disabled = false;
      setAuthStatus(error.message || 'Could not start Pollinations sign-in.', 'error');
    }
  }

  async function handleOAuthCallback() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const oauthError = url.searchParams.get('error');
    if (!code && !oauthError) return;

    const returnedState = url.searchParams.get('state') || '';
    let expectedState = '';
    let verifier = '';
    let redirectUri = cleanPageUrl();
    let clientId = '';
    try {
      expectedState = sessionStorage.getItem(STATE_STORAGE) || '';
      verifier = sessionStorage.getItem(VERIFIER_STORAGE) || '';
      redirectUri = sessionStorage.getItem(REDIRECT_STORAGE) || cleanPageUrl();
      clientId = sessionStorage.getItem(CLIENT_TEMP_STORAGE) || localStorage.getItem(CLIENT_ID_STORAGE) || '';
    } catch (_) {
      clearOAuthScratch();
      window.history.replaceState({}, document.title, cleanPageUrl());
      setAuthStatus('This browser blocked session storage. Enable site storage and connect again.', 'error');
      return;
    }
    window.history.replaceState({}, document.title, cleanPageUrl());

    if (oauthError) {
      clearOAuthScratch();
      setAuthStatus(oauthError === 'access_denied' ? 'Connection cancelled. You have not been connected.' : `Sign-in was not completed: ${oauthError}.`, 'error');
      return;
    }
    if (!code || !returnedState || returnedState !== expectedState || !verifier || !clientId) {
      clearOAuthScratch();
      setAuthStatus('Sign-in callback could not be verified. Start the connection again.', 'error');
      return;
    }

    setAuthStatus('Securely completing your Pollinations connection…');
    try {
      const metadata = await discoverOAuthMetadata();
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        redirect_uri: redirectUri,
        code_verifier: verifier
      });
      const response = await fetch(metadata.token_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
      const tokenData = await response.json().catch(() => ({}));
      if (!response.ok || !tokenData.access_token) {
        const reason = tokenData.error_description || tokenData.message || tokenData.error || `HTTP ${response.status}`;
        throw new Error(`Pollinations connection failed: ${reason}`);
      }
      const expiresIn = Number(tokenData.expires_in);
      if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
        throw new Error('Pollinations did not return a valid token expiry. Please reconnect and try again.');
      }
      const expiresAt = Date.now() + expiresIn * 1000;
      try {
        sessionStorage.setItem(TOKEN_STORAGE, tokenData.access_token);
        sessionStorage.setItem(TOKEN_EXPIRY_STORAGE, String(expiresAt));
      } catch (_) {
        throw new Error('The browser could not store your temporary connection. Enable session storage and reconnect.');
      }
      accessToken = tokenData.access_token;
      clearOAuthScratch();
      setConnectedUI(true);
      setGenerationStatus('Connected. Review the selected model and prompt, then generate when ready.');
    } catch (error) {
      clearOAuthScratch();
      setAuthStatus(error.message || 'Could not complete Pollinations connection.', 'error');
    }
  }

  function clearOAuthScratch() {
    [VERIFIER_STORAGE, STATE_STORAGE, REDIRECT_STORAGE, CLIENT_TEMP_STORAGE].forEach(key => {
      try { sessionStorage.removeItem(key); } catch (_) {}
    });
  }

  function modelInputModalities(model) {
    const raw = model?.input_modalities ?? model?.inputModalities ?? model?.modalities?.input ?? model?.capabilities?.input_modalities ?? model?.capabilities?.input?.modalities ?? [];
    if (Array.isArray(raw)) return raw.map(value => String(value).toLowerCase());
    if (typeof raw === 'string') return raw.toLowerCase().split(/[\s,]+/).filter(Boolean);
    return [];
  }

  function modelSupportsImageInput(model) {
    const modalities = modelInputModalities(model);
    return modalities.includes('image') || model?.supports_image_input === true || model?.image_input === true;
  }

  function selectedReference() {
    const referenceId = $('creatorReference').value;
    if (!referenceId) return null;
    return (window.NAKED_CANVAS_CREATOR_REFERENCES || []).find(item => item.id === referenceId) || null;
  }

  function updateReferenceSupportUI() {
    const model = modelCatalog.find(item => item.id === $('creatorModel').value);
    const reference = selectedReference();
    const note = $('creatorReferenceNote');
    if (!reference) {
      note.textContent = `${(window.NAKED_CANVAS_CREATOR_REFERENCES || []).length} available gallery references. Pick one to use it as an image input when the selected model supports image input.`;
      return;
    }
    if (!model) {
      note.textContent = 'Choose a live model first. Image-reference support is checked from its catalogue metadata.';
      return;
    }
    note.textContent = modelSupportsImageInput(model)
      ? 'This model advertises image input. The selected source image will be sent as a visual reference.'
      : 'This model does not advertise image input. Choose another model or set the reference to “No reference image”.';
  }

  function populateReferenceChoices() {
    const select = $('creatorReference');
    const references = window.NAKED_CANVAS_CREATOR_REFERENCES || [];
    select.innerHTML = '<option value="">No reference image — text to image</option>';
    references.forEach(reference => {
      const option = document.createElement('option');
      option.value = reference.id;
      option.textContent = `${reference.type} · ${reference.title}`;
      select.appendChild(option);
    });
    const count = references.length;
    $('creatorReferenceNote').textContent = count
      ? `${count} available gallery image views. Source-hosted images are not copied into this app.`
      : 'No gallery reference images are available. The text prompt builder still works.';
  }

  function updateReferencePreview() {
    const reference = selectedReference();
    const wrap = $('creatorReferencePreviewWrap');
    if (!reference) {
      wrap.classList.add('hidden');
      updateReferenceSupportUI();
      return;
    }
    $('creatorReferencePreview').src = reference.thumb || reference.image;
    $('creatorReferencePreview').alt = `Selected reference: ${reference.title}`;
    $('creatorReferenceTitle').textContent = reference.title;
    $('creatorReferenceRights').textContent = `${reference.type} · ${reference.rights || 'Source information retained in the gallery.'}`;
    wrap.classList.remove('hidden');
    updateReferenceSupportUI();
  }

  async function loadImageModels() {
    const select = $('creatorModel');
    select.innerHTML = '<option value="">Loading official image models…</option>';
    try {
      const response = await fetch(`${API_BASE}/image/models?source=official`, { method: 'GET', cache: 'no-store' });
      if (!response.ok) throw new Error(`Catalogue request returned ${response.status}`);
      const payload = await response.json();
      const rows = Array.isArray(payload) ? payload : (payload.data || payload.models || []);
      modelCatalog = rows.filter(model => {
        if (!model || !model.id) return false;
        const type = String(model.type || model.modality || '').toLowerCase();
        const outputs = Array.isArray(model.output_modalities) ? model.output_modalities.map(value => String(value).toLowerCase()) : [];
        if (type === 'video' && !outputs.includes('image')) return false;
        if (outputs.length && !outputs.includes('image')) return false;
        return true;
      });
      if (!modelCatalog.length) throw new Error('No official image models were returned.');
      select.innerHTML = '';
      modelCatalog.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        const publisher = model.publisher ? `${model.publisher} · ` : '';
        const label = model.name || model.title || model.id;
        const imageSupport = modelSupportsImageInput(model) ? ' · image input' : '';
        option.textContent = `${publisher}${label} · ${model.id}${imageSupport}`;
        select.appendChild(option);
      });
      let preferredId = '';
      try { preferredId = localStorage.getItem(MODEL_PREF_STORAGE) || ''; } catch (_) {}
      const preferred = modelCatalog.find(model => model.id === preferredId || (Array.isArray(model.aliases) && model.aliases.includes(preferredId)))
        || modelCatalog.find(model => model.id === 'black-forest-labs/flux.1-schnell' || (Array.isArray(model.aliases) && model.aliases.includes('flux')))
        || modelCatalog.find(model => model.id === 'flux')
        || modelCatalog[0];
      select.value = preferred.id;
      $('creatorModelNote').textContent = `Loaded ${modelCatalog.length} official image models from the live catalogue. Pricing and supported inputs vary by model; no fixed price is assumed.`;
      updateReferenceSupportUI();
    } catch (error) {
      modelCatalog = [];
      select.innerHTML = '<option value="">Model catalogue unavailable</option>';
      $('creatorModelNote').textContent = 'Could not load the live catalogue. Check your connection and reload the page; no model or price has been assumed.';
      setGenerationStatus(error.message || 'Could not load image models.', 'error');
    }
    setConnectedUI(Boolean(accessToken));
  }

  function buildPrompt() {
    const direction = $('creatorSubject').value.trim();
    if (!direction) {
      setGenerationStatus('Add a short creative direction first.');
      $('creatorSubject').focus();
      return '';
    }
    const reference = selectedReference();
    const prompt = [
      presetDescriptions[$('creatorPreset').value] || presetDescriptions.academic,
      direction,
      `Pose and composition: ${$('creatorPose').value}.`,
      `Art medium and technique: ${$('creatorMedium').value}.`,
      `Lighting: ${$('creatorLighting').value}.`,
      `Colour direction: ${$('creatorPalette').value}.`,
      reference ? `Use the attached ${reference.type.toLowerCase()} reference for pose, composition or visual-art direction; create a fresh original artwork rather than reproducing the source exactly.` : '',
      'Clearly adult subjects only, non-explicit fine-art presentation, respectful academic art context, natural anatomy, carefully observed proportions, believable hands, considered composition, refined detail, no minors, no sexual activity.'
    ].filter(Boolean).join(' ');
    $('creatorPrompt').value = prompt;
    setGenerationStatus('Prompt ready. You can edit it before generating.');
    return prompt;
  }

  function promptSafetyMessage(prompt) {
    const minorTerms = /\b(child|children|kid|kids|minor|underage|teen|teenager|schoolgirl|schoolboy|loli|shota|preteen|toddler|infant)\b/i;
    const explicitTerms = /\b(explicit sex|sexual intercourse|penetration|pornographic|pornography|sexual act|genitals exposed for sex|rape|bestiality|incest|sexual coercion|non[- ]consensual sex)\b/i;
    if (minorTerms.test(prompt)) return 'This studio is restricted to clearly adult art subjects. Remove any reference to minors or underage people.';
    if (explicitTerms.test(prompt)) return 'This creator supports non-explicit fine-art imagery only. Please revise the prompt to an academic or artistic direction.';
    return '';
  }

  async function generateImage() {
    accessToken = getLiveToken();
    setConnectedUI(Boolean(accessToken));
    if (!accessToken) {
      setGenerationStatus('Connect Pollinations first. Your prompt can still be built and copied without connecting.');
      return;
    }
    const prompt = $('creatorPrompt').value.trim() || buildPrompt();
    if (!prompt) return;
    const safetyMessage = promptSafetyMessage(prompt);
    if (safetyMessage) {
      setGenerationStatus(safetyMessage, 'error');
      return;
    }
    const model = modelCatalog.find(item => item.id === $('creatorModel').value);
    if (!model) {
      setGenerationStatus('Choose an image model from the live catalogue.', 'error');
      return;
    }
    const reference = selectedReference();
    if (reference && !modelSupportsImageInput(model)) {
      setGenerationStatus('This model does not advertise image input. Choose a reference-capable model or remove the reference image.', 'error');
      updateReferenceSupportUI();
      return;
    }
    const seedText = $('creatorSeed').value.trim();
    const seed = seedText === '' ? null : Number(seedText);
    if (seed !== null && (!Number.isInteger(seed) || seed < 0 || seed > 4294967295)) {
      setGenerationStatus('Seed must be a whole number from 0 to 4,294,967,295.', 'error');
      $('creatorSeed').focus();
      return;
    }

    const button = $('generateCreatorImage');
    const retryButton = $('retryCreatorGeneration');
    button.disabled = true;
    button.textContent = 'Creating…';
    retryButton.classList.add('hidden');
    $('cancelCreatorGeneration').classList.remove('hidden');
    generationController = new AbortController();
    setGenerationStatus('Sending your prompt to Pollinations. Generation may take a little while…');

    const requestBody = {
      model: model.id,
      prompt,
      size: $('creatorSize').value,
      n: 1,
      response_format: 'url'
    };
    if (seed !== null) requestBody.seed = seed;
    if (reference) requestBody.image = reference.image;

    try {
      generationTimeout = window.setTimeout(() => generationController?.abort('timeout'), 180000);
      const response = await fetch(`${API_BASE}/v1/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: generationController.signal
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const details = result.error?.message || result.error || result.message || `HTTP ${response.status}`;
        const hint = response.status === 401 ? ' Reconnect Pollinations.' : response.status === 402 ? ' Your approved Pollen budget or available balance may be exhausted.' : response.status === 429 ? ' Wait before trying again.' : '';
        throw new Error(`Generation failed: ${details}.${hint}`);
      }
      const item = Array.isArray(result.data) ? result.data[0] : null;
      if (!item) throw new Error('The provider returned no image. Try another model or prompt.');
      if (item.url) {
        const providerUrl = new URL(item.url, API_BASE);
        if (providerUrl.protocol !== 'https:') throw new Error('The provider returned an unsupported image URL.');
        currentImageUrl = providerUrl.href;
        if (currentImageBlobUrl) URL.revokeObjectURL(currentImageBlobUrl);
        currentImageBlobUrl = '';
      } else if (item.b64_json) {
        const binary = atob(item.b64_json);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: item.media_type || 'image/png' });
        currentImageBlobUrl = URL.createObjectURL(blob);
        currentImageUrl = currentImageBlobUrl;
      } else {
        throw new Error('The provider response did not include a supported image URL or image payload.');
      }
      $('creatorOutputImage').src = currentImageUrl;
      $('creatorOutputImage').classList.remove('hidden');
      $('creatorOutput').querySelector('.creator-output-placeholder').classList.add('hidden');
      $('creatorOutputActions').classList.remove('hidden');
      $('saveCreatorImage').hidden = !currentImageUrl.startsWith('https://');
      $('saveCreatorImage').disabled = !currentImageUrl.startsWith('https://');
      $('saveCreatorImage').textContent = 'Save to studio ♡';
      setGenerationStatus(`Artwork generated with ${model.id}${seed !== null ? ` · seed ${seed}` : ''}. Review the result; save the link or download a copy.`, 'success');
    } catch (error) {
      const wasCancelled = error.name === 'AbortError' || generationController?.signal.aborted;
      if (wasCancelled) {
        setGenerationStatus('Generation cancelled or timed out. Check your Pollinations usage before retrying; only the provider can confirm whether a request was billed.', 'error');
      } else {
        setGenerationStatus(error.message || 'Image generation failed. Please try again.', 'error');
      }
      retryButton.classList.remove('hidden');
    } finally {
      if (generationTimeout) window.clearTimeout(generationTimeout);
      generationTimeout = 0;
      generationController = null;
      $('cancelCreatorGeneration').classList.add('hidden');
      button.textContent = 'Generate artwork ✦';
      button.disabled = !getLiveToken() || !modelCatalog.length;
    }
  }

  function readSavedOutputs() {
    try {
      const items = JSON.parse(localStorage.getItem(SAVED_OUTPUTS_STORAGE) || '[]');
      if (!Array.isArray(items)) return [];
      return items.filter(item => item && typeof item.url === 'string' && item.url.startsWith('https://')).slice(0, 12);
    } catch (_) { return []; }
  }

  function persistSavedOutputs() {
    try {
      localStorage.setItem(SAVED_OUTPUTS_STORAGE, JSON.stringify(savedOutputs.slice(0, 12)));
      return true;
    } catch (_) {
      setGenerationStatus('Browser storage is full or blocked. Download the image to keep a permanent copy.', 'error');
      return false;
    }
  }

  function renderSavedOutputs() {
    const grid = $('creatorSavedShelf');
    grid.replaceChildren();
    $('creatorSavedEmpty').classList.toggle('hidden', savedOutputs.length > 0);
    $('clearCreatorShelf').classList.toggle('hidden', savedOutputs.length === 0);
    savedOutputs.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'creator-saved-card';
      const image = document.createElement('img');
      image.loading = 'lazy';
      image.src = item.url;
      image.alt = `Saved AI artwork ${index + 1}`;
      image.addEventListener('error', () => { image.alt = 'Saved image link is no longer available; use your downloaded copy if saved.'; image.classList.add('image-error'); }, { once: true });
      const info = document.createElement('div');
      info.className = 'creator-saved-card-info';
      const title = document.createElement('strong');
      title.textContent = item.title || 'AI artwork';
      const meta = document.createElement('small');
      meta.textContent = `${item.model || 'Image model'} · ${item.savedAt ? new Date(item.savedAt).toLocaleDateString() : 'Saved locally'}`;
      const actions = document.createElement('div');
      actions.className = 'creator-saved-card-actions';
      const open = document.createElement('a');
      open.href = item.url;
      open.target = '_blank';
      open.rel = 'noopener noreferrer';
      open.textContent = 'Open image ↗';
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.textContent = 'Copy prompt';
      copy.addEventListener('click', () => copyText(item.prompt || '', 'Saved prompt copied.'));
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.addEventListener('click', () => {
        savedOutputs = savedOutputs.filter(entry => entry.id !== item.id);
        persistSavedOutputs();
        renderSavedOutputs();
        setGenerationStatus('Saved output removed from this browser shelf.');
      });
      actions.append(open, copy, remove);
      info.append(title, meta, actions);
      card.append(image, info);
      grid.append(card);
    });
  }

  function saveCurrentOutput() {
    if (!currentImageUrl || !currentImageUrl.startsWith('https://')) {
      setGenerationStatus('This result is only in the current tab. Download it before closing the page.', 'error');
      return;
    }
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url: currentImageUrl,
      title: $('creatorSubject').value.trim().slice(0, 90) || 'AI fine-art study',
      prompt: $('creatorPrompt').value.trim(),
      model: $('creatorModel').value,
      seed: $('creatorSeed').value.trim() || '',
      savedAt: new Date().toISOString()
    };
    savedOutputs = [item, ...savedOutputs.filter(entry => entry.url !== item.url)].slice(0, 12);
    if (persistSavedOutputs()) {
      renderSavedOutputs();
      setGenerationStatus('Saved to My Studio on this device. Download a copy for permanent storage.', 'success');
      $('saveCreatorImage').textContent = 'Saved ✓';
    }
  }

  async function copyText(text, successMessage) {
    if (!text.trim()) {
      setGenerationStatus('There is no prompt to copy yet.');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setGenerationStatus(successMessage, 'success');
    } catch (_) {
      const helper = document.createElement('textarea');
      helper.value = text;
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      const copied = document.execCommand('copy');
      helper.remove();
      setGenerationStatus(copied ? successMessage : 'Copy was blocked by the browser. Select the text and copy it manually.', copied ? 'success' : 'error');
    }
  }

  async function downloadImage() {
    if (!currentImageUrl) return;
    if (currentImageBlobUrl) {
      saveBlobUrl(currentImageBlobUrl);
      return;
    }
    setGenerationStatus('Preparing your download…');
    try {
      const response = await fetch(currentImageUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('The image host did not allow a direct download.');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      saveBlobUrl(blobUrl);
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
      setGenerationStatus('Download started.', 'success');
    } catch (_) {
      setGenerationStatus('Direct download is blocked by the image host. Use “Open full size”, then save the image from your browser.');
    }
  }

  function saveBlobUrl(url) {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `naked-canvas-art-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  $('connectPollinations').addEventListener('click', connectPollinations);
  $('disconnectPollinations').addEventListener('click', () => {
    accessToken = '';
    try {
      sessionStorage.removeItem(TOKEN_STORAGE);
      sessionStorage.removeItem(TOKEN_EXPIRY_STORAGE);
    } catch (_) {}
    setConnectedUI(false);
    setGenerationStatus('Disconnected. Your App Key remains saved on this device; the approved session token has been cleared.');
  });
  $('pollinationsClientId').addEventListener('change', () => {
    const value = $('pollinationsClientId').value.trim();
    try {
      if (value) localStorage.setItem(CLIENT_ID_STORAGE, value);
      else localStorage.removeItem(CLIENT_ID_STORAGE);
    } catch (_) {}
  });
  $('copyRedirectUri').addEventListener('click', () => copyText(cleanPageUrl(), 'Redirect URL copied. Register this exact URL in your Pollinations App settings.'));
  $('buildCreatorPrompt').addEventListener('click', buildPrompt);
  $('copyCreatorPrompt').addEventListener('click', () => copyText($('creatorPrompt').value, 'Prompt copied to clipboard.'));
  $('shuffleCreatorIdea').addEventListener('click', () => {
    const current = $('creatorSubject').value;
    const choices = inspirationIdeas.filter(idea => idea !== current);
    $('creatorSubject').value = choices[Math.floor(Math.random() * choices.length)] || inspirationIdeas[0];
    buildPrompt();
  });
  $('generateCreatorImage').addEventListener('click', generateImage);
  $('cancelCreatorGeneration').addEventListener('click', () => generationController?.abort('user'));
  $('retryCreatorGeneration').addEventListener('click', generateImage);
  $('saveCreatorImage').addEventListener('click', saveCurrentOutput);
  $('creatorModel').addEventListener('change', () => {
    try { localStorage.setItem(MODEL_PREF_STORAGE, $('creatorModel').value); } catch (_) {}
    updateReferenceSupportUI();
  });
  $('creatorReference').addEventListener('change', () => { updateReferencePreview(); buildPrompt(); });
  $('clearCreatorShelf').addEventListener('click', () => {
    if (!window.confirm('Clear all saved AI image links from this browser? Downloaded images are not affected.')) return;
    savedOutputs = []; persistSavedOutputs(); renderSavedOutputs();
    setGenerationStatus('My Studio shelf cleared. Downloaded files are not affected.');
  });
  $('downloadCreatorImage').addEventListener('click', downloadImage);
  $('openCreatorImage').addEventListener('click', () => {
    if (currentImageUrl) window.open(currentImageUrl, '_blank', 'noopener,noreferrer');
  });

  async function init() {
    try {
      $('pollinationsClientId').value = localStorage.getItem(CLIENT_ID_STORAGE) || '';
    } catch (_) {}

    populateReferenceChoices();
    updateReferencePreview();
    renderSavedOutputs();
    await handleOAuthCallback();
    accessToken = getLiveToken();
    setConnectedUI(Boolean(accessToken));
    await loadImageModels();
    accessToken = getLiveToken();
    setConnectedUI(Boolean(accessToken));
    if (accessToken) setGenerationStatus('Your Pollinations session is connected in this tab.');
    buildPrompt();
  }

  init();
})();
