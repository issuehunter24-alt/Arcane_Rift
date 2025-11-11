param(
  [string]$Root,
  [int]$Quality = 85
)

$ErrorActionPreference = "Stop"

# Auto-detect project root if not provided
if(-not $Root -or -not (Test-Path $Root)){
  $baseDir = $PSScriptRoot
  if(-not $baseDir -or $baseDir -eq ''){
    $miPath = $MyInvocation.MyCommand.Path
    if($miPath){
      $baseDir = Split-Path -Parent $miPath
    } else {
      $baseDir = (Get-Location).Path
    }
  }
  $leaf = Split-Path -Leaf $baseDir
  if($leaf -ieq 'Scripts'){
    $Root = Split-Path -Parent $baseDir
  } else {
    $Root = $baseDir
  }
}

$src = Join-Path $Root "web/public/cards"
if(-not (Test-Path $src)){ throw "Cards folder not found: $src" }

# Ensure ImageMagick (magick.exe)
$magick = Get-Command magick -ErrorAction SilentlyContinue
if(-not $magick){
  Write-Host "ImageMagick not found. Installing via winget..." -ForegroundColor Yellow
  winget install -e --id ImageMagick.ImageMagick --accept-source-agreements --accept-package-agreements --silent | Out-Null
  $magick = Get-Command magick -ErrorAction SilentlyContinue
  if(-not $magick){ throw "ImageMagick installation failed or not on PATH." }
}

# Convert all PNGs that don't have a corresponding WebP or that are older
Get-ChildItem -LiteralPath $src -File -Include *.png | ForEach-Object {
  $png = $_.FullName
  $webp = [System.IO.Path]::ChangeExtension($png, '.webp')
  $needsConvert = -not (Test-Path $webp) -or ([System.IO.File]::GetLastWriteTimeUtc($png) -gt [System.IO.File]::GetLastWriteTimeUtc($webp))
  if($needsConvert){
    & magick "$png" -quality $Quality -define webp:method=6 "$webp"
    Write-Host "Converted -> $webp" -ForegroundColor Green
  }
}

Write-Host "WebP conversion complete in: $src" -ForegroundColor Green


