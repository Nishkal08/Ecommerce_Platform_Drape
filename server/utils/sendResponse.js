const sendResponse = (res, statusCode, success, data = null, message = '') => {
  const response = { success, message };
  if (data !== null) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

module.exports = sendResponse;
