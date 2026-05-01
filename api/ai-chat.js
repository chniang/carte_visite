export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { question, context } = req.body;
  if (!question) return res.status(400).json({ error: "question required" });

  const systemPrompt = `Tu es l'assistant analytique de CarteViz, un SaaS de cartes de visite numeriques pour le marche senegalais et africain.

${context || ""}

Reponds en francais, de facon concise et actionnable. Max 4 phrases. Base-toi uniquement sur les donnees fournies. Utilise des chiffres precis quand disponibles. Sois direct et pratique.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        max_tokens: 400,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq error:", err);
      return res.status(500).json({ error: "Erreur API IA" });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Pas de reponse";
    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
