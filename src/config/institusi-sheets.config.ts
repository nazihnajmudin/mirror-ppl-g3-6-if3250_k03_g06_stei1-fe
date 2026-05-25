export type InstitusiSheetColumnType = 'number' | 'text' | 'textarea' | 'date' | 'url' | 'boolean' | 'select';

export interface InstitusiSheetColumn {
  key: string;
  label: string;
  type: InstitusiSheetColumnType;
  options?: string[];
}

export interface InstitusiSheetConfig {
  key: string;
  sheetName: string;
  title: string;
  description: string;
  rowType: 'fixed' | 'free';
  fixedRows?: string[];
  labelKey?: string;
  columns: InstitusiSheetColumn[];
  minWidthClass: string;
}

const KEUANGAN_FIXED_ROWS = [
  'Biaya Operasional Pendidikan > a. Biaya Dosen',
  'b. Tenaga Kependidikan',
  'c. Operasional Pembelajaran',
  'd. Operasional Tidak Langsung',
  'e. Operasional Diluar PT',
  'f. Investasi',
  'Penelitian',
  'PkM',
  'Lainnya',
];

export const INSTITUSI_SHEETS: InstitusiSheetConfig[] = [
  {
    key: '2b',
    sheetName: '2b',
    title: 'Keuangan',
    description: 'Data penggunaan dana yang diisi per program studi dan disinkronkan ke tabel 2b LKPS.',
    rowType: 'fixed',
    fixedRows: KEUANGAN_FIXED_ROWS,
    labelKey: 'jenis_penggunaan',
    columns: [
      { key: 'no', label: 'No.', type: 'number' },
      { key: 'jenis_penggunaan', label: 'Jenis Penggunaan', type: 'text' },
      { key: 'upps_ts_minus2', label: 'UPPS TS-2 (Rp)', type: 'number' },
      { key: 'upps_ts_minus1', label: 'UPPS TS-1 (Rp)', type: 'number' },
      { key: 'upps_ts', label: 'UPPS TS (Rp)', type: 'number' },
    ],
    minWidthClass: 'min-w-[980px]',
  },
  {
    key: '4b',
    sheetName: '4b',
    title: 'Kepependidikan',
    description: 'Data tenaga kependidikan yang diisi per program studi dan disinkronkan ke tabel 4b LKPS.',
    rowType: 'free',
    columns: [
      { key: 'no', label: 'No.', type: 'number' },
      { key: 'nama', label: 'Nama', type: 'text' },
      { key: 'pendidikan_s3', label: 'S3', type: 'boolean' },
      { key: 'pendidikan_s2', label: 'S2', type: 'boolean' },
      { key: 'pendidikan_s1', label: 'S1', type: 'boolean' },
      { key: 'pendidikan_d4', label: 'D4', type: 'boolean' },
      { key: 'pendidikan_d3', label: 'D3', type: 'boolean' },
      { key: 'sertifikat_kompetensi', label: 'Sertifikat Kompetensi', type: 'text' },
      { key: 'unit_kerja', label: 'Unit Kerja', type: 'select', options: ['UPPS', 'PS', 'Institusi'] },
    ],
    minWidthClass: 'min-w-[1200px]',
  },
  {
    key: '6a',
    sheetName: '6a',
    title: 'Mahasiswa',
    description: 'Data jumlah mahasiswa aktif yang diisi per program studi dan disinkronkan ke tabel 6a LKPS.',
    rowType: 'free',
    columns: [
      { key: 'no', label: 'No.', type: 'number' },
      { key: 'program_studi', label: 'Program Studi', type: 'text' },
      { key: 'aktif_ts_minus2', label: 'Aktif TS-2', type: 'number' },
      { key: 'aktif_ts_minus1', label: 'Aktif TS-1', type: 'number' },
      { key: 'aktif_ts', label: 'Aktif TS', type: 'number' },
      { key: 'asing_ft_ts_minus2', label: 'Asing FT TS-2', type: 'number' },
      { key: 'asing_ft_ts_minus1', label: 'Asing FT TS-1', type: 'number' },
      { key: 'asing_ft_ts', label: 'Asing FT TS', type: 'number' },
      { key: 'asing_pt_ts_minus2', label: 'Asing PT TS-2', type: 'number' },
      { key: 'asing_pt_ts_minus1', label: 'Asing PT TS-1', type: 'number' },
      { key: 'asing_pt_ts', label: 'Asing PT TS', type: 'number' },
    ],
    minWidthClass: 'min-w-[1400px]',
  },
];

export const INSTITUSI_SHEET_MAP = Object.fromEntries(
  INSTITUSI_SHEETS.map((sheet) => [sheet.key, sheet])
) as Record<string, InstitusiSheetConfig>;

export const INITIAL_2B_ROWS = KEUANGAN_FIXED_ROWS.map((jenis_penggunaan, index) => ({
  no: index + 1,
  jenis_penggunaan,
  upps_ts_minus2: 0,
  upps_ts_minus1: 0,
  upps_ts: 0,
}));

export const getDefaultRowsForSheet = (sheet: InstitusiSheetConfig) => {
  if (sheet.sheetName === '2b') {
    return INITIAL_2B_ROWS.map((row) => ({ ...row }));
  }

  return [createBlankFreeRow(sheet, 1)];
};

export const createBlankFreeRow = (sheet: InstitusiSheetConfig, rowNumber: number) => {
  const row: Record<string, any> = {};

  sheet.columns.forEach((column) => {
    if (column.key === 'no') {
      row[column.key] = rowNumber;
      return;
    }

    if (column.type === 'boolean') {
      row[column.key] = false;
      return;
    }

    if (column.type === 'number') {
      row[column.key] = '';
      return;
    }

    row[column.key] = '';
  });

  return row;
};

export const isFreeSheetRowEmpty = (sheet: InstitusiSheetConfig, row: Record<string, any>) => {
  return sheet.columns
    .filter((column) => column.key !== 'no')
    .every((column) => {
      const value = row[column.key];

      if (column.type === 'boolean') {
        return value !== true;
      }

      return value === null || value === undefined || String(value).trim() === '';
    });
};

export const normalizeSheetRows = (sheet: InstitusiSheetConfig, rows: any[]) => {
  if (sheet.sheetName === '2b') {
    return rows.map((row, index) => ({
      no: index + 1,
      jenis_penggunaan: row.jenis_penggunaan ?? INITIAL_2B_ROWS[index]?.jenis_penggunaan ?? '',
      upps_ts_minus2: Number(row.upps_ts_minus2) || 0,
      upps_ts_minus1: Number(row.upps_ts_minus1) || 0,
      upps_ts: Number(row.upps_ts) || 0,
    }));
  }

  return rows
    .filter((row) => !isFreeSheetRowEmpty(sheet, row))
    .map((row, index) => {
      const normalized: Record<string, any> = { no: index + 1 };

      sheet.columns.forEach((column) => {
        if (column.key === 'no') {
          normalized[column.key] = index + 1;
          return;
        }

        if (column.type === 'boolean') {
          normalized[column.key] = Boolean(row[column.key]);
          return;
        }

        if (column.type === 'number') {
          normalized[column.key] = row[column.key] === '' || row[column.key] === null || row[column.key] === undefined
            ? ''
            : Number(row[column.key]);
          return;
        }

        normalized[column.key] = row[column.key] ?? '';
      });

      return normalized;
    });
};
