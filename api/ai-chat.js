export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { question, context } = req.body;
  if (!question) return res.status(400).json({ error: "question required" });

  const systemPrompt = "Tu es l'assistant analytique de CarteViz. " + (context || "") + " Reponds en francais, max 4 phrases.";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 400,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq error FULL:", JSON.stringify(data));
      return res.status(500).json({ error: "Erreur API IA", detail: JSON.stringify(data) });
    }

    const reply = data.choices?.[0]?.message?.content || "Pas de reponse";
    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Handler error:", err.message);
    return res.status(500).json({ error: "Erreur serveur", detail: err.message });
  }
}
