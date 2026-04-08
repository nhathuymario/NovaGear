# Tổng hợp các lỗi đã fix - NovaGear

Tài liệu này ghi lại các lỗi thực tế đã gặp trong quá trình nối **BE ↔ FE**, đặc biệt là các lỗi do **mapping sai dữ liệu**, **sai payload**, **thiếu auth**, và **ảnh/fallback không an toàn**.

Mục tiêu:
- Nhìn nhanh nguyên nhân gốc của lỗi
- Biết file nào đã sửa
- Tránh lặp lại lỗi khi BE đổi response hoặc FE đổi mapping

---

## 1) Checkout bị `400 Bad Request`

### Triệu chứng
- Khi bấm thanh toán ở `CheckoutPage`, API `POST /api/orders/checkout` trả về `400`.

### Nguyên nhân gốc
- FE gửi sai tên field so với DTO backend.
- FE gửi:
  - `receiverName`
  - `receiverPhone`
  - `shippingAddress`
- BE yêu cầu:
  - `customerName`
  - `phone`
  - `address`
  - `note`

### File liên quan
- `frontend/src/pages/CheckoutPage.tsx`
- `frontend/src/types/order.ts`
- `backend/Order/src/main/java/uth/nhathuy/Order/dto/CheckoutRequest.java`
- `backend/Order/src/main/java/uth/nhathuy/Order/controller/OrderController.java`

### Cách fix
- Đổi payload FE sang đúng field của DTO backend.
- Giữ UI label cũ cho người dùng, chỉ đổi tên field khi gửi request.

### Kinh nghiệm
- Khi BE có `record DTO`, phải map đúng tên field 100%.
- Không suy đoán theo tên hiển thị trên form.
- Nếu có `@NotBlank`, thiếu field là backend trả 400 ngay.

---

## 2) Giỏ hàng bị thiếu thông tin sản phẩm

### Triệu chứng
- Item trong giỏ có số lượng nhưng thiếu hoặc trống `tên sản phẩm`, `ảnh`, `giá`.
- UI hiện item “rỗng” hoặc chỉ còn khung.

### Nguyên nhân gốc
- BE trả dữ liệu cart theo nhiều lớp khác nhau.
- FE chỉ tin vào `item.product`, trong khi backend cart response có thể đã có sẵn:
  - `productName`
  - `thumbnail`
  - `price`
  - `variantName`
  - `lineTotal`
- Một số item không có nested `product`, nên FE render thiếu.

### File liên quan
- `frontend/src/api/cartApi.ts`
- `frontend/src/types/cart.ts`
- `frontend/src/pages/CartPage.tsx`
- `backend/Cart/src/main/java/uth/nhathuy/Cart/dto/CartItemResponse.java`
- `backend/Cart/src/main/java/uth/nhathuy/Cart/service/CartService.java`

### Cách fix
- Map thêm dữ liệu top-level từ response của cart.
- Ưu tiên render theo thứ tự:
  1. `item.productName`
  2. `item.product?.name`
  3. fallback an toàn
- Tương tự cho ảnh và giá:
  - `thumbnail`
  - `product.imageUrl`
  - fallback nội bộ

### Kinh nghiệm
- Không phụ thuộc hoàn toàn vào nested object nếu backend đã trả flat fields.
- Với response giỏ hàng/đơn hàng, nên hỗ trợ cả 2 kiểu:
  - nested product/variant
  - flat summary fields
- FE cần chịu được trường hợp BE đổi shape nhưng vẫn giữ ý nghĩa dữ liệu.

---

## 3) Ảnh placeholder ngoài mạng bị lỗi

### Triệu chứng
- Console báo lỗi kiểu:
  - `GET https://via.placeholder.com/... net::ERR_CONNECTION_CLOSED`
- Ảnh trong cart / order / product detail không load được.

### Nguyên nhân gốc
- FE dùng placeholder ảnh từ dịch vụ bên ngoài.
- Khi mạng chặn, DNS lỗi, hoặc dịch vụ chết, UI bị vỡ ảnh.

### File liên quan
- `frontend/src/utils/image.ts`
- `frontend/src/pages/CartPage.tsx`
- `frontend/src/pages/OrderDetailPage.tsx`
- `frontend/src/pages/ProductDetailPage.tsx`
- `frontend/src/components/product/ProductCard.tsx`

### Cách fix
- Tạo fallback ảnh nội bộ dạng SVG data URI.
- Dùng helper chung:
  - `getFallbackImageSrc()`
  - `handleImageError()`
- Thay toàn bộ `via.placeholder.com` bằng fallback local.

### Kinh nghiệm
- Không phụ thuộc placeholder online cho app thật.
- Ảnh fallback nên nằm trong codebase hoặc asset local.
- Nếu ảnh chính hỏng, UI vẫn phải giữ layout ổn định.

---

## 4) Auth/token bị mất sau khi reload

### Triệu chứng
- Refresh trang là bị văng login.
- Token / user biến mất.
- Một số màn hình protected bị 401 lại dù đã đăng nhập.

### Nguyên nhân gốc
- Auth state chưa được persist đúng cách.
- FE chưa lưu refresh token đầy đủ.
- Khi load lại trang, state không được rehydrate từ `localStorage`.

