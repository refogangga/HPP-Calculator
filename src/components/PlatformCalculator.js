"use client";

import React from 'react';
import FormatInput from './FormatInput';
import { num, fmtRp } from '../utils/hpp';

/* ─── Platform Presets ──────────────────────────────────────── */
const PLATFORM_PRESETS = [
  {
    id: 'shopeefood', name: 'ShopeeFood', emoji: '🛍️',
    color: '#ee4d2d', colorLight: '#fff1ef', colorBorder: '#ffa590',
    commissionPct: 20, flatFee: 0,
  },
  {
    id: 'gofood', name: 'GoFood', emoji: '🟢',
    color: '#007d3b', colorLight: '#e8f7ef', colorBorder: '#8ecfac',
    commissionPct: 20, flatFee: 0,
  },
  {
    id: 'grabfood', name: 'GrabFood', emoji: '🟡',
    color: '#00b14f', colorLight: '#f0fbf4', colorBorder: '#7dd9a3',
    commissionPct: 30, flatFee: 0,
  },
  {
    id: 'custom', name: 'Custom', emoji: '✏️',
    color: '#6366f1', colorLight: '#eef2ff', colorBorder: '#a5b4fc',
    commissionPct: 20, flatFee: 0,
  },
];

/* ─── Cash Flow Row component ─────────────────────────────── */
function CashFlowRow({ step, label, value, isResult, isPositive, isNeutral, indent }) {
  const textColor = isNeutral ? '#94a3b8'
    : isResult
      ? (isPositive ? '#4ade80' : '#f87171')
      : value < 0 ? '#fca5a5' : '#94a3b8';

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: isResult ? '8px 0' : '5px 0',
      marginLeft: indent ? 12 : 0,
      borderTop: isResult ? '1px solid rgba(255,255,255,0.12)' : 'none',
      marginTop: isResult ? 4 : 0,
    }}>
      <span style={{
        fontSize: isResult ? 12 : 11,
        fontWeight: isResult ? 700 : 400,
        color: isResult ? (isPositive ? '#a7f3d0' : '#fecaca') : '#94a3b8',
        letterSpacing: isResult ? '0.03em' : 0,
      }}>
        {step && <span style={{ color: '#475569', marginRight: 5, fontSize: 10 }}>{step}</span>}
        {label}
      </span>
      <span className="mono" style={{
        fontSize: isResult ? 15 : 12,
        fontWeight: isResult ? 900 : 700,
        color: textColor,
        letterSpacing: '-0.01em',
      }}>
        {fmtRp(Math.abs(value))}
      </span>
    </div>
  );
}

