// ═══════════════════════════ CONFIG ═══════════════════════════
const WEDDING_DATE = new Date('2026-07-06T10:00:00+05:30');
const COUPLE = 'Soumya & Abhyudaya';
const UPI_ID = 'soumya.abhyudaya@upi';

// Local storage keys (since we don't have a backend, we'll store data locally)
const STORAGE_KEYS = {
    RSVPS: 'shaadi_rsvps',
    SHAGUNS: 'shaadi_shaguns'
};

// ═══════════════════════════ UTILITIES ═══════════════════════════
function getFromStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function fmtINR(n) {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n || 0);
}

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

// ═══════════════════════════ COUNTDOWN ═══════════════════════════
function updateCountdown() {
    const now = new Date();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
        document.getElementById('countDays').textContent = '0';
        document.getElementById('countHours').textContent = '0';
        document.getElementById('countMinutes').textContent = '0';
        document.getElementById('countSeconds').textContent = '0';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('countDays').textContent = days;
    document.getElementById('countHours').textContent = String(hours).padStart(2, '0');
    document.getElementById('countMinutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('countSeconds').textContent = String(seconds).padStart(2, '0');
}

// ═══════════════════════════ HEADER ═══════════════════════════
function initHeader() {
    const header = document.getElementById('header');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-menu-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
        });
    });
}

// ═══════════════════════════ SCROLL ANIMATIONS ═══════════════════════════
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.fade-up').forEach(el => {
        observer.observe(el);
    });
}

// ═══════════════════════════ RSVP FORM ═══════════════════════════
function initRSVPForm() {
    const form = document.getElementById('rsvpForm');
    const attendeesGroup = document.getElementById('attendeesGroup');
    const radios = document.querySelectorAll('input[name="attending"]');

    // Show/hide attendees count
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'yes') {
                attendeesGroup.style.display = 'block';
                attendeesGroup.style.animation = 'fadeInUp 0.4s ease both';
            } else {
                attendeesGroup.style.display = 'none';
            }
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('rsvpSubmitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="40" stroke-dashoffset="10"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/></circle></svg>
            Sending...
        `;

        const attending = document.querySelector('input[name="attending"]:checked');
        const rsvpData = {
            id: Date.now(),
            guest_name: document.getElementById('guestName').value.trim(),
            attending: attending ? attending.value === 'yes' : false,
            attendees_count: attending && attending.value === 'yes' ? 
                parseInt(document.getElementById('attendeesCount').value) || 1 : 0,
            message: document.getElementById('rsvpMessage').value.trim(),
            created_at: new Date().toISOString()
        };

        // Simulate API delay
        setTimeout(() => {
            const rsvps = getFromStorage(STORAGE_KEYS.RSVPS);
            rsvps.unshift(rsvpData);
            saveToStorage(STORAGE_KEYS.RSVPS, rsvps);

            // Show success
            form.style.display = 'none';
            document.getElementById('rsvpSuccess').style.display = 'block';
            showToast(rsvpData.attending ? '🎉 We can\'t wait to see you!' : 'Thank you for letting us know!');

            // Refresh dashboard
            updateDashboard();
        }, 800);
    });
}

// ═══════════════════════════ SHAGUN FORM ═══════════════════════════
function initShagunForm() {
    const form = document.getElementById('shagunForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('shagunSubmitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="40" stroke-dashoffset="10"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/></circle></svg>
            Recording...
        `;

        const shagunData = {
            id: Date.now(),
            sender_name: document.getElementById('shagunName').value.trim(),
            amount: parseFloat(document.getElementById('shagunAmount').value) || 0,
            message: document.getElementById('shagunMessage').value.trim(),
            created_at: new Date().toISOString()
        };

        setTimeout(() => {
            const shaguns = getFromStorage(STORAGE_KEYS.SHAGUNS);
            shaguns.unshift(shagunData);
            saveToStorage(STORAGE_KEYS.SHAGUNS, shaguns);

            // Show success
            form.style.display = 'none';
            document.getElementById('shagunSuccess').style.display = 'block';
            showToast('🙏 Your blessings mean the world to us!');

            // Refresh dashboard
            updateDashboard();
        }, 800);
    });
}

// ═══════════════════════════ COPY UPI ═══════════════════════════
function copyUPI() {
    navigator.clipboard.writeText(UPI_ID).then(() => {
        showToast('✓ UPI ID copied to clipboard!');
    }).catch(() => {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = UPI_ID;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('✓ UPI ID copied to clipboard!');
    });
}

// ═══════════════════════════ DASHBOARD ═══════════════════════════
function updateDashboard() {
    const rsvps = getFromStorage(STORAGE_KEYS.RSVPS);
    const shaguns = getFromStorage(STORAGE_KEYS.SHAGUNS);

    // Stats
    const attendingRsvps = rsvps.filter(r => r.attending);
    const totalGuests = attendingRsvps.reduce((sum, r) => sum + (r.attendees_count || 0), 0);
    const totalShagun = shaguns.reduce((sum, s) => sum + (s.amount || 0), 0);

    document.getElementById('statGuests').textContent = totalGuests;
    document.getElementById('statGuestsSub').textContent = `${attendingRsvps.length} families saying yes`;
    document.getElementById('statRSVP').textContent = rsvps.length;
    document.getElementById('statShagun').textContent = `₹${fmtINR(totalShagun)}`;
    document.getElementById('statShagunSub').textContent = `from ${shaguns.length} blessings`;
    document.getElementById('statBlessings').textContent = shaguns.length;

    // Recent RSVPs
    const rsvpList = document.getElementById('recentRSVPs');
    if (rsvps.length === 0) {
        rsvpList.innerHTML = '<li class="recent-empty">No RSVPs yet — be the first!</li>';
    } else {
        const recentRsvps = rsvps.slice(0, 5);
        rsvpList.innerHTML = recentRsvps.map(r => `
            <li>
                <div>
                    <p class="recent-name">${escapeHtml(r.guest_name)}</p>
                    ${r.message ? `<p class="recent-message">\u201C${escapeHtml(r.message)}\u201D</p>` : ''}
                </div>
                <div style="text-align: right;">
                    ${r.attending ? 
                        `<span class="recent-attending">✓ ${r.attendees_count} guest${r.attendees_count > 1 ? 's' : ''}</span>` : 
                        `<span class="recent-declined">Regrets</span>`
                    }
                </div>
            </li>
        `).join('');
    }

    // Recent Shaguns
    const shagunList = document.getElementById('recentShaguns');
    if (shaguns.length === 0) {
        shagunList.innerHTML = '<li class="recent-empty">No shagun received yet.</li>';
    } else {
        const recentShaguns = shaguns.slice(0, 5);
        shagunList.innerHTML = recentShaguns.map(s => `
            <li>
                <div>
                    <p class="recent-name">${escapeHtml(s.sender_name)}</p>
                    ${s.message ? `<p class="recent-message">\u201C${escapeHtml(s.message)}\u201D</p>` : ''}
                </div>
                <span class="recent-amount">₹${fmtINR(s.amount)}</span>
            </li>
        `).join('');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ═══════════════════════════ SMOOTH SCROLL FOR HERO CTA ═══════════════════════════
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ═══════════════════════════ INIT ═══════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    // Start countdown
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Init components
    initHeader();
    initScrollAnimations();
    initRSVPForm();
    initShagunForm();
    initSmoothScroll();

    // Load dashboard data
    updateDashboard();

    // Trigger initial fade-ups for hero
    setTimeout(() => {
        document.querySelectorAll('.hero-section .fade-up').forEach(el => {
            el.classList.add('in-view');
        });
    }, 100);
});
