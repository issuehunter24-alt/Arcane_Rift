param(
  [string]$Root = "D:/AI_Projects/Gals",
  [int]$Quality = 85
)

$ErrorActionPreference = "Stop"

# Ensure ImageMagick (magick.exe)
$magick = Get-Command magick -ErrorAction SilentlyContinue
if(-not $magick){
  Write-Host "ImageMagick not found. Installing via winget..." -ForegroundColor Yellow
  winget install -e --id ImageMagick.ImageMagick --accept-source-agreements --accept-package-agreements --silent | Out-Null
  $magick = Get-Command magick -ErrorAction SilentlyContinue
  if(-not $magick){ throw "ImageMagick installation failed or not on PATH." }
}

$src = Join-Path $Root "web/public/backgrounds"
if(-not (Test-Path $src)){ throw "Backgrounds folder not found: $src" }

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

