var https = require("https");

function httpRequest(url, options) {
  return new Promise(function (resolve, reject) {
    try {
      var req = https.request(url, options, function (res) {
        var chunks = [];
        res.on("data", function (chunk) {
          chunks.push(chunk);
        });
        res.on("end", function () {
          var body = Buffer.concat(chunks).toString("utf8");
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers || {},
            body: body,
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
  });
}

function encodeForm(data) {
  var parts = [];
  Object.keys(data || {}).forEach(function (k) {
    if (data[k] === undefined || data[k] === null) return;
    parts.push(
      encodeURIComponent(k) + "=" + encodeURIComponent(String(data[k])),
    );
  });
  return parts.join("&");
}

async function requestJson(url, options) {
  var res = await httpRequest(url, options);
  var json = null;
  try {
    json = res.body ? JSON.parse(res.body) : null;
  } catch (_) {
    json = null;
  }
  return {
    statusCode: res.statusCode,
    headers: res.headers,
    body: res.body,
    json: json,
  };
}

module.exports = {
  httpRequest: httpRequest,
  encodeForm: encodeForm,
  requestJson: requestJson,
};
