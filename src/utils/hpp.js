export const num = (v) => parseFloat(v) || 0;

export const fmtRp = (v) => 'Rp ' + Math.round(v).toLocaleString('id-ID');

export const fmtRpDecimal = (v, d = 0) => 'Rp ' + v.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });

export const roundPrice = (v) => {
  if (v <= 0) return 0;
  return Math.ceil(v / 500) * 500;
};

export const uid = () => 'id_' + Math.random().toString(36).substring(2, 11);

/* ─── Default data factories ─────────────────────────────── */
export const mkIngredients = () => [];
export const mkPackaging = () => [];
export const mkOps = () => ({
  estimasiCup: 0,
  usePenyusutan: true,
  assets: [],
  expenses: []
});

/* ─── Master Channel Presets DB & Factory ────────────────── */
export const CHANNEL_PRESETS_KEY = 'hpp_channel_presets_v1';

export const DEFAULT_CHANNEL_PRESETS = [
  {
    id: 'offline', name: 'Offline / Dine-In', emoji: '🏬',
    color: '#64748b', colorLight: '#f8fafc', colorBorder: '#cbd5e1',
    commissionPct: 0, flatFee: 0, discountType: 'pct', discountValue: 0,
    commissionBasis: 'original', isDefault: true
  },
  {
    id: 'shopeefood', name: 'ShopeeFood (Campaign Premium+)', emoji: '🛍️',
    color: '#ee4d2d', colorLight: '#fff1ef', colorBorder: '#ffa590',
    commissionPct: 24, flatFee: 0, discountType: 'pct', discountValue: 26,
    commissionBasis: 'original', isDefault: true
  },
  {
    id: 'gofood', name: 'GoFood', emoji: '🟢',
    color: '#007d3b', colorLight: '#e8f7ef', colorBorder: '#8ecfac',
    commissionPct: 20, flatFee: 0, discountType: 'pct', discountValue: 0,
    commissionBasis: 'original', isDefault: true
  },
  {
    id: 'grabfood', name: 'GrabFood', emoji: '🟡',
    color: '#00b14f', colorLight: '#f0fbf4', colorBorder: '#7dd9a3',
    commissionPct: 30, flatFee: 0, discountType: 'pct', discountValue: 0,
    commissionBasis: 'original', isDefault: true
  },
  {
    id: 'custom_online', name: 'Custom Online', emoji: '✏️',
    color: '#6366f1', colorLight: '#eef2ff', colorBorder: '#a5b4fc',
    commissionPct: 15, flatFee: 1000, discountType: 'pct', discountValue: 0,
    commissionBasis: 'original', isDefault: false
  }
];

export const mkChannelPreset = (overrides = {}) => ({
  id: uid(),
  name: overrides.name || 'Channel Baru',
  emoji: overrides.emoji || '📱',
  color: overrides.color || '#6366f1',
  colorLight: overrides.colorLight || '#eef2ff',
  colorBorder: overrides.colorBorder || '#a5b4fc',
  commissionPct: num(overrides.commissionPct),
  flatFee: num(overrides.flatFee),
  discountType: overrides.discountType || 'pct',
  discountValue: num(overrides.discountValue),
  commissionBasis: overrides.commissionBasis || 'original',
  isDefault: false,
  ...overrides,
});

export const loadChannelPresets = () => {
  if (typeof window === 'undefined') return DEFAULT_CHANNEL_PRESETS;
  try {
    const raw = localStorage.getItem(CHANNEL_PRESETS_KEY);
    if (!raw) return DEFAULT_CHANNEL_PRESETS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_CHANNEL_PRESETS;
    
    // Automatically migrate/update default ShopeeFood preset to new Campaign Premium+ defaults
    return parsed.map(p => {
      if (p.id === 'shopeefood' && p.isDefault && (p.commissionPct === 20 || p.commissionPct === 24) && (p.discountValue === 0 || p.discountValue === 26)) {
        return {
          ...p,
          name: 'ShopeeFood (Campaign Premium+)',
          commissionPct: 24,
          discountValue: 26
        };
      }
      return p;
    });
  } catch (err) {
    console.error("Failed to load channel presets:", err);
    return DEFAULT_CHANNEL_PRESETS;
  }
};

export const saveChannelPresets = (presets) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CHANNEL_PRESETS_KEY, JSON.stringify(presets));
};

