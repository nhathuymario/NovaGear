package uth.nhathuy.Cart.controller;

import jakarta.validation.Valid;
import uth.nhathuy.Cart.dto.AddCartItemRequest;
import uth.nhathuy.Cart.dto.CartResponse;
import uth.nhathuy.Cart.dto.UpdateCartItemRequest;
import uth.nhathuy.Cart.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getMyCart(
            @RequestHeader("X-User-Id") Long userId
    ) {
        return ResponseEntity.ok(cartService.getMyCart(userId));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody AddCartItemRequest request
    ) {
        return ResponseEntity.ok(cartService.addItem(userId, request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateItem(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        return ResponseEntity.ok(cartService.updateItem(userId, itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeItem(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long itemId
    ) {
        return ResponseEntity.ok(cartService.removeItem(userId, itemId));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(
            @RequestHeader("X-User-Id") Long userId
    ) {
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}