import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Activity, FileText, FileSpreadsheet, ChevronDown, TableProperties } from "lucide-react"

export function ProdiMainContent({ 
  dashboard, 
  formContentLoading, computedCriteria, setSelectedCriterion, setSelectedSubItem,
  computedLkpsCriteria, lkpsProgressLoading 
}: any) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'LED' | 'LKPS'>('LED')
  const [expandedLkps, setExpandedLkps] = useState<string | null>(null)

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "bg-gray-900"
    if (progress >= 75) return "bg-blue-500"
    if (progress >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('LED')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'LED' 
                ? 'border-blue-600 text-blue-700 bg-white' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4" /> Progres LED
          </button>
          <button
            onClick={() => setActiveTab('LKPS')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'LKPS' 
                ? 'border-emerald-500 text-emerald-700 bg-white' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Progres LKPS
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 flex-1">
          
          {activeTab === 'LED' && (
            formContentLoading ? (
              <p className="text-xs text-gray-400 text-center py-10 animate-pulse">Memuat data progress LED...</p>
            ) : (
              computedCriteria.map((criterion: any) => (
                <button
                  key={`led-${criterion.id}`}
                  onClick={() => { setSelectedCriterion(criterion); setSelectedSubItem(null) }}
                  className="w-full text-left group"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                      {criterion.code} — {criterion.name}
                    </span>
                    <span className="text-xs font-bold text-gray-600 ml-2 flex-shrink-0">{criterion.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 group-hover:bg-gray-200 transition-colors">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(criterion.progress)} group-hover:opacity-90 transition-opacity`}
                      style={{ width: `${criterion.progress}%` }}
                    />
                  </div>
                </button>
              ))
            )
          )}

          {activeTab === 'LKPS' && (
            lkpsProgressLoading ? (
               <p className="text-xs text-gray-400 text-center py-10 animate-pulse">Memuat data progress LKPS...</p>
            ) : (
              <div className="space-y-3">
                {computedLkpsCriteria.map((lkps: any) => {
                  const isExpanded = expandedLkps === lkps.id

                  return (
                    <div key={`lkps-${lkps.id}`} className="w-full text-left bg-white rounded-lg transition-all">
                      <button 
                        onClick={() => setExpandedLkps(isExpanded ? null : lkps.id)}
                        className="w-full group pb-2"
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-2">
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-emerald-600' : 'group-hover:text-gray-600'}`} />
                            <span className={`text-xs font-semibold transition-colors ${isExpanded ? 'text-emerald-700' : 'text-gray-800 group-hover:text-emerald-700'}`}>
                              {lkps.code} — {lkps.name}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-gray-600 ml-2 flex-shrink-0">
                            {lkps.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(lkps.progress)}`}
                            style={{ width: `${lkps.progress}%` }}
                          />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="mt-2 mb-4 pl-6 pr-2 space-y-1.5 border-l-2 border-emerald-100 ml-2 animate-in slide-in-from-top-2 duration-200">
                          {lkps.subsections.map((sub: any) => (
                            <button
                              key={sub.id}
                              onClick={() => router.push(`/lkps?sheet=${sub.id}&prodiId=${dashboard?.prodi?.id}`)}
                              className="w-full flex items-center justify-between p-2 rounded-md hover:bg-emerald-50 text-left transition-colors group/sub"
                            >
                              <div className="flex items-center gap-2">
                                <TableProperties className="w-3.5 h-3.5 text-gray-400 group-hover/sub:text-emerald-600" />
                                <span className="text-[11px] font-medium text-gray-600 group-hover/sub:text-emerald-800">
                                  {sub.id} - {sub.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-gray-400">{sub.progress}%</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 group-hover/sub:bg-emerald-100 group-hover/sub:text-emerald-700 transition-colors">
                                  Isi Data →
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          )}

        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 flex items-center gap-2 border-b border-gray-100">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-gray-900">Indikator Kritis</h2>
          </div>
          <div className="px-5 py-4 max-h-[220px] overflow-y-auto">
            {dashboard?.criticalIndicators?.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-3">Saat ini tidak ada indikator kritis</p>
            ) : (
              <div className="space-y-2">
                {dashboard?.criticalIndicators?.map((indicator: any) => (
                  <div key={indicator.id} className="flex items-start gap-2 p-2.5 bg-red-50 rounded-lg border border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-red-900">{indicator.name}</p>
                      <p className="text-xs text-red-700 mt-0.5">Status: {indicator.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Aktivitas Terbaru</h2>
          </div>
          <div className="px-5 py-2 max-h-[300px] overflow-y-auto">
            {dashboard?.recentActivities?.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Belum ada aktivitas</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {dashboard?.recentActivities?.map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-3 py-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                      <span className="text-[10px] font-bold text-blue-600">
                        {activity.user.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-gray-900 truncate">{activity.user}</p>
                        <span className="text-[10px] text-gray-400 flex-shrink-0 flex items-center gap-1">
                          {new Date(activity.timestamp).toLocaleDateString("id-ID", {
                            hour: "2-digit", minute: "2-digit"
                          })}
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{activity.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}