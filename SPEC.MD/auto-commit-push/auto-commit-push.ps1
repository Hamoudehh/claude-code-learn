$ErrorActionPreference = 'Stop'
if ($env:CLAUDE_PROJECT_DIR) { Set-Location $env:CLAUDE_PROJECT_DIR }

git add -A
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) { exit 0 }

$files = (git diff --cached --name-only | Select-Object -First 5) -join ', '
git commit -q -m "Auto: update $files"
git push -q
