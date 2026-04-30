const successResponse = (res, message, data = null) => {
  return res.json({ status: 0, message, data });
};

const errorResponse = (res, statusCode, message, httpStatus = 400, data = null) => {
  return res.status(httpStatus).json({ status: statusCode, message, data });
};

module.exports = { successResponse, errorResponse };
