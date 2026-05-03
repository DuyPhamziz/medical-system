"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FormQuestion } from "@/types/form";

interface LookupQuestionProps {
  questionId: string;
  content: string;
  required?: boolean;
  config?: {
    lookupSource?: string;
    placeholder?: string;
    multiple?: boolean;
    endpoint?: string;
  };
  value?: Record<string, unknown>;
  onChange: (qId: string, rIdx: number, key: string, val: unknown) => void;
}

type LookupItem = {
  id: string;
  label: string;
  sublabel?: string;
};

export function LookupQuestion({
  questionId,
  content,
  required,
  config,
  value,
  onChange,
}: LookupQuestionProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LookupItem[]>([]);
  const [selected, setSelected] = useState<LookupItem[]>(() => {
    if (value?.selectedValues) {
      return value.selectedValues as LookupItem[];
    }
    if (value?.selectedValueIds && Array.isArray(value.selectedValueIds)) {
      return (value.selectedValueIds as string[]).map((id) => ({ id, label: id }));
    }
    return [];
  });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const multiple = config?.multiple ?? false;
  const lookupSource = config?.lookupSource || "patients";
  const placeholder = config?.placeholder || "Tìm kiếm...";

  // Mock data - in production, this would call the actual API endpoint
  const getMockResults = useCallback(
    (q: string): LookupItem[] => {
      if (!q || q.length < 1) return [];
      const lower = q.toLowerCase();
      const mockData: Record<string, LookupItem[]> = {
        patients: [
          { id: "pat-1", label: "Nguyễn Văn An", sublabel: "01/01/1990 - BN001" },
          { id: "pat-2", label: "Trần Thị Bình", sublabel: "15/03/1985 - BN002" },
          { id: "pat-3", label: "Lê Văn Cường", sublabel: "22/07/1978 - BN003" },
          { id: "pat-4", label: "Phạm Thị Dung", sublabel: "30/11/1995 - BN004" },
          { id: "pat-5", label: "Hoàng Văn Em", sublabel: "05/09/2000 - BN005" },
        ],
        diseases: [
          { id: "dis-1", label: "Tăng huyết áp", sublabel: "I10 - Bệnh mạn tính" },
          { id: "dis-2", label: "Đái tháo đường type 2", sublabel: "E11 - Bệnh mạn tính" },
          { id: "dis-3", label: "Hen phế quản", sublabel: "J45 - Bệnh hô hấp" },
          { id: "dis-4", label: "Viêm phổi", sublabel: "J18 - Bệnh nhiễm trùng" },
          { id: "dis-5", label: "Suy tim", sublabel: "I50 - Bệnh tim mạch" },
        ],
        medications: [
          { id: "med-1", label: "Amlodipin 5mg", sublabel: "Thuốc hạ áp" },
          { id: "med-2", label: "Metformin 500mg", sublabel: "Thuốc tiểu đường" },
          { id: "med-3", label: "Atorvastatin 20mg", sublabel: "Thuốc hạ mỡ máu" },
          { id: "med-4", label: "Salbutamol 100mcg", sublabel: "Thuốc hen suyễn" },
          { id: "med-5", label: "Losartan 50mg", sublabel: "Thuốc hạ áp" },
        ],
      };
      const data = mockData[lookupSource] || mockData.patients;
      return data.filter(
        (item) =>
          item.label.toLowerCase().includes(lower) ||
          (item.sublabel && item.sublabel.toLowerCase().includes(lower))
      );
    },
    [lookupSource]
  );

  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      setResults(getMockResults(query));
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, getMockResults]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: LookupItem) => {
    let newSelected: LookupItem[];
    if (multiple) {
      if (selected.some((s) => s.id === item.id)) {
        newSelected = selected.filter((s) => s.id !== item.id);
      } else {
        newSelected = [...selected, item];
      }
    } else {
      newSelected = [item];
      setIsOpen(false);
      setQuery(item.label);
    }
    setSelected(newSelected);
    onChange(
      questionId,
      0,
      "valueJson",
      JSON.stringify({
        lookupSource,
        selectedValueIds: newSelected.map((s) => s.id),
        selectedValues: newSelected,
        searchQuery: query,
      })
    );
  };

  const removeSelected = (id: string) => {
    const newSelected = selected.filter((s) => s.id !== id);
    setSelected(newSelected);
    onChange(
      questionId,
      0,
      "valueJson",
      JSON.stringify({
        lookupSource,
        selectedValueIds: newSelected.map((s) => s.id),
        selectedValues: newSelected,
        searchQuery: query,
      })
    );
  };

  return (
    <div className="space-y-3" ref={ref}>
      <p className="text-sm font-bold text-slate-800">
        {content}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </p>

      {/* Selected items */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700"
            >
              {item.label}
              <button
                type="button"
                onClick={() => removeSelected(item.id)}
                className="text-emerald-400 hover:text-rose-500 transition-colors"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selected.length > 0 ? "Tìm thêm..." : placeholder}
          className="w-full rounded-xl border border-slate-100 bg-white px-4 py-2.5 pr-10 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-300 placeholder:text-slate-300"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        )}
        {!loading && (
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
          {results.map((item) => {
            const isSelected = selected.some((s) => s.id === item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-emerald-50 ${
                  isSelected ? "bg-emerald-50/50" : ""
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-slate-200"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {item.label}
                  </p>
                  {item.sublabel && (
                    <p className="text-[11px] text-slate-400 truncate">
                      {item.sublabel}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {isOpen && query.length > 0 && results.length === 0 && !loading && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl border border-slate-100 bg-white shadow-xl p-4 text-center text-sm text-slate-400">
          Không tìm thấy kết quả
        </div>
      )}
    </div>
  );
}
