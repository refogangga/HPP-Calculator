"use client";

import React, { useState, useMemo } from 'react';
import { Icon } from './Icon';
import FormatInput from './FormatInput';
import { num, fmtRp } from '../utils/hpp';

/* ─── Toast System ───────────────────────────────────────── */
export function ToastContainer({ toasts }) {
  return (
    <div className="toast-container" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast ${t.type || 'info'}`}
          style={{
            background: t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : '#1e293b',
            color: '#fff',
            padding: '12px 18px',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            fontSize: 12.5,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'fadeSlideIn 0.2s ease-out'
          }}
        >
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: 24,
          width: '100%',
          maxWidth: 450,
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          animation: 'fadeSlideIn 0.25s ease-out'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: 16, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="calculator" size={16} color="#6366f1" /> Kalkulator Satuan Pack
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: 11, color: '#64748b', fontWeight: 500 }}>{itemName || 'Item Resep'}</p>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, color: '#94a3b8', transition: 'color 0.15s' }}
            onMouseOver={e => e.currentTarget.style.color = '#475569'}
            onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 20 }}>
          <p style={{ fontSize: 11, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            Masukkan harga beli pack besar dan kapasitas isi per pack. Sistem akan memecah harga beli satuan untuk takaran cup secara tepat.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
              Harga Beli 1 Pack
            </label>
            <div className="input-prefix-wrap" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <span className="prefix" style={{ position: 'absolute', left: 10, fontSize: 11.5, color: '#94a3b8', fontWeight: 600 }}>Rp</span>
              <FormatInput
                className="hpp-input sm"
                placeholder="0"
                value={packPrice}
                onChange={setPackPrice}
                style={{ paddingLeft: 30, height: 36, fontSize: 12, border: '1px solid #cbd5e1', borderRadius: 8, width: '100%' }}
                autoFocus
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
              Isi per Pack ({unitLabel})
            </label>
            <div className="input-prefix-wrap has-suffix" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <input
                className="hpp-input sm"
                type="number"
                placeholder="0"
                value={packQty}
                onChange={e => setPackQty(e.target.value)}
                style={{ height: 36, fontSize: 12, border: '1px solid #cbd5e1', borderRadius: 8, width: '100%', paddingRight: 40 }}
              />
              <span className="suffix" style={{ position: 'absolute', right: 10, fontSize: 11, color: '#94a3b8', fontWeight: 650 }}>{unitLabel}</span>
            </div>
          </div>
        </div>

        {/* Proyeksi Hasil */}
        <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 8, padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', marginBottom: 4 }}>
            Proyeksi Harga per {unitLabel}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#6d28d9' }} className="mono">{fmtRp(pricePerUnit)}</div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#fff',
              fontSize: 12,
              fontWeight: 650,
              cursor: 'pointer',
              color: '#475569'
            }}
          >
            Batal
          </button>
          <button
            disabled={pricePerUnit <= 0}
            onClick={() => {
              if (pricePerUnit > 0) {
                onApply(pricePerUnit, num(packPrice), num(packQty));
                onClose();
              }
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: pricePerUnit <= 0 ? '#cbd5e1' : '#4f46e5',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              cursor: pricePerUnit <= 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Icon name="check" size={13} /> Terapkan Harga
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Section Header ─────────────────────────────────────── */
export function SectionHeader({ iconEmoji, iconBg, title, badgeText, badgeClass, actions }) {
  return (
    <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
      <div className="section-icon" style={{ background: iconBg, width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
        {typeof iconEmoji === 'string' ? <Icon name={iconEmoji} size={13} /> : iconEmoji}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', letterSpacing: '-0.01em' }}>{title}</div>
      </div>
      {badgeText && (
        <span className={`badge ${badgeClass}`} style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
          {badgeText}
        </span>
      )}
      {actions && <div style={{ display: 'flex', gap: 6 }}>{actions}</div>}
    </div>
  );
}

/* ─── Ingredient Row ─────────────────────────────────────── */
export function IngredientRow({ ing, idx, total, onUpdate, onRemove, targetUnit = 'cup', ingredientsDb = [], onNavigate }) {
  const [showPackModal, setShowPackModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const isLinked = !!ing.ingredientId;
  const centralIng = isLinked ? (ingredientsDb || []).find(ci => ci.id === ing.ingredientId) : null;

  const hargaBeli = centralIng ? centralIng.hargaBeli : ing.hargaBeli;
  const ukuranKemasan = centralIng ? centralIng.ukuranKemasan : ing.ukuranKemasan;
  const unit = centralIng ? centralIng.unit : ing.unit;

  const perUnit = num(ukuranKemasan) ? num(hargaBeli) / num(ukuranKemasan) : 0;
  const hpp = perUnit * num(ing.takaranPerCup);
  const upd = (f, v) => onUpdate(ing.id, f, v);

  const handleNameChange = (val) => {
    const found = (ingredientsDb || []).find(ci => ci.name.toLowerCase() === val.toLowerCase() && !ci.isPackaging);
    if (found) {
      onUpdate(ing.id, {
        name: found.name,
        ingredientId: found.id,
        hargaBeli: found.hargaBeli,
        ukuranKemasan: found.ukuranKemasan,
        unit: found.unit
      });
    } else {
      onUpdate(ing.id, {
        name: val,
        ingredientId: null
      });
    }
  };

  const suggestions = useMemo(() => {
    const list = (ingredientsDb || []).filter(ci => !ci.isPackaging);
    if (!ing.name) return list.slice(0, 8);
    return list
      .filter(ci => ci.name.toLowerCase().includes(ing.name.toLowerCase()))
      .slice(0, 10);
  }, [ing.name, ingredientsDb]);

  return (
    <>
      <div className="animate-fade-in" style={{
        borderBottom: idx < total - 1 ? '1px solid #f1f5f9' : 'none',
        paddingBottom: 12, marginBottom: 12,
        position: 'relative',
        zIndex: isOpen ? 50 : 1
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1.2fr 1.5fr 1.5fr 36px', gap: 10, alignItems: 'center' }}>
          
          {/* 1. Nama Bahan (Suggestion autocomplete) */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%' }}>
              <input
                className="hpp-input sm"
                placeholder="Nama bahan…"
                value={ing.name}
                onChange={e => {
                  handleNameChange(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                style={{ fontSize: 11.5, height: 32, border: '1px solid #cbd5e1', borderRadius: 6, width: '100%', paddingLeft: isLinked ? 22 : 8 }}
              />
              {isLinked && (
                <span title="Terhubung ke Database Master" style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                  <Icon name="lock" size={10} color="#6366f1" />
                </span>
              )}

              {/* Custom Dropdown Suggestions */}
              {isOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  zIndex: 999,
                  maxHeight: 180,
                  overflowY: 'auto',
                  marginTop: 4,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {suggestions.map(ci => (
                    <div
                      key={ci.id}
                      onClick={() => {
                        onUpdate(ing.id, {
                          name: ci.name,
                          ingredientId: ci.id,
                          hargaBeli: ci.hargaBeli,
                          ukuranKemasan: ci.ukuranKemasan,
                          unit: ci.unit
                        });
                        setIsOpen(false);
                      }}
                      style={{
                        padding: '8px 12px',
                        fontSize: 11.5,
                        cursor: 'pointer',
                        borderBottom: '1px solid #f1f5f9',
                        fontWeight: 600,
                        color: '#334155',
                        textAlign: 'left'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {ci.name} ({ci.ukuranKemasan} {ci.unit} — {fmtRp(ci.hargaBeli)})
                    </div>
                  ))}
                  <div
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('database', 'ingredients');
                      }
                      setIsOpen(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      fontSize: 11.5,
                      cursor: 'pointer',
                      fontWeight: 700,
                      color: '#4f46e5',
                      background: '#f5f3ff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      textAlign: 'left'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#ede9fe'}
                    onMouseOut={e => e.currentTarget.style.background = '#f5f3ff'}
                  >
                    <Icon name="plus" size={12} color="#4f46e5" />
                    Tambah Bahan Baru ke Database...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Harga Beli */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 8, fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Rp</span>
            <FormatInput
              className="hpp-input sm"
              placeholder="0"
              value={hargaBeli || ''}
              onChange={v => upd('hargaBeli', v)}
              disabled={isLinked}
              style={{
                fontSize: 11.5, height: 32, border: '1px solid #cbd5e1', borderRadius: 6, width: '100%',
                paddingLeft: 24,
                ...(isLinked ? { background: '#f8fafc', color: '#94a3b8', borderColor: '#e2e8f0' } : {})
              }}
            />
          </div>

          {/* 3. Ukuran Kemasan */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              className="hpp-input sm"
              type="number"
              placeholder="1000"
              value={ukuranKemasan || ''}
              onChange={e => upd('ukuranKemasan', e.target.value)}
              disabled={isLinked}
              style={{
                fontSize: 11.5, height: 32, border: '1px solid #cbd5e1', borderRadius: 6, width: '100%',
                paddingRight: 40,
                ...(isLinked ? { background: '#f8fafc', color: '#94a3b8', borderColor: '#e2e8f0' } : {})
              }}
            />
            <span style={{ position: 'absolute', right: 8, fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>{unit}</span>
          </div>

          {/* 4. Satuan */}
          <select
            className="hpp-input sm"
            value={unit}
            onChange={e => upd('unit', e.target.value)}
            disabled={isLinked}
            style={{
              fontSize: 11.5, height: 32, border: '1px solid #cbd5e1', borderRadius: 6, width: '100%',
              padding: '0 4px',
              ...(isLinked ? { background: '#f8fafc', color: '#94a3b8', borderColor: '#e2e8f0', appearance: 'none' } : {})
            }}
          >
            {['ml', 'gr', 'ltr', 'kg', 'pcs', 'sdm', 'sdt', 'sachet', 'lembar'].map(u => <option key={u}>{u}</option>)}
          </select>

          {/* 5. Takaran per Cup */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              className="hpp-input sm"
              type="number"
              placeholder="0"
              value={ing.takaranPerCup || ''}
              onChange={e => upd('takaranPerCup', e.target.value)}
              style={{ fontSize: 11.5, height: 32, border: '1px solid #cbd5e1', borderRadius: 6, width: '100%', paddingRight: 40 }}
            />
            <span style={{ position: 'absolute', right: 8, fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>{unit}</span>
          </div>

          {/* 6. HPP Result */}
          <div style={{
            background: hpp > 0 ? '#f5f3ff' : '#f8fafc',
            border: `1px solid ${hpp > 0 ? '#ddd6fe' : '#e2e8f0'}`,
            borderRadius: 6,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 10px',
            fontSize: 11.5,
            fontWeight: 700,
            color: hpp > 0 ? '#6d28d9' : '#94a3b8'
          }} className="mono">
            {hpp > 0 ? fmtRp(hpp) : '—'}
          </div>

          {/* 7. Action delete */}
          <button
            onClick={() => onRemove(ing.id)}
            style={{
              height: 32, width: 32, borderRadius: 6, border: 'none', background: '#fef2f2',
              color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
            onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}
            title="Hapus"
          >
            <Icon name="trash" size={12} />
          </button>
        </div>

        {/* Sub Info Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, paddingLeft: 2 }}>
          <button
            onClick={() => setShowPackModal(true)}
            disabled={isLinked}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 20,
              border: '1px solid #e2e8f0',
              background: isLinked ? '#f1f5f9' : '#f5f3ff',
              color: isLinked ? '#94a3b8' : '#4f46e5',
              fontSize: 10, fontWeight: 700,
              cursor: isLinked ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <Icon name="package" size={10} /> Hitung dari Pack
          </button>
          
          {ing.packQty > 0 && ing.packPrice > 0 && (
            <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>
              📦 {fmtRp(ing.packPrice)} / {ing.packQty} {unit}
            </span>
          )}

          {hpp > 0 && (
            <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 'auto', fontWeight: 500 }}>
              Konversi: <span style={{ color: '#6d28d9', fontWeight: 700 }}>{fmtRp(perUnit)}</span>/{unit}
            </span>
          )}
        </div>
      </div>

      {showPackModal && (
        <PackCalcModal
          itemName={ing.name}
          unitLabel={unit}
          initialPackPrice={ing.packPrice}
          initialPackQty={ing.packQty}
          onClose={() => setShowPackModal(false)}
          onApply={(pricePerUnit, packPrice, packQty) => {
            onUpdate(ing.id, {
              hargaBeli: Math.round(pricePerUnit * num(ukuranKemasan)),
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
export function PackagingCard({ pkg, onUpdate, onRemove, targetUnit = 'cup', ingredientsDb = [], onNavigate }) {
  const [showPackModal, setShowPackModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const upd = (f, v) => onUpdate(pkg.id, f, v);

  const isLinked = !!pkg.ingredientId;
  const centralIng = isLinked ? (ingredientsDb || []).find(ci => ci.id === pkg.ingredientId) : null;

  const harga = centralIng 
    ? (num(centralIng.ukuranKemasan) ? num(centralIng.hargaBeli) / num(centralIng.ukuranKemasan) : 0)
    : pkg.harga;
  const name = centralIng ? centralIng.name : pkg.name;
  const unit = centralIng ? centralIng.unit : (pkg.unit || 'pcs');

  const handleNameChange = (val) => {
    const found = (ingredientsDb || []).find(ci => ci.name.toLowerCase() === val.toLowerCase() && ci.isPackaging);
    if (found) {
      onUpdate(pkg.id, {
        name: found.name,
        ingredientId: found.id,
        harga: num(found.ukuranKemasan) ? num(found.hargaBeli) / num(found.ukuranKemasan) : 0,
        unit: found.unit
      });
    } else {
      onUpdate(pkg.id, {
        name: val,
        ingredientId: null
      });
    }
  };

  const suggestions = useMemo(() => {
    const list = (ingredientsDb || []).filter(ci => !!ci.isPackaging);
    if (!name) return list.slice(0, 8);
    return list
      .filter(ci => ci.name.toLowerCase().includes(name.toLowerCase()))
      .slice(0, 10);
  }, [name, ingredientsDb]);

  return (
    <>
      <div
        style={{
          border: '1px solid #e2e8f0',
          background: pkg.enabled ? '#fff' : '#f8fafc',
          padding: 14,
          borderRadius: 10,
          opacity: pkg.enabled ? 1 : 0.65,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
          transition: 'all 0.15s',
          position: 'relative',
          zIndex: isOpen ? 50 : 1
        }}
        className="animate-fade-in"
      >
        {/* Toggle + Name + Delete */}
        <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: 10, gap: 8 }}>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, cursor: 'pointer', overflow: 'hidden' }}>
            <input
              type="checkbox"
              checked={pkg.enabled}
              onChange={e => upd('enabled', e.target.checked)}
              style={{ accentColor: '#4f46e5', cursor: 'pointer', width: 14, height: 14 }}
            />
            <span style={{ fontSize: 13 }}>{pkg.icon || '📦'}</span>
            
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                className="hpp-input sm"
                value={name}
                onChange={e => {
                  handleNameChange(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                placeholder="Nama kemasan…"
                style={{
                  border: 'none', background: 'transparent', fontWeight: 700, fontSize: 12,
                  color: '#1e293b', outline: 'none', padding: '2px 0 2px 14px', width: '100%'
                }}
              />
              {isLinked && (
                <span title="Terhubung ke Database Aset/Bahan" style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                  <Icon name="lock" size={9} color="#6366f1" />
                </span>
              )}

              {/* Custom Dropdown Suggestions */}
              {isOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  zIndex: 999,
                  maxHeight: 180,
                  overflowY: 'auto',
                  marginTop: 4,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {suggestions.map(ci => (
                    <div
                      key={ci.id}
                      onClick={() => {
                        onUpdate(pkg.id, {
                          name: ci.name,
                          ingredientId: ci.id,
                          harga: num(ci.ukuranKemasan) ? num(ci.hargaBeli) / num(ci.ukuranKemasan) : 0,
                          unit: ci.unit
                        });
                        setIsOpen(false);
                      }}
                      style={{
                        padding: '8px 12px',
                        fontSize: 11.5,
                        cursor: 'pointer',
                        borderBottom: '1px solid #f1f5f9',
                        fontWeight: 600,
                        color: '#334155',
                        textAlign: 'left'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {ci.name} ({ci.unit} — {fmtRp(num(ci.ukuranKemasan) ? num(ci.hargaBeli) / num(ci.ukuranKemasan) : 0)})
                    </div>
                  ))}
                  <div
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('database', 'ingredients');
                      }
                      setIsOpen(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      fontSize: 11.5,
                      cursor: 'pointer',
                      fontWeight: 700,
                      color: '#4f46e5',
                      background: '#f5f3ff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      textAlign: 'left'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#ede9fe'}
                    onMouseOut={e => e.currentTarget.style.background = '#f5f3ff'}
                  >
                    <Icon name="plus" size={12} color="#4f46e5" />
                    Tambah Kemasan...
                  </div>
                </div>
              )}
            </div>
          </label>

          <button
            onClick={() => onRemove(pkg.id)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }}
            title="Hapus"
          >
            <Icon name="trash" size={11} />
          </button>
        </div>

        {/* Harga per Unit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, fontSize: 11, fontWeight: 600, color: '#64748b' }}>
            <span>Harga/</span>
            <select
              value={unit}
              onChange={e => {
                upd('unit', e.target.value);
                if (e.target.value === 'pcs' && !pkg.usage) upd('usage', 1);
              }}
              disabled={!pkg.enabled || isLinked}
              style={{
                fontSize: 11, border: 'none', background: 'transparent',
                color: isLinked ? '#64748b' : '#4f46e5',
                fontWeight: 700, padding: 0, outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="pcs">pcs</option>
              <option value="gr">gr</option>
              <option value="ml">ml</option>
              <option value="cm">cm</option>
            </select>
            <span>:</span>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
            <span style={{ position: 'absolute', left: 8, fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Rp</span>
            <FormatInput
              className="hpp-input sm"
              placeholder="0"
              value={harga || ''}
              onChange={v => upd('harga', v)}
              disabled={!pkg.enabled || isLinked}
              style={{
                fontSize: 11.5, height: 28, border: '1px solid #cbd5e1', borderRadius: 6, width: '100%',
                paddingLeft: 22,
                ...((!pkg.enabled || isLinked) ? { background: '#f8fafc', color: '#94a3b8', borderColor: '#e2e8f0' } : {})
              }}
            />
          </div>
        </div>

        {/* Pemakaian per cup */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Pakai/{targetUnit}:</span>
          <input
            className="hpp-input sm"
            type="number"
            placeholder="1"
            step="any"
            value={pkg.usage !== undefined ? pkg.usage : 1}
            onChange={e => upd('usage', e.target.value)}
            disabled={!pkg.enabled}
            style={{ width: 55, height: 28, fontSize: 11.5, border: '1px solid #cbd5e1', borderRadius: 6, textAlign: 'center' }}
          />
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{unit}</span>
          
          {pkg.enabled && (
            <span className="mono" style={{ fontSize: 12, fontWeight: 800, color: '#4f46e5', marginLeft: 'auto' }}>
              {fmtRp(num(pkg.harga) * num(pkg.usage !== undefined ? pkg.usage : 1))}
            </span>
          )}
        </div>

        {/* Pack calc */}
        {pkg.enabled && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setShowPackModal(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: 20,
                border: '1px solid #cbd5e1', background: '#f5f3ff',
                color: '#4f46e5', fontSize: 10, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s'
              }}
            >
              <Icon name="package" size={9} /> Hitung Pack
            </button>
            {pkg.packQty > 0 && pkg.packPrice > 0 && (
              <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>
                📦 {fmtRp(pkg.packPrice)} / {pkg.packQty} {pkg.unit || 'pcs'}
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: 24,
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          animation: 'fadeSlideIn 0.25s ease-out'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: 16, color: '#0f172a' }}>✏️ Ubah Detail Menu</h3>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Emoji Selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Pilih Emoji</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {emojis.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                style={{
                  width: 34, height: 34, borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: emoji === e ? 'rgba(99, 102, 241, 0.15)' : '#f8fafc',
                  color: '#0f172a',
                  fontSize: 16, transition: 'all 0.15s',
                  boxShadow: emoji === e ? '0 0 0 2px #4f46e5' : 'none'
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Nama Menu</label>
          <input
            className="hpp-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Contoh: Kopi Susu Signature"
            style={{ height: 38, fontSize: 12.5, border: '1px solid #cbd5e1', borderRadius: 8, width: '100%', padding: '0 12px' }}
            autoFocus
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Kategori</label>
          <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: 3, borderRadius: 8 }}>
            {cats.map(c => {
              const isAct = cat === c;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  style={{
                    flex: 1, padding: '6px 0', border: 'none', borderRadius: 6, cursor: 'pointer',
                    fontSize: 11.5, fontWeight: 700,
                    background: isAct ? '#fff' : 'transparent',
                    color: isAct ? '#4f46e5' : '#64748b',
                    boxShadow: isAct ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Satuan & Portioning */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Satuan Utama</label>
              <select
                className="hpp-input"
                value={targetUnit}
                onChange={e => setTargetUnit(e.target.value)}
                style={{ height: 36, fontSize: 12, border: '1px solid #cbd5e1', borderRadius: 8, width: '100%', padding: '0 8px' }}
              >
                {['cup', 'porsi', 'pcs', 'loyang', 'bag', 'box', 'slice', 'kotak', 'gram'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Penyajian utama (misal: cup/porsi)</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Bagi Porsi (Portioning)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Bagi</span>
                <input
                  className="hpp-input"
                  type="number"
                  min="1"
                  value={pcsPerPortion} 
                  onChange={e => setPcsPerPortion(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: 55, height: 36, border: '1px solid #cbd5e1', borderRadius: 8, textAlign: 'center', fontSize: 12 }}
                />
                <input
                  className="hpp-input"
                  value={subUnitLabel} 
                  onChange={e => setSubUnitLabel(e.target.value)} 
                  placeholder="pcs"
                  style={{ flex: 1, height: 36, border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 8px', fontSize: 12 }}
                />
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Bagi loyang ke slice/potong</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#fff',
              fontSize: 12,
              fontWeight: 650,
              cursor: 'pointer',
              color: '#475569'
            }}
          >
            Batal
          </button>
          <button
            onClick={() => {
              onSave({ name, emoji, category: cat, targetUnit, pcsPerPortion, subUnitLabel });
              onClose();
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#4f46e5',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Icon name="check" size={13} /> Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
