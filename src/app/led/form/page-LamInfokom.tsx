"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import UnderlineExtension from "@tiptap/extension-underline";
import ImageResize from "tiptap-extension-resize-image";
import Link from "@tiptap/extension-link";
import {AlignCenter, AlignLeft, AlignRight, ArrowLeft, Bold, CheckCircle2, ChevronDown, ChevronRight, Clock, Download, FileText, Heading1, Heading2, History, ImageIcon, Italic, Link as LinkIcon, List, ListOrdered, Minus, Plus, Redo2, Save, Table as TableIcon, Trash2, Underline as UnderlineIcon, Undo2, Unlink,} from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";

const LAM_INFOKOM_CRITERIA = [
  {
    id: "c1",
    code: "C.1",
    name: "Budaya Mutu",
    fullName: "Budaya Mutu",
  },
  {
    id: "c2",
    code: "C.2",
    name: "Relevansi Pendidikan",
    fullName: "Relevansi Pendidikan",
  },
  {
    id: "c3",
    code: "C.3",
    name: "Relevansi Penelitian",
    fullName: "Relevansi Penelitian",
  },
  {
    id: "c4",
    code: "C.4",
    name: "Relevansi PkM",
    fullName: "Relevansi Pengabdian kepada Masyarakat",
  },
  {
    id: "c5",
    code: "C.5",
    name: "Akuntabilitas",
    fullName: "Akuntabilitas",
  },
  {
    id: "c6",
    code: "C.6",
    name: "Diferensiasi Misi",
    fullName: "Diferensiasi Misi",
  },
];

const getCriteriaNumber = (criteriaId: string) =>
  Number(criteriaId.replace("c", ""));

const getInfokomSubsections = (criteriaId: string) => {
  const number = getCriteriaNumber(criteriaId);

  return [
    { id: "penetapan", label: `${number}.1 [PENETAPAN]` },
    { id: "pelaksanaan", label: `${number}.2 [PELAKSANAAN]` },
    { id: "evaluasi", label: `${number}.3 [EVALUASI]` },
    { id: "pengendalian", label: `${number}.4 [PENGENDALIAN]` },
    { id: "peningkatan", label: `${number}.5 [PENINGKATAN]` },
  ];
};

const CRITERIA_BODY: Record<string, Record<string, string>> = {
  c1: {
    penetapan:
      "Bagian ini berisi daftar dan penjelasan dokumen kebijakan, standar, dan indikator yang terkait dengan budaya mutu yang ditetapkan oleh UPPS dan/atau PT.",
    pelaksanaan:
      "Bagian ini berisi penjelasan tentang pelaksanaan atas kebijakan, standar, dan indikator terkait budaya mutu, yang merujuk pada dokumen laporan pelaksanaan kegiatan. Jelaskan juga isi tabel terkait kriteria ini yang dituliskan dalam dokumen LKPS.",
    evaluasi:
      "Bagian ini berisi penjelasan tentang evaluasi secara berkala mengenai ketercapaian standar dan indikator yang telah ditetapkan dan dilaksanakan yang terkait dengan budaya mutu. Bagian ini juga berisi penjelasan tentang faktor pendukung terlampaui/tercapainya standar, dan akar masalah yang menyebabkan tidak tercapainya standar. Tim Penyusun juga perlu menyampaikan hasil survei kepuasan terhadap sistem tata kelola dan fungsi SPMI dengan responden dosen, tendik, dan mahasiswa.",
    pengendalian:
      "Bagian ini berisi penjelasan tentang tindak lanjut (revisi dan rekomendasi) terhadap faktor pendukung dan akar masalah dari hasil evaluasi budaya mutu yang berkaitan dengan sistem tata kelola dan fungsi SPMI, baik yang sudah terpenuhi maupun yang belum.",
    peningkatan:
      "Bagian ini berisi penjelasan tentang peningkatan/optimalisasi standar dan indikator yang terkait budaya mutu pada sistem tata kelola UPPS dan fungsi SPMI, baik yang sudah terpenuhi maupun yang belum.",
  },
  c2: {
    penetapan:
      "Bagian ini berisi daftar dan penjelasan dokumen kebijakan, standar, dan indikator yang terkait dengan relevansi pendidikan yang mencakup sarana dan prasarana pendidikan, DTPR, dan pembiayaan pendidikan, sistem penerimaan mahasiswa baru, pendidikan berbasis luaran (outcome-based education/OBE), dan kompetensi lulusan, proses pembelajaran, isi pembelajaran dan penilaian pembelajaran, dari prodi yang diakreditasi.",
    pelaksanaan:
      "Bagian ini berisi penjelasan tentang pelaksanaan atas kebijakan, standar, dan indikator terkait dengan sarana dan prasarana pendidikan, DTPR, dan pembiayaan pendidikan, sistem penerimaan mahasiswa baru, pendidikan berbasis luaran (outcome-based education/OBE) dan kompetensi lulusan, proses pembelajaran, isi pembelajaran dan penilaian pembelajaran, yang merujuk pada dokumen laporan pelaksanaan kegiatan. Jelaskan juga isi tabel terkait kriteria ini yang dituliskan dalam dokumen LKPS.",
    evaluasi:
      "Bagian ini berisi penjelasan tentang evaluasi secara berkala mengenai ketercapaian standar dan indikator yang telah ditetapkan dan dilaksanakan yang mencakup sarana dan prasarana pendidikan, DTPR, dan pembiayaan pendidikan, sistem penerimaan mahasiswa baru, pendidikan berbasis luaran (outcome-based education/OBE), dan kompetensi lulusan, proses pembelajaran, isi pembelajaran dan penilaian pembelajaran. Tim Penyusun perlu menyampaikan hasil survei kepuasan terhadap layanan pembelajaran dengan responden mahasiswa.",
    pengendalian:
      "Bagian ini berisi penjelasan tentang tindak lanjut (revisi dan rekomendasi) terhadap hasil evaluasi yang berkaitan dengan sarana dan prasarana pendidikan, DTPR, dan pembiayaan pendidikan, sistem penerimaan mahasiswa baru, pendidikan berbasis luaran (outcome-based education/OBE), dan kompetensi lulusan, proses pembelajaran, isi pembelajaran dan penilaian pembelajaran, baik yang sudah terpenuhi maupun yang belum.",
    peningkatan:
      "Bagian ini berisi penjelasan tentang peningkatan/optimalisasi terhadap standar dan indikator terkait dengan sarana dan prasarana pendidikan, DTPR, dan pembiayaan pendidikan, sistem penerimaan mahasiswa baru, pendidikan berbasis luaran (outcome-based education/OBE), dan kompetensi lulusan, proses pembelajaran, isi pembelajaran dan penilaian pembelajaran., baik yang sudah terpenuhi maupun yang belum.",
  },
  c3: {
    penetapan:
      "Bagian ini berisi daftar dan penjelasan dokumen kebijakan, standar, dan indikator yang terkait dengan relevansi penelitian yang mencakup sarana dan prasarana penelitian, pembiayaan penelitian, peta jalan penelitian, kerjasama di bidang penelitian, serta pengembangan DTPR di bidang penelitian.",
    pelaksanaan:
      "Bagian ini berisi penjelasan tentang pelaksanaan atas kebijakan, standar, dan indikator terkait dengan sarana dan prasarana penelitian, pembiayaan penelitian, konsistensi terhadap peta jalan penelitian, kerjasama di bidang penelitian, serta pengembangan DTPR di bidang penelitian yang sesuai kebutuhan masyarakat dan DUDIKA lokal, nasional dan internasional, yang merujuk pada dokumen laporan pelaksanaan kegiatan. Jelaskan juga isi tabel terkait kriteria ini yang dituliskan dalam dokumen LKPS.",
    evaluasi:
      "Bagian ini berisi penjelasan tentang evaluasi secara berkala mengenai ketercapaian standar dan indikator yang telah ditetapkan dan dilaksanakan yang mencakup sarana dan prasarana penelitian, pembiayaan penelitian, konsistensi terhadap peta jalan penelitian, kerjasama di bidang penelitian, serta pengembangan DTPR di bidang penelitian yang sesuai kebutuhan masyarakat dan DUDIKA lokal, nasional dan internasional. Tim Penyusun perlu menyampaikan hasil survei kepuasan terhadap layanan penelitian dengan responden dosen.",
    pengendalian:
      "Bagian ini berisi penjelasan tentang tindak lanjut terhadap hasil evaluasi terkait dengan sarana dan prasarana penelitian, pembiayaan penelitian, konsistensi terhadap peta jalan penelitian, kerjasama di bidang penelitian, serta pengembangan DTPR di bidang penelitian yang sesuai dengan kebutuhan masyarakat dan DUDIKA lokal, nasional dan internasional, baik yang sudah terpenuhi maupun yang belum.",
    peningkatan:
      "Bagian ini berisi penjelasan tentang peningkatan/optimalisasi terkait dengan keberlanjutan sarana dan prasarana penelitian, pembiayaan penelitian, konsistensi terhadap peta jalan penelitian, kerjasama di bidang penelitian, serta pengembangan DTPR di bidang penelitian, baik yang sudah terpenuhi maupun yang belum.",
  },
  c4: {
    penetapan:
      "Bagian ini berisi daftar dan penjelasan dokumen kebijakan, standar, dan indikator yang terkait dengan relevansi PkM yang mencakup sarana dan prasarana PkM, pembiayaan PkM, peta jalan PkM, kerjasama di bidang PkM, serta pengembangan DTPR di bidang PkM.",
    pelaksanaan:
      "Bagian ini berisi penjelasan tentang pelaksanaan atas kebijakan, standar, dan indikator terkait dengan sarana dan prasarana PkM, pembiayaan PkM, peta jalan PkM, kerjasama di bidang PkM, serta pengembangan DTPR di bidang PkM, pengembangan kepakaran, yang sesuai dengan kebutuhan masyarakat dan DUDIKA, yang merujuk pada dokumen laporan pelaksanaan kegiatan. Jelaskan juga isi tabel terkait kriteria ini yang dituliskan dalam dokumen LKPS.",
    evaluasi:
      "Bagian ini berisi penjelasan tentang evaluasi secara berkala mengenai ketercapaian standar dan indikator yang telah ditetapkan dan dilaksanakan yang mencakup sarana dan prasarana PkM, pembiayaan PkM, peta jalan PkM, kerjasama di bidang PkM, serta pengembangan DTPR di bidang PkM. Tim Penyusun perlu menyampaikan hasil survei kepuasan terhadap layanan kegiatan PkM dengan responden dosen.",
    pengendalian:
      "Bagian ini berisi penjelasan tentang tindak lanjut (revisi dan rekomendasi) terhadap hasil evaluasi yang terkait dengan sarana dan prasarana PkM, pembiayaan PkM, peta jalan PkM, kerjasama di bidang PkM, serta pengembangan DTPR di bidang PkM pengembangan kepakaran, baik yang sudah terpenuhi maupun yang belum.",
    peningkatan:
      "Bagian ini berisi penjelasan tentang peningkatan/optimalisasi terkait dengan sarana dan prasarana PkM, pembiayaan PkM, peta jalan PkM, kerjasama di bidang PkM, serta pengembangan DTPR di bidang PkM keberlanjutan PkM, baik yang sudah terpenuhi maupun yang belum.",
  },
  c5: {
    penetapan:
      "Bagian ini berisi daftar dan penjelasan dokumen kebijakan, standar, dan indikator yang terkait dengan tata kelola dan tata pamong.",
    pelaksanaan:
      "Bagian ini berisi penjelasan tentang pelaksanaan atas kebijakan, standar, dan indikator terkait tata kelola dan tata pamong yang sesuai dengan yang telah ditetapkan, yang merujuk pada dokumen laporan pelaksanaan kegiatan. Jelaskan juga isi tabel terkait kriteria ini yang dituliskan dalam dokumen LKPS.",
    evaluasi:
      "Bagian ini berisi penjelasan tentang evaluasi secara berkala mengenai ketercapaian standar dan indikator yang telah ditetapkan dan dilaksanakan yang mencakup tata kelola dan tata pamong. Tim Penyusun perlu menyampaikan hasil survei kepuasan terhadap tata kelola dan tata pamong, sarana dan prasarana, serta SDM dengan responden dosen, mahasiswa dan tendik.",
    pengendalian:
      "Bagian ini berisi penjelasan tentang tindak lanjut (revisi dan rekomendasi) terhadap hasil evaluasi terkait konsistensi tata kelola dan tata pamong, baik yang sudah terpenuhi maupun yang belum.",
    peningkatan:
      "Bagian ini berisi penjelasan tentang peningkatan/optimalisasi hasil ketercapaian standar dan indikator terkait sistem tata kelola dan tata pamong, baik yang sudah terpenuhi maupun yang belum.",
  },
  c6: {
    penetapan:
      "Bagian ini berisi daftar dan penjelasan dokumen kebijakan, standar dan indikator terkait tridarma perguruan tinggi yang mencakup VMTS, rencana pengembangan strategis UPPS dan/atau PS yang dapat menggambarkan ciri khas keilmuan PS, serta pengakuan/apresiasi oleh masyarakat dan DUDIKA di tingkat lokal, nasional, dan internasional.",
    pelaksanaan:
      "Bagian ini berisi penjelasan tentang kegiatan terkait pelaksanaan standar dan indikator terkait tridarma perguruan tinggi mencakup VMTS, rencana pengembangan strategis UPPS dan/atau PS yang dapat menggambarkan ciri khas keilmuan PS, serta pengakuan/apresiasi oleh masyarakat dan DUDIKA di tingkat lokal, nasional, dan internasional, yang merujuk pada dokumen laporan pelaksanaan kegiatan. Jelaskan juga isi tabel terkait kriteria ini yang dituliskan dalam dokumen LKPS.",
    evaluasi:
      "Bagian ini berisi penjelasan tentang evaluasi secara berkala mengenai ketercapaian standar dan indikator yang telah ditetapkan dan dilaksanakan yang mencakup tridarma perguruan tinggi yang mencakup VMTS, rencana pengembangan strategis UPPS dan/atau PS yang dapat menggambarkan ciri khas keilmuan PS, serta pengakuan/apresiasi oleh masyarakat dan DUDIKA di tingkat lokal, nasional, dan internasional. Tim Penyusun perlu menyampaikan hasil survei pemahaman VMTS dengan responden dosen, mahasiswa dan tenaga tendik.",
    pengendalian:
      "Bagian ini berisi penjelasan tentang tindak lanjut (revisi dan rekomendasi) hasil evaluasi terkait tridarma perguruan tinggi mencakup VMTS, rencana pengembangan strategis UPPS dan/atau PS yang dapat menggambarkan ciri khas keilmuan PS, serta pengakuan/apresiasi oleh masyarakat dan DUDIKA di tingkat lokal, nasional, dan internasional, baik yang sudah terpenuhi maupun yang belum.",
    peningkatan:
      "Bagian ini berisi penjelasan tentang peningkatan/optimalisasi hasil ketercapaian standar dan indikator terkait tridarma perguruan tinggi mencakup VMTS, rencana pengembangan strategis UPPS dan/atau PS yang dapat menggambarkan ciri khas keilmuan PS, serta pengakuan/apresiasi oleh masyarakat dan DUDIKA di tingkat lokal, nasional, dan internasional, baik yang sudah terpenuhi maupun yang belum.",
  },
};

