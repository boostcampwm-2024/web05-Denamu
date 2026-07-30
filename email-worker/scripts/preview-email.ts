import * as fs from 'fs';
import * as path from 'path';

import {
  createAdminDeleteAccountContent,
  createAdminVerificationMailContent,
  createDeleteAccountContent,
  createPasswordResetMailContent,
  createQnaAnsweredContent,
  createRssCertificationContent,
  createRssRegistrationContent,
  createRssRegistrationRequestContent,
  createRssRemoveCertificateContent,
  createVerificationMailContent,
} from '@email/email.content';

const SERVICE_ADDRESS = 'boostcamp9web05@gmail.com';
const SAMPLE_LINK = 'https://denamu.dev/verify?token=SAMPLE_TOKEN';
const SAMPLE_RSS = {
  name: '데나무 기술 블로그',
  userName: '김데나무',
  email: 'denamu@example.com',
  rssUrl: 'https://blog.example.com/rss',
};

// [파일명, 설명, HTML] 목록. 동적 값은 모두 더미.
const previews: [string, string, string][] = [
  [
    'rss-registration-approve',
    'RSS 등록 승인',
    createRssRegistrationContent(SAMPLE_RSS, true, SERVICE_ADDRESS),
  ],
  [
    'rss-registration-reject',
    'RSS 등록 거부',
    createRssRegistrationContent(
      SAMPLE_RSS,
      false,
      SERVICE_ADDRESS,
      'RSS 주소에 접근할 수 없습니다.',
    ),
  ],
  [
    'rss-registration-request',
    'RSS 등록 신청 접수(관리자)',
    createRssRegistrationRequestContent(SAMPLE_RSS, SERVICE_ADDRESS),
  ],
  [
    'verification',
    '회원가입 이메일 인증',
    createVerificationMailContent('김데나무', SAMPLE_LINK, SERVICE_ADDRESS),
  ],
  [
    'admin-verification',
    '관리자 계정 인증',
    createAdminVerificationMailContent('김관리', SAMPLE_LINK, SERVICE_ADDRESS),
  ],
  [
    'admin-delete-account',
    '관리자 회원탈퇴',
    createAdminDeleteAccountContent('김관리', SAMPLE_LINK, SERVICE_ADDRESS),
  ],
  [
    'rss-remove-certificate',
    'RSS 삭제 인증코드',
    createRssRemoveCertificateContent(
      '김데나무',
      SERVICE_ADDRESS,
      SAMPLE_RSS.rssUrl,
      `${SAMPLE_LINK}&code=123456`,
    ),
  ],
  [
    'rss-certification',
    'RSS 소유 인증',
    createRssCertificationContent(
      '김데나무',
      SERVICE_ADDRESS,
      SAMPLE_RSS.name,
      SAMPLE_RSS.email,
      SAMPLE_LINK,
    ),
  ],
  [
    'password-reset',
    '비밀번호 재설정',
    createPasswordResetMailContent('김데나무', SAMPLE_LINK, SERVICE_ADDRESS),
  ],
  [
    'delete-account',
    '회원탈퇴',
    createDeleteAccountContent('김데나무', SAMPLE_LINK, SERVICE_ADDRESS),
  ],
  [
    'qna-answered',
    'Q&A 답변 완료',
    createQnaAnsweredContent(
      '김데나무',
      '로그인이 안 돼요',
      1,
      SERVICE_ADDRESS,
    ),
  ],
];

const outDir = path.resolve(__dirname, '..', 'preview');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const [fileName, , html] of previews) {
  fs.writeFileSync(path.join(outDir, `${fileName}.html`), html, 'utf-8');
}

const indexHtml = `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="utf-8"><title>Email Preview</title>
<style>body{font-family:sans-serif;max-width:700px;margin:40px auto;padding:0 20px}h1{font-size:20px}li{margin:8px 0}</style>
</head>
<body>
<h1>Denamu Email Preview</h1>
<ul>
${previews.map(([f, desc]) => `  <li><a href="./${f}.html">${desc}</a> <code>(${f}.html)</code></li>`).join('\n')}
</ul>
</body>
</html>`;
fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml, 'utf-8');

console.log(`✅ ${previews.length}개 템플릿 렌더 완료 → ${outDir}`);
console.log(`   열기: ${path.join(outDir, 'index.html')}`);
