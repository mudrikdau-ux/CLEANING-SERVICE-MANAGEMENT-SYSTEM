// ========================================
// CLEANSPARK CHATBOT - Intelligent Assistant
// Professional, Context-Aware, Fully Featured
// ========================================

class CleanSparkChatbot {
  constructor() {
    // Core State
    this.isOpen = false;
    this.messages = [];
    this.isTyping = false;
    this.conversationContext = {
      userName: null,
      lastIntent: null,
      messageCount: 0,
    };
    this.ratingGiven = false;

    // System Configuration
    this.config = {
      botName: 'CleanSpark Assistant',
      companyName: 'CleanSpark',
      supportPhone: '+255 777 123 456',
      supportEmail: 'info@cleanspark.co.tz',
      supportHours: 'Mon-Sat: 8:00 AM - 8:00 PM',
      emergencyLine: '+255 800 111 222',
      responseDelayMin: 600,
      responseDelayMax: 1200,
    };

    // Initialize Knowledge Base & Response Rules
    this.initSystemPrompt();
    this.initKnowledgeBase();
    this.initResponseRules();

    // Quick Actions
    this.quickActions = [
      { icon: '🧹', text: 'Services & Pricing', intent: 'pricing' },
      { icon: '📍', text: 'Service Areas', intent: 'locations' },
      { icon: '📅', text: 'How to Book', intent: 'booking_guide' },
      { icon: '💳', text: 'Payment Methods', intent: 'payment' },
      { icon: '🕐', text: 'Working Hours', intent: 'hours' },
      { icon: '📞', text: 'Contact Support', intent: 'contact' },
    ];

    this.init();
  }

  // ==================== SYSTEM PROMPT ====================
  initSystemPrompt() {
    this.systemPrompt = {
      role: `You are ${this.config.botName}, a professional AI chatbot for CleanSpark, a cleaning services management system based in Zanzibar.`,
      responsibilities: [
        'Answer customer questions about services, bookings, pricing, and website usage',
        'Guide users on how to book, track services, and manage their account',
        'Provide clear and helpful support at all times',
      ],
      style: [
        'Friendly, professional, and polite',
        'Clear and concise (avoid long paragraphs)',
        'Helpful and solution-oriented',
      ],
      rules: [
        'Only answer based on CleanSpark information provided',
        'Do not make up information',
        'If unsure, direct the user to contact support',
        'Always prioritize helping the user complete their task (booking, tracking, etc.)',
      ],
    };
  }

  // ==================== KNOWLEDGE BASE ====================
  initKnowledgeBase() {
    this.knowledgeBase = {
      company: {
        name: 'CleanSpark',
        tagline: 'Zanzibar\'s Premier Cleaning Service',
        founded: 2020,
        location: 'Stone Town, Zanzibar',
        description:
          'Professional and reliable cleaning solutions for homes and businesses across Zanzibar.',
        mission:
          'To deliver spotless, healthy spaces through trusted, eco-friendly cleaning services.',
        team: '50+ trained, background-checked professionals.',
      },
      services: [
        {
          name: 'Home Cleaning',
          price: 'From TZS 50,000',
          duration: '2-3 hours',
          desc: 'Complete home cleaning including kitchen, bathrooms, and living areas.',
        },
        {
          name: 'Office Cleaning',
          price: 'From TZS 75,000',
          duration: '3-4 hours',
          desc: 'Professional office cleaning to maintain hygiene and productivity.',
        },
        {
          name: 'Deep Cleaning',
          price: 'From TZS 100,000',
          duration: '4-6 hours',
          desc: 'Intensive top-to-bottom cleaning for a truly fresh space.',
        },
        {
          name: 'Carpet & Upholstery',
          price: 'From TZS 60,000',
          duration: '1-2 hours',
          desc: 'Steam cleaning and stain removal for carpets and furniture.',
        },
        {
          name: 'Window Cleaning',
          price: 'From TZS 40,000',
          duration: '1-2 hours',
          desc: 'Streak-free window cleaning inside and out.',
        },
        {
          name: 'Post-Construction',
          price: 'From TZS 90,000',
          duration: '4-6 hours',
          desc: 'Complete cleanup after renovation or construction.',
        },
      ],
      locations: [
        'Stone Town',
        'Mbweni',
        'Fumba',
        'Kiwengwa',
        'Nungwi',
        'Paje',
        'Jambiani',
        'Michenzani',
      ],
      pricing: {
        note: 'Pricing varies based on space size and specific requirements.',
        freeEstimate: true,
        discountWeekly: '5% off',
        discountMonthly: '10% off',
      },
      booking: {
        steps: [
          '1. Register or log in to your account',
          '2. Choose your desired service',
          '3. Select date and time',
          '4. Provide location details',
          '5. Confirm and complete booking',
        ],
        tracking:
          'Log in and go to your Dashboard to track your booking status in real-time.',
        cancellation:
          'Free cancellation up to 24 hours before service.',
      },
      payment: [
        'M-Pesa',
        'Airtel Money',
        'Tigo Pesa',
        'Visa/Mastercard',
        'Bank Transfer',
        'Cash (+5,000 TZS fee)',
      ],
      contact: {
        phone: '+255 777 123 456',
        whatsapp: '+255 777 123 456',
        email: 'info@cleanspark.co.tz',
        address: 'Stone Town, Zanzibar, Tanzania',
      },
      faq: {
        ecoFriendly:
          'Yes! We use environmentally safe, non-toxic cleaning products.',
        insured: 'All staff are fully insured and bonded for your peace of mind.',
        satisfaction:
          '100% satisfaction guarantee. Report issues within 12 hours for free re-service.',
      },
    };
  }