const CRITERIA_POINTS: Record<string, Record<string, string[]>> = {
  c1: {
    penetapan: [
      "Kebijakan, standar, dan indikator terkait Sistem Tata Kelola UPPS dan/atau PT berikut SOP. Sistem tata kelola mencakup administrasi akademik, keuangan, SDM, dan aspek lain dalam siklus PPEPP, di tingkat UPPS dan/atau PT.",
      "Kebijakan, standar dan indikator terkait fungsi SPMI dengan SDM yang kompeten sebagai pelaksana di tingkat UPPS dan/atau PT.",
    ],
    pelaksanaan: [
      "Kegiatan terkait pelaksanaan standar dan indikator yang menunjukkan berfungsinya Sistem Tata Kelola Internal UPPS dan/atau PT berikut SOP, yang mencakup Administrasi Akademik, Keuangan, SDM, dan aspek lain dalam siklus PPEPP, di tingkat UPPS dan/atau PT. Dokumen pendukung misalnya laporan tahunan pimpinan UPPS dan/atau PT.",
      "Kegiatan terkait pelaksanaan standar dan indikator yang menunjukkan berfungsinya SPMI dengan SDM yang kompeten sebagai pelaksana di tingkat UPPS dan/atau PT.",
    ],
    evaluasi: [
      "Evaluasi ketercapaian standar dan indikator terkait sistem tata kelola internal UPPS dan/ atau PT berikut SOP, yang mencakup administrasi akademik, keuangan, SDM, dan aspek lain dalam siklus PPEPP, di tingkat UPPS dan/atau PT.",
      "Evaluasi ketercapaian standar dan indikator terkait fungsi SPMI dengan SDM yang kompeten sebagai pelaksana di tingkat UPPS dan/atau PT.",
    ],
    pengendalian: [
      "Tindak lanjut hasil evaluasi ketercapaian standar dan indikator terkait sistem tata kelola internal UPPS dan/atau PT berikut SOP, yang mencakup administrasi akademik, keuangan, sdm, dan aspek lain dalam siklus PPEPP di tingkat UPPS dan/atau PT.",
      "Tindak lanjut hasil evaluasi ketercapaian standar dan indikator terkait fungsi SPMI dan SDM pelaksana di tingkat UPPS dan/atau PT.",
    ],
    peningkatan: [
      "Peningkatan/optimalisasi standar dan indikator terkait Sistem Tata Kelola Internal UPPS dan/atau PT berikut SOP, yang mencakup Administrasi Akademik, Keuangan, SDM, dan aspek lain dalam siklus PPEPP di tingkat UPPS dan/atau PT.",
      "Peningkatan/optimalisasi standar dan indikator terkait Fungsi SPMI dengan SDM yang kompeten sebagai pelaksana di tingkat UPPS dan/atau PT.",
    ],
  },
  c2: {
    penetapan: [
      "Kebijakan, standar dan indikator terkait sarana dan prasarana pendidikan, DTPR, dan pembiayaan pendidikan, penerimaan mahasiswa baru dalam rangka perluasan akses, keragaman asal calon mahasiswa, program afirmasi, dan calon mahasiswa berkebutuhan khusus.",
      "Kebijakan, standar dan indikator terkait isi pembelajaran dan rancangan kurikulum outcome-based education, yang mencakup soft dan hard competence (memenuhi KKNI level 6), yang ditetapkan oleh perguruan tinggi serta keterlibatan/masukan pemangku kepentingan (stakeholder) dalam penyusunannya.",
      "Kebijakan, standar dan indikator tentang fleksibilitas dalam proses pembelajaran (luring, daring, atau hibrida, CBL, PBL, micro-credential, rekognisi pembelajaran lampau (RPL) yang relevan dengan bidang keilmuan PS, penciptaan suasana akademik, dan penilaian pembelajaran serta pemenuhan beban belajar.",
      "Kebijakan, standar dan indikator terkait prestasi mahasiswa dan kompetensi lulusan yang dapat dinilai dari pengakuan (rekognisi), dan apresiasi kompetensi lulusan oleh masyarakat dunia usaha, dunia industri, dan dunia kerja (DUDIKA), serta sebaran kerja lulusan (lokal, nasional, internasional).",
    ],
    pelaksanaan: [
      "Kegiatan terkait pelaksanaan standar dan indikator tentang sarana dan prasarana pendidikan, DTPR, dan pembiayaan pendidikan, penerimaan mahasiswa baru dalam rangka perluasan akses, keragaman asal calon mahasiswa, program afirmasi, dan calon mahasiswa berkebutuhan khusus.",
      "Kegiatan terkait pelaksanaan standar dan indikator tentang isi pembelajaran dan rancangan kurikulum outcome-based education, yang mencakup soft dan hard competence (memenuhi KKNI level 6), yang ditetapkan oleh perguruan tinggi serta keterlibatan/ masukan pemangku kepentingan (stakeholder) dalam penyusunannya.",
      "Kegiatan terkait pelaksanaan standar dan indikator tentang fleksibilitas dalam proses pembelajaran (luring, daring atau hibrid, micro-credential, rekognisi pembelajaran lampau (RPL) yang relevan dengan bidang keilmuannya, penciptaan suasana akademik, dan penilaian pembelajaran serta pemenuhan beban belajar.",
      "Kegiatan terkait pelaksanaan standar dan indikator terkait prestasi mahasiswa dan kompetensi lulusan yang dapat dinilai dari pengakuan (rekognisi) dan apresiasi kompetensi lulusan oleh masyarakat dan DUDIKA, serta sebaran kerja lulusan (lokal, nasional, internasional).",
    ],
    evaluasi: [
      "Evaluasi ketercapaian standar dan indikator terkait sarana dan prasarana pendidikan, DTPR, dan pembiayaan pendidikan, penerimaan mahasiswa baru dalam rangka perluasan akses, keragaman asal calon mahasiswa, program afirmasi, dan calon mahasiswa berkebutuhan khusus.",
      "Evaluasi ketercapaian standar dan indikator terkait isi pembelajaran dan rancangan kurikulum outcome-based education, yang mencakup soft dan hard competence (memenuhi KKNI level 6), yang ditetapkan oleh perguruan tinggi serta keterlibatan/ masukan pemangku kepentingan (stakeholder) dalam penyusunannya.",
      "Evaluasi ketercapaian standar dan indikator terkait fleksibilitas dalam proses pembelajaran (luring, daring atau hibrid, micro-credential, rekognisi pembelajaran lampau (RPL) yang relevan dengan bidang keilmuannya, penciptaan suasana akademik, dan penilaian pembelajaran serta pemenuhan beban belajar.",
      "Evaluasi ketercapaian standar dan indikator terkait prestasi mahasiswa dan kompetensi lulusan yang dapat dinilai dari pengakuan (rekognisi) dan apresiasi kompetensi lulusan oleh masyarakat dan DUDIKA, serta sebaran kerja lulusan (lokal, nasional, internasional).",
    ],
    pengendalian: [
      "Tindak lanjut hasil evaluasi ketercapaian standar dan indikator terkait sarana dan prasarana pendidikan, DTPR, dan pembiayaan pendidikan, penerimaan mahasiswa baru dalam rangka perluasan akses, keragaman asal calon mahasiswa, program afirmasi, dan calon mahasiswa berkebutuhan khusus.",
      "Tindak lanjut hasil evaluasi ketercapaian standar dan indikator terkait isi pembelajaran dan rancangan kurikulum outcome-based education, yang mencakup soft dan hard competence (memenuhi KKNI level 6), yang ditetapkan oleh perguruan tinggi serta keterlibatan/masukan pemangku kepentingan (stakeholder) dalam penyusunannya.",
      "Tindak lanjut hasil evaluasi ketercapaian standar dan indikator terkait fleksibilitas dalam proses pembelajaran (luring, daring atau hibrid, micro-credential, rekognisi pembelajaran lampau (RPL) yang relevan dengan bidang keilmuannya, penciptaan suasana akademik, dan penilaian pembelajaran serta pemenuhan beban belajar.",
      "Tindak lanjut hasil evaluasi ketercapaian standar dan indikator terkait prestasi mahasiswa dan kompetensi lulusan yang dapat dinilai dari pengakuan (rekognisi) dan apresiasi kompetensi lulusan oleh masyarakat dan DUDIKA, serta sebaran kerja lulusan (lokal, nasional, internasional).",
    ],
    peningkatan: [
      "Peningkatan/optimalisasi hasil ketercapaian standar dan indikator terkait tentang sarana dan prasarana pendidikan, DTPR, dan pembiayaan pendidikan, penerimaan mahasiswa baru dalam rangka perluasan akses, keragaman asal calon mahasiswa, program afirmasi, dan calon mahasiswa berkebutuhan khusus.",
      "Peningkatan/optimalisasi hasil ketercapaian standar dan indikator terkait isi pembelajaran dan rancangan kurikulum outcome-based education, yang mencakup soft dan hard competence (memenuhi KKNI level 6), yang ditetapkan oleh perguruan tinggi serta keterlibatan/ masukan pemangku kepentingan (stakeholder) dalam penyusunannya.",
      "Peningkatan/optimalisasi hasil ketercapaian standar dan indikator terkait fleksibilitas dalam proses pembelajaran (luring, daring atau hibrid, micro-credential, rekognisi pembelajaran lampau (RPL) yang relevan dengan bidang keilmuannya, penciptaan suasana akademik, dan penilaian pembelajaran serta pemenuhan beban belajar.",
      "Peningkatan/optimalisasi hasil ketercapaian standar dan indikator terkait prestasi mahasiswa dan kompetensi lulusan yang dapat dinilai dari pengakuan (rekognisi) dan apresiasi kompetensi lulusan oleh masyarakat dan DUDIKA, serta sebaran kerja lulusan (lokal, nasional, internasional).",
    ],
  },
};