/* ─── Status Badge ────────────────────────────────────────── */
function ProfitStatusBadge({ marginPct }) {
  if (marginPct > 20) return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 8, marginTop: 10,
      background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(52,211,153,0.3)',
    }}>
      <span style={{ fontSize: 15 }}>✅</span>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80' }}>PROFIT SEHAT</div>
        <div style={{ fontSize: 10, color: '#6ee7b7' }}>Margin bersih {marginPct.toFixed(1)}% — di atas threshold 20%</div>
      </div>
    </div>
  );
  if (marginPct > 0) return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 8, marginTop: 10,
      background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)',
    }}>
      <span style={{ fontSize: 15 }}>⚠️</span>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#fde047' }}>MARGIN TIPIS</div>
        <div style={{ fontSize: 10, color: '#fef08a' }}>Margin bersih {marginPct.toFixed(1)}% — pertimbangkan naik harga</div>
      </div>
    </div>
  );
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 8, marginTop: 10,
      background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.4)',
    }}>
      <span style={{ fontSize: 15 }}>🚨</span>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#f87171' }}>MERUGI — LAMPU MERAH</div>
        <div style={{ fontSize: 10, color: '#fca5a5' }}>Margin bersih {marginPct.toFixed(1)}% — harga jual tidak menutup semua biaya</div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function PlatformCalculator({ platform, onUpdate, hargaJual, totalHPP, opsPerCup }) {
  const hj = num(hargaJual);
  const hpp = num(totalHPP);
  const opex = num(opsPerCup);

  // Diskon Merchant
  const diskonNominal = platform.discountType === 'pct'
    ? hj * num(platform.discountValue) / 100
    : num(platform.discountValue);
  const hargaEfektif = Math.max(hj - diskonNominal, 0);

  // Basis komisi: harga asli atau harga efektif
  const basisKomisi = platform.commissionBasis === 'effective' ? hargaEfektif : hj;
  const komisiNominal = basisKomisi * num(platform.commissionPct) / 100;
  const totalKomisi = komisiNominal + num(platform.flatFee);

  // Revenue & Profit
  const revenueBersih = hargaEfektif - totalKomisi;
  const grossMargin = revenueBersih - hpp;
  const netProfit = revenueBersih - hpp - opex;
  const marginPct = hj > 0 ? (netProfit / hj) * 100 : 0;

  // Segment bar widths (from harga jual = 100%)
  const segHpp = hj > 0 ? Math.min(hpp / hj * 100, 100) : 0;
  const segOpex = hj > 0 ? Math.min(opex / hj * 100, Math.max(0, 100 - segHpp)) : 0;
  const segDiskon = hj > 0 ? Math.min(diskonNominal / hj * 100, Math.max(0, 100 - segHpp - segOpex)) : 0;
  const segKomisi = hj > 0 ? Math.min(totalKomisi / hj * 100, Math.max(0, 100 - segHpp - segOpex - segDiskon)) : 0;
  const segProfit = Math.max(100 - segHpp - segOpex - segDiskon - segKomisi, 0);

  const upd = (changes) => onUpdate({ ...platform, ...changes });

  return (
    <div className="platform-calculator-wrap">

      {/* ─── Header ─── */}
      <div className="platform-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, fontSize: 17, flexShrink: 0,
            background: platform.enabled ? '#fff1ef' : '#f1f5f9',
            border: `1px solid ${platform.enabled ? '#ffa590' : '#e2e8f0'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}>🏪</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
              Potongan Platform / Marketplace
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
              Kalkulasi komisi, diskon promosi & OPEX realistis
            </div>
          </div>
        </div>
        <label className="platform-toggle" htmlFor="platform_enable_toggle">
          <input type="checkbox" id="platform_enable_toggle"
            checked={!!platform.enabled} onChange={e => upd({ enabled: e.target.checked })} />
          <div className="platform-toggle-pill" />
          <span style={{
            fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
            color: platform.enabled ? '#ee4d2d' : '#94a3b8', transition: 'color 0.2s',
          }}>
            {platform.enabled ? 'AKTIF' : 'NONAKTIF'}
          </span>
        </label>
      </div>

      {/* ─── Body ─── */}
      {platform.enabled && (
        <div className="platform-body animate-fade-in">

          {/* Platform Chip Selector */}
          <div style={{ marginBottom: 14 }}>
            <div className="label-xs" style={{ marginBottom: 8 }}>Pilih Platform</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PLATFORM_PRESETS.map(preset => {
                const isActive = platform.id === preset.id;
                return (
                  <button key={preset.id}
                    onClick={() => upd({ id: preset.id, name: preset.name, commissionPct: preset.commissionPct, flatFee: preset.flatFee })}
                    className={`platform-chip ${isActive ? 'active' : ''}`}
                    style={{ '--chip-color': preset.color, '--chip-light': preset.colorLight, '--chip-border': preset.colorBorder }}
                  >
                    <span>{preset.emoji}</span>
                    <span>{preset.name}</span>
                    {preset.id !== 'custom' && <span className="platform-chip-badge">{preset.commissionPct}%</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Divider ── */}
          <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0 14px' }} />

          {/* ── Section A: Komisi Platform ── */}
          <div style={{ marginBottom: 14 }}>
            <div className="label-xs" style={{ marginBottom: 10, color: '#ee4d2d' }}>A — Komisi Platform</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: 4 }}>📊 Komisi (%)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input className="hpp-input" type="number" min="0" max="99" step="0.5"
                    value={platform.commissionPct}
                    onChange={e => upd({ id: 'custom', name: 'Custom', commissionPct: e.target.value })}
                    style={{ textAlign: 'center', fontWeight: 700, fontSize: 16, width: 65 }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#ee4d2d' }}>%</span>
                </div>
              </div>
              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: 4 }}>💳 Flat Fee (Rp)</label>
                <div className="input-prefix-wrap">
                  <span className="prefix">Rp</span>
                  <FormatInput className="hpp-input" placeholder="0"
                    value={platform.flatFee || ''} onChange={v => upd({ flatFee: v })} />
                </div>
              </div>
            </div>

            {/* Slider komisi */}
            <input className="hpp-slider platform-slider" type="range" min="0" max="50" step="0.5"
              value={platform.commissionPct}
              onChange={e => upd({ id: 'custom', name: 'Custom', commissionPct: e.target.value })}
              style={{ '--slider-pct': `${(num(platform.commissionPct) / 50) * 100}%` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
              <span>0%</span><span>20% (GoFood/ShopeeFood)</span><span>30% (Grab)</span>
            </div>

            {/* Basis komisi */}
            <div style={{ marginTop: 10 }}>
              <div className="label-xs" style={{ marginBottom: 6 }}>Dasar Penghitungan Komisi</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { val: 'original', label: 'Harga Jual Asli', desc: 'Umum (ShopeeFood, GoFood)' },
                  { val: 'effective', label: 'Harga Efektif', desc: 'Setelah diskon dikurangi' },
                ].map(opt => (
                  <button key={opt.val}
                    onClick={() => upd({ commissionBasis: opt.val })}
                    style={{
                      flex: 1, padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                      border: `1.5px solid ${platform.commissionBasis === opt.val ? '#ee4d2d' : '#e2e8f0'}`,
                      background: platform.commissionBasis === opt.val ? '#fff1ef' : '#f8fafc',
                      fontFamily: 'var(--font-family)', transition: 'all 0.15s', textAlign: 'left',
                    }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: platform.commissionBasis === opt.val ? '#ee4d2d' : '#475569' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Divider ── */}
          <div style={{ height: 1, background: '#f1f5f9', margin: '0 0 14px' }} />

          {/* ── Section B: Diskon Promosi ── */}
          <div style={{ marginBottom: 14 }}>
            <div className="label-xs" style={{ marginBottom: 10, color: '#f59e0b' }}>B — Diskon Promosi Merchant</div>
            <div style={{ display: 'flex', gap: 0, marginBottom: 10, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              {[{ val: 'pct', label: '% Persentase' }, { val: 'flat', label: 'Rp Nominal' }].map(opt => (
                <button key={opt.val} onClick={() => upd({ discountType: opt.val, discountValue: 0 })}
                  style={{
                    flex: 1, padding: '7px 12px', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-family)', fontSize: 12, fontWeight: 600,
                    background: platform.discountType === opt.val ? '#fef3c7' : '#f8fafc',
                    color: platform.discountType === opt.val ? '#b45309' : '#64748b',
                    borderRight: opt.val === 'pct' ? '1px solid #e2e8f0' : 'none',
                    transition: 'all 0.15s',
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: platform.discountType === 'pct' ? '120px 1fr' : '1fr', gap: 10 }}>
              {platform.discountType === 'pct' ? (
                <>
                  <div>
                    <label className="label-sm" style={{ display: 'block', marginBottom: 4 }}>🏷️ Diskon (%)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input className="hpp-input" type="number" min="0" max="99" step="0.5"
                        value={platform.discountValue}
                        onChange={e => upd({ discountValue: e.target.value })}
                        style={{ textAlign: 'center', fontWeight: 700, fontSize: 16 }} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>%</span>
                    </div>
                  </div>
                  <div>
                    <label className="label-sm" style={{ display: 'block', marginBottom: 4 }}>= Nominal Diskon</label>
                    <div style={{
                      height: 38, display: 'flex', alignItems: 'center', padding: '0 11px',
                      background: '#fef9c3', borderRadius: 8, border: '1px solid #fde68a',
                      fontSize: 14, fontWeight: 800, color: '#92400e',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {fmtRp(diskonNominal)}
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: 4 }}>🏷️ Nominal Diskon (Rp)</label>
                  <div className="input-prefix-wrap">
                    <span className="prefix">Rp</span>
                    <FormatInput className="hpp-input" placeholder="0"
                      value={platform.discountValue || ''} onChange={v => upd({ discountValue: v })} />
                  </div>
                </div>
              )}
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 5 }}>
              Diskon yang ditanggung merchant — dipotong dari harga jual sebelum transfer ke platform
            </div>
          </div>

          {/* ── Divider ── */}
          <div style={{ height: 1, background: '#f1f5f9', margin: '0 0 14px' }} />

          {/* ── Section C: OPEX per Cup ── */}
          <div style={{ marginBottom: 16 }}>
            <div className="label-xs" style={{ marginBottom: 10, color: '#6366f1' }}>C — Alokasi OPEX per {'{Cup}'}</div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8,
              background: opex > 0 ? '#eef2ff' : '#f8fafc',
              border: `1px solid ${opex > 0 ? '#c7d2fe' : '#e2e8f0'}`,
            }}>
              <span style={{ fontSize: 18 }}>🏭</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: opex > 0 ? '#4338ca' : '#94a3b8' }}>
                  Beban OPEX per Cup
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
                  {opex > 0
                    ? 'Dihitung otomatis dari data Estimasi Penjualan'
                    : 'Isi Estimasi Penjualan Bulanan di atas untuk menghitung otomatis'}
                </div>
              </div>
              <div style={{
                fontSize: 16, fontWeight: 900, color: opex > 0 ? '#4338ca' : '#cbd5e1',
                fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
              }}>
                {opex > 0 ? fmtRp(opex) : '—'}
              </div>
            </div>
          </div>

          {/* ── Cash Flow Breakdown ── */}
          {hj > 0 && (
            <div className="platform-cashflow-box">
              <div style={{ fontSize: 11, fontWeight: 700, color: '#b91c1c', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                💵 Alur Kas per Cup (Cash Flow Breakdown)
              </div>

              {/* 5-segment bar */}
              <div style={{ marginBottom: 14 }}>
                <div className="progress-bar" style={{ height: 12, borderRadius: 6, background: '#fef2f2', overflow: 'hidden' }}>
                  <div className="progress-segment" style={{ width: `${segHpp}%`, background: 'linear-gradient(90deg,#818cf8,#6366f1)', borderRadius: '6px 0 0 6px' }} />
                  <div className="progress-segment" style={{ width: `${segOpex}%`, background: 'linear-gradient(90deg,#a78bfa,#7c3aed)' }} />
                  <div className="progress-segment" style={{ width: `${segDiskon}%`, background: 'linear-gradient(90deg,#fcd34d,#f59e0b)' }} />
                  <div className="progress-segment" style={{ width: `${segKomisi}%`, background: 'linear-gradient(90deg,#f87171,#dc2626)' }} />
                  <div className="progress-segment" style={{ width: `${segProfit}%`, background: netProfit >= 0 ? 'linear-gradient(90deg,#34d399,#10b981)' : 'linear-gradient(90deg,#6b7280,#374151)', borderRadius: '0 6px 6px 0' }} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 5, fontSize: 9, flexWrap: 'wrap', color: '#64748b' }}>
                  <span style={{ color: '#818cf8', fontWeight: 700 }}>🟣 {segHpp.toFixed(0)}% HPP</span>
                  {opex > 0 && <span style={{ color: '#a78bfa', fontWeight: 700 }}>🟤 {segOpex.toFixed(0)}% OPEX</span>}
                  {diskonNominal > 0 && <span style={{ color: '#f59e0b', fontWeight: 700 }}>🟡 {segDiskon.toFixed(0)}% Diskon</span>}
                  <span style={{ color: '#f87171', fontWeight: 700 }}>🔴 {segKomisi.toFixed(0)}% Platform</span>
                  <span style={{ color: netProfit >= 0 ? '#34d399' : '#9ca3af', fontWeight: 700 }}>
                    {netProfit >= 0 ? '🟢' : '⚫'} {segProfit.toFixed(0)}% Profit
                  </span>
                </div>
              </div>

              {/* Step-by-step rows */}
              <div>
                <CashFlowRow step="1" label="Harga Jual Normal" value={hj} isNeutral />
                {diskonNominal > 0 && (
                  <CashFlowRow step="2" label={`Diskon Merchant (${platform.discountType === 'pct' ? num(platform.discountValue) + '%' : 'flat'})`} value={-diskonNominal} indent />
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px dashed rgba(255,255,255,0.07)' }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    {diskonNominal > 0 ? '=' : ''} Harga Efektif ke Platform
                  </span>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: '#cbd5e1' }}>{fmtRp(hargaEfektif)}</span>
                </div>
                <CashFlowRow
                  step={diskonNominal > 0 ? '3' : '2'}
                  label={`Komisi ${platform.name} (${num(platform.commissionPct)}% dari ${platform.commissionBasis === 'effective' ? 'efektif' : 'asli'}${num(platform.flatFee) > 0 ? ' + flat fee' : ''})`}
                  value={-totalKomisi} indent
                />
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 0', margin: '2px 0',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  borderBottom: '1px dashed rgba(255,255,255,0.07)',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>= Nett Revenue Diterima</span>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 800, color: '#e2e8f0' }}>{fmtRp(revenueBersih)}</span>
                </div>
                <CashFlowRow
                  step={diskonNominal > 0 ? '4' : '3'}
                  label="HPP (Bahan Baku + Kemasan)" value={-hpp} indent />
                {opex > 0 && (
                  <CashFlowRow
                    step={diskonNominal > 0 ? '5' : '4'}
                    label="Alokasi OPEX per Cup" value={-opex} indent />
                )}

                {/* Final result */}
                <div style={{
                  marginTop: 6, padding: '10px 12px', borderRadius: 10,
                  background: netProfit >= 0
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(52,211,153,0.1))'
                    : 'linear-gradient(135deg, rgba(239,68,68,0.22), rgba(220,38,38,0.15))',
                  border: `1px solid ${netProfit >= 0 ? 'rgba(52,211,153,0.35)' : 'rgba(239,68,68,0.45)'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: netProfit >= 0 ? '#a7f3d0' : '#fecaca', marginBottom: 3 }}>
                        = Profit Bersih Final / Cup
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>
                        Gross Margin: {fmtRp(grossMargin)}
                        {opex > 0 && <span style={{ marginLeft: 8 }}>| Net: {marginPct.toFixed(1)}%</span>}
                        {opex === 0 && <span style={{ marginLeft: 8 }}>| {marginPct.toFixed(1)}% dari HJ</span>}
                      </div>
                    </div>
                    <div className="mono" style={{
                      fontSize: 22, fontWeight: 900,
                      color: netProfit >= 0 ? '#4ade80' : '#f87171',
                      letterSpacing: '-0.02em',
                    }}>
                      {fmtRp(netProfit)}
                    </div>
                  </div>
                </div>

                <ProfitStatusBadge marginPct={marginPct} />
              </div>
            </div>
          )}

          {!hj && (
            <div style={{
              background: '#f8fafc', border: '1px dashed #e2e8f0',
              borderRadius: 8, padding: '10px 12px', textAlign: 'center',
              fontSize: 11, color: '#94a3b8',
            }}>
              ℹ️ Isi bahan baku & kemasan terlebih dahulu untuk melihat kalkulasi
            </div>
          )}
        </div>
      )}
    </div>
  );
}
