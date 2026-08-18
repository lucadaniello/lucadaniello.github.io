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

/* ── Publication totals, counted from the list on the page ──
   Keeps the banner in sync with the entries below it. Pre-prints
   are deliberately excluded from the total.                    */
(function initPubCounts() {
    const totalEl = document.querySelector('[data-count-pubs]');
    if (!totalEl) return;

    const groups = [
        ['journal',    'article',     'articles'],
        ['book',       'book',        'books'],
        ['conference', 'proceeding',  'proceedings']
    ];

    let total = 0;
    const parts = [];

    groups.forEach(([group, singular, plural]) => {
        const section = document.querySelector(`.subsection[data-pub-group="${group}"]`);
        if (!section) return;
        const n = section.querySelectorAll('.pub-card').length;
        if (!n) return;
        total += n;
        parts.push(`${n} ${n === 1 ? singular : plural}`);
    });

    totalEl.dataset.target = total;

    const breakdownEl = document.querySelector('[data-pubs-breakdown]');
    if (breakdownEl && parts.length) {
        breakdownEl.textContent = parts.join(' · ') + ' · pre-prints excluded';
    }
})();

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

/* ── Cite buttons ──────────────────────────────────────────── */
(function initCite() {
    if (!document.querySelector('.pub-card')) return;

    /* ── helpers ── */
    function stripHtml(html) {
        const d = document.createElement('div');
        d.innerHTML = html;
        return d.textContent.trim();
    }

    function parsePub(card) {
        const year      = (card.querySelector('.pub-year')?.textContent   || '').trim();
        const title     = (card.querySelector('.pub-title')?.textContent  || '').trim();
        const authorsRaw = card.querySelector('.pub-meta')
                          ? stripHtml(card.querySelector('.pub-meta').innerHTML)
                          : '';
        const venueEl   = card.querySelector('.pub-venue');
        const venueHtml = venueEl ? venueEl.innerHTML : '';
        const venueText = stripHtml(venueHtml);
        const journal   = (venueEl?.querySelector('em')?.textContent || '').trim();

        // DOI
        const doiM  = venueText.match(/DOI:\s*(10\.[^\s·,\)]+)/);
        const doi   = doiM ? doiM[1].replace(/\.$/, '') : '';

        // ISBN
        const isbnM = venueText.match(/ISBN:\s*([\d\-X]+)/);
        const isbn  = isbnM ? isbnM[1] : '';

        // Volume, issue, pages  →  ", 129(11), 7055–7081"  or  ", 14, 3340"
        const volM  = venueText.match(/,\s*(\d+)(?:\((\d+)\))?,\s*([\d–\-]+(?:\d))/);
        const volume = volM ? volM[1] : '';
        const issue  = volM ? volM[2] || '' : '';
        const pages  = volM ? volM[3] : '';

        // Publisher: chunk between · and · DOI (or end)
        let publisher = '';
        const parts = venueText.split('·');
        const doiIdx = parts.findIndex(p => p.includes('DOI:') || p.includes('ISBN:'));
        if (doiIdx > 0) publisher = parts[doiIdx - 1].trim();

        // Type
        const badgeTexts = [...card.querySelectorAll('.badge')].map(b => b.textContent.trim());
        let type = 'article';
        if (badgeTexts.some(b => b === 'Book'))        type = 'book';
        else if (badgeTexts.some(b => b === 'Proceedings')) type = 'inproceedings';
        else if (badgeTexts.some(b => ['Preprint','Under Review','Accepted'].includes(b))) type = 'misc';

        return { year, title, authors: authorsRaw, journal, doi, isbn, volume, issue, pages, publisher, type };
    }

    /* ── citation formatters ── */
    function bibtexKey(authors, year) {
        const first = authors.split(',')[0].trim().split(' ').pop();
        return first.toLowerCase().replace(/[^a-z]/g, '') + year;
    }
    function bibtexAuthors(raw) {
        // Replace " & " → " and ", "…" → "others",
        // then ". , " (end-of-initial, author separator) → ". and "
        return raw
            .replace(/\s*&\s*/g, ' and ')
            .replace(/…/g, 'others')
            .replace(/([A-Z]\.),\s+(?!and|others)/g, '$1 and ');
    }

    function fmtAPA({ authors, year, title, journal, volume, issue, pages, doi, isbn, publisher, type }) {
        let s = `${authors} (${year}). ${title}.`;
        if (type === 'article' && journal) {
            s += ` ${journal}`;
            if (volume) s += `, ${volume}`;
            if (issue)  s += `(${issue})`;
            if (pages)  s += `, ${pages}`;
            s += '.';
        } else if (type === 'book') {
            if (publisher) s += ` ${publisher}.`;
            if (isbn)      s += ` ISBN: ${isbn}.`;
        } else if (type === 'inproceedings' && journal) {
            s += ` In ${journal}.`;
        }
        if (doi) s += ` https://doi.org/${doi}`;
        return s;
    }

    function fmtMLA({ authors, year, title, journal, volume, issue, pages, doi, type }) {
        let s = `${authors}. "${title}."`;
        if (type === 'article' && journal) {
            s += ` ${journal}`;
            if (volume) s += `, vol. ${volume}`;
            if (issue)  s += `, no. ${issue}`;
            s += `, ${year}`;
            if (pages)  s += `, pp. ${pages}`;
            s += '.';
        } else {
            s += ` ${year}.`;
        }
        if (doi) s += ` DOI: ${doi}.`;
        return s;
    }

    function fmtISO({ authors, year, title, journal, volume, issue, pages, doi, type }) {
        const today = new Date().toISOString().split('T')[0];
        let s = `${authors}. ${title}. `;
        if (type === 'article' && journal) {
            s += `${journal} [online]. ${year}`;
            if (volume) s += `, vol. ${volume}`;
            if (issue)  s += `, no. ${issue}`;
            if (pages)  s += `, pp. ${pages}`;
            s += ` [cited ${today}].`;
        } else {
            s += `${year}.`;
        }
        if (doi) s += ` Available from: https://doi.org/${doi}`;
        return s;
    }

    function fmtBibTeX(data) {
        const { year, title, journal, volume, issue, pages, doi, isbn, publisher, type } = data;
        const key     = bibtexKey(data.authors, year);
        const authors = bibtexAuthors(data.authors);
        const jField  = type === 'article' ? 'journal' : 'booktitle';
        let b = `@${type}{${key},\n`;
        b += `  author    = {${authors}},\n`;
        b += `  title     = {${title}},\n`;
        if (journal)   b += `  ${jField.padEnd(9)} = {${journal}},\n`;
        b += `  year      = {${year}}`;
        if (volume)    b += `,\n  volume    = {${volume}}`;
        if (issue)     b += `,\n  number    = {${issue}}`;
        if (pages)     b += `,\n  pages     = {${pages}}`;
        if (publisher) b += `,\n  publisher = {${publisher}}`;
        if (doi)       b += `,\n  doi       = {${doi}}`;
        if (isbn)      b += `,\n  isbn      = {${isbn}}`;
        b += '\n}';
        return b;
    }

    /* ── build panel DOM ── */
    function buildPanel(data) {
        const formats = {
            apa:    fmtAPA(data),
            mla:    fmtMLA(data),
            iso:    fmtISO(data),
            bibtex: fmtBibTeX(data)
        };

        const panel = document.createElement('div');
        panel.className = 'cite-panel';
        panel.hidden = true;
        panel.innerHTML = `
            <div class="cite-tabs">
                <button class="cite-tab active" data-fmt="apa">APA</button>
                <button class="cite-tab" data-fmt="mla">MLA</button>
                <button class="cite-tab" data-fmt="iso">ISO 690</button>
                <button class="cite-tab" data-fmt="bibtex">BibTeX</button>
            </div>
            <div class="cite-content">
                <pre class="cite-text"></pre>
                <button class="cite-copy"><i class="fas fa-copy"></i> Copy</button>
            </div>`;

        const tabs    = panel.querySelectorAll('.cite-tab');
        const textEl  = panel.querySelector('.cite-text');
        const copyBtn = panel.querySelector('.cite-copy');

        textEl.textContent = formats.apa;

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                textEl.textContent = formats[tab.dataset.fmt];
            });
        });

        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(textEl.textContent).then(() => {
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyBtn.classList.add('copied');
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    copyBtn.classList.remove('copied');
                }, 2000);
            });
        });

        return panel;
    }

    /* ── inject per card ── */
    document.querySelectorAll('.pub-card').forEach(card => {
        const pubBody = card.querySelector('.pub-body');
        if (!pubBody) return;
        if (card.closest('.no-cite')) return;   // e.g. Outreach conference presentations

        const data  = parsePub(card);
        const btn   = document.createElement('button');
        btn.className = 'cite-btn';
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = '<i class="fas fa-quote-right"></i> Cite';

        const panel = buildPanel(data);

        const viewLink = pubBody.querySelector('.pub-link');
        if (viewLink) {
            viewLink.after(btn);
        } else {
            pubBody.appendChild(btn);
        }
        pubBody.appendChild(panel);

        btn.addEventListener('click', e => {
            e.stopPropagation();
            const isOpen = !panel.hidden;
            // close all
            document.querySelectorAll('.cite-panel').forEach(p => { p.hidden = true; });
            document.querySelectorAll('.cite-btn').forEach(b => b.setAttribute('aria-expanded','false'));
            if (!isOpen) {
                panel.hidden = false;
                btn.setAttribute('aria-expanded', 'true');
                panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        });

        panel.addEventListener('click', e => e.stopPropagation());
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.cite-panel').forEach(p => { p.hidden = true; });
        document.querySelectorAll('.cite-btn').forEach(b => b.setAttribute('aria-expanded','false'));
    });
})();

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

