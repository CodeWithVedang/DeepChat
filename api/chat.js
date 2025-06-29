// api/chat.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CHAT_API_KEY}`,
        "HTTP-Referer": "https://chatgpt-clone-theta-gold.vercel.app/",
        "X-Title": "ChatGPT Clone",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528:free",
        messages: [
          { role: "system", content: "You are a helpful assistant. Always respond in English. Use Markdown formatting (e.g., # for headings, - for bullets, * for emphasis, ` for code) for structured responses." },
          { role: "user", content: message },
        ],
      }),
    });

    const text = await response.text(); // Get raw text first to debug
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      return res.status(500).json({ error: `Invalid JSON response: ${text.substring(0, 50)}...` });
    }

    if (!response.ok || data.error) {
      const errorMsg = data.error?.message || "Unknown error from OpenRouter.";
      return res.status(response.status).json({ error: errorMsg });
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || "Empty response.";
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: `Network Error: ${err.message}` });
  }
}