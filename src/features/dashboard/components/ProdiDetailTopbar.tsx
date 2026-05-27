// Lokasi: src/features/dashboard/components/ProdiDetailTopbar.tsx

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Edit2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ProdiDetailTopbar({ 
  dashboard, myProdis, editMode, setEditMode, isInfokom, isCriterionView 
}: any) {
  const router = useRouter()
  const [showProdiSelector, setShowProdiSelector] = useState(false)
  const canEdit = dashboard?.accessInfo?.canEdit
  const isReadOnly = dashboard?.accessInfo?.isReadOnly

  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{dashboard.prodi.fullname}</h1>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isInfokom ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
          }`}>
            {isInfokom ? "LAM Infokom" : "LAM Teknik"}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {isCriterionView 
            ? "Detail progres pengisian dokumen kriteria akreditasi" 
            : "Ringkasan progres kesiapan akreditasi program studi"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {!isCriterionView && myProdis.length > 1 && (
          <div className="relative">
            <Button variant="outline" className="text-sm bg-white" onClick={() => setShowProdiSelector(!showProdiSelector)}>
              Ganti Prodi <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            {showProdiSelector && (
              <div className="absolute z-50 top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[240px] py-1">
                {myProdis.map((prodi: any) => (
                  <button
                    key={prodi.id}
                    onClick={() => { router.push(`/dashboard-prodi/${prodi.id}`); setShowProdiSelector(false) }}
                    className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors ${
                      prodi.id === dashboard.prodi.id ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600" : "text-gray-700"
                    }`}
                  >
                    {prodi.fullname}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        {!isCriterionView && canEdit && (
          <Button variant={editMode ? "default" : "outline"} className={!editMode ? "bg-white" : ""} onClick={() => setEditMode(!editMode)}>
            <Edit2 className="w-4 h-4 mr-2" />{editMode ? "Selesai Edit" : "Edit Dashboard"}
          </Button>
        )}
        {!isCriterionView && isReadOnly && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-200 rounded-md shadow-sm">
            <Lock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Read Only</span>
          </div>
        )}
      </div>
    </header>
  )
}