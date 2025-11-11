param(
  [Parameter(Mandatory=$true)] [string]$Root
)

$ErrorActionPreference = "Stop"

$chars = @('Ariana','Darius','Seraphina')
$map = @{
  'Attack'  = '기본 공격.png'
  'Heal'    = '기본 회복.png'
  'Special' = '화염 특수.png'
  'Defense' = '화염 방어.png'
}

foreach($c in $chars){
  $uns = Join-Path $Root ("Cards/Characters/$c/Unassigned")
  $src = Get-ChildItem -LiteralPath $uns -File -Include *.png,*.jpg,*.jpeg -ErrorAction SilentlyContinue | Select-Object -First 1
  if(-not $src){ Write-Warning "No source in $uns"; continue }
  foreach($k in $map.Keys){
    $destDir = Join-Path $Root ("Cards/Characters/$c/$k/Normal")
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
    $dest = Join-Path $destDir $map[$k]
    Copy-Item -LiteralPath $src.FullName -Destination $dest -Force
    Write-Host "Copied -> $dest"
  }
}

Write-Host "Done."
