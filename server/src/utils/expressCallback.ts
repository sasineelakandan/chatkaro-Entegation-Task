import { NextFunction, Request, Response } from "express";

export function expressCallback(controller: any) {
  return async function (req:any, res: Response, next: NextFunction) {
    const file =req.file
    const httpRequest = {
      
      user: req.user || null,
      file:file,
      body: req.body,
      query: req.query,
      params: req.params,
      ip: req.ip,
      method: req.method,
      path: req.path,
      headers: {
        "Content-Type": req.get("Content-Type"),
        Referer: req.get("referer"),
        "User-Agent": req.get("User-Agent"),
      },
    };

    try {
      const httpResponse = await controller(httpRequest);

      if (httpResponse.headers) {
        res.set(httpResponse.headers);
      }

      
      if (httpResponse.accessToken) {
        res.cookie("accessToken", httpResponse.accessToken, {
          httpOnly: false,
        });
      }

      if (httpResponse.refreshToken) {
        res.cookie("refreshToken", httpResponse.refreshToken, {
          httpOnly: true,
        });
      }

      res.type("json");
      res.status(httpResponse.statusCode).send(httpResponse.body);
    } catch (e: any) {
      next();
    }
  };
}
