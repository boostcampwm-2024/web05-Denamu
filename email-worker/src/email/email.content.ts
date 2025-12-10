import { Rss } from '../types/types';

export const PRODUCT_DOMAIN = 'https://denamu.dev';

export function createRssRegistrationContent(
  rss: Rss,
  approveFlag: boolean,
  serviceAddress: string,
  description?: string,
) {
  return `
  <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', sans-serif; margin: 0; padding: 1px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0;">
        <img src="https://denamu.dev/files/Denamu_Logo_KOR.png" alt="Denamu Logo" width="244" height="120">
      </div>
      <div style="padding: 20px 0;">
        ${
          approveFlag
            ? `<div style="color: #28a745; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center;">블로그가 성공적으로 등록되었습니다! 🎉</div>`
            : `<div style="color: #dc3545; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center;">블로그 등록이 거부되었습니다.</div>`
        }
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <p><strong>블로그 제목:</strong> ${rss.name}</p>
            <p><strong>블로거 이름:</strong> ${rss.userName}</p>
            <p><strong>RSS 주소:</strong> ${rss.rssUrl}</p>
          </div>
          ${approveFlag ? acceptContent() : rejectContent(description)}
          <center>
            <a href="https://denamu.dev" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 4px; margin: 20px 0;">${approveFlag ? '서비스 바로가기' : '다시 신청하러 가기'}</a>
          </center>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; border-top: 2px solid #f0f0f0; color: #6c757d; font-size: 14px; height: 100px;">
        <p>본 메일은 발신전용입니다.</p>
        <p>문의사항이 있으시다면 ${serviceAddress}로 연락주세요.</p>
      </div>
    </div>
  </div>
`;
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
  return `
  <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', sans-serif; margin: 0; padding: 1px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0;">
        <img src="https://denamu.dev/files/Denamu_Logo_KOR.png" alt="Denamu Logo" width="244" height="120">
      </div>
      <div style="padding: 20px 0;">
        <div style="color: #007bff; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center;">회원가입 인증을 완료해주세요</div>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <p><strong>안녕하세요, ${userName}님!</strong></p>
            <p>Denamu 서비스에 가입해 주셔서 감사합니다.</p>
            <p>아래 버튼을 클릭하여 회원가입 인증을 완료해 주세요.</p>
          </div>
          <center>
            <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: bold;">이메일 인증하기</a>
          </center>
          <div style="font-size: 14px; color: #6c757d; margin-top: 20px; text-align: center;">
            <p>버튼이 작동하지 않는 경우, 아래 링크를 복사하여 브라우저에 붙여넣기 해주세요:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">${verificationLink}</p>
            <p>이 링크는 10분 동안 유효합니다.</p>
          </div>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; border-top: 2px solid #f0f0f0; color: #6c757d; font-size: 14px; height: 100px;">
        <p>본 메일은 발신전용입니다.</p>
        <p>문의사항이 있으시다면 ${serviceAddress}로 연락주세요.</p>
      </div>
    </div>
  </div>
`;
}

export function createRssRemoveCertificateContent(
  userName: string,
  certificateCode: string,
  serviceAddress: string,
  rssUrl: string,
) {
  return `
        <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', sans-serif; margin: 0; padding: 1px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0;">
                <img src="https://denamu.dev/files/Denamu_Logo_KOR.png" alt="Denamu Logo" width="244" height="120">
              </div>
              <div style="padding: 20px 0;">
                <div style="color: #ff0015; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center;">RSS 삭제 신청을 인증해주세요</div>
                  <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
                    <p>안녕하세요, <b>${userName}</b>님!</p>
                    <p>Denamu 서비스에서 <b><u>${rssUrl}</u></b> 블로그 정보를 정말 지우실 건가요? 😢</p>
                    <p>아래 인증 코드를 데나무 사이트에 입력해주세요.</p>
                  </div>
                  <center>
                    <p style="background-color: #ffde4d; padding: 15px; border-radius: 4px; margin: 15px 200px;""><b>${certificateCode}</b></p>
                  </center>
                  <div style="font-size: 14px; color: #6c757d; margin-top: 20px; text-align: center;">
                    <p>이 코드는 5분 동안 유효합니다.</p>
                  </div>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; border-top: 2px solid #f0f0f0; color: #6c757d; font-size: 14px; height: 100px;">
                <p>본 메일은 발신전용입니다.</p>
                <p>문의사항이 있으시다면 ${serviceAddress}로 연락주세요.</p>
              </div>
            </div>
          </div>
`;
}

