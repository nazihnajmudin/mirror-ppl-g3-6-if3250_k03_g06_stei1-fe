import React from "react"
import Link from "next/link"
import { BookOpen, GraduationCap, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { ProdiOption } from "@/types/api.types"

export function ProdiGrid({ prodis }: { prodis: ProdiOption[] }) {
  if (prodis.length === 0) {
    return (
      <Card className="border-gray-200 shadow-sm rounded-2xl">
        <CardContent className="p-8 md:p-16 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-base md:text-lg font-bold text-gray-900 mt-4">Belum ada program studi</h3>
          <p className="text-xs md:text-sm text-gray-500 mt-2 max-w-md mx-auto">
            Anda belum ditugaskan ke program studi manapun. Hubungi administrator untuk mendapatkan akses.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-5 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {prodis.map((prodi) => (
        <Link
          key={prodi.id}
          href={`/dashboard-prodi/${prodi.id}`}
          className="group outline-none"
        >
          <Card className="relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden h-full flex flex-col">
            
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out z-10"></div>

            <CardContent className="p-5 md:p-6 flex flex-col flex-1 pt-6 md:pt-7">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="font-bold text-gray-900 text-base md:text-lg leading-tight group-hover:text-blue-700 transition-colors line-clamp-2">
                    {prodi.fullname}
                  </h3>
                  
                  {(prodi.abbreviation || prodi.degree) && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {prodi.abbreviation && (
                        <span className="text-[11px] font-bold tracking-wider text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md uppercase">
                          {prodi.abbreviation}
                        </span>
                      )}
                      {prodi.degree && (
                        <>
                          {prodi.abbreviation && <span className="text-gray-300 text-[10px]">•</span>}
                          <span className="text-[11px] font-medium text-gray-500">
                            {prodi.degree}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1"></div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-gray-600">Aktif</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-blue-600 group-hover:text-indigo-600 transition-colors">
                  Buka Dashboard
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>

              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}