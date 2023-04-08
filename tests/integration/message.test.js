const request = require('supertest');
const axios = require('axios');

const app = require('../..');
const lineService = require('../../services/line.service');
const store = require('../../utils/store');

jest.useFakeTimers();
jest.mock('axios');

beforeEach(() => {
  axios.post.mockResolvedValue({
    status: 201,
    data: {},
  });

  jest.spyOn(lineService, 'sendMessage');
  jest.spyOn(store, 'get');
  jest.spyOn(store, 'set');
  jest.spyOn(store, 'delete');
  jest.spyOn(store, 'has');
  jest.spyOn(global, 'setTimeout');
  jest.spyOn(global, 'clearTimeout');
});

afterEach(() => {
  jest.clearAllMocks();
  store.clear();
  setTimeout.mockClear();
  clearTimeout.mockClear();
});

describe('POST /send', () => {
  test('should send message', async () => {
    const response = await request(app)
      .post('/v1/send')
      .set('X-Line-Access-Token', 'test-line-access-token')
      .send({
        to: 'U4af4980629xxx',
        messages: [
          {
            type: 'text',
            text: 'OK',
          },
        ],
        delay: '5s',
      });

    jest.runAllTimers();

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      messageId: expect.any(String),
    });

    expect(lineService.sendMessage).toHaveBeenCalledTimes(1);
    expect(lineService.sendMessage).toHaveBeenCalledWith({
      accessToken: 'test-line-access-token',
      data: {
        to: 'U4af4980629xxx',
        messages: [
          {
            type: 'text',
            text: 'OK',
          },
        ],
      },
    });
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/bot/message/push'),
      {
        to: 'U4af4980629xxx',
        messages: [
          {
            type: 'text',
            text: 'OK',
          },
        ],
      },
      {
        headers: {
          Authorization: 'Bearer test-line-access-token',
        },
      }
    );
    expect(store.set).toHaveBeenCalledTimes(1);
    expect(store.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object)
    );
    expect(store.all().length).toBe(1);
    expect(store.has(response.body.messageId)).toBeDefined();
  });

  test('should send message with messageId', async () => {
    const response = await request(app)
      .post('/v1/send')
      .set('X-Line-Access-Token', 'test-line-access-token')
      .send({
        messageId: 'test-message-id',
        to: 'U4af4980629xxx',
        messages: [
          {
            type: 'text',
            text: 'OK',
          },
        ],
        delay: '5s',
      });

    jest.runAllTimers();

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      messageId: 'test-message-id',
    });

    expect(store.get).toHaveBeenCalledTimes(1);
    expect(store.get).toHaveBeenCalledWith('test-message-id');
    expect(lineService.sendMessage).toHaveBeenCalledTimes(1);
    expect(lineService.sendMessage).toHaveBeenCalledWith({
      accessToken: 'test-line-access-token',
      data: {
        to: 'U4af4980629xxx',
        messages: [
          {
            type: 'text',
            text: 'OK',
          },
        ],
      },
    });
    expect(store.set).toHaveBeenCalledTimes(1);
    expect(store.set).toHaveBeenCalledWith(
      'test-message-id',
      expect.any(Object)
    );
    expect(store.all().length).toBe(1);
  });

  test('should send message when the messageId exists in the store', async () => {
    store.set('test-message-id', 1);
    store.set.mockClear();

    const response = await request(app)
      .post('/v1/send')
      .set('X-Line-Access-Token', 'test-line-access-token')
      .send({
        messageId: 'test-message-id',
        to: 'U4af4980629xxx',
        messages: [
          {
            type: 'text',
            text: 'OK',
          },
        ],
        delay: '5s',
      });

    jest.runAllTimers();

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      messageId: 'test-message-id',
    });

    expect(store.get).toHaveBeenCalledTimes(1);
    expect(store.get).toHaveBeenCalledWith('test-message-id');
    expect(clearTimeout).toHaveBeenNthCalledWith(1, 1);
    expect(lineService.sendMessage).toHaveBeenCalledTimes(1);
    expect(store.set).toHaveBeenCalledTimes(1);
    expect(store.set).toHaveBeenCalledWith(
      'test-message-id',
      expect.any(Object)
    );
    expect(store.all().length).toBe(1);
  });

  test('should report error when X-Line-Access-Token is not provided', async () => {
    const response = await request(app)
      .post('/v1/send')
      .send({
        messageId: 'test-message-id',
        to: 'U4af4980629xxx',
        messages: [
          {
            type: 'text',
            text: 'OK',
          },
        ],
        delay: '5s',
      });

    jest.runAllTimers();

    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      message: 'Missing X-Line-Access-Token',
    });

    expect(lineService.sendMessage).not.toHaveBeenCalled();
    expect(store.set).not.toHaveBeenCalled();
  });

  test('should report error when messageId is format invalid', async () => {
    const response = await request(app)
      .post('/v1/send')
      .set('X-Line-Access-Token', 'test-line-access-token')
      .send({
        messageId: 123,
        to: 'U4af4980629xxx',
        messages: [
          {
            type: 'text',
            text: 'OK',
          },
        ],
        delay: '5s',
      });

    jest.runAllTimers();

    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      message: expect.stringContaining('messageId must be a `string`'),
    });

    expect(lineService.sendMessage).not.toHaveBeenCalled();
    expect(store.set).not.toHaveBeenCalled();
  });

  test('should report error when delay is not provided', async () => {
    const response = await request(app)
      .post('/v1/send')
      .set('X-Line-Access-Token', 'test-line-access-token')
      .send({
        to: 'U4af4980629xxx',
        messages: [
          {
            type: 'text',
            text: 'OK',
          },
        ],
      });

    jest.runAllTimers();

    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      message: 'delay is a required field',
    });

    expect(lineService.sendMessage).not.toHaveBeenCalled();
    expect(store.set).not.toHaveBeenCalled();
  });

  test('should report error when delay is format invalid', async () => {
    const response = await request(app)
      .post('/v1/send')
      .set('X-Line-Access-Token', 'test-line-access-token')
      .send({
        delay: true,
        to: 'U4af4980629xxx',
        messages: [
          {
            type: 'text',
            text: 'OK',
          },
        ],
      });

    jest.runAllTimers();

    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      message: expect.stringContaining('delay must be a `string`'),
    });

    expect(lineService.sendMessage).not.toHaveBeenCalled();
    expect(store.set).not.toHaveBeenCalled();
  });

  test('should report error when to is not provided', async () => {
    const response = await request(app)
      .post('/v1/send')
      .set('X-Line-Access-Token', 'test-line-access-token')
      .send({
        delay: '5s',
        messages: [
          {
            type: 'text',
            text: 'OK',
          },
        ],
      });

    jest.runAllTimers();

    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      message: 'to is a required field',
    });

    expect(lineService.sendMessage).not.toHaveBeenCalled();
    expect(store.set).not.toHaveBeenCalled();
  });

  test('should report error when to is format invalid', async () => {
    const response = await request(app)
      .post('/v1/send')
      .set('X-Line-Access-Token', 'test-line-access-token')
      .send({
        delay: '5s',
        to: {},
        messages: [
          {
            type: 'text',
            text: 'OK',
          },
        ],
      });

    jest.runAllTimers();

    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      message: expect.stringContaining('to must be a `string`'),
    });

    expect(lineService.sendMessage).not.toHaveBeenCalled();
    expect(store.set).not.toHaveBeenCalled();
  });

  test('should report error when messages is not provided', async () => {
    const response = await request(app)
      .post('/v1/send')
      .set('X-Line-Access-Token', 'test-line-access-token')
      .send({
        delay: '5s',
        to: 'U4af4980629xxx',
      });

    jest.runAllTimers();

    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      message: 'messages is a required field',
    });

    expect(lineService.sendMessage).not.toHaveBeenCalled();
    expect(store.set).not.toHaveBeenCalled();
  });

  test('should report error when messages is format invalid', async () => {
    const response = await request(app)
      .post('/v1/send')
      .set('X-Line-Access-Token', 'test-line-access-token')
      .send({
        delay: '5s',
        to: 'U4af4980629xxx',
        messages: 'abc',
      });

    jest.runAllTimers();

    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      message: expect.stringContaining('messages must be a `array`'),
    });

    expect(lineService.sendMessage).not.toHaveBeenCalled();
    expect(store.set).not.toHaveBeenCalled();
  });

  test('should report error when messages is empty', async () => {
    const response = await request(app)
      .post('/v1/send')
      .set('X-Line-Access-Token', 'test-line-access-token')
      .send({
        delay: '5s',
        to: 'U4af4980629xxx',
        messages: [],
      });

    jest.runAllTimers();

    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      message: 'messages field must have at least 1 items',
    });

    expect(lineService.sendMessage).not.toHaveBeenCalled();
    expect(store.set).not.toHaveBeenCalled();
  });

  test('should print log when the message sending fails', async () => {
    lineService.sendMessage.mockImplementation(() => {
      return {
        then() {
          return this;
        },
        catch(cb) {
          cb();
          return this;
        },
        finally: (cb) => cb(),
      };
    });

    jest.spyOn(console, 'error').mockImplementation();

    const response = await request(app)
      .post('/v1/send')
      .set('X-Line-Access-Token', 'test-line-access-token')
      .send({
        to: 'U4af4980629xxx',
        messages: [
          {
            type: 'text',
            text: 'OK',
          },
        ],
        delay: '5s',
      });

    jest.runAllTimers();

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      messageId: expect.any(String),
    });

    expect(lineService.sendMessage).toHaveBeenCalledTimes(1);
    expect(store.set).toHaveBeenCalledTimes(1);
    expect(store.delete).toHaveBeenCalledTimes(1);
    expect(store.all().length).toBe(0);
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});

