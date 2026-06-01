export interface TableConfig {
  title: string;
  startRow: number; // 1-indexed for ExcelJS
  startCol: number; // 1-indexed for ExcelJS
  columns: any[];
  nestedHeaders?: any[][];
  keys?: string[]; // Map object keys to columns
  columnLabels?: string[]; // Display labels for columns
}

export const tableConfigs: Record<string, TableConfig> = {
  'PS': {
    title: 'Daftar Program Studi di UPPS',
    startRow: 17,
    startCol: 2,
    keys: ['no', 'jenis_program', 'nama_prodi', 'status_akreditasi', 'no_sk', 'tgl_kedaluwarsa', 'jumlah_mahasiswa'],
    columnLabels: ['No', 'Jenis Program', 'Nama Program Studi', 'Status Akreditasi', 'No. SK', 'Tgl. Kedaluwarsa', 'Jumlah Mahasiswa'],
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
      ['Status/ Peringkat', 'No. dan Tgl. SK', 'Tgl. Kedaluwarsa'],
    ],
  },
  'PSPPI': {
    title: 'Disiplin Teknik Keinsinyuran (PSPPI)',
    startRow: 17,
    startCol: 2,
    keys: ['no', 'disiplin', 'penyelenggaraan_ya', 'penyelenggaraan_tidak'],
    columnLabels: ['No', 'Disiplin', 'Ya', 'Tidak'],
    columns: [
      { data: 0, type: 'numeric', width: 40 },
      { data: 1, type: 'text', width: 300 },
      { data: 2, type: 'text', width: 100, className: 'htCenter' },
      { data: 3, type: 'text', width: 100, className: 'htCenter' },
    ],
    nestedHeaders: [
      [
        { label: 'No', rowspan: 2 },
        { label: 'Disiplin Teknik Keinsinyuran', rowspan: 2 },
        { label: 'Penyelenggaraan pada Program Profesi', colspan: 2 },
      ],
      ['Ya', 'Tidak'],
    ],
  },
  '1': {
    title: 'Visi Misi Tujuan Strategi',
    startRow: 10,
    startCol: 2,
    keys: ['no', 'jenis_vmts', 'pernyataan', 'no_sk', 'link_dokumen'],
    columnLabels: ['No.', 'Jenis VMTS', 'Pernyataan', 'No. SK', 'Link Dokumen'],
    columns: [
      { data: 0, type: 'numeric', width: 40 },
      { data: 1, type: 'text', width: 150 },
      { data: 2, type: 'textarea', width: 300 },
      { data: 3, type: 'text', width: 150 },
      { data: 4, type: 'url', width: 200 },
    ],
  },
  '3a3': {
    title: 'Integrasi Kegiatan Penelitian/PkM dalam Pembelajaran',
    startRow: 13,
    startCol: 2,
    keys: ['no', 'nama_dosen', 'judul_penelitian_pkm', 'mata_kuliah', 'bentuk_integrasi', 'tahun_ts_minus2', 'tahun_ts_minus1', 'tahun_ts', 'kesesuaian_roadmap', 'bukti_sahih', 'kesesuaian_rps'],
    columnLabels: ['No.', 'Nama Dosen', 'Judul', 'MK', 'Bentuk', 'TS-2', 'TS-1', 'TS', 'Sesuai Roadmap', 'Bukti', 'Kesesuaian RPS'],
    columns: [
      { data: 0, type: 'numeric', width: 40 },
      { data: 1, type: 'text', width: 200 },
      { data: 2, type: 'text', width: 250 },
      { data: 3, type: 'text', width: 200 },
      { data: 4, type: 'text', width: 150 },
      { data: 5, type: 'text', width: 80 },
      { data: 6, type: 'text', width: 80 },
      { data: 7, type: 'text', width: 80 },
      { data: 8, type: 'text', width: 150 },
      { data: 9, type: 'text', width: 150 },
      { data: 10, type: 'text', width: 150 },
    ],
    nestedHeaders: [
      [
        { label: 'No.', rowspan: 2 },
        { label: 'Nama Dosen', rowspan: 2 },
        { label: 'Judul Penelitian/PkM', rowspan: 2 },
        { label: 'Mata Kuliah', rowspan: 2 },
        { label: 'Bentuk Integrasi', rowspan: 2 },
        { label: 'Tahun Penelitian/PkM', colspan: 3 },
        { label: 'Kesesuaian dengan Peta Jalan', rowspan: 2 },
        { label: 'Bukti Sahih', rowspan: 2 },
        { label: 'Kesesuaian RPS', rowspan: 2 },
      ],
      ['TS-2', 'TS-1', 'TS'],
    ],
  },
  '2a1': {
    title: 'Kerjasama Pendidikan',
    startRow: 13,
    startCol: 2,
    keys: ['no', 'lembaga_mitra', 'tingkat_internasional', 'tingkat_nasional', 'tingkat_lokal', 'judul_kerjasama', 'manfaat', 'tgl_awal', 'tgl_akhir', 'durasi', 'status_kerjasama', 'bukti_kerjasama'],
    columnLabels: ['No.', 'Lembaga Mitra', 'Internasional', 'Nasional', 'Lokal/Wilayah', 'Judul Kegiatan', 'Manfaat', 'Tgl Awal', 'Tgl Akhir', 'Durasi', 'Status', 'Bukti'],
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
    keys: ['no', 'semester', 'kode_mk', 'nama_mk', 'mk_kompetensi', 'sks_kuliah', 'sks_seminar', 'sks_praktikum', 'dok_rps', 'unit_penyelenggara'],
    columnLabels: ['No.', 'Semester', 'Kode MK', 'Nama MK', 'Kompetensi', 'SKS Kuliah', 'SKS Seminar', 'SKS Praktikum', 'RPS', 'Unit'],
    columns: [
      { data: 0, type: 'numeric' },
      { data: 1, type: 'text' },
      { data: 2, type: 'text' },
      { data: 3, type: 'text' },
      { data: 4, type: 'text' },
      { data: 5, type: 'numeric' },
      { data: 6, type: 'numeric' },
      { data: 7, type: 'numeric' },
      { data: 8, type: 'text' },
      { data: 9, type: 'text' },
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
