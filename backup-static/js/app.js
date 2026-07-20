/* ============================================================
   HPP F&B Calculator — Main Application Logic
   React (Babel standalone) — No build step required
   ============================================================ */

/* ─── Helpers ────────────────────────────────────────────── */
const num = (v) => parseFloat(v) || 0;
const fmtRp = (v) => 'Rp ' + Math.round(v).toLocaleString('id-ID');
const fmtRpDecimal = (v, d = 0) => 'Rp ' + v.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });
const roundPrice = (v) => {
  // Round to nearest 500 for nice pricing
  if (v <= 0) return 0;
  return Math.ceil(v / 500) * 500;
};

let _uid = 1000;
const uid = () => `id_${_uid++}`;

const getPenyusutanBulanan = (ops) => {
  if (!ops) return 0;
  if (!ops.usePenyusutan) return num(ops.penyusutan);
  const assets = ops.assets || (num(ops.assetTahun) ? [{ id: 'legacy', name: 'Aset Lama', harga: num(ops.assetHarga), tahun: num(ops.assetTahun), enabled: true }] : []);
  return assets.filter(a => a.enabled).reduce((sum, a) => {
    return sum + (num(a.tahun) > 0 ? num(a.harga) / (num(a.tahun) * 12) : 0);
  }, 0);
};

