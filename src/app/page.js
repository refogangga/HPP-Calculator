"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Icon } from '../components/Icon';
import { ToastContainer, MenuMetaModal } from '../components/HppSubComponents';
import HppCalculator from '../components/HppCalculator';
import MenuDatabase from '../components/MenuDatabase';
import OpexAccumulator from '../components/OpexAccumulator';
import BepCalculator from '../components/BepCalculator';
import ShopeeReverseEstimator from '../components/ShopeeReverseEstimator';
import ChannelPresetsModal from '../components/ChannelPresetsModal';
import { num, fmtRp, roundPrice, uid, mkMenu, loadDB, saveDB, getPenyusutanBulanan, getDirectHPP, loadOpexProfiles, saveOpexProfiles, mkOpexProfile, loadChannelPresets, saveChannelPresets, loadIngredients, saveIngredients, loadAssets, saveAssets } from '../utils/hpp';
import * as XLSX from 'xlsx';
import { Show, SignInButton, UserButton, useUser, useAuth } from '@clerk/nextjs';

function CurrentUserDetails() {
  const { user } = useUser();
  if (!user) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {user.fullName || user.username || 'User'}
      </span>
      <span style={{ fontSize: 9, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {user.primaryEmailAddress?.emailAddress}
      </span>
    </div>
  );
}

export default function Home() {
  const { orgRole } = useAuth();
  const { user } = useUser();

  const userRole = orgRole || user?.publicMetadata?.role;
  // Bypassed: Set to true always while Clerk is temporarily disabled
  const isAdmin = true;
  // const isAdmin = userRole === 'org:admin' || userRole === 'admin' || !userRole;

  const [isMounted, setIsMounted] = useState(false);
  const [menus, setMenus] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [view, setView] = useState('dashboard'); // default to dashboard

  useEffect(() => {
    if (!isAdmin && (view === 'database_simulasi' || view === 'database_master')) {
      setView('dashboard');
    }
  }, [isAdmin, view]);
  const [toasts, setToasts] = useState([]);
  const [dbActiveTab, setDbActiveTab] = useState('menu');
  const [showMeta, setShowMeta] = useState(false);
  const [opexProfiles, setOpexProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [channelPresets, setChannelPresets] = useState([]);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [outlets, setOutlets] = useState([]);
  const [activeOutletId, setActiveOutletId] = useState(null);
  const [bepSettings, setBepSettings] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [assets, setAssets] = useState([]);


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
        if (!outletsRes.ok) throw new Error('Gagal memuat outlet dari server');
        let dbOutlets = await outletsRes.json();
        
        if (dbOutlets.error || !Array.isArray(dbOutlets)) {
          throw new Error(dbOutlets.error || 'Format data outlet tidak valid');
        }
        
        if (dbOutlets.length === 0) {
          const createRes = await fetch('/api/outlets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Outlet Utama' })
          });
          if (!createRes.ok) throw new Error('Gagal membuat outlet default');
          const newOutlet = await createRes.json();
          if (newOutlet.error || !newOutlet.id) {
            throw new Error(newOutlet.error || 'Gagal membuat outlet default');
          }
          dbOutlets = [newOutlet];
        }
        
        setOutlets(dbOutlets);
        const initialOutletId = dbOutlets[0].id;
        setActiveOutletId(initialOutletId);

        // 2. Load BEP settings
        const bepRes = await fetch('/api/bep');
        if (!bepRes.ok) throw new Error('Gagal memuat BEP dari server');
        const dbBep = await bepRes.json();
        if (dbBep.error || !Array.isArray(dbBep)) {
          throw new Error(dbBep.error || 'Format data BEP tidak valid');
        }
        setBepSettings(dbBep);

        // 3. Load Menus
        const menusRes = await fetch('/api/menus');
        if (!menusRes.ok) throw new Error('Gagal memuat menu dari server');
        let dbMenus = await menusRes.json();
        if (dbMenus.error || !Array.isArray(dbMenus)) {
          throw new Error(dbMenus.error || 'Format data menu tidak valid');
        }
        
        // 4. Load Opex Profiles
        const opexRes = await fetch('/api/opex');
        if (!opexRes.ok) throw new Error('Gagal memuat opex dari server');
        let dbProfiles = await opexRes.json();
        if (dbProfiles.error || !Array.isArray(dbProfiles)) {
          throw new Error(dbProfiles.error || 'Format data opex tidak valid');
        }

        // 4b. Load Ingredients
        const ingRes = await fetch('/api/ingredients');
        if (!ingRes.ok) throw new Error('Gagal memuat bahan baku dari server');
        let dbIngredients = await ingRes.json();
        if (dbIngredients.error || !Array.isArray(dbIngredients)) {
          throw new Error(dbIngredients.error || 'Format data bahan tidak valid');
        }

        // 4c. Load Assets
        const assetRes = await fetch('/api/assets');
        if (!assetRes.ok) throw new Error('Gagal memuat aset dari server');
        let dbAssets = await assetRes.json();
        if (dbAssets.error || !Array.isArray(dbAssets)) {
          throw new Error(dbAssets.error || 'Format data aset tidak valid');
        }

        // 5. Fallback migrations (LocalStorage)
        const localMenus = loadDB();
        const localProfiles = loadOpexProfiles();
        const localIngredients = loadIngredients();
        const localAssets = loadAssets();
        
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

        // Migrate local ingredients/assets to Server DB if server DB is empty
        if (dbIngredients.length === 0 && localIngredients.length > 0) {
          dbIngredients = localIngredients.map(i => ({ ...i, outletId: i.outletId || initialOutletId }));
          await fetch('/api/ingredients', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dbIngredients)
          });
        }
        if (dbAssets.length === 0 && localAssets.length > 0) {
          dbAssets = localAssets.map(a => ({ ...a, outletId: a.outletId || initialOutletId }));
          await fetch('/api/assets', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dbAssets)
          });
        }

        setMenus(dbMenus);
        const activeOutletMenu = dbMenus.find(m => m.outletId === initialOutletId);
        setActiveId(activeOutletMenu?.id || null);

        setOpexProfiles(dbProfiles);
        const activeOutletProfile = dbProfiles.find(p => p.outletId === initialOutletId);
        setActiveProfileId(activeOutletProfile?.id || null);

        setIngredients(dbIngredients);
        setAssets(dbAssets);

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

        const localIng = loadIngredients().map(i => ({ ...i, outletId: i.outletId || 'default-local-outlet' }));
        setIngredients(localIng);

        const localAst = loadAssets().map(a => ({ ...a, outletId: a.outletId || 'default-local-outlet' }));
        setAssets(localAst);

        const loadedPresets = loadChannelPresets();
        setChannelPresets(loadedPresets);
        showToast('Menggunakan offline mode. Beberapa fitur tersimpan lokal.', 'alert');
      }
    };
    
    initData();
  }, [showToast]);

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

  // Save Ingredients whenever they change
  useEffect(() => {
    if (isMounted) {
      saveIngredients(ingredients);
    }
  }, [ingredients, isMounted]);

  // Save Assets whenever they change
  useEffect(() => {
    if (isMounted) {
      saveAssets(assets);
    }
  }, [assets, isMounted]);

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

      // Sync Ingredients
      const ingRes = await fetch('/api/ingredients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ingredients)
      });
      if (!ingRes.ok) throw new Error('Gagal menyimpan bahan baku');

      // Sync Assets
      const astRes = await fetch('/api/assets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assets)
      });
      if (!astRes.ok) throw new Error('Gagal menyimpan aset');
      
      saveDB(menus);
      saveOpexProfiles(opexProfiles);
      saveIngredients(ingredients);
      saveAssets(assets);
      showToast('Tersimpan sukses ke database MariaDB!', 'success');
    } catch (error) {
      console.error("Save error:", error);
      showToast('Gagal menyimpan ke database. Data dicadangkan ke browser.', 'alert');
      saveDB(menus);
      saveOpexProfiles(opexProfiles);
      saveIngredients(ingredients);
      saveAssets(assets);
    }
  }, [menus, opexProfiles, ingredients, assets, showToast]);

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

  const deleteMenu = async (id) => {
    if (!window.confirm('Hapus menu ini dari database?')) return;
    try {
      // First ensure this menu exists on server by doing a save
      const menuToDelete = menus.find(m => m.id === id);
      if (menuToDelete) {
        await fetch('/api/menus', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(menus)
        });
      }
      const res = await fetch(`/api/menus?id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal menghapus menu dari server');
      }
      setMenus(prev => {
        const next = prev.filter(m => m.id !== id);
        if (id === activeId) {
          const outletMenus = next.filter(m => m.outletId === activeOutletId);
          setActiveId(outletMenus.length > 0 ? outletMenus[0].id : null);
        }
        return next;
      });
      showToast('Menu dihapus dari database', 'info');
    } catch (err) {
      console.error("Delete menu error:", err);
      showToast('Gagal menghapus menu dari database: ' + err.message, 'error');
    }
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

  const deleteMenusBatch = useCallback(async (ids) => {
    if (!window.confirm(`Hapus ${ids.length} menu yang dipilih dari database?`)) return;
    try {
      // First sync all menus to server to ensure they exist
      await fetch('/api/menus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menus)
      });
      const res = await fetch(`/api/menus?ids=${ids.join(',')}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal menghapus menu dari server');
      }
      setMenus(prev => {
        const next = prev.filter(m => !ids.includes(m.id));
        if (ids.includes(activeId)) {
          const outletMenus = next.filter(m => m.outletId === activeOutletId);
          setActiveId(outletMenus.length > 0 ? outletMenus[0].id : null);
        }
        return next;
      });
      showToast(`${ids.length} menu dihapus dari database`, 'info');
    } catch (err) {
      console.error("Bulk delete menu error:", err);
      showToast('Gagal menghapus menu dari database: ' + err.message, 'error');
    }
  }, [menus, activeId, activeOutletId, showToast]);

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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)', fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── LEFT SIDEBAR ── */}
      <div style={{
        width: 260,
        background: '#fff',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 50
      }}>
        {/* Brand logo & title */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Icon name="coffee" size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-text)', letterSpacing: '-0.02em', lineHeight: '1.2' }}>HPP Calculator</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 500 }}>F&B Professional</div>
          </div>
        </div>

        {/* Outlet Selector inside sidebar */}
        {outlets.length > 0 && (
          <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid var(--border-color)' }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 6 }}>
              Outlet Aktif
            </label>
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
              style={{ fontWeight: 600, width: '100%' }}
            >
              {outlets.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Sidebar Nav Links */}
        <div style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {[
            { id: 'dashboard', label: 'Overview Dashboard', icon: 'pieChart' },
            { id: 'calculator', label: 'Kalkulator HPP', icon: 'coffee' },
            { id: 'opex', label: 'Akumulasi OPEX', icon: 'zap' },
            { id: 'bep', label: 'Kalkulator BEP', icon: 'calculator' },
            { id: 'shopee_estimator', label: 'Dana Aktual Shopee', icon: 'bag' }
          ].map(item => {
            const isAct = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: isAct ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  color: isAct ? '#4f46e5' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 12,
                  textAlign: 'left',
                  transition: 'all 0.15s'
                }}
              >
                <Icon name={item.icon} size={15} color={isAct ? '#4f46e5' : 'var(--color-text-muted)'} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* DATABASE & KONFIGURASI GROUP (ADMIN ONLY) */}
          {isAdmin && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', padding: '0 12px', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Database &amp; Konfigurasi
              </div>
              {[
                { id: 'database_simulasi', label: 'Profil & Parameter', subLabel: 'Penyusutan, BEP, Kelayakan', icon: 'tool', tab: 'opex' },
                { id: 'database_master', label: 'Database Master', subLabel: 'Bahan Baku, Kemasan, Resep, Aset', icon: 'database', tab: 'ingredients' }
              ].map(item => {
                const isAct = view === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setView(item.id);
                      setDbActiveTab(item.tab);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: 'none',
                      background: isAct ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                      color: isAct ? '#4f46e5' : 'var(--color-text-muted)',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 12,
                      textAlign: 'left',
                      transition: 'all 0.15s',
                      marginBottom: 2
                    }}
                  >
                    <Icon name={item.icon} size={14} color={isAct ? '#4f46e5' : 'var(--color-text-muted)'} style={{ marginTop: 2 }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{item.label}</span>
                      <span style={{ fontSize: 9, fontWeight: 500, color: isAct ? '#6366f1' : 'var(--color-text-muted)', marginTop: 1 }}>{item.subLabel}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Footer: Save Sync & Auth */}
        <div style={{ padding: 16, borderTop: '1px solid var(--border-color)', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {isAdmin && (
            <button className="btn btn-primary" onClick={handleSaveAll} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', fontSize: 12, fontWeight: 700 }}>
              <Icon name="save" size={13} /> Simpan Data
            </button>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 4px', borderTop: '1px solid var(--border-color)', marginTop: 4 }}>
            <Show when="signed-in">
              <UserButton afterSignOutUrl="/" />
              <CurrentUserDetails />
            </Show>
            <Show when="signed-out">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800 }}>
                  A
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Admin (Offline)
                  </span>
                  <span style={{ fontSize: 9, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Mode Akses Penuh
                  </span>
                </div>
              </div>
            </Show>
          </div>
          
          <div style={{ fontSize: 9, color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 2 }}>
            Sinkronisasi Awan &amp; Lokal Aktif
          </div>
        </div>
      </div>

      {/* ── RIGHT MAIN PANEL ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        
        {/* Main Panel Header */}
        <div style={{
          height: 60,
          background: '#fff',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--color-text)' }}>
              {view === 'dashboard' && 'Overview Dashboard'}
              {view === 'calculator' && (activeMenu ? `Kalkulator HPP: ${activeMenu.name}` : 'Kalkulator HPP')}
              {view === 'opex' && 'Pengeluaran Operasional (OPEX)'}
              {view === 'bep' && 'Analisis Break-Even Point (BEP)'}
              {view === 'shopee_estimator' && 'Dana Aktual Shopee'}
              {view === 'database_simulasi' && 'Profil & Parameter Simulasi (Penyusutan, BEP, Kelayakan)'}
              {view === 'database_master' && 'Database Master (Bahan Baku, Resep & Aset)'}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowChannelModal(true)} title="Preset Channel Penjualan">
              <Icon name="store" size={12} /> Preset Channel
            </button>
            {view === 'calculator' && activeMenu && (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowMeta(true)}>
                  <Icon name="edit" size={12} /> Ubah Nama
                </button>
                <button className="btn btn-ghost btn-sm" onClick={handlePrint}>
                  <Icon name="print" size={12} /> Cetak
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Panel Body */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>
          {view === 'dashboard' && (
            <DashboardOverview
              menus={activeOutletMenus}
              activeProfile={activeProfile}
              ingredients={ingredients}
              assets={assets}
              onNavigate={(v, menuId) => {
                if (menuId) setActiveId(menuId);
                setView(v);
              }}
            />
          )}

          {view === 'calculator' && (
            activeMenu ? (
              <HppCalculator
                menu={activeMenu}
                onUpdate={updateActiveMenu}
                showToast={showToast}
                channelPresets={channelPresets}
                activeProfile={activeProfile}
                onOpenChannelModal={() => setShowChannelModal(true)}
                ingredients={ingredients}
                onNavigate={(v, tab) => {
                  setView(v);
                  if (tab) setDbActiveTab(tab);
                }}
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

          {(view === 'database_simulasi' || view === 'database_master') && (
            <MenuDatabase
              menus={activeOutletMenus} activeId={activeId}
              onSelect={selectMenu} onAdd={addMenu}
              onDelete={deleteMenu} onDuplicate={duplicateMenu}
              onDeleteBatch={deleteMenusBatch}
              activeTab={dbActiveTab}
              onChangeTab={setDbActiveTab}
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
              onDeleteProfile={async (id) => {
                if (!window.confirm('Hapus profil OPEX ini dari database?')) return;
                try {
                  await fetch('/api/opex', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(opexProfiles)
                  });
                  const res = await fetch(`/api/opex?id=${id}`, {
                    method: 'DELETE'
                  });
                  if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || 'Gagal menghapus profil dari server');
                  }
                  setOpexProfiles(prev => {
                    const next = prev.filter(p => p.id !== id);
                    if (id === activeProfileId) {
                      const outletProfiles = next.filter(p => p.outletId === activeOutletId);
                      setActiveProfileId(outletProfiles.length > 0 ? outletProfiles[0].id : null);
                    }
                    return next;
                  });
                  showToast('Profil OPEX dihapus dari database', 'info');
                } catch (err) {
                  console.error("Delete opex profile error:", err);
                  showToast('Gagal menghapus profil OPEX: ' + err.message, 'error');
                }
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
              allMenus={menus}
              allOpexProfiles={opexProfiles}
              ingredients={ingredients}
              setIngredients={setIngredients}
              assets={assets}
              setAssets={setAssets}
              group={view === 'database_simulasi' ? 'simulasi' : 'master'}
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
              onDeleteProfile={async (id) => {
                if (!window.confirm('Hapus profil OPEX ini dari database?')) return;
                try {
                  await fetch('/api/opex', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(opexProfiles)
                  });
                  const res = await fetch(`/api/opex?id=${id}`, {
                    method: 'DELETE'
                  });
                  if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || 'Gagal menghapus profil dari server');
                  }
                  setOpexProfiles(prev => {
                    const next = prev.filter(p => p.id !== id);
                    if (id === activeProfileId) {
                      const outletProfiles = next.filter(p => p.outletId === activeOutletId);
                      setActiveProfileId(outletProfiles.length > 0 ? outletProfiles[0].id : null);
                    }
                    return next;
                  });
                  showToast('Profil OPEX dihapus dari database', 'info');
                } catch (err) {
                  console.error("Delete opex profile error:", err);
                  showToast('Gagal menghapus profil OPEX: ' + err.message, 'error');
                }
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
              bepSettings={bepSettings}
              activeOutletId={activeOutletId}
              assets={assets}
              setAssets={setAssets}
              ingredients={ingredients}
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
              showToast={showToast}
              assets={assets}
              ingredients={ingredients}
            />
          )}

          {view === 'shopee_estimator' && (
            <ShopeeReverseEstimator
              menus={menus}
              opexProfiles={opexProfiles}
              activeOutletId={activeOutletId}
              activeProfileId={activeProfileId}
              onUpdateProfile={(changes) => {
                setOpexProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, ...changes } : p));
              }}
              assets={assets}
              setAssets={setAssets}
              ingredients={ingredients}
            />
          )}
        </div>
      </div>

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

      {/* Toast */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

// ─── DASHBOARD OVERVIEW SUBCOMPONENT ───
function DashboardOverview({ menus = [], activeProfile, ingredients = [], assets = [], onNavigate }) {
  const stats = useMemo(() => {
    let volume = 0;
    let omset = 0;
    let cogs = 0;
    
    menus.forEach(m => {
      const vol = num(m.ops?.estimasiCup) || 0;
      const hpp = getDirectHPP(m, ingredients);
      const hj = m.margin >= 100 ? 0 : hpp / (1 - m.margin/100);
      const hjRound = roundPrice(hj);

      volume += vol;
      omset += vol * hjRound;
      cogs += vol * hpp;
    });

    const overhead = activeProfile ? (activeProfile.expenses || []).reduce((sum, exp) => sum + num(exp.value), 0) : 0;
    const penyusutan = activeProfile ? getPenyusutanBulanan(activeProfile, assets) : 0;
    const opex = overhead + penyusutan;
    
    const profitKotor = omset - cogs;
    const profitBersih = profitKotor - opex;

    return { volume, omset, cogs, opex, profitKotor, profitBersih };
  }, [menus, activeProfile, ingredients, assets]);

  return (
    <div style={{ padding: '24px 28px' }} className="animate-fade-in">
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        padding: '24px 28px',
        borderRadius: 16,
        color: '#fff',
        marginBottom: 24,
        boxShadow: '0 4px 20px rgba(49, 46, 129, 0.15)'
      }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff' }}>Ringkasan Operasional Outlet</h2>
        <p style={{ margin: '6px 0 0', opacity: 0.8, fontSize: 12, lineHeight: 1.6 }}>
          Berikut adalah rangkuman performa dan proyeksi keuangan berdasarkan data produk serta simulasi volume aktif bulan ini.
        </p>
      </div>

      {/* Grid Cards (4 Metrics) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        {/* Card 1: Volume Penjualan */}
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', padding: 18, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Simulasi Volume</span>
            <div style={{ padding: 6, background: '#e0f2fe', borderRadius: 8 }}><Icon name="pieChart" size={14} color="#0284c7" /></div>
          </div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 800 }}>{stats.volume.toLocaleString('id-ID')}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>Cup / Porsi terjual</div>
        </div>

        {/* Card 2: Proyeksi Omset */}
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', padding: 18, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Proyeksi Omset</span>
            <div style={{ padding: 6, background: '#fef3c7', borderRadius: 8 }}><Icon name="dollar" size={14} color="#d97706" /></div>
          </div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 800 }}>{fmtRp(stats.omset)}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>Dari simulasi aktif</div>
        </div>

        {/* Card 3: Total OPEX */}
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', padding: 18, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Beban OPEX</span>
            <div style={{ padding: 6, background: '#fee2e2', borderRadius: 8 }}><Icon name="zap" size={14} color="#ef4444" /></div>
          </div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 800 }}>{fmtRp(stats.opex)}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>Overhead + Depresiasi</div>
        </div>

        {/* Card 4: Keuntungan Bersih */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          border: '1px solid #bbf7d0',
          padding: 18,
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#166534' }}>Proyeksi Profit Bersih</span>
            <div style={{ padding: 6, background: '#bbf7d0', borderRadius: 8 }}><Icon name="checkCircle" size={14} color="#166534" /></div>
          </div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 800, color: '#166534' }}>{fmtRp(stats.profitBersih)}</div>
          <div style={{ fontSize: 11, color: '#166534', opacity: 0.8, marginTop: 4 }}>
            Margin: {stats.omset > 0 ? ((stats.profitBersih / stats.omset) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Daftar Produk &amp; Kelayakan Margin</h3>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--color-text-muted)' }}>Analisis HPP, profit per cup, dan status margin produk.</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('calculator')} style={{ fontSize: 11, fontWeight: 700 }}>
            Detail Resep &raquo;
          </button>
        </div>

        {menus.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)', fontSize: 13 }}>
            Belum ada menu produk terdaftar. Silakan tambah menu baru di tab Kalkulator HPP.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="pkg-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--color-text-muted)', fontSize: 11 }}>
                  <th style={{ padding: '12px 20px' }}>Menu</th>
                  <th style={{ padding: '12px 20px' }}>Kategori</th>
                  <th style={{ padding: '12px 20px' }}>Volume Simulasi</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>HPP per Cup</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Harga Jual</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Profit/Cup</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Margin Bersih</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Status Kelayakan</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {menus.map(m => {
                  const hpp = getDirectHPP(m, ingredients);
                  const hj = m.margin >= 100 ? 0 : hpp / (1 - m.margin/100);
                  const hjRound = roundPrice(hj);
                  const profitCup = hjRound - hpp;
                  const marginCup = hjRound > 0 ? (profitCup / hjRound) * 100 : 0;
                  
                  let statusBadge = <span style={{ background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>KURANG</span>;
                  if (marginCup >= 50) {
                    statusBadge = <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>LAYAK</span>;
                  } else if (marginCup >= 35) {
                    statusBadge = <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>HATI-HATI</span>;
                  }

                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                      <td style={{ padding: '12px 20px', fontWeight: 700 }}>
                        <span style={{ marginRight: 6 }}>{m.emoji || '☕'}</span>
                        {m.name}
                      </td>
                      <td style={{ padding: '12px 20px', color: 'var(--color-text-muted)', fontSize: 12 }}>{m.category}</td>
                      <td style={{ padding: '12px 20px' }}>{(num(m.ops?.estimasiCup) || 0).toLocaleString('id-ID')} cup</td>
                      <td style={{ padding: '12px 20px', textAlign: 'right' }} className="mono">{fmtRp(hpp)}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 700 }} className="mono">{fmtRp(hjRound)}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', color: '#166534' }} className="mono">{fmtRp(profitCup)}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 600 }}>{marginCup.toFixed(1)}%</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>{statusBadge}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('calculator', m.id)} style={{ padding: '4px 8px', fontSize: 11, fontWeight: 700 }}>
                          Edit Resep
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
    </div>
  );
}
