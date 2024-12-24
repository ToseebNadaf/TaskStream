const ErrorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if (res && typeof res.status === "function") {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    console.error("Response object is missing or invalid");
    return next(err);
  }
};

export default ErrorMiddleware;
