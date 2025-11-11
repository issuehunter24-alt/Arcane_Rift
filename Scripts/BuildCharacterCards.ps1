param(
  [Parameter(Mandatory=$true)] [string]$Root
)

$ErrorActionPreference = "Stop"

$Mag = "C:/Program Files/ImageMagick-7.1.2-Q16-HDRI/magick.exe"
if(-not (Test-Path $Mag)){ throw "magick.exe not found: $Mag" }

$chars = @('Ariana','Darius','Seraphina')
$types = @(
  @{ key='Attack';  icon='CardIcons/Type/type_attack.png';  name='기본 공격'; cost=1; effect='적 HP -20' },
  @{ key='Heal';    icon='CardIcons/Type/type_heal.png';    name='기본 회복'; cost=1; effect='HP +20' },
  @{ key='Special'; icon='CardIcons/Type/type_special.png'; name='화염 특수'; cost=2; effect='공격력 +20% (2턴)' },
  @{ key='Defense'; icon='CardIcons/Type/type_defense.png'; name='화염 방어'; cost=2; effect='적 공격 -30%, 내 방어 1.5배' }
)

$frameFallback = Join-Path $Root "CardFrames/frame_Epic_Dark.png"
if(-not (Test-Path $frameFallback)){
  $f = Get-ChildItem -LiteralPath (Join-Path $Root 'CardFrames') -File -Filter 'frame_*.png' | Select-Object -First 1
  if(-not $f){ throw 'No frames found' }
  $frameFallback = $f.FullName
}

foreach($c in $chars){
  foreach($t in $types){
    $imgDir = Join-Path $Root ("Cards/Characters/{0}/{1}/Normal" -f $c,$t.key)
    if(-not (Test-Path $imgDir)){ continue }
    $img = Get-ChildItem -LiteralPath $imgDir -File -Include *.png,*.jpg,*.jpeg | Select-Object -First 1
    if(-not $img){ continue }

    $icon = Join-Path $Root $t.icon
    if(-not (Test-Path $icon)){ continue }

    $frame = $frameFallback
    $out = Join-Path $imgDir ("final_{0}.png" -f $t.key)

    & $Mag @(
      "-background","none",
      "(", $img.FullName, "-resize","768x1024^","-gravity","center","-extent","768x1024","+repage", ")",
      "(", $frame, "-resize","768x1024!","+repage", ")",
      "-compose","over","-composite",
      "(", $icon, "-resize","92x92","+repage", ")",
      "-gravity","northwest","-geometry","+56+56","-compose","over","-composite",
      "-font","C:/Windows/Fonts/malgunbd.ttf",
      "-gravity","north","-fill","white","-stroke","black","-strokewidth","3","-pointsize","54","-annotate","+0+32",$t.name,
      "-stroke","none","-fill","white","-pointsize","54","-annotate","+0+32",$t.name,
      "-fill","#000000CC","-stroke","white","-strokewidth","3","-draw","circle 704,84 736,84",
      "(", "-size","64x64","-background","none","-gravity","center",
          "-font","C:/Windows/Fonts/malgunbd.ttf","-pointsize","42","-fill","white","label:$($t.cost)", ")",
      "-gravity","northwest","-geometry","+672+52","-compose","over","-composite",
      "-fill","#00000099","-stroke","#FFFFFF80","-strokewidth","2","-draw","roundrectangle 48,832 720,988 24,24",
      "(", "-size","640x128","-background","none","-gravity","northwest",
          "-font","C:/Windows/Fonts/malgun.ttf","-pointsize","28","-fill","white","caption:$($t.effect)", ")",
      "-gravity","northwest","-geometry","+66+856","-compose","over","-composite",
      "+repage","-strip","-units","PixelsPerInch","-density","96","-extent","768x1024",
      "PNG32:$out"
    ) 2>&1 | Out-Null

    if(Test-Path $out){ Write-Host "Generated: $out" } else { Write-Warning "Failed: $out" }
  }
}

Write-Host "Done."
