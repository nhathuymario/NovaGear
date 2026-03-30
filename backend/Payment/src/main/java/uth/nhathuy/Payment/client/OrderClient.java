package uth.nhathuy.Payment.client;

import uth.nhathuy.Payment.dto.OrderResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "order-service", url = "${services.order-service.url}")
public interface OrderClient {

    @GetMapping("/api/internal/orders/{orderId}")
    OrderResponse getOrderById(@PathVariable Long orderId);

    @PutMapping("/api/internal/orders/{orderId}/payment-status")
    void updatePaymentStatus(@PathVariable Long orderId, @RequestParam String status);
}