@echo off
echo 正在設置Supabase本地開發環境...

echo.
echo 1. 安裝Supabase CLI...
npm install -g supabase

echo.
echo 2. 初始化Supabase項目...
supabase init

echo.
echo 3. 啟動Supabase本地服務...
supabase start

echo.
echo 4. 運行數據庫遷移...
supabase db reset

echo.
echo Supabase本地環境設置完成！
echo.
echo 服務地址：
echo - API: http://localhost:54321
echo - Studio: http://localhost:54323
echo - Database: postgresql://postgres:postgres@localhost:54322/postgres
echo.
echo 按任意鍵繼續...
pause





