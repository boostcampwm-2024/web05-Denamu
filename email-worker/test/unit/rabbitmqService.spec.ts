import 'reflect-metadata';
import { RabbitmqService } from '../../src/rabbitmq/rabbitmq.service';
import { RabbitMQManager } from '../../src/rabbitmq/rabbitmq.manager';
import { Channel, ConsumeMessage } from 'amqplib';

describe('RabbitmqService unit test', () => {
  let rabbitmqService: RabbitmqService;
  let mockRabbitMQManager: jest.Mocked<RabbitMQManager>;
  let mockChannel: jest.Mocked<Channel>;

  beforeEach(() => {
    mockChannel = {
      publish: jest.fn().mockReturnValue(true),
      sendToQueue: jest.fn().mockReturnValue(true),
      consume: jest
        .fn()
        .mockResolvedValue({ consumerTag: 'test-consumer-tag' }),
      ack: jest.fn(),
      nack: jest.fn(),
      cancel: jest.fn().mockResolvedValue({}),
    } as Partial<Channel> as jest.Mocked<Channel>;

    mockRabbitMQManager = {
      getChannel: jest.fn().mockResolvedValue(mockChannel),
    } as any;

    rabbitmqService = new RabbitmqService(mockRabbitMQManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage unit test', () => {
    it('exchange와 routingKey를 사용하여 메시지를 발행한다', async () => {
      const exchange = 'TestExchange';
      const routingKey = 'test.routing.key';
      const message = JSON.stringify({ data: 'test-data' });

      await rabbitmqService.sendMessage(exchange, routingKey, message);

      expect(mockRabbitMQManager.getChannel).toHaveBeenCalledTimes(1);
      expect(mockChannel.publish).toHaveBeenCalledTimes(1);
      expect(mockChannel.publish).toHaveBeenCalledWith(
        exchange,
        routingKey,
        Buffer.from(message),
      );
    });
  });

  describe('sendMessageToQueue unit test', () => {
    it('큐에 메시지를 직접 전송한다', async () => {
      const queue = 'test.queue';
      const message = JSON.stringify({ data: 'test-data' });

      await rabbitmqService.sendMessageToQueue(queue, message);

      expect(mockRabbitMQManager.getChannel).toHaveBeenCalledTimes(1);
      expect(mockChannel.sendToQueue).toHaveBeenCalledTimes(1);
      expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
        queue,
        Buffer.from(message),
        undefined,
      );
    });

    it('옵션과 함께 큐에 메시지를 전송한다', async () => {
      const queue = 'test.queue';
      const message = JSON.stringify({ data: 'test-data' });
      const options = {
        headers: {
          'x-retry-count': 1,
        },
      };

      await rabbitmqService.sendMessageToQueue(queue, message, options);

      expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
        queue,
        Buffer.from(message),
        options,
      );
    });
  });

  describe('consumeMessage unit test', () => {
    it('큐에서 메시지를 소비하고 consumerTag를 반환한다', async () => {
      const queue = 'test.queue';
      const onMessage = jest.fn();

      const consumerTag = await rabbitmqService.consumeMessage(
        queue,
        onMessage,
      );

      expect(mockRabbitMQManager.getChannel).toHaveBeenCalledTimes(1);
      expect(mockChannel.consume).toHaveBeenCalledTimes(1);
      expect(mockChannel.consume).toHaveBeenCalledWith(
        queue,
        expect.any(Function),
      );
      expect(consumerTag).toBe('test-consumer-tag');
    });

    it('메시지를 파싱하고 onMessage 콜백을 호출한 후 ack 처리한다', async () => {
      const queue = 'test.queue';
      const testPayload = { type: 'test', data: 'test-data' };
      const onMessage = jest.fn().mockResolvedValue(undefined);

      mockChannel.consume.mockImplementation(async (q, callback) => {
        const mockMessage: ConsumeMessage = {
          content: Buffer.from(JSON.stringify(testPayload)),
          properties: {
            headers: { 'x-retry-count': 2 },
          },
        } as any;

        callback(mockMessage);
        return { consumerTag: 'test-consumer-tag' };
      });

      await rabbitmqService.consumeMessage(queue, onMessage);

      // 비동기 콜백 처리를 위해 잠시 대기
      await new Promise((resolve) => setImmediate(resolve));

      expect(onMessage).toHaveBeenCalledWith(testPayload, 2);
      expect(mockChannel.ack).toHaveBeenCalledTimes(1);
    });

    it('메시지가 null이면 아무 작업도 하지 않는다', async () => {
      const queue = 'test.queue';
      const onMessage = jest.fn();

      mockChannel.consume.mockImplementation(async (q, callback) => {
        await callback(null);
        return { consumerTag: 'test-consumer-tag' };
      });

      await rabbitmqService.consumeMessage(queue, onMessage);

      await new Promise((resolve) => setImmediate(resolve));

      expect(onMessage).not.toHaveBeenCalled();
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });

    it('x-retry-count 헤더가 없으면 0으로 처리한다', async () => {
      const queue = 'test.queue';
      const testPayload = { type: 'test' };
      const onMessage = jest.fn().mockResolvedValue(undefined);

      mockChannel.consume.mockImplementation(async (q, callback) => {
        const mockMessage: ConsumeMessage = {
          content: Buffer.from(JSON.stringify(testPayload)),
          properties: {
            headers: {},
          },
        } as any;

        await callback(mockMessage);
        return { consumerTag: 'test-consumer-tag' };
      });

      await rabbitmqService.consumeMessage(queue, onMessage);

      await new Promise((resolve) => setImmediate(resolve));

      expect(onMessage).toHaveBeenCalledWith(testPayload, 0);
    });

    it('SHUTDOWN_IN_PROGRESS 에러 발생 시 메시지를 큐에 반환한다 (nack with requeue)', async () => {
      const queue = 'test.queue';
      const testPayload = { type: 'test' };
      const onMessage = jest
        .fn()
        .mockRejectedValue(new Error('SHUTDOWN_IN_PROGRESS'));

      let capturedMessage: ConsumeMessage;
      mockChannel.consume.mockImplementation(async (q, callback) => {
        capturedMessage = {
          content: Buffer.from(JSON.stringify(testPayload)),
          properties: {
            headers: {},
          },
        } as any;

        await callback(capturedMessage);
        return { consumerTag: 'test-consumer-tag' };
      });

      await rabbitmqService.consumeMessage(queue, onMessage);

      await new Promise((resolve) => setImmediate(resolve));

      expect(mockChannel.nack).toHaveBeenCalledWith(
        capturedMessage,
        false,
        true,
      );
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });

    it('일반 에러 발생 시 메시지를 nack 처리한다 (requeue false)', async () => {
      const queue = 'test.queue';
      const testPayload = { type: 'test' };
      const onMessage = jest.fn().mockRejectedValue(new Error('Some error'));

      let capturedMessage: ConsumeMessage;
      mockChannel.consume.mockImplementation(async (q, callback) => {
        capturedMessage = {
          content: Buffer.from(JSON.stringify(testPayload)),
          properties: {
            headers: {},
          },
        } as any;

        await callback(capturedMessage);
        return { consumerTag: 'test-consumer-tag' };
      });

      await rabbitmqService.consumeMessage(queue, onMessage);

      await new Promise((resolve) => setImmediate(resolve));

      expect(mockChannel.nack).toHaveBeenCalledWith(
        capturedMessage,
        false,
        false,
      );
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });
  });

  describe('closeConsumer unit test', () => {
    it('consumerTag로 consumer를 취소한다', async () => {
      const consumerTag = 'test-consumer-tag';

      await rabbitmqService.closeConsumer(consumerTag);

      expect(mockRabbitMQManager.getChannel).toHaveBeenCalledTimes(1);
      expect(mockChannel.cancel).toHaveBeenCalledTimes(1);
      expect(mockChannel.cancel).toHaveBeenCalledWith(consumerTag);
    });
  });
});
