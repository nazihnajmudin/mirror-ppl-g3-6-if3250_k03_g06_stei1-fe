import { FileSpreadsheet, FileText } from "lucide-react"

export interface TemplateItem {
  id: string
  name: string
  type: "LKPS" | "LED"
  category: string
}

export const getTemplateConfig = (type: string) => {
  const isLED = type === "LED"

  return {
    isLED,
    icon: isLED ? FileText : FileSpreadsheet,
    accept: isLED ? ".doc,.docx" : ".xls,.xlsx",
    formatName: isLED ? "Word (.docx)" : "Excel (.xlsx)",
    extension: isLED ? ".docx" : ".xlsx",
  }
}

export const getCategoryLabel = (category: string) => {
  return category === "INFOKOM"
    ? "LAM Infokom"
    : "LAM Teknik"
}