import https from "node:https";

export function httpRequest(url: string, options?: any) {
  return new Promise<{ statusCode: number; headers: any; body: string }>(
    (resolve, reject) => {
      try {
        const req = https.request(url, options, (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (chunk) => {
            chunks.push(chunk as Buffer);
          });
          res.on("end", () => {
            const body = Buffer.concat(chunks).toString("utf8");
            resolve({
              statusCode: res.statusCode || 0,
              headers: res.headers || {},
              body,
            });
          });
        });

        req.on("error", reject);

        if (options && options.body) {
          req.write(options.body);
        }
        req.end();
      } catch (err) {
        reject(err);
      }
    },
  );
}

export function encodeForm(data: Record<string, unknown>) {
  const parts: string[] = [];
  Object.keys(data || {}).forEach((k) => {
    if ((data as any)[k] === undefined || (data as any)[k] === null) return;
    parts.push(
      encodeURIComponent(k) +
        "=" +
        encodeURIComponent(String((data as any)[k])),
    );
  });
  return parts.join("&");
}

export async function requestJson(url: string, options?: any) {
  const res = await httpRequest(url, options);
  let json: any = null;
  try {
    json = res.body ? JSON.parse(res.body) : null;
  } catch {
    json = null;
  }
  return {
    statusCode: res.statusCode,
    headers: res.headers,
    body: res.body,
    json,
  };
}
