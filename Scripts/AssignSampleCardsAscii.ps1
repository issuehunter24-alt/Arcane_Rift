param(
  [Parameter(Mandatory=$true)] [string]$Root
)

$ErrorActionPreference = "Stop"

$chars = @('Ariana','Darius','Seraphina')
$map = @{
  'Attack'  = @{ rarity='Normal'; prefix='Attack_Normal' }
  'Heal'    = @{ rarity='Normal'; prefix='Heal_Normal' }
  'Special' = @{ rarity='Normal'; prefix='Special_Normal' }
  'Defense' = @{ rarity='Normal'; prefix='Defense_Normal' }
}

function Get-SceneIndex([string]$name){
  $m = [regex]::Match($name, "_(\d+)\.[A-Za-z0-9]+$")
  if($m.Success){ return [int]$m.Groups[1].Value }
  return 1
}

foreach($c in $chars){
  $charRoot = Join-Path $Root ("Cards/Characters/$c")
  $uns = Join-Path $charRoot "Unassigned"
  $src = Get-ChildItem -LiteralPath $uns -File -Include *.png,*.jpg,*.jpeg -ErrorAction SilentlyContinue | Select-Object -First 1
  if(-not $src){ Write-Warning "No source in $uns"; continue }
  $scene = Get-SceneIndex $src.Name

  $manifest = Join-Path $charRoot "manifest.csv"
  if(-not (Test-Path $manifest)){
    "Type,Rarity,TempFile,OriginalFile" | Set-Content -Path $manifest
  }

  foreach($k in $map.Keys){
    $info = $map[$k]
    $destDir = Join-Path $charRoot ("$k/" + $info.rarity)
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
    $tempName = ("{0}__{1}__scene-{2:000}.png" -f $info.prefix,$c,$scene)
    $dest = Join-Path $destDir $tempName
    Copy-Item -LiteralPath $src.FullName -Destination $dest -Force
    Add-Content -Path $manifest -Value ("{0},{1},{2},{3}" -f $k,$info.rarity,$tempName,$src.Name)
    Write-Host "Copied -> $dest"
  }
}

Write-Host "Done. Manifest written per character."
