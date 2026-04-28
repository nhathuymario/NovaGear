package uth.nhathuy.Order.controller;

import jakarta.validation.Valid;
import uth.nhathuy.Order.dto.OrderResponse;
import uth.nhathuy.Order.dto.UpdateOrderStatusRequest;
import uth.nhathuy.Order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        // Admin update: we can set userId to null or use a placeholder like -1L for admin
        // Or better: extract userId from order itself
        return ResponseEntity.ok(orderService.updateStatus(orderId, 0L, request));
    }
}