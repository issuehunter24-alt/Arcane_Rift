param(
  [string]$Root
)

# Ensure errors stop the script
$ErrorActionPreference = "Stop"

# Auto-detect project root if not provided
if(-not $Root -or -not (Test-Path $Root)){
  # Prefer PowerShell's PSScriptRoot when available; fallback to MyInvocation; then to current directory
  $baseDir = $PSScriptRoot
  if(-not $baseDir -or $baseDir -eq ''){
    $miPath = $MyInvocation.MyCommand.Path
    if($miPath){
      $baseDir = Split-Path -Parent $miPath
    } else {
      $baseDir = (Get-Location).Path
    }
  }
  # If script is under /Scripts, project root is its parent; otherwise assume current directory is project root
  $leaf = Split-Path -Leaf $baseDir
  if($leaf -ieq 'Scripts'){
    $Root = Split-Path -Parent $baseDir
  } else {
    $Root = $baseDir
  }
}

$charactersSrc = Join-Path $Root "Cards/Characters"
$destRoot = Join-Path $Root "web/public/cards"

if(-not (Test-Path $charactersSrc)){
  throw "Source not found: $charactersSrc"
}

New-Item -ItemType Directory -Force -Path $destRoot | Out-Null

# 기존 캐릭터 카드 이미지 정리 (card_back 등 공용 리소스는 유지)
Get-ChildItem -LiteralPath $destRoot -Directory -ErrorAction SilentlyContinue | ForEach-Object {
  Remove-Item -LiteralPath $_.FullName -Recurse -Force
}

$preserveFiles = @('card_back.png', 'card_back.webp')
Get-ChildItem -LiteralPath $destRoot -File -Include "*_*.png","*_*.webp" -ErrorAction SilentlyContinue | Where-Object {
  $preserveFiles -notcontains $_.Name
} | Remove-Item -Force

Write-Host "[PrepareAssets] Flattening Characters/**/final_*.png → $destRoot/<Character>_<Type>_<Rarity>.png" -ForegroundColor Yellow
Get-ChildItem -LiteralPath $charactersSrc -Recurse -File -Filter "final_*.png" | ForEach-Object {
  $rarityDir = Split-Path $_.DirectoryName -Leaf
  $typeDir = Split-Path (Split-Path $_.DirectoryName -Parent) -Leaf
  $characterDir = Split-Path (Split-Path (Split-Path $_.DirectoryName -Parent) -Parent) -Leaf

  if([string]::IsNullOrWhiteSpace($characterDir) -or [string]::IsNullOrWhiteSpace($typeDir) -or [string]::IsNullOrWhiteSpace($rarityDir)){
    Write-Warning "Unexpected path structure for $($_.FullName). Skipping."
    return
  }

  $character = $characterDir
  $type = $typeDir
  $rarity = $rarityDir

  if([string]::IsNullOrWhiteSpace($character) -or [string]::IsNullOrWhiteSpace($type) -or [string]::IsNullOrWhiteSpace($rarity)){
    Write-Warning "Missing character/type/rarity for $($_.FullName). Skipping."
    return
  }

  $targetName = "{0}_{1}_{2}.png" -f $character, $type, $rarity
  $targetPath = Join-Path $destRoot $targetName

  Copy-Item -LiteralPath $_.FullName -Destination $targetPath -Force
  Write-Host "  → $targetName" -ForegroundColor DarkGray
}

Write-Host "Flattened card textures to: $destRoot" -ForegroundColor Green

# 카드 뒷면 이미지 유지/복원
foreach($backName in $preserveFiles){
  $backPath = Join-Path $destRoot $backName
  if(-not (Test-Path $backPath)){
    $distCandidate = Join-Path $Root "web/dist/cards/$backName"
    if(Test-Path $distCandidate){
      Copy-Item -LiteralPath $distCandidate -Destination $backPath -Force
      Write-Host "[PrepareAssets] Restored $backName from dist/cards" -ForegroundColor Green
    } else {
      Write-Warning "Card back asset missing and could not be restored: $backName"
    }
  }
}
Write-Host "Tip: Convert to WebP (optional) using ImageMagick or npm run convert:webp" -ForegroundColor Yellow