  // ==================== RESPONSE RULES ====================
  initResponseRules() {
    this.responseRules = {
      booking:
        'Explain steps clearly: Register → Login → Book Service. Mention that tracking is available on the Dashboard.',
      tracking:
        'Tell them to log in and go to Dashboard to track booking status.',
      pricing:
        'Explain that pricing varies based on size and requirements. Offer a free quote.',
      services:
        'List main services: Home Cleaning, Office Cleaning, Deep Cleaning, Carpet & Upholstery, Window Cleaning, Post-Construction.',
      unclear: 'Ask a clarifying question to better understand their needs.',
      outsideScope:
        'Politely say you only assist with CleanSpark services and provide contact info for further help.',
      closing:
        'Always end with a helpful suggestion or offer further assistance.',
    };
  }

  // ==================== INITIALIZATION ====================
  init() {
    this.createUI();
    this.attachEvents();
    this.loadHistory();
    this.setupOutsideClick();

    // Auto-open for first-time visitors after short delay
    if (!sessionStorage.getItem('cleanspark_chatbot_opened')) {
      setTimeout(() => {
        if (!this.isOpen) this.toggleWindow(true);
      }, 2500);
      sessionStorage.setItem('cleanspark_chatbot_opened', 'true');
    }
  }

  createUI() {
    // Create FAB button
    const fab = document.createElement('button');
    fab.className = 'cleanspark-chatbot-fab';
    fab.setAttribute('aria-label', 'Open chat support');
    fab.innerHTML = `
      <span class="cleanspark-chatbot-fab-pulse"></span>
      <svg class="cleanspark-chatbot-fab-icon" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
        <path d="M7 9h10v2H7zm0 3h7v2H7z"/>
      </svg>
      <span class="cleanspark-chatbot-fab-dot"></span>
    `;
    document.body.appendChild(fab);
    this.fab = fab;

    // Create Chat Window
    const window = document.createElement('div');
    window.className = 'cleanspark-chatbot-window closed';
    window.innerHTML = `
      <div class="cleanspark-chatbot-header">
        <div class="cleanspark-chatbot-brand">
          <div class="cleanspark-chatbot-logo">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div class="cleanspark-chatbot-brand-text">
            <h4>${this.config.botName}</h4>
            <span>Online · Replies instantly</span>
          </div>
        </div>
        <div class="cleanspark-chatbot-header-actions">
          <button class="cleanspark-chatbot-header-btn cleanspark-chatbot-close" aria-label="Close chat">
            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
      </div>
      <div class="cleanspark-chatbot-messages" id="cleansparkMessages"></div>
      <div class="cleanspark-chatbot-quick-actions" id="cleansparkQuickActions"></div>
      <div class="cleanspark-chatbot-input-area">
        <input type="text" class="cleanspark-chatbot-input" placeholder="Type your message..." autocomplete="off" id="cleansparkInput">
        <button class="cleanspark-chatbot-send-btn" aria-label="Send message" id="cleansparkSendBtn">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      <div class="cleanspark-chatbot-scroll-btn" id="cleansparkScrollBtn">
        <svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
      </div>
    `;
    document.body.appendChild(window);
    this.window = window;

    // Cache elements
    this.messagesContainer = document.getElementById('cleansparkMessages');
    this.input = document.getElementById('cleansparkInput');
    this.sendBtn = document.getElementById('cleansparkSendBtn');
    this.closeBtn = this.window.querySelector('.cleanspark-chatbot-close');
    this.quickActionsContainer = document.getElementById(
      'cleansparkQuickActions'
    );
    this.scrollBtn = document.getElementById('cleansparkScrollBtn');
  }