### File liên quan
- `frontend/src/utils/auth.ts`
- `frontend/src/hooks/useAuth.ts`
- `frontend/src/api/axiosClient.ts`
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/components/layout/Header.tsx`

### Cách fix
- Lưu token + refresh token + user vào `localStorage`.
- Thêm cơ chế refresh token khi gặp 401.
- Sync auth state bằng event / storage listener.
- Không bắt reload toàn trang sau login/logout.

### Kinh nghiệm
- Auth FE phải có 3 lớp:
  1. access token
  2. refresh token
  3. user state rehydrate
- Nếu chỉ giữ state trong memory, refresh trang sẽ mất.

---

## 5) `401 Unauthorized` ở inventory/cart/admin

### Triệu chứng
- `GET /api/inventory/internal/variant/{id}` trả 401.
- `POST /api/cart/items` trả 401.
- Nhiều endpoint admin báo 401/CORS.

### Nguyên nhân gốc
- Thiếu token hoặc token không được attach đầy đủ.
- Một số endpoint là protected thật, không phải lỗi FE giả.
- Gateway / downstream service yêu cầu header auth:
  - `X-User-Id`
  - `X-Username`
  - `X-Role`

### File liên quan
- `frontend/src/api/axiosClient.ts`
- `frontend/src/api/cartApi.ts`
- `frontend/src/api/inventoryApi.ts`
- `frontend/src/pages/ProductDetailPage.tsx`
- `backend/gateway/gateway/src/main/java/uth/nhathuy/gateway/filter/JwtAuthenticationFilter.java`
- `backend/Cart/src/main/java/uth/nhathuy/Cart/security/GatewayHeaderAuthFilter.java`
- `backend/Order/src/main/java/uth/nhathuy/Order/security/GatewayHeaderAuthFilter.java`
- `backend/Inventory/src/main/java/uth/nhathuy/Inventory/security/GatewayHeaderAuthFilter.java`

### Cách fix
- Axios client luôn gắn `Authorization: Bearer <token>`.
- Khi 401, thử refresh token trước khi logout.
- FE chỉ gọi endpoint đúng scope:
  - public route cho public data
  - protected route cho cart/order/admin

### Kinh nghiệm
- Không nên gọi endpoint protected bằng request “trần”.
- Nếu BE cần header gateway, phải kiểm tra luồng qua proxy/gateway trước khi đổ lỗi cho FE.
- 401 không phải lúc nào cũng là “FE sai”; có thể là quyền truy cập đúng nhưng chưa có auth state.

---

## 6) CORS / preflight không có `Access-Control-Allow-Origin`

### Triệu chứng
- Console báo CORS error.
- Preflight `OPTIONS` fail.
- Browser hiển thị network error dù backend thật ra trả 401/403.

### Nguyên nhân gốc
- Request đi vào backend/gateway nhưng response không trả CORS header phù hợp.
- Hoặc lỗi auth xảy ra trước khi CORS được xử lý đúng.

### File liên quan
- `frontend/vite.config.ts`
- `backend/*/config/CorsConfig.java`
- `backend/gateway/...`

### Cách fix
- Dùng proxy Vite cho `/api` trong dev.
- Đồng bộ CORS giữa gateway và service downstream.
- Đảm bảo origin `http://localhost:5173` được phép.

### Kinh nghiệm
- Browser có thể báo CORS, nhưng gốc thật đôi khi là 401/403.
- Luôn kiểm tra tab Network để xem response code thật.

---

## 7) Nguyên tắc mapping BE → FE để tránh lỗi lặp lại

### Quy tắc nên nhớ
1. **Đọc DTO trước khi map FE**
   - `record` / response class là nguồn chân lý.

2. **Ưu tiên flat fields nếu BE đã trả sẵn**
   - Ví dụ: `productName`, `thumbnail`, `variantName`, `lineTotal`.

3. **FE phải có fallback an toàn**
   - Text fallback
   - Image fallback
   - Number fallback

4. **Không hard-code placeholder ngoài mạng**
   - Dùng asset local hoặc data URI.

5. **Auth phải persist qua reload**
   - access token + refresh token + user.

6. **Mọi payload gửi lên BE phải khớp tên field 100%**
   - Đặc biệt với `@Valid` / `@NotBlank`.

7. **Khi gặp 400, kiểm tra DTO trước khi debug UI**
   - 400 thường là sai body, không phải sai giao diện.

8. **Khi gặp 401, kiểm tra token + gateway header**
   - Không chỉ nhìn FE; hãy xem backend cần gì.

---

## 8) Danh sách file đã sửa nhiều nhất trong các lỗi này

- `frontend/src/api/axiosClient.ts`
- `frontend/src/api/cartApi.ts`
- `frontend/src/api/orderApi.ts`
- `frontend/src/pages/CheckoutPage.tsx`
- `frontend/src/pages/CartPage.tsx`
- `frontend/src/pages/OrderDetailPage.tsx`
- `frontend/src/pages/ProductDetailPage.tsx`
- `frontend/src/components/product/ProductCard.tsx`
- `frontend/src/utils/auth.ts`
- `frontend/src/utils/image.ts`
- `frontend/src/types/cart.ts`
- `frontend/src/types/order.ts`

---

## 9) Kết luận

Các lỗi kiểu **BE map lên FE** thường không nằm ở một chỗ duy nhất. Đa số đến từ:
- lệch tên field giữa DTO và payload FE
- response shape thay đổi nhưng FE chưa map lại
- thiếu fallback UI
- auth/gateway chưa đồng bộ

Khi gặp bug mới, hãy kiểm tra theo thứ tự:
1. DTO backend
2. payload FE
3. response mapper
4. auth/gateway
5. fallback UI


