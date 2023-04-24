"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var server_1 = require("./unitls/server");
var path = require("path");
var fs = require("fs");
// 读取本地配置文件
var _Config = JSON.parse(fs.readFileSync("./config/index.json", "utf-8"));
console.log(_Config);
var createWindow = function () {
    var mainWindow = new electron_1.BrowserWindow({
        width: _Config.width || 800,
        height: _Config.height || 800,
        titleBarStyle: "hidden",
        // 窗口是否置顶
        alwaysOnTop: _Config.isWindowOnTop || false,
        // 是否全屏
        fullscreen: _Config.isFullscreen || false,
        webPreferences: {
            // 预加载
            //   preload: path.join(__dirname, "preload.js"),
            //   允许使用node
            nodeIntegration: true,
        },
    });
    // 页面展示本地文件还是远程地址
    _Config.isLocalFile
        ? mainWindow.loadFile(_Config.href)
        : mainWindow.loadURL(_Config.href);
    if (_Config.devTool)
        mainWindow.webContents.openDevTools();
};
if (_Config.isHttpsCheck)
    electron_1.app.commandLine.appendSwitch("--ignore-certificate-errors");
if (_Config.isOpenServer)
    (0, server_1.openServer)(_Config.prot);
// 这段程序将会在 Electron 结束初始化和创建浏览器窗口的时候调用部分 API 在 ready 事件触发后才能使用。
electron_1.app.whenReady().then(function () {
    createWindow();
    electron_1.app.on("activate", function () {
        // 在 macOS 系统内, 如果没有已开启的应用窗口，点击托盘图标时通常会重新创建一个新窗口
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此, 通常对应用程序和它们的菜单栏来说应该时刻保持激活状态,直到用户使用 Cmd + Q 明确退出
electron_1.app.on("window-all-closed", function () {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
