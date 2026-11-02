/* =========================================================
   main.js — site-wide behaviour (loaded on every page)

   1.  Helpers
   2.  Progressive-enhancement flag + footer year
   3.  Navigation (menu closes on Escape / link / resize)
   4.  Scroll-reveal animation (IntersectionObserver)
   5.  Animated counters
   6.  Back-to-top button (created dynamically)
   7.  Accordion  [data-accordion]
   8.  Tabs       [data-tabs]
   9.  Lightbox   [data-lightbox]
   ========================================================= */
(function () {
    'use strict';

    /* ---------- 1. Helpers ---------- */
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function $(sel, root) { return (root || document).querySelector(sel); }
    function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

    /* Build an element safely: text always goes in via textContent,
       never innerHTML, so user-supplied text can't inject markup. */
    function el(tag, attrs, children) {
        var node = document.createElement(tag);
        Object.keys(attrs || {}).forEach(function (key) {
            var val = attrs[key];
            if (val === false || val === null || val === undefined) { return; }
            if (key === 'text') { node.textContent = val; }
            else if (key === 'class') { node.className = val; }
            else { node.setAttribute(key, val === true ? '' : val); }
        });
        (children || []).forEach(function (child) {
            if (child) { node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child); }
        });
        return node;
    }

    window.Paws = window.Paws || {};
    window.Paws.$ = $;
    window.Paws.$$ = $$;
    window.Paws.el = el;
    window.Paws.reduceMotion = reduceMotion;

    /* ---------- 2. Enhancement flag + footer year ---------- */
    document.documentElement.classList.add('js');

    $$('[data-year]').forEach(function (node) {
        node.textContent = new Date().getFullYear();
    });

    /* ---------- 3. Navigation ---------- */
    (function nav() {
        var toggle = $('#nav-toggle');
        if (!toggle) { return; }

        function close() { toggle.checked = false; }

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && toggle.checked) { close(); toggle.focus(); }
        });
        $$('.nav-links a').forEach(function (a) { a.addEventListener('click', close); });
        window.matchMedia('(min-width: 769px)').addEventListener('change', close);
    }());

    /* ---------- 4. Scroll reveal ---------- */
    (function reveal() {
        if (reduceMotion || !('IntersectionObserver' in window)) { return; }

        var targets = $$('main .card, main .section-head, main .timeline-item, main .cta-band, main .gallery-item, main .accordion-item');
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        targets.forEach(function (node, i) {
            // Only animate what starts below the fold, so nothing flickers on load
            if (node.getBoundingClientRect().top < window.innerHeight) { return; }
            node.classList.add('reveal');
            node.style.transitionDelay = (i % 3) * 80 + 'ms';
            io.observe(node);
        });
    }());

    /* ---------- 5. Animated counters ---------- */
    (function counters() {
        var nodes = $$('[data-count]');
        if (!nodes.length) { return; }

        function render(node, value) {
            node.textContent = value + (node.getAttribute('data-suffix') || '');
        }
        function run(node) {
            var target = parseInt(node.getAttribute('data-count'), 10);
            if (reduceMotion) { render(node, target); return; }
            var duration = 1200, start = null;
            function frame(ts) {
                if (start === null) { start = ts; }
                var p = Math.min((ts - start) / duration, 1);
                render(node, Math.round(target * (1 - Math.pow(1 - p, 3))));   // ease-out
                if (p < 1) { requestAnimationFrame(frame); }
            }
            requestAnimationFrame(frame);
        }

        // Live value from the data file: number of animals waiting for a home
        $$('[data-count-available]').forEach(function (node) {
            var list = window.PAWS_ANIMALS || [];
            node.setAttribute('data-count', list.filter(function (a) { return a.status === 'available'; }).length);
        });

        if (!('IntersectionObserver' in window)) {
            nodes.forEach(function (n) { render(n, parseInt(n.getAttribute('data-count'), 10)); });
            return;
        }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
            });
        }, { threshold: 0.6 });
        nodes.forEach(function (n) { io.observe(n); });
    }());

    /* ---------- 6. Back-to-top button ---------- */
    (function backToTop() {
        var btn = el('button', { type: 'button', class: 'back-to-top', 'aria-label': 'Back to top', hidden: true, text: '↑' });
        document.body.appendChild(btn);

        var ticking = false;
        window.addEventListener('scroll', function () {
            if (ticking) { return; }
            ticking = true;
            requestAnimationFrame(function () {
                btn.hidden = window.scrollY < 600;
                ticking = false;
            });
        }, { passive: true });

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
            var skip = $('.skip-link');
            if (skip) { skip.focus({ preventScroll: true }); skip.blur(); }
        });
    }());

    /* ---------- 7. Accordion ---------- */
    $$('[data-accordion]').forEach(function (acc) {
        var items = $$('.accordion-item', acc);
        var single = acc.hasAttribute('data-single');     // only one open at a time

        function setOpen(item, open) {
            var btn = $('.accordion-trigger', item);
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            item.classList.toggle('is-open', open);
        }

        items.forEach(function (item) {
            var btn = $('.accordion-trigger', item);
            setOpen(item, btn.getAttribute('aria-expanded') === 'true');
            btn.addEventListener('click', function () {
                var willOpen = btn.getAttribute('aria-expanded') !== 'true';
                if (single && willOpen) {
                    items.forEach(function (other) { if (other !== item) { setOpen(other, false); } });
                }
                setOpen(item, willOpen);
            });
            // Arrow-key navigation between headers
            btn.addEventListener('keydown', function (e) {
                var triggers = items.map(function (i) { return $('.accordion-trigger', i); });
                var idx = triggers.indexOf(btn), next = null;
                if (e.key === 'ArrowDown') { next = triggers[(idx + 1) % triggers.length]; }
                if (e.key === 'ArrowUp')   { next = triggers[(idx - 1 + triggers.length) % triggers.length]; }
                if (e.key === 'Home')      { next = triggers[0]; }
                if (e.key === 'End')       { next = triggers[triggers.length - 1]; }
                if (next) { e.preventDefault(); next.focus(); }
            });
        });
    });

    /* ---------- 8. Tabs ---------- */
    $$('[data-tabs]').forEach(function (wrap) {
        var tabs = $$('[role="tab"]', wrap);
        var panels = $$('[role="tabpanel"]', wrap);

        function select(tab, focus) {
            tabs.forEach(function (t) {
                var on = t === tab;
                t.setAttribute('aria-selected', on ? 'true' : 'false');
                t.tabIndex = on ? 0 : -1;
            });
            panels.forEach(function (p) {
                p.hidden = p.id !== tab.getAttribute('aria-controls');
            });
            if (focus) { tab.focus(); }
            wrap.dispatchEvent(new CustomEvent('tabchange', { bubbles: true, detail: { tab: tab, id: tab.id, key: tab.getAttribute('data-tab') } }));
        }

        tabs.forEach(function (tab, i) {
            tab.addEventListener('click', function () {
                select(tab);
                if (tab.getAttribute('data-tab') && history.replaceState) {
                    history.replaceState(null, '', '#' + tab.getAttribute('data-tab'));
                }
            });
            tab.addEventListener('keydown', function (e) {
                var n = null;
                if (e.key === 'ArrowRight') { n = tabs[(i + 1) % tabs.length]; }
                if (e.key === 'ArrowLeft')  { n = tabs[(i - 1 + tabs.length) % tabs.length]; }
                if (e.key === 'Home')       { n = tabs[0]; }
                if (e.key === 'End')        { n = tabs[tabs.length - 1]; }
                if (n) { e.preventDefault(); select(n, true); }
            });
        });

        wrap.tabsSelect = function (key) {
            var match = tabs.filter(function (t) { return t.getAttribute('data-tab') === key; })[0];
            if (match) { select(match); }
        };

        // Links such as enquiry.html#volunteer clicked while already on the page
        // only change the hash, so listen for that and switch tabs too
        window.addEventListener('hashchange', function () {
            var key = location.hash.replace('#', '');
            if (key) { wrap.tabsSelect(key); }
        });

        // Initial tab: URL hash (#volunteer) wins, else the one marked selected
        var fromHash = tabs.filter(function (t) { return '#' + t.getAttribute('data-tab') === location.hash; })[0];
        select(fromHash || tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0]);
    });

    /* ---------- 9. Lightbox ---------- */
    (function lightbox() {
        var items = $$('[data-lightbox]');
        if (!items.length) { return; }

        var index = 0, startX = null;
        var img = el('img', { class: 'lightbox-img', alt: '' });
        var caption = el('p', { class: 'lightbox-caption', id: 'lightbox-caption' });
        var counter = el('p', { class: 'lightbox-counter', 'aria-live': 'polite' });
        var closeBtn = el('button', { type: 'button', class: 'lightbox-btn lightbox-close', 'aria-label': 'Close image viewer', text: '×' });
        var prevBtn = el('button', { type: 'button', class: 'lightbox-btn lightbox-prev', 'aria-label': 'Previous image', text: '‹' });
        var nextBtn = el('button', { type: 'button', class: 'lightbox-btn lightbox-next', 'aria-label': 'Next image', text: '›' });
        var dialog = el('dialog', { class: 'lightbox', 'aria-label': 'Image viewer' }, [
            closeBtn, prevBtn, nextBtn,
            el('figure', { class: 'lightbox-figure' }, [img, el('figcaption', {}, [caption, counter])])
        ]);
        document.body.appendChild(dialog);

        function show(i) {
            index = (i + items.length) % items.length;
            var src = items[index].getAttribute('data-lightbox');
            var thumb = $('img', items[index]);
            img.classList.remove('is-loaded');
            img.src = src;
            img.alt = thumb ? thumb.alt : '';
            caption.textContent = items[index].getAttribute('data-caption') || (thumb ? thumb.alt : '');
            counter.textContent = (index + 1) + ' of ' + items.length;
            // Preload the neighbours so next/previous feels instant
            [index + 1, index - 1].forEach(function (n) {
                var pre = new Image();
                pre.src = items[(n + items.length) % items.length].getAttribute('data-lightbox');
            });
        }
        img.addEventListener('load', function () { img.classList.add('is-loaded'); });

        function open(i) {
            show(i);
            if (typeof dialog.showModal === 'function') { dialog.showModal(); }
            document.body.classList.add('modal-open');
        }
        function close() { if (dialog.open) { dialog.close(); } }

        items.forEach(function (item, i) {
            item.addEventListener('click', function () { open(i); });
        });
        closeBtn.addEventListener('click', close);
        prevBtn.addEventListener('click', function () { show(index - 1); });
        nextBtn.addEventListener('click', function () { show(index + 1); });
        dialog.addEventListener('close', function () { document.body.classList.remove('modal-open'); });

        // Click on the dark backdrop closes
        dialog.addEventListener('click', function (e) { if (e.target === dialog) { close(); } });

        dialog.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') { show(index + 1); }
            if (e.key === 'ArrowLeft')  { show(index - 1); }
        });

        // Swipe left / right on touch screens
        dialog.addEventListener('pointerdown', function (e) { startX = e.clientX; });
        dialog.addEventListener('pointerup', function (e) {
            if (startX === null) { return; }
            var dx = e.clientX - startX; startX = null;
            if (Math.abs(dx) > 60) { show(index + (dx < 0 ? 1 : -1)); }
        });
    }());

}());
