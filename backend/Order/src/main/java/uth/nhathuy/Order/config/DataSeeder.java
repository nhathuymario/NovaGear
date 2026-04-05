package uth.nhathuy.Order.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import uth.nhathuy.Order.entity.Order;
import uth.nhathuy.Order.entity.OrderItem;
import uth.nhathuy.Order.entity.OrderStatus;
import uth.nhathuy.Order.repository.OrderRepository;

import java.math.BigDecimal;
import java.util.List;

@Component
@Profile("seed")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final OrderRepository orderRepository;

    @Override
    public void run(String... args) {
        if (orderRepository.count() > 0) {
            return;
        }

        seedOrder(
                3L,
                "user",
                "Normal User",
                "0900000003",
                "456 Le Loi, Phuong Ben Thanh, Quan 1, TP HCM",
                "Giao gio hanh chinh",
                OrderStatus.COMPLETED,
                "SUCCESS",
                List.of(
                        new ItemSeed(1L, 1L, "MacBook Air M3 13 inch", "Midnight / 8GB / 256GB", "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=600", "25990000", 1),
                        new ItemSeed(5L, 9L, "Keychron K2 Wireless", "Brown Switch", "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600", "1990000", 1)
                )
        );

        seedOrder(
                3L,
                "user",
                "Normal User",
                "0900000003",
                "456 Le Loi, Phuong Ben Thanh, Quan 1, TP HCM",
                "Goi truoc khi giao",
                OrderStatus.SHIPPING,
                "PENDING",
                List.of(
                        new ItemSeed(3L, 5L, "iPhone 15 Pro Max", "Titan Tu Nhien / 256GB", "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600", "31990000", 1)
                )
        );
    }

    private void seedOrder(
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
        Order order = Order.builder()
                .userId(userId)
                .username(username)
                .customerName(customerName)
                .phone(phone)
                .address(address)
                .note(note)
                .status(status)
                .paymentStatus(paymentStatus)
                .build();

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


