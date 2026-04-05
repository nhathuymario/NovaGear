# Seeding Guide

This document explains how seed data works in this repo, what demo data is created, and how to run quick smoke tests.

## 1) Seed activation

All `DataSeeder` classes are now guarded by:

- `@Profile("seed")`

That means:

- production/default run -> **no seeding**
- run with `seed` profile -> seeders execute on startup

## 2) Services with seeder

- `backend/Auth/src/main/java/uth/nhathuy/Auth/config/DataSeeder.java`
- `backend/User/src/main/java/uth/nhathuy/User/config/DataSeeder.java`
- `backend/Product/src/main/java/uth/nhathuy/Product/config/DataSeeder.java`
- `backend/Inventory/src/main/java/uth/nhathuy/Inventory/config/DataSeeder.java`
- `backend/Cart/src/main/java/uth/nhathuy/Cart/config/DataSeeder.java`
- `backend/Order/src/main/java/uth/nhathuy/Order/config/DataSeeder.java`
- `backend/Payment/src/main/java/uth/nhathuy/Payment/config/DataSeeder.java`

## 3) Seeded accounts

From Auth seeder:

- admin
  - username: `admin`
  - email: `admin@gmail.com`
  - password: `123456`
  - role: `ROLE_ADMIN`
- staff
  - username: `staff`
  - email: `staff@gmail.com`
  - password: `123456`
  - role: `ROLE_STAFF`
- user
  - username: `user`
  - email: `user@gmail.com`
  - password: `123456`
  - role: `ROLE_USER`

From User seeder:

- profiles + default addresses for `authUserId` 1/2/3 (admin/staff/user)

## 4) Seeded dataset overview

### Product service

- categories: laptop, dien-thoai, man-hinh, phu-kien
- products: MacBook, ROG G14, iPhone, LG monitor, Keychron keyboard
- each product has variants
- specifications and images are seeded

### Inventory service

- inventory rows for seeded variants (mapped by productId/variantId)
- initial `IMPORT` transactions

### Cart service

- one cart for user `3`
- 2 cart items preloaded

### Order service

- orders for user `3` with order items
- mixed statuses (for list/detail/admin testing)

### Payment service

- payment linked to order `1` (SUCCESS)
- payment linked to order `2` (PENDING)

## 5) Run with seed profile

### Option A: one command (recommended)

```powershell
Set-Location "E:\NovaGear"
.\scripts\run-seeded.ps1
```

Preview commands without starting services:

```powershell
Set-Location "E:\NovaGear"
.\scripts\run-seeded.ps1 -DryRun
```

Include notification service too:

```powershell
Set-Location "E:\NovaGear"
.\scripts\run-seeded.ps1 -IncludeNotification
```

### Option B: start each service manually

```powershell
Set-Location "E:\NovaGear\backend\Auth"
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=seed"

Set-Location "E:\NovaGear\backend\User"
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=seed"

Set-Location "E:\NovaGear\backend\Product"
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=seed"

Set-Location "E:\NovaGear\backend\Inventory"
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=seed"

Set-Location "E:\NovaGear\backend\Cart"
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=seed"

Set-Location "E:\NovaGear\backend\Order"
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=seed"

Set-Location "E:\NovaGear\backend\Payment"
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=seed"

Set-Location "E:\NovaGear\gateway\gateway"
.\mvnw.cmd spring-boot:run
```

Gateway runs at `http://localhost:8089`.

## 6) Quick API smoke test (via gateway)

### 6.1 Login user

```powershell
$loginUserBody = @{ username = "user"; password = "123456" } | ConvertTo-Json
$userLogin = Invoke-RestMethod -Method Post -Uri "http://localhost:8089/api/auth/login" -ContentType "application/json" -Body $loginUserBody
$userToken = $userLogin.token
$userHeaders = @{ Authorization = "Bearer $userToken" }
```

### 6.2 Public products

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:8089/api/products/public?page=0&size=5"
Invoke-RestMethod -Method Get -Uri "http://localhost:8089/api/products/public/categories"
```

### 6.3 User flows

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:8089/api/auth/me" -Headers $userHeaders
Invoke-RestMethod -Method Get -Uri "http://localhost:8089/api/users/me" -Headers $userHeaders
Invoke-RestMethod -Method Get -Uri "http://localhost:8089/api/cart" -Headers $userHeaders
Invoke-RestMethod -Method Get -Uri "http://localhost:8089/api/orders/my" -Headers $userHeaders
Invoke-RestMethod -Method Get -Uri "http://localhost:8089/api/payments/me" -Headers $userHeaders
```

### 6.4 Admin flows

```powershell
$loginAdminBody = @{ username = "admin"; password = "123456" } | ConvertTo-Json
$adminLogin = Invoke-RestMethod -Method Post -Uri "http://localhost:8089/api/auth/login" -ContentType "application/json" -Body $loginAdminBody
$adminToken = $adminLogin.token
$adminHeaders = @{ Authorization = "Bearer $adminToken" }

Invoke-RestMethod -Method Get -Uri "http://localhost:8089/api/admin/products?page=0&size=5" -Headers $adminHeaders
Invoke-RestMethod -Method Get -Uri "http://localhost:8089/api/admin/categories" -Headers $adminHeaders
Invoke-RestMethod -Method Get -Uri "http://localhost:8089/api/admin/inventory?page=0&size=5" -Headers $adminHeaders
Invoke-RestMethod -Method Get -Uri "http://localhost:8089/api/admin/orders" -Headers $adminHeaders
Invoke-RestMethod -Method Get -Uri "http://localhost:8089/api/admin/payments" -Headers $adminHeaders
```

## 7) Notes

- Seeders are idempotent in practical terms (most check existing data before insert).
- If you need a clean reseed, truncate related tables and rerun services with `seed` profile.
- Avoid enabling profile `seed` in production environments.
