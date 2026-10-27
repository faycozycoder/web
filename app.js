/**
 * PRODUK_LOKAL BY KOPIA - INTERACTIVE JAVASCRIPT ENGINE
 * Direct Commerce Platform - Kurasi Produk Lokal & UMKM Indonesia
 */

// ===================================================================
// FIREBASE BACKEND CONFIGURATION & INITIALIZATION
// ===================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBcRKqL1hx6R8GteT2csfygzTeQGwOmsaI",
  authDomain: "produklokal-kopia.firebaseapp.com",
  projectId: "produklokal-kopia",
  storageBucket: "produklokal-kopia.firebasestorage.app",
  messagingSenderId: "110297698834",
  appId: "1:110297698834:web:6bb9e075aa7274bd88becb",
  measurementId: "G-S62L4RNCYM"
};

let db = null;
let isFirebaseReady = false;

function initFirebase() {
  try {
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      if (typeof firebase.analytics === 'function') {
        try { firebase.analytics(); } catch (e) {}
      }
      if (typeof firebase.firestore === 'function') {
        db = firebase.firestore();
        isFirebaseReady = true;
        console.log('🔥 Firebase Cloud Firestore connected: produklokal-kopia');
        initFirestoreSync();
      }
    }
  } catch (err) {
    console.warn('Firebase initialization notice:', err);
  }
}

// Real-time synchronization with Cloud Firestore
function initFirestoreSync() {
  if (!db) return;

  // 1. Sync Products Realtime from Cloud
  db.collection('products').onSnapshot((snapshot) => {
    if (!snapshot.empty) {
      const cloudProducts = [];
      snapshot.forEach(doc => {
        cloudProducts.push({ ...doc.data(), id: doc.id });
      });
      console.log(`📦 Memuat ${cloudProducts.length} produk dari Cloud Firestore.`);
      
      const existingIds = new Set(CATALOG_PRODUCTS.map(p => p.id));
      cloudProducts.forEach(cp => {
        if (!existingIds.has(cp.id)) {
          CATALOG_PRODUCTS.unshift(cp);
          existingIds.add(cp.id);
        } else {
          const idx = CATALOG_PRODUCTS.findIndex(p => p.id === cp.id);
          if (idx !== -1) CATALOG_PRODUCTS[idx] = cp;
        }
      });
      renderCatalog();
    }
  }, (err) => {
    console.warn('Firestore products listener:', err.message);
  });

  // 2. Sync Seller Ads Realtime
  db.collection('seller_ads').onSnapshot((snapshot) => {
    if (!snapshot.empty) {
      const cloudAds = [];
      snapshot.forEach(doc => {
        cloudAds.push({ ...doc.data(), id: doc.id });
      });
      SELLER_ADS = cloudAds;
      try {
        localStorage.setItem('kopia_seller_ads', JSON.stringify(SELLER_ADS));
      } catch (e) {}
      renderSellerDashboard();
    }
  }, (err) => {
    console.warn('Firestore seller_ads listener:', err.message);
  });
}

function syncProductToFirestore(product) {
  if (!db || !product) return;
  db.collection('products').doc(product.id).set(product, { merge: true }).catch(e => {
    console.warn('Gagal sinkron produk ke Firestore:', e);
  });
}

function syncSellerAdToFirestore(ad) {
  if (!db || !ad) return;
  db.collection('seller_ads').doc(ad.id).set(ad, { merge: true }).catch(e => {
    console.warn('Gagal sinkron iklan ke Firestore:', e);
  });
}

function logWhatsAppLeadToFirestore(productId, sellerName) {
  if (!db) return;
  db.collection('leads').add({
    productId: productId || 'unknown',
    seller: sellerName || 'Unknown Seller',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    timestampStr: new Date().toISOString()
  }).catch(() => {});
}

// Inisialisasi Firebase langsung saat script dieksekusi dan backup saat window load
initFirebase();
window.addEventListener('load', () => {
  if (!isFirebaseReady) initFirebase();
});

// ===================================================================
// DATASETS: PRODUK LOKAL TERKURASI
// ===================================================================
const FLASH_SALE_PRODUCTS = [
  {
    id: 'fs-1',
    title: 'Kopi Arabika Gayo Single Origin 250g Roast Beans',
    category: 'kopi',
    categoryLabel: 'Kopi & Kuliner Nusantara',
    seller: 'Kopia Artisan Roast',
    location: 'Takengon, Aceh',
    phone: '6285771624349',
    originalPrice: 165000,
    promoPrice: 89000,
    discount: 46,
    rating: 5.0,
    reviews: 184,
    badge: 'Diskon 46%',
    usp: ['Bisa COD', 'Kurasi Kopia', 'Fresh Roasted'],
    variants: ['Biji Utuh (Roast Beans)', 'Bubuk Halus (Espresso/Tubruk)', 'Bubuk Kasar (Manual Brew/V60)'],
    soldPercent: 88,
    stockLeft: 4,
    img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=700&q=80',
    reviewQuote: 'Aroma floral dan acidity-nya seimbang banget! Chat WA admin ramah banget, kirim ke Jakarta 2 hari sampai, COD lancar.',
    reviewerName: 'Bambang Wicaksono • Jakarta Selatan',
    marketplaceName: 'Shopee Official Store Kopia',
    marketplaceUrl: 'https://shopee.co.id',
    description: 'Biji kopi pilihan varietas Typica dan Bourbon dari dataran tinggi Gayo (1.500 mdpl). Diproses wash secara teliti dan di-roast medium profil untuk mengeluarkan notes karamel, peach, dan aftertaste cokelat bersih.'
  },
  {
    id: 'fs-2',
    title: 'Kemeja Linen Pria Casual Premium Adem & Halus',
    category: 'fashion',
    categoryLabel: 'Fashion Lokal',
    seller: 'Heritage Thread Bandung',
    location: 'Bandung',
    phone: '6285771624349',
    originalPrice: 285000,
    promoPrice: 149000,
    discount: 48,
    rating: 4.9,
    reviews: 142,
    badge: 'Diskon 48%',
    usp: ['Bisa COD', 'Bahan Katun Linen', 'Garansi Retur Size'],
    variants: ['Size M (Lebar 52cm)', 'Size L (Lebar 55cm)', 'Size XL (Lebar 58cm)'],
    soldPercent: 92,
    stockLeft: 3,
    img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80',
    reviewQuote: 'Jahitannya rapi standar garmen distro, bahannya adem dipakai di cuaca panas. Admin respon WA-nya cuma 1 menit!',
    reviewerName: 'Dimas Prasetyo • Surabaya',
    marketplaceName: 'Tokopedia Official Heritage',
    marketplaceUrl: 'https://tokopedia.com',
    description: 'Kemeja pria kasual berpotongan modern regular fit dari material premium pure linen blend. Lembut di kulit, menyerap keringat maksimal, dan tidak mudah kusut saat dipakai beraktivitas seharian.'
  },
  {
    id: 'fs-3',
    title: 'Serum Brightening Niacinamide 10% + Centella Alami',
    category: 'beauty',
    categoryLabel: 'Kecantikan Alami',
    seller: 'Glow Botanica Herbal',
    location: 'Yogyakarta',
    phone: '6285771624349',
    originalPrice: 189000,
    promoPrice: 99000,
    discount: 47,
    rating: 5.0,
    reviews: 236,
    badge: 'Diskon 47%',
    usp: ['Bisa COD', 'BPOM NA1823010', 'Non-Alkohol'],
    variants: ['Kemasan 20ml Travel Size', 'Kemasan 50ml Reguler Hemat'],
    soldPercent: 79,
    stockLeft: 8,
    img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=700&q=80',
    reviewQuote: 'Bekas jerawat memudar dalam 2 minggu pemakaian! Senang beli di sini karena langsung terhubung ke owner-nya tanpa fee tambahan.',
    reviewerName: 'Nadia Safitri • Semarang',
    marketplaceName: 'Shopee Mall Glow Botanica',
    marketplaceUrl: 'https://shopee.co.id',
    description: 'Serum konsentrat pencerah wajah dengan Niacinamide grade farmasi dan ekstrak pegagan (Centella Asiatica) lokal lereng Merapi. Membantu meratakan tekstur kulit dan mencerahkan flek hitam secara natural.'
  },
  {
    id: 'fs-4',
    title: 'Dompet Kulit Sapi Asli Garut Pull-Up Bifold Slim',
    category: 'fashion',
    categoryLabel: 'Kriya Kulit & Aksesoris',
    seller: 'Garut Leather Atelier',
    location: 'Garut',
    phone: '6285771624349',
    originalPrice: 250000,
    promoPrice: 135000,
    discount: 46,
    rating: 4.9,
    reviews: 110,
    badge: 'Diskon 46%',
    usp: ['Bisa COD', 'Garansi Kulit Asli', '8 Slot Kartu'],
    variants: ['Warna Cokelat Havana Klasik', 'Warna Hitam Vintage'],
    soldPercent: 68,
    stockLeft: 12,
    img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=700&q=80',
    reviewQuote: 'Bau khas kulit sapinya mantap, finishing halus dan ramping masuk kantong celana. Worth it banget harganya!',
    reviewerName: 'Rian Ardiansyah • Bandung',
    marketplaceName: 'Website Resmi Pengrajin Garut',
    marketplaceUrl: 'https://tokopedia.com',
    description: 'Dibuat tangan oleh pengrajin kulit legendaris Sukaregang, Garut. Menggunakan kulit sapi jenis Pull-Up grade A yang semakin berkarakter dan mengilap seiring pemakaian bertahun-tahun.'
  }
];