const C3_POINTS: Record<string, string[]> = {
  penetapan: [
    "Kebijakan, standar dan indikator terkait sarana dan prasarana penelitian, DTPR, dan pembiayaan penelitian, serta peta jalan penelitian.",
    "Kebijakan, standar dan indikator terkait implementasi peta jalan penelitian, pelibatan mahasiswa berdasarkan visi misi Perguruan Tinggi, UPPS, visi misi keilmuan program studi, dan kebutuhan masyarakat serta DUDIKA.",
    "Kebijakan, standar, dan indikator terkait perolehan hibah penelitian, kerjasama penelitian, publikasi baik lingkup lokal, nasional, dan internasional, perolehan HKI, serta keberlanjutan penelitian.",
  ],
  pelaksanaan: [
    "Kegiatan pelaksanaan standar dan indikator yang terkait sarana dan prasarana penelitian, DTPR, dan pembiayaan penelitian, dan peta jalan penelitian.",
    "Kegiatan pelaksanaan standar dan indikator yang terkait implementasi peta jalan penelitian, pelibatan mahasiswa berdasarkan visi misi Perguruan Tinggi, UPPS, visi misi keilmuan program studi, kebutuhan masyarakat dan DUDIKA.",
    "Kegiatan terkait pelaksanaan standar, dan indikator yang terkait dengan perolehan hibah penelitian, kerjasama penelitian, publikasi baik lingkup lokal, nasional, dan internasional, perolehan HKI, serta keberlanjutan penelitian.",
  ],
  evaluasi: [
    "Evaluasi ketercapaian pelaksanaan standar dan indikator terkait sarana dan prasarana penelitian, DTPR, dan pembiayaan penelitian, dan peta jalan penelitian.",
    "Evaluasi ketercapaian pelaksanaan standar dan indikator terkait implementasi peta jalan penelitian, pelibatan mahasiswa berdasarkan visi misi Perguruan Tinggi, UPPS, visi misi keilmuan program studi, kebutuhan masyarakat dan DUDIKA.",
    "Evaluasi ketercapaian pelaksanaan standar, dan indikator terkait perolehan hibah penelitian, kerjasama penelitian, publikasi baik lingkup lokal, nasional, dan internasional, perolehan HKI, serta keberlanjutan penelitian.",
  ],
  pengendalian: [
    "Tindak lanjut hasil evaluasi ketercapaian standar dan indikator terkait sarana dan prasarana penelitian, DTPR, dan pembiayaan penelitian, dan peta jalan penelitian.",
    "Tindak lanjut hasil evaluasi ketercapaian standar dan indikator terkait implementasi peta jalan penelitian, pelibatan mahasiswa berdasarkan visi misi Perguruan Tinggi, UPPS, visi misi keilmuan program studi, kebutuhan masyarakat dan DUDIKA.",
    "Tindak lanjut hasil evaluasi ketercapaian standar, dan indikator terkait perolehan hibah penelitian, kerjasama penelitian, publikasi baik lingkup lokal, nasional, dan internasional, perolehan HKI, serta keberlanjutan penelitian.",
  ],
  peningkatan: [
    "Peningkatan/optimalisasi hasil ketercapaian standar dan indikator terkait sarana dan prasarana penelitian, pengembangan DTPR, dan pembiayaan penelitian, dan peta jalan penelitian.",
    "Peningkatan/optimalisasi hasil ketercapaian standar dan indikator terkait implementasi peta jalan penelitian, pelibatan mahasiswa berdasarkan visi misi Perguruan Tinggi, UPPS, visi misi keilmuan program studi, kebutuhan masyarakat dan DUDIKA.",
    "Peningkatan/optimalisasi hasil ketercapaian standar, dan indikator terkait perolehan hibah penelitian, kerjasama penelitian, publikasi baik lingkup lokal, nasional, dan internasional, perolehan HKI, serta keberlanjutan penelitian.",
  ],
};

