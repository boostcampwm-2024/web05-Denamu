import { Rss } from '@common/types';

export const PRODUCT_DOMAIN =
  process.env.PRODUCT_DOMAIN || 'https://denamu.dev';

const LOGO_URL = 'https://denamu.dev/files/Denamu_Logo_KOR.png';

function mailLayout(bodyContent: string, serviceAddress: string) {
  return `
  <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', sans-serif; margin: 0; padding: 1px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0;">
        <img src="${LOGO_URL}" alt="Denamu Logo" width="244" height="120">
      </div>
      <div style="padding: 20px 0;">
        ${bodyContent}
      </div>
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; border-top: 2px solid #f0f0f0; color: #6c757d; font-size: 14px; height: 100px;">
        <p>본 메일은 발신전용입니다.</p>
        <p>문의사항이 있으시다면 <a href="mailto:${serviceAddress}" style="color: #007bff; text-decoration: none;">${serviceAddress}</a>로 연락주세요.</p>
      </div>
    </div>
  </div>
`;
}

// 제목 (색상만 메일별로 다름)
function heading(text: string, color: string) {
  return `<div style="color: ${color}; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center;">${text}</div>`;
}

// 내용 박스 (#f8f9fa 회색 박스)
function infoBox(inner: string) {
  return `<div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">${inner}</div>`;
}

// CTA 버튼. registration 버튼만 bold 없음 → bold 파라미터로 보존
function button(href: string, text: string, color = '#007bff', bold = true) {
  return `
        <center>
          <a href="${href}" style="display: inline-block; padding: 12px 24px; background-color: ${color}; color: #ffffff; text-decoration: none; border-radius: 4px; margin: 20px 0;${bold ? ' font-weight: bold;' : ''}">${text}</a>
        </center>`;
}

// 하단 안내 박스 (작은 회색 텍스트). inner는 caller가 조립
function noticeBox(inner: string) {
  return `<div style="font-size: 14px; color: #6c757d; margin-top: 20px; text-align: center;">${inner}</div>`;
}

// "버튼이 작동하지 않는 경우..." 링크 복사 안내
function fallbackLink(link: string) {
  return `
          <p>버튼이 작동하지 않는 경우, 아래 링크를 복사하여 브라우저에 붙여넣기 해주세요:</p>
          <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;"><a href="${link}" style="color: #007bff;">${link}</a></p>`;
}

// "이 링크는 x분 동안 유효합니다."
function linkValidity(minutes: number) {
  return `<p>이 링크는 ${minutes}분 동안 유효합니다.</p>`;
}

// "본인이 요청하지 않은 경우, 문의 메일로 문의해주시기 바랍니다."
function ignoreNotice() {
  return `<p style="color: #dc3545; font-weight: bold; margin-top: 15px;">본인이 요청하지 않은 경우, 문의 메일로 문의해주시기 바랍니다.</p>`;
}

export function createRssRegistrationContent(
  rss: Rss,
  approveFlag: boolean,
  serviceAddress: string,
  description?: string,
) {
  const body = `
        ${
          approveFlag
            ? heading('블로그가 성공적으로 등록되었습니다! 🎉', '#28a745')
            : heading('블로그 등록이 거부되었습니다.', '#dc3545')
        }
        ${infoBox(`
          <p><strong>블로그 제목:</strong> ${rss.name}</p>
          <p><strong>블로거 이름:</strong> ${rss.userName}</p>
          <p><strong>RSS 주소:</strong> <a href="${rss.rssUrl}" style="color: #007bff;">${rss.rssUrl}</a></p>
        `)}
        ${approveFlag ? acceptContent() : rejectContent(description)}
        ${button(
          PRODUCT_DOMAIN,
          approveFlag ? '서비스 바로가기' : '다시 신청하러 가기',
          '#007bff',
          false,
        )}
  `;
  return mailLayout(body, serviceAddress);
}

