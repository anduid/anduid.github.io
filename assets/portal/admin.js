
/**
 * ANDU Superadmin Master CMS Engine
 * Multi-store IndexedDB persistent storage with memory fallback,
 * live schema updates, and real-time EN / ID localization.
 */

// Global State
let currentLang = 'en';
let activeView = 'overview';
let dbInstance = null;

// Localization Dictionaries
const i18nDict = {
  en: {
    pill_superadmin: "SUPERADMIN ROOT ACCESS • v2.6 CMS",
    btn_push: "Test Web Push",
    nav_title: "ANDU Modules",
    mod_overview: "Overview & Telemetry",
    mod_products: "Apps & SaaS Products",
    mod_services: "Services & Software House",
    mod_courses: "Academy & Classes",
    mod_partners: "Partnership Hub",
    mod_posts: "Tech Blog & Articles",
    mod_members: "Members & Subscriptions",
    mod_terminal: "User Terminal Services",
    mod_settings: "System Settings & IDB",
    lbl_sync_engine: "Vault Sync Engine",
    kpi_apps: "SaaS Apps",
    kpi_services: "Client Svcs",
    kpi_students: "Academy",
    kpi_partners: "Partners",
    kpi_posts: "Articles",
    kpi_members: "Active VIPs",
    chart_title: "Realtime System Throughput & Pipeline Sync",
    btn_quick_app: "Deploy New App",
    btn_quick_course: "Publish Class",
    btn_quick_post: "Write Article",
    audit_log_title: "Audit Telemetry",
    btn_flush_logs: "Flush Logs",
    apps_heading: "Apps, Code & Libraries",
    apps_sub: "Catalog for Android SDKs, Jetpack Compose kits, and SaaS solutions.",
    btn_new_app: "Add New App / Kit",
    services_heading: "Services & Software House",
    services_sub: "Production engagements, architecture review, and Android security audits.",
    btn_new_service: "Create Service Offering",
    courses_heading: "Academy & Classes",
    courses_sub: "Curated masterclasses in Kotlin Multiplatform, NDK, and Jetpack Compose.",
    btn_new_course: "Add New Class",
    partners_heading: "Partnership Hub",
    partners_sub: "Institutional partners, resellers, universities, and revenue shares.",
    btn_new_partner: "Register Partner",
    posts_heading: "Tech Blog & Articles",
    posts_sub: "Publish engineering case studies, deep-dives, and platform release notes.",
    btn_new_post: "Create Article",
    members_heading: "Members & Subscriptions",
    members_sub: "Subscriber directory, seat provisioning, and enterprise licensing status.",
    btn_new_member: "Register Member",
    terminal_heading: "User Terminal Services",
    terminal_sub: "Configure micro-tools and daemon capabilities exposed inside developer terminals.",
    btn_new_daemon: "Add Terminal Service",
    settings_heading: "System Settings & IndexedDB Backup",
    settings_sub: "Manage persistent browser storage, backup JSON manifests, and reset default seeds.",
    backup_title: "JSON Manifest Snapshot",
    backup_desc: "Export the entire andu_superadmin_db database to a JSON file or restore from a previous administrative backup.",
    btn_export_db: "Export Database (.JSON)",
    btn_import_db: "Import Backup",
    seed_title: "Database Factory Reseed",
    seed_desc: "Wipe all localized state and reinstantiate the high-fidelity mock enterprise records across all seven operational engines.",
    btn_reseed: "Reload Production Seeds",
    btn_clear_db: "Clear All Records",
    btn_cancel: "Cancel",
    btn_commit: "Commit Mutation",
    notif_drawer_title: "Security & Pipeline Feeds",
    btn_mark_read: "Mark All As Acknowledged"
  },
  id: {
    pill_superadmin: "AKSES ROOT SUPERADMIN • v2.6 CMS",
    btn_push: "Uji Web Push",
    nav_title: "Modul ANDU",
    mod_overview: "Ikhtisar & Telemetri",
    mod_products: "Aplikasi & Produk SaaS",
    mod_services: "Layanan & Software House",
    mod_courses: "Akademi & Kelas",
    mod_partners: "Pusat Kemitraan",
    mod_posts: "Blog Teknologi & Artikel",
    mod_members: "Anggota & Langganan",
    mod_terminal: "Layanan Terminal Pengguna",
    mod_settings: "Pengaturan Sistem & IDB",
    lbl_sync_engine: "Mesin Sinkronisasi Vault",
    kpi_apps: "Aplikasi SaaS",
    kpi_services: "Layanan Klien",
    kpi_students: "Akademi",
    kpi_partners: "Mitra Resmi",
    kpi_posts: "Artikel Blog",
    kpi_members: "Member VIP",
    chart_title: "Throughput Sistem Realtime & Sinkronisasi Pipeline",
    btn_quick_app: "Rilis Aplikasi Baru",
    btn_quick_course: "Terbitkan Kelas",
    btn_quick_post: "Tulis Artikel",
    audit_log_title: "Telemetri Audit",
    btn_flush_logs: "Bersihkan Log",
    apps_heading: "Aplikasi, Kode & Pustaka",
    apps_sub: "Katalog Android SDK, kit Jetpack Compose, dan solusi SaaS terdistribusi.",
    btn_new_app: "Tambah Aplikasi / Kit Baru",
    services_heading: "Layanan & Software House",
    services_sub: "Kontrak pengembangan profesional, review arsitektur, dan audit keamanan Android.",
    btn_new_service: "Buat Penawaran Layanan",
    courses_heading: "Akademi & Kelas",
    courses_sub: "Masterclass terpilih untuk Kotlin Multiplatform, NDK, dan Jetpack Compose.",
    btn_new_course: "Tambah Kelas Baru",
    partners_heading: "Pusat Kemitraan",
    partners_sub: "Mitra institusi, reseller, universitas, dan skema bagi hasil resmi.",
    btn_new_partner: "Daftarkan Mitra Baru",
    posts_heading: "Blog Teknologi & Artikel",
    posts_sub: "Publikasikan studi kasus teknik, eksplorasi mendalam, dan catatan rilis platform.",
    btn_new_post: "Tulis Artikel Baru",
    members_heading: "Anggota & Langganan",
    members_sub: "Direktori pengguna berbayar, penyediaan lisensi, dan status paket enterprise.",
    btn_new_member: "Daftarkan Anggota",
    terminal_heading: "Layanan Terminal Pengguna",
    terminal_sub: "Konfigurasi mikro-tools dan daemon internal yang diakses dari terminal pengembang.",
    btn_new_daemon: "Tambah Layanan Terminal",
    settings_heading: "Pengaturan Sistem & Cadangan IDB",
    settings_sub: "Kelola penyimpanan lokal browser, cadangan manifes JSON, dan setel ulang data awal.",
    backup_title: "Cadangan Manifes JSON",
    backup_desc: "Ekspor seluruh database andu_superadmin_db ke berkas JSON atau pulihkan cadangan sebelumnya.",
    btn_export_db: "Ekspor Database (.JSON)",
    btn_import_db: "Impor Cadangan",
    seed_title: "Setel Ulang Data Produksi",
    seed_desc: "Hapus status saat ini dan pulihkan sampel catatan produksi untuk ketujuh modul operasional.",
    btn_reseed: "Muat Ulang Sampel Produksi",
    btn_clear_db: "Hapus Semua Catatan",
    btn_cancel: "Batal",
    btn_commit: "Simpan Mutasi",
    notif_drawer_title: "Notifikasi Keamanan & Pipeline",
    btn_mark_read: "Tandai Semua Sudah Dibaca"
  }
};

