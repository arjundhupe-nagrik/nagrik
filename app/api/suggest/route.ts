import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { description } = await req.json()
  if (!description || description.length < 10) {
    return NextResponse.json({ category: null })
  }

  const prompt = `You are a civic complaint classifier for Nagpur, India. 
Classify this complaint into exactly ONE of these categories:
Garbage, Drainage, Road, Water, Encroachment, Sanitation, Street Light, Other

Complaint: "${description}"

Reply with ONLY the category name, nothing else. No explanation.`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 10 }
      })
    }
  )

  const data = await res.json()
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  const valid = ['Garbage','Drainage','Road','Water','Encroachment','Sanitation','Street Light','Other']
  const category = valid.find(c => raw?.includes(c)) || null

  return NextResponse.json({ category })
}