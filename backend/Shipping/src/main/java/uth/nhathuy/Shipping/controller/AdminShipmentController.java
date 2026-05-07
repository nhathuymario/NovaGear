package uth.nhathuy.Shipping.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uth.nhathuy.Shipping.dto.AssignCarrierRequest;
import uth.nhathuy.Shipping.dto.CreateShipmentRequest;
import uth.nhathuy.Shipping.dto.ShipmentResponse;
import uth.nhathuy.Shipping.dto.UpdateShipmentStatusRequest;
import uth.nhathuy.Shipping.service.ShipmentService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/shipments")
@RequiredArgsConstructor
public class AdminShipmentController {

    private final ShipmentService shipmentService;

    @GetMapping
    public ResponseEntity<List<ShipmentResponse>> getAll() {
        return ResponseEntity.ok(shipmentService.getAllShipments());
    }

    @GetMapping("/{shipmentId}")
    public ResponseEntity<ShipmentResponse> detail(@PathVariable Long shipmentId) {
        return ResponseEntity.ok(shipmentService.getShipment(shipmentId));
    }

    @PostMapping
    public ResponseEntity<ShipmentResponse> create(
            @Valid @RequestBody CreateShipmentRequest request,
            Authentication authentication
    ) {
        ShipmentResponse response = shipmentService.createShipment(request, currentUsername(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{shipmentId}/carrier")
    public ResponseEntity<ShipmentResponse> assignCarrier(
            @PathVariable Long shipmentId,
            @Valid @RequestBody AssignCarrierRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(shipmentService.assignCarrier(shipmentId, request, currentUsername(authentication)));
    }

    @PutMapping("/{shipmentId}/status")
    public ResponseEntity<ShipmentResponse> updateStatus(
            @PathVariable Long shipmentId,
            @Valid @RequestBody UpdateShipmentStatusRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(shipmentService.updateStatus(shipmentId, request, currentUsername(authentication)));
    }

    private String currentUsername(Authentication authentication) {
        return authentication != null ? authentication.getName() : "system";
    }
}

