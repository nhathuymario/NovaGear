package uth.nhathuy.Shipping.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shipments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long orderId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 100)
    private String orderCode;

    @Column(nullable = false, length = 200)
    private String receiverName;

    @Column(nullable = false, length = 30)
    private String receiverPhone;

    @Column(nullable = false, length = 500)
    private String shippingAddress;

    @Column(length = 1000)
    private String note;

    @Column(length = 100)
    private String carrierName;

    @Column(length = 100)
    private String trackingNumber;

    @Column(length = 100)
    private String shippingMethod;

    @Column(precision = 15, scale = 2)
    private BigDecimal shippingFee;

    private LocalDateTime estimatedDeliveryAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ShipmentStatus status = ShipmentStatus.READY_TO_SHIP;

    @Column(length = 1000)
    private String statusNote;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    private LocalDateTime shippedAt;

    private LocalDateTime deliveredAt;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<ShipmentTrackingEvent> events = new ArrayList<>();

    public void addEvent(ShipmentTrackingEvent event) {
        event.setShipment(this);
        this.events.add(event);
    }
}

