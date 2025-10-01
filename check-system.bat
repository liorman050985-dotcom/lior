@echo off
chcp 65001 >nul
title בדיקת מערכת - אבחון בעיות

echo.
echo 🔧 ===== בדיקת מערכת =====
echo.

echo 📁 תיקיית עבודה נוכחית:
echo %CD%
echo.

echo 📋 קבצים בתיקייה:
dir /b
echo.

echo 🔍 בדיקת Node.js:
where node 2>nul
if %errorlevel% equ 0 (
    echo ✅ Node.js נמצא במיקום:
    where node
    echo 📊 גרסה:
    node --version
) else (
    echo ❌ Node.js לא נמצא ב-PATH של המערכת
    echo.
    echo 💡 דברים לבדוק:
    echo 1. האם Node.js מותקן? בדוק בתפריט התחל
    echo 2. האם סגרת ופתחת מחדש את הטרמינל אחרי התקנה?
    echo 3. האם התקנת כמנהל?
)
echo.

echo 🔍 בדיקת npm:
where npm 2>nul
if %errorlevel% equ 0 (
    echo ✅ npm נמצא
    npm --version
) else (
    echo ❌ npm לא נמצא
)
echo.

echo 📦 בדיקת תיקיית node_modules:
if exist "node_modules" (
    echo ✅ תיקיית node_modules קיימת
) else (
    echo ❌ תיקיית node_modules לא קיימת - צריך להריץ npm install
)
echo.

echo 📄 בדיקת קבצי פרויקט חשובים:
if exist "package.json" (echo ✅ package.json) else (echo ❌ package.json חסר)
if exist "server.js" (echo ✅ server.js) else (echo ❌ server.js חסר)
if exist "game (2).html" (echo ✅ game ^(2^).html) else (echo ❌ game ^(2^).html חסר)
if exist "network-utils.js" (echo ✅ network-utils.js) else (echo ❌ network-utils.js חסר)
if exist "network-config.json" (echo ✅ network-config.json) else (echo ❌ network-config.json חסר)
echo.

echo 🎯 מסקנה:
if exist "node_modules" (
    if exist "server.js" (
        where node >nul 2>&1
        if %errorlevel% equ 0 (
            echo ✅ הכל מוכן! נסה להריץ: node server.js
        ) else (
            echo ❌ Node.js לא מותקן או לא זמין
        )
    ) else (
        echo ❌ קובץ server.js חסר
    )
) else (
    echo ⚠️ צריך להריץ npm install קודם
)

echo.
echo ===================================
echo.
pause