export function createRssRegistrationRequestContent(
  rss: Rss,
  serviceAddress: string,
) {
  const body = `
        ${heading('새로운 RSS 등록 신청이 접수되었습니다 📥', '#007bff')}
        ${infoBox(`
          <p><strong>블로그 제목:</strong> ${rss.name}</p>
          <p><strong>신청자 이름:</strong> ${rss.userName}</p>
          <p><strong>신청자 이메일:</strong> <a href="mailto:${rss.email}" style="color: #007bff;">${rss.email}</a></p>
          <p><strong>RSS 주소:</strong> <a href="${rss.rssUrl}" style="color: #007bff;">${rss.rssUrl}</a></p>
        `)}
        <p>관리자 페이지에서 신청 내용을 확인하고 승인 또는 거절을 진행해 주세요.</p>
        ${button(`${PRODUCT_DOMAIN}/admin`, '관리자 페이지로 이동')}
  `;
  return mailLayout(body, serviceAddress);
}

function acceptContent() {
  return `
    <p>안녕하세요! 귀하의 블로그가 저희 서비스에 성공적으로 등록되었음을 알려드립니다.</p>
    <p>이제 귀하의 새로운 글이 업데이트될 때마다 저희 플랫폼에서 확인하실 수 있습니다.</p>
  `;
}

function rejectContent(description: string) {
  return `
    <p><strong>거부 사유:</strong></p>
    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px 20px; margin: 15px 0; color: #666; line-height: 1.6;">${description}</div>
    <p>위 사유를 해결하신 후 다시 신청해 주시기 바랍니다.</p>
  `;
}

export function createVerificationMailContent(
  userName: string,
  verificationLink: string,
  serviceAddress: string,
) {
  const body = `
        ${heading('회원가입 인증을 완료해주세요', '#007bff')}
        ${infoBox(`
          <p><strong>안녕하세요, ${userName}님!</strong></p>
          <p>Denamu 서비스에 가입해 주셔서 감사합니다.</p>
          <p>아래 버튼을 클릭하여 회원가입 인증을 완료해 주세요.</p>
        `)}
        ${button(verificationLink, '이메일 인증하기')}
        ${noticeBox(`
          ${fallbackLink(verificationLink)}
          ${linkValidity(10)}
          ${ignoreNotice()}
        `)}
  `;
  return mailLayout(body, serviceAddress);
}

export function createAdminVerificationMailContent(
  name: string,
  verificationLink: string,
  serviceAddress: string,
) {
  const body = `
        ${heading('관리자 계정 인증을 완료해주세요', '#007bff')}
        ${infoBox(`
          <p><strong>안녕하세요, ${name}님!</strong></p>
          <p>Denamu 관리자 계정 생성 요청이 접수되었습니다.</p>
          <p>아래 버튼을 클릭하여 관리자 계정 인증을 완료해 주세요.</p>
        `)}
        ${button(verificationLink, '이메일 인증하기')}
        ${noticeBox(`
          ${fallbackLink(verificationLink)}
          ${linkValidity(10)}
          ${ignoreNotice()}
        `)}
  `;
  return mailLayout(body, serviceAddress);
}

export function createAdminDeleteAccountContent(
  name: string,
  verificationLink: string,
  serviceAddress: string,
) {
  const body = `
        ${heading('관리자 회원탈퇴 요청을 확인해주세요', '#dc3545')}
        ${infoBox(`
          <p><strong>안녕하세요, ${name}님!</strong></p>
          <p>Denamu 관리자 계정 회원탈퇴 요청이 접수되었습니다.</p>
          <p>정말 탈퇴하시려면 아래 버튼을 클릭하여 회원탈퇴를 완료해 주세요.</p>
          <p style="color: #dc3545; font-weight: bold; margin-top: 15px;">⚠️ 탈퇴 시 본인이 생성한 하위 관리자 계정도 함께 삭제되며, 복구할 수 없습니다.</p>
        `)}
        ${button(verificationLink, '회원탈퇴 확인', '#dc3545')}
        ${noticeBox(`
          ${fallbackLink(verificationLink)}
          ${linkValidity(10)}
          ${ignoreNotice()}
        `)}
  `;
  return mailLayout(body, serviceAddress);
}

