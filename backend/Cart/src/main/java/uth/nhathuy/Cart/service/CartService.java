package uth.nhathuy.Cart.service;

import uth.nhathuy.Cart.dto.*;
import uth.nhathuy.Cart.entity.Cart;
import uth.nhathuy.Cart.entity.CartItem;
import uth.nhathuy.Cart.exception.ResourceNotFoundException;
import uth.nhathuy.Cart.repository.CartItemRepository;
import uth.nhathuy.Cart.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    @Transactional
    public CartResponse getMyCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse addItem(Long userId, AddCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);

        CartItem existing = cart.getItems().stream()
                .filter(item ->
                        item.getProductId().equals(request.productId()) &&
                                equalsNullable(item.getVariantId(), request.variantId()))
                .findFirst()
                .orElse(null);

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + request.quantity());
            existing.setUpdatedAt(LocalDateTime.now());
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .productId(request.productId())
                    .variantId(request.variantId())
                    .productName(request.productName())
                    .variantName(request.variantName())
                    .thumbnail(request.thumbnail())
                    .price(request.price())
                    .quantity(request.quantity())
                    .build();

            cart.getItems().add(item);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse updateItem(Long userId, Long itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cart item"));

        item.setQuantity(request.quantity());
        item.setUpdatedAt(LocalDateTime.now());

        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(Long userId, Long itemId) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cart item"));

        cart.getItems().remove(item);
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return mapToCartResponse(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(
                        Cart.builder()
                                .userId(userId)
                                .build()
                ));
    }

    private CartResponse mapToCartResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(item -> {
                    BigDecimal lineTotal = item.getPrice()
                            .multiply(BigDecimal.valueOf(item.getQuantity()));

                    return CartItemResponse.builder()
                            .id(item.getId())
                            .productId(item.getProductId())
                            .variantId(item.getVariantId())
                            .productName(item.getProductName())
                            .variantName(item.getVariantName())
                            .thumbnail(item.getThumbnail())
                            .price(item.getPrice())
                            .quantity(item.getQuantity())
                            .lineTotal(lineTotal)
                            .build();
                })
                .toList();

        int totalItems = items.stream()
                .mapToInt(CartItemResponse::quantity)
                .sum();

        BigDecimal totalAmount = items.stream()
                .map(CartItemResponse::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .cartId(cart.getId())
                .userId(cart.getUserId())
                .totalItems(totalItems)
                .totalAmount(totalAmount)
                .items(items)
                .build();
    }

    private boolean equalsNullable(Long a, Long b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.equals(b);
    }
}