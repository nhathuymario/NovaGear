from pydantic import BaseModel, Field


# Đoạn code trên định nghĩa các Data Model (Mô hình dữ liệu) bằng cách sử dụng thư viện Pydantic (BaseModel).
# quy định chính xác dữ liệu client gửi lên và đầu ra của cấu trúc mà API trả về
# status: Trạng thái (ví dụ: "healthy", "up").
#
# service / version / environment: Tên dịch vụ, phiên bản ứng dụng và môi trường chạy (development/production).
#
# vector_store / search_backend: Cho biết hệ thống đang kết nối tới DB vector nào (Chroma) và bộ tìm kiếm nào (Meilisearch).
#
# mock_mode: Kiểu Đúng/Sai (True/False) để biết hệ thống hiện tại có đang chạy giả lập hay không.
class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
    vector_store: str
    search_backend: str
    mock_mode: bool


# câu hỏi của người dùng
# ràng buộc 3 kí tự đến 2000 ngắn hơn sẽ báo lỗi
# danh sách ngữ cảnh có sẵn cho AI context
# số tài liệu liên quan muốn lấy từ 1-10 không nhận none
class RagQueryRequest(BaseModel):
    question: str = Field(min_length=3, max_length=2000)
    context: list[str] = Field(default_factory=list)
    top_k: int | None = Field(default=None, ge=1, le=10)


# hàm lấy nguồn tài liệu trích dẫn
class RagSource(BaseModel):
    title: str
    excerpt: str
    score: float = Field(ge=0.0, le=1.0)


# dữ liệu trả về cho người dùng
class RagQueryResponse(BaseModel):
    question: str
    answer: str
    confidence: float = Field(ge=0.0, le=1.0)
    mode: str
    sources: list[RagSource]


# tìm từ khóa và giới hạn kí tự trả về
class SearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=500)
    limit: int = Field(default=5, ge=1, le=10)


# kết quả trả về độ tin cậy và lí do liên quan
class SearchResult(BaseModel):
    title: str
    excerpt: str
    score: float = Field(ge=0.0, le=1.0)
    reason: str


# tổng thể kết quả trả về và công cụ đã thực hiện tìm kiếm
class SearchResponse(BaseModel):
    query: str
    backend: str
    results: list[SearchResult]
