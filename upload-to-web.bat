@echo off
chcp 65001 > nul
echo 🌍 מעלה את המשחק שלך לאינטרנט!
echo =====================================
echo.

echo ✅ שלב 1: בדיקת Git...
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git לא נמצא! פותח PowerShell חדש...
    echo 💡 אחרי שGit יעבוד, הפעל שוב את הקובץ הזה
    pause
    exit
)

echo ✅ Git נמצא!
echo.

echo 🔧 שלב 2: אתחול Git והוספת קבצים...
git init
git add .

echo.
echo 📝 שלב 3: יצירת commit ראשון...
git commit -m "🎮 Virtual World Multiplayer Game - Ready for the world!"

echo.
echo 🎯 הפרויקט מוכן להעלאה!
echo.
echo 📋 השלבים הבאים (ידני):
echo.
echo 1. 🌐 יצור חשבון GitHub: https://github.com
echo 2. 📁 צור repository חדש בשם: virtual-world-multiplayer
echo 3. 🔗 העלה את הקוד (הפעל את הפקודות שGitHub נותן)
echo 4. 🚀 כנס ל-Render.com וחבר את הפרויקט מ-GitHub
echo.
echo 🎮 אחרי 10 דקות - המשחק שלך יהיה זמין לכל העולם!
echo.
echo 📖 לפרטים מלאים ראה: UPLOAD-TO-INTERNET.md
echo.
pause