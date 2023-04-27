// 初始化配置文件
export interface _initConfig {
  //   容器宽高
  width?: number;
  height?: number;
  //   是否全屏
  isFullscreen?: boolean;
  //   是否置顶
  isWindowOnTop?: boolean;
  //   页面是否展示本地文件
  isLocalFile: boolean;
  //   展示页面地址
  href?: string;
  //   是否开启服务
  isOpenServer?: boolean;
  //   本地启动服务端口
  prot?: number;
  // 是否校验请求地址中ssl证书合法性,默认校验
  isHttpsCheck: boolean;
  devTool: boolean;
  //   是否开启excel读写,开启后会默认都配置地址文件中每个excel匹配规则文件
  isExcelReadWrit: boolean;
  //   excel地址
  excelFileUrl: string;
  // 本地文件存放位置
  fileDir: string;
  // 代理配置
  proxy?: {
    [proxyname: string]: {
      target: string;
      changeOrigin: boolean;
      pathRewrite: {
        [rewriteName: string]: [rewriteValue: string];
      };
    };
  };
}
