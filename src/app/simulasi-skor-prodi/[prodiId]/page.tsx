"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, Save, TrendingUp, FileText, CheckCircle, Edit3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/errors"
import { getSimulationScore, updateSimulationQualitative, getProdiById } from "@/lib/api-prodi"
import type { SimulationScore, SimulationIndicator, Prodi } from "@/types/api.types"

export default function SimulasiSkorProdiPage() {
  const params = useParams()
  const router = useRouter()
  const prodiId = params.prodiId as string

  const [simulation, setSimulation] = useState<SimulationScore | null>(null)
  const [prodi, setProdi] = useState<Prodi | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingIndicator, setEditingIndicator] = useState<SimulationIndicator | null>(null)
  const [qualitativeScore, setQualitativeScore] = useState("")
  const [qualitativeNote, setQualitativeNote] = useState("")

  useEffect(() => {
    loadData()
  }, [prodiId])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [simulationRes, prodiRes] = await Promise.all([
        getSimulationScore(prodiId),
        getProdiById(prodiId)
      ])
      setSimulation(simulationRes)
      setProdi(prodiRes)
    } catch (err: unknown) {
      const message = getErrorMessage(err) || "Gagal memuat data simulasi skor"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditQualitative = (indicator: SimulationIndicator) => {
    setEditingIndicator(indicator)
    setQualitativeScore(indicator.qualitativeScore?.toString() || "")
    setQualitativeNote(indicator.qualitativeNote || "")
    setEditDialogOpen(true)
  }

  const handleSaveQualitative = async () => {
    if (!editingIndicator) return

    setSaving(true)
    try {
      const score = Number(qualitativeScore)
      if (qualitativeScore.trim() === '' || isNaN(score)) {
        throw new Error("Skor kualitatif harus diisi dengan angka antara 0-100")
      }
      if (score < 0 || score > 100) {
        throw new Error("Skor kualitatif harus antara 0-100")
      }

      await updateSimulationQualitative(prodiId, [{
        code: editingIndicator.code,
        qualitativeScore: score,
        qualitativeNote: qualitativeNote || null
      }])

      // Reload data
      await loadData()
      setEditDialogOpen(false)
      setEditingIndicator(null)
    } catch (err: unknown) {
      const message = getErrorMessage(err) || "Gagal menyimpan skor kualitatif"
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 300) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (score >= 150) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
    return <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !simulation || !prodi) {
    return (
      <div className="p-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <p className="text-red-700">{error || "Data tidak ditemukan"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Simulasi Skor Akreditasi</h1>
          <p className="text-gray-600 mt-1">
            {prodi.fullname} - {prodi.degree}
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Kembali
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", getScoreColor(simulation.totalScore))}>
              {simulation.totalScore}
            </div>
            <div className="mt-2">
              {getScoreBadge(simulation.totalScore)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kuantitatif</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", getScoreColor(simulation.quantitativeScore))}>
              {simulation.quantitativeScore}
            </div>
            <p className="text-xs text-muted-foreground">70% bobot</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kualitatif</CardTitle>
            <Edit3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", getScoreColor(simulation.qualitativeScore))}>
              {simulation.qualitativeScore || 0}
            </div>
            <p className="text-xs text-muted-foreground">30% bobot</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terakhir Update</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {new Date(simulation.updatedAt).toLocaleDateString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(simulation.updatedAt).toLocaleTimeString('id-ID')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Indikator</CardTitle>
          <p className="text-sm text-gray-600">
            Skor kuantitatif dihitung dari completion LKPS (70%) dan jumlah eviden (30%)
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Indikator</TableHead>
                <TableHead>Kuantitatif</TableHead>
                <TableHead>Kualitatif</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Sheet Completion</TableHead>
                <TableHead>Evidence Count</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {simulation.indicators.map((indicator) => (
                <TableRow key={indicator.code}>
                  <TableCell className="font-medium">{indicator.code}</TableCell>
                  <TableCell>{indicator.name}</TableCell>
                  <TableCell>
                    <span className={cn("font-semibold", getScoreColor(indicator.quantitativeScore))}>
                      {indicator.quantitativeScore}
                    </span>
                  </TableCell>
                  <TableCell>
                    {indicator.qualitativeScore !== null ? (
                      <div>
                        <span className={cn("font-semibold", getScoreColor(indicator.qualitativeScore))}>
                          {indicator.qualitativeScore}
                        </span>
                        {indicator.qualitativeNote && (
                          <p className="text-xs text-gray-500 mt-1">{indicator.qualitativeNote}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={cn("font-semibold", getScoreColor(indicator.totalScore))}>
                      {indicator.totalScore}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${indicator.sheetCompletion}%` }}
                        />
                      </div>
                      <span className="text-sm">{indicator.sheetCompletion}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{indicator.evidenceCount}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => handleEditQualitative(indicator)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Skor Kualitatif</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Indikator</Label>
              <Input
                id="code"
                value={`${editingIndicator?.code} - ${editingIndicator?.name}`}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="qualitativeScore">Skor Kualitatif (0-100)</Label>
              <Input
                id="qualitativeScore"
                type="number"
                min="0"
                max="100"
                value={qualitativeScore}
                onChange={(e) => setQualitativeScore(e.target.value)}
                placeholder="Masukkan skor kualitatif"
              />
            </div>
            <div>
              <Label htmlFor="qualitativeNote">Catatan</Label>
              <Textarea
                id="qualitativeNote"
                value={qualitativeNote}
                onChange={(e) => setQualitativeNote(e.target.value)}
                placeholder="Masukkan catatan kualitatif"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setEditDialogOpen(false)}
                variant="outline"
                disabled={saving}
              >
                Batal
              </Button>
              <Button onClick={handleSaveQualitative} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}