"use client";

import { FormQuestion } from "@/types/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  question: FormQuestion;
  value: any[]; // Array of records
  onChange: (newValue: any[]) => void;
};

export function GroupQuestion({ question, value = [{}], onChange }: Props) {
  const fields = question.options || [];

  const updateEntry = (index: number, key: string, val: any) => {
    const next = [...value];
    next[index] = { ...next[index], [key]: val };
    onChange(next);
  };

  const addEntry = () => {
    onChange([...value, {}]);
  };

  const removeEntry = (index: number) => {
    if (value.length <= 1) {
      onChange([{}]);
    } else {
      onChange(value.filter((_, i) => i !== index));
    }
  };

  if (fields.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
        Thiết lập các trường thông tin con trong trình xây dựng để hiển thị nhóm lặp.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {value.map((entry, idx) => (
          <motion.div
            key={idx}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <div className="absolute -left-2 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white shadow-lg">
              {idx + 1}
            </div>
            
            {value.length > 1 && (
              <button 
                onClick={() => removeEntry(idx)}
                className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-100 text-rose-400 shadow-sm hover:text-rose-600 hover:border-rose-100 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {fields.map(field => {
                const config = JSON.parse(field.triggerLogic || "{}");
                const fieldId = field.optionId!;
                return (
                  <div key={fieldId} className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      {field.content}
                    </label>
                    {config.type === "number" ? (
                      <Input 
                        type="number" 
                        className="rounded-xl border-slate-100 bg-slate-50/50 font-bold focus:bg-white transition-all"
                        value={entry[fieldId] || ""}
                        onChange={e => updateEntry(idx, fieldId, e.target.value)}
                      />
                    ) : config.type === "date" ? (
                      <Input 
                        type="date" 
                        className="rounded-xl border-slate-100 bg-slate-50/50 font-bold focus:bg-white transition-all"
                        value={entry[fieldId] || ""}
                        onChange={e => updateEntry(idx, fieldId, e.target.value)}
                      />
                    ) : (
                      <Input 
                        type="text" 
                        className="rounded-xl border-slate-100 bg-slate-50/50 font-bold focus:bg-white transition-all"
                        value={entry[fieldId] || ""}
                        onChange={e => updateEntry(idx, fieldId, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <Button
        type="button"
        variant="outline"
        onClick={addEntry}
        className="w-full h-12 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-500 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 font-black uppercase tracking-widest text-[10px] transition-all"
      >
        <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Khai báo thêm thông tin
      </Button>
    </div>
  );
}
