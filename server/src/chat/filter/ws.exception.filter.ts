import { ArgumentsHost, BadRequestException, Catch } from '@nestjs/common';

import { Socket } from 'socket.io';

@Catch()
export class ChatWsExceptionFilter implements ChatWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();

      client.emit('error_chat', {
        type: 'VALIDATION_ERROR',
        message: response,
      });

      return;
    }

    client.emit('error_chat', {
      type: 'UNKNOWN_ERROR',
      message:
        exception instanceof Error
          ? exception.message
          : JSON.stringify(exception),
    });
  }
}
