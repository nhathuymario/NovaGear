# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
## Dự án NovaGear - Nền tảng Thương mại Điện tử Hiện đại

**Phiên bản:** 2.0  
**Ngày cập nhật:** 04/05/2026  
**Tác giả:** NovaGear Development Team  
**Trạng thái:** APPROVED ✓

---

## MỤC LỤC

1. [Giới thiệu](#1-giới-thiệu)
2. [Mô tả Tổng quan](#2-mô-tả-tổng-quan)
3. [Yêu cầu Giao diện Hệ thống](#3-yêu-cầu-giao-diện-hệ-thống)
4. [Yêu cầu Chức năng](#4-yêu-cầu-chức-năng)
5. [Yêu cầu Phi chức năng](#5-yêu-cầu-phi-chức-năng)
6. [Yêu cầu Dữ liệu](#6-yêu-cầu-dữ-liệu)
7. [Yêu cầu an Toàn](#7-yêu-cầu-an-toàn)
8. [Yêu cầu Phụ trợ](#8-yêu-cầu-phụ-trợ)
9. [Phụ lục](#9-phụ-lục)

---

## 1. GIỚI THIỆU

### 1.1 Mục đích Tài liệu

Tài liệu Đặc tả Yêu cầu Phần mềm (SRS - Software Requirements Specification) này định nghĩa chi tiết các yêu cầu chức năng, phi chức năng, giao diện và các ràng buộc của hệ thống **NovaGear** - một nền tảng thương mại điện tử hiện đại áp dụng kiến trúc microservices. Tài liệu này phục vụ làm cơ sở cho:

- **Phát triển**: Hướng dẫn cho các nhóm phát triển backend, frontend, AI.
- **Kiểm thử**: Bộ tiêu chí xác nhận chức năng và phi chức năng.
- **Bảo trì**: Tài liệu tham chiếu cho việc bảo trì và phát triển trong tương lai.
- **Quản lý Dự án**: Cơ sở để ước lượng công việc, lên lịch biểu và quản lý scope.

### 1.2 Phạm vi Dự án

NovaGear là một hệ thống **quản lý và vận hành thương mại điện tử** bao gồm:

#### **Các Thành phần Chính:**

1. **Frontend (React + TypeScript)**
   - Single Page Application (SPA) chạy trên Vite
   - Responsive design: Desktop, Tablet, Mobile
   - Quản lý trạng thái với Zustand
   - UI component library: Ant Design + Tailwind CSS

2. **Backend Microservices (Spring Boot Java)**
   - 7 microservice độc lập: Auth, User, Product, Cart, Order, Payment, Notification
   - Spring Data JPA cho ORM
   - Spring Cloud Gateway cho API routing
   - OpenFeign cho service-to-service communication

3. **AI Service (FastAPI Python)**
   - Semantic search trên sản phẩm
   - Retrieval-Augmented Generation (RAG) cho QA
   - Vector embedding integration

4. **Hệ thống Real-time**
   - WebSocket/STOMP cho notification tức thời
   - Redis pub/sub cho caching và event dispatching
   - Fallback polling khi WebSocket không khả dụng

5. **Hạ tầng & DevOps**
   - Docker & Docker Compose
   - PostgreSQL database
   - Redis cache layer
   - Terraform cho Infrastructure as Code

#### **Không Bao Gồm (Out of Scope):**

- Hệ thống CRM/ERP (ngoài e-commerce cơ bản)
- Phân tích dữ liệu (Analytics) chi tiết
- Hệ thống quản lý nội dung (CMS) độc lập
- Tích hợp AI advanced (như LLM fine-tuning riêng)

### 1.3 Định Nghĩa, Cụm Từ và Chữ Viết Tắt

| Thuật ngữ | Định nghĩa |
|-----------|-----------|
| **SPA** | Single Page Application - Ứng dụng trang đơn tải nội dung động |
| **Microservices** | Kiến trúc phần mềm với các dịch vụ nhỏ, độc lập, có nhiệm vụ riêng biệt |
| **API Gateway** | Cổng giao tiếp trung gian định tuyến request từ client đến microservices |
| **RBAC** | Role-Based Access Control - Phân quyền dựa trên vai trò người dùng |
| **JWT** | JSON Web Token - Token bảo mật cho xác thực không trạng thái |
| **RAG** | Retrieval-Augmented Generation - Kỹ thuật kết hợp tìm kiếm và sinh văn bản |
| **STOMP** | Simple Text Oriented Messaging Protocol - Giao thức nhắn tin văn bản |
| **WebSocket** | Giao thức hai chiều liên tục cho giao tiếp real-time |
| **Redis** | Hệ quản trị cơ sở dữ liệu in-memory dùng cho caching và session |
| **PayOS** | Cổng thanh toán trực tuyến hỗ trợ chuyển khoản ngân hàng Việt Nam |
| **OpenFeign** | HTTP client library cho service-to-service synchronous call |
| **COD** | Cash On Delivery - Thanh toán khi nhận hàng |
| **ORM** | Object-Relational Mapping - Ánh xạ đối tượng đến cơ sở dữ liệu |
| **TTL** | Time To Live - Thời gian tồn tại của dữ liệu trước khi hết hạn |
| **QA** | Quality Assurance hoặc Question Answering (tuỳ ngữ cảnh) |

### 1.4 Tài liệu Tham chiếu

| Tài liệu | Mô tả |
|---------|-------|
| ARCHITECTURE_DIAGRAMS.md | Kiến trúc hệ thống real-time chi tiết |
| PAYOS_INTEGRATION.md | Hướng dẫn tích hợp thanh toán PayOS |
| README.md | Hướng dẫn cài đặt và chạy nhanh |
| REALTIME_SYSTEM_GUIDE.md | Tài liệu chi tiết hệ thống real-time |

---

## 2. MÔ TẢ TỔNG QUAN

### 2.1 Tổng Quan Sản phẩm

**NovaGear** là một nền tảng **thương mại điện tử đầy đủ** (full-stack e-commerce platform) được thiết kế để giải quyết các hạn chế của các hệ thống monolithic truyền thống. Bằng cách áp dụng kiến trúc **microservices**, NovaGear cung cấp:

#### **Lợi ích Chính:**

1. **Khả năng mở rộng (Scalability)**
   - Scale riêng từng service độc lập (ví dụ: chỉ tăng resource cho Order Service vào mùa bán hàng)
   - Hỗ trợ 5,000+ người dùng đồng thời

2. **Tính sẵn sàng Cao (High Availability)**
   - Fallback mechanism: nếu một service down, hệ thống vẫn tiếp tục hoạt động
   - Redis caching giảm 90% truy vấn database

3. **Phát triển Song song (Parallel Development)**
   - Các team có thể phát triển các service khác nhau độc lập
   - Frontend/Backend tách biệt hoàn toàn, giao tiếp qua API

4. **Bảo trì Dễ dàng (Maintainability)**
   - Mỗi service là một codebase nhỏ, dễ hiểu
   - Không có phụ thuộc cứng giữa các service

#### **Vision (Tầm nhìn):**

NovaGear hướng tới trở thành **nền tảng thương mại điện tử tối ưu cho các doanh nghiệp Việt Nam**, hỗ trợ các phương thức thanh toán địa phương (PayOS, ngân hàng), hệ thống logistics, và AI-powered customer experience.

### 2.2 Đối Tượng Người Dùng (Actors/Personas)

Hệ thống hỗ trợ 3 loại người dùng chính:

#### **1. Admin (Quản trị viên)**

| Thuộc tính | Giá trị |
|-----------|--------|
| **Mô tả** | Quản lý toàn bộ hệ thống, tài nguyên và cấu hình |
| **Quyền** | Quản lý toàn hệ thống (bao gồm user, product, order, payment) |
| **Tương tác chính** | Dashboard thống kê, quản lý danh mục, phân quyền, tracking real-time |
| **Yêu cầu** | Đăng nhập, xem/thêm/sửa/xóa product, xem tất cả order, phân quyền user |

#### **2. Staff (Nhân viên)**

| Thuộc tính | Giá trị |
|-----------|--------|
| **Mô tả** | Nhân viên vận hành hàng ngày (kho, bán hàng, support) |
| **Quyền** | Quản lý order, inventory, xác nhận thanh toán |
| **Tương tác chính** | Xác nhận order, cập nhật trạng thái, quản lý tồn kho |
| **Yêu cầu** | Đăng nhập, xem order theo phạm vi, cập nhật status, xem inventory |

#### **3. User/Customer (Khách hàng)**

| Thuộc tính | Giá trị |
|-----------|--------|
| **Mô tả** | Khách hàng cuối cùng mua sắm trên nền tảng |
| **Quyền** | Xem product, tạo order, thanh toán, theo dõi order của mình |
| **Tương tác chính** | Browse sản phẩm, thêm giỏ hàng, checkout, tracking |
| **Yêu cầu** | Đăng ký, đăng nhập, xem product, quản lý giỏ hàng, đặt hàng, thanh toán |

### 2.3 Môi trường Hoạt động

#### **2.3.1 Môi trường Development**

```
Frontend:        localhost:5173 (Vite dev server)
Gateway:         localhost:8080
Auth Service:    localhost:8000
User Service:    localhost:8001
Product Service: localhost:8002
Cart Service:    localhost:8003
Order Service:   localhost:8082
Payment Service: localhost:8081
Notification:    localhost:8083
AI Service:      localhost:8000 (Python FastAPI)
Redis:           localhost:6379
PostgreSQL:      localhost:5432
```

#### **2.3.2 Môi trường Production**

- **Frontend:** Hosted trên CDN hoặc web server (nginx)
- **Backend Services:** Container hoá với Docker, orchestrated bằng Kubernetes hoặc Docker Swarm
- **Database:** PostgreSQL managed service (AWS RDS, Google Cloud SQL)
- **Cache:** Redis managed service (AWS ElastiCache, Redis Cloud)
- **Storage:** S3 hoặc object storage tương đương
- **DNS & SSL:** CloudFlare hoặc route53 + ACM

#### **2.3.3 Yêu cầu Phần cứng**

**Development Machine:**
- CPU: 4 cores tối thiểu
- RAM: 8 GB tối thiểu (16 GB khuyến nghị)
- Storage: 50 GB ssd
- OS: Windows 10+, macOS 10.15+, Ubuntu 20.04+

**Production Server:**
- CPU: 8+ cores (tuỳ tải)
- RAM: 16+ GB
- Storage: SSD 200+ GB (tuỳ dữ liệu)
- Network: ≥100 Mbps

#### **2.3.4 Phần mềm & Công nghệ**

| Lớp | Công nghệ |
|-----|-----------|
| **Frontend** | Node.js 18+, React 18+, TypeScript 5+, Vite |
| **Backend** | Java JDK 17+, Spring Boot 3.x, Spring Cloud 2023.x |
| **AI** | Python 3.9+, FastAPI, Langchain/LLamaIndex |
| **Database** | PostgreSQL 14+, Redis 7+ |
| **DevOps** | Docker 24+, Docker Compose 2+, Terraform 1.5+ |

### 2.4 Ràng buộc & Giả định

#### **Ràng buộc Kỹ thuật:**

1. **Phụ thuộc Gateway**: Toàn bộ request từ client phải qua API Gateway, không gọi trực tiếp service
2. **Stateless Services**: Các service không lưu session, chỉ JWT-based authentication
3. **Database mỗi Service**: Tối ưu nhất là mỗi service có DB riêng (tuỳ chọn)
4. **Async Communication**: Service-to-service tuyến tính phải dùng OpenFeign (sync) hoặc message broker (async)

#### **Giả định Kinh doanh:**

1. Người dùng chủ yếu là từ Việt Nam, nên payment tập trung vào PayOS/COD
2. Peak traffic xảy ra vào ngày mua sắm lớn (Black Friday, Tết, v.v.)
3. Số lượng sản phẩm ban đầu: ~10,000 SKU, có thể lên tới 100,000 trong tương lai

---

## 3. YÊU CẦU GIAO DIỆN HỆ THỐNG

### 3.1 Giao diện Người dùng (UI)

#### **3.1.1 Nguyên tắc Thiết kế**

- **Responsive Design**: Hỗ trợ Desktop (1024px+), Tablet (768px-1023px), Mobile (<768px)
- **Accessibility (a11y)**: WCAG 2.1 AA compliance
- **Performance First**: Load time < 3 giây, LCP < 2.5s
- **Dark/Light Mode**: Hỗ trợ cả hai theme

#### **3.1.2 Công nghệ & Framework**

| Thành phần | Công nghệ |
|-----------|-----------|
| **Framework** | React 18+ với TypeScript |
| **Build Tool** | Vite (dev: ~100ms, build: <1s) |
| **Styling** | Tailwind CSS + CSS Modules |
| **Component Library** | Ant Design (form, table, modal, etc.) |
| **State Management** | Zustand (lightweight alternative to Redux) |
| **Form Management** | React Hook Form |
| **HTTP Client** | Axios + Interceptor |
| **Routing** | React Router v6+ |
| **Animation** | Framer Motion, Ant Design animation |
| **Testing** | Vitest, React Testing Library |

#### **3.1.3 Giao diện Các Trang Chính**

##### **Dành cho Customer:**

1. **Home Page**
   - Hero section với banner quảng cáo
   - Product carousel (trending, bestseller)
   - Category tiles
   - Newsletter signup
   - Load time: <2s

2. **Product Listing**
   - Grid layout với ≥12 products mỗi page
   - Sidebar filters: Category, Price, Rating, Brand
   - Sort: Popularity, Price (asc/desc), Newest
   - Lazy loading images
   - Pagination/Infinite scroll

3. **Product Detail**
   - Product images gallery (zoom, zoom-out)
   - Specifications, reviews
   - "Add to Cart" button
   - Stock status indicator
   - Related products carousel

4. **Shopping Cart**
   - List items với qty input
   - Auto-calculate total
   - "Continue Shopping" / "Checkout" button
   - Coupon input (tuỳ chọn)
   - Persistent cart (localStorage)

5. **Checkout**
   - Step 1: Shipping address
   - Step 2: Payment method (COD / PayOS)
   - Step 3: Order review + Place order
   - Progress indicator

6. **My Orders**
   - Order list với status badges
   - Order detail modal/page
   - Real-time status update (WebSocket)
   - Download invoice
   - Cancel order (nếu còn có thể)

7. **My Profile**
   - Update avatar, name, email
   - Address management
   - Change password

##### **Dành cho Admin/Staff:**

1. **Dashboard**
   - KPI cards: Total Orders Today, Revenue, Active Users, Stock Alert
   - Order chart (last 7 days)
   - Top products
   - Recent orders table

2. **Admin Order Board (Real-time)**
   - Live table của toàn bộ order
   - Color-coded status: PENDING (yellow), CONFIRMED (blue), SHIPPING (orange), DELIVERED (green)
   - Update status in-place (dropdown)
   - Search/filter orders
   - WebSocket live update (<100ms)

3. **Product Management**
   - Product table: name, sku, stock, price, action
   - Bulk upload CSV
   - Add product form dengan variant management

4. **Inventory Management**
   - Stock status table
   - Low stock alert
   - Adjust stock quantity
   - History tracking

### 3.2 Giao diện Phần cứng

Hệ thống không yêu cầu phần cứng đặc biệt ở phía client. Yêu cầu phía server:

- **Development**: Máy tính văn phòng chuẩn (RAM 8GB+)
- **Production**: Cloud server/VPS với CPU 4+ cores, RAM 16+ GB, SSD 200+ GB

### 3.3 Giao diện Phần mềm (Software Interfaces)

#### **3.3.1 Database Interface**

```java
// Spring Data JPA - ORM
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    @Query("SELECT o FROM Order o WHERE o.status = :status")
    List<Order> findByStatus(OrderStatus status);
}
```

**Database**: PostgreSQL 14+
- Encoding: UTF-8
- Connection pool: HikariCP (max 20 connections)
- Transaction: ACID compliant

#### **3.3.2 Cache Interface**

```java
// Spring Data Redis
@Cacheable(value = "orders", key = "#userId", unless = "#result.isEmpty()")
public List<OrderDTO> getMyOrders(Long userId) {
    return orderRepository.findByUserId(userId);
}

@CacheEvict(value = "orders", key = "#userId")
public void updateOrderStatus(Long orderId, OrderStatus status, Long userId) {
    // logic
}
```

**Cache**: Redis 7+
- Serialization: JSON (Spring Boot tự động)
- TTL: 3 phút cho orders, 2 phút cho payments

#### **3.3.3 External Payment Gateway Interface**

```
REST API: PayOS
Endpoint: https://api.payos.vn/v1/checkout
Method: POST
Headers:
  - x-client-id: {CLIENT_ID}
  - x-api-key: {API_KEY}
  - Content-Type: application/json
  
Webhook endpoint: /api/payments/webhook/payos
Authentication: HmacSHA256 signature verification
```

#### **3.3.4 AI Service Interface**

```python
# FastAPI Python
@app.post("/api/ai/semantic-search")
async def semantic_search(query: str, top_k: int = 10):
    # Return list of products ranked by semantic similarity
    
@app.post("/api/ai/rag-qa")
async def rag_qa(question: str):
    # Return answer based on knowledge base
```

### 3.4 Giao diện Truyền thông

#### **3.4.1 HTTP/HTTPS (RESTful API)**

Tất cả API qua Gateway:

```
BASE_URL = http://localhost:8080 (dev) hoặc https://api.novagear.com (prod)

Routes:
  POST   /auth/login
  POST   /auth/register
  POST   /auth/refresh-token
  GET    /products
  GET    /products/{id}
  POST   /cart/add
  GET    /cart
  POST   /orders
  GET    /orders/{id}
  PUT    /orders/{id}/status (admin only)
  POST   /payments/checkout
  GET    /payments/status/{id}
  GET    /admin/orders (admin only)
  GET    /admin/dashboard (admin only)
```

**Request/Response Format**: JSON
```json
// Success Response
{
  "statusCode": 200,
  "message": "Success",
  "data": { ... }
}

// Error Response
{
  "statusCode": 400,
  "message": "Invalid request",
  "errors": { "fieldName": "Error message" }
}
```

#### **3.4.2 WebSocket (Real-time Communication)**

```
Endpoint: ws://localhost:8083/api/ws (dev)

Connection Flow:
1. Client connects to WebSocket
2. Client subscribes to topics:
   - /app/ping (heartbeat)
   - /app/subscribe/orders (user's orders)
   
3. Server sends on channels:
   - /topic/admin/orders (all admins)
   - /user/{userId}/queue/orders (specific user)

Fallback: REST polling every 5 seconds nếu WS down
```

**Message Format**:
```json
{
  "eventType": "ORDER_CONFIRMED|ORDER_SHIPPED|ORDER_DELIVERED",
  "orderId": 123,
  "userId": 456,
  "timestamp": "2026-05-04T10:30:00Z",
  "data": { "newStatus": "CONFIRMED", "estimatedDelivery": "2026-05-06" }
}
```

#### **3.4.3 Service-to-Service Communication**

**Synchronous (OpenFeign)**:
```java
@FeignClient(name = "notification-service", fallback = NotificationClientFallback.class)
public interface NotificationClient {
    @PostMapping("/api/notifications/realtime/order-update")
    void notifyOrderUpdate(OrderUpdateNotification notification);
}
```

**Asynchronous (Redis Pub/Sub / Message Broker - tuỳ chọn)**:
```java
redisTemplate.convertAndSend("order-channel", orderEvent);
```

---

## 4. YÊU CẦU CHỨC NĂNG

Yêu cầu chức năng được tổ chức theo từng **Domain Service**:

### 4.1 Auth Service - Xác thực & Phân quyền

#### **4.1.1 Yêu cầu Chức năng**

| ID | Chức năng | Mô tả | Actor | Priority |
|----|----------|-------|-------|----------|
| **AUTH-001** | Đăng ký (Register) | User có thể tạo tài khoản mới với email/password | Guest | **MUST** |
| **AUTH-002** | Đăng nhập (Login) | User/Admin/Staff đăng nhập với email + password | Guest | **MUST** |
| **AUTH-003** | Refresh Token | Auto renew JWT khi hết hạn | User | **MUST** |
| **AUTH-004** | Logout | Xóa token hiện tại | User | **SHOULD** |
| **AUTH-005** | Forgot Password | Gửi email reset password | User | **SHOULD** |
| **AUTH-006** | Role Assignment | Admin assign role cho user mới | Admin | **MUST** |
| **AUTH-007** | Multi-factor Auth | MFA via OTP (tuỳ chọn) | User | **COULD** |

#### **4.1.2 Luồng Chi tiết - Use Case: Đăng nhập**

**Actor**: User  
**Precondition**: User đã đăng ký tài khoản  
**Main Flow**:

1. User nhập email + password vào form đăng nhập
2. Frontend gửi POST /auth/login với credentials
3. Backend validate email format
4. Backend query database kiểm tra user tồn tại
5. Backend so sánh password (bcrypt)
6. Nếu match:
   - Generate JWT token (exp: 1 hour)
   - Return token + refresh_token (exp: 7 days)
7. Nếu không match:
   - Return error 401 "Invalid credentials"

**Alternative Flow** (Account khóa):
- Nếu user bị khóa: Return error 403 "Account locked"

**Postcondition**: User nhận JWT token để gọi các API khác

#### **4.1.3 Data Model**

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String passwordHash;  // Bcrypt
    
    private String fullName;
    private String phoneNumber;
    private String avatar;
    
    @Enumerated(EnumType.STRING)
    @ElementCollection(fetch = FetchType.EAGER)
    private Set<Role> roles;  // {ADMIN, STAFF, USER}
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime lastLogin;
    
    private boolean isActive = true;
}

public enum Role {
    ADMIN,
    STAFF,
    USER
}
```

### 4.2 User Service - Quản lý Người dùng

#### **4.2.1 Yêu cầu Chức năng**

| ID | Chức năng | Mô tả | Actor | Priority |
|----|----------|-------|-------|----------|
| **USER-001** | Get Profile | User xem thông tin cá nhân | User | **MUST** |
| **USER-002** | Update Profile | User cập nhật name, avatar, phone | User | **MUST** |
| **USER-003** | Manage Addresses | User thêm/xóa/cập nhật địa chỉ | User | **MUST** |
| **USER-004** | Change Password | User đổi mật khẩu | User | **MUST** |
| **USER-005** | List All Users | Admin xem danh sách toàn bộ user | Admin | **SHOULD** |
| **USER-006** | User Details | Admin xem chi tiết 1 user | Admin | **SHOULD** |
| **USER-007** | Deactivate User | Admin vô hiệu hóa user | Admin | **SHOULD** |

#### **4.2.2 Data Model**

```java
@Entity
@Table(name = "user_profiles")
public class UserProfile {
    @Id
    private Long userId;  // FK to User
    
    private String fullName;
    private String phoneNumber;
    private String avatar;
    private LocalDate dateOfBirth;
    private String gender;  // M/F/Other
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "user_id")
    private List<Address> addresses = new ArrayList<>();
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

@Entity
@Table(name = "addresses")
public class Address {
    @Id
    @GeneratedValue
    private Long id;
    
    private Long userId;
    private String street;
    private String ward;
    private String district;
    private String city;
    private String zipCode;
    private String phoneNumber;
    private boolean isDefault = false;
}
```

### 4.3 Product Service - Quản lý Sản phẩm

#### **4.3.1 Yêu cầu Chức năng**

| ID | Chức năng | Mô tả | Actor | Priority |
|----|----------|-------|-------|----------|
| **PROD-001** | List Products | Customer xem danh sách sản phẩm + filter/sort | User | **MUST** |
| **PROD-002** | Get Product Detail | Customer xem chi tiết 1 sản phẩm | User | **MUST** |
| **PROD-003** | Search Products | Tìm kiếm sản phẩm theo từ khóa (full-text) | User | **SHOULD** |
| **PROD-004** | Semantic Search | Tìm kiếm sản phẩm theo ngữ nghĩa (AI) | User | **COULD** |
| **PROD-005** | Create Product | Admin thêm sản phẩm mới | Admin | **MUST** |
| **PROD-006** | Update Product | Admin sửa thông tin sản phẩm | Admin | **MUST** |
| **PROD-007** | Delete Product | Admin xóa sản phẩm | Admin | **MUST** |
| **PROD-008** | Manage Categories | Admin tạo/sửa/xóa danh mục | Admin | **SHOULD** |
| **PROD-009** | Product Variants | Admin tạo variant (size/color/memory) | Admin | **SHOULD** |
| **PROD-010** | Product Reviews | Customer xem/viết review | User | **SHOULD** |
| **PROD-011** | Product Rating | Tổng hợp rating từ reviews | User | **SHOULD** |

#### **4.3.2 Luồng Chi tiết - Use Case: List & Filter Products**

**Actor**: Customer  
**Main Flow**:

1. Customer truy cập /products hoặc /products?category=electronics
2. Frontend gửi GET /api/products?page=1&limit=20&category=electronics&sort=popularity
3. Backend:
   - Validate parameters
   - Query database với filter/sort
   - Apply Redis cache (3 min TTL) cho list phổ biến
   - Return paginated result
4. Frontend render product grid
5. Khi scroll down → fetch trang tiếp (infinite scroll hoặc pagination)

#### **4.3.3 Data Model**

```java
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String sku;
    
    @Column(nullable = false)
    private String name;
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
    
    @Column(nullable = false)
    private BigDecimal basePrice;  // Giá cơ sở
    private BigDecimal salePrice;  // Giá sale (optional)
    private Float discountPercent;
    
    private Integer totalStock;
    
    private String imageUrl;  // Main image
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "product_id")
    private List<ProductImage> images;
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "product_id")
    private List<ProductVariant> variants;
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "product_id")
    private List<Review> reviews;
    
    private Float averageRating;
    private Integer reviewCount;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isActive = true;
}

@Entity
@Table(name = "product_variants")
public class ProductVariant {
    @Id
    @GeneratedValue
    private Long id;
    
    private Long productId;
    private String variantType;  // size, color, memory
    private String variantValue; // M, Red, 256GB
    
    private Integer stock;
    private BigDecimal priceModifier;  // +100k cho bộ nhớ cao hơn
    
    @Column(unique = true)
    private String variantSku;
}

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue
    private Long id;
    
    private String name;
    private String description;
    private String imageUrl;
    
    @ManyToOne
    @JoinColumn(name = "parent_category_id")
    private Category parentCategory;  // Multi-level categories
}

@Entity
@Table(name = "reviews")
public class Review {
    @Id
    @GeneratedValue
    private Long id;
    
    private Long productId;
    private Long userId;
    private String userName;
    
    private Integer rating;  // 1-5 stars
    private String title;
    private String comment;
    
    private Integer helpfulCount = 0;
    
    private LocalDateTime createdAt;
}
```

### 4.4 Cart Service - Quản lý Giỏ hàng

#### **4.4.1 Yêu cầu Chức năng**

| ID | Chức năng | Mô tả | Actor | Priority |
|----|----------|-------|-------|----------|
| **CART-001** | Get Cart | User xem giỏ hàng của mình | User | **MUST** |
| **CART-002** | Add to Cart | User thêm sản phẩm vào giỏ | User | **MUST** |
| **CART-003** | Update Item Qty | User cập nhật số lượng item | User | **MUST** |
| **CART-004** | Remove Item | User xóa item khỏi giỏ | User | **MUST** |
| **CART-005** | Clear Cart | User xóa toàn bộ giỏ | User | **SHOULD** |
| **CART-006** | Calculate Total | Tự động tính tổng tiền | User | **MUST** |
| **CART-007** | Apply Coupon | User nhập mã coupon giảm giá | User | **COULD** |
| **CART-008** | Persist Cart | Lưu giỏ hàng (DB hoặc Redis) | System | **MUST** |

#### **4.4.2 Data Model**

```java
@Entity
@Table(name = "carts")
public class Cart {
    @Id
    private Long userId;  // Primary key
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "user_id")
    private List<CartItem> items = new ArrayList<>();
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

@Entity
@Table(name = "cart_items")
public class CartItem {
    @Id
    @GeneratedValue
    private Long id;
    
    private Long userId;
    private Long productId;
    private Long variantId;  // Optional, nếu product có variant
    
    private Integer quantity;
    
    private BigDecimal unitPrice;  // Giá tại thời điểm thêm
    private BigDecimal subtotal;   // quantity * unitPrice
    
    private LocalDateTime addedAt;
}

// Calculation (trong CartService):
public BigDecimal calculateCartTotal(Long userId) {
    return cartRepository.findByUserId(userId)
        .getItems()
        .stream()
        .map(CartItem::getSubtotal)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
}
```

### 4.5 Order Service - Quản lý Đơn hàng

#### **4.5.1 Yêu cầu Chức năng**

| ID | Chức năng | Mô tả | Actor | Priority |
|----|----------|-------|-------|----------|
| **ORDER-001** | Create Order | User tạo order từ giỏ hàng | User | **MUST** |
| **ORDER-002** | Get Order | User xem chi tiết 1 order | User | **MUST** |
| **ORDER-003** | List My Orders | User xem danh sách order của mình | User | **MUST** |
| **ORDER-004** | Cancel Order | User hủy order (nếu còn có thể) | User | **SHOULD** |
| **ORDER-005** | List All Orders | Admin/Staff xem toàn bộ order | Admin/Staff | **MUST** |
| **ORDER-006** | Update Status | Admin/Staff cập nhật trạng thái order | Admin/Staff | **MUST** |
| **ORDER-007** | Real-time Notification | Notify khi order status thay đổi | System | **MUST** |
| **ORDER-008** | Download Invoice | User download hóa đơn PDF | User | **SHOULD** |
| **ORDER-009** | Cache Orders | Cache danh sách order (Redis) | System | **MUST** |

#### **4.5.2 Luồng Chi tiết - Use Case: Create Order (Checkout)**

**Actor**: Customer  
**Precondition**: Customer có items trong giỏ hàng  
**Main Flow**:

1. Customer click "Checkout" → Checkout page
2. Frontend gửi POST /api/orders với payload:
   ```json
   {
     "shippingAddressId": 123,
     "paymentMethod": "COD",
     "items": [
       {"productId": 1, "variantId": 101, "quantity": 2}
     ]
   }
   ```
3. Backend validate:
   - User authenticated
   - Shipping address valid
   - Items tồn tại và có stock
4. Create Order entity với status = PENDING
5. Reserve stock (tạm giữ tồn kho)
6. Clear user's cart
7. Notify Notification Service (gửi event ORDER_CREATED)
8. Return order detail + Payment URL (nếu PayOS)

**Alternative Flow** (Stock không đủ):
- Return error với available quantity

**Postcondition**: Order được tạo, customer redirect to payment

#### **4.5.3 Order Status Lifecycle**

```
PENDING (Chờ xác nhận)
  ↓ (Admin xác nhận)
CONFIRMED (Đã xác nhận)
  ↓ (Admin yêu cầu vận chuyển)
SHIPPING (Đang vận chuyển)
  ↓ (Giao thành công)
DELIVERED (Đã giao hàng)

PENDING → CANCELED (nếu customer cancel hoặc hết hạn thanh toán)
```

#### **4.5.4 Data Model**

```java
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue
    private Long id;
    
    private Long userId;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;
    
    private Long shippingAddressId;
    private Long billingAddressId;
    
    private BigDecimal subtotal;      // Tổng tiền hàng
    private BigDecimal shippingFee;   // Phí vận chuyển
    private BigDecimal taxAmount;     // Thuế
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;   // Tổng cộng
    
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;  // COD, PAYOS
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "order_id")
    private List<OrderItem> items;
    
    private String notes;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
}

@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue
    private Long id;
    
    private Long orderId;
    private Long productId;
    private Long variantId;
    
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    SHIPPING,
    DELIVERED,
    CANCELED
}

