@echo off
title City Admin Server - لوحة تحكم المدن
cd /d "%~dp0"
echo ============================================
echo   تشغيل خادم لوحة تحكم المدن...
echo   اضغط Ctrl+C لإيقاف الخادم
echo ============================================
node serve-city-admin.cjs
pause