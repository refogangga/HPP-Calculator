"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '../components/Icon';
import { ToastContainer, MenuMetaModal } from '../components/HppSubComponents';
import HppCalculator from '../components/HppCalculator';
import MenuDatabase from '../components/MenuDatabase';
import OpexAccumulator from '../components/OpexAccumulator';
import { num, fmtRp, roundPrice, uid, mkMenu, loadDB, saveDB, getPenyusutanBulanan, loadOpexProfiles, saveOpexProfiles, mkOpexProfile } from '../utils/hpp';
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


  /* ── Toast helpers ── */
  const showToast = useCallback((msg, type = 'success') => {
    const id = uid();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  const activeMenu = menus.find(m => m.id === activeId);
  const activeProfile = opexProfiles.find(p => p.id === activeProfileId) || opexProfiles[0] || null;

  // Load data from DB or migrate from LocalStorage
  useEffect(() => {
    setIsMounted(true);
    
    const initData = async () => {
      try {
        const menusRes = await fetch('/api/menus');
        const dbMenus = await menusRes.json();
        
        const opexRes = await fetch('/api/opex');
        const dbProfiles = await opexRes.json();
        
        const localMenus = loadDB();
        const localProfiles = loadOpexProfiles();
        
        let finalMenus = dbMenus;
        let finalProfiles = dbProfiles;
        
        const databaseIsEmpty = (!dbMenus || dbMenus.length === 0) && (!dbProfiles || dbProfiles.length === 0);
        const localStorageHasData = (localMenus && localMenus.length > 0) || (localProfiles && localProfiles.length > 0);
        
        if (databaseIsEmpty && localStorageHasData) {
          finalMenus = localMenus.length > 0 ? localMenus : [mkMenu({ name: 'Kopi Susu Signature', emoji: '☕', category: 'Minuman' })];
          finalProfiles = localProfiles;
          
          await fetch('/api/menus', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalMenus)
          });
          
          if (finalProfiles.length > 0) {
            await fetch('/api/opex', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(finalProfiles)
            });
          }
          
          showToast('Data berhasil dimigrasikan ke database MariaDB Laragon!', 'success');
        } else {
          if (!finalMenus || finalMenus.length === 0) {
            finalMenus = [mkMenu({ name: 'Kopi Susu Signature', emoji: '☕', category: 'Minuman' })];
            await fetch('/api/menus', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(finalMenus)
            });
          }
          if (!finalProfiles || finalProfiles.length === 0) {
            finalProfiles = [mkOpexProfile()];
            await fetch('/api/opex', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(finalProfiles)
            });
          }
        }
        
        setMenus(finalMenus);
        setActiveId(finalMenus[0]?.id || null);
        setOpexProfiles(finalProfiles);
        setActiveProfileId(finalProfiles[0]?.id || null);
      } catch (error) {
        console.error("Gagal memuat data dari database. Memakai fallback LocalStorage.", error);
        const localMenus = loadDB();
        const loadedMenus = localMenus.length > 0 ? localMenus : [mkMenu({ name: 'Kopi Susu Signature', emoji: '☕', category: 'Minuman' })];
        setMenus(loadedMenus);
        setActiveId(loadedMenus[0]?.id);
        
        const localProfiles = loadOpexProfiles();
        setOpexProfiles(localProfiles);
        setActiveProfileId(localProfiles[0]?.id || null);
        showToast('Menghubungkan ke database gagal. Memakai data cadangan browser.', 'alert');
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

  /* ── Menu CRUD ── */
  const updateActiveMenu = useCallback((changes) => {
    setMenus(prev => prev.map(m =>
      m.id === activeId
        ? { ...m, ...changes, updatedAt: new Date().toISOString() }
        : m
    ));
  }, [activeId]);

  const addMenu = () => {
    const newMenu = mkMenu();
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
        setActiveId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
    showToast('Menu dihapus', 'info');
  };

  const duplicateMenu = (id) => {
    const src = menus.find(m => m.id === id);
    if (!src) return;
    const dup = { ...JSON.parse(JSON.stringify(src)), id: uid(), name: src.name + ' (Copy)', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
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
        setActiveId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
    showToast(`${ids.length} menu dihapus`, 'info');
  }, [activeId, showToast]);

  const handleExportSingleExcel = () => {
    if (!activeMenu) return;
    const m = activeMenu;
    const targetUnit = m.targetUnit || 'cup';
    const pcsPerPortion = m.pcsPerPortion || 1;
    const subUnitLabel = m.subUnitLabel || 'pcs';

    const bb = m.ingredients.reduce((s, i) => num(i.ukuranKemasan) ? s + (num(i.hargaBeli) / num(i.ukuranKemasan)) * num(i.takaranPerCup) : s, 0);
    const km = m.packaging.filter(p => p.enabled).reduce((s, p) => s + (num(p.harga) * num(p.usage !== undefined ? p.usage : 1)), 0);
    const py = getPenyusutanBulanan(m.ops);
    const expensesList = m.ops.expenses || [
      { id: 'listrik', name: '⚡ Listrik & Air', value: num(m.ops.listrik) },
      { id: 'gaji', name: '👤 Gaji Karyawan', value: num(m.ops.gaji) },
      { id: 'lainLain', name: '🌐 Lain-lain (sewa, dll)', value: num(m.ops.lainLain) }
    ];
    const totalExpenses = expensesList.reduce((sum, exp) => sum + num(exp.value), 0);
    const totalOps = totalExpenses + py;
    const opsPerCup = num(m.ops.estimasiCup) > 0 ? totalOps / num(m.ops.estimasiCup) : 0;
    const hpp = bb + km + opsPerCup;
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
      'HPP Operasional (per Satuan Utama)': opsPerCup,
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

    details.push({ A: '3. BIAYA OPERASIONAL & OVERHEAD' });
    expensesList.forEach(exp => {
      details.push({ A: exp.name, F: num(exp.value) });
    });
    details.push({ A: 'Penyusutan Aset', F: py });
    details.push({ A: 'Total Ops Bulanan', F: totalOps });
    details.push({ A: 'Estimasi Penjualan (Cup/bln)', F: num(m.ops.estimasiCup) });
    details.push({ A: 'Beban Ops per Cup', F: opsPerCup });
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
    const py = getPenyusutanBulanan(m.ops);
    const expensesList = m.ops.expenses || [
      { id: 'listrik', name: '⚡ Listrik & Air', value: num(m.ops.listrik) },
      { id: 'gaji', name: '👤 Gaji Karyawan', value: num(m.ops.gaji) },
      { id: 'lainLain', name: '🌐 Lain-lain (sewa, dll)', value: num(m.ops.lainLain) }
    ];
    const totalExpenses = expensesList.reduce((sum, exp) => sum + num(exp.value), 0);
    const ops = totalExpenses + py;
    
    const expenseLines = expensesList.map(exp => {
      return `  ${(exp.name || 'Pengeluaran').padEnd(28)} : ${fmtRp(num(exp.value))}`;
    }).join('\n');
    
    const opsPerCup = num(m.ops.estimasiCup) > 0 ? ops / num(m.ops.estimasiCup) : 0;
    const hpp = bb + km + opsPerCup;
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

  ──── OPERASIONAL (Bulanan) ──────────────────
${expenseLines}
  Penyusutan Aset              : ${fmtRp(py)}
  ────────────────────────────────────────────
  Total Ops Bulanan            : ${fmtRp(ops)}
  Estimasi Penjualan           : ${num(m.ops.estimasiCup).toLocaleString('id-ID')} ${targetUnit}/bln
  Beban Ops per ${targetUnit.padEnd(15)}: ${fmtRp(opsPerCup)}

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
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#0066cc,#2997ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>☕</div>
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
          <div className="topbar-logo">☕</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>Kalkulator HPP F&B</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Harga Pokok Penjualan — Real-Time</div>
          </div>
        </div>
        <div className="flex-center gap-2 header-btns">

          {view === 'calculator' && activeMenu && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={handlePrint}>
                <Icon name="print" size={12} /> Cetak
              </button>
              <button className="btn btn-ghost btn-sm" onClick={handleSaveAll}>
                <Icon name="save" size={12} /> Simpan
              </button>
            </>
          )}
          {view === 'opex' && opexProfiles.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={handleSaveAll}>
              <Icon name="save" size={12} /> Simpan Semua
            </button>
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
            className={`btn btn-sm ${view === 'database' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('database')}>
            <Icon name="database" size={12} /> Database ({menus.length})
          </button>
        </div>
      </div>

      {/* ── Menu Name Bar (only in calculator view) ── */}
      {view === 'calculator' && activeMenu && (
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', padding: '10px 28px' }}>
          <div className="flex-center gap-3" style={{ flexWrap: 'wrap' }}>
            <span style={{ fontSize: 20 }}>{activeMenu.emoji}</span>
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
                      {m.emoji} {m.name}
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
            <span style={{ fontSize: 20 }}>🏪</span>
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
          <HppCalculator menu={activeMenu} onUpdate={updateActiveMenu} showToast={showToast} />
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>☕</div>
            <button className="btn btn-primary" onClick={addMenu}>
              <Icon name="plus" size={14} /> Buat Menu Pertama
            </button>
          </div>
        )
      )}

      {view === 'database' && (
        <MenuDatabase
          menus={menus} activeId={activeId}
          onSelect={selectMenu} onAdd={addMenu}
          onDelete={deleteMenu} onDuplicate={duplicateMenu}
          onDeleteBatch={deleteMenusBatch}
          opexProfiles={opexProfiles}
          activeProfileId={activeProfileId}
          onSelectProfile={(id) => {
            setActiveProfileId(id);
            setView('opex');
          }}
          onAddProfile={(newProfile) => {
            setOpexProfiles(prev => [...prev, newProfile]);
            setActiveProfileId(newProfile.id);
            setView('opex');
            showToast(`Profil "${newProfile.name}" dibuat!`, 'success');
          }}
          onDeleteProfile={(id) => {
            setOpexProfiles(prev => {
              const next = prev.filter(p => p.id !== id);
              if (id === activeProfileId) {
                setActiveProfileId(next[0]?.id || null);
              }
              return next;
            });
            showToast('Profil OPEX dihapus', 'info');
          }}
        />
      )}

      {view === 'opex' && opexProfiles.length > 0 && (
        <OpexAccumulator
          menus={menus}
          onUpdateMenu={(id, changes) => {
            setMenus(prev => prev.map(m => m.id === id ? { ...m, ...changes, updatedAt: new Date().toISOString() } : m));
          }}
          opexProfiles={opexProfiles}
          activeProfileId={activeProfileId}
          onSelectProfile={setActiveProfileId}
          onUpdateProfile={(changes) => {
            setOpexProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, ...changes } : p));
          }}
          onAddProfile={(newProfile) => {
            setOpexProfiles(prev => [...prev, newProfile]);
            setActiveProfileId(newProfile.id);
            showToast(`Profil "${newProfile.name}" dibuat!`, 'success');
          }}
          onDeleteProfile={(id) => {
            setOpexProfiles(prev => {
              const next = prev.filter(p => p.id !== id);
              if (id === activeProfileId) {
                setActiveProfileId(next[0]?.id || null);
              }
              return next;
            });
            showToast('Profil OPEX dihapus', 'info');
          }}
          onNavigateToCalculator={(menuId) => {
            setActiveId(menuId);
            setView('calculator');
          }}
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
