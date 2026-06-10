import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Denamu API')
    .setDescription(
      '개발자들의 이야기가 자라나는 곳, 데나무🎋 API 명세서입니다.\n\n' +
        '이 문서를 통해 모든 API 엔드포인트와 요청/응답 형식을 확인할 수 있습니다. ' +
        '데나무 API는 RESTful 구조를 기반으로 하며, 다양한 개발자 커뮤니케이션을 지원합니다.',
    )
    .setVersion('1.0')
    .addTag('Activity', '활동 기록과 관련된 API')
    .addTag('Admin', '관리자 전용 API')
    .addTag('Feed', '피드 관리와 검색 관련 API')
    .addTag('Comment', '댓글 관리 API')
    .addTag('Like', '좋아요 관리 API')
    .addTag('RSS', 'RSS 관련 API')
    .addTag('Statistic', '통계 정보 조회 API')
    .addTag('User', '사용자 관리와 인증 관련 API')
    .addTag('OAuth', 'OAuth 관련 API')
    .addTag('File', '파일 업로드 및 관리 API')
    .addTag('Prometheus', '메트릭 수집 API')
    .setLicense('MIT License', 'https://opensource.org/licenses/MIT')
    .addBearerAuth()
    .addCookieAuth('refresh_token', undefined, 'refresh_token')
    .addCookieAuth('sessionId', undefined, 'sessionId')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/swagger', app, document, {
    customSiteTitle: 'Denamu API Docs',
  });
}
