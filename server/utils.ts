import express from "express";

export function getWeChatCredentials(req: express.Request, isPost: boolean = false) {
  let appId = process.env.WECHAT_APPID;
  let appSecret = process.env.WECHAT_APPSECRET;

  if (!appId) appId = req.headers["x-wechat-appid"] as string;
  if (!appSecret) appSecret = req.headers["x-wechat-appsecret"] as string;

  if (!appId) appId = (isPost ? req.body?.appId : req.query?.appId) as string;
  if (!appSecret) appSecret = (isPost ? req.body?.appSecret : req.query?.appSecret) as string;

  return {
    appId: appId ? String(appId).trim() : "",
    appSecret: appSecret ? String(appSecret).trim() : ""
  };
}

export function handleFetchError(err: any, endpointName: string, WECHAT_API_BASE: string) {
  console.error(`[WeChat ${endpointName}] Fetch error:`, err);
  const errMsg = err.message || String(err);
  if (errMsg.includes("ENOTFOUND") || errMsg.includes("fetch failed") || errMsg.includes("getaddrinfo")) {
    return `无法访问微信官方接口服务器 (${WECHAT_API_BASE})，发生网络/DNS解析错误: ${errMsg}。\n\n【排查指引】：由于有些海外或容器云环境（如 Cloud Run）的公共 DNS 无法直连或解析官方接口（api.weixin.qq.com），请选择：\n1.【推荐】在微信同步设置最下方的「高级设置」区域配置第三方的同步代理网关（例如您的 http://www.legns.top:1234 等）；\n2.【环境变量】在系统配置中通过 WECHAT_API_URL 环境变量指定微信 API 接口中转代理；\n3.【IP白名单】请确认您的服务器出站 IP 是否已填写到微信公众号后台的“IP白名单”中。`;
  }
  return `连接微信 ${endpointName} 失败，网络连接异常: ${errMsg}`;
}