let CATALOG_PRODUCTS = [
  {
    id: 'cat-1',
    title: 'Kopi Fine Robusta Temanggung Wine Process 250g',
    category: 'kopi',
    categoryLabel: 'Kopi & Kuliner Nusantara',
    seller: 'Kopia Sindoro Roastery',
    location: 'Temanggung, Jateng',
    phone: '6285771624349',
    originalPrice: 135000,
    promoPrice: 79000,
    discount: 41,
    rating: 5.0,
    reviews: 168,
    verified: true,
    cod: true,
    freeShipping: true,
    popularity: 98,
    responseTime: '1 Mnt',
    variants: ['Biji Sangrai Utuh', 'Bubuk Seduh Tubruk', 'Drip Bag Sachet (Isi 5)'],
    img: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=700&q=80',
    reviewQuote: 'Robusta terenak yang pernah saya seduh! Fermentasi wine-nya harum buah nangka dan cokelat pekat. Seller ramah pol.',
    reviewerName: 'Arif Hidayat • Malang',
    marketplaceName: 'Shopee Official Kopia Temanggung',
    marketplaceUrl: 'https://shopee.co.id',
    description: 'Fine Robusta lereng Gunung Sindoro dengan teknik pascapanen Anaerobic Wine Fermentation selama 30 hari. Body tebal, aroma rempah eksotis, dan tingkat keasaman lembut yang bersahabat di lambung.'
  },
  {
    id: 'cat-2',
    title: 'Grinder Kopi Manual Conical Burr Stainless 30 Level',
    category: 'home',
    categoryLabel: 'Peralatan Kopi by Kopia',
    seller: 'Kopia Nusantara Equipment',
    location: 'Bandung',
    phone: '6285771624349',
    originalPrice: 420000,
    promoPrice: 249000,
    discount: 40,
    rating: 4.9,
    reviews: 134,
    verified: true,
    cod: true,
    freeShipping: true,
    popularity: 94,
    responseTime: '2 Mnt',
    variants: ['Titanium Grey Edition', 'Matte Black Edition'],
    img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80',
    reviewQuote: 'Putaran burr-nya enteng banget dan hasil gilingannya sangat konsisten untuk V60 maupun Mokapot. Rekomended!',
    reviewerName: 'Ferry Gunawan • Jakarta Barat',
    marketplaceName: 'Tokopedia Official Kopia Store',
    marketplaceUrl: 'https://tokopedia.com',
    description: 'Hand grinder portabel berbahan bodi aluminium alloy kokoh dengan mata conical burr stainless steel CNC 420. Pengaturan presisi 30 klik dari espresso halus hingga French press kasar.'
  },
  {
    id: 'cat-3',
    title: 'Madu Hutan Murni Asli Sumbawa Raw Honey 500g',
    category: 'kopi',
    categoryLabel: 'Kopi & Kuliner Nusantara',
    seller: 'Madu Rimba Sumbawa',
    location: 'Sumbawa, NTB',
    phone: '6285771624349',
    originalPrice: 175000,
    promoPrice: 119000,
    discount: 32,
    rating: 5.0,
    reviews: 212,
    verified: true,
    cod: true,
    freeShipping: false,
    popularity: 91,
    responseTime: '3 Mnt',
    variants: ['Kemasan Jar Kaca 500g', 'Kemasan Jar Jumbo 1000g'],
    img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=700&q=80',
    reviewQuote: 'Madu murni tanpa campuran pemanis, terasa khasiatnya untuk jaga imunitas keluarga. COD cepat sampai!',
    reviewerName: 'Siti Aminah • Bekasi',
    marketplaceName: 'Website Resmi Peternak Sumbawa',
    marketplaceUrl: 'https://shopee.co.id',
    description: 'Madu mentah (raw honey) langsung dari sarang lebah raksasa Apis Dorsata di hutan belantara Sumbawa. Tanpa proses pasteurisasi berlebih sehingga kandungan enzim diastase dan antioksidan tetap utuh.'
  },
  {
    id: 'cat-4',
    title: 'Heavyweight Cotton Oversized T-Shirt 240 GSM Combed',
    category: 'fashion',
    categoryLabel: 'Fashion Lokal',
    seller: 'Urban Craft Apparel',
    location: 'Jakarta Selatan',
    phone: '6285771624349',
    originalPrice: 199000,
    promoPrice: 119000,
    discount: 40,
    rating: 4.9,
    reviews: 178,
    verified: true,
    cod: true,
    freeShipping: true,
    popularity: 88,
    responseTime: '2 Mnt',
    variants: ['Size M (Oversized Boxy)', 'Size L (Oversized Boxy)', 'Size XL (Oversized Boxy)'],
    img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80',
    reviewQuote: 'Kain combed 240 GSM-nya tebal tapi gak bikin gerah. Pola boxy cut-nya pas banget di badan, kerah kokoh.',
    reviewerName: 'Rendy Kurniawan • Tangerang',
    marketplaceName: 'Shopee Mall Urban Craft',
    marketplaceUrl: 'https://shopee.co.id',
    description: 'Kaos kasual streetwear lokal dengan pola boxy oversized kontemporer. Menggunakan 100% katun combed 240 GSM bersertifikasi Oeko-Tex dengan jahitan rantai pundak ganda tahan lama.'
  },
  {
    id: 'cat-5',
    title: 'Jaket Harrington Kanvas Heritage Nusantara Katun Twill',
    category: 'fashion',
    categoryLabel: 'Fashion Lokal',
    seller: 'Solo Heritage Atelier',
    location: 'Surakarta (Solo)',
    phone: '6285771624349',
    originalPrice: 380000,
    promoPrice: 228000,
    discount: 40,
    rating: 4.9,
    reviews: 96,
    verified: true,
    cod: true,
    freeShipping: true,
    popularity: 93,
    responseTime: '3 Mnt',
    variants: ['Size M (Chest 54cm)', 'Size L (Chest 57cm)', 'Size XL (Chest 60cm)'],
    img: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=700&q=80',
    reviewQuote: 'Furing motif tartan nusantara di dalamnya mewah banget! Resleting YKK lancar, cocok buat riding harian.',
    reviewerName: 'Budi Santoso • Yogyakarta',
    marketplaceName: 'Tokopedia Solo Heritage',
    marketplaceUrl: 'https://tokopedia.com',
    description: 'Jaket model Harrington klasik dari bahan katun twill tebal berserat rapat dengan furing katun adem. Dilengkapi saku dalam fungsional, kerah kancing ganda, dan rib pinggang elastis.'
  },
  {
    id: 'cat-6',
    title: 'Diffuser Kayu Jati Aromaterapi + 3 Minyak Atsiri Alami',
    category: 'home',
    categoryLabel: 'Rumah & Kriya Kayu',
    seller: 'Jepara Wood Craft',
    location: 'Jepara',
    phone: '6285771624349',
    originalPrice: 295000,
    promoPrice: 159000,
    discount: 46,
    rating: 4.8,
    reviews: 140,
    verified: true,
    cod: true,
    freeShipping: false,
    popularity: 95,
    responseTime: '4 Mnt',
    variants: ['Paket 3 Minyak Atsiri (Lavender, Sereh, Kayu Putih)', 'Paket 5 Minyak Atsiri Lengkap'],
    img: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=700&q=80',
    reviewQuote: 'Estetik banget ditaruh di meja kerja! Uapnya halus, minyak atsiri lavender dan serai wanginya bikin rileks.',
    reviewerName: 'Dewi Lestari • Jakarta Pusat',
    marketplaceName: 'Shopee Official Jepara Craft',
    marketplaceUrl: 'https://shopee.co.id',
    description: 'Diffuser ultrasonik bodi motif kayu jati alami kapasitas 500ml dengan lampu ambient LED 7 warna. Paket bundling sudah termasuk botol essential oil atsiri murni nusantara.'
  },
  {
    id: 'cat-7',
    title: 'Hybrid Sunscreen SPF 50+ No Whitecast Alami 50ml',
    category: 'beauty',
    categoryLabel: 'Kecantikan Alami',
    seller: 'DermaLokal Natural',
    location: 'Malang',
    phone: '6285771624349',
    originalPrice: 155000,
    promoPrice: 95000,
    discount: 38,
    rating: 4.9,
    reviews: 162,
    verified: true,
    cod: true,
    freeShipping: true,
    popularity: 89,
    responseTime: '1 Mnt',
    variants: ['Tube 50ml Satuan', 'Bundling Hemat 2 x 50ml (Gratis Pouch)'],
    img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=700&q=80',
    reviewQuote: 'Gak lengket sama sekali di kulit berminyak, no whitecast dan aman buat wudhu. Transaksi lewat WA cepat & praktis.',
    reviewerName: 'Intan Permata • Bogor',
    marketplaceName: 'Tokopedia DermaLokal Official',
    marketplaceUrl: 'https://tokopedia.com',
    description: 'Tabir surya harian formula hybrid water-burst dengan perlindungan UV spektrum luas SPF 50+ PA++++. Diperkaya ekstrak teh hijau dan lidah buaya lokal untuk menenangkan kulit terbakar sinar matahari.'
  },
  {
    id: 'cat-8',
    title: 'Mechanical Keyboard Wood Case 75% Custom Hot-Swap',
    category: 'gadget',
    categoryLabel: 'Gadget & Kreatif Lokal',
    seller: 'LokalMod Tech Lab',
    location: 'Jakarta Barat',
    phone: '6285771624349',
    originalPrice: 850000,
    promoPrice: 495000,
    discount: 41,
    rating: 5.0,
    reviews: 84,
    verified: true,
    cod: true,
    freeShipping: true,
    popularity: 92,
    responseTime: '2 Mnt',
    variants: ['Gateron Yellow Linear (Thocky Suara Halus)', 'Gateron Brown Tactile (Paling Seimbang)'],
    img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80',
    reviewQuote: 'Case kayu mahoni buat suara ngetiknya jadi thocky empuk! Tri-mode koneksi lancar jaya, modding rapi sekali.',
    reviewerName: 'Aditya Pratama • Depok',
    marketplaceName: 'Shopee Official LokalMod',
    marketplaceUrl: 'https://shopee.co.id',
    description: 'Keyboard mekanikal kustom dengan casing kayu mahoni solid garapan perajin lokal. PCB 75% hot-swappable 5-pin, peredam suara poron foam, dan dukungan koneksi Bluetooth 5.0, 2.4Ghz, serta kabel USB-C.'
  }
];

// Active Filter States
let currentCategory = 'all';
let currentSort = 'discount';
let activeFilters = {
  cod: false,
  freeShipping: false,
  verified: true
};
let currentSearchTerm = '';
let activeModalProduct = null;
let activeSelectedVariant = '';

// Wishlist / Favorit Disimpan (Local Storage)
let FAVORITES = [];
try {
  FAVORITES = JSON.parse(localStorage.getItem('kopia_favorites') || '[]');
} catch (e) {
  FAVORITES = [];
}

// Currency Formatter
function formatRupiah(number) {
  return 'Rp ' + Number(number).toLocaleString('id-ID');
}

// ===================================================================
// FLASH SALE COUNTDOWN TIMER
// ===================================================================
function initFlashSaleTimer() {
  let secondsRemaining = 4 * 3600 + 35 * 60 + 12;
  const hoursEl = document.getElementById('fs-hours');
  const minutesEl = document.getElementById('fs-minutes');
  const secondsEl = document.getElementById('fs-seconds');

  setInterval(() => {
    if (secondsRemaining > 0) {
      secondsRemaining--;
      const h = Math.floor(secondsRemaining / 3600);
      const m = Math.floor((secondsRemaining % 3600) / 60);
      const s = secondsRemaining % 60;

      if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
      if (minutesEl) minutesEl.textContent = String(m).padStart(2, '0');
      if (secondsEl) secondsEl.textContent = String(s).padStart(2, '0');
    }
  }, 1000);
}

// ===================================================================
// WISHLIST / FAVORIT MANAGEMENT
// ===================================================================
function isFavorite(productId) {
  return FAVORITES.includes(productId);
}

function saveFavorites() {
  try {
    localStorage.setItem('kopia_favorites', JSON.stringify(FAVORITES));
  } catch (e) {}
  updateWishlistBadge();
}

function updateWishlistBadge() {
  const badge1 = document.getElementById('headerWishlistCount');
  if (badge1) badge1.textContent = FAVORITES.length;

  const subtitle = document.getElementById('drawerWishlistSubtitle');
  if (subtitle) {
    subtitle.textContent = `${FAVORITES.length} produk promo ditandai`;
  }
}

function toggleFavorite(productId, event) {
  if (event) event.stopPropagation();
  const index = FAVORITES.indexOf(productId);
  let isNowFav = false;

  if (index > -1) {
    FAVORITES.splice(index, 1);
    isNowFav = false;
    showToast('Produk dihapus dari daftar disimpan');
  } else {
    FAVORITES.push(productId);
    isNowFav = true;
    showToast('❤️ Produk berhasil disimpan ke daftar favorit!');
  }

  saveFavorites();
  renderFlashSale();
  renderCatalog();
  renderWishlistDrawer();

  // If modal is open on this product, update modal fav button
  if (activeModalProduct && activeModalProduct.id === productId) {
    updateModalFavButton(isNowFav);
  }
}

function toggleFavoriteActiveProduct() {
  if (!activeModalProduct) return;
  toggleFavorite(activeModalProduct.id);
}

function updateModalFavButton(isFav) {
  const icon = document.getElementById('modalFavIcon');
  const text = document.getElementById('modalFavText');
  const btn = document.getElementById('btnModalFavorite');
  if (!icon || !text || !btn) return;

  if (isFav) {
    icon.textContent = 'favorite';
    text.textContent = 'Tersimpan';
    btn.classList.add('favorited');
  } else {
    icon.textContent = 'favorite_border';
    text.textContent = 'Simpan';
    btn.classList.remove('favorited');
  }
}

