#!/usr/bin/env pwsh

# ============================================================
# NovaGear Postman Tests - Run & Capture Results
# ============================================================
# Tập lệnh PowerShell để chạy Postman Collection và capture console output

param(
    [string]$CollectionPath = "E:\NovaGear\tests\postman\NovaGear_Functional_Security_Tests.json",
    [string]$OutputDir = "E:\NovaGear\tests\postman\results",
    [string]$BaseUrl = "http://localhost:8089",
    [string]$ReportFormat = "html"
)

# Force UTF-8 encoding to prevent broken characters from Newman output
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# ============================================================
# 1. Kiểm tra Postman CLI
# ============================================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NovaGear - Postman Test Runner" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1] Kiểm tra Newman CLI..." -ForegroundColor Yellow

$postmanCmd = Get-Command newman -ErrorAction SilentlyContinue
if (-not $postmanCmd) {
    Write-Host "[ERROR] Newman CLI không được tìm thấy!" -ForegroundColor Red
    Write-Host "Vui lòng cài đặt: npm install -g newman" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Newman CLI found: $($postmanCmd.Source)" -ForegroundColor Green
Write-Host ""

# ============================================================
# 2. Tạo output directory
# ============================================================
Write-Host "[2] Tạo Output Directory..." -ForegroundColor Yellow

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
    Write-Host "[OK] Created: $OutputDir" -ForegroundColor Green
} else {
    Write-Host "[OK] Directory exists: $OutputDir" -ForegroundColor Green
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$reportDir = Join-Path $OutputDir $timestamp
New-Item -ItemType Directory -Path $reportDir | Out-Null
Write-Host "[OK] Report directory: $reportDir" -ForegroundColor Green
Write-Host ""

# ============================================================
# 3. Chuẩn bị environment variables
# ============================================================
Write-Host "[3] Chuẩn bị Environment..." -ForegroundColor Yellow

$envFile = Join-Path $reportDir "postman-env.json"
$envJson = [ordered]@{
    id = "novagear-env"
    name = "NovaGear Local"
    values = @(
        @{ key = "baseUrl"; value = $BaseUrl; enabled = $true }
        @{ key = "accessToken"; value = ""; enabled = $true }
        @{ key = "refreshToken"; value = ""; enabled = $true }
        @{ key = "userId"; value = ""; enabled = $true }
        @{ key = "productId"; value = "1"; enabled = $true }
    )
} | ConvertTo-Json -Depth 10

$envJson | Set-Content -Path $envFile -Encoding UTF8
Write-Host "[OK] Environment file created: $envFile" -ForegroundColor Green
Write-Host ""

# ============================================================
# 4. Chạy Postman Collection
# ============================================================
Write-Host "[4] Chạy Postman Collection..." -ForegroundColor Yellow
Write-Host "Collection: $CollectionPath" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host ""

$jsonReportFile = Join-Path $reportDir "test-results.json"
$htmlReportFile = Join-Path $reportDir "test-report.html"
$consoleLogFile = Join-Path $reportDir "console-output.log"

$env:NODE_OPTIONS = "--no-warnings"

$runOutput = & newman run $CollectionPath `
    --environment $envFile `
    --reporters "cli,json" `
    --reporter-json-export $jsonReportFile `
    2>&1

$runOutput | Tee-Object -FilePath $consoleLogFile
Write-Host ""
Write-Host "[OK] Test run completed" -ForegroundColor Green
Write-Host ""

# ============================================================
# 5. Xử lý kết quả JSON
# ============================================================
Write-Host "[5] Xử lý kết quả..." -ForegroundColor Yellow

$stats = $null
if (Test-Path $jsonReportFile) {
    $jsonResults = Get-Content -Path $jsonReportFile -Raw | ConvertFrom-Json
    $stats = $jsonResults.run.stats

    Write-Host "[OK] JSON Report: $jsonReportFile" -ForegroundColor Green
    Write-Host ""

    # Xuất thống kê
    Write-Host "====== TEST STATISTICS ======" -ForegroundColor Cyan
    Write-Host "Total Requests: $($stats.requests.total)" -ForegroundColor White
    Write-Host "Total Tests: $($stats.tests.total)" -ForegroundColor White
    Write-Host "Tests Passed: $($stats.tests.passed)" -ForegroundColor Green
    Write-Host "Tests Failed: $($stats.tests.failed)" -ForegroundColor Red
    Write-Host "Assertions: $($stats.assertions.total)" -ForegroundColor White
    Write-Host "Assertions Passed: $($stats.assertions.passed)" -ForegroundColor Green
    Write-Host "Assertions Failed: $($stats.assertions.failed)" -ForegroundColor Red
    Write-Host "==============================" -ForegroundColor Cyan
    Write-Host ""

} else {
    Write-Host "[WARNING] JSON report file not found" -ForegroundColor Yellow
}

# ============================================================
# 6. Tạo HTML Report
# ============================================================
Write-Host "[6] Tạo HTML Report..." -ForegroundColor Yellow

$consoleHtml = ""
if (Test-Path $consoleLogFile) {
    $consoleHtml = Get-Content -Path $consoleLogFile -Raw
    $consoleHtml = [System.Net.WebUtility]::HtmlEncode($consoleHtml)
    $consoleHtml = $consoleHtml -replace '\[TEST\]', '<span class="log-info">[TEST]</span>'
    $consoleHtml = $consoleHtml -replace '\[OK\]', '<span class="log-pass">[OK]</span>'
    $consoleHtml = $consoleHtml -replace '\[ERROR\]', '<span class="log-error">[ERROR]</span>'
    $consoleHtml = $consoleHtml -replace '\[WARNING\]', '<span class="log-warning">[WARNING]</span>'
}

$requestsTotal = if ($stats) { $stats.requests.total } else { 0 }
$testsTotal = if ($stats) { $stats.tests.total } else { 0 }
$testsPassed = if ($stats) { $stats.tests.passed } else { 0 }
$testsFailed = if ($stats) { $stats.tests.failed } else { 0 }
$assertionsTotal = if ($stats) { $stats.assertions.total } else { 0 }
$assertionsPassed = if ($stats) { $stats.assertions.passed } else { 0 }
$assertionsFailed = if ($stats) { $stats.assertions.failed } else { 0 }

$htmlLines = @(
    '<!DOCTYPE html>',
    '<html lang="vi">',
    '<head>',
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '  <title>NovaGear - Test Report</title>',
    '  <style>',
    '    body { font-family: Segoe UI, Arial, sans-serif; margin: 24px; background: #f7f7f7; color: #222; }',
    '    .card { background: #fff; border-radius: 10px; padding: 18px; margin-bottom: 18px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }',
    '    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }',
    '    .stat { padding: 14px; border-left: 4px solid #667eea; background: #fdfdff; }',
    '    .stat .value { font-size: 28px; font-weight: 700; color: #667eea; }',
    '    .pass { border-left-color: #16a34a; }',
    '    .pass .value { color: #16a34a; }',
    '    .fail { border-left-color: #dc2626; }',
    '    .fail .value { color: #dc2626; }',
    '    pre { white-space: pre-wrap; word-break: break-word; background: #111827; color: #e5e7eb; padding: 16px; border-radius: 8px; overflow-x: auto; }',
    '    .log-info { color: #60a5fa; }',
    '    .log-pass { color: #34d399; }',
    '    .log-error { color: #f87171; }',
    '    .log-warning { color: #fbbf24; }',
    '  </style>',
    '</head>',
    '<body>',
    '  <div class="card">',
    '    <h1>NovaGear Postman Test Report</h1>',
    "    <p>Generated: $timestamp</p>",
    "    <p>Base URL: $BaseUrl</p>",
    "    <p>Collection: $CollectionPath</p>",
    '  </div>',
    '  <div class="card">',
    '    <h2>Test Statistics</h2>',
    '    <div class="grid">',
    "      <div class=`"stat`"><div class=`"value`">$requestsTotal</div><div>Requests</div></div>",
    "      <div class=`"stat`"><div class=`"value`">$testsTotal</div><div>Tests</div></div>",
    "      <div class=`"stat pass`"><div class=`"value`">$testsPassed</div><div>Passed</div></div>",
    "      <div class=`"stat fail`"><div class=`"value`">$testsFailed</div><div>Failed</div></div>",
    "      <div class=`"stat`"><div class=`"value`">$assertionsTotal</div><div>Assertions</div></div>",
    "      <div class=`"stat pass`"><div class=`"value`">$assertionsPassed</div><div>Assertions Passed</div></div>",
    "      <div class=`"stat fail`"><div class=`"value`">$assertionsFailed</div><div>Assertions Failed</div></div>",
    '    </div>',
    '  </div>',
    '  <div class="card">',
    '    <h2>Console Output</h2>',
    "    <pre>$consoleHtml</pre>",
    '  </div>',
    '  <div class="card">',
    '    <h2>Generated Files</h2>',
    '    <ul>',
    '      <li>test-results.json</li>',
    '      <li>console-output.log</li>',
    '      <li>postman-env.json</li>',
    '      <li>test-report.html</li>',
    '    </ul>',
    '  </div>',
    '</body>',
    '</html>'
)

$htmlLines -join [Environment]::NewLine | Set-Content -Path $htmlReportFile -Encoding UTF8
Write-Host "[OK] HTML Report created: $htmlReportFile" -ForegroundColor Green
Write-Host ""

# ============================================================
# 7. Tóm tắt kết quả
# ============================================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Execution Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Reports saved to: $reportDir" -ForegroundColor Cyan
Write-Host "  • JSON Report: test-results.json" -ForegroundColor White
Write-Host "  • HTML Report: test-report.html" -ForegroundColor White
Write-Host "  • Console Log: console-output.log" -ForegroundColor White
Write-Host "  • Environment: postman-env.json" -ForegroundColor White
Write-Host ""
Write-Host "To view the HTML report, open:" -ForegroundColor Yellow
Write-Host "  $htmlReportFile" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# 8. Mở report (optional)
# ============================================================
$openReport = Read-Host "Bạn có muốn mở HTML report không? (y/n)"
if ($openReport -eq "y" -or $openReport -eq "Y") {
    Start-Process $htmlReportFile
}

Write-Host ""
Write-Host "✅ Hoàn tất!" -ForegroundColor Green

