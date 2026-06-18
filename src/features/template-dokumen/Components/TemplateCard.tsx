"use client"

import React, { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Download,
  Loader2,
  UploadCloud,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { getTemplateConfig } from "../utils/page"

export function TemplateCard({
  category,
  type,
  template,
  logic,
}: {
  category: string
  type: string
  template: any
  logic: any
}) {
  const config = getTemplateConfig(type)
  const IconComponent = config.icon

  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelection = (file: File) => {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
    const isLED = type === "LED"

    if (isLED && ![".doc", ".docx"].includes(ext)) {
      alert("Hanya menerima file Word!")
      return false
    }

    if (!isLED && ![".xls", ".xlsx"].includes(ext)) {
      alert("Hanya menerima file Excel (.xls, .xlsx)!")
      return false
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran file maksimal 10MB!")
      return false
    }

    setSelectedFile(file)
    return true
  }

  const handleUploadClick = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    try {
      await logic.handleUpload(category, type, selectedFile)
      setSelectedFile(null)
    } catch (e) {
      // error handled by hook
    } finally {
      setIsUploading(false)
    }
  }

  if (!template) {
    if (logic.isAdmin) {
      return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 flex flex-col h-full">
          <div className="font-bold text-sm mb-4 text-gray-800">
            Template Dokumen {type}
          </div>

          <div
            className={cn(
              "flex-1 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors mb-4",
              isDragging
                ? "border-blue-500 bg-blue-50/50"
                : "border-gray-200 hover:bg-gray-50"
            )}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setIsDragging(false)
            }}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)

              if (e.dataTransfer.files?.length) {
                handleFileSelection(e.dataTransfer.files[0])
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <UploadCloud className="w-8 h-8 text-blue-600 mb-3" />

            {selectedFile ? (
              <div className="text-sm font-medium text-blue-600 truncate max-w-full px-2">
                {selectedFile.name}
              </div>
            ) : (
              <p className="text-xs font-medium text-gray-600">
                Klik atau drag file {config.formatName} ke sini
              </p>
            )}
          </div>

          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            accept={config.accept}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onChange={(e) =>
              e.target.files && handleFileSelection(e.target.files[0])
            }
          />

          <Button
            onClick={handleUploadClick}
            disabled={!selectedFile || isUploading}
            className="h-10 rounded-lg font-bold bg-gray-900 hover:bg-gray-800 text-white"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              `Upload Template ${type}`
            )}
          </Button>
        </div>
      )
    }

    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50/50 shadow-sm p-5 flex flex-col items-center justify-center text-center">
        <div className="font-bold text-sm mb-2 text-gray-800">
          Template Dokumen {type}
        </div>

        <p className="text-xs text-gray-500 italic">
          Belum ada template yang diunggah oleh Admin.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-4">
        <div className="font-bold text-sm text-gray-800">
          Template Dokumen {type}
        </div>

        {logic.isAdmin && (
          <button
            onClick={() => logic.handleDelete(template.id, category, type)}
            disabled={logic.isDeleting}
            className="text-[11px] font-bold text-red-500 hover:text-red-700"
          >
            {logic.isDeleting ? "Menghapus..." : "Hapus"}
          </button>
        )}
      </div>

      <div className="flex-1 relative group border border-gray-200 rounded-lg flex flex-col items-center justify-center bg-gray-50 overflow-hidden mb-4 min-h-[140px]">
        <IconComponent
          className={cn(
            "w-12 h-12 mb-2",
            config.isLED ? "text-blue-500" : "text-emerald-600"
          )}
        />

        <span className="text-xs font-bold text-gray-600 px-4 text-center line-clamp-2">
          {template.name}
        </span>

        <div className="absolute inset-0 bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center backdrop-blur-[2px]">
          <Button
            onClick={() => logic.handleDownload(template, config.extension)}
            className="rounded-lg font-bold bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 shadow-xl"
          >
            <Download className="w-4 h-4 mr-2 text-blue-600" />
            Unduh
          </Button>
        </div>
      </div>

      {!logic.isAdmin ? (
        <Button
          onClick={() => logic.handleDownload(template, config.extension)}
          className="h-10 rounded-lg font-bold bg-gray-900 hover:bg-gray-800 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Unduh Template {type}
        </Button>
      ) : (
        <>
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            accept={config.accept}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onChange={async (e) => {
              if (e.target.files && e.target.files.length > 0) {
                const file = e.target.files[0]
                const isValid = handleFileSelection(file)
                if (!isValid) return;

                setIsUploading(true)
                try {
                  await logic.handleUpload(category, type, file)
                } catch (err) {
                  // error handled by hook
                } finally {
                  setIsUploading(false)
                }
              }
            }}
          />

          <Button
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            disabled={isUploading}
            className="h-10 rounded-lg font-bold bg-gray-900 hover:bg-gray-800 text-white"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              `Ubah Template ${type}`
            )}
          </Button>
        </>
      )}
    </div>
  )
}