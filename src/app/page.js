"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '../components/Icon';
import { ToastContainer, MenuMetaModal } from '../components/HppSubComponents';
import HppCalculator from '../components/HppCalculator';
import MenuDatabase from '../components/MenuDatabase';
import OpexAccumulator from '../components/OpexAccumulator';
import BepCalculator from '../components/BepCalculator';
import ChannelPresetsModal from '../components/ChannelPresetsModal';
import { num, fmtRp, roundPrice, uid, mkMenu, loadDB, saveDB, getPenyusutanBulanan, loadOpexProfiles, saveOpexProfiles, mkOpexProfile, loadChannelPresets, saveChannelPresets } from '../utils/hpp';
import * as XLSX from 'xlsx';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [menus, setMenus] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [view, setView] = useState('calculator'); // 'calculator' | 'database' | 'opex'
  const [toasts, setToasts] = useState([]);
  const [showMeta, setShowMeta] = useState(false);
  const [opexProfiles, setOpexProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [channelPresets, setChannelPresets] = useState([]);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [outlets, setOutlets] = useState([]);
  const [activeOutletId, setActiveOutletId] = useState(null);
  const [bepSettings, setBepSettings] = useState([]);


  /* ── Toast helpers ── */
  const showToast = useCallback((msg, type = 'success') => {
    const id = uid();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  const activeOutletMenus = React.useMemo(() => {
    return menus.filter(m => m.outletId === activeOutletId);
  }, [menus, activeOutletId]);

  const activeOutletProfiles = React.useMemo(() => {
    return opexProfiles.filter(p => p.outletId === activeOutletId);
  }, [opexProfiles, activeOutletId]);

  const activeMenu = activeOutletMenus.find(m => m.id === activeId) || activeOutletMenus[0] || null;
  const activeProfile = activeOutletProfiles.find(p => p.id === activeProfileId) || activeOutletProfiles[0] || null;

  // Load data from DB or migrate from LocalStorage
  useEffect(() => {
    setIsMounted(true);
    
    const initData = async () => {
      try {
        // 1. Load outlets
        const outletsRes = await fetch('/api/outlets');
        let dbOutlets = await outletsRes.json();
        
        if (!dbOutlets || dbOutlets.length === 0) {
          const createRes = await fetch('/api/outlets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Outlet Utama' })
          });
          const newOutlet = await createRes.json();
          dbOutlets = [newOutlet];
        }
        
        setOutlets(dbOutlets);
        const initialOutletId = dbOutlets[0].id;
        setActiveOutletId(initialOutletId);

        // 2. Load BEP settings
        const bepRes = await fetch('/api/bep');
        const dbBep = await bepRes.json();
        setBepSettings(dbBep);

        // 3. Load Menus
        const menusRes = await fetch('/api/menus');
        let dbMenus = await menusRes.json();
        
        // 4. Load Opex Profiles
        const opexRes = await fetch('/api/opex');
        let dbProfiles = await opexRes.json();

        // 5. Fallback migrations (LocalStorage)
        const localMenus = loadDB();
        const localProfiles = loadOpexProfiles();
        const databaseIsEmpty = (!dbMenus || dbMenus.length === 0) && (!dbProfiles || dbProfiles.length === 0);
        const localStorageHasData = (localMenus && localMenus.length > 0) || (localProfiles && localProfiles.length > 0);

        if (databaseIsEmpty && localStorageHasData) {
          dbMenus = localMenus.length > 0 ? localMenus.map(m => ({ ...m, outletId: initialOutletId })) : [mkMenu({ name: 'Kopi Susu Signature', emoji: '☕', category: 'Minuman', outletId: initialOutletId })];
          dbProfiles = localProfiles.map(p => ({ ...p, outletId: initialOutletId }));
          
          await fetch('/api/menus', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dbMenus)
          });
          if (dbProfiles.length > 0) {
            await fetch('/api/opex', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(dbProfiles)
            });
          }
        } else {
          // Ensure all items have outletId
          let menusNeedUpdate = false;
          dbMenus = dbMenus.map(m => {
            if (!m.outletId) {
              menusNeedUpdate = true;
              return { ...m, outletId: initialOutletId };
            }
            return m;
          });
          
          let opexNeedUpdate = false;
          dbProfiles = dbProfiles.map(p => {
            if (!p.outletId) {
              opexNeedUpdate = true;
              return { ...p, outletId: initialOutletId };
            }
            return p;
          });

          if (dbMenus.length === 0) {
            dbMenus = [mkMenu({ name: 'Kopi Susu Signature', emoji: '☕', category: 'Minuman', outletId: initialOutletId })];
            menusNeedUpdate = true;
          }
          if (dbProfiles.length === 0) {
            dbProfiles = [mkOpexProfile({ outletId: initialOutletId })];
            opexNeedUpdate = true;
          }

          if (menusNeedUpdate) {
            await fetch('/api/menus', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(dbMenus)
            });
          }
          if (opexNeedUpdate) {
            await fetch('/api/opex', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(dbProfiles)
            });
          }
        }

        setMenus(dbMenus);
        const activeOutletMenu = dbMenus.find(m => m.outletId === initialOutletId);
        setActiveId(activeOutletMenu?.id || null);

        setOpexProfiles(dbProfiles);
        const activeOutletProfile = dbProfiles.find(p => p.outletId === initialOutletId);
        setActiveProfileId(activeOutletProfile?.id || null);

        const loadedPresets = loadChannelPresets();
        setChannelPresets(loadedPresets);
      } catch (error) {
        console.error("Gagal memuat data dari database. Memakai fallback local.", error);
        const localOutlet = { id: 'default-local-outlet', name: 'Outlet Lokal' };
        setOutlets([localOutlet]);
        setActiveOutletId('default-local-outlet');

        const localMenus = loadDB().map(m => ({ ...m, outletId: 'default-local-outlet' }));
        const loadedMenus = localMenus.length > 0 ? localMenus : [mkMenu({ name: 'Kopi Susu Signature', emoji: '☕', category: 'Minuman', outletId: 'default-local-outlet' })];
        setMenus(loadedMenus);
        setActiveId(loadedMenus[0]?.id || null);

        const localProfiles = loadOpexProfiles().map(p => ({ ...p, outletId: 'default-local-outlet' }));
        const loadedProfiles = localProfiles.length > 0 ? localProfiles : [mkOpexProfile({ outletId: 'default-local-outlet' })];
        setOpexProfiles(loadedProfiles);
        setActiveProfileId(loadedProfiles[0]?.id || null);

        const loadedPresets = loadChannelPresets();
        setChannelPresets(loadedPresets);
        showToast('Menggunakan offline mode. Beberapa fitur tersimpan lokal.', 'alert');
      }
    };
    
    initData();
  }, []);

  // Save to DB whenever menus change (automatic backup to LocalStorage)
  useEffect(() => {
    if (isMounted) {
      saveDB(menus);
    }
  }, [menus, isMounted]);

  // Save OPEX Profiles whenever they change (automatic backup to LocalStorage)
  useEffect(() => {
    if (isMounted && opexProfiles.length > 0) {
      saveOpexProfiles(opexProfiles);
    }
  }, [opexProfiles, isMounted]);

  // Save Channel Presets whenever they change
  useEffect(() => {
    if (isMounted && channelPresets.length > 0) {
      saveChannelPresets(channelPresets);
    }
  }, [channelPresets, isMounted]);

  const handleSaveAll = useCallback(async () => {
    try {
      showToast('Menyimpan ke database...', 'info');
      
      const menusRes = await fetch('/api/menus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menus)
      });
      if (!menusRes.ok) throw new Error('Gagal menyimpan menu');
      
      if (opexProfiles.length > 0) {
        const opexRes = await fetch('/api/opex', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(opexProfiles)
        });
        if (!opexRes.ok) throw new Error('Gagal menyimpan profil OPEX');
      }
      
      saveDB(menus);
      saveOpexProfiles(opexProfiles);
      showToast('Tersimpan sukses ke database MariaDB!', 'success');
    } catch (error) {
      console.error("Save error:", error);
      showToast('Gagal menyimpan ke database. Data dicadangkan ke browser.', 'alert');
      saveDB(menus);
      saveOpexProfiles(opexProfiles);
    }
  }, [menus, opexProfiles, showToast]);

  /* ── Outlet CRUD & BEP Settings Sync ── */
  const handleAddOutlet = useCallback(async (name, copyFromOutletId) => {
    try {
      const res = await fetch('/api/outlets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, copyFromOutletId })
      });
      if (!res.ok) throw new Error('Gagal membuat outlet');
      const newOutlet = await res.json();
      setOutlets(prev => [...prev, newOutlet]);

      if (copyFromOutletId) {
        // Re-fetch everything to get the duplicated data
        const menusRes = await fetch('/api/menus');
        const dbMenus = await menusRes.json();
        setMenus(dbMenus);

        const opexRes = await fetch('/api/opex');
        const dbProfiles = await opexRes.json();
        setOpexProfiles(dbProfiles);

        const bepRes = await fetch('/api/bep');
        const dbBep = await bepRes.json();
        setBepSettings(dbBep);
      } else {
        // Create initial default settings
        const newBep = {
          outletId: newOutlet.id,
          operationalDays: 30,
          manualOpex: null,
          manualMargin: null,
          manualPrice: null,
          actualVolume: null,
          manualInvestment: null,
          targetPaybackMonths: 12
        };
        setBepSettings(prev => [...prev, newBep]);

        const initialMenu = mkMenu({ name: 'Kopi Susu Signature', emoji: '☕', category: 'Minuman', outletId: newOutlet.id });
        setMenus(prev => [initialMenu, ...prev]);

        const initialProfile = mkOpexProfile({ name: 'Profil Utama', outletId: newOutlet.id });
        setOpexProfiles(prev => [...prev, initialProfile]);

        await fetch('/api/menus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(initialMenu)
        });
        await fetch('/api/opex', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(initialProfile)
        });
      }

      setActiveOutletId(newOutlet.id);
      showToast(`Outlet "${name}" berhasil dibuat!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal membuat outlet', 'error');
    }
  }, [showToast]);

  const handleRenameOutlet = useCallback(async (id, name) => {
    try {
      const res = await fetch('/api/outlets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name })
      });
      if (!res.ok) throw new Error('Gagal mengubah nama outlet');
      const updated = await res.json();
      setOutlets(prev => prev.map(o => o.id === id ? updated : o));
      showToast('Nama outlet berhasil diubah!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal mengubah nama outlet', 'error');
    }
  }, [showToast]);

  const handleDeleteOutlet = useCallback(async (id) => {
    if (outlets.length <= 1) {
      showToast('Gagal menghapus! Minimal harus ada 1 outlet.', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/outlets?id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Gagal menghapus outlet');
      setOutlets(prev => prev.filter(o => o.id !== id));
      setMenus(prev => prev.filter(m => m.outletId !== id));
      setOpexProfiles(prev => prev.filter(p => p.outletId !== id));
      setBepSettings(prev => prev.filter(b => b.outletId !== id));

      if (activeOutletId === id) {
        const remaining = outlets.filter(o => o.id !== id);
        setActiveOutletId(remaining[0].id);
      }
      showToast('Outlet berhasil dihapus!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus outlet', 'error');
    }
  }, [outlets, activeOutletId, showToast]);

  const handleUpdateBepSettings = useCallback(async (updated) => {
    try {
      setBepSettings(prev => {
        const next = prev.filter(b => b.outletId !== updated.outletId);
        return [...next, updated];
      });

      await fetch('/api/bep', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.error("Gagal menyimpan parameter BEP:", err);
    }
  }, []);

  /* ── Menu CRUD ── */
  const updateActiveMenu = useCallback((changes) => {
    setMenus(prev => prev.map(m =>
      m.id === activeId
        ? { ...m, ...changes, updatedAt: new Date().toISOString() }
        : m
    ));
  }, [activeId]);

  const addMenu = () => {
    const newMenu = mkMenu({ outletId: activeOutletId });
    setMenus(prev => [newMenu, ...prev]);
    setActiveId(newMenu.id);
    setView('calculator');
    showToast('Menu baru ditambahkan!', 'success');
  };

  const deleteMenu = (id) => {
    if (!window.confirm('Hapus menu ini dari database?')) return;
    setMenus(prev => {
      const next = prev.filter(m => m.id !== id);
      if (id === activeId) {
        // Fallback to active outlet's first menu
        const outletMenus = next.filter(m => m.outletId === activeOutletId);
        setActiveId(outletMenus.length > 0 ? outletMenus[0].id : null);
      }
      return next;
    });
    showToast('Menu dihapus', 'info');
  };

  const duplicateMenu = (id) => {
    const src = menus.find(m => m.id === id);
    if (!src) return;
    const dup = {
      ...JSON.parse(JSON.stringify(src)),
      id: uid(),
      name: src.name + ' (Copy)',
      outletId: activeOutletId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setMenus(prev => [dup, ...prev]);
    setActiveId(dup.id);
    setView('calculator');
    showToast('Menu diduplikat!', 'success');
  };

  const selectMenu = (id) => {
    setActiveId(id);
    setView('calculator');
  };

  const deleteMenusBatch = useCallback((ids) => {
    if (!window.confirm(`Hapus ${ids.length} menu yang dipilih dari database?`)) return;
    setMenus(prev => {
      const next = prev.filter(m => !ids.includes(m.id));
      if (ids.includes(activeId)) {
        const outletMenus = next.filter(m => m.outletId === activeOutletId);
        setActiveId(outletMenus.length > 0 ? outletMenus[0].id : null);
      }
      return next;
    });
    showToast(`${ids.length} menu dihapus`, 'info');
  }, [activeId, activeOutletId, showToast]);

  const handleExportSingleExcel = () => {
    if (!activeMenu) return;
    const m = activeMenu;
    const targetUnit = m.targetUnit || 'cup';
    const pcsPerPortion = m.pcsPerPortion || 1;
    const subUnitLabel = m.subUnitLabel || 'pcs';

    const bb = m.ingredients.reduce((s, i) => num(i.ukuranKemasan) ? s + (num(i.hargaBeli) / num(i.ukuranKemasan)) * num(i.takaranPerCup) : s, 0);
    const km = m.packaging.filter(p => p.enabled).reduce((s, p) => s + (num(p.harga) * num(p.usage !== undefined ? p.usage : 1)), 0);
    const hpp = bb + km;
    const hargaJual = m.margin >= 100 ? 0 : hpp / (1 - m.margin / 100);
    const hargaJualBulat = roundPrice(hargaJual);
    const profit = hargaJualBulat - hpp;

    const summaryData = [{
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
    }];

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan HPP");

    const details = [];
    details.push({ A: `LAPORAN DETAIL HPP: ${m.name.toUpperCase()}` });
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
    details.push({ A: 'Sub-total Bahan Baku', F: bb });
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
    details.push({ A: 'Sub-total Kemasan', F: km });
    details.push({});

    details.push({ A: 'RINGKASAN AKHIR' });
    details.push({ A: `TOTAL HPP per ${targetUnit}`, F: hpp });
    details.push({ A: `Harga Jual per ${targetUnit}`, F: hargaJualBulat });
    details.push({ A: `Profit per ${targetUnit}`, F: profit });
    
    if (pcsPerPortion > 1) {
      details.push({ A: `Bagi Porsi: 1 ${targetUnit} = ${pcsPerPortion} ${subUnitLabel}` });
      details.push({ A: `TOTAL HPP per ${subUnitLabel}`, F: hpp / pcsPerPortion });
      details.push({ A: `Harga Jual per ${subUnitLabel}`, F: roundPrice(hargaJual / pcsPerPortion) });
      details.push({ A: `Profit per ${subUnitLabel}`, F: roundPrice(hargaJual / pcsPerPortion) - (hpp / pcsPerPortion) });
    }
    
    details.push({ A: 'Estimasi Profit Bulanan', F: profit * num(m.ops.estimasiCup) });

    const wsDetail = XLSX.utils.json_to_sheet(details, { skipHeader: true });
    XLSX.utils.book_append_sheet(wb, wsDetail, "Detail");

    XLSX.writeFile(wb, `Laporan_HPP_${m.name.replace(/\s+/g, '_')}.xlsx`);
  };

  /* ── Print ── */
  const handlePrint = () => {
    if (!activeMenu) return;
    const m = activeMenu;
    const w = window.open('', '_blank');
    if (!w) return;
    
    const lines = m.ingredients.map(ing => {
      const perUnit = num(ing.ukuranKemasan) ? num(ing.hargaBeli) / num(ing.ukuranKemasan) : 0;
      return `  ${(ing.name || '-').padEnd(22)} ${fmtRp(perUnit * num(ing.takaranPerCup))}`;
    }).join('\n');
    const pkgLines = m.packaging.filter(p => p.enabled).map(p => `  ${p.name.padEnd(22)} ${fmtRp(p.harga)}`).join('\n');

    const targetUnit = m.targetUnit || 'cup';
    const pcsPerPortion = m.pcsPerPortion || 1;
    const subUnitLabel = m.subUnitLabel || 'pcs';

    // Recalculate for print
    const bb = m.ingredients.reduce((s, i) => num(i.ukuranKemasan) ? s + (num(i.hargaBeli) / num(i.ukuranKemasan)) * num(i.takaranPerCup) : s, 0);
    const km = m.packaging.filter(p => p.enabled).reduce((s, p) => s + (num(p.harga) * num(p.usage !== undefined ? p.usage : 1)), 0);
    
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

    const body = `
  ╔══════════════════════════════════════════╗
  ║         LAPORAN HPP F&B                  ║
  ║         ${(m.emoji + ' ' + m.name).padEnd(38)}║
  ╚══════════════════════════════════════════╝
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

  ${m.notes ? '📝 CATATAN:\n  ' + m.notes : ''}
    `;
    w.document.write(`<pre style="font-family:monospace;font-size:13px;padding:32px;line-height:1.9">${body}</pre>`);
    w.document.title = `HPP — ${m.name}`;
    w.document.close();
    w.print();
  };

  // Hydration fallback
  if (!isMounted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16, background: 'var(--bg-app)' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#0066cc,#2997ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Icon name="coffee" size={24} />
        </div>
        <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--color-text-muted)' }}>Memuat Kalkulator HPP…</div>
        <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, color: 'var(--color-text-muted)', opacity: 0.8 }}>Harap tunggu sebentar</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', paddingBottom: 48 }}>

      {/* ── Top Bar ── */}
      <div className="topbar">
        <div className="flex-center gap-3">
          <div className="topbar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="coffee" size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>Kalkulator HPP F&B</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Harga Pokok Penjualan — Real-Time</div>
          </div>
        </div>
        <div className="flex-center gap-2 header-btns">

          {view === 'calculator' && activeMenu && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowChannelModal(true)} title="Master Channel Penjualan (ShopeeFood, GoFood, Grab, dll)">
                <Icon name="store" size={12} /> Preset Channel
              </button>
              <button className="btn btn-ghost btn-sm" onClick={handlePrint}>
                <Icon name="print" size={12} /> Cetak
              </button>
              <button className="btn btn-ghost btn-sm" onClick={handleSaveAll}>
                <Icon name="save" size={12} /> Simpan
              </button>
            </>
          )}
          {view === 'opex' && opexProfiles.length > 0 && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowChannelModal(true)} title="Master Channel Penjualan">
                <Icon name="store" size={12} /> Preset Channel
              </button>
              <button className="btn btn-ghost btn-sm" onClick={handleSaveAll}>
                <Icon name="save" size={12} /> Simpan Semua
              </button>
            </>
          )}
          {view === 'database' && (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowChannelModal(true)} title="Master Channel Penjualan">
              <Icon name="store" size={12} /> Preset Channel
            </button>
          )}

          {/* Global Outlet Selector Dropdown */}
          {outlets.length > 0 && (
            <div className="flex-center gap-1" style={{ marginRight: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 650 }}>Outlet:</span>
              <select
                className="hpp-input sm"
                value={activeOutletId || ''}
                onChange={e => {
                  const targetOutletId = e.target.value;
                  setActiveOutletId(targetOutletId);
                  const oMenus = menus.filter(m => m.outletId === targetOutletId);
                  setActiveId(oMenus.length > 0 ? oMenus[0].id : null);
                  const oProfiles = opexProfiles.filter(p => p.outletId === targetOutletId);
                  setActiveProfileId(oProfiles.length > 0 ? oProfiles[0].id : null);
                }}
                style={{
                  fontWeight: 700,
                  fontSize: 11,
                  padding: '4px 24px 4px 8px',
                  height: 'auto',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-app)',
                  color: 'var(--color-text)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: 130
                }}
              >
                {outlets.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          )}

          <span style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', height: 20, margin: '0 4px' }} />
          <button
            className={`btn btn-sm ${view === 'calculator' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('calculator')}>
            Kalkulator HPP
          </button>
          <button
            className={`btn btn-sm ${view === 'opex' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('opex')}>
            Akumulasi OPEX
          </button>
          <button
            className={`btn btn-sm ${view === 'bep' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('bep')}>
            Kalkulator BEP
          </button>
          <button
            className={`btn btn-sm ${view === 'database' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('database')}>
            <Icon name="database" size={12} /> Data
          </button>
        </div>
      </div>

      {/* ── Menu Name Bar (only in calculator view) ── */}
      {view === 'calculator' && activeMenu && (
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', padding: '10px 28px' }}>
          <div className="flex-center gap-3" style={{ flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center' }}><Icon name={activeMenu.emoji} size={20} color="var(--primary)" /></span>
            <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-text)' }}>{activeMenu.name}</span>
            <button
              onClick={() => setShowMeta(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 6px',
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                transition: 'all 0.15s',
                marginLeft: -6
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--bg-app)'}
              onMouseOut={e => e.currentTarget.style.background = 'none'}
              title="Edit Info Menu"
            >
              <Icon name="edit" size={13} />
            </button>
            <span className={`badge badge-slate`}>{activeMenu.category}</span>
            {menus.length > 1 && (
              <div className="flex-center gap-1" style={{ marginLeft: 'auto' }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginRight: 4 }}>Pindah Menu:</span>
                <select
                  className="hpp-input sm"
                  value={activeId || ''}
                  onChange={e => selectMenu(e.target.value)}
                  style={{
                    maxWidth: 220,
                    fontWeight: 600,
                    fontSize: 11,
                    padding: '4px 24px 4px 8px',
                    height: 'auto',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-app)',
                    color: 'var(--color-text)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {menus.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex-center gap-2" style={{ marginLeft: menus.length <= 1 ? 'auto' : 0 }}>
              <button className="btn btn-add btn-sm" onClick={addMenu}>
                <Icon name="plus" size={12} /> Menu Baru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── OPEX Profile Bar (only in opex view) ── */}
      {view === 'opex' && opexProfiles.length > 0 && (
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', padding: '10px 28px' }}>
          <div className="flex-center gap-3" style={{ flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center' }}><Icon name="store" size={20} color="var(--primary)" /></span>
            <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-text)' }}>{activeProfile?.name || 'Profil Toko'}</span>
            <button
              onClick={() => {
                const currentName = activeProfile?.name || '';
                const newName = prompt("Ubah Nama Profil:", currentName);
                if (newName !== null && newName.trim() !== '') {
                  setOpexProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, name: newName.trim() } : p));
                  showToast("Nama profil berhasil diubah!", "success");
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 6px',
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                transition: 'all 0.15s',
                marginLeft: -6
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--bg-app)'}
              onMouseOut={e => e.currentTarget.style.background = 'none'}
              title="Edit Nama Profil"
            >
              <Icon name="edit" size={13} />
            </button>
            <span style={{ borderLeft: '1px solid var(--border-color)', height: 16, margin: '0 4px' }} />
            
            {opexProfiles.length > 1 && (
              <div className="flex-center gap-1">
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginRight: 4 }}>Pindah Profil:</span>
                <select
                  className="hpp-input sm"
                  value={activeProfileId || ''}
                  onChange={e => setActiveProfileId(e.target.value)}
                  style={{
                    maxWidth: 220,
                    fontWeight: 600,
                    fontSize: 11,
                    padding: '4px 24px 4px 8px',
                    height: 'auto',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-app)',
                    color: 'var(--color-text)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {opexProfiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex-center gap-2" style={{ marginLeft: 'auto' }}>
              <button
                className="btn btn-add btn-sm"
                onClick={() => {
                  const newProfile = mkOpexProfile();
                  newProfile.name = `Profil ${opexProfiles.length + 1}`;
                  setOpexProfiles(prev => [...prev, newProfile]);
                  setActiveProfileId(newProfile.id);
                  showToast(`Profil "${newProfile.name}" dibuat!`, 'success');
                }}
              >
                <Icon name="plus" size={12} /> Profil Baru
              </button>

              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  if (opexProfiles.length <= 1) {
                    showToast('Gagal menghapus! Minimal harus menyisakan 1 profil.', 'error');
                    return;
                  }
                  const idToDelete = activeProfileId;
                  setOpexProfiles(prev => {
                    const next = prev.filter(p => p.id !== idToDelete);
                    if (idToDelete === activeProfileId) {
                      setActiveProfileId(next[0]?.id || null);
                    }
                    return next;
                  });
                  showToast('Profil berhasil dihapus!', 'success');
                }}
                style={{ width: 'auto', height: 'auto', padding: '6px 12px', fontSize: 11, borderRadius: 8 }}
              >
                <Icon name="trash" size={12} /> Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      {view === 'calculator' && (
        activeMenu ? (
          <HppCalculator
            menu={activeMenu}
            onUpdate={updateActiveMenu}
            showToast={showToast}
            channelPresets={channelPresets}
            activeProfile={activeProfile}
            onOpenChannelModal={() => setShowChannelModal(true)}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
              <Icon name="coffee" size={48} color="var(--primary)" />
            </div>
            <button className="btn btn-primary" onClick={addMenu}>
              <Icon name="plus" size={14} /> Buat Menu Pertama
            </button>
          </div>
        )
      )}

      {view === 'database' && (
        <MenuDatabase
          menus={activeOutletMenus} activeId={activeId}
          onSelect={selectMenu} onAdd={addMenu}
          onDelete={deleteMenu} onDuplicate={duplicateMenu}
          onDeleteBatch={deleteMenusBatch}
          opexProfiles={activeOutletProfiles}
          activeProfileId={activeProfileId}
          onSelectProfile={(id) => {
            setActiveProfileId(id);
            setView('opex');
          }}
          onAddProfile={(newProfile) => {
            newProfile.outletId = activeOutletId;
            setOpexProfiles(prev => [...prev, newProfile]);
            setActiveProfileId(newProfile.id);
            setView('opex');
            showToast(`Profil "${newProfile.name}" dibuat!`, 'success');
          }}
          onDeleteProfile={(id) => {
            setOpexProfiles(prev => {
              const next = prev.filter(p => p.id !== id);
              if (id === activeProfileId) {
                const outletProfiles = next.filter(p => p.outletId === activeOutletId);
                setActiveProfileId(outletProfiles.length > 0 ? outletProfiles[0].id : null);
              }
              return next;
            });
            showToast('Profil OPEX dihapus', 'info');
          }}
          outlets={outlets}
          activeOutletId={activeOutletId}
          onSelectOutlet={setActiveOutletId}
          onAddOutlet={handleAddOutlet}
          onRenameOutlet={handleRenameOutlet}
          onDeleteOutlet={handleDeleteOutlet}
          bepSettings={bepSettings}
          onUpdateBepSettings={handleUpdateBepSettings}
          showToast={showToast}
        />
      )}

      {view === 'opex' && opexProfiles.length > 0 && (
        <OpexAccumulator
          menus={activeOutletMenus}
          onUpdateMenu={(id, changes) => {
            setMenus(prev => prev.map(m => m.id === id ? { ...m, ...changes, updatedAt: new Date().toISOString() } : m));
          }}
          opexProfiles={activeOutletProfiles}
          activeProfileId={activeProfileId}
          onSelectProfile={setActiveProfileId}
          onUpdateProfile={(changes) => {
            setOpexProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, ...changes } : p));
          }}
          onAddProfile={(newProfile) => {
            newProfile.outletId = activeOutletId;
            setOpexProfiles(prev => [...prev, newProfile]);
            setActiveProfileId(newProfile.id);
            showToast(`Profil "${newProfile.name}" dibuat!`, 'success');
          }}
          onDeleteProfile={(id) => {
            setOpexProfiles(prev => {
              const next = prev.filter(p => p.id !== id);
              if (id === activeProfileId) {
                const outletProfiles = next.filter(p => p.outletId === activeOutletId);
                setActiveProfileId(outletProfiles.length > 0 ? outletProfiles[0].id : null);
              }
              return next;
            });
            showToast('Profil OPEX dihapus', 'info');
          }}
          onNavigateToCalculator={(menuId) => {
            setActiveId(menuId);
            setView('calculator');
          }}
          onNavigateToBep={() => {
            setView('bep');
          }}
          channelPresets={channelPresets}
          onOpenChannelModal={() => setShowChannelModal(true)}
        />
      )}

      {view === 'bep' && (
        <BepCalculator
          menus={activeOutletMenus}
          opexProfiles={activeOutletProfiles}
          activeProfileId={activeProfileId}
          onSelectProfile={setActiveProfileId}
          bepSettings={bepSettings}
          activeOutletId={activeOutletId}
          onUpdateBepSettings={handleUpdateBepSettings}
        />
      )}

      {/* Modals */}
      {showMeta && activeMenu && (
        <MenuMetaModal
          menu={activeMenu}
          onSave={(changes) => updateActiveMenu(changes)}
          onClose={() => setShowMeta(false)}
        />
      )}

      <ChannelPresetsModal
        isOpen={showChannelModal}
        onClose={() => setShowChannelModal(false)}
        channelPresets={channelPresets}
        onSavePresets={(updated) => {
          setChannelPresets(updated);
          saveChannelPresets(updated);
        }}
        showToast={showToast}
      />

      {/* Footer */}
      <div style={{
        textAlign: 'center', padding: '12px 28px', fontSize: 11, color: 'var(--color-text-muted)',
        borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)', marginTop: 12
      }}>
        HPP F&B Calculator &bull; {menus.length} menu tersimpan &bull; Data disimpan otomatis di browser
      </div>

      {/* Toast */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