/* ── Publications: filter chips + search + year dropdown ───── */
(function initPubFilters() {
    const controls = document.getElementById('pubControls');
    if (!controls) return;

    const pubSection = document.getElementById('publications');
    const yearSelect = document.getElementById('pubYear');
    const searchInput = document.getElementById('pubSearch');
    const emptyMsg   = document.getElementById('pubEmpty');
    const filterBtns = controls.querySelectorAll('.pub-filter');

    // Map subsection heading → type
    const TYPE_BY_TITLE = {
        'scientific articles':        'journal',
        'books & monographs':         'book',
        'conference proceedings':     'conference',
        'working papers & preprints': 'preprint'
    };

    const subsections = [...pubSection.querySelectorAll('.subsection')];
    const years = new Set();

    subsections.forEach(sub => {
        const titleEl = sub.querySelector('.subsection-title');
        const title = (titleEl?.textContent || '').trim().toLowerCase();
        const type = TYPE_BY_TITLE[title] || 'other';
        sub.dataset.group = type;
        sub.querySelectorAll('.pub-card').forEach(card => {
            const year = (card.querySelector('.pub-year')?.textContent || '').trim();
            card.dataset.pubtype = type;
            card.dataset.pubyear = year;
            card.dataset.searchtext = (card.textContent || '').toLowerCase();
            if (year) years.add(year);
        });
    });

    // Populate year dropdown (desc)
    [...years].sort((a, b) => b - a).forEach(y => {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
    });

    let activeFilter = 'all';

    function apply() {
        const year  = yearSelect.value;
        const query = (searchInput.value || '').trim().toLowerCase();
        let totalVisible = 0;

        subsections.forEach(sub => {
            let groupVisible = 0;
            sub.querySelectorAll('.pub-card').forEach(card => {
                const okType   = activeFilter === 'all' || card.dataset.pubtype === activeFilter;
                const okYear   = year === 'all' || card.dataset.pubyear === year;
                const okSearch = !query || card.dataset.searchtext.includes(query);
                const show = okType && okYear && okSearch;
                card.classList.toggle('is-hidden', !show);
                if (show) { card.classList.add('visible'); groupVisible++; }
            });
            sub.classList.toggle('is-hidden', groupVisible === 0);
            totalVisible += groupVisible;
        });

        if (emptyMsg) emptyMsg.style.display = totalVisible === 0 ? 'block' : 'none';
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;
            apply();
        });
    });
    yearSelect.addEventListener('change', apply);
    searchInput.addEventListener('input', apply);
})();

/* ── Latest News: center when few, scroll when they overflow ── */
(function initNewsCarousel() {
    const viewport = document.querySelector('.news-viewport');
    const track    = document.getElementById('newsTrack');
    if (!viewport || !track) return;

    const originals = [...track.children];

    function setup() {
        track.classList.remove('marquee');
        track.querySelectorAll('[data-clone]').forEach(n => n.remove());

        // Overflowing → clone the set for a seamless loop and start scrolling
        if (track.scrollWidth > viewport.clientWidth + 1) {
            originals.forEach(node => {
                const clone = node.cloneNode(true);
                clone.setAttribute('data-clone', '');
                clone.setAttribute('aria-hidden', 'true');
                clone.setAttribute('tabindex', '-1');
                track.appendChild(clone);
            });
            track.classList.add('marquee');
        }
    }

    setup();
    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(setup, 200); });
})();
