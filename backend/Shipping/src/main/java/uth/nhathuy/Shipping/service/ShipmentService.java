package uth.nhathuy.Shipping.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import uth.nhathuy.Shipping.dto.AssignCarrierRequest;
import uth.nhathuy.Shipping.dto.CreateShipmentRequest;
import uth.nhathuy.Shipping.dto.ShipmentResponse;
import uth.nhathuy.Shipping.dto.UpdateShipmentStatusRequest;
import uth.nhathuy.Shipping.entity.Shipment;
import uth.nhathuy.Shipping.entity.ShipmentStatus;
import uth.nhathuy.Shipping.entity.ShipmentTrackingEvent;
import uth.nhathuy.Shipping.repository.ShipmentRepository;
import uth.nhathuy.Shipping.repository.ShipmentTrackingEventRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentTrackingEventRepository shipmentTrackingEventRepository;

    @Transactional
    public ShipmentResponse createShipment(CreateShipmentRequest request, String changedBy) {
        if (shipmentRepository.existsByOrderId(request.orderId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Shipment already exists for this order");
        }

        LocalDateTime now = LocalDateTime.now();
        ShipmentStatus initialStatus = request.status() != null ? request.status() : ShipmentStatus.READY_TO_SHIP;

        Shipment shipment = Shipment.builder()
                .orderId(request.orderId())
                .userId(request.userId())
                .orderCode(request.orderCode())
                .receiverName(request.receiverName())
                .receiverPhone(request.receiverPhone())
                .shippingAddress(request.shippingAddress())
                .note(request.note())
                .carrierName(request.carrierName())
                .trackingNumber(request.trackingNumber())
                .shippingMethod(request.shippingMethod())
                .shippingFee(defaultFee(request.shippingFee()))
                .estimatedDeliveryAt(request.estimatedDeliveryAt())
                .status(initialStatus)
                .statusNote("Shipment created")
                .build();

        if (initialStatus != ShipmentStatus.READY_TO_SHIP) {
            shipment.setShippedAt(now);
        }
        if (initialStatus == ShipmentStatus.DELIVERED) {
            shipment.setDeliveredAt(now);
        }

        shipment.addEvent(ShipmentTrackingEvent.builder()
                .fromStatus(shipment.getStatus())
                .toStatus(shipment.getStatus())
                .note("Shipment created")
                .changedBy(normalizeChangedBy(changedBy))
                .build());

        return mapToResponse(shipmentRepository.save(shipment));
    }

    @Transactional(readOnly = true)
    public List<ShipmentResponse> getAllShipments() {
        return shipmentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ShipmentResponse> getMyShipments(Long userId) {
        return shipmentRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ShipmentResponse getShipment(Long shipmentId) {
        return mapToResponse(findShipmentOrThrow(shipmentId));
    }

    @Transactional(readOnly = true)
    public ShipmentResponse getMyShipment(Long userId, Long shipmentId) {
        Shipment shipment = findShipmentOrThrow(shipmentId);
        ensureOwner(shipment, userId);
        return mapToResponse(shipment);
    }

    @Transactional(readOnly = true)
    public ShipmentResponse getShipmentByOrderId(Long orderId) {
        return mapToResponse(findByOrderIdOrThrow(orderId));
    }

    @Transactional(readOnly = true)
    public ShipmentResponse getMyShipmentByOrderId(Long userId, Long orderId) {
        Shipment shipment = findByOrderIdOrThrow(orderId);
        ensureOwner(shipment, userId);
        return mapToResponse(shipment);
    }

    @Transactional
    public ShipmentResponse assignCarrier(Long shipmentId, AssignCarrierRequest request, String changedBy) {
        Shipment shipment = findShipmentOrThrow(shipmentId);
        shipment.setCarrierName(request.carrierName());
        shipment.setTrackingNumber(request.trackingNumber());
        shipment.setShippingMethod(request.shippingMethod());
        shipment.setShippingFee(defaultFee(request.shippingFee()));
        shipment.setEstimatedDeliveryAt(request.estimatedDeliveryAt());
        shipment.setStatusNote(request.note());
        shipment.setUpdatedAt(LocalDateTime.now());

        shipment.addEvent(ShipmentTrackingEvent.builder()
                .fromStatus(shipment.getStatus())
                .toStatus(shipment.getStatus())
                .note(request.note() != null && !request.note().isBlank() ? request.note() : "Carrier assigned")
                .changedBy(normalizeChangedBy(changedBy))
                .build());

        return mapToResponse(shipmentRepository.save(shipment));
    }

    @Transactional
    public ShipmentResponse updateStatus(Long shipmentId, UpdateShipmentStatusRequest request, String changedBy) {
        Shipment shipment = findShipmentOrThrow(shipmentId);
        ShipmentStatus previousStatus = shipment.getStatus();
        ShipmentStatus nextStatus = request.status();

        if (previousStatus == nextStatus) {
            shipment.setStatusNote(request.note());
            shipment.setUpdatedAt(LocalDateTime.now());
            return mapToResponse(shipmentRepository.save(shipment));
        }

        shipment.setStatus(nextStatus);
        shipment.setStatusNote(request.note());
        shipment.setUpdatedAt(LocalDateTime.now());

        if (nextStatus != ShipmentStatus.READY_TO_SHIP && shipment.getShippedAt() == null) {
            shipment.setShippedAt(LocalDateTime.now());
        }
        if (nextStatus == ShipmentStatus.DELIVERED) {
            shipment.setDeliveredAt(LocalDateTime.now());
        }

        shipment.addEvent(ShipmentTrackingEvent.builder()
                .fromStatus(previousStatus)
                .toStatus(nextStatus)
                .note(request.note())
                .changedBy(normalizeChangedBy(changedBy))
                .build());

        return mapToResponse(shipmentRepository.save(shipment));
    }

    private Shipment findShipmentOrThrow(Long shipmentId) {
        return shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found"));
    }

    private Shipment findByOrderIdOrThrow(Long orderId) {
        return shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found for order"));
    }

    private void ensureOwner(Shipment shipment, Long userId) {
        if (!shipment.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found");
        }
    }

    private ShipmentResponse mapToResponse(Shipment shipment) {
        List<ShipmentResponse.ShipmentTrackingEventResponse> events = shipmentTrackingEventRepository
                .findByShipmentIdOrderByCreatedAtAsc(shipment.getId())
                .stream()
                .map(event -> new ShipmentResponse.ShipmentTrackingEventResponse(
                        event.getId(),
                        event.getFromStatus(),
                        event.getToStatus(),
                        event.getNote(),
                        event.getChangedBy(),
                        event.getCreatedAt()
                ))
                .toList();

        return new ShipmentResponse(
                shipment.getId(),
                shipment.getOrderId(),
                shipment.getUserId(),
                shipment.getOrderCode(),
                shipment.getReceiverName(),
                shipment.getReceiverPhone(),
                shipment.getShippingAddress(),
                shipment.getNote(),
                shipment.getCarrierName(),
                shipment.getTrackingNumber(),
                shipment.getShippingMethod(),
                shipment.getShippingFee(),
                shipment.getEstimatedDeliveryAt(),
                shipment.getStatus(),
                shipment.getStatusNote(),
                shipment.getCreatedAt(),
                shipment.getUpdatedAt(),
                shipment.getShippedAt(),
                shipment.getDeliveredAt(),
                events
        );
    }

    private BigDecimal defaultFee(BigDecimal fee) {
        return fee != null ? fee : BigDecimal.ZERO;
    }

    private String normalizeChangedBy(String changedBy) {
        return changedBy == null || changedBy.isBlank() ? "system" : changedBy.trim();
    }
}


