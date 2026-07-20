"use client";

import React, { useState, useEffect } from 'react';

export default function FormatInput({ value, onChange, className, style, placeholder, disabled, autoFocus }) {
  const [val, setVal] = useState('');

  useEffect(() => {
    if (value === '' || value === undefined || value === null) {
      setVal('');
      return;
    }
    const valNum = Number(value);
    const localNum = Number(val.replace(/\./g, '').replace(',', '.'));
    
    if (valNum !== localNum) {
      let str = String(value);
      if (str.includes('.')) {
        let [intPart, decPart] = str.split('.');
        setVal(parseInt(intPart, 10).toLocaleString('id-ID') + ',' + decPart);
      } else {
        setVal(parseInt(str, 10).toLocaleString('id-ID'));
      }
    }
  }, [value]);

  const handleChange = (e) => {
    let raw = e.target.value.replace(/[^0-9.,]/g, '');
    let parts = raw.split(',');
    let intPart = parts[0].replace(/\./g, '');
    if (intPart) {
      intPart = parseInt(intPart, 10).toLocaleString('id-ID');
    }
    let formatted = intPart + (parts.length > 1 ? ',' + parts[1] : '');
    if (raw.endsWith(',')) formatted += ',';
    
    setVal(formatted);
    let numericStr = formatted.replace(/\./g, '').replace(',', '.');
    onChange(numericStr);
  };

  return <input type="text" className={className} style={style} placeholder={placeholder} disabled={disabled} autoFocus={autoFocus} value={val} onChange={handleChange} />;
}
