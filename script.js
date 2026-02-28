/**
 * Fruitie — script.js
 * Handles all interactivity for the Fruitie fruit marketplace.
 * Uses async/await fetch() to simulate backend API calls.
 * Modular, well-commented, DRY architecture.
 */

/* ═══════════════════════════════════════════
   MOCK DATA — simulates backend responses
   (Replace fetch URLs with real API endpoints)
   ═══════════════════════════════════════════ */

const MOCK_FRUITS = [
  { id: 1, name: '🍎 Apple', emoji: '🍎' },
  { id: 2, name: '🍌 Banana', emoji: '🍌' },
  { id: 3, name: '🥭 Mango', emoji: '🥭' },
  { id: 4, name: '🍇 Grapes', emoji: '🍇' },
  { id: 5, name: '🍊 Orange', emoji: '🍊' },
  { id: 6, name: '🍓 Strawberry', emoji: '🍓' },
  { id: 7, name: '🍍 Pineapple', emoji: '🍍' },
  { id: 8, name: '🍉 Watermelon', emoji: '🍉' },
  { id: 9, name: '🫐 Blueberry', emoji: '🫐' },
  { id: 10, name: '🍑 Peach', emoji: '🍑' },
  { id: 11, name: '🍐 Pear', emoji: '🍐' },
  { id: 12, name: '🍒 Cherry', emoji: '🍒' },
];

const MOCK_SELLERS = [
  { name: 'Kamau Fresh Farms', location: 'Kiambu, Kenya', pricePerKg: 120, contact: '0712 345 678', fruit: 'Mango' },
  { name: 'Wanjiru Organics', location: 'Nakuru, Kenya', pricePerKg: 85, contact: '0723 456 789', fruit: 'Apple' },
  { name: 'Rift Valley Produce', location: 'Eldoret, Kenya', pricePerKg: 60, contact: '0734 567 890', fruit: 'Banana' },
  { name: 'Coastal Harvest', location: 'Mombasa, Kenya', pricePerKg: 200, contact: '0745 678 901', fruit: 'Pineapple' },
  { name: 'Highlands Naturals', location: 'Meru, Kenya', pricePerKg: 95, contact: '0756 789 012', fruit: 'Strawberry' },
];

const MOCK_TRANSPORT = [
  { name: 'Speedy Agri-Logistics', type: 'Refrigerated Truck', capacity: 'Up to 5,000 kg', contact: '0701 111 222', available: true },
  { name: 'FreshMoves Kenya', type: 'Open Lorry', capacity: 'Up to 10,000 kg', contact: '0702 333 444', available: true },
  { name: 'Farm2City Transport', type: 'Pickup Van', capacity: 'Up to 1,500 kg', contact: '0703 555 666', available: false },
  { name: 'QuickHaul Ltd', type: 'Refrigerated Van', capacity: 'Up to 3,000 kg', contact: '0704 777 888', available: true },
];

/* ═══════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════ */

/**
 * Simulates a fetch() call with a delay, returning mock data.
 * Replace with real fetch() calls in production.
 * @param {string} url - Placeholder API URL
 * @param {object|null} options - Fetch options (method, body, etc.)
 * @param {*} mockData - Data to resolve with
 * @returns {Promise<*>}
 */
async function mockFetch(url, options = null, mockData) {
  // Simulate network latency (400–800ms)
  await delay(400 + Math.random() * 400);

  // Uncomment below to use real endpoints:
  // const response = await fetch(url, options);
  // if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
  // return await response.json();

  return mockData;
}

/**
 * Simple promise-based delay.
 * @param {number} ms
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Show or hide the loading spinner inside a button.
 * @param {HTMLButtonElement} btn
 * @param {boolean} loading
 */
function setButtonLoading(btn, loading) {
  const text = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');
  btn.disabled = loading;
  text.style.opacity = loading ? '0.5' : '1';
  loader.classList.toggle('hidden', !loading);
}

