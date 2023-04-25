"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openServer = exports.getServerIp = void 0;
// 启用独立服务
const http = require("http");
const os = require("os");
const httpProxy = require("http-proxy");
const _proxyApi = (target) => {
    const proxy = httpProxy.createProxyServer({
        target: target,
        changeOrigin: true,
    });
    // 监听代理服务器的 proxyRes 事件
    proxy.on("proxyRes", function (proxyRes, req, res) {
        // 获取响应数据
        let body = [];
        proxyRes.on("data", function (chunk) {
            body.push(chunk);
        });
        proxyRes.on("end", function () {
            let bodys = Buffer.concat(body).toString();
            res.end(bodys);
        });
    });
    proxy.on("error", function (err, req, res) {
        res.writeHead(500, {
            "content-type": "text/plain",
        });
        res.end("Something went wrong. And we are reporting a custom error message.");
    });
    return proxy;
};
// 获取本机的局域网IP
const getServerIp = () => {
    let interfaces = os.networkInterfaces();
    for (let devName in interfaces) {
        let iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];
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
    const regex = /([^/]+)\/.+$/;
    const match = url.match(regex);
    if (match && match.length > 1) {
        return match[1];
    }
    else {
        return "";
    }
}
// 开启局域网接口
const openServer = (prot, proxy = {}) => {
    // 获取本机的局域网IP和自定义端口
    let SERVER_PORT = prot || 9000;
    let SERVER_IP = (0, exports.getServerIp)();
    const server = http.createServer();
    server.on("request", (req, res) => {
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
        // _proxyApi(proxy[`/${curKey}`].target).web(req, res);
        // }
        _proxyApi("http://apijson.cn:8080").web(req, res);
        // 请求接口数据
        if (req.method === "POST" && req.url === "/api/authentication") {
            let context = {
                code: 200,
                data: {
                    test: "you data",
                },
            };
            res.end(JSON.stringify(context));
        }
    });
    // 返回端口开启结果
    return new Promise((resolve, reject) => {
        server.listen(SERVER_PORT, SERVER_IP, () => {
            resolve(`服务器开启成功，服务器地址: http://${SERVER_IP}:${SERVER_PORT}`);
        });
        server.on("error", (err) => {
            if (err.code === "EADDRINUSE")
                reject(`端口:${SERVER_PORT}被占用,请更换占用端口`);
        });
    });
};
exports.openServer = openServer;