// Seed dataset for high-assurance initial bootstrap
const defaultSeeds = {
  products: [
    { id: "app-101", title: "Andu Flow Architecture Kit", category: "SaaS", price: "$299/mo", version: "3.4.1", targetSdk: "API 34 (Android 14)", icon: "developer_board" },
    { id: "app-102", title: "Compose Neo UI Component Suite", category: "Template", price: "$89", version: "1.2.0", targetSdk: "API 35 (Android 15)", icon: "widgets" },
    { id: "app-103", title: "KMP Network Engine Library", category: "Free", price: "$0", version: "2.0.4", targetSdk: "API 26-35 Multiplatform", icon: "hub" },
    { id: "app-104", title: "Andu App Sandbox Guard Pro", category: "SaaS", price: "$499/mo", version: "4.0.0", targetSdk: "API 34 (Android 14)", icon: "security" }
  ],
  services: [
    { id: "svc-201", name: "Custom Android OS & ROM Hardening", sla: "14 Days", rate: "$150/hr", status: "Active" },
    { id: "svc-202", name: "Security Audit Progita Assessment", sla: "5 Days", rate: "$180/hr", status: "Active" },
    { id: "svc-203", name: "Optima AI Neural Model On-Device Tuning", sla: "21 Days", rate: "$210/hr", status: "Active" },
    { id: "svc-204", name: "High-Frequency Bluetooth BLE Drivers", sla: "10 Days", rate: "$130/hr", status: "Paused" }
  ],
  courses: [
    { id: "crs-301", title: "Kotlin Multiplatform Enterprise Masterclass", level: "Advanced", modules: 18, price: "$249", cert: true },
    { id: "crs-302", title: "Jetpack Compose High-Performance Animations", level: "Intermediate", modules: 12, price: "$129", cert: true },
    { id: "crs-303", title: "Android NDK & C++ Kernel Fundamentals", level: "Advanced", modules: 24, price: "$349", cert: true },
    { id: "crs-304", title: "Modern Android Architecture Zero to Hero", level: "Beginner", modules: 8, price: "Free", cert: false }
  ],
  partners: [
    { id: "prt-401", name: "TechBandung Research Labs", type: "Institution", commission: 20, status: "Active" },
    { id: "prt-402", name: "Nusantara Cloud Reseller", type: "Reseller", commission: 25, status: "Active" },
    { id: "prt-403", name: "CyberDev Academy Southeast Asia", type: "EdTech", commission: 15, status: "Pending" }
  ],
  posts: [
    { id: "pst-501", title: "Android 15 Foreground Services Migration Handbook", category: "Tutorial", author: "anduroot", views: "6.4k", date: "2025-05-10" },
    { id: "pst-502", title: "Zero Overhead Garbage Collection with KMP Native", category: "Case Study", author: "dimas_kernel", views: "4.8k", date: "2025-05-02" },
    { id: "pst-503", title: "Changelog: ANDU Engine 4.2 Pipeline Enhancements", category: "Changelog", author: "sysadmin", views: "3.1k", date: "2025-04-28" }
  ],
  members: [
    { id: "mbr-601", name: "Alexander Wright", email: "a.wright@nexusmob.io", plan: "VIP Lifetime", licenses: 12, status: "Active" },
    { id: "mbr-602", name: "Citra Dewi Kusuma", email: "citra@indodev.net", plan: "Developer Monthly", licenses: 3, status: "Active" },
    { id: "mbr-603", name: "Kenji Sato", email: "k.sato@tokyo-labs.jp", plan: "VIP Lifetime", licenses: 25, status: "Active" },
    { id: "mbr-604", name: "Budi Santoso", email: "budi@santoso.dev", plan: "Free", licenses: 1, status: "Pending" }
  ],
  terminal: [
    { id: "trm-701", name: "Andu Remote ADB Daemon Bridge", quota: "50 GB", gradleAccess: "Superuser", apiInspector: "Enabled", status: "Active" },
    { id: "trm-702", name: "Gradle Incremental Cache Accelerator", quota: "120 GB", gradleAccess: "Full Speed", apiInspector: "Enabled", status: "Active" },
    { id: "trm-703", name: "Memory Profiler & Valgrind Bridge", quota: "25 GB", gradleAccess: "Sandboxed", apiInspector: "Disabled", status: "Standby" }
  ],
  notifs: [
    { id: "ntf-1", title: "Kernel Build Verified", text: "Target SDK 35 artifact bundle successfully signed.", time: "4 mins ago", read: false },
    { id: "ntf-2", title: "New Enterprise License", text: "NexusMob purchased 12 seat allocation in VIP Tier.", time: "18 mins ago", read: false },
    { id: "ntf-3", title: "Security Key Re-validated", text: "Root L0 session extended for another 12 hours.", time: "1 hour ago", read: false }
  ]
};

