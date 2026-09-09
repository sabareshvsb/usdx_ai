export type LangCode = "en" | "ta" | "ml" | "kn" | "te" | "hi";

export const LANG_CODES: LangCode[] = ["en", "ta", "ml", "kn", "te", "hi"];

export function normalizeLang(language?: string): LangCode {
  const code = (language ?? "en").toLowerCase();
  if (LANG_CODES.includes(code as LangCode)) return code as LangCode;
  const base = code.split("-")[0];
  if (LANG_CODES.includes(base as LangCode)) return base as LangCode;
  return "en";
}

export const FALLBACK_TEXT: Record<LangCode, string> = {
  en: "Please ask a question about the USDX ecosystem — staking, compounding, swaps, ranks, rules or documentation.",
  ta: "USDX சூழலமைப்பு பற்றி ஒரு கேள்வியைக் கேளுங்கள் — ஸ்டேக்கிங், காம்பவுண்டிங், ஸ்வாப், ரேங்குகள், விதிகள் அல்லது ஆவணங்கள்.",
  ml: "USDX ആവാസവ്യവസ്ഥയെക്കുറിച്ച് ഒരു ചോദ്യം ചോദിക്കുക — സ്റ്റേക്കിംഗ്, കമ്പൗണ്ടിംഗ്, സ്വാപ്പ്, റാങ്കുകൾ, നിയമങ്ങൾ അല്ലെങ്കിൽ ഡോക്യുമെന്റേഷൻ.",
  kn: "USDX ಪರಿಸರ ವ್ಯವಸ್ಥೆಯ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ — ಸ್ಟೇಕಿಂಗ್, ಕಾಂಪೌಂಡಿಂಗ್, ಸ್ವಾಪ್, ಶ್ರೇಣಿಗಳು, ನಿಯಮಗಳು ಅಥವಾ ದಾಖಲೆಗಳು.",
  te: "USDX పర్యావరణ వ్యవస్థ గురించి ఒక ప్రశ్న అడగండి — స్టేకింగ్, కంపౌండింగ్, స్వాప్, ర్యాంకులు, నియమాలు లేదా డాక్యుమెంటేషన్.",
  hi: "USDX पारिस्थितिकी तंत्र के बारे में प्रश्न पूछें — स्टेकिंग, कंपाउंडिंग, स्वैप, रैंक, नियम या दस्तावेज़।",
};

export const FALLBACK_UNKNOWN: Record<LangCode, string> = {
  en: "I couldn't find that information in the USDX knowledge base. Please ask about USDX staking, compounding, swap, ranks or official rules.",
  ta: "USDX அறிவுக் களஞ்சியத்தில் அந்தத் தகவலை என்னால் கண்டுபிடிக்க முடியவில்லை. USDX ஸ்டேக்கிங், காம்பவுண்டிங், ஸ்வாப், ரேங்க் அல்லது அதிகாரப்பூர்வ விதிகள் பற்றி கேளுங்கள்.",
  ml: "USDX നോളജ് ബേസിൽ ആ വിവരം എനിക്ക് കണ്ടെത്താനായില്ല. USDX സ്റ്റേക്കിംഗ്, കമ്പൗണ്ടിംഗ്, സ്വാപ്പ്, റാങ്കുകൾ അല്ലെങ്കിൽ ഔദ്യോഗിക നിയമങ്ങളെക്കുറിച്ച് ചോദിക്കുക.",
  kn: "USDX ಜ್ಞಾನದ ಕೋಶದಲ್ಲಿ ಆ ಮಾಹಿತಿಯನ್ನು ನನಗೆ ಕಂಡುಹಿಡಿಯಲಾಗಲಿಲ್ಲ. USDX ಸ್ಟೇಕಿಂಗ್, ಕಾಂಪೌಂಡಿಂಗ್, ಸ್ವಾಪ್, ಶ್ರೇಣಿಗಳು ಅಥವಾ ಅಧಿಕೃತ ನಿಯಮಗಳ ಬಗ್ಗೆ ಕೇಳಿ.",
  te: "USDX నాలెడ్జ్ బేస్లో ఆ సమాచారం నాకు కనుగొనలేకపోయింది. USDX స్టేకింగ్, కంపౌండింగ్, స్వాప్, ర్యాంకులు లేదా అధికారిక నియమాల గురించి అడగండి.",
  hi: "मुझे USDX ज्ञानकोश में वह जानकारी नहीं मिल सकी। कृपया USDX स्टेकिंग, कंपाउंडिंग, स्वैप, रैंक या आधिकारिक नियमों के बारे में पूछें।",
};