/**
 * Display an alert message inside a container.
 * @param {HTMLElement} el - The alert element
 * @param {string} message - Message to display
 * @param {'success'|'error'} type
 */
function showAlert(el, message, type) {
  el.textContent = message;
  el.className = `form-alert ${type}`;
}

/**
 * Clear an alert element.
 * @param {HTMLElement} el
 */
function clearAlert(el) {
  el.textContent = '';
  el.className = 'form-alert';
}

/**
 * Mark an input as invalid with an error message.
 * @param {HTMLInputElement} input
 * @param {HTMLElement} errorEl
 * @param {string} message
 */
function setFieldError(input, errorEl, message) {
  input.classList.add('invalid');
  errorEl.textContent = message;
}

/**
 * Clear validation state from an input.
 * @param {HTMLInputElement} input
 * @param {HTMLElement} errorEl
 */
function clearFieldError(input, errorEl) {
  input.classList.remove('invalid');
  errorEl.textContent = '';
}

/**
 * Validate a phone number (Kenyan format: 07xxxxxxxx or +2547xxxxxxxx).
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  return /^(\+?254|0)[17]\d{8}$/.test(phone.replace(/\s+/g, ''));
}

/* ═══════════════════════════════════════════
   SHARED NAVIGATION — Mobile Toggle
   ═══════════════════════════════════════════ */

function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!toggle || !mobileMenu) return;

  toggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    toggle.textContent = mobileMenu.classList.contains('open') ? '✕' : '☰';
  });
}

/* ═══════════════════════════════════════════
   BUYER PAGE
   ═══════════════════════════════════════════ */

/** Fetch and render the available fruits list on buyer page load. */
async function loadFruits() {
  const area = document.getElementById('fruitListArea');
  const loadingEl = document.getElementById('fruitsLoading');
  if (!area) return;

  try {
    // GET /api/fruits
    const fruits = await mockFetch('/api/fruits', null, MOCK_FRUITS);

    // Remove loading indicator
    if (loadingEl) loadingEl.remove();

    // Render fruit tags
    fruits.forEach(fruit => {
      const tag = document.createElement('span');
      tag.className = 'fruit-tag';
      tag.textContent = fruit.name;
      tag.dataset.fruitId = fruit.id;
      tag.setAttribute('role', 'button');
      tag.setAttribute('tabindex', '0');
      tag.setAttribute('aria-pressed', 'false');

      // Toggle selected state on click or Enter key
      tag.addEventListener('click', () => toggleFruitTag(tag));
      tag.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') toggleFruitTag(tag);
      });

      area.appendChild(tag);
    });

  } catch (err) {
    if (loadingEl) loadingEl.remove();
    area.innerHTML = '<p style="color:#d62828;font-size:0.85rem;">Failed to load fruits. Please refresh.</p>';
    console.error('loadFruits error:', err);
  }
}

/**
 * Toggle selection state of a fruit tag.
 * @param {HTMLElement} tag
 */
function toggleFruitTag(tag) {
  const isSelected = tag.classList.contains('selected');
  tag.classList.toggle('selected', !isSelected);
  tag.setAttribute('aria-pressed', String(!isSelected));
}

/** Get the name of the currently selected fruit tag. */
function getSelectedFruit() {
  const selected = document.querySelector('.fruit-tag.selected');
  return selected ? selected.textContent.replace(/^[^\w]+/, '').trim() : null;
}

/** Filter fruit tags based on search input. */
function initFruitSearch() {
  const searchInput = document.getElementById('fruitSearch');
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    document.querySelectorAll('.fruit-tag').forEach(tag => {
      const match = tag.textContent.toLowerCase().includes(query);
      tag.style.display = match ? '' : 'none';
    });
  });
}

