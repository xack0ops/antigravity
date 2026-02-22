@echo off
chcp 65001
echo ========================================================
echo [우리 반 나라] 학생 포털을 설정하고 있습니다...
echo ========================================================
echo.

echo 1. Node.js가 설치되어 있는지 확인 중...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [오류] Node.js를 찾을 수 없습니다!
    echo https://nodejs.org/ 사이트에서 Node.js를 먼저 설치해주세요.
    pause
    exit
)
echo Node.js 확인 완료!
echo.

echo 2. 필요한 도구를 설치하는 중... (1분 정도 걸립니다)
call npm install
if %errorlevel% neq 0 (
    echo [오류] 설치에 실패했습니다. 인터넷 연결을 확인해주세요.
    pause
    exit
)
echo.

echo 3. 앱을 실행합니다!
echo.
echo 아래에 "http://localhost:5173" 같은 주소가 뜨면 성공입니다.
echo 인터넷 창을 켜서 그 주소로 들어가세요.
echo (종료하려면 Ctrl+C를 누르세요)
echo.
call npm run dev
pause
