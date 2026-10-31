/**
 * PRODUK_LOKAL BY KOPIA - SERVICES / FIREBASE & DATA ENGINE
 * Konfigurasi dan Operasi Firebase (Auth, Firestore Products CRUD, Analytics & Stats)
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBcRKqL1hx6R8GteT2csfygzTeQGwOmsaI",
  authDomain: "produklokal-kopia.firebaseapp.com",
  projectId: "produklokal-kopia",
  storageBucket: "produklokal-kopia.firebasestorage.app",
  messagingSenderId: "110297698834",
  appId: "1:110297698834:web:6bb9e075aa7274bd88becb",
  measurementId: "G-S62L4RNCYM"
};

// Initial state variables
let firebaseApp = null;
let authInstance = null;
let firestoreDb = null;
let isInitialized = false;

// Mock local storage keys for fallback & offline preview
const STORAGE_KEYS = {
  PRODUCTS: 'kopia_admin_products',
  STATS: 'kopia_admin_stats',
  AUTH_USER: 'kopia_admin_auth_user',
  LEADS: 'kopia_admin_leads'
};

/**
 * Inisialisasi Firebase App, Auth, dan Firestore
 */
function initFirebaseService() {
  if (isInitialized) return { auth: authInstance, db: firestoreDb };

  try {
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps.length) {
        firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
      } else {
        firebaseApp = firebase.app();
      }

      if (typeof firebase.auth === 'function') {
        authInstance = firebase.auth();
      }

      if (typeof firebase.firestore === 'function') {
        firestoreDb = firebase.firestore();
      }

      isInitialized = true;
      console.log('✅ [Firebase Service] Terhubung ke project:', FIREBASE_CONFIG.projectId);
    } else {
      console.warn('⚠️ [Firebase Service] Library Firebase SDK belum dimuat. Mengaktifkan fallback storage.');
    }
  } catch (err) {
    console.error('❌ [Firebase Service] Gagal inisialisasi:', err);
  }

  return { auth: authInstance, db: firestoreDb };
}

// ===================================================================
// AUTHENTICATION SERVICES
// ===================================================================

/**
 * Login admin dengan Email & Password
 */
async function loginWithEmail(email, password) {
  initFirebaseService();
  if (authInstance) {
    try {
      const userCredential = await authInstance.signInWithEmailAndPassword(email, password);
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || email.split('@')[0],
        isDemo: false
      }));
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.warn('Firebase Auth error, checking fallback:', error.code, error.message);
      // Fallback pesan error dalam Bahasa Indonesia yang ramah
      let msg = error.message;
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        msg = 'Email atau kata sandi tidak cocok. Jika belum memiliki akun, silakan buat akun di tab "Daftar Baru".';
      } else if (error.code === 'auth/wrong-password') {
        msg = 'Kata sandi salah. Silakan coba lagi.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Format alamat email tidak valid.';
      } else if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/configuration-not-found') {
        msg = 'Layanan Firebase Authentication belum aktif di Firebase Console. Pastikan Sign-in Method (Email/Password atau Google) sudah diaktifkan.';
      }
      return { success: false, error: msg, code: error.code };
    }
  }

  // Fallback demo auth
  return loginDemo(email);
}

/**
 * Mendaftarkan akun admin baru
 */
async function registerWithEmail(email, password) {
  initFirebaseService();
  if (authInstance) {
    try {
      const userCredential = await authInstance.createUserWithEmailAndPassword(email, password);
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: email.split('@')[0],
        isDemo: false
      }));
      return { success: true, user: userCredential.user };
    } catch (error) {
      let msg = error.message;
      if (error.code === 'auth/email-already-in-use') {
        msg = 'Alamat email ini sudah terdaftar. Silakan langsung login di tab "Masuk".';
      } else if (error.code === 'auth/weak-password') {
        msg = 'Kata sandi terlalu pendek. Gunakan minimal 6 karakter.';
      } else if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/configuration-not-found') {
        msg = 'Layanan Firebase Authentication belum aktif di Firebase Console. Pastikan Sign-in Method (Email/Password atau Google) sudah diaktifkan.';
      }
      return { success: false, error: msg, code: error.code };
    }
  }

  return { success: false, error: 'Firebase Auth tidak siap.' };
}

