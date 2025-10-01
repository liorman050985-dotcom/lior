@echo off
chcp 65001 >nul
title בדיקת רשת - עולם וירטואלי

echo.
echo 🔧 ===== בדיקת רשת מהירה =====
echo.

:: Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js לא זמין
    pause
    exit /b
)

:: Check if network-utils exists
if not exist "network-utils.js" (
    echo ❌ קובץ network-utils.js לא נמצא
    pause
    exit /b
)

:: Run quick network test
echo 🧪 מריץ בדיקת רשת...
node test-network.js quick

echo.
echo 💡 לבדיקה מקיפה: node test-network.js
echo 📖 לעזרה מלאה: עיין בקובץ LOCALHOST-GUIDE.md
echo.
pause