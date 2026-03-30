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
        return ResponseEntity.ok(orderService.updateStatus(orderId, request));
    }
}