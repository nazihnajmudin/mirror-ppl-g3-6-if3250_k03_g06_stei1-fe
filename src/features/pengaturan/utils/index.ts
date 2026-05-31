export interface Threshold {
  id: string
  name: string
  value: number
  updatedAt: string
}

export const getDisplayName = (name: string) => {
  switch (name) {
    case 'accreditation_expiry_warning_days': return 'Ambangi Masa Berlaku Akreditasi (Hari)'
    case 'document_inactivity_days': return 'Ambangi Ketidakaktifan Dokumen (Hari)'
    default: return name
  }
}

export const getDescription = (name: string) => {
  switch (name) {
    case 'accreditation_expiry_warning_days': 
      return 'Jumlah hari sebelum akreditasi berakhir untuk memicu notifikasi peringatan.'
    case 'document_inactivity_days': 
      return 'Jumlah hari ketidakaktifan dokumen DRAFT sebelum memicu notifikasi informasi.'
    default: return ''
  }
}