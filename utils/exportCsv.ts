export type CsvCell = string | number | boolean | null | undefined;

const escapeCell = (value: CsvCell) => {
  let s = value === null || value === undefined ? '' : String(value);
  // Prevent spreadsheet formula injection
  if (/^[=+\-@\t\r]/.test(s) && Number.isNaN(Number(s))) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const toCsv = (headers: string[], rows: CsvCell[][]) =>
  [headers, ...rows].map(r => r.map(escapeCell).join(',')).join('\r\n');

/** Downloads a CSV (UTF-8 with BOM so Excel opens it correctly). */
export const downloadCsv = (filename: string, headers: string[], rows: CsvCell[][]) => {
  const blob = new Blob(['﻿' + toCsv(headers, rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
