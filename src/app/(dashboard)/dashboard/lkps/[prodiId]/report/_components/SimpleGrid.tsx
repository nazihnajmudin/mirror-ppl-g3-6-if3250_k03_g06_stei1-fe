'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface SimpleGridProps {
  data: any[][];
  config: any;
  onDataChange: (newData: any[][]) => void;
}

export default function SimpleGrid({ data, config, onDataChange }: SimpleGridProps) {
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...data];
    if (!newData[rowIndex]) newData[rowIndex] = [];
    newData[rowIndex][colIndex] = value;
    onDataChange(newData);
  };

  // Helper to render nested headers if they exist
  const renderHeaders = () => {
    if (config.nestedHeaders && config.nestedHeaders.length > 0) {
      return config.nestedHeaders.map((row: any[], i: number) => (
        <TableRow key={`h-row-${i}`} className="bg-gray-50/50">
          {row.map((cell: any, j: number) => {
            const label = typeof cell === 'object' ? cell.label : cell;
            const colspan = typeof cell === 'object' ? cell.colspan : 1;
            const rowspan = typeof cell === 'object' ? cell.rowspan : 1;
            return (
              <TableHead 
                key={`h-cell-${i}-${j}`}
                colSpan={colspan} 
                rowSpan={rowspan}
                className="border border-gray-200 text-center font-bold text-gray-700 text-xs py-2 px-1"
              >
                {label}
              </TableHead>
            );
          })}
        </TableRow>
      ));
    }

    // Default headers if no nested headers
    return (
      <TableRow className="bg-gray-50/50">
        {Array.from({ length: config.columns?.length || 10 }).map((_, i) => (
          <TableHead key={i} className="border border-gray-200 font-bold text-gray-700">
            Kolom {i + 1}
          </TableHead>
        ))}
      </TableRow>
    );
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-auto max-h-[600px]">
      <Table>
        <TableHeader className="sticky top-0 bg-white z-10">
          {renderHeaders()}
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={config.columns?.length || 10} className="text-center py-10 text-gray-400 italic">
                Tidak ada data. Klik "Tambah Baris" untuk memulai.
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-gray-50/30 transition-colors">
                <TableCell className="bg-gray-50/50 border border-gray-200 text-center font-medium text-gray-500 text-xs w-10 sticky left-0 z-10">
                  {rowIndex + 1}
                </TableCell>
                {Array.from({ length: config.columns?.length || 10 }).map((_, colIndex) => (
                  <TableCell key={colIndex} className="p-0 border border-gray-100 min-w-[150px]">
                    <Input
                      value={row[colIndex] || ''}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      className="border-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded-none h-10 text-sm px-3 shadow-none"
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