export function createRssRemoveCertificateContent(
  userName: string,
  serviceAddress: string,
  rssUrl: string,
  removalLink: string,
) {
  const body = `
        ${heading('RSS 삭제 신청을 인증해주세요', '#ff0015')}
        ${infoBox(`
          <p>안녕하세요, <b>${userName}</b>님!</p>
          <p>Denamu 서비스에서 <a href="${rssUrl}" style="color: #007bff;"><b><u>${rssUrl}</u></b></a> 블로그 정보를 정말 지우실 건가요? 😢</p>
          <p>아래 버튼을 클릭하여 RSS 삭제를 완료해주세요.</p>
        `)}
        ${button(removalLink, 'RSS 삭제 인증하기', '#ff0015')}
        ${noticeBox(`
          ${fallbackLink(removalLink)}
          ${linkValidity(5)}
          ${ignoreNotice()}
        `)}
  `;
  return mailLayout(body, serviceAddress);
}

export function createRssCertificationContent(
  userName: string,
  serviceAddress: string,
  blogName: string,
  userEmail: string,
  certificationLink: string,
) {
  const body = `
        ${heading('RSS 소유 인증을 완료해주세요', '#007bff')}
        ${infoBox(`
          <p>안녕하세요, <b>${userName}</b>님!</p>
          <p>Denamu 서비스에서 <b><u>${blogName}</u></b> 블로그의 소유 인증이 요청되었습니다.</p>
          <p>신청자 이메일: <a href="mailto:${userEmail}" style="color: #007bff;"><b>${userEmail}</b></a></p>
          <p>본인이 요청한 것이 맞다면 아래 버튼을 클릭하여 소유 인증을 완료해주세요.</p>
        `)}
        ${button(certificationLink, '소유 인증 완료하기')}
        ${noticeBox(`
          ${fallbackLink(certificationLink)}
          ${linkValidity(5)}
          ${ignoreNotice()}
        `)}
  `;
  return mailLayout(body, serviceAddress);
}

export function createPasswordResetMailContent(
  userName: string,
  passwordResetLink: string,
  serviceAddress: string,
) {
  const body = `
        ${heading('비밀번호 재설정', '#007bff')}
        ${infoBox(`
          <p><strong>안녕하세요, ${userName}님!</strong></p>
          <p>비밀번호 재설정을 요청하셨습니다.</p>
          <p>아래 버튼을 클릭하여 새로운 비밀번호를 설정해 주세요.</p>
        `)}
        ${button(passwordResetLink, '비밀번호 재설정하기')}
        ${noticeBox(`
          ${fallbackLink(passwordResetLink)}
          ${linkValidity(10)}
          ${ignoreNotice()}
        `)}
  `;
  return mailLayout(body, serviceAddress);
}

export function createQnaAnsweredContent(
  recipientName: string,
  qnaTitle: string,
  qnaId: number,
  serviceAddress: string,
) {
  const qnaLink = `${PRODUCT_DOMAIN}/qna/${qnaId}`;

  const body = `
        ${heading('문의하신 Q&A에 답변이 등록되었습니다', '#007bff')}
        ${infoBox(`
          <p><strong>안녕하세요, ${recipientName}님!</strong></p>
          <p>'${qnaTitle}' 문의에 대한 답변이 등록되었습니다.</p>
        `)}
        ${button(qnaLink, '답변 확인하러 가기', '#28af60')}
        ${noticeBox(`
          ${fallbackLink(qnaLink)}
        `)}
  `;
  return mailLayout(body, serviceAddress);
}

export function createDeleteAccountContent(
  userName: string,
  verificationLink: string,
  serviceAddress: string,
) {
  const body = `
        ${heading('회원탈퇴 요청을 확인해주세요', '#dc3545')}
        ${infoBox(`
          <p><strong>안녕하세요, ${userName}님!</strong></p>
          <p>Denamu 서비스 회원탈퇴 요청이 접수되었습니다.</p>
          <p>정말 탈퇴하시려면 아래 버튼을 클릭하여 회원탈퇴를 완료해 주세요.</p>
          <p style="color: #dc3545; font-weight: bold; margin-top: 15px;">⚠️ 탈퇴 시 모든 개인정보와 활동 내역을 복구할 수 없습니다.</p>
        `)}
        ${button(verificationLink, '회원탈퇴 확인', '#dc3545')}
        ${noticeBox(`
          ${fallbackLink(verificationLink)}
          ${linkValidity(10)}
          ${ignoreNotice()}
        `)}
  `;
  return mailLayout(body, serviceAddress);
}
