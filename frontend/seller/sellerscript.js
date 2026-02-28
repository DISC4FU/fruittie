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
    const AI_ENDPOINT = `${window.location.origin}/api/ai-chat`;
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