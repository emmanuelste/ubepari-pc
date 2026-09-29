import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Instagram,
  MapPin,
  Minus,
  MessageCircle,
  MoonStar,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  SunMedium,
  X,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './style.css';

const money = new Intl.NumberFormat('en-US');
const formatMoney = (amount) => `TSh ${money.format(amount)}`;
const ubepariWhatsAppNumber = '255620536374';
const brandLogos = {
  'Apple Mac': { src: 'https://cdn.simpleicons.org/apple/FFFFFF', alt: 'Apple logo' },
  'HP Premium': { src: 'https://cdn.simpleicons.org/hp/0096D6', alt: 'HP logo' },
  'Dell Studio': { src: 'https://cdn.simpleicons.org/dell/007DB8', alt: 'Dell logo' },
  Lenovo: { src: 'https://cdn.simpleicons.org/lenovo/E2231A', alt: 'Lenovo logo' },
  'ASUS ROG': { src: 'https://cdn.simpleicons.org/asus/FFFFFF', alt: 'ASUS logo' },
};
const getProductImage = (product) => product.image?.startsWith('http')
  ? product.image
  : `https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=1200&q=85`;
const getProductSpecs = (product) => (product.details || '').split(/\s*[·•]\s*/).filter(Boolean);
const getWhatsAppUrl = (message) => `https://wa.me/${ubepariWhatsAppNumber}?text=${encodeURIComponent(message)}`;
const instagramUrl = 'https://www.instagram.com/ubepari_pc/';
const googleReviewUrl = 'https://www.google.com/maps/search/?api=1&query=Ubepari+PC+Magomeni+Mapipa';
const profileStorageKey = 'ubepari-checkout-profile';
const tanzaniaRegions = [
  'Arusha', 'Dar es Salaam', 'Dodoma', 'Geita', 'Iringa', 'Kagera', 'Katavi', 'Kigoma',
  'Kilimanjaro', 'Lindi', 'Manyara', 'Mara', 'Mbeya', 'Morogoro', 'Mtwara', 'Mwanza',
  'Njombe', 'Pemba North', 'Pemba South', 'Pwani', 'Rukwa', 'Ruvuma', 'Shinyanga',
  'Simiyu', 'Singida', 'Songwe', 'Tabora', 'Tanga', 'Unguja North', 'Unguja South',
  'Zanzibar West',
];

function DeliveryMap({ onSelect, selectedPoint }) {
  const mapElementRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!mapElementRef.current) return undefined;
    const start = selectedPoint || { lat: -6.7924, lng: 39.2083 };
    const map = L.map(mapElementRef.current, { scrollWheelZoom: false }).setView([start.lat, start.lng], selectedPoint ? 15 : 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    let marker = selectedPoint
      ? L.circleMarker([selectedPoint.lat, selectedPoint.lng], { radius: 9, color: '#fff', weight: 3, fillColor: '#007aff', fillOpacity: 1 }).addTo(map)
      : null;

    map.on('click', ({ latlng }) => {
      const point = { lat: Number(latlng.lat.toFixed(6)), lng: Number(latlng.lng.toFixed(6)) };
      if (marker) marker.setLatLng(latlng);
      else marker = L.circleMarker(latlng, { radius: 9, color: '#fff', weight: 3, fillColor: '#007aff', fillOpacity: 1 }).addTo(map);
      onSelectRef.current(point);
    });

    const resizeTimer = window.setTimeout(() => map.invalidateSize(), 0);
    return () => {
      window.clearTimeout(resizeTimer);
      map.remove();
    };
  }, []);

  return <div className="delivery-map" ref={mapElementRef} aria-label="Select your delivery location on the map" />;
}

const aboutFeatures = [
  {
    eyebrow: 'Come see us',
    title: 'Find Ubepari PC in Magomeni.',
    description: 'Visit our Mapipa showroom in Dar es Salaam and talk with our team in person.',
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1400&q=85',
    imageAlt: 'City street at dusk',
    action: 'Get directions',
    href: 'https://www.google.com/maps/search/?api=1&query=Ubepari+PC+Magomeni+Mapipa',
    external: true,
  },
  {
    eyebrow: 'Current offers',
    title: 'Ask us what’s available.',
    description: 'Chat with Ubepari PC about current offers, product availability, and listed prices.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=85',
    imageAlt: 'Laptop displaying a business analytics dashboard',
    action: 'Ask about offers',
    href: getWhatsAppUrl('Hi Ubepari PC, what offers and computer options are currently available?'),
    external: true,
  },
  {
    eyebrow: 'Shop with confidence',
    title: 'Trusted computer hardware.',
    description: 'Explore clear specifications, product details, and listed pricing across our computer range.',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1400&q=85',
    imageAlt: 'Laptop ready for work',
    action: 'Browse computers',
    href: '/store',
  },
  {
    eyebrow: 'Here to help',
    title: 'Local support that stays close.',
    description: 'Get help choosing a computer, setup guidance, and friendly local after-sales support.',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85',
    imageAlt: 'Support team working together',
    action: 'Chat with our team',
    href: getWhatsAppUrl('Hi Ubepari PC, I would like help choosing or setting up a computer.'),
    external: true,
  },
];

