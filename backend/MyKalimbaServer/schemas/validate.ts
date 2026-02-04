import type { NextFunction, Request, Response } from "express";
import type Joi from "joi";

export function validateBody(schema: Joi.Schema) {
  return function (req: Request, res: Response, next: NextFunction) {
    const result = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (result.error) {
      return res.status(400).json({
        message: "Validation error",
        details: result.error.details.map((d) => {
          return { message: d.message, path: d.path };
        }),
      });
    }

    req.body = result.value;
    return next();
  };
}