const C4_POINTS: Record<string, string[]> = {
  penetapan: [
    "Kebijakan, standar dan indikator terkait sarana dan prasarana PkM, pengembangan DTPR, dan pembiayaan PkM, dan peta jalan PkM (layanan kepakaran).",
    "Kebijakan, standar dan indikator terkait implementasi peta jalan PkM, pelibatan mahasiswa berdasarkan visi misi Perguruan Tinggi, UPPS, visi misi keilmuan program studi, kebutuhan masyarakat dan DUDIKA.",
    "Kebijakan, standar, dan indikator terkait perolehan hibah PkM, kerjasama PkM, diseminasi baik lingkup lokal, nasional, dan internasional, perolehan HKI, serta keberlanjutan PkM.",
  ],
  pelaksanaan: [
    "Kegiatan terkait pelaksanaan standar dan indikator terkait sarana dan prasarana PkM, DTPR, dan pembiayaan PkM, dan peta jalan PkM (layanan kepakaran).",
    "Kegiatan terkait pelaksanaan standar dan indikator terkait implementasi peta jalan PkM, pelibatan mahasiswa berdasarkan visi misi Perguruan Tinggi, UPPS, visi misi keilmuan program studi, kebutuhan masyarakat dan DUDIKA.",
    "Kegiatan terkait pelaksanaan standar, dan indikator terkait perolehan hibah PkM, kerjasama PkM, diseminasi baik lingkup lokal, nasional, dan internasional, perolehan HKI, serta keberlanjutan PkM.",
  ],
  evaluasi: [
    "Evaluasi ketercapaian standar dan indikator terkait sarana dan prasarana PkM, pengembangan DTPR, dan pembiayaan PkM, dan peta jalan PkM (layanan kepakaran).",
    "Evaluasi ketercapaian standar dan indikator terkait implementasi peta jalan PkM, pelibatan mahasiswa berdasarkan visi misi Perguruan Tinggi, UPPS, visi misi keilmuan program studi, kebutuhan masyarakat dan DUDIKA.",
    "Evaluasi ketercapaian standar dan indikator terkait perolehan hibah PkM, kerjasama PkM, diseminasi baik lingkup lokal, nasional, dan internasional, perolehan HKI, serta keberlanjutan PkM.",
  ],
  pengendalian: [
    "Tindak lanjut hasil evaluasi ketercapaian standar dan indikator terkait sarana dan prasarana PkM, pengembangan DTPR, dan pembiayaan PkM, dan peta jalan PkM (layanan kepakaran).",
    "Tindak lanjut hasil evaluasi ketercapaian standar dan indikator terkait implementasi peta jalan PkM, pelibatan mahasiswa berdasarkan visi misi Perguruan Tinggi, UPPS, dan program studi, kebutuhan masyarakat dan DUDIKA.",
    "Tindak lanjut hasil evaluasi ketercapaian standar dan indikator terkait perolehan hibah PkM, kerjasama PkM, diseminasi baik lingkup lokal, nasional, dan internasional, perolehan HKI, serta keberlanjutan PkM.",
  ],
  peningkatan: [
    "Peningkatan/optimalisasi hasil ketercapaian standar dan indikator terkait sarana dan prasarana PkM, pengembangan DTPR, dan pembiayaan PkM, dan peta jalan PkM (layanan kepakaran).",
    "Peningkatan/optimalisasi hasil ketercapaian standar dan indikator terkait implementasi peta jalan PkM, pelibatan mahasiswa berdasarkan visi misi Perguruan Tinggi, UPPS, visi misi keilmuan program studi, kebutuhan masyarakat dan DUDIKA.",
    "Peningkatan/optimalisasi hasil ketercapaian standar dan indikator terkait perolehan hibah PkM, kerjasama PkM, diseminasi baik lingkup lokal, nasional, dan internasional, perolehan HKI, serta keberlanjutan PkM.",
  ],
};

const C5_POINTS: Record<string, string[]> = {
  penetapan: [
    "Kebijakan, standar dan indikator terkait sistem tata kelola dan tata pamong yang otonom secara transparan, dan akuntabel yang didukung kapasitas sarana dan prasarana yang memadai dan SDM yang profesional.",
    "Kebijakan, standar dan indikator terkait audit mutu pemenuhan tupoksi tata kelola dan tata pamong, sarana dan prasarana dan SDM yang profesional.",
  ],
  pelaksanaan: [
    "Kegiatan terkait pelaksanaan standar dan indikator terkait sistem tata kelola dan tata pamong yang otonom secara transparan, dan akuntabel yang didukung kapasitas sarana dan prasarana yang memadai dan SDM yang profesional.",
    "Kegiatan terkait pelaksanaan standar dan indikator terkait audit mutu pemenuhan tupoksi tata kelola dan tata pamong, sarana dan prasarana dan SDM yang profesional.",
  ],
  evaluasi: [
    "Evaluasi ketercapaian standar dan indikator terkait sistem tata kelola dan tata pamong yang otonom secara transparan, dan akuntabel yang didukung kapasitas sarana dan prasarana yang memadai dan SDM yang profesional.",
    "Evaluasi ketercapaian standar dan indikator terkait audit mutu pemenuhan tupoksi tata kelola dan tata pamong, sarana dan prasarana dan SDM yang profesional.",
  ],
  pengendalian: [
    "Tindak lanjut hasil evaluasi ketercapaian standar dan indikator terkait sistem tata kelola dan tata pamong yang otonom secara transparan, dan akuntabel yang didukung kapasitas sarana dan prasarana yang memadai dan SDM yang profesional.",
    "Tindak lanjut hasil evaluasi ketercapaian standar dan indikator terkait audit mutu pemenuhan tupoksi tata kelola dan tata pamong, sarana dan prasarana dan SDM yang profesional.",
  ],
  peningkatan: [
    "Peningkatan/optimalisasi hasil ketercapaian standar dan indikator terkait sistem tata kelola dan tata pamong yang otonomi yang didukung kapasitas sarana dan prasarana yang memadai dan SDM yang profesional.",
    "Peningkatan/optimalisasi hasil ketercapaian standar dan indikator terkait pengakuan hasil audit internal di tingkat nasional dan/atau internasional.",
  ],
};

const getCriteriaPoints = (criteriaId: string, subsectionId: string) => {
  const extraMap: Record<string, Record<string, string[]>> = {
    c3: C3_POINTS,
    c4: C4_POINTS,
    c5: C5_POINTS,
  };
  const points =
    CRITERIA_POINTS[criteriaId]?.[subsectionId] ??
    extraMap[criteriaId]?.[subsectionId] ??
    [];

  return points
    .map((point, index) => {
      const letter = String.fromCharCode(65 + index);
      return `<p><strong>${letter}.</strong> ${point}</p>`;
    })
    .join("\n");
};

const makeCriteriaTemplate = (criteriaId: string, subsectionId: string) => {
  const criteria = LAM_INFOKOM_CRITERIA.find((item) => item.id === criteriaId);
  const subsection = getInfokomSubsections(criteriaId).find(
    (item) => item.id === subsectionId
  );

  if (!criteria || !subsection) return "";

  return `<h3><strong>${subsection.label}</strong></h3>
<p>${CRITERIA_BODY[criteriaId][subsectionId]}</p>
${getCriteriaPoints(criteriaId, subsectionId)}
<p>&nbsp;</p>`;
};