public enum PaymentMethod {
    COD,           // Cash On Delivery
    PAYOS_TRANSFER, // PayOS
    PAYOS_QR       // PayOS QR
}
```

#### **4.5.5 Caching Strategy**

```java
@Service
public class OrderService {
    
    @Cacheable(value = "orders", key = "#userId", unless = "#result.isEmpty()")
    public List<OrderDTO> getMyOrders(Long userId) {
        return orderRepository.findByUserId(userId);
    }
    
    @CacheEvict(value = "orders", key = "#userId")
    public Order createOrder(Long userId, CreateOrderRequest req) {
        // Create logic
    }
    
    @CacheEvict(value = "orders", key = "#userId")
    public void updateOrderStatus(Long orderId, OrderStatus status, Long userId) {
        // Update logic
        // + Notify Notification Service
    }
}
```

### 4.6 Payment Service - Quản lý Thanh toán

#### **4.6.1 Yêu cầu Chức năng**

| ID | Chức năng | Mô tả | Actor | Priority |
|----|----------|-------|-------|----------|
| **PAY-001** | Create Checkout | Tạo checkout URL cho PayOS | System | **MUST** |
| **PAY-002** | Handle Webhook | Xử lý Webhook từ PayOS (payment success) | System | **MUST** |
| **PAY-003** | Verify Payment | Verify payment signature từ PayOS | System | **MUST** |
| **PAY-004** | Get Payment Status | User check trạng thái thanh toán | User | **SHOULD** |
| **PAY-005** | Payment History | User xem lịch sử thanh toán | User | **SHOULD** |
| **PAY-006** | Refund | Admin xử lý hoàn tiền | Admin | **SHOULD** |
| **PAY-007** | Fallback COD | Nếu PayOS lỗi, fallback to COD | System | **MUST** |

#### **4.6.2 Luồng Chi tiết - Use Case: PayOS Payment**

**Actor**: Customer  
**Precondition**: Order được tạo với paymentMethod = PAYOS  
**Main Flow**:

1. Customer chọn "Pay with PayOS" → button redirect to payment page
2. Backend create PayOS checkout:
   ```
   POST https://api.payos.vn/v1/checkout
   {
     "orderCode": 123456,
     "amount": 1000000,
     "description": "Order #123",
     "returnUrl": "https://novagear.com/orders/123/payment-success",
     "cancelUrl": "https://novagear.com/checkout",
     "items": [...]
   }
   ```
3. PayOS return checkoutUrl + paymentLinkId
4. Frontend redirect customer to PayOS payment page
5. Customer thực hiện thanh toán (transfer/QR)
6. PayOS gọi webhook: POST /api/payments/webhook/payos
7. Backend verify signature (HmacSHA256)
8. Nếu resultCode = 0 (success):
   - Update Order status = PAID
   - Update Payment record status = SUCCESS
   - Notify Order Service
   - Clear Redis cache
9. Nếu không thành công:
   - Log error
   - Order vẫn PENDING
   - Customer có thể retry hoặc chuyển sang COD

**Alternative Flow** (PayOS timeout/error):
- Fallback to COD: Update order paymentMethod = COD

#### **4.6.3 Data Model**

```java
@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue
    private Long id;
    
    private Long orderId;
    private Long userId;
    
    @Enumerated(EnumType.STRING)
    private PaymentMethod method;  // COD, PAYOS_TRANSFER, PAYOS_QR
    
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;  // PENDING, SUCCESS, FAILED, REFUNDED
    
    // PayOS specific fields
    private String payosOrderCode;
    private String paymentLinkId;
    private String transactionId;
    
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private LocalDateTime refundedAt;
}

