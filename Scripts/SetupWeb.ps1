param(
  [string]$Root
)

$ErrorActionPreference = "Stop"

# Auto-detect project root if not provided
if(-not $Root -or -not (Test-Path $Root)){
  $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
  $Root = Split-Path -Parent $scriptDir
}

$webDir = Join-Path $Root "web"

# Ensure Node/npm in PATH for this session if installed in Program Files
$nodeDir = "C:\Program Files\nodejs"
if(Test-Path $nodeDir){ $env:Path = $nodeDir + ";" + $env:Path }

Push-Location $webDir
try {
  & npm i --no-fund --no-audit
  & npm run assets
  Write-Host "Web setup complete. You can run 'npm run dev' or 'npm run build'." -ForegroundColor Green
}
finally {
  Pop-Location
}


