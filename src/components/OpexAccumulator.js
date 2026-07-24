"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Icon } from './Icon';
import FormatInput from './FormatInput';
import { SectionHeader } from './HppSubComponents';
import { num, fmtRp, roundPrice, uid, getPenyusutanBulanan, mkOpexProfile, loadChannelPresets } from '../utils/hpp';

export default function OpexAccumulator({
  menus,
  onUpdateMenu,
  opexProfiles,
  activeProfileId,
  onSelectProfile,
  onUpdateProfile,
  onAddProfile,
  onDeleteProfile,
  onNavigateToCalculator,
  onNavigateToBep,
  channelPresets = [],
  onOpenChannelModal,
  bepSettings = [],
  activeOutletId,
  assets = [],
  setAssets,
  ingredients = []
}) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [menuToAdd, setMenuToAdd] = useState('');
  const [isSimpleView, setIsSimpleView] = useState(true);
  const [expandedMenuId, setExpandedMenuId] = useState(null);

  const handleRowClick = (e, menuId) => {
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'BUTTON' ||
      e.target.closest('button') ||
      e.target.closest('input')
    ) {
      return;
    }
    setExpandedMenuId(prev => prev === menuId ? null : menuId);
  };

  // Dropdown categories for OPEX expenses & assets mapping
  const opexCategories = ['Semua', 'Minuman', 'Makanan', 'Snack', 'Lainnya'];

  const handleDiscountChange = (menu, field, value) => {
    const currentPlatform = menu.platform || {
      enabled: false,
      name: 'Offline / Dine-In',
      commissionPct: 0,
      flatFee: 0,
      discountType: 'pct',
      discountValue: 0,
      commissionBasis: 'original'
    };
    
    const parsedVal = field === 'discountValue' ? num(value) : value;
    const updatedPlatform = {
      ...currentPlatform,
      [field]: parsedVal
    };
    
    updatedPlatform.enabled = 
      num(updatedPlatform.commissionPct) > 0 || 
      num(updatedPlatform.flatFee) > 0 || 
      num(updatedPlatform.discountValue) > 0;

    if (onUpdateMenu) {
      onUpdateMenu(menu.id, { platform: updatedPlatform });
    }
  };

  const handleMassDiscount = (pctValue) => {
    selectedMenus.forEach(menu => {
      const currentPlatform = menu.platform || {
        enabled: pctValue > 0,
        name: 'Offline / Dine-In',
        commissionPct: 0,
        flatFee: 0,
        discountType: 'pct',
        discountValue: 0,
        commissionBasis: 'original'
      };
      const updatedPlatform = {
        ...currentPlatform,
        enabled: currentPlatform.commissionPct > 0 || currentPlatform.flatFee > 0 || pctValue > 0,
        discountType: 'pct',
        discountValue: pctValue
      };
      if (onUpdateMenu) {
        onUpdateMenu(menu.id, { platform: updatedPlatform });
      }
    });
  };

  // Current active profile
  const activeProfile = useMemo(() => {
    return opexProfiles.find(p => p.id === activeProfileId) || opexProfiles[0] || mkOpexProfile();
  }, [opexProfiles, activeProfileId]);

  const activePresetsList = useMemo(() => {
    return channelPresets && channelPresets.length > 0 ? channelPresets : loadChannelPresets();
  }, [channelPresets]);

  const getPlatformColors = useCallback((platformName) => {
    const preset = activePresetsList.find(p => p.name.toLowerCase() === platformName.toLowerCase()) || 
                   activePresetsList.find(p => p.id === 'offline');
    return {
      background: preset?.colorLight || '#f8fafc',
      color: preset?.color || '#64748b'
    };
  }, [activePresetsList]);

  // Current active BEP settings
  const currentBep = useMemo(() => {
    const s = (bepSettings || []).find(b => b.outletId === activeOutletId) || {};
    return {
      operationalDays: s.operationalDays ?? 30,
      manualOpex: s.manualOpex ?? null,
      manualMargin: s.manualMargin ?? null,
      manualPrice: s.manualPrice ?? null,
      actualVolume: s.actualVolume ?? null,
      manualInvestment: s.manualInvestment ?? null,
      targetPaybackMonths: s.targetPaybackMonths ?? 12,
    };
  }, [bepSettings, activeOutletId]);

  // Get selected menus in this profile
  const selectedMenus = useMemo(() => {
    const hasSelected = Array.isArray(activeProfile.selectedMenuIds) && activeProfile.selectedMenuIds.length > 0;
    return hasSelected ? menus.filter(m => activeProfile.selectedMenuIds.includes(m.id)) : menus;
  }, [menus, activeProfile.selectedMenuIds]);

  // Get active (enabled) menus in this profile
  const activeMenus = useMemo(() => {
    return selectedMenus.filter(m => !activeProfile.disabledMenuIds?.includes(m.id));
  }, [selectedMenus, activeProfile.disabledMenuIds]);

  /* ─── Direct HPP & Pricing Calculations ─── */
  const getDirectHPP = useCallback((menu) => {
    const bb = menu.ingredients.reduce((s, i) => {
      if (!num(i.ukuranKemasan)) return s;
      return s + (num(i.hargaBeli) / num(i.ukuranKemasan)) * num(i.takaranPerCup);
    }, 0);
    const km = menu.packaging.filter(p => p.enabled).reduce((s, p) => s + (num(p.harga) * num(p.usage !== undefined ? p.usage : 1)), 0);
    return bb + km;
  }, []);

  const getSellingPrice = useCallback((menu) => {
    if (activeProfile.menuPrices && activeProfile.menuPrices[menu.id] !== undefined) {
      return activeProfile.menuPrices[menu.id];
    }
    const hpp = getDirectHPP(menu);
    const hj = num(menu.margin) >= 100 ? 0 : hpp / (1 - num(menu.margin) / 100);
    return roundPrice(hj);
  }, [activeProfile.menuPrices, getDirectHPP]);

  /* ── Platform-aware calculations per menu ──────────── */
  const getPlatformCalc = useCallback((menu) => {
    const hj = getSellingPrice(menu);
    const hpp = getDirectHPP(menu);
    const p = menu.platform;

    const diskonNominal = p && p.enabled
      ? (p.discountType === 'pct' ? hj * num(p.discountValue) / 100 : num(p.discountValue))
      : 0;
    const hargaEfektif = Math.max(hj - diskonNominal, 0);
    const basisKomisi = p && p.enabled && p.commissionBasis === 'effective' ? hargaEfektif : hj;
    const komisi = p && p.enabled ? basisKomisi * num(p.commissionPct) / 100 : 0;
    const totalKomisi = p && p.enabled ? komisi + num(p.flatFee) : 0;
    const revenueBersih = hargaEfektif - totalKomisi;
    const netProfit = revenueBersih - hpp;

    const hppPct = hj > 0 ? (hpp / hj) * 100 : 0;
    const hppPctAfterDiscount = hargaEfektif > 0 ? (hpp / hargaEfektif) * 100 : 0;
    const diskonPct = p && p.discountType === 'pct' ? num(p.discountValue) : (hj > 0 ? (diskonNominal / hj) * 100 : 0);

    return {
      hargaJual: hj,
      diskonNominal,
      diskonPct,
      hargaEfektif,
      totalKomisi,
      revenueBersih,
      hpp,
      hppPct,
      hppPctAfterDiscount,
      opsPerCup: 0,
      netProfit,
      platformName: p?.name || 'Custom',
      commissionPct: num(p?.commissionPct),
      hasPlatform: !!(p && p.enabled),
    };
  }, [getSellingPrice, getDirectHPP]);

  const handlePriceChange = (menu, newPriceVal) => {
    const currentPrices = { ...activeProfile.menuPrices || {} };
    if (newPriceVal === '' || newPriceVal === undefined || newPriceVal === null) {
      delete currentPrices[menu.id];
    } else {
      currentPrices[menu.id] = num(newPriceVal);
    }
    onUpdateProfile({ menuPrices: currentPrices });
  };



  /* ─── Volume Balancing Logic ─── */

  // Helper to get active volume of a menu item in this profile
  const getMenuVolume = useCallback((menuId, fallbackVal = 100) => {
    if (activeProfile.menuVolumes && activeProfile.menuVolumes[menuId] !== undefined) {
      return activeProfile.menuVolumes[menuId];
    }
    return fallbackVal;
  }, [activeProfile.menuVolumes]);

  const handleVolumeChange = (menuId, newVolVal) => {
    const targetVol = Math.max(0, parseInt(newVolVal) || 0);
    const currentVols = { ...activeProfile.menuVolumes };

    // Fill missing values for all active menus
    activeMenus.forEach(m => {
      if (currentVols[m.id] === undefined) {
        currentVols[m.id] = num(m.ops?.estimasiCup || 100);
      }
    });

    const oldVol = currentVols[menuId] || 0;
    const diff = targetVol - oldVol;

    if (activeProfile.isTotalVolumeLocked) {
      const others = activeMenus.filter(m => m.id !== menuId);
      if (others.length === 0) {
        // If only 1 menu is active, it must equal the totalVolume
        currentVols[menuId] = activeProfile.totalVolume;
      } else {
        const sumOthers = others.reduce((sum, m) => sum + (currentVols[m.id] || 0), 0);

        if (diff > 0) {
          // User increased item volume: reduce others proportionally
          if (diff >= sumOthers) {
            // Cap this menu at totalVolume, and set others to 0
            currentVols[menuId] = activeProfile.totalVolume;
            others.forEach(o => { currentVols[o.id] = 0; });
          } else {
            currentVols[menuId] = targetVol;
            others.forEach(o => {
              const share = sumOthers > 0 ? (currentVols[o.id] || 0) / sumOthers : 1 / others.length;
              currentVols[o.id] = Math.max(0, Math.round((currentVols[o.id] || 0) - (diff * share)));
            });
          }
        } else if (diff < 0) {
          // User decreased item volume: increase others proportionally
          currentVols[menuId] = targetVol;
          const absDiff = Math.abs(diff);
          others.forEach(o => {
            const share = sumOthers > 0 ? (currentVols[o.id] || 0) / sumOthers : 1 / others.length;
            currentVols[o.id] = Math.round((currentVols[o.id] || 0) + (absDiff * share));
          });
        }

        // Final rounding gap adjustment
        let newSum = activeMenus.reduce((sum, m) => sum + (currentVols[m.id] || 0), 0);
        let gap = activeProfile.totalVolume - newSum;
        if (gap !== 0 && others.length > 0) {
          const firstOtherId = others[0].id;
          currentVols[firstOtherId] = Math.max(0, currentVols[firstOtherId] + gap);
        }
      }
      onUpdateProfile({ menuVolumes: currentVols });
    } else {
      // Unlocked: modify this item's volume, and update total volume to the sum of all active
      currentVols[menuId] = targetVol;
      const newTotal = activeMenus.reduce((sum, m) => sum + (currentVols[m.id] || 0), 0);
      onUpdateProfile({
        menuVolumes: currentVols,
        totalVolume: newTotal
      });
    }
  };

  const handleTotalVolumeChange = (newTotalVal) => {
    const newTotal = Math.max(0, parseInt(newTotalVal) || 0);
    const currentVols = { ...activeProfile.menuVolumes };

    if (activeMenus.length > 0) {
      const equalShare = Math.floor(newTotal / activeMenus.length);
      activeMenus.forEach(m => {
        currentVols[m.id] = equalShare;
      });

      // Distribute rounding remainder
      const remainder = newTotal % activeMenus.length;
      for (let i = 0; i < remainder; i++) {
        const id = activeMenus[i].id;
        currentVols[id] = (currentVols[id] || 0) + 1;
      }
    }

    onUpdateProfile({
      totalVolume: newTotal,
      menuVolumes: currentVols
    });
  };

  const handleToggleMenuSelect = (menuId) => {
    const disabled = activeProfile.disabledMenuIds || [];
    const isCurrentlyDisabled = disabled.includes(menuId);
    let nextDisabled = isCurrentlyDisabled
      ? disabled.filter(id => id !== menuId)
      : [...disabled, menuId];

    onUpdateProfile({
      disabledMenuIds: nextDisabled
    });
  };

  const handleToggleSelectAll = (checked) => {
    const currentFilteredIds = filteredMenus.map(m => m.id);
    const currentDisabled = activeProfile.disabledMenuIds || [];
    let nextDisabled = [...currentDisabled];

    if (checked) {
      // Enable all currently filtered menus -> remove them from the disabled list
      nextDisabled = nextDisabled.filter(id => !currentFilteredIds.includes(id));
    } else {
      // Disable all currently filtered menus -> add them to the disabled list
      currentFilteredIds.forEach(id => {
        if (!nextDisabled.includes(id)) {
          nextDisabled.push(id);
        }
      });
    }

    onUpdateProfile({
      disabledMenuIds: nextDisabled
    });
  };

  /* ─── OPEX Cost List CRUD ─── */
  const addExpense = () => {
    const updated = [...(activeProfile.expenses || []), { id: uid(), name: 'Pengeluaran Baru', value: 0, category: 'Semua' }];
    onUpdateProfile({ expenses: updated });
  };

  const updateExpense = (id, field, value) => {
    const updated = activeProfile.expenses.map(x => x.id === id ? { ...x, [field]: value } : x);
    onUpdateProfile({ expenses: updated });
  };

  const removeExpense = (id) => {
    const updated = activeProfile.expenses.filter(x => x.id !== id);
    onUpdateProfile({ expenses: updated });
  };

  const regularCentralAssets = useMemo(() => {
    return (assets || []).filter(ca => ca.outletId === activeOutletId && !ca.isLargeExpense);
  }, [assets, activeOutletId]);

  const handleToggleAssetSelection = (caId) => {
    const isSelected = (activeProfile.assets || []).some(a => a.assetId === caId);
    let updated;
    if (isSelected) {
      updated = (activeProfile.assets || []).filter(a => a.assetId !== caId);
    } else {
      updated = [...(activeProfile.assets || []), { id: uid(), assetId: caId, enabled: true }];
    }
    onUpdateProfile({ assets: updated });
  };

  /* ─── Final Aggregations ─── */
  const totalExpenses = useMemo(() => {
    return (activeProfile.expenses || []).reduce((sum, exp) => sum + num(exp.value), 0);
  }, [activeProfile.expenses]);

  const totalAssetDepreciation = useMemo(() => {
    return getPenyusutanBulanan(activeProfile, assets);
  }, [activeProfile, assets]);

  const totalOpexVal = useMemo(() => {
    if (currentBep.manualOpex !== null) {
      return num(currentBep.manualOpex);
    }
    return totalExpenses + totalAssetDepreciation;
  }, [totalExpenses, totalAssetDepreciation, currentBep.manualOpex]);

  // Main KPI values — platform-aware
  const financialSummary = useMemo(() => {
    let totalRevenue = 0;         // gross revenue (harga jual × volume)
    let totalEffectiveRevenue = 0; // revenue setelah diskon merchant sebelum komisi
    let totalNetRevenue = 0;      // net revenue setelah diskon & komisi platform
    let totalCOGS = 0;
    let totalVolume = 0;
    let totalPlatformCut = 0;
    let totalDiskon = 0;

    activeMenus.forEach(m => {
      const volume = getMenuVolume(m.id, num(m.ops?.estimasiCup));
      const pc = getPlatformCalc(m);

      totalVolume += volume;
      totalRevenue += volume * pc.hargaJual;
      totalEffectiveRevenue += volume * pc.hargaEfektif;
      totalNetRevenue += volume * pc.revenueBersih;
      totalCOGS += volume * pc.hpp;
      totalPlatformCut += volume * pc.totalKomisi;
      totalDiskon += volume * pc.diskonNominal;
    });

    const totalGrossProfit = totalNetRevenue - totalCOGS;
    const netProfit = totalGrossProfit - totalOpexVal;

    const avgOpexPerUnit = totalVolume > 0 ? totalOpexVal / totalVolume : 0;
    const avgHppPctAfterDiscount = totalEffectiveRevenue > 0 ? (totalCOGS / totalEffectiveRevenue) * 100 : 0;

    // BEP based on net revenue
    const avgNetPrice = currentBep.manualPrice !== null
      ? num(currentBep.manualPrice)
      : (totalVolume > 0 ? totalNetRevenue / totalVolume : 0);
    const avgHpp = totalVolume > 0 ? totalCOGS / totalVolume : 0;
    const avgContributionMargin = currentBep.manualMargin !== null
      ? num(currentBep.manualMargin)
      : avgNetPrice - avgHpp;
    const bepUnits = avgContributionMargin > 0 ? Math.ceil(totalOpexVal / avgContributionMargin) : 0;

    return {
      totalVolume,
      totalRevenue,
      totalEffectiveRevenue,
      totalNetRevenue,
      totalCOGS,
      totalGrossProfit,
      netProfit,
      avgOpexPerUnit,
      avgHppPctAfterDiscount,
      bepUnits,
      totalPlatformCut,
      totalDiskon,
      avgNetPrice,
      avgHpp,
      avgContributionMargin
    };
  }, [activeMenus, totalOpexVal, currentBep.manualPrice, currentBep.manualMargin, getMenuVolume, getPlatformCalc]);

  const calculatedInvestment = useMemo(() => {
    if (!activeProfile) return 0;
    return (activeProfile.assets || []).reduce((sum, asset) => sum + num(asset.harga), 0);
  }, [activeProfile]);

  const investmentVal = currentBep.manualInvestment !== null ? num(currentBep.manualInvestment) : calculatedInvestment;
  const targetPaybackMonths = currentBep.targetPaybackMonths || 12;

  const requiredCupDay = useMemo(() => {
    const avgContributionMargin = financialSummary.avgContributionMargin;
    if (targetPaybackMonths <= 0 || avgContributionMargin <= 0 || investmentVal <= 0) {
      return 0;
    }
    const requiredMonthlyProfit = investmentVal / targetPaybackMonths;
    const requiredMonthlyGrossProfit = requiredMonthlyProfit + totalOpexVal;
    const requiredCupMonth = Math.ceil(requiredMonthlyGrossProfit / avgContributionMargin);
    const operationalDays = currentBep.operationalDays || 30;
    return operationalDays > 0 ? Math.ceil(requiredCupMonth / operationalDays) : 0;
  }, [targetPaybackMonths, investmentVal, totalOpexVal, financialSummary.avgContributionMargin, currentBep.operationalDays]);

  // Categories profit breakdown
  const categorySummaryBreakdown = useMemo(() => {
    const categories = ['Minuman', 'Makanan', 'Snack', 'Lainnya'];
    const map = {};
    categories.forEach(cat => {
      map[cat] = { opex: 0, revenue: 0, cogs: 0, volume: 0, margin: 0 };
    });

    activeMenus.forEach(m => {
      const cat = m.category || 'Lainnya';
      if (!map[cat]) map[cat] = { opex: 0, revenue: 0, cogs: 0, volume: 0, margin: 0 };

      const vol = getMenuVolume(m.id, num(m.ops?.estimasiCup));
      const price = getSellingPrice(m);
      const hpp = getDirectHPP(m);

      map[cat].volume += vol;
      map[cat].revenue += vol * price;
      map[cat].cogs += vol * hpp;
    });

    categories.forEach(cat => {
      map[cat].margin = map[cat].revenue - map[cat].cogs;
    });

    const totalVolume = financialSummary.totalVolume;

    // Expenses allocation
    (activeProfile.expenses || []).forEach(exp => {
      const value = num(exp.value);
      if (exp.category === 'Semua') {
        categories.forEach(cat => {
          const ratio = totalVolume > 0 ? map[cat].volume / totalVolume : 0;
          map[cat].opex += value * ratio;
        });
      } else if (map[exp.category]) {
        map[exp.category].opex += value;
      }
    });

    // Asset Depreciation allocation
    const assets = activeProfile.assets || [];
    assets.filter(a => a.enabled).forEach(aset => {
      const depVal = num(aset.tahun) > 0 ? num(aset.harga) / (num(aset.tahun) * 12) : 0;
      if (aset.category === 'Semua') {
        categories.forEach(cat => {
          const ratio = totalVolume > 0 ? map[cat].volume / totalVolume : 0;
          map[cat].opex += depVal * ratio;
        });
      } else if (map[aset.category]) {
        map[aset.category].opex += depVal;
      }
    });

    if (!activeProfile.usePenyusutan && num(activeProfile.penyusutan) > 0) {
      const depVal = num(activeProfile.penyusutan);
      categories.forEach(cat => {
        const ratio = totalVolume > 0 ? map[cat].volume / totalVolume : 0;
        map[cat].opex += depVal * ratio;
      });
    }

    return Object.entries(map).map(([cat, val]) => ({
      category: cat,
      ...val,
      netProfit: val.margin - val.opex
    }));
  }, [activeMenus, activeProfile, financialSummary.totalVolume, getMenuVolume, getSellingPrice, getDirectHPP]);

  const filteredMenus = useMemo(() => {
    return selectedMenus.filter(m => {
      const matchCat = filterCategory === 'Semua' || m.category === filterCategory;
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedMenus, filterCategory, search]);

  return (
    <div style={{ padding: '0 28px' }}>
      


      <div className="main-grid" style={{
        display: 'grid', gridTemplateColumns: '1fr 390px', gap: 20,
        alignItems: 'start'
      }}>
        
        {/* ══ LEFT PANEL ════════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── 1. Menu Selection and Sales Simulation ── */}
          <div className="section-card">
            <SectionHeader
              iconEmoji="🍔" iconBg="#eef2ff"
              title="Menu & Simulasi Penjualan Bulanan"
              badgeText="SIMULASI BISNIS" badgeClass="badge-indigo"
            />
            <div className="section-body">
              
              {/* Add Menu Control Bar */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap', background: 'var(--bg-app)', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)' }}>Tambah Menu ke Simulasi:</span>
                <select
                  className="hpp-input sm"
                  value={menuToAdd}
                  onChange={e => setMenuToAdd(e.target.value)}
                  style={{ maxWidth: 200, height: '30px' }}
                >
                  <option value="">-- Pilih Menu --</option>
                  {menus
                    .filter(m => !activeProfile.selectedMenuIds?.includes(m.id))
                    .map(m => (
                      <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>
                    ))
                  }
                </select>
                <button
                  className="btn btn-add btn-sm"
                  onClick={() => {
                    if (!menuToAdd) return;
                    onUpdateProfile({
                      selectedMenuIds: [...(activeProfile.selectedMenuIds || []), menuToAdd]
                    });
                    setMenuToAdd('');
                  }}
                  disabled={!menuToAdd}
                  style={{ height: '30px', padding: '0 12px' }}
                >
                  <Icon name="plus" size={11} /> Tambah
                </button>
                
                <span style={{ borderLeft: '1px solid var(--border-color)', height: 18, margin: '0 4px' }} />

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    const allIds = menus.map(m => m.id);
                    onUpdateProfile({
                      selectedMenuIds: allIds
                    });
                  }}
                  style={{ fontSize: 11, padding: '4px 10px', height: '30px' }}
                >
                  Tambah Semua
                </button>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    if (confirm('Kosongkan semua menu dari simulasi opex?')) {
                      onUpdateProfile({
                        selectedMenuIds: [],
                        disabledMenuIds: []
                      });
                    }
                  }}
                  style={{ fontSize: 11, padding: '4px 10px', color: '#ef4444', height: '30px' }}
                >
                  Kosongkan
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
                  <input
                    className="hpp-input sm"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Cari nama menu..."
                    style={{ paddingLeft: 28 }}
                  />
                  <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, pointerEvents: 'none' }}>
                    <Icon name="search" size={12} />
                  </span>
                </div>
                
                <select
                  className="hpp-input sm"
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  style={{ maxWidth: 140 }}
                >
                  <option value="Semua">Semua Kategori</option>
                  {opexCategories.filter(c => c !== 'Semua').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Set Diskon Promo Massal Cepat */}
              {selectedMenus.length > 0 && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14, padding: '8px 12px', background: 'var(--bg-app)', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: 11 }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    🏷️ Set Promo Massal:
                  </span>
                  {[0, 10, 15, 20, 25, 30].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleMassDiscount(pct)}
                      style={{
                        padding: '2px 8px',
                        fontSize: 10,
                        height: '24px',
                        background: pct === 0 ? 'rgba(239,68,68,0.1)' : 'var(--bg-card)',
                        color: pct === 0 ? '#ef4444' : 'var(--primary)',
                        border: '1px solid var(--border-color)',
                        fontWeight: 600
                      }}
                      title={pct === 0 ? "Reset diskon semua menu simulasi ke 0%" : `Terapkan diskon ${pct}% ke seluruh menu simulasi`}
                    >
                      {pct === 0 ? 'Reset 0%' : `${pct}% Off`}
                    </button>
                  ))}
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                    *Terapkan diskon simultan ke seluruh menu yang aktif
                  </span>
                </div>
              )}

              {/* Menus Table */}
              {filteredMenus.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: 13 }}>
                  Tidak ada menu di dalam simulasi opex. Silakan pilih menu di atas lalu klik Tambah.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  {/* View Mode Toggle */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center', background: 'var(--bg-app)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: 11 }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-text-muted)' }}>Mode Tampilan Tabel:</span>
                    <div style={{ display: 'flex', gap: 2, background: '#f4f4f5', padding: 2, borderRadius: 'var(--radius)' }}>
                      <button
                        type="button"
                        onClick={() => setIsSimpleView(true)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'calc(var(--radius) - 2px)',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 10,
                          fontWeight: 600,
                          background: isSimpleView ? 'var(--bg-card)' : 'transparent',
                          color: isSimpleView ? 'var(--color-text)' : 'var(--color-text-muted)',
                          boxShadow: isSimpleView ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                          transition: 'all 0.15s'
                        }}
                      >
                        Sederhana
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSimpleView(false)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'calc(var(--radius) - 2px)',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 10,
                          fontWeight: 600,
                          background: !isSimpleView ? 'var(--bg-card)' : 'transparent',
                          color: !isSimpleView ? 'var(--color-text)' : 'var(--color-text-muted)',
                          boxShadow: !isSimpleView ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                          transition: 'all 0.15s'
                        }}
                      >
                        Detail Analisis
                      </button>
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                      {isSimpleView ? 'Menampilkan metrik utama kas UMKM.' : 'Menampilkan rincian biaya, margin, komisi platform, & HPP.'}
                    </span>
                  </div>

                  <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table style={{ minWidth: isSimpleView ? 850 : 1250, width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', color: '#475569', fontWeight: 700, background: 'var(--bg-app)', fontSize: 11 }}>
                        <th style={{ padding: '8px 4px', width: 28, textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={filteredMenus.length > 0 && filteredMenus.every(m => !activeProfile.disabledMenuIds?.includes(m.id))}
                            onChange={e => handleToggleSelectAll(e.target.checked)}
                            style={{ cursor: 'pointer' }}
                          />
                        </th>
                        <th style={{ padding: '8px 8px', minWidth: 140 }}>
                          <span className="relative-tooltip" data-tooltip="Nama produk masakan atau minuman yang Anda daftarkan.">
                            Nama Menu
                          </span>
                        </th>
                        <th style={{ padding: '8px 8px', width: 125, textAlign: 'center' }}>
                          <span className="relative-tooltip" data-tooltip="Harga jual reguler produk sebelum dikenakan diskon promosi.">
                            Harga Normal
                          </span>
                        </th>
                        
                        <th style={{ padding: '8px 8px', width: 135, textAlign: 'center' }}>
                          <span className="relative-tooltip" data-tooltip="Nominal potongan harga yang Anda berikan untuk promosi.">
                            Diskon
                          </span>
                        </th>

                        <th style={{ padding: '8px 8px', width: 125, textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span className="relative-tooltip align-right" data-tooltip="Harga final yang dibayarkan oleh pembeli setelah dipotong diskon.">
                            Cust. Bayar
                          </span>
                        </th>

                        {!isSimpleView && (
                          <th style={{ padding: '8px 8px', width: 120, textAlign: 'right' }}>
                            <span className="relative-tooltip align-right" data-tooltip="Potongan biaya komisi persentase & flat fee yang diambil oleh platform online.">
                              Komisi
                            </span>
                          </th>
                        )}

                        <th style={{ padding: '8px 8px', width: 120, textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span className="relative-tooltip align-right" data-tooltip="Nominal bersih yang ditransfer platform ke rekening Anda setelah dipotong komisi.">
                            Uang Masuk
                          </span>
                        </th>

                        {!isSimpleView && (
                          <>
                            <th style={{ padding: '8px 8px', width: 105, textAlign: 'right' }}>
                              <span className="relative-tooltip align-right" data-tooltip="Total biaya modal bahan baku dan kemasan untuk memproduksi 1 unit.">
                                Direct HPP
                              </span>
                            </th>
                            <th style={{ padding: '8px 8px', width: 110, textAlign: 'right' }}>
                              <span className="relative-tooltip align-right" data-tooltip="Keuntungan kotor per unit setelah dikurangi biaya modal (HPP).">
                                Laba Kotor
                              </span>
                            </th>
                            <th style={{ padding: '8px 8px', width: 110, textAlign: 'right' }}>
                              <span className="relative-tooltip align-right" data-tooltip="Alokasi beban operasional bulanan (listrik, sewa, gaji, penyusutan) rata-rata per unit.">
                                Overhead
                              </span>
                            </th>
                          </>
                        )}

                        <th style={{ padding: '8px 8px', width: 110, textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span className="relative-tooltip align-right" data-tooltip="Keuntungan bersih akhir per unit setelah dikurangi biaya HPP dan biaya operasional.">
                            Laba Bersih
                          </span>
                        </th>

                        {!isSimpleView && (
                          <th style={{ padding: '8px 8px', width: 100, textAlign: 'right' }}>
                            <span className="relative-tooltip align-right" data-tooltip="Rasio keuntungan bersih terhadap harga yang dibayar customer.">
                              Margin
                            </span>
                          </th>
                        )}

                        <th style={{ padding: '8px 8px', width: 105, textAlign: 'center' }}>
                          <span className="relative-tooltip" data-tooltip="Estimasi volume penjualan produk dalam sebulan.">
                            Volume
                          </span>
                        </th>
                        <th style={{ padding: '8px 8px', width: 110, textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span className="relative-tooltip align-right" data-tooltip="Total laba bersih bulanan yang disumbangkan oleh menu ini (Laba Bersih/Cup × Volume).">
                            Total Laba
                          </span>
                        </th>
                        <th style={{ padding: '8px 4px', width: 35, textAlign: 'center' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMenus.map((menu) => {
                        const isEnabled = !activeProfile.disabledMenuIds?.includes(menu.id);
                        const pc = getPlatformCalc(menu);
                        const volume = getMenuVolume(menu.id, num(menu.ops?.estimasiCup));
                        
                        const alokasiOverhead = isEnabled ? financialSummary.avgOpexPerUnit : 0;
                        const labaSetelahHpp = pc.netProfit;
                        const labaBersihPerCup = isEnabled ? (labaSetelahHpp - alokasiOverhead) : 0;
                        const marginBersihPct = pc.hargaEfektif > 0 ? (labaBersihPerCup / pc.hargaEfektif) * 100 : 0;
                        const totalContribusi = isEnabled ? (volume * labaBersihPerCup) : 0;
                        const isProfit = labaBersihPerCup >= 0;
                        const isRowExpanded = expandedMenuId === menu.id;

                        return (
                          <React.Fragment key={menu.id}>
                            <tr
                              onClick={(e) => handleRowClick(e, menu.id)}
                              style={{
                                borderBottom: '1px solid var(--border-color)',
                                opacity: isEnabled ? 1 : 0.55,
                                background: isRowExpanded ? 'rgba(0,102,204,0.02)' : (isEnabled ? 'transparent' : 'var(--bg-app)'),
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                            >
                              {/* Checkbox */}
                              <td style={{ padding: '10px 4px', textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={isEnabled}
                                  onChange={() => handleToggleMenuSelect(menu.id)}
                                  style={{ cursor: 'pointer' }}
                                />
                              </td>

                              {/* Menu & Channel */}
                              <td style={{ padding: '10px 8px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                  <button
                                    onClick={() => onNavigateToCalculator && onNavigateToCalculator(menu.id)}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', gap: 5,
                                      background: isEnabled ? 'var(--bg-app)' : 'var(--bg-card)',
                                      border: '1px solid var(--border-color)', padding: '4px 8px',
                                      borderRadius: 6, color: 'var(--color-text)', fontWeight: 600,
                                      fontSize: 12, cursor: 'pointer', transition: 'all 0.15s ease',
                                      textAlign: 'left'
                                    }}
                                    onMouseOver={e => {
                                      e.currentTarget.style.background = 'rgba(0,102,204,0.08)';
                                      e.currentTarget.style.borderColor = 'var(--primary)';
                                      e.currentTarget.style.color = 'var(--primary)';
                                    }}
                                    onMouseOut={e => {
                                      e.currentTarget.style.background = isEnabled ? 'var(--bg-app)' : 'var(--bg-card)';
                                      e.currentTarget.style.borderColor = 'var(--border-color)';
                                      e.currentTarget.style.color = 'var(--color-text)';
                                    }}
                                    title="Klik untuk edit / hitung HPP"
                                  >
                                    <span style={{ fontSize: 13 }}>{menu.emoji}</span>
                                    <span>{menu.name}</span>
                                  </button>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span className="badge badge-slate" style={{ fontSize: 9 }}>{menu.category}</span>
                                    {pc.hasPlatform ? (
                                      <span style={{
                                        fontSize: 9, padding: '1px 5px', borderRadius: 8,
                                        background: getPlatformColors(pc.platformName).background,
                                        color: getPlatformColors(pc.platformName).color,
                                        fontWeight: 700
                                      }}>
                                        {pc.platformName} ({pc.commissionPct}%)
                                      </span>
                                    ) : (
                                      <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>Direct</span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Harga Normal */}
                              <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                <div className="input-prefix-wrap sm" style={{ width: 105, minWidth: 105, margin: '0 auto' }}>
                                  <span className="prefix">Rp</span>
                                  <FormatInput
                                    className="hpp-input sm"
                                    style={{ fontWeight: 600, textAlign: 'center' }}
                                    value={pc.hargaJual}
                                    onChange={val => handlePriceChange(menu, val)}
                                    disabled={!isEnabled}
                                  />
                                </div>
                              </td>

                              {/* Diskon Merchant */}
                              <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleDiscountChange(menu, 'discountType', menu.platform?.discountType === 'nominal' ? 'pct' : 'nominal')}
                                    disabled={!isEnabled}
                                    style={{
                                      padding: '2px 5px',
                                      fontSize: 9,
                                      fontWeight: 800,
                                      borderRadius: 5,
                                      border: '1px solid var(--border-color)',
                                      background: menu.platform?.discountType === 'nominal' ? '#e0e7ff' : '#fef3c7',
                                      color: menu.platform?.discountType === 'nominal' ? '#4338ca' : '#b45309',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {menu.platform?.discountType === 'nominal' ? 'Rp' : '%'}
                                  </button>

                                  <div className="input-prefix-wrap sm" style={{ width: 90, minWidth: 90 }}>
                                    {menu.platform?.discountType === 'nominal' && <span className="prefix">Rp</span>}
                                    <FormatInput
                                      className="hpp-input sm"
                                      style={{
                                        paddingLeft: menu.platform?.discountType === 'nominal' ? 28 : 8,
                                        borderColor: pc.diskonNominal > 0 ? '#f59e0b' : 'var(--border-color)',
                                        fontWeight: pc.diskonNominal > 0 ? 700 : 400,
                                        color: pc.diskonNominal > 0 ? '#b45309' : 'var(--color-text)',
                                        textAlign: 'center'
                                      }}
                                      value={menu.platform?.discountValue || 0}
                                      onChange={val => handleDiscountChange(menu, 'discountValue', val)}
                                      disabled={!isEnabled}
                                    />
                                  </div>
                                </div>
                              </td>

                              {/* Customer Membayar */}
                              <td className="mono" style={{ padding: '10px 8px', textAlign: 'right', whiteSpace: 'nowrap', color: '#3b82f6', fontWeight: 700 }}>
                                {fmtRp(pc.hargaEfektif)}
                              </td>

                              {/* Komisi Platform */}
                              {!isSimpleView && (
                                <td className="mono" style={{ padding: '10px 8px', textAlign: 'right', whiteSpace: 'nowrap', color: '#dc2626' }}>
                                  −{fmtRp(pc.totalKomisi)}
                                </td>
                              )}

                              {/* Uang Masuk Merchant */}
                              <td className="mono" style={{ padding: '10px 8px', textAlign: 'right', whiteSpace: 'nowrap', color: '#10b981', fontWeight: 700 }}>
                                {fmtRp(pc.revenueBersih)}
                              </td>

                              {/* Direct HPP */}
                              {!isSimpleView && (
                                <td className="mono" style={{ padding: '10px 8px', textAlign: 'right', whiteSpace: 'nowrap', color: '#ea580c' }}>
                                  {fmtRp(pc.hpp)}
                                </td>
                              )}

                              {/* Laba Setelah HPP */}
                              {!isSimpleView && (
                                <td className="mono" style={{ padding: '10px 8px', textAlign: 'right', whiteSpace: 'nowrap', color: '#10b981' }}>
                                  {fmtRp(labaSetelahHpp)}
                                </td>
                              )}

                              {/* Alokasi Overhead */}
                              {!isSimpleView && (
                                <td className="mono" style={{ padding: '10px 8px', textAlign: 'right', whiteSpace: 'nowrap', color: '#71717a' }}>
                                  {fmtRp(alokasiOverhead)}
                                </td>
                              )}

                              {/* Laba Bersih/Cup */}
                              <td className="mono" style={{ padding: '10px 8px', textAlign: 'right', whiteSpace: 'nowrap', color: isProfit ? '#10b981' : '#dc2626', fontWeight: 800 }}>
                                {fmtRp(labaBersihPerCup)}
                              </td>

                              {/* Margin Bersih */}
                              {!isSimpleView && (
                                <td className="mono" style={{ padding: '10px 8px', textAlign: 'right', whiteSpace: 'nowrap', color: isProfit ? '#10b981' : '#dc2626' }}>
                                  {marginBersihPct.toFixed(1)}%
                                </td>
                              )}

                              {/* Volume */}
                              <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                <input
                                  type="number"
                                  className="hpp-input sm center"
                                  style={{ maxWidth: 95, margin: '0 auto', display: 'block', fontWeight: 700 }}
                                  value={volume}
                                  onChange={e => handleVolumeChange(menu.id, e.target.value)}
                                  disabled={!isEnabled}
                                />
                              </td>

                              {/* Total Kontribusi */}
                              <td className="mono" style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: totalContribusi >= 0 ? '#10b981' : '#dc2626', whiteSpace: 'nowrap' }}>
                                {fmtRp(totalContribusi)}
                              </td>

                              {/* Aksi */}
                              <td style={{ padding: '10px 4px', textAlign: 'center' }}>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => {
                                    onUpdateProfile({
                                      selectedMenuIds: activeProfile.selectedMenuIds.filter(id => id !== menu.id),
                                      disabledMenuIds: (activeProfile.disabledMenuIds || []).filter(id => id !== menu.id)
                                    });
                                  }}
                                  style={{ color: '#ef4444', padding: '4px 6px', height: 'auto', width: 'auto', border: 'none', background: 'transparent' }}
                                  title="Hapus dari simulasi"
                                >
                                  <Icon name="trash" size={11} />
                                </button>
                              </td>
                            </tr>

                            {/* Timeline Cash Flow Accordion */}
                            {isRowExpanded && (
                              <tr onClick={(e) => e.stopPropagation()}>
                                <td colSpan={isSimpleView ? 10 : 15} style={{ padding: '16px 20px', background: '#fafafa', borderBottom: '1px solid var(--border-color)', cursor: 'default' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
                                    {/* Timeline Flow */}
                                    <div>
                                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: 'var(--color-text)' }}>
                                        Timeline Alur Uang (Cash Flow) per Cup — {menu.name}
                                      </div>
                                      
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', paddingLeft: 16 }}>
                                        <div style={{ position: 'absolute', left: 4, top: 8, bottom: 8, width: 2, background: 'var(--border-color)' }} />
                                        
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', position: 'relative', marginBottom: 12 }}>
                                          <div style={{ position: 'absolute', left: -15, top: 4, width: 7, height: 7, borderRadius: '50%', background: '#71717a' }} />
                                          <div>
                                            <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>1. Harga Jual Normal</div>
                                            <div style={{ fontSize: 12, fontWeight: 700 }}>{fmtRp(pc.hargaJual)}</div>
                                          </div>
                                        </div>

                                        {pc.diskonNominal > 0 && (
                                          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', position: 'relative', marginBottom: 12 }}>
                                            <div style={{ position: 'absolute', left: -15, top: 4, width: 7, height: 7, borderRadius: '50%', background: '#dc2626' }} />
                                            <div>
                                              <div style={{ fontSize: 10, color: '#dc2626' }}>2. Diskon Merchant ({pc.diskonPct.toFixed(0)}%)</div>
                                              <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>− {fmtRp(pc.diskonNominal)}</div>
                                            </div>
                                          </div>
                                        )}

                                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', position: 'relative', marginBottom: 12 }}>
                                          <div style={{ position: 'absolute', left: -15, top: 4, width: 7, height: 7, borderRadius: '50%', background: '#3b82f6' }} />
                                          <div>
                                            <div style={{ fontSize: 10, color: '#3b82f6' }}>3. Customer Membayar</div>
                                            <div style={{ fontSize: 12, fontWeight: 800, color: '#3b82f6' }}>{fmtRp(pc.hargaEfektif)}</div>
                                          </div>
                                        </div>

                                        {pc.totalKomisi > 0 && (
                                          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', position: 'relative', marginBottom: 12 }}>
                                            <div style={{ position: 'absolute', left: -15, top: 4, width: 7, height: 7, borderRadius: '50%', background: '#dc2626' }} />
                                            <div>
                                              <div style={{ fontSize: 10, color: '#dc2626' }}>4. Potongan Komisi Platform ({pc.hargaEfektif > 0 ? ((pc.totalKomisi / pc.hargaEfektif) * 100).toFixed(1) : 0}%)</div>
                                              <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>− {fmtRp(pc.totalKomisi)}</div>
                                            </div>
                                          </div>
                                        )}

                                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', position: 'relative', marginBottom: 12 }}>
                                          <div style={{ position: 'absolute', left: -15, top: 4, width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
                                          <div>
                                            <div style={{ fontSize: 10, color: '#10b981' }}>5. Uang Masuk Merchant</div>
                                            <div style={{ fontSize: 12, fontWeight: 800, color: '#10b981' }}>{fmtRp(pc.revenueBersih)}</div>
                                            <div style={{ fontSize: 9, color: 'var(--color-text-muted)', marginTop: 2, fontFamily: 'monospace' }}>
                                              Rumus: = Customer Membayar ({fmtRp(pc.hargaEfektif)}) − Komisi Platform ({fmtRp(pc.totalKomisi)})
                                            </div>
                                          </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', position: 'relative', marginBottom: 12 }}>
                                          <div style={{ position: 'absolute', left: -15, top: 4, width: 7, height: 7, borderRadius: '50%', background: '#ea580c' }} />
                                          <div>
                                            <div style={{ fontSize: 10, color: '#ea580c' }}>6. Modal Produksi (Direct HPP) ({pc.hargaEfektif > 0 ? ((pc.hpp / pc.hargaEfektif) * 100).toFixed(1) : 0}%)</div>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: '#ea580c' }}>− {fmtRp(pc.hpp)}</div>
                                          </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', position: 'relative', marginBottom: 12 }}>
                                          <div style={{ position: 'absolute', left: -15, top: 4, width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
                                          <div>
                                            <div style={{ fontSize: 10, color: '#10b981' }}>7. Laba Setelah HPP</div>
                                            <div style={{ fontSize: 12, fontWeight: 800, color: '#10b981' }}>{fmtRp(labaSetelahHpp)}</div>
                                            <div style={{ fontSize: 9, color: 'var(--color-text-muted)', marginTop: 2, fontFamily: 'monospace' }}>
                                              Rumus: = Uang Masuk Merchant ({fmtRp(pc.revenueBersih)}) − Direct HPP ({fmtRp(pc.hpp)})
                                            </div>
                                          </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', position: 'relative', marginBottom: 12 }}>
                                          <div style={{ position: 'absolute', left: -15, top: 4, width: 7, height: 7, borderRadius: '50%', background: '#71717a' }} />
                                          <div>
                                            <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>8. Alokasi Overhead (OPEX) ({pc.hargaEfektif > 0 ? ((alokasiOverhead / pc.hargaEfektif) * 100).toFixed(1) : 0}%)</div>
                                            <div style={{ fontSize: 12, fontWeight: 700 }}>− {fmtRp(alokasiOverhead)}</div>
                                          </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', position: 'relative' }}>
                                          <div style={{ position: 'absolute', left: -16, top: 4, width: 9, height: 9, borderRadius: '50%', background: isProfit ? '#10b981' : '#dc2626' }} />
                                          <div>
                                            <div style={{ fontSize: 10, color: isProfit ? '#10b981' : '#dc2626', fontWeight: 700 }}>9. Laba Bersih / Cup ({marginBersihPct.toFixed(1)}%)</div>
                                            <div style={{ fontSize: 14, fontWeight: 900, color: isProfit ? '#10b981' : '#dc2626' }}>{fmtRp(labaBersihPerCup)}</div>
                                            <div style={{ fontSize: 9, color: 'var(--color-text-muted)', marginTop: 2, fontFamily: 'monospace' }}>
                                              Rumus: = Laba Setelah HPP ({fmtRp(labaSetelahHpp)}) − Alokasi Overhead ({fmtRp(alokasiOverhead)})
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Mini Summary Card on the right */}
                                    <div style={{
                                      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                                      borderRadius: 'var(--radius)', padding: 14, boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}>
                                      <div style={{ fontWeight: 700, fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 10, textTransform: 'uppercase' }}>
                                        Ringkasan Menu per Unit
                                      </div>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {[
                                          { label: 'Harga Jual Menu', val: pc.hargaJual, color: 'var(--color-text)' },
                                          { label: 'Diskon Promosi', val: pc.diskonNominal, color: '#dc2626', prefix: '− ' },
                                          { label: 'Customer Membayar', val: pc.hargaEfektif, color: '#3b82f6', bold: true },
                                          { label: 'Komisi Platform', val: pc.totalKomisi, color: '#dc2626', prefix: '− ' },
                                          { label: 'Uang Masuk Merchant', val: pc.revenueBersih, color: '#10b981', bold: true },
                                          { label: 'Modal Produksi (HPP)', val: pc.hpp, color: '#ea580c', prefix: '− ' },
                                          { label: 'Laba Setelah HPP', val: labaSetelahHpp, color: '#10b981', bold: true },
                                          { label: 'Alokasi Overhead', val: alokasiOverhead, color: 'var(--color-text-muted)', prefix: '− ' },
                                          { label: 'Laba Bersih Final', val: labaBersihPerCup, color: labaBersihPerCup >= 0 ? '#10b981' : '#dc2626', bold: true },
                                          { label: 'Persentase Laba Bersih', val: `${marginBersihPct.toFixed(1)}%`, color: labaBersihPerCup >= 0 ? '#10b981' : '#dc2626', raw: true }
                                        ].map(({ label, val, color, bold, prefix, raw }) => (
                                          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                            <span style={{ color: 'var(--color-text-muted)', fontWeight: bold ? 600 : 400 }}>{label}</span>
                                            <span className="mono" style={{ fontWeight: bold ? 800 : 600, color }}>
                                              {raw ? val : `${prefix || ''}${fmtRp(val)}`}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}
            </div>
            <div className="section-footer bg-accent-blue" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontWeight: 600 }}>Terpilih: {activeMenus.length} dari {selectedMenus.length} Menu Simulasi ({menus.length} di Database)</span>
              <span style={{ fontWeight: 800 }}>Volume Terakumulasi: {financialSummary.totalVolume.toLocaleString('id-ID')} unit</span>
            </div>

            {/* Target Volume and Gembok Control (Placed at the bottom of the card, below the total summary footer) */}
            <div
              className={activeProfile.isTotalVolumeLocked ? 'bg-accent-green' : 'bg-accent-yellow'}
              style={{
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14,
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
                transition: 'background-color 0.2s',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                    🏪 Estimasi Volume Penjualan Bulanan (Total)
                  </span>
                  
                  {activeProfile.isTotalVolumeLocked ? (
                    <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Icon name="lock" size={10} /> Target Terkunci
                    </span>
                  ) : (
                    <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Icon name="unlock" size={10} /> Mode Bebas
                    </span>
                  )}
                </div>
                
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, lineHeight: 1.4 }}>
                  {activeProfile.isTotalVolumeLocked 
                    ? "Target Volume dikunci. Mengubah volume menu item akan otomatis menyesuaikan item menu lainnya agar total tetap konstan." 
                    : "Mode bebas. Mengubah volume per menu akan otomatis menjumlahkan & memperbarui total volume penjualan."}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span className="label-xs" style={{ fontSize: 9, color: '#94a3b8', marginBottom: 2 }}>Target Total Volume</span>
                  <div className="input-prefix-wrap" style={{ maxWidth: 110 }}>
                    <FormatInput
                      className="hpp-input center"
                      style={{ fontWeight: 800, fontSize: 14, padding: '5px 8px', borderColor: activeProfile.isTotalVolumeLocked ? '#10b981' : '#cbd5e1' }}
                      value={activeProfile.totalVolume}
                      onChange={handleTotalVolumeChange}
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => onUpdateProfile({ isTotalVolumeLocked: !activeProfile.isTotalVolumeLocked })}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: `1.5px solid ${activeProfile.isTotalVolumeLocked ? '#10b981' : 'var(--border-color)'}`,
                    background: activeProfile.isTotalVolumeLocked ? 'rgba(16,185,129,0.1)' : 'var(--bg-card)',
                    color: activeProfile.isTotalVolumeLocked ? '#10b981' : 'var(--color-text)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 13,
                    transition: 'all 0.15s',
                    boxShadow: activeProfile.isTotalVolumeLocked ? '0 2px 6px rgba(16,185,129,0.15)' : 'none'
                  }}
                  title={activeProfile.isTotalVolumeLocked ? "Buka gembok total volume (Mode Bebas)" : "Kunci gembok total volume (Target Tetap)"}
                >
                  <Icon name={activeProfile.isTotalVolumeLocked ? "lock" : "unlock"} size={14} />
                </button>
              </div>
            </div>
          </div>
          <div className="section-card">
            <SectionHeader
              iconEmoji="zap" iconBg="#fef3c7"
              title="Biaya Operasional Bulanan (Overhead)"
              badgeText="OPERASIONAL" badgeClass="badge-orange"
              actions={
                <button className="btn btn-primary btn-sm" onClick={addExpense}>
                  <Icon name="plus" size={11} /> Tambah Biaya
                </button>
              }
            />
            <div className="section-body">
              {(!activeProfile.expenses || activeProfile.expenses.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: 13 }}>
                  Belum ada pengeluaran operasional ditambahkan di profil ini.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {activeProfile.expenses.map((exp) => (
                    <div
                      key={exp.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 140px 140px auto',
                        gap: 8,
                        alignItems: 'center',
                        background: 'var(--bg-app)',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div>
                        <label className="label-sm" style={{ display: 'block', marginBottom: 2 }}>Nama Pengeluaran</label>
                        <input
                          className="hpp-input sm"
                          value={exp.name}
                          onChange={e => updateExpense(exp.id, 'name', e.target.value)}
                          placeholder="Listrik, Air, Gaji..."
                          style={{ fontWeight: 600 }}
                        />
                      </div>
                      
                      <div>
                        <label className="label-sm" style={{ display: 'block', marginBottom: 2 }}>Kategori Pembebanan</label>
                        <select
                          className="hpp-input sm"
                          value={exp.category || 'Semua'}
                          onChange={e => updateExpense(exp.id, 'category', e.target.value)}
                          style={{ fontWeight: 500 }}
                        >
                          {opexCategories.map(c => (
                            <option key={c} value={c}>{c === 'Semua' ? 'Semua (Bagi Rata)' : c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="label-sm" style={{ display: 'block', marginBottom: 2 }}>Biaya Bulanan</label>
                        <div className="input-prefix-wrap">
                          <span className="prefix">Rp</span>
                          <FormatInput
                            className="hpp-input sm"
                            placeholder="0"
                            value={exp.value || ''}
                            onChange={v => updateExpense(exp.id, 'value', v)}
                          />
                        </div>
                      </div>

                      <button
                        className="btn btn-danger"
                        onClick={() => removeExpense(exp.id)}
                        title="Hapus"
                        style={{ height: 29, width: 29, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 15 }}
                      >
                        <Icon name="trash" size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="section-footer bg-accent-yellow" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ fontWeight: 600 }}>Sub-total Pengeluaran Overhead</span>
              <span className="mono" style={{ fontWeight: 800, fontSize: 15 }}>{fmtRp(totalExpenses)}</span>
            </div>
          </div>

          {/* ── 3. Central Assets depreciation ── */}
          <div className="section-card">
            <SectionHeader
              iconEmoji="tool" iconBg="#ecfdf5"
              title="Penyusutan Aset & Peralatan"
              badgeText="DATABASE ASET" badgeClass="badge-emerald"
            />
            <div className="section-body">
              <div className="flex-between bg-accent-green" style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 8, border: '1px solid' }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Depresiasi Umur Ekonomis</span>
                  <div style={{ fontSize: 10, marginTop: 2 }}>Mendepresiasi mesin/alat berdasarkan umur dalam tahun secara bulanan.</div>
                </div>
                <label className="pkg-toggle" htmlFor="use-penyusutan-opex">
                  <input
                    type="checkbox"
                    id="use-penyusutan-opex"
                    checked={activeProfile.usePenyusutan}
                    onChange={e => onUpdateProfile({ usePenyusutan: e.target.checked })}
                  />
                  <div className="toggle-pill" />
                </label>
              </div>

              {activeProfile.usePenyusutan ? (
                (regularCentralAssets.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '24px 12px', color: '#94a3b8', fontSize: 12, border: '1px dashed var(--border-color)', borderRadius: 8 }}>
                    Belum ada aset operasional reguler tercatat di Database. Silakan tambah data di tab <strong>Data {"->"} Aset &amp; Belanja</strong>.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                      Pilih (centang) aset dari database untuk dibebankan penyusutannya pada profil ini:
                    </div>
                    {regularCentralAssets.map((ca) => {
                      const isSelected = (activeProfile.assets || []).some(a => a.assetId === ca.id);
                      const blnVal = num(ca.tahun) > 0 ? num(ca.harga) / (num(ca.tahun) * 12) : 0;
                      return (
                        <div
                          key={ca.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            background: isSelected ? 'var(--bg-card)' : 'var(--bg-app)',
                            opacity: isSelected ? 1 : 0.7,
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                            transition: 'all 0.15s'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleAssetSelection(ca.id)}
                            style={{ width: 16, height: 16, cursor: 'pointer' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{ca.name}</div>
                            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>
                              Kategori: {ca.category || 'Semua'} &bull; Umur: {ca.tahun} Tahun
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 600, fontSize: 12 }}>{fmtRp(ca.harga)}</div>
                            <div style={{ fontSize: 10, color: '#10b981', fontWeight: 600, marginTop: 2 }}>
                              Depresiasi: {fmtRp(blnVal)}/bln
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: 4 }}>Penyusutan Aset Manual (Rp/bulan)</label>
                  <div className="input-prefix-wrap">
                    <span className="prefix">Rp</span>
                    <FormatInput
                      className="hpp-input"
                      placeholder="0"
                      value={activeProfile.penyusutan || ''}
                      onChange={val => onUpdateProfile({ penyusutan: val })}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="section-footer bg-accent-green" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ fontWeight: 600 }}>Sub-total Penyusutan Bulanan</span>
              <span className="mono" style={{ fontWeight: 800, fontSize: 15 }}>{fmtRp(totalAssetDepreciation)}</span>
            </div>
          </div>

          {/* ── 4. Ringkasan Revenue & Diskon Bulanan (Standalone Section Card) ── */}
          <div className="section-card">
            <SectionHeader
              iconEmoji="chart" iconBg="#e0f2fe"
              title="Ringkasan Revenue & Diskon Bulanan"
              badgeText="AKUMULASI REVENUE" badgeClass="badge-indigo"
            />
            <div className="section-body">
              
              {/* KPI Summary Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 10,
                marginBottom: 16
              }}>
                {/* Omset Normal */}
                <div style={{ background: 'var(--bg-app)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 9, color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.02em' }}>OMSET NORMAL</div>
                  <div className="mono" style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)', marginTop: 2 }}>
                    {fmtRp(financialSummary.totalRevenue)}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--color-text-muted)', marginTop: 2 }}>Harga Normal × Volume</div>
                </div>

                {/* Diskon Merchant */}
                <div style={{ background: financialSummary.totalDiskon > 0 ? '#fffbe6' : 'var(--bg-app)', padding: '10px 12px', borderRadius: 8, border: `1px solid ${financialSummary.totalDiskon > 0 ? '#ffe58f' : 'var(--border-color)'}` }}>
                  <div style={{ fontSize: 9, color: financialSummary.totalDiskon > 0 ? '#b45309' : 'var(--color-text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="tag" size={11} color="#b45309" /> POTONGAN DISKON
                  </div>
                  <div className="mono" style={{ fontSize: 15, fontWeight: 800, color: financialSummary.totalDiskon > 0 ? '#d97706' : 'var(--color-text-muted)', marginTop: 2 }}>
                    {financialSummary.totalDiskon > 0 ? `- ${fmtRp(financialSummary.totalDiskon)}` : 'Rp 0'}
                  </div>
                  <div style={{ fontSize: 9, color: financialSummary.totalDiskon > 0 ? '#b45309' : 'var(--color-text-muted)', marginTop: 2 }}>
                    Potongan Toko/Merchant
                  </div>
                </div>

                {/* Revenue Stlh Diskon */}
                <div style={{ background: '#f0f9ff', padding: '10px 12px', borderRadius: 8, border: '1px solid #bae6fd' }}>
                   <div style={{ fontSize: 9, color: '#0369a1', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="dollar" size={11} color="#0369a1" /> TOTAL CUSTOMER BAYAR
                  </div>
                  <div className="mono" style={{ fontSize: 15, fontWeight: 900, color: '#0284c7', marginTop: 2 }}>
                    {fmtRp(financialSummary.totalEffectiveRevenue)}
                  </div>
                  <div style={{ fontSize: 9, color: '#0284c7', marginTop: 2 }}>Omset Efektif Real Konsumen</div>
                </div>

                {/* Nett Revenue */}
                <div style={{ background: '#eef2ff', padding: '10px 12px', borderRadius: 8, border: '1px solid #c7d2fe' }}>
                  <div style={{ fontSize: 9, color: '#3730a3', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="bank" size={11} color="#3730a3" /> UANG MASUK MERCHANT
                  </div>
                  <div className="mono" style={{ fontSize: 15, fontWeight: 900, color: '#4338ca', marginTop: 2 }}>
                    {fmtRp(financialSummary.totalNetRevenue)}
                  </div>
                  <div style={{ fontSize: 9, color: '#6366f1', marginTop: 2 }}>Stlh Komisi Platform</div>
                </div>

                {/* Direct HPP */}
                <div style={{ background: '#fff1f2', padding: '10px 12px', borderRadius: 8, border: '1px solid #fecdd3' }}>
                  <div style={{ fontSize: 9, color: '#9f1239', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="package" size={11} color="#9f1239" /> TOTAL DIRECT HPP
                  </div>
                  <div className="mono" style={{ fontSize: 15, fontWeight: 800, color: '#be123c', marginTop: 2 }}>
                    - {fmtRp(financialSummary.totalCOGS)}
                  </div>
                  <div style={{ fontSize: 9, color: '#e11d48', marginTop: 2 }}>Biaya Bahan + Kemasan</div>
                </div>

                {/* Rasio HPP stlh Diskon */}
                <div style={{
                  background: financialSummary.avgHppPctAfterDiscount > 50 ? '#fef2f2' : financialSummary.avgHppPctAfterDiscount > 35 ? '#fffbe6' : '#f0fdf4',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${financialSummary.avgHppPctAfterDiscount > 50 ? '#fca5a5' : financialSummary.avgHppPctAfterDiscount > 35 ? '#fde68a' : '#86efac'}`
                }}>
                  <div style={{ fontSize: 9, color: financialSummary.avgHppPctAfterDiscount > 50 ? '#991b1b' : financialSummary.avgHppPctAfterDiscount > 35 ? '#92400e' : '#166534', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="trending" size={11} /> PERSENTASE HPP
                  </div>
                  <div className="mono" style={{ fontSize: 15, fontWeight: 900, color: financialSummary.avgHppPctAfterDiscount > 50 ? '#dc2626' : financialSummary.avgHppPctAfterDiscount > 35 ? '#d97706' : '#15803d', marginTop: 2 }}>
                    {financialSummary.avgHppPctAfterDiscount.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--color-text-muted)', marginTop: 2 }}>Rasio HPP ÷ Omset Efektif</div>
                </div>
              </div>

              {/* Table Waterfall Flow Detail */}
              <div style={{ background: 'var(--bg-app)', padding: 14, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-text)', marginBottom: 10, letterSpacing: '0.01em', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="fileText" size={13} color="var(--primary)" /> ALUR DETAIL CASH FLOW SEBELUM OPEX:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12 }}>
                  <div className="flex-between" style={{ padding: '4px 0', borderBottom: '1px dashed var(--border-color)' }}>
                    <span>1. Omset Penjualan Normal</span>
                    <span className="mono" style={{ fontWeight: 700 }}>{fmtRp(financialSummary.totalRevenue)}</span>
                  </div>
                  <div className="flex-between" style={{ padding: '4px 0', borderBottom: '1px dashed var(--border-color)', color: '#d97706' }}>
                    <span>2. Potongan Diskon Merchant</span>
                    <span className="mono" style={{ fontWeight: 700 }}>
                      {financialSummary.totalDiskon > 0 ? `- ${fmtRp(financialSummary.totalDiskon)}` : 'Rp 0'}
                    </span>
                  </div>
                  <div className="flex-between" style={{ padding: '6px 10px', background: '#f0f9ff', borderRadius: 6, color: '#0369a1', fontWeight: 800 }}>
                    <span>= Total Pembayaran Customer</span>
                    <span className="mono" style={{ fontSize: 13 }}>{fmtRp(financialSummary.totalEffectiveRevenue)}</span>
                  </div>
                  {financialSummary.totalPlatformCut > 0 && (
                    <div className="flex-between" style={{ padding: '4px 0', borderBottom: '1px dashed var(--border-color)', color: '#dc2626' }}>
                      <span>3. Potongan Komisi Platform</span>
                      <span className="mono" style={{ fontWeight: 700 }}>- {fmtRp(financialSummary.totalPlatformCut)}</span>
                    </div>
                  )}
                  <div className="flex-between" style={{ padding: '6px 10px', background: '#eef2ff', borderRadius: 6, color: '#3730a3', fontWeight: 800 }}>
                    <span>= Uang Masuk Merchant (Kas)</span>
                    <span className="mono" style={{ fontSize: 13 }}>{fmtRp(financialSummary.totalNetRevenue)}</span>
                  </div>
                  <div className="flex-between" style={{ padding: '4px 0', borderBottom: '1px dashed var(--border-color)', color: '#be123c' }}>
                    <span>4. Total Modal Produksi (Direct HPP)</span>
                    <span className="mono" style={{ fontWeight: 700 }}>- {fmtRp(financialSummary.totalCOGS)}</span>
                  </div>
                  <div className="flex-between" style={{ padding: '8px 10px', background: 'var(--bg-card)', border: '1.5px solid var(--primary)', borderRadius: 6, color: 'var(--primary)', fontWeight: 900 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="trophy" size={14} /> Total Laba Setelah HPP</span>
                    <span className="mono" style={{ fontSize: 14 }}>{fmtRp(financialSummary.totalGrossProfit)}</span>
                  </div>
                </div>
              </div>

            </div>
            <div className="section-footer bg-accent-blue" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ fontWeight: 600 }}>Total Volume Terjual: {financialSummary.totalVolume.toLocaleString('id-ID')} unit</span>
              <span style={{ fontWeight: 800 }}>Rasio HPP stlh Diskon: {financialSummary.avgHppPctAfterDiscount.toFixed(1)}%</span>
            </div>
          </div>

        </div>

        {/* ══ RIGHT PANEL (STICKY SUMMARY) ═════════════════════ */}
        <div className="result-sticky" style={{ position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Profitability Main Summary Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius)',
              padding: 20,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              color: 'var(--color-text)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: 150, height: 150, borderRadius: '50%', background: financialSummary.netProfit >= 0 ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)', filter: 'blur(30px)', pointerEvents: 'none' }} />
            
            <div className="label-xs" style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>📊 KINERJA FINANSIAL: {activeProfile.name}</div>
            
            {/* Revenue Waterfall rows */}
            {[
              { label: 'Pendapatan Customer (Kotor)', val: financialSummary.totalRevenue, valColor: 'var(--color-text)', pctOfEffective: false },
              ...(financialSummary.totalDiskon > 0 ? [{ label: '↳ Total Diskon Merchant', val: -financialSummary.totalDiskon, valColor: '#dc2626', indent: true, pct: (financialSummary.totalDiskon / Math.max(1, financialSummary.totalRevenue)) * 100 }] : []),
              ...(financialSummary.totalDiskon > 0 ? [{ label: '= Total Pembayaran Customer', val: financialSummary.totalEffectiveRevenue, valColor: '#3b82f6', bold: true }] : []),
              ...(financialSummary.totalPlatformCut > 0 ? [{ label: '↳ Potongan Platform', val: -financialSummary.totalPlatformCut, valColor: '#dc2626', indent: true, pct: (financialSummary.totalPlatformCut / Math.max(1, financialSummary.totalEffectiveRevenue)) * 100 }] : []),
              { label: '= Total Uang Masuk Merchant', val: financialSummary.totalNetRevenue, valColor: '#10b981', bold: true },
              { label: '− Total Modal Produksi (HPP)', val: -financialSummary.totalCOGS, valColor: '#ea580c', pct: (financialSummary.totalCOGS / Math.max(1, financialSummary.totalEffectiveRevenue)) * 100 },
              { label: '= Total Laba Setelah HPP', val: financialSummary.totalGrossProfit, valColor: '#10b981', bold: true },
              { label: '− Total Biaya Operasional (Overhead)', val: -totalOpexVal, valColor: '#71717a', pct: (totalOpexVal / Math.max(1, financialSummary.totalEffectiveRevenue)) * 100 }
            ].map(({ label, val, valColor, bold, indent, pct }) => (
              <div key={label} className="result-row" style={{
                padding: '6px 0',
                paddingLeft: indent ? 12 : 0,
                borderBottom: bold ? '1px dashed var(--border-color)' : 'none',
                marginBottom: bold ? 4 : 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: indent ? 11 : 12, fontWeight: bold ? 700 : 500, color: indent ? 'var(--color-text-muted)' : 'var(--color-text)' }}>{label}</span>
                </div>
                <span className="mono" style={{ fontWeight: bold ? 800 : 600, fontSize: bold ? 13 : 11, color: valColor }}>
                  {val < 0 ? `− ${fmtRp(Math.abs(val))}` : fmtRp(val)}
                  {pct !== undefined && (
                    <span style={{ fontSize: 9, color: 'var(--color-text-muted)', marginLeft: 4, fontWeight: 500 }}>
                      ({pct.toFixed(1)}%)
                    </span>
                  )}
                </span>
              </div>
            ))}

            <div style={{ height: 1, background: 'var(--border-color)', margin: '12px 0' }} />

            {/* NET PROFIT CARD */}
            <div
              style={{
                background: financialSummary.netProfit >= 0 
                  ? '#f0fdf4' 
                  : '#fef2f2',
                borderRadius: 'var(--radius)',
                padding: '14px 16px',
                border: `1.5px solid ${financialSummary.netProfit >= 0 ? '#10b981' : '#ef4444'}`,
                textAlign: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: financialSummary.netProfit >= 0 ? '#15803d' : '#b91c1c', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {financialSummary.netProfit >= 0 ? '🏆 Laba Bersih Akhir' : '🚨 Estimasi Rugi Bersih'}
              </div>
              <div className="mono" style={{ fontWeight: 900, fontSize: 22, color: financialSummary.netProfit >= 0 ? '#15803d' : '#b91c1c' }}>
                {financialSummary.netProfit < 0 ? `− ${fmtRp(Math.abs(financialSummary.netProfit))}` : fmtRp(financialSummary.netProfit)}
                <span style={{ fontSize: 11, fontWeight: 600, marginLeft: 4 }}>
                  ({(financialSummary.netProfit / Math.max(1, financialSummary.totalEffectiveRevenue) * 100).toFixed(1)}%)
                </span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                Rumus: Laba Setelah HPP ({fmtRp(financialSummary.totalGrossProfit)}) − Biaya Operasional ({fmtRp(totalOpexVal)})
              </div>
            </div>
          </div>

          {/* Business BEP & Metrics Card */}
          <div className="section-card">
            <SectionHeader iconEmoji="📊" iconBg="#ecfdf5" title="Analisis Operasional & BEP" badgeText="METRIK" badgeClass="badge-emerald" />
            <div className="section-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              
              {financialSummary.totalDiskon > 0 && (
                <div style={{ background: 'var(--bg-app)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border-color)' }}>
                  <span className="label-xs" style={{ display: 'block', marginBottom: 2 }}>RASIO HPP SETELAH DISKON (RATA-RATA)</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="mono" style={{ fontSize: 16, fontWeight: 800, color: financialSummary.avgHppPctAfterDiscount > 60 ? '#ef4444' : 'var(--primary)' }}>
                      {financialSummary.avgHppPctAfterDiscount.toFixed(1)}%
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                      Total Direct HPP ÷ Revenue Stlh Diskon
                    </span>
                  </div>
                  <div style={{ fontSize: 10, marginTop: 4, lineHeight: 1.4, color: 'var(--color-text-muted)' }}>
                    Porsi beban HPP bahan baku &amp; kemasan terhadap pendapatan efektif setelah potongan diskon promosi.
                  </div>
                </div>
              )}

              <div style={{ background: 'var(--bg-app)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border-color)' }}>
                <span className="label-xs" style={{ display: 'block', marginBottom: 2 }}>BEBAN OPEX RATA-RATA (Metode Rata per Unit)</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="mono" style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)' }}>
                    {fmtRp(financialSummary.avgOpexPerUnit)} / unit
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                    Total OPEX ÷ Total Volume
                  </span>
                </div>
                <div style={{ fontSize: 10, marginTop: 4, lineHeight: 1.4 }}>
                  HPP Riil Gabungan = <strong style={{ color: 'var(--primary)' }}>Direct HPP + {fmtRp(financialSummary.avgOpexPerUnit)}</strong>.
                </div>
              </div>

              <div className="bg-accent-green" style={{ borderRadius: 8, padding: '10px 12px', border: '1px solid' }}>
                <span className="label-xs" style={{ display: 'block', marginBottom: 2 }}>TITIK IMPAS / BREAK-EVEN POINT (BEP)</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="mono" style={{ fontSize: 20, fontWeight: 900 }}>
                    {financialSummary.bepUnits.toLocaleString('id-ID')} <span style={{ fontSize: 12, fontWeight: 600 }}>unit/bln</span>
                  </span>
                  <span style={{ fontSize: 10 }}>
                    Volume Gabungan BEP
                  </span>
                </div>
                <div style={{ fontSize: 10, marginTop: 4 }}>
                  Volume penjualan gabungan yang dibutuhkan untuk menutup total biaya operasional sebesar <strong>{fmtRp(totalOpexVal)}</strong>
                  {currentBep.manualOpex !== null && <span style={{ color: 'var(--color-amber)', marginLeft: 4, fontWeight: 700 }}>(Override OPEX Aktif)</span>}.
                </div>
              </div>

              <div style={{ background: 'var(--bg-app)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border-color)' }}>
                <span className="label-xs" style={{ display: 'block', marginBottom: 2 }}>TARGET BEP HARIAN (Cup/Hari)</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="mono" style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>
                    {Math.ceil(financialSummary.bepUnits / currentBep.operationalDays)} unit / hari
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                    BEP Unit ÷ {currentBep.operationalDays} Hari
                  </span>
                </div>
                <div style={{ fontSize: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Target penjualan harian anti-rugi.</span>
                  {onNavigateToBep && (
                    <button 
                      onClick={onNavigateToBep}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: 10, padding: 0 }}
                    >
                      Buka Simulasi BEP →
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-accent-blue" style={{ borderRadius: 8, padding: '10px 12px', border: '1px solid' }}>
                <span className="label-xs" style={{ display: 'block', marginBottom: 2 }}>TARGET BEP GABUNGAN (Cup/Hari)</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="mono" style={{ fontSize: 16, fontWeight: 900 }}>
                    {investmentVal > 0 ? (
                      `${Math.ceil(financialSummary.bepUnits / currentBep.operationalDays)} - ${requiredCupDay} unit / hari`
                    ) : (
                      `${Math.ceil(financialSummary.bepUnits / currentBep.operationalDays)} unit / hari`
                    )}
                  </span>
                  <span style={{ fontSize: 10 }}>
                    Rentang Operasional s.d. Balik Modal
                  </span>
                </div>
                <div style={{ fontSize: 10, marginTop: 4 }}>
                  {investmentVal > 0 ? (
                    `Batas Bawah Operasional: ${Math.ceil(financialSummary.bepUnits / currentBep.operationalDays)} unit. Batas Balik Modal (${targetPaybackMonths} Bln): ${requiredCupDay} unit.`
                  ) : (
                    `Tanpa nilai modal awal terdaftar, target disamakan dengan BEP Operasional.`
                  )}
                </div>
              </div>

              {(() => {
                const displayVolume = currentBep.actualVolume !== null ? num(currentBep.actualVolume) : financialSummary.totalVolume;
                const progressPct = displayVolume / Math.max(1, financialSummary.bepUnits) * 100;
                if (displayVolume <= 0) return null;
                return (
                  <div style={{ padding: '4px 2px' }}>
                    <div className="flex-between" style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                      <span>Pencapaian Target BEP {currentBep.actualVolume !== null && <span style={{ color: 'var(--color-amber)', fontSize: 9 }}>(Override Volume)</span>}</span>
                      <span>{progressPct.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        className="progress-segment"
                        style={{
                          width: `${Math.min(100, progressPct)}%`,
                          background: displayVolume >= financialSummary.bepUnits ? 'var(--color-emerald)' : 'var(--color-amber)',
                          borderRadius: 4
                        }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* OPEX Category Breakdown */}
          <div className="section-card">
            <SectionHeader iconEmoji="🏷️" iconBg="#fafafa" title="Alokasi OPEX per Kategori" />
            <div className="section-body" style={{ padding: '10px 14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {categorySummaryBreakdown.map((c) => {
                  const profitColor = c.netProfit >= 0 ? 'var(--color-emerald)' : 'var(--color-danger)';
                  return (
                    <div
                      key={c.category}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 8,
                        padding: 10,
                      }}
                    >
                      <div className="flex-between" style={{ marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--color-text)' }}>📁 Kategori: {c.category}</span>
                        <span className="badge badge-slate" style={{ fontSize: 9 }}>{c.volume} unit terjual</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11, color: 'var(--color-text-muted)' }}>
                        <div className="flex-between">
                          <span>Margin Kotor:</span>
                          <span className="mono" style={{ fontWeight: 600, color: 'var(--color-text)' }}>{fmtRp(c.margin)}</span>
                        </div>
                        <div className="flex-between">
                          <span>OPEX Alokasi:</span>
                          <span className="mono" style={{ fontWeight: 600, color: 'var(--color-danger)' }}>{fmtRp(c.opex)}</span>
                        </div>
                      </div>

                      <div style={{ height: 1, background: 'var(--border-color)', margin: '6px 0' }} />

                      <div className="flex-between" style={{ fontSize: 11, fontWeight: 700 }}>
                        <span>Profit Bersih Kategori:</span>
                        <span className="mono" style={{ color: profitColor }}>
                          {c.netProfit < 0 ? `- ${fmtRp(Math.abs(c.netProfit))}` : fmtRp(c.netProfit)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
        
      </div>
    </div>
  );
}