// In-Memory Storage Cache (for synchronous reads or when IDB is unavailable)
let cacheData = JSON.parse(JSON.stringify(defaultSeeds));

// IndexedDB Helper
function initDatabase() {
  return new Promise((resolve) => {
    if (!('indexedDB' in window)) {
      console.warn("IndexedDB not supported. Running on in-memory persistence.");
      document.getElementById('idb-status-indicator').innerText = "MEM: FALLBACK";
      resolve(null);
      return;
    }

    const request = indexedDB.open('andu_superadmin_db', 3);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const storeNames = ['products', 'services', 'courses', 'partners', 'posts', 'members', 'terminal', 'notifs'];
      storeNames.forEach(store => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' });
        }
      });
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      document.getElementById('idb-status-indicator').innerText = "IDB: PERSISTENT";
      loadAllFromIndexedDB().then(resolve);
    };

    request.onerror = () => {
      console.warn("IndexedDB initialization error. Falling back to memory.");
      document.getElementById('idb-status-indicator').innerText = "MEM: RESTRICTED";
      resolve(null);
    };
  });
}

async function loadAllFromIndexedDB() {
  if (!dbInstance) return;
  const storeNames = ['products', 'services', 'courses', 'partners', 'posts', 'members', 'terminal', 'notifs'];
  
  for (const store of storeNames) {
    const items = await getStoreRecords(store);
    if (items && items.length > 0) {
      cacheData[store] = items;
    } else {
      // Seed default items if empty
      for (const item of defaultSeeds[store]) {
        await putStoreRecord(store, item);
      }
      cacheData[store] = [...defaultSeeds[store]];
    }
  }
}

function getStoreRecords(storeName) {
  return new Promise((resolve) => {
    if (!dbInstance) {
      resolve(cacheData[storeName] || []);
      return;
    }
    try {
      const transaction = dbInstance.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(cacheData[storeName] || []);
    } catch (e) {
      resolve(cacheData[storeName] || []);
    }
  });
}

function putStoreRecord(storeName, record) {
  return new Promise((resolve) => {
    // update cache first
    const idx = cacheData[storeName].findIndex(x => x.id === record.id);
    if (idx >= 0) cacheData[storeName][idx] = record;
    else cacheData[storeName].push(record);

    if (!dbInstance) {
      resolve(true);
      return;
    }
    try {
      const transaction = dbInstance.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const req = store.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

function deleteStoreRecord(storeName, id) {
  return new Promise((resolve) => {
    cacheData[storeName] = cacheData[storeName].filter(x => x.id !== id);
    if (!dbInstance) {
      resolve(true);
      return;
    }
    try {
      const transaction = dbInstance.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

// Language / Localization Handler
function setLanguage(lang) {
  currentLang = lang;
  document.getElementById('lang-btn-en').className = lang === 'en' 
    ? 'px-space-sm py-space-xs rounded font-label-sm text-label-sm font-semibold bg-tertiary-container text-on-tertiary-container transition-all'
    : 'px-space-sm py-space-xs rounded font-label-sm text-label-sm font-semibold text-on-surface-variant hover:text-on-surface transition-all';
  
  document.getElementById('lang-btn-id').className = lang === 'id'
    ? 'px-space-sm py-space-xs rounded font-label-sm text-label-sm font-semibold bg-tertiary-container text-on-tertiary-container transition-all'
    : 'px-space-sm py-space-xs rounded font-label-sm text-label-sm font-semibold text-on-surface-variant hover:text-on-surface transition-all';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18nDict[lang][key]) {
      el.innerText = i18nDict[lang][key];
    }
  });

  renderAllViews();
}

// Module Switching Logic
function initModuleSwitcher() {
  const buttons = document.querySelectorAll('.module-tab-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-view');
      switchModule(targetView);
    });
  });
}

function switchModule(viewId) {
  activeView = viewId;
  document.querySelectorAll('.module-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-view') === viewId) {
      btn.className = "module-tab-btn active-tab flex items-center justify-between px-space-md py-space-sm rounded-lg text-left transition-all bg-primary-container text-on-primary-container font-semibold shadow-sm";
    } else {
      btn.className = "module-tab-btn flex items-center justify-between px-space-md py-space-sm rounded-lg text-left transition-all text-on-surface-variant hover:bg-surface-container-high";
    }
  });

  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.add('hidden');
  });

  const activePanel = document.getElementById(`view-${viewId}`);
  if (activePanel) {
    activePanel.classList.remove('hidden');
  }

  renderAllViews();
}

// Render Functions for Tables & KPIs
function renderAllViews() {
  updateKPIs();
  renderProductsTable();
  renderServicesTable();
  renderCoursesTable();
  renderPartnersTable();
  renderPostsTable();
  renderMembersTable();
  renderTerminalTable();
  renderNotifications();
}

function updateKPIs() {
  document.getElementById('kpi-apps-val').innerText = cacheData.products.length;
  document.getElementById('kpi-services-val').innerText = cacheData.services.length;
  document.getElementById('kpi-students-val').innerText = cacheData.courses.length;
  document.getElementById('kpi-partners-val').innerText = cacheData.partners.length;
  document.getElementById('kpi-posts-val').innerText = cacheData.posts.length;
  document.getElementById('kpi-members-val').innerText = cacheData.members.length;

  document.getElementById('badge-count-products').innerText = cacheData.products.length;
  document.getElementById('badge-count-services').innerText = cacheData.services.length;
  document.getElementById('badge-count-courses').innerText = cacheData.courses.length;
  document.getElementById('badge-count-partners').innerText = cacheData.partners.length;
  document.getElementById('badge-count-posts').innerText = cacheData.posts.length;
  document.getElementById('badge-count-members').innerText = cacheData.members.length;
  document.getElementById('badge-count-terminal').innerText = cacheData.terminal.length;
}

