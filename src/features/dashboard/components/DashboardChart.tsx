import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ProdiWithDashboard } from "../hooks/useDashboard"

export function DashboardChart({ prodis }: { prodis: ProdiWithDashboard[] }) {
  const activeProdis = prodis.filter((p) => !p.isSafePeriod)
  const graphData = activeProdis.map((prodi) => {
    const score = prodi.dashboard?.simulationScore || 0
    let color = "bg-[#ff6b6b]" // Perlu Perhatian <200
    if (score >= 200 && score < 301) color = "bg-[#ffd93d]" // Baik 200-300
    else if (score >= 301 && score < 361) color = "bg-[#06b6d4]" // Baik Sekali 301-360
    else if (score >= 361) color = "bg-[#20c997]" // Unggul >=361
    
    return {
      name: prodi.abbreviation || prodi.fullname.slice(0, 10),
      score,
      color,
    }
  })

  const maxScore = Math.max(...graphData.map((d) => d.score), 500)

  return (
    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <CardHeader className="px-6 py-5 border-b border-gray-100 bg-white text-center">
        <CardTitle className="text-lg font-bold text-gray-900">
          Grafik Perbandingan Skor Simulasi Akreditasi
        </CardTitle>
        <div className="flex justify-center flex-wrap gap-5 mt-4 text-[13px] text-gray-600 font-medium">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff6b6b] shadow-sm"></span> Perlu Perhatian (&lt;200)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ffd93d] shadow-sm"></span> Baik (200-300)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#06b6d4] shadow-sm"></span> Baik Sekali (301-360)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#20c997] shadow-sm"></span> Unggul (≥361)
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="px-6 py-8 overflow-x-auto">
        <div className="relative h-[300px] w-full min-w-[600px] mt-2">
          
          {[0, Math.max(maxScore / 4, 125), Math.max(maxScore / 2, 250), Math.max((maxScore * 3) / 4, 375), maxScore || 500].map(
            (val, idx) => (
              <div key={idx} className="absolute w-full flex items-center translate-y-1/2" style={{ bottom: `${(val / (maxScore || 500)) * 100}%` }}>
                <span className="text-[11px] font-bold text-gray-400 w-10 text-right mr-4">{Math.round(val)}</span>
                <div className={cn("flex-1", val === 0 ? "border-t-2 border-gray-300" : "border-t border-dashed border-gray-200")}></div>
              </div>
            )
          )}

          <div className="absolute inset-0 ml-14 flex justify-around items-end z-10">
            {graphData.length > 0 ? (
              graphData.map((d, i) => (
                <div key={i} className="flex flex-col items-center w-16 h-full justify-end group relative">

                  <div
                    className="absolute opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gray-900 text-white text-[11px] font-bold py-1 px-2 rounded pointer-events-none z-20 flex flex-col items-center mb-1.5 translate-y-2 group-hover:translate-y-0 shadow-md"
                    style={{ bottom: `${((d.score || 0) / (maxScore || 500)) * 100}%` }}
                  >
                    {d.score}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-gray-900"></div>
                  </div>

                  <div
                    className={cn("w-14 rounded-t-md transition-all duration-700 shadow-sm group-hover:opacity-80", d.color)}
                    style={{ height: `${((d.score || 0) / (maxScore || 500)) * 100}%` }}
                  />
                  
                  <span className="absolute bottom-0 translate-y-full pt-2 text-[11px] font-bold text-gray-500 whitespace-nowrap">{d.name}</span>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <p>Belum ada data</p>
              </div>
            )}
          </div>
        </div>
        <div className="h-10"></div>
      </CardContent>
    </Card>
  )
}