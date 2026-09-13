package uth.nhathuy.Shipping.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uth.nhathuy.Shipping.dto.CreateShipmentRequest;
import uth.nhathuy.Shipping.dto.UpdateShipmentStatusRequest;
import uth.nhathuy.Shipping.entity.Shipment;
import uth.nhathuy.Shipping.entity.ShipmentStatus;
import uth.nhathuy.Shipping.entity.ShipmentTrackingEvent;
import uth.nhathuy.Shipping.repository.ShipmentRepository;
import uth.nhathuy.Shipping.repository.ShipmentTrackingEventRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShipmentServiceTest {

    @Mock
    private ShipmentRepository shipmentRepository;

    @Mock
    private ShipmentTrackingEventRepository shipmentTrackingEventRepository;

    @InjectMocks
    private ShipmentService shipmentService;

    @Test
    void createShipment_shouldPersistAndReturnTimeline() {
        when(shipmentRepository.existsByOrderId(100L)).thenReturn(false);
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(invocation -> {
            Shipment shipment = invocation.getArgument(0);
            shipment.setId(1L);
            return shipment;
        });
        when(shipmentTrackingEventRepository.findByShipmentIdOrderByCreatedAtAsc(1L)).thenReturn(List.of(
                ShipmentTrackingEvent.builder()
                        .id(11L)
                        .fromStatus(ShipmentStatus.READY_TO_SHIP)
                        .toStatus(ShipmentStatus.READY_TO_SHIP)
                        .note("Shipment created")
                        .changedBy("admin")
                        .createdAt(LocalDateTime.now())
                        .build()
        ));

        var response = shipmentService.createShipment(
                new CreateShipmentRequest(
                        100L,
                        200L,
                        "ORD-100",
                        "Nguyen Van A",
                        "0909000111",
                        "123 Nguyen Trai, Q1",
                        "Giao giờ hành chính",
                        "GHN",
                        "TRK001",
                        "STANDARD",
                        BigDecimal.valueOf(30000),
                        LocalDateTime.now().plusDays(3),
                        ShipmentStatus.READY_TO_SHIP
                ),
                "admin"
        );

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.orderId()).isEqualTo(100L);
        assertThat(response.status()).isEqualTo(ShipmentStatus.READY_TO_SHIP);
        assertThat(response.events()).hasSize(1);

        verify(shipmentRepository).save(any(Shipment.class));
    }

    @Test
    void updateStatus_shouldChangeStatusAndAppendEvent() {
        Shipment shipment = Shipment.builder()
                .id(1L)
                .orderId(100L)
                .userId(200L)
                .orderCode("ORD-100")
                .receiverName("Nguyen Van A")
                .receiverPhone("0909000111")
                .shippingAddress("123 Nguyen Trai, Q1")
                .status(ShipmentStatus.READY_TO_SHIP)
                .createdAt(LocalDateTime.now().minusDays(1))
                .updatedAt(LocalDateTime.now().minusDays(1))
                .build();

        when(shipmentRepository.findById(1L)).thenReturn(java.util.Optional.of(shipment));
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(shipmentTrackingEventRepository.findByShipmentIdOrderByCreatedAtAsc(1L)).thenReturn(List.of(
                ShipmentTrackingEvent.builder()
                        .id(12L)
                        .fromStatus(ShipmentStatus.READY_TO_SHIP)
                        .toStatus(ShipmentStatus.IN_TRANSIT)
                        .note("Đang vận chuyển")
                        .changedBy("staff")
                        .createdAt(LocalDateTime.now())
                        .build()
        ));

        var response = shipmentService.updateStatus(
                1L,
                new UpdateShipmentStatusRequest(ShipmentStatus.IN_TRANSIT, "Đã lấy hàng"),
                "staff"
        );

        assertThat(response.status()).isEqualTo(ShipmentStatus.IN_TRANSIT);
        assertThat(response.statusNote()).isEqualTo("Đã lấy hàng");
        assertThat(response.shippedAt()).isNotNull();
        assertThat(response.events()).hasSize(1);
    }
}


