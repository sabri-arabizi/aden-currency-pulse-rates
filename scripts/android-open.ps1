#!/usr/bin/env pwsh
<#
Runs the common Android workflow for this project (PowerShell).

Usage:
  .\scripts\android-open.ps1

This will run (in order):
  - npm install
  - npm run build
  - npx cap sync android
  - npx cap open android

The script sets -ErrorAction Stop so failures abort the sequence.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Join-Path $PSScriptRoot ".." | Resolve-Path -Relative
Push-Location $root

Write-Host "Running npm install..."
npm install

Write-Host "Building web (npm run build)..."
npm run build

Write-Host "Syncing Capacitor (npx cap sync android)..."
npx cap sync android

Write-Host "Opening Android project (npx cap open android)..."
npx cap open android

Pop-Location

Write-Host "Done." -ForegroundColor Green
