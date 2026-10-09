# NovaGear AI

`AI/` là service FastAPI riêng cho các tính năng AI-first của NovaGear:

- **RAG**: hỏi đáp dựa trên tài liệu nội bộ / FAQ / policy.
- **AI Search**: gợi ý tìm kiếm và tìm kiếm theo ngữ nghĩa.
- **Adapters**: có sẵn điểm mở rộng để gắn `Pinecone`, `Milvus`, `Chroma`, `Meilisearch`, `Elasticsearch`.

## Mục tiêu cấu trúc

- Tách rõ `api/`, `core/`, `schemas/`, `services/`.
- Giữ mock mode chạy được ngay, không phụ thuộc hạ tầng ngoài.
- Sau này chỉ cần thay implementation ở `services/` mà không phải sửa toàn bộ API layer.

## Cấu trúc thư mục

```text
AI/
├── app/
│   ├── api/
│   │   └── v1/
│   ├── core/
│   ├── schemas/
│   └── services/
├── .env.example
├── pyproject.toml
└── README.md
```

## Luồng xử lí chính

![img.png](img.png)

## Chạy nhanh

```powershell
cd E:\NovaGear\AI
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e .
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints chính

- `GET /` - thông tin service
- `GET /api/v1/health` - health check
- `POST /api/v1/rag/query` - hỏi đáp theo tài liệu
- `POST /api/v1/search/suggest` - gợi ý tìm kiếm
- `POST /api/v1/search/semantic` - tìm kiếm theo ngữ nghĩa
- `POST /api/v1/catalog/drafts` - nhận ảnh và tạo AI Product Draft bất đồng bộ
- `GET /api/v1/catalog/drafts/{id}` - theo dõi trạng thái và lấy dữ liệu nháp
- `POST /api/v1/catalog/drafts/{id}/approve` - liên kết draft với sản phẩm đã được admin duyệt

## AI Product Draft

Luồng catalog mới lưu job bền vững trong database, trả `202 Accepted`, rồi xử lý ảnh ở background worker nội bộ. Khi có `GEMINI_API_KEY`, service dùng Gemini Vision với structured output. Khi chưa có key, service vẫn tạo một draft fallback để admin tiếp tục nhập liệu thủ công.

Tất cả draft đều kết thúc ở `NEEDS_REVIEW`; AI không tự publish sản phẩm. Giá thu thập từ web chỉ là giá công khai tham khảo, không được coi là giá vốn.

Khi chạy bằng Docker Compose, đặt `GEMINI_API_KEY` trong environment hoặc file `.env` ở thư mục gốc project rồi chạy `docker compose up --build ai-service gateway-service frontend`. Nếu chưa có key, UI vẫn hoạt động ở fallback mode và yêu cầu admin tự xác minh dữ liệu.

## Hướng phát triển tiếp theo

1. Thay mock knowledge base bằng pipeline ingest tài liệu thật.
2. Kết nối vector DB qua adapter riêng trong `services/`.
3. Gắn search backend thực tế như `Meilisearch` hoặc `Elasticsearch`.
4. Thêm job ingest định kỳ hoặc background worker nếu dữ liệu lớn.

