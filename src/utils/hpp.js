export const num = (v) => parseFloat(v) || 0;

export const fmtRp = (v) => 'Rp ' + Math.round(v).toLocaleString('id-ID');

export const fmtRpDecimal = (v, d = 0) => 'Rp ' + v.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });

export const roundPrice = (v) => {
  if (v <= 0) return 0;
  return Math.ceil(v / 500) * 500;
};

export const uid = () => 'id_' + Math.random().toString(36).substring(2, 11);

/* ─── Default data factories ─────────────────────────────── */
export const mkIngredients = () => [
  {
    id: uid(), name: 'Susu Segar', hargaBeli: 20000, ukuranKemasan: 1000, unit: 'ml', takaranPerCup: 100,
    usePackCalc: false, packQty: 0, packPrice: 0
  },
  {
    id: uid(), name: 'Espresso Shot', hargaBeli: 150000, ukuranKemasan: 250, unit: 'gr', takaranPerCup: 18,
    usePackCalc: false, packQty: 0, packPrice: 0
  },
  {
    id: uid(), name: 'Sirup Vanila', hargaBeli: 45000, ukuranKemasan: 750, unit: 'ml', takaranPerCup: 20,
    usePackCalc: false, packQty: 0, packPrice: 0
  },
  {
    id: uid(), name: 'Es Batu Kristal', hargaBeli: 9000, ukuranKemasan: 10000, unit: 'gr', takaranPerCup: 50,
    usePackCalc: false, packQty: 0, packPrice: 0
  },
];

export const mkPackaging = () => [
  { id: uid(), name: 'Cup Plastik', icon: '🥤', enabled: true, harga: 800, usePackCalc: false, packQty: 50, packPrice: 35000 },
  { id: uid(), name: 'Tutup / Lid', icon: '🔵', enabled: true, harga: 300, usePackCalc: false, packQty: 50, packPrice: 15000 },
  { id: uid(), name: 'Sedotan', icon: '🥢', enabled: true, harga: 150, usePackCalc: false, packQty: 100, packPrice: 12000 },
  { id: uid(), name: 'Kantong / Paperbag', icon: '🛍️', enabled: false, harga: 500, usePackCalc: false, packQty: 50, packPrice: 22000 },
  { id: uid(), name: 'Stiker / Segel', icon: '🏷️', enabled: true, harga: 200, usePackCalc: false, packQty: 100, packPrice: 18000 },
];

export const mkOps = () => ({
  estimasiCup: 600,
  usePenyusutan: true,
  assets: [
    { id: uid(), name: 'Mesin Espresso', harga: 12000000, tahun: 5, enabled: true }
  ],
  expenses: [
    { id: uid(), name: '⚡ Listrik & Air', value: 800000 },
    { id: uid(), name: '👤 Gaji Karyawan', value: 2500000 },
    { id: uid(), name: '🌐 Lain-lain (sewa, dll)', value: 0 }
  ]
});

export const mkMenu = (overrides = {}) => ({
  id: uid(),
  emoji: '☕',
  name: 'Menu Baru',
  category: 'Minuman',
  ingredients: mkIngredients(),
  packaging: mkPackaging(),
  ops: mkOps(),
  margin: 50,
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/* ─── LocalStorage DB ────────────────────────────────────── */
export const DB_KEY = 'hpp_menu_db_v2';

export const loadDB = () => {
  if (typeof window === 'undefined') return [];
  try {
    const db = JSON.parse(localStorage.getItem(DB_KEY)) || [];
    return db.map(menu => {
      if (!menu || typeof menu !== 'object') {
        return mkMenu();
      }
      
      // Ensure basic arrays exist
      if (!Array.isArray(menu.ingredients)) menu.ingredients = [];
      if (!Array.isArray(menu.packaging)) menu.packaging = [];
      
      // Ensure ops exists
      if (!menu.ops || typeof menu.ops !== 'object') {
        menu.ops = mkOps();
      }
      
      // Migrate assets
      if (!Array.isArray(menu.ops.assets)) {
        const legacyHarga = num(menu.ops.assetHarga || menu.ops.penyusutan);
        const legacyTahun = num(menu.ops.assetTahun) || 5;
        menu.ops.assets = [
          { id: uid(), name: 'Aset Lama', harga: legacyHarga, tahun: legacyTahun, enabled: true }
        ];
      }
      
      // Migrate expenses
      if (!Array.isArray(menu.ops.expenses)) {
        menu.ops.expenses = [
          { id: uid(), name: '⚡ Listrik & Air', value: num(menu.ops.listrik) },
          { id: uid(), name: '👤 Gaji Karyawan', value: num(menu.ops.gaji) },
          { id: uid(), name: '🌐 Lain-lain (sewa, dll)', value: num(menu.ops.lainLain) }
        ];
      }
      
      // Clean up legacy fields to avoid pollution
      delete menu.ops.listrik;
      delete menu.ops.gaji;
      delete menu.ops.lainLain;
      delete menu.ops.assetHarga;
      delete menu.ops.assetTahun;
      delete menu.ops.penyusutan;
      
      // Ensure target units and margin
      if (menu.margin === undefined) menu.margin = 50;
      if (!menu.targetUnit) menu.targetUnit = 'cup';
      if (!menu.pcsPerPortion) menu.pcsPerPortion = 1;
      if (!menu.subUnitLabel) menu.subUnitLabel = 'pcs';
      
      return menu;
    });
  }
  catch (err) {
    console.error("Failed to load HPP database:", err);
    return [];
  }
};

export const saveDB = (menus) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DB_KEY, JSON.stringify(menus));
};