/**
 * Login dengan Google Sign-In
 */
async function loginWithGoogle() {
  initFirebaseService();
  if (authInstance && typeof firebase.auth.GoogleAuthProvider === 'function') {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await authInstance.signInWithPopup(provider);
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || 'Admin Google',
        photoURL: result.user.photoURL,
        isDemo: false
      }));
      return { success: true, user: result.user };
    } catch (error) {
      let msg = error.message;
      if (error.code === 'auth/popup-closed-by-user') {
        msg = 'Popup login Google ditutup sebelum selesai.';
      } else if (error.code === 'auth/unauthorized-domain') {
        msg = 'Domain ini belum diizinkan di Firebase Console. Anda dapat menggunakan login Email atau Mode Demo.';
      }
      return { success: false, error: msg };
    }
  }
  return { success: false, error: 'Google Auth belum tersedia.' };
}

/**
 * Login Demo / Tamu Instan (1-Click)
 */
function loginDemo(customEmail) {
  const demoUser = {
    uid: 'admin-demo-' + Date.now(),
    email: customEmail || 'admin.kopia@umkm.id',
    displayName: 'Administrator Utama Kopia',
    role: 'Super Admin',
    isDemo: true,
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  };
  localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(demoUser));
  return { success: true, user: demoUser };
}

/**
 * Logout
 */
async function logoutAdmin() {
  initFirebaseService();
  if (authInstance) {
    try {
      await authInstance.signOut();
    } catch (e) {
      console.warn('SignOut notice:', e);
    }
  }
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  return { success: true };
}

/**
 * Listener status autentikasi
 */
function onAuthChange(callback) {
  initFirebaseService();
  if (authInstance) {
    return authInstance.onAuthStateChanged((user) => {
      if (user) {
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL,
          isDemo: false
        });
      } else {
        // Cek apakah ada sesi demo di localStorage
        const local = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
        if (local) {
          try {
            callback(JSON.parse(local));
            return;
          } catch (e) {}
        }
        callback(null);
      }
    });
  } else {
    const local = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (local) {
      try {
        callback(JSON.parse(local));
      } catch (e) {
        callback(null);
      }
    } else {
      callback(null);
    }
    return () => {};
  }
}

// ===================================================================
// PRODUCT CRUD SERVICES (FIRESTORE)
// ===================================================================

/**
 * Default fallback / seed products jika Firestore masih kosong
 */
