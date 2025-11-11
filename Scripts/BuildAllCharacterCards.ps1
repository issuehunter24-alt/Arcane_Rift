$Root = "D:/AI_Projects/Gals"
$Mag = "C:/Program Files/ImageMagick-7.1.2-Q16-HDRI/magick.exe"

$ErrorActionPreference = "Stop"

if(-not (Test-Path $Mag)){ throw "magick.exe not found: $Mag" }

$FontBold = "C:/Windows/Fonts/malgunbd.ttf"
$FontReg = "C:/Windows/Fonts/malgun.ttf"
if(-not (Test-Path $FontBold)){ $FontBold = "C:/Windows/Fonts/arialbd.ttf"; $FontReg = "C:/Windows/Fonts/arial.ttf" }

$CharacterMap = @{
  'Ariana' = 'Ariana_Drake'
  'Darius' = 'Darius_Blackwood'
  'Elder' = 'Elder_Belmont'
  'Elena' = 'Elena_Drake'
  'Garen' = 'Garen_Stone'
  'Iris' = 'Iris_Belmont'
  'Kai' = 'Kai_Drake'
  'Leon' = 'Leon_Ardenia'
  'Lucian' = 'Lucian_Rosegarden'
  'Marcus' = 'Marcus_Belmont'
  'Mira' = 'Mira'
  'Seraphina' = 'Seraphina_Belmont'
  'Seraphine' = 'Seraphine_Winters'
}

$Characters = @('Ariana','Darius','Elder','Elena','Garen','Iris','Kai','Leon','Lucian','Marcus','Mira','Seraphina','Seraphine')
$Types = @('Attack','Heal','Special','Defense')
$Rarities = @('Normal','Rare','Epic','Legendary')

$Icons = @{
  'Attack' = 'CardIcons/Type/type_attack.png'
  'Heal' = 'CardIcons/Type/type_heal.png'
  'Special' = 'CardIcons/Type/type_special.png'
  'Defense' = 'CardIcons/Type/type_defense.png'
}

$TypeCodeMap = @{
  'Attack'  = 'ATT'
  'Heal'    = 'HEA'
  'Special' = 'SPE'
  'Defense' = 'DEF'
}

$RarityCodeMap = @{
  'Normal'    = 'NO'
  'Rare'      = 'RA'
  'Epic'      = 'EP'
  'Legendary' = 'LE'
}

$TypeNameByCode = @{
  'ATT' = 'Attack'
  'HEA' = 'Heal'
  'SPE' = 'Special'
  'DEF' = 'Defense'
}

$RarityNameByCode = @{
  'NO' = 'Normal'
  'RA' = 'Rare'
  'EP' = 'Epic'
  'LE' = 'Legendary'
}

$CharacterCodes = @{
  'Ariana'    = 'ARIANA'
  'Darius'    = 'DARIUS'
  'Elder'     = 'ELDER'
  'Elena'     = 'ELENA'
  'Garen'     = 'GAREN'
  'Iris'      = 'IRIS'
  'Kai'       = 'KAI'
  'Leon'      = 'LEON'
  'Lucian'    = 'LUCIAN'
  'Marcus'    = 'MARCUS'
  'Mira'      = 'MIRA'
  'Seraphina' = 'SERAPHINA'
  'Seraphine' = 'SERAPHINE'
}

$cardsPath = Join-Path $Root 'web/public/data/cards.json'
if(-not (Test-Path $cardsPath)){
  throw "cards.json not found: $cardsPath"
}

$cardsJson = Get-Content -LiteralPath $cardsPath -Raw -Encoding UTF8 | ConvertFrom-Json
$CardLookup = @{}
foreach($card in $cardsJson){
  if(-not $card.id){ continue }
  $parts = $card.id -split '_'
  if($parts.Length -lt 3){ continue }
  $typeCode = $parts[0]
  $charCode = $parts[1]
  $rarCode = $parts[2]

  $typeName = $TypeNameByCode[$typeCode]
  $rarName = $RarityNameByCode[$rarCode]
  if(-not $typeName -or -not $rarName){ continue }

  $key = "{0}|{1}|{2}" -f $charCode,$typeName,$rarName
  $CardLookup[$key] = $card
}

function Get-EffectTextForCard($card){
  if($card.PSObject.Properties.Name -contains 'effectText'){
    $text = [string]$card.effectText
    if(-not [string]::IsNullOrWhiteSpace($text)){
      $clean = ($text -replace "\r","" -replace "\n"," ")
      return $clean.Trim()
    }
  }

  $effects = @()
  foreach($eff in $card.effects){
    if($eff.type){
      $effects += $eff.type
    }
  }

  if($effects.Count -eq 0){
    return '효과 정보 없음'
  }

  return ($effects -join ', ')
}

function Get-Frame([string]$rarity){
  $p = Join-Path $Root ("CardFrames/frame_{0}_Dark.png" -f $rarity)
  if(Test-Path $p){ return $p }
  $f = Get-ChildItem -LiteralPath (Join-Path $Root 'CardFrames') -File -Filter ("frame_{0}_*.png" -f $rarity) | Select-Object -First 1
  if($f){ return $f.FullName }
  return (Get-ChildItem -LiteralPath (Join-Path $Root 'CardFrames') -File -Filter 'frame_*.png' | Select-Object -First 1).FullName
}

