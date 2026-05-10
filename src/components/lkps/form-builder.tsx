"use client"

import React, { useState } from 'react';
import { Plus, Trash2, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import LKPSFormField from './form-field';

interface Column {
  key: string;
  label: string;
  type: 'number' | 'text' | 'textarea' | 'date' | 'url' | 'boolean' | 'select';
  options?: string[];
  autoCalculated?: boolean;
}

interface Config {
  columns: Column[];
  rowType: 'free' | 'fixed';
  fixedRows?: string[];
}

interface Props {
  config: Config;
  data: any[];
  onChange: (data: any[]) => void;
  isLocked?: boolean;
}

export default function LKPSFormBuilder({ config, data, onChange, isLocked = false }: Props) {
  const [expandedRows, setExpandedRows] = useState<number[]>([0]); // Default expand first row

  // DEBUG
  console.log('LKPSFormBuilder received config:', config);
  console.log('LKPSFormBuilder received data:', data);

  const handleAddRow = () => {
    if (isLocked) return;
    const newRow = config.columns.reduce((acc, col) => {
      acc[col.key] = col.type === 'boolean' ? false : '';
      return acc;
    }, {} as any);
    onChange([...data, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    if (isLocked) return;
    onChange(data.filter((_, i) => i !== index));
  };

  const handleFieldChange = (rowIndex: number, fieldKey: string, value: any) => {
    if (isLocked) return;
    const updated = [...data];
    updated[rowIndex] = {
      ...updated[rowIndex],
      [fieldKey]: value
    };
    onChange(updated);
  };

  const toggleRowExpanded = (index: number) => {
    if (expandedRows.includes(index)) {
      setExpandedRows(expandedRows.filter(i => i !== index));
    } else {
      setExpandedRows([...expandedRows, index]);
    }
  };

  // Compact table view on desktop, card view on mobile
  return (
    <div className="space-y-4">
      {isLocked && (
        <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm flex items-center gap-2 font-medium border border-amber-200">
          <Lock className="w-4 h-4" /> Dokumen ini berstatus FINAL dan terkunci. Anda tidak dapat mengubah datanya.
        </div>
      )}

      {/* Desktop: Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-3 py-2 text-left font-medium w-12">No</th>
              {config.columns.map((col) => (
                <th 
                  key={col.key} 
                  className="px-3 py-2 text-left font-medium border-r"
                >
                  {col.label}
                  {col.autoCalculated && (
                    <span className="text-xs text-gray-500 ml-1">(auto)</span>
                  )}
                </th>
              ))}
              {config.rowType === 'free' && (
                <th className="px-3 py-2 text-center font-medium w-20">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-600 bg-gray-50">{rowIndex + 1}</td>
                {config.columns.map((col) => (
                  <td 
                    key={`${rowIndex}-${col.key}`}
                    className="px-3 py-2 border-r"
                  >
                    {col.autoCalculated ? (
                      <span className="text-gray-500 italic">
                        {row[col.key]}
                      </span>
                    ) : (
                      <LKPSFormField
                        column={col}
                        value={row[col.key]}
                        onChange={(value) => handleFieldChange(rowIndex, col.key, value)}
                        disabled={isLocked}
                      />
                    )}
                  </td>
                ))}
                {config.rowType === 'free' && (
                  <td className="px-3 py-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRow(rowIndex)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Card View */}
      <div className="md:hidden space-y-3">
        {data.map((row, rowIndex) => (
          <Card key={rowIndex} className="p-4">
            <div 
              className="flex justify-between items-center cursor-pointer mb-3"
              onClick={() => toggleRowExpanded(rowIndex)}
            >
              <h3 className="font-semibold text-sm">
                Row {rowIndex + 1}
              </h3>
              <span className="text-xs text-gray-500">
                {expandedRows.includes(rowIndex) ? '▼' : '▶'}
              </span>
            </div>

            {expandedRows.includes(rowIndex) && (
              <div className="space-y-3 border-t pt-3">
                {config.columns.map((col) => (
                  <div key={col.key}>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      {col.label}
                    </label>
                    {col.autoCalculated ? (
                      <div className="text-sm text-gray-500 italic py-2">
                        {row[col.key]}
                      </div>
                    ) : (
                      <LKPSFormField
                        column={col}
                        value={row[col.key]}
                        onChange={(value) => handleFieldChange(rowIndex, col.key, value)}
                        compact={true}
                        disabled={isLocked}
                      />
                    )}
                  </div>
                ))}

                {config.rowType === 'free' && !isLocked && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteRow(rowIndex)}
                    className="w-full mt-2"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Row
                  </Button>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Add Row Button (only for free rows) */}
      {config.rowType === 'free' && !isLocked && (
        <div className="pt-4">
          <Button
            variant="outline"
            onClick={handleAddRow}
            className="w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Baris
          </Button>
        </div>
      )}

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Tidak ada data. {config.rowType === 'free' ? 'Klik "Tambah Baris" untuk memulai.' : 'Data akan dimuat otomatis.'}</p>
        </div>
      )}
    </div>
  );
}
