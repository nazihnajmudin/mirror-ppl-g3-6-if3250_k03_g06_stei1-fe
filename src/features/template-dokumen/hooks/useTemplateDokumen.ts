"use client"

import { useEffect, useRef, useState } from "react"
import apiClient from "@/lib/api-client"
import { useUser } from "@/hooks/useUser"

export function useTemplateDokumen() {
  const { user, loading } = useUser()

  const [templates, setTemplates] = useState<any[]>([])
  const [isFetching, setIsFetching] = useState(true)

  const [isDeleting, setIsDeleting] = useState(false)

  const fetchTemplates = async () => {
    setIsFetching(true)

    try {
      const res = await apiClient.get("/templates")
      setTemplates(res.data.data || [])
    } catch (error) {
      console.error("Gagal mengambil template", error)
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    if (user) fetchTemplates()
  }, [user])

  const isAdmin =
    user?.role === "SUPER_ADMIN" ||
    user?.role === "PIMPINAN"

  const displayCategories = isAdmin
    ? ["INFOKOM", "TEKNIK"]
    : Array.from(new Set(templates.map((t) => t.category)))

  const getTemplate = (category: string, type: string) => {
    return templates.find(
      (t) => t.category === category && t.type === type
    )
  }

  const handleUpload = async (
    category: string,
    type: string,
    fileToUpload: File
  ) => {
    if (!fileToUpload) return

    try {
      const formData = new FormData()

      formData.append("file", fileToUpload)
      formData.append(
        "name",
        `Template ${type} LAM ${category}`
      )
      formData.append("type", type)
      formData.append("category", category)

      await apiClient.post(
        "/templates/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      alert(
        `Template ${type} LAM ${category} berhasil diunggah!`
      )

      fetchTemplates()
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Gagal mengunggah template."
      )
      throw error // Re-throw so component knows it failed
    }
  }

  const handleDelete = async (
    templateId: string,
    category: string,
    type: string
  ) => {
    if (
      !confirm(
        `Yakin ingin menghapus Template ${type} LAM ${category}?`
      )
    )
      return

    setIsDeleting(true)

    try {
      await apiClient.delete(`/templates/${templateId}`)

      alert("Template berhasil dihapus.")

      fetchTemplates()
    } catch (error) {
      alert("Gagal menghapus template.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownload = async (
    template: any,
    extension: string
  ) => {
    if (!template) return

    try {
      const response = await apiClient.get(
        `/templates/download/${template.id}`,
        {
          responseType: "blob",
        }
      )

      let safeFilename = template.name

      if (
        !safeFilename
          .toLowerCase()
          .endsWith(extension)
      ) {
        safeFilename += extension
      }

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      )

      const link = document.createElement("a")

      link.href = url

      link.setAttribute("download", safeFilename)

      document.body.appendChild(link)

      link.click()

      document.body.removeChild(link)

      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert("Gagal mengunduh template.")
    }
  }

  return {
    user,
    loading,
    templates,
    isFetching,
    isAdmin,
    displayCategories,
    getTemplate,
    isDeleting,
    handleUpload,
    handleDelete,
    handleDownload,
  }
}