describe('POST /cancel', () => {
  test('should cancel sending message', async () => {
    store.set('test-message-id', 1);

    const response = await request(app).post('/v1/cancel').send({
      messageId: 'test-message-id',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ result: true });

    expect(store.get).toHaveBeenCalledTimes(1);
    expect(store.get).toHaveBeenCalledWith('test-message-id');
    expect(clearTimeout).toHaveBeenNthCalledWith(1, 1);
    expect(store.delete).toHaveBeenCalledTimes(1);
    expect(store.delete).toHaveBeenCalledWith('test-message-id');
    expect(store.all().length).toBe(0);
  });

  test('should result false when the messageId is not present in the store', async () => {
    const response = await request(app).post('/v1/cancel').send({
      messageId: 'test-message-id',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ result: false });

    expect(store.get).toHaveBeenCalledTimes(1);
    expect(store.get).toHaveBeenCalledWith('test-message-id');
    expect(store.delete).not.toHaveBeenCalled();
  });

  test('should report error when messageId is not provided', async () => {
    const response = await request(app).post('/v1/cancel').send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'messageId is a required field',
    });

    expect(store.get).not.toHaveBeenCalled();
    expect(store.delete).not.toHaveBeenCalled();
  });

  test('should report error when messageId is format invalid', async () => {
    const response = await request(app).post('/v1/cancel').send({
      messageId: 123,
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: expect.stringContaining('messageId must be a `string`'),
    });

    expect(store.get).not.toHaveBeenCalled();
    expect(store.delete).not.toHaveBeenCalled();
  });
});
