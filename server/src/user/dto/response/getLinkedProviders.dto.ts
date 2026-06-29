import { ApiProperty } from '@nestjs/swagger';

import { Provider } from '@user/entity/provider.entity';

export class LinkedProviderDto {
  @ApiProperty({ example: 'google', description: '인증 제공자 타입' })
  provider: string;

  @ApiProperty({
    example: '김개발',
    description: '제공자에서 받아온 닉네임 또는 ID (미수집 시 null)',
    nullable: true,
  })
  providerUserName: string | null;

  @ApiProperty({ description: '연결 일시' })
  linkedAt: Date;
}

export class GetLinkedProvidersResponseDto {
  @ApiProperty({
    example: true,
    description: '비밀번호 설정 여부 (마지막 OAuth 해제 가능 여부 판단용)',
  })
  hasPassword: boolean;

  @ApiProperty({ type: [LinkedProviderDto], description: '연결된 제공자 목록' })
  providers: LinkedProviderDto[];

  constructor(partial: Partial<GetLinkedProvidersResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(hasPassword: boolean, providers: Provider[]) {
    return new GetLinkedProvidersResponseDto({
      hasPassword,
      providers: providers.map((provider) => ({
        provider: provider.providerType,
        providerUserName: provider.providerUserName ?? null,
        linkedAt: provider.createdAt,
      })),
    });
  }
}
