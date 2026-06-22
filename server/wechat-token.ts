import express from "express";

const WECHAT_API_BASE = process.env.WECHAT_API_URL || "http://legns.top:1234";

// Token manager cache
const wechatTokenCache: Record<string, { 
  token: string; 
  appSecret: string; 
  refreshInterval?: NodeJS.Timeout 
}> = {};

async function fetchNewTokenDirectly(appId: string, appSecret: string): Promise<string> {
  console.log(`[WeChat TokenManager] Fetching new token for ${appId}`);
  const url = `${WECHAT_API_BASE}/cgi-bin/stable_token`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        grant_type: 'client_credential',
        appid: appId,
        secret: appSecret
    })
  });
  
  const data = await res.json();
  if (data.errcode) {
    console.error(`[WeChat TokenManager] Fetch stable token failed for ${appId}:`, data.errmsg);
    throw new Error(`Fetch stable token failed: ${data.errmsg}`);
  }
  
  return data.access_token;
}

export async function getWeChatAccessToken(appId?: string, appSecret?: string): Promise<string> {
  console.log(`[WeChat TokenManager] getWeChatAccessToken called. appId arg present: ${!!appId}, appSecret arg present: ${!!appSecret}`);
  const id = appId || process.env.WECHAT_APPID;
  const secret = appSecret || process.env.WECHAT_APPSECRET;
  console.log(`[WeChat TokenManager] id resolved: ${id ? "Present" : "Missing"}, secret resolved: ${secret ? "Present" : "Missing"}`);
  if (!id || !secret) throw new Error("Missing credentials");

  const cached = wechatTokenCache[id];
  if (cached) {
    return cached.token;
  }
  
  const token = await fetchNewTokenDirectly(id, secret);
  
  // Set up periodic refresh every 7000 seconds
  const refreshInterval = setInterval(async () => {
      try {
          const newToken = await fetchNewTokenDirectly(id, secret);
          wechatTokenCache[id].token = newToken;
          console.log(`[WeChat TokenManager] Succesfully refreshed token for ${id}`);
      } catch (err) {
          console.error(`[WeChat TokenManager] Periodic refresh failed for ${id}:`, err);
      }
  }, 7000 * 1000);

  wechatTokenCache[id] = { token, appSecret: secret, refreshInterval };
  
  return token;
}