/** Validate buyer form fields. Returns true if valid. */
function validateBuyerForm() {
  let valid = true;

  const nameInput = document.getElementById('buyerName');
  const nameError = document.getElementById('buyerNameError');
  const locationInput = document.getElementById('buyerLocation');
  const locationError = document.getElementById('buyerLocationError');
  const phoneInput = document.getElementById('buyerPhone');
  const phoneError = document.getElementById('buyerPhoneError');
  const quantityInput = document.getElementById('quantity');
  const quantityError = document.getElementById('quantityError');

  // Clear previous errors
  [nameInput, locationInput, phoneInput, quantityInput].forEach((el, i) => {
    clearFieldError(el, [nameError, locationError, phoneError, quantityError][i]);
  });

  if (!nameInput.value.trim()) {
    setFieldError(nameInput, nameError, 'Full name is required.');
    valid = false;
  }
  if (!locationInput.value.trim()) {
    setFieldError(locationInput, locationError, 'Location is required.');
    valid = false;
  }
  if (!phoneInput.value.trim()) {
    setFieldError(phoneInput, phoneError, 'Phone number is required.');
    valid = false;
  } else if (!isValidPhone(phoneInput.value.trim())) {
    setFieldError(phoneInput, phoneError, 'Enter a valid phone number (e.g. 0712345678).');
    valid = false;
  }
  if (!quantityInput.value) {
    setFieldError(quantityInput, quantityError, 'Please select a quantity range.');
    valid = false;
  }

  return valid;
}

