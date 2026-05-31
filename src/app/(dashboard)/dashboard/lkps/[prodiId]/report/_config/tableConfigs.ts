export interface TableConfig {
  title: string
  startRow: number
  startCol: number
  columns: any[]
  nestedHeaders?: any[][]
  keys?: string[]
  columnLabels?: string[]
}

export const tableConfigs: Record<string, TableConfig> = {
  '1': {
    title: 'Visi Misi Tujuan Strategi Perguruan Tinggi dan UPPS serta Visi Keilmuan Program Studi',
    startRow: 5,
    startCol: 2,
    keys: ["no","jenis_vmts","pernyataan","no_sk","link_dokumen"],
    columnLabels: ["No.","Jenis VMTS","Pernyataan","No. SK","Link Dokumen"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "textarea"
      },
      {
        "data": 3,
        "type": "text"
      },
      {
        "data": 4,
        "type": "text"
      }
    ],
  },
  'PS': {
    title: 'Daftar Program Studi di UPPS',
    startRow: 11,
    startCol: 2,
    keys: ["no","jenis_program","nama_prodi","status_akreditasi","no_sk","tgl_kedaluwarsa","jumlah_mahasiswa"],
    columnLabels: ["No","Jenis Program","Nama Program Studi","Status Akreditasi","No. SK","Tgl. Kedaluwarsa","Jumlah Mahasiswa"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "text"
      },
      {
        "data": 3,
        "type": "dropdown",
        "source": [
          "Terakreditasi Unggul",
          "Terakreditasi A",
          "Terakreditasi Baik Sekali",
          "Terakreditasi B",
          "Terakreditasi Baik",
          "Terakreditasi C",
          "Terakreditasi Minimum",
          "Tidak Terakreditasi"
        ]
      },
      {
        "data": 4,
        "type": "text"
      },
      {
        "data": 5,
        "type": "intl-date"
      },
      {
        "data": 6,
        "type": "numeric"
      }
    ],
  },
  'PSPPI': {
    title: 'Disiplin Teknik Keinsinyuran (PSPPI)',
    startRow: 6,
    startCol: 2,
    keys: ["no","disiplin","penyelenggaraan_ya","penyelenggaraan_tidak"],
    columnLabels: ["No","Disiplin","Ya","Tidak"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "checkbox"
      },
      {
        "data": 3,
        "type": "checkbox"
      }
    ],
  },
  '2a1': {
    title: 'Kerjasama Pendidikan',
    startRow: 12,
    startCol: 2,
    keys: ["no","lembaga_mitra","tingkat_internasional","tingkat_nasional","tingkat_lokal","judul_kerjasama","manfaat","tgl_awal","tgl_akhir","durasi","status_kerjasama","bukti_kerjasama"],
    columnLabels: ["No.","Lembaga Mitra","Tingkat: Internasional","Tingkat: Nasional","Tingkat: Lokal/Wilayah","Judul Kegiatan Kerjasama","Manfaat bagi PS","Tanggal Awal (HH/BB/TTTT)","Tanggal Akhir (HH/BB/TTTT)","Durasi (tahun)","Status Kerjasama","Bukti Kerjasama"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "checkbox"
      },
      {
        "data": 3,
        "type": "checkbox"
      },
      {
        "data": 4,
        "type": "checkbox"
      },
      {
        "data": 5,
        "type": "text"
      },
      {
        "data": 6,
        "type": "textarea"
      },
      {
        "data": 7,
        "type": "intl-date"
      },
      {
        "data": 8,
        "type": "intl-date"
      },
      {
        "data": 9,
        "type": "numeric"
      },
      {
        "data": 10,
        "type": "text"
      },
      {
        "data": 11,
        "type": "text"
      }
    ],
  },
  '2a2': {
    title: 'Kerjasama Penelitian',
    startRow: 12,
    startCol: 2,
    keys: ["no","lembaga_mitra","tingkat_internasional","tingkat_nasional","tingkat_lokal","judul_kerjasama","manfaat","tgl_awal","tgl_akhir","durasi","status_kerjasama","bukti_kerjasama"],
    columnLabels: ["No.","Lembaga Mitra","Tingkat: Internasional","Tingkat: Nasional","Tingkat: Lokal/Wilayah","Judul Kegiatan Kerjasama","Manfaat bagi PS","Tanggal Awal (HH/BB/TTTT)","Tanggal Akhir (HH/BB/TTTT)","Durasi (tahun)","Status Kerjasama","Bukti Kerjasama"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "checkbox"
      },
      {
        "data": 3,
        "type": "checkbox"
      },
      {
        "data": 4,
        "type": "checkbox"
      },
      {
        "data": 5,
        "type": "text"
      },
      {
        "data": 6,
        "type": "textarea"
      },
      {
        "data": 7,
        "type": "intl-date"
      },
      {
        "data": 8,
        "type": "intl-date"
      },
      {
        "data": 9,
        "type": "numeric"
      },
      {
        "data": 10,
        "type": "text"
      },
      {
        "data": 11,
        "type": "text"
      }
    ],
  },
  '2a3': {
    title: 'Kerjasama Pengabdian Masyarakat',
    startRow: 12,
    startCol: 2,
    keys: ["no","lembaga_mitra","tingkat_internasional","tingkat_nasional","tingkat_lokal","judul_kerjasama","manfaat","tgl_awal","tgl_akhir","durasi","status_kerjasama","bukti_kerjasama"],
    columnLabels: ["No.","Lembaga Mitra","Tingkat: Internasional","Tingkat: Nasional","Tingkat: Lokal/Wilayah","Judul Kegiatan Kerjasama","Manfaat bagi PS","Tanggal Awal (HH/BB/TTTT)","Tanggal Akhir (HH/BB/TTTT)","Durasi (tahun)","Status Kerjasama","Bukti Kerjasama"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "checkbox"
      },
      {
        "data": 3,
        "type": "checkbox"
      },
      {
        "data": 4,
        "type": "checkbox"
      },
      {
        "data": 5,
        "type": "text"
      },
      {
        "data": 6,
        "type": "textarea"
      },
      {
        "data": 7,
        "type": "intl-date"
      },
      {
        "data": 8,
        "type": "intl-date"
      },
      {
        "data": 9,
        "type": "numeric"
      },
      {
        "data": 10,
        "type": "text"
      },
      {
        "data": 11,
        "type": "text"
      }
    ],
  },
  '2b': {
    title: 'Penggunaan Dana',
    startRow: 6,
    startCol: 2,
    keys: ["no","jenis_penggunaan","upps_ts_minus2","upps_ts_minus1","upps_ts","upps_rata","ps_ts_minus2","ps_ts_minus1","ps_ts","ps_rata"],
    columnLabels: ["No.","Jenis Penggunaan","UPPS TS-2","UPPS TS-1","UPPS TS","UPPS Rata-rata","PS TS-2","PS TS-1","PS TS","PS Rata-rata"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "numeric"
      },
      {
        "data": 3,
        "type": "numeric"
      },
      {
        "data": 4,
        "type": "numeric"
      },
      {
        "data": 5,
        "type": "numeric"
      },
      {
        "data": 6,
        "type": "numeric"
      },
      {
        "data": 7,
        "type": "numeric"
      },
      {
        "data": 8,
        "type": "numeric"
      },
      {
        "data": 9,
        "type": "numeric"
      }
    ],
  },
  '3a1': {
    title: 'Kurikulum dan Rencana Pembelajaran',
    startRow: 9,
    startCol: 2,
    keys: ["no","semester","kode_mk","nama_mk","mk_kompetensi","sks_kuliah","sks_seminar","sks_praktikum","dok_rps","unit_penyelenggara"],
    columnLabels: ["No.","Semester","Kode MK","Nama MK","Kompetensi","SKS Kuliah","SKS Seminar","SKS Praktikum","RPS","Unit"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "numeric"
      },
      {
        "data": 2,
        "type": "text"
      },
      {
        "data": 3,
        "type": "text"
      },
      {
        "data": 4,
        "type": "text"
      },
      {
        "data": 5,
        "type": "numeric"
      },
      {
        "data": 6,
        "type": "numeric"
      },
      {
        "data": 7,
        "type": "numeric"
      },
      {
        "data": 8,
        "type": "text"
      },
      {
        "data": 9,
        "type": "dropdown",
        "source": [
          "Universitas",
          "Fakultas",
          "Prodi"
        ]
      }
    ],
  },
  '3a2': {
    title: 'Mata Kuliah Pembelajaran (PSPPI)',
    startRow: 9,
    startCol: 2,
    keys: ["no","mata_kuliah","bobot_sks","konversi_teori","konversi_praktik","kelengkapan_rps"],
    columnLabels: ["No.","Mata Kuliah","Bobot SKS","Jam Teori","Jam Praktik","RPS"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "numeric"
      },
      {
        "data": 3,
        "type": "numeric"
      },
      {
        "data": 4,
        "type": "numeric"
      },
      {
        "data": 5,
        "type": "dropdown",
        "source": [
          "Ada",
          "Tidak Ada"
        ]
      }
    ],
  },
  '3a3': {
    title: 'Integrasi Penelitian/PkM dalam Pembelajaran',
    startRow: 12,
    startCol: 2,
    keys: ["no","nama_dosen","judul_penelitian_pkm","mata_kuliah","bentuk_integrasi","tahun_ts_minus2","tahun_ts_minus1","tahun_ts","kesesuaian_roadmap","bukti_sahih","kesesuaian_rps"],
    columnLabels: ["No.","Nama Dosen","Judul","MK","Bentuk","TS-2","TS-1","TS","Sesuai Roadmap","Bukti","Kesesuaian RPS"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "text"
      },
      {
        "data": 3,
        "type": "text"
      },
      {
        "data": 4,
        "type": "dropdown",
        "source": [
          "Materi",
          "Studi Kasus",
          "Bab",
          "Ajar",
          "Lain"
        ]
      },
      {
        "data": 5,
        "type": "numeric"
      },
      {
        "data": 6,
        "type": "numeric"
      },
      {
        "data": 7,
        "type": "numeric"
      },
      {
        "data": 8,
        "type": "dropdown",
        "source": [
          "Sesuai",
          "Tidak"
        ]
      },
      {
        "data": 9,
        "type": "dropdown",
        "source": [
          "Hibah",
          "Laporan",
          "Publikasi",
          "Lain"
        ]
      },
      {
        "data": 10,
        "type": "text"
      }
    ],
  },
  '3a4': {
    title: 'Basic Science dan Matematika',
    startRow: 7,
    startCol: 2,
    keys: ["no","nama_mk","semester","jumlah_sks"],
    columnLabels: ["No","Nama MK","Semester","SKS"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "numeric"
      },
      {
        "data": 3,
        "type": "numeric"
      }
    ],
  },
  '3a5': {
    title: 'Capstone Design',
    startRow: 7,
    startCol: 2,
    keys: ["no","mk_pendukung","sks_pendukung","mk_capstone","sks_capstone","semester","cakupan_bahasan"],
    columnLabels: ["No","MK Pendukung","SKS Pendukung","MK Capstone","SKS Capstone","Semester","Cakupan"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "numeric"
      },
      {
        "data": 3,
        "type": "text"
      },
      {
        "data": 4,
        "type": "numeric"
      },
      {
        "data": 5,
        "type": "numeric"
      },
      {
        "data": 6,
        "type": "textarea"
      }
    ],
  },
  '3b': {
    title: 'Penelitian DTPS',
    startRow: 7,
    startCol: 2,
    keys: ["no","sumber_pembiayaan","jumlah_ts_minus2","jumlah_ts_minus1","jumlah_ts","jumlah_total"],
    columnLabels: ["No.","Sumber","TS-2","TS-1","TS","Total"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "numeric"
      },
      {
        "data": 3,
        "type": "numeric"
      },
      {
        "data": 4,
        "type": "numeric"
      },
      {
        "data": 5,
        "type": "numeric"
      }
    ],
  },
  '3c': {
    title: 'PkM DTPS',
    startRow: 7,
    startCol: 2,
    keys: ["no","sumber_pembiayaan","jumlah_ts_minus2","jumlah_ts_minus1","jumlah_ts","jumlah_total"],
    columnLabels: ["No.","Sumber","TS-2","TS-1","TS","Total"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "numeric"
      },
      {
        "data": 3,
        "type": "numeric"
      },
      {
        "data": 4,
        "type": "numeric"
      },
      {
        "data": 5,
        "type": "numeric"
      }
    ],
  },
  '4a': {
    title: 'Profil Dosen',
    startRow: 11,
    startCol: 2,
    keys: ["no","nama_dosen","nidn","kategori_dosen","prodi_s1","prodi_s2","prodi_s3","bidang_keahlian","jabatan_akademik","mk_diampu_ps"],
    columnLabels: ["No.","Nama Dosen","NIDN","Kategori","S1","S2","S3","Keahlian","Jabatan","MK Diampu"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "text"
      },
      {
        "data": 3,
        "type": "dropdown",
        "source": [
          "Tetap",
          "Tidak Tetap",
          "Industri"
        ]
      },
      {
        "data": 4,
        "type": "text"
      },
      {
        "data": 5,
        "type": "text"
      },
      {
        "data": 6,
        "type": "text"
      },
      {
        "data": 7,
        "type": "text"
      },
      {
        "data": 8,
        "type": "dropdown",
        "source": [
          "Pengajar",
          "Asisten Ahli",
          "Lektor",
          "Lektor Kepala",
          "Guru Besar"
        ]
      },
      {
        "data": 9,
        "type": "text"
      }
    ],
  },
  '4b': {
    title: 'Tenaga Kependidikan',
    startRow: 9,
    startCol: 2,
    keys: ["no","nama","pendidikan_s3","pendidikan_s2","pendidikan_s1","pendidikan_d4","pendidikan_d3","sertifikat_kompetensi","unit_kerja"],
    columnLabels: ["No","Nama","S3","S2","S1","D4","D3","Sertifikat","Unit"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "checkbox"
      },
      {
        "data": 3,
        "type": "checkbox"
      },
      {
        "data": 4,
        "type": "checkbox"
      },
      {
        "data": 5,
        "type": "checkbox"
      },
      {
        "data": 6,
        "type": "checkbox"
      },
      {
        "data": 7,
        "type": "text"
      },
      {
        "data": 8,
        "type": "dropdown",
        "source": [
          "UPPS",
          "PS",
          "Institusi"
        ]
      }
    ],
  },
  '4c': {
    title: 'Beban Kerja Dosen Tetap',
    startRow: 9,
    startCol: 2,
    keys: ["no","nama_dosen","bk_ps_diakreditasi","bk_penelitian","bk_pkm","bk_tugas_tambahan","jumlah_per_tahun","jumlah_per_semester"],
    columnLabels: ["No.","Nama","BK PS (sks)","BK Penelitian (sks)","BK PkM (sks)","BK Lain (sks)","Total/Tahun","Total/Semester"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "numeric"
      },
      {
        "data": 3,
        "type": "numeric"
      },
      {
        "data": 4,
        "type": "numeric"
      },
      {
        "data": 5,
        "type": "numeric"
      },
      {
        "data": 6,
        "type": "numeric"
      },
      {
        "data": 7,
        "type": "numeric"
      }
    ],
  },
  '4d': {
    title: 'Publikasi Ilmiah DTPS',
    startRow: 6,
    startCol: 2,
    keys: ["no","jenis_publikasi","jumlah_ts_minus2","jumlah_ts_minus1","jumlah_ts","jumlah_total"],
    columnLabels: ["No.","Jenis","TS-2","TS-1","TS","Total"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "numeric"
      },
      {
        "data": 3,
        "type": "numeric"
      },
      {
        "data": 4,
        "type": "numeric"
      },
      {
        "data": 5,
        "type": "numeric"
      }
    ],
  },
  '4e': {
    title: 'Publikasi DTPS (Vokasi)',
    startRow: 6,
    startCol: 2,
    keys: ["no","jenis_publikasi","jumlah_ts_minus2","jumlah_ts_minus1","jumlah_ts","jumlah_total"],
    columnLabels: ["No.","Jenis","TS-2","TS-1","TS","Total"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "numeric"
      },
      {
        "data": 3,
        "type": "numeric"
      },
      {
        "data": 4,
        "type": "numeric"
      },
      {
        "data": 5,
        "type": "numeric"
      }
    ],
  },
  '4f-1': {
    title: 'HKI Paten',
    startRow: 6,
    startCol: 2,
    keys: ["no","judul_luaran","tanggal","nomor_paten"],
    columnLabels: ["No","Judul","Tanggal","Nomor"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "intl-date"
      },
      {
        "data": 3,
        "type": "text"
      }
    ],
  },
  '4f-2': {
    title: 'HKI Hak Cipta',
    startRow: 6,
    startCol: 2,
    keys: ["no","judul_luaran","tanggal","keterangan"],
    columnLabels: ["No","Judul","Tanggal","Keterangan"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "intl-date"
      },
      {
        "data": 3,
        "type": "text"
      }
    ],
  },
  '4f-3': {
    title: 'TTG',
    startRow: 14,
    startCol: 2,
    keys: ["no","judul_luaran","tanggal","tkt","keterangan"],
    columnLabels: ["No","Judul","Tanggal","TKT","Ket"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "intl-date"
      },
      {
        "data": 3,
        "type": "dropdown",
        "source": [
          "TKT 1",
          "TKT 2",
          "TKT 3",
          "TKT 4",
          "TKT 5",
          "TKT 6",
          "TKT 7",
          "TKT 8",
          "TKT 9"
        ]
      },
      {
        "data": 4,
        "type": "text"
      }
    ],
  },
  '4f-4': {
    title: 'Buku ISBN',
    startRow: 6,
    startCol: 2,
    keys: ["no","judul_luaran","tanggal","nomor_isbn"],
    columnLabels: ["No","Judul","Tanggal","ISBN"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "intl-date"
      },
      {
        "data": 3,
        "type": "text"
      }
    ],
  },
  '4g': {
    title: 'Produk/Jasa DTPS',
    startRow: 5,
    startCol: 2,
    keys: ["no","nama_dtps","nama_produk_jasa","deskripsi","bukti"],
    columnLabels: ["No.","Nama DTPS","Produk/Jasa","Deskripsi","Bukti"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "text"
      },
      {
        "data": 3,
        "type": "textarea"
      },
      {
        "data": 4,
        "type": "text"
      }
    ],
  },
  '4h': {
    title: 'Kinerja DTPS',
    startRow: 13,
    startCol: 2,
    keys: ["no","nama_dtps","bentuk_kegiatan","nama_mitra","judul_kegiatan","tahun","bukti"],
    columnLabels: ["No.","Nama DTPS","Kegiatan","Mitra","Judul","Tahun","Bukti"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "dropdown",
        "source": [
          "Pertukaran",
          "Magang",
          "Penelitian",
          "KKN",
          "Proyek",
          "Asistensi",
          "Kemanusiaan",
          "Wirausaha"
        ]
      },
      {
        "data": 3,
        "type": "text"
      },
      {
        "data": 4,
        "type": "text"
      },
      {
        "data": 5,
        "type": "numeric"
      },
      {
        "data": 6,
        "type": "text"
      }
    ],
  },
  '4i': {
    title: 'Karya Ilmiah Disitasi',
    startRow: 5,
    startCol: 2,
    keys: ["no","nama_dtps","judul_artikel","jumlah_sitasi"],
    columnLabels: ["No.","Nama DTPS","Judul","Sitasi"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "textarea"
      },
      {
        "data": 3,
        "type": "numeric"
      }
    ],
  },
  '4j': {
    title: 'Pengakuan DTPS',
    startRow: 11,
    startCol: 2,
    keys: ["no","nama_dtps","bidang_keahlian","rekognisi","bukti_pendukung","tingkat_wilayah","tingkat_nasional","tingkat_internasional","tahun"],
    columnLabels: ["No.","Nama DTPS","Bidang","Rekognisi","Bukti","Wilayah","Nasional","Intl","Tahun"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "text"
      },
      {
        "data": 3,
        "type": "dropdown",
        "source": [
          "Visiting Lecturer",
          "Keynote",
          "Editor",
          "Narasumber",
          "Penghargaan"
        ]
      },
      {
        "data": 4,
        "type": "text"
      },
      {
        "data": 5,
        "type": "checkbox"
      },
      {
        "data": 6,
        "type": "checkbox"
      },
      {
        "data": 7,
        "type": "checkbox"
      },
      {
        "data": 8,
        "type": "numeric"
      }
    ],
  },
  '4k': {
    title: 'Pembimbing Lapangan (PSPPI)',
    startRow: 6,
    startCol: 2,
    keys: ["no","nama","industri","bidang_keinsinyuran","pengalaman_kerja","pendidikan","nomor_sip","tgl_berakhir_sip","jumlah_bimbingan"],
    columnLabels: ["No","Nama","Industri","Bidang","Pengalaman (tahun)","Pendidikan","Nomor SIP","Tgl Berakhir","Jumlah Bimbingan"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "text"
      },
      {
        "data": 3,
        "type": "text"
      },
      {
        "data": 4,
        "type": "numeric"
      },
      {
        "data": 5,
        "type": "text"
      },
      {
        "data": 6,
        "type": "text"
      },
      {
        "data": 7,
        "type": "intl-date"
      },
      {
        "data": 8,
        "type": "numeric"
      }
    ],
  },
  '5a': {
    title: 'Prasarana dan Peralatan',
    startRow: 9,
    startCol: 2,
    keys: ["no","nama_prasarana","jumlah_prasarana","nama_sarana","jumlah_alat_standar","jumlah_alat_dimiliki","kepemilikan_sendiri","kondisi_terawat","waktu_penggunaan"],
    columnLabels: ["No","Prasarana","Jumlah","Sarana/Alat","Standar","Dimiliki","Sendiri","Terawat","Waktu Pakai (jam/minggu)"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "numeric"
      },
      {
        "data": 3,
        "type": "text"
      },
      {
        "data": 4,
        "type": "numeric"
      },
      {
        "data": 5,
        "type": "numeric"
      },
      {
        "data": 6,
        "type": "checkbox"
      },
      {
        "data": 7,
        "type": "checkbox"
      },
      {
        "data": 8,
        "type": "numeric"
      }
    ],
  },
  '5b': {
    title: 'Dokumen K3L',
    startRow: 4,
    startCol: 2,
    keys: ["no","nama_dokumen","ada","link_dokumen"],
    columnLabels: ["No.","Dokumen","Ada","Link"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "checkbox"
      },
      {
        "data": 3,
        "type": "text"
      }
    ],
  },
  '5c': {
    title: 'Fasilitas K3L',
    startRow: 4,
    startCol: 2,
    keys: ["no","nama_fasilitas","jumlah","kondisi_baik","keterangan"],
    columnLabels: ["No.","Fasilitas","Jumlah","Baik","Ket"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "numeric"
      },
      {
        "data": 3,
        "type": "checkbox"
      },
      {
        "data": 4,
        "type": "text"
      }
    ],
  },
  '6a': {
    title: 'Jumlah Mahasiswa',
    startRow: 6,
    startCol: 2,
    keys: ["no","program_studi","aktif_ts_minus2","aktif_ts_minus1","aktif_ts","asing_ft_ts_minus2","asing_ft_ts_minus1","asing_ft_ts","asing_pt_ts_minus2","asing_pt_ts_minus1","asing_pt_ts"],
    columnLabels: ["No.","Program Studi","Aktif TS-2","Aktif TS-1","Aktif TS","Asing FT TS-2","Asing FT TS-1","Asing FT TS","Asing PT TS-2","Asing PT TS-1","Asing PT TS"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "numeric"
      },
      {
        "data": 3,
        "type": "numeric"
      },
      {
        "data": 4,
        "type": "numeric"
      },
      {
        "data": 5,
        "type": "numeric"
      },
      {
        "data": 6,
        "type": "numeric"
      },
      {
        "data": 7,
        "type": "numeric"
      },
      {
        "data": 8,
        "type": "numeric"
      },
      {
        "data": 9,
        "type": "numeric"
      },
      {
        "data": 10,
        "type": "numeric"
      }
    ],
  },
  '6b': {
    title: 'IPK Lulusan',
    startRow: 6,
    startCol: 2,
    keys: ["no","tahun_lulus","jumlah_lulusan","ipk_min","ipk_rata","ipk_maks"],
    columnLabels: ["No.","Tahun","Jumlah","IPK Min","IPK Rata-rata","IPK Maks"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "numeric"
      },
      {
        "data": 3,
        "type": "numeric"
      },
      {
        "data": 4,
        "type": "numeric"
      },
      {
        "data": 5,
        "type": "numeric"
      }
    ],
  },
  '6c1': {
    title: 'Prestasi Akademik',
    startRow: 8,
    startCol: 2,
    keys: ["no","nama_kegiatan","waktu_perolehan","tingkat_lokal","tingkat_nasional","tingkat_internasional","prestasi"],
    columnLabels: ["No.","Kegiatan","Tanggal","Lokal","Nasional","Intl","Prestasi"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "intl-date"
      },
      {
        "data": 3,
        "type": "checkbox"
      },
      {
        "data": 4,
        "type": "checkbox"
      },
      {
        "data": 5,
        "type": "checkbox"
      },
      {
        "data": 6,
        "type": "text"
      }
    ],
  },
  '6c2': {
    title: 'Prestasi Non-akademik',
    startRow: 8,
    startCol: 2,
    keys: ["no","nama_kegiatan","waktu_perolehan","tingkat_lokal","tingkat_nasional","tingkat_internasional","prestasi"],
    columnLabels: ["No.","Kegiatan","Tanggal","Lokal","Nasional","Intl","Prestasi"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "intl-date"
      },
      {
        "data": 3,
        "type": "checkbox"
      },
      {
        "data": 4,
        "type": "checkbox"
      },
      {
        "data": 5,
        "type": "checkbox"
      },
      {
        "data": 6,
        "type": "text"
      }
    ],
  },
  '6d': {
    title: 'Masa Studi Lulusan',
    startRow: 4,
    startCol: 2,
    keys: ["tahun_masuk","jumlah_masuk","lulus_normal","lulus_lebih","lulus_kurang"],
    columnLabels: ["Tahun Masuk","Masuk","Lulus Normal","Lulus Lebih","Lulus Kurang"],
    columns: [
      {
        "data": 0,
        "type": "text"
      },
      {
        "data": 1,
        "type": "numeric"
      },
      {
        "data": 2,
        "type": "numeric"
      },
      {
        "data": 3,
        "type": "numeric"
      },
      {
        "data": 4,
        "type": "numeric"
      }
    ],
  },
  '6e1': {
    title: 'Publikasi Mahasiswa',
    startRow: 6,
    startCol: 2,
    keys: ["no","jenis_publikasi","jumlah_ts_minus2","jumlah_ts_minus1","jumlah_ts","jumlah_total"],
    columnLabels: ["No.","Jenis","TS-2","TS-1","TS","Total"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "numeric"
      },
      {
        "data": 3,
        "type": "numeric"
      },
      {
        "data": 4,
        "type": "numeric"
      },
      {
        "data": 5,
        "type": "numeric"
      }
    ],
  },
  '6e2': {
    title: 'Publikasi Mahasiswa (Vokasi)',
    startRow: 6,
    startCol: 2,
    keys: ["no","jenis_publikasi","jumlah_ts_minus2","jumlah_ts_minus1","jumlah_ts","jumlah_total"],
    columnLabels: ["No.","Jenis","TS-2","TS-1","TS","Total"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "numeric"
      },
      {
        "data": 3,
        "type": "numeric"
      },
      {
        "data": 4,
        "type": "numeric"
      },
      {
        "data": 5,
        "type": "numeric"
      }
    ],
  },
  '6e3-1': {
    title: 'HKI Mahasiswa Paten',
    startRow: 6,
    startCol: 2,
    keys: ["no","judul_luaran","tanggal","status","nomor_registrasi"],
    columnLabels: ["No","Judul","Tanggal","Status","Nomor"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "intl-date"
      },
      {
        "data": 3,
        "type": "dropdown",
        "source": [
          "Registered",
          "Granted",
          "Komersial"
        ]
      },
      {
        "data": 4,
        "type": "text"
      }
    ],
  },
  '6e3-2': {
    title: 'HKI Mahasiswa Hak Cipta',
    startRow: 6,
    startCol: 2,
    keys: ["no","judul_luaran","tanggal","nomor_hki"],
    columnLabels: ["No","Judul","Tanggal","Nomor HKI"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "intl-date"
      },
      {
        "data": 3,
        "type": "text"
      }
    ],
  },
  '6e3-3': {
    title: 'TTG Mahasiswa',
    startRow: 6,
    startCol: 2,
    keys: ["no","judul_luaran","tanggal","tkt","keterangan"],
    columnLabels: ["No","Judul","Tanggal","TKT","Ket"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "intl-date"
      },
      {
        "data": 3,
        "type": "dropdown",
        "source": [
          "TKT 1",
          "TKT 2",
          "TKT 3",
          "TKT 4",
          "TKT 5",
          "TKT 6",
          "TKT 7",
          "TKT 8",
          "TKT 9"
        ]
      },
      {
        "data": 4,
        "type": "text"
      }
    ],
  },
  '6e3-4': {
    title: 'Buku ISBN Mahasiswa',
    startRow: 6,
    startCol: 2,
    keys: ["no","judul_luaran","tanggal","nomor_isbn"],
    columnLabels: ["No","Judul","Tanggal","ISBN"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "intl-date"
      },
      {
        "data": 3,
        "type": "text"
      }
    ],
  },
  '6e4': {
    title: 'Produk/Jasa Mahasiswa',
    startRow: 5,
    startCol: 2,
    keys: ["no","nama_mahasiswa","nama_produk_jasa","deskripsi","bukti"],
    columnLabels: ["No.","Mahasiswa","Produk/Jasa","Deskripsi","Bukti"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "text"
      },
      {
        "data": 3,
        "type": "textarea"
      },
      {
        "data": 4,
        "type": "text"
      }
    ],
  },
  '6f1': {
    title: 'Waktu Tunggu Lulusan',
    startRow: 6,
    startCol: 2,
    keys: ["tahun_lulus","jumlah_lulusan","jumlah_terlacak","dipesan_sebelum_lulus","wt_kurang3","wt_3_6","wt_lebih6"],
    columnLabels: ["Tahun","Jumlah Lulus","Terlacak","Dipesan","WT < 3 bln","WT 3-6 bln","WT > 6 bln"],
    columns: [
      {
        "data": 0,
        "type": "text"
      },
      {
        "data": 1,
        "type": "numeric"
      },
      {
        "data": 2,
        "type": "numeric"
      },
      {
        "data": 3,
        "type": "numeric"
      },
      {
        "data": 4,
        "type": "numeric"
      },
      {
        "data": 5,
        "type": "numeric"
      },
      {
        "data": 6,
        "type": "numeric"
      }
    ],
  },
  '6f2': {
    title: 'Kesesuaian Bidang Kerja',
    startRow: 6,
    startCol: 2,
    keys: ["tahun_lulus","jumlah_lulusan","jumlah_terlacak","kesesuaian_rendah","kesesuaian_sedang","kesesuaian_tinggi"],
    columnLabels: ["Tahun","Jumlah","Terlacak","Rendah","Sedang","Tinggi"],
    columns: [
      {
        "data": 0,
        "type": "text"
      },
      {
        "data": 1,
        "type": "numeric"
      },
      {
        "data": 2,
        "type": "numeric"
      },
      {
        "data": 3,
        "type": "numeric"
      },
      {
        "data": 4,
        "type": "numeric"
      },
      {
        "data": 5,
        "type": "numeric"
      }
    ],
  },
  '6g1': {
    title: 'Tempat Kerja Lulusan',
    startRow: 6,
    startCol: 2,
    keys: ["tahun_lulus","jumlah_lulusan","pengguna_memberi_tanggapan","jumlah_terlacak","tempat_lokal","tempat_nasional","tempat_multinasional"],
    columnLabels: ["Tahun","Jumlah","Pengguna Respons","Terlacak","Lokal","Nasional","Multinasional"],
    columns: [
      {
        "data": 0,
        "type": "text"
      },
      {
        "data": 1,
        "type": "numeric"
      },
      {
        "data": 2,
        "type": "numeric"
      },
      {
        "data": 3,
        "type": "numeric"
      },
      {
        "data": 4,
        "type": "numeric"
      },
      {
        "data": 5,
        "type": "numeric"
      },
      {
        "data": 6,
        "type": "numeric"
      }
    ],
  },
  '6g2': {
    title: 'Kepuasan Pengguna',
    startRow: 6,
    startCol: 2,
    keys: ["no","jenis_kemampuan","sangat_baik","baik","cukup","kurang","rencana_tindak_lanjut"],
    columnLabels: ["No","Kemampuan","Sangat Baik %","Baik %","Cukup %","Kurang %","Rencana Tindak Lanjut"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "numeric"
      },
      {
        "data": 3,
        "type": "numeric"
      },
      {
        "data": 4,
        "type": "numeric"
      },
      {
        "data": 5,
        "type": "numeric"
      },
      {
        "data": 6,
        "type": "textarea"
      }
    ],
  },
  '6h1': {
    title: 'Penelitian DTPS + Mahasiswa',
    startRow: 9,
    startCol: 2,
    keys: ["no","nama_dosen","tema_penelitian","nama_mahasiswa","judul_kegiatan","tahun"],
    columnLabels: ["No.","Dosen","Tema","Mahasiswa","Judul","Tahun"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "text"
      },
      {
        "data": 3,
        "type": "text"
      },
      {
        "data": 4,
        "type": "text"
      },
      {
        "data": 5,
        "type": "numeric"
      }
    ],
  },
  '6h2': {
    title: 'Penelitian Rujukan Tesis',
    startRow: 5,
    startCol: 2,
    keys: ["no","nama_dosen","tema_penelitian","nama_mahasiswa","judul_tesis_disertasi","tahun"],
    columnLabels: ["No.","Dosen","Tema","Mahasiswa","Tesis/Disertasi","Tahun"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "text"
      },
      {
        "data": 3,
        "type": "text"
      },
      {
        "data": 4,
        "type": "text"
      },
      {
        "data": 5,
        "type": "numeric"
      }
    ],
  },
  '6i': {
    title: 'PkM DTPS + Mahasiswa',
    startRow: 5,
    startCol: 2,
    keys: ["no","nama_dosen","tema_pkm","nama_mahasiswa","judul_pkm","tahun"],
    columnLabels: ["No.","Dosen","Tema","Mahasiswa","Judul","Tahun"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "text"
      },
      {
        "data": 3,
        "type": "text"
      },
      {
        "data": 4,
        "type": "text"
      },
      {
        "data": 5,
        "type": "numeric"
      }
    ],
  },
  '7a': {
    title: 'Dokumen SPMI',
    startRow: 4,
    startCol: 2,
    keys: ["no","jenis_dokumen","no_dokumen","tanggal_dokumen"],
    columnLabels: ["No.","Dokumen","No Dokumen","Tanggal"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "text"
      },
      {
        "data": 3,
        "type": "intl-date"
      }
    ],
  },
  '7b': {
    title: 'Pelaksanaan SPMI',
    startRow: 4,
    startCol: 2,
    keys: ["no","dokumen","link_dokumen","link_hasil_audit","link_rtm","link_peningkatan"],
    columnLabels: ["No.","Dokumen","Link","Audit","RTM","Peningkatan"],
    columns: [
      {
        "data": 0,
        "type": "numeric"
      },
      {
        "data": 1,
        "type": "text"
      },
      {
        "data": 2,
        "type": "text"
      },
      {
        "data": 3,
        "type": "text"
      },
      {
        "data": 4,
        "type": "text"
      },
      {
        "data": 5,
        "type": "text"
      }
    ],
  },
};

export const getTableConfig = (sheetName: string, format?: string): TableConfig => {
  return tableConfigs[sheetName] || {
    title: `Tabel ${sheetName}`, startRow: 10, startCol: 2,
    columns: [], // Return empty columns so export fallback to Object.keys works
  }
}
