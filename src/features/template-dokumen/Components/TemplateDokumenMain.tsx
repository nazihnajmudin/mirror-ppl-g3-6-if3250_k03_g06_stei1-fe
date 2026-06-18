"use client"

import React from "react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { FileText } from "lucide-react"

import { TemplateCard } from "./TemplateCard"
import { getCategoryLabel } from "../utils/page"

export function TemplateDokumenMain({
  logic,
}: {
  logic: any
}) {
  return (
    <div className="space-y-6 w-full">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          Manajemen Template Dokumen
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Repositori Template Dokumen LKPS dan
          LED Akreditasi yang Sedang Berlaku
        </p>
      </header>

      {!logic.isAdmin &&
        logic.displayCategories.length === 0 && (
          <Card className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 shadow-sm">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <FileText className="w-12 h-12 text-gray-300 mb-4" />

              <p className="text-gray-600 font-bold">
                Belum Ada Template Tersedia
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Super Admin belum mengunggah
                template dokumen untuk program
                studi Anda.
              </p>
            </CardContent>
          </Card>
        )}

      {logic.displayCategories.map(
        (category: string) => (
          <Card
            key={category}
            className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
          >
            <CardHeader className="px-6 py-5 border-b border-gray-100">
              <CardTitle className="text-lg font-bold text-gray-900">
                {getCategoryLabel(category)}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-6">
                <TemplateCard
                  category={category}
                  type="LKPS"
                  template={logic.getTemplate(
                    category,
                    "LKPS"
                  )}
                  logic={logic}
                />

                <TemplateCard
                  category={category}
                  type="LED"
                  template={logic.getTemplate(
                    category,
                    "LED"
                  )}
                  logic={logic}
                />
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  )
}