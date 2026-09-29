# Install a fresh Instagram token everywhere it is needed, without it ever being typed
# into a chat or a file by hand.
#
#   1. Meta app dashboard -> Instagram -> API setup with Instagram login ->
#      Generate token -> Copy
#   2. Right-click this file -> Run with PowerShell   (or: powershell -File update_token.ps1)
#
# Reads the token from the CLIPBOARD, checks it against graph.instagram.com, then writes
# it to .env (IG_ACCESS_TOKEN=) and the GitHub repo secret IG_ACCESS_TOKEN, and triggers
# one "Publish one Reel" run to prove the Action works. Written 2026-09-29 after the token
# silently expired and three scheduled runs failed with code 190.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$tok = (Get-Clipboard | Out-String).Trim()
if ($tok.Length -lt 50 -or $tok -match '\s') { Write-Host "Clipboard does not look like a token. Copy it from the Meta dashboard first." -ForegroundColor Red; exit 1 }

try { $me = Invoke-RestMethod "https://graph.instagram.com/me?fields=user_id,username&access_token=$tok" }
catch { Write-Host "Instagram rejected that token: $($_.Exception.Message)" -ForegroundColor Red; exit 1 }
Write-Host "Token works for @$($me.username)" -ForegroundColor Green

$envPath = Join-Path $PSScriptRoot '.env'
$lines = Get-Content $envPath
$lines = $lines | ForEach-Object { if ($_ -match '^IG_ACCESS_TOKEN=') { "IG_ACCESS_TOKEN=$tok" } else { $_ } }
Set-Content -Path $envPath -Value $lines -Encoding ascii
Write-Host "Updated .env"

$tok | gh secret set IG_ACCESS_TOKEN
Write-Host "Updated GitHub secret IG_ACCESS_TOKEN"
Set-Clipboard -Value ' '                     # do not leave the token sitting on the clipboard
gh workflow run publish-reel.yml | Out-Null
Write-Host "Triggered a test run of 'Publish one Reel' - check: gh run list --limit 1" -ForegroundColor Green
