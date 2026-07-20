"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '../components/Icon';
import { ToastContainer, MenuMetaModal } from '../components/HppSubComponents';
import HppCalculator from '../components/HppCalculator';
import MenuDatabase from '../components/MenuDatabase';
import { num, fmtRp, roundPrice, uid, mkMenu, loadDB, saveDB, getPenyusutanBulanan } from '../utils/hpp';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [menus, setMenus] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [view, setView] = useState('calculator'); // 'calculator' | 'database'
  const [toasts, setToasts] = useState([]);
  const [showMeta, setShowMeta] = useState(false);

  const activeMenu = menus.find(m => m.id === activeId);

  // Hydrate from localStorage once mounted
  useEffect(() => {
    setIsMounted(true);
    const db = loadDB();
    const loadedMenus = db.length > 0 ? db : [mkMenu({ name: 'Kopi Susu Signature', emoji: '☕', category: 'Minuman' })];
    setMenus(loadedMenus);
    setActiveId(loadedMenus[0]?.id);
  }, []);

  // Save to DB whenever menus change
  useEffect(() => {
    if (isMounted && menus.length > 0) {
      saveDB(menus);
    }
  }, [menus, isMounted]);

  /* ── Toast helpers ── */
  const showToast = useCallback((msg, type = 'success') => {
    const id = uid();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
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
      if (id === activeId && next.length > 0) setActiveId(next[0].id);
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

    // Recalculate for print
    const bb = m.ingredients.reduce((s, i) => num(i.ukuranKemasan) ? s + (num(i.hargaBeli) / num(i.ukuranKemasan)) * num(i.takaranPerCup) : s, 0);
    const km = m.packaging.filter(p => p.enabled).reduce((s, p) => s + (num(p.harga) * num(p.usage !== undefined ? p.usage : 1)), 0);
    const py = getPenyusutanBulanan(m.ops);
    const ops = num(m.ops.listrik) + num(m.ops.gaji) + py + num(m.ops.lainLain);
    const opsPerCup = num(m.ops.estimasiCup) > 0 ? ops / num(m.ops.estimasiCup) : 0;
    const hpp = bb + km + opsPerCup;
    const hj = m.margin >= 100 ? 0 : hpp / (1 - m.margin / 100);
    const hjb = roundPrice(hj);

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
  Listrik & Air                : ${fmtRp(m.ops.listrik)}
  Gaji Karyawan                : ${fmtRp(m.ops.gaji)}
  Penyusutan Aset              : ${fmtRp(py)}
  Lain-lain                    : ${fmtRp(m.ops.lainLain)}
  ────────────────────────────────────────────
  Total Ops Bulanan            : ${fmtRp(ops)}
  Estimasi Penjualan           : ${num(m.ops.estimasiCup).toLocaleString('id-ID')} cup/bln
  Beban Ops per Cup            : ${fmtRp(opsPerCup)}

  ════════════════════════════════════════════
  TOTAL HPP / CUP              : ${fmtRp(hpp)}
  Target Margin                : ${m.margin}%
  HARGA JUAL (dibulatkan)      : ${fmtRp(hjb)}
  Profit per Cup               : ${fmtRp(hjb - hpp)}
  Estimasi Profit Bulanan      : ${fmtRp((hjb - hpp) * num(m.ops.estimasiCup))}
  ════════════════════════════════════════════

  ${m.notes ? '📝 CATATAN:\n  ' + m.notes : ''}
    `;
    w.document.write(`<pre style="font-family:monospace;font-size:13px;padding:32px;line-height:1.9">${body}</pre>`);
    w.document.title = `HPP — ${m.name}`;
    w.document.close();
    w.print();
  };

  // Hydration fallback
  if (!isMounted || menus.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16, background: '#f1f5f9' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>☕</div>
        <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 15, fontWeight: 600, color: '#475569' }}>Memuat Kalkulator HPP…</div>
        <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, color: '#94a3b8' }}>Harap tunggu sebentar</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', paddingBottom: 48 }}>

      {/* ── Top Bar ── */}
      <div className="topbar">
        <div className="flex-center gap-3">
          <div className="topbar-logo">☕</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '-0.01em' }}>Kalkulator HPP F&B</div>
            <div style={{ fontSize: 11, color: '#475569' }}>Harga Pokok Penjualan — Real-Time</div>
          </div>
        </div>
        <div className="flex-center gap-2 header-btns">
          {view === 'calculator' && activeMenu && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowMeta(true)}>
                <Icon name="edit" size={12} /> Edit Info Menu
              </button>
              <button className="btn btn-ghost btn-sm" onClick={handlePrint}>
                <Icon name="print" size={12} /> Cetak
              </button>
              <button className="btn btn-ghost btn-sm"
                onClick={() => { saveDB(menus); showToast('Tersimpan ke database!', 'success'); }}>
                <Icon name="save" size={12} /> Simpan
              </button>
            </>
          )}
          <button
            className={`btn btn-sm ${view === 'database' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView(view === 'database' ? 'calculator' : 'database')}>
            <Icon name="database" size={12} />
            {view === 'database' ? 'Tutup Database' : `Database (${menus.length})`}
          </button>
        </div>
      </div>

      {/* ── Menu Name Bar (only in calculator view) ── */}
      {view === 'calculator' && activeMenu && (
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '10px 28px' }}>
          <div className="flex-center gap-3" style={{ flexWrap: 'wrap' }}>
            <span style={{ fontSize: 20 }}>{activeMenu.emoji}</span>
            <input className="hpp-input" value={activeMenu.name}
              onChange={e => updateActiveMenu({ name: e.target.value })}
              style={{ maxWidth: 340, fontWeight: 700, fontSize: 14 }}
              placeholder="Nama menu…" />
            <span className={`badge badge-slate`}>{activeMenu.category}</span>
            {menus.length > 1 && (
              <div className="flex-center gap-1" style={{ marginLeft: 'auto' }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Menu lain:</span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {menus.filter(m => m.id !== activeId).slice(0, 4).map(m => (
                    <button key={m.id} onClick={() => selectMenu(m.id)}
                      title={m.name}
                      style={{
                        padding: '3px 8px', border: '1px solid #e2e8f0', borderRadius: 6,
                        background: '#f8fafc', fontSize: 11, cursor: 'pointer',
                        fontFamily: 'Inter,sans-serif', color: '#475569',
                        display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s'
                      }}>
                      {m.emoji} <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                    </button>
                  ))}
                  {menus.length > 5 && (
                    <button onClick={() => setView('database')}
                      style={{ padding: '3px 8px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#eef2ff', color: '#6366f1', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                      +{menus.length - 5} lainnya…
                    </button>
                  )}
                </div>
              </div>
            )}
            <button className="btn btn-add btn-sm" style={{ marginLeft: menus.length <= 1 ? 'auto' : 0 }} onClick={addMenu}>
              <Icon name="plus" size={12} /> Menu Baru
            </button>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      {view === 'calculator' ? (
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
      ) : (
        <MenuDatabase
          menus={menus} activeId={activeId}
          onSelect={selectMenu} onAdd={addMenu}
          onDelete={deleteMenu} onDuplicate={duplicateMenu}
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
        textAlign: 'center', padding: '12px 28px', fontSize: 11, color: '#94a3b8',
        borderTop: '1px solid #e2e8f0', background: '#fff', marginTop: 12
      }}>
        HPP F&B Calculator &bull; {menus.length} menu tersimpan &bull; Data disimpan otomatis di browser
      </div>

      {/* Toast */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
