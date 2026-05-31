"use client"

import React from "react"
import { Loader2 } from "lucide-react"

import { useTemplateDokumen } from "@/features/template-dokumen/hooks/useTemplateDokumen"
import { TemplateDokumenMain } from "@/features/template-dokumen/Components/TemplateDokumenMain"

export default function TemplateDokumenPage() {
  const logic = useTemplateDokumen()

  if (logic.loading || logic.isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!logic.user) return null

  return <TemplateDokumenMain logic={logic} />
}