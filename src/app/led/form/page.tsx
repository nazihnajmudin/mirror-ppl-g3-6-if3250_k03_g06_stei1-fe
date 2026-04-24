"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import {Bold, Italic, List, ListOrdered, Table as TableIcon, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Save, CheckCircle2, Clock, ArrowLeft, FileText, ChevronDown, ChevronRight} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api-client";

const LED_CRITERIA = [
  { id: "c1", code: "C.1", name: "Diferensiasi Misi",      fullName: "Visi, Misi, Tujuan, dan Strategi" },
  { id: "c2", code: "C.2", name: "Akuntabilitas",          fullName: "Tata Pamong, Tata Kelola, dan Kerja Sama" },
  { id: "c3", code: "C.3", name: "Relevansi",              fullName: "Relevansi Pendidikan, Penelitian, dan PkM" },
  { id: "c4", code: "C.4", name: "Sumber Daya Manusia",    fullName: "Sumber Daya Manusia" },
  { id: "c5", code: "C.5", name: "Sarana & Prasarana",     fullName: "Sarana, Prasarana, dan K3L" },
  { id: "c6", code: "C.6", name: "Mahasiswa & Luaran",     fullName: "Mahasiswa dan Luaran Mahasiswa" },
  { id: "c7", code: "C.7", name: "Penjaminan Mutu",        fullName: "Sistem Penjaminan Mutu" },
];

const SUBSECTIONS = [
  { id: "latar_belakang", label: "1. Latar Belakang" },
  { id: "kebijakan",      label: "2. Kebijakan" },
  { id: "iku",            label: "3. Indikator Kinerja Utama" },
  { id: "analisis",       label: "4. Analisis Faktor" },
  { id: "strategi",       label: "5. Strategi Perbaikan (SWOT)" },
];