const DEFAULT_PRODUCTS = [
  {
    id: 'prod-gayo-01',
    title: 'Kopi Arabika Gayo Single Origin 250g Roast Beans',
    category: 'kopi',
    categoryLabel: 'Kopi Nusantara',
    seller: 'Kopia Artisan Roast',
    location: 'Takengon, Aceh',
    phone: '6285771624349',
    originalPrice: 165000,
    promoPrice: 89000,
    discount: 46,
    stockLeft: 18,
    rating: 5.0,
    reviews: 184,
    badge: 'Diskon 46%',
    variants: ['Biji Utuh', 'Bubuk Halus', 'Bubuk Kasar'],
    img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=700&q=80',
    description: 'Biji kopi pilihan varietas Typica & Bourbon dari Gayo (1.500 mdpl), roast medium, cita rasa karamel dan aroma floral segar.'
  },
  {
    id: 'prod-linen-02',
    title: 'Kemeja Linen Pria Casual Premium Adem & Halus',
    category: 'fashion',
    categoryLabel: 'Fashion Lokal',
    seller: 'Heritage Thread Bandung',
    location: 'Bandung',
    phone: '6285771624349',
    originalPrice: 285000,
    promoPrice: 149000,
    discount: 48,
    stockLeft: 24,
    rating: 4.9,
    reviews: 142,
    badge: 'Diskon 48%',
    variants: ['Size M', 'Size L', 'Size XL'],
    img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80',
    description: 'Kemeja kasual material pure linen blend premium. Sejuk, menyerap keringat, potongan modern fit.'
  },
  {
    id: 'prod-serum-03',
    title: 'Serum Brightening Niacinamide 10% + Centella Alami',
    category: 'beauty',
    categoryLabel: 'Kecantikan Alami',
    seller: 'Glow Botanica Herbal',
    location: 'Yogyakarta',
    phone: '6285771624349',
    originalPrice: 189000,
    promoPrice: 99000,
    discount: 48,
    stockLeft: 15,
    rating: 4.9,
    reviews: 96,
    badge: 'Diskon 48%',
    variants: ['Botol Pipet 30ml', 'Botol Twin Pack 60ml'],
    img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=700&q=80',
    description: 'Serum pencerah kulit alami bersertifikasi BPOM dengan ekstrak centella asiatica pegunungan Merapi.'
  },
  {
    id: 'prod-tas-04',
    title: 'Tas Totebag Tenun Ikat Asli Jepara Handmade',
    category: 'kriya',
    categoryLabel: 'Kriya & Kerajinan',
    seller: 'Lestari Kriya Tenun',
    location: 'Jepara',
    phone: '6285771624349',
    originalPrice: 220000,
    promoPrice: 119000,
    discount: 46,
    stockLeft: 12,
    rating: 5.0,
    reviews: 78,
    badge: 'Diskon 46%',
    variants: ['Motif Toraja', 'Motif Lombok', 'Motif Sumba'],
    img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80',
    description: 'Totebag etnik ditenun manual ATBM oleh pengrajin perempuan Jepara. Kuat dan dilengkapi kompartemen laptop 14 inci.'
  },
  {
    id: 'prod-sambal-05',
    title: 'Sambal Cumi Asap Kecombrang Juara Gurih Pedas',
    category: 'kuliner',
    categoryLabel: 'Kuliner Nusantara',
    seller: 'Dapur Selera Nusantara',
    location: 'Surabaya',
    phone: '6285771624349',
    originalPrice: 65000,
    promoPrice: 38000,
    discount: 42,
    stockLeft: 35,
    rating: 4.9,
    reviews: 310,
    badge: 'Diskon 42%',
    variants: ['Level Sedang', 'Level Pedas Nampol'],
    img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80',
    description: 'Cumi segar pilihan dimasak asap bersama bunga kecombrang wangi. Tanpa pengawet kimia berbahaya.'
  },
  {
    id: 'prod-stand-06',
    title: 'Stand Laptop Kayu Jati Solid Ergonomis Anti Bungkuk',
    category: 'gadget',
    categoryLabel: 'Kreatif & Gadget',
    seller: 'Kayu Raya Craftworks',
    location: 'Solo',
    phone: '6285771624349',
    originalPrice: 195000,
    promoPrice: 98000,
    discount: 50,
    stockLeft: 8,
    rating: 4.8,
    reviews: 64,
    badge: 'Diskon 50%',
    variants: ['Natural Teak Finish', 'Dark Walnut Matte'],
    img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=700&q=80',
    description: 'Dudukan laptop lipat kayu jati grade A asli Jawa Tengah. Membantu sirkulasi udara laptop dan ergonomi kerja.'
  }
];

/**
 * Mendengarkan data produk secara Realtime (Firestore onSnapshot)
 */
function subscribeProducts(onSuccess, onError) {
  initFirebaseService();

  // Helper untuk get dari local
  const getLocalProducts = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  };

  if (firestoreDb) {
    try {
      const unsubscribe = firestoreDb.collection('products')
        .onSnapshot(async (snapshot) => {
          if (!snapshot.empty) {
            const list = [];
            snapshot.forEach(doc => {
              list.push({ id: doc.id, ...doc.data() });
            });
            // Simpan cache lokal
            try {
              localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
            } catch (e) {}
            onSuccess(list);
          } else {
            console.log('🌱 Firestore produk kosong. Memulai seed katalog default...');
            // Inisialisasi awal ke firestore
            const seedList = getLocalProducts();
            for (const p of seedList) {
              await firestoreDb.collection('products').doc(p.id).set(p).catch(() => {});
            }
            onSuccess(seedList);
          }
        }, (err) => {
          console.warn('⚠️ Firestore products listener warning:', err.message);
          onSuccess(getLocalProducts());
          if (onError) onError(err);
        });

      return unsubscribe;
    } catch (e) {
      console.warn('Fallback ke local products:', e);
      onSuccess(getLocalProducts());
      return () => {};
    }
  } else {
    onSuccess(getLocalProducts());
    return () => {};
  }
}

