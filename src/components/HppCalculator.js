"use client";

import React, { useMemo } from 'react';
import { Icon } from './Icon';
import FormatInput from './FormatInput';
import { SectionHeader, IngredientRow, PackagingCard } from './HppSubComponents';
import { num, fmtRp, roundPrice, uid, getPenyusutanBulanan } from '../utils/hpp';

export default function HppCalculator({ menu, onUpdate, showToast }) {
  const { ingredients, packaging, ops, margin } = menu;

  const setIng = (upd) => onUpdate({ ingredients: upd(ingredients) });
  const setPkg = (upd) => onUpdate({ packaging: upd(packaging) });
  const setOps = (f, v) => onUpdate({ ops: { ...ops, [f]: v } });
  const setMargin = (v) => onUpdate({ margin: v });

  const addIng = () => setIng(p => [...p, {
    id: uid(), name: '', hargaBeli: 0, ukuranKemasan: 1000, unit: 'ml', takaranPerCup: 0,
    usePackCalc: false, packQty: 0, packPrice: 0
  }]);
  const updateIng = (id, f, v) => setIng(p => p.map(i => i.id === id ? (typeof f === 'object' ? { ...i, ...f } : { ...i, [f]: v }) : i));
  const removeIng = (id) => setIng(p => p.filter(i => i.id !== id));

  const addPkg = () => setPkg(p => [...p, { id: uid(), name: '', icon: '📦', enabled: true, harga: 0, packQty: 0, packPrice: 0 }]);
  const updatePkg = (id, f, v) => setPkg(p => p.map(x => x.id === id ? (typeof f === 'object' ? { ...x, ...f } : { ...x, [f]: v }) : x));
  const removePkg = (id) => setPkg(p => p.filter(x => x.id !== id));

  /* ── Calculations ── */
  const hppBahanBaku = useMemo(() =>
    ingredients.reduce((sum, ing) => {
      if (!num(ing.ukuranKemasan)) return sum;
      return sum + (num(ing.hargaBeli) / num(ing.ukuranKemasan)) * num(ing.takaranPerCup);
    }, 0), [ingredients]);

  const hppKemasan = useMemo(() =>
    packaging.filter(p => p.enabled).reduce((s, p) => s + (num(p.harga) * num(p.usage !== undefined ? p.usage : 1)), 0), [packaging]);

  const penyusutanBulanan = useMemo(() => getPenyusutanBulanan(ops), [ops]);

  const expensesList = ops.expenses || [];
  const totalExpenses = useMemo(() => {
    return expensesList.reduce((sum, exp) => sum + num(exp.value), 0);
  }, [expensesList]);

  const totalOpsBulanan = useMemo(() =>
    totalExpenses + penyusutanBulanan, [totalExpenses, penyusutanBulanan]);

  const hppOps = useMemo(() =>
    num(ops.estimasiCup) > 0 ? totalOpsBulanan / num(ops.estimasiCup) : 0, [totalOpsBulanan, ops.estimasiCup]);

  const totalHPP = useMemo(() => hppBahanBaku + hppKemasan + hppOps, [hppBahanBaku, hppKemasan, hppOps]);

  const hargaJual = useMemo(() =>
    margin >= 100 ? 0 : totalHPP / (1 - margin / 100), [totalHPP, margin]);

  const hargaJualBulat = useMemo(() => roundPrice(hargaJual), [hargaJual]);
  const profitPerCup = useMemo(() => hargaJualBulat - totalHPP, [hargaJualBulat, totalHPP]);
  const marginAktual = useMemo(() => hargaJualBulat > 0 ? (profitPerCup / hargaJualBulat) * 100 : 0, [profitPerCup, hargaJualBulat]);

  const pct = useMemo(() => totalHPP > 0 ? {
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
              {expensesList.map(exp => (
                <div key={exp.id} style={{ display: 'grid', gridTemplateColumns: '1fr 160px auto', gap: 10, alignItems: 'end', background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div>
                    <label className="label-sm" style={{ display: 'block', marginBottom: 4 }}>Nama Pengeluaran</label>
                    <input className="hpp-input sm" 
                      value={exp.name} onChange={e => {
                        const updated = expensesList.map(x => x.id === exp.id ? { ...x, name: e.target.value } : x);
                        setOps('expenses', updated);
                      }} placeholder="Misal: Sewa Tempat..." style={{ fontWeight: 600 }} />
                  </div>
                  <div>
                    <label className="label-sm" style={{ display: 'block', marginBottom: 4 }}>Biaya Bulanan</label>
                    <div className="input-prefix-wrap">
                      <span className="prefix">Rp</span>
                      <FormatInput className="hpp-input sm" placeholder="0"
                        value={exp.value || ''} onChange={v => {
                          const updated = expensesList.map(x => x.id === exp.id ? { ...x, value: v } : x);
                          setOps('expenses', updated);
                        }} />
                    </div>
                  </div>
                  <button className="btn btn-danger" onClick={() => {
                    const updated = expensesList.filter(x => x.id !== exp.id);
                    setOps('expenses', updated);
                  }} title="Hapus" style={{ height: 31, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="trash" size={11} />
                  </button>
                </div>
              ))}
              
              <button className="btn btn-add" onClick={() => {
                const updated = [...expensesList, { id: uid(), name: 'Pengeluaran Baru', value: 0 }];
                setOps('expenses', updated);
              }} style={{ marginTop: 4 }}>
                <Icon name="plus" size={13} /> Tambah Pengeluaran Bulanan
              </button>
            </div>

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

            {/* Ops summary */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 14px', marginTop: 14 }}>
              <div className="label-xs" style={{ color: '#059669', marginBottom: 8 }}>Rincian Biaya Operasional Bulanan</div>
              {expensesList.map(exp => (
                <div key={exp.id} className="flex-between" style={{ fontSize: 12, color: '#475569', padding: '2px 0' }}>
                  <span>{exp.name || 'Pengeluaran'}</span>
                  <span className="mono" style={{ fontWeight: 600 }}>{fmtRp(num(exp.value))}</span>
                </div>
              ))}
              <div className="flex-between" style={{ fontSize: 12, color: '#475569', padding: '2px 0' }}>
                <span>Penyusutan Aset</span>
                <span className="mono" style={{ fontWeight: 600 }}>{fmtRp(penyusutanBulanan)}</span>
              </div>
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
