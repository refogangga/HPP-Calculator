"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Icon } from './Icon';
import FormatInput from './FormatInput';
import { num, fmtRp, roundPrice, getPenyusutanBulanan } from '../utils/hpp';

export default function BepCalculator({
  menus = [],
  opexProfiles = [],
  activeProfileId,
  onSelectProfile,
  bepSettings = [],
  activeOutletId,
  onUpdateBepSettings,
  showToast,
  assets = [],
  ingredients = []
}) {
  const [operationalDays, setOperationalDays] = useState(30);
  const [manualOpex, setManualOpex] = useState(null);
  const [manualMargin, setManualMargin] = useState(null);
  const [manualPrice, setManualPrice] = useState(null);
  const [actualVolume, setActualVolume] = useState(null);
  const [manualInvestment, setManualInvestment] = useState(null);
  const [targetPaybackMonths, setTargetPaybackMonths] = useState(12);
  const [activeRightTab, setActiveRightTab] = useState('operasional'); // 'operasional' | 'investasi' | 'gabungan'

  // Sync with database/parent settings when active outlet changes
  useEffect(() => {
    const s = bepSettings.find(x => x.outletId === activeOutletId) || {};
    setOperationalDays(s.operationalDays ?? 30);
    setManualOpex(s.manualOpex ?? null);
    setManualMargin(s.manualMargin ?? null);
    setManualPrice(s.manualPrice ?? null);
    setActualVolume(s.actualVolume ?? null);
    setManualInvestment(s.manualInvestment ?? null);
    setTargetPaybackMonths(s.targetPaybackMonths ?? 12);
  }, [activeOutletId, bepSettings]);

  // Helper to persist to parent / database
  const saveSettings = (updatedFields) => {
    const base = bepSettings.find(x => x.outletId === activeOutletId) || { outletId: activeOutletId };
    onUpdateBepSettings && onUpdateBepSettings({
      ...base,
      operationalDays,
      manualOpex,
      manualMargin,
      manualPrice,
      actualVolume,
      manualInvestment,
      targetPaybackMonths,
      ...updatedFields
    });
  };

  // Get active profile
  const activeProfile = useMemo(() => {
    return opexProfiles.find(p => p.id === activeProfileId) || opexProfiles[0] || null;
  }, [opexProfiles, activeProfileId]);

  // Selected menus inside active profile
  const selectedMenus = useMemo(() => {
    if (!activeProfile) return [];
    const hasSelected = Array.isArray(activeProfile.selectedMenuIds) && activeProfile.selectedMenuIds.length > 0;
    return hasSelected ? menus.filter(m => activeProfile.selectedMenuIds.includes(m.id)) : menus;
  }, [menus, activeProfile]);

  // Enabled menus in simulation
  const activeMenus = useMemo(() => {
    if (!activeProfile) return [];
    return selectedMenus.filter(m => !activeProfile.disabledMenuIds?.includes(m.id));
  }, [selectedMenus, activeProfile]);

  const assetDepr = useMemo(() => {
    return activeProfile ? Math.round(getPenyusutanBulanan(activeProfile, assets)) : 0;
  }, [activeProfile, assets]);

  // Calculate default OPEX from profile
  const calculatedOpex = useMemo(() => {
    if (!activeProfile) return 0;
    const expenses = (activeProfile.expenses || []).reduce((sum, exp) => sum + num(exp.value), 0);
    return Math.round(expenses) + assetDepr;
  }, [activeProfile, assetDepr]);

  const getDirectHPP = useCallback((menu) => {
    const bb = menu.ingredients.reduce((s, i) => {
      let hb = i.hargaBeli;
      let uk = i.ukuranKemasan;
      if (i.ingredientId) {
        const central = (ingredients || []).find(ci => ci.id === i.ingredientId);
        if (central) {
          hb = central.hargaBeli;
          uk = central.ukuranKemasan;
        }
      }
      if (!num(uk)) return s;
      return s + (num(hb) / num(uk)) * num(i.takaranPerCup);
    }, 0);
    const km = menu.packaging.filter(p => p.enabled).reduce((s, p) => {
      let h = p.harga;
      if (p.ingredientId) {
        const central = (ingredients || []).find(ci => ci.id === p.ingredientId);
        if (central) {
          h = num(central.ukuranKemasan) ? num(central.hargaBeli) / num(central.ukuranKemasan) : 0;
        }
      }
      return s + (num(h) * num(p.usage !== undefined ? p.usage : 1));
    }, 0);
    return bb + km;
  }, [ingredients]);

  // Get current platform calculations helper
  const getPlatformCalc = useCallback((menu) => {
    const hj = roundPrice(num(menu.margin) >= 100 ? 0 : getDirectHPP(menu) / (1 - num(menu.margin) / 100));
    const hpp = getDirectHPP(menu);
    const platform = menu.platform || { enabled: false, commissionPct: 0, flatFee: 0, discountType: 'pct', discountValue: 0, commissionBasis: 'original' };
    
    if (!platform.enabled) {
      return { hargaJual: hj, hargaEfektif: hj, revenueBersih: hj, hpp, totalKomisi: 0, diskonNominal: 0, netProfit: hj - hpp };
    }

    const diskonNominal = platform.discountType === 'pct' ? (hj * num(platform.discountValue) / 100) : num(platform.discountValue);
    const hargaEfektif = Math.max(hj - diskonNominal, 0);
    const basisKomisi = platform.commissionBasis === 'effective' ? hargaEfektif : hj;
    const komisiNominal = basisKomisi * num(platform.commissionPct) / 100;
    const totalKomisi = komisiNominal + num(platform.flatFee);
    const revenueBersih = hargaEfektif - totalKomisi;

    return {
      hargaJual: hj,
      hargaEfektif,
      revenueBersih,
      hpp,
      totalKomisi,
      diskonNominal,
      netProfit: revenueBersih - hpp
    };
  }, [getDirectHPP]);

  const getMenuVolume = useCallback((menuId, defaultVal) => {
    if (activeProfile?.menuVolumes && activeProfile.menuVolumes[menuId] !== undefined) {
      return num(activeProfile.menuVolumes[menuId]);
    }
    return num(defaultVal);
  }, [activeProfile]);

  // Calculate default values based on actual database menus
  const defaultMetrics = useMemo(() => {
    let totalVolume = 0;
    let weightedNetProfitSum = 0;
    let weightedPriceSum = 0;
    let weightedHppSum = 0;
    let weightedPlatformCutSum = 0;

    activeMenus.forEach(m => {
      const vol = getMenuVolume(m.id, num(m.ops?.estimasiCup));
      const pc = getPlatformCalc(m);
      totalVolume += vol;
      weightedNetProfitSum += vol * pc.netProfit;
      weightedPriceSum += vol * pc.revenueBersih;
      weightedHppSum += vol * pc.hpp;
      weightedPlatformCutSum += vol * pc.totalKomisi;
    });

    const avgNetProfit = totalVolume > 0 ? weightedNetProfitSum / totalVolume : 0;
    const avgPrice = totalVolume > 0 ? weightedPriceSum / totalVolume : 0;
    const avgHpp = totalVolume > 0 ? weightedHppSum / totalVolume : 0;
    const avgPlatformCut = totalVolume > 0 ? weightedPlatformCutSum / totalVolume : 0;

    return {
      avgNetProfit: avgNetProfit || 15000, // fallback
      avgPrice: avgPrice || 25000, // fallback
      avgHpp: avgHpp || 10000, // fallback
      avgPlatformCut: avgPlatformCut || 0,
      totalVolume
    };
  }, [activeMenus, getMenuVolume, getPlatformCalc]);

  // Synchronize state when defaults change
  useEffect(() => {
    if (actualVolume === null && defaultMetrics.totalVolume > 0) {
      setActualVolume(defaultMetrics.totalVolume);
    }
  }, [defaultMetrics.totalVolume, actualVolume]);

  // Values used in calculation (either overwritten or calculated)
  const opexVal = manualOpex !== null ? num(manualOpex) : calculatedOpex;
  const netProfitPerCup = manualMargin !== null ? num(manualMargin) : defaultMetrics.avgNetProfit;
  const avgPriceVal = manualPrice !== null ? num(manualPrice) : defaultMetrics.avgPrice;
  const volumeVal = actualVolume !== null ? num(actualVolume) : (defaultMetrics.totalVolume || 600);

  // Formulasi Perhitungan BEP
  const bepUnits = useMemo(() => {
    const roundedMargin = Math.round(netProfitPerCup);
    return roundedMargin > 0 ? Math.ceil(opexVal / roundedMargin) : 0;
  }, [opexVal, netProfitPerCup]);

  const bepHarian = useMemo(() => {
    return operationalDays > 0 ? Math.ceil(bepUnits / operationalDays) : 0;
  }, [bepUnits, operationalDays]);

  const bepNominal = useMemo(() => {
    return bepUnits * avgPriceVal;
  }, [bepUnits, avgPriceVal]);

  const actualVolumeHarian = useMemo(() => {
    return operationalDays > 0 ? Math.round(volumeVal / operationalDays) : 0;
  }, [volumeVal, operationalDays]);

  const calculatedInvestment = useMemo(() => {
    if (!activeProfile) return 0;
    return (activeProfile.assets || []).reduce((sum, a) => {
      const central = (assets || []).find(ca => ca.id === a.assetId);
      if (central && !central.isLargeExpense) {
        return sum + num(central.harga);
      }
      if (!a.assetId && !a.isLargeExpense && a.harga) {
        return sum + num(a.harga);
      }
      return sum;
    }, 0);
  }, [activeProfile, assets]);

  const investmentVal = manualInvestment !== null ? num(manualInvestment) : calculatedInvestment;

  const monthlyNetProfit = useMemo(() => {
    const roundedMargin = Math.round(netProfitPerCup);
    return (volumeVal * roundedMargin) - opexVal;
  }, [volumeVal, netProfitPerCup, opexVal]);

  const paybackPeriodMonths = useMemo(() => {
    const operatingCashFlow = monthlyNetProfit + assetDepr;
    if (operatingCashFlow <= 0 || investmentVal <= 0) return 0;
    return investmentVal / operatingCashFlow;
  }, [investmentVal, monthlyNetProfit, assetDepr]);

  const paybackText = useMemo(() => {
    if (monthlyNetProfit <= 0) {
      return "Tidak pernah balik modal (bisnis merugi/impas).";
    }
    if (investmentVal <= 0) {
      return "0 Bulan (Tanpa modal awal).";
    }
    const totalMonths = Math.ceil(paybackPeriodMonths);
    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;

    let timeStr = "";
    if (years > 0) {
      timeStr += `${years} Tahun `;
    }
    if (remainingMonths > 0 || years === 0) {
      timeStr += `${remainingMonths} Bulan`;
    }

    return timeStr;
  }, [paybackPeriodMonths, monthlyNetProfit, investmentVal]);

  const goalSeek = useMemo(() => {
    if (targetPaybackMonths <= 0 || netProfitPerCup <= 0 || investmentVal <= 0) {
      return { requiredMonthlyProfit: 0, requiredCupMonth: 0, requiredCupDay: 0, requiredRevMonth: 0, requiredRevDay: 0 };
    }
    const requiredMonthlyCashFlow = investmentVal / targetPaybackMonths;
    const requiredMonthlyProfit = Math.max(0, requiredMonthlyCashFlow - assetDepr);
    const requiredMonthlyGrossProfit = requiredMonthlyProfit + opexVal;
    const requiredCupMonth = Math.ceil(requiredMonthlyGrossProfit / Math.round(netProfitPerCup));
    const requiredCupDay = operationalDays > 0 ? Math.ceil(requiredCupMonth / operationalDays) : 0;
    const requiredRevMonth = requiredCupMonth * avgPriceVal;
    const requiredRevDay = requiredCupDay * avgPriceVal;

    return {
      requiredMonthlyProfit,
      requiredCupMonth,
      requiredCupDay,
      requiredRevMonth,
      requiredRevDay
    };
  }, [targetPaybackMonths, investmentVal, opexVal, netProfitPerCup, avgPriceVal, operationalDays, assetDepr]);

  // Status & Danger Level
  const marginGap = actualVolumeHarian - bepHarian;
  const targetPct = bepHarian > 0 ? Math.min(100, (actualVolumeHarian / bepHarian) * 100) : 0;

  let statusText = 'DI BAWAH BEP';
  let statusColor = '#ef4444'; // Red
  let statusBg = 'rgba(239, 68, 68, 0.1)';
  let statusBorder = 'rgba(239, 68, 68, 0.25)';

  if (marginGap >= 5) {
    statusText = 'PROFIT SEHAT';
    statusColor = '#10b981'; // Green
    statusBg = 'rgba(16, 185, 129, 0.1)';
    statusBorder = 'rgba(16, 185, 129, 0.25)';
  } else if (marginGap >= 0) {
    statusText = 'RAWAN BEP';
    statusColor = '#f59e0b'; // Amber
    statusBg = 'rgba(245, 158, 11, 0.1)';
    statusBorder = 'rgba(245, 158, 11, 0.25)';
  }

  // Risk styling for Recommendations tab
  let recStatusText = 'SANGAT SEHAT';
  let recStatusColor = '#10b981'; // Green
  let recStatusBg = 'rgba(16, 185, 129, 0.08)';
  let recStatusBorder = 'rgba(16, 185, 129, 0.2)';
  let recStatusDesc = '';

  if (monthlyNetProfit <= 0) {
    recStatusText = 'KRITIS (RUGI)';
    recStatusColor = '#ef4444'; // Red
    recStatusBg = 'rgba(239, 68, 68, 0.08)';
    recStatusBorder = 'rgba(239, 68, 68, 0.2)';
    recStatusDesc = `Target volume penjualan aktual (${volumeVal} cup) berada di bawah BEP Operasional (${bepUnits} cup). Bisnis diproyeksikan rugi ${fmtRp(Math.abs(monthlyNetProfit))} per bulan.`;
  } else if (paybackPeriodMonths > targetPaybackMonths) {
    recStatusText = 'RAWAN (TARGET MELESET)';
    recStatusColor = '#f59e0b'; // Amber
    recStatusBg = 'rgba(245, 158, 11, 0.08)';
    recStatusBorder = 'rgba(245, 158, 11, 0.2)';
    recStatusDesc = `Toko mencetak profit bersih ${fmtRp(monthlyNetProfit)}/bln, namun modal awal baru akan kembali dalam ${paybackText}. Target balik modal ${targetPaybackMonths} bulan meleset.`;
  } else {
    recStatusDesc = `Toko sangat profitabel! Profit bersih ${fmtRp(monthlyNetProfit)}/bln sanggup mengembalikan modal awal dalam ${paybackText}, lebih cepat dari target (${targetPaybackMonths} bulan).`;
  }

  const handleCopyReport = () => {
    const hppVal = defaultMetrics.avgHpp;
    const currentPrice = avgPriceVal;
    const netProfitVal = netProfitPerCup;
    const netMarginPctVal = currentPrice > 0 ? (netProfitVal / currentPrice) * 100 : 0;
    const platformCutVal = defaultMetrics.avgPlatformCut;
    const platformCutPctVal = currentPrice > 0 ? (platformCutVal / currentPrice) * 100 : 0;

    const rec40 = hppVal / (1 - 0.4);
    const rec50 = hppVal / (1 - 0.5);
    const rec60 = hppVal / (1 - 0.6);

    const reportText = `=== LAPORAN REKOMENDASI & ANALISIS KELAYAKAN BEP ===
Tanggal Laporan: ${new Date().toLocaleDateString('id-ID')}

1. STATUS KELAYAKAN INVESTASI: ${recStatusText}
   - ${recStatusDesc}
   - Estimasi Profit Bersih Bulanan: ${fmtRp(monthlyNetProfit)}
   - Total Modal Awal: ${fmtRp(investmentVal)}
   - Waktu Balik Modal Riil: ${paybackText}

2. UNIT ECONOMICS (RATA-RATA PER CUP):
   - Rata-rata Harga Jual: ${fmtRp(currentPrice)}
   - Rata-rata Direct HPP (Bahan + Kemasan): ${fmtRp(hppVal)}
   - Komisi Platform Online: ${fmtRp(platformCutVal)} (${platformCutPctVal.toFixed(1)}%)
   - Margin Bersih per Cup: ${fmtRp(netProfitVal)} (${netMarginPctVal.toFixed(1)}%)

3. REKOMENDASI HARGA JUAL SEHAT (BERDASARKAN TARGET MARGIN):
   - Target Margin 40% (Batas Bawah): ${fmtRp(Math.round(rec40))}
   - Target Margin 50% (Ideal/Standar): ${fmtRp(Math.round(rec50))}
   - Target Margin 60% (Premium/Aman): ${fmtRp(Math.round(rec60))}
   
* Laporan dibuat secara otomatis melalui HPP F&B Calculator.`;

    navigator.clipboard.writeText(reportText);
    if (showToast) {
      showToast("Laporan berhasil disalin ke clipboard!", "success");
    } else {
      alert("Laporan berhasil disalin ke clipboard!");
    }
  };

  return (
    <div className="main-grid" style={{
      display: 'grid', gridTemplateColumns: '1fr 390px', gap: 20,
      padding: '20px 28px', alignItems: 'start'
    }}>
      {/* ══ LEFT PANEL (INPUTS) ══════════════════════════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="section-card">
          <div className="section-header" style={{ padding: '16px 22px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-app)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#e0f2fe', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="calculator" size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-text)' }}>Kalkulator BEP Operasional Bisnis</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>Simulasikan BEP usaha berdasarkan alokasi OPEX &amp; margin aktual</div>
              </div>
            </div>
          </div>

          <div className="section-body" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 22 }}>
            {/* Profile Selector */}
            {opexProfiles.length > 1 && (
              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Profil Simulasi Toko</label>
                <select
                  className="hpp-input"
                  value={activeProfileId || ''}
                  onChange={e => onSelectProfile && onSelectProfile(e.target.value)}
                  style={{ fontWeight: 600 }}
                >
                  {opexProfiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* 1. PARAMETER BEP OPERASIONAL */}
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', borderBottom: '1.5px solid var(--border-color)', paddingBottom: 6, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="zap" size={13} /> 1. PARAMETER BEP OPERASIONAL (TOKO)
            </div>

            {/* Total OPEX Bulanan */}
            <div>
              <div className="flex-between" style={{ marginBottom: 6 }}>
                <label className="label-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Total OPEX Bulanan (Rp)
                </label>
                {manualOpex !== null ? (
                  <button onClick={() => { setManualOpex(null); saveSettings({ manualOpex: null }); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                    Reset ke Profil
                  </button>
                ) : (
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Auto-fill dari profil</span>
                )}
              </div>
              <div className="input-prefix-wrap">
                <span className="prefix">Rp</span>
                <FormatInput
                  className="hpp-input"
                  placeholder={calculatedOpex.toString()}
                  value={manualOpex !== null ? manualOpex : calculatedOpex}
                  onChange={(val) => { setManualOpex(val); saveSettings({ manualOpex: val }); }}
                />
              </div>
              {manualOpex === null && (
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Total pos overhead ({fmtRp((activeProfile?.expenses || []).reduce((sum, exp) => sum + num(exp.value), 0))}) + penyusutan ({fmtRp(getPenyusutanBulanan(activeProfile, assets))})
                </div>
              )}
            </div>

            {/* Rata-Rata Margin Bersih per Cup */}
            <div>
              <div className="flex-between" style={{ marginBottom: 6 }}>
                <label className="label-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Margin Bersih per Cup (Rp/Cup)
                </label>
                {manualMargin !== null ? (
                  <button onClick={() => { setManualMargin(null); saveSettings({ manualMargin: null }); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                    Reset ke Rata-rata
                  </button>
                ) : (
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Rata-rata tertimbang menu</span>
                )}
              </div>
              <div className="input-prefix-wrap">
                <span className="prefix">Rp</span>
                <FormatInput
                  className="hpp-input"
                  placeholder={Math.round(defaultMetrics.avgNetProfit).toString()}
                  value={manualMargin !== null ? manualMargin : Math.round(defaultMetrics.avgNetProfit)}
                  onChange={(val) => { setManualMargin(val); saveSettings({ manualMargin: val }); }}
                />
              </div>
            </div>

            {/* Rata-rata Harga Jual */}
            <div>
              <div className="flex-between" style={{ marginBottom: 6 }}>
                <label className="label-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Harga Jual per Cup (Rata-rata)
                </label>
                {manualPrice !== null ? (
                  <button onClick={() => { setManualPrice(null); saveSettings({ manualPrice: null }); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                    Reset ke Rata-rata
                  </button>
                ) : (
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Berdasarkan list harga</span>
                )}
              </div>
              <div className="input-prefix-wrap">
                <span className="prefix">Rp</span>
                <FormatInput
                  className="hpp-input"
                  placeholder={Math.round(defaultMetrics.avgPrice).toString()}
                  value={manualPrice !== null ? manualPrice : Math.round(defaultMetrics.avgPrice)}
                  onChange={(val) => { setManualPrice(val); saveSettings({ manualPrice: val }); }}
                />
              </div>
            </div>

            {/* Hari Operasional per Bulan */}
            <div>
              <div className="flex-between" style={{ marginBottom: 6 }}>
                <label className="label-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Hari Operasional Bulanan
                </label>
                <span className="mono" style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 14 }}>
                  {operationalDays} hari
                </span>
              </div>
              <input
                className="hpp-slider"
                type="range"
                min="15"
                max="31"
                value={operationalDays}
                onChange={e => { const val = Number(e.target.value); setOperationalDays(val); saveSettings({ operationalDays: val }); }}
                style={{ '--slider-pct': `${((operationalDays - 15) / 16) * 100}%` }}
              />
              <div className="flex-between" style={{ fontSize: 9, color: 'var(--color-text-muted)', marginTop: 4 }}>
                <span>15 Hari</span>
                <span>26 Hari</span>
                <span>30 Hari</span>
              </div>
            </div>

            {/* 2. PARAMETER BEP INVESTASI */}
            <div style={{ fontSize: 11, fontWeight: 800, color: '#3b82f6', borderBottom: '1.5px solid var(--border-color)', paddingBottom: 6, marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="package" size={13} /> 2. PARAMETER BEP INVESTASI (BALIK MODAL)
            </div>

            {/* Total Investasi Awal / Modal Awal (Rp) */}
            <div>
              <div className="flex-between" style={{ marginBottom: 6 }}>
                <label className="label-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Total Investasi / Modal Awal (Rp)
                </label>
                {manualInvestment !== null ? (
                  <button onClick={() => { setManualInvestment(null); saveSettings({ manualInvestment: null }); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                    Reset ke Profil
                  </button>
                ) : (
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Auto-fill dari daftar aset</span>
                )}
              </div>
              <div className="input-prefix-wrap">
                <span className="prefix">Rp</span>
                <FormatInput
                  className="hpp-input"
                  placeholder={calculatedInvestment.toString()}
                  value={manualInvestment !== null ? manualInvestment : calculatedInvestment}
                  onChange={(val) => { setManualInvestment(val); saveSettings({ manualInvestment: val }); }}
                />
              </div>
              {manualInvestment === null && (
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Total nilai aset terdaftar: {fmtRp(calculatedInvestment)}
                </div>
              )}
            </div>

            {/* Target Waktu Balik Modal (Bulan) */}
            <div>
              <div className="flex-between" style={{ marginBottom: 6 }}>
                <label className="label-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Target Waktu Balik Modal (Bulan)
                </label>
                <span className="mono" style={{ fontWeight: 800, color: '#3b82f6', fontSize: 14 }}>
                  {targetPaybackMonths} bulan
                </span>
              </div>
              <input
                className="hpp-slider"
                type="range"
                min="1"
                max="60"
                value={targetPaybackMonths}
                onChange={e => { const val = Number(e.target.value); setTargetPaybackMonths(val); saveSettings({ targetPaybackMonths: val }); }}
                style={{ '--slider-pct': `${((targetPaybackMonths - 1) / 59) * 100}%` }}
              />
              <div className="flex-between" style={{ fontSize: 9, color: 'var(--color-text-muted)', marginTop: 4 }}>
                <span>1 Bln</span>
                <span>12 Bln (1 Thn)</span>
                <span>36 Bln (3 Thn)</span>
                <span>60 Bln (5 Thn)</span>
              </div>
            </div>

            {/* Target Penjualan Bulanan Aktual */}
            <div>
              <label className="label-sm" style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                Estimasi/Target Volume Penjualan Aktual (Cup/Bulan)
              </label>
              <input
                className="hpp-input"
                type="number"
                placeholder={defaultMetrics.totalVolume.toString() || '600'}
                value={actualVolume !== null ? actualVolume : defaultMetrics.totalVolume}
                onChange={e => { const val = e.target.value; setActualVolume(val); saveSettings({ actualVolume: val }); }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL (RESULTS & HERO BANNER) ══════════════ */}
      <div className="result-sticky" style={{ position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 14 }}>
        
        {/* Navigation Tabs for Right Panel */}
        <div style={{ display: 'flex', gap: 2, background: '#f4f4f5', padding: 4, borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', marginBottom: 2 }}>
          <button
            onClick={() => setActiveRightTab('operasional')}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 'calc(var(--radius) - 2px)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 12,
              background: activeRightTab === 'operasional' ? 'var(--bg-card)' : 'transparent',
              color: activeRightTab === 'operasional' ? 'var(--color-text)' : 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: activeRightTab === 'operasional' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <Icon name="zap" size={12} color={activeRightTab === 'operasional' ? 'var(--primary)' : 'var(--color-text-muted)'} /> BEP Operasional
          </button>
          <button
            onClick={() => setActiveRightTab('investasi')}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 'calc(var(--radius) - 2px)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 12,
              background: activeRightTab === 'investasi' ? 'var(--bg-card)' : 'transparent',
              color: activeRightTab === 'investasi' ? 'var(--color-text)' : 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: activeRightTab === 'investasi' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <Icon name="package" size={12} color={activeRightTab === 'investasi' ? 'var(--primary)' : 'var(--color-text-muted)'} /> BEP Investasi
          </button>
          <button
            onClick={() => setActiveRightTab('gabungan')}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 'calc(var(--radius) - 2px)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 12,
              background: activeRightTab === 'gabungan' ? 'var(--bg-card)' : 'transparent',
              color: activeRightTab === 'gabungan' ? 'var(--color-text)' : 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: activeRightTab === 'gabungan' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <Icon name="target" size={12} color={activeRightTab === 'gabungan' ? 'var(--primary)' : 'var(--color-text-muted)'} /> BEP Gabungan
          </button>
        </div>

        {activeRightTab === 'operasional' && (
          <>
            {/* Hero Summary Banner: Target Penjualan Harian */}
            <div style={{
              background: 'var(--primary)',
              borderRadius: 'var(--radius)',
              padding: '24px 20px',
              color: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', right: '-15%', top: '-25%', width: 140, height: 140, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', filter: 'blur(24px)' }} />
              <div className="label-xs" style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 800, letterSpacing: '0.08em', marginBottom: 10 }}>
                TARGET HARIAN ANTI-RUGI (OPERASIONAL)
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginBottom: 6 }}>Target Penjualan Harian agar Tidak Rugi:</div>
              <div className="mono" style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                {bepHarian} <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>Cup / Hari</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 10 }}>
                Mencakup HPP &amp; target menutupi operasional bulanan {fmtRp(opexVal)}
              </div>
            </div>

            {/* Status Gauge & Actual Performance Card */}
            <div className="result-dark-card" style={{ padding: 20 }}>
              <div className="flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)' }}>PERBANDINGAN TERJUAL vs BEP</span>
                <div style={{
                  background: statusBg,
                  border: `1.5px solid ${statusBorder}`,
                  color: statusColor,
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 800
                }}>
                  {statusText}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Realisasi Harian</div>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', marginTop: 2 }}>{actualVolumeHarian} Cup</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Kebutuhan BEP Harian</div>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-muted)', marginTop: 2 }}>{bepHarian} Cup</div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 6 }}>
                <div className="progress-bar" style={{ height: 8, background: '#f4f4f5', borderRadius: 9999, overflow: 'hidden' }}>
                  <div
                    className="progress-segment"
                    style={{
                      width: `${targetPct}%`,
                      background: statusColor,
                      height: '100%',
                      borderRadius: 9999
                    }}
                  />
                </div>
              </div>
              <div className="flex-between" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--color-text-muted)' }}>
                <span>Pencapaian Target BEP:</span>
                <span className="mono" style={{ fontWeight: 700, color: statusColor }}>{targetPct.toFixed(0)}%</span>
              </div>
            </div>

            {/* Detailed BEP Results Card */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div className="label-xs" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>DETAIL METRIK BEP OPERASIONAL TOKO</div>

              {[
                { label: 'BEP Unit Bulanan', val: `${bepUnits.toLocaleString('id-ID')} Cup / bln`, color: 'var(--color-text)' },
                { label: 'BEP Harian', val: `${bepHarian} Cup / hari`, color: 'var(--color-text)', bold: true },
                { label: 'BEP Nominal Bulanan', val: fmtRp(bepNominal), color: '#10b981' },
                { label: 'BEP Nominal Harian', val: `${fmtRp(Math.round(bepNominal / operationalDays))} / hari`, color: '#059669' },
              ].map(({ label, val, color, bold }) => (
                <div key={label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '5px 0',
                  borderBottom: '1px dashed var(--border-color)'
                }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: bold ? 600 : 400 }}>{label}</span>
                  <span className="mono" style={{ fontSize: 12, fontWeight: bold ? 800 : 600, color }}>{val}</span>
                </div>
              ))}

              <div style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: 10,
                fontSize: 10,
                color: 'var(--color-text-muted)',
                lineHeight: 1.6,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 6
              }}>
                <Icon name="info" size={13} color="var(--primary)" />
                <div>
                  <strong>Bagaimana BEP Operasional Diturunkan?</strong><br />
                  Titik BEP operasional dihitung murni untuk menutupi biaya operasional bulanan (OPEX) toko sebesar **{fmtRp(opexVal)}**.
                </div>
              </div>
            </div>
          </>
        )}

        {activeRightTab === 'investasi' && (
          <>
            {/* Hero Summary Banner: Target Penjualan Investasi */}
            <div style={{
              background: '#18181b',
              borderRadius: 'var(--radius)',
              padding: '24px 20px',
              color: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', right: '-15%', top: '-25%', width: 140, height: 140, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', filter: 'blur(24px)' }} />
              <div className="label-xs" style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 800, letterSpacing: '0.08em', marginBottom: 10 }}>
                TARGET HARIAN BALIK MODAL (INVESTASI)
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginBottom: 6 }}>Target Penjualan Harian agar Modal Kembali dalam {targetPaybackMonths} Bulan:</div>
              <div className="mono" style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                {goalSeek.requiredCupDay} <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>Cup / Hari</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 10 }}>
                Target Omset Bulanan: **{fmtRp(goalSeek.requiredRevMonth)}** ({goalSeek.requiredCupMonth.toLocaleString('id-ID')} Cup/Bulan)
              </div>
            </div>

            {/* Payback period analysis tracker */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div className="label-xs" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>PROYEKSI BALIK MODAL (DARI SIMULASI VOLUME)</div>

              <div style={{
                background: monthlyNetProfit > 0 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                border: `1.5px solid ${monthlyNetProfit > 0 ? '#10b981' : '#ef4444'}`,
                borderRadius: 10,
                padding: '12px 14px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: monthlyNetProfit > 0 ? '#34d399' : '#f87171', marginBottom: 4 }}>
                  ESTIMASI WAKTU BALIK MODAL RIIL
                </div>
                <div className="mono" style={{ fontWeight: 900, fontSize: 20, color: 'var(--color-text)' }}>
                  {paybackText}
                </div>
                {monthlyNetProfit > 0 && paybackPeriodMonths > 0 && (
                  <div style={{ fontSize: 9, color: 'var(--color-text-muted)', marginTop: 4 }}>
                    Semua modal investasi awal diproyeksikan kembali dalam <strong>{paybackText}</strong>.
                  </div>
                )}
              </div>

              {[
                { label: 'Investasi Awal (CapEx)', val: fmtRp(investmentVal), color: 'var(--color-text)' },
                { label: 'Volume Simulasi Aktif', val: `${volumeVal.toLocaleString('id-ID')} Cup/Bln (${Math.ceil(volumeVal / operationalDays)} Cup/Hari)`, color: 'var(--color-text-muted)' },
                { label: 'Profit Bersih Bulanan Riil', val: monthlyNetProfit > 0 ? fmtRp(monthlyNetProfit) : `Rugi ${fmtRp(Math.abs(monthlyNetProfit))}`, color: monthlyNetProfit > 0 ? '#10b981' : '#ef4444', bold: true },
                { label: 'Waktu Balik Modal Riil', val: paybackPeriodMonths > 0 ? paybackText : 'N/A', color: 'var(--color-text)', bold: true },
              ].map(({ label, val, color, bold }) => (
                <div key={label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '5px 0',
                  borderBottom: '1px dashed var(--border-color)'
                }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: bold ? 600 : 400 }}>{label}</span>
                  <span className="mono" style={{ fontSize: 12, fontWeight: bold ? 800 : 600, color }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Simulasi Target Omset & Profit Investasi */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div className="label-xs" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>TARGET MINIMUM BALIK MODAL ({targetPaybackMonths} BULAN)</div>

              {[
                { label: 'Target Omset Harian Minimum', val: `${fmtRp(goalSeek.requiredRevDay)} / hari`, color: 'var(--color-text)', bold: true },
                { label: 'Target Omset Bulanan Minimum', val: fmtRp(goalSeek.requiredRevMonth), color: 'var(--color-text)' },
                { label: 'Wajib Profit Bersih / Bulan (Angsuran)', val: fmtRp(Math.round(goalSeek.requiredMonthlyProfit)), color: '#10b981' },
              ].map(({ label, val, color, bold }) => (
                <div key={label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '5px 0',
                  borderBottom: '1px dashed var(--border-color)'
                }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: bold ? 600 : 400 }}>{label}</span>
                  <span className="mono" style={{ fontSize: 12, fontWeight: bold ? 800 : 600, color }}>{val}</span>
                </div>
              ))}

              <div style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: 10,
                fontSize: 10,
                color: 'var(--color-text-muted)',
                lineHeight: 1.6,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 6
              }}>
                <Icon name="calculator" size={13} color="var(--primary)" />
                <div>
                  <strong>Cara Pencapaian Target Balik Modal:</strong><br />
                  Untuk mengembalikan modal awal sebesar <strong>{fmtRp(investmentVal)}</strong> dalam target waktu <strong>{targetPaybackMonths} Bulan</strong>, Anda wajib menjual minimal <strong>{goalSeek.requiredCupDay} Cup/Hari</strong> (setara omset <strong>{fmtRp(goalSeek.requiredRevDay)}/hari</strong>).
                  {volumeVal > goalSeek.requiredCupMonth && (
                    <div style={{ marginTop: 6, color: '#10b981', fontWeight: 600 }}>
                      ✓ Simulasi volume aktif Anda ({Math.ceil(volumeVal / operationalDays)} Cup/Hari) berada di atas target minimum, sehingga modal kembali lebih cepat ({paybackText}).
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeRightTab === 'gabungan' && (
          <>
            {/* Hero Summary Banner: Target Penjualan Gabungan */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
              borderRadius: 'var(--radius)',
              padding: '24px 20px',
              color: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', right: '-15%', top: '-25%', width: 140, height: 140, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.15)', filter: 'blur(24px)' }} />
              <div className="label-xs" style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 800, letterSpacing: '0.08em', marginBottom: 10 }}>
                RENTANG TARGET BEP GABUNGAN HARIAN
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginBottom: 6 }}>
                Batas Aman Operasional s.d. Balik Modal:
              </div>
              <div className="mono" style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                {investmentVal > 0 ? (
                  <>
                    {bepHarian} - {goalSeek.requiredCupDay} <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>Cup / Hari</span>
                  </>
                ) : (
                  <>
                    {bepHarian} <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>Cup / Hari</span>
                  </>
                )}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 10 }}>
                {investmentVal > 0 ? (
                  `Bawah (Operasional): ${bepHarian} Cup/hari | Atas (Balik Modal ${targetPaybackMonths} Bln): ${goalSeek.requiredCupDay} Cup/hari`
                ) : (
                  `Tanpa nilai modal awal terdaftar, target disamakan dengan BEP Operasional.`
                )}
              </div>
            </div>

            {/* Custom Scale & Gauge Chart Card */}
            <div className="result-dark-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)' }}>ZONA TARGET PENJUALAN HARIAN</span>
                {(() => {
                  let badgeText = 'RUGI OPERASIONAL';
                  let badgeColor = '#ef4444';
                  let badgeBg = 'rgba(239, 68, 68, 0.1)';
                  let badgeBorder = 'rgba(239, 68, 68, 0.25)';

                  if (investmentVal > 0) {
                    if (actualVolumeHarian >= goalSeek.requiredCupDay) {
                      badgeText = 'TARGET BALIK MODAL OK';
                      badgeColor = '#10b981';
                      badgeBg = 'rgba(16, 185, 129, 0.1)';
                      badgeBorder = 'rgba(16, 185, 129, 0.25)';
                    } else if (actualVolumeHarian >= bepHarian) {
                      badgeText = 'IMPAS OPERASIONAL';
                      badgeColor = '#f59e0b';
                      badgeBg = 'rgba(245, 158, 11, 0.1)';
                      badgeBorder = 'rgba(245, 158, 11, 0.25)';
                    }
                  } else {
                    if (actualVolumeHarian >= bepHarian) {
                      badgeText = 'BEP OPERASIONAL OK';
                      badgeColor = '#10b981';
                      badgeBg = 'rgba(16, 185, 129, 0.1)';
                      badgeBorder = 'rgba(16, 185, 129, 0.25)';
                    }
                  }

                  return (
                    <div style={{
                      background: badgeBg,
                      border: `1.5px solid ${badgeBorder}`,
                      color: badgeColor,
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 800
                    }}>
                      {badgeText}
                    </div>
                  );
                })()}
              </div>

              {/* Progress scale bar */}
              {(() => {
                const targetLimit = goalSeek.requiredCupDay > 0 ? goalSeek.requiredCupDay : bepHarian;
                const maxVal = Math.max(actualVolumeHarian, targetLimit, 10) * 1.35;
                const actualPct = Math.min(100, (actualVolumeHarian / maxVal) * 100);
                const opexPct = Math.min(100, (bepHarian / maxVal) * 100);
                const investPct = Math.min(100, (targetLimit / maxVal) * 100);
                const labelsClose = investmentVal > 0 && (investPct - opexPct < 16);

                let fillBg = '#ef4444';
                if (actualVolumeHarian >= targetLimit) fillBg = '#10b981';
                else if (actualVolumeHarian >= bepHarian) fillBg = '#f59e0b';

                return (
                  <div style={{ padding: '8px 0 24px 0' }}>
                    <div style={{ position: 'relative', height: 26, margin: '10px 0' }}>
                      {/* Main track */}
                      <div style={{
                        position: 'absolute',
                        top: 9,
                        left: 0,
                        right: 0,
                        height: 8,
                        background: '#e4e4e7',
                        borderRadius: 4
                      }} />

                      {/* Zone Fills (Background Colors) */}
                      <div style={{
                        position: 'absolute',
                        top: 9,
                        left: 0,
                        width: `${opexPct}%`,
                        height: 8,
                        background: 'rgba(239, 68, 68, 0.15)',
                        borderTopLeftRadius: 4,
                        borderBottomLeftRadius: 4
                      }} />
                      {investmentVal > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: 9,
                          left: `${opexPct}%`,
                          width: `${investPct - opexPct}%`,
                          height: 8,
                          background: 'rgba(245, 158, 11, 0.15)'
                        }} />
                      )}
                      <div style={{
                        position: 'absolute',
                        top: 9,
                        left: `${investPct}%`,
                        right: 0,
                        height: 8,
                        background: 'rgba(16, 185, 129, 0.15)',
                        borderTopRightRadius: 4,
                        borderBottomRightRadius: 4
                      }} />

                      {/* Actual value fill */}
                      <div style={{
                        position: 'absolute',
                        top: 9,
                        left: 0,
                        width: `${actualPct}%`,
                        height: 8,
                        background: fillBg,
                        borderRadius: 4,
                        transition: 'width 0.3s ease'
                      }} />

                      {/* Actual value cursor pointer pin */}
                      <div style={{
                        position: 'absolute',
                        top: 3,
                        left: `calc(${actualPct}% - 6px)`,
                        width: 12,
                        height: 20,
                        background: '#ffffff',
                        border: `3px solid ${fillBg}`,
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                        zIndex: 10,
                        transition: 'left 0.3s ease'
                      }} />

                      {/* Milestone Line: BEP Operasional */}
                      <div style={{
                        position: 'absolute',
                        top: 4,
                        left: `${opexPct}%`,
                        width: 2,
                        height: 18,
                        background: '#f43f5e',
                        zIndex: 5
                      }} />

                      {/* Milestone Line: BEP Investasi */}
                      {investmentVal > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: 4,
                          left: `${investPct}%`,
                          width: 2,
                          height: 18,
                          background: '#3b82f6',
                          zIndex: 5
                        }} />
                      )}
                    </div>

                    {/* Milestone labels */}
                    <div style={{ position: 'relative', height: labelsClose ? 38 : 25, fontSize: 9, color: 'var(--color-text-muted)', marginTop: 4 }}>
                      <div style={{ position: 'absolute', left: 0, top: 0 }}>0</div>
                      <div style={{
                        position: 'absolute',
                        left: `${opexPct}%`,
                        transform: 'translateX(-50%)',
                        textAlign: 'center',
                        color: '#f43f5e',
                        fontWeight: 700,
                        top: 0
                      }}>
                        BEP Opex: {bepHarian}
                      </div>
                      {investmentVal > 0 && (
                        <div style={{
                          position: 'absolute',
                          left: `${investPct}%`,
                          transform: 'translateX(-50%)',
                          textAlign: 'center',
                          color: '#3b82f6',
                          fontWeight: 700,
                          top: labelsClose ? 13 : 0
                        }}>
                          BEP Invest: {goalSeek.requiredCupDay}
                        </div>
                      )}
                      <div style={{ position: 'absolute', right: 0, top: 0 }}>{Math.round(maxVal)}</div>
                    </div>
                  </div>
                );
              })()}

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Realisasi Harian</div>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', marginTop: 2 }}>{actualVolumeHarian} Cup</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Status Penjualan</div>
                  <div style={{ 
                    fontSize: 12, 
                    fontWeight: 700, 
                    color: actualVolumeHarian >= (goalSeek.requiredCupDay || bepHarian) ? 'var(--color-emerald)' : (actualVolumeHarian >= bepHarian ? 'var(--color-amber)' : 'var(--color-red)'),
                    marginTop: 4 
                  }}>
                    {actualVolumeHarian >= (goalSeek.requiredCupDay || bepHarian) ? (
                      'Melampaui Target'
                    ) : (
                      actualVolumeHarian >= bepHarian ? 'Mencakup Operasional' : 'Defisit Operasional'
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Side-by-side Table Comparison */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div className="label-xs" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>TABEL KOMPARASI BEP OPERASIONAL vs BEP INVESTASI</div>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border-color)', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                    <th style={{ padding: '6px 4px' }}>Metrik Target</th>
                    <th style={{ padding: '6px 4px', textAlign: 'right' }}>Operasional</th>
                    <th style={{ padding: '6px 4px', textAlign: 'right' }}>Investasi</th>
                    <th style={{ padding: '6px 4px', textAlign: 'right' }}>Selisih</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { 
                      label: 'Volume Bulanan', 
                      opex: `${bepUnits.toLocaleString('id-ID')} Cup`, 
                      invest: `${(goalSeek.requiredCupMonth || bepUnits).toLocaleString('id-ID')} Cup`,
                      diff: `${(Math.max(0, goalSeek.requiredCupMonth - bepUnits)).toLocaleString('id-ID')} Cup`
                    },
                    { 
                      label: 'Volume Harian', 
                      opex: `${bepHarian} Cup`, 
                      invest: `${goalSeek.requiredCupDay || bepHarian} Cup`,
                      diff: `${Math.max(0, (goalSeek.requiredCupDay || bepHarian) - bepHarian)} Cup`
                    },
                    { 
                      label: 'Omset Bulanan', 
                      opex: fmtRp(bepNominal), 
                      invest: fmtRp(goalSeek.requiredRevMonth || bepNominal),
                      diff: fmtRp(Math.max(0, (goalSeek.requiredRevMonth || bepNominal) - bepNominal))
                    },
                    { 
                      label: 'Omset Harian', 
                      opex: fmtRp(Math.round(bepNominal / operationalDays)), 
                      invest: fmtRp(Math.round((goalSeek.requiredRevMonth || bepNominal) / operationalDays)),
                      diff: fmtRp(Math.max(0, Math.round((goalSeek.requiredRevMonth || bepNominal) / operationalDays) - Math.round(bepNominal / operationalDays)))
                    }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px 4px', color: 'var(--color-text)', fontWeight: 600 }}>{row.label}</td>
                      <td style={{ padding: '8px 4px', textAlign: 'right', className: 'mono' }}>{row.opex}</td>
                      <td style={{ padding: '8px 4px', textAlign: 'right', className: 'mono', color: 'var(--primary)', fontWeight: 600 }}>{row.invest}</td>
                      <td style={{ padding: '8px 4px', textAlign: 'right', className: 'mono', color: '#10b981' }}>+{row.diff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Explanation card */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: 10,
                fontSize: 10,
                color: 'var(--color-text-muted)',
                lineHeight: 1.6,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 6
              }}>
                <Icon name="info" size={13} color="var(--primary)" />
                <div>
                  <strong>Cara Membaca Target BEP Gabungan:</strong><br />
                  1. **Batas Bawah (BEP Operasional)** sebesar **{bepHarian} Cup/Hari** wajib dilewati untuk sekadar menutupi biaya operasional bulanan toko (**{fmtRp(opexVal)}**).<br />
                  2. **Batas Atas (BEP Investasi)** sebesar **{goalSeek.requiredCupDay || bepHarian} Cup/Hari** adalah target optimal agar Anda bisa melunasi modal awal (**{fmtRp(investmentVal)}**) dalam waktu **{targetPaybackMonths} Bulan**.<br />
                  3. Jika penjualan harian Anda berada di antara **{bepHarian} s.d. {goalSeek.requiredCupDay || bepHarian} cup**, maka operasional toko Anda aman (laba operasional positif) tetapi target pengembalian investasi Anda akan mundur dari yang ditargetkan.
                </div>
              </div>
            </div>
          </>
        )}


      </div>
    </div>
  );
}
