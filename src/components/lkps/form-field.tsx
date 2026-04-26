"use client"

import React from 'react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Column {
  key: string;
  label: string;
  type: 'number' | 'text' | 'textarea' | 'date' | 'url' | 'boolean' | 'select';
  options?: string[];
  autoCalculated?: boolean;
}

interface Props {
  column: Column;
  value: any;
  onChange: (value: any) => void;
  compact?: boolean;
}

export default function LKPSFormField({ column, value, onChange, compact = false }: Props) {
  const baseInputClass = compact 
    ? "text-xs px-2 py-1 h-8" 
    : "text-sm px-2 py-1";

  switch (column.type) {
    case 'number':
      return (
        <Input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
          className={baseInputClass}
          placeholder="0"
        />
      );

    case 'text':
      return (
        <Input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
          placeholder="Ketik teks..."
        />
      );

    case 'textarea':
      return (
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border border-gray-300 rounded-md px-2 py-1 ${baseInputClass} font-sans`}
          rows={compact ? 2 : 3}
          placeholder="Masukkan deskripsi..."
        />
      );

    case 'date':
      return (
        <Input
          type="date"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
        />
      );

    case 'url':
      return (
        <Input
          type="url"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
          placeholder="https://..."
        />
      );

    case 'boolean':
      return (
        <input
          type="checkbox"
          checked={value === true || value === 1 || value === 'true'}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300"
        />
      );

    case 'select':
      return (
        <Select value={value ?? ''} onValueChange={onChange}>
          <SelectTrigger className={`${baseInputClass} w-full`}>
            <SelectValue placeholder="Pilih opsi..." />
          </SelectTrigger>
          <SelectContent>
            {column.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    default:
      return null;
  }
}
