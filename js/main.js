/* ============================================================
   Luca D'Aniello — Personal Academic Website
   main.js
   ============================================================ */

/* ── Navbar: transparent → solid on scroll (hero pages only) */
const navbar = document.getElementById('navbar');

function updateNavbar() {
    // On inner pages, navbar is always scrolled (class set in HTML)
    if (!document.body.classList.contains('inner-page')) {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
}
window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar();

/* ── Mobile menu toggle ───────────────────────────────────── */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('open');
});

// Close on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
    });
});

/* ── Scroll-reveal animations ─────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.10 });

document.querySelectorAll('.reveal-up, .reveal-right').forEach(el => {
    revealObserver.observe(el);
});

/* ── Counter animation ────────────────────────────────────── */
function animateCounter(el, target, duration = 1800) {
    const start = performance.now();
    function step(timestamp) {
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

const counterEls = document.querySelectorAll('.stat-num[data-target]');
const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target, parseInt(entry.target.dataset.target, 10));
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

counterEls.forEach(el => counterObserver.observe(el));

/* ── Footer year ──────────────────────────────────────────── */
document.querySelectorAll('.year').forEach(el => {
    el.textContent = new Date().getFullYear();
});

/* ── Smooth scroll for same-page anchor links ─────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const offset = 120;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});

/* ── Research tabs: highlight active on scroll ─────────────── */
const researchTabs = document.querySelectorAll('.research-tab');
if (researchTabs.length) {
    const sections = ['research-areas', 'publications', 'projects']
        .map(id => document.getElementById(id))
        .filter(Boolean);

    function updateTabs() {
        let current = sections[0];
        sections.forEach(sec => {
            if (window.scrollY + 160 >= sec.offsetTop) current = sec;
        });
        researchTabs.forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('href') === '#' + current.id);
        });
    }
    window.addEventListener('scroll', updateTabs, { passive: true });
    updateTabs();
}
