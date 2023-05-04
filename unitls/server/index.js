"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openServer = exports.getServerIp = void 0;
// 启用独立服务
var http = require("http");
var os = require("os");
// const httpProxy = require("http-proxy");
// import axios from "axios";
var fs = require("fs");
var path = require("path");
// const _proxyApi = (target: string) => {
//   const proxy = httpProxy.createProxyServer({
//     target: target,
//     changeOrigin: true,
//   });
//   // 监听代理服务器的 proxyRes 事件
//   proxy.on("proxyRes", function (proxyRes, req, res) {
//     // 获取响应数据
//     let body = [];
//     proxyRes.on("data", function (chunk) {
//       body.push(chunk);
//     });
//     proxyRes.on("end", function () {
//       let bodys = Buffer.concat(body).toString();
//       const dataJson = JSON.parse(bodys);
//       const rootPath = path.join(__dirname, "..", "..", "/");
//       const filePath = path.join(rootPath, `/localData/test.json`);
//       const jsonData = JSON.stringify(dataJson);
//       if (!fs.existsSync(filePath)) {
//         // 如果文件不存在，则创建它
//         fs.writeFileSync(filePath, JSON.stringify({}));
//       }
//       fs.writeFileSync(filePath, jsonData, function (err) {
//         if (err) {
//           console.error(err);
//         } else {
//           console.log("写入成功!");
//         }
//       });
//       res.end(bodys);
//     });
//   });
//   proxy.on("error", function (err, req, res) {
//     res.writeHead(500, {
//       "content-type": "text/plain",
//     });
//     res.end(
//       "Something went wrong. And we are reporting a custom error message."
//     );
//   });
//   return proxy;
// };
// 获取本机的局域网IP
var getServerIp = function () {
    var interfaces = os.networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === "IPv4" &&
                /(192.168.*)(?!127.0.0.1)/.test(alias.address) &&
                !alias.internal) {
                return alias.address;
            }
        }
    }
};
exports.getServerIp = getServerIp;
function getProxyPrefix(url) {
    var regex = /([^/]+)\/.+$/;
    var match = url.match(regex);
    if (match && match.length > 1) {
        return match[1];
    }
    else {
        return "";
    }
}
// 开启局域网接口
var openServer = function (config) {
    // 获取本机的局域网IP和自定义端口
    var SERVER_PORT = config.prot || 9000;
    var SERVER_IP = (0, exports.getServerIp)();
    var server = http.createServer();
    server.on("request", function (req, res) {
        // 防止跨域
        res.writeHead(200, {
            "Content-Type": "application/json;charset=utf-8",
            "access-control-allow-origin": "*",
        });
        // 接口代理内容
        // const _proxyKeys = Object.keys(proxy);
        // if (_proxyKeys.length > 0) {
        //   const curKey = getProxyPrefix(req.url);
        //   req.url = req.url.replace(`/${curKey}`, "");
        //   _proxyApi(proxy[`/${curKey}`].target).web(req, res);
        // }
        // _proxyApi("http://apijson.cn:8080").web(req, res);
        var _proxyKeys = Object.keys(config.proxy);
        req.on("data", function (data) {
            if (_proxyKeys.length > 0) {
                var curKey = getProxyPrefix(req.url);
                req.url = req.url.replace("/".concat(curKey), "");
                var httpRequse = http.request({
                    host: config.proxy["/".concat(curKey)].target.replace("http://", ""),
                    port: 8080,
                    path: req.url,
                    method: "POST",
                }, function (requse) {
                    requse.setEncoding("utf8");
                    var body = [];
                    requse.on("data", function (chunk) {
                        body.push(chunk);
                    });
                    requse.on("end", function () {
                        var filePath = path.join(config.fileDir, "/localData".concat(req.url, ".json"));
                        if (!fs.existsSync(filePath)) {
                            // 如果文件不存在，则创建它
                            fs.writeFileSync(filePath, JSON.stringify({}));
                        }
                        fs.writeFileSync(filePath, body[0], function (err) {
                            if (err) {
                                console.error(err);
                            }
                            else {
                                console.log("写入成功!");
                            }
                        });
                        res.end(body[0]);
                    });
                });
                httpRequse.write(data.toString() + "\n");
                httpRequse.end();
            }
            else {
                var httpRequse = http.request({
                    host: "apijson.cn",
                    port: 8080,
                    path: req.url,
                    method: "POST",
                }, function (requse) {
                    requse.setEncoding("utf8");
                    var body = [];
                    requse.on("data", function (chunk) {
                        body.push(chunk);
                    });
                    requse.on("end", function () {
                        var filePath = path.join(config.fileDir, "/localData".concat(req.url, ".json"));
                        if (!fs.existsSync(filePath)) {
                            // 如果文件不存在，则创建它
                            fs.writeFileSync(filePath, JSON.stringify({}));
                        }
                        if (JSON.parse(body[0]).code !== 200) {
                            fs.writeFileSync(filePath, body[0], function (err) {
                                if (err)
                                    console.error(err);
                            });
                            res.end(body[0]);
                        }
                        else {
                            fs.readFile(filePath, "utf-8", function (err, data) {
                                console.log(err, "data");
                                if (!err) {
                                    res.end(JSON.stringify({
                                        code: 500,
                                        message: "本地文件不存在",
                                    }));
                                }
                                else {
                                    res.end(data);
                                }
                            });
                        }
                    });
                });
                httpRequse.write(data.toString() + "\n");
                httpRequse.end();
            }
        });
    });
    // 返回端口开启结果
    return new Promise(function (resolve, reject) {
        server.listen(SERVER_PORT, SERVER_IP, function () {
            resolve("\u670D\u52A1\u5668\u5F00\u542F\u6210\u529F\uFF0C\u670D\u52A1\u5668\u5730\u5740: http://".concat(SERVER_IP, ":").concat(SERVER_PORT));
        });
        server.on("error", function (err) {
            if (err.code === "EADDRINUSE")
                reject("\u7AEF\u53E3:".concat(SERVER_PORT, "\u88AB\u5360\u7528,\u8BF7\u66F4\u6362\u5360\u7528\u7AEF\u53E3"));
        });
    });
};
exports.openServer = openServer;