const TEMPLATES: Record<string, string> = {
  identitas_pengusul: `<h2>IDENTITAS PENGUSUL</h2>
<p><strong>Perguruan Tinggi</strong> : .......................................................................</p>
<p><strong>Unit Pengelola Program Studi</strong> : .......................................................................</p>
<p><strong>Jenis Program</strong> : .......................................................................</p>
<p><strong>Nama Program Studi</strong> : .......................................................................</p>
<p><strong>Alamat</strong> : .......................................................................</p>
<p><strong>Nomor Telepon</strong> : .......................................................................</p>
<p><strong>E-Mail dan Website</strong> : .......................................................................</p>
<p><strong>Nomor SK Pendirian PT 1)</strong> : .......................................................................</p>
<p><strong>Tanggal SK Pendirian PT</strong> : .......................................................................</p>
<p><strong>Pejabat Penandatangan SK Pendirian PT</strong> : .......................................................................</p>
<p><strong>Nomor SK Pembukaan PS 2)</strong> : .......................................................................</p>
<p><strong>Tanggal SK Pembukaan PS</strong> : .......................................................................</p>
<p><strong>Pejabat Penandatangan SK Pembukaan PS</strong> : .......................................................................</p>
<p><strong>Tahun Pertama Kali Menerima Mahasiswa</strong> : .......................................................................</p>
<p><strong>Peringkat Terbaru Akreditasi PS</strong> : .......................................................................</p>
<p><strong>Nomor SK BAN-PT</strong> : .......................................................................</p>
<p>&nbsp;</p>
<p><strong>Daftar Program Studi di Unit Pengelola Program Studi (UPPS)</strong></p>
<table>
  <tr>
    <th>No.</th>
    <th>Jenis Program</th>
    <th>Nama Program Studi</th>
    <th>Status/Peringkat</th>
    <th>No. dan Tgl. SK</th>
    <th>Tgl. Kadaluarsa</th>
    <th>Jumlah Mahasiswa saat TS 4)</th>
  </tr>
  <tr><td>1</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
  <tr><td>2</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
  <tr><td>...</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
  <tr><td><strong>Jumlah</strong></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
</table>
<p>Keterangan:<br>1) Lampirkan salinan Surat Keputusan Pendirian Perguruan Tinggi.<br>2) Lampirkan salinan Surat Keputusan Pembukaan Program Studi.<br>3) Lampirkan salinan Surat Keputusan Akreditasi Program Studi terbaru.<br>4) Diisi dengan jumlah mahasiswa aktif di masing-masing PS saat TS.</p>`,

  identitas_tim: `<h2>IDENTITAS TIM PENYUSUN LAPORAN EVALUASI DIRI</h2>
<p><strong>Nama</strong> : ......................................................................</p>
<p><strong>NIDN</strong> : ......................................................................</p>
<p><strong>Jabatan</strong> : ......................................................................</p>
<p><strong>Tanggal Pengisian</strong> : DD – MM – YYYY</p>
<p><strong>Tanda Tangan</strong> :</p>`,

  kata_pengantar: `<h2>KATA PENGANTAR</h2>`,

  ringkasan_eksekutif: `<h2>RINGKASAN EKSEKUTIF</h2>`,

  bab1a: `<h2>BAB I. PENDAHULUAN</h2>
<h3><strong>A. Dasar Penyusunan</strong></h3>
<p>Bagian ini menjelaskan kebijakan tentang penyusunan evaluasi diri UPPS dan tujuan penyusunan LED. Pada bagian ini, UPPS perlu dan harus menunjukkan keterkaitan LED dengan rencana pengembangan UPPS.</p>`,

  bab1b: `<h3><strong>B. Tim Penyusun dan Tanggung Jawabnya</strong></h3>
<p>Bagian ini menjelaskan keberadaan tim penyusun LED yang ditugasi oleh UPPS beserta deskripsi tugasnya. Keberadaan tim penyusun dan tugasnya harus ditunjukkan dengan dokumen formal yang disahkan oleh Ketua UPPS, dalam hal ini Dekan atau Ketua Jurusan/ Departemen untuk Universitas/Institut, atau Direktur untuk Politeknik, atau Ketua untuk Sekolah Tinggi, atau yang setingkat.</p>`,

  bab1c: `<h3><strong>C. Mekanisme Kerja Penyusunan LED</strong></h3>
<p>Bagian ini menjelaskan mekanisme pengumpulan data dan informasi, verifikasi dan validasi data, pengecekan konsistensi data, analisis data, identifikasi akar masalah dan penetapan strategi pengembangan yang mengacu pada rencana pengembangan UPPS. Penjelasan tentang mekanisme kerja perlu disertai dengan dengan jadwal kerja tim yang jelas.</p>`,

  kondisi_eksternal: `<h2>BAB II. LAPORAN EVALUASI DIRI</h2>
<h3><strong>A. KONDISI EKSTERNAL</strong></h3>
<p>Pada bagian ini UPPS perlu menjelaskan kondisi eksternal program studi yang terdiri atas lingkungan makro dan lingkungan mikro. Lingkungan makro dengan lingkup nasional dan/atau internasional mencakup aspek kebijakan, ekonomi, sosial, budaya, serta perkembangan ilmu pengetahuan dan teknologi. Lingkungan mikro dengan lingkup (kabupaten/kota/provinsi) mencakup aspek pesaing, pengguna lulusan, sumber calon mahasiswa, sumber calon dosen, sumber tenaga kependidikan, sumber pendanaan, perkuliahan daring (e-learning, pendidikan jarak jauh), kebutuhan dunia usaha/industri dan masyarakat, dan kemitraan. UPPS perlu menganalisis aspek-aspek dalam lingkungan makro dan lingkungan mikro yang relevan dan didukung oleh data sekunder yang dapat mempengaruhi eksistensi/keberadaan dan pengembangan UPPS dan program studi yang diakreditasi.</p>
<p>UPPS perlu mengidentifikasi peluang (opportunity) yang dapat memberikan kesempatan bagi UPPS dan program studi untuk berkembang menjadi lebih sukses dan maju. Selain peluang, UPPS juga perlu mengidentifikasi ancaman (threat) yang diperkirakan dapat mengakibatkan munculnya kesulitan bagi program studi yang diakreditasi, sehingga program studi tidak dapat berkembang.</p>`,

  profil_upps: `<h3><strong>B. PROFIL UNIT PENGELOLA PROGRAM STUDI DAN PROGRAM STUDI YANG DIAKREDITASI</strong></h3>
<p>Bagian ini memuat deskripsi mengenai sejarah UPPS, visi, misi, tujuan, strategi dan tata nilai, struktur organisasi, mahasiswa dan lulusan, sumber daya manusia (dosen dan tenaga kependidikan), keuangan, sarana dan prasarana, sistem penjaminan mutu internal, serta kinerja UPPS yang disajikan secara ringkas dan mengemukakan hal-hal yang terpenting.</p>
<p><strong>1. Sejarah Unit Pengelola Program Studi</strong></p>
<p>Bagian ini berisi penjelasan UPPS tentang riwayat pendirian dan perkembangan UPPS dan program studi yang diakreditasi secara ringkas dan jelas.</p>
<p><strong>2. Visi, Misi, Tujuan, Strategi, dan Tata Nilai</strong></p>
<p>Bagian ini berisi penjelasan singkat visi, misi, tujuan, strategi, dan tata nilai yang diterapkan di UPPS dan program studi yang diakreditasi (visi keilmuan/scientific vision).</p>
<p><strong>3. Organisasi dan Tata Kerja</strong></p>
<p>Bagian ini memuat informasi terkait dokumen formal organisasi dan tata kerja yang berlaku, termasuk uraian secara ringkas tentang struktur organisasi dan tata kerja, tugas pokok, dan fungsinya (tupoksi) di lingkup UPPS dan program studi yang diakreditasi.</p>
<p><strong>4. Mahasiswa dan Lulusan</strong></p>
<p>Bagian ini memuat penjelasan ringkas tentang jumlah mahasiswa dan lulusan di program studi yang diakreditasi, termasuk kualitas masukan, prestasi akademik dan non-akademik terbaik yang dicapai mahasiswa dan lulusan, serta kinerja lulusan.</p>
<p><strong>5. Dosen dan Tenaga Kependidikan</strong></p>
<p>Bagian ini memuat penjelasan ringkas tentang jumlah dan kualifikasi SDM (dosen dan tenaga kependidikan) di program studi yang diakreditasi, kecukupan, kinerja, dan prestasi terbaik yang pernah dicapai.</p>
<p><strong>6. Keuangan, Sarana, dan Prasarana</strong></p>
<p>Bagian ini memuat penjelasan ringkas tentang kecukupan, kelayakan, kualitas, dan aksesibilitas sumber daya keuangan, sarana dan prasarana di UPPS dan program studi yang diakreditasi.</p>
<p><strong>7. Sistem Penjaminan Mutu</strong></p>
<p>Bagian ini memuat penjelasan implementasi Sistem Penjaminan Mutu yang sesuai dengan kebijakan, organisasi, instrumen yang dikembangkan di tingkat perguruan tinggi, monitoring dan evaluasi, pelaporan, dan tindak lanjutnya. Penjelasan sebaiknya berdasar siklus (PPEPP) yang dilakukan oleh UPPS dan program studi yang diakreditasi, termasuk pengakuan mutu dari lembaga audit eksternal, lembaga akreditasi, dan lembaga sertifikasi.</p>
<p><strong>8. Kinerja Unit Pengelola Program Studi dan Program Studi yang Diakreditasi</strong></p>
<p>Bagian ini memuat penjelasan tentang luaran dan capaian yang paling diunggulkan oleh UPPS dan program studi yang diakreditasi.</p>
<p>Berdasarkan profil yang diuraikan di atas, UPPS perlu mengidentifikasi kekuatan (strength) dan kelemahan (weakness) UPPS dan PS yang diakreditasi, serta seberapa layak (feasible) UPPS dan program studi dalam menghadapi peluang (opportunities) dan ancaman (threats) yang dianalisis pada bagian analisis kondisi eksternal di atas.</p>`,

  suplemen: `<h3><strong>D. SUPLEMEN PROGRAM STUDI</strong></h3>
<p>Untuk melengkapi kriteria Relevansi Pendidikan, UPPS dan program studi yang diakreditasi melengkapi Instrumen Suplemen Program Studi sesuai dengan bidang studinya, dengan penekanan pada muatan kurikulum yang dimiliki Program Studi. Isi bagian ini sesuai dengan bidang studi program studi yang diakreditasi.</p>

<h4><strong>BIDANG SISTEM INFORMASI</strong></h4>
<p><strong>1. Mata Kuliah Inti/Khas Sistem Informasi</strong></p>
<p>Bagian ini berisi uraian daftar mata kuliah inti Program Studi Sarjana Sistem Informasi. Mata kuliah inti tersebut harus memuat cakupan fundamental dan praktik terapan dalam pengembangan aplikasi, manajemen data dan informasi, infrastruktur teknologi informasi, analisis, desain dan akuisisi sistem, dan manajemen proyek. Uraian disertai dengan bukti berupa RPS mata kuliah inti tersebut.</p>
<p><strong>2. Mata Kuliah Domain Spesifik dan Lingkungan Sistem Informasi</strong></p>
<p>Bagian ini berisi uraian daftar mata kuliah terkait Domain Spesifik dan Lingkungan Sistem Informasi. Merujuk ACM IS 2020, bagian ini perlu memuat cakupan peran sistem informasi dalam organisasi dan kebutuhan sistem informasi bagi berbagai pemangku kepentingan. Uraian harus disertai dokumen hasil pemetaan mata kuliah.</p>
<p><strong>3. Mata Kuliah terkait Metode atau Analisis Kuantitatif dan Kualitatif</strong></p>
<p>Bagian ini berisi penjelasan struktur kurikulum yang memuat daftar mata kuliah berisi metode atau analisis kuantitatif dan kualitatif yang relevan, misalkan matematika, statistika dan probabilitas. Penjelasan harus disertai dengan dokumen RPS mata kuliah tersebut.</p>
<p><strong>4. Proyek Utama (Capstone Project) Sistem Informasi</strong></p>
<p>Bagian ini berisi penjelasan pelaksanaan proyek utama yang relevan: terdiri dari 3-6 SKS, dikerjakan secara berkelompok, dilaksanakan pada semester 5-8, menyelesaikan masalah riil di lapangan. Bukti yang perlu disampaikan adalah dokumen rancangan kurikulum dan laporan proyek utama.</p>

<h4><strong>BIDANG TEKNOLOGI INFORMASI</strong></h4>
<p><strong>1. Mata Kuliah Inti/Khas Teknologi Informasi</strong></p>
<p>Bagian ini berisi uraian daftar mata kuliah inti/khas Teknologi Informasi yang mencakup: (1) Dasar-dasar perangkat lunak; (2) Manajemen informasi; (3) Teknologi platform; (4) Paradigma sistem; (5) Teknologi sistem terintegrasi; (6) Jaringan; (7) Sistem web dan seluler; (8) Desain pengalaman pengguna; (9) Prinsip keamanan siber; (10) Praktek profesional global; serta (11) proyek utama. Uraian disertai dengan bukti berupa RPS.</p>
<p><strong>2. Mata Kuliah Pilihan Domain Spesifik Teknologi Informasi</strong></p>
<p>Bagian ini berisi uraian daftar mata kuliah pilihan Domain Teknologi Informasi yang merujuk ke ACM-IEEE-CS IT 2017, mencakup: aplikasi seluler, komputasi awan, Internet of Things, skalabilitas dan analitik data, sistem dan layanan virtual, Software Development and Management, dan keamanan siber. Uraian disertai bukti berupa RPS.</p>
<p><strong>3. Mata Kuliah Matematika dan Ilmu Dasar Teknologi Informasi</strong></p>
<p>Bagian ini berisi uraian struktur kurikulum yang memuat daftar mata kuliah terkait matematika dan ilmu dasar, misalkan matematika diskrit, aljabar linier, statistik dan probabilitas, analitik data. Penjelasan harus disertai bukti berupa RPS.</p>
<p><strong>4. Proyek Utama (Capstone Project) Teknologi Informasi</strong></p>
<p>Bagian ini berisi uraian pelaksanaan proyek utama yang relevan. Keluaran dapat berupa aplikasi berbasis web, aplikasi seluler, aplikasi manajemen jaringan, aplikasi keamanan siber, aplikasi IOT, dll. Bukti berupa dokumen rancangan kurikulum dan laporan proyek utama.</p>

<h4><strong>BIDANG ILMU KOMPUTER / INFORMATIKA / TEKNIK INFORMATIKA</strong></h4>
<p><strong>1. Mata Kuliah Inti/Khas Ilmu Komputer</strong></p>
<p>Bagian ini berisi uraian daftar mata kuliah inti yang harus memuat cakupan substansial dari: (1) algoritma dan kompleksitas, teori ilmu komputer, dan konsep bahasa pemrograman; (2) setidaknya satu bahasa pemrograman tujuan umum; (3) arsitektur dan organisasi komputer, manajemen informasi, jaringan dan komunikasi, sistem operasi, dan komputasi paralel & terdistribusi; dan (4) sistem berbasis komputasi pada berbagai tingkat abstraksi. Uraian disertai bukti berupa RPS.</p>
<p><strong>2. Mata Kuliah Domain Spesifik dan Lingkungan Pengembangan Perangkat Lunak</strong></p>
<p>Bagian ini berisi uraian daftar mata kuliah yang merujuk ke ACM/IEEE-CS 2023 dan CC 2020, mencakup: dasar-dasar pengembangan perangkat lunak, pengembangan berbasis platform, dan pendekatan rekayasa perangkat lunak pada sistem khusus. Uraian harus disertai dokumen hasil pemetaan mata kuliah.</p>
<p><strong>3. Mata Kuliah Matematika Ilmu Komputer</strong></p>
<p>Bagian ini berisi penjelasan tentang struktur kurikulum yang memuat mata kuliah terkait matematika yang mencakup pengantar kalkulus dan matematika diskrit, serta beberapa tambahan bidang matematika seperti aljabar linier, metode numerik, statistik dan probabilitas. Penjelasan harus disertai dokumen berupa RPS.</p>
<p><strong>4. Proyek Utama (Capstone Project) Ilmu Komputer</strong></p>
<p>Bagian ini berisi penjelasan tentang pelaksanaan proyek utama. Keluaran dari proyek ini berupa perangkat lunak. Penjelasan mencakup pedoman pelaksanaan, mata kuliah yang diintegrasi, dan perangkat lunak sebagai hasil proyek. Bukti yang perlu disampaikan berupa dokumen rancangan kurikulum dan laporan proyek utama.</p>

<h4><strong>BIDANG SISTEM KOMPUTER</strong></h4>
<p><strong>1. Mata Kuliah Inti/Khas Sistem Komputer</strong></p>
<p>Bagian ini berisi uraian daftar mata kuliah inti yang harus memuat cakupan substansial dari: (1) algoritma komputasi dan desain perangkat lunak; (2) desain digital, rangkaian dan elektronika, dan pengolahan sinyal; (3) arsitektur dan organisasi komputer, jaringan komputer, manajemen sumber daya sistem dan keamanan informasi; (4) sistem tertanam; (5) implementasi dan pemeliharaan komponen perangkat lunak dan perangkat keras; dan (6) proyek utama. Uraian disertai bukti berupa RPS.</p>
<p><strong>2. Mata Kuliah Praktikum atau Bermuatan Praktikum</strong></p>
<p>Bagian ini berisi uraian daftar mata kuliah praktikum yang merujuk ke ACM/IEEE-CS CE 2016 dan CC 2020, mencakup praktikum inti (rangkaian dan elektronika, logika digital, sistem tertanam), praktikum semi-inti (jaringan dan desain perangkat lunak), dan praktikum tambahan. Uraian harus disertai dokumen hasil pemetaan mata kuliah.</p>
<p><strong>3. Mata Kuliah Matematika Sistem Komputer</strong></p>
<p>Bagian ini berisi penjelasan mengenai struktur kurikulum yang memuat daftar mata kuliah terkait matematika yang mencakup matematika, serta beberapa tambahan seperti aljabar linier, analisis fungsi kontinu, statistika dan probabilitas. Penjelasan harus disertai dengan dokumen RPS.</p>
<p><strong>4. Proyek Utama (Capstone Project) Sistem Komputer</strong></p>
<p>Bagian ini berisi penjelasan mengenai pelaksanaan proyek utama. Keluaran dari proyek ini berupa rancangan sistem komputasi dan komponen komputasi dari perangkat keras, misalkan perangkat rumah tangga, perangkat komunikasi, perangkat IOT, perangkat medis. Bukti berupa dokumen rancangan kurikulum dan laporan proyek utama.</p>

<h4><strong>BIDANG REKAYASA PERANGKAT LUNAK</strong></h4>
<p><strong>1. Mata Kuliah Inti Rekayasa Perangkat Lunak</strong></p>
<p>Bagian ini berisi uraian daftar mata kuliah inti yang merujuk ke ACM-IEEE-CS SE2014/IS2020 & IEEE-CS SWEBOK V3.0, mencakup: (1) Pemodelan dan analisis perangkat lunak; (2) Analisis dan spesifikasi kebutuhan; (3) Verifikasi dan validasi; (4) Desain Perangkat Lunak; (5) Kualitas Perangkat Lunak; (6) Proses Perangkat Lunak; (7) Keamanan Perangkat Lunak; serta (8) proyek utama. Uraian harus disertai dokumen hasil pemetaan mata kuliah.</p>
<p><strong>2. Mata Kuliah Dasar-dasar Komputasi dan Praktek Profesional RPL</strong></p>
<p>Bagian ini berisi uraian daftar mata kuliah yang memuat cakupan: (1) Dasar-dasar Komputasi (minimal 10 sks); dan (2) Praktek Profesional (minimal 2 sks) mencakup Keterampilan Komunikasi Khusus RPL dan Profesionalisme. Uraian disertai bukti berupa RPS.</p>
<p><strong>3. Mata Kuliah Dasar-dasar Matematika dan Teknik RPL</strong></p>
<p>Bagian ini berisi penjelasan mengenai struktur mata kuliah yang mencakup: (1) Dasar-dasar matematika (matematika diskrit, statistik dan probabilitas, otomata, dll.); (2) Dasar rekayasa untuk perangkat lunak; (3) Ekonomi teknik untuk perangkat lunak. Penjelasan harus disertai dokumen yang sah.</p>
<p><strong>4. Proyek Utama (Capstone Project) Rekayasa Perangkat Lunak</strong></p>
<p>Bagian ini berisi penjelasan mengenai pelaksanaan proyek utama. Keluaran dapat berupa produk perangkat lunak (software product). Penjelasan mencakup pedoman pelaksanaan, daftar mata kuliah yang diintegrasi, dan hasil-hasil proyek utama. Bukti berupa dokumen rancangan kurikulum dan laporan proyek utama.</p>

<h4><strong>BIDANG SAINS DATA</strong></h4>
<p><strong>1. Mata Kuliah Inti/Khas Sains Data</strong></p>
<p>Bagian ini berisi uraian daftar mata kuliah inti yang harus memuat cakupan substansial dari: a) Data acquisition and representativeness; b) Data management; c) Data preparation and integration; d) Data analysis; e) Model development and deployment; f) Visualization and communication of the knowledge obtained from the data. Uraian disertai bukti berupa RPS.</p>
<p><strong>2. Konsep yang Mencakup dan Diterapkan pada Siklus Hidup Sains Data</strong></p>
<p>Bagian ini berisi uraian daftar mata kuliah yang mencakup: a) Data ethics including legitimate use and algorithmic fairness; b) Governance including privacy, security, and stewardship; c) Applied Statistical and mathematical topics; d) Computing including data structures and algorithms; e) Advanced data science coursework. Uraian disertai bukti berupa RPS.</p>
<p><strong>3. Mata Kuliah Matematika Sains Data</strong></p>
<p>Bagian ini berisi penjelasan mengenai struktur kurikulum yang memuat daftar mata kuliah terkait matematika yang mencakup matematika, serta beberapa tambahan seperti aljabar linier, analisis fungsi kontinu, statistika dan probabilitas. Penjelasan harus disertai dengan dokumen RPS.</p>
<p><strong>4. Proyek Utama (Capstone Project) Sains Data</strong></p>
<p>Bagian ini berisi penjelasan mengenai pelaksanaan proyek utama. Keluaran dari proyek ini berupa sistem atau aplikasi yang berupa penerapan ilmu sains data dalam lingkungan nyata. Penjelasan mencakup pedoman pelaksanaan, mata kuliah yang diintegrasi, dan sistem atau aplikasi sebagai hasil proyek. Bukti berupa dokumen rancangan kurikulum dan laporan proyek utama.</p>`,

  penutup: `<h2>BAB III. PENUTUP</h2>
<p>Bagian ini berisi deskripsi yang memuat kesimpulan akhir dari Laporan Evaluasi Diri.</p>`,
};

