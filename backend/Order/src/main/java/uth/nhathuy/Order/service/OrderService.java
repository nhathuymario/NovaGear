package uth.nhathuy.Order.service;

import uth.nhathuy.Order.dto.*;
import uth.nhathuy.Order.entity.Order;
import uth.nhathuy.Order.entity.OrderItem;
import uth.nhathuy.Order.entity.OrderStatus;
import uth.nhathuy.Order.exception.ResourceNotFoundException;
import uth.nhathuy.Order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;

    @Value("${services.cart.url}")
    private String cartServiceUrl;

    @Value("${services.inventory.url}")
    private String inventoryServiceUrl;

    @Transactional
    public CheckoutResponse checkout(Long userId, String username, CheckoutRequest request, String token) {
        CartResponseDto cart = getCartFromCartService(userId, username, token);

        if (cart == null || cart.items() == null || cart.items().isEmpty()) {
            throw new IllegalArgumentException("Giỏ hàng đang trống");
        }

        for (CartItemDto item : cart.items()) {
            exportInventory(item);
        }

        Order order = Order.builder()
                .userId(userId)
                .username(username)
                .customerName(request.customerName())
                .phone(request.phone())
                .address(request.address())
                .note(request.note())
                .status(OrderStatus.PENDING)
                .totalAmount(cart.totalAmount())
                .build();

        List<OrderItem> orderItems = cart.items().stream()
                .map(item -> OrderItem.builder()
                        .order(order)
                        .productId(item.productId())
                        .variantId(item.variantId())
                        .productName(item.productName())
                        .variantName(item.variantName())
                        .thumbnail(item.thumbnail())
                        .price(item.price())
                        .quantity(item.quantity())
                        .lineTotal(item.lineTotal())
                        .build())
                .toList();

        order.setItems(orderItems);
        order.setUpdatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        clearCart(userId, username, token);

        return CheckoutResponse.builder()
                .orderId(savedOrder.getId())
                .message("Đặt hàng thành công")
                .build();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getMyOrderDetail(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));

        if (!order.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Không tìm thấy đơn hàng");
        }

        return mapToOrderResponse(order);
    }

    @Transactional
    public OrderResponse cancelMyOrder(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));

        if (!order.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Không tìm thấy đơn hàng");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            return mapToOrderResponse(order);
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Chỉ được hủy đơn ở trạng thái chờ xác nhận hoặc đã xác nhận");
        }

        if ("PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new IllegalStateException("Đơn đã thanh toán, không thể tự hủy");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setPaymentStatus("CANCELLED");
        order.setUpdatedAt(LocalDateTime.now());

        return mapToOrderResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));

        order.setStatus(request.status());
        order.setUpdatedAt(LocalDateTime.now());

        return mapToOrderResponse(orderRepository.save(order));
    }

    private CartResponseDto getCartFromCartService(Long userId, String username, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.set("X-User-Id", String.valueOf(userId));
        headers.set("X-Username", username);
        headers.set("X-Role", "ROLE_USER");

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<CartResponseDto> response = restTemplate.exchange(
                cartServiceUrl + "/api/cart",
                HttpMethod.GET,
                entity,
                CartResponseDto.class
        );

        return response.getBody();
    }

    private void clearCart(Long userId, String username, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.set("X-User-Id", String.valueOf(userId));
        headers.set("X-Username", username);
        headers.set("X-Role", "ROLE_USER");

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        restTemplate.exchange(
                cartServiceUrl + "/api/cart/clear",
                HttpMethod.DELETE,
                entity,
                Void.class
        );
    }

    private void exportInventory(CartItemDto item) {
        InventoryExportRequest request = new InventoryExportRequest(
                item.variantId(),
                item.quantity(),
                "Xuất kho cho đơn hàng"
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<InventoryExportRequest> entity = new HttpEntity<>(request, headers);

        restTemplate.exchange(
                inventoryServiceUrl + "/api/inventory/internal/reserve",
                HttpMethod.POST,
                entity,
                Void.class
        );

        restTemplate.exchange(
                inventoryServiceUrl + "/api/inventory/internal/deduct",
                HttpMethod.POST,
                entity,
                Void.class
        );
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .variantId(item.getVariantId())
                        .productName(item.getProductName())
                        .variantName(item.getVariantName())
                        .thumbnail(item.getThumbnail())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .lineTotal(item.getLineTotal())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .username(order.getUsername())
                .customerName(order.getCustomerName())
                .phone(order.getPhone())
                .address(order.getAddress())
                .note(order.getNote())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .items(items)
                .build();
    }
}