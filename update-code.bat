@echo off
chcp 65001 > nul
echo 🔄 מעדכן את הקוד באינטרנט...
echo =====================================
echo.

echo ✅ שלב 1: הוספת שינויים...
git add .

echo.
echo 📝 שלב 2: יצירת commit...
git commit -m "🔧 Fix multiplayer Socket.IO for Render - CORS and transport fixes"

echo.
echo 🚀 שלב 3: העלאה ל-GitHub...
git push

echo.
echo ⏳ חכה כ-2 דקות ו-Render יעדכן אוטומטית!
echo 🌐 המשחק שלך: https://lior-kvht.onrender.com/
echo.
echo 🎮 אחרי העדכון - נסה לפתוח 2 טאבים לבדוק מולטיפלייר!
echo.
pause