/**
 * Menambahkan Produk Baru (Create)
 */
async function createProduct(productData) {
  initFirebaseService();

  const id = productData.id || 'prod-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
  const now = new Date();

  // Hitung persentase diskon otomatis
  const original = Number(productData.originalPrice) || 0;
  const promo = Number(productData.promoPrice) || original;
  let discount = 0;
  if (original > promo && original > 0) {
    discount = Math.round(((original - promo) / original) * 100);
  }

  const payload = {
    ...productData,
    id,
    originalPrice: original,
    promoPrice: promo,
    discount,
    badge: discount > 0 ? `Diskon ${discount}%` : (productData.badge || 'Promo Baru'),
    stockLeft: Number(productData.stockLeft) || 10,
    rating: Number(productData.rating) || 5.0,
    reviews: Number(productData.reviews) || 1,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  if (firestoreDb) {
    try {
      await firestoreDb.collection('products').doc(id).set(payload);
      console.log('✅ [Firestore] Produk berhasil ditambahkan:', id);
    } catch (err) {
      console.warn('⚠️ Gagal simpan ke Firestore, simpan ke local fallback:', err);
      saveProductLocally(payload);
    }
  } else {
    saveProductLocally(payload);
  }

  return { success: true, product: payload };
}

/**
 * Memperbarui Data Produk (Update)
 */
async function updateProduct(id, updateData) {
  initFirebaseService();

  const original = Number(updateData.originalPrice) || 0;
  const promo = Number(updateData.promoPrice) || original;
  let discount = 0;
  if (original > promo && original > 0) {
    discount = Math.round(((original - promo) / original) * 100);
  }

  const payload = {
    ...updateData,
    id,
    originalPrice: original,
    promoPrice: promo,
    discount,
    badge: discount > 0 ? `Diskon ${discount}%` : (updateData.badge || 'Produk Lokal'),
    stockLeft: Number(updateData.stockLeft) || 0,
    updatedAt: new Date().toISOString()
  };

  if (firestoreDb) {
    try {
      await firestoreDb.collection('products').doc(id).set(payload, { merge: true });
      console.log('✅ [Firestore] Produk berhasil diupdate:', id);
    } catch (err) {
      console.warn('Gagal update di Firestore, update local fallback:', err);
      updateProductLocally(id, payload);
    }
  } else {
    updateProductLocally(id, payload);
  }

  return { success: true, product: payload };
}

/**
 * Menghapus Produk (Delete)
 */
async function deleteProduct(id) {
  initFirebaseService();

  if (firestoreDb) {
    try {
      await firestoreDb.collection('products').doc(id).delete();
      console.log('🗑️ [Firestore] Produk berhasil dihapus:', id);
    } catch (err) {
      console.warn('Gagal delete di Firestore, hapus local fallback:', err);
      deleteProductLocally(id);
    }
  } else {
    deleteProductLocally(id);
  }

  return { success: true, id };
}

// Helper penyimpanan lokal produk
function saveProductLocally(newProd) {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    list.unshift(newProd);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
  } catch (e) {}
}

function updateProductLocally(id, updated) {
  try {
    let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    list = list.map(p => p.id === id ? { ...p, ...updated } : p);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
  } catch (e) {}
}

function deleteProductLocally(id) {
  try {
    let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    list = list.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
  } catch (e) {}
}

// ===================================================================
// STATISTIK & ANALITIK SERVICES
// ===================================================================

/**
 * Ambil dan dengarkan statistik (Total Pengunjung, Klik WhatsApp, Jumlah Produk, Leads)
 */
