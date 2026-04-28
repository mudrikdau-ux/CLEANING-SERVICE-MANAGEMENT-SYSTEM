// ========================================
// CSMS CHATBOT - Professional Customer Assistant
// Version: 2.0 | For Customer Use Only
// Integrated with Tracking Dashboard
// ========================================

class CSMSChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;
        this.typingTimeout = null;
        this.currentResponseDelay = null;
        this.conversationContext = {};
        this.ratingGiven = false;
        
        // Bot knowledge base
        this.knowledgeBase = this.initKnowledgeBase();
        
        // Quick replies mapping
        this.quickReplies = [
            { text: "💬 Services & Pricing", intent: "pricing" },
            { text: "📍 Locations Served", intent: "locations" },
            { text: "📅 How to Book", intent: "booking_guide" },
            { text: "💰 Payment Methods", intent: "payment" },
            { text: "🕐 Working Hours", intent: "hours" },
            { text: "❓ Contact Support", intent: "contact" }
        ];
        
        this.init();
    }
    
    initKnowledgeBase() {
        return {
            company: {
                name: "CSMS (Cleaning Service Management System)",
                founded: 2020,
                location: "Stone Town, Zanzibar",
                description: "Zanzibar's premier cleaning service provider offering professional and reliable cleaning solutions for homes and businesses.",
                mission: "To provide reliable, high-quality cleaning services that enhance the comfort, health, and well-being of our customers.",
                team: "50+ trained professionals, all background-checked and certified."
            },
            
            services: [
                { name: "Home Cleaning", price: "TZS 50,000", duration: "2-3 hours", description: "Complete home cleaning including kitchen, bathrooms, and living areas.", features: ["Eco-friendly products", "All rooms covered", "Surface disinfecting"] },
                { name: "Office Cleaning", price: "TZS 75,000", duration: "3-4 hours", description: "Professional office cleaning to maintain hygiene and productivity.", features: ["Workstation cleaning", "Conference rooms", "After-hours available"] },
                { name: "Carpet Cleaning", price: "TZS 60,000", duration: "1-2 hours/room", description: "Deep carpet cleaning with steam technology.", features: ["Stain removal", "Deodorizing", "Quick-dry"] },
                { name: "Window Cleaning", price: "TZS 40,000", duration: "1-2 hours", description: "Streak-free window cleaning for homes and offices.", features: ["Interior/exterior", "Frame wiping", "Safety equipment"] },
                { name: "Vehicle Cleaning", price: "TZS 45,000", duration: "1-2 hours", description: "Complete interior and exterior vehicle cleaning.", features: ["Wash and wax", "Interior vacuuming", "Tire shine"] },
                { name: "Pool Cleaning", price: "TZS 80,000", duration: "2-3 hours", description: "Professional pool cleaning and maintenance.", features: ["Chemical balancing", "Filter cleaning", "Surface skimming"] },
                { name: "Mattress Cleaning", price: "TZS 55,000", duration: "1 hour/mattress", description: "Deep cleaning to remove dust mites and allergens.", features: ["UV sanitization", "Stain treatment", "Deodorizing"] },
                { name: "Upholstery Cleaning", price: "TZS 65,000", duration: "2-3 hours", description: "Professional cleaning for sofas and furniture.", features: ["Fabric protection", "Stain removal", "Quick drying"] },
                { name: "Post-Construction", price: "TZS 90,000", duration: "4-6 hours", description: "Complete cleaning after construction work.", features: ["Dust removal", "Debris cleanup", "Final polish"] },
                { name: "Hotel & Airbnb", price: "TZS 100,000", duration: "2-4 hours", description: "Fast turnover cleaning for short-stay properties.", features: ["Linen change", "Kitchen cleaning", "Same-day service"] },
                { name: "Laundry & Ironing", price: "TZS 54,000", duration: "24-hour turnaround", description: "Professional laundry and ironing service.", features: ["Free pickup/delivery", "Stain treatment", "Delicate care"] },
                { name: "Pest Control", price: "TZS 54,000", duration: "1-2 hours", description: "Safe and effective pest elimination.", features: ["Child/pet safe", "6-month guarantee", "Follow-up included"] },
                { name: "Event Setup & Cleanup", price: "TZS 90,000", duration: "3-6 hours", description: "Full event support from setup to cleanup.", features: ["Furniture arrangement", "Decoration setup", "Waste disposal"] },
                { name: "AC & Refrigerator", price: "TZS 45,000", duration: "1-2 hours", description: "Cleaning and maintenance of AC units and fridges.", features: ["Filter cleaning", "Coil cleaning", "Performance check"] },
                { name: "Industrial Cleaning", price: "TZS 100,000", duration: "4-8 hours", description: "Heavy-duty cleaning for factories and warehouses.", features: ["Floor degreasing", "High-pressure washing", "Safety-compliant"] },
                { name: "Water Tank Cleaning", price: "TZS 70,000", duration: "2-3 hours", description: "Professional tank cleaning and sanitization.", features: ["Sludge removal", "Disinfection", "Water testing"] },
                { name: "Curtain Cleaning", price: "TZS 40,000", duration: "2-3 hours", description: "Gentle cleaning for all curtain types.", features: ["Machine washing", "Steam ironing", "Rehanging service"] },
                { name: "Garden Cleaning", price: "TZS 55,000", duration: "2-4 hours", description: "Professional garden maintenance.", features: ["Lawn mowing", "Weed removal", "Waste disposal"] }
            ],
            
            locations: {
                served: ["Stone Town", "Ngambo", "Mbweni", "Fumba", "Kiwengwa", "Nungwi", "Paje", "Jambiani", "Michenzani", "Zanzibar University", "ZSSF"],
                unguja: "All areas in Unguja island are served",
                pemba: "Limited service in Pemba - call for availability",
                response_time: "Typically arrives within 1-2 hours of scheduled time",
                travel_fee: "No travel fees within Stone Town area"
            },
            
            pricing: {
                base_rate: "20,000 TZS per cleaner per hour",
                materials_fee: "10,000 TZS if materials are provided",
                cash_fee: "5,000 TZS extra for cash payments",
                weekly_discount: "5% off for weekly subscriptions",
                monthly_discount: "10% off for monthly subscriptions",
                free_estimate: "Free on-site estimates available"
            },
            
            hours: {
                customer_support: "Mon-Sat: 8:00 AM - 8:00 PM",
                phone_hours: "Mon-Fri: 8:00 AM - 6:00 PM",
                emergency: "24/7 emergency line: +255 800 111 222",
                booking_cutoff: "Book at least 24 hours in advance for best availability"
            },
            
            booking: {
                steps: [
                    "1. Choose your service type and preferences",
                    "2. Select date and time",
                    "3. Provide your location details",
                    "4. Enter your contact information",
                    "5. Choose payment method and complete booking"
                ],
                requirements: [
                    "Clear access to the area being cleaned",
                    "Working electricity and water supply",
                    "Safe parking for our team's vehicle"
                ],
                cancellation_policy: "Free cancellation up to 24 hours before service. Late cancellations may incur a 25% fee.",
                link: "Visit our Services page to start booking"
            },
            
            payment_methods: [
                { name: "M-Pesa", type: "Mobile Money", fee: "No extra fee" },
                { name: "Airtel Money", type: "Mobile Money", fee: "No extra fee" },
                { name: "Tigo Pesa", type: "Mobile Money", fee: "No extra fee" },
                { name: "Visa/Mastercard", type: "Card", fee: "No extra fee" },
                { name: "Bank Transfer", type: "Bank", fee: "No extra fee" },
                { name: "Cash", type: "Cash", fee: "+5,000 TZS" }
            ],
            
            contact: {
                phone: "+255 777 123 456",
                whatsapp: "+255 777 123 456",
                email: "info@csms.co.tz",
                support_email: "support@csms.co.tz",
                address: "Stone Town, Zanzibar, Tanzania",
                website: "www.csms.co.tz"
            },
            
            faq: {
                response_time: "We typically respond to messages within 2-4 hours on business days.",
                eco_friendly: "Yes! We use environmentally safe, non-toxic cleaning products that are safe for families and pets.",
                insured: "Yes, all staff are fully insured and bonded for your peace of mind.",
                satisfaction: "We offer a 100% satisfaction guarantee. Report issues within 12 hours for free re-service.",
                staff_training: "All staff undergo rigorous training and background checks before joining our team.",
                equipment: "We bring all necessary cleaning equipment and supplies to each job."
            }
        };
    }
    
    init() {
        this.createChatbotUI();
        this.attachEventListeners();
        this.loadFromStorage();
        
        // Auto-open after 3 seconds on first visit
        if (!sessionStorage.getItem('chatbot_opened')) {
            setTimeout(() => {
                if (!this.isOpen) this.toggleChatbot();
            }, 3000);
            sessionStorage.setItem('chatbot_opened', 'true');
        }
    }
    
    createChatbotUI() {
        // Create floating button if not exists
        if (!document.querySelector('.chatbot-button')) {
            const btn = document.createElement('div');
            btn.className = 'chatbot-button';
            btn.innerHTML = `
                <i class="fas fa-comment-dots"></i>
                <span class="notification-badge">●</span>
            `;
            document.body.appendChild(btn);
            this.button = btn;
        }
        
        // Create container if not exists
        if (!document.querySelector('.chatbot-container')) {
            const container = document.createElement('div');
            container.className = 'chatbot-container closed';
            container.innerHTML = `
                <div class="chatbot-header">
                    <div class="chatbot-header-info">
                        <div class="chatbot-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="chatbot-header-text">
                            <h4>CSMS Assistant</h4>
                            <p>Here to help 24/7</p>
                        </div>
                    </div>
                    <button class="chatbot-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="chatbot-status">
                    <span class="status-dot"></span>
                    <span>Online • Usually replies in seconds</span>
                </div>
                <div class="chatbot-messages"></div>
                <div class="quick-replies" id="quickReplies"></div>
                <div class="chatbot-input-area">
                    <input type="text" class="chatbot-input" placeholder="Type your message..." autocomplete="off">
                    <button class="chatbot-send">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div class="scroll-to-bottom" id="scrollToBottom">
                    <i class="fas fa-arrow-down"></i>
                </div>
            `;
            document.body.appendChild(container);
            this.container = container;
            
            // Add suggested questions section
            const suggestedDiv = document.createElement('div');
            suggestedDiv.className = 'suggested-questions';
            suggestedDiv.innerHTML = `
                <div class="suggested-title">
                    <i class="fas fa-lightbulb"></i> Suggested Questions
                </div>
                <div class="suggested-buttons" id="suggestedButtons"></div>
            `;
            this.container.querySelector('.chatbot-messages').after(suggestedDiv);
            this.populateSuggestedQuestions();
        }
        
        this.button = document.querySelector('.chatbot-button');
        this.container = document.querySelector('.chatbot-container');
        this.messagesContainer = this.container.querySelector('.chatbot-messages');
        this.input = this.container.querySelector('.chatbot-input');
        this.sendBtn = this.container.querySelector('.chatbot-send');
        this.closeBtn = this.container.querySelector('.chatbot-close');
        this.quickRepliesContainer = this.container.querySelector('#quickReplies');
        this.scrollBtn = this.container.querySelector('#scrollToBottom');
    }
    
    populateSuggestedQuestions() {
        const container = document.getElementById('suggestedButtons');
        if (!container) return;
        
        const suggestions = [
            { text: "📋 What services do you offer?", query: "What services do you offer?" },
            { text: "💰 How much does home cleaning cost?", query: "How much does home cleaning cost?" },
            { text: "📍 Do you serve my area?", query: "Do you serve my area?" },
            { text: "📅 How do I book?", query: "How do I book a service?" },
            { text: "🕐 What are your hours?", query: "What are your business hours?" }
        ];
        
        container.innerHTML = suggestions.map(s => 
            `<button class="suggested-btn" data-query="${this.escapeHtml(s.query)}">${s.text}</button>`
        ).join('');
        
        container.querySelectorAll('.suggested-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.input.value = btn.dataset.query;
                this.sendMessage();
            });
        });
    }
    
    attachEventListeners() {
        this.button.addEventListener('click', () => this.toggleChatbot());
        this.closeBtn.addEventListener('click', () => this.toggleChatbot());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        // Scroll to bottom button
        this.messagesContainer.addEventListener('scroll', () => {
            const isNearBottom = this.messagesContainer.scrollHeight - this.messagesContainer.scrollTop - this.messagesContainer.clientHeight < 100;
            this.scrollBtn.classList.toggle('visible', !isNearBottom);
        });
        
        this.scrollBtn.addEventListener('click', () => this.scrollToBottom());
        
        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.toggleChatbot();
        });
    }
    
    toggleChatbot() {
        this.isOpen = !this.isOpen;
        this.container.classList.toggle('closed', !this.isOpen);
        
        if (this.isOpen && this.messages.length === 0) {
            this.addWelcomeMessage();
        } else if (this.isOpen) {
            this.scrollToBottom();
        }
    }
    
    addWelcomeMessage() {
        const welcomeMessages = [
            "👋 Hello! I'm CSMS Assistant, your cleaning service expert!",
            "✨ I can help you with service details, pricing, booking, and more.",
            "💬 What would you like to know about our cleaning services today?"
        ];
        
        let index = 0;
        const showNext = () => {
            if (index < welcomeMessages.length) {
                this.addMessage(welcomeMessages[index], 'bot');
                index++;
                setTimeout(showNext, 800);
            } else {
                this.showQuickReplies();
            }
        };
        showNext();
    }
    
    showQuickReplies() {
        this.quickRepliesContainer.innerHTML = this.quickReplies.map(qr => 
            `<button class="quick-reply-btn" data-intent="${qr.intent}">${qr.text}</button>`
        ).join('');
        
        this.quickRepliesContainer.querySelectorAll('.quick-reply-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const intent = btn.dataset.intent;
                this.handleIntent(intent);
            });
        });
    }
    
    handleIntent(intent) {
        switch(intent) {
            case 'pricing':
                this.showPricingInfo();
                break;
            case 'locations':
                this.showLocationsInfo();
                break;
            case 'booking_guide':
                this.showBookingGuide();
                break;
            case 'payment':
                this.showPaymentInfo();
                break;
            case 'hours':
                this.showHoursInfo();
                break;
            case 'contact':
                this.showContactInfo();
                break;
            default:
                this.processUserMessage(this.quickReplies.find(q => q.intent === intent)?.text || '');
        }
    }
    
    async sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;
        
        this.addMessage(message, 'user');
        this.input.value = '';
        this.hideQuickReplies();
        
        await this.simulateTyping();
        this.processUserMessage(message);
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${sender}`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-bubble">${this.formatMessage(text)}</div>
            <div class="message-time">${time}</div>
        `;
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        this.messages.push({ text, sender, time });
        this.saveToStorage();
    }
    
    formatMessage(text) {
        // Convert URLs to links
        let formatted = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // Convert email to mailto
        formatted = formatted.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1">$1</a>');
        
        // Convert phone numbers
        formatted = formatted.replace(/(\+255\s?\d{3}\s?\d{3}\s?\d{3})/g, '<a href="tel:$1">$1</a>');
        
        // Handle line breaks
        formatted = formatted.replace(/\n/g, '<br>');
        
        // Format bold text
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Format lists
        formatted = formatted.replace(/•\s/g, '<br>• ');
        
        return formatted;
    }
    
    async simulateTyping() {
        this.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message message-bot typing';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        `;
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
        
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        
        typingDiv.remove();
        this.isTyping = false;
    }
    
    processUserMessage(message) {
        const lowerMsg = message.toLowerCase();
        let response = null;
        
        // Check for greeting
        if (this.matchesAny(lowerMsg, ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon'])) {
            response = "👋 Hello! Welcome to CSMS Cleaning Services. How can I help you today?";
        }
        
        // Services info
        else if (this.matchesAny(lowerMsg, ['service', 'services', 'what do you do', 'cleaning services', 'offer', 'list'])) {
            response = this.getServicesList();
        }
        
        // Specific service pricing
        else if (this.matchesAny(lowerMsg, ['home cleaning', 'house cleaning', 'residential'])) {
            response = this.getServiceDetails('Home Cleaning');
        }
        else if (this.matchesAny(lowerMsg, ['office cleaning', 'commercial cleaning', 'corporate'])) {
            response = this.getServiceDetails('Office Cleaning');
        }
        else if (this.matchesAny(lowerMsg, ['carpet cleaning', 'carpet'])) {
            response = this.getServiceDetails('Carpet Cleaning');
        }
        else if (this.matchesAny(lowerMsg, ['window cleaning', 'windows'])) {
            response = this.getServiceDetails('Window Cleaning');
        }
        else if (this.matchesAny(lowerMsg, ['vehicle cleaning', 'car cleaning', 'auto cleaning'])) {
            response = this.getServiceDetails('Vehicle Cleaning');
        }
        else if (this.matchesAny(lowerMsg, ['pool cleaning', 'pool'])) {
            response = this.getServiceDetails('Pool Cleaning');
        }
        else if (this.matchesAny(lowerMsg, ['mattress cleaning', 'mattress'])) {
            response = this.getServiceDetails('Mattress Cleaning');
        }
        else if (this.matchesAny(lowerMsg, ['upholstery', 'sofa', 'couch', 'furniture cleaning'])) {
            response = this.getServiceDetails('Upholstery Cleaning');
        }
        
        // Pricing
        else if (this.matchesAny(lowerMsg, ['price', 'pricing', 'cost', 'how much', 'rates', 'fee', 'fees', 'expensive', 'cheap'])) {
            response = this.getPricingInfo();
        }
        
        // Locations
        else if (this.matchesAny(lowerMsg, ['location', 'area', 'serve', 'where', 'zanzibar', 'unguja', 'pemba', 'stone town', 'mbweni', 'nungwi', 'kivunge', 'paje'])) {
            response = this.getLocationInfo();
        }
        
        // Booking
        else if (this.matchesAny(lowerMsg, ['book', 'booking', 'schedule', 'appointment', 'reserve', 'how to book', 'reservation'])) {
            response = this.getBookingInfo();
        }
        
        // Payment
        else if (this.matchesAny(lowerMsg, ['payment', 'pay', 'mobile money', 'mpesa', 'airtel', 'card', 'cash', 'visa', 'mastercard', 'bank transfer'])) {
            response = this.getPaymentInfo();
        }
        
        // Hours
        else if (this.matchesAny(lowerMsg, ['hour', 'hours', 'time', 'working hours', 'business hours', 'open', 'closed', 'when', 'available'])) {
            response = this.getHoursInfo();
        }
        
        // Contact
        else if (this.matchesAny(lowerMsg, ['contact', 'support', 'help', 'phone', 'email', 'whatsapp', 'reach', 'talk', 'speak', 'call'])) {
            response = this.getContactInfo();
        }
        
        // Satisfaction guarantee
        else if (this.matchesAny(lowerMsg, ['guarantee', 'satisfaction', 'refund', 're-service', 'not happy'])) {
            response = "✅ **100% Satisfaction Guarantee!**\n\nIf you're not completely satisfied with our service, report any issues within 12 hours and we'll provide a free re-service at no extra cost. Your satisfaction is our priority!";
        }
        
        // Eco-friendly
        else if (this.matchesAny(lowerMsg, ['eco', 'green', 'environment', 'products', 'safe', 'non-toxic', 'chemicals'])) {
            response = "🌿 **Eco-Friendly Commitment**\n\nWe use only environmentally safe, non-toxic cleaning products. Our solutions are:\n• Safe for children and pets\n• Biodegradable\n• Free from harsh chemicals\n• Effective yet gentle on surfaces";
        }
        
        // Insurance
        else if (this.matchesAny(lowerMsg, ['insurance', 'insured', 'bonded', 'liability', 'trust', 'safe'])) {
            response = "🛡️ **Fully Insured & Bonded**\n\nAll CSMS staff members are:\n• Fully vetted with background checks\n• Covered by liability insurance\n• Bonded for your protection\n• Trained in safety protocols\n\nYou can trust our team completely!";
        }
        
        // Cancellation
        else if (this.matchesAny(lowerMsg, ['cancel', 'cancellation', 'change', 'reschedule', 'postpone'])) {
            response = "📅 **Cancellation & Rescheduling Policy**\n\n• Free cancellation up to 24 hours before scheduled service\n• 25% fee for late cancellations (less than 24 hours)\n• Free rescheduling (subject to availability)\n• No-shows may incur full service charge\n\nContact us as soon as possible to make changes.";
        }
        
        // Discounts
        else if (this.matchesAny(lowerMsg, ['discount', 'offer', 'promo', 'deal', 'sale', 'cheap', 'affordable', 'special'])) {
            response = "🎉 **Current Offers**\n\n• **Weekly Service**: 5% off regular pricing\n• **Monthly Service**: 10% off regular pricing\n• **Referral Program**: Get 15% off when you refer a friend\n• **First-time customer**: 10% off your first booking\n\nContact us to learn more about our loyalty programs!";
        }
        
        // About company
        else if (this.matchesAny(lowerMsg, ['about', 'company', 'csms', 'who are you', 'background', 'history', 'tell me about csms'])) {
            response = `🏢 **About CSMS**\n\n${this.knowledgeBase.company.description}\n\n📅 **Founded**: ${this.knowledgeBase.company.founded}\n📍 **Location**: ${this.knowledgeBase.company.location}\n👥 **Team**: ${this.knowledgeBase.company.team}\n\n🎯 **Mission**: ${this.knowledgeBase.company.mission}`;
        }
        
        // Thank you
        else if (this.matchesAny(lowerMsg, ['thank', 'thanks', 'appreciate', 'grateful', 'thank you'])) {
            response = "You're very welcome! 😊\n\nIs there anything else I can help you with? Feel free to ask about our services, pricing, or booking process.";
        }
        
        // Rating request
        else if (this.matchesAny(lowerMsg, ['rate', 'rating', 'feedback', 'review'])) {
            response = this.getRatingPrompt();
        }
        
        // Farewell
        else if (this.matchesAny(lowerMsg, ['bye', 'goodbye', 'see you', 'exit', 'quit', 'good night'])) {
            response = "👋 Thank you for chatting with CSMS Assistant! Have a wonderful day!\n\n💚 Remember, we're here whenever you need us. Come back anytime!";
        }
        
        // Help
        else if (this.matchesAny(lowerMsg, ['help', 'what can you do', 'assist', 'options'])) {
            response = this.getHelpMessage();
        }
        
        // Default response
        else {
            response = this.getHelpMessage();
        }
        
        this.addResponseWithTyping(response);
    }
    
    addResponseWithTyping(response) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-bot`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        
        messageDiv.appendChild(bubbleDiv);
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = time;
        messageDiv.appendChild(timeDiv);
        
        this.messagesContainer.appendChild(messageDiv);
        
        // Word-by-word typing effect
        let words = response.split(' ');
        let currentText = '';
        let wordIndex = 0;
        
        const typeNextWord = () => {
            if (wordIndex < words.length) {
                currentText += (currentText ? ' ' : '') + words[wordIndex];
                bubbleDiv.innerHTML = this.formatMessage(currentText);
                wordIndex++;
                this.scrollToBottom();
                setTimeout(typeNextWord, 40 + Math.random() * 30);
            } else {
                this.messages.push({ text: response, sender: 'bot', time });
                this.saveToStorage();
                this.showQuickReplies();
                if (!this.ratingGiven && this.messages.length > 10) {
                    setTimeout(() => this.offerRating(), 2000);
                }
            }
        };
        
        typeNextWord();
    }
    
    offerRating() {
        if (this.ratingGiven) return;
        this.ratingGiven = true;
        
        const ratingMsg = "💬 **How was your experience with me today?**\n\nRate our conversation:";
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message message-bot';
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-bubble">
                ${this.formatMessage(ratingMsg)}
                <div class="bot-rating-stars" id="botRatingStars">
                    <i class="far fa-star" data-rating="1"></i>
                    <i class="far fa-star" data-rating="2"></i>
                    <i class="far fa-star" data-rating="3"></i>
                    <i class="far fa-star" data-rating="4"></i>
                    <i class="far fa-star" data-rating="5"></i>
                </div>
            </div>
            <div class="message-time">${time}</div>
        `;
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        const stars = messageDiv.querySelectorAll('.bot-rating-stars i');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                stars.forEach((s, i) => {
                    if (i < rating) {
                        s.className = 'fas fa-star active';
                    } else {
                        s.className = 'far fa-star';
                    }
                });
                
                setTimeout(() => {
                    const thankMsg = rating >= 4 
                        ? "🎉 Thank you so much for the wonderful rating! It means the world to us. Keep shining! ✨"
                        : "🙏 Thank you for your honest feedback. We're always working to improve! 💪";
                    this.addResponseWithTyping(thankMsg);
                }, 500);
            });
        });
    }
    
    matchesAny(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    }
    
    getServicesList() {
        let serviceList = "🧹 **Our Professional Cleaning Services**\n\n";
        this.knowledgeBase.services.slice(0, 8).forEach(service => {
            serviceList += `• **${service.name}** — ${service.price} (${service.duration})\n`;
        });
        serviceList += "\n✨ Plus many more specialized services! Ask me about a specific service for full details.";
        return serviceList;
    }
    
    getServiceDetails(name) {
        const service = this.knowledgeBase.services.find(s => s.name === name);
        if (!service) return this.getHelpMessage();
        
        return `🧹 **${service.name}**\n\n💰 **Price**: ${service.price}\n⏱️ **Duration**: ${service.duration}\n📝 **Description**: ${service.description}\n\n✅ **Includes**:\n${service.features.map(f => `• ${f}`).join('\n')}\n\nWould you like to book this service? Visit our Services page to schedule!`;
    }
    
    getPricingInfo() {
        return `💰 **CSMS Pricing Guide**\n\n• **Base Rate**: ${this.knowledgeBase.pricing.base_rate}\n• **Materials Fee**: ${this.knowledgeBase.pricing.materials_fee} (if provided by us)\n• **Cash Payment Fee**: ${this.knowledgeBase.pricing.cash_fee}\n• **Weekly Service**: ${this.knowledgeBase.pricing.weekly_discount}\n• **Monthly Service**: ${this.knowledgeBase.pricing.monthly_discount}\n• **Free Estimates**: ${this.knowledgeBase.pricing.free_estimate}\n\n💳 **Accepted Payments**: Mobile Money (M-PESA, Airtel, Tigo), Visa/Mastercard, Bank Transfer, Cash\n\nNeed a specific quote? Tell me which service you're interested in!`;
    }
    
    getLocationInfo() {
        return `📍 **Service Locations in Zanzibar**\n\n✅ **Areas We Serve**:\n${this.knowledgeBase.locations.served.slice(0, 8).map(area => `• ${area}`).join('\n')} + more\n\n🏝️ **Unguja**: ${this.knowledgeBase.locations.unguja}\n🌿 **Pemba**: ${this.knowledgeBase.locations.pemba}\n⏱️ **Response Time**: ${this.knowledgeBase.locations.response_time}\n\n🚗 **Travel Fee**: ${this.knowledgeBase.locations.travel_fee}\n\nIs your area listed? Let me know if you have questions about specific locations!`;
    }
    
    getBookingInfo() {
        return `📅 **How to Book a Service**\n\n**Steps**:\n${this.knowledgeBase.booking.steps.join('\n')}\n\n**Requirements**:\n${this.knowledgeBase.booking.requirements.join('\n')}\n\n❌ **Cancellation**: ${this.knowledgeBase.booking.cancellation_policy}\n\n🔗 **${this.knowledgeBase.booking.link}**\n\nWould you like me to guide you through the booking process?`;
    }
    
    getPaymentInfo() {
        let methods = "💳 **Accepted Payment Methods**\n\n";
        this.knowledgeBase.payment_methods.forEach(m => {
            methods += `• **${m.name}** (${m.type}) — ${m.fee}\n`;
        });
        methods += "\n🔒 All payments are secure and encrypted. We never store your payment information.\n\n💰 **Payment is collected upon service completion** (except for advance bookings).";
        return methods;
    }
    
    getHoursInfo() {
        return `🕐 **CSMS Operating Hours**\n\n📞 **Customer Support**: ${this.knowledgeBase.hours.customer_support}\n📱 **Phone Support**: ${this.knowledgeBase.hours.phone_hours}\n🚨 **Emergency Line**: ${this.knowledgeBase.hours.emergency}\n⏰ **Booking Cutoff**: ${this.knowledgeBase.hours.booking_cutoff}\n\n✨ For urgent assistance outside hours, please call our emergency line or send an email and we'll respond first thing in the morning.`;
    }
    
    getContactInfo() {
        return `📞 **Contact CSMS**\n\n📱 **Phone**: ${this.knowledgeBase.contact.phone}\n💬 **WhatsApp**: ${this.knowledgeBase.contact.whatsapp}\n📧 **Email**: ${this.knowledgeBase.contact.email}\n📩 **Support**: ${this.knowledgeBase.contact.support_email}\n📍 **Address**: ${this.knowledgeBase.contact.address}\n🌐 **Website**: ${this.knowledgeBase.contact.website}\n\n⏰ We typically respond within 2-4 hours during business days.\n\nNeed immediate assistance? Call our hotline for urgent matters!`;
    }
    
    getRatingPrompt() {
        return "⭐ **We value your feedback!** ⭐\n\nYour ratings help us improve our services. If you've used our services, please leave a review on our website or contact page. For chat feedback, just click the stars above when prompted!\n\nThank you for helping CSMS grow! 🙏";
    }
    
    getHelpMessage() {
        return `🤖 **CSMS Assistant**\n\nI can help you with:\n\n💬 **Services & Pricing** — Learn about our cleaning services\n📍 **Service Areas** — Where we operate in Zanzibar\n📅 **Booking Process** — How to schedule a cleaning\n💰 **Payment Methods** — All accepted payment options\n🕐 **Hours of Operation** — When we're available\n📞 **Contact Information** — How to reach us\n\nJust type your question or use the quick reply buttons above!\n\nWhat would you like to know?`;
    }
    
    showPricingInfo() {
        this.addResponseWithTyping(this.getPricingInfo());
    }
    
    showLocationsInfo() {
        this.addResponseWithTyping(this.getLocationInfo());
    }
    
    showBookingGuide() {
        this.addResponseWithTyping(this.getBookingInfo());
    }
    
    showPaymentInfo() {
        this.addResponseWithTyping(this.getPaymentInfo());
    }
    
    showHoursInfo() {
        this.addResponseWithTyping(this.getHoursInfo());
    }
    
    showContactInfo() {
        this.addResponseWithTyping(this.getContactInfo());
    }
    
    hideQuickReplies() {
        this.quickRepliesContainer.innerHTML = '';
    }
    
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
    
    saveToStorage() {
        const saveData = {
            messages: this.messages.slice(-50),
            context: this.conversationContext,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('csms_chat_history', JSON.stringify(saveData));
    }
    
    loadFromStorage() {
        const saved = localStorage.getItem('csms_chat_history');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.messages = data.messages || [];
                this.conversationContext = data.context || {};
            } catch(e) {}
        }
    }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.csmsChatbot = new CSMSChatbot();
});

// Global function to open chatbot (for support card integration)
window.openChatbot = () => {
    if (window.csmsChatbot && !window.csmsChatbot.isOpen) {
        window.csmsChatbot.toggleChatbot();
    } else if (window.csmsChatbot) {
        window.csmsChatbot.toggleChatbot();
    }
};