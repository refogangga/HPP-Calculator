"use client";

import React, { useMemo } from 'react';
import { Icon } from './Icon';
import FormatInput from './FormatInput';
import { SectionHeader, IngredientRow, PackagingCard } from './HppSubComponents';
import PlatformCalculator from './PlatformCalculator';
import { num, fmtRp, roundPrice, uid, getPenyusutanBulanan, mkPlatform } from '../utils/hpp';

export default function HppCalculator({ menu, onUpdate, showToast, channelPresets, onOpenChannelModal }) {
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
      if (!num(ing.ukuranKemasan)) return sum;
      return sum + (num(ing.hargaBeli) / num(ing.ukuranKemasan)) * num(ing.takaranPerCup);
    }, 0), [ingredients]);

  const hppKemasan = useMemo(() =>
    packaging.filter(p => p.enabled).reduce((s, p) => s + (num(p.harga) * num(p.usage !== undefined ? p.usage : 1)), 0), [packaging]);

  const totalHPP = useMemo(() => hppBahanBaku + hppKemasan, [hppBahanBaku, hppKemasan]);

  const hargaJual = useMemo(() =>
    margin >= 100 ? 0 : totalHPP / (1 - margin / 100), [totalHPP, margin]);

  const hargaJualBulat = useMemo(() => roundPrice(hargaJual), [hargaJual]);
  const profitPerCup = useMemo(() => hargaJualBulat - totalHPP, [hargaJualBulat, totalHPP]);
  const marginAktual = useMemo(() => hargaJualBulat > 0 ? (profitPerCup / hargaJualBulat) * 100 : 0, [profitPerCup, hargaJualBulat]);

  const pct = useMemo(() => totalHPP > 0 ? {
    bb: (hppBahanBaku / totalHPP * 100),
    km: (hppKemasan / totalHPP * 100),
  } : { bb: 0, km: 0 }, [totalHPP, hppBahanBaku, hppKemasan]);

  /* ── Platform Calculations (full advanced formula) ── */
  const platformCalc = useMemo(() => {
    if (!activePlatform.enabled || hargaJualBulat <= 0) {
      return { diskonNominal: 0, hargaEfektif: hargaJualBulat, totalKomisi: 0, revenueBersih: hargaJualBulat, grossMargin: hargaJualBulat - totalHPP, netProfit: hargaJualBulat - totalHPP, marginPct: 0 };
    }
    const hj = hargaJualBulat;
    const diskonNominal = activePlatform.discountType === 'pct'
      ? hj * num(activePlatform.discountValue) / 100
      : num(activePlatform.discountValue);
    const hargaEfektif = Math.max(hj - diskonNominal, 0);
    const basisKomisi = activePlatform.commissionBasis === 'effective' ? hargaEfektif : hj;
    const komisiNominal = basisKomisi * num(activePlatform.commissionPct) / 100;
    const totalKomisi = komisiNominal + num(activePlatform.flatFee);
    const revenueBersih = hargaEfektif - totalKomisi;
    const grossMargin = revenueBersih - totalHPP;
    const netProfit = revenueBersih - totalHPP;
    const marginPct = hj > 0 ? (netProfit / hj) * 100 : 0;
    return { diskonNominal, hargaEfektif, totalKomisi, revenueBersih, grossMargin, netProfit, marginPct };
  }, [activePlatform, hargaJualBulat, totalHPP]);

  const { diskonNominal, hargaEfektif, totalKomisi, revenueBersih, grossMargin, netProfit, marginPct } = platformCalc;

  // 4-segment bar (based on hargaJualBulat = 100%)
  const pctBreakdown = useMemo(() => {
    if (hargaJualBulat <= 0) return { hpp: 0, diskon: 0, platform: 0, profit: 0 };
    const hj = hargaJualBulat;
    const hpp = Math.min(totalHPP / hj * 100, 100);
    const diskon = activePlatform.enabled ? Math.min(diskonNominal / hj * 100, Math.max(0, 100 - hpp)) : 0;
    const platform = activePlatform.enabled ? Math.min(totalKomisi / hj * 100, Math.max(0, 100 - hpp - diskon)) : 0;
    const profit = Math.max(100 - hpp - diskon - platform, 0);
    return { hpp, diskon, platform, profit };
  }, [hargaJualBulat, totalHPP, activePlatform, diskonNominal, totalKomisi]);

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
            iconEmoji="coffee" iconBg="#eef2ff"
            title="Biaya Bahan Baku (per Cup)"
            badgeText="KOMPONEN 1" badgeClass="badge-indigo"
          />
          <div className="section-body">
            <div className="ing-grid-header">
              <span>Nama Bahan</span><span>Harga Beli</span>
              <span>Ukuran Kemasan</span><span>Satuan</span>
              <span>Takaran/{targetUnit}</span><span>HPP/{targetUnit}</span><span></span>
            </div>

            {ingredients.map((ing, idx) => (
              <IngredientRow key={ing.id} ing={ing} idx={idx} total={ingredients.length}
                onUpdate={updateIng} onRemove={removeIng} targetUnit={targetUnit} />
            ))}

            <button className="btn btn-add" onClick={addIng} style={{ marginTop: 8 }}>
              <Icon name="plus" size={13} /> Tambah Bahan
            </button>
          </div>
          <div className="section-footer bg-accent-blue">
            <span style={{ fontSize: 12, fontWeight: 600 }}>Sub-total Bahan Baku</span>
            <span className="mono" style={{ fontWeight: 800, fontSize: 15 }}>{fmtRp(hppBahanBaku)}</span>
          </div>
        </div>

        {/* ── 2. Kemasan ── */}
        <div className="section-card">
          <SectionHeader
            iconEmoji="package" iconBg="#fff7ed"
            title="Biaya Kemasan (per Cup)"
            badgeText="KOMPONEN 2" badgeClass="badge-orange"
          />
          <div className="section-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 10 }}>
              {packaging.map(pkg => (
                <PackagingCard key={pkg.id} pkg={pkg} onUpdate={updatePkg} onRemove={removePkg} targetUnit={targetUnit} />
              ))}
            </div>
            <button className="btn btn-add" onClick={addPkg} style={{ marginTop: 10 }}>
              <Icon name="plus" size={13} /> Tambah Item Kemasan
            </button>
          </div>
          <div className="section-footer bg-accent-orange">
            <span style={{ fontSize: 12, fontWeight: 600 }}>Sub-total Kemasan</span>
            <span className="mono" style={{ fontWeight: 800, fontSize: 15 }}>{fmtRp(hppKemasan)}</span>
          </div>
        </div>

        {/* ── 3. Platform/Marketplace ── */}
        <div className="section-card">
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
        <div className="section-card">
          <SectionHeader
            iconEmoji="store" iconBg="#f0fdf4"
            title="Estimasi Penjualan Bulanan"
            badgeText="VOLUME" badgeClass="badge-emerald"
          />
          <div className="section-body">
            <div className="bg-accent-green" style={{ border: '1px solid', borderRadius: 10, padding: '12px 14px' }}>
              <div className="label-xs" style={{ marginBottom: 6 }}>Target Penjualan Bulanan ({targetUnit})</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input className="hpp-input large" type="number" placeholder="600"
                  value={ops.estimasiCup || ''}
                  onChange={e => setOps('estimasiCup', e.target.value)}
                  style={{ maxWidth: 160 }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{targetUnit} / bulan</span>
                <span style={{ fontSize: 11, color: '#6ee7b7', marginLeft: 'auto' }}>
                  ≈ {Math.round(num(ops.estimasiCup) / 26)} {targetUnit}/hari kerja
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. Catatan ── */}
        <div className="section-card">
          <SectionHeader iconEmoji="fileText" iconBg="#fafafa" title="Catatan Menu" />
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
          <div className="label-xs" style={{ color: '#475569', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name={menu.emoji || 'coffee'} size={14} color="var(--primary)" /> {menu.name || 'Menu'}
          </div>

          {[
            { dot: '#818cf8', label: 'Bahan Baku', val: hppBahanBaku, valColor: '#c7d2fe' },
            { dot: '#fb923c', label: 'Kemasan', val: hppKemasan, valColor: '#fed7aa' },
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
            <span style={{ fontSize: 12, color: '#94a3b8' }}>TOTAL HPP / {targetUnit.toUpperCase()}</span>
            <div style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 9, padding: '5px 14px' }}>
              <span className="mono" style={{ fontWeight: 900, fontSize: 20, color: '#fff' }}>{fmtRp(totalHPP)}</span>
            </div>
          </div>
          {pcsPerPortion > 1 && (
            <div className="flex-between" style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed rgba(255,255,255,0.07)' }}>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>TOTAL HPP / {subUnitLabel.toUpperCase()}</span>
              <span className="mono" style={{ fontWeight: 800, fontSize: 14, color: '#a5b4fc' }}>{fmtRp(totalHPP / pcsPerPortion)}</span>
            </div>
          )}

          {totalHPP > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, color: '#475569', marginBottom: 5 }}>Komposisi HPP</div>
              <div className="progress-bar">
                <div className="progress-segment" style={{ width: `${pct.bb}%`, background: '#818cf8' }} />
                <div className="progress-segment" style={{ width: `${pct.km}%`, background: '#fb923c' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 5, fontSize: 10, color: '#64748b' }}>
                <span>• {pct.bb.toFixed(0)}% Bahan</span>
                <span>• {pct.km.toFixed(0)}% Kemasan</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Platform Breakdown Card (right panel) ── */}
        {activePlatform.enabled && hargaJualBulat > 0 && (
          <div className="platform-breakdown-card animate-fade-in">
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fca5a5', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="chart" size={13} color="#fca5a5" /> Ringkasan Profitabilitas Realistis
            </div>

            {/* 4-segment bar */}
            <div style={{ marginBottom: 12 }}>
              <div className="progress-bar" style={{ height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <div className="progress-segment" style={{ width: `${pctBreakdown.hpp}%`, background: 'linear-gradient(90deg,#818cf8,#6366f1)', borderRadius: '6px 0 0 6px' }} />
                <div className="progress-segment" style={{ width: `${pctBreakdown.diskon}%`, background: 'linear-gradient(90deg,#fcd34d,#f59e0b)' }} />
                <div className="progress-segment" style={{ width: `${pctBreakdown.platform}%`, background: 'linear-gradient(90deg,#f87171,#dc2626)' }} />
                <div className="progress-segment" style={{
                  width: `${pctBreakdown.profit}%`,
                  background: netProfit >= 0 ? 'linear-gradient(90deg,#34d399,#10b981)' : 'linear-gradient(90deg,#6b7280,#374151)',
                  borderRadius: '0 6px 6px 0'
                }} />
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 5, fontSize: 9, flexWrap: 'wrap' }}>
                <span style={{ color: '#818cf8', fontWeight: 600 }}>• {pctBreakdown.hpp.toFixed(0)}% HPP</span>
                {diskonNominal > 0 && <span style={{ color: '#fcd34d', fontWeight: 600 }}>• {pctBreakdown.diskon.toFixed(0)}% Diskon</span>}
                <span style={{ color: '#f87171', fontWeight: 600 }}>• {pctBreakdown.platform.toFixed(0)}% Platform</span>
                <span style={{ color: netProfit >= 0 ? '#34d399' : '#9ca3af', fontWeight: 600 }}>
                  • {pctBreakdown.profit.toFixed(0)}% Profit
                </span>
              </div>
            </div>

            {/* Summary rows */}
            {[
              { label: 'Harga Jual', val: hargaJualBulat, color: '#94a3b8' },
              ...(diskonNominal > 0 ? [{ label: `− Diskon Merchant`, val: diskonNominal, color: '#fde68a' }] : []),
              { label: `− Komisi ${activePlatform.name}`, val: totalKomisi, color: '#fca5a5' },
              { label: '= Nett Revenue', val: revenueBersih, color: '#e2e8f0', bold: true },
              { label: `− HPP (Bahan + Kemasan)`, val: totalHPP, color: '#a5b4fc' },
            ].map(({ label, val, color, bold }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '3px 0', borderBottom: '1px dashed rgba(255,255,255,0.06)'
              }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: bold ? 600 : 400 }}>{label}</span>
                <span className="mono" style={{ fontSize: 12, fontWeight: bold ? 800 : 600, color }}>{fmtRp(val)}</span>
              </div>
            ))}

            {/* Net Profit Final */}
            <div style={{
              marginTop: 10, padding: '10px 12px', borderRadius: 10,
              background: netProfit >= 0
                ? 'linear-gradient(135deg,rgba(16,185,129,0.18),rgba(52,211,153,0.1))'
                : 'linear-gradient(135deg,rgba(239,68,68,0.22),rgba(220,38,38,0.15))',
              border: `1px solid ${netProfit >= 0 ? 'rgba(52,211,153,0.35)' : 'rgba(239,68,68,0.45)'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: netProfit >= 0 ? '#a7f3d0' : '#fecaca', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name={netProfit >= 0 ? "checkCircle" : "alert"} size={12} color={netProfit >= 0 ? "#4ade80" : "#f87171"} />
                    {netProfit >= 0 ? 'PROFIT BERSIH FINAL' : 'MERUGI'}
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>
                    Margin bersih: {marginPct.toFixed(1)}%
                    {marginPct > 20 ? ' — Sehat' : marginPct > 0 ? ' — Tipis' : ' — Rugi'}
                  </div>
                </div>
                <div className="mono" style={{
                  fontSize: 20, fontWeight: 900,
                  color: netProfit >= 0 ? '#4ade80' : '#f87171',
                  letterSpacing: '-0.02em'
                }}>
                  {fmtRp(netProfit)}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Pricing */}
        <div className="section-card" style={{ marginBottom: 14 }}>
          <SectionHeader iconEmoji="tag" iconBg="#ecfdf5" title="Penetapan Harga Jual" badgeText="PRICING" badgeClass="badge-emerald" />
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
                <button key={m} onClick={() => setMargin(m)} className={`btn-preset ${margin === m ? 'active' : ''}`} style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
                  fontFamily: 'Inter,sans-serif'
                }}>{m}%</button>
              ))}
            </div>

            <div className="price-card">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <div className="metric-card bg-accent-green" style={{ border: '1px solid' }}>
                  <span className="label-xs">HPP / {targetUnit}</span>
                  <span className="mono" style={{ fontWeight: 800, fontSize: 14 }}>{fmtRp(totalHPP)}</span>
                </div>
                <div className="metric-card bg-accent-green" style={{ border: '1px solid' }}>
                  <span className="label-xs">Profit / {targetUnit}</span>
                  <span className="mono" style={{ fontWeight: 800, fontSize: 14 }}>{fmtRp(profitPerCup)}</span>
                </div>
                {pcsPerPortion > 1 && (
                  <>
                    <div className="metric-card" style={{ background: 'transparent', border: '1px dashed var(--border-color)' }}>
                      <span className="label-xs">HPP / {subUnitLabel}</span>
                      <span className="mono" style={{ fontWeight: 800, fontSize: 13 }}>{fmtRp(totalHPP / pcsPerPortion)}</span>
                    </div>
                    <div className="metric-card" style={{ background: 'transparent', border: '1px dashed var(--border-color)' }}>
                      <span className="label-xs">Profit / {subUnitLabel}</span>
                      <span className="mono" style={{ fontWeight: 800, fontSize: 13 }}>{fmtRp(roundPrice(hargaJual / pcsPerPortion) - (totalHPP / pcsPerPortion))}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Main price */}
              <div className="bg-accent-green" style={{ borderRadius: 10, border: '2px solid', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Icon name="info" size={13} /> Rekomendasi Harga Jual ({targetUnit})
                </div>
                <div className="mono" style={{ fontWeight: 900, fontSize: 24 }}>{fmtRp(hargaJualBulat)}</div>
                
                {pcsPerPortion > 1 && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed' }}>
                    <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 2 }}>Harga Jual per {subUnitLabel}</div>
                    <div className="mono" style={{ fontWeight: 800, fontSize: 18 }}>{fmtRp(roundPrice(hargaJual / pcsPerPortion))}</div>
                  </div>
                )}

                <div style={{ fontSize: 10, marginTop: 3 }}>
                  {fmtRp(totalHPP)} ÷ (1−{margin}%) → dibulatkan
                </div>
                {hargaJual !== hargaJualBulat && (
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
                    Harga asli: {fmtRp(hargaJual)} | Margin aktual: {marginAktual.toFixed(1)}%
                  </div>
                )}
              </div>

              {/* Margin zone */}
              <div className={margin < 30 ? 'bg-accent-orange' : 'bg-accent-green'} style={{
                marginTop: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid'
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon name={margin < 30 ? "alert" : "checkCircle"} size={13} />
                  {margin < 30 ? 'Margin rendah — risiko bisnis tinggi' :
                    margin < 50 ? 'Margin sehat — standar industri F&B' :
                      margin < 70 ? 'Margin bagus — produk premium' :
                        'Margin sangat tinggi — pastikan value sesuai'}
                </div>
              </div>
            </div>

            {/* Monthly estimate */}
            {num(ops.estimasiCup) > 0 && (
              <div style={{ marginTop: 10, background: '#1e293b', borderRadius: 10, padding: '12px 14px' }}>
                <div className="label-xs" style={{ color: '#475569', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon name="chart" size={12} color="#475569" /> Estimasi Profit Bulanan
                </div>
                <div className="flex-between">
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    {num(ops.estimasiCup).toLocaleString('id-ID')} {targetUnit} × {fmtRp(profitPerCup)}
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
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '12px 14px' }}>
          <div className="flex-center gap-2" style={{ alignItems: 'flex-start' }}>
            <Icon name="info" size={13} />
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--color-text)' }}>Rumus Harga Jual:</strong>
              <code style={{ background: 'var(--bg-app)', padding: '1px 5px', borderRadius: 4, fontSize: 11, marginLeft: 4, color: 'var(--color-text)' }}>
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
