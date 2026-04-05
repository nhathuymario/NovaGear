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
        Cart userCart = cartRepository.findByUserId(3L)
                .orElseGet(() -> cartRepository.save(Cart.builder().userId(3L).build()));

        upsertCartItem(
                userCart,
                1L,
                1L,
                "MacBook Air M3 13 inch",
                "Midnight / 8GB / 256GB",
                "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=600",
                "25990000",
                1
        );
        upsertCartItem(
                userCart,
                5L,
                9L,
                "Keychron K2 Wireless",
                "Brown Switch",
                "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600",
                "1990000",
                1
        );
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


