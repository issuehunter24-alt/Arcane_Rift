# Requires: ImageMagick 7 (magick.exe)
# Usage examples:
#   pwsh -File Scripts/GenerateCard.ps1 -Root "D:/AI_Projects/Gals" -CardName "화염 베기" -Cost 3 -Effect "12 피해. 대상이 화상 상태이면 추가로 8 피해를 줍니다." -TypeIcon "CardIcons/Type/type_attack.png" -Frame "CardFrames/frame_Epic_Dark.png"
#   pwsh -File Scripts/GenerateCard.ps1 -Root "D:/AI_Projects/Gals" -IllPath "CardImages/sample.png" -OutPath "Preview/card_sample.png"

param(
  [Parameter(Mandatory=$true)]
  [string]$Root,

  [string]$CardName = "화염 베기",
  [int]$Cost = 3,
  [string]$Effect = "12 피해. 대상이 화상 상태이면 추가로 8 피해를 줍니다.",

  [string]$IllPath,               # Optional; auto-pick if empty
  [string]$Frame = "CardFrames/frame_Epic_Dark.png",
  [string]$TypeIcon = "CardIcons/Type/type_attack.png",
  [string]$OutPath = "Preview/card_sample.png",

  # Fonts (set paths if you need specific fonts); leave empty to use system default
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

$illResolved = if([string]::IsNullOrWhiteSpace($IllPath)){
  $d = Join-Path $Root "CardImages"
  $f = Get-ChildItem -LiteralPath $d -File -Include *.png,*.jpg,*.jpeg -ErrorAction SilentlyContinue | Select-Object -First 1
  if(-not $f){ throw "No illustration found under $(Join-Path $Root 'CardImages')" }
  $f.FullName
} else { Resolve-PathSafe $Root $IllPath }

$frameResolved = Resolve-PathSafe $Root $Frame
if(-not (Test-Path $frameResolved)){
  $cand = Get-ChildItem -LiteralPath (Join-Path $Root "CardFrames") -File -Filter "frame_*.png" -ErrorAction SilentlyContinue | Select-Object -First 1
  if(-not $cand){ throw "No frame found in $(Join-Path $Root 'CardFrames')" }
  $frameResolved = $cand.FullName
}

$typeResolved = Resolve-PathSafe $Root $TypeIcon
if(-not (Test-Path $typeResolved)){
  throw "Type icon not found: $TypeIcon"
}

$outResolved = Resolve-PathSafe $Root $OutPath
$outDir = Split-Path $outResolved -Parent
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# Build command args
$args = @(
  "-background","none",
  "(", $illResolved, "-resize","768x1024^","-gravity","center","-extent","768x1024","+repage", ")",
  "(", $frameResolved, "-resize","768x1024!","+repage", ")",
  "-compose","over","-composite",

  "(", $typeResolved, "-resize","92x92","+repage", ")",
  "-gravity","northwest","-geometry","+56+56","-compose","over","-composite",

  # Title (Korean default fonts)
  "-font",$FontBold,
  "-gravity","north","-fill","white","-stroke","black","-strokewidth","3","-pointsize","54","-annotate","+0+32",$CardName,
  "-stroke","none","-fill","white","-pointsize","54","-annotate","+0+32",$CardName,

  # Cost badge + centered number
  "-fill","#000000CC","-stroke","white","-strokewidth","3","-draw","circle 704,84 736,84",
  "(", "-size","64x64","-background","none","-gravity","center",
      "-font",$FontBold,"-pointsize","42","-fill","white","label:$Cost", ")",
  "-gravity","northwest","-geometry","+672+52","-compose","over","-composite",

  # Effect box + caption text
  "-fill","#00000099","-stroke","#FFFFFF80","-strokewidth","2","-draw","roundrectangle 48,832 720,988 24,24",
  "(", "-size","640x128","-background","none","-gravity","northwest",
      "-font",$FontReg,"-pointsize","28","-fill","white","caption:$Effect", ")",
  "-gravity","northwest","-geometry","+66+856","-compose","over","-composite",

  "+repage","-strip","-units","PixelsPerInch","-density","96","-extent","768x1024",
  "PNG32:$outResolved"
)

# Execute
& $Mag @args 2>&1 | Out-Host

if(Test-Path $outResolved){
  & $Mag identify -format "Card generated %wx%h -> $outResolved`n" $outResolved
} else {
  Write-Error "Failed to generate card: $outResolved"
}


