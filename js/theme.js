// ===== THEME MANAGEMENT =====
// This file handles dark/light mode toggle and persistence
// Include this file BEFORE other JS files on every page

(function() {
    'use strict';

    /**
     * Get the current theme from localStorage
     * @returns {string} 'dark' or 'light'
     */
    function getSavedTheme() {
        return localStorage.getItem('theme') || 'light';
    }

    /**
     * Save theme preference to localStorage
     * @param {string} theme - 'dark' or 'light'
     */
    function saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    /**
     * Apply theme to the document
     * @param {string} theme - 'dark' or 'light'
     */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        updateToggleButton(theme);
    }

    /**
     * Toggle between dark and light themes
     */
    function toggleTheme() {
        const currentTheme = getSavedTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Add transition class to body for smooth theme change
        document.body.classList.add('theme-transitioning');
        
        // Apply the new theme
        applyTheme(newTheme);
        saveTheme(newTheme);
        
        // Show notification
        const themeLabel = newTheme === 'dark' ? 'Dark Mode' : 'Light Mode';
        const icon = newTheme === 'dark' ? '🌙' : '☀️';
        
        if (typeof showNotification === 'function') {
            showNotification(icon + ' ' + themeLabel + ' activated', 'info');
        }
        
        // Remove transition class after animation completes
        setTimeout(function() {
            document.body.classList.remove('theme-transitioning');
        }, 300);
        
        console.log('Theme switched to:', themeLabel);
    }

    /**
     * Update the toggle button icons based on current theme
     * @param {string} theme - 'dark' or 'light'
     */
    function updateToggleButton(theme) {
        // The CSS handles icon visibility via [data-theme] selector
        // No additional JS needed for icon switching
    }

    /**
     * Initialize the theme toggle button
     */
    function initThemeToggle() {
        const toggleBtn = document.getElementById('themeToggle');
        
        if (toggleBtn) {
            // Remove any existing click handlers
            const newToggleBtn = toggleBtn.cloneNode(true);
            toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
            
            // Add click handler
            newToggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                toggleTheme();
            });
            
            // Add keyboard support
            newToggleBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTheme();
                }
            });
            
            // Set initial state
            const currentTheme = getSavedTheme();
            updateToggleButton(currentTheme);
            
            console.log('Theme toggle initialized. Current theme:', currentTheme);
        } else {
            console.warn('Theme toggle button (#themeToggle) not found on this page.');
        }
    }

    /**
     * Listen for storage changes (when theme is changed in another tab)
     */
    function initStorageListener() {
        window.addEventListener('storage', function(e) {
            if (e.key === 'theme') {
                const newTheme = e.newValue || 'light';
                applyTheme(newTheme);
                console.log('Theme updated from another tab:', newTheme);
            }
        });
    }

    /**
     * Add theme transition styles
     */
    function addTransitionStyles() {
        const styleId = 'theme-transition-styles';
        
        // Don't add if already exists
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .theme-transitioning,
            .theme-transitioning *,
            .theme-transitioning *::before,
            .theme-transitioning *::after {
                transition: background-color 0.3s ease, 
                            color 0.3s ease, 
                            border-color 0.3s ease, 
                            box-shadow 0.3s ease !important;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Apply saved theme immediately (called on page load)
     */
    function applyInitialTheme() {
        const savedTheme = getSavedTheme();
        document.documentElement.setAttribute('data-theme', savedTheme);
        console.log('Initial theme applied:', savedTheme);
    }

    // ===== INITIALIZATION =====
    
    // Apply theme immediately (in case inline script didn't run)
    applyInitialTheme();
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            addTransitionStyles();
            initThemeToggle();
            initStorageListener();
        });
    } else {
        // DOM already loaded
        addTransitionStyles();
        initThemeToggle();
        initStorageListener();
    }

})();