public enum PaymentStatus {
    PENDING,
    SUCCESS,
    FAILED,
    REFUNDED
}
```

### 4.7 Notification Service - Thông báo Real-time

#### **4.7.1 Yêu cầu Chức năng**

| ID | Chức năng | Mô tả | Actor | Priority |
|----|----------|-------|-------|----------|
| **NOTIF-001** | WebSocket Connection | Customer kết nối WebSocket | System | **MUST** |
| **NOTIF-002** | Admin Order Board | Broadcast order updates to admins | System | **MUST** |
| **NOTIF-003** | User Order Notification | Gửi notification cho user về order của họ | System | **MUST** |
| **NOTIF-004** | Fallback Polling | Polling endpoint nếu WebSocket down | System | **MUST** |
| **NOTIF-005** | Notification History | User xem lịch sử thông báo | User | **SHOULD** |
| **NOTIF-006** | Mark as Read | User đánh dấu thông báo đã đọc | User | **SHOULD** |
| **NOTIF-007** | Heartbeat/Ping | Keep-alive connection | System | **MUST** |

#### **4.7.2 WebSocket Architecture**

```
STOMP Message Broker Topics:

/topic/admin/orders
  ├─ Broadcast: Tất cả admin nhận được
  └─ Message: OrderUpdateNotification (status, timestamp)

