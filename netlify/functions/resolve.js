export const handler = async (event) => {
  const url = event.queryStringParameters?.url;
  if (!url || !/tiktok\.com/.test(url)) {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      body: JSON.stringify({ error: "URL TikTok ga valid" }),
    };
  }

  try {
    const api = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
    const r = await fetch(api, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
      },
    });
    const j = await r.json();

    if (j.code !== 0 || !j.data) {
      return {
        statusCode: 502,
        headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
        body: JSON.stringify({ error: j.msg || "Gagal resolve video" }),
      };
    }

    const d = j.data;
    return {
      statusCode: 200,
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      body: JSON.stringify({
        title: d.title,
        author: d.author?.unique_id,
        cover: d.origin_cover,
        play: d.play,          // no watermark
        wmplay: d.wmplay,      // watermark
        music: d.music,
        duration: d.duration,
        stats: { play: d.play_count, like: d.digg_count, comment: d.comment_count, share: d.share_count },
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      body: JSON.stringify({ error: "Server error: " + e.message }),
    };
  }
};
