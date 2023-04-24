// 启用独立服务
const http = require("http");
const os = require("os");

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

// 开启局域网接口
export const openServer = (prot: number) => {
  // 获取本机的局域网IP和自定义端口
  let SERVER_PORT = prot || 9000;
  let SERVER_IP = getServerIp();
  const server = http.createServer();
  server.on("request", (req, res) => {
    // 防止跨域
    res.writeHead(200, {
      "Content-Type": "application/json;charset=utf-8",
      "access-control-allow-origin": "*",
    });
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
