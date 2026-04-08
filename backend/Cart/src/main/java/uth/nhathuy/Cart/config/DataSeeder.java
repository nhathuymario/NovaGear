package uth.nhathuy.Cart.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import uth.nhathuy.Cart.entity.Cart;
import uth.nhathuy.Cart.entity.CartItem;
import uth.nhathuy.Cart.repository.CartItemRepository;
import uth.nhathuy.Cart.repository.CartRepository;

import java.math.BigDecimal;
import java.util.List;

@Component
@Profile("seed")
@Slf4j
@RequiredArgsConstructor
@Transactional
public class DataSeeder implements CommandLineRunner {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    @Override
    public void run(String... args) {
        try {
            log.info("Starting data seeding for Cart service...");
            Cart userCart = cartRepository.findByUserId(3L)
                .orElseGet(() -> cartRepository.save(Cart.builder().userId(3L).build()));

        upsertCartItem(
                userCart,
                1L,
                1L,
                "MacBook Air M3 13 inch",
                "Midnight / 8GB / 256GB",
                "/product-placeholder.svg",
                "25990000",
                1
        );
        upsertCartItem(
                userCart,
                5L,
                9L,
                "Keychron K2 Wireless",
                "Brown Switch",
                "/product-placeholder.svg",
                "1990000",
                1
        );
            log.info("Data seeding completed successfully for Cart service!");
        } catch (Exception e) {
            log.error("Error during data seeding for Cart service: ", e);
        }
    }

    private void upsertCartItem(
            Cart cart,
            Long productId,
            Long variantId,
            String productName,
            String variantName,
            String thumbnail,
            String price,
            int quantity
    ) {
        CartItem cartItem = cartItemRepository.findByCartIdAndProductIdAndVariantId(cart.getId(), productId, variantId)
                .orElseGet(() -> CartItem.builder()
                        .cart(cart)
                        .productId(productId)
                        .variantId(variantId)
                        .build());

        cartItem.setProductName(productName);
        cartItem.setVariantName(variantName);
        cartItem.setThumbnail(thumbnail);
        cartItem.setPrice(new BigDecimal(price));
        cartItem.setQuantity(quantity);

        cartItemRepository.save(cartItem);
    }
}


