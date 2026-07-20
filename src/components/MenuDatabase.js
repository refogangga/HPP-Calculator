"use client";

import React, { useState } from 'react';
import { Icon } from './Icon';
import { num, fmtRp, roundPrice, getPenyusutanBulanan } from '../utils/hpp';
import * as XLSX from 'xlsx';

export default function MenuDatabase({ menus, activeId, onSelect, onAdd, onDelete, onDuplicate, onDeleteBatch }) {
  const categories = ['Semua', 'Minuman', 'Makanan', 'Snack', 'Lainnya'];
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const filtered = menus.filter(m => {
    const matchCat = filter === 'Semua' || m.category === filter;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const getHPP = (menu) => {
    const bb = menu.ingredients.reduce((s, i) => {
      if (!num(i.ukuranKemasan)) return s;
      return s + (num(i.hargaBeli) / num(i.ukuranKemasan)) * num(i.takaranPerCup);
    }, 0);
    const km = menu.packaging.filter(p => p.enabled).reduce((s, p) => s + (num(p.harga) * num(p.usage !== undefined ? p.usage : 1)), 0);
    const py = getPenyusutanBulanan(menu.ops);
    const expensesList = menu.ops.expenses || [
      { id: 'listrik', name: '⚡ Listrik & Air', value: num(menu.ops.listrik) },
      { id: 'gaji', name: '👤 Gaji Karyawan', value: num(menu.ops.gaji) },
      { id: 'lainLain', name: '🌐 Lain-lain (sewa, dll)', value: num(menu.ops.lainLain) }
    ];
    const totalExpenses = expensesList.reduce((sum, exp) => sum + num(exp.value), 0);
    const totalOps = totalExpenses + py;
    const opsPerCup = num(menu.ops.estimasiCup) > 0 ? totalOps / num(menu.ops.estimasiCup) : 0;
    const hpp = bb + km + opsPerCup;
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

      return {
        'Nama Menu': m.name,
        'Kategori': m.category,
        'Target Margin': m.margin + '%',
        'HPP Bahan Baku (per Cup)': bb,
        'HPP Kemasan (per Cup)': km,
        'HPP Operasional (per Cup)': opsPerCup,
        'Total HPP (per Cup)': hpp,
        'Rekomendasi Harga Jual': hargaJualBulat,
        'Profit per Cup': profit,
        'Estimasi Penjualan (Cup/bln)': num(m.ops.estimasiCup),
        'Estimasi Profit Bulanan': profit * num(m.ops.estimasiCup)
      };
    });

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan HPP");

    // Add detailed sheet for each menu
    selectedMenus.forEach(m => {
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

      details.push({ A: '3. BIAYA OPERASIONAL & OVERHEAD' });
      const py = getPenyusutanBulanan(m.ops);
      const expensesList = m.ops.expenses || [
        { id: 'listrik', name: '⚡ Listrik & Air', value: num(m.ops.listrik) },
        { id: 'gaji', name: '👤 Gaji Karyawan', value: num(m.ops.gaji) },
        { id: 'lainLain', name: '🌐 Lain-lain (sewa, dll)', value: num(m.ops.lainLain) }
      ];
      expensesList.forEach(exp => {
        details.push({ A: exp.name, F: num(exp.value) });
      });
      details.push({ A: 'Penyusutan Aset', F: py });
      const totalOps = expensesList.reduce((sum, exp) => sum + num(exp.value), 0) + py;
      const opsPerCup = num(m.ops.estimasiCup) > 0 ? totalOps / num(m.ops.estimasiCup) : 0;
      details.push({ A: 'Total Ops Bulanan', F: totalOps });
      details.push({ A: 'Estimasi Penjualan (Cup/bln)', F: num(m.ops.estimasiCup) });
      details.push({ A: 'Beban Ops per Cup', F: opsPerCup });
      details.push({});

      const totalHPP = bbTotal + kmTotal + opsPerCup;
      const hj = m.margin >= 100 ? 0 : totalHPP / (1 - m.margin / 100);
      const hjb = roundPrice(hj);
      const profit = hjb - totalHPP;
      details.push({ A: 'RINGKASAN AKHIR' });
      details.push({ A: 'TOTAL HPP per Cup', F: totalHPP });
      details.push({ A: 'Harga Jual Rekomendasi', F: hjb });
      details.push({ A: 'Profit per Cup', F: profit });
      details.push({ A: 'Estimasi Profit Bulanan', F: profit * num(m.ops.estimasiCup) });

      const wsDetail = XLSX.utils.json_to_sheet(details, { skipHeader: true });
      const sheetName = m.name.replace(/[\\\/?*:[\]]/g, '').substring(0, 30) || `Detail_${m.id}`;
      XLSX.utils.book_append_sheet(wb, wsDetail, sheetName);
    });

    XLSX.writeFile(wb, `Laporan_HPP_FNB_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
      const py = getPenyusutanBulanan(m.ops);
      const expensesList = m.ops.expenses || [
        { id: 'listrik', name: '⚡ Listrik & Air', value: num(m.ops.listrik) },
        { id: 'gaji', name: '👤 Gaji Karyawan', value: num(m.ops.gaji) },
        { id: 'lainLain', name: '🌐 Lain-lain (sewa, dll)', value: num(m.ops.lainLain) }
      ];
      const totalExpenses = expensesList.reduce((sum, exp) => sum + num(exp.value), 0) + py;
      const ops = totalExpenses + py;
      
      const expenseLines = expensesList.map(exp => {
        return `  ${(exp.name || 'Pengeluaran').padEnd(28)} : ${fmtRp(num(exp.value))}`;
      }).join('\n');
      
      const opsPerCup = num(m.ops.estimasiCup) > 0 ? ops / num(m.ops.estimasiCup) : 0;
      const hpp = bb + km + opsPerCup;
      const hj = m.margin >= 100 ? 0 : hpp / (1 - m.margin / 100);
      const hjb = roundPrice(hj);

      return `
<div style="page-break-after: ${idx < selectedMenus.length - 1 ? 'always' : 'avoid'}; font-family: monospace; font-size: 13px; line-height: 1.8; margin-bottom: 40px; padding: 20px;">
  <pre>
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
  </pre>
</div>
      `;
    }).join('\n');

    w.document.write(`
      <html>
        <head>
          <title>Batch Print HPP Menu</title>
          <style>
            @media print {
              body { padding: 0; margin: 0; background: #fff; }
              div { page-break-after: always; }
              div:last-child { page-break-after: avoid; }
            }
            body { padding: 32px; background: #f1f5f9; }
            div { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px; }
            pre { margin: 0; font-family: monospace; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          ${bodies}
        </body>
      </html>
    `);
    w.document.close();
    setTimeout(() => {
      w.print();
    }, 500);
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every(m => selectedIds.includes(m.id));

  return (
    <div style={{ padding: '20px 28px' }}>
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: 20, color: '#1e293b' }}>📋 Database Menu</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
            {menus.length} menu tersimpan — klik menu untuk edit atau hitung HPP
          </p>
        </div>
        <button className="btn btn-primary" onClick={onAdd}>
          <Icon name="plus" size={14} /> Tambah Menu Baru
        </button>
      </div>

      {/* Filter + Search */}
      <div className="flex-center gap-3" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#94a3b8' }}>🔍</span>
          <input className="hpp-input" placeholder="Cari nama menu…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }} />
        </div>
        <div className="tab-bar">
          {categories.map(c => (
            <button key={c} className={`tab-item ${filter === c ? 'active' : ''}`}
              onClick={() => setFilter(c)} style={{ flex: 'none', padding: '5px 10px', fontSize: 11 }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Batch Actions Banner */}
      {selectedIds.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          borderRadius: 12,
          padding: '12px 20px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#fff',
          boxShadow: '0 10px 25px -5px rgba(30, 41, 59, 0.3)',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 10px', borderRadius: 20 }}>
              {selectedIds.length} Terpilih
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedIds([])} style={{ color: '#94a3b8', fontSize: 11, padding: '4px 8px' }}>
              Batal
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm" onClick={handleExportExcel} style={{ background: '#10b981', color: '#fff', border: 'none', gap: 6, cursor: 'pointer', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
              🟢 Export Excel (.xlsx)
            </button>
            <button className="btn btn-sm" onClick={handleBatchPrint} style={{ background: '#6366f1', color: '#fff', border: 'none', gap: 6, cursor: 'pointer', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
              📄 Cetak PDF Terpilih
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleBatchDelete} style={{ background: '#ef4444', color: '#fff', border: 'none', gap: 6, cursor: 'pointer', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, width: 'auto', height: 'auto' }}>
              <Icon name="trash" size={11} /> Hapus Terpilih
            </button>
          </div>
        </div>
      )}

      {/* Select All Toggle */}
      {filtered.length > 0 && (
        <div style={{ marginBottom: 12, padding: '0 4px' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b', cursor: 'pointer', fontWeight: 600 }}>
            <input type="checkbox"
              checked={allFilteredSelected}
              onChange={e => handleSelectAllToggle(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#38bdf8' }}
            />
            Pilih Semua ({filtered.length} Menu)
          </label>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Belum ada menu</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Klik "Tambah Menu Baru" untuk mulai</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
          {filtered.map(menu => {
            const { hpp, hargaJual } = getHPP(menu);
            const profit = hargaJual - hpp;
            const isSelected = selectedIds.includes(menu.id);
            return (
              <div key={menu.id} 
                className={`db-card ${activeId === menu.id ? 'active' : ''}`}
                style={{
                  border: isSelected ? '2px solid #38bdf8' : activeId === menu.id ? '2px solid #6366f1' : '1px solid #e2e8f0',
                  boxShadow: isSelected ? '0 4px 12px rgba(56, 189, 248, 0.15)' : 'none',
                  background: isSelected ? '#f0f9ff' : '#fff',
                  position: 'relative',
                  paddingLeft: 12
                }}
                onClick={() => onSelect(menu.id)}>
                
                {/* Selection Checkbox */}
                <div className="flex-center" onClick={e => e.stopPropagation()} style={{ marginRight: 10 }}>
                  <input type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelect(menu.id)}
                    style={{ width: 17, height: 17, cursor: 'pointer', accentColor: '#38bdf8' }}
                  />
                </div>

                <div className="db-card-icon">{menu.emoji}</div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 2 }}>{menu.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
                    {menu.category} &bull; {new Date(menu.updatedAt).toLocaleDateString('id-ID')}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div>
                      <div className="label-xs" style={{ color: '#94a3b8' }}>HPP</div>
                      <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: '#6366f1' }}>{fmtRp(hpp)}</div>
                    </div>
                    <div>
                      <div className="label-xs" style={{ color: '#94a3b8' }}>Jual</div>
                      <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>{fmtRp(hargaJual)}</div>
                    </div>
                    <div>
                      <div className="label-xs" style={{ color: '#94a3b8' }}>Profit</div>
                      <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>{fmtRp(profit)}</div>
                    </div>
                  </div>
                </div>
                {/* Card actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-icon btn-sm" title="Duplikat"
                    onClick={() => onDuplicate(menu.id)}>
                    <Icon name="copy" size={12} />
                  </button>
                  <button className="btn btn-danger btn-sm" title="Hapus"
                    onClick={() => onDelete(menu.id)}
                    style={{ width: 30, height: 30, justifyContent: 'center' }}>
                    <Icon name="trash" size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
