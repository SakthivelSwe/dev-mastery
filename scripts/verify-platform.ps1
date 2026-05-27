Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DevMastery Platform Health Check" -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""

$services = @(
    [PSCustomObject]@{ Name = "auth-service";       Port = 8081 },
    [PSCustomObject]@{ Name = "content-service";    Port = 8082 },
    [PSCustomObject]@{ Name = "progress-service";   Port = 8083 },
    [PSCustomObject]@{ Name = "ai-bot-service";     Port = 8084 },
    [PSCustomObject]@{ Name = "execution-service";  Port = 8085 }
)

$allOk = $true

foreach ($svc in $services) {
    $url = "http://localhost:$($svc.Port)/actuator/health"
    try {
        $response = Invoke-RestMethod -Uri $url -TimeoutSec 5 -ErrorAction Stop
        $status = $response.status
        if ($status -eq "UP") {
            Write-Host "  [OK]  $($svc.Name) (port $($svc.Port)) -- $status" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] $($svc.Name) (port $($svc.Port)) -- $status" -ForegroundColor Yellow
            $allOk = $false
        }
    } catch {
        Write-Host "  [FAIL] $($svc.Name) (port $($svc.Port)) -- UNREACHABLE" -ForegroundColor Red
        $allOk = $false
    }
}

Write-Host ""
if ($allOk) {
    Write-Host "  All services healthy! DevMastery is fully operational." -ForegroundColor Green
} else {
    Write-Host "  WARNING: Some services are down. Check logs above." -ForegroundColor Yellow
}
Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""
