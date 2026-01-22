function validateBody(schema) {
  return function (req, res, next) {
    var result = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (result.error) {
      return res.status(400).json({
        message: "Validation error",
        details: result.error.details.map(function (d) {
          return { message: d.message, path: d.path };
        }),
      });
    }

    req.body = result.value;
    return next();
  };
}

module.exports = {
  validateBody: validateBody,
};
