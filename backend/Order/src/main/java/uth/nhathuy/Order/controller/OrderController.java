package uth.nhathuy.Order.controller;

import jakarta.validation.Valid;
import uth.nhathuy.Order.dto.CheckoutRequest;
import uth.nhathuy.Order.dto.CheckoutResponse;
import uth.nhathuy.Order.dto.OrderResponse;
import uth.nhathuy.Order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> checkout(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-Username") String username,
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody CheckoutRequest request
    ) {
        String token = authorizationHeader.replace("Bearer ", "");
        return ResponseEntity.ok(orderService.checkout(userId, username, request, token));
    }

    @GetMapping("/my")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            @RequestHeader("X-User-Id") Long userId
    ) {
        return ResponseEntity.ok(orderService.getMyOrders(userId));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getMyOrderDetail(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long orderId
    ) {
        return ResponseEntity.ok(orderService.getMyOrderDetail(userId, orderId));
    }

    @DeleteMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelMyOrder(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long orderId
    ) {
        return ResponseEntity.ok(orderService.cancelMyOrder(userId, orderId));
    }
}