export function createPasswordResetMailContent(
  userName: string,
  passwordResetLink: string,
  serviceAddress: string,
) {
  return `
  <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', sans-serif; margin: 0; padding: 1px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0;">
        <img src="https://denamu.dev/files/Denamu_Logo_KOR.png" alt="Denamu Logo" width="244" height="120">
      </div>
      <div style="padding: 20px 0;">
        <div style="color: #007bff; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center;">비밀번호 재설정</div>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <p><strong>안녕하세요, ${userName}님!</strong></p>
            <p>비밀번호 재설정을 요청하셨습니다.</p>
            <p>아래 버튼을 클릭하여 새로운 비밀번호를 설정해 주세요.</p>
          </div>
          <center>
            <a href="${passwordResetLink}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: bold;">비밀번호 재설정하기</a>
          </center>
          <div style="font-size: 14px; color: #6c757d; margin-top: 20px; text-align: center;">
            <p>버튼이 작동하지 않는 경우, 아래 링크를 복사하여 브라우저에 붙여넣기 해주세요:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">${passwordResetLink}</p>
            <p>이 링크는 10분 동안 유효합니다.</p>
            <p style="color: #dc3545; font-weight: bold;">만약 비밀번호 재설정을 요청하지 않으셨다면, 이 메일을 무시하셔도 됩니다.</p>
          </div>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; border-top: 2px solid #f0f0f0; color: #6c757d; font-size: 14px; height: 100px;">
        <p>본 메일은 발신전용입니다.</p>
        <p>문의사항이 있으시다면 ${serviceAddress}로 연락주세요.</p>
      </div>
    </div>
  </div>
`;
}

export function createDeleteAccountContent(
  userName: string,
  verificationLink: string,
  serviceAddress: string,
) {
  return `
  <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', sans-serif; margin: 0; padding: 1px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0;">
        <img src="https://denamu.dev/files/Denamu_Logo_KOR.png" alt="Denamu Logo" width="244" height="120">
      </div>
      <div style="padding: 20px 0;">
        <div style="color: #dc3545; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center;">회원탈퇴 요청을 확인해주세요</div>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <p><strong>안녕하세요, ${userName}님!</strong></p>
            <p>Denamu 서비스 회원탈퇴 요청이 접수되었습니다.</p>
            <p>정말 탈퇴하시려면 아래 버튼을 클릭하여 회원탈퇴를 완료해 주세요.</p>
            <p style="color: #dc3545; font-weight: bold; margin-top: 15px;">⚠️ 탈퇴 시 모든 개인정보와 활동 내역을 복구할 수 없습니다.</p>
          </div>
          <center>
            <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #dc3545; color: #ffffff; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: bold;">회원탈퇴 확인</a>
          </center>
          <div style="font-size: 14px; color: #6c757d; margin-top: 20px; text-align: center;">
            <p>버튼이 작동하지 않는 경우, 아래 링크를 복사하여 브라우저에 붙여넣기 해주세요:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">${verificationLink}</p>
            <p>이 링크는 10분 동안 유효합니다.</p>
            <p style="margin-top: 15px;">본인이 요청하지 않은 경우, 이 메일을 무시하시기 바랍니다.</p>
          </div>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; border-top: 2px solid #f0f0f0; color: #6c757d; font-size: 14px; height: 100px;">
        <p>본 메일은 발신전용입니다.</p>
        <p>문의사항이 있으시다면 ${serviceAddress}로 연락주세요.</p>
      </div>
    </div>
  </div>
`;
}
