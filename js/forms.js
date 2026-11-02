/* =========================================================
   forms.js — form validation and submission

   1. Validation engine (HTML5 constraint attributes + JavaScript)
   2. Enquiry form  (enquiry.html)  — tabs, AJAX submit, processed response
   3. Contact form  (contact.html)  — validated, compiled into an email
   4. Donate form   (donate.html)   — toggle, amounts, validation

   Every form has novalidate so that THIS script controls the error
   messages (consistent wording, shown next to the field, announced to
   screen readers). The HTML attributes (required, type, minlength,
   pattern, min, max) still define the rules and still work as the
   rule-set — JavaScript reads them through the Constraint
   Validation API (el.validity).
   ========================================================= */
(function () {
    'use strict';

    var P = window.Paws || {}, $ = P.$, $$ = P.$$, el = P.el;
    if (!$) { return; }
    var CONFIG = window.PAWS_CONFIG || {};
    var ANIMALS = window.PAWS_ANIMALS || [];

    /* ---------- small utilities ---------- */
    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function isoDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
    function addDays(n) { var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; }
    function parseISO(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
    function longDate(s) {
        return parseISO(s).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    function money(n) { return 'R' + n.toLocaleString('en-ZA'); }
    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    function reference(prefix) {
        var d = new Date(), rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
        return 'PC-' + prefix + '-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + rnd;
    }

    /* =====================================================
       1. VALIDATION ENGINE
       ===================================================== */
    function labelText(control) {
        var lab = control.id && $('label[for="' + control.id + '"]');
        if (!lab && control.closest('fieldset')) { lab = $('legend', control.closest('fieldset')); }
        return lab ? lab.textContent.replace('*', '').replace(/\s+/g, ' ').trim() : 'This field';
    }

    /* Custom rules that HTML attributes can't express */
    var RULES = {
        'closed-monday': function (c) {
            if (c.value && parseISO(c.value).getDay() === 1) {
                return 'We are closed on Mondays. Please choose Tuesday to Sunday.';
            }
            return '';
        },
        'adult-only': function (c) {
            return c.checked ? '' : 'You need to be 18 or older to volunteer with us.';
        }
    };

    function messageFor(c) {
        var v = c.validity, name = labelText(c);
        if (c.getAttribute('data-msg') && !v.valid) { return c.getAttribute('data-msg'); }
        if (v.valueMissing) {
            if (c.type === 'checkbox') { return 'Please tick this box to continue.'; }
            if (c.tagName === 'SELECT') { return 'Please choose an option for "' + name + '".'; }
            return '"' + name + '" is required.';
        }
        if (v.typeMismatch && c.type === 'email') { return 'Enter a valid email address, for example name@example.com.'; }
        if (v.patternMismatch) { return c.getAttribute('data-pattern-msg') || '"' + name + '" is not in the right format.'; }
        if (v.badInput) { return 'Enter a valid value for "' + name + '".'; }
        if (v.rangeUnderflow) {
            if (c.type === 'date') { return 'Please choose a date from ' + longDate(c.min) + ' onwards.'; }
            return '"' + name + '" must be at least ' + c.min + '.';
        }
        if (v.rangeOverflow) {
            if (c.type === 'date') { return 'Please choose a date on or before ' + longDate(c.max) + '.'; }
            return '"' + name + '" can be at most ' + Number(c.max).toLocaleString('en-ZA') + '.';
        }
        if (v.customError) { return c.validationMessage; }
        return 'Please check "' + name + '".';
    }

    /* tooShort is only raised for user edits, so check minlength ourselves */
    function checkControl(c) {
        c.setCustomValidity('');
        var rule = c.getAttribute('data-rule');
        if (c.willValidate && RULES[rule]) {
            var custom = RULES[rule](c);
            if (custom) { c.setCustomValidity(custom); }
        }
        var min = parseInt(c.getAttribute('minlength'), 10);
        if (c.willValidate && min && c.value.trim() !== '' && c.value.trim().length < min) {
            return 'Please write at least ' + min + ' characters in "' + labelText(c) + '" (you have ' + c.value.trim().length + ').';
        }
        return c.checkValidity() ? '' : messageFor(c);
    }

    function errorBox(control) {
        var host = control.closest('.field') || control.closest('fieldset') || control.parentNode;
        var id = (control.id || control.name) + '-error';
        var box = document.getElementById(id);
        if (!box) {
            box = el('p', { class: 'field-error', id: id, role: 'alert' });
            host.appendChild(box);
        }
        return { box: box, host: host };
    }

    function setError(control, msg) {
        // A field that has shown an error is re-checked on every keystroke, so
        // the message disappears as soon as it is fixed (not later, on blur,
        // when the layout shift could make the next click miss its target).
        if (msg) { control.setAttribute('data-touched', 'true'); }
        var e = errorBox(control);
        e.box.textContent = msg;
        e.host.classList.toggle('has-error', !!msg);
        if (control.type === 'radio') {
            $$('input[name="' + control.name + '"]', control.form).forEach(function (r) { r.setAttribute('aria-invalid', msg ? 'true' : 'false'); });
        } else {
            control.setAttribute('aria-invalid', msg ? 'true' : 'false');
        }
        if (msg) { control.setAttribute('aria-describedby', e.box.id); }
    }

    /* Radio groups and "choose at least one" checkbox groups */
    function checkGroup(fs) {
        var boxes = $$('input[type="checkbox"]', fs);
        var any = boxes.some(function (b) { return b.checked; });
        return any ? '' : (fs.getAttribute('data-msg') || 'Please choose at least one option.');
    }

    function validateForm(form) {
        var firstBad = null, problems = 0, seenRadio = {};

        $$('input, select, textarea', form).forEach(function (c) {
            if (c.type === 'hidden' || c.type === 'submit' || c.hasAttribute('data-honeypot') || !c.willValidate) { return; }
            if (c.closest('[data-group-required]')) { return; }
            if (c.type === 'radio') {
                if (seenRadio[c.name]) { return; }
                seenRadio[c.name] = true;
                var group = $$('input[name="' + c.name + '"]', form);
                var req = group.some(function (r) { return r.required; });
                var picked = group.some(function (r) { return r.checked; });
                var msg = req && !picked ? 'Please choose an option for "' + labelText(c) + '".' : '';
                setError(group[0], msg);
                if (msg) { problems++; firstBad = firstBad || group[0]; }
                return;
            }
            var m = checkControl(c);
            setError(c, m);
            if (m) { problems++; firstBad = firstBad || c; }
        });

        $$('[data-group-required]', form).forEach(function (fs) {
            if (fs.disabled || fs.closest('fieldset[disabled]')) { return; }
            var m = checkGroup(fs), first = $('input', fs);
            setError(first, m);
            if (m) { problems++; firstBad = firstBad || first; }
        });

        return { problems: problems, first: firstBad };
    }

    /* Live feedback: validate a field when the user leaves it, then keep
       re-validating while they fix it. */
    function liveValidation(form) {
        form.addEventListener('focusout', function (e) {
            var c = e.target;
            if (!c.matches || !c.matches('input, select, textarea') || c.hasAttribute('data-honeypot')) { return; }
            c.setAttribute('data-touched', 'true');
            if (c.type === 'radio' || c.closest('[data-group-required]')) { return; }
            if (c.willValidate) { setError(c, checkControl(c)); }
        });
        form.addEventListener('input', function (e) {
            var c = e.target;
            if (c.getAttribute && c.getAttribute('data-touched') === 'true' && c.willValidate &&
                c.type !== 'radio' && !c.closest('[data-group-required]')) {
                setError(c, checkControl(c));
            }
        });
        form.addEventListener('change', function (e) {
            var c = e.target;
            if (c.type === 'radio') {
                var g = $$('input[name="' + c.name + '"]', form);
                setError(g[0], '');
            }
            var fs = c.closest && c.closest('[data-group-required]');
            if (fs) { setError($('input', fs), checkGroup(fs)); }
            if (c.tagName === 'SELECT' && c.willValidate) { setError(c, checkControl(c)); }
        });
    }

    function clearErrors(form) {
        $$('.field-error', form).forEach(function (b) { b.textContent = ''; });
        $$('.has-error', form).forEach(function (h) { h.classList.remove('has-error'); });
        $$('[aria-invalid]', form).forEach(function (c) { c.setAttribute('aria-invalid', 'false'); });
        var alertBox = $('.form-alert', form);
        if (alertBox) { alertBox.hidden = true; }
    }

    function showSummary(form, problems) {
        var box = $('.form-alert', form);
        if (!box) { return; }
        box.textContent = problems === 1
            ? 'There is 1 problem with your form. Please fix it below and try again.'
            : 'There are ' + problems + ' problems with your form. Please fix them below and try again.';
        box.hidden = false;
    }

    /* Wire up a form: validation first, then onValid(data) */
    function attachForm(form, onValid) {
        form.noValidate = true;
        liveValidation(form);

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var hp = $('[data-honeypot]', form);
            if (hp && hp.value.trim() !== '') { return; }        // bot filled the hidden field: ignore silently

            var result = validateForm(form);
            if (result.problems) {
                showSummary(form, result.problems);
                if (result.first) { result.first.focus(); }
                return;
            }
            var alertBox = $('.form-alert', form);
            if (alertBox) { alertBox.hidden = true; }
            onValid(collect(form));
        });
        form.addEventListener('reset', function () {
            setTimeout(function () { clearErrors(form); $$('[data-counter-for]', form).forEach(updateCounter); }, 0);
        });
    }

    /* Collect values from enabled controls only */
    function collect(form) {
        var data = {};
        $$('input, select, textarea', form).forEach(function (c) {
            if (c.disabled || c.closest('fieldset[disabled]') || c.hasAttribute('data-honeypot') || !c.name) { return; }
            if ((c.type === 'checkbox' || c.type === 'radio') && !c.checked) { return; }
            var val = c.value.trim();
            if (data[c.name] === undefined) { data[c.name] = val; }
            else if (Array.isArray(data[c.name])) { data[c.name].push(val); }
            else { data[c.name] = [data[c.name], val]; }
        });
        return data;
    }
    function asList(v) { return v === undefined ? [] : Array.isArray(v) ? v : [v]; }

    /* Live character counters: <small data-counter-for="id"> */
    function updateCounter(node) {
        var field = document.getElementById(node.getAttribute('data-counter-for'));
        if (!field) { return; }
        var max = field.getAttribute('maxlength');
        node.textContent = field.value.length + (max ? ' / ' + max : '') + ' characters';
        node.classList.toggle('is-near-limit', !!max && field.value.length > max * 0.9);
    }
    $$('[data-counter-for]').forEach(function (n) {
        var f = document.getElementById(n.getAttribute('data-counter-for'));
        if (f) { f.addEventListener('input', function () { updateCounter(n); }); updateCounter(n); }
    });

    /* Date inputs: set min/max so the browser date picker and our
       messages both enforce a sensible window */
    $$('input[type="date"][data-min-days]').forEach(function (d) {
        d.min = isoDate(addDays(parseInt(d.getAttribute('data-min-days'), 10)));
        d.max = isoDate(addDays(parseInt(d.getAttribute('data-max-days'), 10)));
    });

    /* Result panel helper: heading, lead sentence, key/value rows, next steps */
    function buildResult(r) {
        var dl = el('dl', { class: 'result-list' }, r.rows.map(function (row) {
            return el('div', {}, [el('dt', { text: row[0] }), el('dd', { text: row[1] })]);
        }));
        var steps = el('ol', { class: 'result-steps' }, r.next.map(function (s) { return el('li', { text: s }); }));
        return [
            el('h2', { text: r.title, tabindex: '-1', id: 'result-title' }),
            el('p', { class: 'lede', text: r.lead }),
            dl,
            el('h3', { text: 'What happens next' }),
            steps
        ];
    }

    /* =====================================================
       2. ENQUIRY FORM
       ===================================================== */
    (function enquiry() {
        var form = $('#enquiry-form');
        if (!form) { return; }

        var wrap = $('#enquiry-tabs');
        var typeInput = $('#enquiry-type');
        var result = $('#enquiry-result');
        var errorBanner = $('#enquiry-error');
        var submitBtn = $('button[type="submit"]', form);
        var cardWrap = $('#enquiry-card');

        /* Fill the animal drop-downs from the shared data (DOM manipulation) */
        function fillAnimals(select, optional) {
            if (!select) { return; }
            ANIMALS.forEach(function (a) {
                select.appendChild(el('option', {
                    value: a.id,
                    text: a.name + ' — ' + cap(a.type) + ', ' + a.ageLabel + (a.status === 'reserved' ? ' (reserved)' : '')
                }));
            });
        }
        fillAnimals($('#adopt-animal'));
        fillAnimals($('#sponsor-animal'));

        var tiers = window.PAWS_SPONSOR_TIERS || {};
        var tierSelect = $('#sponsor-tier');
        Object.keys(tiers).forEach(function (k) {
            tierSelect.appendChild(el('option', { value: k, text: tiers[k].label + ' — ' + money(tiers[k].monthly) + ' per month' }));
        });

        /* Switch the visible fields when the tab changes */
        function syncType() {
            var active = $('[role="tab"][aria-selected="true"]', wrap);
            var key = active ? active.getAttribute('data-tab') : 'adopt';
            typeInput.value = key;
            $$('fieldset[data-type-fields]', form).forEach(function (fs) {
                fs.disabled = fs.getAttribute('data-type-fields') !== key;
            });
            clearErrors(form);
            errorBanner.hidden = true;
        }
        wrap.addEventListener('tabchange', syncType);

        /* Pre-select from a link such as enquiry.html?animal=buddy */
        var wanted = new URLSearchParams(location.search).get('animal');
        if (wanted && $('#adopt-animal option[value="' + wanted + '"]')) {
            $('#adopt-animal').value = wanted;
            if (wrap.tabsSelect) { wrap.tabsSelect('adopt'); }
        }
        syncType();

        /* ----- Processing: turn the validated data into a helpful answer ----- */
        function processAdopt(d) {
            var a = ANIMALS.filter(function (x) { return x.id === d.animal; })[0];
            var rows = [], lead, next;
            var home = { house_garden: 'a house with a garden', house_no_garden: 'a house without a garden', flat: 'a flat or apartment', farm: 'a farm or smallholding' }[d.home] || d.home;
            if (a.status === 'available') {
                lead = a.name + ' is available right now, and we would love to meet you. The adoption fee is ' + money(a.fee) + '.';
                rows.push(['Availability', 'Available now']);
            } else {
                lead = a.name + ' is currently reserved while a home check is completed. We have added you to the waiting list and will contact you first if the reservation falls through.';
                rows.push(['Availability', 'Reserved — you are on the waiting list']);
            }
            rows.push(['Animal', a.name + ' (' + cap(a.type) + ', ' + a.ageLabel + ')']);
            rows.push(['Adoption fee', money(a.fee) + ' — includes sterilisation, vaccinations and microchip']);
            rows.push(['Requested visit', longDate(d.visitDate) + ' (we will confirm the time by email)']);
            rows.push(['Your home', cap(home) + '; other pets: ' + (d.pets || 'none').replace(/_/g, ' ')]);

            if (a.size === 'large' && d.home === 'flat') {
                rows.push(['Please note', a.name + ' is a large animal and usually does best with outdoor space. Amy, our adoption coordinator, will chat to you about this.']);
            }
            if (d.pets && d.pets !== 'none' && ((a.type === 'dog' && d.pets.indexOf('cat') !== -1) || (a.type === 'cat' && d.pets.indexOf('dog') !== -1))) {
                rows.push(['Please note', 'We will arrange a careful introduction to your current pets before the adoption is finalised.']);
            }
            if (a.status === 'reserved') {
                var alt = ANIMALS.filter(function (x) { return x.type === a.type && x.status === 'available'; }).map(function (x) { return x.name; });
                if (alt.length) { rows.push(['Similar animals available', alt.join(', ')]); }
            }
            next = [
                'We email you within one working day to confirm your visit time.',
                'Bring your ID and proof of address to the meet-and-greet.',
                'If it is a match, we complete a short home check and the adoption papers.'
            ];
            return { title: 'Thank you, ' + d.fullName.split(' ')[0] + ' — your adoption enquiry is in', lead: lead, rows: rows, next: next };
        }

        function processVolunteer(d) {
            var slots = window.PAWS_VOLUNTEER_SLOTS || {};
            var days = asList(d.days), time = d.shift;
            var rows = [], anyFree = false;
            days.forEach(function (day) {
                var shifts = time === 'either' ? ['morning', 'afternoon'] : [time];
                shifts.forEach(function (s) {
                    var free = slots[day] ? slots[day][s] : 0;
                    if (free > 0) { anyFree = true; }
                    rows.push([cap(day) + ' ' + s, free > 0 ? free + (free === 1 ? ' place' : ' places') + ' free' : 'Full — we will add you to the waiting list']);
                });
            });
            rows.push(['Cost', 'Free. Volunteering costs nothing; you only need closed shoes and your ID.']);
            rows.push(['Earliest start', longDate(d.startDate)]);
            var interests = asList(d.interests);
            if (interests.length) { rows.push(['Interested in', interests.map(function (i) { return i.replace(/_/g, ' '); }).join(', ')]); }
            return {
                title: 'Thank you, ' + d.fullName.split(' ')[0] + ' — your volunteer enquiry is in',
                lead: anyFree
                    ? 'Good news: there is space on the shifts you chose. Here is what is available.'
                    : 'The shifts you chose are full at the moment. We have added you to the waiting list and will get in touch as soon as a place opens.',
                rows: rows,
                next: [
                    'Amy, our volunteer coordinator, emails you within two working days.',
                    'You attend a 45-minute induction before your first shift.',
                    'You are matched with an experienced volunteer for your first week.'
                ]
            };
        }

        function processSponsor(d) {
            var t = tiers[d.tier];
            var a = ANIMALS.filter(function (x) { return x.id === d.sponsorAnimal; })[0];
            var rows = [
                ['Sponsorship level', t.label],
                ['Monthly cost', money(t.monthly) + ' per month (' + money(t.monthly * 12) + ' over a year)'],
                ['What it covers', cap(t.covers)],
                ['Sponsor type', cap(d.sponsorType)],
                ['Animal', a ? a.name + ' (' + (a.status === 'available' ? 'currently available for adoption' : 'currently reserved') + ')' : 'No preference — we will match you with an animal in need']
            ];
            return {
                title: 'Thank you, ' + d.fullName.split(' ')[0] + ' — your sponsorship enquiry is in',
                lead: 'Sponsoring at the ' + t.label.toLowerCase() + ' level would cost ' + money(t.monthly) + ' a month, and places are available.',
                rows: rows,
                next: [
                    'We email you a secure payment link within two working days.',
                    'You choose when your monthly payment starts, and can stop at any time.',
                    'You receive a quarterly update on the animals your support helps.'
                ]
            };
        }

        var processors = { adopt: processAdopt, volunteer: processVolunteer, sponsor: processSponsor };

        /* ----- AJAX submission with a timeout and error handling ----- */
        function postJSON(payload) {
            var controller = ('AbortController' in window) ? new AbortController() : null;
            var timer = setTimeout(function () { if (controller) { controller.abort(); } }, 10000);
            return fetch(CONFIG.formEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=UTF-8', 'Accept': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller ? controller.signal : undefined
            }).then(function (res) {
                clearTimeout(timer);
                if (!res.ok) { throw new Error('Server responded with status ' + res.status); }
                return res.json();
            }, function (err) { clearTimeout(timer); throw err; });
        }

        function setBusy(busy) {
            submitBtn.disabled = busy;
            submitBtn.classList.toggle('is-busy', busy);
            submitBtn.textContent = busy ? 'Sending…' : 'Send enquiry';
            form.setAttribute('aria-busy', busy ? 'true' : 'false');
        }

        attachForm(form, function (data) {
            errorBanner.hidden = true;
            setBusy(true);
            var type = data.enquiryType;
            var payload = Object.assign({ submittedAt: new Date().toISOString() }, data);
            delete payload.consent;

            postJSON(payload).then(function (serverReply) {
                var r = processors[type](data);
                r.rows.push(['Your reference', reference(type.charAt(0).toUpperCase())]);
                if (serverReply && serverReply.id !== undefined) { r.rows.push(['Server receipt', '#' + serverReply.id]); }
                result.textContent = '';
                buildResult(r).forEach(function (n) { result.appendChild(n); });
                result.appendChild(el('div', { class: 'card-actions result-actions' }, [
                    el('button', { type: 'button', class: 'btn btn-secondary', id: 'enquiry-again', text: 'Make another enquiry' }),
                    el('a', { href: 'adopt.html', class: 'btn btn-primary', text: 'Meet the animals' })
                ]));
                result.hidden = false;
                cardWrap.hidden = true;
                $('#result-title').focus();
                result.scrollIntoView({ behavior: P.reduceMotion ? 'auto' : 'smooth', block: 'start' });
                $('#enquiry-again').addEventListener('click', function () {
                    form.reset();
                    result.hidden = true;
                    cardWrap.hidden = false;
                    syncType();
                    $('[role="tab"][aria-selected="true"]', wrap).focus();
                });
            }).catch(function (err) {
                errorBanner.textContent = (err && err.name === 'AbortError')
                    ? 'The request took too long. Please check your connection and try again.'
                    : 'We could not send your enquiry just now. Please try again, or email ' + CONFIG.contactEmail + '.';
                errorBanner.hidden = false;
                errorBanner.focus();
            }).then(function () { setBusy(false); });
        });
    }());

    /* =====================================================
       3. CONTACT FORM — validate, then compile an email
       ===================================================== */
    (function contact() {
        var form = $('#contact-form');
        if (!form) { return; }

        var card = $('#contact-card');
        var preview = $('#email-preview');
        var recipient = CONFIG.contactEmail;

        function compose(d) {
            var lines = [
                'Hello Paws & Care team,',
                '',
                d.message,
                '',
                '--',
                'Name: ' + d.fullName,
                'Email: ' + d.email
            ];
            if (d.phone) { lines.push('Phone: ' + d.phone); }
            lines.push('Message type: ' + d.messageType);
            return {
                to: recipient,
                subject: '[' + d.messageType + '] ' + d.subject,
                body: lines.join('\n')
            };
        }

        function mailtoHref(mail) {
            // CRLF line endings are what mail clients expect in a mailto: body
            return 'mailto:' + mail.to + '?subject=' + encodeURIComponent(mail.subject) +
                   '&body=' + encodeURIComponent(mail.body.replace(/\n/g, '\r\n'));
        }

        function copyText(text, done) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
                return;
            }
            var ta = el('textarea', { 'aria-hidden': 'true' });
            ta.value = text; document.body.appendChild(ta); ta.select();
            var ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
            document.body.removeChild(ta); done(ok);
        }

        attachForm(form, function (d) {
            var mail = compose(d);
            preview.textContent = '';
            preview.appendChild(el('h2', { text: 'Your email is ready', tabindex: '-1', id: 'preview-title' }));
            preview.appendChild(el('p', { class: 'lede', text: 'Check it over, then send it from your own email app. Nothing has been sent yet.' }));
            preview.appendChild(el('dl', { class: 'email-meta' }, [
                el('div', {}, [el('dt', { text: 'To' }), el('dd', { text: mail.to })]),
                el('div', {}, [el('dt', { text: 'Subject' }), el('dd', { text: mail.subject })])
            ]));
            // textContent (not innerHTML): whatever the visitor typed is shown as plain text
            preview.appendChild(el('pre', { class: 'email-body', text: mail.body }));

            var status = el('p', { class: 'form-note', role: 'status', 'aria-live': 'polite' });
            var copyBtn = el('button', { type: 'button', class: 'btn btn-secondary', text: 'Copy email text' });
            var editBtn = el('button', { type: 'button', class: 'btn btn-secondary', text: 'Edit message' });
            copyBtn.addEventListener('click', function () {
                copyText('To: ' + mail.to + '\nSubject: ' + mail.subject + '\n\n' + mail.body, function (ok) {
                    status.textContent = ok ? 'Copied to your clipboard.' : 'Could not copy automatically; please select the text and copy it.';
                });
            });
            editBtn.addEventListener('click', function () {
                preview.hidden = true; card.hidden = false;
                $('#c-message').focus();
            });
            preview.appendChild(el('div', { class: 'card-actions' }, [
                el('a', { href: mailtoHref(mail), class: 'btn btn-primary', text: 'Open in my email app' }),
                copyBtn, editBtn
            ]));
            preview.appendChild(status);
            preview.hidden = false;
            card.hidden = true;
            $('#preview-title').focus();
        });
    }());

    /* =====================================================
       4. DONATE FORM
       ===================================================== */
    (function donate() {
        var form = $('[data-donate-form]');
        if (!form) { return; }

        var freq = $('[data-frequency-value]', form);
        var amountInput = $('[data-custom-amount]', form);
        var amountBtns = $$('.donate-amount', form);
        var toggleBtns = $$('.donate-toggle button');
        var submit = $('button[type="submit"]', form);
        var success = $('.form-success', form);

        function label() {
            var n = parseInt(amountInput.value, 10);
            submit.textContent = n >= 10
                ? 'Donate ' + money(n) + (freq.value === 'monthly' ? ' monthly' : ' once-off')
                : 'Continue to secure payment';
        }
        function markAmount() {
            amountBtns.forEach(function (b) {
                var on = b.getAttribute('data-amount') === amountInput.value;
                b.classList.toggle('selected', on);
                b.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
        }

        amountBtns.forEach(function (b) {
            b.addEventListener('click', function () {
                amountInput.value = b.getAttribute('data-amount');
                setError(amountInput, '');
                markAmount(); label();
            });
        });
        toggleBtns.forEach(function (b) {
            b.setAttribute('aria-pressed', b.classList.contains('active') ? 'true' : 'false');
            b.addEventListener('click', function () {
                toggleBtns.forEach(function (o) { o.classList.toggle('active', o === b); o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
                freq.value = b.getAttribute('data-freq');
                label();
            });
        });
        amountInput.addEventListener('input', function () { markAmount(); label(); });
        amountInput.max = 100000;
        markAmount(); label();

        attachForm(form, function (d) {
            var n = parseInt(d.amount, 10);
            success.textContent = 'Thank you, ' + d.name.split(' ')[0] + '! Your ' + (freq.value === 'monthly' ? 'monthly' : 'once-off') +
                ' gift of ' + money(n) + ' would go straight to feeding and caring for our animals. (This demo does not take real payments.)';
            success.classList.add('is-visible');
            success.setAttribute('tabindex', '-1');
            success.focus();
        });
    }());

}());