/topic/admin/inventory
  └─ Broadcast: Stock alert cho admins

/user/{userId}/queue/orders
  ├─ Point-to-point: Chỉ user này nhận được
  └─ Message: Notification về order của user

/topic/system/announcements
  └─ Broadcast: Thông báo toàn hệ thống
```

#### **4.7.3 Real-time Message Format**

```json
{
  "id": "uuid-1234",
  "eventType": "ORDER_CONFIRMED|ORDER_SHIPPED|ORDER_DELIVERED",
  "orderId": 123,
  "userId": 456,
  "status": "CONFIRMED",
  "message": "Order #123 has been confirmed",
  "data": {
    "newStatus": "CONFIRMED",
    "updatedBy": "admin@novagear.com",
    "timestamp": "2026-05-04T10:30:00Z"
  },
  "sentAt": "2026-05-04T10:30:01Z"
}
```

#### **4.7.4 Polling Endpoint (Fallback)**

```
GET /api/notifications/orders/me
Response:
[
  {
    "id": 1,
    "type": "ORDER_CONFIRMED",
    "orderId": 123,
    "message": "Your order has been confirmed",
    "isRead": false,
    "createdAt": "2026-05-04T10:30:00Z"
  }
]
```

#### **4.7.5 Data Model**

```java
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue
    private Long id;
    
    private Long userId;
    
    @Enumerated(EnumType.STRING)
    private NotificationType type;
    
    private Long relatedEntityId;  // orderId, productId, etc.
    
    private String title;
    private String message;
    
    private boolean isRead = false;
    
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}

