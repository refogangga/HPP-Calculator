"use client";

import React, { useState, useMemo } from 'react';
import { Icon } from './Icon';
import FormatInput from './FormatInput';
import { num, fmtRp, roundPrice, getPenyusutanBulanan, mkOpexProfile, getDirectHPP, calculatePlatformMetrics } from '../utils/hpp';
import * as XLSX from 'xlsx';

export default function MenuDatabase({
  menus = [],
  activeId,
  onSelect,
  onAdd,
  onDelete,
  onDuplicate,
  onDeleteBatch,
  opexProfiles = [],
  activeProfileId,
  onSelectProfile,
  onAddProfile,
  onDeleteProfile,
  // Multi-outlet props
  outlets = [],
  activeOutletId,
  onSelectOutlet,
  onAddOutlet,
  onRenameOutlet,
  onDeleteOutlet,
  bepSettings = [],
  onUpdateBepSettings,
  showToast,
  allMenus = [],
  allOpexProfiles = []
}) {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'opex' | 'bep'
  const [selectedFeasibilityOutlet, setSelectedFeasibilityOutlet] = useState(null);
  
  // Outlet form states
  const [showAddOutlet, setShowAddOutlet] = useState(false);
  const [newOutletName, setNewOutletName] = useState('');
  const [copyFromId, setCopyFromId] = useState('');

  // Menu list state
  const categories = ['Semua', 'Minuman', 'Makanan', 'Snack', 'Lainnya'];
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Active Outlet Object
  const activeOutlet = useMemo(() => {
    return outlets.find(o => o.id === activeOutletId) || outlets[0] || null;
  }, [outlets, activeOutletId]);

  // Feasibility calculation for selected outlet
  const feasibilityData = useMemo(() => {
    if (!selectedFeasibilityOutlet) return null;
    const outletId = selectedFeasibilityOutlet.id;
    
    const oMenus = (allMenus || []).filter(m => m.outletId === outletId);
    const oProfiles = (allOpexProfiles || []).filter(p => p.outletId === outletId);
    const oSettings = (bepSettings || []).find(b => b.outletId === outletId) || {};
    
    const profile = oProfiles[0] || null;
    
    const sOperationalDays = oSettings.operationalDays ?? 30;
    const sManualOpex = oSettings.manualOpex ?? null;
    const sManualMargin = oSettings.manualMargin ?? null;
    const sManualPrice = oSettings.manualPrice ?? null;
    const sActualVolume = oSettings.actualVolume ?? null;
    const sManualInvestment = oSettings.manualInvestment ?? null;
    const sTargetPaybackMonths = oSettings.targetPaybackMonths ?? 12;
    
    const expenses = profile ? (profile.expenses || []).reduce((sum, exp) => sum + num(exp.value), 0) : 0;
    const assetDepr = profile ? getPenyusutanBulanan(profile) : 0;
    const calculatedOpex = expenses + assetDepr;
    
    const opexVal = sManualOpex !== null ? num(sManualOpex) : calculatedOpex;
    
    const selMenus = profile ? oMenus.filter(m => profile.selectedMenuIds?.includes(m.id)) : [];
    const actMenus = profile ? selMenus.filter(m => !profile.disabledMenuIds?.includes(m.id)) : [];
    
    const getPlatformCalcLocal = (menu) => {
      let hj = 0;
      if (profile && profile.menuPrices && profile.menuPrices[menu.id] !== undefined) {
        hj = profile.menuPrices[menu.id];
      } else {
        const hpp = getDirectHPP(menu);
        hj = roundPrice(menu.margin >= 100 ? 0 : hpp / (1 - menu.margin / 100));
      }
      return calculatePlatformMetrics(menu, hj);
    };

    let totalVolume = 0;
    let weightedNetProfitSum = 0;
    let weightedPriceSum = 0;
    let weightedHppSum = 0;
    let weightedPlatformCutSum = 0;

    actMenus.forEach(m => {
      let vol = 0;
      if (profile && profile.menuVolumes && profile.menuVolumes[m.id] !== undefined) {
        vol = num(profile.menuVolumes[m.id]);
      } else {
        vol = num(m.ops?.estimasiCup);
      }
      
      const pc = getPlatformCalcLocal(m);
      totalVolume += vol;
      weightedNetProfitSum += vol * pc.netProfit;
      weightedPriceSum += vol * pc.hargaJual;
      weightedHppSum += vol * pc.hpp;
      weightedPlatformCutSum += vol * pc.totalKomisi;
    });

    const avgNetProfit = totalVolume > 0 ? weightedNetProfitSum / totalVolume : 0;
    const avgPrice = totalVolume > 0 ? weightedPriceSum / totalVolume : 0;
    const avgHpp = totalVolume > 0 ? weightedHppSum / totalVolume : 0;
    const avgPlatformCut = totalVolume > 0 ? weightedPlatformCutSum / totalVolume : 0;

    const netProfitPerCup = sManualMargin !== null ? num(sManualMargin) : avgNetProfit;
    const avgPriceVal = sManualPrice !== null ? num(sManualPrice) : avgPrice;
    const volumeVal = sActualVolume !== null ? num(sActualVolume) : (totalVolume || 600);
    
    const calculatedInvestment = profile ? (profile.assets || []).reduce((sum, asset) => sum + num(asset.harga), 0) : 0;
    const investmentVal = sManualInvestment !== null ? num(sManualInvestment) : calculatedInvestment;

    const bepUnits = netProfitPerCup > 0 ? Math.ceil(opexVal / netProfitPerCup) : 0;
    const bepHarian = sOperationalDays > 0 ? Math.ceil(bepUnits / sOperationalDays) : 0;
    const bepNominal = bepUnits * avgPriceVal;

    const monthlyNetProfit = (volumeVal * netProfitPerCup) - opexVal;
    const paybackPeriodMonths = (monthlyNetProfit > 0 && investmentVal > 0) ? (investmentVal / monthlyNetProfit) : 0;

    let paybackText = "N/A";
    if (monthlyNetProfit <= 0) {
      paybackText = "Tidak pernah balik modal (bisnis merugi/impas).";
    } else if (investmentVal <= 0) {
      paybackText = "0 Bulan (Tanpa modal awal).";
    } else {
      const totalMonths = Math.ceil(paybackPeriodMonths);
      const years = Math.floor(totalMonths / 12);
      const remainingMonths = totalMonths % 12;
      let timeStr = "";
      if (years > 0) timeStr += `${years} Tahun `;
      if (remainingMonths > 0 || years === 0) timeStr += `${remainingMonths} Bulan`;
      paybackText = timeStr;
    }

    const requiredMonthlyProfit = sTargetPaybackMonths > 0 ? investmentVal / sTargetPaybackMonths : 0;
    const requiredMonthlyGrossProfit = requiredMonthlyProfit + opexVal;
    const requiredCupMonth = netProfitPerCup > 0 ? Math.ceil(requiredMonthlyGrossProfit / netProfitPerCup) : 0;
    const requiredCupDay = sOperationalDays > 0 ? Math.ceil(requiredCupMonth / sOperationalDays) : 0;
    const requiredRevMonth = requiredCupMonth * avgPriceVal;
    const requiredRevDay = sOperationalDays > 0 ? Math.round(requiredRevMonth / sOperationalDays) : 0;

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
    } else if (paybackPeriodMonths > sTargetPaybackMonths) {
      recStatusText = 'RAWAN (TARGET MELESET)';
      recStatusColor = '#f59e0b'; // Amber
      recStatusBg = 'rgba(245, 158, 11, 0.08)';
      recStatusBorder = 'rgba(245, 158, 11, 0.2)';
      recStatusDesc = `Toko mencetak profit bersih ${fmtRp(monthlyNetProfit)}/bln, namun modal awal baru akan kembali dalam ${paybackText}. Target balik modal ${sTargetPaybackMonths} bulan meleset.`;
    } else {
      recStatusDesc = `Toko sangat profitabel! Profit bersih ${fmtRp(monthlyNetProfit)}/bln sanggup mengembalikan modal awal dalam ${paybackText}, lebih cepat dari target (${sTargetPaybackMonths} bulan).`;
    }

    const activeMenusInfo = actMenus.map(m => {
      const pc = getPlatformCalcLocal(m);
      let vol = 0;
      if (profile && profile.menuVolumes && profile.menuVolumes[m.id] !== undefined) {
        vol = num(profile.menuVolumes[m.id]);
      } else {
        vol = num(m.ops?.estimasiCup);
      }
      return {
        id: m.id,
        name: m.name,
        emoji: m.emoji || '☕',
        hpp: pc.hpp,
        price: pc.hargaJual,
        margin: pc.netProfit,
        marginPct: pc.hargaJual > 0 ? (pc.netProfit / pc.hargaJual) * 100 : 0,
        volume: vol
      };
    });

    return {
      bepUnits,
      bepHarian,
      bepNominal,
      opexVal,
      netProfitPerCup,
      avgPriceVal,
      volumeVal,
      investmentVal,
      monthlyNetProfit,
      paybackPeriodMonths,
      paybackText,
      avgHpp,
      avgPlatformCut,
      requiredCupDay,
      requiredRevMonth,
      requiredRevDay,
      recStatusText,
      recStatusColor,
      recStatusBg,
      recStatusBorder,
      recStatusDesc,
      operationalDays: sOperationalDays,
      targetPaybackMonths: sTargetPaybackMonths,
      totalExpenses: expenses,
      totalAssetDepreciation: assetDepr,
      totalAssetsValue: calculatedInvestment,
      activeMenusInfo
    };
  }, [selectedFeasibilityOutlet, allMenus, allOpexProfiles, bepSettings]);

  const handleCopyReport = () => {
    if (!feasibilityData || !selectedFeasibilityOutlet) return;
    const { avgHpp, avgPriceVal, netProfitPerCup, avgPlatformCut, recStatusText, recStatusDesc, monthlyNetProfit, investmentVal, paybackText, targetPaybackMonths } = feasibilityData;
    
    const rec40 = avgHpp / (1 - 0.4);
    const rec50 = avgHpp / (1 - 0.5);
    const rec60 = avgHpp / (1 - 0.6);
    
    const reportText = `=== LAPORAN REKOMENDASI & ANALISIS KELAYAKAN BEP ===
Cabang/Outlet: ${selectedFeasibilityOutlet.name}
Tanggal Laporan: ${new Date().toLocaleDateString('id-ID')}

1. STATUS KELAYAKAN INVESTASI: ${recStatusText}
   - ${recStatusDesc}
   - Estimasi Profit Bersih Bulanan: ${fmtRp(monthlyNetProfit)}
   - Total Modal Awal: ${fmtRp(investmentVal)}
   - Waktu Balik Modal Riil: ${paybackText}

2. UNIT ECONOMICS (RATA-RATA PER CUP):
   - Rata-rata Harga Jual: ${fmtRp(avgPriceVal)}
   - Rata-rata Direct HPP (Bahan + Kemasan): ${fmtRp(avgHpp)}
   - Komisi Platform Online: ${fmtRp(avgPlatformCut)} (${avgPriceVal > 0 ? ((avgPlatformCut / avgPriceVal) * 100).toFixed(1) : 0}%)
   - Margin Bersih per Cup: ${fmtRp(netProfitPerCup)} (${avgPriceVal > 0 ? ((netProfitPerCup / avgPriceVal) * 100).toFixed(1) : 0}%)

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

  // Feasibility calculation for active outlet
  const activeOutletFeasibilityData = useMemo(() => {
    if (!activeOutlet) return null;
    const outletId = activeOutlet.id;
    
    const oMenus = (allMenus || []).filter(m => m.outletId === outletId);
    const oProfiles = (allOpexProfiles || []).filter(p => p.outletId === outletId);
    const oSettings = (bepSettings || []).find(b => b.outletId === outletId) || {};
    
    const profile = oProfiles[0] || null;
    
    const sOperationalDays = oSettings.operationalDays ?? 30;
    const sManualOpex = oSettings.manualOpex ?? null;
    const sManualMargin = oSettings.manualMargin ?? null;
    const sManualPrice = oSettings.manualPrice ?? null;
    const sActualVolume = oSettings.actualVolume ?? null;
    const sManualInvestment = oSettings.manualInvestment ?? null;
    const sTargetPaybackMonths = oSettings.targetPaybackMonths ?? 12;
    
    const expenses = profile ? (profile.expenses || []).reduce((sum, exp) => sum + num(exp.value), 0) : 0;
    const assetDepr = profile ? getPenyusutanBulanan(profile) : 0;
    const calculatedOpex = expenses + assetDepr;
    
    const opexVal = sManualOpex !== null ? num(sManualOpex) : calculatedOpex;
    
    const selMenus = profile ? oMenus.filter(m => profile.selectedMenuIds?.includes(m.id)) : [];
    const actMenus = profile ? selMenus.filter(m => !profile.disabledMenuIds?.includes(m.id)) : [];
    
    const getPlatformCalcLocal = (menu) => {
      let hj = 0;
      if (profile && profile.menuPrices && profile.menuPrices[menu.id] !== undefined) {
        hj = profile.menuPrices[menu.id];
      } else {
        const hpp = getDirectHPP(menu);
        hj = roundPrice(menu.margin >= 100 ? 0 : hpp / (1 - menu.margin / 100));
      }
      return calculatePlatformMetrics(menu, hj);
    };

    let totalVolume = 0;
    let weightedNetProfitSum = 0;
    let weightedPriceSum = 0;
    let weightedHppSum = 0;
    let weightedPlatformCutSum = 0;

    actMenus.forEach(m => {
      let vol = 0;
      if (profile && profile.menuVolumes && profile.menuVolumes[m.id] !== undefined) {
        vol = num(profile.menuVolumes[m.id]);
      } else {
        vol = num(m.ops?.estimasiCup);
      }
      
      const pc = getPlatformCalcLocal(m);
      totalVolume += vol;
      weightedNetProfitSum += vol * pc.netProfit;
      weightedPriceSum += vol * pc.hargaJual;
      weightedHppSum += vol * pc.hpp;
      weightedPlatformCutSum += vol * pc.totalKomisi;
    });

    const avgNetProfit = totalVolume > 0 ? weightedNetProfitSum / totalVolume : 0;
    const avgPrice = totalVolume > 0 ? weightedPriceSum / totalVolume : 0;
    const avgHpp = totalVolume > 0 ? weightedHppSum / totalVolume : 0;
    const avgPlatformCut = totalVolume > 0 ? weightedPlatformCutSum / totalVolume : 0;

    const netProfitPerCup = sManualMargin !== null ? num(sManualMargin) : avgNetProfit;
    const avgPriceVal = sManualPrice !== null ? num(sManualPrice) : avgPrice;
    const volumeVal = sActualVolume !== null ? num(sActualVolume) : (totalVolume || 600);
    
    const calculatedInvestment = profile ? (profile.assets || []).reduce((sum, asset) => sum + num(asset.harga), 0) : 0;
    const investmentVal = sManualInvestment !== null ? num(sManualInvestment) : calculatedInvestment;

    const bepUnits = netProfitPerCup > 0 ? Math.ceil(opexVal / netProfitPerCup) : 0;
    const bepHarian = sOperationalDays > 0 ? Math.ceil(bepUnits / sOperationalDays) : 0;
    const bepNominal = bepUnits * avgPriceVal;

    const monthlyNetProfit = (volumeVal * netProfitPerCup) - opexVal;
    const paybackPeriodMonths = (monthlyNetProfit > 0 && investmentVal > 0) ? (investmentVal / monthlyNetProfit) : 0;

    let paybackText = "N/A";
    if (monthlyNetProfit <= 0) {
      paybackText = "Tidak pernah balik modal (bisnis merugi/impas).";
    } else if (investmentVal <= 0) {
      paybackText = "0 Bulan (Tanpa modal awal).";
    } else {
      const totalMonths = Math.ceil(paybackPeriodMonths);
      const years = Math.floor(totalMonths / 12);
      const remainingMonths = totalMonths % 12;
      let timeStr = "";
      if (years > 0) timeStr += `${years} Tahun `;
      if (remainingMonths > 0 || years === 0) timeStr += `${remainingMonths} Bulan`;
      paybackText = timeStr;
    }

    const requiredMonthlyProfit = sTargetPaybackMonths > 0 ? investmentVal / sTargetPaybackMonths : 0;
    const requiredMonthlyGrossProfit = requiredMonthlyProfit + opexVal;
    const requiredCupMonth = netProfitPerCup > 0 ? Math.ceil(requiredMonthlyGrossProfit / netProfitPerCup) : 0;
    const requiredCupDay = sOperationalDays > 0 ? Math.ceil(requiredCupMonth / sOperationalDays) : 0;
    const requiredRevMonth = requiredCupMonth * avgPriceVal;
    const requiredRevDay = sOperationalDays > 0 ? Math.round(requiredRevMonth / sOperationalDays) : 0;

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
    } else if (paybackPeriodMonths > sTargetPaybackMonths) {
      recStatusText = 'RAWAN (TARGET MELESET)';
      recStatusColor = '#f59e0b'; // Amber
      recStatusBg = 'rgba(245, 158, 11, 0.08)';
      recStatusBorder = 'rgba(245, 158, 11, 0.2)';
      recStatusDesc = `Toko mencetak profit bersih ${fmtRp(monthlyNetProfit)}/bln, namun modal awal baru akan kembali dalam ${paybackText}. Target balik modal ${sTargetPaybackMonths} bulan meleset.`;
    } else {
      recStatusDesc = `Toko sangat profitabel! Profit bersih ${fmtRp(monthlyNetProfit)}/bln sanggup mengembalikan modal awal dalam ${paybackText}, lebih cepat dari target (${sTargetPaybackMonths} bulan).`;
    }

    const activeMenusInfo = actMenus.map(m => {
      const pc = getPlatformCalcLocal(m);
      let vol = 0;
      if (profile && profile.menuVolumes && profile.menuVolumes[m.id] !== undefined) {
        vol = num(profile.menuVolumes[m.id]);
      } else {
        vol = num(m.ops?.estimasiCup);
      }
      return {
        id: m.id,
        name: m.name,
        emoji: m.emoji || '☕',
        hpp: pc.hpp,
        price: pc.hargaJual,
        margin: pc.netProfit,
        marginPct: pc.hargaJual > 0 ? (pc.netProfit / pc.hargaJual) * 100 : 0,
        volume: vol
      };
    });

    return {
      bepUnits,
      bepHarian,
      bepNominal,
      opexVal,
      netProfitPerCup,
      avgPriceVal,
      volumeVal,
      investmentVal,
      monthlyNetProfit,
      paybackPeriodMonths,
      paybackText,
      avgHpp,
      avgPlatformCut,
      requiredCupDay,
      requiredRevMonth,
      requiredRevDay,
      recStatusText,
      recStatusColor,
      recStatusBg,
      recStatusBorder,
      recStatusDesc,
      operationalDays: sOperationalDays,
      targetPaybackMonths: sTargetPaybackMonths,
      totalExpenses: expenses,
      totalAssetDepreciation: assetDepr,
      totalAssetsValue: calculatedInvestment,
      activeMenusInfo,
      calculatedOpex,
      calculatedMarginPerCup: avgNetProfit,
      calculatedPricePerCup: avgPrice
    };
  }, [activeOutlet, allMenus, allOpexProfiles, bepSettings]);

  // Retrieve current outlet's BEP settings
  const currentBep = useMemo(() => {
    return bepSettings.find(b => b.outletId === activeOutletId) || {
      outletId: activeOutletId,
      operationalDays: 30,
      manualOpex: null,
      manualMargin: null,
      manualPrice: null,
      actualVolume: null,
      manualInvestment: null,
      targetPaybackMonths: 12
    };
  }, [bepSettings, activeOutletId]);

  // Filtered Menu Items
  const filtered = useMemo(() => {
    return menus.filter(m => {
      const matchCat = filter === 'Semua' || m.category === filter;
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menus, filter, search]);

  const getHPP = (menu) => {
    const bb = menu.ingredients.reduce((s, i) => {
      if (!num(i.ukuranKemasan)) return s;
      return s + (num(i.hargaBeli) / num(i.ukuranKemasan)) * num(i.takaranPerCup);
    }, 0);
    const km = menu.packaging.filter(p => p.enabled).reduce((s, p) => s + (num(p.harga) * num(p.usage !== undefined ? p.usage : 1)), 0);
    const hpp = bb + km;
    const hargaJual = menu.margin >= 100 ? 0 : hpp / (1 - menu.margin / 100);
    return { hpp, hargaJual: roundPrice(hargaJual) };
  };

  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAllToggle = (checked) => {
    if (checked) {
      const currentFilteredIds = filtered.map(m => m.id);
      const combined = [...new Set([...selectedIds, ...currentFilteredIds])];
      setSelectedIds(combined);
    } else {
      const currentFilteredIds = filtered.map(m => m.id);
      setSelectedIds(selectedIds.filter(id => !currentFilteredIds.includes(id)));
    }
  };

  const handleBatchDelete = () => {
    if (onDeleteBatch && selectedIds.length > 0) {
      onDeleteBatch(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleExportExcel = () => {
    const selectedMenus = menus.filter(m => selectedIds.includes(m.id));
    if (selectedMenus.length === 0) return;

    const summaryData = selectedMenus.map(m => {
      const targetUnit = m.targetUnit || 'cup';
      const pcsPerPortion = m.pcsPerPortion || 1;
      const subUnitLabel = m.subUnitLabel || 'pcs';

      const bb = m.ingredients.reduce((s, i) => num(i.ukuranKemasan) ? s + (num(i.hargaBeli) / num(i.ukuranKemasan)) * num(i.takaranPerCup) : s, 0);
      const km = m.packaging.filter(p => p.enabled).reduce((s, p) => s + (num(p.harga) * num(p.usage !== undefined ? p.usage : 1)), 0);
      const hpp = bb + km;
      const hargaJual = m.margin >= 100 ? 0 : hpp / (1 - m.margin / 100);
      const hargaJualBulat = roundPrice(hargaJual);
      const profit = hargaJualBulat - hpp;

      return {
        'Nama Menu': m.name,
        'Kategori': m.category,
        'Target Margin': m.margin + '%',
        'Satuan Utama': targetUnit,
        'HPP Bahan Baku (per Satuan Utama)': bb,
        'HPP Kemasan (per Satuan Utama)': km,
        'Total HPP (per Satuan Utama)': hpp,
        'Rekomendasi Harga Jual (Satuan Utama)': hargaJualBulat,
        'Profit per Satuan Utama': profit,
        'Rasio Bagi Porsi': pcsPerPortion,
        'Satuan Kecil': pcsPerPortion > 1 ? subUnitLabel : '-',
        'HPP per Satuan Kecil': pcsPerPortion > 1 ? (hpp / pcsPerPortion) : '-',
        'Harga Jual per Satuan Kecil': pcsPerPortion > 1 ? roundPrice(hargaJual / pcsPerPortion) : '-',
        'Estimasi Penjualan (Porsi Utama/bln)': num(m.ops.estimasiCup),
        'Estimasi Profit Bulanan': profit * num(m.ops.estimasiCup)
      };
    });

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan HPP");

    selectedMenus.forEach(m => {
      const details = [];
      details.push({ A: `LAPORAN DETAIL HPP: ${m.name.toUpperCase()}` });
      details.push({ A: `Outlet: ${activeOutlet?.name || 'N/A'}` });
      details.push({ A: `Kategori: ${m.category}` });
      details.push({ A: `Target Margin: ${m.margin}%` });
      details.push({});

      details.push({ A: '1. BIAYA BAHAN BAKU' });
      details.push({ A: 'Nama Bahan', B: 'Harga Beli', C: 'Kemasan', D: 'Satuan', E: 'Takaran/Cup', F: 'HPP/Cup' });
      m.ingredients.forEach(i => {
        const perUnit = num(i.ukuranKemasan) ? num(i.hargaBeli) / num(i.ukuranKemasan) : 0;
        details.push({
          A: i.name,
          B: num(i.hargaBeli),
          C: num(i.ukuranKemasan),
          D: i.unit,
          E: num(i.takaranPerCup),
          F: perUnit * num(i.takaranPerCup)
        });
      });
      const bbTotal = m.ingredients.reduce((s, i) => num(i.ukuranKemasan) ? s + (num(i.hargaBeli) / num(i.ukuranKemasan)) * num(i.takaranPerCup) : s, 0);
      details.push({ A: 'Sub-total Bahan Baku', F: bbTotal });
      details.push({});

      details.push({ A: '2. BIAYA KEMASAN' });
      details.push({ A: 'Nama Item', B: 'Harga Satuan', C: 'Pemakaian', D: 'Satuan', E: '', F: 'HPP/Cup' });
      m.packaging.filter(p => p.enabled).forEach(p => {
        details.push({
          A: p.name,
          B: num(p.harga),
          C: num(p.usage !== undefined ? p.usage : 1),
          D: p.unit || 'pcs',
          E: '',
          F: num(p.harga) * num(p.usage !== undefined ? p.usage : 1)
        });
      });
      const kmTotal = m.packaging.filter(p => p.enabled).reduce((s, p) => s + (num(p.harga) * num(p.usage !== undefined ? p.usage : 1)), 0);
      details.push({ A: 'Sub-total Kemasan', F: kmTotal });
      details.push({});

      const totalHPP = bbTotal + kmTotal;
      const hj = m.margin >= 100 ? 0 : totalHPP / (1 - m.margin / 100);
      const hjb = roundPrice(hj);
      const profit = hjb - totalHPP;
      const targetUnit = m.targetUnit || 'cup';
      const pcsPerPortion = m.pcsPerPortion || 1;
      const subUnitLabel = m.subUnitLabel || 'pcs';

      details.push({ A: 'RINGKASAN AKHIR' });
      details.push({ A: `TOTAL HPP per ${targetUnit}`, F: totalHPP });
      details.push({ A: `Harga Jual per ${targetUnit}`, F: hjb });
      details.push({ A: `Profit per ${targetUnit}`, F: profit });
      
      if (pcsPerPortion > 1) {
        details.push({ A: `Bagi Porsi: 1 ${targetUnit} = ${pcsPerPortion} ${subUnitLabel}` });
        details.push({ A: `TOTAL HPP per ${subUnitLabel}`, F: totalHPP / pcsPerPortion });
        details.push({ A: `Harga Jual per ${subUnitLabel}`, F: roundPrice(hj / pcsPerPortion) });
        details.push({ A: `Profit per ${subUnitLabel}`, F: roundPrice(hj / pcsPerPortion) - (totalHPP / pcsPerPortion) });
      }
      
      details.push({ A: 'Estimasi Profit Bulanan', F: profit * num(m.ops.estimasiCup) });

      const wsDetail = XLSX.utils.json_to_sheet(details, { skipHeader: true });
      const sheetName = m.name.replace(/[\\\/?*:[\]]/g, '').substring(0, 30) || `Detail_${m.id}`;
      XLSX.utils.book_append_sheet(wb, wsDetail, sheetName);
    });

    const outletLabel = (activeOutlet?.name || 'Cabang').replace(/\s+/g, '_');
    XLSX.writeFile(wb, `Laporan_HPP_FNB_${outletLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleBatchPrint = () => {
    const selectedMenus = menus.filter(m => selectedIds.includes(m.id));
    if (selectedMenus.length === 0) return;

    const w = window.open('', '_blank');
    if (!w) return;

    const bodies = selectedMenus.map((m, idx) => {
      const lines = m.ingredients.map(ing => {
        const perUnit = num(ing.ukuranKemasan) ? num(ing.hargaBeli) / num(ing.ukuranKemasan) : 0;
        return `  ${(ing.name || '-').padEnd(22)} ${fmtRp(perUnit * num(ing.takaranPerCup))}`;
      }).join('\n');
      const pkgLines = m.packaging.filter(p => p.enabled).map(p => `  ${p.name.padEnd(22)} ${fmtRp(p.harga)}`).join('\n');

      const bb = m.ingredients.reduce((s, i) => num(i.ukuranKemasan) ? s + (num(i.hargaBeli) / num(i.ukuranKemasan)) * num(i.takaranPerCup) : s, 0);
      const km = m.packaging.filter(p => p.enabled).reduce((s, p) => s + (num(p.harga) * num(p.usage !== undefined ? p.usage : 1)), 0);
      const targetUnit = m.targetUnit || 'cup';
      const pcsPerPortion = m.pcsPerPortion || 1;
      const subUnitLabel = m.subUnitLabel || 'pcs';

      const hpp = bb + km;
      const hj = m.margin >= 100 ? 0 : hpp / (1 - m.margin / 100);
      const hjb = roundPrice(hj);

      let finalPortionLines = `
  TOTAL HPP / ${targetUnit.toUpperCase().padEnd(16)}: ${fmtRp(hpp)}
  Target Margin                : ${m.margin}%
  HARGA JUAL / ${targetUnit.toUpperCase().padEnd(16)}: ${fmtRp(hjb)}
  Profit per ${targetUnit.padEnd(18)}: ${fmtRp(hjb - hpp)}
  Estimasi Profit Bulanan      : ${fmtRp((hjb - hpp) * num(m.ops.estimasiCup))}`;

      if (pcsPerPortion > 1) {
        const hppPcs = hpp / pcsPerPortion;
        const hjbPcs = roundPrice(hj / pcsPerPortion);
        finalPortionLines += `
  ────────────────────────────────────────────
  1 ${targetUnit} = ${pcsPerPortion} ${subUnitLabel}
  TOTAL HPP / ${subUnitLabel.toUpperCase().padEnd(16)}: ${fmtRp(hppPcs)}
  HARGA JUAL / ${subUnitLabel.toUpperCase().padEnd(16)}: ${fmtRp(hjbPcs)}
  Profit per ${subUnitLabel.padEnd(18)}: ${fmtRp(hjbPcs - hppPcs)}`;
      }

      return `
<div style="page-break-after: ${idx < selectedMenus.length - 1 ? 'always' : 'avoid'}; font-family: monospace; font-size: 13px; line-height: 1.8; margin-bottom: 40px; padding: 20px;">
  <pre>
  ╔══════════════════════════════════════════╗
  ║         LAPORAN HPP F&B                  ║
  ║         ${(m.emoji + ' ' + m.name).padEnd(38)}║
  ╚══════════════════════════════════════════╝
  Outlet   : ${activeOutlet?.name || 'N/A'}
  Kategori : ${m.category}
  Tanggal  : ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
 
  ──── BAHAN BAKU ─────────────────────────────
${lines}
  Sub-total Bahan Baku         : ${fmtRp(bb)}
 
  ──── KEMASAN ────────────────────────────────
${pkgLines}
  Sub-total Kemasan            : ${fmtRp(km)}
 
  ════════════════════════════════════════════
${finalPortionLines.trim()}
  ════════════════════════════════════════════
  </pre>
</div>`;
    }).join('');

    w.document.write(`<html><head><title>Cetak Resep HPP</title></head><body onload="window.print()">${bodies}</body></html>`);
    w.document.close();
  };

  const handleAddOutletSubmit = (e) => {
    e.preventDefault();
    if (!newOutletName.trim()) return;
    onAddOutlet && onAddOutlet(newOutletName.trim(), copyFromId || null);
    setNewOutletName('');
    setCopyFromId('');
    setShowAddOutlet(false);
  };

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* ═══ OUTLET MANAGEMENT HEADER ═════════════════════════ */}
      <div className="section-card" style={{ padding: '20px 24px' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ margin: 0, fontWeight: 850, fontSize: 20, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="store" size={22} color="var(--primary)" /> Outlet &amp; Manajemen Data
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>
              Kelola cabang bisnis/outlet Anda serta pisahkan data Menu, OPEX, dan BEP masing-masing cabang.
            </p>
          </div>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddOutlet(!showAddOutlet)}
            style={{ borderRadius: 8 }}
          >
            <Icon name="plus" size={14} /> Tambah Cabang Baru
          </button>
        </div>

        {/* Inline Add Outlet Form */}
        {showAddOutlet && (
          <form onSubmit={handleAddOutletSubmit} style={{
            marginTop: 18, 
            padding: 16, 
            background: 'var(--bg-app)', 
            border: '1px solid var(--border-color)', 
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Registrasi Cabang / Usaha Baru</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: 4 }}>Nama Cabang / Toko</label>
                <input 
                  type="text" 
                  className="hpp-input" 
                  placeholder="Contoh: Cabang Kopo, Toko Kedua"
                  value={newOutletName}
                  onChange={e => setNewOutletName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: 4 }}>Salin Data Dari Cabang Lain (Resep &amp; OPEX)</label>
                <select 
                  className="hpp-input"
                  value={copyFromId}
                  onChange={e => setCopyFromId(e.target.value)}
                  style={{ fontWeight: 600 }}
                >
                  <option value="">-- Mulai dari Kosong --</option>
                  {outlets.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddOutlet(false)}>Batal</button>
              <button type="submit" className="btn btn-primary btn-sm">Simpan Cabang</button>
            </div>
          </form>
        )}

        {/* Grid of Outlets */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 12,
          marginTop: 16
        }}>
          {outlets.map(o => {
            const isSelected = o.id === activeOutletId;
            return (
              <div 
                key={o.id}
                onClick={() => onSelectOutlet && onSelectOutlet(o.id)}
                style={{
                  border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                  background: isSelected ? 'rgba(0, 102, 204, 0.03)' : 'var(--bg-card)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="store" size={14} color={isSelected ? 'var(--primary)' : 'var(--color-text-muted)'} />
                  <div>
                    <span style={{ fontSize: 13, fontWeight: isSelected ? 800 : 600, color: 'var(--color-text)' }}>
                      {o.name}
                    </span>
                    {isSelected && (
                      <div style={{ fontSize: 8, color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.02em', marginTop: 1 }}>
                        AKTIF
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                  {/* Feasibility Summary Button */}
                  <button 
                    onClick={() => setSelectedFeasibilityOutlet(o)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--primary)' }}
                    title="Ringkasan Kelayakan Cabang"
                  >
                    <Icon name="activity" size={11} />
                  </button>
                  {/* Rename */}
                  <button 
                    onClick={() => {
                      const nn = prompt("Ubah nama cabang:", o.name);
                      if (nn && nn.trim()) onRenameOutlet && onRenameOutlet(o.id, nn.trim());
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-muted)' }}
                    title="Ubah nama"
                  >
                    <Icon name="edit" size={11} />
                  </button>
                  {/* Delete */}
                  {outlets.length > 1 && (
                    <button 
                      onClick={() => {
                        if (confirm(`Hapus cabang "${o.name}"? PERHATIAN: Semua data Menu, OPEX, dan BEP cabang ini akan terhapus permanen!`)) {
                          onDeleteOutlet && onDeleteOutlet(o.id);
                        }
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--danger)' }}
                      title="Hapus cabang"
                    >
                      <Icon name="trash" size={11} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ THREE-TAB SECTION BAR ════════════════════════════ */}
      <div style={{ display: 'flex', gap: 2, background: '#f4f4f5', padding: 4, borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', marginBottom: 8 }}>
        {[
          { id: 'menu', label: 'Database Resep Menu', icon: 'coffee', count: menus.length },
          { id: 'opex', label: 'Database Profil OPEX', icon: 'zap', count: opexProfiles.length },
          { id: 'bep', label: 'Database & Parameter BEP', icon: 'calendar', count: null },
          { id: 'rekomendasi', label: 'Rekomendasi & Kelayakan', icon: 'activity', count: null }
        ].map(t => {
          const isAct = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'calc(var(--radius) - 2px)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 12,
                background: isAct ? 'var(--bg-card)' : 'transparent',
                color: isAct ? 'var(--color-text)' : 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: isAct ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <Icon name={t.icon} size={12} color={isAct ? 'var(--primary)' : 'var(--color-text-muted)'} />
              <span>{t.label}</span>
              {t.count !== null && (
                <span className="badge badge-slate" style={{ fontSize: 9, padding: '2px 6px', borderRadius: 10, background: isAct ? '#f4f4f5' : 'rgba(0,0,0,0.05)', color: 'var(--color-text-muted)' }}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══ TAB CONTENT ══════════════════════════════════════ */}
      
      {/* ──────────────── TAB 1: MENU ──────────────── */}
      {activeTab === 'menu' && (
        <div className="section-card">
          <div className="section-body" style={{ padding: 22 }}>
            <div className="flex-between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {categories.map(c => (
                  <button
                    key={c}
                    className={`btn btn-sm ${filter === c ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setFilter(c)}
                    style={{ borderRadius: 6 }}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <input
                type="text"
                className="hpp-input sm"
                placeholder="Cari nama menu..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ maxWidth: 240, height: 'auto', padding: '6px 12px' }}
              />
            </div>

            {/* Bulk actions */}
            {selectedIds.length > 0 && (
              <div style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                padding: '10px 16px',
                borderRadius: 8,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)' }}>
                  {selectedIds.length} resep menu terpilih
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm" onClick={handleBatchPrint} style={{ borderRadius: 6 }}>
                    <Icon name="print" size={12} /> Cetak Masal
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={handleExportExcel} style={{ borderRadius: 6 }}>
                    <Icon name="save" size={12} /> Ekspor Excel
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={handleBatchDelete} style={{ borderRadius: 6 }}>
                    <Icon name="trash" size={12} /> Hapus Terpilih
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 12 }}>
              <table className="db-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '12px 16px', width: 40 }}>
                      <input
                        type="checkbox"
                        checked={filtered.length > 0 && filtered.every(m => selectedIds.includes(m.id))}
                        onChange={e => handleSelectAllToggle(e.target.checked)}
                      />
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: 'var(--color-text-muted)' }}>MENU</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: 'var(--color-text-muted)' }}>KATEGORI</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: 'var(--color-text-muted)' }}>BAHAN / KEMASAN</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: 'var(--color-text-muted)' }}>TOTAL HPP</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: 'var(--color-text-muted)' }}>REKOMENDASI HARGA</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: 'var(--color-text-muted)', textAlign: 'right' }}>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--color-text-muted)', fontSize: 12 }}>
                        Tidak ada resep menu terdaftar pada cabang ini.
                      </td>
                    </tr>
                  ) : (
                    filtered.map(m => {
                      const { hpp, hargaJual } = getHPP(m);
                      const isSelected = selectedIds.includes(m.id);
                      return (
                        <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)', background: isSelected ? 'rgba(0, 102, 204, 0.01)' : 'transparent' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(m.id)}
                            />
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 18 }}><Icon name={m.emoji || 'coffee'} size={18} /></span>
                              <div>
                                <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-text)' }}>{m.name}</span>
                                <div style={{ fontSize: 9, color: 'var(--color-text-muted)', marginTop: 2 }}>
                                  Target Margin: {m.margin}%
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className="badge badge-slate" style={{ fontSize: 10 }}>{m.category}</span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 11, color: 'var(--color-text-muted)' }}>
                            {m.ingredients.length} bhn baku &bull; {m.packaging.filter(x => x.enabled).length} kemasan
                          </td>
                          <td className="mono" style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--color-text)' }}>
                            {fmtRp(hpp)}
                          </td>
                          <td className="mono" style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#10b981' }}>
                            {fmtRp(hargaJual)}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => onSelect(m.id)} style={{ padding: '4px 8px', fontSize: 11, fontWeight: 700 }}>
                                Buka
                              </button>
                              <button className="btn btn-ghost btn-sm" onClick={() => onDuplicate(m.id)} style={{ padding: '4px 6px' }} title="Duplikasi">
                                <Icon name="copy" size={11} />
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => onDelete(m.id)} style={{ padding: '4px 6px' }} title="Hapus">
                                <Icon name="trash" size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 2: OPEX PROFILES ──────────────── */}
      {activeTab === 'opex' && (
        <div className="section-card" style={{ padding: 22 }}>
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <div>
              <h2 style={{ margin: 0, fontWeight: 800, fontSize: 16, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="store" size={18} color="var(--primary)" /> Profil OPEX Terdaftar
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--color-text-muted)' }}>
                {opexProfiles.length} profil pos operasional dan pengeluaran tetap cabang ini.
              </p>
            </div>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => onAddProfile && onAddProfile(mkOpexProfile({ name: 'Profil ' + (opexProfiles.length + 1) }))}
            >
              <Icon name="plus" size={14} /> Tambah Profil OPEX
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {opexProfiles.length === 0 ? (
              <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px 16px', color: 'var(--color-text-muted)', fontSize: 12 }}>
                Belum ada profil OPEX terdaftar. Tambahkan untuk mensimulasikan biaya operasional.
              </div>
            ) : (
              opexProfiles.map(p => {
                const monthlyDepreciation = p.usePenyusutan ? p.assets.filter(a => a.enabled).reduce((sum, a) => {
                  if (!a.tahun) return sum;
                  return sum + (num(a.harga) / (num(a.tahun) * 12));
                }, 0) : 0;
                const totalExpenses = p.expenses.reduce((sum, e) => sum + num(e.value), 0);
                const totalOpex = totalExpenses + monthlyDepreciation;
                const opexPerUnit = p.totalVolume > 0 ? totalOpex / p.totalVolume : 0;
                const isActive = p.id === activeProfileId;

                return (
                  <div key={p.id}
                    onClick={() => onSelectProfile && onSelectProfile(p.id)}
                    style={{
                      border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                      background: isActive ? 'rgba(0, 102, 204, 0.04)' : 'var(--bg-card)',
                      borderRadius: 14,
                      padding: 18,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      transition: 'all 0.15s'
                    }}
                  >
                    <div className="flex-between">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="store" size={14} color="var(--primary)" />
                        <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-text)' }}>{p.name}</span>
                      </div>
                      {isActive && (
                        <span className="badge badge-slate" style={{ background: 'rgba(0, 102, 204, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', fontSize: 8 }}>
                          AKTIF
                        </span>
                      )}
                    </div>

                    <div style={{ background: 'var(--bg-app)', padding: 10, borderRadius: 8, border: '1px dashed var(--border-color)' }}>
                      <div style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>TOTAL BEBAN BULANAN</div>
                      <div className="mono" style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', marginTop: 2 }}>
                        {fmtRp(totalOpex)}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11, color: 'var(--color-text-muted)' }}>
                      <div>Vol Jual: <strong>{p.totalVolume.toLocaleString('id-ID')} unit</strong></div>
                      <div>Beban/Unit: <strong>{fmtRp(opexPerUnit)}</strong></div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }} onClick={e => e.stopPropagation()}>
                      <button className="btn btn-ghost btn-sm" onClick={() => onSelectProfile(p.id)} style={{ flex: 1, padding: '6px 12px', fontSize: 11 }}>
                        Buka Profil OPEX
                      </button>
                      {opexProfiles.length > 1 && (
                        <button className="btn btn-danger btn-sm" onClick={() => onDeleteProfile && onDeleteProfile(p.id)} style={{ padding: '6px' }}>
                          <Icon name="trash" size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ──────────────── TAB 3: BEP DATABASE ──────────────── */}
      {activeTab === 'bep' && (
        <div className="section-card" style={{ padding: 22 }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: 16, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Icon name="calendar" size={18} color="var(--primary)" /> Database Parameter BEP Cabang
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: 11, color: 'var(--color-text-muted)' }}>
              Kelola dan simpan target break-even serta nilai modal investasi awal untuk cabang **{activeOutlet?.name || 'N/A'}**.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: 20
          }}>
            {/* Parameters Settings Card */}
            <div style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}>
              <div style={{ fontWeight: 800, fontSize: 13, borderBottom: '1px solid var(--border-color)', paddingBottom: 8, color: 'var(--color-text)' }}>
                Konfigurasi Parameter BEP &amp; Balik Modal
              </div>

              {/* Modal / Investasi */}
              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>
                  Modal Investasi Awal (Rp)
                  {currentBep.manualInvestment !== null ? (
                    <span style={{ fontSize: 9, color: '#f59e0b', fontWeight: 700 }}> (Override)</span>
                  ) : (
                    <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}> (Otomatis)</span>
                  )}
                </label>
                <div className="input-prefix-wrap">
                  <span className="prefix">Rp</span>
                  <FormatInput
                    className="hpp-input"
                    placeholder="0"
                    value={currentBep.manualInvestment !== null ? currentBep.manualInvestment : (activeOutletFeasibilityData ? activeOutletFeasibilityData.totalAssetsValue : '')}
                    onChange={(val) => {
                      onUpdateBepSettings && onUpdateBepSettings({
                        ...currentBep,
                        manualInvestment: val !== null && val !== '' ? Number(val) : null
                      });
                    }}
                  />
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Isi nominal di atas untuk menetapkan modal investasi awal cabang ini. Jika dikosongkan, kalkulator akan otomatis menjumlahkan nilai daftar aset peralatan pada profil OPEX terpilih.
                </div>
              </div>

              {/* Target Payback Months */}
              <div>
                <div className="flex-between" style={{ marginBottom: 6 }}>
                  <label className="label-sm">Target Waktu Balik Modal (Bulan)</label>
                  <span className="mono" style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 12 }}>
                    {currentBep.targetPaybackMonths} bulan
                  </span>
                </div>
                <input
                  type="range"
                  className="hpp-slider"
                  min="1"
                  max="60"
                  value={currentBep.targetPaybackMonths}
                  onChange={e => {
                    onUpdateBepSettings && onUpdateBepSettings({
                      ...currentBep,
                      targetPaybackMonths: Number(e.target.value)
                    });
                  }}
                  style={{ '--slider-pct': `${((currentBep.targetPaybackMonths - 1) / 59) * 100}%` }}
                />
              </div>

              {/* Hari Operasional */}
              <div>
                <div className="flex-between" style={{ marginBottom: 6 }}>
                  <label className="label-sm">Hari Kerja / Operasional Toko per Bulan</label>
                  <span className="mono" style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 12 }}>
                    {currentBep.operationalDays} hari
                  </span>
                </div>
                <input
                  type="range"
                  className="hpp-slider"
                  min="15"
                  max="31"
                  value={currentBep.operationalDays}
                  onChange={e => {
                    onUpdateBepSettings && onUpdateBepSettings({
                      ...currentBep,
                      operationalDays: Number(e.target.value)
                    });
                  }}
                  style={{ '--slider-pct': `${((currentBep.operationalDays - 15) / 16) * 100}%` }}
                />
              </div>
            </div>

            {/* Overrides settings card */}
            <div style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}>
              <div style={{ fontWeight: 800, fontSize: 13, borderBottom: '1px solid var(--border-color)', paddingBottom: 8, color: 'var(--color-text)' }}>
                Skenario Overrides (Simulasi Bebas)
              </div>

              {/* OPEX override */}
              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>
                  Override OPEX Bulanan (Rp)
                  {currentBep.manualOpex !== null ? (
                    <span style={{ fontSize: 9, color: '#f59e0b', fontWeight: 700 }}> (Override)</span>
                  ) : (
                    <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}> (Otomatis)</span>
                  )}
                </label>
                <div className="input-prefix-wrap">
                  <span className="prefix">Rp</span>
                  <FormatInput
                    className="hpp-input"
                    placeholder="Auto-fill dari profil"
                    value={currentBep.manualOpex !== null ? currentBep.manualOpex : (activeOutletFeasibilityData ? activeOutletFeasibilityData.calculatedOpex : '')}
                    onChange={(val) => {
                      onUpdateBepSettings && onUpdateBepSettings({
                        ...currentBep,
                        manualOpex: val !== null && val !== '' ? Number(val) : null
                      });
                    }}
                  />
                </div>
              </div>

              {/* Margin override */}
              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>
                  Override Margin Bersih / Cup (Rp)
                  {currentBep.manualMargin !== null ? (
                    <span style={{ fontSize: 9, color: '#f59e0b', fontWeight: 700 }}> (Override)</span>
                  ) : (
                    <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}> (Otomatis)</span>
                  )}
                </label>
                <div className="input-prefix-wrap">
                  <span className="prefix">Rp</span>
                  <FormatInput
                    className="hpp-input"
                    placeholder="Auto-fill dari rata-rata menu"
                    value={currentBep.manualMargin !== null ? currentBep.manualMargin : (activeOutletFeasibilityData ? Math.round(activeOutletFeasibilityData.calculatedMarginPerCup) : '')}
                    onChange={(val) => {
                      onUpdateBepSettings && onUpdateBepSettings({
                        ...currentBep,
                        manualMargin: val !== null && val !== '' ? Number(val) : null
                      });
                    }}
                  />
                </div>
              </div>

              {/* Price override */}
              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>
                  Override Harga Jual Rata-rata (Rp)
                  {currentBep.manualPrice !== null ? (
                    <span style={{ fontSize: 9, color: '#f59e0b', fontWeight: 700 }}> (Override)</span>
                  ) : (
                    <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}> (Otomatis)</span>
                  )}
                </label>
                <div className="input-prefix-wrap">
                  <span className="prefix">Rp</span>
                  <FormatInput
                    className="hpp-input"
                    placeholder="Auto-fill dari menu"
                    value={currentBep.manualPrice !== null ? currentBep.manualPrice : (activeOutletFeasibilityData ? Math.round(activeOutletFeasibilityData.calculatedPricePerCup) : '')}
                    onChange={(val) => {
                      onUpdateBepSettings && onUpdateBepSettings({
                        ...currentBep,
                        manualPrice: val !== null && val !== '' ? Number(val) : null
                      });
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Output Real-time Hasil BEP & Kelayakan */}
            {activeOutletFeasibilityData && (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}>
                <div style={{ fontWeight: 800, fontSize: 13, borderBottom: '1px solid var(--border-color)', paddingBottom: 8, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon name="activity" size={14} color="var(--primary)" /> Ringkasan BEP &amp; Kelayakan Real-Time
                </div>

                {/* Status Alert */}
                <div style={{
                  background: activeOutletFeasibilityData.recStatusBg,
                  border: `1.5px solid ${activeOutletFeasibilityData.recStatusBorder}`,
                  borderRadius: 8,
                  padding: '8px 10px',
                  color: activeOutletFeasibilityData.recStatusColor,
                  fontSize: 10,
                  fontWeight: 700,
                  lineHeight: 1.4
                }}>
                  Status: {activeOutletFeasibilityData.recStatusText}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="flex-between" style={{ fontSize: 11 }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Total OPEX Bulanan:</span>
                    <span className="mono" style={{ fontWeight: 700, color: 'var(--color-text)' }}>{fmtRp(activeOutletFeasibilityData.opexVal)}</span>
                  </div>
                  <div className="flex-between" style={{ fontSize: 11 }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>BEP Operasional:</span>
                    <span className="mono" style={{ fontWeight: 700, color: 'var(--color-text)' }}>{activeOutletFeasibilityData.bepUnits.toLocaleString('id-ID')} Cup ({activeOutletFeasibilityData.bepHarian} Cup/hari)</span>
                  </div>
                  <div className="flex-between" style={{ fontSize: 11 }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Target Balik Modal:</span>
                    <span className="mono" style={{ fontWeight: 700, color: 'var(--color-text)' }}>{activeOutletFeasibilityData.requiredCupDay} Cup/hari</span>
                  </div>
                  <div className="flex-between bg-accent-blue" style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, margin: '2px -4px' }}>
                    <span style={{ fontWeight: 750 }}>BEP Gabungan Target:</span>
                    <span className="mono" style={{ fontWeight: 800 }}>
                      {activeOutletFeasibilityData.investmentVal > 0 
                        ? `${activeOutletFeasibilityData.bepHarian} - ${activeOutletFeasibilityData.requiredCupDay} Cup/hari`
                        : `${activeOutletFeasibilityData.bepHarian} Cup/hari`
                      }
                    </span>
                  </div>
                  <div className="flex-between" style={{ fontSize: 11 }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Estimasi Profit Bersih:</span>
                    <span className="mono" style={{ fontWeight: 800, color: activeOutletFeasibilityData.monthlyNetProfit > 0 ? '#10b981' : '#ef4444' }}>
                      {activeOutletFeasibilityData.monthlyNetProfit > 0 ? fmtRp(activeOutletFeasibilityData.monthlyNetProfit) : `Rugi ${fmtRp(Math.abs(activeOutletFeasibilityData.monthlyNetProfit))}`}
                    </span>
                  </div>
                  <div className="flex-between" style={{ fontSize: 11 }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Payback Period Riil:</span>
                    <span className="mono" style={{ fontWeight: 750, color: 'var(--color-text)' }}>{activeOutletFeasibilityData.paybackText}</span>
                  </div>
                </div>

                <div style={{ fontSize: 9, color: 'var(--color-text-muted)', lineHeight: 1.5, marginTop: 4, background: 'var(--bg-app)', padding: 8, borderRadius: 6 }}>
                  * Hasil di atas dihitung otomatis secara real-time berdasarkan HPP resep aktif, biaya opex profil, serta parameter input di sebelah kiri.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────── TAB 4: REKOMENDASI & KELAYAKAN TAB ──────────────── */}
      {activeTab === 'rekomendasi' && activeOutletFeasibilityData && (
        <div className="section-card" style={{ padding: 22 }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: 16, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Icon name="activity" size={18} color="var(--primary)" /> Rekomendasi &amp; Kelayakan Cabang: {activeOutlet?.name}
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: 11, color: 'var(--color-text-muted)' }}>
              Analisis kelayakan investasi, struktur biaya, unit economics, resep menu, serta matriks sensitivitas harga untuk cabang aktif ini.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Status Kelayakan Card */}
            <div>
              <div style={{
                background: activeOutletFeasibilityData.recStatusBg,
                border: `1.5px solid ${activeOutletFeasibilityData.recStatusBorder}`,
                borderRadius: 10,
                padding: '14px 16px',
                color: activeOutletFeasibilityData.recStatusColor
              }}>
                <div style={{ fontSize: 12, fontWeight: 850, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="info" size={14} color={activeOutletFeasibilityData.recStatusColor} /> STATUS OPERASIONAL &amp; KELAYAKAN: {activeOutletFeasibilityData.recStatusText}
                </div>
                <div style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--color-text-muted)' }}>
                  {activeOutletFeasibilityData.recStatusDesc}
                </div>
              </div>
            </div>

            {/* Two Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24, alignItems: 'start' }}>
              {/* LEFT COLUMN: Metrics & Financial Structure */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Unit Economics */}
                <div>
                  <div className="label-xs" style={{ fontSize: 9, color: 'var(--color-text-muted)', marginBottom: 6 }}>1. UNIT ECONOMICS (RATA-RATA GABUNGAN)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg-app)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                    {[
                      { label: 'Harga Jual Rata-rata', val: fmtRp(activeOutletFeasibilityData.avgPriceVal), color: 'var(--color-text)' },
                      { label: 'Direct HPP Rata-rata', val: fmtRp(activeOutletFeasibilityData.avgHpp), color: 'var(--color-text-muted)' },
                      ...(activeOutletFeasibilityData.avgPlatformCut > 0 ? [{
                        label: 'Platform Cut Rata-rata',
                        val: `${fmtRp(activeOutletFeasibilityData.avgPlatformCut)} (${((activeOutletFeasibilityData.avgPlatformCut / Math.max(1, activeOutletFeasibilityData.avgPriceVal)) * 100).toFixed(1)}%)`,
                        color: '#ef4444'
                      }] : []),
                      {
                        label: 'Margin Bersih per Cup',
                        val: `${fmtRp(activeOutletFeasibilityData.netProfitPerCup)} (${(activeOutletFeasibilityData.avgPriceVal > 0 ? (activeOutletFeasibilityData.netProfitPerCup / activeOutletFeasibilityData.avgPriceVal) * 100 : 0).toFixed(1)}%)`,
                        color: activeOutletFeasibilityData.netProfitPerCup > 0 ? '#10b981' : '#ef4444',
                        bold: true
                      },
                    ].map(({ label, val, color, bold }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                        <span style={{ color: 'var(--color-text-muted)', fontWeight: bold ? 600 : 400 }}>{label}</span>
                        <span className="mono" style={{ fontWeight: bold ? 800 : 600, color }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial structure */}
                <div>
                  <div className="label-xs" style={{ fontSize: 9, color: 'var(--color-text-muted)', marginBottom: 6 }}>2. STRUKTUR BIAYA CABANG</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg-app)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                    {[
                      { label: 'Modal CapEx Aset Awal', val: fmtRp(activeOutletFeasibilityData.investmentVal) },
                      { label: 'Beban Overhead Bulanan', val: fmtRp(activeOutletFeasibilityData.totalExpenses) },
                      { label: 'Penyusutan Peralatan / Bln', val: fmtRp(activeOutletFeasibilityData.totalAssetDepreciation) },
                      { label: 'Total OPEX Bulanan', val: fmtRp(activeOutletFeasibilityData.opexVal), bold: true, color: 'var(--primary)' },
                    ].map(({ label, val, color, bold }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                        <span style={{ color: 'var(--color-text-muted)', fontWeight: bold ? 600 : 400 }}>{label}</span>
                        <span className="mono" style={{ fontWeight: bold ? 800 : 600, color: color || 'var(--color-text)' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BEP metrics */}
                <div>
                  <div className="label-xs" style={{ fontSize: 9, color: 'var(--color-text-muted)', marginBottom: 6 }}>3. TARGET IMPAS &amp; PAYBACK</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg-app)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                    {[
                      { label: 'BEP Operasional Bulanan', val: `${activeOutletFeasibilityData.bepUnits.toLocaleString('id-ID')} Cup` },
                      { label: 'BEP Operasional Harian', val: `${activeOutletFeasibilityData.bepHarian} Cup / hari`, bold: true },
                      { label: 'Target Balik Modal Harian', val: `${activeOutletFeasibilityData.requiredCupDay} Cup / hari`, color: 'var(--primary)' },
                      { label: 'Target Balik Modal Omset', val: `${fmtRp(activeOutletFeasibilityData.requiredRevMonth)}/bln`, color: 'var(--primary)' },
                      { label: 'Laba Bersih Bulanan Riil', val: activeOutletFeasibilityData.monthlyNetProfit > 0 ? fmtRp(activeOutletFeasibilityData.monthlyNetProfit) : `Rugi ${fmtRp(Math.abs(activeOutletFeasibilityData.monthlyNetProfit))}`, color: activeOutletFeasibilityData.monthlyNetProfit > 0 ? '#10b981' : '#ef4444', bold: true },
                      { label: 'Waktu Balik Modal Riil', val: activeOutletFeasibilityData.paybackText, bold: true },
                    ].map(({ label, val, color, bold }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                        <span style={{ color: 'var(--color-text-muted)', fontWeight: bold ? 600 : 400 }}>{label}</span>
                        <span className="mono" style={{ fontWeight: bold ? 800 : 600, color: color || 'var(--color-text)' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Menus Economics & Recommendation Matrix */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Active Menus List */}
                <div>
                  <div className="label-xs" style={{ fontSize: 9, color: 'var(--color-text-muted)', marginBottom: 6 }}>4. DAFTAR RESEP &amp; KELAYAKAN MENU ({activeOutletFeasibilityData.activeMenusInfo.length})</div>
                  <div style={{
                    maxHeight: 280,
                    overflowY: 'auto',
                    border: '1px solid var(--border-color)',
                    borderRadius: 10,
                    background: 'var(--bg-app)'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                          <th style={{ padding: '8px 10px' }}>Menu</th>
                          <th style={{ padding: '8px 10px', textAlign: 'right' }}>HPP</th>
                          <th style={{ padding: '8px 10px', textAlign: 'right' }}>Harga</th>
                          <th style={{ padding: '8px 10px', textAlign: 'right' }}>Margin Bersih</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeOutletFeasibilityData.activeMenusInfo.length === 0 ? (
                          <tr>
                            <td colSpan="4" style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                              Tidak ada menu aktif di cabang ini.
                            </td>
                          </tr>
                        ) : (
                          activeOutletFeasibilityData.activeMenusInfo.map(m => (
                            <tr key={m.id} style={{ borderBottom: '1px dashed var(--border-color)', color: 'var(--color-text)' }}>
                              <td style={{ padding: '8px 10px', fontWeight: 600 }}>{m.emoji} {m.name}</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace' }}>{fmtRp(m.hpp)}</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace' }}>{fmtRp(m.price)}</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: m.margin > 0 ? '#10b981' : '#ef4444' }}>
                                {fmtRp(m.margin)} ({m.marginPct.toFixed(0)}%)
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recommendation Matrix */}
                <div>
                  <div className="label-xs" style={{ fontSize: 9, color: 'var(--color-text-muted)', marginBottom: 6 }}>5. MATRIKS SENSITIVITAS HARGA JUAL</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg-app)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: 6, marginBottom: 6 }}>
                      <div>Target Margin</div>
                      <div style={{ textAlign: 'right' }}>Harga Min.</div>
                      <div style={{ textAlign: 'right' }}>Margin/Unit</div>
                    </div>
                    {[0.35, 0.45, 0.55, 0.65, 0.70].map(rate => {
                      const price = Math.round(activeOutletFeasibilityData.avgHpp / (1 - rate));
                      const marginVal = price - activeOutletFeasibilityData.avgHpp;
                      const isIdeal = rate === 0.55;
                      return (
                        <div key={rate} style={{
                          display: 'grid',
                          gridTemplateColumns: '1.2fr 1fr 1fr',
                          fontSize: 11,
                          color: isIdeal ? 'var(--primary)' : 'var(--color-text)',
                          fontWeight: isIdeal ? 700 : 400,
                          padding: '3px 0'
                        }}>
                          <div>Margin {Math.round(rate * 100)}% {isIdeal && '(Sangat Sehat)'}</div>
                          <div style={{ textAlign: 'right', fontFamily: 'monospace' }}>{fmtRp(price)}</div>
                          <div style={{ textAlign: 'right', fontFamily: 'monospace', color: marginVal > 0 ? '#10b981' : 'inherit' }}>{fmtRp(marginVal)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                  <button 
                    onClick={() => {
                      const { avgHpp, avgPriceVal, netProfitPerCup, avgPlatformCut, recStatusText, recStatusDesc, monthlyNetProfit, investmentVal, paybackText } = activeOutletFeasibilityData;
                      const rec40 = avgHpp / (1 - 0.4);
                      const rec50 = avgHpp / (1 - 0.5);
                      const rec60 = avgHpp / (1 - 0.6);
                      
                      const reportText = `=== LAPORAN REKOMENDASI & ANALISIS KELAYAKAN BEP ===
Cabang/Outlet: ${activeOutlet?.name}
Tanggal Laporan: ${new Date().toLocaleDateString('id-ID')}

1. STATUS KELAYAKAN INVESTASI: ${recStatusText}
   - ${recStatusDesc}
   - Estimasi Profit Bersih Bulanan: ${fmtRp(monthlyNetProfit)}
   - Total Modal Awal: ${fmtRp(investmentVal)}
   - Waktu Balik Modal Riil: ${paybackText}

2. UNIT ECONOMICS (RATA-RATA PER CUP):
   - Rata-rata Harga Jual: ${fmtRp(avgPriceVal)}
   - Rata-rata Direct HPP (Bahan + Kemasan): ${fmtRp(avgHpp)}
   - Komisi Platform Online: ${fmtRp(avgPlatformCut)} (${avgPriceVal > 0 ? ((avgPlatformCut / avgPriceVal) * 100).toFixed(1) : 0}%)
   - Margin Bersih per Cup: ${fmtRp(netProfitPerCup)} (${avgPriceVal > 0 ? ((netProfitPerCup / avgPriceVal) * 100).toFixed(1) : 0}%)

3. REKOMENDASI HARGA JUAL SEHAT (BERDASARKAN TARGET MARGIN):
   - Target Margin 40% (Batas Bawah): ${fmtRp(Math.round(rec40))}
   - Target Margin 50% (Ideal/Standar): ${fmtRp(Math.round(rec50))}
   - Target Margin 60% (Premium/Aman): ${fmtRp(Math.round(rec60))}
   
* Laporan dibuat secara otomatis melalui HPP F&B Calculator.`;

                      navigator.clipboard.writeText(reportText);
                      showToast("Laporan berhasil disalin ke clipboard!", "success");
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Icon name="copy" size={12} /> Salin Laporan Eksekutif Cabang
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Feasibility Summary */}
      {selectedFeasibilityOutlet && feasibilityData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            width: '100%',
            maxWidth: 760,
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-app)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="activity" size={18} color="var(--primary)" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--color-text)' }}>Dashboard Kelayakan Bisnis &amp; Rekomendasi Cabang</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Cabang: <strong>{selectedFeasibilityOutlet.name}</strong></div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedFeasibilityOutlet(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 20, fontWeight: 300 }}
              >
                &times;
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Status Kelayakan Card */}
              <div>
                <div style={{
                  background: feasibilityData.recStatusBg,
                  border: `1.5px solid ${feasibilityData.recStatusBorder}`,
                  borderRadius: 10,
                  padding: '12px 14px',
                  color: feasibilityData.recStatusColor
                }}>
                  <div style={{ fontSize: 11, fontWeight: 850, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Icon name="info" size={13} color={feasibilityData.recStatusColor} /> STATUS OPERASIONAL &amp; KELAYAKAN: {feasibilityData.recStatusText}
                  </div>
                  <div style={{ fontSize: 10, lineHeight: 1.5, color: 'var(--color-text-muted)' }}>
                    {feasibilityData.recStatusDesc}
                  </div>
                </div>
              </div>

              {/* Two Column Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
                {/* LEFT COLUMN: Metrics & Financial Structure */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Unit Economics */}
                  <div>
                    <div className="label-xs" style={{ fontSize: 9, color: 'var(--color-text-muted)', marginBottom: 6 }}>1. UNIT ECONOMICS (RATA-RATA GABUNGAN)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, background: 'var(--bg-app)', padding: 12, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                      {[
                        { label: 'Harga Jual Rata-rata', val: fmtRp(feasibilityData.avgPriceVal), color: 'var(--color-text)' },
                        { label: 'Direct HPP Rata-rata', val: fmtRp(feasibilityData.avgHpp), color: 'var(--color-text-muted)' },
                        ...(feasibilityData.avgPlatformCut > 0 ? [{
                          label: 'Platform Cut Rata-rata',
                          val: `${fmtRp(feasibilityData.avgPlatformCut)} (${((feasibilityData.avgPlatformCut / Math.max(1, feasibilityData.avgPriceVal)) * 100).toFixed(1)}%)`,
                          color: '#ef4444'
                        }] : []),
                        {
                          label: 'Margin Bersih per Cup',
                          val: `${fmtRp(feasibilityData.netProfitPerCup)} (${(feasibilityData.avgPriceVal > 0 ? (feasibilityData.netProfitPerCup / feasibilityData.avgPriceVal) * 100 : 0).toFixed(1)}%)`,
                          color: feasibilityData.netProfitPerCup > 0 ? '#10b981' : '#ef4444',
                          bold: true
                        },
                      ].map(({ label, val, color, bold }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                          <span style={{ color: 'var(--color-text-muted)', fontWeight: bold ? 600 : 400 }}>{label}</span>
                          <span className="mono" style={{ fontWeight: bold ? 800 : 600, color }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial structure */}
                  <div>
                    <div className="label-xs" style={{ fontSize: 9, color: 'var(--color-text-muted)', marginBottom: 6 }}>2. STRUKTUR BIAYA CABANG</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, background: 'var(--bg-app)', padding: 12, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                      {[
                        { label: 'Modal CapEx Aset Awal', val: fmtRp(feasibilityData.investmentVal) },
                        { label: 'Beban Overhead Bulanan', val: fmtRp(feasibilityData.totalExpenses) },
                        { label: 'Penyusutan Peralatan / Bln', val: fmtRp(feasibilityData.totalAssetDepreciation) },
                        { label: 'Total OPEX Bulanan', val: fmtRp(feasibilityData.opexVal), bold: true, color: 'var(--primary)' },
                      ].map(({ label, val, color, bold }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                          <span style={{ color: 'var(--color-text-muted)', fontWeight: bold ? 600 : 400 }}>{label}</span>
                          <span className="mono" style={{ fontWeight: bold ? 800 : 600, color: color || 'var(--color-text)' }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* BEP metrics */}
                  <div>
                    <div className="label-xs" style={{ fontSize: 9, color: 'var(--color-text-muted)', marginBottom: 6 }}>3. TARGET IMPAS &amp; PAYBACK</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, background: 'var(--bg-app)', padding: 12, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                      {[
                        { label: 'BEP Operasional Bulanan', val: `${feasibilityData.bepUnits.toLocaleString('id-ID')} Cup` },
                        { label: 'BEP Operasional Harian', val: `${feasibilityData.bepHarian} Cup / hari`, bold: true },
                        { label: 'Target Balik Modal Harian', val: `${feasibilityData.requiredCupDay} Cup / hari`, color: 'var(--primary)' },
                        { label: 'Target Balik Modal Omset', val: `${fmtRp(feasibilityData.requiredRevMonth)}/bln`, color: 'var(--primary)' },
                        { label: 'Laba Bersih Bulanan Riil', val: feasibilityData.monthlyNetProfit > 0 ? fmtRp(feasibilityData.monthlyNetProfit) : `Rugi ${fmtRp(Math.abs(feasibilityData.monthlyNetProfit))}`, color: feasibilityData.monthlyNetProfit > 0 ? '#10b981' : '#ef4444', bold: true },
                        { label: 'Waktu Balik Modal Riil', val: feasibilityData.paybackText, bold: true },
                      ].map(({ label, val, color, bold }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                          <span style={{ color: 'var(--color-text-muted)', fontWeight: bold ? 600 : 400 }}>{label}</span>
                          <span className="mono" style={{ fontWeight: bold ? 800 : 600, color: color || 'var(--color-text)' }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Menus Economics & Recommendation Matrix */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Active Menus List */}
                  <div>
                    <div className="label-xs" style={{ fontSize: 9, color: 'var(--color-text-muted)', marginBottom: 6 }}>4. DAFTAR RESEP &amp; KELAYAKAN MENU ({feasibilityData.activeMenusInfo.length})</div>
                    <div style={{
                      maxHeight: 180,
                      overflowY: 'auto',
                      border: '1px solid var(--border-color)',
                      borderRadius: 10,
                      background: 'var(--bg-app)'
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                        <thead>
                          <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                            <th style={{ padding: '6px 8px' }}>Menu</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right' }}>HPP</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right' }}>Harga</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right' }}>Margin Bersih</th>
                          </tr>
                        </thead>
                        <tbody>
                          {feasibilityData.activeMenusInfo.length === 0 ? (
                            <tr>
                              <td colSpan="4" style={{ padding: '12px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                Tidak ada menu aktif di cabang ini.
                              </td>
                            </tr>
                          ) : (
                            feasibilityData.activeMenusInfo.map(m => (
                              <tr key={m.id} style={{ borderBottom: '1px dashed var(--border-color)', color: 'var(--color-text)' }}>
                                <td style={{ padding: '6px 8px', fontWeight: 600 }}>{m.emoji} {m.name}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{fmtRp(m.hpp)}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{fmtRp(m.price)}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: m.margin > 0 ? '#10b981' : '#ef4444' }}>
                                  {fmtRp(m.margin)} ({m.marginPct.toFixed(0)}%)
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recommendation Matrix */}
                  <div>
                    <div className="label-xs" style={{ fontSize: 9, color: 'var(--color-text-muted)', marginBottom: 6 }}>5. MATRIKS SENSITIVITAS HARGA JUAL</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, background: 'var(--bg-app)', padding: 12, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: 4, marginBottom: 4 }}>
                        <div>Target Margin</div>
                        <div style={{ textAlign: 'right' }}>Harga Min.</div>
                        <div style={{ textAlign: 'right' }}>Margin/Unit</div>
                      </div>
                      {[0.35, 0.45, 0.55, 0.65, 0.70].map(rate => {
                        const price = Math.round(feasibilityData.avgHpp / (1 - rate));
                        const marginVal = price - feasibilityData.avgHpp;
                        const isIdeal = rate === 0.55;
                        return (
                          <div key={rate} style={{
                            display: 'grid',
                            gridTemplateColumns: '1.2fr 1fr 1fr',
                            fontSize: 10,
                            color: isIdeal ? 'var(--primary)' : 'var(--color-text)',
                            fontWeight: isIdeal ? 700 : 400,
                            padding: '2px 0'
                          }}>
                            <div>Margin {Math.round(rate * 100)}% {isIdeal && '(Sangat Sehat)'}</div>
                            <div style={{ textAlign: 'right', fontFamily: 'monospace' }}>{fmtRp(price)}</div>
                            <div style={{ textAlign: 'right', fontFamily: 'monospace', color: marginVal > 0 ? '#10b981' : 'inherit' }}>{fmtRp(marginVal)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: 8,
              justifyContent: 'flex-end',
              background: 'var(--bg-app)'
            }}>
              <button 
                onClick={handleCopyReport}
                className="btn btn-ghost btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Icon name="copy" size={12} /> Salin Laporan Eksekutif
              </button>
              <button 
                onClick={() => setSelectedFeasibilityOutlet(null)}
                className="btn btn-primary btn-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
