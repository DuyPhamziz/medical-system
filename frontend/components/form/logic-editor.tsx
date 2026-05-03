"use client";
import React, { useState, useMemo } from 'react';
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormQuestion, FormSection } from "@/types/form";

type LogicOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "greater_than"
  | "less_than"
  | "is_empty"
  | "not_empty";

type LogicAction = "show" | "hide";

type ComparisonType = "value" | "question";

type LogicRule = {
  id: string;
  sourceQuestionId: string;
  operator: LogicOperator;
  comparisonType: ComparisonType;
  value?: string;
  targetQuestionId?: string;
};

type LogicGroup = {
  type: "AND" | "OR";
  rules: LogicRule[];
};

type VisibilityLogic = {
  action: LogicAction;
  logic: LogicGroup;
};

type Props = {
  item: FormQuestion | FormSection;
  allQuestions: FormQuestion[];
  onChange: (updates: any) => void;
  onClose: () => void;
};

const OPERATOR_MAP: { [key in LogicOperator]: string } = {
  equals: "==",
  not_equals: "!=",
  contains: ".includes", // Special handling needed
  greater_than: ">",
  less_than: "<",
  is_empty: "==",
  not_empty: "!=",
};

export function LogicEditor({ item, allQuestions, onChange, onClose }: Props) {
  const isSection = 'sectionId' in item;
  
  const availableQuestions = useMemo(() => {
    if (isSection) {
      // For a section, allow any question that belongs to a PREVIOUS section.
      // Since allQuestions is flat and ordered, we can use the order of sections.
      // But we don't have section indices easily here.
      // Let's find the first question of this section.
      const firstQuestionId = (item as FormSection).questions[0]?.questionId;
      if (!firstQuestionId) {
        // If section has no questions, find its position in form.sections (not available here easily)
        // Fallback: all questions for now, but better to be safe.
        return allQuestions; 
      }
      const firstQIdx = allQuestions.findIndex(q => q.questionId === firstQuestionId);
      return allQuestions.slice(0, firstQIdx);
    }
    
    const currentQIdx = allQuestions.findIndex(q => q.questionId === (item as FormQuestion).questionId);
    return allQuestions.slice(0, currentQIdx);
  }, [allQuestions, item, isSection]);

  const [logicState, setLogicState] = useState<VisibilityLogic>(() => {
    const config = item.configJson ? JSON.parse(item.configJson) : {};
    const rule = config.logicRules?.[0]; 
    if (rule) {
      const isShow = rule.action.toLowerCase() === 'show';
      
      const condition = rule.condition || "";
      const parts = condition.match(/\{\{([^}]+)\}\}\s*([^\s]+)\s*(.*)/);
      if (parts) {
        const [, source, opStr, targetRaw] = parts;
        const targetIsQuestion = targetRaw.startsWith("{{");
        
        const operator = Object.keys(OPERATOR_MAP).find(k => OPERATOR_MAP[k as LogicOperator] === opStr.trim()) as LogicOperator || 'equals';

        return {
          action: isShow ? 'show' : 'hide',
          logic: {
            type: "AND",
            rules: [{
              id: crypto.randomUUID(),
              sourceQuestionId: source,
              operator: operator,
              comparisonType: targetIsQuestion ? "question" : "value",
              value: targetIsQuestion ? undefined : targetRaw.replace(/"/g, ""),
              targetQuestionId: targetIsQuestion ? targetRaw.replace(/[{}]/g, "") : undefined
            }]
          }
        };
      }
    }
    
    // Default state
    return {
      action: "show",
      logic: {
        type: "AND",
        rules: [{
          id: crypto.randomUUID(),
          sourceQuestionId: "",
          operator: "equals",
          comparisonType: "value",
          value: ""
        }]
      }
    };
  });

  const updateRule = (ruleId: string, updates: Partial<LogicRule>) => {
    setLogicState(prev => ({
      ...prev,
      logic: {
        ...prev.logic,
        rules: prev.logic.rules.map(r => {
          if (r.id === ruleId) {
            const next = { ...r, ...updates };
            // Reset if comparison type changes
            if (updates.comparisonType) {
              next.value = undefined;
              next.targetQuestionId = undefined;
            }
            return next;
          }
          return r;
        })
      }
    }));
  };
  
  const saveLogic = () => {
    const rule = logicState.logic.rules[0];
    if (!rule.sourceQuestionId) {
      onChange({ configJson: null });
      onClose();
      return;
    }

    let condition = "";
    const op = OPERATOR_MAP[rule.operator];

    if (rule.operator === 'is_empty' || rule.operator === 'not_empty') {
      condition = `{{${rule.sourceQuestionId}}} ${op} ""`;
    } else if (rule.comparisonType === 'question') {
      if (rule.targetQuestionId) {
        condition = `{{${rule.sourceQuestionId}}} ${op} {{${rule.targetQuestionId}}}`;
      }
    } else { // value
      const sourceQ = allQuestions.find(q => q.questionId === rule.sourceQuestionId);
      const value = sourceQ?.questionType === 'number' ? rule.value : `"${rule.value}"`;
      if(rule.value !== undefined) {
        condition = `{{${rule.sourceQuestionId}}} ${op} ${value}`;
      }
    }
    
    if (condition) {
      const newConfig = {
        ...(item.configJson ? JSON.parse(item.configJson) : {}),
        logicRules: [{
          condition: condition,
          action: logicState.action.toUpperCase()
        }]
      };
      onChange({ configJson: JSON.stringify(newConfig) });
    } else {
       onChange({ configJson: null });
    }

    onClose();
  };


  const clearLogic = () => {
    onChange({ configJson: null });
    onClose();
  };

  const rule = logicState.logic.rules[0];
  const sourceQuestion = allQuestions.find(q => q.questionId === rule.sourceQuestionId);

  return (
    <Modal open={true} onClose={onClose} title={`Thiết lập logic điều kiện cho ${isSection ? 'phần' : 'câu hỏi'}`}>
      <div className="space-y-6 py-4">
        {/* Simplified for one rule */}
        <div className="space-y-4 rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-4">
             <label className="text-xs font-black uppercase tracking-widest text-slate-400">NẾU</label>
             <select
              className="flex-grow rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              value={rule.sourceQuestionId}
              onChange={(e) => updateRule(rule.id, { sourceQuestionId: e.target.value })}
            >
              <option value="">-- Chọn câu hỏi nguồn --</option>
              {availableQuestions.map((q) => (
                <option key={q.questionId} value={q.questionId!}>
                  Q{(q.orderIndex ?? 0) + 1}: {q.content}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <select
              className="w-1/3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              value={rule.operator}
              onChange={(e) => updateRule(rule.id, { operator: e.target.value as LogicOperator })}
            >
              <option value="equals">Bằng</option>
              <option value="not_equals">Khác</option>
              {sourceQuestion?.questionType === "text" && <option value="contains">Chứa chuỗi</option>}
              {sourceQuestion?.questionType === "number" && (
                <>
                  <option value="greater_than">Lớn hơn</option>
                  <option value="less_than">Nhỏ hơn</option>
                </>
              )}
              <option value="is_empty">Để trống</option>
              <option value="not_empty">Đã điền</option>
            </select>

            { rule.operator !== 'is_empty' && rule.operator !== 'not_empty' && (
              <div className="flex-grow flex items-center gap-2">
                  <select
                    className="w-1/3 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-500"
                    value={rule.comparisonType}
                    onChange={e => updateRule(rule.id, { comparisonType: e.target.value as ComparisonType })}
                  >
                    <option value="value">Giá trị</option>
                    <option value="question">Câu hỏi khác</option>
                  </select>

                {rule.comparisonType === 'question' ? (
                   <select
                      className="flex-grow rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      value={rule.targetQuestionId ?? ""}
                      onChange={(e) => updateRule(rule.id, { targetQuestionId: e.target.value })}
                   >
                      <option value="">-- Chọn câu hỏi so sánh --</option>
                      {availableQuestions.filter(q => q.questionId !== rule.sourceQuestionId).map((q) => (
                        <option key={q.questionId} value={q.questionId!}>
                          Q{(q.orderIndex ?? 0) + 1}: {q.content}
                        </option>
                      ))}
                   </select>
                ) : (
                  sourceQuestion?.questionType === "single_choice" || sourceQuestion?.questionType === "multiple_choice" ? (
                  <select
                    className="flex-grow rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700"
                    value={rule.value ?? ""}
                    onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                  >
                    <option value="">-- Chọn đáp án --</option>
                    {sourceQuestion.options.map(opt => (
                      <option key={opt.optionId} value={opt.optionId}>{opt.content}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    type={sourceQuestion?.questionType === "number" ? "number" : "text"}
                    placeholder="Nhập giá trị..."
                    className="rounded-xl h-[46px] flex-grow"
                    value={rule.value ?? ""}
                    onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                  />
                )
              )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">THÌ</label>
          <select
            className="flex-grow rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            value={logicState.action}
            onChange={e => setLogicState(prev => ({ ...prev, action: e.target.value as LogicAction }))}
          >
            <option value="show">Hiển thị {isSection ? 'phần' : 'câu hỏi'} này</option>
            <option value="hide">Ẩn {isSection ? 'phần' : 'câu hỏi'} này</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6">
        <Button variant="ghost" className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-bold" onClick={clearLogic}>
          Xóa logic
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose} className="font-bold">Đóng</Button>
          <Button onClick={saveLogic} className="bg-emerald-600 hover:bg-emerald-700 font-bold px-8 shadow-lg shadow-emerald-100">Lưu logic</Button>
        </div>
      </div>
    </Modal>
  );
}

