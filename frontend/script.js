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


//chatbot code 
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
