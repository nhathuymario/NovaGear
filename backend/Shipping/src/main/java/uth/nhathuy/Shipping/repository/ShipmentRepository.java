package uth.nhathuy.Shipping.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uth.nhathuy.Shipping.entity.Shipment;

import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Optional<Shipment> findByOrderId(Long orderId);

    List<Shipment> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByOrderId(Long orderId);
}

