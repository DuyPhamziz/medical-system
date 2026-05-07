import pandas as pd
import json
import re
import uuid

def clean_text(text):
    if pd.isna(text): return ""
    return str(text).strip()

def extract_options(type_info):
    if pd.isna(type_info): return []
    text = str(type_info)
    # Look for patterns like "1. option", "1: option", "1 option"
    options = []
    # Try to split by numbers followed by . or : or space
    parts = re.split(r'\n\s*\d+[.:]\s*|\n\s*\d+\s+', text)
    if len(parts) <= 1:
        # Try again with a different regex if the first split failed
        parts = re.split(r'\d+[.:]\s*', text)
    
    for p in parts:
        p = p.strip()
        if p and not p.lower().startswith('lựa chọn') and not p.lower().startswith('nhiều lựa chọn'):
            # Remove any trailing " (câu trả lời ngắn)" or similar
            p = re.sub(r'\(câu trả lời ngắn\).*', '', p, flags=re.IGNORECASE).strip()
            if p:
                options.append(p)
    return options

def analyze_full_sheet():
    df = pd.read_excel('SET UP.xlsx', sheet_name=0, header=4)
    
    blueprint = []
    current_section = None
    
    # Column mapping (adjust based on head output)
    # Col 1: Question No
    # Col 2: Title
    # Col 3: Description / Content
    # Col 4: Type / Options
    
    for i, row in df.iterrows():
        q_no = clean_text(row.iloc[1])
        title = clean_text(row.iloc[2])
        content = clean_text(row.iloc[3])
        type_info = clean_text(row.iloc[4])
        
        # Detect Section
        if q_no and (q_no.endswith('.') or q_no.isdigit()) and not title.startswith('-'):
            current_section = title
            
        # Skip empty rows that are just separators
        if not title and not content and not type_info:
            continue
            
        q_type = "text"
        if "lựa chọn" in type_info.lower() and "nhiều lựa chọn" not in type_info.lower():
            q_type = "single_choice"
        elif "nhiều lựa chọn" in type_info.lower():
            q_type = "multiple_choice"
        elif "số kg" in type_info.lower() or "số tuổi" in type_info.lower() or "số cm" in type_info.lower() or "mmhg" in type_info.lower():
            q_type = "number"
        elif "ngày/tháng/năm" in type_info.lower():
            q_type = "date"
        elif "dạng bảng" in type_info.lower():
            q_type = "matrix"
        elif "tính toán" in type_info.lower() or "score" in type_info.lower():
            q_type = "scored"
        elif "thành viên gia đình" in type_info.lower():
            q_type = "pedigree"
        elif "tên xét nghiệm" in type_info.lower():
            q_type = "dynamic_table"
            
        options = extract_options(type_info)
        
        # AI Indicator mapping (Basic heuristic)
        indicator = None
        if "huyết áp" in title.lower() or "huyết áp" in content.lower(): indicator = "BLOOD_PRESSURE"
        elif "cân nặng" in title.lower(): indicator = "WEIGHT"
        elif "chiều cao" in title.lower(): indicator = "HEIGHT"
        elif "tuổi" in title.lower(): indicator = "AGE"
        elif "apgar" in title.lower(): indicator = "APGAR_SCORE"
        
        blueprint.append({
            "excel_row": i + 6,
            "no": q_no,
            "title": title or content,
            "section": current_section,
            "type": q_type,
            "options_count": len(options),
            "options_preview": options[:3],
            "ai_indicator": indicator,
            "is_pii": any(kw in (title + content).lower() for kw in ["họ tên", "điện thoại", "địa chỉ", "email"])
        })
        
    return blueprint

full_blueprint = analyze_full_sheet()

# Output a clean summary table in Markdown
print("| Dòng | STT | Câu hỏi | Phần | Loại | Lựa chọn | AI | PII |")
print("|:---:|:---|:---|:---|:---|:---|:---|:---|")
for b in full_blueprint:
    # Limit text length for display
    title = (b['title'][:40] + '..') if len(b['title']) > 40 else b['title']
    title = title.replace('\n', ' ')
    section = (b['section'][:20] + '..') if b['section'] and len(b['section']) > 20 else b['section']
    print(f"| {b['excel_row']} | {b['no']} | {title} | {section} | {b['type']} | {b['options_count']} | {b['ai_indicator'] or ''} | {'Có' if b['is_pii'] else ''} |")

with open('form_blueprint.json', 'w', encoding='utf-8') as f:
    json.dump(full_blueprint, f, ensure_ascii=False, indent=2)
