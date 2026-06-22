import express from "express";
import { getWeChatAccessToken } from "./wechat-token";
import { getWeChatCredentials, handleFetchError } from "./utils";
import FormData from "form-data";
import Jimp from "jimp";
import axios from "axios";

const WECHAT_API_BASE = process.env.WECHAT_API_URL || "http://legns.top:1234";
const router = express.Router();

async function uploadImageToWeChat(imgUrl: string, accessToken: string, req: express.Request): Promise<string> {
    let imageBuffer: ArrayBuffer;
    
    if (imgUrl.startsWith("data:")) {
        const matches = imgUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) throw new Error("无效的 Base64 图片格式");
        const buffer = Buffer.from(matches[2], 'base64');
        imageBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    } else {
        let actualUrl = imgUrl;
        if (imgUrl.startsWith("/")) {
            const host = req.headers.host || "127.0.0.1:3000";
            const protocol = req.headers["x-forwarded-proto"] || "http";
            actualUrl = `${protocol}://${host}${imgUrl}`;
        }
        const imageRes = await fetch(actualUrl);
        if (!imageRes.ok) throw new Error(`下载配图服务响应错误 (HTTP ${imageRes.status})`);
        imageBuffer = await imageRes.arrayBuffer();
    }

    let finalBuffer = Buffer.from(imageBuffer);
    try {
        const jimpImage = await Jimp.read(finalBuffer);
        const width = jimpImage.bitmap.width;
        if (width > 400) jimpImage.resize(400, Jimp.AUTO);
        jimpImage.quality(75);
        finalBuffer = await jimpImage.getBufferAsync(Jimp.MIME_JPEG);
    } catch (jimpErr) {
        console.warn("[WeChat Process Cover] Jimp failed", jimpErr);
    }

    console.log(`[WeChat Upload Media] Buffer size: ${finalBuffer.length}`);
    const uploadForm = new FormData();
    uploadForm.append("media", finalBuffer, { filename: "cover.jpg", contentType: "image/jpeg" });

    const uploadUrl = `${WECHAT_API_BASE}/cgi-bin/media/upload?access_token=${accessToken}&type=image`;
    
    try {
        const uploadRes = await axios.post(uploadUrl, uploadForm, {
            headers: uploadForm.getHeaders()
        });
        
        const uploadData = uploadRes.data;
        if (!uploadData.media_id) throw new Error(`微信API返回错误: ${uploadData.errmsg || JSON.stringify(uploadData)}`);
        return uploadData.media_id;
    } catch (err: any) {
        throw new Error(`上传接口异常: ${err.message}`);
    }
}

router.post("/upload-media", async (req, res) => {
    const { appId, appSecret } = getWeChatCredentials(req, true);
    if (!appId || !appSecret) return res.status(400).json({ success: false, error: "Missing AppID/Secret" });

    try {
        const accessToken = await getWeChatAccessToken(appId, appSecret);
        const { imgUrl } = req.body;
        
        if (!imgUrl) return res.status(400).json({ success: false, error: "Missing imgUrl" });
        
        const mediaId = await uploadImageToWeChat(imgUrl, accessToken, req);
        
        res.json({ success: true, media_id: mediaId });
    } catch (err: any) {
        console.error("[WeChat Upload Media] Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post("/publish", async (req, res) => {
    console.log("[WeChat Publish] Entering routessss");
    const { appId, appSecret } = getWeChatCredentials(req, true);
    if (!appId || !appSecret) return res.status(400).json({ success: false, error: "Missing AppID/Secret" });

    try {
        const accessToken = await getWeChatAccessToken(appId, appSecret);
        const { title, contentHtml, coverUrl, thumbMediaId, author, publishToDraft } = req.body;
        
        let targetMediaId = thumbMediaId || "";
        if (!targetMediaId && coverUrl) {
            targetMediaId = await uploadImageToWeChat(coverUrl, accessToken, req);
        }

        const draftUrl = `${WECHAT_API_BASE}/cgi-bin/draft/add?access_token=${accessToken}`;
        const draftRes = await fetch(draftUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                articles: [
                    {
                        title,
                        content: contentHtml,
                        thumb_media_id: targetMediaId,
                        author,
                        digest: req.body.digest || "",
                        show_cover_pic: 1,
                        content_source_url: "",
                        need_open_comment: 0,
                        only_fans_can_comment: 0
                    }
                ]
            })
        });

        const responseText = await draftRes.text();
        let draftData: any;
        try {
            draftData = JSON.parse(responseText);
        } catch (e) {
            throw new Error(`微信接口返回非JSON数据: ${responseText.substring(0, 50)}...`);
        }

        if (!draftRes.ok) {
            throw new Error(`微信发布草稿接口请求失败 (HTTP ${draftRes.status}): ${draftData.errmsg || responseText}`);
        }

        if (draftData.errcode) throw new Error(draftData.errmsg || "未知错误");

        res.json({ success: true, draft_id: draftData.media_id });
    } catch (err: any) {
        console.error("[WeChat Publish] Error:", err);
        res.status(500).json({ success: false, error: err.message || "未知错误" });
    }
});

router.post("/albums", async (req, res) => {
    const { appId, appSecret } = getWeChatCredentials(req, true);
    if (!appId || !appSecret) return res.status(400).json({ success: false, error: "Missing AppID/Secret" });
    
    try {
        const accessToken = await getWeChatAccessToken(appId, appSecret);
        const albumUrl = `${WECHAT_API_BASE}/cgi-bin/album/getall?access_token=${accessToken}`;
        const resData = await fetch(albumUrl);
        const data = await resData.json();
        res.json({ success: true, items: data.items || [] });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
