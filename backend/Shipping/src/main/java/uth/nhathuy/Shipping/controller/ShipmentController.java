package uth.nhathuy.Shipping.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uth.nhathuy.Shipping.dto.ShipmentResponse;
import uth.nhathuy.Shipping.service.ShipmentService;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    @GetMapping("/my")
    public ResponseEntity<List<ShipmentResponse>> getMyShipments(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(shipmentService.getMyShipments(userId));
    }

    @GetMapping("/{shipmentId}")
    public ResponseEntity<ShipmentResponse> getMyShipment(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long shipmentId
    ) {
        return ResponseEntity.ok(shipmentService.getMyShipment(userId, shipmentId));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ShipmentResponse> getMyShipmentByOrderId(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long orderId
    ) {
        return ResponseEntity.ok(shipmentService.getMyShipmentByOrderId(userId, orderId));
    }
}

