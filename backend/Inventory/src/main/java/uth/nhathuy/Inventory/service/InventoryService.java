package uth.nhathuy.Inventory.service;

import uth.nhathuy.Inventory.dto.*;
import uth.nhathuy.Inventory.entity.*;
import uth.nhathuy.Inventory.exception.BadRequestException;
import uth.nhathuy.Inventory.exception.ResourceNotFoundException;
import uth.nhathuy.Inventory.repository.InventoryRepository;
import uth.nhathuy.Inventory.repository.InventoryTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository transactionRepository;

    public Page<InventoryResponse> search(String keyword, InventoryStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        String normalizedKeyword = normalize(keyword);
        Long keywordId = parseKeywordId(normalizedKeyword);

        if (normalizedKeyword != null && keywordId == null) {
            return Page.empty(pageable);
        }

        return inventoryRepository.search(keywordId, status, pageable)
                .map(this::mapInventory);
    }

    public InventoryResponse getByVariantId(Long variantId) {
        Inventory inventory = inventoryRepository.findByVariantId(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tồn kho của variant"));
        return mapInventory(inventory);
    }

    public List<InventoryTransactionResponse> getTransactionsByVariantId(Long variantId) {
        return transactionRepository.findByVariantIdOrderByIdDesc(variantId)
                .stream()
                .map(this::mapTransaction)
                .toList();
    }

    @Transactional
    public InventoryResponse importStock(InventoryImportRequest request) {
        Inventory inventory = inventoryRepository.findByVariantId(request.getVariantId())
                .orElseGet(() -> Inventory.builder()
                        .productId(request.getProductId())
                        .variantId(request.getVariantId())
                        .availableQuantity(0)
                        .reservedQuantity(0)
                        .lowStockThreshold(request.getLowStockThreshold() != null ? request.getLowStockThreshold() : 5)
                        .status(InventoryStatus.OUT_OF_STOCK)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build());

        inventory.setProductId(request.getProductId());
        inventory.setAvailableQuantity(inventory.getAvailableQuantity() + request.getQuantity());

        if (request.getLowStockThreshold() != null) {
            inventory.setLowStockThreshold(request.getLowStockThreshold());
        }

        refreshStatus(inventory);
        inventory.setUpdatedAt(LocalDateTime.now());

        Inventory saved = inventoryRepository.save(inventory);

        saveTransaction(
                saved,
                InventoryTransactionType.IMPORT,
                request.getQuantity(),
                request.getNote()
        );

        return mapInventory(saved);
    }

    @Transactional
    public InventoryResponse adjustStock(InventoryAdjustRequest request) {
        Inventory inventory = inventoryRepository.findByVariantId(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tồn kho của variant"));

        inventory.setAvailableQuantity(request.getAvailableQuantity());
        inventory.setReservedQuantity(request.getReservedQuantity());

        if (request.getLowStockThreshold() != null) {
            inventory.setLowStockThreshold(request.getLowStockThreshold());
        }

        validateNonNegative(inventory);
        refreshStatus(inventory);
        inventory.setUpdatedAt(LocalDateTime.now());

        Inventory saved = inventoryRepository.save(inventory);

        saveTransaction(
                saved,
                InventoryTransactionType.ADJUST,
                0,
                request.getNote()
        );

        return mapInventory(saved);
    }

    @Transactional
    public InventoryResponse reserveStock(ReserveStockRequest request) {
        Inventory inventory = inventoryRepository.findByVariantId(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tồn kho của variant"));

        int sellable = getSellableQuantity(inventory);
        if (sellable < request.getQuantity()) {
            throw new BadRequestException("Không đủ tồn kho để reserve");
        }

        inventory.setReservedQuantity(inventory.getReservedQuantity() + request.getQuantity());
        refreshStatus(inventory);
        inventory.setUpdatedAt(LocalDateTime.now());

        Inventory saved = inventoryRepository.save(inventory);

        saveTransaction(
                saved,
                InventoryTransactionType.RESERVE,
                request.getQuantity(),
                request.getNote()
        );

        return mapInventory(saved);
    }

    @Transactional
    public InventoryResponse releaseStock(ReleaseStockRequest request) {
        Inventory inventory = inventoryRepository.findByVariantId(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tồn kho của variant"));

        if (inventory.getReservedQuantity() < request.getQuantity()) {
            throw new BadRequestException("Số lượng release vượt quá reserved");
        }

        inventory.setReservedQuantity(inventory.getReservedQuantity() - request.getQuantity());
        refreshStatus(inventory);
        inventory.setUpdatedAt(LocalDateTime.now());

        Inventory saved = inventoryRepository.save(inventory);

        saveTransaction(
                saved,
                InventoryTransactionType.RELEASE,
                request.getQuantity(),
                request.getNote()
        );

        return mapInventory(saved);
    }

    @Transactional
    public InventoryResponse deductStock(DeductStockRequest request) {
        Inventory inventory = inventoryRepository.findByVariantId(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tồn kho của variant"));

        if (inventory.getReservedQuantity() < request.getQuantity()) {
            throw new BadRequestException("Số lượng deduct vượt quá reserved");
        }

        if (inventory.getAvailableQuantity() < request.getQuantity()) {
            throw new BadRequestException("Số lượng available không đủ để deduct");
        }

        inventory.setReservedQuantity(inventory.getReservedQuantity() - request.getQuantity());
        inventory.setAvailableQuantity(inventory.getAvailableQuantity() - request.getQuantity());

        validateNonNegative(inventory);
        refreshStatus(inventory);
        inventory.setUpdatedAt(LocalDateTime.now());

        Inventory saved = inventoryRepository.save(inventory);

        saveTransaction(
                saved,
                InventoryTransactionType.DEDUCT,
                request.getQuantity(),
                request.getNote()
        );

        return mapInventory(saved);
    }

    private void validateNonNegative(Inventory inventory) {
        if (inventory.getAvailableQuantity() < 0 || inventory.getReservedQuantity() < 0) {
            throw new BadRequestException("Số lượng tồn kho không được âm");
        }
        if (inventory.getReservedQuantity() > inventory.getAvailableQuantity()) {
            throw new BadRequestException("reservedQuantity không được lớn hơn availableQuantity");
        }
    }

    private void refreshStatus(Inventory inventory) {
        int sellable = getSellableQuantity(inventory);

        if (sellable <= 0) {
            inventory.setStatus(InventoryStatus.OUT_OF_STOCK);
        } else if (sellable <= inventory.getLowStockThreshold()) {
            inventory.setStatus(InventoryStatus.LOW_STOCK);
        } else {
            inventory.setStatus(InventoryStatus.IN_STOCK);
        }
    }

    private int getSellableQuantity(Inventory inventory) {
        return inventory.getAvailableQuantity() - inventory.getReservedQuantity();
    }

    private void saveTransaction(
            Inventory inventory,
            InventoryTransactionType type,
            Integer quantity,
            String note
    ) {
        InventoryTransaction transaction = InventoryTransaction.builder()
                .inventoryId(inventory.getId())
                .productId(inventory.getProductId())
                .variantId(inventory.getVariantId())
                .type(type)
                .quantity(quantity)
                .note(note)
                .createdAt(LocalDateTime.now())
                .build();

        transactionRepository.save(transaction);
    }

    private String normalize(String keyword) {
        return (keyword == null || keyword.isBlank()) ? null : keyword.trim();
    }

    private Long parseKeywordId(String keyword) {
        if (keyword == null) {
            return null;
        }

        try {
            return Long.parseLong(keyword);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private InventoryResponse mapInventory(Inventory inventory) {
        return InventoryResponse.builder()
                .id(inventory.getId())
                .productId(inventory.getProductId())
                .variantId(inventory.getVariantId())
                // These fields will be populated from product service calls when needed
                // For now, they'll be null and frontend can fetch from product API
                .availableQuantity(inventory.getAvailableQuantity())
                .reservedQuantity(inventory.getReservedQuantity())
                .sellableQuantity(getSellableQuantity(inventory))
                .lowStockThreshold(inventory.getLowStockThreshold())
                .status(inventory.getStatus())
                .build();
    }

    private InventoryTransactionResponse mapTransaction(InventoryTransaction transaction) {
        return InventoryTransactionResponse.builder()
                .id(transaction.getId())
                .inventoryId(transaction.getInventoryId())
                .productId(transaction.getProductId())
                .variantId(transaction.getVariantId())
                .type(transaction.getType())
                .quantity(transaction.getQuantity())
                .note(transaction.getNote())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}