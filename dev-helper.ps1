# NovaGear Development Helper Script
# Purpose: Quick commands for common development tasks

param(
    [string]$Action = "help"
)

function Show-Help {
    Write-Host @"
NovaGear Development Helper - Quick Commands
=============================================

USAGE:
  .\dev-helper.ps1 [ACTION]

ACTIONS:
  help              Show this help message
  status            Show running services
  test              Run Postman tests
  health            Full system health check
  logs-gateway      View gateway service logs
  logs-auth         View auth service logs

EXAMPLES:
  .\dev-helper.ps1 status
  .\dev-helper.ps1 test
  .\dev-helper.ps1 health
"@
}

function Show-Status {
    Write-Host ""
    Write-Host "=== NovaGear Service Status ===" -ForegroundColor Cyan
    Write-Host ""

    $ports = @{
        "Frontend (Vite)" = 5001
        "Gateway" = 8089
        "Auth Service" = 8081
    }

    foreach ($service in $ports.GetEnumerator()) {
        $port = $service.Value
        $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

        if ($connection) {
            Write-Host "[RUNNING] $($service.Name) (Port: $port)" -ForegroundColor Green
        } else {
            Write-Host "[STOPPED] $($service.Name) (Port: $port)" -ForegroundColor Red
        }
    }

    Write-Host ""
}

function Run-Tests {
    Write-Host ""
    Write-Host "Running Postman Test Suite..." -ForegroundColor Cyan

    Push-Location E:\NovaGear\tests\postman

    & .\run-tests.ps1 -BaseUrl http://localhost:8089

    Write-Host ""
    Write-Host "Tests completed!" -ForegroundColor Green
    Write-Host "Check results: E:\NovaGear\tests\postman\results\" -ForegroundColor Yellow
    Write-Host ""

    Pop-Location
}

function Run-Health-Check {
    Write-Host ""
    Write-Host "=== System Health Check ===" -ForegroundColor Cyan
    Write-Host ""

    # Check Node.js
    try {
        $node = node --version 2>&1
        Write-Host "[OK] Node.js: $node" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] Node.js not installed" -ForegroundColor Red
    }

    # Check npm
    try {
        $npm = npm --version 2>&1
        Write-Host "[OK] npm: $npm" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] npm not installed" -ForegroundColor Red
    }

    # Check Java
    try {
        $java = java -version 2>&1 | Select-Object -First 1
        Write-Host "[OK] Java installed" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] Java not installed" -ForegroundColor Red
    }

    # Check Maven
    try {
        $maven = mvn --version 2>&1 | Select-Object -First 1
        Write-Host "[OK] Maven installed" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] Maven not installed" -ForegroundColor Red
    }

    # Check Newman
    try {
        $newman = newman --version 2>&1
        Write-Host "[OK] Newman: $newman" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] Newman not installed" -ForegroundColor Red
    }

    Write-Host ""
    Show-Status

    Write-Host "=== Critical Files ===" -ForegroundColor Cyan
    Write-Host ""

    $files = @(
        "E:\NovaGear\frontend\vite.config.ts",
        "E:\NovaGear\tests\postman\run-tests.ps1",
        "E:\NovaGear\docker-compose.yml",
        "E:\NovaGear\DOCUMENTATION_INDEX.md"
    )

    foreach ($file in $files) {
        if (Test-Path $file) {
            $name = Split-Path -Leaf $file
            Write-Host "[OK] $name" -ForegroundColor Green
        } else {
            $name = Split-Path -Leaf $file
            Write-Host "[FAIL] $name not found" -ForegroundColor Red
        }
    }

    Write-Host ""
    Write-Host "Health check complete!" -ForegroundColor Green
    Write-Host ""
}

function Show-Logs {
    param([string]$Service)

    $logPath = "E:\NovaGear\logs\$Service-service.log"

    if (-not (Test-Path $logPath)) {
        Write-Host "Log file not found: $logPath" -ForegroundColor Red
        return
    }

    Write-Host ""
    Write-Host "=== Last 50 lines of $Service log ===" -ForegroundColor Cyan
    Write-Host ""
    Get-Content $logPath -Tail 50
    Write-Host ""
}

# Main entry point
switch ($Action.ToLower()) {
    "help" { Show-Help }
    "status" { Show-Status }
    "test" { Run-Tests }
    "health" { Run-Health-Check }
    "logs-gateway" { Show-Logs "gateway" }
    "logs-auth" { Show-Logs "auth" }
    default {
        Write-Host "Unknown action: $Action" -ForegroundColor Red
        Show-Help
    }
}