function openWishlistDrawer() {
  const drawer = document.getElementById('wishlistDrawerOverlay');
  if (!drawer) return;
  renderWishlistDrawer();
  drawer.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeWishlistDrawer() {
  const drawer = document.getElementById('wishlistDrawerOverlay');
  if (drawer) drawer.classList.remove('active');
  document.body.style.overflow = '';
}

function handleDrawerOverlayClick(e) {
  if (e.target && e.target.classList.contains('drawer-overlay')) {
    closeWishlistDrawer();
  }
}

function clearAllFavorites() {
  if (FAVORITES.length === 0) {
    showToast('Daftar favorit sudah kosong.');
    return;
  }
  if (confirm('Yakin ingin mengosongkan semua produk yang disimpan?')) {
    FAVORITES = [];
    saveFavorites();
    renderFlashSale();
    renderCatalog();
    renderWishlistDrawer();
    showToast('Semua produk favorit telah dihapus.');
  }
}

function renderWishlistDrawer() {
  const container = document.getElementById('drawerWishlistBody');
  if (!container) return;

  const allProducts = [...FLASH_SALE_PRODUCTS, ...CATALOG_PRODUCTS];
  const favItems = allProducts.filter(p => FAVORITES.includes(p.id));

  if (favItems.length === 0) {
    container.innerHTML = `
      <div class="empty-wishlist-state">
        <span class="material-symbols-outlined">favorite_border</span>
        <h4 style="font-size:16px; font-weight:800; color:var(--on-surface);">Belum Ada Produk Tersimpan</h4>
        <p style="font-size:13px; color:var(--text-muted); margin-top:6px; line-height:1.5;">
          Klik ikon hati (❤️) pada produk yang kamu minati untuk membandingkan dan memesan nanti.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = favItems.map(p => `
    <div class="drawer-fav-item">
      <img src="${p.img}" alt="${p.title}" class="drawer-fav-img" onclick="closeWishlistDrawer(); openProductDetailModal('${p.id}', ${p.id.startsWith('fs')});">
      <div class="drawer-fav-info">
        <div>
          <span style="font-size:11px; color:var(--text-muted); font-weight:700;">${p.seller}</span>
          <h4 class="drawer-fav-title" onclick="closeWishlistDrawer(); openProductDetailModal('${p.id}', ${p.id.startsWith('fs')});" title="${p.title}">
            ${p.title.length > 40 ? p.title.substring(0, 40) + '...' : p.title}
          </h4>
        </div>
        <div class="drawer-fav-price">${formatRupiah(p.promoPrice)}</div>
        <div class="drawer-fav-actions">
          <button type="button" class="btn-fav-order-wa" onclick="openWhatsAppCheckout('${p.title}', '${formatRupiah(p.promoPrice)}', '${p.seller}', '${p.phone}', '${p.variants ? p.variants[0] : ''}')">
            <span class="material-symbols-outlined" style="font-size:14px;">chat</span>
            <span>Order WA</span>
          </button>
          <button type="button" class="btn-fav-delete" onclick="toggleFavorite('${p.id}')" title="Hapus dari tersimpan">
            <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ===================================================================
// RENDER FLASH SALE PRODUCTS
// ===================================================================
function renderFlashSale() {
  const container = document.getElementById('flashSaleGrid');
  if (!container) return;

  container.innerHTML = FLASH_SALE_PRODUCTS.map(p => `
    <article class="product-card" id="card-${p.id}">
      <div class="product-card-img-wrap" onclick="openProductDetailModal('${p.id}', true)" style="cursor:pointer;" title="Klik untuk lihat Halaman Produk Cepat">
        <img src="${p.img}" alt="${p.title}" loading="lazy">
        <span class="badge-discount-tag">-${p.discount}%</span>
        <div class="badge-rating-pill">
          <span class="material-symbols-outlined fill-icon">star</span>
          <span>${p.rating}</span>
        </div>
        <div class="badge-location-pill">
          <span class="material-symbols-outlined">location_on</span>
          <span>${p.location}</span>
        </div>
      </div>
      <div class="product-card-body">
        <div class="product-seller-meta">
          <span class="seller-name">
            <span class="material-symbols-outlined">verified</span>
            ${p.seller}
          </span>
          <span style="font-size:11px; color:var(--text-muted);">${p.reviews} ulasan</span>
        </div>
        <h3 class="product-card-title" onclick="openProductDetailModal('${p.id}', true)" style="cursor:pointer;" title="${p.title}">${p.title}</h3>
        <div class="product-price-block">
          <span class="price-original">${formatRupiah(p.originalPrice)}</span>
          <div class="price-promo">${formatRupiah(p.promoPrice)}</div>
        </div>
        <div class="product-badges-row">
          <span class="mini-badge emerald">Bisa COD</span>
          <span class="mini-badge">${p.usp[1] || 'Kurasi Kopia'}</span>
        </div>
        <div class="stock-progress-wrap">
          <div class="stock-progress-labels">
            <span>Terjual ${p.soldPercent}%</span>
            <span class="stock-urgent">Sisa ${p.stockLeft} pcs!</span>
          </div>
          <div class="stock-bar-track">
            <div class="stock-bar-fill" style="width: ${p.soldPercent}%;"></div>
          </div>
        </div>
        <div class="product-card-actions">
          <button type="button" class="btn-card-action-wa" onclick="openWhatsAppCheckout('${p.title}', '${formatRupiah(p.promoPrice)}', '${p.seller}', '${p.phone}', '${p.variants ? p.variants[0] : ''}')">
            <span class="material-symbols-outlined" style="font-size:16px;">chat</span>
            <span>Chat WA</span>
          </button>
          <button type="button" class="btn-card-action-detail" onclick="openProductDetailModal('${p.id}', true)">
            <span class="material-symbols-outlined" style="font-size:16px;">visibility</span>
            <span>Lihat Promo</span>
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

// ===================================================================
// FILTER & RENDER CATALOG PRODUCTS
// ===================================================================
function getFilteredCatalog() {
  let list = [...CATALOG_PRODUCTS];

  // Search filter
  if (currentSearchTerm.trim() !== '') {
    const term = currentSearchTerm.toLowerCase();
    list = list.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.seller.toLowerCase().includes(term) ||
      p.location.toLowerCase().includes(term) ||
      p.categoryLabel.toLowerCase().includes(term)
    );
  }

  // Category filter
  if (currentCategory !== 'all') {
    list = list.filter(p => p.category === currentCategory);
  }

  // Active pills filter
  if (activeFilters.cod) {
    list = list.filter(p => p.cod);
  }
  if (activeFilters.freeShipping) {
    list = list.filter(p => p.freeShipping);
  }
  if (activeFilters.verified) {
    list = list.filter(p => p.verified);
  }

  // Sort
  if (currentSort === 'discount') {
    list.sort((a, b) => b.discount - a.discount);
  } else if (currentSort === 'popular') {
    list.sort((a, b) => b.popularity - a.popularity);
  } else if (currentSort === 'cheapest') {
    list.sort((a, b) => a.promoPrice - b.promoPrice);
  } else if (currentSort === 'response') {
    list.sort((a, b) => parseInt(a.responseTime) - parseInt(b.responseTime));
  }

  return list;
}

function updateActiveFilterIndicator() {
  const rowEl = document.getElementById('activeFilterChipsRow');
  const chipsList = document.getElementById('activeChipsList');
  if (!rowEl || !chipsList) return;

  const chips = [];

  if (currentCategory !== 'all') {
    const catLabels = {
      kopi: 'Kopi & Kuliner',
      fashion: 'Fashion Lokal',
      beauty: 'Kecantikan Alami',
      home: 'Rumah & Kriya',
      gadget: 'Gadget & Kreatif'
    };
    chips.push({
      label: `Kategori: ${catLabels[currentCategory] || currentCategory}`,
      onRemove: () => selectCategory('all')
    });
  }

  if (currentSearchTerm.trim() !== '') {
    chips.push({
      label: `Cari: "${currentSearchTerm}"`,
      onRemove: () => clearCatalogSearch()
    });
  }

  if (activeFilters.cod) {
    chips.push({
      label: 'Bisa COD',
      onRemove: () => {
        activeFilters.cod = false;
        const btn = document.querySelector('.filter-pill-btn[data-filter="cod"]');
        if (btn) btn.classList.remove('active');
        renderCatalog();
      }
    });
  }

  if (activeFilters.freeShipping) {
    chips.push({
      label: 'Gratis Ongkir',
      onRemove: () => {
        activeFilters.freeShipping = false;
        const btn = document.querySelector('.filter-pill-btn[data-filter="freeShipping"]');
        if (btn) btn.classList.remove('active');
        renderCatalog();
      }
    });
  }

  if (chips.length > 0) {
    rowEl.style.display = 'flex';
    chipsList.innerHTML = chips.map((c, i) => `
      <span class="active-chip-tag">
        <span>${c.label}</span>
        <button type="button" onclick="activeFilterRemoveCallbacks[${i}]()" aria-label="Hapus filter">
          <span class="material-symbols-outlined" style="font-size:14px;">close</span>
        </button>
      </span>
    `).join('');
    window.activeFilterRemoveCallbacks = chips.map(c => c.onRemove);
  } else {
    rowEl.style.display = 'none';
  }
}

function renderCatalog() {
  const container = document.getElementById('catalogGrid');
  const countEl = document.getElementById('catalogDisplayCount');
  if (!container) return;

  updateActiveFilterIndicator();
  const filtered = getFilteredCatalog();

  if (countEl) {
    countEl.innerHTML = `Menampilkan <strong style="color:var(--on-surface);">${filtered.length}</strong> produk promo lokal`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background:#fff; border-radius:16px; border:1px solid var(--border-subtle);">
        <span class="material-symbols-outlined" style="font-size: 54px; color: var(--outline);">search_off</span>
        <h3 style="font-size: 20px; font-weight: 700; margin-top: 12px;">Produk Lokal Tidak Ditemukan</h3>
        <p style="color: var(--text-muted); font-size: 14px; margin-top: 4px;">Coba ubah kata kunci pencarian atau reset filter kategori di atas.</p>
        <button type="button" onclick="resetFilters()" style="margin-top: 16px; padding: 10px 22px; border-radius: 9999px; background: var(--primary); color: #fff; font-weight: 700; font-size: 13px;">
          Reset Semua Filter
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(p => `
    <article class="product-card" id="card-${p.id}">
      <div class="product-card-img-wrap" onclick="openProductDetailModal('${p.id}', false)" style="cursor:pointer;" title="Klik untuk buka Halaman Produk Cepat">
        <img src="${p.img}" alt="${p.title}" loading="lazy">
        <span class="badge-discount-tag">Hemat ${p.discount}%</span>
        <div class="badge-rating-pill">
          <span class="material-symbols-outlined fill-icon">star</span>
          <span>${p.rating}</span>
        </div>
        <div class="badge-location-pill">
          <span class="material-symbols-outlined">location_on</span>
          <span>${p.location}</span>
        </div>
      </div>
      <div class="product-card-body">
        <div class="product-seller-meta">
          <span class="seller-name">
            <span class="material-symbols-outlined">verified</span>
            ${p.seller}
          </span>
          <span style="font-size:11px; color:var(--text-muted);">${p.reviews} ulasan</span>
        </div>
        <h3 class="product-card-title" onclick="openProductDetailModal('${p.id}', false)" style="cursor:pointer;" title="${p.title}">${p.title}</h3>
        <div class="product-price-block">
          <span class="price-original">${formatRupiah(p.originalPrice)}</span>
          <div class="price-promo">${formatRupiah(p.promoPrice)}</div>
        </div>
        <div class="product-badges-row">
          ${p.cod ? '<span class="mini-badge emerald">Bisa COD</span>' : ''}
          ${p.freeShipping ? '<span class="mini-badge">Gratis Ongkir</span>' : ''}
          <span class="mini-badge">Respon ${p.responseTime}</span>
        </div>
        <div class="product-card-actions">
          <button type="button" class="btn-card-action-wa" onclick="openWhatsAppCheckout('${p.title}', '${formatRupiah(p.promoPrice)}', '${p.seller}', '${p.phone}', '${p.variants ? p.variants[0] : ''}')">
            <span class="material-symbols-outlined" style="font-size:16px;">chat</span>
            <span>Chat WA</span>
          </button>
          <button type="button" class="btn-card-action-detail" onclick="openProductDetailModal('${p.id}', false)">
            <span class="material-symbols-outlined" style="font-size:16px;">visibility</span>
            <span>Lihat Promo</span>
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

// ===================================================================
// QUICK PRODUCT DETAIL MODAL (HALAMAN PRODUK CEPAT & DIRECT PURCHASE)
// ===================================================================
function openProductDetailModal(productId, isFlashSale = false) {
  const allProducts = [...FLASH_SALE_PRODUCTS, ...CATALOG_PRODUCTS];
  const product = allProducts.find(p => p.id === productId);
  if (!product) {
    showToast('Produk tidak ditemukan');
    return;
  }

  activeModalProduct = product;
  activeSelectedVariant = (product.variants && product.variants.length > 0) ? product.variants[0] : 'Standar';

  const modal = document.getElementById('quickDetailModal');
  if (!modal) return;

  // 1. Image & Discount Tag
  const imgEl = document.getElementById('modalDetailImg');
  if (imgEl) {
    imgEl.src = product.img;
    imgEl.alt = product.title;
  }
  const discountBadge = document.getElementById('modalDetailDiscountBadge');
  if (discountBadge) {
    discountBadge.textContent = `-${product.discount}% PROMO`;
  }

  // 2. Title & Seller Meta
  const titleEl = document.getElementById('modalDetailTitle');
  if (titleEl) titleEl.textContent = product.title;

  const sellerEl = document.getElementById('modalDetailSeller');
  if (sellerEl) sellerEl.textContent = `${product.seller} • ${product.location}`;

  const ratingEl = document.getElementById('modalDetailRatingNum');
  if (ratingEl) ratingEl.textContent = product.rating;

  const reviewsEl = document.getElementById('modalDetailReviewsCount');
  if (reviewsEl) reviewsEl.textContent = `(${product.reviews} ulasan)`;

  // 3. Pricing & Savings
  const promoPriceEl = document.getElementById('modalDetailPricePromo');
  if (promoPriceEl) promoPriceEl.textContent = formatRupiah(product.promoPrice);

  const origPriceEl = document.getElementById('modalDetailPriceOrig');
  if (origPriceEl) origPriceEl.textContent = formatRupiah(product.originalPrice);

  const discountPillEl = document.getElementById('modalDetailDiscount');
  if (discountPillEl) discountPillEl.textContent = `Hemat ${product.discount}%`;

  const savingsEl = document.getElementById('modalDetailSavings');
  if (savingsEl) {
    const savingsAmount = product.originalPrice - product.promoPrice;
    savingsEl.innerHTML = `Hemat <strong>${formatRupiah(savingsAmount)}</strong> langsung dari produsen lokal!`;
  }

  // 4. Variants Selection
  const variantGrid = document.getElementById('modalVariantChipsGrid');
  const variantBadge = document.getElementById('modalSelectedVariantBadge');
  if (variantGrid) {
    if (product.variants && product.variants.length > 0) {
      variantGrid.innerHTML = product.variants.map((v, i) => `
        <button type="button" class="modal-variant-chip ${i === 0 ? 'active' : ''}" onclick="selectModalVariant('${v.replace(/'/g, "\\'")}', this)">
          <span class="material-symbols-outlined" style="font-size:14px;">check</span>
          <span>${v}</span>
        </button>
      `).join('');
      if (variantBadge) variantBadge.textContent = `Varian: ${activeSelectedVariant}`;
    } else {
      variantGrid.innerHTML = `<span style="font-size:12.5px; color:var(--text-muted); font-style:italic;">Tersedia dalam 1 varian standar resmi.</span>`;
      if (variantBadge) variantBadge.textContent = 'Varian Standar';
    }
  }

  // 5. Review & Social Proof
  const reviewQuoteEl = document.getElementById('modalDetailReviewQuote');
  if (reviewQuoteEl) {
    reviewQuoteEl.textContent = `"${product.reviewQuote || 'Kualitas produknya juara banget, sesuai ekspektasi. Admin WA ramah dan responsif, COD aman tanpa ribet.'}"`;
  }
  const reviewerEl = document.getElementById('modalDetailReviewer');
  if (reviewerEl) {
    reviewerEl.textContent = `— ${product.reviewerName || 'Pembeli Terverifikasi • Indonesia'}`;
  }

  // 6. Description & Official Store
  const descEl = document.getElementById('modalDetailDesc');
  if (descEl) descEl.textContent = product.description;

  const marketLabel = document.getElementById('modalMarketplaceLabel');
  if (marketLabel) marketLabel.textContent = product.marketplaceName || 'Official Store Penjual';

  const waSub = document.getElementById('modalWaSubText');
  if (waSub) waSub.textContent = `Draf chat WhatsApp otomatis untuk varian: ${activeSelectedVariant}`;

  // Update direct wa.me link href (pure frontend)
  updateModalWhatsAppLink();

  // 7. Favorite Button State
  updateModalFavButton(isFavorite(product.id));

  // 8. Open Modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function generateProductWhatsAppUrl(product, variant) {
  if (!product) return '#';
  const cleanPhone = String(product.phone || '6285771624349').replace(/[^0-9]/g, '');
  const variantText = variant ? `\n📌 *Pilihan Varian:* ${variant}` : '';
  const savings = formatRupiah(product.originalPrice - product.promoPrice);

  const message = `Halo Admin *${product.seller}*, saya menemukan promo produk ini di *Produk_lokal by kopia*:\n\n` +
    `🛍️ *Produk:* ${product.title}\n` +
    `💰 *Harga Promo:* ${formatRupiah(product.promoPrice)} (Diskon ${product.discount}%, Hemat ${savings})${variantText}\n` +
    `🚚 *Metode:* Pengiriman langsung / Bisa Bayar di Tempat (COD)\n` +
    `🛡️ *Garansi:* 100% Produk Original & Bebas Saldo Tertahan\n\n` +
    `Apakah stok promo masih tersedia dan bisa dikirim ke alamat saya? Terima kasih!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

function updateModalWhatsAppLink() {
  const linkEl = document.getElementById('modalWaDirectLink');
  if (!linkEl || !activeModalProduct) return;
  linkEl.href = generateProductWhatsAppUrl(activeModalProduct, activeSelectedVariant);
}

function closeProductDetailModal() {
  const modal = document.getElementById('quickDetailModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
  activeModalProduct = null;
}

function handleModalOverlayClick(e) {
  if (e.target && e.target.id === 'quickDetailModal') {
    closeProductDetailModal();
  }
}

function selectModalVariant(variantName, chipEl) {
  activeSelectedVariant = variantName;

  document.querySelectorAll('.modal-variant-chip').forEach(c => c.classList.remove('active'));
  if (chipEl) chipEl.classList.add('active');

  const badge = document.getElementById('modalSelectedVariantBadge');
  if (badge) badge.textContent = `Varian: ${variantName}`;

  const waSub = document.getElementById('modalWaSubText');
  if (waSub) waSub.textContent = `Draf chat WhatsApp otomatis untuk varian: ${variantName}`;

  // Update URL wa.me secara instan di sisi frontend
  updateModalWhatsAppLink();

  showToast(`Varian dipilih: ${variantName}`);
}

function proceedModalWhatsApp(e) {
  if (!activeModalProduct) return;
  const p = activeModalProduct;
  updateModalWhatsAppLink();
  logWhatsAppLeadToFirestore(p.id, p.seller);
  showToast(`Membuka WhatsApp Admin ${p.seller}...`);
  // Jika dieksekusi tanpa native link navigation
  if (!e && document.getElementById('modalWaDirectLink')) {
    window.open(document.getElementById('modalWaDirectLink').href, '_blank');
  }
}

function proceedModalMarketplace() {
  if (!activeModalProduct) return;
  const url = activeModalProduct.marketplaceUrl || 'https://shopee.co.id';
  window.open(url, '_blank');
  showToast(`Membuka ${activeModalProduct.marketplaceName || 'Official Store Penjual'}...`);
}

function openWhatsAppCheckout(title, price, seller, phone, variant) {
  const cleanPhone = String(phone || '6285771624349').replace(/[^0-9]/g, '');
  const selectedVar = variant ? `\n📌 *Varian Terpilih:* ${variant}` : '';
  const message = `Halo Admin *${seller}*, saya melihat promo produk ini di *Produk_lokal by kopia*:\n\n` +
    `🛍️ *Produk:* ${title}\n` +
    `💰 *Harga Promo:* ${price}${selectedVar}\n` +
    `🚚 *Metode:* Pengiriman langsung / Bisa Bayar di Tempat (COD)\n` +
    `🛡️ *Garansi:* 100% Produk Original\n\n` +
    `Apakah stok promo masih tersedia dan bisa dikirim ke alamat saya? Terima kasih!`;

  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  logWhatsAppLeadToFirestore(title, seller);
  window.open(url, '_blank');
  showToast(`Membuka WhatsApp Admin ${seller}...`);
}

function copySellerPhone() {
  if (!activeModalProduct) return;
  const phone = activeModalProduct.phone || '6285771624349';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(phone).then(() => {
      showToast(`📞 No. WhatsApp Admin ${activeModalProduct.seller} disalin: 0857-7162-4349 (+${phone})`);
    }).catch(() => {
      prompt('Salin nomor WhatsApp penjual:', phone);
    });
  } else {
    prompt('Salin nomor WhatsApp penjual:', phone);
  }
}

function copyOrderDraftToClipboard() {
  if (!activeModalProduct) return;
  const p = activeModalProduct;
  const variantText = activeSelectedVariant ? `\n📌 *Pilihan Varian:* ${activeSelectedVariant}` : '';
  const message = `Halo Admin *${p.seller}*, saya menemukan promo produk ini di *Produk_lokal by kopia*:\n\n` +
    `🛍️ *Produk:* ${p.title}\n` +
    `💰 *Harga Promo:* ${formatRupiah(p.promoPrice)} (Diskon ${p.discount}%)${variantText}\n` +
    `🚚 *Metode:* Pengiriman langsung / Bisa Bayar di Tempat (COD)\n\n` +
    `Apakah stok promo masih tersedia dan bisa dikirim ke alamat saya? Terima kasih!`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(message).then(() => {
      showToast('📋 Draf pesanan WhatsApp berhasil disalin ke clipboard!');
    }).catch(() => {
      showToast('Draf pesanan siap dikirim via WhatsApp.');
    });
  } else {
    showToast('Draf pesanan siap dikirim via WhatsApp.');
  }
}

function shareCurrentProduct() {
  if (!activeModalProduct) return;
  const p = activeModalProduct;
  const shareData = {
    title: `${p.title} - Produk_lokal by kopia`,
    text: `Promo hemat ${p.discount}% dari produsen: ${p.title} (${formatRupiah(p.promoPrice)})`,
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('🔗 Link produk lokal berhasil disalin ke clipboard!');
    });
  } else {
    showToast('Link siap dibagikan.');
  }
}

// ===================================================================
// INTERACTIVE SEARCH & FILTER CONTROLS
// ===================================================================
function triggerSearch(source) {
  let val = '';
  if (source === 'header') {
    const el = document.getElementById('headerSearchInput');
    if (el) val = el.value.trim();
  } else if (source === 'hero') {
    const el = document.getElementById('heroSearchInput');
    if (el) val = el.value.trim();
  } else if (source === 'catalog') {
    const el = document.getElementById('catalogSearchInput');
    if (el) val = el.value.trim();
  } else if (typeof source === 'string') {
    val = source.trim();
  }

  handleSearch(val);

  const etalase = document.getElementById('etalaseSection');
  if (etalase) {
    etalase.scrollIntoView({ behavior: 'smooth' });
  }

  if (val !== '') {
    showToast(`🔍 Menampilkan hasil pencarian produk lokal: "${val}"`);
  }
}

function handleSearch(term) {
  currentSearchTerm = term || '';
  syncSearchInputs(currentSearchTerm);
  renderCatalog();
}

function syncSearchInputs(term) {
  const i1 = document.getElementById('heroSearchInput');
  const i2 = document.getElementById('headerSearchInput');
  const i3 = document.getElementById('catalogSearchInput');
  const clearBtn = document.getElementById('btnCatalogSearchClear');

  if (i1 && i1.value !== term) i1.value = term;
  if (i2 && i2.value !== term) i2.value = term;
  if (i3 && i3.value !== term) i3.value = term;

  if (clearBtn) {
    clearBtn.style.display = term ? 'flex' : 'none';
  }
}

function clearCatalogSearch() {
  triggerSearch('');
}

function selectCategory(categoryKey) {
  currentCategory = categoryKey;

  document.querySelectorAll('.category-card-btn').forEach(btn => {
    if (btn.getAttribute('data-category') === categoryKey) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  renderCatalog();

  const etalase = document.getElementById('etalaseSection');
  if (etalase) {
    etalase.scrollIntoView({ behavior: 'smooth' });
  }

  const catNames = {
    all: 'Semua Kategori',
    kopi: 'Kopi & Kuliner Nusantara',
    fashion: 'Fashion Lokal',
    beauty: 'Kecantikan Alami',
    home: 'Rumah & Kriya Kayu',
    gadget: 'Gadget & Kreatif Lokal'
  };
  showToast(`Kategori: ${catNames[categoryKey] || categoryKey}`);
}

function filterByTag(tagName) {
  if (tagName === 'COD') {
    activeFilters.cod = true;
    const btn = document.querySelector('.filter-pill-btn[data-filter="cod"]');
    if (btn) btn.classList.add('active');
    renderCatalog();
    document.getElementById('etalaseSection').scrollIntoView({ behavior: 'smooth' });
    showToast('Memfilter produk lokal dengan opsi Bayar di Tempat (COD)');
    return;
  }
  if (tagName === 'Gratis Ongkir') {
    activeFilters.freeShipping = true;
    const btn = document.querySelector('.filter-pill-btn[data-filter="freeShipping"]');
    if (btn) btn.classList.add('active');
    renderCatalog();
    document.getElementById('etalaseSection').scrollIntoView({ behavior: 'smooth' });
    showToast('Memfilter produk lokal dengan Gratis Ongkir');
    return;
  }

  triggerSearch(tagName);
}

function togglePillFilter(btnEl, filterKey) {
  if (typeof activeFilters[filterKey] !== 'undefined') {
    activeFilters[filterKey] = !activeFilters[filterKey];
    if (btnEl) {
      btnEl.classList.toggle('active', activeFilters[filterKey]);
    }
    renderCatalog();

    const filterLabels = {
      cod: 'Bayar di Tempat (COD)',
      freeShipping: 'Gratis Ongkir',
      verified: 'Toko Terverifikasi'
    };
    const status = activeFilters[filterKey] ? 'diaktifkan' : 'dinonaktifkan';
    showToast(`Filter ${filterLabels[filterKey]} ${status}`);
  }
}

function handleSortChange(sortKey) {
  currentSort = sortKey;
  renderCatalog();
  showToast('Urutan etalase produk diperbarui');
}

function resetFilters() {
  currentCategory = 'all';
  currentSearchTerm = '';
  currentSort = 'discount';
  activeFilters = {
    cod: false,
    freeShipping: false,
    verified: true
  };

  syncSearchInputs('');

  document.querySelectorAll('.category-card-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-category') === 'all');
  });

  document.querySelectorAll('.filter-pill-btn').forEach(btn => {
    const key = btn.getAttribute('data-filter');
    btn.classList.toggle('active', !!activeFilters[key]);
  });

  const sortSelect = document.querySelector('.sort-select');
  if (sortSelect) sortSelect.value = 'discount';

  renderCatalog();
  showToast('Semua filter berhasil di-reset');
}

// ===================================================================
// LIVE SMARTPHONE MOCKUP VIEWER (SECTION 5)
// ===================================================================
const MOCKUP_ITEMS = [
  {
    title: 'Kopi Arabika Gayo Single Origin 250g',
    priceNow: 'Rp 89.000',
    priceWas: 'Rp 165.000',
    seller: 'Kopia Artisan Roast',
    rating: '5.0 (184 Ulasan Terverifikasi)',
    img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=700&q=80',
    usp: ['Kurasi Kopia Kualitas Eksklusif', 'Gratis Ongkir Seluruh Indonesia', 'Siap Kirim Hari Ini (Bisa COD)']
  },
  {
    title: 'Kemeja Linen Pria Casual Premium',
    priceNow: 'Rp 149.000',
    priceWas: 'Rp 285.000',
    seller: 'Heritage Thread Bandung',
    rating: '4.9 (142 Ulasan Terverifikasi)',
    img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80',
    usp: ['100% Katun Linen Adem & Halus', 'Garansi Tukar Ukuran', 'Bisa COD Se-Indonesia']
  },
  {
    title: 'Serum Brightening Niacinamide 10%',
    priceNow: 'Rp 99.000',
    priceWas: 'Rp 189.000',
    seller: 'Glow Botanica Herbal',
    rating: '5.0 (236 Ulasan Terverifikasi)',
    img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=700&q=80',
    usp: ['Izin Resmi BPOM NA1823010', 'Bahan Alami Non-Alkohol', 'Garansi Uang Kembali 100%']
  },
  {
    title: 'Grinder Kopi Manual Conical Burr Stainless',
    priceNow: 'Rp 249.000',
    priceWas: 'Rp 420.000',
    seller: 'Kopia Nusantara Equipment',
    rating: '4.9 (134 Ulasan Terverifikasi)',
    img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80',
    usp: ['Mata Burr Baja Stainless CNC', '30 Level Kehalusan Presisi', 'Gratis Biji Kopi Gayo 100g']
  }
];

function switchMockupItem(index, btnEl) {
  const item = MOCKUP_ITEMS[index];
  if (!item) return;

  document.querySelectorAll('.btn-switch-mockup').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const imgEl = document.getElementById('mockupImg');
  const titleEl = document.getElementById('mockupTitle');
  const priceNowEl = document.getElementById('mockupPriceNow');
  const priceWasEl = document.getElementById('mockupPriceWas');
  const ratingEl = document.getElementById('mockupRating');
  const uspListEl = document.getElementById('mockupUspList');

  if (imgEl) imgEl.src = item.img;
  if (titleEl) titleEl.textContent = item.title;
  if (priceNowEl) priceNowEl.textContent = item.priceNow;
  if (priceWasEl) priceWasEl.textContent = item.priceWas;
  if (ratingEl) ratingEl.innerHTML = `<span class="material-symbols-outlined fill-icon" style="font-size:16px;">star</span> ${item.rating}`;
  if (uspListEl) {
    uspListEl.innerHTML = item.usp.map(u => `
      <li><span class="material-symbols-outlined">check_circle</span> ${u}</li>
    `).join('');
  }

  showToast(`Pratinjau diganti: ${item.title}`);
}

// ===================================================================
// SELLER SUITE: LAYAR 1 (PASANG IKLAN) & LAYAR 2 (DASHBOARD SELLER)
// ===================================================================

const INITIAL_SELLER_ADS = [
  {
    id: 'ad-kopia-001',
    productId: 'cat-kopi-1',
    title: 'Kopi Arabika Gayo Single Origin 250g Roast Beans',
    category: 'kopi',
    categoryLabel: 'Kopi & Kuliner Nusantara',
    seller: 'Kopia Artisan Roast',
    phone: '6285771624349',
    location: 'Takengon, Aceh',
    plan: 'Paket Pro (30 Hari)',
    daysTotal: 30,
    daysLeft: 21,
    status: 'active', // 'active' | 'expiring' | 'paused'
    views: 8420,
    leads: 395,
    normalPrice: 165000,
    promoPrice: 89000,
    discount: 46,
    img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=700&q=80',
    description: 'Biji kopi pilihan varietas Typica & Bourbon dataran tinggi Gayo 1.500 mdpl. Di-roast medium profil untuk mengeluarkan aroma karamel & brown sugar.'
  },
  {
    id: 'ad-kopia-002',
    productId: 'cat-home-2',
    title: 'Manual Hand Coffee Grinder Stainless Steel 40g Ceramic Burr',
    category: 'home',
    categoryLabel: 'Rumah & Kriya Kayu',
    seller: 'Kopia Artisan Roast',
    phone: '6285771624349',
    location: 'Bandung',
    plan: 'Paket Starter (7 Hari)',
    daysTotal: 7,
    daysLeft: 2,
    status: 'expiring',
    views: 3890,
    leads: 158,
    normalPrice: 220000,
    promoPrice: 145000,
    discount: 34,
    img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80',
    description: 'Penggiling kopi manual portabel dengan conical ceramic burr anti karat. Menghasilkan gilingan merata dari coarse hingga espresso.'
  },
  {
    id: 'ad-kopia-003',
    productId: 'cat-home-1',
    title: 'Drip Kettle Gooseneck Teflon Black Matte 350ml Leher Angsa',
    category: 'home',
    categoryLabel: 'Rumah & Kriya Kayu',
    seller: 'Kopia Artisan Roast',
    phone: '6285771624349',
    location: 'Jakarta Barat',
    plan: 'Paket Pro (30 Hari)',
    daysTotal: 30,
    daysLeft: 0,
    status: 'paused',
    views: 2510,
    leads: 89,
    normalPrice: 150000,
    promoPrice: 95000,
    discount: 37,
    img: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=700&q=80',
    description: 'Teko seduh leher angsa dengan coating teflon doff elegan untuk kontrol aliran air pour-over V60 yang presisi dan stabil.'
  }
];

let SELLER_ADS = [];
let CURRENT_DASHBOARD_FILTER = 'all';
let LAST_PUBLISHED_PRODUCT_ID = 'cat-kopi-1';

function initSellerAdsStorage() {
  try {
    const saved = localStorage.getItem('kopia_seller_ads');
    if (saved) {
      SELLER_ADS = JSON.parse(saved);
    } else {
      SELLER_ADS = [...INITIAL_SELLER_ADS];
      saveSellerAds();
    }
  } catch (err) {
    SELLER_ADS = [...INITIAL_SELLER_ADS];
  }
}
initSellerAdsStorage();

function saveSellerAds() {
  try {
    localStorage.setItem('kopia_seller_ads', JSON.stringify(SELLER_ADS));
  } catch (err) {
    console.warn('Gagal menyimpan iklan seller ke localStorage:', err);
  }
  if (db) {
    SELLER_ADS.forEach(ad => syncSellerAdToFirestore(ad));
  }
}

// -------------------------------------------------------------------
// LAYAR 1: PASANG IKLAN PRODUK BARU (HELPERS & CONTROLLERS)
// -------------------------------------------------------------------

function openSellerAdModal(preselectedPlan = 'Pro') {
  const modal = document.getElementById('sellerAdModal');
  if (!modal) return;
  const planSelect = document.getElementById('sellerPlanSelect');
  if (planSelect) planSelect.value = preselectedPlan;

  calculateDiscountPreview();
  updateWaTemplatePreview();

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSellerAdModal() {
  const modal = document.getElementById('sellerAdModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

// -------------------------------------------------------------------
// PENGALAMAN PENJUAL: FOTO COMPRESSION & SMART UPLOAD ENGINE
// -------------------------------------------------------------------

function switchPhotoMode(mode) {
  const uploadContent = document.getElementById('photoModeUpload');
  const urlContent = document.getElementById('photoModeUrl');

  const tabUpload = document.getElementById('tabUploadBtn');
  const tabUrl = document.getElementById('tabUrlBtn');

  if (uploadContent) uploadContent.style.display = mode === 'upload' ? 'block' : 'none';
  if (urlContent) urlContent.style.display = mode === 'url' ? 'block' : 'none';

  if (tabUpload) tabUpload.classList.toggle('active', mode === 'upload');
  if (tabUrl) tabUrl.classList.toggle('active', mode === 'url');
}

function compressImageFile(file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih bukan gambar yang valid.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        const origSizeKb = (file.size / 1024).toFixed(1);
        const compSizeKb = ((dataUrl.length * (3 / 4)) / 1024).toFixed(1);
        const savingsPercent = Math.max(0, Math.round(((file.size - (dataUrl.length * 0.75)) / file.size) * 100));

        resolve({
          dataUrl,
          origSizeKb,
          compSizeKb,
          savingsPercent,
          width,
          height,
          fileName: file.name
        });
      };
      img.onerror = () => reject(new Error('Gagal memproses gambar.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file dari perangkat.'));
    reader.readAsDataURL(file);
  });
}

async function handleAdFileUpload(event, mode = 'create') {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  try {
    showToast('⏳ Mengompresi foto produk otomatis...');
    const result = await compressImageFile(file);

    if (mode === 'create') {
      const dropzone = document.getElementById('adDropzone');
      const resultCard = document.getElementById('adUploadResultCard');
      const previewImg = document.getElementById('adUploadPreviewImg');
      const filenameElem = document.getElementById('adUploadFilename');
      const savingsElem = document.getElementById('adUploadSavings');
      const activeImgInput = document.getElementById('adActiveImgValue');

      if (previewImg) previewImg.src = result.dataUrl;
      if (filenameElem) filenameElem.textContent = result.fileName;
      if (savingsElem) {
        savingsElem.textContent = `Asli: ${result.origSizeKb} KB ➔ Dioptimasi: ${result.compSizeKb} KB (Hemat ${result.savingsPercent}%)`;
      }
      if (activeImgInput) activeImgInput.value = result.dataUrl;

      if (dropzone) dropzone.style.display = 'none';
      if (resultCard) resultCard.style.display = 'flex';

      showToast(`✅ Foto "${result.fileName}" berhasil dikompresi hemat ${result.savingsPercent}%!`);
    } else if (mode === 'edit') {
      const previewImg = document.getElementById('editAdPhotoPreviewImg');
      const activeImgInput = document.getElementById('editActiveImgValue');
      const helper = document.getElementById('editAdPhotoHelper');

      if (previewImg) previewImg.src = result.dataUrl;
      if (activeImgInput) activeImgInput.value = result.dataUrl;
      if (helper) helper.textContent = `✓ Foto dioptimasi (${result.compSizeKb} KB, hemat ${result.savingsPercent}%)`;

      showToast(`✅ Foto baru berhasil diperbarui dan dioptimasi!`);
    }
  } catch (err) {
    alert(err.message || 'Gagal memproses foto.');
  }
}

function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  const dropzone = document.getElementById('adDropzone');
  if (dropzone) dropzone.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  const dropzone = document.getElementById('adDropzone');
  if (dropzone) dropzone.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  const dropzone = document.getElementById('adDropzone');
  if (dropzone) dropzone.classList.remove('drag-over');

  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    const fakeEvent = { target: { files: e.dataTransfer.files } };
    handleAdFileUpload(fakeEvent, 'create');
  }
}

function removeUploadedPhoto(mode = 'create') {
  if (mode === 'create') {
    const dropzone = document.getElementById('adDropzone');
    const resultCard = document.getElementById('adUploadResultCard');
    const activeImgInput = document.getElementById('adActiveImgValue');
    const fileInput = document.getElementById('adFileInput');

    if (fileInput) fileInput.value = '';
    if (activeImgInput) activeImgInput.value = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=700&q=80';

    if (dropzone) dropzone.style.display = 'flex';
    if (resultCard) resultCard.style.display = 'none';

    showToast('Foto upload dihapus. Menggunakan foto bawaan.');
  }
}

function updateAdPhotoPreview(url) {
  const activeImgInput = document.getElementById('adActiveImgValue');
  const img = document.getElementById('adPhotoPreviewImg');
  if (activeImgInput) activeImgInput.value = url;
  if (img) {
    const testImg = new Image();
    testImg.onload = () => { img.src = url; };
    testImg.onerror = () => { img.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80'; };
    testImg.src = url;
  }
}

// -------------------------------------------------------------------
// SMART WHATSAPP FORMATTER & OPERATOR DETECTOR
// -------------------------------------------------------------------

function cleanPhoneDigits(raw) {
  if (!raw) return '';
  let cleaned = raw.replace(/\D/g, '');
  if (cleaned.startsWith('08')) {
    cleaned = '628' + cleaned.slice(2);
  } else if (cleaned.startsWith('8')) {
    cleaned = '628' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62') && cleaned.length >= 9) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

function detectIndonesianOperator(cleanPhone) {
  if (!cleanPhone || cleanPhone.length < 5) return 'Nomor Belum Lengkap';

  const prefix = cleanPhone.slice(0, 5);
  const p4 = cleanPhone.slice(0, 4);

  // Telkomsel (0811, 0812, 0813, 0821, 0822, 0823, 0851, 0852, 0853)
  if (['62811', '62812', '62813', '62821', '62822', '62823', '62851', '62852', '62853'].includes(prefix)) {
    return 'Telkomsel';
  }
  // Indosat Ooredoo (0814, 0815, 0816, 0855, 0856, 0857, 0858)
  if (['62814', '62815', '62816', '62855', '62856', '62857', '62858'].includes(prefix)) {
    return 'Indosat Ooredoo';
  }
  // XL Axiata (0817, 0818, 0819, 0859, 0877, 0878)
  if (['62817', '62818', '62819', '62859', '62877', '62878'].includes(prefix)) {
    return 'XL Axiata';
  }
  // Axis (0838, 0831, 0832, 0833)
  if (['62838', '62831', '62832', '62833'].includes(prefix)) {
    return 'Axis';
  }
  // Tri (3) (0895, 0896, 0897, 0898, 0899)
  if (['62895', '62896', '62897', '62898', '62899'].includes(prefix)) {
    return 'Tri (3)';
  }
  // Smartfren (0881, 0882, 0883, 0884, 0885, 0886, 0887, 0888, 0889)
  if (['62881', '62882', '62883', '62884', '62885', '62886', '62887', '62888', '62889'].includes(prefix)) {
    return 'Smartfren';
  }

  if (cleanPhone.length >= 10) return 'WhatsApp Valid';
  return 'Format 628...';
}

function handlePhoneInputFormat(inputElem, pillElemId) {
  if (!inputElem) return;
  const raw = inputElem.value;
  const cleaned = cleanPhoneDigits(raw);
  const operator = detectIndonesianOperator(cleaned);

  const pill = document.getElementById(pillElemId);
  if (pill) {
    pill.textContent = operator;
    if (operator === 'Nomor Belum Lengkap' || operator === 'Format 628...') {
      pill.className = 'operator-pill pill-warning';
    } else {
      pill.className = 'operator-pill pill-success';
    }
  }
}

function testSellerWhatsAppNumber(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const cleaned = cleanPhoneDigits(input.value);

  if (!cleaned || cleaned.length < 10) {
    alert('Mohon masukkan nomor WhatsApp yang lengkap (minimal 10 digit, contoh: 081234567890).');
    input.focus();
    return;
  }

  input.value = cleaned;
  const testMsg = encodeURIComponent('Halo Admin Toko, ini uji coba koneksi WhatsApp dari platform Produk_lokal by kopia. Nomor Anda siap menerima pesanan!');
  const testUrl = `https://wa.me/${cleaned}?text=${testMsg}`;

  showToast(`Membuka WhatsApp untuk nomor +${cleaned}...`);
  window.open(testUrl, '_blank');
}

// -------------------------------------------------------------------
// KALKULATOR DISKON & MARGIN UNTUNG 0% KOMISI
// -------------------------------------------------------------------

function calculateDiscountPreview() {
  const normalInput = document.getElementById('adNormalPriceInput');
  const promoInput = document.getElementById('adPromoPriceInput');
  const banner = document.getElementById('adDiscountBanner');
  const badgeElem = document.getElementById('adDiscountBadgeText');
  const calcText = document.getElementById('adDiscountCalcText');
  const netIncomeElem = document.getElementById('adNetIncomeText');

  if (!normalInput || !promoInput || !banner) return;

  const normalPrice = parseInt(normalInput.value) || 0;
  const promoPrice = parseInt(promoInput.value) || 0;

  if (promoPrice > 0) {
    const effectiveNormal = normalPrice > promoPrice ? normalPrice : Math.round(promoPrice * 1.35);
    const diff = effectiveNormal - promoPrice;
    const discountPercent = Math.round((diff / effectiveNormal) * 100);

    if (badgeElem) badgeElem.textContent = `Diskon ${discountPercent}%`;
    if (calcText) calcText.textContent = `Pembeli hemat Rp ${diff.toLocaleString('id-ID')}`;
    if (netIncomeElem) {
      netIncomeElem.innerHTML = `Keuntungan bersih: <strong>Rp ${promoPrice.toLocaleString('id-ID')}</strong> (0% Komisi)`;
    }
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
  }

  updateLiveWaChatBubble();
}

function calculateEditDiscountPreview() {
  const normalInput = document.getElementById('editAdNormalPrice');
  const promoInput = document.getElementById('editAdPromoPrice');
  const banner = document.getElementById('editDiscountBanner');
  const badgeElem = document.getElementById('editDiscountBadgeText');
  const calcText = document.getElementById('editDiscountCalcText');

  if (!normalInput || !promoInput || !banner) return;

  const normalPrice = parseInt(normalInput.value) || 0;
  const promoPrice = parseInt(promoInput.value) || 0;

  if (promoPrice > 0) {
    const effectiveNormal = normalPrice > promoPrice ? normalPrice : Math.round(promoPrice * 1.35);
    const diff = effectiveNormal - promoPrice;
    const discountPercent = Math.round((diff / effectiveNormal) * 100);

    if (badgeElem) badgeElem.textContent = `Diskon ${discountPercent}%`;
    if (calcText) calcText.textContent = `Pembeli hemat Rp ${diff.toLocaleString('id-ID')}`;
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
  }
}

// -------------------------------------------------------------------
// DRAF WHATSAPP & LIVE CHAT SIMULATOR
// -------------------------------------------------------------------

function insertDynamicTagToWa(textareaId, tag) {
  const textarea = document.getElementById(textareaId);
  if (!textarea) return;

  const title = (document.getElementById('adTitleInput') && document.getElementById('adTitleInput').value.trim()) || 'Produk Lokal';
  const promo = (document.getElementById('adPromoPriceInput') && parseInt(document.getElementById('adPromoPriceInput').value)) ? `Rp ${parseInt(document.getElementById('adPromoPriceInput').value).toLocaleString('id-ID')}` : 'Rp 89.000';

  let tagReplacement = tag;
  if (tag === '[Nama Produk]') tagReplacement = `"${title}"`;
  else if (tag === '[Harga Promo]') tagReplacement = `(${promo})`;
  else if (tag === '[Opsi COD]') tagReplacement = 'apakah bisa kirim Bayar di Tempat (COD)?';
  else if (tag === '[Format Order]') tagReplacement = '\n\nFormat Pesanan:\n- Nama:\n- Alamat Lengkap/Kecamatan:\n- Varian/Jumlah:\n- No. HP:';

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = textarea.value;

  textarea.value = val.substring(0, start) + ' ' + tagReplacement + ' ' + val.substring(end);
  textarea.dataset.customized = 'true';
  textarea.focus();

  updateLiveWaChatBubble();
}

function updateLiveWaChatBubble() {
  const templateArea = document.getElementById('adWaTemplateInput');
  const bubbleContent = document.getElementById('waBubbleContent');
  const bubbleTime = document.getElementById('waBubbleTime');

  if (!templateArea || !bubbleContent) return;

  let text = templateArea.value.trim();
  if (!text) {
    const title = (document.getElementById('adTitleInput') && document.getElementById('adTitleInput').value.trim()) || 'Produk Lokal Pilihan';
    const promo = (document.getElementById('adPromoPriceInput') && parseInt(document.getElementById('adPromoPriceInput').value)) ? `Rp ${parseInt(document.getElementById('adPromoPriceInput').value).toLocaleString('id-ID')}` : 'harga promo';
    const seller = (document.getElementById('adSellerNameInput') && document.getElementById('adSellerNameInput').value.trim()) || 'Admin Toko';
    text = `Halo ${seller}, saya melihat promo "${title}" di Produk_lokal by kopia (${promo}). Saya tertarik memesan dan ingin konfirmasi ketersediaan stok serta pengiriman COD ke alamat saya. Terima kasih!`;
  }

  bubbleContent.textContent = text;

  if (bubbleTime) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    bubbleTime.textContent = `${hours}:${mins}`;
  }
}

function updateWaTemplatePreview() {
  const titleInput = document.getElementById('adTitleInput');
  const promoInput = document.getElementById('adPromoPriceInput');
  const sellerInput = document.getElementById('adSellerNameInput');
  const templateArea = document.getElementById('adWaTemplateInput');

  if (!templateArea) return;

  if (!templateArea.value || templateArea.dataset.customized !== 'true') {
    const title = (titleInput && titleInput.value.trim()) || 'Produk Lokal Pilihan';
    const promo = (promoInput && parseInt(promoInput.value)) ? `Rp ${parseInt(promoInput.value).toLocaleString('id-ID')}` : 'harga promo';
    const seller = (sellerInput && sellerInput.value.trim()) || 'Admin Toko';

    templateArea.value = `Halo ${seller}, saya melihat promo "${title}" di Produk_lokal by kopia (${promo}). Saya tertarik memesan dan ingin konfirmasi ketersediaan stok serta pengiriman COD ke alamat saya. Terima kasih!`;
  }

  updateLiveWaChatBubble();
}

function resetWaTemplateToDefault() {
  const templateArea = document.getElementById('adWaTemplateInput');
  if (templateArea) {
    templateArea.dataset.customized = 'false';
    templateArea.value = '';
    updateWaTemplatePreview();
    showToast('Template draf pesan WhatsApp berhasil direset ke standar.');
  }
}

function handleCreateAdFormSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('adTitleInput').value.trim();
  const category = document.getElementById('adCategorySelect').value;
  const plan = document.getElementById('sellerPlanSelect').value;
  
  // Use uploaded base64 dataUrl if present, otherwise fallback to URL or preset
  const activeImgInput = document.getElementById('adActiveImgValue');
  const img = (activeImgInput && activeImgInput.value) || document.getElementById('adImgInput').value.trim() || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=700&q=80';

  const normalPrice = parseInt(document.getElementById('adNormalPriceInput').value) || 0;
  const promoPrice = parseInt(document.getElementById('adPromoPriceInput').value) || 0;
  const seller = document.getElementById('adSellerNameInput').value.trim();
  const phone = cleanPhoneDigits(document.getElementById('adPhoneInput').value.trim());
  const location = document.getElementById('adLocationInput').value.trim() || 'Bandung';
  const waTemplate = document.getElementById('adWaTemplateInput').value.trim();
  const desc = document.getElementById('adDescInput').value.trim();

  // USPs
  const hasGaransi = document.getElementById('adUspGaransi') ? document.getElementById('adUspGaransi').checked : true;
  const hasCod = document.getElementById('adUspCod') ? document.getElementById('adUspCod').checked : true;
  const hasFreeShipping = document.getElementById('adUspFreeShipping') ? document.getElementById('adUspFreeShipping').checked : true;

  if (!title || !seller || !phone || promoPrice <= 0) {
    alert('Mohon lengkapi formulir produk dan nomor WhatsApp Anda.');
    return;
  }

  const effectiveNormal = normalPrice > promoPrice ? normalPrice : Math.round(promoPrice * 1.35);
  const discountCalc = Math.round(((effectiveNormal - promoPrice) / effectiveNormal) * 100);

  const durationDays = plan === 'Starter' ? 7 : (plan === 'Super Brand' ? 60 : 30);
  const planDisplay = plan === 'Starter' ? 'Paket Starter (7 Hari)' : (plan === 'Super Brand' ? 'Paket Super Brand (60 Hari)' : 'Paket Pro (30 Hari)');

  const newId = 'cat-seller-' + Date.now();

  const newProduct = {
    id: newId,
    title: title,
    category: category,
    categoryLabel: category === 'kopi' ? 'Kopi & Kuliner Nusantara' :
                   category === 'beauty' ? 'Kecantikan Alami' :
                   category === 'fashion' ? 'Fashion & Wastra Lokal' :
                   category === 'gadget' ? 'Gadget & Kreatif Lokal' : 'Rumah & Kriya Kayu',
    seller: seller,
    location: location,
    phone: phone,
    originalPrice: effectiveNormal,
    promoPrice: promoPrice,
    discount: discountCalc,
    rating: 5.0,
    reviews: 1,
    verified: true,
    cod: hasCod,
    freeShipping: hasFreeShipping,
    popularity: 99,
    responseTime: '1 Mnt',
    img: img,
    reviewQuote: 'Produk lokal original langsung dari produsen. Pelayanan ramah dan transaksi langsung tanpa perantara.',
    reviewerName: 'Pembeli Pertama • Indonesia',
    marketplaceName: 'Toko Resmi Penjual',
    marketplaceUrl: 'https://shopee.co.id',
    description: desc || `Produk lokal berkualitas tinggi produksi ${seller}. Jaminan keaslian 100%, siap melayani pembayaran COD dan kirim cepat ke seluruh wilayah Indonesia.`
  };

  // Add to public catalog
  CATALOG_PRODUCTS.unshift(newProduct);
  renderCatalog();

  // Add to Seller Dashboard Ads
  const newAd = {
    id: 'ad-' + Date.now(),
    productId: newId,
    title: title,
    category: category,
    categoryLabel: newProduct.categoryLabel,
    seller: seller,
    phone: phone,
    location: location,
    plan: planDisplay,
    daysTotal: durationDays,
    daysLeft: durationDays,
    status: 'active',
    views: 18,
    leads: 2,
    normalPrice: effectiveNormal,
    promoPrice: promoPrice,
    discount: discountCalc,
    img: img,
    description: newProduct.description,
    waTemplate: waTemplate
  };

  SELLER_ADS.unshift(newAd);
  saveSellerAds();

  // Simpan permanen ke Cloud Firestore Backend
  syncProductToFirestore(newProduct);
  syncSellerAdToFirestore(newAd);

  LAST_PUBLISHED_PRODUCT_ID = newId;

  // Close form modal
  closeSellerAdModal();

  // Open Publish Success Modal with Instant Link
  showPublishSuccessModal(newAd);

  showToast(`🎉 Iklan "${title}" berhasil tayang & halaman promosi instan aktif!`);
}

// -------------------------------------------------------------------
// PUBLISH SUCCESS MODAL CONTROLLERS
// -------------------------------------------------------------------

function showPublishSuccessModal(ad) {
  const modal = document.getElementById('sellerPublishSuccessModal');
  const miniCard = document.getElementById('publishedMiniCardPreview');
  const linkInput = document.getElementById('publishedShareLinkInput');

  if (miniCard) {
    miniCard.innerHTML = `
      <img src="${ad.img}" alt="${ad.title}" class="published-mini-img">
      <div class="published-mini-info">
        <span class="badge-screen-pill" style="padding:2px 8px; font-size:10px;">${ad.categoryLabel}</span>
        <h4 class="published-mini-title">${ad.title}</h4>
        <div class="published-mini-price-row">
          <span class="published-mini-promo">Rp ${ad.promoPrice.toLocaleString('id-ID')}</span>
          <span class="published-mini-orig">Rp ${ad.normalPrice.toLocaleString('id-ID')}</span>
          <span class="modal-discount-pill">-${ad.discount}%</span>
        </div>
        <span class="published-mini-seller">Oleh ${ad.seller} • ${ad.location} • Sisa ${ad.daysLeft} Hari</span>
      </div>
    `;
  }

  const shareableUrl = `https://produklokal.kopia.id/p/${ad.productId}`;
  if (linkInput) {
    linkInput.value = shareableUrl;
  }

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closePublishSuccessModal() {
  const modal = document.getElementById('sellerPublishSuccessModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function copyPublishedLink() {
  const linkInput = document.getElementById('publishedShareLinkInput');
  if (linkInput) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(linkInput.value);
    } else {
      linkInput.select();
      document.execCommand('copy');
    }
    showToast('Tautan promosi instan berhasil disalin! Siap disebar ke WhatsApp & sosmed.');
  }
}

function viewPublishedProductModal() {
  closePublishSuccessModal();
  if (LAST_PUBLISHED_PRODUCT_ID) {
    openProductDetailModal(LAST_PUBLISHED_PRODUCT_ID);
  }
}

// -------------------------------------------------------------------
// LAYAR 2: DASHBOARD SELLER (MONITORING PERFORMA & MANAJEMEN IKLAN)
// -------------------------------------------------------------------

function openSellerDashboardModal() {
  const modal = document.getElementById('sellerDashboardModal');
  if (!modal) return;
  renderSellerDashboard();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSellerDashboardModal() {
  const modal = document.getElementById('sellerDashboardModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function handleDashboardOverlayClick(event) {
  if (event.target.id === 'sellerDashboardModal') {
    closeSellerDashboardModal();
  }
}

function renderSellerDashboard() {
  // 1. Calculate Aggregate KPIs
  let totalViews = 0;
  let totalLeads = 0;
  let estimatedRevenue = 0;

  let countAll = SELLER_ADS.length;
  let countActive = 0;
  let countExpiring = 0;
  let countPaused = 0;

  SELLER_ADS.forEach(ad => {
    totalViews += (ad.views || 0);
    totalLeads += (ad.leads || 0);
    estimatedRevenue += ((ad.promoPrice || 80000) * (ad.leads || 0) * 0.42);

    if (ad.status === 'paused') {
      countPaused++;
    } else if (ad.daysLeft <= 3 || ad.status === 'expiring') {
      countExpiring++;
    } else {
      countActive++;
    }
  });

  const conversionRate = totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(2) : '0.00';

  // Update KPI Cards
  const viewsElem = document.getElementById('dashTotalViews');
  const leadsElem = document.getElementById('dashTotalLeads');
  const convElem = document.getElementById('dashConversionRate');
  const revElem = document.getElementById('dashGrossRevenue');

  if (viewsElem) viewsElem.textContent = totalViews.toLocaleString('id-ID');
  if (leadsElem) leadsElem.textContent = totalLeads.toLocaleString('id-ID');
  if (convElem) convElem.textContent = `${conversionRate}%`;
  if (revElem) revElem.textContent = `Rp ${Math.round(estimatedRevenue).toLocaleString('id-ID')}`;

  // Update Tab Counts
  const cAll = document.getElementById('dashCountAll');
  const cActive = document.getElementById('dashCountActive');
  const cExpiring = document.getElementById('dashCountExpiring');
  const cPaused = document.getElementById('dashCountPaused');

  if (cAll) cAll.textContent = countAll;
  if (cActive) cActive.textContent = countActive;
  if (cExpiring) cExpiring.textContent = countExpiring;
  if (cPaused) cPaused.textContent = countPaused;

  // Render Realtime Leads Feed
  renderLeadsActivityFeed();

  // Render Ads Rows based on current filter
  renderDashboardAdsRows();
}

function renderLeadsActivityFeed() {
  const feedContainer = document.getElementById('dashLeadsFeed');
  if (!feedContainer) return;

  const sampleActivities = [
    { name: 'Wahyu P.', city: 'Surabaya', product: 'Kopi Arabika Gayo', action: 'Mengklik tombol Chat WA & menanyakan stok 500g', time: '3 menit lalu', type: 'wa' },
    { name: 'Siti Rahma', city: 'Bandung', product: 'Manual Hand Coffee Grinder', action: 'Mengklik WhatsApp untuk opsi COD bayar di tempat', time: '14 menit lalu', type: 'wa' },
    { name: 'Rian M.', city: 'Medan', product: 'Kopi Arabika Gayo', action: 'Membagikan tautan promo produk ke WhatsApp group', time: '28 menit lalu', type: 'share' },
    { name: 'Dedi K.', city: 'Yogyakarta', product: 'Drip Kettle Gooseneck', action: 'Melihat rincian produk melalui etalase Toko Klik', time: '42 menit lalu', type: 'view' },
    { name: 'Fani Lestari', city: 'Jakarta Selatan', product: 'Kopi Arabika Gayo', action: 'Mengklik marketplace resmi seller', time: '1 jam lalu', type: 'market' }
  ];

  feedContainer.innerHTML = sampleActivities.map(item => `
    <div class="leads-feed-item">
      <div class="leads-feed-avatar ${item.type === 'wa' ? 'bg-lead-wa' : item.type === 'share' ? 'bg-lead-share' : item.type === 'market' ? 'bg-lead-market' : 'bg-lead-view'}">
        <span class="material-symbols-outlined">
          ${item.type === 'wa' ? 'chat' : item.type === 'share' ? 'share' : item.type === 'market' ? 'shopping_bag' : 'visibility'}
        </span>
      </div>
      <div class="leads-feed-info">
        <div class="leads-feed-header">
          <span class="lead-customer-name">${item.name}</span>
          <span class="lead-city-pill">${item.city}</span>
          <span class="leads-feed-time"><span class="material-symbols-outlined" style="font-size:12px;">schedule</span> ${item.time}</span>
        </div>
        <p class="leads-feed-text">
          ${item.action} pada <span class="lead-product-tag">${item.product}</span>
        </p>
      </div>
    </div>
  `).join('');
}

function filterDashboardAds(filterKey, buttonElem) {
  CURRENT_DASHBOARD_FILTER = filterKey;

  const tabs = document.querySelectorAll('#dashAdFilterTabs .ad-tab-btn');
  tabs.forEach(tab => tab.classList.remove('active'));
  if (buttonElem) buttonElem.classList.add('active');

  renderDashboardAdsRows();
}

function renderDashboardAdsRows() {
  const listContainer = document.getElementById('dashSellerAdsList');
  if (!listContainer) return;

  let filtered = SELLER_ADS.filter(ad => {
    if (CURRENT_DASHBOARD_FILTER === 'all') return true;
    if (CURRENT_DASHBOARD_FILTER === 'active') return ad.status === 'active' && ad.daysLeft > 3;
    if (CURRENT_DASHBOARD_FILTER === 'expiring') return ad.status === 'expiring' || (ad.status === 'active' && ad.daysLeft <= 3);
    if (CURRENT_DASHBOARD_FILTER === 'paused') return ad.status === 'paused';
    return true;
  });

  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div class="seller-ads-empty-state">
        <span class="material-symbols-outlined" style="font-size:40px; color:var(--text-muted);">inventory_2</span>
        <p style="margin-top:8px; font-weight:700; font-size:14px; color:var(--on-surface);">Tidak ada iklan pada kategori ini</p>
        <span style="font-size:12.5px; color:var(--text-muted); margin-top:4px;">Tidak ada iklan produk yang sesuai dengan kategori ini.</span>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = filtered.map(ad => {
    const isPaused = ad.status === 'paused';
    const isExpiring = !isPaused && (ad.daysLeft <= 3 || ad.status === 'expiring');

    const statusBadgeHtml = isPaused ?
      `<span class="status-badge status-paused"><span class="dot-indicator"></span> Dijeda</span>` :
      isExpiring ?
      `<span class="status-badge status-expiring"><span class="dot-indicator"></span> Hampir Habis (${ad.daysLeft} Hari)</span>` :
      `<span class="status-badge status-active"><span class="dot-indicator"></span> Aktif (${ad.daysLeft} Hari)</span>`;

    const convAd = ad.views > 0 ? ((ad.leads / ad.views) * 100).toFixed(1) : '0';

    return `
      <div class="seller-ad-row-item ${isPaused ? 'row-paused' : ''}">
        <!-- Col 1: Product info -->
        <div class="ad-col-product">
          <div class="ad-thumb-wrap">
            <img src="${ad.img}" alt="${ad.title}" class="ad-thumb-img" onerror="this.src='https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=700&q=80'">
          </div>
          <div class="ad-info-texts">
            <div class="ad-plan-row">
              <span class="ad-plan-tag ${ad.plan && ad.plan.includes('Pro') ? 'plan-pro' : 'plan-starter'}">${ad.plan || 'Paket Pro'}</span>
              <span class="ad-category-sub">${ad.categoryLabel || 'Produk Lokal'}</span>
            </div>
            <h5 class="ad-row-title" title="${ad.title}">${ad.title}</h5>
            <div class="ad-meta-row">
              <span class="ad-wa-info"><span class="material-symbols-outlined">chat</span> +${ad.phone}</span>
              <span class="ad-meta-dot">•</span>
              <span class="ad-loc-info"><span class="material-symbols-outlined">location_on</span> ${ad.location || 'Indonesia'}</span>
            </div>
          </div>
        </div>

        <!-- Col 2: Price -->
        <div class="ad-col-price">
          <span class="ad-price-promo">Rp ${ad.promoPrice.toLocaleString('id-ID')}</span>
          <div class="ad-price-sub">
            <span class="ad-price-orig">Rp ${ad.normalPrice.toLocaleString('id-ID')}</span>
            <span class="ad-discount-badge">-${ad.discount}%</span>
          </div>
        </div>

        <!-- Col 3: Status -->
        <div class="ad-col-status">
          ${statusBadgeHtml}
          <div class="ad-duration-meta">
            <div class="duration-progress-bar">
              <div class="duration-progress-fill" style="width: ${Math.min(100, Math.max(8, (ad.daysLeft / (ad.daysTotal || 30)) * 100))}%;"></div>
            </div>
            <span class="duration-text">Total: ${ad.daysTotal || 30} Hari</span>
          </div>
        </div>

        <!-- Col 4: Views & Leads -->
        <div class="ad-col-metrics">
          <div class="ad-metric-pill views-pill" title="Total Tayangan Iklan">
            <span class="material-symbols-outlined">visibility</span>
            <strong>${ad.views.toLocaleString('id-ID')}</strong>
            <span>views</span>
          </div>
          <div class="ad-metric-pill leads-pill" title="Total Leads WhatsApp">
            <span class="material-symbols-outlined">chat</span>
            <strong>${ad.leads.toLocaleString('id-ID')}</strong>
            <span>leads (${convAd}%)</span>
          </div>
        </div>

        <!-- Col 5: Actions -->
        <div class="ad-col-actions">
          <button type="button" class="btn-ad-act btn-act-preview" onclick="openProductDetailModal('${ad.productId}')" title="Lihat Halaman Promo di Etalase">
            <span class="material-symbols-outlined">visibility</span>
            <span>Lihat</span>
          </button>

          <button type="button" class="btn-ad-act btn-act-renew" onclick="extendAdDuration('${ad.id}')" title="Perpanjang Durasi Iklan +30 Hari">
            <span class="material-symbols-outlined">autorenew</span>
            <span>+30 Hari</span>
          </button>

          <button type="button" class="btn-ad-act btn-act-toggle ${isPaused ? 'paused-state' : ''}" onclick="toggleAdStatus('${ad.id}')" title="${isPaused ? 'Aktifkan Kembali Iklan' : 'Jeda Iklan Sementara'}">
            <span class="material-symbols-outlined">${isPaused ? 'play_arrow' : 'pause'}</span>
            <span>${isPaused ? 'Aktifkan' : 'Jeda'}</span>
          </button>

          <button type="button" class="btn-ad-act btn-act-edit" onclick="openEditAdModal('${ad.id}')" title="Edit Harga Promo atau Info Iklan">
            <span class="material-symbols-outlined">edit</span>
            <span>Edit</span>
          </button>

          <button type="button" class="btn-ad-act btn-act-share" onclick="copyAdDirectLink('${ad.productId}', '${ad.title.replace(/'/g, "\\'")}')" title="Salin Link Halaman Iklan">
            <span class="material-symbols-outlined">share</span>
            <span>Link</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function extendAdDuration(adId) {
  const ad = SELLER_ADS.find(item => item.id === adId);
  if (!ad) return;

  ad.daysLeft += 30;
  ad.daysTotal += 30;
  ad.status = 'active';

  saveSellerAds();
  renderSellerDashboard();
  showToast(`✅ Masa tayang iklan "${ad.title}" berhasil diperpanjang 30 hari!`);
}

function toggleAdStatus(adId) {
  const ad = SELLER_ADS.find(item => item.id === adId);
  if (!ad) return;

  if (ad.status === 'paused') {
    ad.status = ad.daysLeft <= 3 ? 'expiring' : 'active';
    showToast(`▶️ Iklan "${ad.title}" kembali aktif tayang di etalase.`);
  } else {
    ad.status = 'paused';
    showToast(`⏸️ Iklan "${ad.title}" dijeda sementara.`);
  }

  saveSellerAds();
  renderSellerDashboard();
}

function copyAdDirectLink(productId, title) {
  const link = `https://produklokal.kopia.id/p/${productId}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(link);
  } else {
    const tempInput = document.createElement('input');
    tempInput.value = link;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    tempInput.remove();
  }
  showToast(`🔗 Link promo "${title}" berhasil disalin!`);
}

function openEditAdModal(adId) {
  const ad = SELLER_ADS.find(item => item.id === adId);
  if (!ad) return;

  const editModal = document.getElementById('sellerEditAdModal');
  if (!editModal) return;

  document.getElementById('editAdId').value = ad.id;
  document.getElementById('editAdTitle').value = ad.title;
  document.getElementById('editAdNormalPrice').value = ad.normalPrice;
  document.getElementById('editAdPromoPrice').value = ad.promoPrice;
  
  const phoneInput = document.getElementById('editAdPhone');
  if (phoneInput) {
    phoneInput.value = ad.phone || '';
    handlePhoneInputFormat(phoneInput, 'editOperatorPill');
  }

  document.getElementById('editAdDesc').value = ad.description || '';

  // Setup photo preview and active image
  const activeImgInput = document.getElementById('editActiveImgValue');
  const previewImg = document.getElementById('editAdPhotoPreviewImg');
  const photoHelper = document.getElementById('editAdPhotoHelper');
  if (activeImgInput) activeImgInput.value = ad.img || '';
  if (previewImg) previewImg.src = ad.img || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=700&q=80';
  if (photoHelper) photoHelper.textContent = 'Foto saat ini aktif di etalase & halaman promo';

  // Calculate discount banner preview
  calculateEditDiscountPreview();

  editModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSellerEditModal() {
  const editModal = document.getElementById('sellerEditAdModal');
  if (editModal) editModal.classList.remove('active');
  document.body.style.overflow = '';
}

function handleEditAdFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('editAdId').value;
  const title = document.getElementById('editAdTitle').value.trim();
  const normalPrice = parseInt(document.getElementById('editAdNormalPrice').value) || 0;
  const promoPrice = parseInt(document.getElementById('editAdPromoPrice').value) || 0;
  const rawPhone = document.getElementById('editAdPhone').value.trim();
  const phone = cleanPhoneDigits(rawPhone) || rawPhone;
  const desc = document.getElementById('editAdDesc').value.trim();
  const activeImg = document.getElementById('editActiveImgValue') ? document.getElementById('editActiveImgValue').value : '';

  const ad = SELLER_ADS.find(item => item.id === id);
  if (!ad) return;

  ad.title = title;
  ad.normalPrice = normalPrice > promoPrice ? normalPrice : Math.round(promoPrice * 1.35);
  ad.promoPrice = promoPrice;
  ad.discount = Math.round(((ad.normalPrice - promoPrice) / ad.normalPrice) * 100);
  ad.phone = phone;
  ad.description = desc;
  if (activeImg) {
    ad.img = activeImg;
  }

  // Also update corresponding product in CATALOG_PRODUCTS
  const catalogProd = CATALOG_PRODUCTS.find(p => p.id === ad.productId);
  if (catalogProd) {
    catalogProd.title = title;
    catalogProd.originalPrice = ad.normalPrice;
    catalogProd.promoPrice = promoPrice;
    catalogProd.discount = ad.discount;
    catalogProd.phone = phone;
    catalogProd.description = desc;
    if (activeImg) {
      catalogProd.img = activeImg;
    }
    renderCatalog();
  }

  saveSellerAds();
  closeSellerEditModal();
  renderSellerDashboard();

  showToast(`💾 Perubahan iklan "${title}" berhasil disimpan!`);
}

// ===================================================================
// FAQ ACCORDION
// ===================================================================
function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const questionBtn = item.querySelector('.faq-question-btn');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(other => other.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });
}

// ===================================================================
// TOAST NOTIFICATION UTILITY
// ===================================================================
function showToast(message) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.innerHTML = `
    <span class="material-symbols-outlined" style="color:var(--whatsapp-green); font-size:18px;">check_circle</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 20);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ===================================================================
// GLOBAL INITIALIZATION & EVENT LISTENERS
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
  initFlashSaleTimer();
  renderFlashSale();
  renderCatalog();
  initFaqAccordion();
  updateWishlistBadge();

  // Close all modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductDetailModal();
      closeWishlistDrawer();
      closeSellerAdModal();
      closePublishSuccessModal();
      closeSellerDashboardModal();
      closeSellerEditModal();
    }
  });

  // Header scroll shadow effect
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.site-header');
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }
  });

  // Hero Search Input listener ("bagian atas")
  const heroSearch = document.getElementById('heroSearchInput');
  if (heroSearch) {
    heroSearch.addEventListener('input', (e) => handleSearch(e.target.value));
    heroSearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        triggerSearch('hero');
      }
    });
  }

  // Header Search Input listener ("bagian atas")
  const headerSearch = document.getElementById('headerSearchInput');
  if (headerSearch) {
    headerSearch.addEventListener('input', (e) => handleSearch(e.target.value));
    headerSearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        triggerSearch('header');
      }
    });
  }

  // Catalog In-Page Search Input listener ("bagian bawah")
  const catalogSearch = document.getElementById('catalogSearchInput');
  if (catalogSearch) {
    catalogSearch.addEventListener('input', (e) => handleSearch(e.target.value));
    catalogSearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        triggerSearch('catalog');
      }
    });
  }

  // Header Dashboard Seller button
  const btnHeaderDashboard = document.getElementById('btnHeaderDashboard');
  if (btnHeaderDashboard) {
    btnHeaderDashboard.addEventListener('click', () => {
      openSellerDashboardModal();
    });
  }

  // Load More Button
  const btnLoadMore = document.getElementById('btnLoadMore');
  if (btnLoadMore) {
    btnLoadMore.addEventListener('click', () => {
      showToast('Memuat promo produk lokal eksklusif lainnya...');
      setTimeout(() => {
        showToast('Semua promo produk lokal aktif saat ini telah ditampilkan!');
      }, 800);
    });
  }
});