  attachEvents() {
    this.fab.addEventListener('click', () => this.toggleWindow());
    this.closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleWindow(false);
    });
    this.sendBtn.addEventListener('click', () => this.handleSend());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSend();
    });

    // Scroll to bottom detection
    this.messagesContainer.addEventListener('scroll', () => {
      const threshold = 80;
      const isNearBottom =
        this.messagesContainer.scrollHeight -
          this.messagesContainer.scrollTop -
          this.messagesContainer.clientHeight <
        threshold;
      this.scrollBtn.classList.toggle('visible', !isNearBottom);
    });
    this.scrollBtn.addEventListener('click', () => this.scrollToBottom());

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.toggleWindow(false);
    });
  }

  setupOutsideClick() {
    document.addEventListener('click', (e) => {
      if (
        this.isOpen &&
        !this.window.contains(e.target) &&
        !this.fab.contains(e.target)
      ) {
        // Optional: close on outside click. Uncomment if desired.
        // this.toggleWindow(false);
      }
    });
  }

  // ==================== UI ACTIONS ====================
  toggleWindow(forceState = null) {
    this.isOpen = forceState !== null ? forceState : !this.isOpen;

    if (this.isOpen) {
      this.window.classList.remove('closed');
      this.fab.classList.add('open');
      if (this.messages.length === 0) {
        this.showWelcomeSequence();
      } else {
        this.renderQuickActions();
        this.scrollToBottom();
      }
      this.input.focus();
    } else {
      this.window.classList.add('closed');
      this.fab.classList.remove('open');
    }
  }

  handleSend() {
    const text = this.input.value.trim();
    if (!text || this.isTyping) return;

    this.addMessage(text, 'user');
    this.input.value = '';
    this.conversationContext.messageCount++;

    this.simulateTyping().then(() => {
      this.processMessage(text);
    });
  }

  // ==================== MESSAGING ====================
  addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `cleanspark-chatbot-message ${sender}`;
    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    messageDiv.innerHTML = `
      <div class="cleanspark-chatbot-bubble">${this.formatText(text)}</div>
      <div class="cleanspark-chatbot-time">${time}</div>
    `;

    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();

    this.messages.push({ text, sender, time });
    this.saveHistory();
  }

  formatText(text) {
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    formatted = formatted.replace(/\n/g, '<br>');
    formatted = formatted.replace(
      /\*\*(.*?)\*\*/g,
      '<strong>$1</strong>'
    );
    formatted = formatted.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener">$1</a>'
    );
    formatted = formatted.replace(
      /(\+255\s?\d{3}\s?\d{3}\s?\d{3})/g,
      '<a href="tel:$1">$1</a>'
    );
    return formatted;
  }

  async simulateTyping() {
    this.isTyping = true;
    const typingDiv = document.createElement('div');
    typingDiv.className = 'cleanspark-chatbot-message bot';
    typingDiv.innerHTML = `
      <div class="cleanspark-chatbot-typing">
        <span class="cleanspark-chatbot-typing-dot"></span>
        <span class="cleanspark-chatbot-typing-dot"></span>
        <span class="cleanspark-chatbot-typing-dot"></span>
      </div>
    `;
    this.messagesContainer.appendChild(typingDiv);
    this.scrollToBottom();

    const delay =
      Math.random() *
        (this.config.responseDelayMax - this.config.responseDelayMin) +
      this.config.responseDelayMin;
    await new Promise((resolve) => setTimeout(resolve, delay));

    typingDiv.remove();
    this.isTyping = false;
  }

  botResponse(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'cleanspark-chatbot-message bot';
    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const bubble = document.createElement('div');
    bubble.className = 'cleanspark-chatbot-bubble';
    messageDiv.appendChild(bubble);
    const timeDiv = document.createElement('div');
    timeDiv.className = 'cleanspark-chatbot-time';
    timeDiv.textContent = time;
    messageDiv.appendChild(timeDiv);

    this.messagesContainer.appendChild(messageDiv);

    // Typing effect
    const words = text.split(' ');
    let index = 0;
    const typeNext = () => {
      if (index < words.length) {
        bubble.innerHTML = this.formatText(
          words.slice(0, index + 1).join(' ')
        );
        index++;
        this.scrollToBottom();
        setTimeout(typeNext, 25 + Math.random() * 20);
      } else {
        this.messages.push({ text, sender: 'bot', time });
        this.saveHistory();
        this.renderQuickActions();
      }
    };
    typeNext();
  }

  // ==================== INTENT PROCESSING ====================
  processMessage(text) {
    const lower = text.toLowerCase();
    let response = null;

    // Greetings
    if (
      this.matchKeywords(lower, [
        'hello',
        'hi',
        'hey',
        'greetings',
        'good morning',
        'good afternoon',
      ])
    ) {
      response = `👋 Hello! Welcome to **${this.config.companyName}**. How can I assist you with our cleaning services today?`;
      this.conversationContext.lastIntent = 'greeting';
    }
    // Services
    else if (
      this.matchKeywords(lower, [
        'service',
        'services',
        'what do you offer',
        'list',
        'cleaning',
      ])
    ) {
      response = this.getServicesResponse();
      this.conversationContext.lastIntent = 'services';
    }
    // Pricing
    else if (
      this.matchKeywords(lower, [
        'price',
        'pricing',
        'cost',
        'how much',
        'rates',
        'fee',
        'quote',
      ])
    ) {
      response = this.getPricingResponse();
      this.conversationContext.lastIntent = 'pricing';
    }
    // Locations
    else if (
      this.matchKeywords(lower, [
        'location',
        'area',
        'where',
        'serve',
        'zanzibar',
        'stone town',
      ])
    ) {
      response = this.getLocationsResponse();
      this.conversationContext.lastIntent = 'locations';
    }
    // Booking
    else if (
      this.matchKeywords(lower, [
        'book',
        'booking',
        'schedule',
        'appointment',
        'reserve',
        'how to book',
      ])
    ) {
      response = this.getBookingResponse();
      this.conversationContext.lastIntent = 'booking';
    }
    // Tracking
    else if (
      this.matchKeywords(lower, [
        'track',
        'tracking',
        'status',
        'my booking',
        'where is my',
      ])
    ) {
      response = this.getTrackingResponse();
      this.conversationContext.lastIntent = 'tracking';
    }
    // Payment
    else if (
      this.matchKeywords(lower, [
        'payment',
        'pay',
        'mpesa',
        'airtel',
        'card',
        'cash',
        'bank',
      ])
    ) {
      response = this.getPaymentResponse();
      this.conversationContext.lastIntent = 'payment';
    }
    // Hours
    else if (
      this.matchKeywords(lower, [
        'hour',
        'hours',
        'time',
        'open',
        'closed',
        'when',
        'available',
      ])
    ) {
      response = `🕐 **Operating Hours**\n\n📞 Customer Support: ${this.config.supportHours}\n🚨 Emergency: ${this.config.emergencyLine} (24/7)\n\nWe recommend booking at least 24 hours in advance for best availability.`;
      this.conversationContext.lastIntent = 'hours';
    }
    // Contact
    else if (
      this.matchKeywords(lower, [
        'contact',
        'support',
        'phone',
        'email',
        'whatsapp',
        'reach',
        'call',
      ])
    ) {
      response = this.getContactResponse();
      this.conversationContext.lastIntent = 'contact';
    }
    // FAQ
    else if (this.matchKeywords(lower, ['eco', 'safe', 'products', 'green'])) {
      response = `🌿 **Eco-Friendly**: ${this.knowledgeBase.faq.ecoFriendly}`;
    } else if (
      this.matchKeywords(lower, ['insurance', 'insured', 'bonded'])
    ) {
      response = `🛡️ **Insurance**: ${this.knowledgeBase.faq.insured}`;
    } else if (
      this.matchKeywords(lower, ['guarantee', 'satisfaction', 'refund'])
    ) {
      response = `✅ **Satisfaction Guarantee**: ${this.knowledgeBase.faq.satisfaction}`;
    }
    // Thank you
    else if (
      this.matchKeywords(lower, ['thank', 'thanks', 'appreciate'])
    ) {
      response = `You're very welcome! 😊 Is there anything else I can help you with?`;
    }
    // Farewell
    else if (
      this.matchKeywords(lower, ['bye', 'goodbye', 'see you'])
    ) {
      response = `👋 Thank you for chatting with **${this.config.botName}**! Have a sparkling clean day! ✨`;
    }
    // Fallback
    else {
      response = `I'm not sure I understood that completely. Could you please rephrase? I'm here to help with questions about our cleaning services, booking, pricing, or tracking.`;
      this.conversationContext.lastIntent = 'unclear';
    }

    this.botResponse(response);

    // Offer rating after several interactions
    if (this.conversationContext.messageCount > 6 && !this.ratingGiven) {
      setTimeout(() => this.offerRating(), 1500);
    }
  }

  matchKeywords(text, keywords) {
    return keywords.some((kw) => text.includes(kw));
  }

  // ==================== RESPONSE GENERATORS ====================
  getServicesResponse() {
    let msg = `🧹 **Our Cleaning Services**\n\n`;
    this.knowledgeBase.services.forEach((s) => {
      msg += `• **${s.name}** — ${s.price} (${s.duration})\n   ${s.desc}\n\n`;
    });
    msg += `Which service are you interested in? I can provide more details!`;
    return msg;
  }

  getPricingResponse() {
    return `💰 **Pricing Information**\n\n${this.knowledgeBase.pricing.note}\n\n✅ **Free Estimates** available!\n🎁 **Weekly**: ${this.knowledgeBase.pricing.discountWeekly}\n🎁 **Monthly**: ${this.knowledgeBase.pricing.discountMonthly}\n\nWould you like a quote for a specific service?`;
  }

  getLocationsResponse() {
    const areas = this.knowledgeBase.locations.join(', ');
    return `📍 **Service Areas in Zanzibar**\n\nWe proudly serve: ${areas}, and surrounding areas.\n\n🚗 No travel fees within Stone Town. Contact us to confirm availability in your specific location!`;
  }

  getBookingResponse() {
    const steps = this.knowledgeBase.booking.steps.join('\n');
    return `📅 **How to Book**\n\n${steps}\n\n⏱️ **Tracking**: ${this.knowledgeBase.booking.tracking}\n\n❌ **Cancellation**: ${this.knowledgeBase.booking.cancellation}\n\nReady to book? Visit our Services page to get started!`;
  }

  getTrackingResponse() {
    return `🔍 **Track Your Booking**\n\n${this.knowledgeBase.booking.tracking}\n\nMake sure you're logged in to see real-time updates on your service status. Need further help? I'm here!`;
  }

  getPaymentResponse() {
    const methods = this.knowledgeBase.payment.join(', ');
    return `💳 **Accepted Payments**\n\nWe accept: ${methods}.\n\n🔒 All transactions are secure. Payment collected upon service completion.`;
  }

  getContactResponse() {
    return `📞 **Contact CleanSpark**\n\n📱 Phone/WhatsApp: ${this.knowledgeBase.contact.phone}\n📧 Email: ${this.knowledgeBase.contact.email}\n📍 ${this.knowledgeBase.contact.address}\n\nWe're here to help! Reach out anytime.`;
  }

  // ==================== QUICK ACTIONS ====================
  renderQuickActions() {
    if (!this.quickActionsContainer) return;
    this.quickActionsContainer.innerHTML = this.quickActions
      .map(
        (qa) =>
          `<button class="cleanspark-chatbot-quick-btn" data-intent="${qa.intent}">${qa.icon} ${qa.text}</button>`
      )
      .join('');

    this.quickActionsContainer.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const intent = btn.dataset.intent;
        this.triggerQuickAction(intent);
      });
    });
  }

  triggerQuickAction(intent) {
    this.input.value = '';
    let msg = '';
    switch (intent) {
      case 'pricing':
        msg = 'Tell me about your pricing';
        break;
      case 'locations':
        msg = 'What areas do you serve?';
        break;
      case 'booking_guide':
        msg = 'How do I book a service?';
        break;
      case 'payment':
        msg = 'What payment methods do you accept?';
        break;
      case 'hours':
        msg = 'What are your working hours?';
        break;
      case 'contact':
        msg = 'How can I contact support?';
        break;
      default:
        return;
    }
    this.addMessage(msg, 'user');
    this.conversationContext.messageCount++;
    this.simulateTyping().then(() => this.processMessage(msg));
  }

  // ==================== RATING ====================
  offerRating() {
    if (this.ratingGiven) return;
    this.ratingGiven = true;

    const ratingDiv = document.createElement('div');
    ratingDiv.className = 'cleanspark-chatbot-message bot';
    ratingDiv.innerHTML = `
      <div class="cleanspark-chatbot-bubble">
        ⭐ **Rate our conversation**<br>
        <div class="cleanspark-chatbot-rating">
          ${[1, 2, 3, 4, 5]
            .map((i) => `<button data-rating="${i}">☆</button>`)
            .join('')}
        </div>
      </div>
    `;
    this.messagesContainer.appendChild(ratingDiv);
    this.scrollToBottom();

    const buttons = ratingDiv.querySelectorAll('button');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b, idx) => {
          b.textContent = idx < parseInt(btn.dataset.rating) ? '★' : '☆';
          b.classList.toggle(
            'active',
            idx < parseInt(btn.dataset.rating)
          );
        });
        setTimeout(() => {
          const rating = parseInt(btn.dataset.rating);
          const thanks =
            rating >= 4
              ? '🎉 Thank you for the great rating! We truly appreciate it.'
              : '🙏 Thanks for your feedback! We are always improving.';
          this.botResponse(thanks);
        }, 400);
      });
    });
  }

  // ==================== WELCOME SEQUENCE ====================
  showWelcomeSequence() {
    const greetings = [
      `👋 Hello! I'm **${this.config.botName}**, your personal cleaning service expert.`,
      `✨ I can help you with service details, pricing, booking, tracking, and more.`,
      `💬 How can I assist you today? Use the buttons below or type your question!`,
    ];
    let i = 0;
    const next = () => {
      if (i < greetings.length) {
        this.botResponse(greetings[i]);
        i++;
        setTimeout(next, 900);
      }
    };
    next();
    this.renderQuickActions();
  }

  // ==================== UTILS ====================
  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop =
        this.messagesContainer.scrollHeight;
    }
  }

  saveHistory() {
    try {
      const data = {
        messages: this.messages.slice(-40),
        context: this.conversationContext,
      };
      localStorage.setItem('cleanspark_chat_history', JSON.stringify(data));
    } catch (e) {}
  }

  loadHistory() {
    try {
      const raw = localStorage.getItem('cleanspark_chat_history');
      if (raw) {
        const data = JSON.parse(raw);
        this.messages = data.messages || [];
        this.conversationContext = data.context || {
          messageCount: 0,
        };
        // Re-render past messages
        this.messages.forEach((m) => {
          const div = document.createElement('div');
          div.className = `cleanspark-chatbot-message ${m.sender}`;
          div.innerHTML = `
            <div class="cleanspark-chatbot-bubble">${this.formatText(m.text)}</div>
            <div class="cleanspark-chatbot-time">${m.time}</div>
          `;
          this.messagesContainer.appendChild(div);
        });
        if (this.messages.length > 0) this.renderQuickActions();
      }
    } catch (e) {}
  }
}

// ==================== GLOBAL INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  window.cleansparkChatbot = new CleanSparkChatbot();
});

// Global function for external triggers (e.g., "Live Chat" buttons)
window.openChatbot = () => {
  if (window.cleansparkChatbot) {
    window.cleansparkChatbot.toggleWindow(true);
  }
};