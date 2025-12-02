#!/usr/bin/env pwsh
<#
Creates a Desktop shortcut that launches scripts\android-open.ps1

Usage (PowerShell admin or with ExecutionPolicy allowed):
  .\scripts\create-desktop-shortcut.ps1

This script creates a .lnk on the current user's Desktop named
"Open Android Project - Aden Currency Pulse Rates.lnk" that runs PowerShell
and executes the helper script with bypassed execution policy.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRel = Join-Path $PSScriptRoot "android-open.ps1"
$scriptFull = Resolve-Path $scriptRel -ErrorAction Stop

$desktop = [Environment]::GetFolderPath('Desktop')
$linkPath = Join-Path $desktop 'Open Android Project - Aden Currency Pulse Rates.lnk'

$wsh = New-Object -ComObject WScript.Shell
$link = $wsh.CreateShortcut($linkPath)

$link.TargetPath = (Get-Command powershell.exe).Source
$args = "-NoProfile -ExecutionPolicy Bypass -File `"$scriptFull`""
$link.Arguments = $args
$link.WorkingDirectory = (Resolve-Path "$(Join-Path $PSScriptRoot '..')").Path
$link.Description = 'Build + sync + open Android project for Aden Currency Pulse Rates'

# Optional: leave IconLocation blank so default is used.
# $link.IconLocation = 'C:\Path\To\Android\Studio\bin\studio64.exe,0'

$link.Save()

Write-Host "Shortcut created on Desktop: $linkPath" -ForegroundColor Green
