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
  const [editingName, setEditingName] = useState('');

  // Dropdown categories for OPEX expenses & assets mapping
  const opexCategories = ['Semua', 'Minuman', 'Makanan', 'Snack', 'Lainnya'];

  // Current active profile
  const activeProfile = useMemo(() => {
    return opexProfiles.find(p => p.id === activeProfileId) || opexProfiles[0] || mkOpexProfile();
  }, [opexProfiles, activeProfileId]);

  // Keep editingName state in sync with active profile name
  useEffect(() => {
    if (activeProfile) {
      setEditingName(activeProfile.name);
    }
  }, [activeProfile?.id, activeProfile?.name]);

  // Get selected menus in this profile
  const selectedMenus = useMemo(() => {
    return menus.filter(m => activeProfile.selectedMenuIds?.includes(m.id));
  }, [menus, activeProfile.selectedMenuIds]);

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

  const handlePriceChange = (menu, newPriceVal) => {
    const currentPrices = { ...activeProfile.menuPrices || {} };
    if (newPriceVal === '' || newPriceVal === undefined || newPriceVal === null) {
      delete currentPrices[menu.id];
    } else {
      currentPrices[menu.id] = num(newPriceVal);
    }
    onUpdateProfile({ menuPrices: currentPrices });
  };

  /* ─── Profile Management Operations ─── */
  const handleRenameProfile = (newName) => {
    setEditingName(newName);
    onUpdateProfile({ name: newName });
  };

  const handleCreateProfile = () => {
    const newProfile = mkOpexProfile({
      name: `Profil ${opexProfiles.length + 1}`,
      selectedMenuIds: menus.map(m => m.id) // Select all menus by default
    });
    onAddProfile(newProfile);
  };

  const handleDeleteProfile = () => {
    if (opexProfiles.length <= 1) {
      alert("Anda harus menyisakan minimal satu profil OPEX.");
      return;
    }
    if (confirm(`Hapus profil "${activeProfile.name}"?`)) {
      onDeleteProfile(activeProfile.id);
    }
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

    // Fill missing values for all selected menus
    selectedMenus.forEach(m => {
      if (currentVols[m.id] === undefined) {
        currentVols[m.id] = num(m.ops?.estimasiCup || 100);
      }
    });

    const oldVol = currentVols[menuId] || 0;
    const diff = targetVol - oldVol;

    if (activeProfile.isTotalVolumeLocked) {
      const others = selectedMenus.filter(m => m.id !== menuId);
      if (others.length === 0) {
        // If only 1 menu is selected, it must equal the totalVolume
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
        let newSum = selectedMenus.reduce((sum, m) => sum + (currentVols[m.id] || 0), 0);
        let gap = activeProfile.totalVolume - newSum;
        if (gap !== 0 && others.length > 0) {
          const firstOtherId = others[0].id;
          currentVols[firstOtherId] = Math.max(0, currentVols[firstOtherId] + gap);
        }
      }
      onUpdateProfile({ menuVolumes: currentVols });
    } else {
      // Unlocked: modify this item's volume, and update total volume to the sum of all selected
      currentVols[menuId] = targetVol;
      const newTotal = selectedMenus.reduce((sum, m) => sum + (currentVols[m.id] || 0), 0);
      onUpdateProfile({
        menuVolumes: currentVols,
        totalVolume: newTotal
      });
    }
  };

  const handleTotalVolumeChange = (newTotalVal) => {
    const newTotal = Math.max(0, parseInt(newTotalVal) || 0);
    const currentVols = { ...activeProfile.menuVolumes };

    if (selectedMenus.length > 0) {
      const equalShare = Math.floor(newTotal / selectedMenus.length);
      selectedMenus.forEach(m => {
        currentVols[m.id] = equalShare;
      });

      // Distribute rounding remainder
      const remainder = newTotal % selectedMenus.length;
      for (let i = 0; i < remainder; i++) {
        const id = selectedMenus[i].id;
        currentVols[id] = (currentVols[id] || 0) + 1;
      }
    }

    onUpdateProfile({
      totalVolume: newTotal,
      menuVolumes: currentVols
    });
  };

  const handleToggleMenuSelect = (menuId) => {
    let updatedSelection = [...(activeProfile.selectedMenuIds || [])];
    if (updatedSelection.includes(menuId)) {
      updatedSelection = updatedSelection.filter(id => id !== menuId);
    } else {
      updatedSelection.push(menuId);
    }

    // Rebalance volume split if locked
    const currentVols = { ...activeProfile.menuVolumes };
    if (activeProfile.isTotalVolumeLocked && updatedSelection.length > 0) {
      const equalShare = Math.floor(activeProfile.totalVolume / updatedSelection.length);
      updatedSelection.forEach(id => {
        currentVols[id] = equalShare;
      });
      // Distribute rounding remainder
      const remainder = activeProfile.totalVolume % updatedSelection.length;
      for (let i = 0; i < remainder; i++) {
        const id = updatedSelection[i];
        currentVols[id] = (currentVols[id] || 0) + 1;
      }
    } else if (!activeProfile.isTotalVolumeLocked) {
      // Unlocked: recalculate total volume to match new sum
      const newSum = updatedSelection.reduce((sum, id) => sum + (currentVols[id] || 100), 0);
      onUpdateProfile({
        selectedMenuIds: updatedSelection,
        totalVolume: newSum
      });
      return;
    }

    onUpdateProfile({
      selectedMenuIds: updatedSelection,
      menuVolumes: currentVols
    });
  };

  const handleToggleSelectAll = (checked) => {
    let updatedSelection = [];
    if (checked) {
      const currentFilteredIds = filteredMenus.map(m => m.id);
      updatedSelection = [...new Set([...(activeProfile.selectedMenuIds || []), ...currentFilteredIds])];
    } else {
      const currentFilteredIds = filteredMenus.map(m => m.id);
      updatedSelection = (activeProfile.selectedMenuIds || []).filter(id => !currentFilteredIds.includes(id));
    }

    // Rebalance volumes if locked
    const currentVols = { ...activeProfile.menuVolumes };
    if (activeProfile.isTotalVolumeLocked && updatedSelection.length > 0) {
      const equalShare = Math.floor(activeProfile.totalVolume / updatedSelection.length);
      updatedSelection.forEach(id => {
        currentVols[id] = equalShare;
      });
      // Distribute rounding remainder
      const remainder = activeProfile.totalVolume % updatedSelection.length;
      for (let i = 0; i < remainder; i++) {
        const id = updatedSelection[i];
        currentVols[id] = (currentVols[id] || 0) + 1;
      }
    } else if (!activeProfile.isTotalVolumeLocked) {
      const newSum = updatedSelection.reduce((sum, id) => sum + (currentVols[id] || 100), 0);
      onUpdateProfile({
        selectedMenuIds: updatedSelection,
        totalVolume: newSum
      });
      return;
    }

    onUpdateProfile({
      selectedMenuIds: updatedSelection,
      menuVolumes: currentVols
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

  // Main KPI values
  const financialSummary = useMemo(() => {
    let totalRevenue = 0;
    let totalCOGS = 0;
    let totalVolume = 0;

    selectedMenus.forEach(m => {
      const volume = getMenuVolume(m.id, num(m.ops?.estimasiCup));
      const price = getSellingPrice(m);
      const hpp = getDirectHPP(m);

      totalVolume += volume;
      totalRevenue += volume * price;
      totalCOGS += volume * hpp;
    });

    const totalGrossProfit = totalRevenue - totalCOGS;
    const netProfit = totalGrossProfit - totalOpexVal;

    const avgOpexPerUnit = totalVolume > 0 ? totalOpexVal / totalVolume : 0;

    // BEP Calculation
    const avgPrice = totalVolume > 0 ? totalRevenue / totalVolume : 0;
    const avgHpp = totalVolume > 0 ? totalCOGS / totalVolume : 0;
    const avgContributionMargin = avgPrice - avgHpp;
    const bepUnits = avgContributionMargin > 0 ? Math.ceil(totalOpexVal / avgContributionMargin) : 0;

    return {
      totalVolume,
      totalRevenue,
      totalCOGS,
      totalGrossProfit,
      netProfit,
      avgOpexPerUnit,
      bepUnits
    };
  }, [selectedMenus, activeProfile.menuVolumes, totalOpexVal]);

  // Categories profit breakdown
  const categorySummaryBreakdown = useMemo(() => {
    const categories = ['Minuman', 'Makanan', 'Snack', 'Lainnya'];
    const map = {};
    categories.forEach(cat => {
      map[cat] = { opex: 0, revenue: 0, cogs: 0, volume: 0, margin: 0 };
    });

    selectedMenus.forEach(m => {
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
  }, [selectedMenus, activeProfile, financialSummary.totalVolume]);

  const filteredMenus = useMemo(() => {
    return menus.filter(m => {
      const matchCat = filterCategory === 'Semua' || m.category === filterCategory;
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menus, filterCategory, search]);

  return (
    <div style={{ padding: '0 28px' }}>
      
      {/* ── Top Profiles Ribbon Bar ── */}
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 24px',
          margin: '0 -28px 20px -28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>Profil Toko/Kategori:</span>
          <select
            className="hpp-input sm"
            value={activeProfileId || ''}
            onChange={e => onSelectProfile(e.target.value)}
            style={{ maxWidth: 200, fontWeight: 600 }}
          >
            {opexProfiles.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          
          <input
            className="hpp-input sm"
            value={editingName}
            onChange={e => handleRenameProfile(e.target.value)}
            placeholder="Edit nama profil..."
            style={{ maxWidth: 220, fontWeight: 600 }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-add btn-sm" onClick={handleCreateProfile}>
            <Icon name="plus" size={11} /> Buat Profil Baru
          </button>
          <button className="btn btn-danger" onClick={handleDeleteProfile} style={{ width: 'auto', height: 'auto', padding: '7px 14px', fontSize: 12, borderRadius: 8 }}>
            <Icon name="trash" size={11} /> Hapus Profil
          </button>
        </div>
      </div>

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
                  Tidak ada menu ditemukan. Silakan tambahkan menu di tab Database.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                        <th style={{ padding: '8px 4px', width: 30 }}>
                          <input
                            type="checkbox"
                            checked={filteredMenus.length > 0 && filteredMenus.every(m => activeProfile.selectedMenuIds?.includes(m.id))}
                            onChange={e => handleToggleSelectAll(e.target.checked)}
                            style={{ cursor: 'pointer' }}
                          />
                        </th>
                        <th style={{ padding: '8px 8px' }}>Menu</th>
                        <th style={{ padding: '8px 8px', width: 90 }}>Kategori</th>
                        <th style={{ padding: '8px 8px', width: 90, textAlign: 'right' }}>Direct HPP</th>
                        <th style={{ padding: '8px 8px', width: 125, textAlign: 'right' }}>Harga Jual</th>
                        <th style={{ padding: '8px 8px', width: 100, textAlign: 'center' }}>Volume Jual</th>
                        <th style={{ padding: '8px 8px', width: 100, textAlign: 'right' }}>Kontribusi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMenus.map((menu) => {
                        const isSelected = activeProfile.selectedMenuIds?.includes(menu.id);
                        const directHpp = getDirectHPP(menu);
                        const sellingPrice = getSellingPrice(menu);
                        const volume = getMenuVolume(menu.id, num(menu.ops?.estimasiCup));
                        const marginPerUnit = sellingPrice - directHpp;
                        const totalMargin = volume * marginPerUnit;

                        return (
                          <tr
                            key={menu.id}
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                              opacity: isSelected ? 1 : 0.6,
                              background: isSelected ? 'transparent' : '#f8fafc',
                              transition: 'all 0.15s'
                            }}
                          >
                            <td style={{ padding: '10px 4px' }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleMenuSelect(menu.id)}
                                style={{ cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ padding: '10px 8px' }}>
                              <button
                                onClick={() => onNavigateToCalculator && onNavigateToCalculator(menu.id)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  background: isSelected ? '#f1f5f9' : '#f8fafc',
                                  border: '1px solid #cbd5e1',
                                  padding: '5px 10px',
                                  borderRadius: 8,
                                  color: '#334155',
                                  fontWeight: 600,
                                  fontSize: 12,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                  textAlign: 'left'
                                }}
                                onMouseOver={e => {
                                  e.currentTarget.style.background = '#eef2ff';
                                  e.currentTarget.style.borderColor = '#6366f1';
                                  e.currentTarget.style.color = '#4f46e5';
                                }}
                                onMouseOut={e => {
                                  e.currentTarget.style.background = isSelected ? '#f1f5f9' : '#f8fafc';
                                  e.currentTarget.style.borderColor = '#cbd5e1';
                                  e.currentTarget.style.color = '#334155';
                                }}
                                title="Klik untuk edit / hitung HPP"
                              >
                                <span style={{ fontSize: 13 }}>{menu.emoji}</span>
                                <span>{menu.name}</span>
                              </button>
                            </td>
                            <td style={{ padding: '10px 8px' }}>
                              <span className="badge badge-slate" style={{ fontSize: 10 }}>{menu.category}</span>
                            </td>
                            <td className="mono" style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 500 }}>
                              {fmtRp(directHpp)}
                            </td>
                            <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                              <div className="input-prefix-wrap sm" style={{ maxWidth: 110, marginLeft: 'auto' }}>
                                <span className="prefix" style={{ fontSize: 9 }}>Rp</span>
                                <FormatInput
                                  className="hpp-input sm center"
                                  style={{ paddingLeft: 20 }}
                                  value={sellingPrice}
                                  onChange={val => handlePriceChange(menu, val)}
                                  disabled={!isSelected}
                                />
                              </div>
                            </td>
                            <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                              <input
                                type="number"
                                className="hpp-input sm center"
                                style={{ maxWidth: 75, margin: '0 auto', display: 'block', fontWeight: 700 }}
                                value={volume}
                                onChange={e => handleVolumeChange(menu.id, e.target.value)}
                                disabled={!isSelected}
                              />
                            </td>
                            <td className="mono" style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: totalMargin > 0 ? '#10b981' : '#64748b' }}>
                              {isSelected && volume > 0 ? fmtRp(totalMargin) : 'Rp 0'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="section-footer" style={{ background: '#eef2ff', display: 'flex', justifyContent: 'space-between', fontSize: 12, borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: 600, color: '#4f46e5' }}>Terpilih: {selectedMenus.length} dari {menus.length} Menu</span>
              <span style={{ fontWeight: 800, color: '#4f46e5' }}>Volume Terakumulasi: {financialSummary.totalVolume.toLocaleString('id-ID')} unit</span>
            </div>

            {/* Target Volume and Gembok Control (Placed at the bottom of the card, below the total summary footer) */}
            <div
              style={{
                background: activeProfile.isTotalVolumeLocked ? '#f0fdf4' : '#fffbeb',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14,
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
                transition: 'background-color 0.2s'
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
                    border: `1.5px solid ${activeProfile.isTotalVolumeLocked ? '#10b981' : '#cbd5e1'}`,
                    background: activeProfile.isTotalVolumeLocked ? '#dcfce7' : '#fff',
                    color: activeProfile.isTotalVolumeLocked ? '#15803d' : '#64748b',
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
                        background: '#f8fafc',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0'
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
            <div className="section-footer" style={{ background: '#fffbeb', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: '#d97706' }}>Sub-total Pengeluaran Overhead</span>
              <span className="mono" style={{ fontWeight: 800, fontSize: 15, color: '#b45309' }}>{fmtRp(totalExpenses)}</span>
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
              <div className="flex-between" style={{ marginBottom: 14, background: '#f0fdf4', padding: '10px 14px', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#047857' }}>Depresiasi Umur Ekonomis</span>
                  <div style={{ fontSize: 10, color: '#059669', marginTop: 2 }}>Mendepresiasi mesin/alat berdasarkan umur dalam tahun secara bulanan.</div>
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
                            background: aset.enabled ? '#f8fafc' : '#f1f5f9',
                            opacity: aset.enabled ? 1 : 0.6,
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: '1px solid #e2e8f0',
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
                            <div style={{ padding: '5px 8px', background: aset.enabled ? '#fff' : '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 11, fontWeight: 700, textAlign: 'right', height: 29, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
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
            <div className="section-footer" style={{ background: '#f0fdf4', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: '#059669' }}>Sub-total Penyusutan Bulanan</span>
              <span className="mono" style={{ fontWeight: 800, fontSize: 15, color: '#047857' }}>{fmtRp(totalAssetDepreciation)}</span>
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
            
            {[
              { label: 'Omset Pendapatan Kotor', val: financialSummary.totalRevenue, valColor: '#fff' },
              { label: 'Total Direct HPP (COGS)', val: -financialSummary.totalCOGS, valColor: '#fecaca' },
              { label: 'Gross Profit (Margin Kontribusi)', val: financialSummary.totalGrossProfit, valColor: '#a7f3d0', bold: true },
              { label: 'Total OPEX Terpusat', val: -totalOpexVal, valColor: '#fed7aa' },
            ].map(({ label, val, valColor, bold }) => (
              <div key={label} className="result-row" style={{ padding: '6px 0', borderBottom: bold ? '1px dashed rgba(255,255,255,0.08)' : 'none', marginBottom: bold ? 4 : 0 }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{label}</span>
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
                {financialSummary.netProfit >= 0 ? '🏆 ESTIMASI PROFIT BERSIH' : '⚠️ ESTIMASI RUGI BERSIH'}
              </div>
              <div className="mono" style={{ fontWeight: 900, fontSize: 24, color: '#fff' }}>
                {financialSummary.netProfit < 0 ? `- ${fmtRp(Math.abs(financialSummary.netProfit))}` : fmtRp(financialSummary.netProfit)}
              </div>
              
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                Margin Kontribusi ({fmtRp(financialSummary.totalGrossProfit)}) − OPEX ({fmtRp(totalOpexVal)})
              </div>
            </div>
          </div>

          {/* Business BEP & Metrics Card */}
          <div className="section-card">
            <SectionHeader iconEmoji="📊" iconBg="#ecfdf5" title="Analisis Operasional & BEP" badgeText="METRIK" badgeClass="badge-emerald" />
            <div className="section-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', border: '1px solid #e2e8f0' }}>
                <span className="label-xs" style={{ color: '#64748b', display: 'block', marginBottom: 2 }}>BEBAN OPEX RATA-RATA (Metode Rata per Unit)</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="mono" style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>
                    {fmtRp(financialSummary.avgOpexPerUnit)} / unit
                  </span>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>
                    Total OPEX ÷ Total Volume
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 4, lineHeight: 1.4 }}>
                  HPP Riil Gabungan = <strong style={{ color: '#4f46e5' }}>Direct HPP + {fmtRp(financialSummary.avgOpexPerUnit)}</strong>.
                </div>
              </div>

              <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 12px', border: '1px solid #bbf7d0' }}>
                <span className="label-xs" style={{ color: '#047857', display: 'block', marginBottom: 2 }}>TITIK IMPAS / BREAK-EVEN POINT (BEP)</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="mono" style={{ fontSize: 20, fontWeight: 900, color: '#047857' }}>
                    {financialSummary.bepUnits.toLocaleString('id-ID')} <span style={{ fontSize: 12, fontWeight: 600 }}>unit/bln</span>
                  </span>
                  <span style={{ fontSize: 10, color: '#059669' }}>
                    Volume Gabungan BEP
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#059669', marginTop: 4 }}>
                  Volume penjualan gabungan yang dibutuhkan untuk menutup total biaya operasional sebesar <strong>{fmtRp(totalOpexVal)}</strong>.
                </div>
              </div>

              {financialSummary.totalVolume > 0 && (
                <div style={{ padding: '4px 2px' }}>
                  <div className="flex-between" style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    <span>Pencapaian Target BEP</span>
                    <span>{((financialSummary.totalVolume / Math.max(1, financialSummary.bepUnits)) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      className="progress-segment"
                      style={{
                        width: `${Math.min(100, (financialSummary.totalVolume / Math.max(1, financialSummary.bepUnits)) * 100)}%`,
                        background: financialSummary.totalVolume >= financialSummary.bepUnits ? '#10b981' : '#f59e0b',
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
                  const profitColor = c.netProfit >= 0 ? '#10b981' : '#ef4444';
                  return (
                    <div
                      key={c.category}
                      style={{
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        padding: 10,
                      }}
                    >
                      <div className="flex-between" style={{ marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 12, color: '#1e293b' }}>📁 Kategori: {c.category}</span>
                        <span className="badge badge-slate" style={{ fontSize: 9 }}>{c.volume} unit terjual</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11, color: '#64748b' }}>
                        <div className="flex-between">
                          <span>Margin Kotor:</span>
                          <span className="mono" style={{ fontWeight: 600, color: '#334155' }}>{fmtRp(c.margin)}</span>
                        </div>
                        <div className="flex-between">
                          <span>OPEX Alokasi:</span>
                          <span className="mono" style={{ fontWeight: 600, color: '#e11d48' }}>{fmtRp(c.opex)}</span>
                        </div>
                      </div>

                      <div style={{ height: 1, background: '#f1f5f9', margin: '6px 0' }} />

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
