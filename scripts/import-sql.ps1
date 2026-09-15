# Import saree-app.sql into local MySQL (Windows PowerShell)
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\scripts\import-sql.ps1
param(
  [string]$SqlFile = "",
  [string]$DbHost = "127.0.0.1",
  [int]$DbPort = 3306,
  [string]$DbName = "saree_app",
  [string]$DbUser = "root",
  [string]$DbPass = "root1234"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
if (-not $SqlFile) { $SqlFile = Join-Path $Root "saree-app.sql" }

if (-not (Test-Path -LiteralPath $SqlFile)) {
  throw "SQL dump not found: $SqlFile"
}

$mysql = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysql) {
  $candidates = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
  )
  foreach ($c in $candidates) {
    if (Test-Path $c) { $mysql = $c; break }
  }
}
if (-not $mysql) { throw "mysql.exe not found in PATH" }

Write-Host "==> Creating database `$DbName` (if missing)..."
& $mysql -h $DbHost -P $DbPort -u $DbUser "-p$DbPass" -e "CREATE DATABASE IF NOT EXISTS ``$DbName`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>$null

Write-Host "==> Importing $SqlFile into `$DbName`..."
$mysqlArgs = "-h $DbHost -P $DbPort -u $DbUser -p$DbPass $DbName"
cmd /c "`"$mysql`" $mysqlArgs < `"$SqlFile`""
if ($LASTEXITCODE -ne 0) { throw "SQL import failed with exit code $LASTEXITCODE" }

Write-Host "==> Verifying counts..."
& $mysql -h $DbHost -P $DbPort -u $DbUser "-p$DbPass" -N $DbName -e "SELECT 'products', COUNT(*) FROM products; SELECT 'categories', COUNT(*) FROM categories; SELECT 'brands', COUNT(*) FROM brands; SELECT 'variants', COUNT(*) FROM variants; SELECT 'users', COUNT(*) FROM users;" 2>$null

Write-Host "==> Done. Restart API if needed."