const TEMPLATES: Record<string, string> = {
  identitas_pengusul: `<h2>IDENTITAS PENGUSUL</h2>
<p><strong>Perguruan Tinggi</strong> : .........................................................................................</p>
<p><strong>Unit Pengelola Program Studi</strong> : .........................................................................................</p>
<p><strong>Jenis Program</strong> : .........................................................................................</p>
<p><strong>Nama Program Studi</strong> : .........................................................................................</p>
<p><strong>Alamat</strong> : .........................................................................................</p>
<p><strong>Nomor Telepon</strong> : .........................................................................................</p>
<p><strong>E-Mail dan Website</strong> : .........................................................................................</p>
<p><strong>Nomor SK Pendirian PT 1)</strong> : .........................................................................................</p>
<p><strong>Tanggal SK Pendirian PT</strong> : .........................................................................................</p>
<p><strong>Pejabat Penandatangan SK Pendirian PT</strong> : .........................................................................................</p>
<p><strong>Nomor SK Pembukaan PS 2)</strong> : .........................................................................................</p>
<p><strong>Tanggal SK Pembukaan PS</strong> : .........................................................................................</p>
<p><strong>Pejabat Penandatangan SK Pembukaan PS</strong> : .........................................................................................</p>
<p><strong>Tahun Pertama Kali Menerima Mahasiswa</strong> : .........................................................................................</p>
<p><strong>Peringkat Terbaru Akreditasi PS</strong> : .........................................................................................</p>
<p><strong>Nomor SK Akreditasi Terakhir 3)</strong> : .........................................................................................</p>
<p></p>
<p><strong>Daftar Program Studi di Unit Pengelola Program Studi (UPPS)</strong></p>
<table>
  <tr>
    <th>No.</th>
    <th>Jenis Program</th>
    <th>Nama Program Studi</th>
    <th>Status/ Peringkat Akreditasi Program Studi</th>
    <th>No. dan Tgl. SK Akreditasi Program Studi</th>
    <th>Tgl. Kadaluarsa Akreditasi Program Studi</th>
    <th>Jumlah mahasiswa saat TS 4)</th>
  </tr>
  <tr><td>1</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
  <tr><td>2</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
  <tr><td>...</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
  <tr><td><strong>Jumlah</strong></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
</table>
<p>Keterangan:<br>1) Lampirkan salinan Surat Keputusan Pendirian Perguruan Tinggi.<br>2) Lampirkan salinan Surat Keputusan Pembukaan Program Studi.<br>3) Lampirkan salinan Surat Keputusan Akreditasi Program Studi terbaru.<br>4) Diisi dengan jumlah mahasiswa aktif di masing-masing PS saat TS.</p>`,

  identitas_tim: `<h2>IDENTITAS TIM PENYUSUN LAPORAN EVALUASI DIRI PROGRAM STUDI</h2>
<p><strong>Nama</strong> : .........................................................................................</p>
<p><strong>NIDN / NUPTK</strong> : .........................................................................................</p>
<p><strong>Jabatan</strong> : .........................................................................................</p>
<p><strong>Tanggal Pengisian</strong> : DD – MM – YYYY</p>
<p><strong>Tanda Tangan</strong> :</p>
<p>&nbsp;</p>
<p><strong>Nama</strong> : .........................................................................................</p>
<p><strong>NIDN / NUPTK</strong> : .........................................................................................</p>
<p><strong>Jabatan</strong> : .........................................................................................</p>
<p><strong>Tanggal Pengisian</strong> : DD – MM – YYYY</p>
<p><strong>Tanda Tangan</strong> :</p>
<p>&nbsp;</p>
<p><strong>Nama</strong> : .........................................................................................</p>
<p><strong>NIDN / NUPTK</strong> : .........................................................................................</p>
<p><strong>Jabatan</strong> : .........................................................................................</p>
<p><strong>Tanggal Pengisian</strong> : DD – MM – YYYY</p>
<p><strong>Tanda Tangan</strong> :</p>
<p>&nbsp;</p>
<p><strong>Nama</strong> : .........................................................................................</p>
<p><strong>NIDN / NUPTK</strong> : .........................................................................................</p>
<p><strong>Jabatan</strong> : .........................................................................................</p>
<p><strong>Tanggal Pengisian</strong> : DD – MM – YYYY</p>
<p><strong>Tanda Tangan</strong> :</p>`,

  kata_pengantar: `<h2>KATA PENGANTAR</h2>
<p>(Diisi oleh pengusul dari program studi untuk semua program).</p>`,

  ringkasan_eksekutif: `<h2>RINGKASAN EKSEKUTIF</h2>
<p>(Diisi oleh pengusul dari program studi untuk semua program).</p>`,

  bab1: `<h2>BAB I PENDAHULUAN</h2>
<p>(Diisi oleh pengusul dari program studi untuk semua program).</p>`,

  bab2a: `<h2>A. Struktur Tim Penyusun dan Mekanisme Kerja</h2>
<p>Bagian ini berisikan bukti formal tim penyusun LEDPS beserta deskripsi tugasnya, termasuk di dalamnya keterlibatan berbagai unit, para pemangku kepentingan internal (mahasiswa, pimpinan, dosen, dan tenaga kependidikan) dan eksternal (lulusan, pengguna, dan mitra) dalam penyusunan LEDPS. Bagian ini juga, harus memuat mekanisme pengumpulan data dan informasi, verifikasi dan validasi data, pengecekan konsistensi data, analisis data, identifikasi akar masalah dan penetapan strategi pengembangan yang mengacu pada rencana pengembangan UPPS, yang disertai dengan jadwal kerja tim yang jelas.</p>
<p>(Diisi oleh pengusul dari program studi untuk semua program).</p>
<p><strong>Tabel 2.1. Tim Dosen Penyusun LED PS.</strong></p>
<table>
  <tr><th>No.</th><th>Nama Dosen</th><th>NIP / NIDN / NUPTK</th><th>Jabatan / Dosen</th><th>Deskripsi Kerja</th></tr>
  <tr><td>1</td><td></td><td></td><td></td><td></td></tr>
  <tr><td>2</td><td></td><td></td><td></td><td></td></tr>
  <tr><td>…</td><td></td><td></td><td></td><td></td></tr>
</table>
<p><strong>Tabel 2.2. Tim Nondosen Penyusun LED PS</strong></p>
<table>
  <tr><th>No.</th><th>Nama Tenaga Kependidikan</th><th>NIP / NUPTK</th><th>Jabatan / Tenaga kependidikan</th><th>Deskripsi Kerja</th></tr>
  <tr><td>1</td><td></td><td></td><td></td><td></td></tr>
  <tr><td>2</td><td></td><td></td><td></td><td></td></tr>
  <tr><td>…</td><td></td><td></td><td></td><td></td></tr>
</table>`,

  bab2b: `<h2>B. Analisis Lingkungan Eksternal dalam Pengembangan UPPS dan Prodi</h2>
<p>Bagian ini menjelaskan kondisi eksternal program studi yang terdiri atas lingkungan makro dan lingkungan mikro di tingkat nasional dan internasional. Lingkungan makro mencakup aspek-aspek kebijakan eksternal, perkembangan ilmu pengetahuan dan teknologi. Lingkungan mikro mencakup aspek pesaing, pengguna lulusan serta kebutuhan dunia usaha/industri. UPPS perlu menganalisis aspek-aspek dalam lingkungan makro dan lingkungan mikro yang relevan serta dapat mempengaruhi pengembangan UPPS dan program studi yang diakreditasi. UPPS harus mampu mengidentifikasi pengembangan program studi yang bersesuaian untuk menghasilkan program-program pengembangan alternatif yang tepat.</p>
<p>(Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c1_latar_belakang: `<h3><strong>1. Latar Belakang</strong></h3>
<p>Bagian ini menjelaskan latar belakang, tujuan, rasional terkait dengan VMTS UPPS dan visi keilmuan program studi yang diakreditasi dalam mendukung pencapaian jangka panjang yang diturunkan dalam program jangka pendek dan menengah. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c1_kebijakan: `<h3><strong>2. Kebijakan</strong></h3>
<p>Berisi deskripsi dokumen formal kebijakan yang mencakup Peraturan perundang-undangan dan perguruan tinggi serta dokumen untuk mendukung implementasi VMTS ke dalam program pengembangan UPPS dan program studi. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c1_iku: `<h3><strong>3. Indikator Kinerja Utama (IKU)</strong></h3>
<p><strong>a) Kekhasan VMTS</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan Linearitas VMTS PT dengan UPPS dan kekhasan VMTS yang unik dan spesifik sebagai identitas PT, UPPS dan Visi Keilmuan Program Studi sebagai keunggulan kompetitif yang didukung dengan Renstra dan kurikulum yang memadai (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>
<p><strong>b) Mekanisme Penyusunan VMTS</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini mendeskripsikan mekanisme penyusunan VMTS yang melibatkan pemangku kepentingan internal yang terdiri dari dosen, mahasiswa, dan tenaga kependidikan serta pemangku kepentingan eksternal yang terdiri dari alumni, pengguna lulusan, dan pakar. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>
<p><strong>c) Tingkat pemahaman dan pencapaian VMTS</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan sosialisasi VMTS kepada semua pemangku kepentingan serta tingkat pemahaman dan pencapaian VMTS UPPS dan Visi Keilmuan Program Studi serta pencapaian konkret jangka pendek dan jangka menengah yang telah ditetapkan. VMTS UPPS dan Visi Keilmuan Program Studi memberikan dampak, berkelanjutan, dan berorientasi pada masa depan. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c1_analisis: `<h3><strong>4. Analisis Faktor Keberhasilan dan Penghambat</strong></h3>
<p>Berisi deskripsi dan analisis faktor keberhasilan dan/atau penghambat pencapaian VMTS yang telah ditetapkan. Analisis faktor keberhasilan dan penghambat pencapaian VMTS merupakan evaluasi indikator kinerja yang dijadikan acuan untuk memperbaiki atau meningkatkan indikator kinerja utama maupun tambahan. Selain itu, analisis ini mencakup identifikasi faktor pendukung keberhasilan secara rinci, serta penelusuran akar masalah yang menjadi penyebab munculnya hambatan dalam pencapaian VMTS di UPPS. Dengan demikian, hasil analisis ini diharapkan dapat memberikan dasar strategis untuk pengambilan keputusan yang lebih efektif dalam meningkatkan kinerja UPPS. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c1_strategi: `<h3><strong>5. Strategi perbaikan dan pengembangan (Menggunakan Analisis SWOT)</strong></h3>
<p>Berisi evaluasi menyeluruh terhadap faktor internal (kekuatan dan kelemahan), serta faktor eksternal (peluang dan ancaman) yang memberikan gambaran komprehensif mengenai kesiapan, tantangan, serta potensi yang ada. Proses ini bertujuan untuk merancang strategi perbaikan dan pengembangan yang lebih efektif dengan memanfaatkan kekuatan, mengatasi kelemahan, memaksimalkan peluang, dan meminimalkan risiko untuk mencapai VMTS yang telah ditetapkan. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c2_latar_belakang: `<h3><strong>1. Latar Belakang</strong></h3>
<p>Bagian ini menjelaskan latar belakang, tujuan, dan rasional terkait dengan sistem tata pamong dan tata kelola, kerja sama dan keuangan. Deskripsi latar belakang mampu menjelaskan penerapan prinsip tata pamong yang baik, kerja sama yang relevan dan transparansi keuangan. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c2_kebijakan: `<h3><strong>2. Kebijakan</strong></h3>
<p>Bagian ini berisi deskripsi dokumen formal kebijakan pengembangan tata kelola dan tata pamong, kerja sama dan sistem pengelolaan keuangan yang diacu oleh UPPS. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c2_iku: `<h3><strong>3. Indikator Kinerja Utama (IKU)</strong></h3>
<p><strong>a) Tata Pamong dan Tata Kelola</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;I. <strong>Sistem Tata Pamong</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan kelengkapan struktur organisasi dan kebijakan operasional yang berpedoman pada statuta yang digunakan untuk mengatur struktur organisasi dan kebijakan operasional, wewenang dan tugas, pelaksanaan struktur organisasi dan kebijakan operasional aras kewenangan organ pokok. Bagian ini menjelaskan perwujudan Good University Governance mengacu pada sistem tata kelola yang efektif, transparan, dan akuntabel untuk mendukung kualitas akademik, menciptakan lingkungan yang kondusif, dan memaksimalkan dampak positif bagi seluruh pemangku kepentingan internal dan eksternal. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;II. <strong>Komitmen pimpinan dan kemampuan manajerial</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan komitmen pimpinan UPPS terkait dengan: (1) Visi dan Tujuan Strategis, (2) Integritas dan transparansi serta peraturan turunannya yang menyangkut kode etik, (3) Pengembangan sumber daya manusia. Bagian ini menjelaskan kemampuan manajerial pimpinan UPPS dalam kepemimpinan UPPS, pengambilan keputusan, dan manajemen konflik yang memberikan dampak positif bagi organisasi. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>
<br>
<p><strong>b) Kerja sama</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;I. <strong>Relevansi kerja sama</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan relevansi kerja sama pendidikan, penelitian, dan PkM dengan Visi UPPS dan Visi Keilmuan Prodi. Khusus PPI: pendidikan keinsinyuran, penelitian, dan PkM kolaboratif industri. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;II. <strong>Tingkat kerja sama</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan kerja sama tingkat internasional, nasional, wilayah/lokal yang relevan dengan program studi dan dikelola oleh UPPS dalam 3 tahun terakhir. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;III. <strong>Pelaksanaan kerja sama</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan bahwa UPPS memiliki bukti yang sahih terkait kerja sama yang telah memenuhi 3 aspek berikut: (1) Memberikan manfaat bagi program studi dalam pemenuhan proses pembelajaran, penelitian, PkM; (2) Memberikan peningkatan kinerja tridharma dan fasilitas pendukung program studi; (3) Memberikan kepuasan kepada mitra industri dan mitra kerja sama lainnya. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>
<br>
<p><strong>c) Keuangan</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;I. <strong>Pengelolaan Keuangan</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan bahwa UPPS memiliki praktik pengelolaan sumber daya keuangan secara akuntabel, transparan, efektif, dan efisien. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;II. <strong>Biaya Operasional Pendidikan</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan rerata biaya operasional pendidikan/mahasiswa/tahun. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;III. <strong>Dana Penelitian</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan rerata dana penelitian DTPS per tahun. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;IV. <strong>Dana PkM</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan rerata dana PkM DTPS per tahun. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c2_analisis: `<h3><strong>4. Analisis Faktor Keberhasilan dan Penghambat Pencapaian Tata Pamong, Tata Kelola, Kerja sama dan Keuangan</strong></h3>
<p>Berisi deskripsi dan analisis faktor keberhasilan dan/atau penghambat pencapaian Tata Pamong, Tata Kelola, Kerja sama dan Keuangan yang telah ditetapkan. Analisis faktor keberhasilan dan penghambat pencapaian Tata Pamong, Tata Kelola, Kerja sama dan Keuangan merupakan evaluasi dari indikator kinerja yang dijadikan acuan untuk memperbaiki atau meningkatkan indikator kinerja utama. Selain itu, analisis ini mencakup identifikasi faktor pendukung keberhasilan secara rinci, serta penelusuran akar masalah yang menjadi penyebab munculnya hambatan dalam pencapaian Tata Pamong, Tata Kelola, Kerja sama dan Keuangan yang telah ditetapkan. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c2_strategi: `<h3><strong>5. Strategi perbaikan dan pengembangan (Menggunakan Analisis SWOT)</strong></h3>
<p>Berisi evaluasi menyeluruh terhadap faktor internal (kekuatan dan kelemahan), serta faktor eksternal (peluang dan ancaman) yang memberikan gambaran komprehensif mengenai kesiapan, tantangan, serta potensi yang ada. Proses ini bertujuan untuk merancang strategi perbaikan dan pengembangan yang lebih efektif dengan memanfaatkan kekuatan, mengatasi kelemahan, memaksimalkan peluang, dan meminimalkan risiko untuk mencapai indikator Tata Pamong, Tata Kelola, Kerja sama dan Keuangan yang telah ditetapkan. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c3_latar_belakang: `<h3><strong>1. Latar Belakang</strong></h3>
<p>Bagian ini mencakup latar belakang, tujuan, dan rasional terkait dengan pendidikan, penelitian, dan PkM dalam membangun sistem pendidikan yang sesuai dengan kebutuhan pengguna, penelitian dan PkM yang ditujukan dalam mendukung VMTS UPPS dan visi keilmuan program studi. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c3_kebijakan: `<h3><strong>2. Kebijakan</strong></h3>
<p>Bagian ini berisi deskripsi dokumen formal kebijakan dalam Pendidikan, Penelitian, dan PkM yang diacu oleh UPPS dan PS. Dokumen formal kebijakan pendidikan tersebut memuat tujuan dan sasaran pendidikan. Dokumen formal kebijakan penelitian dan PkM yang mendorong adanya keterlibatan mahasiswa program studi dalam penelitian dosen. Kebijakan penelitian dan PkM juga harus memastikan adanya peta jalan penelitian yang memayungi tema penelitian dosen dan mahasiswa. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c3_iku: `<h3><strong>3. Indikator Kinerja Utama (IKU)</strong></h3>
<p><strong>a) Pendidikan</strong></p>