/* ─── LocalStorage DB ────────────────────────────────────── */
const DB_KEY = 'hpp_menu_db_v2';
const loadDB = () => {
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
const saveDB = (menus) => {
  localStorage.setItem(DB_KEY, JSON.stringify(menus));
};

/* ─── Default data factories ─────────────────────────────── */
const mkIngredients = () => [
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

const mkPackaging = () => [
  { id: uid(), name: 'Cup Plastik', icon: '🥤', enabled: true, harga: 800, usePackCalc: false, packQty: 50, packPrice: 35000 },
  { id: uid(), name: 'Tutup / Lid', icon: '🔵', enabled: true, harga: 300, usePackCalc: false, packQty: 50, packPrice: 15000 },
  { id: uid(), name: 'Sedotan', icon: '🥢', enabled: true, harga: 150, usePackCalc: false, packQty: 100, packPrice: 12000 },
  { id: uid(), name: 'Kantong / Paperbag', icon: '🛍️', enabled: false, harga: 500, usePackCalc: false, packQty: 50, packPrice: 22000 },
  { id: uid(), name: 'Stiker / Segel', icon: '🏷️', enabled: true, harga: 200, usePackCalc: false, packQty: 100, packPrice: 18000 },
];

const mkOps = () => ({
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

const mkMenu = (overrides = {}) => ({
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

/* ─── Inline SVG Icons ───────────────────────────────────── */
const ICONS = {
  plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
  trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></>,
  trending: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>,
  info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
  refresh: <><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.75" /></>,
  print: <><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></>,
  save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>,
  database: <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></>,
  edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
  copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
  check: <><polyline points="20 6 9 17 4 12" /></>,
  x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
  package: <><path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z" /><polyline points="2.32 6.16 12 11 21.68 6.16" /><line x1="12" y1="22.76" x2="12" y2="11" /></>,
  calculator: <><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="12" y2="14" /><line x1="8" y1="18" x2="12" y2="18" /><line x1="16" y1="14" x2="16" y2="18" /></>,
  tag: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>,
  star: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></>,
  menu: <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>,
  coffee: <><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></>,
  alert: <><triangle- /><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
};

const Icon = ({ name, size = 15, color, style: s }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || 'currentColor'} strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, ...s }}>
    {ICONS[name] || null}
  </svg>
);

/* ─── FormatInput ────────────────────────────────────────── */
function FormatInput({ value, onChange, className, style, placeholder, disabled, autoFocus }) {
  const [val, setVal] = React.useState('');

  React.useEffect(() => {
    if (value === '' || value === undefined || value === null) {
      setVal('');
      return;
    }
    const valNum = Number(value);
    const localNum = Number(val.replace(/\./g, '').replace(',', '.'));

    if (valNum !== localNum) {
      let str = String(value);
      if (str.includes('.')) {
        let [intPart, decPart] = str.split('.');
        setVal(parseInt(intPart, 10).toLocaleString('id-ID') + ',' + decPart);
      } else {
        setVal(parseInt(str, 10).toLocaleString('id-ID'));
      }
    }
  }, [value]);

  const handleChange = (e) => {
    let raw = e.target.value.replace(/[^0-9.,]/g, '');
    let parts = raw.split(',');
    let intPart = parts[0].replace(/\./g, '');
    if (intPart) {
      intPart = parseInt(intPart, 10).toLocaleString('id-ID');
    }
    let formatted = intPart + (parts.length > 1 ? ',' + parts[1] : '');
    if (raw.endsWith(',')) formatted += ',';

    setVal(formatted);
    let numericStr = formatted.replace(/\./g, '').replace(',', '.');
    onChange(numericStr);
  };

  return <input type="text" className={className} style={style} placeholder={placeholder} disabled={disabled} autoFocus={autoFocus} value={val} onChange={handleChange} />;
}

/* ─── Toast System ───────────────────────────────────────── */
function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type || 'info'}`}>
          <Icon name={t.type === 'success' ? 'check' : t.type === 'error' ? 'x' : 'info'} size={14} />
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ─── Pack Calculator Modal ──────────────────────────────── */
function PackCalcModal({ onClose, onApply, initialPackPrice, initialPackQty, itemName, unitLabel }) {
  const [packPrice, setPackPrice] = React.useState(initialPackPrice || '');
  const [packQty, setPackQty] = React.useState(initialPackQty || '');

  const pricePerUnit = num(packQty) > 0 ? num(packPrice) / num(packQty) : 0;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#1e293b' }}>🧮 Kalkulator Harga per Satuan</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{itemName || 'Item'}</div>
          </div>
          <button className="btn btn-icon" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px', marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
            Masukkan <strong>harga beli 1 pack/bundle</strong> dan <strong>jumlah isi per pack</strong>.
            Sistem akan menghitung harga satuan secara otomatis.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <label className="label-sm" style={{ display: 'block', marginBottom: 5 }}>💰 Harga Beli 1 Pack</label>
            <div className="input-prefix-wrap">
              <span className="prefix">Rp</span>
              <FormatInput className="hpp-input" placeholder="35000"
                value={packPrice} onChange={setPackPrice} autoFocus />
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>Harga saat kamu beli 1 pack</div>
          </div>
          <div>
            <label className="label-sm" style={{ display: 'block', marginBottom: 5 }}>
              📦 Isi per Pack ({unitLabel || 'pcs'})
            </label>
            <div className="input-prefix-wrap has-suffix">
              <input className="hpp-input" type="number" placeholder="50"
                value={packQty} onChange={e => setPackQty(e.target.value)} />
              <span className="suffix">{unitLabel || 'pcs'}</span>
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>Berapa banyak item dalam 1 pack</div>
          </div>
        </div>

        {/* Result */}
        <div className="pack-result-box">
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6366f1', marginBottom: 6 }}>
            💡 Harga per Satuan ({unitLabel || 'pcs'})
          </div>
          <div className="pack-result-value mono">{fmtRp(pricePerUnit)}</div>
          {num(packQty) > 0 && num(packPrice) > 0 && (
            <div style={{ fontSize: 11, color: '#6366f1', marginTop: 4, opacity: 0.8 }}>
              {fmtRp(packPrice)} ÷ {num(packQty).toLocaleString('id-ID')} {unitLabel || 'pcs'}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-icon" style={{ width: 'auto', padding: '8px 14px', fontSize: 12 }} onClick={onClose}>
            Batal
          </button>
          <button className="btn btn-success btn-sm"
            style={{ fontSize: 13, padding: '9px 20px' }}
            disabled={pricePerUnit <= 0}
            onClick={() => {
              if (pricePerUnit > 0) {
                onApply(pricePerUnit, num(packPrice), num(packQty));
                onClose();
              }
            }}>
            <Icon name="check" size={13} /> Gunakan Harga Ini
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Section Header ─────────────────────────────────────── */
function SectionHeader({ iconEmoji, iconBg, title, badgeText, badgeClass, actions }) {
  return (
    <div className="section-header">
      <div className="section-icon" style={{ background: iconBg }}>{iconEmoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', lineHeight: '1.3' }}>{title}</div>
        {badgeText && <span className={`badge ${badgeClass || 'badge-slate'}`}>{badgeText}</span>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 6 }}>{actions}</div>}
    </div>
  );
}

/* ─── Ingredient Row ─────────────────────────────────────── */
function IngredientRow({ ing, idx, total, onUpdate, onRemove }) {
  const [showPackModal, setShowPackModal] = React.useState(false);

  const perUnit = num(ing.ukuranKemasan) ? num(ing.hargaBeli) / num(ing.ukuranKemasan) : 0;
  const hpp = perUnit * num(ing.takaranPerCup);
  const upd = (f, v) => onUpdate(ing.id, f, v);

  return (
    <>
      <div className="animate-fade-in" style={{
        borderBottom: idx < total - 1 ? '1px dashed #f1f5f9' : 'none',
        paddingBottom: 10, marginBottom: 10
      }}>
        <div className="ing-grid">
          {/* Name */}
          <input className="hpp-input sm" placeholder="Nama bahan…"
            value={ing.name} onChange={e => upd('name', e.target.value)} />

          {/* Harga beli */}
          <div className="input-prefix-wrap">
            <span className="prefix">Rp</span>
            <FormatInput className="hpp-input sm" placeholder="0"
              value={ing.hargaBeli || ''} onChange={v => upd('hargaBeli', v)} />
          </div>

          {/* Ukuran kemasan */}
          <div className="input-prefix-wrap has-suffix">
            <input className="hpp-input sm" type="number" placeholder="1000"
              value={ing.ukuranKemasan || ''} onChange={e => upd('ukuranKemasan', e.target.value)} />
            <span className="suffix">{ing.unit}</span>
          </div>

          {/* Satuan */}
          <select className="hpp-input sm" value={ing.unit} onChange={e => upd('unit', e.target.value)}>
            {['ml', 'gr', 'ltr', 'kg', 'pcs', 'sdm', 'sdt', 'sachet', 'lembar'].map(u => <option key={u}>{u}</option>)}
          </select>

          {/* Takaran/cup */}
          <div className="input-prefix-wrap has-suffix">
            <input className="hpp-input sm" type="number" placeholder="0"
              value={ing.takaranPerCup || ''} onChange={e => upd('takaranPerCup', e.target.value)} />
            <span className="suffix">{ing.unit}</span>
          </div>

          {/* HPP per cup result */}
          <div style={{
            background: hpp > 0 ? '#eef2ff' : '#f8fafc',
            borderRadius: 7, padding: '5px 9px',
            textAlign: 'right', border: `1px solid ${hpp > 0 ? '#c7d2fe' : '#e2e8f0'}`
          }}>
            <div className="mono" style={{ fontWeight: 700, fontSize: 12, color: hpp > 0 ? '#6366f1' : '#94a3b8' }}>
              {hpp > 0 ? fmtRp(hpp) : '—'}
            </div>
          </div>

          {/* Delete */}
          <button className="btn btn-danger" onClick={() => onRemove(ing.id)} title="Hapus">
            <Icon name="trash" size={11} />
          </button>
        </div>

        {/* Pack calculator toggle + info row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, paddingLeft: 2 }}>
          {/* Pack calc button */}
          <button
            onClick={() => setShowPackModal(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 9px', borderRadius: 20,
              border: '1px solid #e0e7ff', background: '#eef2ff',
              color: '#6366f1', fontSize: 10, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: 'Inter, sans-serif'
            }}
            title="Hitung harga dari 1 pack/bundle"
          >
            <Icon name="package" size={10} /> Hitung dari Pack
          </button>

          {/* Pack info if used */}
          {ing.packQty > 0 && ing.packPrice > 0 && (
            <span style={{ fontSize: 10, color: '#94a3b8' }}>
              📦 {fmtRp(ing.packPrice)} / {ing.packQty} {ing.unit}
            </span>
          )}

          {/* HPP hint */}
          {hpp > 0 && (
            <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 'auto' }}>
              <span style={{ color: '#6366f1', fontWeight: 600 }}>{fmtRp(perUnit)}</span>/{ing.unit} × {num(ing.takaranPerCup)}{ing.unit}
            </span>
          )}
        </div>
      </div>

      {showPackModal && (
        <PackCalcModal
          itemName={ing.name}
          unitLabel={ing.unit}
          initialPackPrice={ing.packPrice}
          initialPackQty={ing.packQty}
          onClose={() => setShowPackModal(false)}
          onApply={(pricePerUnit, packPrice, packQty) => {
            upd('hargaBeli', Math.round(pricePerUnit * num(ing.ukuranKemasan)));
            upd('packPrice', packPrice);
            upd('packQty', packQty);
          }}
        />
      )}
    </>
  );
}

/* ─── Packaging Card ─────────────────────────────────────── */
function PackagingCard({ pkg, onUpdate, onRemove }) {
  const [showPackModal, setShowPackModal] = React.useState(false);
  const upd = (f, v) => onUpdate(pkg.id, f, v);

  return (
    <>
      <div className={`pkg-card ${pkg.enabled ? 'enabled' : 'disabled'} animate-fade-in`}>
        {/* Header: toggle + name + delete */}
        <div className="flex-between" style={{ marginBottom: 8 }}>
          <label className="pkg-toggle" htmlFor={`pkg_${pkg.id}`} style={{ flex: 1, overflow: 'hidden' }}>
            <input type="checkbox" id={`pkg_${pkg.id}`} checked={pkg.enabled}
              onChange={e => upd('enabled', e.target.checked)} />
            <div className="toggle-pill" />
            <span style={{ fontSize: 14 }}>{pkg.icon}</span>
            <input className="hpp-input" value={pkg.name} onChange={e => upd('name', e.target.value)}
              style={{
                border: 'none', background: 'transparent', padding: '2px 4px',
                fontWeight: 600, fontSize: 12, color: '#334155', outline: 'none'
              }}
              placeholder="Nama kemasan…" />
          </label>
          <button className="btn btn-danger" onClick={() => onRemove(pkg.id)}><Icon name="trash" size={11} /></button>
        </div>

        {/* Harga per Unit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: 2 }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Harga/</span>
            <select value={pkg.unit || 'pcs'} onChange={e => {
              upd('unit', e.target.value);
              if (e.target.value === 'pcs' && !pkg.usage) upd('usage', 1);
            }}
              disabled={!pkg.enabled}
              style={{ fontSize: 11, border: 'none', background: 'transparent', color: '#6366f1', fontWeight: 700, padding: 0, cursor: 'pointer', outline: 'none' }}>
              <option value="pcs">pcs</option>
              <option value="gr">gr</option>
              <option value="ml">ml</option>
              <option value="cm">cm</option>
            </select>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>:</span>
          </div>
          <div className="input-prefix-wrap" style={{ flex: 1 }}>
            <span className="prefix">Rp</span>
            <FormatInput className="hpp-input sm" placeholder="0"
              value={pkg.harga || ''} onChange={v => upd('harga', v)}
              disabled={!pkg.enabled} />
          </div>
        </div>

        {/* Pemakaian per cup */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0, width: 62 }}>Pakai/cup:</span>
          <input className="hpp-input sm" type="number" placeholder="1" step="any"
            value={pkg.usage !== undefined ? pkg.usage : 1} onChange={e => upd('usage', e.target.value)}
            disabled={!pkg.enabled} style={{ width: 60 }} />
          <span style={{ fontSize: 11, color: '#94a3b8', width: 25 }}>{pkg.unit || 'pcs'}</span>

          {pkg.enabled && (
            <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', marginLeft: 'auto' }}>
              {fmtRp(num(pkg.harga) * num(pkg.usage !== undefined ? pkg.usage : 1))}
            </span>
          )}
        </div>

        {/* Pack calc row */}
        {pkg.enabled && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #e0e7ff', display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setShowPackModal(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: 20,
                border: '1px solid #e0e7ff', background: '#eef2ff',
                color: '#6366f1', fontSize: 10, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s'
              }}>
              <Icon name="package" size={10} /> Hitung dari Pack
            </button>
            {pkg.packQty > 0 && pkg.packPrice > 0 && (
              <span style={{ fontSize: 10, color: '#94a3b8' }}>
                {fmtRp(pkg.packPrice)} / {pkg.packQty} {pkg.unit || 'pcs'}
              </span>
            )}
          </div>
        )}
      </div>

      {showPackModal && (
        <PackCalcModal
          itemName={pkg.name}
          unitLabel={pkg.unit || 'pcs'}
          initialPackPrice={pkg.packPrice}
          initialPackQty={pkg.packQty}
          onClose={() => setShowPackModal(false)}
          onApply={(pricePerUnit, packPrice, packQty) => {
            upd('harga', pricePerUnit);
            upd('packPrice', packPrice);
            upd('packQty', packQty);
          }}
        />
      )}
    </>
  );
}

/* ─── HPP Calculator Panel (main editing) ────────────────── */
function HppCalculator({ menu, onUpdate, showToast }) {
  const { ingredients, packaging, ops, margin } = menu;

  const setIng = (upd) => onUpdate({ ingredients: upd(ingredients) });
  const setPkg = (upd) => onUpdate({ packaging: upd(packaging) });
  const setOps = (f, v) => onUpdate({ ops: { ...ops, [f]: v } });
  const setMargin = (v) => onUpdate({ margin: v });

  const addIng = () => setIng(p => [...p, {
    id: uid(), name: '', hargaBeli: 0, ukuranKemasan: 1000, unit: 'ml', takaranPerCup: 0,
    usePackCalc: false, packQty: 0, packPrice: 0
  }]);
  const updateIng = (id, f, v) => setIng(p => p.map(i => i.id === id ? { ...i, [f]: v } : i));
  const removeIng = (id) => setIng(p => p.filter(i => i.id !== id));

  const addPkg = () => setPkg(p => [...p, { id: uid(), name: '', icon: '📦', enabled: true, harga: 0, packQty: 0, packPrice: 0 }]);
  const updatePkg = (id, f, v) => setPkg(p => p.map(x => x.id === id ? { ...x, [f]: v } : x));
  const removePkg = (id) => setPkg(p => p.filter(x => x.id !== id));

  /* ── Calculations ── */
  const hppBahanBaku = React.useMemo(() =>
    ingredients.reduce((sum, ing) => {
      if (!num(ing.ukuranKemasan)) return sum;
      return sum + (num(ing.hargaBeli) / num(ing.ukuranKemasan)) * num(ing.takaranPerCup);
    }, 0), [ingredients]);

  const hppKemasan = React.useMemo(() =>
    packaging.filter(p => p.enabled).reduce((s, p) => s + (num(p.harga) * num(p.usage !== undefined ? p.usage : 1)), 0), [packaging]);

  const penyusutanBulanan = React.useMemo(() => getPenyusutanBulanan(ops), [ops]);

  const totalOpsBulanan = React.useMemo(() =>
    num(ops.listrik) + num(ops.gaji) + penyusutanBulanan + num(ops.lainLain), [ops, penyusutanBulanan]);

  const hppOps = React.useMemo(() =>
    num(ops.estimasiCup) > 0 ? totalOpsBulanan / num(ops.estimasiCup) : 0, [totalOpsBulanan, ops.estimasiCup]);

  const totalHPP = React.useMemo(() => hppBahanBaku + hppKemasan + hppOps, [hppBahanBaku, hppKemasan, hppOps]);

  const hargaJual = React.useMemo(() =>
    margin >= 100 ? 0 : totalHPP / (1 - margin / 100), [totalHPP, margin]);

  const hargaJualBulat = React.useMemo(() => roundPrice(hargaJual), [hargaJual]);
  const profitPerCup = React.useMemo(() => hargaJualBulat - totalHPP, [hargaJualBulat, totalHPP]);
  const marginAktual = React.useMemo(() => hargaJualBulat > 0 ? (profitPerCup / hargaJualBulat) * 100 : 0, [profitPerCup, hargaJualBulat]);

  const pct = React.useMemo(() => totalHPP > 0 ? {
    bb: (hppBahanBaku / totalHPP * 100),
    km: (hppKemasan / totalHPP * 100),
    op: (hppOps / totalHPP * 100),
  } : { bb: 0, km: 0, op: 0 }, [totalHPP, hppBahanBaku, hppKemasan, hppOps]);

  const sliderBg = { '--slider-pct': `${margin}%` };

  return (
    <div className="main-grid" style={{
      display: 'grid', gridTemplateColumns: '1fr 390px', gap: 20,
      padding: '20px 28px', alignItems: 'start'
    }}>

      {/* ══ LEFT PANEL ════════════════════════════════════════ */}
      <div>

        {/* ── 1. Bahan Baku ── */}
        <div className="section-card">
          <SectionHeader
            iconEmoji="🧪" iconBg="#eef2ff"
            title="Biaya Bahan Baku (per Cup)"
            badgeText="KOMPONEN 1" badgeClass="badge-indigo"
          />
          <div className="section-body">
            <div className="ing-grid-header">
              <span>Nama Bahan</span><span>Harga Beli</span>
              <span>Ukuran Kemasan</span><span>Satuan</span>
              <span>Takaran/Cup</span><span>HPP/Cup</span><span></span>
            </div>

            {ingredients.map((ing, idx) => (
              <IngredientRow key={ing.id} ing={ing} idx={idx} total={ingredients.length}
                onUpdate={updateIng} onRemove={removeIng} />
            ))}

            <button className="btn btn-add" onClick={addIng} style={{ marginTop: 8 }}>
              <Icon name="plus" size={13} /> Tambah Bahan
            </button>
          </div>
          <div className="section-footer" style={{ background: '#eef2ff' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6366f1' }}>Sub-total Bahan Baku</span>
            <span className="mono" style={{ fontWeight: 800, fontSize: 15, color: '#4f46e5' }}>{fmtRp(hppBahanBaku)}</span>
          </div>
        </div>

        {/* ── 2. Kemasan ── */}
        <div className="section-card">
          <SectionHeader
            iconEmoji="📦" iconBg="#fff7ed"
            title="Biaya Kemasan (per Cup)"
            badgeText="KOMPONEN 2" badgeClass="badge-orange"
          />
          <div className="section-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 10 }}>
              {packaging.map(pkg => (
                <PackagingCard key={pkg.id} pkg={pkg} onUpdate={updatePkg} onRemove={removePkg} />
              ))}
            </div>
            <button className="btn btn-add" onClick={addPkg} style={{ marginTop: 10 }}>
              <Icon name="plus" size={13} /> Tambah Item Kemasan
            </button>
          </div>
          <div className="section-footer" style={{ background: '#fff7ed' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#d97706' }}>Sub-total Kemasan</span>
            <span className="mono" style={{ fontWeight: 800, fontSize: 15, color: '#b45309' }}>{fmtRp(hppKemasan)}</span>
          </div>
        </div>

        {/* ── 3. Operasional ── */}
        <div className="section-card">
          <SectionHeader
            iconEmoji="⚙️" iconBg="#f0fdf4"
            title="Biaya Operasional & Overhead (Bulanan)"
            badgeText="KOMPONEN 3" badgeClass="badge-emerald"
          />
          <div className="section-body">
            {/* Estimasi cup */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
              <div className="label-xs" style={{ color: '#059669', marginBottom: 6 }}>🏪 Estimasi Penjualan Bulanan</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input className="hpp-input large" type="number" placeholder="600"
                  value={ops.estimasiCup || ''}
                  onChange={e => setOps('estimasiCup', e.target.value)}
                  style={{ maxWidth: 160 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>cup / bulan</span>
                <span style={{ fontSize: 11, color: '#6ee7b7', marginLeft: 'auto' }}>
                  ≈ {Math.round(num(ops.estimasiCup) / 26)} cup/hari kerja
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: '⚡ Listrik & Air', field: 'listrik', placeholder: '800000' },
                { label: '👤 Gaji Karyawan', field: 'gaji', placeholder: '2500000', optional: true },
                { label: '🌐 Lain-lain (sewa, dll)', field: 'lainLain', placeholder: '0', optional: true },
              ].map(({ label, field, placeholder, optional }) => (
                <div key={field}>
                  <label className="label-sm" style={{ display: 'block', marginBottom: 4 }}>
                    {label} {optional && <span style={{ fontWeight: 400, color: '#94a3b8' }}>opsional</span>}
                  </label>
                  <div className="input-prefix-wrap">
                    <span className="prefix">Rp</span>
                    <FormatInput className="hpp-input sm" placeholder={placeholder}
                      value={ops[field] || ''} onChange={v => setOps(field, v)} />
                  </div>
                </div>
              ))}

              {/* Penyusutan */}
              <div style={{ gridColumn: '1/-1', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px' }}>
                <div className="flex-between" style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>🔧 Penyusutan Mesin / Aset</span>
                  <label className="pkg-toggle" htmlFor="use-penyusutan">
                    <input type="checkbox" id="use-penyusutan" checked={ops.usePenyusutan}
                      onChange={e => setOps('usePenyusutan', e.target.checked)} />
                    <div className="toggle-pill" />
                    <span className="label-sm">Hitung otomatis</span>
                  </label>
                </div>
                {ops.usePenyusutan ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(() => {
                      const currentAssets = ops.assets || [
                        { id: 'legacy', name: 'Aset Lama', harga: num(ops.assetHarga), tahun: num(ops.assetTahun) || 5, enabled: true }
                      ];
                      return (
                        <>
                          {currentAssets.map(aset => (
                            <div key={aset.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'end', background: aset.enabled ? '#fff' : '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', opacity: aset.enabled ? 1 : 0.6 }}>
                              <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <input className="hpp-input sm" style={{ fontWeight: 600, border: 'none', padding: 0, background: 'transparent' }}
                                  value={aset.name} onChange={e => {
                                    setOps('assets', currentAssets.map(a => a.id === aset.id ? { ...a, name: e.target.value } : a));
                                  }} placeholder="Nama Aset / Mesin..." disabled={!aset.enabled} />
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <label className="pkg-toggle" style={{ transform: 'scale(0.8)', transformOrigin: 'right center', margin: 0 }}>
                                    <input type="checkbox" checked={aset.enabled} onChange={e => {
                                      setOps('assets', currentAssets.map(a => a.id === aset.id ? { ...a, enabled: e.target.checked } : a));
                                    }} />
                                    <div className="toggle-pill" />
                                  </label>
                                  {currentAssets.length > 0 && (
                                    <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }} onClick={() => setOps('assets', currentAssets.filter(a => a.id !== aset.id))}>
                                      <Icon name="trash" size={12} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div>
                                <label className="label-sm" style={{ display: 'block', marginBottom: 4 }}>Harga (Rp)</label>
                                <div className="input-prefix-wrap">
                                  <span className="prefix">Rp</span>
                                  <FormatInput className="hpp-input sm" placeholder="12000000"
                                    value={aset.harga || ''} onChange={v => {
                                      setOps('assets', currentAssets.map(a => a.id === aset.id ? { ...a, harga: v } : a));
                                    }} disabled={!aset.enabled} />
                                </div>
                              </div>
                              <div>
                                <label className="label-sm" style={{ display: 'block', marginBottom: 4 }}>Umur (thn)</label>
                                <input className="hpp-input sm" type="number" placeholder="5"
                                  value={aset.tahun || ''} onChange={e => {
                                    setOps('assets', currentAssets.map(a => a.id === aset.id ? { ...a, tahun: e.target.value } : a));
                                  }} disabled={!aset.enabled} />
                              </div>
                              <div style={{ background: '#f1f5f9', padding: '6px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#475569', textAlign: 'right', display: 'flex', alignItems: 'center', height: '31px' }}>
                                {fmtRp(num(aset.tahun) > 0 ? num(aset.harga) / (num(aset.tahun) * 12) : 0)}/bln
                              </div>
                            </div>
                          ))}
                          <button onClick={() => setOps('assets', [...currentAssets, { id: uid(), name: 'Aset / Mesin Baru', harga: 0, tahun: 5, enabled: true }])}
                            style={{ background: 'transparent', border: '1px dashed #cbd5e1', borderRadius: 6, padding: '6px', fontSize: 11, color: '#64748b', cursor: 'pointer', marginTop: 2 }}>
                            + Tambah Mesin / Aset
                          </button>
                        </>
                      );
                    })()}
                    <div style={{ background: '#f8fafc', borderRadius: 7, padding: '7px 10px', display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: '#64748b' }}>Total Penyusutan:</span>
                      <span className="mono" style={{ fontWeight: 700, fontSize: 12 }}>{fmtRp(penyusutanBulanan)}/bln</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="label-sm" style={{ display: 'block', marginBottom: 4 }}>Penyusutan Manual (Rp/bulan)</label>
                    <div className="input-prefix-wrap">
                      <span className="prefix">Rp</span>
                      <FormatInput className="hpp-input sm" placeholder="0"
                        value={ops.penyusutan || ''} onChange={v => setOps('penyusutan', v)} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ops summary */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 14px', marginTop: 14 }}>
              <div className="label-xs" style={{ color: '#059669', marginBottom: 8 }}>Rincian Biaya Operasional Bulanan</div>
              {[
                ['Listrik & Air', ops.listrik],
                ['Gaji Karyawan', ops.gaji],
                ['Penyusutan Aset', penyusutanBulanan],
                ['Lain-lain', ops.lainLain],
              ].map(([label, val]) => (
                <div key={label} className="flex-between" style={{ fontSize: 12, color: '#475569', padding: '2px 0' }}>
                  <span>{label}</span>
                  <span className="mono" style={{ fontWeight: 600 }}>{fmtRp(val)}</span>
                </div>
              ))}
              <div style={{ height: 1, background: '#bbf7d0', margin: '6px 0' }} />
              <div className="flex-between" style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>
                <span>Total Bulanan</span>
                <span className="mono">{fmtRp(totalOpsBulanan)}</span>
              </div>
              <div className="flex-between" style={{ fontSize: 12, fontWeight: 700, color: '#059669', marginTop: 2 }}>
                <span>÷ {num(ops.estimasiCup).toLocaleString('id-ID')} cup</span>
                <span className="mono">= {fmtRp(hppOps)} / cup</span>
              </div>
            </div>
          </div>
          <div className="section-footer" style={{ background: '#f0fdf4' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>Beban Operasional per Cup</span>
            <span className="mono" style={{ fontWeight: 800, fontSize: 15, color: '#047857' }}>{fmtRp(hppOps)}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="section-card">
          <SectionHeader iconEmoji="📝" iconBg="#fafafa" title="Catatan Menu" />
          <div className="section-body">
            <textarea
              className="hpp-input"
              rows={3}
              placeholder="Tambahkan catatan, tips penyajian, atau informasi tambahan tentang menu ini…"
              value={menu.notes}
              onChange={e => onUpdate({ notes: e.target.value })}
              style={{ resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL ═══════════════════════════════════════ */}
      <div className="result-sticky" style={{ position: 'sticky', top: 90 }}>

        {/* Total HPP dark card */}
        <div className="result-dark-card">
          <div className="label-xs" style={{ color: '#475569', marginBottom: 12 }}>
            {menu.emoji} {menu.name || 'Menu'}
          </div>

          {[
            { dot: '#818cf8', label: 'Bahan Baku', val: hppBahanBaku, valColor: '#c7d2fe' },
            { dot: '#fb923c', label: 'Kemasan', val: hppKemasan, valColor: '#fed7aa' },
            { dot: '#4ade80', label: 'Operasional', val: hppOps, valColor: '#bbf7d0' },
          ].map(({ dot, label, val, valColor }) => (
            <div key={label} className="result-row">
              <div className="flex-center gap-2">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{label}</span>
              </div>
              <span className="mono" style={{ fontWeight: 700, fontSize: 13, color: valColor }}>{fmtRp(val)}</span>
            </div>
          ))}

          <div className="flex-between" style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>TOTAL HPP / CUP</span>
            <div style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 9, padding: '5px 14px' }}>
              <span className="mono" style={{ fontWeight: 900, fontSize: 20, color: '#fff' }}>{fmtRp(totalHPP)}</span>
            </div>
          </div>

          {totalHPP > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, color: '#475569', marginBottom: 5 }}>Komposisi HPP</div>
              <div className="progress-bar">
                <div className="progress-segment" style={{ width: `${pct.bb}%`, background: '#818cf8' }} />
                <div className="progress-segment" style={{ width: `${pct.km}%`, background: '#fb923c' }} />
                <div className="progress-segment" style={{ width: `${pct.op}%`, background: '#4ade80' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 5, fontSize: 10, color: '#64748b' }}>
                <span>🟣 {pct.bb.toFixed(0)}% Bahan</span>
                <span>🟠 {pct.km.toFixed(0)}% Kemasan</span>
                <span>🟢 {pct.op.toFixed(0)}% Ops</span>
              </div>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="section-card" style={{ marginBottom: 14 }}>
          <SectionHeader iconEmoji="🏷️" iconBg="#ecfdf5" title="Penetapan Harga Jual" badgeText="PRICING" badgeClass="badge-emerald" />
          <div className="section-body">
            <div style={{ marginBottom: 14 }}>
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <span className="label-sm">Target Profit Margin</span>
                <div className="mono" style={{ background: '#6366f1', color: '#fff', borderRadius: 6, padding: '2px 12px', fontWeight: 800, fontSize: 16 }}>
                  {margin}%
                </div>
              </div>
              <input className="hpp-slider" type="range" min="5" max="90"
                value={margin} onChange={e => setMargin(Number(e.target.value))} style={sliderBg} />
              <div className="flex-between" style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>
                <span>5% minimal</span><span>45–55% standar F&B</span><span>90% premium</span>
              </div>
            </div>

            {/* Presets */}
            <div style={{ display: 'flex', gap: 5, marginBottom: 14, flexWrap: 'wrap' }}>
              {[30, 40, 45, 50, 55, 60, 70].map(m => (
                <button key={m} onClick={() => setMargin(m)} style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: margin === m ? '#6366f1' : '#f1f5f9',
                  color: margin === m ? '#fff' : '#64748b',
                  fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
                  fontFamily: 'Inter,sans-serif'
                }}>{m}%</button>
              ))}
            </div>

            <div className="price-card">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <div className="metric-card" style={{ background: '#fff', border: '1px solid #d1fae5' }}>
                  <span className="label-xs" style={{ color: '#059669' }}>HPP / Cup</span>
                  <span className="mono" style={{ fontWeight: 800, fontSize: 15, color: '#1e293b' }}>{fmtRp(totalHPP)}</span>
                </div>
                <div className="metric-card" style={{ background: '#fff', border: '1px solid #d1fae5' }}>
                  <span className="label-xs" style={{ color: '#059669' }}>Profit / Cup</span>
                  <span className="mono" style={{ fontWeight: 800, fontSize: 15, color: '#10b981' }}>{fmtRp(profitPerCup)}</span>
                </div>
              </div>

              {/* Main price */}
              <div style={{ background: '#fff', borderRadius: 10, border: '2px solid #10b981', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#059669', marginBottom: 2 }}>💡 Rekomendasi Harga Jual</div>
                <div className="mono" style={{ fontWeight: 900, fontSize: 26, color: '#047857' }}>{fmtRp(hargaJualBulat)}</div>
                <div style={{ fontSize: 10, color: '#6ee7b7', marginTop: 3 }}>
                  {fmtRp(totalHPP)} ÷ (1−{margin}%) → dibulatkan ke Rp 500
                </div>
                {hargaJual !== hargaJualBulat && (
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
                    Harga asli: {fmtRp(hargaJual)} | Margin aktual: {marginAktual.toFixed(1)}%
                  </div>
                )}
              </div>

              {/* Margin zone */}
              <div style={{
                marginTop: 10, padding: '8px 10px', borderRadius: 8,
                background: margin < 30 ? '#fff7ed' : '#f0fdf4',
                border: `1px solid ${margin < 30 ? '#fed7aa' : '#a7f3d0'}`
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: margin < 30 ? '#d97706' : '#059669' }}>
                  {margin < 30 ? '⚠️ Margin rendah — risiko bisnis tinggi' :
                    margin < 50 ? '✅ Margin sehat — standar industri F&B' :
                      margin < 70 ? '🏆 Margin bagus — produk premium' :
                        '💎 Margin sangat tinggi — pastikan value sesuai'}
                </div>
              </div>
            </div>

            {/* Monthly estimate */}
            {num(ops.estimasiCup) > 0 && (
              <div style={{ marginTop: 10, background: '#1e293b', borderRadius: 10, padding: '12px 14px' }}>
                <div className="label-xs" style={{ color: '#475569', marginBottom: 6 }}>📊 Estimasi Profit Bulanan</div>
                <div className="flex-between">
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    {num(ops.estimasiCup).toLocaleString('id-ID')} cup × {fmtRp(profitPerCup)}
                  </span>
                  <span className="mono" style={{ fontWeight: 800, fontSize: 17, color: '#4ade80' }}>
                    {fmtRp(profitPerCup * num(ops.estimasiCup))}
                  </span>
                </div>
                <div style={{ height: 1, background: '#334155', margin: '8px 0' }} />
                <div className="flex-between">
                  <span style={{ fontSize: 11, color: '#64748b' }}>Omset Bruto Bulanan</span>
                  <span className="mono" style={{ fontSize: 12, color: '#94a3b8' }}>
                    {fmtRp(hargaJualBulat * num(ops.estimasiCup))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px' }}>
          <div className="flex-center gap-2" style={{ alignItems: 'flex-start' }}>
            <Icon name="info" size={13} />
            <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.7 }}>
              <strong style={{ color: '#334155' }}>Rumus Harga Jual:</strong>
              <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4, fontSize: 11, marginLeft: 4 }}>
                HPP ÷ (1 − Margin%)
              </code><br />
              Standar F&B: margin bersih <strong>40–55%</strong>.
              Harga sudah mencakup buffer tak terduga &amp; fee platform.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Database / Menu List Panel ─────────────────────────── */
function MenuDatabase({ menus, activeId, onSelect, onAdd, onDelete, onDuplicate }) {
  const categories = ['Semua', 'Minuman', 'Makanan', 'Snack', 'Lainnya'];
  const [filter, setFilter] = React.useState('Semua');
  const [search, setSearch] = React.useState('');

  const filtered = menus.filter(m => {
    const matchCat = filter === 'Semua' || m.category === filter;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const getHPP = (menu) => {
    const bb = menu.ingredients.reduce((s, i) => {
      if (!num(i.ukuranKemasan)) return s;
      return s + (num(i.hargaBeli) / num(i.ukuranKemasan)) * num(i.takaranPerCup);
    }, 0);
    const km = menu.packaging.filter(p => p.enabled).reduce((s, p) => s + num(p.harga), 0);
    const ops = menu.ops;
    const py = getPenyusutanBulanan(menu.ops);
    const totalOps = num(ops.listrik) + num(ops.gaji) + py + num(ops.lainLain);
    const opsPerCup = num(ops.estimasiCup) > 0 ? totalOps / num(ops.estimasiCup) : 0;
    const hpp = bb + km + opsPerCup;
    const hargaJual = menu.margin >= 100 ? 0 : hpp / (1 - menu.margin / 100);
    return { hpp, hargaJual: roundPrice(hargaJual) };
  };

  return (
    <div style={{ padding: '20px 28px' }}>
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: 20, color: '#1e293b' }}>📋 Database Menu</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
            {menus.length} menu tersimpan — klik menu untuk edit atau hitung HPP
          </p>
        </div>
        <button className="btn btn-primary" onClick={onAdd}>
          <Icon name="plus" size={14} /> Tambah Menu Baru
        </button>
      </div>

      {/* Filter + Search */}
      <div className="flex-center gap-3" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#94a3b8' }}>🔍</span>
          <input className="hpp-input" placeholder="Cari nama menu…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }} />
        </div>
        <div className="tab-bar">
          {categories.map(c => (
            <button key={c} className={`tab-item ${filter === c ? 'active' : ''}`}
              onClick={() => setFilter(c)} style={{ flex: 'none', padding: '5px 10px', fontSize: 11 }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Belum ada menu</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Klik "Tambah Menu Baru" untuk mulai</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
          {filtered.map(menu => {
            const { hpp, hargaJual } = getHPP(menu);
            const profit = hargaJual - hpp;
            return (
              <div key={menu.id} className={`db-card ${activeId === menu.id ? 'active' : ''}`}
                onClick={() => onSelect(menu.id)}>
                <div className="db-card-icon">{menu.emoji}</div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 2 }}>{menu.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
                    {menu.category} &bull; {new Date(menu.updatedAt).toLocaleDateString('id-ID')}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div>
                      <div className="label-xs" style={{ color: '#94a3b8' }}>HPP</div>
                      <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: '#6366f1' }}>{fmtRp(hpp)}</div>
                    </div>
                    <div>
                      <div className="label-xs" style={{ color: '#94a3b8' }}>Jual</div>
                      <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>{fmtRp(hargaJual)}</div>
                    </div>
                    <div>
                      <div className="label-xs" style={{ color: '#94a3b8' }}>Profit</div>
                      <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>{fmtRp(profit)}</div>
                    </div>
                  </div>
                </div>
                {/* Card actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button className="btn btn-icon btn-sm" title="Duplikat"
                    onClick={e => { e.stopPropagation(); onDuplicate(menu.id); }}>
                    <Icon name="copy" size={12} />
                  </button>
                  <button className="btn btn-danger btn-sm" title="Hapus"
                    onClick={e => { e.stopPropagation(); onDelete(menu.id); }}
                    style={{ width: 30, height: 30, justifyContent: 'center' }}>
                    <Icon name="trash" size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Edit Menu Meta Modal ───────────────────────────────── */
function MenuMetaModal({ menu, onSave, onClose }) {
  const [name, setName] = React.useState(menu.name);
  const [emoji, setEmoji] = React.useState(menu.emoji);
  const [cat, setCat] = React.useState(menu.category);

  const emojis = ['☕', '🍵', '🥤', '🧋', '🍺', '🍹', '🍔', '🍕', '🍜', '🍱', '🍰', '🧁', '🥗', '🌮', '🍣', '🥞'];
  const cats = ['Minuman', 'Makanan', 'Snack', 'Lainnya'];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: '#1e293b' }}>✏️ Info Menu</div>
          <button className="btn btn-icon" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Pilih Emoji</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {emojis.map(e => (
              <button key={e} onClick={() => setEmoji(e)}
                style={{
                  width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: emoji === e ? '#eef2ff' : '#f8fafc',
                  fontSize: 18, transition: 'all 0.15s',
                  boxShadow: emoji === e ? '0 0 0 2px #6366f1' : 'none'
                }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="label-sm" style={{ display: 'block', marginBottom: 4 }}>Nama Menu</label>
          <input className="hpp-input" value={name} onChange={e => setName(e.target.value)}
            placeholder="Contoh: Kopi Susu Signature" autoFocus />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Kategori</label>
          <div className="tab-bar">
            {cats.map(c => (
              <button key={c} className={`tab-item ${cat === c ? 'active' : ''}`}
                onClick={() => setCat(c)} style={{ fontSize: 12 }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-icon" style={{ width: 'auto', padding: '8px 14px', fontSize: 12 }} onClick={onClose}>Batal</button>
          <button className="btn btn-primary btn-sm" style={{ fontSize: 13, padding: '9px 20px' }}
            onClick={() => { onSave({ name, emoji, category: cat }); onClose(); }}>
            <Icon name="check" size={13} /> Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── ROOT APP ───────────────────────────────────────────── */
function App() {
  const [menus, setMenus] = React.useState(() => {
    const db = loadDB();
    return db.length > 0 ? db : [mkMenu({ name: 'Kopi Susu Signature', emoji: '☕', category: 'Minuman' })];
  });
  const [activeId, setActiveId] = React.useState(() => menus[0]?.id);
  const [view, setView] = React.useState('calculator'); // 'calculator' | 'database'
  const [toasts, setToasts] = React.useState([]);
  const [showMeta, setShowMeta] = React.useState(false);

  const activeMenu = menus.find(m => m.id === activeId);

  /* ── Toast helpers ── */
  const showToast = React.useCallback((msg, type = 'success') => {
    const id = uid();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  /* ── Save to DB whenever menus change ── */
  React.useEffect(() => {
    saveDB(menus);
  }, [menus]);

  /* ── Menu CRUD ── */
  const updateActiveMenu = React.useCallback((changes) => {
    setMenus(prev => prev.map(m =>
      m.id === activeId
        ? { ...m, ...changes, updatedAt: new Date().toISOString() }
        : m
    ));
  }, [activeId]);

  const addMenu = () => {
    const newMenu = mkMenu();
    setMenus(prev => [newMenu, ...prev]);
    setActiveId(newMenu.id);
    setView('calculator');
    showToast('Menu baru ditambahkan!', 'success');
  };

  const deleteMenu = (id) => {
    if (!window.confirm('Hapus menu ini dari database?')) return;
    setMenus(prev => {
      const next = prev.filter(m => m.id !== id);
      if (id === activeId && next.length > 0) setActiveId(next[0].id);
      return next;
    });
    showToast('Menu dihapus', 'info');
  };

  const duplicateMenu = (id) => {
    const src = menus.find(m => m.id === id);
    if (!src) return;
    const dup = { ...JSON.parse(JSON.stringify(src)), id: uid(), name: src.name + ' (Copy)', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setMenus(prev => [dup, ...prev]);
    setActiveId(dup.id);
    setView('calculator');
    showToast('Menu diduplikat!', 'success');
  };

  const selectMenu = (id) => {
    setActiveId(id);
    setView('calculator');
  };

  /* ── Print ── */
  const handlePrint = () => {
    if (!activeMenu) return;
    const m = activeMenu;
    const w = window.open('', '_blank');
    const lines = m.ingredients.map(ing => {
      const perUnit = num(ing.ukuranKemasan) ? num(ing.hargaBeli) / num(ing.ukuranKemasan) : 0;
      return `  ${(ing.name || '-').padEnd(22)} ${fmtRp(perUnit * num(ing.takaranPerCup))}`;
    }).join('\n');
    const pkgLines = m.packaging.filter(p => p.enabled).map(p => `  ${p.name.padEnd(22)} ${fmtRp(p.harga)}`).join('\n');

    // Recalculate for print
    const bb = m.ingredients.reduce((s, i) => num(i.ukuranKemasan) ? s + (num(i.hargaBeli) / num(i.ukuranKemasan)) * num(i.takaranPerCup) : s, 0);
    const km = m.packaging.filter(p => p.enabled).reduce((s, p) => s + num(p.harga), 0);
    const py = getPenyusutanBulanan(m.ops);
    const ops = num(m.ops.listrik) + num(m.ops.gaji) + py + num(m.ops.lainLain);
    const opsPerCup = num(m.ops.estimasiCup) > 0 ? ops / num(m.ops.estimasiCup) : 0;
    const hpp = bb + km + opsPerCup;
    const hj = m.margin >= 100 ? 0 : hpp / (1 - m.margin / 100);
    const hjb = roundPrice(hj);

    const body = `
  ╔══════════════════════════════════════════╗
  ║         LAPORAN HPP F&B                  ║
  ║         ${(m.emoji + ' ' + m.name).padEnd(38)}║
  ╚══════════════════════════════════════════╝
  Kategori : ${m.category}
  Tanggal  : ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}

  ──── BAHAN BAKU ─────────────────────────────
${lines}
  Sub-total Bahan Baku         : ${fmtRp(bb)}

  ──── KEMASAN ────────────────────────────────
${pkgLines}
  Sub-total Kemasan            : ${fmtRp(km)}

  ──── OPERASIONAL (Bulanan) ──────────────────
  Listrik & Air                : ${fmtRp(m.ops.listrik)}
  Gaji Karyawan                : ${fmtRp(m.ops.gaji)}
  Penyusutan Aset              : ${fmtRp(py)}
  Lain-lain                    : ${fmtRp(m.ops.lainLain)}
  ────────────────────────────────────────────
  Total Ops Bulanan            : ${fmtRp(ops)}
  Estimasi Penjualan           : ${num(m.ops.estimasiCup).toLocaleString('id-ID')} cup/bln
  Beban Ops per Cup            : ${fmtRp(opsPerCup)}

  ════════════════════════════════════════════
  TOTAL HPP / CUP              : ${fmtRp(hpp)}
  Target Margin                : ${m.margin}%
  HARGA JUAL (dibulatkan)      : ${fmtRp(hjb)}
  Profit per Cup               : ${fmtRp(hjb - hpp)}
  Estimasi Profit Bulanan      : ${fmtRp((hjb - hpp) * num(m.ops.estimasiCup))}
  ════════════════════════════════════════════

  ${m.notes ? '📝 CATATAN:\n  ' + m.notes : ''}
    `;
    w.document.write(`<pre style="font-family:monospace;font-size:13px;padding:32px;line-height:1.9">${body}</pre>`);
    w.document.title = `HPP — ${m.name}`;
    w.print();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', paddingBottom: 48 }}>

      {/* ── Top Bar ── */}
      <div className="topbar">
        <div className="flex-center gap-3">
          <div className="topbar-logo">☕</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '-0.01em' }}>Kalkulator HPP F&B</div>
            <div style={{ fontSize: 11, color: '#475569' }}>Harga Pokok Penjualan — Real-Time</div>
          </div>
        </div>
        <div className="flex-center gap-2 header-btns">
          {view === 'calculator' && activeMenu && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowMeta(true)}>
                <Icon name="edit" size={12} /> Edit Info Menu
              </button>
              <button className="btn btn-ghost btn-sm" onClick={handlePrint}>
                <Icon name="print" size={12} /> Cetak
              </button>
              <button className="btn btn-ghost btn-sm"
                onClick={() => { saveDB(menus); showToast('Tersimpan ke database!', 'success'); }}>
                <Icon name="save" size={12} /> Simpan
              </button>
            </>
          )}
          <button
            className={`btn btn-sm ${view === 'database' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView(view === 'database' ? 'calculator' : 'database')}>
            <Icon name="database" size={12} />
            {view === 'database' ? 'Tutup Database' : `Database (${menus.length})`}
          </button>
        </div>
      </div>

      {/* ── Menu Name Bar (only in calculator view) ── */}
      {view === 'calculator' && activeMenu && (
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '10px 28px' }}>
          <div className="flex-center gap-3" style={{ flexWrap: 'wrap' }}>
            <span style={{ fontSize: 20 }}>{activeMenu.emoji}</span>
            <input className="hpp-input" value={activeMenu.name}
              onChange={e => updateActiveMenu({ name: e.target.value })}
              style={{ maxWidth: 340, fontWeight: 700, fontSize: 14 }}
              placeholder="Nama menu…" />
            <span className={`badge badge-slate`}>{activeMenu.category}</span>
            {menus.length > 1 && (
              <div className="flex-center gap-1" style={{ marginLeft: 'auto' }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Menu lain:</span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {menus.filter(m => m.id !== activeId).slice(0, 4).map(m => (
                    <button key={m.id} onClick={() => selectMenu(m.id)}
                      title={m.name}
                      style={{
                        padding: '3px 8px', border: '1px solid #e2e8f0', borderRadius: 6,
                        background: '#f8fafc', fontSize: 11, cursor: 'pointer',
                        fontFamily: 'Inter,sans-serif', color: '#475569',
                        display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s'
                      }}>
                      {m.emoji} <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                    </button>
                  ))}
                  {menus.length > 5 && (
                    <button onClick={() => setView('database')}
                      style={{ padding: '3px 8px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#eef2ff', color: '#6366f1', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                      +{menus.length - 5} lainnya…
                    </button>
                  )}
                </div>
              </div>
            )}
            <button className="btn btn-add btn-sm" style={{ marginLeft: menus.length <= 1 ? 'auto' : 0 }} onClick={addMenu}>
              <Icon name="plus" size={12} /> Menu Baru
            </button>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      {view === 'calculator' ? (
        activeMenu ? (
          <HppCalculator menu={activeMenu} onUpdate={updateActiveMenu} showToast={showToast} />
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>☕</div>
            <button className="btn btn-primary" onClick={addMenu}>
              <Icon name="plus" size={14} /> Buat Menu Pertama
            </button>
          </div>
        )
      ) : (
        <MenuDatabase
          menus={menus} activeId={activeId}
          onSelect={selectMenu} onAdd={addMenu}
          onDelete={deleteMenu} onDuplicate={duplicateMenu}
        />
      )}

      {/* Modals */}
      {showMeta && activeMenu && (
        <MenuMetaModal
          menu={activeMenu}
          onSave={(changes) => updateActiveMenu(changes)}
          onClose={() => setShowMeta(false)}
        />
      )}

      {/* Footer */}
      <div style={{
        textAlign: 'center', padding: '12px 28px', fontSize: 11, color: '#94a3b8',
        borderTop: '1px solid #e2e8f0', background: '#fff', marginTop: 12
      }}>
        HPP F&B Calculator &bull; {menus.length} menu tersimpan &bull; Data disimpan otomatis di browser
      </div>

      {/* Toast */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
