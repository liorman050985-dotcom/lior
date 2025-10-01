param(
    [switch]$SkipChecks
)

# Set console encoding and title
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "משחק עולם וירטואלי - שרת"

Write-Host ""
Write-Host "🚀 ===== הפעלת שרת משחק =====" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-Command($command) {
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Check Node.js
Write-Host "🔍 בודק Node.js..." -ForegroundColor Yellow

if (-not (Test-Command "node")) {
    Write-Host ""
    Write-Host "❌ Node.js לא מותקן או לא נמצא!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 מה לעשות:" -ForegroundColor Yellow
    Write-Host "1. לך לאתר: https://nodejs.org" -ForegroundColor White
    Write-Host "2. הורד את הגרסה LTS (המומלצת)" -ForegroundColor White
    Write-Host "3. התקן את התוכנה (כמנהל)" -ForegroundColor White
    Write-Host "4. הפעל מחדש את המחשב" -ForegroundColor White
    Write-Host "5. נסה שוב" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 טיפ: אחרי התקנה, סגור ופתח מחדש את PowerShell" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "לחץ Enter לסגירה"
    exit
}

$nodeVersion = node --version
Write-Host "✅ Node.js נמצא! גרסה: $nodeVersion" -ForegroundColor Green

# Check npm
if (-not (Test-Command "npm")) {
    Write-Host "❌ npm לא נמצא!" -ForegroundColor Red
    Read-Host "לחץ Enter לסגירה"
    exit
}

# Check project files
Write-Host ""
Write-Host "📁 בודק קבצי פרויקט..." -ForegroundColor Yellow

$requiredFiles = @(
    "package.json",
    "server.js",
    "game (2).html"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ קבצים חסרים:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "   - $file" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "וודא שאתה בתיקיית הפרויקט הנכונה" -ForegroundColor Yellow
    Read-Host "לחץ Enter לסגירה"
    exit
}

Write-Host "✅ כל הקבצים הנדרשים קיימים" -ForegroundColor Green

# Check node_modules
if (-not (Test-Path "node_modules") -and -not $SkipChecks) {
    Write-Host ""
    Write-Host "📦 מתקין חבילות..." -ForegroundColor Yellow
    
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            throw "npm install failed"
        }
        Write-Host "✅ החבילות הותקנו בהצלחה" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ שגיאה בהתקנת החבילות" -ForegroundColor Red
        Write-Host "נסה להריץ ידנית: npm install" -ForegroundColor Yellow
        Read-Host "לחץ Enter לסגירה"
        exit
    }
}

# Start the server
Write-Host ""
Write-Host "🎮 מפעיל את השרת..." -ForegroundColor Green
Write-Host "💡 לעצירת השרת: לחץ Ctrl+C" -ForegroundColor Yellow
Write-Host ""

try {
    # Try to start with network utils first
    if (Test-Path "network-utils.js") {
        Write-Host "🌐 מציג מידע רשת..." -ForegroundColor Cyan
        node -e "
            try {
                const NetworkUtils = require('./network-utils');
                NetworkUtils.displayNetworkInfo(3000);
                console.log('');
                console.log('🎯 השרת עולה...');
            } catch(e) {
                console.log('⚠️  לא ניתן להציג מידע רשת:', e.message);
            }
        "
    }
    
    # Start the server
    node server.js
}
catch {
    Write-Host ""
    Write-Host "❌ שגיאה בהפעלת השרת" -ForegroundColor Red
    Write-Host "פרטים: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "👋 השרת נסגר" -ForegroundColor Cyan
Read-Host "לחץ Enter לסגירה"