<p>&nbsp;&nbsp;&nbsp;&nbsp;<strong>i. Pemutakhiran kurikulum</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan keterlibatan pemangku kepentingan dalam proses evaluasi dan pemutakhiran kurikulum yang melibatkan pemangku kepentingan internal dan eksternal, serta direview oleh pakar bidang ilmu program studi serta sesuai perkembangan ipteks dan kebutuhan pengguna. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;<strong>ii. I. Profil lulusan</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan profil lulusan yang ditetapkan oleh Program studi dengan mempertimbangkan visi UPPS dan visi keilmuan program studi, kebutuhan pengguna, sumber daya yang dimilki serta kepentingan lokal, nasional dan/atau global. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>II. Kesesuaian CPL dengan profil lulusan</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan kesesuaian profil lulusan dengan capaian pembelajaran (CPL) yang mencakup: (1) Kesesuaian dengan kebutuhan pengguna; (2) mengikuti perkembangan iptek dan industri; (3) memiliki kompetensi dalam menghadapi persaingan global; (4) dilakukan pengukuran dan ditinjau secara rutin. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;<strong>iii.I. Kesesuaian CPL dengan standar kompetensi lulusan</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Kesesuaian CPL dengan standar kompetensi lulusan yang mencakup: (1) Konsep rekayasa yang spesifik dengan disiplin ilmu terkait; (2) Kemampuan teknis dan kemampuan beradaptasi dengan teknologi baru; (3) Keterampilan komunikasi dan kemampuan kerja tim; (4) Kepatuhan terhadap etika profesi. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Tiga / Sarjana / Sarjana Terapan / Magister / Magister Terapan / Doktor / Doktor Terapan / Program Profesi Insinyur).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>II. Proses tinjauan rutin CPL</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan proses tinjauan rutin terhadap pencapaian pembelajaran program dilakukan secara berkala sesuai dengan prosedur yang telah ditetapkan dengan melibatkan pemangku kepentingan internal dan eksternal. (Penjelasan disampaikan oleh pengusul dari dari Program Studi untuk semua program).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;<strong>iv. Kualitas input mahasiswa</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>I. Metode rekrutmen dan sistem seleksi</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan ketersediaan dan kelengkapan dokumen tentang sistem penerimaan mahasiswa baru yang lengkap, mencakup: kebijakan seleksi, kriteria seleksi, sistem pengambilan keputusan, dan prosedur penerimaan. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Magister / Magister Terapan / Doktor / Doktor Terapan).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>II. Kriteria penerimaan mahasiswa</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan ketersediaan persyaratan penerimaan mahasiswa baru. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Magister / Magister Terapan / Doktor / Doktor Terapan).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>III. Proses seleksi</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan proses seleksi mahasiswa baru. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Magister / Magister Terapan / Doktor / Doktor Terapan).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;<strong>v. Rencana Proses Pembelajaran (RPS)</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>I. Ketersediaan dan kelengkapan dokumen RPS</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan ketersediaan dan kelengkapan dokumen RPS yang mencakup 9 (sembilan) komponen. Kemudahan akses RPS oleh mahasiswa dan konsisten keterlaksanaannya. (Penjelasan disampaikan oleh pengusul dari dari Program Studi untuk semua program).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>II. Proses tinjauan rutin RPS</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan keberkalaan proses tinjauan rutin RPS. (Penjelasan disampaikan oleh pengusul dari dari Program Studi untuk semua program).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;<strong>vi. Proses pembelajaran</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>1) Proses pembelajaran untuk memastikan efektivitas, kualitas, dan keberhasilan pencapaian CPL</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan proses pembelajaran dengan mempertimbangkan: (1) Metode pembelajaran; (2) Media dan sumber belajar; (3) Interakasi dosen dan mahasiswa; serta (4) Peningkatan daya analisis kritis. (Penjelasan disampaikan oleh pengusul dari dari Program Studi untuk semua program).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>2) Proses tinjauan rutin proses pembelajaran</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan proses tinjauan rutin yang dilakukan secara berkala untuk memastikan kesesuaian dengan RPS. Pelaksanaan pemantauan proses pembelajaran mencakup peninjauan kesesuaian dengan RPS, evaluasi metode pembelajaran, identifikasi peluang perbaikan; dan tindakan perbaikan. (Penjelasan disampaikan oleh pengusul dari dari Program Studi untuk semua program).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;<strong>vii. Integrasi penelitian dan PkM dalam pembelajaran</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan hasil Penelitian dan Pengabdian kepada Masyarakat (PkM) dalam pembelajaran yang mencakup relevansi dengan CPL, mendukung keunggulan kompetitif UPPS dan program studi, Mengandung kebaruan ilmiah dan dampak sosial yang positif. (Penjelasan disampaikan oleh pengusul dari dari Program Studi untuk semua program).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;<strong>viii. Pembelajaran yang dilaksanakan dalam bentuk penugasan, praktikum, praktik bengkel, atau praktik lapangan</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan rasio jam pembelajaran penugasan, praktikum, praktik bengkel, atau praktik lapangan terhadap jam pembelajaran total. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Satu / Diploma Dua / Diploma Tiga / Sarjana / Sarjana Terapan / Program Profesi Insinyur).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;<strong>ix. Basic Sciences dan matematika</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan data mata kuliah basic sciences dan matematika yang menjadi mata kuliah inti program studi. Basic sciences dan Matematika tingkat perguruan tinggi (beberapa dengan pengalaman eksperimental) sesuai dengan disiplinnya. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Sarjana / Sarjana Terapan).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;<strong>x. Proyek Rekayasa Penciri bidang Prodi (Capstone Design)</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan data mata kuliah proyek rekayasa penciri bidang prodi (capstone design) dan mata kuliah - mata kuliah penunjang capstone design. Keterlaksanaan capstone design mencakup adanya panduan pelaksanaan, terdapat rumusan capaian pembelajaran mata kuliah, menggunakan standar-standar keteknikan dan batasan-batasan realistis berdasarkan pada pengetahuan dan keterampilan yang telah diperoleh di perkuliahan sebelumnya. Tunjukkan bukti sahih pelaksanaan capstone design. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Sarjana / Sarjana Terapan).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;<strong>xi. Suasana akademik</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>I. Pengelolaan suasana akademik</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan ketersediaan kebijakan, program, dan fasilitas serta dilakukan evaluasi secara berkala dalam menciptakan atmosfer yang kondusif bagi pembelajaran dan pengembangan ilmu pengetahuan. (Penjelasan disampaikan oleh pengusul dari Program Studi untuk semua program).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>II. Integritas dan kebebasan ilmiah</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan keterlaksanaan kebebasan akademik, mimbar akademik dan otonomi keilmuan yang terjadwal. (Penjelasan disampaikan oleh pengusul dari program studi pada program Sarjana / Sarjana Terapan / Magister / Magister Terapan / Doktor / Doktor Terapan).</p>
<br>
<p><strong>b) Penelitian</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;I. <strong>Kesesuaian penelitian dalam mendukung VMTS UPPS dan Visi Keilmuan Program Studi</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan kesesuaian penelitian dalam mendukung VMTS UPPS dan visi keilmuan Program Studi yang mencakup unsur 4 (empat) unsur antara lain: (1) UPPS memiliki peta jalan penelitian yang yang mendukung VMTS UPPS dan visi kelimuan program studi; (2) Peta jalan memayungi tema penelitian dosen dan mahasiswa dalam mendukung pengembangan kapasitas dosen dan mahasiswa; (3) Melakukan evaluasi secara berkala untuk memastikan keselarasan dengan Visi; dan (4) Memberikan dampak positif bagi masyarakat. (Penjelasan disampaikan oleh pengusul dari Program Studi untuk semua program).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;II. <strong>Penelitian DTPS yang sesuai dengan Peta jalan</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan kesesuaian data Penelitian DTPS dengan peta jalan penelitian dan pelaksanaannya melibatkan mahasiswa program studi dalam 3 tahun terakhir. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Sarjana / Sarjana Terapan / Magister / Magister Terapan / Doktor / Doktor Terapan / Program Profesi Insinyur).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;III. <strong>Penelitian DTPS yang menjadi rujukan tema tesis/disertasi</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan penelitian DTPS yang menjadi rujukan tema tesis/disertasi mahasiswa program studi dalam 3 tahun terakhir. (Penjelasan disampaikan oleh pengusul dari program studi pada program Magister / Magister Terapan / Doktor / Doktor Terapan).</p>
<br>
<p><strong>c) PkM</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;I. <strong>Kesesuaian PkM dalam mendukung VMTS UPPS dan Visi Keilmuan Program Studi</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan kesesuaian PkM dalam mendukung VMTS UPPS dan visi keilmuan Program Studi yang mencakup empat (4) unsur antara lain: (1) UPPS memiliki peta jalan PkM yang yang mendukung VMTS UPPS dan visi keilmuan program studi; (2) Peta jalan yang memayungi tema PkM dosen dan mahasiswa dalam mendukung pengembangan kapasitas dosen dan mahasiswa; (3) Melakukan evaluasi secara berkala untuk memastikan keselarasan dengan Visi; dan (4) memberikan dampak positif bagi masyarakat. (Penjelasan disampaikan oleh pengusul dari Program Studi untuk semua program).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;II. <strong>PkM DTPS yang sesuai dengan Peta jalan</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan kesesuaian data PkM DTPS dengan peta jalan penelitian dan pelaksanaannya melibatkan mahasiswa program studi dalam 3 tahun terakhir. (Penjelasan disampaikan oleh pengusul dari Program Studi untuk semua program).</p>`,

  c3_analisis: `<h3><strong>4. Analisis Faktor Keberhasilan dan Penghambat Pencapaian</strong></h3>
<p>Berisi deskripsi dan analisis faktor keberhasilan dan/atau penghambat pencapaian pendidikan, penelitian, PkM yang telah ditetapkan. Analisis faktor keberhasilan dan penghambat pencapaian pendidikan, penelitian, dan PkM merupakan evaluasi dari indikator kinerja yang dijadikan acuan untuk memperbaiki atau meningkatkan indikator kinerja utama maupun tambahan. Selain itu, analisis ini mencakup identifikasi faktor pendukung keberhasilan secara rinci, serta penelusuran akar masalah yang menjadi penyebab munculnya hambatan dalam pencapaian pendidikan, penelitian, dan PkM yang telah ditetapkan. (Penjelasan disampaikan oleh pengusul dari Program Studi untuk semua program).</p>`,

  c3_strategi: `<h3><strong>5. Strategi perbaikan dan pengembangan (Menggunakan Analisis SWOT)</strong></h3>
