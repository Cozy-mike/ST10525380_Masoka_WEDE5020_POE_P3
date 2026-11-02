# Paws & Care Animal Shelter — Website

A multi-page website for a fictional Pretoria-based animal shelter, built for
WEDE5020 (POE). Visitors can learn about the shelter, search and filter the
adoptable animals, make adoption / volunteer / sponsorship enquiries, donate,
and get in touch. **Part 3** adds JavaScript interactivity, dynamic content,
validated forms, SEO and deployment.

**Live site:** _add your Netlify / GitHub Pages URL here after deploying_
**Repository:** _add your GitHub repository URL here_

## Pages

| Page | File | Main features |
|---|---|---|
| Home | `index.html` | Animated counters, live "animals waiting" count, ways to help |
| Adopt | `adopt.html` | Dynamic listing, live search, filters, sorting, detail modal, FAQ accordion |
| Enquire | `enquiry.html` | Tabbed enquiry form (adopt / volunteer / sponsor), validation, AJAX submit, processed response |
| About Us | `about.html` | Timeline, scroll animations, photo gallery with lightbox |
| Donate | `donate.html` | Once-off / monthly toggle, amount buttons, validated donation form |
| Contact | `contact.html` | Validated contact form compiled into an email, interactive Leaflet map, geolocation distance |
| 404 | `404.html` | Friendly not-found page (not indexed) |

## Tech stack

- Semantic HTML5
- CSS3 — external stylesheet (`css/style.css`), custom properties, Flexbox,
  Grid, media queries, CSS animations and transitions
