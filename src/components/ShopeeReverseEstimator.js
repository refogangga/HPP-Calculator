"use client";

import React, { useState, useMemo } from 'react';
import { Icon } from './Icon';
import FormatInput from './FormatInput';
import { SectionHeader } from './HppSubComponents';
import { num, fmtRp, getPenyusutanBulanan, getDirectHPP, uid } from '../utils/hpp';

export default function ShopeeReverseEstimator({
  menus = [],
  opexProfiles = [],
  activeOutletId,
  activeProfileId,
  onUpdateProfile,
  assets = [],
  setAssets,
  ingredients = []
}) {
  // Input states
  const [totalOrder, setTotalOrder] = useState(100);
  const [totalOmset, setTotalOmset] = useState(2500000);
  const [avgPaymentPerCup, setAvgPaymentPerCup] = useState(25000);
  const [commissionPct, setCommissionPct] = useState(24);

  // Get active profile for active outlet
  const activeProfile = useMemo(() => {
    const outletProfiles = opexProfiles.filter(p => p.outletId === activeOutletId);
    return outletProfiles.find(p => p.id === activeProfileId) || outletProfiles[0] || null;
  }, [opexProfiles, activeOutletId, activeProfileId]);

  // Filter menus for this outlet
  const outletMenus = useMemo(() => {
    return menus.filter(m => m.outletId === activeOutletId);
  }, [menus, activeOutletId]);

  // Calculate active menus in this profile
  const activeProfileMenus = useMemo(() => {
    if (!activeProfile) return [];
    const hasSelected = Array.isArray(activeProfile.selectedMenuIds) && activeProfile.selectedMenuIds.length > 0;
    const selected = hasSelected ? outletMenus.filter(m => activeProfile.selectedMenuIds.includes(m.id)) : outletMenus;
    return selected.filter(m => !activeProfile.disabledMenuIds?.includes(m.id));
  }, [outletMenus, activeProfile]);

  // Calculate avgHpp (average HPP per cup) from the simulation
  const avgHppFromSimulation = useMemo(() => {
    if (!activeProfile || activeProfileMenus.length === 0) return 0;
    
    let totalCOGS = 0;
    let totalVolume = 0;

    activeProfileMenus.forEach(m => {
      // Get menu volume
      let volume = 100;
      if (activeProfile.menuVolumes && activeProfile.menuVolumes[m.id] !== undefined) {
        volume = activeProfile.menuVolumes[m.id];
      } else {
        volume = num(m.ops?.estimasiCup) || 100;
      }

      const menuHpp = getDirectHPP(m, ingredients);

      totalVolume += volume;
      totalCOGS += volume * menuHpp;
    });

    return totalVolume > 0 ? totalCOGS / totalVolume : 0;
  }, [activeProfile, activeProfileMenus, ingredients]);

  // Calculate active OPEX from the simulation profile
  const activeOpexFromSimulation = useMemo(() => {
    if (!activeProfile) return 0;
    const overhead = (activeProfile.expenses || []).reduce((sum, exp) => sum + num(exp.value || exp.amount), 0);
    const penyusutan = getPenyusutanBulanan(activeProfile, assets);
    return overhead + penyusutan;
  }, [activeProfile, assets]);

  // Central Assets filter & toggle
  const largeCentralAssets = useMemo(() => {
    return (assets || []).filter(ca => ca.outletId === activeOutletId && ca.isLargeExpense);
  }, [assets, activeOutletId]);

  const handleToggleLargeAsset = (caId) => {
    const isSelected = (activeProfile.assets || []).some(a => a.assetId === caId);
    let updated;
    if (isSelected) {
      updated = (activeProfile.assets || []).filter(a => a.assetId !== caId);
    } else {
      updated = [...(activeProfile.assets || []), { id: uid(), assetId: caId, enabled: true }];
    }
    onUpdateProfile({ assets: updated });
  };

  const totalBelanjaBesar = useMemo(() => {
    return (activeProfile?.assets || []).reduce((sum, a) => {
      const central = (assets || []).find(ca => ca.id === a.assetId);
      if (central && central.isLargeExpense) {
        return sum + num(central.harga);
      }
      if (!a.assetId && a.isLargeExpense && a.harga) {
        return sum + num(a.harga);
      }
      return sum;
    }, 0);
  }, [activeProfile?.assets, assets]);

  // Calculations
  const results = useMemo(() => {
    const orders = num(totalOrder);
    const totalOmsetVal = num(totalOmset);
    const avgPaymentVal = num(avgPaymentPerCup) || 1; // avoid division by 0
    const commPct = num(commissionPct);
    const hppPerCup = avgHppFromSimulation;
    const opexBulanan = activeOpexFromSimulation;
    const belanjaBesar = totalBelanjaBesar;

    // Shopee commission calculation
    const totalKomisi = totalOmsetVal * (commPct / 100);
    
    // Uang Aktual Masuk Rekening (Nett Payout)
    const nettPayout = Math.max(totalOmsetVal - totalKomisi, 0);

    // Estimasi cup terjual berdasarkan total omset dan rata-rata pembayaran per cup
    const estimasiCupTerjual = avgPaymentVal > 0 ? Math.round(totalOmsetVal / avgPaymentVal) : 0;

    // Total HPP Cost
    const totalHppCost = estimasiCupTerjual * hppPerCup;

    // Dana Aktual setelah HPP, OPEX, dan belanja besar
    const sisaDanaBersih = nettPayout - totalHppCost - opexBulanan - belanjaBesar;

    return {
      totalOmsetVal,
      totalKomisi,
      nettPayout,
      estimasiCupTerjual,
      totalHppCost,
      opexBulanan,
      belanjaBesar,
      sisaDanaBersih,
      hppPerCup,
    };
  }, [totalOrder, totalOmset, avgPaymentPerCup, commissionPct, avgHppFromSimulation, activeOpexFromSimulation, activeProfile]);

  const {
    totalOmsetVal,
    totalKomisi,
    nettPayout,
    estimasiCupTerjual,
    totalHppCost,
    opexBulanan,
    belanjaBesar,
    sisaDanaBersih,
    hppPerCup,
  } = results;

  return (
    <div className="main-grid" style={{
      display: 'grid', gridTemplateColumns: '1fr 390px', gap: 20,
      padding: '20px 28px', alignItems: 'start'
    }}>
      
      {/* ══ LEFT PANEL: INPUT FORM ════════════════════════════ */}
      <div>
        <div className="section-card">
          <SectionHeader
            iconEmoji="calculator" iconBg="#dbeafe"
            title="Kalkulator Dana Aktual & Bersih Shopee"
            badgeText="DANA AKTUAL" badgeClass="badge-indigo"
          />
          
          <div className="section-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Input Form Fields Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Field 1: Total Transaksi */}
              <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 16, border: '1px solid var(--border-color)' }}>
                <div className="label-xs" style={{ marginBottom: 8, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Total Transaksi (Order Masuk)
                </div>
                <input
                  className="hpp-input"
                  type="number"
                  placeholder="100"
                  value={totalOrder}
                  onChange={e => setTotalOrder(Math.max(0, parseInt(e.target.value) || 0))}
                  style={{ fontSize: 14, fontWeight: 600 }}
                />
              </div>

              {/* Field 2: Total Omset */}
              <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 16, border: '1px solid var(--border-color)' }}>
                <div className="label-xs" style={{ marginBottom: 8, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Total Omset
                </div>
                <FormatInput
                  className="hpp-input"
                  value={totalOmset}
                  onChange={v => setTotalOmset(v)}
                  placeholder="2.500.000"
                  style={{ fontSize: 14, fontWeight: 600 }}
                />
              </div>

              {/* Field 3: Rata-rata Jumlah Pembayaran */}
              <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 16, border: '1px solid var(--border-color)' }}>
                <div className="label-xs" style={{ marginBottom: 8, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Rata-rata Jumlah Pembayaran (Rp)
                </div>
                <FormatInput
                  className="hpp-input"
                  value={avgPaymentPerCup}
                  onChange={v => setAvgPaymentPerCup(v)}
                  placeholder="25.000"
                  style={{ fontSize: 14, fontWeight: 600 }}
                />
              </div>

              {/* Field 4: Shopee Commission */}
              <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 16, border: '1px solid var(--border-color)' }}>
                <div className="label-xs" style={{ marginBottom: 8, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Persentase Komisi Shopee (%)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    className="hpp-input"
                    type="number"
                    placeholder="24"
                    value={commissionPct}
                    onChange={e => setCommissionPct(Math.max(0, parseFloat(e.target.value) || 0))}
                    style={{ fontSize: 14, fontWeight: 600 }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 700 }}>%</span>
                </div>
              </div>

              {/* Read-Only: Rata-rata HPP per Cup (Auto-pull) */}
              <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 16, border: '1.5px dashed #86efac', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="label-xs" style={{ color: '#166534', fontWeight: 700, marginBottom: 4 }}>
                      Rata-rata HPP per Cup (Auto-pull)
                    </div>
                    <div style={{ fontSize: 11, color: '#166534' }}>
                      Ditarik dari data outlet aktif di Menu & Simulasi Penjualan Bulanan
                    </div>
                  </div>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 800, color: '#15803d' }}>
                    {fmtRp(hppPerCup)}
                  </div>
                </div>
              </div>

              {/* Read-Only: Total OPEX Bulanan (Auto-pull) */}
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, border: '1.5px dashed #cbd5e1', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="label-xs" style={{ color: '#475569', fontWeight: 700, marginBottom: 4 }}>
                      Total OPEX Bulanan (Auto-pull)
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      Ditarik dari data beban operasional & penyusutan outlet aktif
                    </div>
                  </div>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 800, color: '#334155' }}>
                    {fmtRp(opexBulanan)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Belanja Besar / Investasi Non-Rutin Card */}
        <div className="section-card" style={{ marginTop: 20 }}>
          <SectionHeader
            iconEmoji="store" iconBg="#fee2e2"
            title="Pencatatan Belanja Besar / Investasi Non-Rutin"
            badgeText="DATABASE ASET" badgeClass="badge-red"
          />
          
          <div className="section-body">
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 12 }}>
              Pilih (centang) pembelanjaan besar/non-rutin dari database di bawah ini untuk dimasukkan dalam hitungan pengurang dana aktual bulan ini:
            </div>

            {!activeProfile || largeCentralAssets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--color-text-muted)', fontSize: 12, border: '1px dashed var(--border-color)', borderRadius: 8 }}>
                Belum ada belanja besar / investasi non-rutin tercatat di Database. Silakan tambah data di tab <strong>Data {"->"} Aset &amp; Belanja</strong>.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {largeCentralAssets.map((ca) => {
                  const isSelected = (activeProfile.assets || []).some(a => a.assetId === ca.id);
                  return (
                    <div
                      key={ca.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        background: isSelected ? 'var(--bg-card)' : 'var(--bg-app)',
                        opacity: isSelected ? 1 : 0.7,
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: `1px solid ${isSelected ? '#ef4444' : 'var(--border-color)'}`,
                        transition: 'all 0.15s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleLargeAsset(ca.id)}
                        style={{ width: 16, height: 16, cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{ca.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>
                          Umur ekonomis: {ca.tahun} Tahun
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 13, color: '#dc2626' }}>
                        {fmtRp(ca.harga)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL: RESULTS sticky ══════════════════════ */}
      <div className="result-sticky" style={{ position: 'sticky', top: 90 }}>
        
        {/* Main Shopee payment summary card */}
        <div className="platform-breakdown-card" style={{ padding: 18, border: '1px solid var(--border-color)', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon name="chart" size={13} color="var(--color-text-muted)" /> Ringkasan Pembayaran Shopee
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Metric 1: Total Omset Shopee */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="tag" size={14} color="#f59e0b" />
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Total Omset Shopee</span>
              </div>
              <span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{fmtRp(totalOmsetVal)}</span>
            </div>

            {/* Metric 2: Potongan Komisi Shopee */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="alert" size={14} color="#ef4444" />
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Potongan Komisi Shopee ({commissionPct}%)</span>
              </div>
              <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>− {fmtRp(totalKomisi)}</span>
            </div>

            {/* Metric 3: Uang Masuk Rekening (Dana Aktual) */}
            <div style={{
              padding: '10px 12px', borderRadius: 8,
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="bank" size={14} color="#16a34a" />
                <span style={{ fontSize: 12, color: '#15803d', fontWeight: 700 }}>Uang Masuk Rekening</span>
              </div>
              <span className="mono" style={{ fontSize: 14, fontWeight: 800, color: '#16a34a' }}>{fmtRp(nettPayout)}</span>
            </div>
          </div>
        </div>

        {/* The New Card: Perhitungan Dana Aktual Bersih (Uang Masuk Rekening dikurangi HPP & OPEX) */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius)',
          padding: 18,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
          color: 'var(--color-text)',
          marginBottom: 16
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon name="dollar" size={13} color="var(--primary)" /> Perhitungan Dana Aktual Bersih
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>1. Uang Masuk Rekening</span>
              <span className="mono" style={{ fontWeight: 600, color: '#16a34a' }}>{fmtRp(nettPayout)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', borderBottom: '1px dashed var(--border-color)', paddingBottom: 8 }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>2. Total HPP Cup</span>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  ({estimasiCupTerjual.toLocaleString('id-ID')} Cup × {fmtRp(hppPerCup)})
                </div>
              </div>
              <span className="mono" style={{ fontWeight: 600, color: '#dc2626' }}>− {fmtRp(totalHppCost)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: 8 }}>
              <span style={{ color: 'var(--color-text-muted)' }}>3. OPEX Bulanan</span>
              <span className="mono" style={{ fontWeight: 600, color: '#dc2626' }}>− {fmtRp(opexBulanan)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: 8 }}>
              <span style={{ color: 'var(--color-text-muted)' }}>4. Belanja Non-Rutin / Besar</span>
              <span className="mono" style={{ fontWeight: 600, color: '#dc2626' }}>− {fmtRp(belanjaBesar)}</span>
            </div>

            <div style={{
              marginTop: 4, padding: '12px 14px', borderRadius: 'var(--radius)',
              background: sisaDanaBersih >= 0 ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${sisaDanaBersih >= 0 ? '#10b981' : '#f87171'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: sisaDanaBersih >= 0 ? '#047857' : '#b91c1c', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name={sisaDanaBersih >= 0 ? "checkCircle" : "alert"} size={12} color={sisaDanaBersih >= 0 ? "#047857" : "#b91c1c"} />
                    {sisaDanaBersih >= 0 ? 'DANA AKTUAL BERSIH' : 'DEFISIT AKTUAL'}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>
                    Setelah dipotong HPP, OPEX & Aset
                  </div>
                </div>
                <div className="mono" style={{
                  fontSize: 18, fontWeight: 900,
                  color: sisaDanaBersih >= 0 ? '#047857' : '#b91c1c',
                  letterSpacing: '-0.02em'
                }}>
                  {fmtRp(sisaDanaBersih)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informational help card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '12px 14px' }}>
          <div className="flex-center gap-2" style={{ display: 'flex', alignItems: 'flex-start' }}>
            <span style={{ marginTop: 2, display: 'inline-block' }}><Icon name="info" size={13} color="var(--primary)" /></span>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--color-text)' }}>Cara Kerja Kalkulator Shopee:</strong><br />
              Menghitung uang bersih aktual yang Anda terima di rekening setelah dipotong komisi Shopee, biaya produksi produk (HPP), dan biaya operasional bulanan (OPEX).
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
