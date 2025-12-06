
import { GoogleGenAI, Modality } from "@google/genai";
import { LDVoice } from "../types";

// Helper for Base64 decoding
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper for Audio Data Decoding
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Helper to write string to DataView
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Create WAV Blob from raw PCM data
export function createWavBlob(pcmData: Uint8Array, sampleRate: number = 24000): Blob {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmData.length;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // File size - 8
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true); // Subchunk2Size

  // Write PCM data
  const pcmBytes = new Uint8Array(buffer, 44);
  pcmBytes.set(pcmData);

  return new Blob([buffer], { type: 'audio/wav' });
}

// Helper to map UI voice names to API voice names
const getRealVoiceName = (uiVoiceName: string): string => {
  switch (uiVoiceName) {
    // --- HOT TREND (THEO YÊU CẦU) ---
    case LDVoice.HOT_REVIEW_BDS: return 'Charon'; // Deep, Rich, Luxurious tone
    case LDVoice.HOT_TIN_GIAO_THONG: return 'Fenrir'; // Strong, Authoritative, Warning tone

    // --- REVIEW SẢN PHẨM (HOT TREND) - NAM ---
    case LDVoice.REVIEW_SP_NAM_1: return 'Puck';   // Tech -> Modern/Clear
    case LDVoice.REVIEW_SP_NAM_2: return 'Charon'; // Xe Sang -> Deep/Classy
    case LDVoice.REVIEW_SP_NAM_3: return 'Fenrir'; // Unbox -> Excited/Strong
    case LDVoice.REVIEW_SP_NAM_4: return 'Puck';   // Food -> Friendly
    case LDVoice.REVIEW_SP_NAM_5: return 'Charon'; // Real Estate -> Trustworthy
    case LDVoice.REVIEW_SP_NAM_6: return 'Fenrir'; // Sale -> Urgent
    case LDVoice.REVIEW_SP_NAM_7: return 'Puck';   // TikTok -> Fast/Trendy
    case LDVoice.REVIEW_SP_NAM_8: return 'Charon'; // Watch -> Elegant
    case LDVoice.REVIEW_SP_NAM_9: return 'Puck';   // Travel -> Fun
    case LDVoice.REVIEW_SP_NAM_10: return 'Fenrir';// Expert -> Pro

    // --- REVIEW SẢN PHẨM (HOT TREND) - NỮ ---
    case LDVoice.REVIEW_SP_NU_1: return 'Kore';    // Beauty -> Glam
    case LDVoice.REVIEW_SP_NU_2: return 'Zephyr';  // Fashion -> Excited
    case LDVoice.REVIEW_SP_NU_3: return 'Kore';    // Mom -> Warm
    case LDVoice.REVIEW_SP_NU_4: return 'Kore';    // Home -> Soothing
    case LDVoice.REVIEW_SP_NU_5: return 'Zephyr';  // Food -> Cute
    case LDVoice.REVIEW_SP_NU_6: return 'Zephyr';  // Sale -> Fast/Sharp
    case LDVoice.REVIEW_SP_NU_7: return 'Kore';    // Spa -> Relaxed
    case LDVoice.REVIEW_SP_NU_8: return 'Kore';    // Hotel -> Classy
    case LDVoice.REVIEW_SP_NU_9: return 'Zephyr';  // Snack -> Playful
    case LDVoice.REVIEW_SP_NU_10: return 'Kore';   // Corporate -> Pro

    // Custom Requested
    case LDVoice.MAI_TUAN_TAI_1: return 'Fenrir';
    case LDVoice.MAI_TUAN_TAI_2: return 'Puck';

    // --- MIỀN BẮC (NORTH) - NAM ---
    case LDVoice.NAM_BAC_1: return 'Fenrir'; // Tin tuc -> Deep/Authoritative
    case LDVoice.NAM_BAC_2: return 'Charon'; // Phong su -> Deep
    case LDVoice.NAM_BAC_3: return 'Puck';   // Doc truyen -> Neutral
    case LDVoice.NAM_BAC_4: return 'Puck';   // Review -> Energetic
    case LDVoice.NAM_BAC_5: return 'Charon'; // Tai lieu -> Deep
    case LDVoice.NAM_BAC_6: return 'Fenrir'; // MC -> Strong
    case LDVoice.NAM_BAC_7: return 'Puck';   // Quang cao -> Bright
    case LDVoice.NAM_BAC_8: return 'Charon'; // Tho -> Deep
    case LDVoice.NAM_BAC_9: return 'Fenrir'; // Dem khuya -> Deep
    case LDVoice.NAM_BAC_10: return 'Puck';  // Thuyet minh -> Clear

    // --- MIỀN BẮC (NORTH) - NỮ ---
    case LDVoice.NU_BAC_1: return 'Kore';   // Giao vien -> Soft
    case LDVoice.NU_BAC_2: return 'Zephyr'; // Tin tuc -> Sharp
    case LDVoice.NU_BAC_3: return 'Kore';   // Tro ly -> Friendly
    case LDVoice.NU_BAC_4: return 'Zephyr'; // Ke chuyen be -> High/Sweet
    case LDVoice.NU_BAC_5: return 'Kore';   // My pham -> Natural
    case LDVoice.NU_BAC_6: return 'Zephyr'; // Thong bao -> Standard
    case LDVoice.NU_BAC_7: return 'Kore';   // Podcast -> Relaxed
    case LDVoice.NU_BAC_8: return 'Kore';   // Sach noi -> Emotional
    case LDVoice.NU_BAC_9: return 'Zephyr'; // Huong dan -> Happy
    case LDVoice.NU_BAC_10: return 'Kore';  // Tong dai -> Pro

    // --- MIỀN NAM (SOUTH) - NAM ---
    case LDVoice.NAM_NAM_1: return 'Puck';   // Giai tri -> Fun
    case LDVoice.NAM_NAM_2: return 'Puck';   // Vlog -> Friendly
    case LDVoice.NAM_NAM_3: return 'Fenrir'; // Doc bao -> Clear
    case LDVoice.NAM_NAM_4: return 'Zephyr'; // Cong nghe -> Modern (Using Zephyr for a lighter male tone simulation if needed, or Puck) -> Puck is safer for male
    case LDVoice.NAM_NAM_5: return 'Charon'; // Ma -> Scary
    case LDVoice.NAM_NAM_6: return 'Puck';   // Game -> Fast
    case LDVoice.NAM_NAM_7: return 'Fenrir'; // Radio -> Warm
    case LDVoice.NAM_NAM_8: return 'Puck';   // Sale -> Persuasive
    case LDVoice.NAM_NAM_9: return 'Charon'; // Long tieng -> Funny/Character
    case LDVoice.NAM_NAM_10: return 'Fenrir';// Thay giao -> Calm

    // --- MIỀN NAM (SOUTH) - NỮ ---
    case LDVoice.NU_NAM_1: return 'Kore';   // Google -> Robot-ish
    case LDVoice.NU_NAM_2: return 'Kore';   // Tam su -> Sweet
    case LDVoice.NU_NAM_3: return 'Zephyr'; // An uong -> Cute
    case LDVoice.NU_NAM_4: return 'Zephyr'; // Giai tri -> Energetic
    case LDVoice.NU_NAM_5: return 'Kore';   // Ngon tinh -> Romantic
    case LDVoice.NU_NAM_6: return 'Kore';   // Tong dai -> Soft
    case LDVoice.NU_NAM_7: return 'Zephyr'; // Spa -> Classy
    case LDVoice.NU_NAM_8: return 'Kore';   // Nau an -> Warm
    case LDVoice.NU_NAM_9: return 'Zephyr'; // Co tich -> High
    case LDVoice.NU_NAM_10: return 'Kore';  // MC -> Elegant

    // --- SPECIAL ---
    case LDVoice.REVIEW_PHIM_PRO_1: return 'Fenrir';
    case LDVoice.REVIEW_PHIM_PRO_2: return 'Charon';
    case LDVoice.REVIEW_PHIM_PRO_3: return 'Puck';
    case LDVoice.REVIEW_PHIM_PRO_4: return 'Fenrir';
    case LDVoice.REVIEW_PHIM_PRO_5: return 'Zephyr';
    case LDVoice.SPECIAL_1: return 'Puck';   // Robot
    case LDVoice.SPECIAL_2: return 'Charon'; // History
    case LDVoice.SPECIAL_3: return 'Kore';   // ASMR
    case LDVoice.SPECIAL_4: return 'Fenrir'; // Shout
    case LDVoice.SPECIAL_5: return 'Charon'; // Old man

    // Default Fallback
    default: return 'Puck';
  }
};

export const generateSpeechLD = async (
  text: string,
  uiVoiceName: string,
  speed: number = 1.0
): Promise<{ audioBuffer: AudioBuffer | null; rawAudio?: Uint8Array; error?: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const realVoiceName = getRealVoiceName(uiVoiceName);
    
    // Using the specialized TTS model
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: realVoiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      return { audioBuffer: null, error: "No audio data returned from LD Engine." };
    }

    const rawAudio = decode(base64Audio);

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 24000
    });

    const audioBuffer = await decodeAudioData(rawAudio, outputAudioContext);

    return { audioBuffer, rawAudio };

  } catch (err: any) {
    console.error("LD Engine Error:", err);
    return { audioBuffer: null, error: err.message || "Unknown error occurred." };
  }
};
