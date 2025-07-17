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
    .addTag('Admin', '관리자 전용 API')
    .addTag('Feed', '피드 관리와 검색 관련 API')
    .addTag('RSS', '관리자 전용 API')
    .addTag('Statistic', '통계 정보 조회 API')
    .addTag('User', '사용자 관리와 인증 관련 API')
    .addTag('OAuth', 'OAuth 관련 API')
    .addTag('File', '파일 업로드 및 관리 API')
    .setLicense('MIT License', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/swagger', app, document, {
    customSiteTitle: 'Denamu API Docs',
  });
}
