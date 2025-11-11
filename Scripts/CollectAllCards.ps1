$Root = "D:/AI_Projects/Gals"
$OutputDir = Join-Path $Root "Cards/AllCards"

$ErrorActionPreference = "Stop"

# 출력 폴더 초기화(이전 파일 제거 후 생성)
if (Test-Path $OutputDir) {
  Write-Host "Cleaning output directory: $OutputDir" -ForegroundColor DarkCyan
  Get-ChildItem -LiteralPath $OutputDir -File | Remove-Item -Force -ErrorAction SilentlyContinue
} else {
  New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
}

Write-Host "=== Collecting All Cards ===" -ForegroundColor Cyan

$Characters = @('Ariana','Darius','Elder','Elena','Garen','Iris','Kai','Leon','Lucian','Marcus','Mira','Seraphina','Seraphine')
$Types = @('Attack','Heal','Special','Defense')
$Rarities = @('Normal','Rare','Epic','Legendary')

$TotalCopied = 0
$TotalSkipped = 0

foreach($Char in $Characters){
  foreach($Typ in $Types){
    foreach($Rar in $Rarities){
      $sourcePath = Join-Path $Root ("Cards/Characters/{0}/{1}/{2}/final_{2}.png" -f $Char,$Typ,$Rar)
      
      if(Test-Path $sourcePath){
        $destFileName = "{0}_{1}_{2}.png" -f $Char,$Typ,$Rar
        $destPath = Join-Path $OutputDir $destFileName
        
        Copy-Item -LiteralPath $sourcePath -Destination $destPath -Force
        $TotalCopied++
        Write-Host "  Copied: $destFileName" -ForegroundColor Green
      } else {
        $TotalSkipped++
        Write-Host "  Skipped (not found): $Char/$Typ/$Rar" -ForegroundColor Yellow
      }
    }
  }
}

Write-Host "`n=== Complete ===" -ForegroundColor Green
Write-Host "Total copied: $TotalCopied" -ForegroundColor Green
Write-Host "Total skipped: $TotalSkipped" -ForegroundColor Yellow
Write-Host "Output directory: $OutputDir" -ForegroundColor Cyan