function subscribeStats(onUpdate) {
  initFirebaseService();

  const getLocalStats = () => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.STATS);
      if (s) return JSON.parse(s);
    } catch (e) {}
    return {
      totalVisitors: 1248,
      waClicks: 386,
      totalOrders: 94,
      totalRevenueEstimated: 14850000
    };
  };

  const dispatchUpdate = (statsData) => {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(statsData));
    } catch (e) {}
    onUpdate(statsData);
  };

  if (firestoreDb) {
    try {
      // 1. Listen ke dokumen rekap stats/summary
      const unsub = firestoreDb.collection('stats').doc('summary').onSnapshot(async (doc) => {
        let stats = doc.exists ? doc.data() : getLocalStats();

        // Hitung juga jumlah data riil dari koleksi 'leads' untuk klik WhatsApp
        try {
          const leadsSnapshot = await firestoreDb.collection('leads').get();
          if (!leadsSnapshot.empty) {
            stats.waClicks = Math.max(stats.waClicks || 0, leadsSnapshot.size);
          }
        } catch (e) {}

        // Hitung jumlah riil dari orders
        try {
          const ordersSnapshot = await firestoreDb.collection('orders').get();
          if (!ordersSnapshot.empty) {
            stats.totalOrders = Math.max(stats.totalOrders || 0, ordersSnapshot.size);
          }
        } catch (e) {}

        dispatchUpdate(stats);
      }, () => {
        dispatchUpdate(getLocalStats());
      });

      return unsub;
    } catch (e) {
      dispatchUpdate(getLocalStats());
      return () => {};
    }
  } else {
    dispatchUpdate(getLocalStats());
    return () => {};
  }
}

/**
 * Catat Pengunjung Baru (+1 Total Pengunjung)
 */
async function recordVisitor() {
  initFirebaseService();

  // Local storage increment
  let localStats = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    localStats = raw ? JSON.parse(raw) : { totalVisitors: 1248, waClicks: 386, totalOrders: 94 };
    localStats.totalVisitors = (localStats.totalVisitors || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(localStats));
  } catch (e) {}

  if (firestoreDb && typeof firebase !== 'undefined' && firebase.firestore) {
    try {
      await firestoreDb.collection('stats').doc('summary').set({
        totalVisitors: firebase.firestore.FieldValue.increment(1),
        lastVisitedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('Gagal catat visitor ke Firestore:', e);
    }
  }
}

/**
 * Catat Klik WhatsApp (+1 Klik WhatsApp)
 */
async function recordWhatsAppClick(productId, sellerName) {
  initFirebaseService();

  // Local increment
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    const localStats = raw ? JSON.parse(raw) : { totalVisitors: 1248, waClicks: 386, totalOrders: 94 };
    localStats.waClicks = (localStats.waClicks || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(localStats));
  } catch (e) {}

  if (firestoreDb && typeof firebase !== 'undefined' && firebase.firestore) {
    try {
      // 1. Increment summary counter
      firestoreDb.collection('stats').doc('summary').set({
        waClicks: firebase.firestore.FieldValue.increment(1),
        lastWaClickAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // 2. Tambah record detail ke koleksi 'leads'
      firestoreDb.collection('leads').add({
        productId: productId || 'catalog_general',
        seller: sellerName || 'Semua UMKM',
        source: 'landing_page_wa_click',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        timestampStr: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Gagal catat WhatsApp click ke Firestore:', e);
    }
  }
}

/**
 * Ambil riwayat log leads / klik WhatsApp terkini
 */
async function fetchRecentLeads(limitCount = 10) {
  initFirebaseService();
  if (firestoreDb) {
    try {
      const snap = await firestoreDb.collection('leads')
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .get();

      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn('Gagal ambil list leads:', e);
    }
  }

  // Fallback demo leads
  return [
    { id: 'lead-1', seller: 'Kopia Artisan Roast', productId: 'Kopi Arabika Gayo Single Origin', timestampStr: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
    { id: 'lead-2', seller: 'Heritage Thread Bandung', productId: 'Kemeja Linen Pria Casual', timestampStr: new Date(Date.now() - 1000 * 60 * 35).toISOString() },
    { id: 'lead-3', seller: 'Glow Botanica Herbal', productId: 'Serum Brightening Niacinamide', timestampStr: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
    { id: 'lead-4', seller: 'Lestari Kriya Tenun', productId: 'Tas Totebag Tenun Ikat Jepara', timestampStr: new Date(Date.now() - 1000 * 60 * 180).toISOString() }
  ];
}

// Export ke global scope window agar dapat diakses modular oleh components & pages
window.FirebaseService = {
  initFirebaseService,
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  loginDemo,
  logoutAdmin,
  onAuthChange,
  subscribeProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  subscribeStats,
  recordVisitor,
  recordWhatsAppClick,
  fetchRecentLeads,
  DEFAULT_PRODUCTS
};
