# Organize images by character and create card folder skeleton
# Creates: Cards/Characters/<Character>/{Attack,Heal,Special,Defense}/{Normal,Rare,Epic,Legendary}
# Copies source images to each character's Unassigned folder for later manual assignment.

param(
  [Parameter(Mandatory=$true)] [string]$Root
)

$ErrorActionPreference = "Stop"

$src = Join-Path $Root "CardImages"
$dst = Join-Path $Root "Cards/Characters"
New-Item -ItemType Directory -Force -Path $dst | Out-Null

$types = @("Attack","Heal","Special","Defense")
$rarities = @("Normal","Rare","Epic","Legendary")

# group files by character prefix (before first underscore)
$files = Get-ChildItem -LiteralPath $src -File -Include *.png,*.jpg,*.jpeg -ErrorAction SilentlyContinue
if(-not $files){ throw "No images in $src" }

$byChar = $files | Group-Object {
  ($_.BaseName -split "_")[0]
}

foreach($grp in $byChar){
  $char = $grp.Name
  $charRoot = Join-Path $dst $char
  New-Item -ItemType Directory -Force -Path $charRoot | Out-Null

  foreach($t in $types){
    foreach($r in $rarities){
      New-Item -ItemType Directory -Force -Path (Join-Path $charRoot (Join-Path $t $r)) | Out-Null
    }
  }

  $uns = Join-Path $charRoot "Unassigned"
  New-Item -ItemType Directory -Force -Path $uns | Out-Null

  foreach($f in $grp.Group){
    $target = Join-Path $uns ($f.Name)
    Copy-Item -LiteralPath $f.FullName -Destination $target -Force
  }
  Write-Host "Prepared character: $char (copied $($grp.Group.Count) images to Unassigned)"
}

Write-Host "Done. Structure at: $dst"


