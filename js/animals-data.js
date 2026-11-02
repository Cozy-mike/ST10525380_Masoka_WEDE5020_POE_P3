/* =========================================================
   animals-data.js
   Sample data for the fictional Paws & Care shelter.
   Shared by the home page (live count), the adopt page
   (listing, search, filter, sort, modal) and the enquiry
   page (animal drop-down and availability response).

   To add an animal: copy one object, give it a unique `id`,
   and drop its photo into /images using a descriptive name.
   ========================================================= */
window.PAWS_CONFIG = {
    // Where the enquiry form is POSTed with fetch() (AJAX).
    // jsonplaceholder is a free public MOCK API used for testing:
    // it echoes the data back and stores nothing. Swap this for a
    // Formspree / Netlify Forms / your own endpoint before going live.
    formEndpoint: 'https://jsonplaceholder.typicode.com/posts',
    // The contact form compiles an email addressed to this recipient.
    contactEmail: 'hello@pawsandcare.org.za',
    shelter: {
        name: 'Paws & Care Animal Shelter',
        lat: -25.7447,
        lng: 28.3083,
        address: '142 Rescue Road, Silverton, Pretoria, 0184',
        phone: '012 345 6789',
        hours: 'Tue–Sun, 9:00–16:00 (closed Mondays)'
    }
};

/* Weekly volunteer capacity (free places per shift) used by the
   enquiry page to answer availability questions. */
window.PAWS_VOLUNTEER_SLOTS = {
    tuesday:   { morning: 4, afternoon: 2 },
    wednesday: { morning: 3, afternoon: 0 },
    thursday:  { morning: 5, afternoon: 3 },
    friday:    { morning: 2, afternoon: 4 },
    saturday:  { morning: 6, afternoon: 6 },
    sunday:    { morning: 1, afternoon: 0 }
};

/* Monthly sponsorship tiers (ZAR) used by the enquiry page. */
window.PAWS_SPONSOR_TIERS = {
    food:    { label: 'Food sponsor',    monthly: 150, covers: 'a week of food for one animal, every month' },
    kennel:  { label: 'Kennel sponsor',  monthly: 450, covers: 'bedding, cleaning and upkeep of one kennel' },
    vet:     { label: 'Vet-care sponsor', monthly: 900, covers: 'vaccinations and treatment for animals in our care' }
};

window.PAWS_ANIMALS = [
    {
        id: 'buddy', name: 'Buddy', type: 'dog', size: 'medium', ageGroup: 'young',
        ageYears: 2, ageLabel: '2 yrs', status: 'available', fee: 850, arrived: '2026-09-14',
        summary: 'Found tied up outside our gate as a stray. Now he greets every visitor with a full-body wag and loves a good game of fetch.',
        story: 'Buddy arrived underweight and wary of raised hands. After six weeks of steady food, patience and play he is a confident, affectionate young dog who is still learning his house manners.',
        traits: ['Good with children', 'Loves fetch', 'Still learning to walk on a lead'],
        image: { src: 'images/buddy-golden-puppy-with-flower.avif', width: 500, height: 802, focus: 'center 62%' },
        alt: 'Buddy, a golden-coloured young dog, sitting on paving with a flower in his mouth'
    },
    {
        id: 'miso', name: 'Miso', type: 'cat', size: 'small', ageGroup: 'young',
        ageYears: 1, ageLabel: '1 yr', status: 'available', fee: 650, arrived: '2026-10-02',
        summary: 'Rescued from a storm drain as a kitten. Loves warm laps, sunny windowsills, and will talk your ear off about both.',
        story: 'Miso was pulled from a storm drain at six weeks old and hand-reared by our volunteers. She is a chatty, curious grey tabby who follows people from room to room.',
        traits: ['Lap cat', 'Very chatty', 'Gets on with other cats'],
        image: { src: 'images/miso-grey-tabby-cat-on-sofa.avif', width: 500, height: 333, focus: 'center 40%' },
        alt: 'Miso, a small grey tabby cat, lying on a grey sofa'
    },
    {
        id: 'duke', name: 'Duke', type: 'dog', size: 'large', ageGroup: 'adult',
        ageYears: 4, ageLabel: '4 yrs', status: 'available', fee: 850, arrived: '2026-08-21',
        summary: 'A gentle giant, surrendered when his family emigrated. Great with kids, even better at convincing you he needs a third walk.',
        story: 'Duke was surrendered when his family emigrated. He is calm indoors, strong on the lead and happiest with a big garden and a family who enjoys long walks.',
        traits: ['Great with children', 'Needs a garden', 'Loves long walks'],
        image: { src: 'https://images.unsplash.com/photo-1517849845537-4d257902861a?auto=format&fit=crop&w=800&h=600&q=80', width: 800, height: 600, focus: 'center' },
        alt: 'Duke, a large tan dog, standing in tall grass'
    },
    {
        id: 'storm', name: 'Storm', type: 'cat', size: 'medium', ageGroup: 'adult',
        ageYears: 5, ageLabel: '5 yrs', status: 'available', fee: 650, arrived: '2026-07-30',
        summary: 'Quiet, independent, and choosy about affection, but once he picks you, he follows you from room to room like a shadow.',
        story: 'Storm is a grey Scottish Fold who keeps his own counsel. He does best in a calm home where he can choose when to be sociable and, in time, becomes a devoted shadow.',
        traits: ['Independent', 'Prefers a quiet home', 'Choosy cuddler'],
        image: { src: 'images/storm-grey-cat-wearing-sunglasses.avif', width: 500, height: 667, focus: 'center 35%' },
        alt: 'Storm, a grey Scottish Fold cat, wearing round sunglasses'
    },
    {
        id: 'coco', name: 'Coco', type: 'dog', size: 'medium', ageGroup: 'adult',
        ageYears: 6, ageLabel: '6 yrs', status: 'reserved', fee: 850, arrived: '2026-06-18',
        summary: 'Calm and house-trained, Coco just wants a quiet couch and a person to be loyal to. Good with other dogs, too.',
        story: 'Coco is a settled, house-trained dog who is happiest on a couch beside her person. She gets on well with other dogs and has a reservation pending a home check.',
        traits: ['House-trained', 'Good with other dogs', 'Calm indoors'],
        image: { src: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&h=600&q=80', width: 800, height: 600, focus: 'center' },
        alt: 'Coco, a medium-sized dog, resting calmly indoors'
    },
    {
        id: 'simba', name: 'Simba', type: 'cat', size: 'large', ageGroup: 'senior',
        ageYears: 7, ageLabel: '7 yrs', status: 'available', fee: 650, arrived: '2026-05-09',
        summary: "A senior who's earned his sunbeams. Simba is easygoing, litter-trained, and mostly interested in naps and headbutts.",
        story: 'Simba is a big, easygoing ginger senior. He is litter-trained, good with gentle children and asks for very little: a warm spot, regular meals and the occasional head scratch.',
        traits: ['Litter-trained', 'Easygoing', 'Fine with gentle children'],
        image: { src: 'images/simba-ginger-cat-on-wooden-table.avif', width: 500, height: 700, focus: 'center 30%' },
        alt: 'Simba, a large ginger cat, lying on a wooden table and looking up'
    }
];
