package uth.nhathuy.Cart.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import uth.nhathuy.Cart.entity.Cart;
import uth.nhathuy.Cart.entity.CartItem;
import uth.nhathuy.Cart.repository.CartItemRepository;
import uth.nhathuy.Cart.repository.CartRepository;

import java.math.BigDecimal;
import java.util.List;

@Component
@Profile("seed")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    @Override
    public void run(String... args) {
        if (cartRepository.count() > 0) {
            return;
        }

        Cart userCart = cartRepository.save(Cart.builder().userId(3L).build());

        List<CartItem> items = List.of(
                CartItem.builder()
                        .cart(userCart)
                        .productId(1L)
                        .variantId(1L)
                        .productName("MacBook Air M3 13 inch")
                        .variantName("Midnight / 8GB / 256GB")
                        .thumbnail("https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=600")
                        .price(new BigDecimal("25990000"))
                        .quantity(1)
                        .build(),
                CartItem.builder()
                        .cart(userCart)
                        .productId(5L)
                        .variantId(9L)
                        .productName("Keychron K2 Wireless")
                        .variantName("Brown Switch")
                        .thumbnail("https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600")
                        .price(new BigDecimal("1990000"))
                        .quantity(1)
                        .build()
        );

        cartItemRepository.saveAll(items);
    }
}


