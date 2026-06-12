import { Dog, WelcomeAIContent } from '@/types';
import { getTipsForBreed } from '@/data/tips';
import { getAgeInMonths } from '@/data/mockDogs';

// Set your Gemini API key here or via environment variable
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
const TIMEOUT_MS = 8000;

async function callGemini(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 512,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  } finally {
    clearTimeout(timer);
  }
}

export async function generateWelcomeContent(dog: Dog): Promise<WelcomeAIContent> {
  if (!GEMINI_API_KEY) return getTipsForBreed(dog.breed);

  const ageMonths = getAgeInMonths(dog.birthDate);
  const genderHe = dog.gender === 'male' ? 'זכר' : 'נקבה';
  const neutered = dog.isNeutered
    ? dog.gender === 'male' ? 'מסורס' : 'מעוקרת'
    : 'לא מסורס/ת';

  const prompt = `
אתה מומחה לכלבים ידידותי ואוהב. כתוב תוכן בעברית עבור בעל כלב חדש שהצטרף לאפליקציה Woofy.

פרטי הכלב:
- גזע: ${dog.breed}
- גיל: ${ageMonths} חודשים
- מגדר: ${genderHe} (${neutered})
- אישיות: ${dog.personality.join(', ')}
- רמת אנרגיה: ${dog.energyLevel}/5
- פעילויות: ${dog.activities.join(', ')}

הגב בפורמט JSON בלבד, ללא טקסט נוסף:
{
  "compliment": "מחמאה אישית וחמה על הכלב הזה ספציפית. 2-3 משפטים. תרגיש כמו חבר מבין שאוהב כלבים.",
  "tip": "טיפ מחקרי אחד ספציפי ומעשי לגזע/גיל הזה. משפט אחד ספציפי ומועיל.",
  "tipSource": "שם המקור (כתב עת/אוניברסיטה, שנה)",
  "funFact": "עובדה מפתיעה ומשמחת על הגזע הזה. משפט אחד."
}
`;

  try {
    const raw = await callGemini(prompt);
    // Strip markdown code fences if present
    const clean = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(clean) as WelcomeAIContent;
    if (!parsed.compliment || !parsed.tip) throw new Error('incomplete');
    return parsed;
  } catch {
    return getTipsForBreed(dog.breed);
  }
}

export async function generateMatchInsight(dog1: Dog, dog2: Dog): Promise<string> {
  if (!GEMINI_API_KEY) {
    const sharedActivities = dog1.activities.filter(a => dog2.activities.includes(a));
    const shared = sharedActivities.length > 0 ? sharedActivities[0] : 'טיולים';
    return `${dog1.name} ו${dog2.name} חולקים אהבה ל${shared} ורמת אנרגיה דומה — שילוב מושלם לחברות אמיתית. 🐾`;
  }

  const prompt = `
שני כלבים שיש להם "מאץ'" באפליקציה לכלבים. כתוב 2 משפטים חמים ומשמחים בעברית שמסבירים למה הם מתאימים.

כלב 1: ${dog1.name}, ${dog1.breed}, אישיות: ${dog1.personality.slice(0, 3).join(', ')}, פעילויות: ${dog1.activities.slice(0, 2).join(', ')}
כלב 2: ${dog2.name}, ${dog2.breed}, אישיות: ${dog2.personality.slice(0, 3).join(', ')}, פעילויות: ${dog2.activities.slice(0, 2).join(', ')}

ענה בטקסט בלבד, 2 משפטים, עברית, חם ומשמח.
`;

  try {
    const text = await callGemini(prompt);
    return text.trim() || `${dog1.name} ו${dog2.name} נראים כמו זוג מושלם! 🐾`;
  } catch {
    return `${dog1.name} ו${dog2.name} נראים כמו זוג מושלם! 🐾`;
  }
}
