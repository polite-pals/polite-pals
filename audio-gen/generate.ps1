# Generates cloned-voice audio clips for the Yes Ma'am App from
# audio-gen/manifest.json, using the voice IDs in audio-gen/voiceMap.json.
# Reads the ElevenLabs API key from .env (gitignored, never committed).
# Idempotent: skips any clip whose output file already exists, so it's
# safe to re-run after a partial failure.
#
# Usage:
#   powershell -File audio-gen/generate.ps1
#   powershell -File audio-gen/generate.ps1 -OnlyIds "quiz-0,quiz-1"   # test a few first
#   powershell -File audio-gen/generate.ps1 -Force                     # regenerate everything

param(
  [string]$OnlyIds = "",
  [switch]$Force
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$envLine = Get-Content ".env" | Where-Object { $_ -match '^ELEVENLABS_API_KEY=' }
if (-not $envLine) { throw "ELEVENLABS_API_KEY not found in .env" }
$apiKey = ($envLine -split '=', 2)[1].Trim()

$voiceMap = Get-Content "audio-gen/voiceMap.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$manifest = Get-Content "audio-gen/manifest.json" -Raw -Encoding UTF8 | ConvertFrom-Json

$outDir = "audio"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$filter = @()
if ($OnlyIds -ne "") { $filter = $OnlyIds -split "," | ForEach-Object { $_.Trim() } }

$total = 0
$skipped = 0
$generated = 0
$failed = @()

foreach ($item in $manifest) {
  if ($filter.Count -gt 0 -and -not ($filter -contains $item.id)) { continue }
  $total++

  $outPath = Join-Path $outDir "$($item.id).mp3"
  if ((Test-Path $outPath) -and -not $Force) {
    $skipped++
    continue
  }

  $voiceId = $voiceMap.($item.askerId)
  if (-not $voiceId) {
    Write-Warning "No voice mapped for askerId '$($item.askerId)' (id: $($item.id)) - skipping"
    $failed += $item.id
    continue
  }

  $bodyJson = @{
    text     = $item.text
    model_id = "eleven_multilingual_v2"
  } | ConvertTo-Json -Compress
  # Force real UTF-8 bytes for the request body — PowerShell 5.1's
  # default string-to-bytes conversion for -Body uses the system ANSI
  # codepage, which mangles non-ASCII characters (em dashes, curly
  # quotes) into invalid UTF-8 the API then rejects with a 400.
  $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyJson)

  try {
    Invoke-WebRequest -Uri "https://api.elevenlabs.io/v1/text-to-speech/$voiceId" `
      -Method Post `
      -Headers @{ "xi-api-key" = $apiKey } `
      -ContentType "application/json; charset=utf-8" `
      -Body $bodyBytes `
      -OutFile $outPath `
      -ErrorAction Stop | Out-Null
    $generated++
    Write-Host "OK   $($item.id) ($($item.askerId), $($item.text.Length) chars)"
  } catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Warning "FAIL $($item.id): HTTP $statusCode - $($_.Exception.Message)"
    $failed += $item.id
    if (Test-Path $outPath) { Remove-Item $outPath }
  }

  Start-Sleep -Milliseconds 300
}

Write-Host ""
Write-Host "Done. total=$total generated=$generated skipped=$skipped failed=$($failed.Count)"
if ($failed.Count -gt 0) {
  Write-Host "Failed ids: $($failed -join ', ')"
}
