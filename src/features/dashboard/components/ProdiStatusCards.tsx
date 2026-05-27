import React from "react"

export function ProdiStatusCards({ dashboard }: { dashboard: any }) {
  const getAccreditationColor = (grade: string | null) => {
    if (!grade) return "text-gray-800"
    switch (grade.toLowerCase()) {
      case "unggul": return "text-gray-900"
      case "sangat baik": return "text-blue-700"
      case "baik": return "text-yellow-700"
      default: return "text-gray-800"
    }
  }

  const criteriaArr = dashboard.criteria ?? []
  const ledFormProgress = criteriaArr.length > 0
    ? Math.round(criteriaArr.reduce((acc: number, c: any) => acc + c.progress, 0) / criteriaArr.length)
    : dashboard.documents.led.progress

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Status Akreditasi */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Status Akreditasi</p>
        </div>
        <div className="px-5 py-4">
          <p className={`text-2xl font-bold ${getAccreditationColor(dashboard.accreditation.grade)}`}>
            {dashboard.accreditation.grade || "Belum"}
          </p>
          {dashboard.accreditation.endDate && (
            <p className="text-[10px] text-gray-400 mt-1">
              Berlaku s.d. {new Date(dashboard.accreditation.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      {/* Progress LKPS */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Progress LKPS</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-2xl font-bold text-gray-900">{dashboard.documents.lkps.progress}%</p>
        </div>
      </div>

      {/* Progress LED */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Progress LED</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-2xl font-bold text-gray-900">{ledFormProgress}%</p>
          <p className="text-[10px] text-gray-400 mt-1">Pengisian formulir</p>
        </div>
      </div>

      {/* Skor Simulasi */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Skor Simulasi</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-2xl font-bold text-gray-900">{dashboard.simulationScore}</p>
        </div>
      </div>
    </div>
  )
}