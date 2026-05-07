package uth.nhathuy.Shipping.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uth.nhathuy.Shipping.entity.ShipmentTrackingEvent;

import java.util.List;

public interface ShipmentTrackingEventRepository extends JpaRepository<ShipmentTrackingEvent, Long> {
    List<ShipmentTrackingEvent> findByShipmentIdOrderByCreatedAtAsc(Long shipmentId);
}