const initialProducts = [
  { id: 'macbook-pro-m4', name: 'MacBook Pro 14" M4', brand: 'Apple Mac', category: 'workstation', type: 'workstation', monthly: 450000, price: 5400000, tag: 'Flagship Silicon', accent: 'blue', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80', details: '10-Core CPU • 10-Core GPU • 16GB Unified RAM • 14.2" Liquid Retina XDR' },
  { id: 'macbook-air-m3', name: 'MacBook Air 13" M3', brand: 'Apple Mac', category: 'everyday', type: 'everyday', monthly: 310000, price: 3700000, tag: 'Ultralight', accent: 'violet', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80', details: '8-Core CPU • 10-Core GPU • 16GB Unified RAM • 18h battery' },
  { id: 'hp-spectre-x360', name: 'HP Spectre x360 14', brand: 'HP Premium', category: 'everyday', type: 'everyday', monthly: 340000, price: 4100000, tag: '2-in-1 Touch OLED', accent: 'blue', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80', details: 'Intel Core Ultra 7 • 16GB DDR5 • 1TB SSD NVMe • OLED touch' },
  { id: 'hp-omen-16', name: 'HP Omen 16 Gaming', brand: 'HP Gaming', category: 'gaming', type: 'gaming', monthly: 330000, price: 3950000, tag: 'Omen Tempest Cooling', accent: 'orange', image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80', details: 'Ryzen 7 • RTX 4060 • 32GB RAM • 16.1" QHD 165Hz' },
  { id: 'dell-xps-15', name: 'Dell XPS 15 OLED', brand: 'Dell Studio', category: 'workstation', type: 'workstation', monthly: 400000, price: 4800000, tag: 'InfinityEdge Studio', accent: 'cyan', image: 'https://images.unsplash.com/photo-1593642634367-d91a135587b5?auto=format&fit=crop&w=1200&q=80', details: 'Core i7 • RTX 4060 • 32GB RAM • 3.5K OLED touch' },
  { id: 'alienware-m16', name: 'Alienware m16 R2', brand: 'Dell Alienware', category: 'gaming', type: 'gaming', monthly: 420000, price: 5100000, tag: 'Cryo-tech Vapor', accent: 'purple', image: 'https://images.unsplash.com/photo-1593642634443-44adaa06623a?auto=format&fit=crop&w=1200&q=80', details: 'Core Ultra 9 • RTX 4070 • 32GB RAM • 16" QHD+ 240Hz' },
  { id: 'legion-pro-5', name: 'Lenovo Legion Pro 5', brand: 'Lenovo', category: 'gaming', type: 'gaming', monthly: 370000, price: 4450000, tag: 'Coldfront 5.0 Thermal', accent: 'red', image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1200&q=80', details: 'AMD Ryzen 7 • RTX 4070 • 32GB RAM • 16" WQXGA 240Hz' },
  { id: 'thinkpad-x1', name: 'ThinkPad X1 Carbon Gen 12', brand: 'Lenovo', category: 'workstation', type: 'workstation', monthly: 390000, price: 4680000, tag: 'Carbon Fiber MIL-STD', accent: 'lavender', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80', details: 'Core Ultra 7 • 32GB RAM • 1TB SSD • 14" 2.8K OLED' },
  { id: 'rog-strix-g16', name: 'ROG Strix G16', brand: 'ASUS ROG', category: 'gaming', type: 'gaming', monthly: 350000, price: 4200000, tag: 'Liquid Metal', accent: 'amber', image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80', details: 'Core i9 • RTX 4070 • 32GB DDR5 • QHD 240Hz' },
  { id: 'zenbook-pro-duo', name: 'Zenbook Pro 14 Duo OLED', brand: 'ASUS ProArt', category: 'workstation', type: 'workstation', monthly: 410000, price: 4950000, tag: 'Dual Screen OLED', accent: 'sky', image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1200&q=80', details: 'Core i9 • RTX 4060 • 32GB RAM • Dual OLED touchscreens' },
];

const heroSlides = [
  {
    label: 'Welcome to Ubepari PC',
    eyebrow: 'Your local computer store in Dar es Salaam',
    title: 'Your next computer starts here.',
    subtitle: 'Shop laptops, desktops and accessories for work, study, gaming and creativity.',
    note: 'Visit our Magomeni Mapipa showroom or chat with our team.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=80',
    video: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/9/98/BurstCube_Completes_an_Open-Sky_Test_%28SVS14490_-_Open_Air_test_4k%29.webm/BurstCube_Completes_an_Open-Sky_Test_%28SVS14490_-_Open_Air_test_4k%29.webm.480p.vp9.webm',
  },
  {
    label: 'Computers for every day',
    eyebrow: 'Friendly, knowledgeable local support',
    title: 'Find the right setup.',
    subtitle: 'Explore trusted computers and get help choosing the right fit for your needs.',
    note: 'Browse the range online or visit Ubepari PC in Magomeni Mapipa.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
  },
  {
    label: 'Work, create and play',
    eyebrow: 'Laptops • desktops • gaming PCs • accessories',
    title: 'Power for what’s next.',
    subtitle: 'Discover computers for productivity, creative projects and gaming at Ubepari PC.',
    note: 'Follow us on Instagram for Ubepari PC news and updates.',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1600&q=80',
  },
];

const communityEvents = [
  {
    type: 'Ubepari Keynote',
    detail: 'Annual Silicon Briefing · 1h 14m',
    title: "Silicon & The Future of Tanzanian Creative Workflows",
    description: "Ubepari's hardware team explores neural engines, local AI deployment, and the tools shaping Dar es Salaam's creative economy.",
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1800&q=85',
    imageAlt: 'Ubepari keynote and creative technology workspace',
  },
  {
    type: 'Hands-on Workshop',
    detail: 'Every Saturday · Magomeni Mapipa Lab',
    title: 'Blender & Unreal Engine Workshop',
    description: 'Build practical 3D skills, tune rendering workflows, and learn how to get more from workstation GPUs.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1800&q=85',
    imageAlt: 'Creators collaborating at a technical workshop',
  },
  {
    type: 'Community Meetup',
    detail: 'In person & online · Next Thursday, 6:00 PM',
    title: 'AI & Deep Learning on Local Hardware',
    description: 'Ubepari hosts a practical session on running modern AI models locally across Apple silicon and RTX workstations.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1800&q=85',
    imageAlt: 'AI and robotics equipment used for local computing',
  },
  {
    type: 'Creator Hackathon',
    detail: 'Dar es Salaam · Applications open',
    title: '48-Hour Creator Video Challenge',
    description: 'Teams make, edit, and share a short film in a weekend of creative collaboration hosted by Ubepari.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1800&q=85',
    imageAlt: 'Creative studio workstation ready for a video challenge',
  },
];

function shuffleEvents(events) {
  const shuffled = [...events];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

const navigationMenus = {
  Mac: {
    filter: 'Apple Mac',
    explore: ['Explore All Mac', 'MacBook Neo', 'MacBook Air', 'MacBook Pro', 'iMac', 'Mac mini', 'Mac Studio', 'Displays'],
    shop: ['Shop Mac', 'Compare Mac', 'Mac Accessories', 'Apple Trade In'],
    more: ['Mac Support', 'Warranty', 'Personal Setup', 'Mac for Business'],
  },
  HP: {
    filter: 'HP Premium',
    explore: ['Explore All HP', 'Spectre', 'Envy', 'Pavilion', 'Omen', 'ZBook'],
    shop: ['Shop HP', 'Compare HP', 'Accessories', 'Trade-in options'],
    more: ['HP Support', 'Warranty', 'Personal Setup', 'For Business'],
  },
  Dell: {
    filter: 'Dell Studio',
    explore: ['Explore All Dell', 'XPS', 'Inspiron', 'Latitude', 'Precision', 'Alienware'],
    shop: ['Shop Dell', 'Compare Dell', 'Accessories', 'Trade-in options'],
    more: ['Dell Support', 'Warranty', 'Personal Setup', 'For Business'],
  },
  Lenovo: {
    filter: 'Lenovo',
    explore: ['Explore All Lenovo', 'ThinkPad', 'Yoga', 'Legion', 'LOQ', 'ThinkStation'],
    shop: ['Shop Lenovo', 'Compare Lenovo', 'Accessories', 'Trade-in options'],
    more: ['Lenovo Support', 'Warranty', 'Personal Setup', 'For Business'],
  },
  ASUS: {
    filter: 'ASUS ROG',
    explore: ['Explore All ASUS', 'Zenbook', 'Vivobook', 'ProArt', 'ROG Zephyrus', 'ROG Strix'],
    shop: ['Shop ASUS', 'Compare ASUS', 'Accessories', 'Trade-in options'],
    more: ['ASUS Support', 'Warranty', 'Personal Setup', 'For Business'],
  },
};

function App() {
  const isStorePage = window.location.pathname.replace(/\/$/, '') === '/store';
  const [products, setProducts] = useState(initialProducts);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [slideIndex, setSlideIndex] = useState(0);
  const [theme, setTheme] = useState('dark');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('details');
  const [checkoutProfile, setCheckoutProfile] = useState({ name: '', phone: '', email: '' });
  const [profileReady, setProfileReady] = useState(false);
  const [profileStorageWarning, setProfileStorageWarning] = useState('');
  const [locationMode, setLocationMode] = useState('address');
  const [deliveryAddress, setDeliveryAddress] = useState({ region: '', city: '', district: '', landmark: '' });
  const [deliveryPoint, setDeliveryPoint] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [paymentPreference, setPaymentPreference] = useState('Ask Ubepari for payment instructions');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [receiptError, setReceiptError] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [orderedEvents] = useState(() => shuffleEvents(communityEvents));
  const [activeEvent, setActiveEvent] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [aboutFeaturePage, setAboutFeaturePage] = useState(0);
  const [isAboutCarouselPaused, setIsAboutCarouselPaused] = useState(false);
  const carouselTrackRef = useRef(null);
  const eventStripRef = useRef(null);
  const eventCardRefs = useRef([]);
  const eventTileRefs = useRef([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/products', { signal: controller.signal })
      .then((response) => response.json())
      .then((result) => {
        if (Array.isArray(result.products) && result.products.length) {
          setProducts(result.products);
        }
      })
      .catch(() => {
        setProducts(initialProducts);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    try {
      const savedProfile = window.localStorage.getItem(profileStorageKey);
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setCheckoutProfile({
          name: typeof parsedProfile.name === 'string' ? parsedProfile.name : '',
          phone: typeof parsedProfile.phone === 'string' ? parsedProfile.phone : '',
          email: typeof parsedProfile.email === 'string' ? parsedProfile.email : '',
        });
      }
    } catch (error) {
      console.error('Could not load saved checkout details.', error);
      setProfileStorageWarning('Saved details could not be read in this browser. You can still continue with checkout.');
    } finally {
      setProfileReady(true);
    }
  }, []);

  useEffect(() => {
    if (!profileReady) return;
    try {
      if (Object.values(checkoutProfile).some((value) => value.trim())) {
        window.localStorage.setItem(profileStorageKey, JSON.stringify(checkoutProfile));
      } else {
        window.localStorage.removeItem(profileStorageKey);
      }
    } catch (error) {
      console.error('Could not save checkout details in this browser.', error);
      setProfileStorageWarning('This browser could not remember your details. You can still continue with checkout.');
    }
  }, [checkoutProfile, profileReady]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSlideIndex((current) => (current + 1) % heroSlides.length);
    }, slideIndex === 0 ? 3000 : 5000);
    return () => window.clearTimeout(timeout);
  }, [slideIndex]);

  useEffect(() => {
    if (isAboutCarouselPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const interval = window.setInterval(() => {
      setAboutFeaturePage((current) => (current + 1) % Math.ceil(aboutFeatures.length / 2));
    }, 8000);
    return () => window.clearInterval(interval);
  }, [isAboutCarouselPaused]);

  useEffect(() => {
    const closeOverlaysOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      setSelectedProduct(null);
      setCartOpen(false);
      setCheckoutOpen(false);
    };
    window.addEventListener('keydown', closeOverlaysOnEscape);
    return () => window.removeEventListener('keydown', closeOverlaysOnEscape);
  }, []);

  useEffect(() => {
    if (isCarouselHovered) return undefined;

    const tracks = [
      { element: carouselTrackRef.current, cards: eventCardRefs.current },
      { element: eventStripRef.current, cards: eventTileRefs.current },
    ].filter(({ element }) => element);
    const loopDistances = tracks.map(({ cards }) => cards[orderedEvents.length]?.offsetLeft - cards[0]?.offsetLeft || 0);
    let animationFrame = 0;
    let previousTime = 0;
    let lastActiveCheck = 0;

    const animateTracks = (time) => {
      const elapsed = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
      previousTime = time;

      tracks.forEach(({ element }, index) => {
        element.scrollLeft += elapsed * 18;
        if (loopDistances[index] > 0 && element.scrollLeft >= loopDistances[index]) {
          element.scrollLeft -= loopDistances[index];
        }
      });

      if (time - lastActiveCheck > 180) {
        const track = carouselTrackRef.current;
        if (track) {
          const center = track.getBoundingClientRect().left + track.clientWidth / 2;
          const nearestCard = eventCardRefs.current.reduce((nearest, card, index, cards) => {
            if (!card) return nearest;
            const distance = Math.abs(card.getBoundingClientRect().left + card.offsetWidth / 2 - center);
            const nearestDistance = Math.abs(cards[nearest]?.getBoundingClientRect().left + cards[nearest]?.offsetWidth / 2 - center);
            return distance < nearestDistance ? index : nearest;
          }, 0);
          const nextActiveEvent = nearestCard % orderedEvents.length;
          setActiveEvent((current) => current === nextActiveEvent ? current : nextActiveEvent);
        }
        lastActiveCheck = time;
      }

      animationFrame = window.requestAnimationFrame(animateTracks);
    };

    animationFrame = window.requestAnimationFrame(animateTracks);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [isCarouselHovered, orderedEvents.length]);

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const brandMatches = selectedBrand === 'all' || product.brand === selectedBrand;
      const typeMatches = selectedType === 'all' || product.type === selectedType;
      return brandMatches && typeMatches;
    });
  }, [products, selectedBrand, selectedType]);

  const addToCart = (product) => {
    setCartItems((items) => {
      const existingItem = items.find((item) => item.id === product.id);
      if (existingItem) {
        return items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...items, { ...product, quantity: 1 }];
    });
    setSelectedProduct(null);
    setCartOpen(true);
  };

  const updateCartQuantity = (productId, adjustment) => {
    setCartItems((items) => items.map((item) => (
      item.id === productId
        ? { ...item, quantity: Math.max(1, item.quantity + adjustment) }
        : item
    )));
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const submitCheckout = (event) => {
    event.preventDefault();
    if (!cartItems.length) return;
    if (receiptError) return;
    if (locationMode === 'map' && !deliveryPoint) {
      setLocationError('Tap the map to place a pin for your delivery location.');
      return;
    }
    setLocationError('');

    const delivery = locationMode === 'map'
      ? `Map pin: https://www.openstreetmap.org/?mlat=${deliveryPoint?.lat}&mlon=${deliveryPoint?.lng}#map=16/${deliveryPoint?.lat}/${deliveryPoint?.lng}${deliveryAddress.landmark ? `; nearby: ${deliveryAddress.landmark}` : ''}`
      : `${deliveryAddress.region}, ${deliveryAddress.city}, ${deliveryAddress.district}${deliveryAddress.landmark ? `, near ${deliveryAddress.landmark}` : ''}`;
    const itemLines = cartItems.map((item) => `• ${item.quantity} × ${item.name} — ${formatMoney(item.price * item.quantity)}`).join('\n');
    const message = [
      `Hi Ubepari PC, I'd like to request this order:`,
      itemLines,
      `Listed total: ${formatMoney(cartTotal)}`,
      `Customer: ${checkoutProfile.name.trim() || 'Not provided'}`,
      `Phone: ${checkoutProfile.phone.trim()}`,
      checkoutProfile.email.trim() ? `Email: ${checkoutProfile.email.trim()}` : '',
      `Delivery: ${delivery}`,
      `Payment preference: ${paymentPreference}. Please confirm official payment instructions and availability.`,
      receiptFileName ? `Receipt: I will attach "${receiptFileName}" manually in WhatsApp; it has not been uploaded by the website.` : '',
      `Please confirm delivery cost and next steps. This website does not process or verify payments.`,
    ].filter(Boolean).join('\n');
    const order = {
      items: cartItems.map((item) => ({ ...item })),
      total: cartTotal,
      count: cartCount,
      name: checkoutProfile.name.trim(),
      whatsappUrl: getWhatsAppUrl(message),
      points: cartCount * 10,
    };

    window.open(order.whatsappUrl, '_blank', 'noopener,noreferrer');
    setSubmittedOrder(order);
    setCheckoutStep('thanks');
    setCartItems([]);
    setDeliveryAddress({ region: '', city: '', district: '', landmark: '' });
    setDeliveryPoint(null);
    setReceiptFileName('');
  };

  const clearSavedProfile = () => {
    try {
      window.localStorage.removeItem(profileStorageKey);
      setCheckoutProfile({ name: '', phone: '', email: '' });
      setProfileStorageWarning('');
    } catch (error) {
      console.error('Could not clear saved checkout details.', error);
      setProfileStorageWarning('Saved details could not be cleared in this browser. Clear this browser’s site data to remove them.');
    }
  };

  const focusEvent = (index) => {
    const eventIndex = (index + orderedEvents.length) % orderedEvents.length;
    const scrollTrackToCard = (track, card) => {
      if (!track || !card) return;
      const trackRect = track.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const left = track.scrollLeft + cardRect.left - trackRect.left - (track.clientWidth - card.clientWidth) / 2;
      track.scrollTo({ left, behavior: 'smooth' });
    };

    scrollTrackToCard(carouselTrackRef.current, eventCardRefs.current[eventIndex]);
    scrollTrackToCard(eventStripRef.current, eventTileRefs.current[eventIndex]);
    setActiveEvent(eventIndex);
  };

  return (
    <div className={`app-shell ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <div className="diffuse-orb orb-one" />
      <div className="diffuse-orb orb-two" />
      <div className="diffuse-orb orb-three" />
      <div className="diffuse-orb orb-four" />
      <div className="diffuse-orb orb-five" />

      <header className="topbar-wrap">
        <div
          className="nav-shell liquid-glass"
          onPointerLeave={() => setActiveMenu(null)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setActiveMenu(null);
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setActiveMenu(null);
          }}
        >
          <div className="nav-inner">
            <a href={isStorePage ? '/' : '#hero'} className="brand-block">
              <div className="brand-mark">
                <img src="/ubepari-logo.jpg" alt="" />
              </div>
              <span>Ubepari PC</span>
            </a>

            <nav className="main-nav">
              <a href={isStorePage ? '#store' : '/store'}>Store</a>
              {Object.entries(navigationMenus).map(([label, menu]) => (
                <a
                  href="#store"
                  key={label}
                  aria-haspopup="true"
                  aria-expanded={activeMenu === label}
                  onPointerEnter={() => setActiveMenu(label)}
                  onFocus={() => setActiveMenu(label)}
                  onClick={() => setSelectedBrand(menu.filter)}
                >
                  {label}
                </a>
              ))}
              <a href="#about-ubepari">About</a>
              <a href="#community-events">Community</a>
            </nav>

            <div className="nav-actions">
              <div className="mode-toggle liquid-glass" aria-label="Theme switcher">
                <button type="button" onClick={() => setTheme('light')} className={theme === 'light' ? 'active' : ''}><SunMedium size={16} /></button>
                <button type="button" onClick={() => setTheme('dark')} className={theme === 'dark' ? 'active' : ''}><MoonStar size={16} /></button>
              </div>
              <button type="button" className="icon-button" aria-label="Search computers"><Search size={18} /></button>
              <button type="button" className="icon-button cart-trigger" aria-label={`Open shopping bag, ${cartCount} items`} onClick={() => setCartOpen(true)}>
                <ShoppingBag size={18} />
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </button>
              <a href="/store" className="primary-pill nav-shop-link">Shop now</a>
            </div>
          </div>

          <div className={`mega-menu${activeMenu ? ' is-open' : ''}`} aria-hidden={!activeMenu}>
            {activeMenu && (
              <div className="mega-menu-inner" role="region" aria-label={`${activeMenu} menu`}>
                <div className="mega-menu-featured">
                  <span className="mega-menu-heading">Explore {activeMenu}</span>
                  {navigationMenus[activeMenu].explore.map((item, index) => (
                    <a
                      href="#store"
                      className={index === 0 ? 'featured-link' : ''}
                      key={item}
                      onClick={() => {
                        setSelectedBrand(navigationMenus[activeMenu].filter);
                        setActiveMenu(null);
                      }}
                    >
                      {item}
                    </a>
                  ))}
                </div>
                {[
                  ['Shop', navigationMenus[activeMenu].shop],
                  ['More', navigationMenus[activeMenu].more],
                ].map(([heading, links]) => (
                  <div className="mega-menu-column" key={heading}>
                    <span className="mega-menu-heading">{heading} {activeMenu}</span>
                    {links.map((item) => (
                      <a
                        href="#store"
                        key={item}
                        onClick={() => {
                          setSelectedBrand(navigationMenus[activeMenu].filter);
                          setActiveMenu(null);
                        }}
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="page-main">
        {!isStorePage && (
          <>
        <section className="hero-section" id="hero">
          <div className="hero-track" style={{ transform: `translateX(-${slideIndex * 100}%)` }}>
            {heroSlides.map((slide, index) => (
              <article className="hero-slide" key={slide.title}>
                {slide.video && slideIndex === index ? (
                  <video
                    className="hero-media"
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    poster={slide.image}
                    aria-hidden="true"
                  >
                    <source src={slide.video} type="video/webm" />
                  </video>
                ) : (
                  <img className="hero-media" src={slide.image} alt="" />
                )}
                <div className="hero-overlay" />
                <div className="hero-content-inner">
                  <div className="status-pill liquid-glass">
                    <span className="pulse-dot" />
                    <span>{slide.eyebrow}</span>
                  </div>
                  <span className="eyebrow blue">{slide.label}</span>
                  <h1>{slide.title}</h1>
                  <p>{slide.subtitle}</p>
                  <p className="hero-note-line">{slide.note}</p>
                  <div className="hero-actions-row">
                    <a href="/store" className="primary-pill">Shop computers <ArrowRight size={16} /></a>
                    <a
                      className="secondary-pill liquid-glass"
                      href={getWhatsAppUrl('Hi Ubepari PC, I would like help choosing a computer.')}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle size={16} /> WhatsApp
                    </a>
                    <a
                      className="secondary-pill liquid-glass"
                      href={instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Instagram size={16} /> Instagram
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <button type="button" className="slider-arrow left liquid-glass" onClick={() => setSlideIndex((slideIndex + heroSlides.length - 1) % heroSlides.length)} aria-label="Previous slide"><ChevronLeft size={20} /></button>
          <button type="button" className="slider-arrow right liquid-glass" onClick={() => setSlideIndex((slideIndex + 1) % heroSlides.length)} aria-label="Next slide"><ChevronRight size={20} /></button>

          <div className="slides-progress liquid-glass">
            {heroSlides.map((slide, index) => (
              <button type="button" key={slide.title} className="progress-bar" onClick={() => setSlideIndex(index)} aria-label={`Go to slide ${index + 1}`}>
                <span style={{ width: index === slideIndex ? '100%' : '0%' }} />
              </button>
            ))}
          </div>
        </section>

        <section className="section-block about-block" id="about-ubepari">
          <div className="section-heading narrow center">
            <span className="eyebrow blue">Ubepari, Dar es Salaam</span>
            <h2>Visit, explore, and get support.</h2>
            <p>Find Ubepari PC, ask about current offers, browse trusted hardware, and connect with our local team.</p>
          </div>

          <div
            className="feature-carousel"
            role="region"
            aria-label="Visit Ubepari PC, explore current offers, hardware, and local support"
            onMouseEnter={() => setIsAboutCarouselPaused(true)}
            onMouseLeave={() => setIsAboutCarouselPaused(false)}
            onFocusCapture={() => setIsAboutCarouselPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setIsAboutCarouselPaused(false);
            }}
          >
            <div
              className="feature-track"
              style={{ transform: `translateX(-${aboutFeaturePage * 50}%)` }}
            >
              {Array.from({ length: Math.ceil(aboutFeatures.length / 2) }, (_, pageIndex) => (
                <div
                  className="feature-page"
                  key={pageIndex}
                  aria-hidden={pageIndex !== aboutFeaturePage}
                >
                  {aboutFeatures.slice(pageIndex * 2, pageIndex * 2 + 2).map((feature) => (
                    <article className="feature-slide" key={feature.title}>
                      <img
                        className="feature-slide-image"
                        src={feature.image}
                        alt={feature.imageAlt}
                        loading={pageIndex === 0 ? 'eager' : 'lazy'}
                      />
                      <div className="feature-slide-shade" />
                      <div className="feature-slide-copy">
                        <span className="feature-slide-eyebrow">{feature.eyebrow}</span>
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                        <a
                          className="primary-pill compact feature-slide-action"
                          href={feature.href}
                          target={feature.external ? '_blank' : undefined}
                          rel={feature.external ? 'noreferrer' : undefined}
                          tabIndex={pageIndex !== aboutFeaturePage ? -1 : undefined}
                        >
                          {feature.action} <ArrowRight size={15} />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              ))}
            </div>
            <div className="feature-carousel-controls" aria-label="Choose featured information">
              <button
                type="button"
                className="feature-page-arrow"
                aria-label="Show previous information"
                onClick={() => setAboutFeaturePage((current) => (current + 1) % Math.ceil(aboutFeatures.length / 2))}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.ceil(aboutFeatures.length / 2) }, (_, pageIndex) => (
                <button
                  type="button"
                  className={`feature-page-dot${pageIndex === aboutFeaturePage ? ' is-active' : ''}`}
                  key={pageIndex}
                  aria-label={`Show information ${pageIndex + 1} of ${Math.ceil(aboutFeatures.length / 2)}`}
                  aria-pressed={pageIndex === aboutFeaturePage}
                  onClick={() => setAboutFeaturePage(pageIndex)}
                />
              ))}
              <button
                type="button"
                className="feature-page-arrow"
                aria-label="Show next information"
                onClick={() => setAboutFeaturePage((current) => (current + 1) % Math.ceil(aboutFeatures.length / 2))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
          </>
        )}

        <section className={`section-block store-section${isStorePage ? ' full-store-section' : ''}`} id="store">
          <div className="section-heading row">
            <div>
              <span className="eyebrow blue">Official Hardware Catalog</span>
              <h2>{isStorePage ? 'All products.' : 'Store with All Computer Brands.'}</h2>
              <p>{isStorePage ? 'Explore the full range of computers, creator workstations, and gaming rigs.' : 'Explore authentic silicon backed by 2-year warranty and straightforward pricing.'}</p>
            </div>
            {isStorePage && <a className="secondary-pill compact store-back-link" href="/">Back to home</a>}
          </div>

          <div className="filter-row liquid-glass">
            {['all', 'Apple Mac', 'HP Premium', 'Dell Studio', 'Lenovo', 'ASUS ROG', 'gaming', 'workstation'].map((filter) => (
              <button
                type="button"
                className={(filter === 'all' ? selectedBrand === 'all' && selectedType === 'all' : filter === selectedBrand || filter === selectedType) ? 'segment active' : 'segment'}
                key={filter}
                onClick={() => {
                  if (filter === 'gaming' || filter === 'workstation') {
                    setSelectedType(filter);
                    setSelectedBrand('all');
                  } else {
                    setSelectedBrand(filter);
                    setSelectedType('all');
                  }
                }}
              >
                {brandLogos[filter] && <img className="brand-filter-logo" src={brandLogos[filter].src} alt={brandLogos[filter].alt} loading="lazy" />}
                <span>{filter === 'all' ? 'All Brands' : filter === 'gaming' ? 'Gaming Rigs' : filter === 'workstation' ? 'Workstations' : filter}</span>
              </button>
            ))}
          </div>

          <div className={`product-grid${isStorePage ? '' : ' preview-grid'}`}>
            {visibleProducts.map((product) => (
              <article
                key={product.id}
                className="product-card liquid-glass"
                tabIndex={0}
                role="group"
                aria-label={`${product.name} product card. Open overview.`}
                onClick={() => setSelectedProduct(product)}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return;
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedProduct(product);
                  }
                }}
              >
                <div className="product-visual">
                  <img src={getProductImage(product)} alt={product.name} loading="lazy" />
                  <div className="product-visual-shade" />
                  <div className="product-visual-topline">
                    <span className="product-brand">{product.brand}</span>
                    <span className="product-tag">{product.tag}</span>
                  </div>
                  <div className="product-visual-copy">
                    <h3>{product.name}</h3>
                    <p>{product.details}</p>
                    <div className="product-visual-specs" aria-label="Product specifications">
                      {getProductSpecs(product).map((spec) => <span key={spec}>{spec}</span>)}
                    </div>
                  </div>
                </div>

                <div className="product-card-content">
                  <div className="price-row">
                    <div>
                      <span>From</span>
                      <strong>{formatMoney(product.monthly)} / mo</strong>
                    </div>
                    <div className="cash-price">
                      <span>Outright</span>
                      <strong>{formatMoney(product.price)}</strong>
                    </div>
                  </div>

                  <div className="product-actions">
                    <a
                      className="secondary-pill compact"
                      href={getWhatsAppUrl(`Hi, I'm interested in the ${product.name}. Could you share availability and details?`)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <MessageCircle size={15} /> Chat
                    </a>
                    <button
                      type="button"
                      className="primary-pill compact"
                      onClick={(event) => {
                        event.stopPropagation();
                        addToCart(product);
                      }}
                    >
                      Buy now
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!isStorePage && (
            <div className="catalog-more-wrap">
              <a href="/store" className="primary-pill catalog-more">View more products <ArrowRight size={16} /></a>
            </div>
          )}
        </section>

        {!isStorePage && (
        <section className="section-block community-block" id="community-events">
          <div className="section-heading narrow center">
            <h2>Meet our community</h2>
            <p>Meet the people, ideas, and hands-on events behind Ubepari's creator community.</p>
          </div>

          <div
            className="community-carousel"
            onMouseEnter={() => setIsCarouselHovered(true)}
            onMouseLeave={() => setIsCarouselHovered(false)}
            onFocusCapture={() => setIsCarouselHovered(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setIsCarouselHovered(false);
            }}
          >
            <div
              className="community-carousel-track"
              ref={carouselTrackRef}
              onScroll={(event) => {
                const viewportCenter = event.currentTarget.getBoundingClientRect().left + event.currentTarget.clientWidth / 2;
                const nearestIndex = eventCardRefs.current.reduce((nearest, card, index, cards) => {
                  if (!card) return nearest;
                  const distance = Math.abs(card.getBoundingClientRect().left + card.offsetWidth / 2 - viewportCenter);
                  const nearestDistance = Math.abs(cards[nearest]?.getBoundingClientRect().left + cards[nearest]?.offsetWidth / 2 - viewportCenter);
                  return distance < nearestDistance ? index : nearest;
                }, 0);
                setActiveEvent(nearestIndex % orderedEvents.length);
              }}
              aria-label="Ubepari community events"
            >
              {[...orderedEvents, ...orderedEvents].map((event, index) => (
                <article
                  className={`community-event-card${activeEvent === index % orderedEvents.length ? ' is-active' : ''}`}
                  key={`${event.title}-${index}`}
                  ref={(element) => { eventCardRefs.current[index] = element; }}
                  aria-label={`${event.type}: ${event.title}`}
                >
                  <img src={event.image} alt={event.imageAlt} />
                  <div className="community-event-shade" />
                  <div className="community-event-copy">
                    <span className="community-event-type">{event.type}</span>
                    <h3>{event.title}</h3>
                    <p>{event.description}</p>
                    <span className="community-event-detail">{event.detail}</span>
                  </div>
                </article>
              ))}
            </div>

            <div
              className="community-event-strip"
              ref={eventStripRef}
              aria-label="More from Ubepari Community"
            >
              {[...orderedEvents, ...orderedEvents].map((event, index) => (
                <button
                  type="button"
                  className={`community-event-tile${activeEvent === index % orderedEvents.length ? ' is-active' : ''}`}
                  key={`${event.title}-${index}`}
                  ref={(element) => { eventTileRefs.current[index] = element; }}
                  aria-label={`Feature ${event.type}: ${event.title}`}
                  aria-pressed={activeEvent === index % orderedEvents.length}
                  onClick={() => focusEvent(index)}
                >
                  <img src={event.image} alt="" />
                  <span className="community-tile-shade" />
                  <span className="community-tile-copy">
                    <span>{event.type}</span>
                    <strong>{event.title}</strong>
                  </span>
                </button>
              ))}
            </div>

          </div>

        </section>
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <a className="footer-brand" href={isStorePage ? '/' : '#hero'} aria-label="Ubepari PC home">
            <img src="/ubepari-logo.jpg" alt="" />
            <span>Ubepari PC</span>
          </a>
          <div className="legal-note">
            <p>Hardware pricing in Tanzanian Shillings (TSh) is locked at the time of order, protecting buyers against exchange-rate fluctuations.</p>
            <p>Built for creators, developers, and teams who want premium gear without the noise.</p>
          </div>

          <div className="footer-columns">
            <div>
              <h4>Store &amp; Hardware</h4>
              <a href="#store" onClick={() => setSelectedBrand('Apple Mac')}>Apple Mac Silicon</a>
              <a href="#store" onClick={() => setSelectedBrand('HP Premium')}>HP Spectre &amp; Omen</a>
              <a href="#store" onClick={() => setSelectedBrand('Dell Studio')}>Dell XPS &amp; Alienware</a>
              <a href="#store" onClick={() => setSelectedBrand('Lenovo')}>Lenovo Legion &amp; ThinkPad</a>
              <a href="#store" onClick={() => setSelectedBrand('ASUS ROG')}>ASUS ROG &amp; Zenbook</a>
            </div>
            <div>
              <h4>Support</h4>
              <a href="#about-ubepari">Our Mission</a>
              <a href="#community-events">Workshops</a>
              <a href="#store">Quick shipping</a>
              <a href="#store">Trade-ins</a>
            </div>
            <div>
              <h4>Community</h4>
              <a href="#community-events">Ubepari Keynote '26</a>
              <a href="#community-events">Saturday 3D Workshop</a>
              <a href="#community-events">Local AI GPU Meetups</a>
              <a href="#community-events">Creator Hackathon</a>
            </div>
            <div>
              <h4>About</h4>
              <a href="#about-ubepari">Our Mission</a>
              <a href="#about-ubepari">Magomeni Mapipa Hub</a>
              <a href="#about-ubepari">Benchmarking Lab</a>
              <a href="#about-ubepari">Performance-first philosophy</a>
            </div>
            <div>
              <h4>Legal</h4>
              <a href="#">Warranty terms</a>
              <a href="#">Privacy policy</a>
              <a href="#">Returns</a>
              <a href="#">Company details</a>
            </div>
          </div>

          <div className="footer-bottom-strip">
            <div>Copyright © 2026 Ubepari PC Co. Ltd. All rights reserved. Dar es Salaam, Tanzania.</div>
            <button type="button" className="language-tag"><span className="material-icon">language</span> Tanzania (English / Kiswahili)</button>
          </div>
        </div>
      </footer>

      {selectedProduct && (
        <div className="modal-backdrop product-overview-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedProduct(null); }}>
          <section className="product-overview liquid-glass" role="dialog" aria-modal="true" aria-labelledby="product-overview-title">
            <button type="button" className="modal-close" onClick={() => setSelectedProduct(null)} aria-label="Close product overview"><X size={18} /></button>
            <div className="product-overview-image">
              <img src={getProductImage(selectedProduct)} alt={selectedProduct.name} />
              <span className="product-tag">{selectedProduct.tag}</span>
            </div>
            <div className="product-overview-content">
              <span className="product-brand">{selectedProduct.brand}</span>
              <h2 id="product-overview-title">{selectedProduct.name}</h2>
              <p>{selectedProduct.details}</p>
              <div className="overview-spec-list">
                {getProductSpecs(selectedProduct).map((spec) => <span key={spec}><ShieldCheck size={15} />{spec}</span>)}
              </div>
              <div className="price-row">
                <div><span>From</span><strong>{formatMoney(selectedProduct.monthly)} / mo</strong></div>
                <div className="cash-price"><span>Outright</span><strong>{formatMoney(selectedProduct.price)}</strong></div>
              </div>
              <div className="product-actions overview-actions">
                <a
                  className="secondary-pill compact"
                  href={getWhatsAppUrl(`Hi, I'm interested in the ${selectedProduct.name}. Could you share availability and details?`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle size={15} /> Chat
                </a>
                <button type="button" className="primary-pill compact" onClick={() => addToCart(selectedProduct)}>Buy now</button>
              </div>
            </div>
          </section>
        </div>
      )}

      {cartOpen && (
        <div className="drawer-backdrop cart-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
          <aside className="cart-drawer liquid-glass" role="dialog" aria-modal="true" aria-labelledby="cart-title">
            <div className="drawer-header">
              <div>
                <span className="eyebrow blue">Your selection</span>
                <h3 id="cart-title">Shopping bag ({cartCount})</h3>
              </div>
              <button type="button" className="modal-close" onClick={() => setCartOpen(false)} aria-label="Close shopping bag"><X size={18} /></button>
            </div>
            {cartItems.length ? (
              <>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <article className="cart-item" key={item.id}>
                      <img src={getProductImage(item)} alt="" />
                      <div className="cart-item-copy">
                        <strong>{item.name}</strong>
                        <span>{formatMoney(item.price)} each</span>
                        <div className="cart-item-controls" aria-label={`Quantity for ${item.name}`}>
                          <button
                            type="button"
                            className="quantity-stepper"
                            aria-label={`Decrease ${item.name} quantity`}
                            disabled={item.quantity <= 1}
                            onClick={() => updateCartQuantity(item.id, -1)}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="cart-item-quantity" aria-live="polite">{item.quantity}</span>
                          <button
                            type="button"
                            className="quantity-stepper"
                            aria-label={`Increase ${item.name} quantity`}
                            onClick={() => updateCartQuantity(item.id, 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="cart-item-remove"
                          onClick={() => setCartItems((items) => items.filter((cartItem) => cartItem.id !== item.id))}
                        >
                          Remove
                        </button>
                      </div>
                      <strong className="cart-item-total">{formatMoney(item.price * item.quantity)}</strong>
                    </article>
                  ))}
                </div>
                <div className="cart-subtotal"><span>Listed total</span><strong>{formatMoney(cartTotal)}</strong></div>
                <p className="cart-note">Add your contact and delivery details first. WhatsApp will open with your full order; payment is confirmed directly with Ubepari PC.</p>
                <button
                  type="button"
                  className="primary-pill full cart-whatsapp"
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutStep('details');
                    setLocationError('');
                    setReceiptError('');
                    setReceiptFileName('');
                    setCheckoutOpen(true);
                  }}
                >
                  <ShoppingBag size={16} /> Proceed to checkout
                </button>
              </>
            ) : (
              <div className="cart-empty">
                <ShoppingBag size={30} />
                <p>Your bag is empty.</p>
                <button type="button" className="secondary-pill compact" onClick={() => setCartOpen(false)}>Continue shopping</button>
              </div>
            )}
          </aside>
        </div>
      )}

      {checkoutOpen && (
        <div className="modal-backdrop checkout-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCheckoutOpen(false); }}>
          {checkoutStep === 'details' ? (
            <section className="checkout-modal liquid-glass" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
              <button type="button" className="modal-close" onClick={() => setCheckoutOpen(false)} aria-label="Close checkout"><X size={18} /></button>
              <div className="checkout-heading">
                <span className="eyebrow blue">Step 1 of 2 · Customer details</span>
                <h2 id="checkout-title">Where should we reach you?</h2>
                <p>Your order is sent to Ubepari PC in WhatsApp so our team can confirm stock, delivery, and payment instructions.</p>
              </div>
              <form className="checkout-form" onSubmit={submitCheckout}>
                <div className="checkout-field-grid">
                  <label className="checkout-field">
                    <span>Name <small>Optional</small></span>
                    <input
                      autoComplete="name"
                      value={checkoutProfile.name}
                      onChange={(event) => setCheckoutProfile((profile) => ({ ...profile, name: event.target.value }))}
                      placeholder="Your name"
                    />
                  </label>
                  <label className="checkout-field">
                    <span>Phone number <strong>Required</strong></span>
                    <input
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      value={checkoutProfile.phone}
                      onChange={(event) => setCheckoutProfile((profile) => ({ ...profile, phone: event.target.value }))}
                      placeholder="+255 7xx xxx xxx"
                      pattern="(?:\+?255|0)?[\s-]*[67](?:[\s-]*\d){8}"
                      title="Enter a Tanzanian mobile number, such as +255 620 536 374 or 0620 536 374."
                      required
                    />
                  </label>
                  <label className="checkout-field checkout-field-wide">
                    <span>Email <small>Optional</small></span>
                    <input
                      type="email"
                      autoComplete="email"
                      value={checkoutProfile.email}
                      onChange={(event) => setCheckoutProfile((profile) => ({ ...profile, email: event.target.value }))}
                      placeholder="you@example.com"
                    />
                  </label>
                </div>
                <p className="checkout-privacy">We remember your name, phone, and email only in this browser for next time. Clear saved details here at any time.</p>
                {profileStorageWarning && <p className="checkout-alert" role="status">{profileStorageWarning}</p>}
                <button type="button" className="checkout-clear-profile" onClick={clearSavedProfile}>Clear saved details</button>

                <fieldset className="checkout-location">
                  <legend>Delivery location in Tanzania</legend>
                  <div className="checkout-choice-row">
                    <label><input type="radio" name="location-mode" value="address" checked={locationMode === 'address'} onChange={() => { setLocationMode('address'); setLocationError(''); }} /> Region and address</label>
                    <label><input type="radio" name="location-mode" value="map" checked={locationMode === 'map'} onChange={() => { setLocationMode('map'); setLocationError(''); }} /> Select on map</label>
                  </div>
                  {locationMode === 'address' ? (
                    <div className="checkout-field-grid">
                      <label className="checkout-field">
                        <span>Region <strong>Required</strong></span>
                        <select value={deliveryAddress.region} onChange={(event) => setDeliveryAddress((address) => ({ ...address, region: event.target.value }))} required>
                          <option value="">Choose a region</option>
                          {tanzaniaRegions.map((region) => <option key={region} value={region}>{region}</option>)}
                        </select>
                      </label>
                      <label className="checkout-field">
                        <span>City / town <strong>Required</strong></span>
                        <input value={deliveryAddress.city} onChange={(event) => setDeliveryAddress((address) => ({ ...address, city: event.target.value }))} placeholder="City or town" required />
                      </label>
                      <label className="checkout-field">
                        <span>District <strong>Required</strong></span>
                        <input value={deliveryAddress.district} onChange={(event) => setDeliveryAddress((address) => ({ ...address, district: event.target.value }))} placeholder="District" required />
                      </label>
                      <label className="checkout-field">
                        <span>Famous point / landmark <small>Optional</small></span>
                        <input value={deliveryAddress.landmark} onChange={(event) => setDeliveryAddress((address) => ({ ...address, landmark: event.target.value }))} placeholder="Nearby landmark, street, or building" />
                      </label>
                    </div>
                  ) : (
                    <>
                      <p className="checkout-map-hint"><MapPin size={15} /> Tap the map to pin your delivery location. Move the map to choose another spot.</p>
                      <DeliveryMap onSelect={(point) => { setDeliveryPoint(point); setLocationError(''); }} selectedPoint={deliveryPoint} />
                      <p className="checkout-map-coordinates" aria-live="polite">
                        {deliveryPoint ? `Selected: ${deliveryPoint.lat}, ${deliveryPoint.lng}` : 'No location selected yet.'}
                      </p>
                      <label className="checkout-field">
                        <span>Nearby famous point / directions <small>Optional</small></span>
                        <input value={deliveryAddress.landmark} onChange={(event) => setDeliveryAddress((address) => ({ ...address, landmark: event.target.value }))} placeholder="Landmark or delivery instructions" />
                      </label>
                    </>
                  )}
                  {locationError && <p className="checkout-alert" role="alert">{locationError}</p>}
                </fieldset>

                <label className="checkout-field checkout-payment-field">
                  <span>Payment instructions preference</span>
                  <select value={paymentPreference} onChange={(event) => setPaymentPreference(event.target.value)}>
                    <option>Ask Ubepari for payment instructions</option>
                    <option>Bank transfer (request official details)</option>
                    <option>Mobile money / Lipa number (request official details)</option>
                    <option>Pay on pickup (confirm with Ubepari)</option>
                  </select>
                </label>
                <p className="checkout-payment-note">No bank or Lipa details are collected or displayed here. Confirm official details with Ubepari PC in WhatsApp. Never send a PIN, password, or OTP.</p>

                <label className="checkout-field checkout-receipt">
                  <span>Payment receipt <small>Optional · attach manually in WhatsApp</small></span>
                  <input
                    type="file"
                    accept="image/*,.pdf,application/pdf"
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0];
                      if (file && file.size > 10 * 1024 * 1024) {
                        setReceiptFileName('');
                        setReceiptError('Choose a receipt smaller than 10 MB.');
                        event.currentTarget.value = '';
                        return;
                      }
                      setReceiptError('');
                      setReceiptFileName(file?.name || '');
                    }}
                  />
                  <small>The website does not upload or store your receipt. WhatsApp cannot attach it automatically, so add it there yourself.</small>
                </label>
                {receiptError && <p className="checkout-alert" role="alert">{receiptError}</p>}

                <div className="checkout-order-summary">
                  <span>{cartCount} {cartCount === 1 ? 'item' : 'items'} in your order</span>
                  <strong>{formatMoney(cartTotal)}</strong>
                </div>
                <button type="submit" className="primary-pill full checkout-submit"><Check size={17} /> Done</button>
                <p className="checkout-submit-note">Done opens a pre-filled order in WhatsApp. Review it and press Send there to contact our team.</p>
              </form>
            </section>
          ) : (
            <section className="checkout-modal checkout-thankyou liquid-glass" role="dialog" aria-modal="true" aria-labelledby="checkout-thankyou-title">
              <button type="button" className="modal-close" onClick={() => setCheckoutOpen(false)} aria-label="Close thank you"><X size={18} /></button>
              <div className="thankyou-check"><Check size={26} /></div>
              <span className="eyebrow blue">Step 2 of 2 · Thank you</span>
              <h2 id="checkout-thankyou-title">Asante{submittedOrder?.name ? `, ${submittedOrder.name}` : ''}!</h2>
              <p className="checkout-thankyou-copy">Your order is ready in WhatsApp. Please press Send in WhatsApp so Ubepari PC receives it, then the team can confirm availability and delivery.</p>
              {submittedOrder && (
                <div className="checkout-order-summary thankyou-summary">
                  <span>Order request · {submittedOrder.count} {submittedOrder.count === 1 ? 'item' : 'items'}</span>
                  <strong>{formatMoney(submittedOrder.total)}</strong>
                </div>
              )}
              {submittedOrder && (
                <div className="wallet-preview">
                  <span>Ubepari Wallet points preview</span>
                  <strong>{submittedOrder.points} points</strong>
                  <small>Demo-only estimate; not a balance, payment, or redeemable reward.</small>
                </div>
              )}
              <a className="primary-pill full thankyou-whatsapp" href={submittedOrder?.whatsappUrl} target="_blank" rel="noreferrer">
                <MessageCircle size={17} /> Open order in WhatsApp
              </a>
              <div className="checkout-review">
                <strong>How was your experience?</strong>
                <p>We’d love your feedback. Choose where you’d like to connect:</p>
                <div className="checkout-review-links">
                  <a href={googleReviewUrl} target="_blank" rel="noreferrer"><MapPin size={15} /> Find us & review on Google</a>
                  <a href={getWhatsAppUrl('Hi Ubepari PC, I would like to share feedback about my experience.')} target="_blank" rel="noreferrer"><MessageCircle size={15} /> WhatsApp</a>
                  <a href={instagramUrl} target="_blank" rel="noreferrer"><Instagram size={15} /> Instagram</a>
                </div>
              </div>
              <button type="button" className="secondary-pill compact thankyou-close" onClick={() => setCheckoutOpen(false)}>Continue browsing</button>
            </section>
          )}
        </div>
      )}

    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
