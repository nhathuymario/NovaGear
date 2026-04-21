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

## Chạy nhanh

```powershell
cd E:\NovaGear\AI
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e .
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

## Endpoints chính

- `GET /` - thông tin service
- `GET /api/v1/health` - health check
- `POST /api/v1/rag/query` - hỏi đáp theo tài liệu
- `POST /api/v1/search/suggest` - gợi ý tìm kiếm
- `POST /api/v1/search/semantic` - tìm kiếm theo ngữ nghĩa

## Hướng phát triển tiếp theo

1. Thay mock knowledge base bằng pipeline ingest tài liệu thật.
2. Kết nối vector DB qua adapter riêng trong `services/`.
3. Gắn search backend thực tế như `Meilisearch` hoặc `Elasticsearch`.
4. Thêm job ingest định kỳ hoặc background worker nếu dữ liệu lớn.