public enum NotificationType {
    ORDER_CREATED,
    ORDER_CONFIRMED,
    ORDER_SHIPPED,
    ORDER_DELIVERED,
    PAYMENT_RECEIVED,
    STOCK_LOW,
    SYSTEM_ANNOUNCEMENT
}
```

### 4.8 AI Service - Hỗ trợ Thông minh

#### **4.8.1 Yêu cầu Chức năng**

| ID | Chức năng | Mô tả | Actor | Priority |
|----|----------|-------|-------|----------|
| **AI-001** | Semantic Search | Tìm kiếm sản phẩm theo nghĩa | Customer | **COULD** |
| **AI-002** | RAG QA | Hỏi đáp từ knowledge base | Staff | **COULD** |
| **AI-003** | Product Recommendation | Gợi ý sản phẩm dựa trên lịch sử | Customer | **COULD** |
| **AI-004** | Embeddings | Generate embeddings cho sản phẩm | System | **COULD** |

#### **4.8.2 Semantic Search Endpoint**

```python
@app.post("/api/ai/search")
async def semantic_search(request: SearchRequest):
    """
    query: "red laptop under 20 million"
    top_k: 10
    
    Returns: List[ProductRanked]
    """
    # 1. Convert query to embedding
    # 2. Search in vector DB
    # 3. Return top_k products
