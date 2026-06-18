"use client";

import React, { useEffect, useState } from "react";
import {
  Clock3,
  Loader2,
  NotebookPen,
  Plus,
  UserRound,
} from "lucide-react";

import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

type DocumentType = "LKPS" | "LED" | "EVIDEN";
type MonitoringStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

type MonitoringItem = {
  id: string;
  indicatorCode: string | null;
  indicatorName: string;
  note: string;
  evaluation: string | null;
  recommendation: string | null;
  status: MonitoringStatus;
  reviewedAt: string | null;
  createdAt: string;
  createdBy?: {
    name: string;
    email: string;
    role: string;
  };
};

interface MonitoringDialogProps {
  documentType: DocumentType;
  documentId: string;
  documentLabel: string;
  triggerLabel?: string;
  triggerClassName?: string;
  compact?: boolean;
}

const statusOptions: Array<{
  value: MonitoringStatus;
  label: string;
}> = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
];

const formatDate = (value: string | null) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusBadgeClass = (status: MonitoringStatus) => {
  if (status === "RESOLVED")
    return "bg-emerald-100 text-emerald-700";

  if (status === "IN_PROGRESS")
    return "bg-amber-100 text-amber-700";

  return "bg-slate-100 text-slate-700";
};

export function MonitoringDialog({
  documentType,
  documentId,
  documentLabel,
  triggerLabel = "Monitoring",
  triggerClassName,
  compact = false,
}: MonitoringDialogProps) {
  const { user } = useAuth();
  const isTimProdi = user?.role === "TIM_PRODI";

  const [open, setOpen] = useState(false);

  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [history, setHistory] = useState<MonitoringItem[]>([]);

  const [indicatorCode, setIndicatorCode] = useState("");
  const [indicatorName, setIndicatorName] = useState("");
  const [note, setNote] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [recommendation, setRecommendation] = useState("");

  const [status, setStatus] =
    useState<MonitoringStatus>("OPEN");

  const [reviewedAt, setReviewedAt] = useState("");

  const resetForm = () => {
    setIndicatorCode("");
    setIndicatorName("");
    setNote("");
    setEvaluation("");
    setRecommendation("");
    setStatus("OPEN");
    setReviewedAt("");
  };

  const loadHistory = async () => {
    setLoadingHistory(true);

    try {
      const response = await apiClient.get(
        `/monitoring-evaluasi/history/${documentType}/${documentId}`
      );

      setHistory(response.data.data || []);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadHistory();
    }
  }, [open, documentType, documentId]);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!indicatorName.trim() || !note.trim()) return;

    setSubmitting(true);

    try {
      await apiClient.post("/monitoring-evaluasi", {
        documentType,
        documentId,
        indicatorCode: indicatorCode.trim() || null,
        indicatorName: indicatorName.trim(),
        note: note.trim(),
        evaluation: evaluation.trim() || null,
        recommendation:
          recommendation.trim() || null,
        status,
        reviewedAt: reviewedAt || null,
      });

      resetForm();
      await loadHistory();
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, newStatus: MonitoringStatus) => {
    try {
      await apiClient.put(`/monitoring-evaluasi/${id}`, { status: newStatus });
      await loadHistory();
    } catch (error) {
      console.error("Gagal mengubah status:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant={compact ? "outline" : "default"}
            size={compact ? "sm" : "default"}
            className={cn(
              "gap-2",
              compact
                ? "h-8 text-xs font-semibold"
                : "font-semibold",
              triggerClassName
            )}
          >
            <NotebookPen className="w-4 h-4" />
            {triggerLabel}
          </Button>
        }
      />

      <DialogContent
        className="
          !w-[95vw]
          !max-w-[1400px]
          h-[92vh]
          p-0
          overflow-hidden
          bg-white
          flex
          flex-col
        "
      >
        {/* HEADER */}
        <div className="border-b px-8 py-5 shrink-0">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-2xl font-bold">
              Monitoring & Evaluasi
            </DialogTitle>

            <DialogDescription className="text-sm text-gray-500">
              {documentLabel} - catatan monitoring,
              evaluasi, dan tindak lanjut.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-8 py-6">
            <div
              className={cn(
                "grid gap-8 min-h-full",
                isTimProdi ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-[1.7fr_1fr]"
              )}
            >
              {/* LEFT CARD */}
              {!isTimProdi && (
                <div
                  className="
                    rounded-2xl
                    border
                    bg-gray-50
                    p-6
                    min-w-0
                    flex
                    flex-col
                  "
                >
                  <form
                  id="monitoring-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* TOP INPUT */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-gray-500">
                        Kode Indikator
                      </label>

                      <Input
                        value={indicatorCode}
                        onChange={(e) =>
                          setIndicatorCode(e.target.value)
                        }
                        placeholder="Contoh: C3, 2a, 5b"
                        className="w-full bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-gray-500">
                        Nama Indikator
                      </label>

                      <Input
                        value={indicatorName}
                        onChange={(e) =>
                          setIndicatorName(e.target.value)
                        }
                        placeholder="Masukkan nama indikator"
                        required
                        className="w-full bg-white"
                      />
                    </div>
                  </div>

                  {/* NOTE */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-500">
                      Catatan Monitoring
                    </label>

                    <Textarea
                      value={note}
                      onChange={(e) =>
                        setNote(e.target.value)
                      }
                      placeholder="Tuliskan temuan, catatan, atau isu yang perlu ditindaklanjuti"
                      required
                      className="
                        w-full
                        min-h-[180px]
                        resize-y
                        bg-white
                      "
                    />
                  </div>

                  {/* EVALUATION */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-500">
                      Evaluasi
                    </label>

                    <Textarea
                      value={evaluation}
                      onChange={(e) =>
                        setEvaluation(e.target.value)
                      }
                      placeholder="Ringkas hasil evaluasi atas indikator"
                      className="
                        w-full
                        min-h-[140px]
                        resize-y
                        bg-white
                      "
                    />
                  </div>

                  {/* RECOMMENDATION */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-500">
                      Rekomendasi / Tindak Lanjut
                    </label>

                    <Textarea
                      value={recommendation}
                      onChange={(e) =>
                        setRecommendation(e.target.value)
                      }
                      placeholder="Masukkan langkah tindak lanjut"
                      className="
                        w-full
                        min-h-[140px]
                        resize-y
                        bg-white
                      "
                    />
                  </div>

                  {/* BOTTOM */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-gray-500">
                        Status
                      </label>

                      <Select
                        value={status}
                        onValueChange={(value) =>
                          setStatus(
                            value as MonitoringStatus
                          )
                        }
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>

                        <SelectContent className="bg-white">
                          {statusOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-gray-500">
                        Tanggal Review
                      </label>

                      <Input
                        type="datetime-local"
                        value={reviewedAt}
                        onChange={(e) =>
                          setReviewedAt(e.target.value)
                        }
                        className="w-full bg-white"
                      />
                    </div>
                  </div>
                </form>
              </div>
              )}

              {/* RIGHT CARD */}
              <div
                className="
                  rounded-2xl
                  border
                  bg-white
                  p-6
                  min-w-0
                  overflow-hidden
                  flex
                  flex-col
                "
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Riwayat Evaluasi
                    </h3>

                    <p className="text-sm text-gray-500">
                      Daftar catatan monitoring
                      untuk dokumen ini.
                    </p>
                  </div>

                  {loadingHistory && (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {history.length === 0 &&
                  !loadingHistory ? (
                    <div className="rounded-xl border border-dashed bg-gray-50 p-8 text-center text-sm text-gray-500">
                      Belum ada catatan monitoring.
                    </div>
                  ) : (
                    history.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border bg-gray-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-gray-900 break-normal">
                                {item.indicatorCode
                                  ? `${item.indicatorCode} - `
                                  : ""}
                                {item.indicatorName}
                              </span>

                              {isTimProdi ? (
                                <Select
                                  value={item.status}
                                  onValueChange={(value) => updateStatus(item.id, value as MonitoringStatus)}
                                >
                                  <SelectTrigger className={cn("h-6 border-0 text-xs px-2 min-w-[100px]", statusBadgeClass(item.status))}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {statusOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value} className="text-xs">
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "border-0",
                                    statusBadgeClass(
                                      item.status
                                    )
                                  )}
                                >
                                  {item.status}
                                </Badge>
                              )}
                            </div>

                            <div className="mt-2 space-y-1 text-xs text-gray-500">
                              <p className="flex items-center gap-2">
                                <UserRound className="w-3.5 h-3.5" />
                                {item.createdBy?.name ||
                                  "Tidak diketahui"}
                              </p>

                              <p className="flex items-center gap-2">
                                <Clock3 className="w-3.5 h-3.5" />
                                {formatDate(
                                  item.reviewedAt ||
                                    item.createdAt
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3 text-sm">
                          <div>
                            <p className="text-[11px] font-bold uppercase text-gray-500">
                              Catatan
                            </p>

                            <p className="whitespace-pre-line text-gray-700">
                              {item.note}
                            </p>
                          </div>

                          {item.evaluation && (
                            <div>
                              <p className="text-[11px] font-bold uppercase text-gray-500">
                                Evaluasi
                              </p>

                              <p className="whitespace-pre-line text-gray-700">
                                {item.evaluation}
                              </p>
                            </div>
                          )}

                          {item.recommendation && (
                            <div>
                              <p className="text-[11px] font-bold uppercase text-gray-500">
                                Tindak Lanjut
                              </p>

                              <p className="whitespace-pre-line text-gray-700">
                                {item.recommendation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        {!isTimProdi && (
          <div className="border-t bg-white px-8 py-4 shrink-0">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={resetForm}
            >
              Reset
            </Button>

            <Button
              type="submit"
              form="monitoring-form"
              disabled={submitting}
              className="gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}

              Simpan Catatan
            </Button>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}