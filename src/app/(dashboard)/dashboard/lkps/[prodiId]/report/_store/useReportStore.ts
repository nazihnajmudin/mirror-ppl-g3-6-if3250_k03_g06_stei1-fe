import { create } from 'zustand';

export type SheetData = any[][];

interface ReportState {
  data: Record<string, SheetData>;
  setData: (allData: Record<string, SheetData>) => void;
  updateSheetData: (sheetName: string, newData: SheetData) => void;
  resetData: () => void;
}

const INITIAL_SHEETS = [
  'PS', 'PSPPI', '1', '2a1', '2a2', '2a3', '2b', '3a1', '3a2', '3a3', '3a4', '3a5', '3b', '3c', 
  '4a', '4b', '4c', '4d', '4e', '4f-1', '4f-2', '4f-3', '4f-4', '4g', '4h', '4i', '4j', '4k', 
  '5a', '5b', '5c', '6a', '6b', '6c1', '6c2', '6d', '6e1', '6e2', '6e3-1', '6e3-2', '6e3-3', 
  '6e3-4', '6e4', '6f1', '6f2', '6g1', '6g2', '6h1', '6h2', '6i', '7a', '7b'
];

const createInitialState = () => {
  const state: Record<string, SheetData> = {};
  INITIAL_SHEETS.forEach((sheet) => {
    state[sheet] = []; 
  });
  return state;
};

export const useReportStore = create<ReportState>((set) => ({
  data: createInitialState(),
  setData: (allData: Record<string, SheetData>) => set({ data: allData }),
  updateSheetData: (sheetName, newData) =>
    set((state) => ({
      data: {
        ...state.data,
        [sheetName]: JSON.parse(JSON.stringify(newData)), // Deep copy to ensure state change detection
      },
    })),
  resetData: () => set({ data: createInitialState() }),
}));
