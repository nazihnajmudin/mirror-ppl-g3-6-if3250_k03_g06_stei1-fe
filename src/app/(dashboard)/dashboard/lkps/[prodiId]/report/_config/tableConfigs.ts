export interface TableConfig {
  title: string;
  startRow: number; // 1-indexed for ExcelJS
  startCol: number; // 1-indexed for ExcelJS
  columns: any[];
  nestedHeaders?: any[][];
}

export const tableConfigs: Record<string, TableConfig> = {
  'PS': {
    title: 'Daftar Program Studi di UPPS',
    startRow: 17,
    startCol: 2,
    columns: [
      { data: 0, type: 'numeric', width: 40 },
      { data: 1, type: 'text', width: 150 },
      { data: 2, type: 'text', width: 250 },
      { data: 3, type: 'text', width: 150 },
      { data: 4, type: 'text', width: 200 },
      { data: 5, type: 'intl-date', intlDateTimeFormat: { day: '2-digit', month: '2-digit', year: 'numeric' }, width: 150 },
      { data: 6, type: 'numeric', width: 150 },
    ],
    nestedHeaders: [
      [
        { label: 'No', rowspan: 2 },
        { label: 'Jenis Program', rowspan: 2 },
        { label: 'Nama Program Studi', rowspan: 2 },
        { label: 'Akreditasi Program Studi', colspan: 3 },
        { label: 'Jumlah Mahasiswa saat TS', rowspan: 2 },
      ],
      ['Status/ Peringkat', 'No. dan Tgl. SK', 'Tgl. Kadaluarsa'],
    ],
  },
  'PSPPI': {
    title: 'Daftar Program Studi (PSPPI)',
    startRow: 14,
    startCol: 2,
    columns: [
      { data: 0, type: 'numeric', width: 40 },
      { data: 1, type: 'text', width: 250 },
      { data: 2, type: 'text', width: 150 },
      { data: 3, type: 'text', width: 200 },
      { data: 4, type: 'intl-date', intlDateTimeFormat: { day: '2-digit', month: '2-digit', year: 'numeric' }, width: 150 },
      { data: 5, type: 'numeric', width: 150 },
    ],
    nestedHeaders: [
      [
        { label: 'No', rowspan: 2 },
        { label: 'Nama Program Studi', rowspan: 2 },
        { label: 'Akreditasi Program Studi', colspan: 3 },
        { label: 'Jumlah Mahasiswa saat TS', rowspan: 2 },
      ],
      ['Status/ Peringkat', 'No. dan Tgl. SK', 'Tgl. Kadaluarsa'],
    ],
  },
  '2a1': {
    title: 'Kerjasama Pendidikan',
    startRow: 13,
    startCol: 2,
    columns: [
      { data: 0, type: 'numeric', width: 40 }, // No.
      { data: 1, type: 'text', width: 200 },  // Lembaga Mitra
      { data: 2, type: 'text', width: 100 },  // Tingkat Internasional
      { data: 3, type: 'text', width: 100 },  // Tingkat Nasional
      { data: 4, type: 'text', width: 100 },  // Tingkat Lokal
      { data: 5, type: 'text', width: 250 },  // Judul Kegiatan
      { data: 6, type: 'text', width: 200 },  // Manfaat
      { data: 7, type: 'intl-date', intlDateTimeFormat: { day: '2-digit', month: '2-digit', year: 'numeric' }, width: 120 }, // Tgl Awal
      { data: 8, type: 'intl-date', intlDateTimeFormat: { day: '2-digit', month: '2-digit', year: 'numeric' }, width: 120 }, // Tgl Akhir
      { data: 9, type: 'numeric', width: 80 }, // Durasi
      { data: 10, type: 'text', width: 100 }, // Status
      { data: 11, type: 'text', width: 150 }, // Bukti
    ],
    nestedHeaders: [
      [
        { label: 'No.', rowspan: 2 },
        { label: 'Lembaga Mitra', rowspan: 2 },
        { label: 'Tingkat', colspan: 3 },
        { label: 'Judul Kegiatan Kerjasama', rowspan: 2 },
        { label: 'Manfaat bagi PS yang Diakreditasi', rowspan: 2 },
        { label: 'Tanggal Awal Kerjasama', rowspan: 2 },
        { label: 'Tanggal Akhir Kerjasama', rowspan: 2 },
        { label: 'Durasi', rowspan: 2 },
        { label: 'Status Kerjasama', rowspan: 2 },
        { label: 'Bukti Kerjasama', rowspan: 2 },
      ],
      ['Internasional', 'Nasional', 'Lokal/Wilayah'],
    ],
  },
  '3a1': {
    title: 'Kurikulum dan Rencana Pembelajaran',
    startRow: 10,
    startCol: 2,
    columns: [
      { data: 0, type: 'numeric' },
      { data: 1, type: 'text' },
      { data: 2, type: 'text' },
      { data: 3, type: 'text' },
      { data: 4, type: 'text' },
      { data: 5, type: 'numeric' },
      { data: 6, type: 'numeric' },
      { data: 7, type: 'numeric' },
      { data: 8, type: 'numeric' },
      { data: 9, type: 'text' },
      { data: 10, type: 'text' },
    ],
    nestedHeaders: [
      [
        { label: 'No.', rowspan: 2 },
        { label: 'Semester', rowspan: 2 },
        { label: 'Kode Mata Kuliah', rowspan: 2 },
        { label: 'Nama Mata Kuliah', rowspan: 2 },
        { label: 'Mata Kuliah Kompetensi', rowspan: 2 },
        { label: 'Bobot Kredit (sks)', colspan: 3 },
        { label: 'Konversi Kredit ke Jam', rowspan: 2 },
        { label: 'Dokumen Rencana Pembelajaran', rowspan: 2 },
        { label: 'Unit Penyelenggara', rowspan: 2 },
      ],
      ['Kuliah', 'Seminar', 'Praktikum'],
    ],
  },
};

// Helper to get default config for sheets not yet defined
export const getTableConfig = (sheetName: string): TableConfig => {
  return tableConfigs[sheetName] || {
    title: `Tabel ${sheetName}`,
    startRow: 10,
    startCol: 2,
    columns: Array.from({ length: 10 }, () => ({ type: 'text' })),
  };
};
