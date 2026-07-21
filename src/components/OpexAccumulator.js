"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from './Icon';
import FormatInput from './FormatInput';
import { SectionHeader } from './HppSubComponents';
import { num, fmtRp, roundPrice, uid, getPenyusutanBulanan, mkOpexProfile } from '../utils/hpp';

export default function OpexAccumulator({
  menus,
  onUpdateMenu,
  opexProfiles,
  activeProfileId,
  onSelectProfile,
  onUpdateProfile,
  onAddProfile,
  onDeleteProfile,
  onNavigateToCalculator
}) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [menuToAdd, setMenuToAdd] = useState('');

  // Dropdown categories for OPEX expenses & assets mapping
  const opexCategories = ['Semua', 'Minuman', 'Makanan', 'Snack', 'Lainnya'];

  // Current active profile
  const activeProfile = useMemo(() => {
    return opexProfiles.find(p => p.id === activeProfileId) || opexProfiles[0] || mkOpexProfile();
  }, [opexProfiles, activeProfileId]);

  // Get selected menus in this profile
  const selectedMenus = useMemo(() => {
    return menus.filter(m => activeProfile.selectedMenuIds?.includes(m.id));
  }, [menus, activeProfile.selectedMenuIds]);

  // Get active (enabled) menus in this profile
  const activeMenus = useMemo(() => {
    return selectedMenus.filter(m => !activeProfile.disabledMenuIds?.includes(m.id));
  }, [selectedMenus, activeProfile.disabledMenuIds]);

  /* ─── Direct HPP & Pricing Calculations ─── */
  const getDirectHPP = (menu) => {
    const bb = menu.ingredients.reduce((s, i) => {
      if (!num(i.ukuranKemasan)) return s;
      return s + (num(i.hargaBeli) / num(i.ukuranKemasan)) * num(i.takaranPerCup);
    }, 0);
    const km = menu.packaging.filter(p => p.enabled).reduce((s, p) => s + (num(p.harga) * num(p.usage !== undefined ? p.usage : 1)), 0);
    return bb + km;
  };

  const getSellingPrice = (menu) => {
    if (activeProfile.menuPrices && activeProfile.menuPrices[menu.id] !== undefined) {
      return activeProfile.menuPrices[menu.id];
    }
    const hpp = getDirectHPP(menu);
    const hj = menu.margin >= 100 ? 0 : hpp / (1 - menu.margin / 100);
    return roundPrice(hj);
  };

  /* ── Platform-aware calculations per menu ──────────── */
  const getPlatformCalc = (menu) => {
    const hj = getSellingPrice(menu);
    const hpp = getDirectHPP(menu);
    const p = menu.platform;

    // OPEX per cup dari data ops menu itu sendiri
    const py = getPenyusutanBulanan(menu.ops);
    const expensesTotal = (Array.isArray(menu.ops?.expenses) ? menu.ops.expenses : [])
      .reduce((s, e) => s + num(e.value), 0);
    const opsPerCup = num(menu.ops?.estimasiCup) > 0
      ? (expensesTotal + py) / num(menu.ops.estimasiCup)
      : 0;

    if (!p || !p.enabled || hj <= 0) {
      return {
        hargaJual: hj,
        diskonNominal: 0,
        hargaEfektif: hj,
        totalKomisi: 0,
        revenueBersih: hj,
        hpp,
        opsPerCup,
        netProfit: hj - hpp - opsPerCup,
        hasPlatform: false,
      };
    }

    const diskonNominal = p.discountType === 'pct'
      ? hj * num(p.discountValue) / 100
      : num(p.discountValue);
    const hargaEfektif = Math.max(hj - diskonNominal, 0);
    const basisKomisi = p.commissionBasis === 'effective' ? hargaEfektif : hj;
    const komisi = basisKomisi * num(p.commissionPct) / 100;
    const totalKomisi = komisi + num(p.flatFee);
    const revenueBersih = hargaEfektif - totalKomisi;
    const netProfit = revenueBersih - hpp - opsPerCup;

    return {
      hargaJual: hj,
      diskonNominal,
      hargaEfektif,
      totalKomisi,
      revenueBersih,
      hpp,
      opsPerCup,
      netProfit,
      platformName: p.name,
      commissionPct: num(p.commissionPct),
      hasPlatform: true,
    };
  };

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
  const getMenuVolume = (menuId, fallbackVal = 100) => {
    if (activeProfile.menuVolumes && activeProfile.menuVolumes[menuId] !== undefined) {
      return activeProfile.menuVolumes[menuId];
    }
    return fallbackVal;
  };

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

  const addAsset = () => {
    const updated = [...(activeProfile.assets || []), { id: uid(), name: 'Aset Baru', harga: 0, tahun: 5, enabled: true, category: 'Semua' }];
    onUpdateProfile({ assets: updated });
  };

  const updateAsset = (id, field, value) => {
    const updated = activeProfile.assets.map(a => a.id === id ? { ...a, [field]: value } : a);
    onUpdateProfile({ assets: updated });
  };

  const removeAsset = (id) => {
    const updated = activeProfile.assets.filter(a => a.id !== id);
    onUpdateProfile({ assets: updated });
  };

  /* ─── Final Aggregations ─── */
  const totalExpenses = useMemo(() => {
    return (activeProfile.expenses || []).reduce((sum, exp) => sum + num(exp.value), 0);
  }, [activeProfile.expenses]);

  const totalAssetDepreciation = useMemo(() => {
    return getPenyusutanBulanan(activeProfile);
  }, [activeProfile]);

  const totalOpexVal = useMemo(() => {
    return totalExpenses + totalAssetDepreciation;
  }, [totalExpenses, totalAssetDepreciation]);

  // Main KPI values — platform-aware
  const financialSummary = useMemo(() => {
    let totalRevenue = 0;         // gross revenue (harga jual × volume)
    let totalNetRevenue = 0;      // net revenue setelah diskon & komisi platform
    let totalCOGS = 0;
    let totalOpexCups = 0;
    let totalVolume = 0;
    let totalPlatformCut = 0;
    let totalDiskon = 0;

    activeMenus.forEach(m => {
      const volume = getMenuVolume(m.id, num(m.ops?.estimasiCup));
      const pc = getPlatformCalc(m);

      totalVolume += volume;
      totalRevenue += volume * pc.hargaJual;
      totalNetRevenue += volume * pc.revenueBersih;
      totalCOGS += volume * pc.hpp;
      totalOpexCups += volume * pc.opsPerCup;
      totalPlatformCut += volume * pc.totalKomisi;
      totalDiskon += volume * pc.diskonNominal;
    });

    const totalGrossProfit = totalNetRevenue - totalCOGS;
    const netProfit = totalGrossProfit - totalOpexVal - totalOpexCups;

    const avgOpexPerUnit = totalVolume > 0 ? (totalOpexVal + totalOpexCups) / totalVolume : 0;

    // BEP based on net revenue
    const avgNetPrice = totalVolume > 0 ? totalNetRevenue / totalVolume : 0;
    const avgHpp = totalVolume > 0 ? totalCOGS / totalVolume : 0;
    const avgContributionMargin = avgNetPrice - avgHpp;
    const bepUnits = avgContributionMargin > 0 ? Math.ceil(totalOpexVal / avgContributionMargin) : 0;

    return {
      totalVolume,
      totalRevenue,
      totalNetRevenue,
      totalCOGS,
      totalGrossProfit,
      netProfit,
      avgOpexPerUnit,
      bepUnits,
      totalPlatformCut,
      totalDiskon,
    };
  }, [activeMenus, activeProfile.menuVolumes, totalOpexVal]);

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
  }, [activeMenus, activeProfile, financialSummary.totalVolume]);

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
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap', background: 'var(--bg-app)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
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

              {/* Filter and Search Bar */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
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

              {/* Menus Table */}
              {filteredMenus.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: 13 }}>
                  Tidak ada menu di dalam simulasi opex. Silakan pilih menu di atas lalu klik Tambah.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                        <th style={{ padding: '8px 4px', width: 30 }}>
                          <input
                            type="checkbox"
                            checked={filteredMenus.length > 0 && filteredMenus.every(m => !activeProfile.disabledMenuIds?.includes(m.id))}
                            onChange={e => handleToggleSelectAll(e.target.checked)}
                            style={{ cursor: 'pointer' }}
                          />
                        </th>
                        <th style={{ padding: '8px 8px' }}>Menu</th>
                        <th style={{ padding: '8px 8px', width: 75 }}>Kategori</th>
                        <th style={{ padding: '8px 8px', width: 95, textAlign: 'right', whiteSpace: 'nowrap' }}>HPP</th>
                        <th style={{ padding: '8px 8px', width: 110, textAlign: 'right' }}>Harga Jual</th>
                        <th style={{ padding: '8px 8px', width: 120, textAlign: 'right', whiteSpace: 'nowrap' }}>Nett Revenue</th>
                        <th style={{ padding: '8px 8px', width: 90, textAlign: 'center' }}>Volume</th>
                        <th style={{ padding: '8px 8px', width: 110, textAlign: 'right', whiteSpace: 'nowrap' }}>Net Profit/Cup</th>
                        <th style={{ padding: '8px 8px', width: 110, textAlign: 'right', whiteSpace: 'nowrap' }}>Kontribusi</th>
                        <th style={{ padding: '8px 8px', width: 40, textAlign: 'center' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMenus.map((menu) => {
                        const isEnabled = !activeProfile.disabledMenuIds?.includes(menu.id);
                        const pc = getPlatformCalc(menu);
                        const volume = getMenuVolume(menu.id, num(menu.ops?.estimasiCup));
                        const totalContribusi = isEnabled ? volume * pc.netProfit : 0;
                        const isProfit = pc.netProfit >= 0;

                        return (
                          <tr
                            key={menu.id}
                            style={{
                              borderBottom: '1px solid var(--border-color)',
                              opacity: isEnabled ? 1 : 0.55,
                              background: isEnabled ? 'transparent' : 'var(--bg-app)',
                              transition: 'all 0.15s'
                            }}
                          >
                            <td style={{ padding: '10px 4px' }}>
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={() => handleToggleMenuSelect(menu.id)}
                                style={{ cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ padding: '10px 8px' }}>
                              <button
                                onClick={() => onNavigateToCalculator && onNavigateToCalculator(menu.id)}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 6,
                                  background: isEnabled ? 'var(--bg-app)' : 'var(--bg-card)',
                                  border: '1px solid var(--border-color)', padding: '5px 10px',
                                  borderRadius: 8, color: 'var(--color-text)', fontWeight: 600,
                                  fontSize: 12, cursor: 'pointer', transition: 'all 0.15s ease',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)', textAlign: 'left'
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
                                {pc.hasPlatform && (
                                  <span style={{
                                    fontSize: 9, padding: '1px 5px', borderRadius: 10,
                                    background: '#fff1ef', color: '#ee4d2d', fontWeight: 700
                                  }}>
                                    🏪 {pc.platformName}
                                  </span>
                                )}
                              </button>
                            </td>
                            <td style={{ padding: '10px 8px' }}>
                              <span className="badge badge-slate" style={{ fontSize: 10 }}>{menu.category}</span>
                            </td>

                            {/* HPP */}
                            <td className="mono" style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 500, whiteSpace: 'nowrap', fontSize: 12 }}>
                              {fmtRp(pc.hpp)}
                            </td>

                            {/* Harga Jual (editable) */}
                            <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
                                <div className="input-prefix-wrap sm" style={{ maxWidth: 110, marginLeft: 'auto' }}>
                                  <span className="prefix" style={{ fontSize: 9 }}>Rp</span>
                                  <FormatInput
                                    className="hpp-input sm center"
                                    style={{ paddingLeft: 20 }}
                                    value={pc.hargaJual}
                                    onChange={val => handlePriceChange(menu, val)}
                                    disabled={!isEnabled}
                                  />
                                </div>
                                {pc.hasPlatform && pc.diskonNominal > 0 && (
                                  <span style={{ fontSize: 9, color: '#f59e0b', fontWeight: 600 }}>
                                    − {fmtRp(pc.diskonNominal)} diskon
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Nett Revenue (setelah platform) */}
                            <td className="mono" style={{ padding: '10px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
                                <span style={{ fontWeight: 700, fontSize: 12, color: pc.hasPlatform ? '#4f46e5' : 'var(--color-text)' }}>
                                  {fmtRp(pc.revenueBersih)}
                                </span>
                                {pc.hasPlatform && (
                                  <span style={{ fontSize: 9, color: '#f87171', fontWeight: 600 }}>
                                    − {fmtRp(pc.totalKomisi)} komisi
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Volume */}
                            <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                              <input
                                type="number"
                                className="hpp-input sm center"
                                style={{ maxWidth: 75, margin: '0 auto', display: 'block', fontWeight: 700 }}
                                value={volume}
                                onChange={e => handleVolumeChange(menu.id, e.target.value)}
                                disabled={!isEnabled}
                              />
                            </td>

                            {/* Net Profit per Cup */}
                            <td className="mono" style={{ padding: '10px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
                                <span style={{
                                  fontWeight: 700, fontSize: 12,
                                  color: isProfit ? '#10b981' : '#ef4444'
                                }}>
                                  {fmtRp(pc.netProfit)}
                                </span>
                                {pc.opsPerCup > 0 && (
                                  <span style={{ fontSize: 9, color: '#94a3b8' }}>
                                    inc. OPEX {fmtRp(pc.opsPerCup)}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Total Kontribusi */}
                            <td className="mono" style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: totalContribusi > 0 ? 'var(--color-success)' : '#ef4444', whiteSpace: 'nowrap' }}>
                              {isEnabled && volume > 0 ? fmtRp(totalContribusi) : 'Rp 0'}
                            </td>

                            <td style={{ padding: '10px 8px', textAlign: 'center' }}>
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
                        );
                      })}
                    </tbody>
                  </table>
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

          {/* ── 2. Central OPEX overhead expenses ── */}
          <div className="section-card">
            <SectionHeader
              iconEmoji="⚡" iconBg="#fef3c7"
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
              iconEmoji="🔧" iconBg="#ecfdf5"
              title="Penyusutan Aset & Peralatan"
              badgeText="PENYUSUTAN" badgeClass="badge-emerald"
              actions={
                activeProfile.usePenyusutan && (
                  <button className="btn btn-primary btn-sm" onClick={addAsset}>
                    <Icon name="plus" size={11} /> Tambah Aset
                  </button>
                )
              }
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
                (!activeProfile.assets || activeProfile.assets.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: 13 }}>
                    Belum ada aset peralatan ditambahkan di profil ini.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {activeProfile.assets.map((aset) => {
                      const blnVal = num(aset.tahun) > 0 ? num(aset.harga) / (num(aset.tahun) * 12) : 0;
                      return (
                        <div
                          key={aset.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 120px 120px 70px 110px auto',
                            gap: 8,
                            alignItems: 'center',
                            background: aset.enabled ? 'var(--bg-card)' : 'var(--bg-app)',
                            opacity: aset.enabled ? 1 : 0.6,
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: '1px solid var(--border-color)',
                            transition: 'opacity 0.15s'
                          }}
                        >
                          <div>
                            <label className="label-sm" style={{ display: 'block', marginBottom: 2 }}>Nama Aset</label>
                            <input
                              className="hpp-input sm"
                              value={aset.name}
                              onChange={e => updateAsset(aset.id, 'name', e.target.value)}
                              placeholder="Mesin Espresso, Blender, Sewa..."
                              style={{ fontWeight: 600 }}
                              disabled={!aset.enabled}
                            />
                          </div>

                          <div>
                            <label className="label-sm" style={{ display: 'block', marginBottom: 2 }}>Kategori Alokasi</label>
                            <select
                              className="hpp-input sm"
                              value={aset.category || 'Semua'}
                              onChange={e => updateAsset(aset.id, 'category', e.target.value)}
                              style={{ fontWeight: 500 }}
                              disabled={!aset.enabled}
                            >
                              {opexCategories.map(c => (
                                <option key={c} value={c}>{c === 'Semua' ? 'Semua (Bagi Rata)' : c}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="label-sm" style={{ display: 'block', marginBottom: 2 }}>Harga Beli</label>
                            <div className="input-prefix-wrap">
                              <span className="prefix">Rp</span>
                              <FormatInput
                                className="hpp-input sm"
                                placeholder="0"
                                value={aset.harga || ''}
                                onChange={v => updateAsset(aset.id, 'harga', v)}
                                disabled={!aset.enabled}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="label-sm" style={{ display: 'block', marginBottom: 2 }}>Umur (Thn)</label>
                            <input
                              className="hpp-input sm center"
                              type="number"
                              placeholder="5"
                              value={aset.tahun || ''}
                              onChange={e => updateAsset(aset.id, 'tahun', e.target.value)}
                              disabled={!aset.enabled}
                            />
                          </div>

                          <div>
                            <label className="label-sm" style={{ display: 'block', marginBottom: 2, textAlign: 'right' }}>Depresiasi/Bln</label>
                            <div style={{ padding: '5px 8px', background: aset.enabled ? 'var(--bg-card)' : 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: 11, fontWeight: 700, textAlign: 'right', height: 29, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <span className="mono">{fmtRp(blnVal)}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 15 }}>
                            <label className="pkg-toggle" style={{ transform: 'scale(0.8)', margin: 0 }}>
                              <input
                                type="checkbox"
                                checked={aset.enabled}
                                onChange={e => updateAsset(aset.id, 'enabled', e.target.checked)}
                              />
                              <div className="toggle-pill" />
                            </label>
                            <button
                              className="btn btn-danger"
                              onClick={() => removeAsset(aset.id)}
                              title="Hapus"
                              style={{ height: 29, width: 29, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Icon name="trash" size={11} />
                            </button>
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

        </div>

        {/* ══ RIGHT PANEL (STICKY SUMMARY) ═════════════════════ */}
        <div className="result-sticky" style={{ position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Profitability Main Summary Card */}
          <div
            style={{
              background: financialSummary.netProfit >= 0 
                ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
                : 'linear-gradient(135deg, #1e1b4b 0%, #31102f 100%)',
              borderRadius: 14,
              padding: 20,
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: 150, height: 150, borderRadius: '50%', background: financialSummary.netProfit >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', filter: 'blur(30px)', pointerEvents: 'none' }} />
            
            <div className="label-xs" style={{ color: '#64748b', marginBottom: 16 }}>📊 KINERJA FINANSIAL: {activeProfile.name}</div>
            
            {/* Revenue Waterfall rows */}
            {[
              { label: 'Omset Pendapatan Kotor', val: financialSummary.totalRevenue, valColor: '#e2e8f0' },
              ...(financialSummary.totalDiskon > 0 ? [{ label: '↳ Diskon Merchant', val: -financialSummary.totalDiskon, valColor: '#fde68a', indent: true }] : []),
              ...(financialSummary.totalPlatformCut > 0 ? [{ label: '↳ Komisi Platform', val: -financialSummary.totalPlatformCut, valColor: '#fca5a5', indent: true }] : []),
              ...(financialSummary.totalNetRevenue !== financialSummary.totalRevenue ? [{ label: '= Nett Revenue Diterima', val: financialSummary.totalNetRevenue, valColor: '#c7d2fe', bold: true }] : []),
              { label: '− Total Direct HPP (COGS)', val: -financialSummary.totalCOGS, valColor: '#fed7aa' },
              { label: '= Gross Profit (Kontribusi)', val: financialSummary.totalGrossProfit, valColor: '#a7f3d0', bold: true },
              { label: '− Total OPEX Terpusat', val: -totalOpexVal, valColor: '#fde68a' },
            ].map(({ label, val, valColor, bold, indent }) => (
              <div key={label} className="result-row" style={{
                padding: '5px 0',
                paddingLeft: indent ? 12 : 0,
                borderBottom: bold ? '1px dashed rgba(255,255,255,0.08)' : 'none',
                marginBottom: bold ? 4 : 0,
              }}>
                <span style={{ fontSize: indent ? 11 : 12, color: indent ? '#64748b' : '#94a3b8' }}>{label}</span>
                <span className="mono" style={{ fontWeight: bold ? 800 : 600, fontSize: bold ? 14 : 12, color: valColor }}>
                  {val < 0 ? `- ${fmtRp(Math.abs(val))}` : fmtRp(val)}
                </span>
              </div>
            ))}

            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '12px 0' }} />

            {/* NET PROFIT CARD */}
            <div
              style={{
                background: financialSummary.netProfit >= 0 
                  ? 'rgba(16, 185, 129, 0.08)' 
                  : 'rgba(239, 68, 68, 0.08)',
                borderRadius: 10,
                padding: '12px 14px',
                border: `1.5px solid ${financialSummary.netProfit >= 0 ? '#10b981' : '#ef4444'}`,
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: financialSummary.netProfit >= 0 ? '#34d399' : '#f87171', marginBottom: 4 }}>
                {financialSummary.netProfit >= 0 ? '🏆 ESTIMASI PROFIT BERSIH FINAL' : '🚨 ESTIMASI RUGI BERSIH'}
              </div>
              <div className="mono" style={{ fontWeight: 900, fontSize: 24, color: '#fff' }}>
                {financialSummary.netProfit < 0 ? `- ${fmtRp(Math.abs(financialSummary.netProfit))}` : fmtRp(financialSummary.netProfit)}
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, lineHeight: 1.5 }}>
                Gross Profit ({fmtRp(financialSummary.totalGrossProfit)}) − OPEX ({fmtRp(totalOpexVal)})
                {financialSummary.totalPlatformCut > 0 && (
                  <span> | Platform cut: {fmtRp(financialSummary.totalPlatformCut)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Business BEP & Metrics Card */}
          <div className="section-card">
            <SectionHeader iconEmoji="📊" iconBg="#ecfdf5" title="Analisis Operasional & BEP" badgeText="METRIK" badgeClass="badge-emerald" />
            <div className="section-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              
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
                  Volume penjualan gabungan yang dibutuhkan untuk menutup total biaya operasional sebesar <strong>{fmtRp(totalOpexVal)}</strong>.
                </div>
              </div>

              {financialSummary.totalVolume > 0 && (
                <div style={{ padding: '4px 2px' }}>
                  <div className="flex-between" style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                    <span>Pencapaian Target BEP</span>
                    <span>{((financialSummary.totalVolume / Math.max(1, financialSummary.bepUnits)) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      className="progress-segment"
                      style={{
                        width: `${Math.min(100, (financialSummary.totalVolume / Math.max(1, financialSummary.bepUnits)) * 100)}%`,
                        background: financialSummary.totalVolume >= financialSummary.bepUnits ? 'var(--color-emerald)' : 'var(--color-amber)',
                        borderRadius: 4
                      }}
                    />
                  </div>
                </div>
              )}
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