LAM_INFOKOM_CRITERIA.forEach((criteria) => {
  getInfokomSubsections(criteria.id).forEach((subsection) => {
    const key = `${criteria.id}_${subsection.id}`;
    TEMPLATES[key] = makeCriteriaTemplate(criteria.id, subsection.id);
  });
});

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
  {
    key: "identitas_pengusul",
    label: "Identitas Pengusul",
    groupId: "pendahuluan",
    groupLabel: "Pendahuluan",
    template: TEMPLATES.identitas_pengusul,
  },
  {
    key: "identitas_tim",
    label: "Identitas Tim Penyusun",
    groupId: "pendahuluan",
    groupLabel: "Pendahuluan",
    template: TEMPLATES.identitas_tim,
  },
  {
    key: "kata_pengantar",
    label: "Kata Pengantar",
    groupId: "pendahuluan",
    groupLabel: "Pendahuluan",
    template: TEMPLATES.kata_pengantar,
  },
  {
    key: "ringkasan_eksekutif",
    label: "Ringkasan Eksekutif",
    groupId: "pendahuluan",
    groupLabel: "Pendahuluan",
    template: TEMPLATES.ringkasan_eksekutif,
  },
  {
    key: "bab1a",
    label: "A. Dasar Penyusunan",
    groupId: "bab1",
    groupLabel: "BAB I · Pendahuluan",
    template: TEMPLATES.bab1a,
  },
  {
    key: "bab1b",
    label: "B. Tim Penyusun",
    groupId: "bab1",
    groupLabel: "BAB I · Pendahuluan",
    template: TEMPLATES.bab1b,
  },
  {
    key: "bab1c",
    label: "C. Mekanisme Kerja",
    groupId: "bab1",
    groupLabel: "BAB I · Pendahuluan",
    template: TEMPLATES.bab1c,
  },
  {
    key: "kondisi_eksternal",
    label: "A. Kondisi Eksternal",
    groupId: "bab2",
    groupLabel: "BAB II · Laporan Evaluasi Diri",
    template: TEMPLATES.kondisi_eksternal,
  },
  {
    key: "profil_upps",
    label: "B. Profil UPPS",
    groupId: "bab2",
    groupLabel: "BAB II · Laporan Evaluasi Diri",
    template: TEMPLATES.profil_upps,
  },
  ...LAM_INFOKOM_CRITERIA.flatMap((criteria) =>
    getInfokomSubsections(criteria.id).map((subsection) => {
      const key = `${criteria.id}_${subsection.id}`;

      return {
        key,
        label: subsection.label,
        groupId: criteria.id,
        groupLabel: `${criteria.code} ${criteria.fullName}`,
        criteriaId: criteria.id,
        subsectionId: subsection.id,
        template: TEMPLATES[key],
      };
    })
  ),
  {
    key: "suplemen",
    label: "D. Suplemen",
    groupId: "suplemen",
    groupLabel: "D. Suplemen",
    template: TEMPLATES.suplemen,
  },
  {
    key: "penutup",
    label: "Penutup",
    groupId: "penutup",
    groupLabel: "BAB III · Penutup",
    template: TEMPLATES.penutup,
  },
];

