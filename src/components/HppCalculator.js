"use client";

import React, { useMemo } from 'react';
import { Icon } from './Icon';
import FormatInput from './FormatInput';
import { SectionHeader, IngredientRow, PackagingCard } from './HppSubComponents';
import PlatformCalculator from './PlatformCalculator';
import { num, fmtRp, roundPrice, uid, getPenyusutanBulanan, mkPlatform } from '../utils/hpp';

export default function HppCalculator({ menu, onUpdate, showToast, channelPresets, activeProfile, onOpenChannelModal, ingredients: ingredientsDb = [], onNavigate }) {
  const { ingredients, packaging, ops, margin, targetUnit = 'cup', pcsPerPortion = 1, subUnitLabel = 'pcs', platform } = menu;
  const activePlatform = platform || mkPlatform();

  const setIng = (upd) => onUpdate({ ingredients: upd(ingredients) });
  const setPkg = (upd) => onUpdate({ packaging: upd(packaging) });
  const setOps = (f, v) => onUpdate({ ops: { ...ops, [f]: v } });
  const setMargin = (v) => onUpdate({ margin: v });
  const setPlatform = (p) => onUpdate({ platform: p });

  const addIng = () => setIng(p => [...p, {
    id: uid(), name: '', hargaBeli: 0, ukuranKemasan: 1000, unit: 'ml', takaranPerCup: 0,
    usePackCalc: false, packQty: 0, packPrice: 0
  }]);
  const updateIng = (id, f, v) => setIng(p => p.map(i => i.id === id ? (typeof f === 'object' ? { ...i, ...f } : { ...i, [f]: v }) : i));
  const removeIng = (id) => setIng(p => p.filter(i => i.id !== id));

  const addPkg = () => setPkg(p => [...p, { id: uid(), name: '', icon: '📦', enabled: true, harga: 0, packQty: 0, packPrice: 0, usage: 1 }]);
  const updatePkg = (id, f, v) => setPkg(p => p.map(x => x.id === id ? (typeof f === 'object' ? { ...x, ...f } : { ...x, [f]: v }) : x));
  const removePkg = (id) => setPkg(p => p.filter(x => x.id !== id));

  /* ── Calculations ── */
  const hppBahanBaku = useMemo(() =>
    ingredients.reduce((sum, ing) => {
      let hb = ing.hargaBeli;
      let uk = ing.ukuranKemasan;
      if (ing.ingredientId) {
        const central = (ingredientsDb || []).find(ci => ci.id === ing.ingredientId);
        if (central) {
          hb = central.hargaBeli;
          uk = central.ukuranKemasan;
        }
      }
      if (!num(uk)) return sum;
      return sum + (num(hb) / num(uk)) * num(ing.takaranPerCup);
    }, 0), [ingredients, ingredientsDb]);

  const hppKemasan = useMemo(() =>
    packaging.filter(p => p.enabled).reduce((s, p) => {
      let h = p.harga;
      if (p.ingredientId) {
        const central = (ingredientsDb || []).find(ci => ci.id === p.ingredientId);
        if (central) {
          h = num(central.ukuranKemasan) ? num(central.hargaBeli) / num(central.ukuranKemasan) : 0;
        }
      }
      return s + (num(h) * num(p.usage !== undefined ? p.usage : 1));
    }, 0), [packaging, ingredientsDb]);

  const totalHPP = useMemo(() => hppBahanBaku + hppKemasan, [hppBahanBaku, hppKemasan]);

  const hargaJual = useMemo(() =>
    margin >= 100 ? 0 : totalHPP / (1 - margin / 100), [totalHPP, margin]);

  const hargaJualBulat = useMemo(() => roundPrice(hargaJual), [hargaJual]);
  const profitPerCup = useMemo(() => hargaJualBulat - totalHPP, [hargaJualBulat, totalHPP]);
  const marginAktual = useMemo(() => hargaJualBulat > 0 ? (profitPerCup / hargaJualBulat) * 100 : 0, [profitPerCup, hargaJualBulat]);

  const sliderBg = { '--slider-pct': `${margin}%` };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 390px', gap: 20, padding: '24px 28px', alignItems: 'start' }} className="animate-fade-in">

      {/* ══ LEFT PANEL ════════════════════════════════════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── 1. Bahan Baku ── */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'visible', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <SectionHeader
            iconEmoji="coffee" iconBg="#f5f3ff"
            title="Biaya Bahan Baku (per Cup)"
            badgeText="KOMPONEN 1" badgeClass="badge-indigo"
          />
          <div style={{ padding: 20 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.5fr 1.5fr 1.2fr 1.5fr 1.5fr 36px',
              gap: 10,
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#64748b',
              paddingBottom: 8,
              borderBottom: '1px solid #e2e8f0',
              marginBottom: 12
            }}>
              <span>Nama Bahan</span>
              <span>Harga Beli</span>
              <span>Kemasan</span>
              <span>Satuan</span>
              <span>Takaran/{targetUnit}</span>
              <span style={{ textAlign: 'right' }}>HPP/{targetUnit}</span>
              <span></span>
            </div>

            {ingredients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: 12.5 }}>
                Belum ada bahan baku. Klik tombol di bawah untuk menambah bahan.
              </div>
            ) : (
              ingredients.map((ing, idx) => (
                <IngredientRow key={ing.id} ing={ing} idx={idx} total={ingredients.length}
                  onUpdate={updateIng} onRemove={removeIng} targetUnit={targetUnit} ingredientsDb={ingredientsDb}
                  onNavigate={onNavigate} />
              ))
            )}

            <button
              onClick={addIng}
              style={{
                marginTop: 8, padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1',
                background: '#fff', color: '#475569', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s'
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#f8fafc'; }}
              onMouseOut={e => { e.currentTarget.style.background = '#fff'; }}
            >
              <Icon name="plus" size={13} /> Tambah Bahan Baku
            </button>
          </div>
          
          <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Sub-total Bahan Baku</span>
            <span className="mono" style={{ fontWeight: 850, fontSize: 15, color: '#0f172a' }}>{fmtRp(hppBahanBaku)}</span>
          </div>
        </div>

        {/* ── 2. Kemasan ── */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'visible', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <SectionHeader
            iconEmoji="package" iconBg="#fff7ed"
            title="Biaya Kemasan (per Cup)"
            badgeText="KOMPONEN 2" badgeClass="badge-orange"
          />
          <div style={{ padding: 20 }}>
            {packaging.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: 12.5 }}>
                Belum ada item kemasan terdaftar.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12, marginBottom: 14 }}>
                {packaging.map(pkg => (
                  <PackagingCard key={pkg.id} pkg={pkg} onUpdate={updatePkg} onRemove={removePkg} targetUnit={targetUnit} ingredientsDb={ingredientsDb}
                    onNavigate={onNavigate} />
                ))}
              </div>
            )}
            
            <button
              onClick={addPkg}
              style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1',
                background: '#fff', color: '#475569', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s'
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#f8fafc'; }}
              onMouseOut={e => { e.currentTarget.style.background = '#fff'; }}
            >
              <Icon name="plus" size={13} /> Tambah Item Kemasan
            </button>
          </div>
          
          <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Sub-total Kemasan</span>
            <span className="mono" style={{ fontWeight: 850, fontSize: 15, color: '#0f172a' }}>{fmtRp(hppKemasan)}</span>
          </div>
        </div>

        {/* ── 3. Platform/Marketplace ── */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <PlatformCalculator
            platform={activePlatform}
            onUpdate={setPlatform}
            hargaJual={hargaJualBulat}
            totalHPP={totalHPP}
            channelPresets={channelPresets}
            onOpenChannelModal={onOpenChannelModal}
          />
        </div>

        {/* ── 4. Estimasi Penjualan ── */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <SectionHeader
            iconEmoji="store" iconBg="#f0fdf4"
            title="Estimasi Volume Penjualan"
            badgeText="VOLUME" badgeClass="badge-emerald"
          />
          <div style={{ padding: 20 }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>
                Target Penjualan Bulanan ({targetUnit})
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="number"
                  placeholder="600"
                  value={ops.estimasiCup || ''}
                  onChange={e => setOps('estimasiCup', e.target.value)}
                  style={{ maxWidth: 140, height: 36, fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 6, padding: '0 10px', fontWeight: 650 }}
                />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{targetUnit} / bulan</span>
                {num(ops.estimasiCup) > 0 && (
                  <span style={{ fontSize: 11, color: '#059669', fontWeight: 600, marginLeft: 'auto' }}>
                    ≈ {Math.round(num(ops.estimasiCup) / 26)} {targetUnit}/hari kerja (26 hari)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. Catatan ── */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <SectionHeader iconEmoji="fileText" iconBg="#f1f5f9" title="Catatan &amp; Langkah Pembuatan" />
          <div style={{ padding: 20 }}>
            <textarea
              rows={3}
              placeholder="Tambahkan catatan resep, takaran presisi, atau panduan operasional pembuatan menu ini…"
              value={menu.notes || ''}
              onChange={e => onUpdate({ notes: e.target.value })}
              style={{
                width: '100%', resize: 'vertical', lineHeight: 1.6, fontSize: 12.5,
                border: '1px solid #cbd5e1', borderRadius: 8, padding: 12, outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* ══ RIGHT STICKY PANEL ════════════════════════════════ */}
      <div style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Pricing Card */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <SectionHeader iconEmoji="tag" iconBg="#f1f5f9" title="Penetapan Harga Jual" badgeText="PRICING" badgeClass="badge-slate" />
          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#475569' }}>Target Profit Margin</span>
                <div className="mono" style={{ background: '#4f46e5', color: '#fff', borderRadius: 6, padding: '2px 10px', fontWeight: 800, fontSize: 15 }}>
                  {margin}%
                </div>
              </div>
              <input className="hpp-slider" type="range" min="5" max="90"
                value={margin} onChange={e => setMargin(Number(e.target.value))} style={sliderBg} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>
                <span>5% min</span><span>45–55% standard</span><span>90% premium</span>
              </div>
            </div>

            {/* Presets */}
            <div style={{ display: 'flex', gap: 5, marginBottom: 16, flexWrap: 'wrap' }}>
              {[30, 40, 45, 50, 55, 60, 70].map(m => {
                const isAct = margin === m;
                return (
                  <button 
                    key={m} 
                    onClick={() => setMargin(m)} 
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: isAct ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                      background: isAct ? '#4f46e5' : '#fff',
                      color: isAct ? '#fff' : '#475569',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 700,
                      transition: 'all 0.12s'
                    }}
                  >
                    {m}%
                  </button>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div style={{ border: '1px solid #e2e8f0', background: '#f8fafc', padding: 14, borderRadius: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>HPP / {targetUnit}</span>
                  <span className="mono" style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>{fmtRp(totalHPP)}</span>
                </div>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Profit / {targetUnit}</span>
                  <span className="mono" style={{ fontWeight: 800, fontSize: 13, color: profitPerCup > 0 ? '#10b981' : '#ef4444' }}>{fmtRp(profitPerCup)}</span>
                </div>
                {pcsPerPortion > 1 && (
                  <>
                    <div style={{ background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>HPP / {subUnitLabel}</span>
                      <span className="mono" style={{ fontWeight: 800, fontSize: 12, color: '#475569' }}>{fmtRp(totalHPP / pcsPerPortion)}</span>
                    </div>
                    <div style={{ background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Profit / {subUnitLabel}</span>
                      <span className="mono" style={{ fontWeight: 800, fontSize: 12, color: (roundPrice(hargaJual / pcsPerPortion) - (totalHPP / pcsPerPortion)) > 0 ? '#10b981' : '#ef4444' }}>
                        {fmtRp(roundPrice(hargaJual / pcsPerPortion) - (totalHPP / pcsPerPortion))}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Main Price Box */}
              <div style={{ borderRadius: 8, background: '#f5f3ff', border: '2px solid #6366f1', padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#4f46e5' }}>
                  <Icon name="info" size={12} color="#4f46e5" /> Rekomendasi Harga Jual ({targetUnit})
                </div>
                <div className="mono" style={{ fontWeight: 900, fontSize: 22, color: '#4f46e5' }}>{fmtRp(hargaJualBulat)}</div>
                
                {pcsPerPortion > 1 && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed #ddd6fe' }}>
                    <div style={{ fontSize: 10, fontWeight: 750, color: '#475569', marginBottom: 2 }}>Harga Jual per {subUnitLabel}</div>
                    <div className="mono" style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{fmtRp(roundPrice(hargaJual / pcsPerPortion))}</div>
                  </div>
                )}

                <div style={{ fontSize: 9.5, marginTop: 6, color: '#64748b', fontWeight: 500 }}>
                  Rumus: HPP ÷ (1−{margin}%) &rarr; dibulatkan
                </div>
                {hargaJual !== hargaJualBulat && (
                  <div style={{ fontSize: 9.5, color: '#64748b', marginTop: 2, fontWeight: 500 }}>
                    Asli: {fmtRp(hargaJual)} | Margin Aktual: {marginAktual.toFixed(1)}%
                  </div>
                )}
              </div>

              {/* Threshold Status */}
              <div style={{
                marginTop: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid',
                background: margin < 30 ? '#fffbeb' : '#f0fdf4',
                borderColor: margin < 30 ? '#fde68a' : '#bbf7d0',
                color: margin < 30 ? '#b45309' : '#15803d'
              }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon name={margin < 30 ? "alert" : "checkCircle"} size={12} color={margin < 30 ? '#b45309' : '#15803d'} />
                  {margin < 30 ? 'Margin rendah — risiko operasional tinggi' :
                    margin < 50 ? 'Margin sehat — standar profit F&B' :
                      margin < 70 ? 'Margin sangat sehat — produk premium' :
                        'Margin super tinggi — pastikan harga bersaing'}
                </div>
              </div>
            </div>

            {/* Monthly Profit Projections */}
            {num(ops.estimasiCup) > 0 && (
              <div style={{ marginTop: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon name="chart" size={11} color="#64748b" /> Proyeksi Profit Bulanan
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                    {num(ops.estimasiCup).toLocaleString('id-ID')} {targetUnit} × {fmtRp(profitPerCup)}
                  </span>
                  <span className="mono" style={{ fontWeight: 800, fontSize: 15, color: '#16a34a' }}>
                    {fmtRp(profitPerCup * num(ops.estimasiCup))}
                  </span>
                </div>
                <div style={{ height: 1, background: '#e2e8f0', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Omset Kotor Bulanan</span>
                  <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>
                    {fmtRp(hargaJualBulat * num(ops.estimasiCup))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
