the $ErrorActionPreference = 'Continue'
$base = 'http://localhost:8080'
$email = "audit$(Get-Random)@devmastery.local"
$body = @{ email = $email; password = 'Test1234!'; fullName = 'Audit User' } | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Method Post -Uri "$base/v1/auth/register" -ContentType 'application/json' -Body $body
    Write-Host "Registered: $email"
} catch {
    Write-Host "REGISTER FAIL: $($_.Exception.Message)"
    try { (New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd() | Write-Host } catch {}
    exit 1
}
$tok = $r.token
$h = @{ Authorization = "Bearer $tok" }
$uid = $r.user.id
Write-Host "USER ID: $uid"

$endpoints = @(
    @{ m='GET'; u='/v1/dashboard' },
    @{ m='GET'; u='/v1/topics/oop-pillars' },
    @{ m='GET'; u='/v1/topics/arrays-and-strings' },
    @{ m='GET'; u='/v1/paths' },
    @{ m='GET'; u='/v1/paths/java-mastery/roadmap' },
    @{ m='GET'; u='/v1/progress/me' },
    @{ m='GET'; u='/v1/profile/me' },
    @{ m='GET'; u='/v1/profile' },
    @{ m='GET'; u='/v1/notifications' },
    @{ m='GET'; u='/v1/visualizer/binary-search' },
    @{ m='GET'; u='/v1/system-design/url-shortener' },
    @{ m='GET'; u='/v1/patterns/sliding-window' }
)
foreach ($e in $endpoints) {
    Write-Host "`n=== $($e.m) $($e.u) ==="
    try {
        $resp = Invoke-WebRequest -Method $e.m -Uri "$base$($e.u)" -Headers $h -UseBasicParsing
        Write-Host "STATUS: $($resp.StatusCode)"
        Write-Host ($resp.Content.Substring(0, [Math]::Min(300, $resp.Content.Length)))
    } catch {
        Write-Host "STATUS: $($_.Exception.Response.StatusCode.value__)"
        try { Write-Host ((New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd().Substring(0,300)) } catch {}
    }
}

