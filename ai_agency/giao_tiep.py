import os
import subprocess

print("\n=== 🚀 TRẠM CHỈ HUY AGENT ĐÃ BẬT ===")
print("💡 Gõ yêu cầu của anh vào. Gõ 'thoát' để tắt máy.\n")

# Bơm thuốc lừa Claude CLI: Ép nó hiểu đang chạy API xịn và trỏ về Proxy
my_env = os.environ.copy()
my_env["ANTHROPIC_API_KEY"] = "sk-ant-freecc123456" # Bắt buộc phải có sk-ant-
my_env["ANTHROPIC_BASE_URL"] = "http://localhost:8082"
my_env["CLAUDE_BASE_URL"] = "http://localhost:8082"

while True:
    lenh_cua_sep = input("👨‍💼 Sếp chỉ đạo: ")
    
    if lenh_cua_sep.lower() in ['thoát', 'quit', 'exit']:
        print("👋 Tắt hệ thống. Chào sếp!")
        break
        
    if not lenh_cua_sep.strip():
        continue

    print("⚙️ Agent Claude đang lùng sục ổ cứng làm việc, đợi chút...\n")

    try:
        lenh_thuc_thi = f'claude -p "{lenh_cua_sep}"'
        
        # Nhét my_env vào để bảo kê cho thằng Claude chạy ngầm
        ket_qua = subprocess.run(
            lenh_thuc_thi,
            shell=True,
            env=my_env, 
            capture_output=True,
            text=True,
            encoding='utf-8' 
        )

        if ket_qua.returncode == 0:
            print("✅ BÁO CÁO TỪ AGENT:")
            print(ket_qua.stdout)
        else:
            print("❌ AGENT GẶP LỖI:")
            print(ket_qua.stderr)
            print(ket_qua.stdout)

    except Exception as e:
        print(f"Lỗi hệ thống: {e}")
        
    print("-" * 60)