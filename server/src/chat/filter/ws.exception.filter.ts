import { ArgumentsHost, Catch } from '@nestjs/common';

@Catch()
export class WsExceptionFilter implements WsExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    client.emit('error_chat', {
      type: 'VALIDATION_ERROR',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      message: exception?.response || exception.message,
    });
  }
}