const SIDEBAR_GROUPS = (() => {
  const map = new Map<
    string,
    { label: string; sections: NavSection[]; isCriteria: boolean }
  >();

  ALL_SECTIONS.forEach((section) => {
    if (!map.has(section.groupId)) {
      map.set(section.groupId, {
        label: section.groupLabel,
        sections: [],
        isCriteria: !!section.criteriaId,
      });
    }

    map.get(section.groupId)!.sections.push(section);
  });

  return Array.from(map.entries()).map(([id, data]) => ({ id, ...data }));
})();

const EMPTY_CONTENT = ["", "<p></p>"];
const hasContent = (html: string) => !EMPTY_CONTENT.includes((html ?? "").trim());

function EditorToolbar({ editor, onUploadImage }: { editor: ReturnType<typeof useEditor> | null; onUploadImage: () => void }) {
  if (!editor) return null;

  const btn = (active: boolean, disabled = false) =>
    cn(
      "p-1.5 rounded text-gray-600 hover:bg-gray-200 transition-colors",
      active && "bg-gray-200 text-gray-900",
      disabled && "opacity-30 cursor-not-allowed hover:bg-transparent"
    );
  const prevent = (e: React.MouseEvent) => e.preventDefault();
  const sep = <div className="w-px h-5 bg-gray-300 mx-1" />;
  const isInTable = editor.isActive("table");
  const isLink = editor.isActive("link");

  const handleSetLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Masukkan URL:", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-gray-200 bg-gray-50/50 shrink-0">
      <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={btn(false, !editor.can().undo())} title="Undo"><Undo2 className="w-4 h-4" /></button>
      <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={btn(false, !editor.can().redo())} title="Redo"><Redo2 className="w-4 h-4" /></button>
      {sep}
      <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btn(editor.isActive("heading", { level: 1 }))} title="Heading 1"><Heading1 className="w-4 h-4" /></button>
      <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))} title="Heading 2"><Heading2 className="w-4 h-4" /></button>
      {sep}
      <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))} title="Bold"><Bold className="w-4 h-4" /></button>
      <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))} title="Italic"><Italic className="w-4 h-4" /></button>
      <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive("underline"))} title="Underline"><UnderlineIcon className="w-4 h-4" /></button>
      {sep}
      <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))} title="Bullet List"><List className="w-4 h-4" /></button>
      <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))} title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
      {sep}
      <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().setTextAlign("left").run()} className={btn(editor.isActive({ textAlign: "left" }))} title="Align Left"><AlignLeft className="w-4 h-4" /></button>
      <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().setTextAlign("center").run()} className={btn(editor.isActive({ textAlign: "center" }))} title="Align Center"><AlignCenter className="w-4 h-4" /></button>
      <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().setTextAlign("right").run()} className={btn(editor.isActive({ textAlign: "right" }))} title="Align Right"><AlignRight className="w-4 h-4" /></button>
      {sep}
      <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className={btn(false)} title="Sisipkan Tabel"><TableIcon className="w-4 h-4" /></button>
      {isInTable && (<>
        {sep}
        <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().addRowBefore().run()} className={btn(false)} title="Tambah baris di atas"><span className="flex items-center gap-0.5 text-[10px] font-medium"><Plus className="w-3 h-3" />Baris↑</span></button>
        <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().addRowAfter().run()} className={btn(false)} title="Tambah baris di bawah"><span className="flex items-center gap-0.5 text-[10px] font-medium"><Plus className="w-3 h-3" />Baris↓</span></button>
        <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().deleteRow().run()} className={btn(false)} title="Hapus baris"><span className="flex items-center gap-0.5 text-[10px] font-medium"><Minus className="w-3 h-3" />Baris</span></button>
        {sep}
        <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().addColumnBefore().run()} className={btn(false)} title="Tambah kolom di kiri"><span className="flex items-center gap-0.5 text-[10px] font-medium"><Plus className="w-3 h-3" />Kol←</span></button>
        <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().addColumnAfter().run()} className={btn(false)} title="Tambah kolom di kanan"><span className="flex items-center gap-0.5 text-[10px] font-medium"><Plus className="w-3 h-3" />Kol→</span></button>
        <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().deleteColumn().run()} className={btn(false)} title="Hapus kolom"><span className="flex items-center gap-0.5 text-[10px] font-medium"><Minus className="w-3 h-3" />Kol</span></button>
        {sep}
        <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().deleteTable().run()} className={cn(btn(false), "text-red-500 hover:bg-red-50")} title="Hapus tabel"><span className="flex items-center gap-0.5 text-[10px] font-medium"><Trash2 className="w-3 h-3" />Tabel</span></button>
      </>)}
      {sep}
      <button type="button" onMouseDown={prevent} onClick={handleSetLink} className={btn(isLink)} title={isLink ? "Edit link" : "Sisipkan link"}><LinkIcon className="w-4 h-4" /></button>
      {isLink && (
        <button type="button" onMouseDown={prevent} onClick={() => editor.chain().focus().unsetLink().run()} className={btn(false)} title="Hapus link"><Unlink className="w-4 h-4" /></button>
      )}
      {sep}
      <button type="button" onMouseDown={prevent} onClick={(e) => { e.preventDefault(); onUploadImage(); }} className={btn(false)} title="Upload Foto"><ImageIcon className="w-4 h-4" /></button>
    </div>
  );
}

interface FormVersion {
  id: string;
  createdAt: Date;
  periode: string;
  createdByName?: string;
}

