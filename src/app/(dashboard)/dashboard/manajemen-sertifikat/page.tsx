"use client";

import { useEffect, useState, useRef } from "react";
import { Award, Pencil, Upload, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";
import { getAllProdi, getAccreditation, upsertAccreditation, uploadAccreditationCertificate, downloadCertificate, isLocalCertificate } from "@/lib/api-prodi";
import type { Prodi, AccreditationInfo } from "@/types/api.types";
import { cn } from "@/lib/utils";

interface ProdiWithAccreditation extends Omit<Prodi, 'accreditation'> {
  accreditation: AccreditationInfo | null;
}

type AccreditationStatus = "Aktif" | "Segera Habis" | "Kadaluarsa" | "Belum Diatur";

function getStatus(endDate?: string | null): AccreditationStatus {
  if (!endDate) return "Belum Diatur";
  const end = new Date(endDate);
  const now = new Date();
  if (end < now) return "Kadaluarsa";
  const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diff <= 90) return "Segera Habis";
  return "Aktif";
}

function statusBadge(status: AccreditationStatus) {
  const map: Record<AccreditationStatus, string> = {
    Aktif: "bg-green-100 text-green-800",
    "Segera Habis": "bg-yellow-100 text-yellow-800",
    Kadaluarsa: "bg-red-100 text-red-800",
    "Belum Diatur": "bg-gray-100 text-gray-600",
  };
  return <Badge className={cn("text-xs font-medium", map[status])}>{status}</Badge>;
}

function formatDate(iso?: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function toInputDate(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

export default function ManajemenSertifikatPage() {
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();

  const [data, setData] = useState<ProdiWithAccreditation[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<ProdiWithAccreditation | null>(null);
  const [form, setForm] = useState({ grade: "", startDate: "", endDate: "", certificateUrl: "" });
  const [certFile, setCertFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const prodis = await getAllProdi();
      const withAccreditation = await Promise.all(
        prodis.map(async (p) => {
          try {
            const accreditation = await getAccreditation(p.id);
            return { ...p, accreditation };
          } catch {
            return { ...p, accreditation: null };
          }
        })
      );
      setData(withAccreditation);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Gagal memuat data", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openEdit = (prodi: ProdiWithAccreditation) => {
    setEditing(prodi);
    setCertFile(null);
    setForm({
      grade: prodi.accreditation?.grade ?? "",
      startDate: toInputDate(prodi.accreditation?.startDate),
      endDate: toInputDate(prodi.accreditation?.endDate),
      certificateUrl: prodi.accreditation?.certificateUrl?.startsWith("http") ? (prodi.accreditation.certificateUrl) : "",
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await upsertAccreditation(editing.id, {
        grade: form.grade || undefined,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      });

      if (certFile) {
        await uploadAccreditationCertificate(editing.id, certFile);
      }

      toast({ title: "Berhasil", description: "Data akreditasi berhasil disimpan" });
      setEditing(null);
      await fetchData();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Gagal menyimpan", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (userLoading) return null;
  if (user?.role !== "SUPER_ADMIN") {
    return <div className="p-8 text-center text-sm text-gray-500">Akses ditolak. Halaman ini hanya untuk Super Admin.</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Manajemen Sertifikat Akreditasi</h1>
            <p className="text-sm text-gray-500">Kelola sertifikat dan masa berlaku akreditasi seluruh program studi</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daftar Program Studi</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-400">Memuat data...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program Studi</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Berlaku Dari</TableHead>
                  <TableHead>Berlaku S.d.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sertifikat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((prodi) => {
                  const acc = prodi.accreditation;
                  const status = getStatus(acc?.endDate);
                  const hasCert = !!acc?.certificateUrl;
                  const isLocalCert = isLocalCertificate(acc?.certificateUrl);
                  return (
                    <TableRow key={prodi.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{prodi.fullname}</div>
                        {prodi.abbreviation && <div className="text-xs text-gray-400">{prodi.abbreviation}</div>}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-blue-700">{acc?.grade ?? "-"}</span>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(acc?.startDate)}</TableCell>
                      <TableCell className="text-sm">{formatDate(acc?.endDate)}</TableCell>
                      <TableCell>{statusBadge(status)}</TableCell>
                      <TableCell>
                        {hasCert ? (
                          isLocalCert ? (
                            <button
                              onClick={() => downloadCertificate(prodi.id, acc?.certificateOriginalName)}
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {acc?.certificateOriginalName ?? "Unduh"}
                            </button>
                          ) : (
                            <a
                              href={acc!.certificateUrl!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Lihat
                            </a>
                          )
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(prodi)}>
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Edit Akreditasi — {editing.fullname}</h2>

            <div className="space-y-3">
              <div>
                <Label htmlFor="grade" className="text-sm">Grade Akreditasi</Label>
                <Input
                  id="grade"
                  value={form.grade}
                  onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
                  placeholder="Contoh: A, B, Unggul, Baik Sekali"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="startDate" className="text-sm">Berlaku Dari</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-sm">Berlaku S.d.</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm">Upload File Sertifikat (PDF/JPEG/PNG, maks 10MB)</Label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => setCertFile(e.target.files?.[0] ?? null)}
                  />
                  <Button variant="outline" size="sm" type="button" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Pilih File
                  </Button>
                  {certFile && <span className="text-xs text-gray-600 truncate max-w-[200px]">{certFile.name}</span>}
                  {!certFile && editing.accreditation?.certificateOriginalName && (
                    <span className="text-xs text-gray-400">File sekarang: {editing.accreditation.certificateOriginalName}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditing(null)} disabled={saving} className="border-gray-300 text-gray-700 hover:bg-gray-100">Batal</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
