import json

data = json.load(open('full_sheet_data.json', encoding='utf-8'))
report = []

for i, r in enumerate(data):
    # Mapping columns based on the observed structure
    question_no = r.get('1')
    title = r.get('1. Họ tên - địa chỉ ')
    desc = r.get('Thông tin cá nhân')
    type_info = r.get('(câu trả lời ngắn)\nHọ và tên\nĐịa chỉ\nNgày tháng năm sinh (dương lịch)')
    
    # Heuristic to detect complex types
    complexity = []
    ti_str = str(type_info) if type_info else ""
    desc_str = str(desc) if desc else ""
    
    if "nếu" in ti_str.lower() or "hiện thêm" in ti_str.lower() or "mở thêm" in ti_str.lower():
        complexity.append("CONDITIONAL_SUBQUESTION")
    if "Dạng bảng" in ti_str:
        complexity.append("MATRIX")
    if "Nhiều lựa chọn" in ti_str:
        complexity.append("MULTI_CHOICE")
    if "thanh viên gia đình" in ti_str.lower() or "phả hệ" in desc_str.lower():
        complexity.append("PEDIGREE/FAMILY")
    if "tính toán" in ti_str.lower() or "score" in ti_str.lower():
        complexity.append("SCORING/CALCULATION")
    if "mô tả" in ti_str.lower() and "kết luận" in ti_str.lower():
        complexity.append("MULTI_FIELD_TEXT")
        
    report.append({
        "row": i + 6,
        "no": question_no,
        "title": title,
        "description": desc,
        "type_raw": type_info,
        "complexity": complexity
    })

# Print interesting rows
print(json.dumps([r for r in report if r["complexity"]], ensure_ascii=False, indent=2))