- Vanilla JavaScript (ES5-compatible, no framework, no build step)
- [Leaflet 1.9.4](https://leafletjs.com/) — self-hosted in `vendor/leaflet/` (BSD-2 licence included)
- OpenStreetMap tiles
- Google Fonts (Quicksand, Lato)

## Project structure

```
ST10525380_Masoka_WEDE5020_POE_P2/
├── index.html  adopt.html  enquiry.html  about.html  donate.html  contact.html  404.html
├── css/
│   └── style.css
├── js/
│   ├── animals-data.js   shared sample data + config (animals, fees, slots, endpoint)
│   ├── main.js           nav, scroll reveal, counters, back-to-top, accordion, tabs, lightbox
│   ├── adopt.js          dynamic listing, search / filter / sort, detail modal
│   ├── forms.js          validation engine, enquiry (AJAX), contact (email), donate
│   └── map.js            Leaflet map, marker, geolocation distance
├── vendor/leaflet/       Leaflet CSS, JS, marker images, licence
├── images/               descriptively named photos, favicon.svg, og-paws-and-care.jpg
├── robots.txt
├── sitemap.xml
├── _headers              security + caching headers (Netlify)
├── Website_Proposals.docx
└── README.md
```

> All filenames are lowercase so internal links resolve on case-sensitive
> hosts such as GitHub Pages, not just on Windows.

## Part 3 features

### Interactive elements
| Feature | Where | How it works |
|---|---|---|
| Accordion | Adopt page FAQ | `button` + `aria-expanded`, animated with a CSS grid-rows transition, arrow-key navigation, one open at a time. Panels stay open without JavaScript. |
| Tabs | Enquire page | WAI-ARIA tabs (`role="tablist"`), arrow/Home/End keys, URL hash (`enquiry.html#volunteer`) selects a tab, inactive form sections are disabled so they are not validated or sent. |
| Modal | Adopt page | Native `<dialog>` opened with `showModal()` (built-in focus trap and Escape key), shows the animal's story, traits and fee, and links to a pre-filled enquiry. |
| Lightbox gallery | About page | Created dynamically; previous/next buttons, arrow keys, Escape, swipe on touch screens, caption and counter, preloads neighbouring images. |
| Interactive map | Contact page | Leaflet map with marker and popup, scroll-zoom only after clicking the map, **How far am I?** (Geolocation API + haversine formula, dashed line and fitted bounds), **Get directions** link. Initialised lazily when it scrolls near the viewport. |
| Animations | Whole site | Scroll-reveal (IntersectionObserver), animated number counters, modal / lightbox / tab fade-ins, hamburger-to-X icon, hover effects. All respect `prefers-reduced-motion`. |
| Back-to-top button | Whole site | Created by JavaScript and shown after scrolling 600px. |

### Dynamic content and search
- `adopt.js` builds every animal card from the `PAWS_ANIMALS` array with
  `createElement` (no `innerHTML`), so text is always inserted safely.
- **Search** matches name, type, size, story and traits (every typed word must match; debounced).
- **Filters:** type, size and age group. **Sort:** name A–Z / Z–A, youngest, oldest, newest arrivals.
- A live results line (`aria-live`) reports "Showing 3 of 6 animals" and an empty state appears when nothing matches.
- Progressive enhancement: the same six cards are in the HTML, so the page still works without JavaScript and search engines can read it.
- The home page animal count and the enquiry drop-downs also read from the same data file.

### Forms
**`enquiry.html`** (adopt / volunteer / sponsor) and **`contact.html`** (general message).

- **Form elements:** text, email, tel, date, select, textarea, radio groups, checkbox groups, hidden input, consent checkbox.
- **Validation:** HTML5 attributes (`required`, `type`, `minlength`, `maxlength`, `pattern`, `min`, `max`) define the rules; JavaScript reads them through the Constraint Validation API and adds custom rules:
  - South African phone-number format (`012 345 6789` or `+27 12 345 6789`)
  - name format, minimum message lengths, live character counters
  - visit date must be tomorrow or later and **not a Monday** (the shelter is closed)
  - "choose at least one day" for volunteers, 18+ confirmation, consent tick-box
- **Error handling:** an error summary at the top of the form, a specific message under each field (`role="alert"`, `aria-invalid`, `aria-describedby`), focus moves to the first problem, and a field re-validates as it is fixed.
- **Enquiry – AJAX submission:** `fetch()` POSTs JSON to the endpoint in `PAWS_CONFIG.formEndpoint` with a 10-second timeout, a "Sending…" state and a friendly error banner on failure (the form is kept so nothing is lost).
- **Enquiry – processing:** once validated, the answer is calculated and shown with a reference number.
  - *Adopt:* availability (available or reserved / waiting list), adoption fee, visit date, advice (e.g. large dog in a flat, existing pets) and similar animals.
  - *Volunteer:* free places for each chosen day and shift, and the cost (free).
  - *Sponsor:* monthly and yearly cost, what it covers, and the chosen animal.
- **Contact – email:** once validated, the message is compiled into an email addressed to the recipient in `PAWS_CONFIG.contactEmail` (`hello@pawsandcare.org.za`). A preview is shown with **Open in my email app** (`mailto:` link), **Copy email text** and **Edit message**.
- **Donate:** frequency toggle, amount buttons synced with the amount field, button text updates ("Donate R750 monthly"), validated name, email and amount.

## SEO

### Keyword research
Keywords were chosen by search intent for a local, non-profit audience and then used in titles, headings, descriptions, alt text and body copy. *(Search volumes should be confirmed with Google Keyword Planner or Google Trends.)*

| Intent | Target keywords | Main page |
|---|---|---|
| Adopt | adopt a dog Pretoria, adopt a cat Pretoria, rescue dogs Pretoria, pet adoption South Africa | `adopt.html` |
| Local brand | animal shelter Pretoria, animal rescue Pretoria, animal shelter Silverton | `index.html`, `contact.html` |
| Donate | donate to animal shelter South Africa, monthly donation animal rescue | `donate.html` |
| Volunteer / sponsor | volunteer animal shelter Pretoria, sponsor a shelter animal | `enquiry.html` |

### On-page SEO checklist
| Item | What was done |
|---|---|
| Title tags | Unique per page, 43–59 characters, main keyword first |
| Meta descriptions | Unique per page, 101–159 characters, includes a call to action |
| Meta keywords | Included on every page (modern search engines ignore them, but they are part of the brief) |
| Header tags | One `<h1>` per page and no skipped levels (footer headings are not headings; a hidden `<h2>` introduces the animal list) |
| Image optimisation | Descriptive file names (e.g. `miso-grey-tabby-cat-on-sofa.avif`), accurate alt text, `width`/`height` set, `loading="lazy"`, modern formats (AVIF / WebP) |
| URL structure | Short, lowercase, hyphen-free file names that describe the page (`adopt.html`, `enquiry.html`) |
| Internal linking | Contextual links in body copy between all pages (e.g. home → adopt, donate → volunteer), a consistent main nav and footer navigation |
| Mobile-friendliness | Responsive layout, viewport meta tag, 44px tap targets, hamburger menu |
| Structured data | JSON-LD: `AnimalShelter` (address, geo, opening hours) on Home and Contact, `FAQPage` on Adopt, `BreadcrumbList` on inner pages |
| Social sharing | Open Graph + Twitter card tags and a 1200×630 share image |
| Canonical URLs | `<link rel="canonical">` on every page |

### Off-page SEO plan
These need real accounts and cannot be completed inside the code. The code is ready for them (social links, share image, structured data).
- **Backlinks:** ask local pet shops, vets and animal-welfare directories to link to the shelter, list the shelter in animal-welfare directories, and give guest quotes to local news.
- **Social media:** share new arrivals and adoption stories on Facebook and Instagram, always linking back to the animal's page. *The footer links currently point at the platform home pages; replace them with the real profile URLs.*
- **Local SEO:** claim a Google Business Profile with the same name, address and phone number as the site, collect reviews, and keep opening hours up to date (the JSON-LD already contains them).

### Technical SEO and requested extras
- **`robots.txt`:** allows crawling, excludes the 404 page and `/vendor/`, and points to the sitemap.
- **`sitemap.xml`:** lists all six public pages with priority and change frequency.
- **Page speed:** deferred scripts (no render blocking), Leaflet loaded only on the contact page, map created lazily, `preconnect` for fonts with `display=swap`, lazy-loaded images, `fetchpriority="high"` on the main image, one small stylesheet, long-cache headers for images and vendor files.
- **Security:** see below.

## Security
- Visitor text is only ever written to the page with `textContent` / `createElement`, never `innerHTML`, so it cannot inject markup (the email preview shows it as plain text).
- Validation happens on the client **and** with `maxlength` limits; a real backend must still re-validate (client-side checks can be bypassed).
- Hidden **honeypot** field silently ignores simple spam bots.
- External links use `rel="noopener noreferrer"`; a referrer policy meta tag is set.
- `_headers` (Netlify) sends a strict **Content-Security-Policy**, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Referrer-Policy` and `Permissions-Policy`. The site was tested with this policy enforced and works without violations. (GitHub Pages ignores `_headers`.)
- Leaflet is self-hosted so no third-party script runs on the site; HTTPS is provided by the host.

## Configuration (`js/animals-data.js`)
| Setting | Purpose |
|---|---|
| `PAWS_CONFIG.formEndpoint` | URL the enquiry form POSTs to. Defaults to the free public mock API `jsonplaceholder.typicode.com`, which echoes data and stores nothing. **Use sample details only** while it is the default. For real use, replace it with a Formspree or Netlify Forms endpoint. |
| `PAWS_CONFIG.contactEmail` | Recipient of the compiled contact email |
| `PAWS_ANIMALS` | The animals shown on Home, Adopt and Enquire (sample data) |
| `PAWS_VOLUNTEER_SLOTS`, `PAWS_SPONSOR_TIERS` | Sample capacity and prices used by the enquiry responses |

> All animals, fees, volunteer places and sponsorship prices are **fictional sample data** for the assignment.

## Deployment (free hosting)

The site is plain static files, so any free static host works.

### Option A — GitHub Pages
1. Create a new public repository on GitHub (e.g. `paws-and-care`).
2. Push the project (see *GitHub workflow* below).
3. In the repository go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. After a minute the site is live at `https://YOUR-USERNAME.github.io/paws-and-care/`.

### Option B — Netlify
1. Sign in at netlify.com and choose **Add new site → Deploy manually** (drag the project folder in) or **Import from Git** and pick the repository.
2. No build command is needed; the publish directory is the project root.
3. Netlify reads `_headers` automatically, so the security headers apply.

### After deploying
1. Replace the placeholder `https://paws-and-care.example` with the real address in every file (in VS Code: **Ctrl+Shift+H**, search `https://paws-and-care.example`, replace in all files). It appears in the canonical links, Open Graph tags, JSON-LD, `sitemap.xml` and `robots.txt`.
2. Submit `sitemap.xml` in Google Search Console and request indexing of the home page.
3. Add the live URL to the top of this README.
4. Replace the Facebook / Instagram footer links with the real profile pages.

> On GitHub Pages a *project* site lives under `/repo-name/`, but search engines only read `robots.txt` at the very root of a domain. For a project site this file is harmless but ignored; a custom domain or a `username.github.io` repository avoids that.

## GitHub workflow

Commit small and often with descriptive messages so the history shows how the project grew. Example sequence for this part:

```
git add js/animals-data.js js/main.js
git commit -m "Add shared data file and site-wide JS (nav, reveal, accordion, tabs, lightbox)"
git add js/adopt.js adopt.html
git commit -m "Adopt page: dynamic listing with search, filter, sort and detail modal"
git add enquiry.html js/forms.js
git commit -m "Add enquiry page with tabs, validation, AJAX submit and processed response"
git add contact.html js/map.js vendor/
git commit -m "Contact page: validated form compiled to email, Leaflet map with geolocation"
git add about.html index.html donate.html
git commit -m "Gallery lightbox, animated counters and working donate form"
git add robots.txt sitemap.xml images/ _headers
git commit -m "SEO: meta tags, structured data, sitemap, robots.txt, descriptive image names"
git add README.md
git commit -m "Document Part 3 features, SEO strategy and changelog"
git push
```

## Testing

Automated checks were run in headless Chromium with the Content-Security-Policy from `_headers` enforced:

- **68 scripted browser checks, all passing:** every page loads without JavaScript errors or CSP violations; adopt search / filter / sort / reset / modal; accordion; tabs and keyboard navigation; lightbox (open, next, previous, wrap, Escape); counters; validation messages and rules (including the Monday rule); the AJAX POST and payload; the three processed responses; the network-failure banner; the honeypot; the compiled email and `mailto:` link; the map and geolocation distance; the donate form.
- **Accessibility:** axe-core (WCAG 2.0/2.1 A and AA plus best practices) reported 0 violations on all six pages.
- **HTML validation:** `html-validate` reported 0 errors on all pages.
- **Responsive:** no horizontal scrolling on any page at 1280px, 768px and 375px widths.
- **No JavaScript:** the Adopt page still shows all animals and the FAQ answers.

Not covered: Safari, Firefox and physical phones/tablets were not tested; map tiles and the two Unsplash photos need an internet connection. Please do a quick check on your own device after deploying.

## Responsive breakpoints

| Breakpoint | Width | Layout change |
|---|---|---|
| Desktop | > 768px | Multi-column grid (2–3 columns), full nav |
| Large tablet | ≤ 1024px | Slightly smaller type and spacing, tighter nav |
| Tablet | ≤ 768px | Hamburger menu, 3-col grids → 2, 2-col grids → 1, hero/contact stack, footer to 2 columns |
| Mobile | ≤ 480px | Single-column grid, full-width buttons, stacked form fields, smaller type/spacing/images |

## Screenshot evidence

> Add screenshots here showing the site at desktop, tablet and mobile widths
> (e.g. using browser DevTools' device toolbar, Ctrl/Cmd+Shift+M in Chrome
> or Edge). Include one set per page, or per key component (nav, hero,
> adopt grid, donate form), and paste the images directly into this section
> or link to an `/evidence` folder.

- Desktop (≥1200px):
- Tablet (768px):
- Mobile (375–480px):

## Changelog

### Part 3 — Enhancing functionality and SEO

**Functionality**
- Added `js/` with five scripts (`animals-data.js`, `main.js`, `adopt.js`, `forms.js`, `map.js`), all loaded with `defer`, no frameworks.
- Adopt page: animal cards are now generated from data, with live search, type/size/age filters, six sort options, a results counter, an empty state and a detail modal (`<dialog>`). Static cards remain as a no-JavaScript fallback.
- Added an adoption FAQ accordion (animated, keyboard accessible, `FAQPage` structured data).
- Added `enquiry.html` with tabs for adopt, volunteer and sponsor; each tab has its own validated fields and its own processed response (costs, availability).
- Contact page: new fields (phone, message type, subject), validation, and the message is compiled into an email with a preview, `mailto:` link and copy button.
- Contact page: added a Leaflet map with a marker, "How far am I?" geolocation distance, and a directions link.
- About page: added a six-photo gallery with a lightbox (buttons, keyboard, swipe).
- Donate page: the toggle, amount buttons and form now work (they were static in Part 2) and the form is validated.
- Home page: animated counters; the second statistic ("2014") was replaced by a live "animals waiting" count read from the data file.
- Added scroll-reveal animations, a back-to-top button and `prefers-reduced-motion` support.
- Added a "Ways to help" section linking to the adopt, volunteer and sponsor enquiry tabs.

**SEO**
- Rewrote every `<head>`: unique titles and descriptions, meta keywords, canonical URL, robots, theme colour, Open Graph and Twitter tags.
- Added JSON-LD structured data (`AnimalShelter`, `FAQPage`, `BreadcrumbList`).
- Added `robots.txt`, `sitemap.xml`, `favicon.svg`, a 1200×630 social share image and a `404.html`.
- Renamed images descriptively (e.g. `OIP.webp` → `golden-retriever-puppies-at-shelter.webp`) and moved the photos that existed locally from hot-linked Unsplash URLs to local files, which is faster and no longer breaks offline.
- Added internal links in body copy across all pages and added "Enquire" to the main navigation and footer.
- Footer column headings changed from `<h4>` to styled paragraphs so the page heading hierarchy has no skipped levels; the Adopt page gained a hidden `<h2>` before the animal list.

**Fixes found while testing**
- **Wrong photos:** Miso (a grey tabby) was showing a ginger cat and Simba (a large ginger cat) was showing a tabby; the photos were swapped. Storm's description was also changed to match his photo (a grey cat). Alt text for every animal now describes the actual photo, and the About hero alt text was corrected.
- The checkbox and radio buttons inherited the text-input styling (44px tall, full width); they now have their own styles.
- The sticky header could cover a field that was scrolled into view; added `scroll-padding-top`.
- Error messages cleared only on blur, which shifted the layout between mouse-down and mouse-up and made the next click miss. Flagged fields now re-validate on every keystroke.
- Clicking an in-page tab link such as `enquiry.html#volunteer` while already on the page did not switch tabs; tabs now listen for `hashchange`.
- Map placeholder text and two other text colours were adjusted to meet WCAG AA contrast.
- Added a global `[hidden]` rule so `hidden` always wins over `display` rules.

**Security and performance**
- Added `_headers` with a Content-Security-Policy and other security headers, a honeypot field on all forms and safe DOM-building (no `innerHTML`) for visitor text.
- Self-hosted Leaflet (no CDN dependency) and load it only on the contact page.

### Part 2 — Fixes after lecturer feedback

Feedback received on CSS styling for desktop and on responsive design. Each rubric criterion and how it was addressed:

| Criterion | What was wrong | What changed |
|---|---|---|
| CSS – default style code | Basic font, size and colour styles not applied consistently | Defaults for `body`, headings, `p`, links (all states), lists, form controls, `:focus-visible`, `::selection` and `hr`; every inline `style=""` removed from all five pages and replaced with classes |
| CSS – typography | Families, sizes, weights and line heights inconsistent | One heading font and one body font with fallback stacks; tokens for size (`--fs-*`), weight (`--fw-*`) and line height (`--lh-*`); sizes defined for h1–h6 |
| CSS – layout structure | Alignment and spacing problems | Nav now sits inside the same 1140px container as the content; cards stretch to equal height with buttons pinned to the bottom; footer links made identical on every page; doubled section padding removed; contact CTA band fixed; band aligned with content edges |
| CSS – decoration and colour | Colours not applied consistently | Palette changed to the Part 1 proposal colours (#F2994A orange, #4F5D75 blue-grey); white-on-orange text (fails WCAG contrast) replaced with dark-on-orange; muted text darkened to pass 4.5:1 |
| CSS – pseudo-classes | Used incorrectly or insufficiently | Fixed a bug where `.nav-links a:hover` overrode the Donate button (text vanished on hover) using `:not(.btn)`. Added `:hover`, `:focus-visible`, `:active`, `:visited`, `:disabled`, `:checked` (mobile menu), `:user-invalid`, `:focus-within`, `:has()`, `:not()`, `:first-child`, `:last-child`, and `::before`/`::after` pseudo-elements (timeline dots, hamburger icon, required-field asterisk) |
| Responsive – media queries | Breakpoints incomplete | Breakpoints at 1024px, 768px and 480px, plus `hover: none` and `prefers-reduced-motion` queries |
| Responsive – layout | No layout adjustments | 3-col → 2-col → 1-col grids; 2-col → 1-col at tablet; hero, contact, donate and footer stack; button rows and donate amounts reflow |
| Responsive – typography | No typography adjustments | Type scale, line heights and spacing tokens are overridden at each breakpoint |
| Responsive – navigation menu | No navigation adjustments | CSS-only hamburger menu (checkbox + `:checked`, no JavaScript) at ≤768px with 44px tap targets, plus a skip-to-content link |
| Responsive – images | No image adjustments | `srcset`/`sizes` so each device downloads a suitable size, `width`/`height` attributes to prevent layout shift, `loading="lazy"`, fixed aspect ratio with `object-fit: cover`, and shorter hero images on smaller screens |

Also fixed: `&` in page titles/meta descriptions now `&amp;`.

### Part 2 — CSS styling, responsive design, and HTML fixes

**CSS styling**

- Created external stylesheet `css/style.css` and linked it from all five
  HTML pages.
- Added a CSS reset (box-sizing, margin/padding, list-style, image scaling)
  for consistent rendering across browsers.
- Defined a design-token layer using CSS custom properties (`:root`) for
  colour palette, typography scale, spacing scale and shared shadows/radius,
  so the cascade can be relied on with a minimum number of selectors.
- Applied base typography: Quicksand for headings, Lato for body text, a
  relative (rem-based) type scale, and consistent `line-height`/
  `letter-spacing`.
- Built the desktop layout using CSS Grid for page sections (`.grid`,
  `.grid-2`, `.grid-3`, `.footer-grid`, `.contact-grid`) and Flexbox for
  one-dimensional groups (`.nav`, `.hero-actions`, `.donate-options`).
- Styled visual components: navigation, buttons, hero, cards, timeline,
  forms, donate toggle/amount buttons, tags, and footer, using `color`,
  `background-color`, `border`, `border-radius` and `box-shadow`.
- Added interactive states with `:hover`, `:focus-visible` and `:active`
  pseudo-classes on links, buttons, donation-amount buttons and form fields.

**Responsive design**

- Breakpoints at `768px` (tablet) and `480px` (mobile) using media queries.
- Relative units (`rem`, `%`, `fr`) throughout instead of fixed pixel
  values for type, spacing and grid tracks.
- Grids collapse from 3 → 2 → 1 columns as the viewport narrows; the hero
  and contact layouts stack on smaller screens; the nav switches to a
  stacked, wrapping layout on tablet.
- Type scale (`--fs-2xl`, `--fs-xl`) and spacing scale (`--space-xl`,
  `--space-lg`) shrink at each breakpoint.
- Images set to `max-width: 100%` / `height: auto` so they scale within
  their containers at every breakpoint.
- Tested layout using browser DevTools' responsive/device toolbar across
  desktop, tablet and mobile widths.

**HTML structural fixes**

The previous export of this project had broken markup on every page
(missing header/nav opening tags, an empty logo link, unclosed anchor
tags around the "Enquire to adopt" buttons, a missing image on the Coco
card, and missing closing tags for the footer/body/html at the end of
every file). `index.html` in particular was cut off partway through the
homepage. These were corrected on all five pages:

- Rebuilt `index.html` in full (hero, impact stats, featured animals,
  testimonial, call-to-action, footer) — it previously ended mid-page.
- Restored the site logo/brand text ("Paws & Care") in the header and
  footer on every page.
- Closed the `<a>` tags around each "Enquire to adopt" button on
  `adopt.html` and added the missing photo for the Coco listing.
- Closed the remaining `</div>`, `</footer>`, `</body>` and `</html>`
  tags that were missing from the end of every page.
- Renamed all HTML files to lowercase and matched every internal `href`
  to the real filename, since three of the five files were previously
  capitalised (`Index.html`, `About.html`, `Donate.html`) while every
  link pointed to the lowercase version — this works on Windows but
  breaks navigation on case-sensitive hosts like GitHub Pages.
- Replaced two footer links that pointed at a `get-involved.html` page
  that doesn't exist in this project with links to `donate.html` and
  `contact.html`.

### Part 1 — Feedback edits

> _List the specific corrections made in response to your lecturer's Part 1
> feedback here, with enough detail for them to see exactly what changed
> (e.g. "Added missing `alt` text to adoption images", "Fixed heading
> hierarchy on the About page"). Copy the feedback comments/rubric items
> you received and note how each was addressed._

-
-
-

## References

- Mozilla Developer Network (MDN). n.d. *CSS: Cascading Style Sheets*.
  Available at: https://developer.mozilla.org/en-US/docs/Web/CSS
  [Accessed: 16 September 2026].
- Mozilla Developer Network (MDN). n.d. *CSS Grid Layout*.
  Available at: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout
  [Accessed: 16 September 2026].
- Mozilla Developer Network (MDN). n.d. *CSS Flexible Box Layout*.
  Available at: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout
  [Accessed: 16 September 2026].
- Mozilla Developer Network (MDN). n.d. *Using media queries*.
  Available at: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries
  [Accessed: 16 September 2026].
- Google Fonts. n.d. *Quicksand* and *Lato*. Available at:
  https://fonts.google.com [Accessed: 16 September 2026].
- Unsplash. n.d. Stock photography used for animal images on the Home
  and Adopt pages. Available at: https://unsplash.com
  [Accessed: 16 September 2026].
- Mozilla Developer Network (MDN). n.d. *The Dialog element*. Available at:
  https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
  [Accessed: 29 October 2026].
- Mozilla Developer Network (MDN). n.d. *Constraint validation*. Available at:
  https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation
  [Accessed: 29 October 2026].
- Mozilla Developer Network (MDN). n.d. *Fetch API*. Available at:
  https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
  [Accessed: 29 October 2026].
- Mozilla Developer Network (MDN). n.d. *Intersection Observer API*. Available at:
  https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
  [Accessed: 29 October 2026].
- Mozilla Developer Network (MDN). n.d. *Geolocation API*. Available at:
  https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
  [Accessed: 29 October 2026].
- W3C. n.d. *WAI-ARIA Authoring Practices Guide: Tabs and Accordion patterns*.
  Available at: https://www.w3.org/WAI/ARIA/apg/patterns/ [Accessed: 29 October 2026].
- Leaflet. 2023. *Leaflet 1.9.4* (BSD-2-Clause). Available at: https://leafletjs.com
  [Accessed: 29 October 2026].
- OpenStreetMap contributors. n.d. *OpenStreetMap map tiles and data*. Available at:
  https://www.openstreetmap.org/copyright [Accessed: 29 October 2026].
- Schema.org. n.d. *AnimalShelter*. Available at: https://schema.org/AnimalShelter
  [Accessed: 29 October 2026].
- Google Search Central. n.d. *Introduction to structured data*. Available at:
  https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
  [Accessed: 29 October 2026].
- JSONPlaceholder. n.d. *Free fake REST API for testing*. Available at:
  https://jsonplaceholder.typicode.com [Accessed: 29 October 2026].
- Deque Systems. n.d. *axe-core accessibility engine*. Available at:
  https://github.com/dequelabs/axe-core [Accessed: 29 October 2026].

> **Image credits:** the cat and dog photos are from Unsplash (see above).
> The source of `golden-retriever-puppies-at-shelter.webp` was not recorded;
> replace it with a photo whose source you can cite before submitting.
