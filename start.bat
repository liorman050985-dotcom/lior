@echo off
echo ==========================================
echo    🎮 משחק העולם הוירטואלי - אונליין 🌍
echo ==========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js לא מותקן!
    echo 📥 הורד מ: https://nodejs.org
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 מתקין תלויות...
    npm install
    if errorlevel 1 (
        echo ❌ שגיאה בהתקנת תלויות
        pause
        exit /b 1
    )
)

echo 🚀 מפעיל את השרת...
echo 📱 המשחק יהיה זמין ב: http://localhost:3000
echo 🌍 שתף את הקישור עם חברים למשחק מרובה משתתפים!
echo.
echo ⏹️  לעצירת השרת לחץ Ctrl+C
echo.

node server.js

pause