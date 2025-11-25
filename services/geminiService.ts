import { GoogleGenAI } from "@google/genai";
import { ScannedItem } from "../types";

// Initialize Gemini Client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing!");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeInventory = async (items: ScannedItem[]): Promise<string> => {
  const client = getClient();
  if (!client || items.length === 0) {
    return "Analiz için veri bulunamadı veya API anahtarı eksik.";
  }

  // Prepare a prompt suitable for inventory analysis
  const itemData = items.map(i => ({
    barcode: i.barcode,
    time: new Date(i.timestamp).toLocaleTimeString()
  }));

  const prompt = `
    Aşağıdaki JSON verisi bir depoda yapılan barkod sayım işlemine aittir. 
    Bir depo/envanter yöneticisi asistanı gibi davranarak bu veriyi analiz et.
    
    Veri: ${JSON.stringify(itemData, null, 2)}
    
    Lütfen şunları içeren Türkçe, profesyonel bir rapor özeti yaz (Markdown formatında):
    1. Toplam sayılan ürün adedi ve işlem zaman aralığı (ilk ve son okuma arası).
    2. Operasyonel verimlilik hakkında kısa bir yorum (hızlı mı sayıldı, yavaş mı?).
    3. Barkodların yapısı hakkında kısa bilgi (örn: EAN-13 mü görünüyor, rastgele mi?).
    4. Bu listeyi e-posta ile gönderecek kişi için hazır bir "Konu" ve kısa "E-posta İçeriği" taslağı.
    
    Raporun tonu kurumsal ve yardımsever olsun.
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Speed over deep reasoning for this summary
      }
    });

    return response.text || "Analiz sonucu oluşturulamadı.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.";
  }
};