```

---

## 5. YÊU CẦU PHI CHỨC NĂNG

### 5.1 Hiệu Năng (Performance)

#### **5.1.1 Response Time Targets**

| Endpoint/Operation | Target | Điều kiện |
|----|---------|-----------|
| GET /api/products (list) | <50ms | Có cache |
| GET /api/products/{id} | <100ms | First request: <200ms |
| POST /api/orders (create) | <200ms | Async notification |
| WebSocket update | <100ms | Browser to update visible |
| Polling fallback | <5s | Next poll cycle |

#### **5.1.2 Throughput**

- Hệ thống phải xử lý tối thiểu **5,000 concurrent users** (5K CU)
- **100 requests/second** (RPS) trên average
- **500 RPS** spike (peak) được chịu dựng

#### **5.1.3 Cache Strategy**

| Data | TTL | Key Pattern |
|------|-----|-------------|
| Product list | 5 min | products:list:{category} |
| Product detail | 10 min | products:detail:{id} |
| User orders | 3 min | orders:myOrders:{userId} |
| Order detail | 3 min | orders:detail:{orderId} |
| Payment status | 2 min | payments:status:{paymentId} |

#### **5.1.4 Database Performance**

- Tất cả query phải có **EXPLAIN ANALYZE** tối ưu
- Index trên:
  - `orders.userId` (lookup user's orders)
  - `orders.status` (filter by status)
  - `products.category_id` (filter by category)
  - `order_items.order_id` (FK joins)
  - `payments.order_id` (lookup payment for order)

#### **5.1.5 Frontend Performance**

- **LCP (Largest Contentful Paint)** < 2.5 seconds
- **FID (First Input Delay)** < 100ms
- **CLS (Cumulative Layout Shift)** < 0.1
- **Bundle size** <500KB gzipped (initial)
- **Time to Interactive (TTI)** < 3.5 seconds

### 5.2 Bảo Mật (Security)

#### **5.2.1 Authentication & Authorization**

```
Flow:
1. User login → Backend issue JWT token + refresh_token
2. Frontend store JWT in memory (or httpOnly cookie)
3. Mỗi request gửi JWT via Authorization header:
   Authorization: Bearer {jwt_token}
4. Backend validate JWT signature + expiry
5. Extract claims (userId, roles)
6. Enforce RBAC: @Secured(roles = "ADMIN")
```

**JWT Structure**:
```json
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "user123",           // subject (userId)
  "email": "user@novagear.com",
  "roles": ["USER", "ADMIN"],
  "iat": 1234567890,           // issued at
  "exp": 1234571490            // expires (1 hour)
}
```

#### **5.2.2 API Security**

| Aspek | Requirement |
|-------|-------------|
| **HTTPS** | Bắt buộc ở production (TLS 1.2+) |
| **CORS** | Whitelist domains cụ thể |
| **Rate Limiting** | 100 req/min per IP (login: 5 req/min) |
| **Input Validation** | Validate tất cả input (length, type, format) |
| **SQL Injection** | Dùng parameterized queries (Spring Data JPA) |
| **XSS** | Escape output, CSP headers |
| **CSRF** | Token-based CSRF protection (nếu session) |

#### **5.2.3 Password Security**

- Mã hóa: **BCrypt** (cost factor = 12)
- Độ dài tối thiểu: 8 ký tự
- Yêu cầu: ít nhất 1 uppercase, 1 digit
- Không lưu password ở cache/logs

#### **5.2.4 Payment Security (PayOS)**

```java
// Verify webhook signature
String signature = request.getHeader("x-payos-signature");
String bodyJson = request.getBody(); // Raw JSON

