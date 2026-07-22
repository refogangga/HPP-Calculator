"use client";

import React, { useState } from 'react';
import { Icon } from './Icon';
import FormatInput from './FormatInput';
import { num, fmtRp, uid, mkChannelPreset, DEFAULT_CHANNEL_PRESETS } from '../utils/hpp';

export default function ChannelPresetsModal({
  isOpen,
  onClose,
  channelPresets = [],
  onSavePresets,
  showToast
}) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isNew, setIsNew] = useState(false);

  if (!isOpen) return null;

  const handleStartAdd = () => {
    const newPreset = mkChannelPreset({
      name: '',
      emoji: '📱',
      commissionPct: 10,
      flatFee: 0,
      discountType: 'pct',
      discountValue: 0,
      commissionBasis: 'original'
    });
    setFormData(newPreset);
    setEditingId(newPreset.id);
    setIsNew(true);
  };

  const handleStartEdit = (preset) => {
    setFormData({ ...preset });
    setEditingId(preset.id);
    setIsNew(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(null);
    setIsNew(false);
  };

  const handleSaveEdit = () => {
    if (!formData.name.trim()) {
      if (showToast) showToast('Nama channel tidak boleh kosong!', 'alert');
      return;
    }
    let updated;
    if (isNew) {
      updated = [...channelPresets, formData];
    } else {
      updated = channelPresets.map(p => p.id === editingId ? formData : p);
    }
    onSavePresets(updated);
    handleCancelEdit();
    if (showToast) showToast('Preset channel berhasil disimpan!', 'success');
  };

  const handleDelete = (id) => {
    const preset = channelPresets.find(p => p.id === id);
    if (!preset) return;
    if (preset.isDefault && channelPresets.length <= 1) {
      if (showToast) showToast('Minimal harus ada 1 channel preset!', 'alert');
      return;
    }
    if (!window.confirm(`Hapus preset channel "${preset.name}"?`)) return;
    const updated = channelPresets.filter(p => p.id !== id);
    onSavePresets(updated);
    if (showToast) showToast('Preset channel dihapus', 'info');
  };

  const handleResetDefaults = () => {
    if (!window.confirm('Kembalikan semua preset channel ke pengaturan standar (GoFood, GrabFood, ShopeeFood, Offline)?')) return;
    onSavePresets(DEFAULT_CHANNEL_PRESETS);
    if (showToast) showToast('Preset channel berhasil direset ke standar', 'success');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div className="animate-fade-in" style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 16, width: '100%', maxWidth: 760, maxHeight: '90vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
      }}>

        {/* Header */}
        <div style={{
          padding: '16px 22px', borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg-app)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: '#fff1ef',
              border: '1px solid #ffa590', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#ee4d2d'
            }}>
              <Icon name="store" size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-text)' }}>
                Master Preset Channel Penjualan
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>
                Kelola komisi, fee tetap, dan promo merchant standar (ShopeeFood, GoFood, GrabFood, dll)
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '6px 10px' }}>
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 22, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Top Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <button className="btn btn-primary btn-sm" onClick={handleStartAdd} disabled={!!editingId}>
              <Icon name="plus" size={12} /> Tambah Preset Channel
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleResetDefaults} disabled={!!editingId} style={{ color: '#64748b' }}>
              <Icon name="refresh" size={12} /> Reset ke Preset Standar
            </button>
          </div>

          {/* Form for Add/Edit inline */}
          {editingId && formData && (
            <div style={{
              background: 'var(--bg-app)', border: '1px solid var(--primary)',
              borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 14
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name={isNew ? "plus" : "edit"} size={14} /> {isNew ? 'Tambah Preset Channel Baru' : `Edit Preset Channel: ${formData.name}`}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: 4 }}>Icon</label>
                  <select className="hpp-input center" value={formData.emoji}
                    onChange={e => setFormData({ ...formData, emoji: e.target.value })} style={{ fontWeight: 600 }}>
                    <option value="store">Store</option>
                    <option value="bag">Bag</option>
                    <option value="utensils">Food</option>
                    <option value="coffee">Coffee</option>
                    <option value="tag">Tag</option>
                    <option value="dollar">Dollar</option>
                    <option value="checkCircle">Check</option>
                  </select>
                </div>
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: 4 }}>Nama Channel</label>
                  <input className="hpp-input" placeholder="misal: TikTok Shop / Tokopedia"
                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ fontWeight: 600 }} />
                </div>
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: 4 }}>Warna Tema</label>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                    {['#ee4d2d', '#007d3b', '#00b14f', '#6366f1', '#64748b', '#ec4899', '#f59e0b'].map(c => (
                      <button key={c} type="button" onClick={() => setFormData({ ...formData, color: c })}
                        style={{
                          width: 22, height: 22, borderRadius: '50%', background: c,
                          border: formData.color === c ? '2px solid #000' : 'none', cursor: 'pointer'
                        }} />
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label-sm" style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <Icon name="chart" size={12} /> Komisi Platform (%)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input className="hpp-input" type="number" min="0" max="99" step="0.5"
                      value={formData.commissionPct} onChange={e => setFormData({ ...formData, commissionPct: e.target.value })}
                      style={{ textAlign: 'center', fontWeight: 700 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)' }}>%</span>
                  </div>
                </div>

                <div>
                  <label className="label-sm" style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <Icon name="dollar" size={12} /> Flat Fee (Rp)
                  </label>
                  <div className="input-prefix-wrap">
                    <span className="prefix">Rp</span>
                    <FormatInput className="hpp-input" placeholder="0"
                      value={formData.flatFee || ''} onChange={v => setFormData({ ...formData, flatFee: v })} />
                  </div>
                </div>

                <div>
                  <label className="label-sm" style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <Icon name="tag" size={12} /> Default Diskon Merchant
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input className="hpp-input" type="number" min="0" max="99" step="0.5"
                      value={formData.discountValue} onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                      style={{ textAlign: 'center', fontWeight: 700 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)' }}>%</span>
                  </div>
                </div>
              </div>

              {/* Commission Basis Toggle */}
              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Dasar Penghitungan Komisi Platform</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { val: 'original', label: 'Harga Jual Normal (Asli)', desc: 'Komisi dihitung dari harga sebelum diskon' },
                    { val: 'effective', label: 'Harga Setelah Diskon (Efektif)', desc: 'Komisi dihitung setelah dipotong diskon promo' }
                  ].map(b => (
                    <button key={b.val} type="button" onClick={() => setFormData({ ...formData, commissionBasis: b.val })}
                      style={{
                        flex: 1, padding: '8px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                        border: `1.5px solid ${formData.commissionBasis === b.val ? 'var(--primary)' : 'var(--border-color)'}`,
                        background: formData.commissionBasis === b.val ? 'rgba(0,102,204,0.08)' : 'var(--bg-card)',
                        transition: 'all 0.15s'
                      }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: formData.commissionBasis === b.val ? 'var(--primary)' : 'var(--color-text)' }}>
                        {b.label}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>{b.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                <button className="btn btn-ghost btn-sm" onClick={handleCancelEdit}>Batal</button>
                <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>Simpan Preset</button>
              </div>
            </div>
          )}

          {/* Presets List Table */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                  <th style={{ padding: '10px 12px' }}>Channel Preset</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Komisi (%)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Flat Fee (Rp)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Default Diskon</th>
                  <th style={{ padding: '10px 12px' }}>Dasar Komisi</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', width: 90 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {channelPresets.map(preset => {
                  const isEditingThis = editingId === preset.id;
                  return (
                    <tr key={preset.id} style={{
                      borderBottom: '1px solid var(--border-color)',
                      background: isEditingThis ? 'rgba(0,102,204,0.05)' : 'transparent'
                    }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Icon name={preset.emoji} size={16} color={preset.color || 'var(--primary)'} />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{preset.name}</div>
                            {preset.isDefault && <span style={{ fontSize: 9, color: 'var(--color-text-muted)', background: 'var(--bg-app)', padding: '1px 5px', borderRadius: 4 }}>Bawaan System</span>}
                          </div>
                        </div>
                      </td>
                      <td className="mono" style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: preset.commissionPct > 0 ? '#ee4d2d' : 'var(--color-text-muted)' }}>
                        {preset.commissionPct}%
                      </td>
                      <td className="mono" style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>
                        {preset.flatFee > 0 ? fmtRp(preset.flatFee) : '—'}
                      </td>
                      <td className="mono" style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: preset.discountValue > 0 ? '#f59e0b' : 'var(--color-text-muted)' }}>
                        {preset.discountValue > 0 ? `${preset.discountValue}%` : '—'}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {preset.commissionBasis === 'effective' ? 'Harga Stlh Diskon' : 'Harga Jual Normal'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleStartEdit(preset)} disabled={!!editingId} title="Edit Preset" style={{ padding: '4px 6px' }}>
                            <Icon name="edit" size={12} />
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(preset.id)} disabled={!!editingId} title="Hapus Preset" style={{ padding: '4px 6px', color: '#ef4444' }}>
                            <Icon name="trash" size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 22px', borderTop: '1px solid var(--border-color)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--bg-app)'
        }}>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            Preset terhubung otomatis ke Kalkulator HPP &amp; simulasi bisnis
          </span>
          <button className="btn btn-primary" onClick={onClose}>
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
}
