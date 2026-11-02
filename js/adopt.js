/* =========================================================
   adopt.js — dynamic animal listing (adopt.html)

   - Builds the animal cards from PAWS_ANIMALS (animals-data.js)
   - Live search + filter (type, size, age) + sort
   - Detail modal using the native <dialog> element
   Progressive enhancement: the static cards in the HTML remain
   for visitors/crawlers without JavaScript; this script replaces
   them with the live, filterable version.
   ========================================================= */
(function () {
    'use strict';

    var P = window.Paws, $ = P.$, el = P.el;
    var animals = window.PAWS_ANIMALS || [];
    var grid = $('#animal-grid');
    if (!grid || !animals.length) { return; }

    var controls = {
        search: $('#animal-search'),
        type: $('#filter-type'),
        size: $('#filter-size'),
        age: $('#filter-age'),
        sort: $('#sort-by'),
        reset: $('#reset-filters')
    };
    var count = $('#results-count');
    var empty = $('[data-empty-state]');
    var dialog = $('#animal-dialog');
    var AGE_NAMES = { young: 'Young', adult: 'Adult', senior: 'Senior' };

    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    function money(n) { return 'R' + n.toLocaleString('en-ZA'); }
    function enquiryUrl(a) { return 'enquiry.html?animal=' + encodeURIComponent(a.id) + '#adopt'; }

    function statusBadge(a) {
        return el('span', { class: 'badge badge-' + a.status, text: a.status === 'available' ? 'Available' : 'Reserved' });
    }

    /* ---------- Build one card ---------- */
    function buildCard(a) {
        var img = el('img', {
            src: a.image.src, width: a.image.width, height: a.image.height,
            loading: 'lazy', decoding: 'async', alt: a.alt
        });
        img.style.objectPosition = a.image.focus;

        var tags = el('div', { class: 'card-tags' }, [
            el('span', { class: 'tag', text: cap(a.type) }),
            el('span', { class: 'tag', text: cap(a.size) }),
            el('span', { class: 'tag', text: a.ageLabel }),
            statusBadge(a)
        ]);

        var details = el('button', { type: 'button', class: 'btn btn-secondary', 'data-animal': a.id, text: 'Meet ' + a.name });
        var enquire = el('a', { href: enquiryUrl(a), class: 'btn btn-primary', text: a.status === 'available' ? 'Enquire to adopt' : 'Join waiting list' });

        return el('article', { class: 'card', 'data-id': a.id }, [
            img,
            el('div', { class: 'card-body' }, [
                el('h3', { text: a.name }),
                tags,
                el('p', { text: a.summary }),
                el('div', { class: 'card-actions' }, [details, enquire])
            ])
        ]);
    }

    /* ---------- Filter + sort + render ---------- */
    function current() {
        var q = controls.search.value.trim().toLowerCase();
        var list = animals.filter(function (a) {
            if (controls.type.value !== 'all' && a.type !== controls.type.value) { return false; }
            if (controls.size.value !== 'all' && a.size !== controls.size.value) { return false; }
            if (controls.age.value !== 'all' && a.ageGroup !== controls.age.value) { return false; }
            if (q) {
                var hay = [a.name, a.type, a.size, a.summary, a.story, a.traits.join(' ')].join(' ').toLowerCase();
                // every word typed must appear somewhere
                return q.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
            }
            return true;
        });

        var sorters = {
            'name-asc':  function (a, b) { return a.name.localeCompare(b.name); },
            'name-desc': function (a, b) { return b.name.localeCompare(a.name); },
            'age-asc':   function (a, b) { return a.ageYears - b.ageYears; },
            'age-desc':  function (a, b) { return b.ageYears - a.ageYears; },
            'newest':    function (a, b) { return b.arrived.localeCompare(a.arrived); }
        };
        return list.sort(sorters[controls.sort.value] || sorters['name-asc']);
    }

    function render() {
        var list = current();
        grid.textContent = '';                       // clear the old cards
        var frag = document.createDocumentFragment();
        list.forEach(function (a) { frag.appendChild(buildCard(a)); });
        grid.appendChild(frag);

        empty.style.display = list.length ? 'none' : 'block';
        count.textContent = list.length === animals.length
            ? 'Showing all ' + animals.length + ' animals'
            : 'Showing ' + list.length + ' of ' + animals.length + ' animals';
        controls.reset.hidden = !isFiltered();
    }

    function isFiltered() {
        return controls.search.value !== '' || controls.type.value !== 'all' ||
               controls.size.value !== 'all' || controls.age.value !== 'all' ||
               controls.sort.value !== 'name-asc';
    }

    var timer;
    controls.search.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(render, 150);             // debounce while typing
    });
    ['type', 'size', 'age', 'sort'].forEach(function (k) { controls[k].addEventListener('change', render); });
    controls.reset.addEventListener('click', function () {
        controls.search.value = '';
        controls.type.value = controls.size.value = controls.age.value = 'all';
        controls.sort.value = 'name-asc';
        render();
        controls.search.focus();
    });
    // Stop Enter in the search box reloading the page
    controls.search.closest('form').addEventListener('submit', function (e) { e.preventDefault(); });

    /* ---------- Detail modal ---------- */
    function openModal(a) {
        var body = $('#animal-dialog-body');
        body.textContent = '';

        var img = el('img', { src: a.image.src, width: a.image.width, height: a.image.height, alt: a.alt, class: 'modal-img' });
        img.style.objectPosition = a.image.focus;

        var facts = el('dl', { class: 'fact-list' }, [
            el('div', {}, [el('dt', { text: 'Type' }), el('dd', { text: cap(a.type) })]),
            el('div', {}, [el('dt', { text: 'Size' }), el('dd', { text: cap(a.size) })]),
            el('div', {}, [el('dt', { text: 'Age' }), el('dd', { text: a.ageLabel + ' (' + AGE_NAMES[a.ageGroup].toLowerCase() + ')' })]),
            el('div', {}, [el('dt', { text: 'Adoption fee' }), el('dd', { text: money(a.fee) })])
        ]);

        var traits = el('ul', { class: 'trait-list' }, a.traits.map(function (t) { return el('li', { text: t }); }));

        body.appendChild(img);
        body.appendChild(el('div', { class: 'modal-copy' }, [
            el('h2', { id: 'animal-dialog-title', text: a.name }),
            el('p', {}, [statusBadge(a)]),
            el('p', { text: a.story }),
            traits,
            facts,
            el('p', { class: 'form-note', text: 'The fee covers sterilisation, vaccinations and microchipping.' }),
            el('div', { class: 'card-actions' }, [
                el('a', { href: enquiryUrl(a), class: 'btn btn-primary', text: a.status === 'available' ? 'Enquire to adopt ' + a.name : 'Join ' + a.name + "'s waiting list" })
            ])
        ]));

        if (typeof dialog.showModal === 'function') { dialog.showModal(); }
        document.body.classList.add('modal-open');
    }

    grid.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-animal]');
        if (!btn) { return; }
        var a = animals.filter(function (x) { return x.id === btn.getAttribute('data-animal'); })[0];
        if (a) { openModal(a); }
    });
    $('#animal-dialog-close').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) { dialog.close(); } });
    dialog.addEventListener('close', function () { document.body.classList.remove('modal-open'); });

    /* Start from a link such as adopt.html?type=cat */
    var preset = new URLSearchParams(location.search).get('type');
    if (preset && ['dog', 'cat'].indexOf(preset) !== -1) { controls.type.value = preset; }

    render();
}());