// Generate signature from server secret
String computedSignature = HmacSHA256(bodyJson, SECRET_KEY);

if (!computedSignature.equals(signature)) {
    // Invalid signature - reject
    return 401 Unauthorized;
}
```

#### **5.2.5 Data Protection**

- **Sensitive data** (password, payment token): Không log, không cache
- **PII** (email, phone): Encrypt ở rest (tuỳ chọn)
- **Session**: Stateless (JWT), không server-side session store
- **Audit log**: Ghi lại tất cả thay đổi critical (user delete, payment, order cancel)

#### **5.2.6 Infrastructure Security**

- Microservices **không expose** trực tiếp ra Internet
- Chỉ Gateway + Frontend server publicly accessible
- Internal service-to-service: Firewall + VPC
- Database: Private subnet, accessed via application only
- Secrets management: Environment variables (không hardcode)

### 5.3 Tính Sẵn Sàng & Khả Năng Chịu Lỗi (Reliability & Fault Tolerance)

#### **5.3.1 Service-level Targets**

| Metric | Target |
|--------|--------|
| **Availability** | 99.9% uptime (SLA) = ~44 min downtime/month |
| **MTTF** | Mean Time To Failure: >720 hours |
| **MTTR** | Mean Time To Recovery: <15 minutes |

#### **5.3.2 Fallback Mechanisms**

**Scenario 1: Notification Service Down**
```
Order Service calls Notification Service
  ├─ Success → Broadcast WebSocket immediately
  └─ Failure (timeout/500) → Catch exception
      ├─ Log error
      ├─ Queue event to Redis (Pub/Sub)
      └─ Return success to client
      
Later:
  - Notification Service recovers
  - Redis listener picks up queued events
  - Process & broadcast to clients
```

**Scenario 2: WebSocket Disconnected**
```
Frontend:
  ├─ Try connect WebSocket
  ├─ If fails or timeout after 5s
  └─ Fallback to HTTP polling (every 5s)
      └─ GET /api/notifications/orders/me
      
When WebSocket reconnects:
  └─ Stop polling, switch back to WS
```

**Scenario 3: Database Connection Lost**
```
Backend:
  ├─ Connection pool maintains retry logic
  ├─ If all connections exhausted
  └─ Return 503 Service Unavailable
  
Frontend:
  └─ Retry with exponential backoff (1s, 2s, 4s, max 30s)
```

#### **5.3.3 Circuit Breaker Pattern (Resilience4j)**

```java
@Service
public class OrderService {
    
    @CircuitBreaker(name = "notificationService", fallbackMethod = "notifyOrderUpdateFallback")
    public void notifyOrderUpdate(OrderUpdateNotification notification) {
        notificationClient.notify(notification);
    }
    
    public void notifyOrderUpdateFallback(OrderUpdateNotification notification, Exception ex) {
        log.warn("Notification service down, queuing event", ex);
        // Queue to Redis or DB for retry
    }
}
```

#### **5.3.4 Health Checks**

Mỗi service expose `/actuator/health`:
```json
{
  "status": "UP",
  "components": {
    "db": {"status": "UP"},
    "redis": {"status": "UP"},
    "diskSpace": {"status": "UP"}
  }
}
```

### 5.4 Khả Năng Mở Rộng & Bảo Trì (Scalability & Maintainability)

#### **5.4.1 Horizontal Scaling**

Mỗi service có thể chạy **multiple instances** phía sau load balancer:

```
Load Balancer (Nginx/HAProxy)
  ├─ Order Service Instance 1 (8082)
  ├─ Order Service Instance 2 (8082)
  ├─ Order Service Instance 3 (8082)
  └─ ...
```

#### **5.4.2 Database Scaling**

- **Read replicas**: PostgreSQL replication cho scaling read queries
- **Partitioning**: Partition large tables (orders, payments) theo userId
- **Archiving**: Archive old orders (> 2 years) sang separate DB

#### **5.4.3 Code Organization**

```
backend/Order/
├── src/main/java/com/novagear/order/
│   ├── api/
│   │   ├── controller/
│   │   │   ├── OrderController.java
│   │   │   └── AdminOrderController.java
│   │   └── dto/
│   │       ├── OrderDTO.java
│   │       └── CreateOrderRequest.java
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Order.java
│   │   │   └── OrderItem.java
│   │   └── event/
│   │       └── OrderStatusChangedEvent.java
│   ├── service/
│   │   ├── OrderService.java
│   │   └── OrderValidator.java
│   └── infrastructure/
│       ├── repository/
│       │   └── OrderRepository.java
│       └── client/
│           └── NotificationClient.java
├── pom.xml
└── README.md
```

#### **5.4.4 Documentation**

- **Code Comments**: Giải thích complex business logic
- **API Documentation**: OpenAPI/Swagger for each service
- **Database Schema**: ER diagrams, migrations tracked
- **Architecture Decision Records (ADR)**: Why we chose microservices, JWT, etc.

---

## 6. YÊU CẦU DỮ LIỆU

### 6.1 Data Dictionary

#### **User Data**

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| email | String | NOT NULL, UNIQUE | Email format validation |
| password_hash | String | NOT NULL | Bcrypt, min 60 chars |
| full_name | String | Max 100 | Trimmable |
| phone_number | String | Length 10-11 | Vietn Telecom format |
| created_at | DateTime | NOT NULL, DEFAULT NOW | Auto-generated |

#### **Product Data**

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| sku | String | NOT NULL, UNIQUE | e.g., "LAPTOP-001" |
| name | String | NOT NULL, Max 255 | Product name |
| base_price | Decimal(12,2) | ≥0 | VND currency |
| total_stock | Integer | ≥0 | Reserve for orders |
| created_at | DateTime | NOT NULL | Audit trail |

#### **Order Data**

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| order_code | String | UNIQUE | "ORD-" + timestamp |
| total_amount | Decimal(12,2) | ≥0 | Final amount to pay |
| status | Enum | PENDING/CONFIRMED/SHIPPING/DELIVERED/CANCELED | State machine |
| payment_method | Enum | COD/PAYOS_TRANSFER/PAYOS_QR | Immutable after create |

### 6.2 Data Retention & Archival

| Entity | Retention | Archival |
|--------|-----------|----------|
| User | Permanent | N/A |
| Order | 2 years | Archive to separate DB |
| Payment | 5 years (tax) | Archive yearly |
| Notification | 30 days | Auto-delete |
| Log | 90 days | Rotate, compress |

### 6.3 Data Quality Requirements

- **Accuracy**: All financial data (prices, payments) must be precise (±0.01 VND)
- **Consistency**: DB ACID transactions, no orphaned records
- **Completeness**: All required fields populated before save
- **Timeliness**: Data updated in real-time (WebSocket <100ms)

---

## 7. YÊU CẦU AN TOÀN

### 7.1 Privacy & Data Protection

- **GDPR compliance** (if applicable): Right to access, delete, portability
- **Vietnam Data Protection Law**: Encrypt sensitive PII
- **Payment Card Industry (PCI)**: Don't store full credit card numbers (PayOS handles)

### 7.2 Compliance & Regulations

- **Terms of Service**: Clear terms for users/merchants
- **Refund Policy**: Define refund conditions (30 days, defective items, etc.)
- **Tax Compliance**: Deduct VAT as required by Vietnam law

---

## 8. YÊU CẦU PHỤ TRỢ

### 8.1 Installation & Deployment

- **Environment setup**: Docker Compose for local development
- **Deployment**: Kubernetes manifest files (YAML)
- **CI/CD**: GitHub Actions for automated build/test/deploy
- **Documentation**: README per service, setup guide, troubleshooting

### 8.2 Monitoring & Logging

#### **Logging Strategy**

| Component | Tool | Level | Rotation |
|-----------|------|-------|----------|
| Application | SLF4J + Logback | INFO (DEBUG in dev) | Daily, 10 files |
| Database | PostgreSQL logs | LOG | Weekly |
| WebSocket | Spring logs | DEBUG | Daily |

**Log Format**:
```
[2026-05-04 10:30:01] [ORDER-SERVICE] [INFO] User created order #123 - duration=45ms
[2026-05-04 10:30:02] [PAYMENT-SERVICE] [ERROR] PayOS webhook failed - code=TIMEOUT - retry_count=1
```

#### **Monitoring Metrics**

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| CPU usage | Prometheus | >80% |
| Memory usage | Prometheus | >85% |
| DB connections | Prometheus | >15/20 |
| Response time (p95) | Prometheus | >500ms |
| Error rate | Prometheus | >1% |
| WebSocket connections | Prometheus | >1000 (health check) |

### 8.3 Support & Maintenance

- **Bug Fix SLA**: P1 (Critical) <2h, P2 (Major) <8h, P3 (Minor) <48h
- **Release Cycle**: Monthly feature release, weekly hotfix release
- **Upgrade Path**: Backward-compatible API versioning

---

## 9. PHỤ LỤC

### 9.1 Use Case Diagram

```
┌─────────────────────────────────────────────────────┐
│                     NovaGear E-commerce             │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Customer      ┌─ Browse Products                   │
│     ├────────▶│ ├─ Search                          │
│     │         │ └─ Filter                          │
│     │         │                                    │
│     │ ┌────────────────────────────────────────┐  │
│     │ │         ┌─ Add to Cart                │  │
│     ├─┤         ├─ View Cart                  │  │
│     │ │ ├─────▶ └─ Checkout                  │  │
│     │ │ │       ┌─ Select Payment Method      │  │
│     │ │ └──────▶│ ├─ COD                      │  │
│     │ │         │ └─ PayOS                    │  │
│     │ │         └─ Place Order                │  │
│     │ └────────────────────────────────────────┘  │
│     │                                             │
│     └─────────────▶ │ Track My Orders              │
│                     │ ├─ Get Order Status          │
│                     │ └─ Real-time Notification    │
│                                                     │
│ Admin        ┌─ Manage Products                   │
│     ├───────▶│ ├─ CRUD Product                    │
│     │        │ └─ Manage Categories               │
│     │        │                                    │
│     │ ┌───────────────────────────────────────┐  │
│     │ │   Admin Order Board (Real-time)      │  │
│     ├─┤   ├─ View All Orders                 │  │
│     │ │   ├─ Update Order Status             │  │
│     │ │   ├─ WebSocket Live Updates          │  │
│     │ │   └─ Export Report                   │  │
│     │ └───────────────────────────────────────┘  │
│     │                                            │
│     └────────────▶ │ Manage Users                  │
│                    │ ├─ Assign Roles               │
│                    │ └─ View User Details          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 9.2 Activity Diagram - Order Creation

