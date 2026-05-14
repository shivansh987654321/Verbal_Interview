const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

const PREFERRED_VOICES = [
  'Google US English',
  'Samantha',
  'Microsoft Aria Online (Natural) - English (United States)',
  'Microsoft Jenny Online (Natural) - English (United States)',
  'Microsoft Guy Online (Natural) - English (United States)',
  'Alex',
  'Karen',
  'Daniel',
];

let cachedVoice = null;

function pickVoice() {
  if (!synth) return null;
  if (cachedVoice) return cachedVoice;

  const voices = synth.getVoices();
  if (!voices.length) return null;

  for (const name of PREFERRED_VOICES) {
    const match = voices.find((v) => v.name === name);
    if (match) {
      cachedVoice = match;
      return match;
    }
  }

  const enUS = voices.find((v) => v.lang === 'en-US' && !v.localService === false);
  cachedVoice = enUS || voices.find((v) => v.lang?.startsWith('en')) || voices[0];
  return cachedVoice;
}

// Voices load asynchronously in some browsers — refresh cache when they arrive
if (synth && typeof synth.onvoiceschanged !== 'undefined') {
  synth.onvoiceschanged = () => {
    cachedVoice = null;
    pickVoice();
  };
  pickVoice();
}

export function speakText(text) {
  if (!synth || !text) return;

  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  const voice = pickVoice();
  if (voice) utterance.voice = voice;

  synth.speak(utterance);
}

export function cancelSpeech() {
  if (synth) synth.cancel();
}

export function isSpeechSupported() {
  return Boolean(synth);
}