# 캐릭터 인덱스를 얻는 함수
function Get-CharacterIndex([string]$charName){
  return [Array]::IndexOf($Characters, $charName)
}

# 성별 그룹 (여성 우선 증가, 남성은 부족 시 종류 축소)
$FemaleCharacters = @('Ariana','Elena','Iris','Mira','Seraphina','Seraphine')
$MaleCharacters = @('Darius','Elder','Garen','Kai','Leon','Lucian','Marcus')

$TotalCards = 0
$charIdx = 0
foreach($Char in $Characters){
  Write-Host "`n=== Processing $Char ===" -ForegroundColor Cyan
  
  $CharPrefix = $CharacterMap[$Char]
  if(-not $CharPrefix){ Write-Warning "No mapping for $Char"; continue }
  
  $imgDir = Join-Path $Root "CardImages"
  # 캐릭터별 사용 가능한 이미지 풀 (이름순 정렬)
  $pool = Get-ChildItem -LiteralPath $imgDir -File -Include *.png,*.jpg,*.jpeg |
          Where-Object { $_.BaseName -like ($CharPrefix + "*") } |
          Sort-Object Name
  
  if($pool.Count -eq 0){ Write-Warning "No images for $Char"; continue }
  
  Write-Host "Found $($pool.Count) images for $Char"
  
  # 카드 조합 구성
  $typesForChar = $Types
  $raritiesForChar = $Rarities
  $fullNeed = $typesForChar.Count * $raritiesForChar.Count

  if($pool.Count -lt $fullNeed){
    if($FemaleCharacters -contains $Char){
      # 여성: 중복 생성 금지, 가능한 개수만 생성 (조합 일부만 생성)
      Write-Warning "[$Char] images=$($pool.Count) < need=$fullNeed → will generate up to available without duplicates."
      # 조합은 그대로, 루프 내에서 idx가 풀 개수를 초과하면 중단
    } else {
      # 남성: 카드 종류(Types) 축소하여 중복 없이 생성
      $rarCnt = $raritiesForChar.Count
      $maxTypes = [Math]::Max(1, [Math]::Floor($pool.Count / $rarCnt))
      if($maxTypes -lt $typesForChar.Count){
        $typesForChar = $typesForChar[0..($maxTypes-1)]
        Write-Warning "[$Char] images=$($pool.Count) < need=$fullNeed → reduce types to $($typesForChar -join ', ')."
      }
      # 여전히 모자라면 루프에서 중단
    }
  } else {
    # 충분하면 정확히 필요한 수만 사용
    $pool = $pool[0..($fullNeed-1)]
  }
  
  $idx = 0
  foreach($rar in $raritiesForChar){
    $frame = Get-Frame $rar
    foreach($typ in $typesForChar){
      if($idx -ge $pool.Count){ break }
      $src = $pool[$idx]
      $idx++
      
      $dir = Join-Path $Root ("Cards/Characters/{0}/{1}/{2}" -f $Char,$typ,$rar)
      New-Item -ItemType Directory -Force -Path $dir -ErrorAction SilentlyContinue | Out-Null
      
      $icon = Join-Path $Root $Icons[$typ]
      if(-not (Test-Path $icon)){ Write-Warning "Icon not found: $icon"; continue }
      
      $charCode = $CharacterCodes[$Char]
      if(-not $charCode){
        Write-Warning "No character code for $Char"
        continue
      }

      $cardKey = "{0}|{1}|{2}" -f $charCode,$typ,$rar
      $cardInfo = $CardLookup[$cardKey]
      if(-not $cardInfo){
        Write-Warning "Card data missing: $cardKey"
        continue
      }

      $name = [string]$cardInfo.name
      if([string]::IsNullOrWhiteSpace($name)){
        $name = "$Char $typ $rar"
      }

      $cost = 0
      if($cardInfo.PSObject.Properties.Name -contains 'cost'){
        $cost = [int]$cardInfo.cost
      }

      $eff = Get-EffectTextForCard $cardInfo
      $eff = $eff -replace "`r","" -replace "`n"," " -replace '"',"'" 
      $eff = $eff.Trim()
      if($eff.Length -gt 160){
        $eff = $eff.Substring(0,157) + '...'
      }

      $out = Join-Path $dir ("final_{0}.png" -f $rar)
      
      Write-Host "  -> ${typ}/${rar}: $name (이미지: $($src.Name))"
      
      $args = @(
        "-background","none",
        "(", $src.FullName, "-resize","768x1024^","-gravity","center","-extent","768x1024","+repage", ")",
        "(", $frame, "-resize","768x1024!","+repage", ")",
        "-compose","over","-composite",
        "(", $icon, "-resize","92x92","+repage", ")",
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
            "-font",$FontReg,"-pointsize","28","-fill","white","caption:$eff", ")",
        "-gravity","northwest","-geometry","+66+856","-compose","over","-composite",
        "+repage","-strip","-units","PixelsPerInch","-density","96","-gravity","center","-extent","768x1024",
        "PNG32:$out"
      )
      
      & $Mag $args 2>&1 | Out-Null
      
      if(Test-Path $out){
        $TotalCards++
        Write-Host "    OK: $out" -ForegroundColor Green
      } else {
        Write-Warning "Failed: $out"
      }
    }
  }
  $charIdx++
}

Write-Host "`n=== Complete ===" -ForegroundColor Green
Write-Host "Total cards generated: $TotalCards"
