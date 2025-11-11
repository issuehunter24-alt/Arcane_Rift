param(
  [string]$Root,
  [string]$OutZip = "dist.zip"
)

$ErrorActionPreference = "Stop"

if(-not $Root -or -not (Test-Path $Root)){
  $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
  $Root = Split-Path -Parent $scriptDir
}

$webDir = Join-Path $Root "web"
$distDir = Join-Path $webDir "dist"
$zipPath = Join-Path $webDir $OutZip

# Ensure Node in PATH if installed in Program Files
$nodeDir = "C:\Program Files\nodejs"
if(Test-Path $nodeDir){ $env:Path = $nodeDir + ";" + $env:Path }

Push-Location $webDir
try {
  & npm i --no-fund --no-audit
  & npm run assets
  & npm run build
  if(Test-Path $zipPath){ Remove-Item -Force $zipPath }
  if(Test-Path $distDir){
    Compress-Archive -Path (Join-Path $distDir '*') -DestinationPath $zipPath -Force
    Write-Host "Built and zipped: $zipPath" -ForegroundColor Green
  } else {
    throw "dist not found: $distDir"
  }
}
finally {
  Pop-Location
}


