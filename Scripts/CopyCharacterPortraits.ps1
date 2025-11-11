# 캐릭터 원본 일러스트를 web/public/characters/ 폴더로 복사

$Root = "D:/AI_Projects/Gals"
$SourceDir = Join-Path $Root "CardImages"
$DestDir = Join-Path $Root "web/public/characters"

$ErrorActionPreference = "Stop"

# 출력 폴더 생성
New-Item -ItemType Directory -Force -Path $DestDir -ErrorAction SilentlyContinue | Out-Null

Write-Host "=== Copying Character Portraits ===" -ForegroundColor Cyan
Write-Host "Source: $SourceDir"
Write-Host "Destination: $DestDir`n"

# 각 캐릭터별로 대표 이미지 선택
$CharacterPortraits = @{
    # Stage 1: Lucian
    'lucian_rosegarden.png' = 'Lucian_Rosegarden_1.png'
    
    # Stage 2: Ariana (질투스러운 모습)
    'ariana_drake.png' = 'Ariana_Drake_질투스러운 모습_1.png'
    
    # Stage 3: Elena (Seraphine Winters 역할)
    'elena_drake.png' = 'Elena_Drake_1.png'
    
    # Stage 4: Leon Ardenia
    'leon_ardenia.png' = 'Leon_Ardenia_1.png'
    
    # Stage 5: Iris Belmont
    'iris_belmont.png' = 'Iris_Belmont_1.png'
    
    # Stage 6: Ariana & Elena (이미 위에 있음)
    
    # Stage 7: Garen Stone
    'garen_stone.png' = 'Garen_Stone_1.png'
    
    # Stage 8: Marcus Belmont
    'marcus_belmont.png' = 'Marcus_Belmont_1.png'
    
    # Stage 9: Darius Blackwood (위협하는 모습)
    'darius_blackwood.png' = 'Darius_Blackwood_위협하는 모습_1.png'
    
    # Stage 10: Elder Belmont
    'elder_belmont.png' = 'Elder_Belmont_1.png'
    
    # 추가 캐릭터
    'kai_drake.png' = 'Kai_Drake_1.png'
    'seraphina_belmont.png' = 'Seraphina_Belmont_우아한 귀족 포즈_1.png'
    'seraphine_winters.png' = 'Seraphine_Winters_1.png'
    'mira.png' = 'Mira_1.png'
}

$CopiedCount = 0
$ErrorCount = 0

foreach($dest in $CharacterPortraits.Keys){
    $srcFileName = $CharacterPortraits[$dest]
    $srcPath = Join-Path $SourceDir $srcFileName
    $destPath = Join-Path $DestDir $dest
    
    if(Test-Path $srcPath){
        Copy-Item -LiteralPath $srcPath -Destination $destPath -Force
        if(Test-Path $destPath){
            Write-Host "✓ $dest" -ForegroundColor Green
            $CopiedCount++
        } else {
            Write-Host "✗ Failed to copy: $dest" -ForegroundColor Red
            $ErrorCount++
        }
    } else {
        Write-Host "✗ Source not found: $srcFileName" -ForegroundColor Red
        $ErrorCount++
    }
}

Write-Host "`n=== Complete ===" -ForegroundColor Green
Write-Host "Copied: $CopiedCount files"
if($ErrorCount -gt 0){
    Write-Host "Errors: $ErrorCount files" -ForegroundColor Red
}