export const mkPlatform = (preset = null) => ({
  enabled: preset ? preset.id !== 'offline' : false,
  id: preset ? preset.id : 'offline',
  name: preset ? preset.name : 'Offline / Dine-In',
  commissionPct: preset ? num(preset.commissionPct) : 0,
  flatFee: preset ? num(preset.flatFee) : 0,
  commissionBasis: preset ? preset.commissionBasis || 'original' : 'original',
  discountType: preset ? preset.discountType || 'pct' : 'pct',
  discountValue: preset ? num(preset.discountValue) : 0,
  isOverridden: false,
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
  platform: mkPlatform(),
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

      // Migrate: ensure platform field exists
      if (!menu.platform || typeof menu.platform !== 'object') {
        menu.platform = mkPlatform();
      } else {
        if (menu.platform.enabled === undefined) menu.platform.enabled = false;
        if (!menu.platform.id) menu.platform.id = 'custom';
        if (menu.platform.commissionPct === undefined) menu.platform.commissionPct = 20;
        if (menu.platform.flatFee === undefined) menu.platform.flatFee = 0;
        if (!menu.platform.commissionBasis) menu.platform.commissionBasis = 'original';
        if (!menu.platform.discountType) menu.platform.discountType = 'pct';
        if (menu.platform.discountValue === undefined) menu.platform.discountValue = 0;
      }

      
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
export const getPenyusutanBulanan = (ops, assetsDb = []) => {
  if (!ops) return 0;
  if (!ops.usePenyusutan) return num(ops.penyusutan);
  const assets = ops.assets || (num(ops.assetTahun) ? [{ id: 'legacy', name: 'Aset Lama', harga: num(ops.assetHarga), tahun: num(ops.assetTahun), enabled: true }] : []);
  return assets.filter(a => a.enabled).reduce((sum, a) => {
    let harga = a.harga;
    let tahun = a.tahun;
    if (a.assetId && Array.isArray(assetsDb)) {
      const central = assetsDb.find(ca => ca.id === a.assetId);
      if (central) {
        harga = central.harga;
        tahun = central.tahun;
      }
    }
    return sum + (num(tahun) > 0 ? num(harga) / (num(tahun) * 12) : 0);
  }, 0);
};

export const getDirectHPP = (menu, ingredientsDb = []) => {
  if (!menu) return 0;
  const bb = (menu.ingredients || []).reduce((s, i) => {
    if (i.ingredientId && Array.isArray(ingredientsDb)) {
      const centralIng = ingredientsDb.find(ci => ci.id === i.ingredientId);
      if (centralIng) {
        if (!num(centralIng.ukuranKemasan)) return s;
        return s + (num(centralIng.hargaBeli) / num(centralIng.ukuranKemasan)) * num(i.takaranPerCup);
      }
    }
    if (!num(i.ukuranKemasan)) return s;
    return s + (num(i.hargaBeli) / num(i.ukuranKemasan)) * num(i.takaranPerCup);
  }, 0);
  const km = (menu.packaging || []).filter(p => p.enabled).reduce((s, p) => s + (num(p.harga) * num(p.usage !== undefined ? p.usage : 1)), 0);
  return bb + km;
};

export const calculatePlatformMetrics = (menu, hjOverride) => {
  const hpp = getDirectHPP(menu);
  const hj = hjOverride !== undefined && hjOverride !== null
    ? num(hjOverride)
    : roundPrice(num(menu.margin) >= 100 ? 0 : hpp / (1 - num(menu.margin) / 100));
  
  const p = menu.platform || { enabled: false, commissionPct: 0, flatFee: 0, discountType: 'pct', discountValue: 0, commissionBasis: 'original' };
  
  if (!p.enabled) {
    return {
      hargaJual: hj,
      hargaEfektif: hj,
      revenueBersih: hj,
      hpp,
      totalKomisi: 0,
      diskonNominal: 0,
      netProfit: hj - hpp,
      diskonPct: 0,
      hppPct: hj > 0 ? (hpp / hj) * 100 : 0,
      hppPctAfterDiscount: hj > 0 ? (hpp / hj) * 100 : 0,
      platformName: 'Offline / Dine-In',
      commissionPct: 0,
      hasPlatform: false
    };
  }

  const diskonNominal = p.discountType === 'pct' ? (hj * num(p.discountValue) / 100) : num(p.discountValue);
  const hargaEfektif = Math.max(hj - diskonNominal, 0);
  const basisKomisi = p.commissionBasis === 'effective' ? hargaEfektif : hj;
  const komisiNominal = basisKomisi * num(p.commissionPct) / 100;
  const totalKomisi = komisiNominal + num(p.flatFee);
  const revenueBersih = hargaEfektif - totalKomisi;
  const netProfit = revenueBersih - hpp;
  
  const diskonPct = p.discountType === 'pct' ? num(p.discountValue) : (hj > 0 ? (diskonNominal / hj) * 100 : 0);

  return {
    hargaJual: hj,
    diskonNominal,
    diskonPct,
    hargaEfektif,
    totalKomisi,
    revenueBersih,
    hpp,
    hppPct: hj > 0 ? (hpp / hj) * 100 : 0,
    hppPctAfterDiscount: hargaEfektif > 0 ? (hpp / hargaEfektif) * 100 : 0,
    netProfit,
    platformName: p.name || 'Custom',
    commissionPct: num(p.commissionPct),
    hasPlatform: true
  };
};

export const INGREDIENTS_KEY = 'hpp_ingredients_db_v1';
export const ASSETS_KEY = 'hpp_assets_db_v1';

export const loadIngredients = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(INGREDIENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load ingredients database:", e);
    return [];
  }
};

export const saveIngredients = (items) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(items));
};

export const loadAssets = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ASSETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load assets database:", e);
    return [];
  }
};

export const saveAssets = (items) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ASSETS_KEY, JSON.stringify(items));
};


