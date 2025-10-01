@echo off
chcp 65001 >nul
title משחק עולם וירטואלי - שרת מקומי

echo.
echo 🚀 ===== הפעלת שרת משחק מקומי =====
echo.

:: Check if Node.js is installed
echo 🔍 בודק אם Node.js מותקן...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Node.js לא מותקן על המחשב!
    echo.
    echo 📋 מה צריך לעשות:
    echo 1. לך לאתר: https://nodejs.org
    echo 2. הורד את הגרסה LTS (המומלצת)
    echo 3. התקן את התוכנה
    echo 4. הפעל מחדש את המחשב
    echo 5. נסה שוב להריץ את הסקריפט
    echo.
    echo 💡 טיפ: אם התקנת Node.js וזה עדיין לא עובד,
    echo     נסה לסגור ולפתוח מחדש את הטרמינל
    echo.
    pause
    exit /b
)

echo ✅ Node.js נמצא! גרסה:
node --version

:: Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 מתקין חבילות נדרשות...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ שגיאה בהתקנת החבילות
        pause
        exit /b
    )
    echo ✅ החבילות הותקנו בהצלחה
    echo.
)

:: Show network information
echo 🌐 מציג מידע רשת...
node -e "const NetworkUtils = require('./network-utils'); NetworkUtils.displayNetworkInfo(3000);"
echo.

:: Show system information
echo 💻 מציג מידע מערכת...
node -e "const NetworkUtils = require('./network-utils'); NetworkUtils.displaySystemInfo();"
echo.

echo 🎮 מפעיל את השרת...
echo 💡 לעצירת השרת: לחץ Ctrl+C
echo 🌍 לפתיחת המשחק: לחץ על אחד מהקישורים למעלה
echo.

:: Start the server
node server.js

echo.
echo 👋 השרת נסגר
pause