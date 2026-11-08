export const LINKS = {
  join: 'https://forms.gle/h4X3TSpWirGVixGW6',
  email: 'connectwithsahara@study.iitm.ac.in',
  instagram: 'https://www.instagram.com/sahara_iitmbs/',
  linkedin: 'https://www.linkedin.com/company/sahara-the-social-welfare-society/',
  youtube: 'https://www.youtube.com/@saharaiitm',
  github: 'https://github.com/sahara-society/Sahara',
}

export const NAV = [
  { id: 'about', label: 'About' },
  { id: 'events', label: 'Events' },
  { id: 'team', label: 'Team' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'contact', label: 'Contact' },
]

export const GOALS = [
  {
    title: 'Impacting real lives',
    body: 'A real difference in the world, not just the virtual one. We plan, reach and act for people in need, however big or small the change.',
  },
  {
    title: 'Spreading awareness',
    body: 'Knowledge drives change. We start conversations on pressing social issues and celebrate the extraordinary work of social activists.',
  },
  {
    title: 'Hands-on welfare',
    body: 'We help IITM BS students step out of the screen and volunteer offline with established NGOs, learning life skills by empowering others.',
  },
  {
    title: 'Bridging the gap',
    body: 'A bridge between students who want to give and the people and changemakers who need them, from Peepal Farm to the Robin Hood Army.',
  },
]

export const STATS = [
  { value: 180, suffix: '+', label: 'watched our orientation live on YouTube' },
  { value: 100, suffix: '+', label: 'joined the founding orientation session' },
  { value: 30, suffix: '+', label: 'students volunteered with Animal Aid Unlimited' },
  { value: 3500, prefix: '₹', label: 'of stationery gifted to children in Indore' },
]

export type EventItem = {
  title: string
  date: string
  place: string
  kind: string
  img?: string
  summary: string
  detail: string[]
  partners?: string[]
  galleryUrl?: string
}

export const EVENTS: EventItem[] = [

  {
    title: 'The Beginning',
    date: '24 Jul 2023',
    place: 'Online',
    kind: 'Orientation',
    summary:
      'SAHARA was inaugurated with an orientation: about 100 people live and 180+ more on YouTube. Many became our first permanent members.',
    detail: [
      'We set out our goals and how the society would work, and held a discussion and doubt-clearing session with interested members.',
    ]
  },
  {
    title: 'Poster Making Competition',
    date: '1–31 Aug 2023',
    place: 'Online',
    kind: 'Competition · with Diplomacia',
    summary:
      'Art on burning social issues. The posters showed hidden talent across our student community, and the winners were awarded certificates.',
    detail: [
      'Run with the Diplomacia society, in line with our goal of solution-focused competitions on critical issues.',
      'Entries combined art with sharp social commentary, and the winners received certificates and appreciation.',
    ]
  },
  {
    title: 'RAKSHAK',
    date: '14 Aug 2023',
    place: 'Online',
    kind: 'Guest session · with Kavach club',
    summary:
      'Our first event: a conversation with Major Sidram Solankar, ex-Army and NSG commando, on the life of a true patriot.',
    detail: [
      'Run with the Kavach club of Bandipur house. Major Sidram Solankar answered everything, from technical questions on the Indian military and the NSG to questions about life.',
    ]
  },
  {
    title: 'A Day in Animal Aid Unlimited',
    date: '1–2 Oct 2023',
    place: 'Udaipur, Rajasthan',
    kind: 'Offline activity · with AAU',
    summary:
      'Our first offline activity: 30+ students volunteering with one of India’s best-known animal rescues, in the City of Lakes.',
    detail: [
      'With 30+ students we volunteered at Animal Aid Unlimited, learning compassionate handling from its team and meeting rescued animals.',
      'Watching paralysed and disabled animals find joy again was the moment everyone remembers. We donated, bought their merchandise and explored Udaipur, from Lake Pichola to Karni Mata Temple.',
    ],
    partners: ['Animal Aid Unlimited', 'Boundless', 'Synapse'],
    galleryUrl: 'https://photos.app.goo.gl/7GPP2YZeiCj56ghVA'
  },
  {
    title: 'Guest session: Robin Singh',
    date: '16 Oct 2023',
    place: 'Online',
    kind: 'Guest session · Peepal Farm',
    img: '/img/g/goal-4.webp',
    summary:
      'A computer scientist turned social worker, the founder of Peepal Farm answered our questions on animal welfare and minimum-suffering living.',
    detail: [
      'Robin Singh, a computer scientist and entrepreneur turned social worker, built one of India’s best-known animal welfare communities.',
      'He took our doubts on animal welfare and gave practical, lived advice drawn from his minimum-suffering way of life.',
    ]
  },
  {
    title: 'Huge Smiles, Little Hearts',
    date: '21–22 Nov 2023',
    place: 'Indore, Madhya Pradesh',
    kind: 'Offline activity · with Robin Hood Army',
    img: '/img/g/goal-3.webp',
    summary:
      'A painting competition for 30 children at Kali Basti, Bhavarkua, with stationery, food and sweets funded by our own community.',
    detail: [
      'Our second offline activity, with the Robin Hood Army: a youth-run organisation uplifting underprivileged children in India’s cleanest city.',
      'Donations from the IITM BS community bought stationery worth nearly ₹3,500 for 30 children, plus their first ever painting competition, chocolates and food packets.',
      'Our volunteers, especially the women on the trip, held sessions on good touch and bad touch and on menstruation, and gave career advice.',
    ],
    partners: ['Robin Hood Army', 'Boundless', 'Synapse'],
    galleryUrl: 'https://photos.app.goo.gl/vqKPzd4GFJkNEQP46'
  },
]

