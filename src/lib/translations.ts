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

export const FALLBACK_BUSY: Record<LangCode, string> = {
  en: "Our AI assistant is temporarily busy. Please try again in a moment.",
  ta: "USDX AI உதவியாளர் தற்காலிகமாக பிஸியாக உள்ளது. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.",
  ml: "USDX AI അസിസ്റ്റന്റ് താൽക്കാലികമായി തിരക്കിലാണ്. അൽപ്പസമയത്തിന് ശേഷം വീണ്ടും ശ്രമിക്കുക.",
  kn: "USDX AI ಸಹಾಯಕವು ತಾತ್ಕಾಲಿಕವಾಗಿ ಕಾರ್ಯನಿರತವಾಗಿದೆ. ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
  te: "USDX AI సహాయకుడు తాత్కాలికంగా బిజీగా ఉన్నారు. కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.",
  hi: "USDX AI सहायक फिलहाल व्यस्त है। कृपया थोड़ी देर बाद पुनः प्रयास करें।",
};

export const FALLBACK_UNKNOWN: Record<LangCode, string> = {
  en: "I couldn't find that information in the USDX knowledge base. Please ask about USDX staking, compounding, swap, ranks or official rules.",
  ta: "USDX அறிவுக் களஞ்சியத்தில் அந்தத் தகவலை என்னால் கண்டுபிடிக்க முடியவில்லை. USDX ஸ்டேக்கிங், காம்பவுண்டிங், ஸ்வாப், ரேங்க் அல்லது அதிகாரப்பூர்வ விதிகள் பற்றி கேளுங்கள்.",
  ml: "USDX നോളജ് ബേസിൽ ആ വിവരം എനിക്ക് കണ്ടെത്താനായില്ല. USDX സ്റ്റേക്കിംഗ്, കമ്പൗണ്ടിംഗ്, സ്വാപ്പ്, റാങ്കുകൾ അല്ലെങ്കിൽ ഔദ്യോഗിക നിയമങ്ങളെക്കുറിച്ച് ചോദിക്കുക.",
  kn: "USDX ಜ್ಞಾನದ ಕೋಶದಲ್ಲಿ ಆ ಮಾಹಿತಿಯನ್ನು ನನಗೆ ಕಂಡುಹಿಡಿಯಲಾಗಲಿಲ್ಲ. USDX ಸ್ಟೇಕಿಂಗ್, ಕಾಂಪೌಂಡಿಂಗ್, ಸ್ವಾಪ್, ಶ್ರೇಣಿಗಳು ಅಥವಾ ಅಧಿಕೃತ ನಿಯಮಗಳ ಬಗ್ಗೆ ಕೇಳಿ.",
  te: "USDX నాలెడ్జ్ బేస్లో ఆ సమాచారం నాకు కనుగొనలేకపోయింది. USDX స్టేకింగ్, కంపౌండింగ్, స్వాప్, ర్యాంకులు లేదా అధికారిక నియమాల గురించి అడగండి.",
  hi: "मुझे USDX ज्ञानकोश में वह जानकारी नहीं मिल सकी। कृपया USDX स्टेकिंग, कंपाउंडिंग, स्वैप, रैंक या आधिकारिक नियमों के बारे में पूछें।",
};

export const SWAP_RULES: Record<LangCode, string> = {
  en: "The minimum staking value should be of $1000 then you can swap USDX to DAI in Base app.",
  ta: "ஸ்டேக்கிங்கின் குறைந்தபட்ச மதிப்பு $1000 ஆக இருக்க வேண்டும்; அதன் பிறகு Base செயலியில் USDX ஐ DAI ஆக மாற்றலாம்.",
  ml: "സ്റ്റേക്കിംഗിന്റെ കുറഞ്ഞ മൂല്യം $1000 ആയിരിക്കണം; തുടർന്ന് Base ആപ്പിൽ USDX DAI ആയി മാറ്റാം.",
  kn: "ಸ್ಟೇಕಿಂಗ್ ಕನಿಷ್ಠ ಮೌಲ್ಯವು $1000 ಆಗಿರಬೇಕು; ನಂತರ Base ಅಪ್ಪ್ನಲ್ಲಿ USDX ಅನ್ನು DAI ಆಗಿ ಬದಲಾಯಿಸಬಹುದು.",
  te: "స్టేకింగ్ కనీస విలువ $1000 ఉండాలి; ఆ తర్వాత Base యాప్లో USDX ను DAI గా మార్చుకోవచ్చు.",
  hi: "स्टेकिंग का न्यूनतम मूल्य $1000 होना चाहिए; इसके बाद Base ऐप में USDX को DAI में बदला जा सकता है।",
};
