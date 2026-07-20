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
  listrik: 800000,
  gaji: 2500000,
  penyusutan: 0,
  usePenyusutan: true,
  lainLain: 0,
  assets: [
    { id: uid(), name: 'Mesin Espresso', harga: 12000000, tahun: 5, enabled: true }
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
      if (menu.ops && !menu.ops.assets) {
        const legacyHarga = num(menu.ops.assetHarga || menu.ops.penyusutan);
        const legacyTahun = num(menu.ops.assetTahun) || 5;
        menu.ops.assets = [
          { id: uid(), name: 'Aset Lama', harga: legacyHarga, tahun: legacyTahun, enabled: true }
        ];
      }
      return menu;
    });
  }
  catch { return []; }
};

export const saveDB = (menus) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DB_KEY, JSON.stringify(menus));
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
