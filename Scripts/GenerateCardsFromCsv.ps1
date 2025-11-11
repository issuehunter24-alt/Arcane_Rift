# Batch-generate cards from CSV
# CSV Columns (header required):
# Illustration,Name,Cost,Effect,Rarity,Attribute,TypeIcon,OutName
# - Illustration: relative to <Root> or absolute; if empty, auto-pick from CardImages
# - Rarity: Normal|Rare|Epic|Legendary -> selects frame_* by Attribute color
# - Attribute: Fire|Ice|Wind|Earth|Light|Dark
# - TypeIcon: relative path to icon (e.g., CardIcons/Type/type_attack.png). If empty, attack icon is used.
# - OutName: filename only; saved into <Root>/Cards/Output/<OutName or auto>

param(
  [Parameter(Mandatory=$true)]
  [string]$Root,
  [Parameter(Mandatory=$true)]
  [string]$CsvPath,
  [string]$OutputDir = "Cards/Output",
  [string]$FontBold = "C:/Windows/Fonts/malgunbd.ttf",
  [string]$FontReg  = "C:/Windows/Fonts/malgun.ttf"
)

$ErrorActionPreference = "Stop"

function Resolve-PathSafe([string]$base,[string]$rel){
  if([System.IO.Path]::IsPathRooted($rel)){ return $rel }
  return (Join-Path $base $rel)
}

$Mag = "C:/Program Files/ImageMagick-7.1.2-Q16-HDRI/magick.exe"
if(-not (Test-Path $Mag)){ throw "magick.exe not found: $Mag" }

$csvResolved = Resolve-PathSafe $Root $CsvPath
if(-not (Test-Path $csvResolved)){ throw "CSV not found: $csvResolved" }

$outBase = Resolve-PathSafe $Root $OutputDir
New-Item -ItemType Directory -Force -Path $outBase | Out-Null

$rows = Import-Csv -LiteralPath $csvResolved
if(-not $rows){ throw "CSV is empty: $csvResolved" }

$frameDir = Join-Path $Root "CardFrames"
$defaultType = Join-Path $Root "CardIcons/Type/type_attack.png"

foreach($row in $rows){
  $ill = if([string]::IsNullOrWhiteSpace($row.Illustration)){
    $d = Join-Path $Root "CardImages"
    (Get-ChildItem -LiteralPath $d -File -Include *.png,*.jpg,*.jpeg | Select-Object -First 1).FullName
  } else { Resolve-PathSafe $Root $row.Illustration }
  if(-not $ill){ Write-Warning "Skip row: no illustration"; continue }

  $rar = $row.Rarity; $attr = $row.Attribute
  $frameName = if($rar -and $attr){ "frame_{0}_{1}.png" -f $rar,$attr } else { $null }
  $frame = if($frameName){ Join-Path $frameDir $frameName } else { $null }
  if(-not (Test-Path $frame)){
    $f = Get-ChildItem -LiteralPath $frameDir -File -Filter "frame_*.png" | Select-Object -First 1
    if(-not $f){ throw "No frames in $frameDir" }
    $frame = $f.FullName
  }

  $typeIcon = if([string]::IsNullOrWhiteSpace($row.TypeIcon)){$defaultType}else{ Resolve-PathSafe $Root $row.TypeIcon }
  if(-not (Test-Path $typeIcon)){ $typeIcon = $defaultType }

  $name   = if($row.Name){ $row.Name } else { "카드" }
  $cost   = if($row.Cost){ [int]$row.Cost } else { 0 }
  $effect = if($row.Effect){ $row.Effect } else { "" }

  $outName = if($row.OutName){ $row.OutName } else { ($name -replace '[\\/:*?"<>|]','_') + ".png" }
  $outPath = Join-Path $outBase $outName

  $args = @(
    "-background","none",
    "(", $ill, "-resize","768x1024^","-gravity","center","-extent","768x1024","+repage", ")",
    "(", $frame, "-resize","768x1024!","+repage", ")",
    "-compose","over","-composite",
    "(", $typeIcon, "-resize","92x92","+repage", ")",
    "-gravity","northwest","-geometry","+56+56","-compose","over","-composite",
    "-font",$FontBold,
    "-gravity","north","-fill","white","-stroke","black","-strokewidth","3","-pointsize","54","-annotate","+0+32",$name,
    "-stroke","none","-fill","white","-pointsize","54","-annotate","+0+32",$name,
    "-fill","#000000CC","-stroke","white","-strokewidth","3","-draw","circle 704,84 736,84",
    "(", "-size","64x64","-background","none","-gravity","center",
        "-font",$FontBold,"-pointsize","42","-fill","white","label:$cost", ")",
    "-gravity","northwest","-geometry","+672+52","-compose","over","-composite",
    "-fill","#00000099","-stroke","#FFFFFF80","-strokewidth","2","-draw","roundrectangle 48,832 720,988 24,24",
    "(", "-size","640x128","-background","none","-gravity","northwest",
        "-font",$FontReg,"-pointsize","28","-fill","white","caption:$effect", ")",
    "-gravity","northwest","-geometry","+66+856","-compose","over","-composite",
    "+repage","-strip","-units","PixelsPerInch","-density","96","-extent","768x1024",
    "PNG32:$outPath"
  )

  & $Mag @args 2>&1 | Out-Null
  if(Test-Path $outPath){
    Write-Host "OK: $outPath"
  } else {
    Write-Warning "FAIL: $outPath"
  }
}


