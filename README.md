# NovaGear

> Nền tảng quản lý & vận hành hệ thống theo mô hình **microservices** với **React (TypeScript)** ở frontend và **Spring
Boot (Java 17+)** ở backend, đi qua **API Gateway**.

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Vấn đề hiện tại](#-vấn-đề-hiện-tại)
- [Mục tiêu giải pháp](#-mục-tiêu-giải-pháp)
- [Tính năng chính](#-tính-năng-chính)
- [Actors](#-actors)
- [Kiến trúc hệ thống](#️-kiến-trúc-hệ-thống)
- [Tech Stack](#-tech-stack)
- [AI Service](#-ai-service)
- [Cài đặt](#-cài-đặt)
- [Sử dụng](#-sử-dụng)
- [Screenshots](#-screenshots)
- [Acknowledgments](#-acknowledgments)

---

## 🌟 Giới thiệu

**NovaGear** là dự án full-stack áp dụng kiến trúc **frontend (SPA)** + **backend microservices** để phát triển sản phẩm
theo hướng dễ mở rộng, dễ bảo trì và tách biệt trách nhiệm giữa các module.

Các thành phần chính:

- **Frontend**: React + TypeScript (Vite) cho UI/UX hiện đại, routing và quản lý state.
- **Backend**: nhiều service Spring Boot (Auth/User/Product/Cart/Order/Payment...) phụ trách từng miền nghiệp vụ.
- **Gateway**: API Gateway làm điểm vào duy nhất, định tuyến request và (tuỳ cấu hình) xử lý security/cross-cutting
  concerns.

---

## 📊 Vấn đề hiện tại

Trong các hệ thống web “nguyên khối” (monolith) hoặc tổ chức repo chưa tốt thường gặp:

- Code backend phình to, khó tách module theo nghiệp vụ
- Khó mở rộng/triển khai từng phần độc lập
- Frontend và backend phụ thuộc chặt → khó phát triển song song
- Thiếu gateway khiến routing, auth, rate limit… bị “rải” ở nhiều nơi

---

## 🎯 Mục tiêu giải pháp

NovaGear hướng tới:

1. **Tách dịch vụ theo domain**: mỗi service xử lý 1 mảng nghiệp vụ.
2. **Tối ưu phát triển & triển khai**: có thể phát triển/scale từng service độc lập.
3. **Chuẩn hoá luồng request** qua Gateway: dễ quản lý auth, route, policy.
4. **Frontend hiện đại**: UI tách rời backend, giao tiếp qua API rõ ràng.

---

## 🚀 Tính năng chính

### 1️⃣ Authentication & Authorization

- Service **Auth** chịu trách nhiệm xác thực người dùng, seed role/user mặc định cho môi trường dev.
- Hỗ trợ role-based access (ví dụ: admin/staff/user).

### 2️⃣ User Management

- Service **User** quản lý thông tin người dùng, profile, và các nghiệp vụ liên quan.

### 3️⃣ Product Catalog

- Service **Product** quản lý sản phẩm (CRUD, tìm kiếm/lọc, v.v.)

### 4️⃣ Cart & Order Flow

- Service **Cart** quản lý giỏ hàng.
- Service **Order** quản lý đặt hàng, trạng thái đơn hàng.

### 5️⃣ Payment

- Service **Payment** xử lý thanh toán và tích hợp/điều phối với hệ thống liên quan.

### 6️⃣ API Gateway

- **Gateway** là entry-point, định tuyến đến các service phù hợp, và là nơi “cắm” security policy.

---

## 👥 Actors

| Vai trò           | Mô tả                                                        |
|-------------------|--------------------------------------------------------------|
| **Admin**         | Quản trị hệ thống, phân quyền, quản lý cấu hình dữ liệu      |
| **Staff**         | Thao tác nghiệp vụ vận hành (tuỳ domain)                     |
| **User/Customer** | Sử dụng hệ thống: xem sản phẩm, thao tác giỏ hàng, đặt hàng… |

---

## 🏗️ Kiến trúc hệ thống

```text
NovaGear
├── frontend/                      # React + TypeScript + Vite
├── AI/                            # FastAPI AI service (RAG + semantic search)
├── gateway/
│   └── gateway/                   # Spring Cloud Gateway
└── backend/
    ├── Auth/                      # Spring Boot Auth service
    ├── User/                      # Spring Boot User service
    ├── Product/                   # Spring Boot Product service
    ├── Cart/                      # Spring Boot Cart service
    ├── Order/                     # Spring Boot Order service
    └── Payment/                   # Spring Boot Payment service
```

> Nếu bạn có thêm DB/migration/docker-compose, mình sẽ bổ sung mục kiến trúc “đúng chuẩn production” hơn.

---

## 💡 Tech Stack

### Frontend

- React + TypeScript (Vite)
- Tailwind CSS
- Axios
- Ant Design (UI components)
- Zustand, React Hook Form (state & form)

### Backend

- Spring Boot (Java 17+)
- Spring Data JPA
- Spring Cloud (Gateway / OpenFeign tuỳ service)
- PostgreSQL (runtime dependency xuất hiện trong một số service)

### Gateway

- Spring Cloud Gateway
- (Tuỳ cấu hình) OAuth2 Resource Server / JWT

## 🤖 AI Service

Thư mục `AI/` được tách riêng để triển khai các tính năng AI-first theo hướng **FastAPI + Python**:

- **RAG**: hỏi đáp dựa trên tài liệu nội bộ, policy, FAQ, manual.
- **AI Search**: gợi ý tìm kiếm và tìm kiếm theo ngữ nghĩa.
- **Adapter-ready**: có sẵn vị trí để gắn vector DB như `Pinecone`, `Milvus`, `Chroma` và search backend như `Meilisearch`, `Elasticsearch`.

Chạy service:

```powershell
cd E:\NovaGear\AI
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e .
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

Endpoints chính:

- `GET /`
- `GET /api/v1/health`
- `POST /api/v1/rag/query`
- `POST /api/v1/search/suggest`
- `POST /api/v1/search/semantic`

---

## 💻 Cài đặt

### Yêu cầu

- Node.js 18+
- Java JDK 17+
- Database (PostgreSQL/MySQL tuỳ cấu hình thực tế)
- (Tuỳ chọn) Redis

### 1) Clone repo

```bash
git clone https://github.com/nhathuymario/NovaGear.git
cd NovaGear
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3) Backend services

> Mỗi service có thể chạy độc lập (tuỳ config port + DB).

Ví dụ (Maven):

```bash
cd backend/Auth
./mvnw spring-boot:run
```

Lặp lại tương tự cho:

- `backend/User`
- `backend/Product`
- `backend/Cart`
- `backend/Order`
- `backend/Payment`

### 4) Gateway

```bash
cd gateway/gateway
./mvnw spring-boot:run
```

---

## ▶️ Sử dụng

1. Chạy database + cấu hình env (DB URL, user/pass, JWT secret, v.v.)
2. Start các backend services
3. Start gateway
4. Start frontend và truy cập UI
5. Frontend gọi API thông qua gateway (khuyến nghị) thay vì gọi thẳng từng service

---

## 📱 Screenshots

🚧 Sẽ cập nhật sau.

Gợi ý cấu trúc:

```text
docs/
└── screenshots/
    ├── home.png
    ├── login.png
    └── admin-dashboard.png
```

---

## 🙏 Acknowledgments

- Spring Boot / Spring Cloud
- React + TypeScript + Vite
- Tailwind CSS / Ant Design
- Open-source community
