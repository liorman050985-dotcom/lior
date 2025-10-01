# PowerShell script for starting the virtual world game server
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "משחק עולם וירטואלי - שרת מקומי"

Write-Host ""
Write-Host "🚀 ===== הפעלת שרת משחק מקומי =====" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js זמין: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js לא מותקן על המחשב" -ForegroundColor Red
    Write-Host "📥 הורד מכאן: https://nodejs.org" -ForegroundColor Yellow
    Read-Host "לחץ Enter לסגירה"
    exit
}

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 מתקין חבילות נדרשות..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ שגיאה בהתקנת החבילות" -ForegroundColor Red
        Read-Host "לחץ Enter לסגירה"
        exit
    }
    Write-Host "✅ החבילות הותקנו בהצלחה" -ForegroundColor Green
    Write-Host ""
}

# Show network information
Write-Host "🌐 מציג מידע רשת..." -ForegroundColor Cyan
node -e "const NetworkUtils = require('./network-utils'); NetworkUtils.displayNetworkInfo(3000);"
Write-Host ""

# Show system information
Write-Host "💻 מציג מידע מערכת..." -ForegroundColor Cyan  
node -e "const NetworkUtils = require('./network-utils'); NetworkUtils.displaySystemInfo();"
Write-Host ""

Write-Host "🎮 מפעיל את השרת..." -ForegroundColor Green
Write-Host "💡 לעצירת השרת: לחץ Ctrl+C" -ForegroundColor Yellow
Write-Host "🌍 לפתיחת המשחק: לחץ על אחד מהקישורים למעלה" -ForegroundColor Yellow
Write-Host ""

# Start the server
try {
    node server.js
} catch {
    Write-Host "❌ שגיאה בהפעלת השרת" -ForegroundColor Red
}

Write-Host ""
Write-Host "👋 השרת נסגר" -ForegroundColor Cyan
Read-Host "לחץ Enter לסגירה"