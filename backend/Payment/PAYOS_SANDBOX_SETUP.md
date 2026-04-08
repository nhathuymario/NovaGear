# PayOS Sandbox Setup

## Required Environment Variables

Set real sandbox credentials before starting `payment-service`.

```powershell
$env:PAYOS_API_KEY="your_sandbox_api_key"
$env:PAYOS_CLIENT_ID="your_sandbox_client_id"
$env:PAYOS_CHECKSUM_KEY="your_sandbox_checksum_key"
$env:PAYOS_API_URL="https://api-merchant.payos.vn"
$env:PAYOS_CHECKOUT_PATH="/v2/payment-requests"
$env:PAYOS_RETURN_URL="http://localhost:5173/payment/result"
$env:PAYOS_CANCEL_URL="http://localhost:5173/order"
```

## Start Service

```powershell
Push-Location "E:\NovaGear\backend\Payment"
.\mvnw.cmd spring-boot:run
Pop-Location
```

## Notes

- If `PAYOS_API_KEY` / `PAYOS_CLIENT_ID` are placeholders (`SANDBOX_*`), service runs in local mock mode and redirects to FE result page.
- To open real PayOS sandbox checkout page, all three values (`API_KEY`, `CLIENT_ID`, `CHECKSUM_KEY`) must be valid.
- `checkout-path` is configurable in case PayOS changes endpoint version.

