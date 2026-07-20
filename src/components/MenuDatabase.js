"use client";

import React, { useState } from 'react';
import { Icon } from './Icon';
import { num, fmtRp, roundPrice, getPenyusutanBulanan } from '../utils/hpp';

export default function MenuDatabase({ menus, activeId, onSelect, onAdd, onDelete, onDuplicate }) {
  const categories = ['Semua', 'Minuman', 'Makanan', 'Snack', 'Lainnya'];
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');

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
    const totalOps = num(menu.ops.listrik) + num(menu.ops.gaji) + py + num(menu.ops.lainLain);
    const opsPerCup = num(menu.ops.estimasiCup) > 0 ? totalOps / num(menu.ops.estimasiCup) : 0;
    const hpp = bb + km + opsPerCup;
    const hargaJual = menu.margin >= 100 ? 0 : hpp / (1 - menu.margin / 100);
    return { hpp, hargaJual: roundPrice(hargaJual) };
  };

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

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Belum ada menu</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Klik "Tambah Menu Baru" untuk mulai</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
          {filtered.map(menu => {
            const { hpp, hargaJual } = getHPP(menu);
            const profit = hargaJual - hpp;
            return (
              <div key={menu.id} className={`db-card ${activeId === menu.id ? 'active' : ''}`}
                onClick={() => onSelect(menu.id)}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button className="btn btn-icon btn-sm" title="Duplikat"
                    onClick={e => { e.stopPropagation(); onDuplicate(menu.id); }}>
                    <Icon name="copy" size={12} />
                  </button>
                  <button className="btn btn-danger btn-sm" title="Hapus"
                    onClick={e => { e.stopPropagation(); onDelete(menu.id); }}
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