<p>Berisi evaluasi menyeluruh terhadap faktor internal (kekuatan dan kelemahan), serta faktor eksternal (peluang dan ancaman) yang memberikan gambaran komprehensif mengenai kesiapan, tantangan, serta potensi yang ada. Proses ini bertujuan untuk merancang strategi perbaikan dan pengembangan yang lebih efektif dengan memanfaatkan kekuatan, mengatasi kelemahan, memaksimalkan peluang, dan meminimalkan risiko untuk mencapai indikator pendidikan, penelitian, dan PkM yang telah ditetapkan. (Penjelasan disampaikan oleh pengusul dari Program Studi untuk semua program).</p>`,

  c4_latar_belakang: `<h3><strong>1. Latar Belakang</strong></h3>
<p>Bagian ini menjelaskan latar belakang, tujuan, dan rasional terkait profil dosen, tenaga kependidikan untuk mendukung proses pembelajaran sesuai dengan kebutuhan program studi. (Penjelasan disampaikan oleh pengusul dari Program Studi untuk semua program).</p>`,

  c4_kebijakan: `<h3><strong>2. Kebijakan</strong></h3>
<p>Bagian ini berisi deskripsi dokumen formal kebijakan dalam pengelolaan sumber daya manusia, baik dosen maupun laboran / teknisi / administrator sistem, yang diacu oleh UPPS untuk mendukung VMTS UPPS dan Visi keilmuan Program Studi. (Penjelasan disampaikan oleh pengusul dari Program Studi untuk semua program).</p>`,

  c4_iku: `<h3><strong>3. Indikator Kinerja Utama (IKU)</strong></h3>
<p><strong>a) Profil Dosen dan Tenaga Kependidikan</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;I. <strong>Kecukupan jumlah dosen tetap (DTPS)</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan bahwa DTPS adalah dosen tetap Perguruan Tinggi yang mengajar pada Program Studi yang diakreditasi sesuai dengan kompetensinya. DTPS tersebut juga harus melakukan penelitian dan PkM sesuai dengan Visi Keilmuan Prodi yang diakreditasi. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Satu / Diploma Dua / Diploma Tiga / Sarjana / Sarjana Terapan / Magister / Magister Terapan / Doktor / Doktor Terapan).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;II. <strong>Kecukupan jumlah Dosen Tetap Program Profesi Insinyur (DTPSPPI) dan Dosen Industri (DI)</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Data dan analisis disampaikan oleh pengusul dari program studi pada Program Profesi Insinyur).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;III. <strong>Kualifikasi akademik DTPS</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Persentase jumlah DTPS berpendidikan Doktor / Doktor Terapan / Subspesialis terhadap jumlah DTPS (Data dan analisis disampaikan oleh pengusul dari program studi pada Program Profesi Insinyur).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;IV. <strong>Kualifikasi keinsinyuran DTPSPPI, DI, dan PL</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Kualifikasi keinsinyuran DTPSPPI, DI, dan PL yang sesuai dengan bidang keinsinyuran yang dikembangkan dalam PSPPI (Data dan analisis disampaikan oleh pengusul dari program studi pada Program Profesi Insinyur).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;V. <strong>Jabatan akademik DTPS</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan data dan analisis terkait persentase jumlah DTPS dengan jabatan akademik guru besar / lektor kepala / lektor terhadap jumlah DTPS. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Satu / Diploma Dua / Diploma Tiga / Sarjana / Sarjana Terapan). Bagian ini menjelaskan data dan analisis terkait persentase jumlah DTPS dengan jabatan akademik guru besar / lektor kepala terhadap jumlah DTPS. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Magister / Magister Terapan). Bagian ini menjelaskan data dan analisis terkait persentase jumlah DTPS dengan jabatan akademik guru besar terhadap jumlah DTPS. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Doktor / Doktor Terapan).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;VI. <strong>Persentase DTPS yang memiliki sertifikat kompetensi / profesi / industri</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan data dan analisis terkait persentase DTPS yang memiliki sertifikat kompetensi / profesi / industri terhadap jumlah DTPS. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Satu / Diploma Dua / Diploma Tiga / Sarjana Terapan / Magister Terapan / Doktor Terapan).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;VII. <strong>Persentase mata kuliah kompetensi yang diampu oleh dosen industri/praktisi</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Satu / Diploma Dua / Diploma Tiga / Sarjana Terapan).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;VIII. <strong>Tenaga Kependidikan</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan data dan analisis terkait kualifikasi dan kecukupan laboran untuk mendukung proses pembelajaran sesuai dengan kebutuhan program studi. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>
<br>
<p><strong>b) Beban kerja DTPS</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan rerata beban Kerja DTPS pada kegiatan pendidikan (pembelajaran dan pembimbingan), penelitian, PkM, dan tugas tambahan dan/atau penunjang. (Data dan analisis disampaikan oleh pengusul dari program studi untuk semua program).</p>
<br>
<p><strong>c) Beban kerja dan kinerja DTPS</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;I. <strong>Kegiatan Penelitian</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan jumlah kegiatan penelitian DTPS yang mendukung Visi UPPS dan Keilmuan Program Studi dalam 3 tahun terakhir. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Satu / Diploma Dua / Diploma Tiga / Sarjana / Sarjana Terapan / Magister / Magister Terapan / Doktor / Doktor Terapan). Bagian ini menjelaskan jumlah kegiatan penelitian kolaboratif industri DTPSPPI yang relevan dengan PSPPI dalam 3 tahun terakhir. (Data dan analisis disampaikan oleh pengusul dari program studi pada Program Profesi Insinyur).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;II. <strong>Kegiatan PkM</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan jumlah kegiatan PkM DTPS yang mendukung Visi UPPS dan Keilmuan Program Studi dalam 3 tahun terakhir. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Satu / Diploma Dua / Diploma Tiga / Sarjana / Sarjana Terapan / Magister / Magister Terapan / Doktor / Doktor Terapan). Bagian ini menjelaskan jumlah kegiatan PkM kolaboratif industri DTPSPPI yang relevan dengan PSPPI dalam 3 tahun terakhir. (Data dan analisis disampaikan oleh pengusul dari program studi pada Program Profesi Insinyur).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;III. <strong>Publikasi ilmiah DTPS</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan data dan analisis terkait publikasi ilmiah DTPS dengan tema yang mendukung visi keilmuan program studi dalam 3 tahun terakhir. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Sarjana / Magister / Doktor / Program Profesi Insinyur).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;IV. <strong>Pagelaran / pameran / presentasi / publikasi ilmiah DTPS</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan data dan analisis terkait pagelaran / pameran / presentasi / publikasi ilmiah dengan tema yang mendukung visi keilmuan program studi yang dihasilkan DTPS dalam 3 tahun terakhir. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Satu / Diploma Dua / Diploma Tiga / Sarjana Terapan / Magister Terapan / Doktor Terapan).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;V. <strong>Luaran penelitian dan PkM DTPS</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan data dan analisis terkait luaran penelitian dan PkM DTPS yang mendapatkan pengakuan HKI (Paten, Paten Sederhana), teknologi tepat guna, produk, buku ber-ISBN, book chapter, pengakuan HKI (Pencatatan Penciptaan) dalam 3 tahun terakhir. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Satu / Diploma Dua / Diploma Tiga / Sarjana / Sarjana Terapan / Magister / Magister Terapan / Doktor / Doktor Terapan). Bagian ini menjelaskan data dan analisis terkait luaran penelitian dan PkM kolaboratif industri DTPSPPI yang mendapatkan pengakuan HKI dalam 3 tahun terakhir. (Data dan analisis disampaikan oleh pengusul dari program studi pada Program Profesi Insinyur).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;VI. <strong>Produk/jasa yang diadopsi oleh industri/masyarakat</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan data dan analisis terkait produk/jasa yang diadopsi oleh industri/masyarakat terhadap jumlah dosen tetap dalam 3 tahun terakhir. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Satu / Diploma Dua / Diploma Tiga / Sarjana Terapan / Magister Terapan / Doktor Terapan).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;VII. <strong>Kinerja DTPS dalam mendukung keunggulan kompetitif UPPS dan Prodi</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan data dan analisis terkait kinerja DTPS dalam mendukung keunggulan kompetitif UPPS dan Program studi dalam 3 tahun terakhir diukur dari persentase jumlah dosen yang memiliki karya ilmiah sebagai penulis utama dan/atau penulis korespondensi di jurnal internasional bereputasi atau publikasi dalam prosiding internasional ber-ISSN/ISBN terindeks Scopus/IEEE Explore/SPIE atau paten. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Sarjana / Sarjana Terapan / Magister / Magister Terapan / Doktor / Doktor Terapan).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;VIII. <strong>Karya ilmiah DTPS yang disitasi</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan data dan analisis terkait karya ilmiah pada jurnal bereputasi atau publikasi dalam prosiding internasional ber-ISSN/ISBN terindeks Scopus / IEEE Explore / SPIE DTPS yang disitasi pada basis data pengindeks internasional dalam 3 tahun terakhir. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Sarjana / Sarjana Terapan / Magister / Magister Terapan / Doktor / Doktor Terapan).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;IX. <strong>Pengakuan / rekognisi atas prestasi / kinerja DTPS</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan data persentase pengakuan / rekognisi atas prestasi / kinerja DTPS yang relevan dengan bidang keahlian terhadap DTPS dalam 3 tahun terakhir. Pengakuan / rekognisi atas kepakaran / prestasi / kinerja DTPS dapat berupa menjadi visiting lecturer atau visiting scholar, menjadi keynote speaker / invited speaker, menjadi editor atau mitra bestari, menjadi staf ahli / narasumber, mendapat penghargaan atas prestasi dan kinerja di tingkat wilayah / nasional / internasional. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Satu / Diploma Dua / Diploma Tiga / Sarjana / Sarjana Terapan / Magister / Magister Terapan / Doktor / Doktor Terapan).</p>
<br>
<p><strong>d) Pengembangan Dosen</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;UPPS merencanakan dan mengembangkan DTPSPPI mengikuti rencana pengembangan SDM di perguruan tinggi (Renstra PT) secara konsisten. (Data dan analisis disampaikan oleh pengusul dari program studi pada Program Profesi Insinyur).</p>
<br>
<p><strong>e) Pembimbing Lapangan</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Kecukupan jumlah Pembimbing Lapangan yang relevan yang terlibat dalam PSPPI dalam 3 tahun terakhir. (Data dan analisis disampaikan oleh pengusul dari program studi pada Program Profesi Insinyur).</p>`,

  c4_analisis: `<h3><strong>4. Analisis Faktor Keberhasilan dan Penghambat</strong></h3>