```
Customer
   │
   ▼
(Add Products to Cart)
   │
   ▼
[Check Stock Available?]
   ├─ NO → Error: Out of Stock
   └─ YES
      │
      ▼
   (Proceed to Checkout)
      │
      ▼
   [Enter Shipping Address]
      │
      ▼
   [Select Payment Method]
      │
      ├─ COD → Direct to Place Order
      └─ PayOS
         │
         ▼
      [Generate PayOS Checkout URL]
         │
         ▼
      (Customer Redirected to PayOS)
         │
         ▼
      [Customer Performs Payment]
         │
         ├─ Success → Webhook received
         └─ Failed/Canceled → Return to cart
            │
            ▼
         [Place Order & Clear Cart]
            │
            ▼
         [Order Status: PENDING]
            │
            ▼
         (Notify Notification Service)
            │
            ▼
         (Broadcast to Admin Dashboard)
            │
            ▼
         (Send Confirmation to Customer)
```

### 9.3 Deployment Checklist

- [ ] Database schema migrated
- [ ] Redis cache configured
- [ ] JWT secret key set
- [ ] PayOS credentials configured
- [ ] Email service configured (for password reset)
- [ ] SSL certificate installed
- [ ] CORS whitelist configured
- [ ] Rate limiting rules set
- [ ] Monitoring dashboard setup
- [ ] Backup policy configured
- [ ] Disaster recovery plan tested

### 9.4 Testing Strategy

#### **Unit Testing**
- Min 80% code coverage
- Framework: JUnit 5, Mockito, Vitest
- Example: `OrderServiceTest.java`

#### **Integration Testing**
- Test service-to-service communication
- Framework: TestContainers for DB/Redis
- Example: `OrderServiceIntegrationTest.java`

#### **End-to-End Testing**
- Test full user flow (register → order → payment)
- Tool: Cypress, Selenium
- Example: `checkout.e2e.ts`

#### **Performance Testing**
- Load test: 5,000 concurrent users
- Tool: JMeter, k6
- Target: <100ms response time p95

#### **Security Testing**
- Penetration testing
- OWASP Top 10 check
- SQL injection, XSS, CSRF scenarios

### 9.5 Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Database outage | Medium | High | Backup + restore procedure, read replicas |
| PayOS payment failure | Low | High | Fallback to COD, retry logic, notification |
| WebSocket connection loss | Medium | Medium | Fallback to HTTP polling |
| High concurrent load | Medium | High | Horizontal scaling, Redis caching, rate limiting |
| Security breach (data leak) | Low | Critical | Encryption, audit logging, penetration testing |

### 9.6 Success Criteria

| Criteria | Target | Measure |
|----------|--------|---------|
| **Availability** | 99.9% | Monitor uptime via Prometheus |
| **Performance** | <100ms (p95) | Response time monitoring |
| **User Growth** | 10K+ monthly | Analytics dashboard |
| **Revenue** | 100M VND/month | Payment transactions tracked |
| **Bug Density** | <5 bugs/10KLOC | QA bug reports |
| **Security** | 0 critical CVEs | Regular security audit |

---

## Ký phê duyệt

| Vai trò | Tên | Chữ ký | Ngày |
|--------|-----|--------|------|
| Project Manager | [Tên PM] | ________________ | __/__/____ |
| Tech Lead | [Tên TL] | ________________ | __/__/____ |
| QA Lead | [Tên QA] | ________________ | __/__/____ |
| Product Owner | [Tên PO] | ________________ | __/__/____ |

---

## Lịch sử Thay đổi

| Phiên bản | Ngày | Tác giả | Thay đổi |
|-----------|------|--------|---------|
| 1.0 | 2026-04-15 | Team | Initial version |
| 2.0 | 2026-05-04 | Team | Added complete FR/NFR, data model, deployment checklist |

---

**Document Status**: ✅ APPROVED  
**Next Review Date**: 2026-08-04  
**Owner**: NovaGear Development Team

