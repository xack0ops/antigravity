@echo off
chcp 65001
echo ========================================================
echo [긴급 수리] 설치 오류 해결 마법사 🧙‍♂️
echo ========================================================
echo.
echo "설치가 멈춰서 답답하셨죠? 제가 싹 청소하고 다시 깔아드릴게요!"
echo.

echo 1. 기존 설치 파일 정리 중... (깨끗하게!)
if exist node_modules (
    rmdir /s /q node_modules
    echo - node_modules 삭제 완료
)
if exist package-lock.json (
    del package-lock.json
    echo - package-lock.json 삭제 완료
)

echo.
echo 2. 캐시 메모리청소 중...
call npm cache clean --force

echo.
echo 3. 도구 다시 설치 시작! (이번엔 될 거예요 🙏)
echo (화면에 글자가 막 지나가도 놀라지 마세요)
echo.
call npm install

if %errorlevel% neq 0 (
    echo.
    echo [ㅠㅠ] 여전히 오류가 발생했습니다.
    echo 인터넷 연결을 확인하거나, 잠시 후 다시 시도해주세요.
    pause
    exit
)

echo.
echo ========================================================
echo [성공] 수리 완료! 🎉
echo 이제 'run_app.bat'을 다시 실행하시면 됩니다.
echo ========================================================
pause