<p>Berisi deskripsi dan analisis faktor keberhasilan dan/atau penghambat pencapaian profil dosen, tenaga kependidikan, beban dan kinerja DTPS yang telah ditetapkan. Analisis faktor keberhasilan dan penghambat pencapaian profil dosen, tenaga kependidikan, beban dan kinerja DTPS merupakan evaluasi dari indikator kinerja yang dijadikan acuan untuk memperbaiki atau meningkatkan indikator kinerja utama maupun tambahan. Selain itu, analisis ini mencakup identifikasi faktor pendukung keberhasilan secara rinci, serta penelusuran akar masalah yang menjadi penyebab munculnya hambatan dalam pencapaian profil dosen, tenaga kependidikan, beban dan kinerja DTPS yang telah ditetapkan. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c4_strategi: `<h3><strong>5. Strategi perbaikan dan pengembangan (Menggunakan Analisis SWOT)</strong></h3>
<p>Berisi evaluasi menyeluruh terhadap faktor internal (kekuatan dan kelemahan), serta faktor eksternal (peluang dan ancaman) yang memberikan gambaran komprehensif mengenai kesiapan, tantangan, serta potensi yang ada. Proses ini bertujuan untuk merancang strategi perbaikan dan pengembangan yang lebih efektif dengan memanfaatkan kekuatan, mengatasi kelemahan, memaksimalkan peluang, dan meminimalkan risiko untuk mencapai indikator profil dosen, tenaga kependidikan, beban dan kinerja DTPS yang telah ditetapkan. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c5_latar_belakang: `<h3><strong>1. Latar Belakang</strong></h3>
<p>Bagian ini mencakup latar belakang, tujuan, dan rasional terkait sarana, prasarana, serta Keselamatan Kesehatan Kerja dan Lingkungan (K3L) untuk menjamin pemenuhan capaian pembelajaran dan peningkatan suasana akademik. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c5_kebijakan: `<h3><strong>2. Kebijakan</strong></h3>
<p>Bagian ini berisi deskripsi dokumen formal tentang pengelolaan sarana, prasarana, dan K3L. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c5_iku: `<h3><strong>3. Indikator Kinerja Utama (IKU)</strong></h3>
<p><strong>a) Sarana dan Prasarana</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;I. Bagian ini berisi deskripsi kecukupan serta mutu sarana dan prasarana untuk mendukung kegiatan akademik yang meliputi: (1) Ketersediaan media pembelajaran, perangkat elektronik, alat praktik laboratorium; (2) Ketersediaan ruang kelas, laboratorium sesuai dengan panduan asosiasi penyelenggara program studi, dan perpustakaan; (3) Kelayakan sarana dan prasarana; (4) Kemudahan akses sarana prasarana. (Data dan analisis disampaikan oleh pengusul dari program studi untuk semua program).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;II. Bagian ini berisi deskripsi kecukupan serta mutu sarana dan prasarana untuk mendukung kegiatan non akademik yang meliputi: (1) Pusat kesehatan, pusat layanan konseling, pusat layanan karir, dan fasilitas ibadah; (2) Kelayakan sarana dan prasarana; dan (3) Kemudahan akses sarana prasarana. (Data dan analisis disampaikan oleh pengusul dari program studi untuk semua program).</p>
<br>
<p><strong>b) Keselamatan, Kesehatan Kerja dan Lingkungan (K3L)</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini berisi ketersediaan dokumen kebijakan dan tata kelola K3L yang mencakup komitmen untuk memenuhi peraturan K3L. Kecukupan dan mutu sarana dan prasarana K3L. Ketersediaan bukti sahih pelaksanaan K3L serta tinjauan secara berkala K3L dan pelaksanaannya. (Data dan analisis disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c5_analisis: `<h3><strong>4. Analisis Faktor Keberhasilan dan Penghambat</strong></h3>
<p>Berisi deskripsi dan analisis faktor keberhasilan dan/atau penghambat pencapaian kriteria sarana, prasarana, dan K3L yang telah ditetapkan. Analisis faktor keberhasilan dan penghambat pencapaian kriteria sarana, prasarana, dan K3L merupakan evaluasi dari indikator kinerja yang dijadikan acuan untuk memperbaiki atau meningkatkan indikator kinerja utama maupun tambahan. Selain itu, analisis ini mencakup identifikasi faktor pendukung keberhasilan secara rinci, serta penelusuran akar masalah yang menjadi penyebab munculnya hambatan dalam pencapaian kriteria sarana, prasarana, dan K3L. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c5_strategi: `<h3><strong>5. Strategi perbaikan dan pengembangan (Menggunakan Analisis SWOT)</strong></h3>
<p>Berisi evaluasi menyeluruh terhadap faktor internal (kekuatan dan kelemahan), serta faktor eksternal (peluang dan ancaman) yang memberikan gambaran komprehensif mengenai kesiapan, tantangan, serta potensi yang ada. Proses ini bertujuan untuk merancang strategi perbaikan dan pengembangan yang lebih efektif dengan memanfaatkan kekuatan, mengatasi kelemahan, memaksimalkan peluang, dan meminimalkan risiko untuk mencapai kriteria sarana, prasarana, dan K3L. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c6_latar_belakang: `<h3><strong>1. Latar Belakang</strong></h3>
<p>Bagian ini mencakup latar belakang, tujuan, dan rasional terkait mahasiswa dan luaran mahasiswa untuk menjamin pemenuhan mahasiswa yang unggul dan lulusan yang sesuai dengan kebutuhan pengguna. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c6_kebijakan: `<h3><strong>2. Kebijakan</strong></h3>
<p>Bagian ini berisi deskripsi dokumen formal tentang mahasiswa dan luaran mahasiswa. Dokumen formal kebijakan mahasiswa dan luaran mahasiswa yang mendorong peningkatan kinerja mahasiswa dan lulusan. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c6_iku: `<h3><strong>3. Indikator Kinerja Utama (IKU)</strong></h3>
<p><strong>a) Rasio jumlah mahasiswa terhadap jumlah DTPS</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan rasio jumlah mahasiswa terhadap jumlah DTPS. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Satu / Diploma Dua / Diploma Tiga / Sarjana / Sarjana Terapan / Program Profesi Insinyur).</p>
<p><strong>b) Persentase mahasiswa asing</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan keberadaan mahasiswa asing paruh dan penuh waktu di UPPS terhadap jumlah mahasiswa di seluruh program di UPPS. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Sarjana / Sarjana Terapan / Magister / Magister Terapan / Doktor / Doktor Terapan).</p>
<p><strong>c) IPK lulusan</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan capaian pembelajaran lulusan yang diukur berdasarkan rerata IPK. (Data dan analisis disampaikan oleh pengusul dari program studi untuk semua program).</p>
<p><strong>d) Prestasi mahasiswa</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan capaian prestasi mahasiswa di bidang akademik dalam 5 tahun terakhir. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Satu / Diploma Dua / Diploma Tiga / Sarjana / Sarjana Terapan / Magister / Magister Terapan / Doktor / Doktor Terapan).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan capaian prestasi mahasiswa di bidang nonakademik dalam 5 tahun terakhir. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Satu / Diploma Dua / Diploma Tiga / Sarjana / Sarjana Terapan).</p>
<p><strong>e) Produk / jasa karya mahasiswa</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan jumlah produk / jasa karya mahasiswa yang dihasilkan secara mandiri atau bersama DTPS yang diadopsi oleh industri / masyarakat dalam 3 tahun terakhir. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Satu / Diploma Dua / Diploma Tiga / Sarjana Terapan / Magister Terapan / Doktor Terapan).</p>
<p><strong>f) Masa studi</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan rerata masa studi lulusan program studi yang diakreditasi. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Satu / Diploma Dua / Diploma Tiga / Sarjana / Sarjana Terapan / Magister / Magister Terapan / Doktor / Doktor Terapan).</p>
<p><strong>g) Lulusan tepat waktu</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan data dan analisis terkait persentase lulusan tepat waktu dari PS yang diakreditasi. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Satu / Diploma Dua / Diploma Tiga / Sarjana / Sarjana Terapan / Magister / Magister Terapan / Doktor / Doktor Terapan / Program Profesi Insinyur).</p>
<p><strong>h) Persentase keberhasilan studi moda pembelajaran reguler</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan jumlah mahasiswa moda pembelajaran reguler yang dibimbing di lapangan dalam 3 tahun terakhir (mulai TS-2 sd TS). (Data dan analisis disampaikan oleh pengusul dari program studi pada Program Profesi Insinyur).</p>
<p><strong>i) Publikasi ilmiah mahasiswa</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan jumlah publikasi ilmiah mahasiswa, yang dihasilkan secara mandiri atau bersama DTPS, dengan judul yang relevan dengan bidang program studi dalam 3 tahun terakhir. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Sarjana / Magister / Doktor).</p>
<p><strong>j) Pagelaran / pameran / presentasi / publikasi ilmiah mahasiswa</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan jumlah pagelaran / pameran / presentasi / publikasi ilmiah mahasiswa, yang dihasilkan secara mandiri atau bersama DTPS dalam 3 tahun terakhir. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Sarjana Terapan / Magister Terapan / Doktor Terapan).</p>
<p><strong>k) Luaran penelitian dan PkM yang dihasilkan mahasiswa</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan jumlah luaran penelitian dan PkM berupa HKI (Paten, Paten Sederhana), teknologi tepat guna, produk, buku ber-ISBN, book chapter, pengakuan HKI (Pencatatan Penciptaan) yang dihasilkan mahasiswa untuk mendukung visi UPPS dan Visi Keilmuan Program Studi, baik secara mandiri atau bersama DTPS dalam 3 tahun terakhir. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Sarjana / Sarjana Terapan / Magister / Magister Terapan / Doktor / Doktor Terapan).</p>
<p><strong>l) Tracer study</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan keterlaksanaan tracer study yang mencakup aspek: (1) Pelaksanaan tracer study terkoordinasi di tingkat PT; (2) Kegiatan tracer study dilakukan secara reguler setiap tahun dan terdokumentasi; (3) Isi kuesioner mencakup seluruh pertanyaan inti tracer study DIKTI; (4) Ditargetkan pada seluruh populasi (lulusan TS-2 s.d. TS-1); dan (5) Hasilnya disosialisasikan dan digunakan untuk pengembangan kurikulum dan pembelajaran. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>
<p><strong>m) Waktu tunggu</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan data dan analisis terkait waktu tunggu lulusan untuk mendapatkan pekerjaan atau berkarya pertama dalam 2 tahun, mulai TS-2 s/d TS-1. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Satu / Diploma Dua / Diploma Tiga / Sarjana / Sarjana Terapan). Bagian ini menjelaskan data dan analisis terkait waktu tunggu lulusan moda pembelajaran reguler untuk mendapatkan pekerjaan pertama dalam 2 tahun, mulai TS-2 s.d. TS-1. (Data dan analisis disampaikan oleh pengusul dari program studi pada Program Profesi Insinyur).</p>
<p><strong>n) Kesesuaian bidang kerja</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan data dan analisis terkait kesesuaian bidang kerja lulusan saat mendapatkan pekerjaan pertama dalam 2 tahun, mulai TS-2 s.d. TS-1. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Satu / Diploma Dua / Diploma Tiga / Sarjana / Sarjana Terapan / Magister / Magister Terapan / Program Profesi Insinyur).</p>
<p><strong>o) Tingkat dan ukuran tempat kerja lulusan</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan data dan analisis terkait tingkat dan ukuran tempat kerja / berwirausaha lulusan di tingkat internasional, nasional, dan lokal. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Satu / Diploma Dua / Diploma Tiga / Sarjana / Sarjana Terapan / Program Profesi Insinyur).</p>
<p><strong>p) Tingkat kepuasan pengguna lulusan</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan data dan analisis terkait tingkat kepuasan pengguna lulusan pada aspek Etika, Keahlian pada bidang ilmu (kompetensi utama), Kemampuan berbahasa asing, Penggunaan teknologi informasi, Kemampuan berkomunikasi, Kerja sama tim, dan Pengembangan diri. (Data dan analisis disampaikan oleh pengusul dari program studi pada program Diploma Satu / Diploma Dua / Diploma Tiga / Sarjana / Sarjana Terapan / Magister / Magister Terapan / Program Profesi Insinyur).</p>`,

  c6_analisis: `<h3><strong>4. Analisis Faktor Keberhasilan dan Penghambat</strong></h3>
<p>Berisi deskripsi dan analisis faktor keberhasilan dan/atau penghambat pencapaian Indikator Rasio jumlah mahasiswa terhadap jumlah DTPS, Persentase mahasiswa asing, IPK lulusan, Prestasi mahasiswa di bidang akademik dan non akademik, Masa studi, Lulusan tepat waktu, Publikasi ilmiah mahasiswa, Luaran penelitian dan PkM yang dihasilkan mahasiswa, Tracer study, Waktu tunggu, Kesesuaian bidang kerja, Tingkat dan ukuran tempat kerja lulusan, Tingkat kepuasan pengguna lulusan yang telah ditetapkan. Analisis faktor keberhasilan dan penghambat pencapaian kriteria mahasiswa dan luaran mahasiswa yang merupakan evaluasi dari indikator kinerja dan dijadikan acuan untuk memperbaiki atau meningkatkan indikator kinerja utama. Selain itu, analisis ini mencakup identifikasi faktor pendukung keberhasilan secara rinci, serta penelusuran akar masalah yang menjadi penyebab munculnya hambatan dalam pencapaian kriteria mahasiswa dan luaran mahasiswa. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c6_strategi: `<h3><strong>5. Strategi perbaikan dan pengembangan (Menggunakan Analisis SWOT)</strong></h3>
<p>Berisi evaluasi menyeluruh terhadap faktor internal (kekuatan dan kelemahan), serta faktor eksternal (peluang dan ancaman) yang memberikan gambaran komprehensif mengenai kesiapan, tantangan, serta potensi yang ada. Proses ini bertujuan untuk merancang strategi perbaikan dan pengembangan yang lebih efektif dengan memanfaatkan kekuatan, mengatasi kelemahan, memaksimalkan peluang, dan meminimalkan risiko untuk mencapai indikator rasio jumlah mahasiswa terhadap jumlah DTPS, persentase mahasiswa asing, IPK lulusan, Prestasi mahasiswa di bidang akademik dan non akademik, masa studi, lulusan tepat waktu, publikasi ilmiah mahasiswa, luaran penelitian dan PkM yang dihasilkan mahasiswa, tracer study, waktu tunggu, kesesuaian bidang kerja, tingkat dan ukuran tempat kerja lulusan, tingkat kepuasan pengguna lulusan. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c7_latar_belakang: `<h3><strong>1. Latar Belakang</strong></h3>
<p>Bagian ini mencakup latar belakang, tujuan, dan rasional terkait dengan keberadaan unit penjaminan mutu dan komitmen pimpinan, Indikator Kinerja Tambahan (IKT), keterlaksanaan penjaminan mutu serta audit mutu internal untuk menjamin proses penjaminan mutu yang sesuai dengan siklus PPEPP. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c7_kebijakan: `<h3><strong>2. Kebijakan</strong></h3>
<p>Berisi deskripsi dokumen formal kebijakan yang mencakup peraturan pemerintah, perguruan tinggi serta dokumen untuk mendukung sistem penjaminan mutu dan untuk memastikan bahwa proses pendidikan, penelitian, dan pengabdian kepada masyarakat yang diselenggarakan oleh perguruan tinggi berjalan sesuai dengan standar mutu yang telah ditetapkan. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c7_iku: `<h3>3. Indikator kinerja utama (IKU) / Indikator Kinerja Tambahan (IKT)</h3>
<p><strong>a) Keberadaan unit penjaminan dan komitmen pimpinan</strong></p>
<h3><strong>3. Indikator kinerja utama (IKU) / Indikator Kinerja Tambahan (IKT)</strong></h3>

<p><strong>a) I. Keberadaan unit penjaminan dan komitmen pimpinan</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan keberadaan unit penjaminan mutu UPPS dan komitmen pimpinan yang mencakup 4 aspek: (1) Dokumen legal pembentukan unsur pelaksana penjaminan mutu; (2) Dokumen legal bahwa auditor bersifat independen; (3) Dokumen pelaksanaan audit mutu internal; (4) Dokumen Rapat Tinjauan Manajemen (RTM). (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;<strong>II. Ketersediaan Perangkat SPMI dan pengakuan mutu eksternal</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan ketersediaan perangkat SPMI yang minimal mencakup: 1. Kebijakan SPMI; 2. Pedoman penerapan siklus PPEPP standar pendidikan tinggi dalam SPMI; 3. Standar dan/atau kriteria, norma, acuan mutu penyelenggaraan pendidikan dan pengelolaan perguruan tinggi; dan 4. Tata cara pendokumentasian implementasi SPMI, serta sistem penjaminan mutu memiliki pengakuan mutu dari lembaga audit eksternal, lembaga akreditasi, dan lembaga sertifikasi. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).
<p><strong>b) Indikator Kinerja Tambahan (IKT)</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan bahwa IKT telah disusun sesuai dengan empat (4) unsur yaitu: (1) tujuan strategis organisasi; (2) memberikan dampak positif dan terukur; (3) menunjukkan daya saing internasional; (4) telah diukur dan dianalisis untuk perbaikan UPPS dan Program studi. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>
<p><strong>c) Keterlaksanaan penjaminan mutu dan audit mutu internal</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan keterlaksanaan Sistem Penjaminan Mutu Internal (SPMI) yang memenuhi aspek berikut: (1) Tersedianya dokumen IKU dan IKT Pendidikan, Penelitian dan PkM; (2) Terlaksananya siklus penjaminan mutu (siklus PPEPP); (3) Bukti sahih efektivitas pelaksanaan penjaminan mutu; (4) Tersedianya bukti peningkatan standar. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>
<p><strong>d) Evaluasi capaian kinerja</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan analisis ketercapaian atau ketidaktercapaian kinerja UPPS pada budaya, relavansi, akuntabilitas dan diferensiasi yang memenuhi empat (4) aspek yaitu: (1) Menggunakan metode yang tepat dalam mengukur kinerja; (2) Melakukan evaluasi indikator yang tidak tercapai dengan mencari akar masalah dan faktor pendukung ketercapaian; (3) Melakukan proses tinjauan rutin hasil pengukuran kinerja; (4) Menyerbarluaskan hasil pengukuran kinerja kepada pemangku kepentingan. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>
<p><strong>e) Kepuasan Pemangku kepentingan</strong></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;Bagian ini menjelaskan data dan analisis terkait pengukuran kepuasan para pemangku kepentingan (mahasiswa, dosen, tenaga kependidikan, lulusan, pengguna, mitra industri, dan mitra lainnya) terhadap layanan manajemen. (Data dan analisis disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c7_analisis: `<h3><strong>4. Analisis Faktor Keberhasilan dan Penghambat Pelaksanaan Sistem Penjaminan Mutu</strong></h3>
<p>Berisi deskripsi dan analisis faktor keberhasilan dan/atau penghambat pencapaian pelaksanaan penjaminan mutu. Analisis faktor keberhasilan dan penghambat pencapaian pelaksanaan penjaminan mutu merupakan evaluasi pelaksanaan penjaminan mutu dari Proses PPEPP. Selain itu, analisis ini mencakup identifikasi faktor pendukung keberhasilan secara rinci, serta penelusuran akar masalah yang menjadi penyebab munculnya hambatan dalam pencapaian pelaksanaan penjaminan mutu. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  c7_strategi: `<h3><strong>5. Strategi perbaikan dan pengembangan (Menggunakan Analisis SWOT)</strong></h3>
<p>Berisi deskripsi faktor eksternal (peluang dan ancaman) yang memberikan gambaran komprehensif mengenai kesiapan, tantangan, serta potensi yang ada. Proses ini bertujuan untuk merancang strategi perbaikan dan pengembangan yang lebih efektif dengan memanfaatkan kekuatan, mengatasi kelemahan, memaksimalkan peluang, dan meminimalkan risiko untuk mengontrol dan meningkatkan kinerja pelaksanaan penjaminan mutu. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  bab3: `<h2>BAB III PROGRAM PENGEMBANGAN BERKELANJUTAN</h2>
<p>Pada bagian ini, mendeskripsikan pengembangan program yang dapat digunakan sebagai rencana strategis sebagai dokumen formal UPPS dan PS untuk menjalankan program jangka pendek maupun jangka panjang. Strategi dan pengembangan berdasarkan analisis capaian kinerja yang disampaikan pada evaluasi setiap kriteria. Analisis dan pengembangan berkelanjutan yang disampaikan meliputi:</p>
<br>
<h4>Analisis SWOT Semua Kritera</h4>
<p>Bagian ini mengidentifikasi strengths (kekuatan), weaknesses (kelemahan), opportunities (peluang), dan threats (ancaman) UPPS dan PS. Hasil identifikasi tersebut dianalisis untuk menentukan posisi UPPS dan PS yang diakreditasi, serta menjadi dasar untuk mendapatkan alternatif solusi dan menetapkan program pengembangan. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>
<br>
<h4>Tujuan Strategis Pengembangan</h4>
<p>Bagian ini mendeskripsikan tujuan strategis yang sesuai dengan Visi, Misi dan Tujuan UPPS. Tujuan strategis dijadikan sebagai arah pengembangan jangka pendek dan menengah yang dijalankan secara efektif. Penentuan tujuan strategis perlu menyesuaikan perkembangan lingkungan eksternal dengan meninjau ulang kelebihan dan kelemahan UPPS dan PS yang diakreditasi. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>
<br>
<h4>Program Pengembangan Keberlanjutan</h4>
<p>Bagian ini menjelaskan program pengembangan keberlanjutan yang disusun sesuai kebutuhan dan tujuan strategis yang telah ditetapkan. Program tersebut bersifat rasional dengan mempertimbangkan sumber daya yang dimiliki serta dapat diukur ketercapaian program yang disusun. (Penjelasan disampaikan oleh pengusul dari program studi untuk semua program).</p>`,

  bab4: `<h2>BAB IV. PENUTUP</h2>
<p>Bagian ini berisi deskripsi yang memuat kesimpulan akhir dari Laporan Evaluasi Diri, yang mencakup ringkasan temuan utama, analisis keseluruhan, dan evaluasi terhadap pencapaian seluruh kriteria. Kesimpulan ini juga menjelaskan kelebihan dan kekuatan yang dimiliki, tantangan atau kelemahan yang perlu diperbaiki, serta peluang dan ancaman yang harus dikelola untuk mendukung pengambilan keputusan strategis. (diisi oleh pengusul dari program studi untuk semua program)</p>`,

  lampiran: `<h2>LAMPIRAN</h2>
<p>Program studi dan/atau UPPS wajib memanfaatkan penyimpanan berbasis layanan komputasi awan ( cloud computing ) untuk mengunggah berkas-berkas bukti sahih dan rekapitulasi detailnya. Berkas- berkas tersebut dapat disusun secara sistematis untuk memermudah verifikasi bukti-bukti sahih.</p>
<p>1. Lampirkan link bukti-bukti sahih data, informasi, dan rekapitulasi detail dari LED.</p>
<p>2. Lampirkan link bukti-bukti sahih data, informasi, dan rekapitulasi detail dari LKPS.</p>`,
};

interface NavSection {
  key: string;
  label: string;
  groupId: string;
  groupLabel: string;
  criteriaId?: string;
  subsectionId?: string;
  template?: string;
}

const ALL_SECTIONS: NavSection[] = [
  { key: "identitas_pengusul",  label: "Identitas Pengusul",      groupId: "pendahuluan", groupLabel: "Pendahuluan", template: TEMPLATES.identitas_pengusul },
  { key: "identitas_tim",       label: "Identitas Tim Penyusun",  groupId: "pendahuluan", groupLabel: "Pendahuluan", template: TEMPLATES.identitas_tim },
  { key: "kata_pengantar",      label: "Kata Pengantar",          groupId: "pendahuluan", groupLabel: "Pendahuluan", template: TEMPLATES.kata_pengantar },
  { key: "ringkasan_eksekutif", label: "Ringkasan Eksekutif",     groupId: "pendahuluan", groupLabel: "Pendahuluan", template: TEMPLATES.ringkasan_eksekutif },
  { key: "bab1", label: "Pendahuluan", groupId: "bab1", groupLabel: "BAB I · Pendahuluan", template: TEMPLATES.bab1 },
  { key: "bab2a", label: "A. Struktur Tim Penyusun",    groupId: "bab2", groupLabel: "BAB II · Evaluasi Diri", template: TEMPLATES.bab2a },
  { key: "bab2b", label: "B. Analisis Lingkungan Eks.", groupId: "bab2", groupLabel: "BAB II · Evaluasi Diri", template: TEMPLATES.bab2b },
  ...LED_CRITERIA.flatMap((c) =>
    SUBSECTIONS.map((s) => {
      const key = `${c.id}_${s.id}`;
      return {
        key,
        label: s.label,
        groupId: c.id,
        groupLabel: `${c.code} ${c.fullName}`,
        criteriaId: c.id,
        subsectionId: s.id,
        template: TEMPLATES[key],
      };
    })
  ),
  { key: "bab3",    label: "Program Pengembangan Berkelanjutan", groupId: "bab3",    groupLabel: "BAB III · Pengembangan Berkelanjutan", template: TEMPLATES.bab3 },
  { key: "bab4",    label: "Penutup",                            groupId: "bab4",    groupLabel: "BAB IV · Penutup",                     template: TEMPLATES.bab4 },
  { key: "lampiran",label: "Lampiran",                           groupId: "lampiran",groupLabel: "Lampiran",                             template: TEMPLATES.lampiran },
];

const SIDEBAR_GROUPS = (() => {
  const map = new Map<string, { label: string; sections: NavSection[]; isCriteria: boolean }>();
  ALL_SECTIONS.forEach((s) => {
    if (!map.has(s.groupId)) {
      map.set(s.groupId, { label: s.groupLabel, sections: [], isCriteria: !!s.criteriaId });
    }
    map.get(s.groupId)!.sections.push(s);
  });
  return Array.from(map.entries()).map(([id, data]) => ({ id, ...data }));
})();

const EMPTY_CONTENT = ["", "<p></p>"];
const hasContent = (html: string) => !EMPTY_CONTENT.includes((html ?? "").trim());

function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> | null }) {
  if (!editor) return null;
  const btn = (active: boolean) =>
    cn("p-1.5 rounded text-gray-600 hover:bg-gray-200 transition-colors", active && "bg-gray-200 text-gray-900");
  return (
    <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-gray-200 bg-gray-50/50 shrink-0">
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btn(editor.isActive("heading", { level: 1 }))} title="H1"><Heading1 className="w-4 h-4" /></button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))} title="H2"><Heading2 className="w-4 h-4" /></button>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))} title="Bold"><Bold className="w-4 h-4" /></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))} title="Italic"><Italic className="w-4 h-4" /></button>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))} title="Bullet List"><List className="w-4 h-4" /></button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))} title="Numbered List"><List Ordered className="w-4 h-4" /></button>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <button onClick={() => editor.chain().focus().setTextAlign("left").run()} className={btn(editor.isActive({ textAlign: "left" }))} title="Align Left"><AlignLeft className="w-4 h-4" /></button>
      <button onClick={() => editor.chain().focus().setTextAlign("center").run()} className={btn(editor.isActive({ textAlign: "center" }))} title="Align Center"><AlignCenter className="w-4 h-4" /></button>
      <button onClick={() => editor.chain().focus().setTextAlign("right").run()} className={btn(editor.isActive({ textAlign: "right" }))} title="Align Right"><AlignRight className="w-4 h-4" /></button>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className={btn(false)} title="Insert Table"><TableIcon className="w-4 h-4" /></button>
    </div>
  );
}

function LEDFormContent() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const prodiIdParam = searchParams.get("prodiId");

  const [prodiId, setProdiId] = useState<string | null>(prodiIdParam);
  const [prodiName, setProdiName] = useState<string>("Memuat...");

  const [activeKey, setActiveKey] = useState<string>(ALL_SECTIONS[0].key);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set([SIDEBAR_GROUPS[0].id])
  );

  const [content, setContent] = useState<Record<string, string>>(() =>
    Object.fromEntries(ALL_SECTIONS.map((s) => [s.key, s.template ?? ""]))
  );

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSaveRef = useRef<() => Promise<void>>(() => Promise.resolve());

  const activeSection = ALL_SECTIONS.find((s) => s.key === activeKey) ?? ALL_SECTIONS[0];
  const activeSectionIndex = ALL_SECTIONS.findIndex((s) => s.key === activeKey);
  const activeGroup = SIDEBAR_GROUPS.find((g) => g.id === activeSection.groupId);

  useEffect(() => {
    if (!prodiIdParam && user?.prodiId) setProdiId(user.prodiId);
  }, [prodiIdParam, user]);

  useEffect(() => {
    if (!prodiId) return;
    apiClient.get(`/prodi/${prodiId}`)
      .then((res) => setProdiName(res.data.data?.fullname ?? "Program Studi"))
      .catch(() => setProdiName("Program Studi"));
  }, [prodiId]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      TableRow, TableCell, TableHeader,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: content[activeKey] ?? "",
    immediatelyRender: false,
    editorProps: { attributes: { class: "tiptap" } },
    onUpdate: () => {
      setSaveStatus("idle");
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => handleSaveRef.current(), 3000);
    },
  });

  const handleSelectSection = useCallback(
    (key: string) => {
      if (!editor) return;
      setContent((prev) => ({ ...prev, [activeKey]: editor.getHTML() }));
      setActiveKey(key);
    },
    [editor, activeKey]
  );

  useEffect(() => {
    if (!editor) return;
    const newContent = content[activeKey] ?? "";
    if (editor.getHTML() !== newContent) {
      editor.commands.setContent(newContent);
    }
  }, [activeKey, editor]); 

  const handleSave = useCallback(async () => {
    if (!editor || !prodiId) return;
    const html = editor.getHTML();
    setContent((prev) => ({ ...prev, [activeKey]: html }));
    setSaveStatus("saving");
    try {
      await new Promise((r) => setTimeout(r, 400));
      setLastSavedAt(new Date());
      setSaveStatus("saved");
    } catch {
      setSaveStatus("idle");
      toast({ variant: "destructive", title: "Gagal menyimpan", description: "Terjadi kesalahan. Coba lagi." });
    }
  }, [editor, prodiId, activeKey, toast]);

  useEffect(() => { handleSaveRef.current = handleSave; }, [handleSave]);
  useEffect(() => () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); }, []);

  const getCriteriaProgress = (criteriaId: string) => {
    const secs = ALL_SECTIONS.filter((s) => s.criteriaId === criteriaId);
    const filled = secs.filter((s) => {
      const c = s.key === activeKey ? editor?.getHTML() ?? "" : content[s.key] ?? "";
      return hasContent(c);
    }).length;
    return { filled, total: secs.length };
  };

  const goPrev = () => {
    if (activeSectionIndex <= 0) return;
    const prev = ALL_SECTIONS[activeSectionIndex - 1];
    setExpandedGroups((g) => new Set([...g, prev.groupId]));
    handleSelectSection(prev.key);
  };
  const goNext = () => {
    if (activeSectionIndex >= ALL_SECTIONS.length - 1) return;
    const next = ALL_SECTIONS[activeSectionIndex + 1];
    setExpandedGroups((g) => new Set([...g, next.groupId]));
    handleSelectSection(next.key);
  };

  if (loading) return <div className="p-8 text-gray-500">Memuat otorisasi...</div>;
  if (!user) return null;

  const canEdit = user.role === "KAPRODI" || user.role === "TIM_PRODI";

  if (!prodiId) {
    return <div className="p-8 text-red-500 font-bold">Program Studi tidak ditemukan. Pastikan Anda terdaftar di sebuah Program Studi.</div>;
  }

  const totalSections = ALL_SECTIONS.length;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden -m-8">
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm shrink-0">
        <div className="flex items-center space-x-5">
          <button
            onClick={() => router.push("/led" + (prodiIdParam ? `?prodiId=${prodiId}` : ""))}
            className="flex items-center text-gray-600 hover:text-gray-900 font-medium text-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-base font-bold text-gray-800">LED Formulir Narasi</h1>
              <p className="text-xs text-gray-500">{prodiName} · LAM Teknik</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {saveStatus === "saved" && lastSavedAt && (
            <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tersimpan {lastSavedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
          {saveStatus === "idle" && lastSavedAt && (
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <Clock className="w-3.5 h-3.5" /> Ada perubahan belum tersimpan
            </div>
          )}
          {canEdit && (
            <Button
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              className="flex items-center px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 gap-2"
            >
              <Save className="w-4 h-4" />
              {saveStatus === "saving" ? "Menyimpan..." : "Simpan"}
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 flex flex-col border-r bg-white shrink-0 overflow-hidden">
          <div className="px-4 py-2.5 border-b bg-gray-50/50 shrink-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Formulir LED · LAM Teknik
            </p>
          </div>
          <nav className="flex-1 overflow-y-auto">
            {SIDEBAR_GROUPS.map((group) => {
              const isExpanded = expandedGroups.has(group.id);
              const isGroupActive = activeSection.groupId === group.id;
              const isSingle = group.sections.length === 1;
              const isCriteria = group.isCriteria;

              const criteriaId = group.sections[0]?.criteriaId;
              const progress = isCriteria && criteriaId ? getCriteriaProgress(criteriaId) : null;
              const criterion = LED_CRITERIA.find((c) => c.id === criteriaId);
              const allFilled = progress ? progress.filled === progress.total : false;

              return (
                <div key={group.id} className="border-b border-gray-50">
                  <button
                    onClick={() => {
                      if (isSingle) {
                        handleSelectSection(group.sections[0].key);
                        setExpandedGroups((prev) => {
                          const next = new Set(prev);
                          next.add(group.id);
                          return next;
                        });
                      } else {
                        setExpandedGroups((prev) => {
                          const next = new Set(prev);
                          if (next.has(group.id)) next.delete(group.id);
                          else next.add(group.id);
                          return next;
                        });
                        if (!isGroupActive && !isExpanded) {
                          handleSelectSection(group.sections[0].key);
                        }
                      }
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 flex items-center gap-2 transition-colors hover:bg-gray-50",
                      isSingle && isGroupActive ? "bg-blue-50/60" : "",
                      !isSingle && isGroupActive && !isExpanded ? "bg-blue-50/40" : ""
                    )}
                  >
                    {isCriteria && criterion && (
                      <span className={cn(
                        "shrink-0 text-[9px] font-bold w-7 h-5 flex items-center justify-center rounded",
                        isGroupActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                      )}>
                        {criterion.code}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-[11px] font-semibold leading-tight truncate",
                        isGroupActive ? "text-blue-700" : "text-gray-700"
                      )}>
                        {isCriteria && criterion ? criterion.name : group.label}
                      </p>
                      {progress && (
                        <p className="text-[10px] text-gray-400 mt-0.5">{progress.filled}/{progress.total} diisi</p>
                      )}
                    </div>
                    {allFilled && <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />}
                    {!isSingle && (
                      isExpanded
                        ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        : <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    )}
                  </button>

                  {!isSingle && isExpanded && (
                    <div className="bg-gray-50/30">
                      {group.sections.map((sec) => {
                        const isActive = activeKey === sec.key;
                        const c = isActive ? editor?.getHTML() ?? "" : content[sec.key] ?? "";
                        const filled = hasContent(c);
                        return (
                          <button
                            key={sec.key}
                            onClick={() => handleSelectSection(sec.key)}
                            className={cn(
                              "w-full text-left pl-9 pr-3 py-1.5 text-[11px] flex items-center justify-between gap-2 transition-colors",
                              isActive
                                ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-l-blue-500"
                                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            )}
                          >
                            <span className="truncate">{sec.label}</span>
                            {filled && <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="px-6 py-2.5 border-b border-gray-100 shrink-0 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-500">{activeGroup?.label}</span>
            {!activeGroup?.isCriteria || activeGroup.sections.length > 1 ? (
              <>
                <span className="text-xs text-gray-300">›</span>
                <span className="text-xs font-medium text-blue-600">{activeSection.label}</span>
              </>
            ) : null}
            {!canEdit && <span className="text-xs text-amber-600 ml-2">(read-only)</span>}
          </div>

          {canEdit && <EditorToolbar editor={editor} />}

          <div className="flex-1 overflow-y-auto p-6 max-w-4xl w-full mx-auto">
            <EditorContent
              editor={editor}
              className={cn(
                "min-h-[400px] focus:outline-none text-sm text-gray-800",
                !canEdit && "pointer-events-none opacity-70"
              )}
            />
          </div>

          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 shrink-0 flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={activeSectionIndex === 0}
              className="text-xs text-gray-500 hover:text-gray-800 disabled:opacity-30 font-medium"
            >
              ← Sebelumnya
            </button>
            <span className="text-[10px] text-gray-400">
              {activeSectionIndex + 1} / {totalSections}
            </span>
            <button
              onClick={goNext}
              disabled={activeSectionIndex === totalSections - 1}
              className="text-xs text-gray-500 hover:text-gray-800 disabled:opacity-30 font-medium"
            >
              Selanjutnya →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function LEDFormPage() {
  return (
    <Suspense fallback={<div className="p-8">Memuat formulir...</div>}>
      <LEDFormContent />
    </Suspense>
  );
}