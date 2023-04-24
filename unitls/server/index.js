"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openServer = exports.getServerIp = void 0;
// 启用独立服务
var http = require("http");
var os = require("os");
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
// 开启局域网接口
var openServer = function (prot) {
    // 获取本机的局域网IP和自定义端口
    var SERVER_PORT = prot || 9000;
    var SERVER_IP = (0, exports.getServerIp)();
    var server = http.createServer();
    server.on("request", function (req, res) {
        // 防止跨域
        res.writeHead(200, {
            "Content-Type": "application/json;charset=utf-8",
            "access-control-allow-origin": "*",
        });
        // 请求接口数据
        if (req.method === "POST" && req.url === "/api/authentication") {
            var context = {
                code: 200,
                data: {
                    test: "you data",
                },
            };
            res.end(JSON.stringify(context));
        }
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
