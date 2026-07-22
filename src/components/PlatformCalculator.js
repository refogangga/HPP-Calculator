"use client";

import React from 'react';
import { Icon } from './Icon';
import FormatInput from './FormatInput';
import { num, fmtRp, DEFAULT_CHANNEL_PRESETS } from '../utils/hpp';

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
      <Icon name="checkCircle" size={15} color="#4ade80" />
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
      <Icon name="alert" size={15} color="#fde047" />
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
      <Icon name="alert" size={15} color="#f87171" />
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#f87171' }}>MERUGI — LAMPU MERAH</div>
        <div style={{ fontSize: 10, color: '#fca5a5' }}>Margin bersih {marginPct.toFixed(1)}% — harga jual tidak menutup semua biaya</div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function PlatformCalculator({
  platform,
  onUpdate,
  hargaJual,
  totalHPP,
  channelPresets = DEFAULT_CHANNEL_PRESETS,
  onOpenChannelModal
}) {
  const hj = num(hargaJual);
  const hpp = num(totalHPP);

  const presetsList = channelPresets && channelPresets.length > 0 ? channelPresets : DEFAULT_CHANNEL_PRESETS;
  const activePreset = presetsList.find(p => p.id === platform.id) || null;

  // Check if current values differ from active preset defaults
  const isDiffFromPreset = activePreset ? (
    num(platform.commissionPct) !== num(activePreset.commissionPct) ||
    num(platform.flatFee) !== num(activePreset.flatFee) ||
    num(platform.discountValue) !== num(activePreset.discountValue) ||
    (platform.discountType || 'pct') !== (activePreset.discountType || 'pct') ||
    (platform.commissionBasis || 'original') !== (activePreset.commissionBasis || 'original')
  ) : true;

  const isCustomOrOverridden = platform.isOverridden || (platform.id !== 'offline' && isDiffFromPreset);

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
  const netProfit = revenueBersih - hpp;
  const marginPct = hj > 0 ? (netProfit / hj) * 100 : 0;

  // Segment bar widths (from harga jual = 100%)
  const segHpp = hj > 0 ? Math.min(hpp / hj * 100, 100) : 0;
  const segDiskon = hj > 0 ? Math.min(diskonNominal / hj * 100, Math.max(0, 100 - segHpp)) : 0;
  const segKomisi = hj > 0 ? Math.min(totalKomisi / hj * 100, Math.max(0, 100 - segHpp - segDiskon)) : 0;
  const segProfit = Math.max(100 - segHpp - segDiskon - segKomisi, 0);

  const upd = (changes) => onUpdate({ ...platform, ...changes });

  const applyPreset = (preset) => {
    if (!preset) return;
    upd({
      enabled: preset.id !== 'offline',
      id: preset.id,
      name: preset.name,
      commissionPct: preset.commissionPct,
      flatFee: preset.flatFee,
      discountType: preset.discountType || 'pct',
      discountValue: preset.discountValue || 0,
      commissionBasis: preset.commissionBasis || 'original',
      isOverridden: false,
    });
  };

  const handleManualEdit = (changes) => {
    upd({ ...changes, isOverridden: true });
  };

  return (
    <div className="platform-calculator-wrap">

      {/* ─── Header ─── */}
      <div className="platform-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: platform.enabled ? '#fff1ef' : '#f1f5f9',
            border: `1px solid ${platform.enabled ? '#ffa590' : '#e2e8f0'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: platform.enabled ? '#ee4d2d' : '#64748b',
            transition: 'all 0.2s',
          }}>
            <Icon name="store" size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
              Potongan Platform / Preset Channel Penjualan
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
              Auto-fill komisi &amp; promo dari Master Preset Channel (GoFood, ShopeeFood, Grab, dll)
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
            {platform.enabled ? 'ONLINE' : 'OFFLINE / DINE-IN'}
          </span>
        </label>
      </div>

      {/* ─── Body ─── */}
      {platform.enabled && (
        <div className="platform-body animate-fade-in">

          {/* Preset Selector Header & Link */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="label-xs" style={{ color: '#ee4d2d' }}>Pilih Preset Channel Penjualan</span>
              {onOpenChannelModal && (
                <button type="button" onClick={onOpenChannelModal}
                  style={{
                    background: 'transparent', border: 'none', color: '#6366f1',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                  }}>
                  <Icon name="tool" size={11} /> Kelola Master Preset Channel
                </button>
              )}
            </div>

            {/* Dropdown Selector */}
            <div style={{ marginBottom: 10 }}>
              <select
                className="hpp-input"
                value={platform.id || 'custom'}
                onChange={e => {
                  const selected = presetsList.find(p => p.id === e.target.value);
                  if (selected) applyPreset(selected);
                  else upd({ id: 'custom', name: 'Custom Channel', isOverridden: true });
                }}
                style={{ fontWeight: 700, fontSize: 13, padding: '8px 12px', background: '#fff' }}
              >
                {presetsList.map(preset => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} ({preset.commissionPct}% Komisi{preset.flatFee > 0 ? ` + ${fmtRp(preset.flatFee)}` : ''})
                  </option>
                ))}
                <option value="custom">Custom / Overridden</option>
              </select>
            </div>

            {/* Platform Chip Selector */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {presetsList.map(preset => {
                const isActive = platform.id === preset.id;
                return (
                  <button key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`platform-chip ${isActive ? 'active' : ''}`}
                    style={{ '--chip-color': preset.color, '--chip-light': preset.colorLight, '--chip-border': preset.colorBorder }}
                  >
                    <Icon name={preset.emoji} size={12} />
                    <span>{preset.name}</span>
                    <span className="platform-chip-badge">{preset.commissionPct}%</span>
                  </button>
                );
              })}
            </div>

            {/* Overridden Indicator Badge */}
            {isCustomOrOverridden && activePreset && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginTop: 10, padding: '6px 10px', borderRadius: 8,
                background: '#fffbebf0', border: '1px solid #fef08a', fontSize: 11
              }}>
                <span style={{ color: '#b45309', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="alert" size={11} color="#b45309" /> Nilai Di-override (Custom untuk menu ini)
                </span>
                <button type="button" onClick={() => applyPreset(activePreset)}
                  style={{
                    background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 6,
                    padding: '2px 8px', fontSize: 10, fontWeight: 700, color: '#92400e', cursor: 'pointer'
                  }}>
                  ↺ Reset ke Preset {activePreset.name}
                </button>
              </div>
            )}
          </div>

          {/* ── Divider ── */}
          <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0 14px' }} />

          {/* ── Section A: Komisi Platform ── */}
          <div style={{ marginBottom: 14 }}>
            <div className="label-xs" style={{ marginBottom: 10, color: '#ee4d2d' }}>A — Komisi &amp; Flat Fee Platform</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label className="label-sm" style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <Icon name="chart" size={12} /> Komisi (%)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input className="hpp-input" type="number" min="0" max="99" step="0.5"
                    value={platform.commissionPct}
                    onChange={e => handleManualEdit({ commissionPct: e.target.value })}
                    style={{ textAlign: 'center', fontWeight: 700, fontSize: 16, width: 65 }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#ee4d2d' }}>%</span>
                </div>
              </div>
              <div>
                <label className="label-sm" style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <Icon name="dollar" size={12} /> Flat Fee (Rp)
                </label>
                <div className="input-prefix-wrap">
                  <span className="prefix">Rp</span>
                  <FormatInput className="hpp-input" placeholder="0"
                    value={platform.flatFee || ''} onChange={v => handleManualEdit({ flatFee: v })} />
                </div>
              </div>
            </div>

            {/* Slider komisi */}
            <input className="hpp-slider platform-slider" type="range" min="0" max="50" step="0.5"
              value={platform.commissionPct}
              onChange={e => handleManualEdit({ commissionPct: e.target.value })}
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
                    type="button"
                    onClick={() => handleManualEdit({ commissionBasis: opt.val })}
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
                <button key={opt.val} type="button" onClick={() => handleManualEdit({ discountType: opt.val, discountValue: 0 })}
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
                    <label className="label-sm" style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                      <Icon name="tag" size={12} /> Diskon (%)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input className="hpp-input" type="number" min="0" max="99" step="0.5"
                        value={platform.discountValue}
                        onChange={e => handleManualEdit({ discountValue: e.target.value })}
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
                  <label className="label-sm" style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <Icon name="tag" size={12} /> Nominal Diskon (Rp)
                  </label>
                  <div className="input-prefix-wrap">
                    <span className="prefix">Rp</span>
                    <FormatInput className="hpp-input" placeholder="0"
                      value={platform.discountValue || ''} onChange={v => handleManualEdit({ discountValue: v })} />
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

          {/* ── Cash Flow Breakdown ── */}
          {hj > 0 && (
            <div className="platform-cashflow-box">
              <div style={{ fontSize: 11, fontWeight: 700, color: '#b91c1c', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name="dollar" size={13} color="#b91c1c" /> Alur Kas per Cup (Cash Flow Breakdown)
              </div>

              {/* 4-segment bar */}
              <div style={{ marginBottom: 14 }}>
                <div className="progress-bar" style={{ height: 12, borderRadius: 6, background: '#fef2f2', overflow: 'hidden' }}>
                  <div className="progress-segment" style={{ width: `${segHpp}%`, background: 'linear-gradient(90deg,#818cf8,#6366f1)', borderRadius: '6px 0 0 6px' }} />
                  <div className="progress-segment" style={{ width: `${segDiskon}%`, background: 'linear-gradient(90deg,#fcd34d,#f59e0b)' }} />
                  <div className="progress-segment" style={{ width: `${segKomisi}%`, background: 'linear-gradient(90deg,#f87171,#dc2626)' }} />
                  <div className="progress-segment" style={{ width: `${segProfit}%`, background: netProfit >= 0 ? 'linear-gradient(90deg,#34d399,#10b981)' : 'linear-gradient(90deg,#6b7280,#374151)', borderRadius: '0 6px 6px 0' }} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 5, fontSize: 9, flexWrap: 'wrap', color: '#64748b' }}>
                  <span style={{ color: '#818cf8', fontWeight: 700 }}>• {segHpp.toFixed(0)}% HPP</span>
                  {diskonNominal > 0 && <span style={{ color: '#f59e0b', fontWeight: 700 }}>• {segDiskon.toFixed(0)}% Diskon</span>}
                  <span style={{ color: '#f87171', fontWeight: 700 }}>• {segKomisi.toFixed(0)}% Platform</span>
                  <span style={{ color: netProfit >= 0 ? '#34d399' : '#9ca3af', fontWeight: 700 }}>
                    • {segProfit.toFixed(0)}% Profit
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
                        Margin Bersih: {marginPct.toFixed(1)}% dari HJ
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
              fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
            }}>
              <Icon name="info" size={13} /> Isi bahan baku &amp; kemasan terlebih dahulu untuk melihat kalkulasi
            </div>
          )}
        </div>
      )}
    </div>
  );
}
