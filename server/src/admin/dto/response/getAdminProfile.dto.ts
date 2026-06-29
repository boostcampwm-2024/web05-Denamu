import { ApiProperty } from '@nestjs/swagger';

class ParentAdminDto {
  @ApiProperty({
    example: 'root-admin@example.com',
    description: '부모 관리자 이메일',
  })
  email: string;

  @ApiProperty({ example: '관리자', description: '부모 관리자 이름' })
  name: string;
}

export class GetAdminProfileResponseDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: '관리자 이메일 (변경 불가)',
  })
  email: string;

  @ApiProperty({
    example: '홍길동',
    description: '관리자 이름',
  })
  name: string;

  @ApiProperty({
    example: true,
    description: '이메일 수신 여부',
  })
  emailNotification: boolean;

  @ApiProperty({
    type: ParentAdminDto,
    nullable: true,
    description: '나를 생성한 부모 관리자 정보. Root 계정이면 null',
  })
  parent: ParentAdminDto | null;

  constructor(partial: Partial<GetAdminProfileResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(
    email: string,
    name: string,
    emailNotification: boolean,
    parent: ParentAdminDto | null,
  ) {
    return new GetAdminProfileResponseDto({
      email,
      name,
      emailNotification,
      parent,
    });
  }
}
