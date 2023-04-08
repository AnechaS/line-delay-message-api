const httpStatus = require('http-status');
const yup = require('yup');
const uuid = require('uuid').v4;
const ms = require('ms');
const store = require('../utils/store');
const lineService = require('../services/line.service');

exports.send = function (req, res) {
  try {
    const headersSchema = yup.object({
      'x-line-access-token': yup
        .string()
        .required('Missing X-Line-Access-Token')
        .trim(),
    });
    const headers = headersSchema.validateSync(req.headers);

    const bodySchema = yup.object({
      messageId: yup.string().trim(),
      delay: yup.string().required().trim(),
      to: yup.string().required().trim(),
      messages: yup.array().min(1).required(),
    });
    const body = bodySchema.validateSync(req.body, { strict: true });

    const value = store.get(body.messageId);
    if (typeof value !== 'undefined') {
      clearTimeout(value);
    }

    const messageId = body.messageId || uuid();
    const delay = ms(body.delay);
    const timeout = setTimeout(() => {
      lineService
        .sendMessage({
          accessToken: headers['x-line-access-token'],
          data: {
            to: body.to,
            messages: body.messages,
          },
        })
        .catch((e) => e.toJSON && console.error('SendMessageError', e.toJSON()))
        .finally(() => body.delay && store.delete(messageId));
    }, delay);

    store.set(messageId, timeout);

    res.json({ messageId });
  } catch (error) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: error.message });
  }
};

exports.cancel = function (req, res) {
  try {
    const schema = yup.object({
      messageId: yup.string().required().trim(),
    });
    const { messageId } = schema.validateSync(req.body, { strict: true });

    const value = store.get(messageId);
    if (typeof value === 'undefined') {
      res.json({ result: false });
      return;
    }

    clearTimeout(value);
    store.delete(messageId);

    res.json({ result: true });
  } catch (error) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: error.message });
  }
};
