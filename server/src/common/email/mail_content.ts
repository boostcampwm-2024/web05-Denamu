import { Rss } from '../../rss/rss.entity';

export function createMailContent(
  rss: Rss,
  approveFlag: boolean,
  serviceAddress: string,
  description?: string,
) {
  return `
  <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', sans-serif; margin: 0; padding: 1px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0;">
        <img src="https://denamu.site/files/Denamu_Logo_KOR.png" alt="Denamu Logo" width="244" height="120">
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
          ${approveFlag ? acceptContent(rss) : rejectContent(rss, description)}
          <center>
            <a href="https://denamu.site" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 4px; margin: 20px 0;">${approveFlag ? '서비스 바로가기' : '다시 신청하러 가기'}</a>
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

function acceptContent(rss: Rss) {
  return `
    <p>안녕하세요! 귀하의 블로그가 저희 서비스에 성공적으로 등록되었음을 알려드립니다.</p>
    <p>이제 귀하의 새로운 글이 업데이트될 때마다 저희 플랫폼에서 확인하실 수 있습니다.</p>
  `;
}

function rejectContent(rss: Rss, description: string) {
  return `
    <p><strong>거부 사유:</strong></p>
    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px 20px; margin: 15px 0; color: #666; line-height: 1.6;">${description}</div>
    <p>위 사유를 해결하신 후 다시 신청해 주시기 바랍니다.</p>
  `;
}