/* ─── Central OPEX Profiles DB & Factory ────────────────── */
export const OPEX_PROFILES_KEY = 'hpp_opex_profiles_v1';

export const mkOpexProfile = (overrides = {}) => ({
  id: uid(),
  name: overrides.name || 'Outlet Utama',
  usePenyusutan: true,
  penyusutan: 0,
  isTotalVolumeLocked: true,
  totalVolume: 1000,
  menuVolumes: {}, // menuId -> volume (untuk simulasi)
  menuPrices: {},  // menuId -> harga jual (untuk simulasi)
  selectedMenuIds: [],
  assets: [
    { id: uid(), name: 'Mesin Espresso', harga: 12000000, tahun: 5, enabled: true, category: 'Semua' }
  ],
  expenses: [
    { id: uid(), name: '⚡ Listrik & Air', value: 800000, category: 'Semua' },
    { id: uid(), name: '👤 Gaji Karyawan', value: 2500000, category: 'Semua' },
    { id: uid(), name: '🌐 Sewa Tempat', value: 1500000, category: 'Semua' }
  ],
  ...overrides
});

export const loadOpexProfiles = () => {
  if (typeof window === 'undefined') return [mkOpexProfile()];
  try {
    const raw = localStorage.getItem(OPEX_PROFILES_KEY);
    if (!raw) return [mkOpexProfile()];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [mkOpexProfile()];
    
    return parsed.map(profile => {
      if (!profile || typeof profile !== 'object') return mkOpexProfile();
      if (!profile.id) profile.id = uid();
      if (!profile.name) profile.name = 'Profil OPEX';
      if (!Array.isArray(profile.expenses)) profile.expenses = [];
      if (!Array.isArray(profile.assets)) profile.assets = [];
      if (profile.usePenyusutan === undefined) profile.usePenyusutan = true;
      if (profile.isTotalVolumeLocked === undefined) profile.isTotalVolumeLocked = true;
      if (profile.totalVolume === undefined) profile.totalVolume = 1000;
      if (!profile.menuVolumes || typeof profile.menuVolumes !== 'object') profile.menuVolumes = {};
      if (!profile.menuPrices || typeof profile.menuPrices !== 'object') profile.menuPrices = {};
      if (!Array.isArray(profile.selectedMenuIds)) profile.selectedMenuIds = [];
      
      profile.expenses = profile.expenses.map(e => ({ ...e, category: e.category || 'Semua' }));
      profile.assets = profile.assets.map(a => ({ ...a, category: a.category || 'Semua' }));
      
      return profile;
    });
  } catch (err) {
    console.error("Failed to load OPEX profiles:", err);
    return [mkOpexProfile()];
  }
};

export const saveOpexProfiles = (profiles) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OPEX_PROFILES_KEY, JSON.stringify(profiles));
};

/* ─── Depreciation Calculator ───────────────────────────── */
export const getPenyusutanBulanan = (ops) => {
  if (!ops) return 0;
  if (!ops.usePenyusutan) return num(ops.penyusutan);
  const assets = ops.assets || (num(ops.assetTahun) ? [{ id: 'legacy', name: 'Aset Lama', harga: num(ops.assetHarga), tahun: num(ops.assetTahun), enabled: true }] : []);
  return assets.filter(a => a.enabled).reduce((sum, a) => {
    return sum + (num(a.tahun) > 0 ? num(a.harga) / (num(a.tahun) * 12) : 0);
  }, 0);
};

