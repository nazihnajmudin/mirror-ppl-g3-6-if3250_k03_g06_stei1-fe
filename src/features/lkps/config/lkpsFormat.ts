/**
 * LKPS Format type
 * - INFOKOM: S1 Informatika & S1 Sistem Teknologi Informasi (LAM Infokom format)
 * - TEKNIK:  All other engineering prodi (LAM Teknik format)
 */
export type LKPSFormat = 'INFOKOM' | 'TEKNIK'

/**
 * Determine LKPS format from prodi fullname.
 * Mirrors the backend logic in lkps.config.ts getFormatFromProdiName.
 */
export function getFormatFromProdiName(prodiName: string): LKPSFormat {
  const name = prodiName.toLowerCase().replace(/[^a-z0-9]/g, ' ')
  const infokomKeywords = [
    'informatika',
    'sistem teknologi informasi',
    's1 sti',
    'sarjana informatika',
    'teknik informatika',
  ]
  for (const kw of infokomKeywords) {
    if (name.includes(kw)) return 'INFOKOM'
  }
  return 'TEKNIK'
}

// ---------------------------------------------------------------------------
// Ordered sheet name lists for each format (UI uses this to iterate sheets)
// ---------------------------------------------------------------------------
export const LKPS_SHEET_NAMES_INFOKOM: string[] = [
  'PS', 'PSPPI', '1',
  '2a1', '2a2', '2a3', '2b',
  '3a1', '3a2', '3a3', '3a4', '3a5', '3b', '3c',
  '4a', '4b', '4c', '4d', '4e', '4f-1', '4f-2', '4f-3', '4f-4', '4g', '4h', '4i', '4j', '4k',
  '5a', '5b', '5c',
  '6a', '6b', '6c1', '6c2', '6d',
  '6e1', '6e2', '6e3-1', '6e3-2', '6e3-3', '6e3-4', '6e4',
  '6f1', '6f2', '6g1', '6g2', '6h1', '6h2', '6i',
  '7a', '7b',
]

export const LKPS_SHEET_NAMES_LAMTEKNIK: string[] = [
  'PS',
  '1-1', '1-2', '1-3',
  '2a1', '2a2', '2a3', '2a4', '2b',
  '3a1', '3a2', '3a3', '3a4', '3a5',
  '3b1', '3b2', '3b3', '3b4', '3b5', '3b6', '3b7', '3b8-1', '3b8-2', '3b8-3', '3b8-4',
  '3c',
  '4a', '4b', '4c',
  '5a-1', '5a-2', '5a-3', '5a-4',
  '5b-1', '5b-2', '5b-3',
  '5c', '5d',
  '6a', '6b', '7',
  '8a', '8b1', '8b2', '8c', '8d1', '8d2', '8e1', '8e2',
  '8f1', '8f2', '8f3', '8f4', '8f5-1', '8f5-2', '8f5-3', '8f5-4',
  '9a', '9b',
]

export function getSheetNamesByFormat(format: LKPSFormat): string[] {
  return format === 'INFOKOM' ? LKPS_SHEET_NAMES_INFOKOM : LKPS_SHEET_NAMES_LAMTEKNIK
}
