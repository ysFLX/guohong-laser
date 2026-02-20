param(
  [Parameter(Mandatory = $true)]
  [string]$BaseUrl,
  [string]$CronSecret = ""
)

$ErrorActionPreference = "Stop"

function Invoke-Test {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [string]$Method,
    [Parameter(Mandatory = $true)]
    [string]$Url,
    [int[]]$AllowedStatus = @(200),
    [string]$Body = "",
    [hashtable]$Headers = @{}
  )

  try {
    if ($Body -and $Body.Length -gt 0) {
      $response = Invoke-WebRequest -Method $Method -Uri $Url -Headers $Headers -Body $Body -ContentType "application/json"
    } else {
      $response = Invoke-WebRequest -Method $Method -Uri $Url -Headers $Headers
    }

    $status = [int]$response.StatusCode
  } catch {
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      $status = [int]$_.Exception.Response.StatusCode
    } else {
      Write-Host "[FAIL] $Name - request failed: $($_.Exception.Message)" -ForegroundColor Red
      return @{ Ok = $false; Status = -1 }
    }
  }

  if ($AllowedStatus -contains $status) {
    Write-Host "[PASS] $Name - HTTP $status" -ForegroundColor Green
    return @{ Ok = $true; Status = $status }
  }

  Write-Host "[FAIL] $Name - HTTP $status (expected: $($AllowedStatus -join ', '))" -ForegroundColor Red
  return @{ Ok = $false; Status = $status }
}

$base = $BaseUrl.TrimEnd("/")
$results = @()

Write-Host "Smoke test basliyor: $base" -ForegroundColor Cyan

# Public routes
$results += Invoke-Test -Name "Homepage" -Method "GET" -Url "$base/" -AllowedStatus @(200)
$results += Invoke-Test -Name "Robots" -Method "GET" -Url "$base/robots.txt" -AllowedStatus @(200)
$results += Invoke-Test -Name "Sitemap" -Method "GET" -Url "$base/sitemap.xml" -AllowedStatus @(200)
$results += Invoke-Test -Name "Spare Parts API" -Method "GET" -Url "$base/api/spare-parts" -AllowedStatus @(200)
$results += Invoke-Test -Name "Cities API" -Method "GET" -Url "$base/api/locations/tr/cities" -AllowedStatus @(200)

# Security checks (unauthenticated expectations)
$results += Invoke-Test -Name "Checkout requires auth" -Method "POST" -Url "$base/api/checkout" -AllowedStatus @(401) -Body "{""items"":[]}"
$results += Invoke-Test -Name "Returns upload requires auth" -Method "POST" -Url "$base/api/returns-request/upload-url" -AllowedStatus @(401) -Body "{""filename"":""a.png"",""contentType"":""image/png""}"
$results += Invoke-Test -Name "Invalid cart recovery token" -Method "GET" -Url "$base/api/cart-recovery?token=invalid" -AllowedStatus @(400)

# Cron route checks
if ([string]::IsNullOrWhiteSpace($CronSecret)) {
  $results += Invoke-Test -Name "Cart reminder cron without secret" -Method "GET" -Url "$base/api/cron/cart-reminders" -AllowedStatus @(401, 500)
} else {
  $headers = @{ "x-cron-secret" = $CronSecret }
  $results += Invoke-Test -Name "Cart reminder cron with secret" -Method "GET" -Url "$base/api/cron/cart-reminders" -Headers $headers -AllowedStatus @(200)
}

$passCount = ($results | Where-Object { $_.Ok }).Count
$failCount = ($results | Where-Object { -not $_.Ok }).Count

Write-Host ""
Write-Host "Sonuc: PASS=$passCount FAIL=$failCount" -ForegroundColor Yellow

if ($failCount -gt 0) {
  exit 1
}

exit 0
