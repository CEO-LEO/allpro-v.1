import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `คุณคือ PromoBot ผู้ช่วย AI ของแพลตฟอร์ม IAMROOT AI ซึ่งเป็นแพลตฟอร์มรวมโปรโมชั่นและดีลในประเทศไทย
หน้าที่ของคุณคือ:
- ช่วยค้นหาโปรโมชั่น ส่วนลด คูปอง และดีลต่างๆ
- แนะนำโปรโมชั่นจากหมวดหมู่ต่างๆ เช่น อาหาร แฟชั่น ท่องเที่ยว แกดเจ็ต ความงาม
- ตอบคำถามเกี่ยวกับการใช้งานแพลตฟอร์ม
- พูดคุยเป็นภาษาไทย สุภาพ เป็นมิตร กระชับ
ตอบสั้นๆ กระชับ ไม่เกิน 3-4 ประโยค`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid message" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "สวัสดี" }] },
        { role: "model", parts: [{ text: SYSTEM_PROMPT }] },
        ...(history || []).map((msg: { role: string; text: string }) => ({
          role: msg.role === "model" ? "model" : "user",
          parts: [{ text: msg.text }],
        })),
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