// 1. PRODUCTS TABLE
function renderProductsTable(query = '') {
  const tbody = document.getElementById('table-body-products');
  let items = cacheData.products;
  if (query) {
    items = items.filter(x => x.title.toLowerCase().includes(query.toLowerCase()) || x.targetSdk.toLowerCase().includes(query.toLowerCase()) || x.category.toLowerCase().includes(query.toLowerCase()));
  }

  tbody.innerHTML = items.map(item => `
    <tr class="hover:bg-primary/5 transition-colors group">
      <td class="py-space-md px-space-md flex items-center gap-space-sm font-semibold text-on-surface">
        <span class="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-primary">
          <span class="material-symbols-outlined text-[18px]">${item.icon || 'deployed_code'}</span>
        </span>
        <span>${item.title}</span>
      </td>
      <td class="py-space-md px-space-md">
        <span class="px-space-sm py-space-xs rounded-full font-label-sm text-label-sm font-mono ${item.category === 'SaaS' ? 'bg-primary-container/20 text-primary' : item.category === 'Template' ? 'bg-secondary-container/20 text-secondary' : 'bg-surface-container-high text-on-surface-variant'}">${item.category}</span>
      </td>
      <td class="py-space-md px-space-md font-mono text-secondary font-medium">${item.price}</td>
      <td class="py-space-md px-space-md font-mono text-on-surface-variant">${item.version}</td>
      <td class="py-space-md px-space-md text-on-surface-variant font-mono text-body-sm">${item.targetSdk}</td>
      <td class="py-space-md px-space-md text-right">
        <div class="inline-flex items-center gap-space-xs">
          <button onclick="openEditModal('products', '${item.id}')" class="p-1 rounded hover:bg-surface-container-high text-secondary hover:text-on-surface transition-colors" title="Edit">
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button onclick="confirmDeleteRecord('products', '${item.id}')" class="p-1 rounded hover:bg-error/20 text-error hover:text-error transition-colors" title="Delete">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// 2. SERVICES TABLE
function renderServicesTable(query = '') {
  const tbody = document.getElementById('table-body-services');
  let items = cacheData.services;
  if (query) {
    items = items.filter(x => x.name.toLowerCase().includes(query.toLowerCase()) || x.sla.toLowerCase().includes(query.toLowerCase()));
  }

  tbody.innerHTML = items.map(item => `
    <tr class="hover:bg-primary/5 transition-colors">
      <td class="py-space-md px-space-md font-semibold text-on-surface">${item.name}</td>
      <td class="py-space-md px-space-md font-mono text-secondary">${item.sla}</td>
      <td class="py-space-md px-space-md font-mono font-medium text-primary">${item.rate}</td>
      <td class="py-space-md px-space-md">
        <span class="px-space-sm py-space-xs rounded-full font-label-sm text-label-sm font-mono ${item.status === 'Active' ? 'bg-primary-container/20 text-primary' : 'bg-surface-container-high text-on-surface-variant'}">${item.status}</span>
      </td>
      <td class="py-space-md px-space-md text-right">
        <div class="inline-flex items-center gap-space-xs">
          <button onclick="openEditModal('services', '${item.id}')" class="p-1 rounded hover:bg-surface-container-high text-secondary transition-colors">
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button onclick="confirmDeleteRecord('services', '${item.id}')" class="p-1 rounded hover:bg-error/20 text-error transition-colors">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// 3. COURSES TABLE
function renderCoursesTable(query = '') {
  const tbody = document.getElementById('table-body-courses');
  let items = cacheData.courses;
  if (query) {
    items = items.filter(x => x.title.toLowerCase().includes(query.toLowerCase()) || x.level.toLowerCase().includes(query.toLowerCase()));
  }

  tbody.innerHTML = items.map(item => `
    <tr class="hover:bg-primary/5 transition-colors">
      <td class="py-space-md px-space-md font-semibold text-on-surface">${item.title}</td>
      <td class="py-space-md px-space-md">
        <span class="px-space-sm py-space-xs rounded font-label-sm text-label-sm font-mono ${item.level === 'Advanced' ? 'bg-tertiary-container/30 text-tertiary' : item.level === 'Intermediate' ? 'bg-secondary-container/20 text-secondary' : 'bg-surface-container-high text-on-surface-variant'}">${item.level}</span>
      </td>
      <td class="py-space-md px-space-md font-mono text-on-surface-variant">${item.modules} units</td>
      <td class="py-space-md px-space-md font-mono text-primary font-medium">${item.price}</td>
      <td class="py-space-md px-space-md">
        <span class="flex items-center gap-space-xs font-label-sm text-label-sm ${item.cert ? 'text-primary' : 'text-on-surface-variant'}">
          <span class="material-symbols-outlined text-[16px]">${item.cert ? 'verified' : 'cancel'}</span>
          <span>${item.cert ? 'Enabled' : 'None'}</span>
        </span>
      </td>
      <td class="py-space-md px-space-md text-right">
        <div class="inline-flex items-center gap-space-xs">
          <button onclick="openEditModal('courses', '${item.id}')" class="p-1 rounded hover:bg-surface-container-high text-secondary transition-colors">
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button onclick="confirmDeleteRecord('courses', '${item.id}')" class="p-1 rounded hover:bg-error/20 text-error transition-colors">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// 4. PARTNERS TABLE
function renderPartnersTable(query = '') {
  const tbody = document.getElementById('table-body-partners');
  let items = cacheData.partners;
  if (query) {
    items = items.filter(x => x.name.toLowerCase().includes(query.toLowerCase()) || x.type.toLowerCase().includes(query.toLowerCase()));
  }

  tbody.innerHTML = items.map(item => `
    <tr class="hover:bg-primary/5 transition-colors">
      <td class="py-space-md px-space-md font-semibold text-on-surface">${item.name}</td>
      <td class="py-space-md px-space-md font-mono text-on-surface-variant">${item.type}</td>
      <td class="py-space-md px-space-md font-mono text-secondary font-medium">${item.commission}%</td>
      <td class="py-space-md px-space-md">
        <span class="px-space-sm py-space-xs rounded-full font-label-sm text-label-sm font-mono ${item.status === 'Active' ? 'bg-primary-container/20 text-primary' : 'bg-surface-container-high text-on-surface-variant'}">${item.status}</span>
      </td>
      <td class="py-space-md px-space-md text-right">
        <div class="inline-flex items-center gap-space-xs">
          <button onclick="openEditModal('partners', '${item.id}')" class="p-1 rounded hover:bg-surface-container-high text-secondary transition-colors">
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button onclick="confirmDeleteRecord('partners', '${item.id}')" class="p-1 rounded hover:bg-error/20 text-error transition-colors">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// 5. POSTS TABLE
function renderPostsTable(query = '') {
  const tbody = document.getElementById('table-body-posts');
  let items = cacheData.posts;
  if (query) {
    items = items.filter(x => x.title.toLowerCase().includes(query.toLowerCase()) || x.category.toLowerCase().includes(query.toLowerCase()) || x.author.toLowerCase().includes(query.toLowerCase()));
  }

  tbody.innerHTML = items.map(item => `
    <tr class="hover:bg-primary/5 transition-colors">
      <td class="py-space-md px-space-md font-semibold text-on-surface">${item.title}</td>
      <td class="py-space-md px-space-md">
        <span class="px-space-sm py-space-xs rounded font-label-sm text-label-sm font-mono bg-surface-container-high text-tertiary">${item.category}</span>
      </td>
      <td class="py-space-md px-space-md font-mono text-on-surface-variant">@${item.author}</td>
      <td class="py-space-md px-space-md font-mono text-secondary">${item.views}</td>
      <td class="py-space-md px-space-md font-mono text-on-surface-variant text-body-sm">${item.date}</td>
      <td class="py-space-md px-space-md text-right">
        <div class="inline-flex items-center gap-space-xs">
          <button onclick="openEditModal('posts', '${item.id}')" class="p-1 rounded hover:bg-surface-container-high text-secondary transition-colors">
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button onclick="confirmDeleteRecord('posts', '${item.id}')" class="p-1 rounded hover:bg-error/20 text-error transition-colors">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// 6. MEMBERS TABLE
function renderMembersTable(query = '') {
  const tbody = document.getElementById('table-body-members');
  let items = cacheData.members;
  if (query) {
    items = items.filter(x => x.name.toLowerCase().includes(query.toLowerCase()) || x.email.toLowerCase().includes(query.toLowerCase()) || x.plan.toLowerCase().includes(query.toLowerCase()));
  }

  tbody.innerHTML = items.map(item => `
    <tr class="hover:bg-primary/5 transition-colors">
      <td class="py-space-md px-space-md font-semibold text-on-surface">${item.name}</td>
      <td class="py-space-md px-space-md font-mono text-on-surface-variant text-body-sm">${item.email}</td>
      <td class="py-space-md px-space-md">
        <span class="px-space-sm py-space-xs rounded font-label-sm text-label-sm font-mono ${item.plan.includes('VIP') ? 'bg-primary-container/20 text-primary font-bold' : item.plan.includes('Developer') ? 'bg-secondary-container/20 text-secondary' : 'bg-surface-container-high text-on-surface-variant'}">${item.plan}</span>
      </td>
      <td class="py-space-md px-space-md font-mono text-secondary">${item.licenses} Seats</td>
      <td class="py-space-md px-space-md">
        <span class="px-space-sm py-space-xs rounded-full font-label-sm text-label-sm font-mono ${item.status === 'Active' ? 'bg-primary-container/20 text-primary' : 'bg-surface-container-high text-on-surface-variant'}">${item.status}</span>
      </td>
      <td class="py-space-md px-space-md text-right">
        <div class="inline-flex items-center gap-space-xs">
          <button onclick="openEditModal('members', '${item.id}')" class="p-1 rounded hover:bg-surface-container-high text-secondary transition-colors">
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button onclick="confirmDeleteRecord('members', '${item.id}')" class="p-1 rounded hover:bg-error/20 text-error transition-colors">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// 7. TERMINAL SERVICES TABLE
function renderTerminalTable(query = '') {
  const tbody = document.getElementById('table-body-terminal');
  let items = cacheData.terminal;
  if (query) {
    items = items.filter(x => x.name.toLowerCase().includes(query.toLowerCase()) || x.quota.toLowerCase().includes(query.toLowerCase()));
  }

  tbody.innerHTML = items.map(item => `
    <tr class="hover:bg-primary/5 transition-colors">
      <td class="py-space-md px-space-md font-semibold text-on-surface font-mono flex items-center gap-space-xs">
        <span class="material-symbols-outlined text-secondary text-[16px]">terminal</span>
        <span>${item.name}</span>
      </td>
      <td class="py-space-md px-space-md font-mono text-primary font-medium">${item.quota}</td>
      <td class="py-space-md px-space-md font-mono text-on-surface-variant">${item.gradleAccess}</td>
      <td class="py-space-md px-space-md font-mono text-secondary">${item.apiInspector}</td>
      <td class="py-space-md px-space-md">
        <span class="px-space-sm py-space-xs rounded-full font-label-sm text-label-sm font-mono ${item.status === 'Active' ? 'bg-primary-container/20 text-primary' : 'bg-surface-container-high text-on-surface-variant'}">${item.status}</span>
      </td>
      <td class="py-space-md px-space-md text-right">
        <div class="inline-flex items-center gap-space-xs">
          <button onclick="openEditModal('terminal', '${item.id}')" class="p-1 rounded hover:bg-surface-container-high text-secondary transition-colors">
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button onclick="confirmDeleteRecord('terminal', '${item.id}')" class="p-1 rounded hover:bg-error/20 text-error transition-colors">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Dynamic Filter Handler for Search Inputs
function filterTable(entity, val) {
  if (entity === 'products') renderProductsTable(val);
  else if (entity === 'services') renderServicesTable(val);
  else if (entity === 'courses') renderCoursesTable(val);
  else if (entity === 'partners') renderPartnersTable(val);
  else if (entity === 'posts') renderPostsTable(val);
  else if (entity === 'members') renderMembersTable(val);
  else if (entity === 'terminal') renderTerminalTable(val);
}

// Modal CRUD Schema Builders
function openCreateModal(entity) {
  document.getElementById('crud-modal').classList.remove('hidden');
  document.getElementById('crud-input-id').value = '';
  document.getElementById('crud-input-entity').value = entity;
  
  const title = currentLang === 'en' ? `Create New ${capitalize(entity)} Record` : `Tambah Data ${capitalize(entity)} Baru`;
  document.getElementById('crud-modal-title').innerText = title;
  document.getElementById('crud-modal-subtitle').innerText = `Schema Target: ${entity}`;
  
  injectFormFields(entity, null);
}

function openEditModal(entity, id) {
  const item = cacheData[entity].find(x => x.id === id);
  if (!item) return;

  document.getElementById('crud-modal').classList.remove('hidden');
  document.getElementById('crud-input-id').value = item.id;
  document.getElementById('crud-input-entity').value = entity;

  const title = currentLang === 'en' ? `Edit ${capitalize(entity)} Record` : `Ubah Data ${capitalize(entity)}`;
  document.getElementById('crud-modal-title').innerText = title;
  document.getElementById('crud-modal-subtitle').innerText = `ID: ${item.id} • Target: ${entity}`;

  injectFormFields(entity, item);
}

function closeCrudModal() {
  document.getElementById('crud-modal').classList.add('hidden');
}

function injectFormFields(entity, item) {
  const container = document.getElementById('crud-dynamic-fields');
  container.innerHTML = '';

  if (entity === 'products') {
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">APP / KIT TITLE</label>
          <input required type="text" name="title" value="${item ? item.title : ''}" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-body-md text-body-md">
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">CATEGORY</label>
          <select name="category" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-body-md text-body-md">
            <option value="SaaS" ${item && item.category === 'SaaS' ? 'selected' : ''}>SaaS Software</option>
            <option value="Template" ${item && item.category === 'Template' ? 'selected' : ''}>Architecture Template</option>
            <option value="Free" ${item && item.category === 'Free' ? 'selected' : ''}>Free Open-Source</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">PRICE LABEL</label>
          <input required type="text" name="price" value="${item ? item.price : '$199/mo'}" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">SEMANTIC VERSION</label>
          <input required type="text" name="version" value="${item ? item.version : '1.0.0'}" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">TARGET SDK</label>
          <input required type="text" name="targetSdk" value="${item ? item.targetSdk : 'API 35 (Android 15)'}" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
        </div>
      </div>
    `;
  } else if (entity === 'services') {
    container.innerHTML = `
      <div class="flex flex-col gap-1">
        <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">SERVICE OFFERING NAME</label>
        <input required type="text" name="name" value="${item ? item.name : ''}" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">TURNAROUND SLA</label>
          <input required type="text" name="sla" value="${item ? item.sla : '7 Days'}" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">BILLING RATE</label>
          <input required type="text" name="rate" value="${item ? item.rate : '$150/hr'}" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">STATUS</label>
          <select name="status" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
            <option value="Active" ${item && item.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Paused" ${item && item.status === 'Paused' ? 'selected' : ''}>Paused</option>
          </select>
        </div>
      </div>
    `;
  } else if (entity === 'courses') {
    container.innerHTML = `
      <div class="flex flex-col gap-1">
        <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">CLASS / CURRICULUM TITLE</label>
        <input required type="text" name="title" value="${item ? item.title : ''}" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-space-md">
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">DIFFICULTY</label>
          <select name="level" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
            <option value="Beginner" ${item && item.level === 'Beginner' ? 'selected' : ''}>Beginner</option>
            <option value="Intermediate" ${item && item.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
            <option value="Advanced" ${item && item.level === 'Advanced' ? 'selected' : ''}>Advanced</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">MODULE COUNT</label>
          <input required type="number" name="modules" value="${item ? item.modules : 10}" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">TUITION PRICE</label>
          <input required type="text" name="price" value="${item ? item.price : '$99'}" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
        </div>
        <div class="flex flex-col gap-1 justify-center">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">CERTIFICATION</label>
          <div class="flex items-center gap-space-xs mt-2">
            <input type="checkbox" name="cert" ${item && item.cert ? 'checked' : ''} class="w-4 h-4 accent-primary">
            <span class="font-body-sm text-body-sm text-on-surface">Enable Badge</span>
          </div>
        </div>
      </div>
    `;
  } else if (entity === 'partners') {
    container.innerHTML = `
      <div class="flex flex-col gap-1">
        <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">PARTNER ORGANIZATION NAME</label>
        <input required type="text" name="name" value="${item ? item.name : ''}" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">TYPE</label>
          <select name="type" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
            <option value="Institution" ${item && item.type === 'Institution' ? 'selected' : ''}>Institution</option>
            <option value="Reseller" ${item && item.type === 'Reseller' ? 'selected' : ''}>Reseller</option>
            <option value="EdTech" ${item && item.type === 'EdTech' ? 'selected' : ''}>EdTech Partner</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">COMMISSION %</label>
          <input required type="number" name="commission" value="${item ? item.commission : 20}" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">STATUS</label>
          <select name="status" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
            <option value="Active" ${item && item.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Pending" ${item && item.status === 'Pending' ? 'selected' : ''}>Pending</option>
          </select>
        </div>
      </div>
    `;
  } else if (entity === 'posts') {
    container.innerHTML = `
      <div class="flex flex-col gap-1">
        <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">POST HEADLINE / TITLE</label>
        <input required type="text" name="title" value="${item ? item.title : ''}" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">CATEGORY</label>
          <select name="category" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
            <option value="Tutorial" ${item && item.category === 'Tutorial' ? 'selected' : ''}>Tutorial</option>
            <option value="Case Study" ${item && item.category === 'Case Study' ? 'selected' : ''}>Case Study</option>
            <option value="Changelog" ${item && item.category === 'Changelog' ? 'selected' : ''}>Changelog</option>
            <option value="Trends" ${item && item.category === 'Trends' ? 'selected' : ''}>Trends</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">AUTHOR HANDLE</label>
          <input required type="text" name="author" value="${item ? item.author : 'anduroot'}" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">PUBLISH DATE</label>
          <input required type="date" name="date" value="${item ? item.date : new Date().toISOString().split('T')[0]}" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
        </div>
      </div>
    `;
  } else if (entity === 'members') {
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">MEMBER FULL NAME</label>
          <input required type="text" name="name" value="${item ? item.name : ''}" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">PRIMARY EMAIL</label>
          <input required type="email" name="email" value="${item ? item.email : ''}" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">PLAN TIER</label>
          <select name="plan" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
            <option value="VIP Lifetime" ${item && item.plan === 'VIP Lifetime' ? 'selected' : ''}>VIP Lifetime</option>
            <option value="Developer Monthly" ${item && item.plan === 'Developer Monthly' ? 'selected' : ''}>Developer Monthly</option>
            <option value="Free" ${item && item.plan === 'Free' ? 'selected' : ''}>Free Tier</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">LICENSES ALLOCATED</label>
          <input required type="number" name="licenses" value="${item ? item.licenses : 1}" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">STATUS</label>
          <select name="status" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
            <option value="Active" ${item && item.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Pending" ${item && item.status === 'Pending' ? 'selected' : ''}>Pending</option>
          </select>
        </div>
      </div>
    `;
  } else if (entity === 'terminal') {
    container.innerHTML = `
      <div class="flex flex-col gap-1">
        <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">DAEMON / SERVICE IDENTIFIER</label>
        <input required type="text" name="name" value="${item ? item.name : ''}" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-space-md">
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">STORAGE QUOTA</label>
          <input required type="text" name="quota" value="${item ? item.quota : '25 GB'}" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">GRADLE ACCESS</label>
          <select name="gradleAccess" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
            <option value="Superuser" ${item && item.gradleAccess === 'Superuser' ? 'selected' : ''}>Superuser</option>
            <option value="Full Speed" ${item && item.gradleAccess === 'Full Speed' ? 'selected' : ''}>Full Speed</option>
            <option value="Sandboxed" ${item && item.gradleAccess === 'Sandboxed' ? 'selected' : ''}>Sandboxed</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">API INSPECTOR</label>
          <select name="apiInspector" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
            <option value="Enabled" ${item && item.apiInspector === 'Enabled' ? 'selected' : ''}>Enabled</option>
            <option value="Disabled" ${item && item.apiInspector === 'Disabled' ? 'selected' : ''}>Disabled</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant font-mono">STATUS</label>
          <select name="status" class="bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface font-body-md text-body-md">
            <option value="Active" ${item && item.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Standby" ${item && item.status === 'Standby' ? 'selected' : ''}>Standby</option>
          </select>
        </div>
      </div>
    `;
  }
}

async function handleCrudFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const entity = document.getElementById('crud-input-entity').value;
  let id = document.getElementById('crud-input-id').value;

  const formData = new FormData(form);
  const record = {};
  formData.forEach((value, key) => {
    if (key !== 'id' && key !== 'entity') {
      record[key] = value;
    }
  });

  if (entity === 'courses') {
    record.cert = form.elements['cert'] ? form.elements['cert'].checked : false;
    record.modules = parseInt(record.modules, 10) || 1;
  }
  if (entity === 'partners') {
    record.commission = parseInt(record.commission, 10) || 10;
  }
  if (entity === 'members') {
    record.licenses = parseInt(record.licenses, 10) || 1;
  }

  if (!id) {
    id = `${entity.substr(0, 3)}-${Date.now().toString().slice(-4)}`;
  }
  record.id = id;

  if (entity === 'products' && !record.icon) {
    record.icon = 'layers';
  }

  await putStoreRecord(entity, record);
  closeCrudModal();
  renderAllViews();
  showToast(`Mutation saved successfully to ${entity}!`, 'success');
  addAuditLog(`RECORD_MUTATE: ${entity.toUpperCase()}`, `${id} updated by superadmin.`);
}

async function confirmDeleteRecord(entity, id) {
  if (!confirm(`Are you sure you want to delete this record (${id}) from ${entity}?`)) {
    return;
  }
  await deleteStoreRecord(entity, id);
  renderAllViews();
  showToast(`Record ${id} removed from ${entity}.`, 'info');
  addAuditLog(`RECORD_DELETE: ${entity.toUpperCase()}`, `${id} deleted from local IDB.`);
}

// Notifications Flyout Logic
function toggleNotifsModal(show) {
  const modal = document.getElementById('notif-modal');
  if (show !== undefined) {
    modal.classList.toggle('hidden', !show);
  } else {
    modal.classList.toggle('hidden');
  }
}

function renderNotifications() {
  const container = document.getElementById('notif-list-container');
  const items = cacheData.notifs;
  const unreadCount = items.filter(x => !x.read).length;
  
  const badge = document.getElementById('notif-badge');
  badge.innerText = unreadCount;
  badge.classList.toggle('hidden', unreadCount === 0);

  container.innerHTML = items.map(n => `
    <div class="p-space-sm rounded-lg ${n.read ? 'bg-surface-container-high/40' : 'bg-surface-container-high border-l-2 border-primary'} flex flex-col gap-1">
      <div class="flex items-center justify-between text-on-surface font-label-sm text-label-sm">
        <span class="font-bold ${n.read ? 'text-on-surface-variant' : 'text-primary'}">${n.title}</span>
        <span class="text-on-surface-variant font-mono text-[10px]">${n.time}</span>
      </div>
      <p class="font-body-sm text-body-sm text-on-surface-variant">${n.text}</p>
    </div>
  `).join('');
}

function markAllNotifsRead() {
  cacheData.notifs.forEach(n => {
    n.read = true;
    putStoreRecord('notifs', n);
  });
  renderNotifications();
  showToast('All notifications marked as acknowledged.', 'info');
}

// Web Push Trigger Mock
function triggerWebPushTest() {
  if ("Notification" in window) {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification("ANDU OS Core Telemetry", {
          body: "Push notification daemon online. All Android cluster nodes active.",
          icon: "https://fonts.gstatic.com/s/i/materialiconsoutlined/adb/v16/24px.svg"
        });
        showToast("Web Push sent to native notification center.", "success");
      } else {
        showToast("Notification permission denied or blocked.", "error");
      }
    });
  } else {
    showToast("Simulated Push: ANDU Daemon Heartbeat 100% OK", "info");
  }

  // Inject a live notif item
  const newNotif = {
    id: `ntf-${Date.now()}`,
    title: "Web Push Dispatched",
    text: "Administrative probe sent to active clients.",
    time: "Just now",
    read: false
  };
  cacheData.notifs.unshift(newNotif);
  putStoreRecord('notifs', newNotif);
  renderNotifications();
}

// System Backup, Export & Reseed
function exportDatabaseJSON() {
  const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cacheData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", jsonStr);
  downloadAnchor.setAttribute("download", `andu_superadmin_backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Database snapshot exported successfully.', 'success');
  addAuditLog('DB_EXPORT', 'Full database snapshot downloaded as JSON.');
}

function importDatabaseJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      for (const store in parsed) {
        if (Array.isArray(parsed[store])) {
          cacheData[store] = parsed[store];
          for (const item of parsed[store]) {
            await putStoreRecord(store, item);
          }
        }
      }
      renderAllViews();
      showToast('Database successfully restored from JSON!', 'success');
      addAuditLog('DB_IMPORT', `Restored snapshot containing ${file.name}`);
    } catch (err) {
      showToast('Invalid backup file format.', 'error');
    }
  };
  reader.readAsText(file);
}

async function reseedDatabase() {
  if (!confirm("Reset database to factory default seeds? Custom entries will be overwritten.")) return;
  for (const store in defaultSeeds) {
    cacheData[store] = JSON.parse(JSON.stringify(defaultSeeds[store]));
    for (const item of defaultSeeds[store]) {
      await putStoreRecord(store, item);
    }
  }
  renderAllViews();
  showToast('Factory production seeds reloaded.', 'success');
  addAuditLog('DB_RESEED', 'IndexedDB reset to initial seeds.');
}

async function clearEntireDatabase() {
  if (!confirm("WARNING: Are you sure you want to completely erase all records in andu_superadmin_db?")) return;
  const storeNames = ['products', 'services', 'courses', 'partners', 'posts', 'members', 'terminal', 'notifs'];
  for (const store of storeNames) {
    cacheData[store] = [];
    if (dbInstance) {
      const tx = dbInstance.transaction(store, 'readwrite');
      tx.objectStore(store).clear();
    }
  }
  renderAllViews();
  showToast('All IndexedDB records purged.', 'error');
  addAuditLog('DB_PURGE', 'All storage records cleared by superadmin.');
}

// Audit Logs Helper
function addAuditLog(action, detail) {
  const list = document.getElementById('audit-log-entries');
  if (!list) return;
  const entry = document.createElement('div');
  entry.className = "p-space-sm rounded-lg bg-surface-container-high flex flex-col gap-1";
  entry.innerHTML = `
    <div class="flex items-center justify-between text-on-surface font-label-sm text-label-sm">
      <span class="text-primary font-bold">${action}</span>
      <span class="text-on-surface-variant font-mono">Just now</span>
    </div>
    <span class="text-on-surface-variant font-body-sm text-body-sm">${detail}</span>
  `;
  list.prepend(entry);
}

function clearAuditLogs() {
  const list = document.getElementById('audit-log-entries');
  if (list) list.innerHTML = `<span class="text-on-surface-variant font-body-sm text-body-sm p-space-sm">Audit ring buffer empty.</span>`;
  showToast('Audit buffer flushed.', 'info');
}

// Floating Toast Notification Trigger
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  
  let bgClass = 'bg-surface-container-high text-on-surface';
  let iconName = 'info';
  if (type === 'success') {
    bgClass = 'bg-primary-container text-on-primary-container font-semibold';
    iconName = 'check_circle';
  } else if (type === 'error') {
    bgClass = 'bg-error-container text-on-error-container font-semibold';
    iconName = 'error';
  }

  toast.className = `flex items-center gap-space-sm px-space-md py-space-sm rounded-lg shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto ${bgClass}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined text-[18px]">${iconName}</span>
    <span class="font-body-md text-body-md">${message}</span>
  `;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Bootstrap
window.addEventListener('DOMContentLoaded', async () => {
  initModuleSwitcher();

  document.getElementById('btn-test-push').addEventListener('click', triggerWebPushTest);
  document.getElementById('btn-toggle-notifs').addEventListener('click', () => toggleNotifsModal());

  await initDatabase();
  renderAllViews();
  if (window.adminInstall) await window.adminInstall();
});
