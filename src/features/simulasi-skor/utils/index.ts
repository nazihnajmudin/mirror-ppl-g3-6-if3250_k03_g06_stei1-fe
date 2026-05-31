export const getScoreColor = (score: number) => {
  if (score >= 361) return "text-emerald-600"
  if (score >= 301) return "text-teal-600"
  if (score >= 200) return "text-yellow-600"
  return "text-red-600"
}

export const getStatusLabel = (score: number) => {
  if (score >= 361) return { label: "Unggul", class: "bg-emerald-100 text-emerald-800 border-emerald-200" }
  if (score >= 301) return { label: "Baik Sekali", class: "bg-sky-100 text-sky-800 border-sky-200" }
  if (score >= 200) return { label: "Baik", class: "bg-yellow-100 text-yellow-800 border-yellow-200" }
  return { label: "Perlu Perhatian", class: "bg-red-100 text-red-800 border-red-200" }
}