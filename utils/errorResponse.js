const sendError = (res, statusCode, message, error = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(error && { error: error.message || error }),
    });
};

module.exports = sendError;