function LAMInfokomFormContent() {
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
    Object.fromEntries(ALL_SECTIONS.map((section) => [section.key, section.template ?? ""]))
  );

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [versions, setVersions] = useState<FormVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [activePeriode, setActivePeriode] = useState<string>(new Date().getFullYear().toString());
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([new Date().getFullYear().toString()]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSaveRef = useRef<() => Promise<void>>(() => Promise.resolve());

  const activeSection =
    ALL_SECTIONS.find((section) => section.key === activeKey) ?? ALL_SECTIONS[0];
  const activeSectionIndex = ALL_SECTIONS.findIndex(
    (section) => section.key === activeKey
  );
  const activeGroup = SIDEBAR_GROUPS.find(
    (group) => group.id === activeSection.groupId
  );

  useEffect(() => {
    if (!prodiIdParam && user?.prodiId) {
      setProdiId(user.prodiId);
    }
  }, [prodiIdParam, user]);

  useEffect(() => {
    if (!prodiId) return;
    apiClient
      .get(`/prodi/${prodiId}`)
      .then((res) => setProdiName(res.data.data?.fullname ?? "Program Studi"))
      .catch(() => setProdiName("Program Studi"));
  }, [prodiId]);

  useEffect(() => {
    if (!prodiId) return;
    setHistoryLoading(true);
    apiClient.get(`/led/form/history/${prodiId}/${activePeriode}?template=INFOKOM`)
      .then(async (res) => {
        const data: any[] = res.data.data || [];
        const mapped: FormVersion[] = data.map((v) => ({
          id: v.id,
          createdAt: new Date(v.createdAt),
          periode: v.periode,
          createdByName: v.createdBy?.name,
        }));
        setVersions(mapped);
        setAvailablePeriods((prev) => {
          const allPeriods = new Set([...prev, ...data.map((v) => v.periode)]);
          return Array.from(allPeriods).sort();
        });
        if (mapped.length > 0) {
          const latestId = mapped[0].id;
          setActiveVersionId(latestId);
          try {
            const vRes = await apiClient.get(`/led/form/${latestId}`);
            const raw = vRes.data.data?.content;
            const parsed: Record<string, string> = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? {});
            setContent(parsed);
          } catch { /* silently fail, template defaults will show */ }
        } else {
          setActiveVersionId(null);
        }
      })
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [prodiId, activePeriode]);


  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      ImageResize,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
    ],
    content: content[activeKey] ?? "",
    immediatelyRender: false,
    editorProps: { attributes: { class: "tiptap" } },
    onUpdate: () => {
      setSaveStatus("idle");

      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }

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

  const handleLoadVersion = useCallback(async (versionId: string) => {
    try {
      const res = await apiClient.get(`/led/form/${versionId}`);
      const raw = res.data.data?.content;
      const parsed: Record<string, string> = typeof raw === "string" ? JSON.parse(raw) : (raw ?? {});
      setContent((prev) => ({ ...prev, ...parsed }));
      if (editor) editor.commands.setContent(parsed[activeKey] ?? "", { emitUpdate: false });
      setActiveVersionId(versionId);
      setShowHistory(false);
      toast({ title: "Versi dimuat", description: "Konten versi yang dipilih berhasil dimuat ke editor." });
    } catch {
      toast({ variant: "destructive", title: "Gagal memuat versi", description: "Terjadi kesalahan." });
    }
  }, [editor, activeKey, toast]);

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
    const allContent = { ...content, [activeKey]: html };
    setContent(allContent);
    setSaveStatus("saving");
    try {
      const res = await apiClient.post(`/led/form/${prodiId}`, {
        template: "INFOKOM",
        periode: activePeriode,
        content: JSON.stringify(allContent),
      });
      const v = res.data.data;
      const newVersion: FormVersion = {
        id: v.id,
        createdAt: new Date(v.createdAt),
        periode: v.periode,
        createdByName: v.createdBy?.name,
      };
      setVersions((prev) => [newVersion, ...prev]);
      setActiveVersionId(newVersion.id);
      setLastSavedAt(new Date());
      setSaveStatus("saved");
    } catch {
      setSaveStatus("idle");
      toast({ variant: "destructive", title: "Gagal menyimpan", description: "Terjadi kesalahan. Coba lagi." });
    }
  }, [editor, prodiId, activeKey, activePeriode, content, toast]);

  useEffect(() => { handleSaveRef.current = handleSave; }, [handleSave]);

  useEffect(() => () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); }, []);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleUploadImage = useCallback(async (file: File) => {
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await apiClient.post("/led/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url: string = res.data.data?.url;
      if (url && editor) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    } catch {
      toast({ variant: "destructive", title: "Upload Gagal", description: "Gagal mengunggah gambar. Coba lagi." });
    } finally {
      setIsUploadingImage(false);
    }
  }, [editor, toast]);


  const handleExport = useCallback(async () => {
    if (!prodiId) return;
    setIsExporting(true);
    toast({ title: "Menyiapkan Unduhan", description: "Dokumen Word sedang digenerate..." });
    try {
      const exportId = activeVersionId || prodiId;
      const response = await apiClient.get(`/led/export/form/${exportId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const contentDisposition = response.headers["content-disposition"];
      let filename = `LED_${prodiName || prodiId}.docx`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/);
        if (match?.[1]) filename = decodeURIComponent(match[1]);
      }
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: "Unduhan Berhasil", description: "File LED berhasil diunduh." });
    } catch {
      toast({ variant: "destructive", title: "Unduhan Gagal", description: "Terjadi kesalahan saat mengunduh." });
    } finally {
      setIsExporting(false);
    }
  }, [prodiId, prodiName, activeVersionId, toast]);

  const getCriteriaProgress = (criteriaId: string) => {
    const sections = ALL_SECTIONS.filter(
      (section) => section.criteriaId === criteriaId
    );

    const filled = sections.filter((section) => {
      const value =
        section.key === activeKey ? editor?.getHTML() ?? "" : content[section.key] ?? "";

      return hasContent(value);
    }).length;

    return { filled, total: sections.length };
  };

  const goPrev = () => {
    if (activeSectionIndex <= 0) return;

    const previousSection = ALL_SECTIONS[activeSectionIndex - 1];

    setExpandedGroups((groups) => new Set([...groups, previousSection.groupId]));
    handleSelectSection(previousSection.key);
  };

  const goNext = () => {
    if (activeSectionIndex >= ALL_SECTIONS.length - 1) return;

    const nextSection = ALL_SECTIONS[activeSectionIndex + 1];

    setExpandedGroups((groups) => new Set([...groups, nextSection.groupId]));
    handleSelectSection(nextSection.key);
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Memuat otorisasi...</div>;
  }

  if (!user) return null;

  const canEdit = user.role === "KAPRODI" || user.role === "TIM_PRODI";

  if (!prodiId) {
    return (
      <div className="p-8 text-red-500 font-bold">
        Program Studi tidak ditemukan. Pastikan Anda terdaftar di sebuah Program Studi.
      </div>
    );
  }

  const totalSections = ALL_SECTIONS.length;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden -m-8">
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm shrink-0">
        <div className="flex items-center space-x-5">
          <button
            onClick={() =>
              router.push("/led" + (prodiIdParam ? `?prodiId=${prodiId}` : ""))
            }
            className="flex items-center text-gray-600 hover:text-gray-900 font-medium text-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>

          <div className="h-6 w-px bg-gray-200" />

          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-base font-bold text-gray-800">
                LED Formulir Narasi
              </h1>
              <p className="text-xs text-gray-500">{prodiName} · LAM INFOKOM</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {saveStatus === "saved" && lastSavedAt && (
            <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tersimpan{" "}
              {lastSavedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
          {saveStatus === "idle" && lastSavedAt && (
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <Clock className="w-3.5 h-3.5" /> Ada perubahan belum tersimpan
            </div>
          )}

          {/* Riwayat Versi */}
          <div className="relative">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 border border-gray-200"
            >
              <History className="w-3.5 h-3.5" />
              Riwayat {versions.length > 0 && <span className="bg-gray-200 text-gray-700 rounded-full px-1.5 py-0.5 text-[10px] font-bold">{versions.length}</span>}
            </button>
            {showHistory && (
              <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Riwayat Versi</p>
                  <select
                    value={activePeriode}
                    onChange={(e) => { setActivePeriode(e.target.value); setActiveVersionId(null); }}
                    className="text-[11px] border border-gray-200 rounded px-1.5 py-0.5 bg-white text-gray-600 focus:outline-none"
                  >
                    {availablePeriods.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {historyLoading ? (
                    <div className="p-5 text-sm text-gray-400 text-center">Memuat riwayat...</div>
                  ) : versions.length === 0 ? (
                    <div className="p-5 text-sm text-gray-400 text-center">Belum ada versi tersimpan.<br />Klik Simpan untuk membuat versi pertama.</div>
                  ) : (
                    versions.map((v, idx) => (
                      <div
                        key={v.id}
                        onClick={() => handleLoadVersion(v.id)}
                        className={cn(
                          "px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 flex items-start gap-3",
                          activeVersionId === v.id && "bg-blue-50"
                        )}
                      >
                        <div className="mt-0.5">
                          {idx === 0 ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Clock className="w-3.5 h-3.5 text-gray-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800">
                            Versi {versions.length - idx} {idx === 0 && <span className="text-green-600">(Terbaru)</span>}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {v.createdAt.toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                          {v.createdByName && <p className="text-[10px] text-gray-400 truncate">{v.createdByName}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting || !prodiId}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 border-gray-200 rounded-md hover:bg-gray-50 gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Mengunduh..." : "Unduh Word"}
          </Button>
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
              Formulir LED · LAM INFOKOM
            </p>
          </div>

          <nav className="flex-1 overflow-y-auto">
            {SIDEBAR_GROUPS.map((group) => {
              const isExpanded = expandedGroups.has(group.id);
              const isGroupActive = activeSection.groupId === group.id;
              const isSingle = group.sections.length === 1;
              const isCriteria = group.isCriteria;
              const criteriaId = group.sections[0]?.criteriaId;
              const progress =
                isCriteria && criteriaId ? getCriteriaProgress(criteriaId) : null;
              const criterion = LAM_INFOKOM_CRITERIA.find(
                (criteria) => criteria.id === criteriaId
              );
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

                          if (next.has(group.id)) {
                            next.delete(group.id);
                          } else {
                            next.add(group.id);
                          }

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
                      <span
                        className={cn(
                          "shrink-0 text-[9px] font-bold w-7 h-5 flex items-center justify-center rounded",
                          isGroupActive
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {criterion.code}
                      </span>
                    )}

                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-[11px] font-semibold leading-tight truncate",
                          isGroupActive ? "text-blue-700" : "text-gray-700"
                        )}
                      >
                        {isCriteria && criterion ? criterion.name : group.label}
                      </p>

                      {progress && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {progress.filled}/{progress.total} diisi
                        </p>
                      )}
                    </div>

                    {allFilled && (
                      <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                    )}

                    {!isSingle &&
                      (isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      ))}
                  </button>

                  {!isSingle && isExpanded && (
                    <div className="bg-gray-50/30">
                      {group.sections.map((section) => {
                        const isActive = activeKey === section.key;
                        const value =
                          isActive
                            ? editor?.getHTML() ?? ""
                            : content[section.key] ?? "";
                        const filled = hasContent(value);

                        return (
                          <button
                            key={section.key}
                            onClick={() => handleSelectSection(section.key)}
                            className={cn(
                              "w-full text-left pl-9 pr-3 py-1.5 text-[11px] flex items-center justify-between gap-2 transition-colors",
                              isActive
                                ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-l-blue-500"
                                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            )}
                          >
                            <span className="truncate">{section.label}</span>
                            {filled && (
                              <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                            )}
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

        <main className="flex-1 flex flex-col overflow-hidden bg-white relative">
          <div className="px-6 py-2.5 border-b border-gray-100 shrink-0 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-500">
              {activeGroup?.label}
            </span>

            {!activeGroup?.isCriteria || activeGroup.sections.length > 1 ? (
              <>
                <span className="text-xs text-gray-300">›</span>
                <span className="text-xs font-medium text-blue-600">
                  {activeSection.label}
                </span>
              </>
            ) : null}

            {!canEdit && (
              <span className="text-xs text-amber-600 ml-2">(read-only)</span>
            )}
          </div>

          {canEdit && <EditorToolbar editor={editor} onUploadImage={() => imageInputRef.current?.click()} />}

          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadImage(file);
              e.target.value = "";
            }}
          />
          {isUploadingImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
              <span className="text-sm text-blue-600 font-medium animate-pulse">Mengunggah gambar...</span>
            </div>
          )}

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

export { LAMInfokomFormContent };


export default function LAMInfokomFormPage() {
  return (
    <Suspense fallback={<div className="p-8">Memuat formulir...</div>}>
      <LAMInfokomFormContent />
    </Suspense>
  );
}