/** Render a list of seller result cards into the results panel. */
function renderSellerResults(sellers) {
  const container = document.getElementById('sellerResults');
  container.innerHTML = '';

  if (!sellers || sellers.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span>🔎</span>
        <p>No sellers found for your criteria. Try a different fruit or quantity.</p>
      </div>`;
    return;
  }

  sellers.forEach(seller => {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `
      <div class="result-card-info">
        <h3>${escapeHtml(seller.name)}</h3>
        <p>📍 ${escapeHtml(seller.location)}</p>
        <p>🍑 ${escapeHtml(seller.fruit)}</p>
        <p>📞 <a href="tel:${escapeHtml(seller.contact)}">${escapeHtml(seller.contact)}</a></p>
      </div>
      <div>
        <div class="result-card-price">KES ${seller.pricePerKg}</div>
        <div class="result-card-sub">per kg</div>
      </div>`;
    container.appendChild(card);
  });
}

/** Handle buyer form submission — find sellers. */
async function handleFindSellers(e) {
  e.preventDefault();

  if (!validateBuyerForm()) return;

  const btn = document.getElementById('findSellersBtn');
  const alertEl = document.getElementById('buyerFormAlert');
  const resultsContainer = document.getElementById('sellerResults');

  clearAlert(alertEl);
  setButtonLoading(btn, true);

  // Show loading state in results panel
  resultsContainer.innerHTML = `<div class="loading-inline"><div class="loading-dots"><span></span><span></span><span></span></div></div>`;

  // Build request payload
  const payload = {
    name: document.getElementById('buyerName').value.trim(),
    location: document.getElementById('buyerLocation').value.trim(),
    phone: document.getElementById('buyerPhone').value.trim(),
    fruit: getSelectedFruit(),
    quantity: document.getElementById('quantity').value,
  };

  try {
    // POST /api/find-sellers
    const sellers = await mockFetch('/api/find-sellers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, MOCK_SELLERS);

    renderSellerResults(sellers);
    showAlert(alertEl, `✅ Found ${sellers.length} seller(s) near you!`, 'success');

  } catch (err) {
    console.error('handleFindSellers error:', err);
    resultsContainer.innerHTML = `<div class="empty-state"><span>⚠️</span><p>Failed to fetch sellers. Please try again.</p></div>`;
    showAlert(alertEl, '❌ Network error. Please check your connection and retry.', 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}

/** Initialise all buyer page logic. */
function initBuyerPage() {
  const form = document.getElementById('buyerForm');
  if (!form) return;

  loadFruits();
  initFruitSearch();
  form.addEventListener('submit', handleFindSellers);
}

/* ═══════════════════════════════════════════
   SELLER PAGE
   ═══════════════════════════════════════════ */

/** Validate seller form fields. Returns true if valid. */
function validateSellerForm() {
  let valid = true;

  const nameInput     = document.getElementById('sellerName');
  const nameError     = document.getElementById('sellerNameError');
  const locationInput = document.getElementById('sellerLocation');
  const locationError = document.getElementById('sellerLocationError');
  const productInput  = document.getElementById('productName');
  const productError  = document.getElementById('productNameError');
  const priceInput    = document.getElementById('pricePerKg');
  const priceError    = document.getElementById('pricePerKgError');
  const paymentError  = document.getElementById('paymentMethodError');

  [nameInput, locationInput, productInput, priceInput].forEach((el, i) => {
    clearFieldError(el, [nameError, locationError, productError, priceError][i]);
  });
  paymentError.textContent = '';

  if (!nameInput.value.trim()) {
    setFieldError(nameInput, nameError, 'Full name is required.');
    valid = false;
  }
  if (!locationInput.value.trim()) {
    setFieldError(locationInput, locationError, 'Location is required.');
    valid = false;
  }
  if (!productInput.value.trim()) {
    setFieldError(productInput, productError, 'Product name is required.');
    valid = false;
  }

  const price = Number(priceInput.value);
  if (!priceInput.value) {
    setFieldError(priceInput, priceError, 'Price per kg is required.');
    valid = false;
  } else if (isNaN(price) || price <= 0) {
    setFieldError(priceInput, priceError, 'Enter a valid price greater than 0.');
    valid = false;
  } else if (price > 2000) {
    setFieldError(priceInput, priceError, 'Price per kg cannot exceed KES 2,000.');
    valid = false;
  }

  const paymentChecked = document.querySelector('input[name="paymentMethod"]:checked');
  if (!paymentChecked) {
    paymentError.textContent = 'Please select a payment method.';
    valid = false;
  }

  return valid;
}

/** Render transport option cards. */
function renderTransportOptions(options) {
  const container = document.getElementById('transportResults');
  container.innerHTML = '';

  if (!options || options.length === 0) {
    container.innerHTML = `<div class="empty-state"><span>🚫</span><p>No transport options available right now.</p></div>`;
    return;
  }

  options.forEach(opt => {
    const card = document.createElement('div');
    card.className = 'transport-card';
    card.innerHTML = `
      <h3>${escapeHtml(opt.name)}</h3>
      <p>🚚 ${escapeHtml(opt.type)}</p>
      <p>📦 Capacity: ${escapeHtml(opt.capacity)}</p>
      <p>📞 ${escapeHtml(opt.contact)}</p>
      <span class="transport-badge">${opt.available ? '✅ Available' : '❌ Unavailable'}</span>`;
    container.appendChild(card);
  });
}

/** Handle seller product registration form submission. */
async function handleRegisterProduct(e) {
  e.preventDefault();

  if (!validateSellerForm()) return;

  const btn = document.getElementById('registerProductBtn');
  const alertEl = document.getElementById('sellerFormAlert');

  clearAlert(alertEl);
  setButtonLoading(btn, true);

  const payload = {
    name: document.getElementById('sellerName').value.trim(),
    location: document.getElementById('sellerLocation').value.trim(),
    product: document.getElementById('productName').value.trim(),
    pricePerKg: Number(document.getElementById('pricePerKg').value),
    paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
  };

  try {
    // POST /api/register-product
    await mockFetch('/api/register-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, { success: true, message: 'Product registered successfully.' });

    showAlert(alertEl, '✅ Your product has been registered! Buyers can now find you.', 'success');

  } catch (err) {
    console.error('handleRegisterProduct error:', err);
    showAlert(alertEl, '❌ Failed to register product. Please try again.', 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}

/** Handle "Find Transport" button click on seller page. */
async function handleFindTransport() {
  const btn = document.getElementById('findTransportBtn');
  const container = document.getElementById('transportResults');

  setButtonLoading(btn, true);
  container.innerHTML = `<div class="loading-inline"><div class="loading-dots"><span></span><span></span><span></span></div></div>`;

  try {
    // GET /api/transport-options
    const options = await mockFetch('/api/transport-options', null, MOCK_TRANSPORT);
    renderTransportOptions(options);

  } catch (err) {
    console.error('handleFindTransport error:', err);
    container.innerHTML = `<div class="empty-state"><span>⚠️</span><p>Failed to load transport options. Please try again.</p></div>`;
  } finally {
    setButtonLoading(btn, false);
  }
}

/** Initialise all seller page logic. */
function initSellerPage() {
  const form = document.getElementById('sellerForm');
  if (!form) return;

  form.addEventListener('submit', handleRegisterProduct);

  const transportBtn = document.getElementById('findTransportBtn');
  if (transportBtn) {
    transportBtn.addEventListener('click', handleFindTransport);
  }
}

/* ═══════════════════════════════════════════
   SECURITY UTILITY
   ═══════════════════════════════════════════ */

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ═══════════════════════════════════════════
   ENTRY POINT
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Shared across all pages
  initNavToggle();

  // Page-specific initialisation
  initBuyerPage();
  initSellerPage();
/* ═══════════════════════════════════════════
   FRUITIE AI ASSISTANT
   Isolated module — no global variable leakage.
   All logic scoped inside an IIFE.
   ═══════════════════════════════════════════ */

   (function initFruitieAI() {

    /* ── Constants ─────────────────────────── */
    const AI_ENDPOINT = '/api/ai-chat';
    const MAX_HISTORY = 50; // Maximum messages to keep in DOM
  
    /**
     * Detect current page context to send as metadata with every request.
     * Lets the backend tailor AI responses to the active page.
     */
    const PAGE_CONTEXT = (function detectPage() {
      const path = window.location.pathname;
      if (path.includes('buyer'))  return 'buyer';
      if (path.includes('seller')) return 'seller';
      return 'home';
    })();
  
    /* ── DOM References ────────────────────── */
    const fab        = document.getElementById('aiFab');
    const modal      = document.getElementById('aiModal');
    const closeBtn   = document.getElementById('aiCloseBtn');
    const messagesEl = document.getElementById('aiMessages');
    const inputEl    = document.getElementById('aiInput');
    const sendBtn    = document.getElementById('aiSendBtn');
    const typingEl   = document.getElementById('aiTyping');
  
    // Guard: exit silently if AI elements aren't on the page
    if (!fab || !modal) return;
  
    /* ── State ─────────────────────────────── */
    let isOpen    = false;
    let isLoading = false;
  
    /* ── Open / Close ──────────────────────── */
  
    function openModal() {
      modal.hidden = false;
      isOpen = true;
      fab.setAttribute('aria-expanded', 'true');
      inputEl.focus();
      scrollToBottom();
    }
  
    function closeModal() {
      modal.hidden = true;
      isOpen = false;
      fab.setAttribute('aria-expanded', 'false');
    }
  
    function toggleModal() {
      isOpen ? closeModal() : openModal();
    }
  
    /* ── Message Rendering ─────────────────── */
  
    /**
     * Append a message bubble to the chat area.
     * @param {'ai'|'user'|'error'} role
     * @param {string} text
     */
    function appendMessage(role, text) {
      const wrapper = document.createElement('div');
      wrapper.className = `ai-message ${role === 'user' ? 'user-msg' : 'ai-msg'}`;
  
      const bubble = document.createElement('div');
      bubble.className = `ai-bubble${role === 'error' ? ' error-bubble' : ''}`;
      bubble.textContent = text;
  
      const timestamp = document.createElement('span');
      timestamp.className = 'ai-timestamp';
      timestamp.textContent = formatTime(new Date());
      timestamp.setAttribute('aria-label', `Sent at ${timestamp.textContent}`);
  
      wrapper.appendChild(bubble);
      wrapper.appendChild(timestamp);
      messagesEl.appendChild(wrapper);
  
      // Prune old messages to avoid unbounded DOM growth
      pruneMessages();
      scrollToBottom();
    }
  
    /**
     * Remove oldest messages beyond MAX_HISTORY from the DOM.
     */
    function pruneMessages() {
      const messages = messagesEl.querySelectorAll('.ai-message');
      if (messages.length > MAX_HISTORY) {
        const excess = messages.length - MAX_HISTORY;
        for (let i = 0; i < excess; i++) {
          messagesEl.removeChild(messages[i]);
        }
      }
    }
  
    /** Scroll the message area to the latest message. */
    function scrollToBottom() {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  
    /**
     * Format a Date to HH:MM (12-hour with am/pm).
     * @param {Date} date
     * @returns {string}
     */
    function formatTime(date) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  
    /* ── Loading State ─────────────────────── */
  
    function setLoading(loading) {
      isLoading = loading;
      typingEl.hidden = !loading;
      sendBtn.disabled = loading;
      inputEl.disabled = loading;
      if (loading) scrollToBottom();
    }
  
    /* ── API Call ──────────────────────────── */
  
    /**
     * Send a user message to the AI backend and return the reply.
     * POSTs to /api/ai-chat with message text and current page context.
     * @param {string} message - The user's message text.
     * @returns {Promise<string>} - The AI's reply string.
     */
    async function sendToAI(message) {
      const payload = {
        message: message,
        page: PAGE_CONTEXT,
      };
  
      const response = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
  
      // Validate expected response shape
      if (!data || typeof data.reply !== 'string') {
        throw new Error('Unexpected response format from AI service.');
      }
  
      return data.reply;
    }
  
    /* ── Send Flow ─────────────────────────── */
  
    /** Read input, dispatch message, handle response. */
    async function handleSend() {
      const text = inputEl.value.trim();
      if (!text || isLoading) return;
  
      // Render user message immediately
      appendMessage('user', text);
      inputEl.value = '';
  
      setLoading(true);
  
      try {
        const reply = await sendToAI(text);
        appendMessage('ai', reply);
  
      } catch (err) {
        console.error('[Fruitie AI] sendToAI failed:', err);
        appendMessage('error', '⚠️ Sorry, I couldn\'t reach the AI service. Please try again shortly.');
  
      } finally {
        setLoading(false);
        inputEl.focus();
      }
    }
  
    /* ── Welcome Message ───────────────────── */
  
    /**
     * Inject a context-aware greeting when the chat is first opened.
     * Only shown once per page session.
     */
    let welcomeShown = false;
  
    function showWelcome() {
      if (welcomeShown) return;
      welcomeShown = true;
  
      const greetings = {
        buyer:  '👋 Hi! I\'m your Fruitie AI assistant. I can help you find the best fruits, compare seller prices, or estimate quantities. What are you looking for today?',
        seller: '👋 Hi! I\'m your Fruitie AI assistant. I can help you price your produce, find transport options, or understand payment methods. How can I help?',
        home:   '👋 Welcome to Fruitie! I\'m your AI assistant. Ask me anything about buying or selling fresh fruit on the platform.',
      };
  
      appendMessage('ai', greetings[PAGE_CONTEXT] || greetings.home);
    }
  
    /* ── Event Listeners ───────────────────── */
  
    // FAB click & keyboard
    fab.addEventListener('click', toggleModal);
    fab.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleModal(); }
    });
  
    // Close button
    closeBtn.addEventListener('click', closeModal);
  
    // Close on Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) closeModal();
    });
  
    // Send on button click
    sendBtn.addEventListener('click', handleSend);
  
    // Send on Enter (Shift+Enter = newline intentionally not supported in single-line input)
    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });
  
    // Show welcome message on first open
    fab.addEventListener('click', () => {
      if (isOpen) showWelcome(); // isOpen already toggled above, so this runs after open
    });
  
    /* ── Init ──────────────────────────────── */
    // Modal starts hidden (handled by `hidden` attribute in HTML).
    // No auto-open; user must click the FAB.
  
  })(); // End of Fruitie AI IIFE
});
