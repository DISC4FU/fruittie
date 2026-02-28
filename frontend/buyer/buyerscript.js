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

let history = [];

async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  // Display user message
  addMessage(message, "user-msg");
  input.value = "";

  // Call backend
  const response = await fetch("http://localhost:5000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  const data = await response.json();

  // Display bot reply
  addMessage(data.reply, "bot-msg");

  // Update conversation history
  history = data.history;
}

function addMessage(text, className) {
  const chatBox = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.className = className;
  div.textContent = text;
  chatBox.appendChild(div);

  // Auto scroll
  chatBox.scrollTop = chatBox.scrollHeight;
}

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


async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  // Display user message
  addMessage(message, "user-msg");
  input.value = "";

  // Call backend
  const response = await fetch("http://localhost:5000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  const data = await response.json();

  // Display bot reply
  addMessage(data.reply, "bot-msg");

  // Update conversation history
  history = data.history;
}

function addMessage(text, className) {
  const chatBox = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.className = className;
  div.textContent = text;
  chatBox.appendChild(div);

  // Auto scroll
  chatBox.scrollTop = chatBox.scrollHeight;
}
