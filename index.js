const express = require('express');
const cors = require('cors');
const createHttpError = require('http-errors');
const httpStatus = require('http-status');
const routes = require('./routes');

const PORT = +process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/v1', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createHttpError(httpStatus.NOT_FOUND));
});

// error handler
app.use((err, req, res, next) => {
  const status = err.status || httpStatus.INTERNAL_SERVER_ERROR;
  const response = {
    message: err.message || httpStatus[status],
  };

  if (
    req.app.get('env') !== 'production' &&
    status >= httpStatus.INTERNAL_SERVER_ERROR
  ) {
    response.stack = err.stack;
  }

  res
    .status(status)
    .json(response);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log('Listening on port %i', PORT);
  });
}

module.exports = app;
