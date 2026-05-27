import { useState, useEffect } from "react"
import { getSimulationScore, updateSimulationQualitative, getProdiById } from "@/lib/api-prodi"
import { getErrorMessage } from "@/lib/errors"
import { SimulationScore, SimulationIndicator, Prodi } from "@/types/api.types"

export function useSimulasiDetail(prodiId: string) {
  const [simulation, setSimulation] = useState<SimulationScore | null>(null)
  const [prodi, setProdi] = useState<Prodi | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingIndicator, setEditingIndicator] = useState<SimulationIndicator | null>(null)
  const [qualitativeScore, setQualitativeScore] = useState("")
  const [qualitativeNote, setQualitativeNote] = useState("")
  const [scoreError, setScoreError] = useState<string | null>(null)

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
      setError(getErrorMessage(err) || "Gagal memuat data simulasi skor")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [prodiId])

  const handleEditQualitative = (indicator: SimulationIndicator) => {
    setEditingIndicator(indicator)
    setQualitativeScore(indicator.qualitativeScore?.toString() || "")
    setQualitativeNote(indicator.qualitativeNote || "")
    setScoreError(null)
    setEditDialogOpen(true)
  }

  const validateScore = (value: string) => {
    if (!value.trim()) { setScoreError(null); return }
    const score = Number(value)
    if (isNaN(score)) setScoreError("Skor harus berupa angka")
    else if (score < 0 || score > 100) setScoreError("Skor harus antara 0-100")
    else setScoreError(null)
  }

  const handleSaveQualitative = async () => {
    if (!editingIndicator) return
    const scoreValue = qualitativeScore.trim()
    const noteValue = qualitativeNote.trim()
    
    if (!scoreValue && !noteValue) { setError("Minimal salah satu dari skor atau catatan harus diisi"); return }
    if (scoreError) { setError("Perbaiki skor kualitatif sebelum menyimpan"); return }

    setSaving(true)
    try {
      const score = scoreValue ? Number(scoreValue) : undefined
      await updateSimulationQualitative(prodiId, [{ code: editingIndicator.code, qualitativeScore: score, qualitativeNote: noteValue || null }])
      await loadData()
      setEditDialogOpen(false)
      setEditingIndicator(null)
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Gagal menyimpan skor kualitatif")
    } finally { setSaving(false) }
  }

  return {
    simulation, prodi, loading, error, setError,
    editDialogOpen, setEditDialogOpen, editingIndicator,
    qualitativeScore, setQualitativeScore, qualitativeNote, setQualitativeNote,
    scoreError, saving,
    handleEditQualitative, validateScore, handleSaveQualitative
  }
}