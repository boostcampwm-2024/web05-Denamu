import { ApiProperty } from '@nestjs/swagger';

class ParentAdminDto {
  @ApiProperty({ example: 'root-admin', description: '부모 관리자 로그인 아이디' })
  loginId: string;

  @ApiProperty({ example: '관리자', description: '부모 관리자 이름' })
  name: string;
}

export class GetAdminProfileResponseDto {
  @ApiProperty({
    example: '홍길동',
    description: '관리자 이름',
  })
  name: string;

  @ApiProperty({
    type: ParentAdminDto,
    nullable: true,
    description: '나를 생성한 부모 관리자 정보. Root 계정이면 null',
  })
  parent: ParentAdminDto | null;

  constructor(partial: Partial<GetAdminProfileResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(name: string, parent: ParentAdminDto | null) {
    return new GetAdminProfileResponseDto({ name, parent });
  }
}