export type Person = { name: string; role: string; img?: string; quote?: string }

export const LEADERSHIP_2026: Person[] = [
  { name: 'Aditya Raj', role: 'Secretary, 2026' },
  { name: 'Aditya Kumar', role: 'Web Admin, SAHARA WebOps' },
]

export const TEAM: Person[] = [
  {
    name: 'Ritik Raghuwanshi',
    role: 'Founder & Secretary',
    img: '/img/team/ritik.webp',
    quote:
      'SAHARA is a platform for those who want to make efforts for themselves and for the unfortunate. Together we are creating an impact that matters.',
  },
  {
    name: 'Shubhansh Varshney',
    role: 'Founder & Deputy Secretary',
    img: '/img/team/shubhansh.webp',
    quote:
      'We aim to foster gratefulness and togetherness among our BS friends by helping those in need, and by being the voice of the unheard. Together we can, together we will.',
  },
  {
    name: 'Parampreet Singh',
    role: 'Web Administrator',
    img: '/img/team/parampreet.webp',
    quote:
      'Giving back is one of the three pillars of Sikhism, “Vand Chako”. SAHARA gave me a way to help others while upskilling myself.',
  },
  {
    name: 'Aayushi Sharma',
    role: 'Content Head',
    img: '/img/team/aayushi.webp',
    quote: 'A place where I can work for humans, for the sake of humanity, being humane.',
  },
  {
    name: 'Omprakash Meena',
    role: 'Social Media Manager',
    img: '/img/team/omprakash.webp',
    quote: 'SAHARA is the right place where I met like-minded personalities. Working here gives me inner pleasure.',
  },
  {
    name: 'Rishita Sen',
    role: 'Management Head',
    img: '/img/team/rishita.webp',
    quote:
      'SAHARA works for a cause I care about. It lets me learn new skills, meet new people and contribute to social change.',
  },
  {
    name: 'Ayush Khade',
    role: 'Advisor',
    img: '/img/team/ayush.webp',
    quote: 'Investing time into social welfare leads to mental peace and a better persona. Together, we’ll crack it!',
  },
  {
    name: 'Krishnan Lakshmi Narayana',
    role: 'Advisor',
    img: '/img/team/krishnan.webp',
    quote: 'SAHARA is a medium through which people of IITM BS can serve society and make a positive impact.',
  },
  {
    name: 'Dhanush',
    role: 'Core Member',
    img: '/img/team/dhanush.webp',
    quote: 'The heartbeat of social change at IITM BS. We stand united for collective impact and uncommon kindness.',
  },
  {
    name: 'Devottam Vaishnav',
    role: 'Core Member',
    img: '/img/team/devottam.webp',
    quote: 'A catalyst for social change, and a platform to contribute my skills to society.',
  },
  { name: 'Ankit Prajapati', role: 'Core Member', img: '/img/team/ankit.webp' },
  { name: 'Akash', role: 'Core Member', img: '/img/team/akash.webp' },
]

export const GALLERY = [
  { src: '/img/g/goal-3.webp', caption: 'Painting with the children of Kali Basti, Indore' },
  { src: '/img/g/goal-4.webp', caption: 'Q&A with Robin Singh of Peepal Farm' },
  { src: '/img/g/goal-2.webp', caption: 'Moments from @sahara_iitmbs' },
  { src: '/img/g/y.webp', caption: 'Our community, live with Robin Singh' },
]

export const ALBUMS = [
  { title: 'Udaipur · Animal Aid Unlimited', url: 'https://photos.app.goo.gl/7GPP2YZeiCj56ghVA' },
  { title: 'Indore · Robin Hood Army', url: 'https://photos.app.goo.gl/vqKPzd4GFJkNEQP46' },
]

export const TESTIMONIALS = [
  {
    quote: 'Never saw such care for animals anywhere. I got inspired to do something similar in my life.',
    name: 'Shubhansh Varshney',
    trip: 'Udaipur · AAU',
  },
  {
    quote: 'The few hours I spent here made me realise that a little love and care is enough to turn around someone’s life.',
    name: 'Kavisha Parikh',
    trip: 'Udaipur · AAU',
  },
  {
    quote: 'Making new friends and connecting with the local kids made it extra special.',
    name: 'Samridhhi Kashyap',
    trip: 'Indore · RHA',
  },
  {
    quote: 'An unforgettable experience that left a lasting impact on my heart and soul.',
    name: 'Krina Patel',
    trip: 'Udaipur · AAU',
  },
]

export const FAQ = [
  {
    q: 'Who can join SAHARA?',
    a: 'Any student of the IIT Madras BS Degree programme. Fill in the Join Us form and we’ll reach out about volunteering, events and core team roles.',
  },
  {
    q: 'Do offline activities cost a lot?',
    a: 'We keep every trip as affordable as possible, plan the itinerary end to end, and pair the volunteering with exploring the partner city.',
  },
  {
    q: 'Can my NGO or organisation collaborate with you?',
    a: 'Yes. Use the contact form, pick “Collaboration” or “Sponsorship”, and tell us what you have in mind.',
  },
  {
    q: 'I’m not a student. Can I still help?',
    a: 'Social activists, professionals, influencers and organisations can all reach us: for guest sessions, event ideas, sponsorship or feedback.',
  },
]

export const IDENTITIES = ['Student', 'Individual', 'Professional', 'Influencer', 'Organization', 'Social Activist']
export const PURPOSES = [
  'Volunteer',
  'Join Core Team',
  'Event Suggestion',
  'Collaboration',
  'Sponsorship',
  'Social Activity Participation',
  'Feedback',
  'Other',
]
