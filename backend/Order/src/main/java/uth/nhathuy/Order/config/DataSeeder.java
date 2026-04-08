package uth.nhathuy.Order.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import uth.nhathuy.Order.entity.Order;
import uth.nhathuy.Order.entity.OrderItem;
import uth.nhathuy.Order.entity.OrderStatus;
import uth.nhathuy.Order.repository.OrderRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
@Profile("seed")
@Slf4j
@RequiredArgsConstructor
@Transactional
public class DataSeeder implements CommandLineRunner {

    private final OrderRepository orderRepository;

    @Override
    public void run(String... args) {
        try {
            log.info("Starting data seeding for Order service...");
            seedOrder(
                    "SEED-ORDER-001",
                3L,
                "user",
                "Normal User",
                "0900000003",
                "456 Le Loi, Phuong Ben Thanh, Quan 1, TP HCM",
                "Giao gio hanh chinh",
                OrderStatus.COMPLETED,
                "SUCCESS",
                List.of(
                        new ItemSeed(1L, 1L, "MacBook Air M3 13 inch", "Midnight / 8GB / 256GB", "/product-placeholder.svg", "25990000", 1),
                        new ItemSeed(5L, 9L, "Keychron K2 Wireless", "Brown Switch", "/product-placeholder.svg", "1990000", 1)
                )
        );

        seedOrder(
                "SEED-ORDER-002",
                3L,
                "user",
                "Normal User",
                "0900000003",
                "456 Le Loi, Phuong Ben Thanh, Quan 1, TP HCM",
                "Goi truoc khi giao",
                OrderStatus.SHIPPING,
                "PENDING",
                List.of(
                        new ItemSeed(3L, 5L, "iPhone 15 Pro Max", "Titan Tu Nhien / 256GB", "/product-placeholder.svg", "31990000", 1)
                )
        );
            log.info("Data seeding completed successfully for Order service!");
        } catch (Exception e) {
            log.error("Error during data seeding for Order service: ", e);
        }
    }

    private void seedOrder(
            String seedCode,
            Long userId,
            String username,
            String customerName,
            String phone,
            String address,
            String note,
            OrderStatus status,
            String paymentStatus,
            List<ItemSeed> itemSeeds
    ) {
        String finalNote = "[" + seedCode + "] " + note;

        Order order = orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(existing -> existing.getNote() != null)
                .filter(existing -> existing.getNote().contains(seedCode))
                .findFirst()
                .orElseGet(Order::new);

        order.setUserId(userId);
        order.setUsername(username);
        order.setCustomerName(customerName);
        order.setPhone(phone);
        order.setAddress(address);
        order.setNote(finalNote);
        order.setStatus(status);
        order.setPaymentStatus(paymentStatus);

        if (order.getItems() == null) {
            order.setItems(new ArrayList<>());
        }
        order.getItems().clear();

        BigDecimal total = BigDecimal.ZERO;
        for (ItemSeed seed : itemSeeds) {
            BigDecimal price = new BigDecimal(seed.price());
            BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(seed.quantity()));
            total = total.add(lineTotal);

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .productId(seed.productId())
                    .variantId(seed.variantId())
                    .productName(seed.productName())
                    .variantName(seed.variantName())
                    .thumbnail(seed.thumbnail())
                    .price(price)
                    .quantity(seed.quantity())
                    .lineTotal(lineTotal)
                    .build();

            order.getItems().add(item);
        }

        order.setTotalAmount(total);
        orderRepository.save(order);
    }

    private record ItemSeed(
            Long productId,
            Long variantId,
            String productName,
            String variantName,
            String thumbnail,
            String price,
            int quantity
    ) {
    }
}


