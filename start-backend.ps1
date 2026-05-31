$services = @(
    "ai-bot-service",
    "auth-service",
    "content-service",
    "execution-service",
    "progress-service"
)

Write-Host "Starting DevMastery Microservices..." -ForegroundColor Cyan

foreach ($service in $services) {
    Write-Host "Starting $service..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/$service; ./gradlew bootRun"
}

Write-Host "All services are starting up in separate windows!" -ForegroundColor Green
