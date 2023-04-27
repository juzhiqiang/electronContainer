import { _initConfig } from "../../type/main";

// 启用独立服务
const http = require("http");
const os = require("os");
// const httpProxy = require("http-proxy");
// import axios from "axios";
const fs = require("fs");
const path = require("path");

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
export const getServerIp = () => {
  let interfaces = os.networkInterfaces();
  for (let devName in interfaces) {
    let iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      let alias = iface[i];
      if (
        alias.family === "IPv4" &&
        /(192.168.*)(?!127.0.0.1)/.test(alias.address) &&
        !alias.internal
      ) {
        return alias.address;
      }
    }
  }
};

function getProxyPrefix(url) {
  const regex = /([^/]+)\/.+$/;
  const match = url.match(regex);
  if (match && match.length > 1) {
    return match[1];
  } else {
    return "";
  }
}

// 开启局域网接口
export const openServer = (config: _initConfig) => {
  // 获取本机的局域网IP和自定义端口
  let SERVER_PORT = config.prot || 9000;
  let SERVER_IP = getServerIp();
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
    //   _proxyApi(proxy[`/${curKey}`].target).web(req, res);
    // }

    // _proxyApi("http://apijson.cn:8080").web(req, res);
    const _proxyKeys = Object.keys(config.proxy);
    req.on("data", (data) => {
      if (_proxyKeys.length > 0) {
        const curKey = getProxyPrefix(req.url);
        req.url = req.url.replace(`/${curKey}`, "");
        const httpRequse = http.request(
          {
            host: config.proxy[`/${curKey}`].target.replace("http://", ""),
            port: 8080,
            path: req.url,
            method: "POST",
          },
          function (requse) {
            requse.setEncoding("utf8");
            let body = [];
            requse.on("data", function (chunk) {
              body.push(chunk);
            });
            requse.on("end", function () {
              // let bodys = Buffer.concat(body).toString();
              // const dataJson = JSON.parse(bodys);
              const rootPath = path.join(__dirname, "..", "..", "/");
              const filePath = path.join(rootPath, `/localData/test.json`);
              // const jsonData = JSON.stringify(dataJson);
              if (!fs.existsSync(filePath)) {
                // 如果文件不存在，则创建它
                fs.writeFileSync(filePath, JSON.stringify({}));
              }

              fs.writeFileSync(filePath, body[0], function (err) {
                if (err) {
                  console.error(err);
                } else {
                  console.log("写入成功!");
                }
              });
              res.end(body[0]);
            });
          }
        );

        httpRequse.write(data.toString() + "\n");
        httpRequse.end();
      } else {
        const httpRequse = http.request(
          {
            host: "apijson.cn",
            port: 8080,
            path: req.url,
            method: "POST",
          },
          function (requse) {
            requse.setEncoding("utf8");
            let body = [];
            requse.on("data", function (chunk) {
              body.push(chunk);
            });
            requse.on("end", function () {
              // let bodys = Buffer.concat(body).toString();
              // const dataJson = JSON.parse(bodys);
              const filePath = path.join(
                config.fileDir,
                `/localData${req.url}.json`
              );
              // const jsonData = JSON.stringify(dataJson);
              if (!fs.existsSync(filePath)) {
                // 如果文件不存在，则创建它
                fs.writeFileSync(filePath, JSON.stringify({}));
              }

              fs.writeFileSync(filePath, body[0], function (err) {
                if (err) {
                  console.error(err);
                } else {
                  console.log("写入成功!");
                }
              });
              res.end(body[0]);
            });
          }
        );

        httpRequse.write(data.toString() + "\n");
        httpRequse.end();
      }
    });
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
