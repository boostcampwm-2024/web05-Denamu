import { ApiProperty } from '@nestjs/swagger';

export class ApiResponse<T> {
  @ApiProperty({ description: '응답 데이터', required: false })
  private readonly data?: T;

  @ApiProperty({ description: '응답 메시지', required: true })
  private readonly message: string;

  private constructor(message: string, data?: T) {
    this.message = message;
    this.data = data;
  }

  static responseWithData<U>(message: string, data: U): ApiResponse<U> {
    return new ApiResponse<U>(message, data);
  }

  static responseWithNoContent(message: string): ApiResponse<any> {
    return new ApiResponse(message);
  }
}
