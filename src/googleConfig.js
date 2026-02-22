// ====================================================
// Google Sheets API 설정
// ====================================================
// 아래 GOOGLE_CLIENT_ID에 Google Cloud Console에서 발급받은
// OAuth 2.0 클라이언트 ID를 붙여넣으세요.
//
// 발급 방법:
// 1. https://console.cloud.google.com 접속
// 2. APIs & Services > Library > "Google Sheets API" 활성화
// 3. APIs & Services > Credentials > "OAuth 2.0 클라이언트 ID" 생성
//    - 유형: 웹 애플리케이션
//    - 승인된 JavaScript 출처: http://localhost:5173 (개발)
//                             (배포 도메인도 추가 필요)
// 4. 생성된 클라이언트 ID를 아래에 붙여넣기
// ====================================================

export const GOOGLE_CLIENT_ID = '994745112402-0jilqa4paj79g6mtr22jgd38r9n2fbvb.apps.googleusercontent.com';

// Google Sheets API에 필요한 권한 범위
export const GOOGLE_SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file';

// 내보낼 스프레드시트 제목
export const SPREADSHEET_TITLE = '솔로몬의 재판소 - 사법 기록부';
