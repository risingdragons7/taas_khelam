export type Language = 'en' | 'ne' | 'hi';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    callBreak: 'Call Break',
    yourBid: 'Your bid',
    playCard: 'Play Card',
    doubleClick: 'Double-click to play',
    dragToCenter: 'Drag to center',
    thinking: 'thinking...',
    roundComplete: 'Round Complete',
    gameInProgress: 'Game in Progress',
    startNew: 'Yes, New Game',
    continue: 'Continue',
    menu: 'Menu',
    showLastTrick: 'Show Last Trick',
    newGame: 'New Game',
    howToPlay: 'How to Play',
    settings: 'Settings',
    close: 'Close',
    leave: 'Leave',
    language: 'Language',
    autoSort: 'Auto-Sort Hand',
    scoreboard: 'Scoreboard',
    bid: 'Bid',
    tricks: 'Tricks',
    portraitPrompt: 'For best experience, rotate to landscape',
    resumeGame: 'Resume previous game?',
  },
  ne: {
    callBreak: 'कल ब्रेक',
    yourBid: 'तपाईंको बिड',
    playCard: 'तास खेल्नुहोस्',
    doubleClick: 'दोबल क्लिक गरेर खेल्नुहोस्',
    dragToCenter: 'केन्द्रमा तान्नुहोस्',
    thinking: 'सोच्दैछ...',
    roundComplete: 'राउन्ड सकियो',
    gameInProgress: 'खेल चलिरहेको छ',
    startNew: 'हो, नयाँ खेल',
    continue: 'जारी राख्नुहोस्',
    menu: 'मेनु',
    showLastTrick: 'अन्तिम ट्रिक हेर्नुहोस्',
    newGame: 'नयाँ खेल',
    howToPlay: 'कसरी खेल्ने',
    settings: 'सेटिङ्ग्स',
    close: 'बन्द गर्नुहोस्',
    leave: 'छोड्नुहोस्',
    language: 'भाषा',
    autoSort: 'हात सर्ट गर्नुहोस्',
    scoreboard: 'स्कोरबोर्ड',
    bid: 'बिड',
    tricks: 'ट्रिक्स',
    portraitPrompt: 'राम्रो अनुभवका लागि ल्यान्डस्केपमा घुमाउनुहोस्',
    resumeGame: 'अघिल्लो खेल जारी राख्ने?',
  },
  hi: {
    callBreak: 'कॉल ब्रेक',
    yourBid: 'आपकी बिड',
    playCard: 'पत्ता खेलें',
    doubleClick: 'डबल क्लिक से खेलें',
    dragToCenter: 'केंद्र में खींचें',
    thinking: 'सोच रहा है...',
    roundComplete: 'राउंड पूरा',
    gameInProgress: 'खेल चल रहा है',
    startNew: 'हाँ, नया खेल',
    continue: 'जारी रखें',
    menu: 'मेनू',
    showLastTrick: 'आखिरी ट्रिक दिखाएं',
    newGame: 'नया खेल',
    howToPlay: 'कैसे खेलें',
    settings: 'सेटिंग्स',
    close: 'बंद करें',
    leave: 'छोड़ें',
    language: 'भाषा',
    autoSort: 'हाथ सॉर्ट करें',
    scoreboard: 'स्कोरबोर्ड',
    bid: 'बिड',
    tricks: 'ट्रिक्स',
    portraitPrompt: 'बेहतर अनुभव के लिए लैंडस्केप में घुमाएं',
    resumeGame: 'पिछला खेल जारी रखें?',
  },
};

export function getLanguage(): Language {
  const saved = localStorage.getItem('cardverse-language');
  if (saved === 'ne' || saved === 'hi' || saved === 'en') return saved;
  return 'en';
}

export function setLanguage(lang: Language) {
  localStorage.setItem('cardverse-language', lang);
}

export function t(key: string, lang?: Language): string {
  const l = lang || getLanguage();
  return translations[l][key] || translations.en[key] || key;
}
