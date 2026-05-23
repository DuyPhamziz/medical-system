import pandas as pd
import json
import re
import uuid

def clean(text):
    if pd.isna(text): return ""
    return str(text).strip()

def extract_opts(text):
    if not text: return []
    # Match patterns like "1. Text", "1: Text", "1 Text"
    parts = re.split(r'\n\s*\d+[.:]\s*|\n\s*\d+\s+', text)
    if len(parts) <= 1:
        parts = re.split(r'\d+[.:]\s*', text)
    res = []
    for p in parts:
        p = p.strip()
        if p and not p.lower().startswith('lựa chọn') and not p.lower().startswith('nhiều lựa chọn'):
            p = re.sub(r'\(câu trả lời ngắn\).*', '', p, flags=re.IGNORECASE).strip()
            if p: res.append(p)
    return res

def run_import():
    df = pd.read_excel('SET UP.xlsx', sheet_name=0, header=4)
    form_id = "f0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c" # Fixed ID for the main form
    
    sections = []
    current_section = None
    questions_map = {} # Map no -> question object
    
    # Pre-define sections based on common headings in the sheet
    # We'll group questions by their prefix or explicit section names
    
    for i, row in df.iterrows():
        no = clean(row.iloc[1])
        title = clean(row.iloc[2])
        desc = clean(row.iloc[3])
        type_info = clean(row.iloc[4])
        
        if not title and not desc and not type_info: continue
        
        # Determine Section
        section_title = "Thông tin chung"
        if no and '.' in no:
            prefix = no.split('.')[0]
            if prefix.isdigit():
                # Try to find a major heading for this prefix
                section_title = f"Phần {prefix}"
        
        if current_section is None or current_section['title'] != section_title:
            current_section = {
                "id": str(uuid.uuid4()),
                "title": section_title,
                "questions": []
            }
            sections.append(current_section)
            
        # Determine Type
        q_type = "TEXT"
        ti_low = type_info.lower()
        content_low = (title + desc).lower()
        
        if "nhiều lựa chọn" in ti_low: q_type = "MULTIPLE_CHOICE"
        elif "lựa chọn" in ti_low: q_type = "SINGLE_CHOICE"
        elif any(k in ti_low for k in ["số kg", "số tuổi", "số cm", "mmhg", "số lần", "số giờ", "nhập số"]): q_type = "NUMBER"
        elif any(k in ti_low for k in ["ngày/tháng/năm", "ngày tháng năm"]): q_type = "DATE"
        elif "dạng bảng" in ti_low: q_type = "MATRIX"
        elif any(k in ti_low for k in ["phả hệ", "thành viên gia đình"]): q_type = "PEDIGREE"
        elif any(k in ti_low for k in ["tên xét nghiệm", "tên bệnh"]): q_type = "DYNAMIC_TABLE"
        elif any(k in ti_low for k in ["score", "tính toán", "tổng điểm"]): q_type = "SCORED"
        elif "tải file" in ti_low or "gửi kèm" in ti_low: q_type = "FILE_UPLOAD"
        
        # AI & PII logic
        indicator = None
        if "huyết áp" in content_low: indicator = "BLOOD_PRESSURE"
        elif "cân nặng" in content_low: indicator = "WEIGHT"
        elif "chiều cao" in content_low: indicator = "HEIGHT"
        elif "nhiệt độ" in content_low or "thân nhiệt" in content_low: indicator = "TEMPERATURE"
        elif "nhịp tim" in content_low: indicator = "HEART_RATE"
        elif "spo2" in content_low: indicator = "SPO2"
        elif "đường huyết" in content_low: indicator = "GLUCOSE"
        elif "bmi" in content_low: indicator = "BMI"
        elif "tuổi" in content_low: indicator = "AGE"
        elif "apgar" in content_low: indicator = "APGAR_SCORE"
        elif "phq9" in content_low or "phq-9" in content_low: indicator = "DEPRESSION_PHQ9"
        elif "gad7" in content_low or "gad-7" in content_low: indicator = "ANXIETY_GAD7"
        
        pii_keywords = ["họ tên", "điện thoại", "địa chỉ", "email", "cccd", "hộ chiếu", "ngày sinh", "năm sinh", "giấy tờ tùy thân"]
        is_pii = any(k in content_low for k in pii_keywords)
        
        q_obj = {
            "id": str(uuid.uuid4()),
            "no": no,
            "content": title or desc,
            "description": desc if title else "",
            "type": q_type,
            "options": extract_opts(type_info),
            "ai_indicator": indicator,
            "is_pii": is_pii,
            "sub_questions": []
        }
        
        # Hierarchy logic
        parent_no = None
        if no and '.' in no:
            parts = no.split('.')
            if len(parts) > 1:
                parent_no = ".".join(parts[:-1])
        
        if parent_no and parent_no in questions_map:
            questions_map[parent_no]["sub_questions"].append(q_obj)
        else:
            current_section["questions"].append(q_obj)
            
        questions_map[no] = q_obj

    # Generate SQL
    user_id = "c07480cd-f022-4cea-9b11-15d7e935387d" # System Admin ID from backup
    sql = [
        f"INSERT INTO form (form_id, title, description, status, visibility, is_template, is_public, is_paid, is_active, price, version, created_by, created_at, updated_at) VALUES ('{form_id}', 'THIẾT LẬP THÔNG TIN ĐẦU VÀO', 'Biểu mẫu tổng hợp thông tin sức khỏe và tiền sử bệnh nhân (Phụ lục 1)', 'PUBLISHED', 'PUBLIC', true, true, false, true, 0, 1, '{user_id}', NOW(), NOW()) ON CONFLICT (form_id) DO NOTHING;"
    ]
    
    for s in sections:
        sql.append(f"INSERT INTO form_section (section_id, form_id, title, order_index, allow_repeat, created_at, updated_at) VALUES ('{s['id']}', '{form_id}', '{s['title']}', {sections.index(s)}, false, NOW(), NOW());")
        
        def process_qs(qs, s_id, parent_id=None):
            for idx, q in enumerate(qs):
                ai_cfg = json.dumps({"indicatorCode": q['ai_indicator']}) if q['ai_indicator'] else "NULL"
                ai_val = f"'{ai_cfg}'" if ai_cfg != "NULL" else "NULL"
                
                # Escape single quotes for SQL
                content = q['content'].replace("'", "''")
                
                parent_id_val = f"'{parent_id}'" if parent_id else "NULL"
                sql.append(f"INSERT INTO form_question (question_id, section_id, content, question_type, is_required, allow_repeat, order_index, is_pii, ai_config_json, parent_question_id, created_at, updated_at) VALUES ('{q['id']}', '{s_id}', '{content}', '{q['type']}', false, false, {idx}, {str(q['is_pii']).lower()}, {ai_val}, {parent_id_val}, NOW(), NOW());")

                
                for o_idx, opt in enumerate(q['options']):
                    opt_id = str(uuid.uuid4())
                    opt_content = opt.replace("'", "''")
                    sql.append(f"INSERT INTO form_question_option (option_id, question_id, content, order_index, score) VALUES ('{opt_id}', '{q['id']}', '{opt_content}', {o_idx}, 0);")
                
                if q['sub_questions']:
                    process_qs(q['sub_questions'], s_id, q['id'])
        
        process_qs(s['questions'], s['id'])
        
    with open('backend/src/main/resources/db/migration/V13__seed_setup_form.sql', 'w', encoding='utf-8') as f:
        f.write("\n".join(sql))

run_import()
print("Success: Generated V13__seed_setup_form.sql with full 185 rows logic.")
