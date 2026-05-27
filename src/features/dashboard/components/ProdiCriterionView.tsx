import React from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Clock, PenLine } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ProdiCriterionView({ 
  prodiId, selectedCriterion, setSelectedCriterion, selectedSubItem, 
  setSelectedSubItem, formContentLoading, formContent, isInfokom, getCriterionSubItems 
}: any) {
  const router = useRouter()
  const subItems = getCriterionSubItems(selectedCriterion)

  return (
    <div className="p-6">
      <button
        onClick={() => { setSelectedCriterion(null); setSelectedSubItem(null) }}
        className="mb-4 text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1"
      >
        ← Kembali ke Dashboard
      </button>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Sub-kriteria: {selectedCriterion.code}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{selectedCriterion.name}</p>
          </div>
          <div className="divide-y divide-gray-100">
            {formContentLoading ? (
              <div className="p-5 text-center text-xs text-gray-400 animate-pulse">Memuat data...</div>
            ) : subItems.length === 0 ? (
              <div className="p-5 text-center text-xs text-gray-400">Tidak ada sub-kriteria.</div>
            ) : subItems.map((item: any) => (
              <button
                key={item.id}
                onClick={() => setSelectedSubItem(item)}
                className={`w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors ${
                  selectedSubItem?.id === item.id ? "bg-teal-50 border-l-4 border-l-teal-500" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {item.filled
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    : <Clock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
                  <span className={`text-xs font-semibold flex-1 ${
                    selectedSubItem?.id === item.id ? "text-teal-700" : "text-gray-800"
                  }`}>
                    {item.name}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{item.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${item.filled ? "bg-green-500" : "bg-gray-200"}`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-3 space-y-4">
          {selectedSubItem ? (
            <>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-800">
                    {selectedCriterion.code} · {selectedSubItem.name}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    selectedSubItem.filled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {selectedSubItem.filled ? "Sudah Diisi" : "Belum Diisi"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${selectedSubItem.filled ? "bg-green-500" : "bg-gray-200"}`}
                    style={{ width: `${selectedSubItem.progress}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-gray-900">Isi Dokumen</h3>
                  <button
                    onClick={() => router.push(
                      `/led/form?prodiId=${prodiId}&template=${isInfokom ? 'lam-infokom' : 'lam-teknik'}`
                    )}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    <PenLine className="w-3 h-3" /> Edit di Form
                  </button>
                </div>
                {selectedSubItem.filled && formContent[`${selectedCriterion.id}_${selectedSubItem.id}`] ? (
                  <div
                    className="text-xs text-gray-700 leading-relaxed max-h-48 overflow-y-auto prose prose-xs"
                    dangerouslySetInnerHTML={{ __html: formContent[`${selectedCriterion.id}_${selectedSubItem.id}`] }}
                  />
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-gray-400 mb-3">Bagian ini belum diisi.</p>
                    <Button
                      size="sm"
                      onClick={() => router.push(
                        `/led/form?prodiId=${prodiId}&template=${isInfokom ? 'lam-infokom' : 'lam-teknik'}`
                      )}
                      className="text-xs"
                    >
                      <PenLine className="w-3 h-3 mr-1" /> Isi Sekarang
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-8 text-center">
              <p className="text-sm text-gray-400">Pilih sub-kriteria untuk melihat detail dan status pengisian</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}