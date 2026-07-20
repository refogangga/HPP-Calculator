"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import FormatInput from './FormatInput';
import { num, fmtRp, uid } from '../utils/hpp';

/* ─── Toast System ───────────────────────────────────────── */
export function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type || 'info'}`}>
          <Icon name={t.type === 'success' ? 'check' : t.type === 'error' ? 'x' : 'info'} size={14} />
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ─── Pack Calculator Modal ──────────────────────────────── */
export function PackCalcModal({ onClose, onApply, initialPackPrice, initialPackQty, itemName, unitLabel }) {
  const [packPrice, setPackPrice] = useState(initialPackPrice || '');
  const [packQty, setPackQty] = useState(initialPackQty || '');

  const pricePerUnit = num(packQty) > 0 ? num(packPrice) / num(packQty) : 0;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#1e293b' }}>🧮 Kalkulator Harga per Satuan</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{itemName || 'Item'}</div>
          </div>
          <button className="btn btn-icon" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px', marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
            Masukkan <strong>harga beli 1 pack/bundle</strong> dan <strong>jumlah isi per pack</strong>.
            Sistem akan menghitung harga satuan secara otomatis.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <label className="label-sm" style={{ display: 'block', marginBottom: 5 }}>💰 Harga Beli 1 Pack</label>
            <div className="input-prefix-wrap">
              <span className="prefix">Rp</span>
              <FormatInput className="hpp-input" placeholder="35000"
                value={packPrice} onChange={setPackPrice} autoFocus />
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>Harga saat kamu beli 1 pack</div>
          </div>
          <div>
            <label className="label-sm" style={{ display: 'block', marginBottom: 5 }}>
              📦 Isi per Pack ({unitLabel || 'pcs'})
            </label>
            <div className="input-prefix-wrap has-suffix">
              <input className="hpp-input" type="number" placeholder="50"
                value={packQty} onChange={e => setPackQty(e.target.value)} />
              <span className="suffix">{unitLabel || 'pcs'}</span>
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>Berapa banyak item dalam 1 pack</div>
          </div>
        </div>

        {/* Result */}
        <div className="pack-result-box">
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6366f1', marginBottom: 6 }}>
            💡 Harga per Satuan ({unitLabel || 'pcs'})
          </div>
          <div className="pack-result-value mono">{fmtRp(pricePerUnit)}</div>
          {num(packQty) > 0 && num(packPrice) > 0 && (
            <div style={{ fontSize: 11, color: '#6366f1', marginTop: 4, opacity: 0.8 }}>
              {fmtRp(packPrice)} ÷ {num(packQty).toLocaleString('id-ID')} {unitLabel || 'pcs'}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-icon" style={{ width: 'auto', padding: '8px 14px', fontSize: 12 }} onClick={onClose}>
            Batal
          </button>
          <button className="btn btn-success btn-sm"
            style={{ fontSize: 13, padding: '9px 20px' }}
            disabled={pricePerUnit <= 0}
            onClick={() => {
              if (pricePerUnit > 0) {
                onApply(pricePerUnit, num(packPrice), num(packQty));
                onClose();
              }
            }}>
            <Icon name="check" size={13} /> Gunakan Harga Ini
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Section Header ─────────────────────────────────────── */
export function SectionHeader({ iconEmoji, iconBg, title, badgeText, badgeClass, actions }) {
  return (
    <div className="section-header">
      <div className="section-icon" style={{ background: iconBg }}>{iconEmoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', lineHeight: '1.3' }}>{title}</div>
        {badgeText && <span className={`badge ${badgeClass || 'badge-slate'}`}>{badgeText}</span>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 6 }}>{actions}</div>}
    </div>
  );
}

/* ─── Ingredient Row ─────────────────────────────────────── */
export function IngredientRow({ ing, idx, total, onUpdate, onRemove, targetUnit = 'cup' }) {
  const [showPackModal, setShowPackModal] = useState(false);

  const perUnit = num(ing.ukuranKemasan) ? num(ing.hargaBeli) / num(ing.ukuranKemasan) : 0;
  const hpp = perUnit * num(ing.takaranPerCup);
  const upd = (f, v) => onUpdate(ing.id, f, v);

  return (
    <>
      <div className="animate-fade-in" style={{
        borderBottom: idx < total - 1 ? '1px dashed #f1f5f9' : 'none',
        paddingBottom: 10, marginBottom: 10
      }}>
        <div className="ing-grid">
          {/* Name */}
          <input className="hpp-input sm" placeholder="Nama bahan…"
            value={ing.name} onChange={e => upd('name', e.target.value)} />

          {/* Harga beli */}
          <div className="input-prefix-wrap">
            <span className="prefix">Rp</span>
            <FormatInput className="hpp-input sm" placeholder="0"
              value={ing.hargaBeli || ''} onChange={v => upd('hargaBeli', v)} />
          </div>

          {/* Ukuran kemasan */}
          <div className="input-prefix-wrap has-suffix">
            <input className="hpp-input sm" type="number" placeholder="1000"
              value={ing.ukuranKemasan || ''} onChange={e => upd('ukuranKemasan', e.target.value)} />
            <span className="suffix">{ing.unit}</span>
          </div>

          {/* Satuan */}
          <select className="hpp-input sm" value={ing.unit} onChange={e => upd('unit', e.target.value)}>
            {['ml', 'gr', 'ltr', 'kg', 'pcs', 'sdm', 'sdt', 'sachet', 'lembar'].map(u => <option key={u}>{u}</option>)}
          </select>

          {/* Takaran/cup */}
          <div className="input-prefix-wrap has-suffix">
            <input className="hpp-input sm" type="number" placeholder="0"
              value={ing.takaranPerCup || ''} onChange={e => upd('takaranPerCup', e.target.value)} />
            <span className="suffix">{ing.unit}</span>
          </div>

          {/* HPP per cup result */}
          <div style={{
            background: hpp > 0 ? '#eef2ff' : '#f8fafc',
            borderRadius: 7, padding: '5px 9px',
            textAlign: 'right', border: `1px solid ${hpp > 0 ? '#c7d2fe' : '#e2e8f0'}`
          }}>
            <div className="mono" style={{ fontWeight: 700, fontSize: 12, color: hpp > 0 ? '#6366f1' : '#94a3b8' }}>
              {hpp > 0 ? fmtRp(hpp) : '—'}
            </div>
          </div>

          {/* Delete */}
          <button className="btn btn-danger" onClick={() => onRemove(ing.id)} title="Hapus">
            <Icon name="trash" size={11} />
          </button>
        </div>

        {/* Pack calculator toggle + info row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, paddingLeft: 2 }}>
          {/* Pack calc button */}
          <button
            onClick={() => setShowPackModal(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 9px', borderRadius: 20,
              border: '1px solid #e0e7ff', background: '#eef2ff',
              color: '#6366f1', fontSize: 10, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: 'Inter, sans-serif'
            }}
            title="Hitung harga dari 1 pack/bundle"
          >
            <Icon name="package" size={10} /> Hitung dari Pack
          </button>

          {/* Pack info if used */}
          {ing.packQty > 0 && ing.packPrice > 0 && (
            <span style={{ fontSize: 10, color: '#94a3b8' }}>
              📦 {fmtRp(ing.packPrice)} / {ing.packQty} {ing.unit}
            </span>
          )}

          {/* HPP hint */}
          {hpp > 0 && (
            <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 'auto' }}>
              <span style={{ color: '#6366f1', fontWeight: 600 }}>{fmtRp(perUnit)}</span>/{ing.unit} × {num(ing.takaranPerCup)}{ing.unit}
            </span>
          )}
        </div>
      </div>

      {showPackModal && (
        <PackCalcModal
          itemName={ing.name}
          unitLabel={ing.unit}
          initialPackPrice={ing.packPrice}
          initialPackQty={ing.packQty}
          onClose={() => setShowPackModal(false)}
          onApply={(pricePerUnit, packPrice, packQty) => {
            onUpdate(ing.id, {
              hargaBeli: Math.round(pricePerUnit * num(ing.ukuranKemasan)),
              packPrice: packPrice,
              packQty: packQty
            });
          }}
        />
      )}
    </>
  );
}

/* ─── Packaging Card ─────────────────────────────────────── */
export function PackagingCard({ pkg, onUpdate, onRemove, targetUnit = 'cup' }) {
  const [showPackModal, setShowPackModal] = useState(false);
  const upd = (f, v) => onUpdate(pkg.id, f, v);

  return (
    <>
      <div className={`pkg-card ${pkg.enabled ? 'enabled' : 'disabled'} animate-fade-in`}>
        {/* Header: toggle + name + delete */}
        <div className="flex-between" style={{ marginBottom: 8 }}>
          <label className="pkg-toggle" htmlFor={`pkg_${pkg.id}`} style={{ flex: 1, overflow: 'hidden' }}>
            <input type="checkbox" id={`pkg_${pkg.id}`} checked={pkg.enabled}
              onChange={e => upd('enabled', e.target.checked)} />
            <div className="toggle-pill" />
            <span style={{ fontSize: 14 }}>{pkg.icon}</span>
            <input className="hpp-input" value={pkg.name} onChange={e => upd('name', e.target.value)}
              style={{
                border: 'none', background: 'transparent', padding: '2px 4px',
                fontWeight: 600, fontSize: 12, color: '#334155', outline: 'none'
              }}
              placeholder="Nama kemasan…" />
          </label>
          <button className="btn btn-danger" onClick={() => onRemove(pkg.id)}><Icon name="trash" size={11} /></button>
        </div>

        {/* Harga per Unit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: 2 }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Harga/</span>
            <select value={pkg.unit || 'pcs'} onChange={e => {
              upd('unit', e.target.value);
              if (e.target.value === 'pcs' && !pkg.usage) upd('usage', 1);
            }}
              disabled={!pkg.enabled}
              style={{ fontSize: 11, border: 'none', background: 'transparent', color: '#6366f1', fontWeight: 700, padding: 0, cursor: 'pointer', outline: 'none' }}>
              <option value="pcs">pcs</option>
              <option value="gr">gr</option>
              <option value="ml">ml</option>
              <option value="cm">cm</option>
            </select>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>:</span>
          </div>
          <div className="input-prefix-wrap" style={{ flex: 1 }}>
            <span className="prefix">Rp</span>
            <FormatInput className="hpp-input sm" placeholder="0"
              value={pkg.harga || ''} onChange={v => upd('harga', v)}
              disabled={!pkg.enabled} />
          </div>
        </div>

        {/* Pemakaian per cup */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0, marginRight: 4 }}>Pakai/{targetUnit}:</span>
          <input className="hpp-input sm" type="number" placeholder="1" step="any"
            value={pkg.usage !== undefined ? pkg.usage : 1} onChange={e => upd('usage', e.target.value)}
            disabled={!pkg.enabled} style={{ width: 60 }} />
          <span style={{ fontSize: 11, color: '#94a3b8', width: 25 }}>{pkg.unit || 'pcs'}</span>
          
          {pkg.enabled && (
            <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', marginLeft: 'auto' }}>
              {fmtRp(num(pkg.harga) * num(pkg.usage !== undefined ? pkg.usage : 1))}
            </span>
          )}
        </div>

        {/* Pack calc row */}
        {pkg.enabled && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #e0e7ff', display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setShowPackModal(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: 20,
                border: '1px solid #e0e7ff', background: '#eef2ff',
                color: '#6366f1', fontSize: 10, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s'
              }}>
              <Icon name="package" size={10} /> Hitung dari Pack
            </button>
            {pkg.packQty > 0 && pkg.packPrice > 0 && (
              <span style={{ fontSize: 10, color: '#94a3b8' }}>
                {fmtRp(pkg.packPrice)} / {pkg.packQty} {pkg.unit || 'pcs'}
              </span>
            )}
          </div>
        )}
      </div>

      {showPackModal && (
        <PackCalcModal
          itemName={pkg.name}
          unitLabel={pkg.unit || 'pcs'}
          initialPackPrice={pkg.packPrice}
          initialPackQty={pkg.packQty}
          onClose={() => setShowPackModal(false)}
          onApply={(pricePerUnit, packPrice, packQty) => {
            onUpdate(pkg.id, {
              harga: pricePerUnit,
              packPrice: packPrice,
              packQty: packQty
            });
          }}
        />
      )}
    </>
  );
}

/* ─── Edit Menu Meta Modal ───────────────────────────────── */
export function MenuMetaModal({ menu, onSave, onClose }) {
  const [name, setName] = useState(menu.name);
  const [emoji, setEmoji] = useState(menu.emoji);
  const [cat, setCat] = useState(menu.category);
  const [targetUnit, setTargetUnit] = useState(menu.targetUnit || 'cup');
  const [pcsPerPortion, setPcsPerPortion] = useState(menu.pcsPerPortion || 1);
  const [subUnitLabel, setSubUnitLabel] = useState(menu.subUnitLabel || 'pcs');

  const emojis = ['☕', '🍵', '🥤', '🧋', '🍺', '🍹', '🍔', '🍕', '🍜', '🍱', '🍰', '🧁', '🥗', '🌮', '🍣', '🥞'];
  const cats = ['Minuman', 'Makanan', 'Snack', 'Lainnya'];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: '#1e293b' }}>✏️ Info Menu</div>
          <button className="btn btn-icon" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Pilih Emoji</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {emojis.map(e => (
              <button key={e} onClick={() => setEmoji(e)}
                style={{
                  width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: emoji === e ? '#eef2ff' : '#f8fafc',
                  fontSize: 18, transition: 'all 0.15s',
                  boxShadow: emoji === e ? '0 0 0 2px #6366f1' : 'none'
                }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="label-sm" style={{ display: 'block', marginBottom: 4 }}>Nama Menu</label>
          <input className="hpp-input" value={name} onChange={e => setName(e.target.value)}
            placeholder="Contoh: Kopi Susu Signature" autoFocus />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Kategori</label>
          <div className="tab-bar">
            {cats.map(c => (
              <button key={c} className={`tab-item ${cat === c ? 'active' : ''}`}
                onClick={() => setCat(c)} style={{ fontSize: 12 }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Satuan & Portioning Section */}
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 14, marginTop: 14, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="label-sm" style={{ display: 'block', marginBottom: 4 }}>Satuan Utama</label>
              <select className="hpp-input" value={targetUnit} onChange={e => setTargetUnit(e.target.value)} style={{ padding: '6px 10px', fontSize: 13 }}>
                {['cup', 'porsi', 'pcs', 'loyang', 'bag', 'box', 'slice', 'kotak', 'gram'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>Contoh: cup (minuman) atau loyang (cake)</div>
            </div>
            <div>
              <label className="label-sm" style={{ display: 'block', marginBottom: 4 }}>Bagi Porsi (Portioning)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Bagi ke</span>
                <input className="hpp-input" type="number" min="1" value={pcsPerPortion} 
                  onChange={e => setPcsPerPortion(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: 65, textAlign: 'center', padding: '6px' }} />
                <input className="hpp-input" value={subUnitLabel} 
                  onChange={e => setSubUnitLabel(e.target.value)} 
                  placeholder="pcs" style={{ flex: 1, padding: '6px' }} />
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>Bagi satuan utama ke pcs/slice kecil</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-icon" style={{ width: 'auto', padding: '8px 14px', fontSize: 12 }} onClick={onClose}>Batal</button>
          <button className="btn btn-primary btn-sm" style={{ fontSize: 13, padding: '9px 20px' }}
            onClick={() => { onSave({ name, emoji, category: cat, targetUnit, pcsPerPortion, subUnitLabel }); onClose(); }}>
            <Icon name="check" size={13} /> Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
