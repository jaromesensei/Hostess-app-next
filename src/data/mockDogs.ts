import { Dog } from '@/types';

// 12 realistic Israeli dogs — mix of breeds, sizes, ages, personalities
// Photos via placedog.net (unique seed per dog)
export const MOCK_DOGS: Dog[] = [
  {
    id: 'dog_001',
    name: 'נודי',
    breed: 'גולדן רטריבר',
    birthDate: '2021-03-14',
    gender: 'male',
    isNeutered: true,
    size: 'l',
    weight: 32,
    furColor: 'זהוב',
    photos: [
      'https://placedog.net/500/600?id=1',
      'https://placedog.net/500/600?id=2',
    ],
    personality: ['😊 ידידותי', '🤗 חברותי', '🎾 שובבי', '🧠 חכם'],
    energyLevel: 4,
    goodWithDogs: true,
    goodWithKids: true,
    goodWithCats: false,
    trained: 'advanced',
    activities: ['ריצה', 'פריסבי', 'שחייה', 'טיולים'],
    lookingFor: ['friends', 'walks'],
    searchRadius: 10,
    bio: 'נודי הוא כלב שמח ואנרגטי שאוהב את כולם. הוא מחפש חברים לטיולים בפארק ולסשנים של פריסבי. מוכשר בציוויים בסיסיים ומתקדמים. אוהב מים ותמיד מוכן להרפתקה חדשה.',
    ownerName: 'דניאל',
    ownerCity: 'תל אביב',
  },
  {
    id: 'dog_002',
    name: 'לונה',
    breed: 'בורדר קולי',
    birthDate: '2020-07-22',
    gender: 'female',
    isNeutered: true,
    size: 'm',
    weight: 18,
    furColor: 'שחור ולבן',
    photos: [
      'https://placedog.net/500/600?id=3',
      'https://placedog.net/500/600?id=4',
    ],
    personality: ['🧠 חכם', '⚡ אנרגטי', '🏔️ הרפתקן', '🎾 שובבי'],
    energyLevel: 5,
    goodWithDogs: true,
    goodWithKids: true,
    goodWithCats: true,
    trained: 'advanced',
    activities: ['אגיליטי', 'פריסבי', 'ריצה', 'אילוף'],
    lookingFor: ['walks', 'friends'],
    searchRadius: 15,
    bio: 'לונה היא בורדר קולי חכמה ומהירה שזקוקה לאתגר מנטלי כל יום. אלופת אגיליטי אזורית. מחפשת בעלי כלבים שאוהבים לזוז ולאתגר את הכלב שלהם.',
    ownerName: 'מיכל',
    ownerCity: 'הרצליה',
  },
  {
    id: 'dog_003',
    name: 'באדי',
    breed: 'פרנץ\' בולדוג',
    birthDate: '2022-11-05',
    gender: 'male',
    isNeutered: false,
    size: 's',
    weight: 11,
    furColor: 'אפור',
    photos: [
      'https://placedog.net/500/600?id=5',
      'https://placedog.net/500/600?id=6',
    ],
    personality: ['😌 רגוע', '🤗 חברותי', '😊 ידידותי'],
    energyLevel: 2,
    goodWithDogs: true,
    goodWithKids: true,
    goodWithCats: true,
    trained: 'basic',
    activities: ['טיולים', 'הנחה'],
    lookingFor: ['friends', 'breeding'],
    searchRadius: 8,
    bio: 'באדי הוא פרנץ\' בולדוג שאוהב חברה ושינה בחלקים שווים. מחפש כלבה לזיווג אחראי עם בדיקות בריאות. שמח לפגוש חברים חדשים בפארק הקרוב.',
    ownerName: 'אורי',
    ownerCity: 'רמת גן',
  },
  {
    id: 'dog_004',
    name: 'זוז',
    breed: 'ביגל',
    birthDate: '2019-04-18',
    gender: 'female',
    isNeutered: true,
    size: 'm',
    weight: 14,
    furColor: 'שלוש-צבעים',
    photos: [
      'https://placedog.net/500/600?id=7',
      'https://placedog.net/500/600?id=8',
    ],
    personality: ['🐽 סנפר', '🏔️ הרפתקן', '⚡ אנרגטי', '😊 ידידותי'],
    energyLevel: 4,
    goodWithDogs: true,
    goodWithKids: true,
    goodWithCats: false,
    trained: 'basic',
    activities: ['סנופרינג', 'ציד', 'טיולים', 'ריצה'],
    lookingFor: ['friends', 'walks'],
    searchRadius: 12,
    bio: 'זוז היא ביגל סקרנית שחייה עם האף שלה. כל טיול הוא הרפתקה חדשה. מחפשת חברים לטיולים ארוכים בטבע ולסשנים של סנופרינג.',
    ownerName: 'שירה',
    ownerCity: 'נתניה',
  },
  {
    id: 'dog_005',
    name: 'מאקס',
    breed: 'ג\'רמן שפרד',
    birthDate: '2020-01-30',
    gender: 'male',
    isNeutered: true,
    size: 'xl',
    weight: 38,
    furColor: 'שחור וחום',
    photos: [
      'https://placedog.net/500/600?id=9',
      'https://placedog.net/500/600?id=10',
    ],
    personality: ['🛡️ מגן', '🧠 חכם', '😊 ידידותי', '⚡ אנרגטי'],
    energyLevel: 4,
    goodWithDogs: true,
    goodWithKids: true,
    goodWithCats: false,
    trained: 'advanced',
    activities: ['ריצה', 'אילוף', 'טיולים', 'אגיליטי'],
    lookingFor: ['walks', 'friends'],
    searchRadius: 20,
    bio: 'מאקס הוא ג\'רמן שפרד נאמן וחכם. עבר אילוף מקצועי ויודע עשרות פקודות. מחפש שותפים לריצה בבוקר ולטיולים ארוכים בסוף שבוע.',
    ownerName: 'אמיר',
    ownerCity: 'פתח תקווה',
  },
  {
    id: 'dog_006',
    name: 'קיצ\'ין',
    breed: 'שיצו',
    birthDate: '2021-09-12',
    gender: 'female',
    isNeutered: true,
    size: 'xs',
    weight: 5,
    furColor: 'לבן',
    photos: [
      'https://placedog.net/500/600?id=11',
      'https://placedog.net/500/600?id=12',
    ],
    personality: ['🙈 ביישן', '😌 רגוע', '🤗 חברותי'],
    energyLevel: 2,
    goodWithDogs: true,
    goodWithKids: false,
    goodWithCats: true,
    trained: 'basic',
    activities: ['טיולים', 'הנחה'],
    lookingFor: ['friends'],
    searchRadius: 5,
    bio: 'קיצ\'ין היא שיצו עדינה ומתוקה. קצת ביישנית בהתחלה אבל מתחממת מהר. אוהבת כלבים קטנים ורגועים כמוה. מחפשת חברות לטיולים קצרים בשכונה.',
    ownerName: 'רחל',
    ownerCity: 'תל אביב',
  },
  {
    id: 'dog_007',
    name: 'אריה',
    breed: 'ויזלה',
    birthDate: '2022-05-20',
    gender: 'male',
    isNeutered: false,
    size: 'l',
    weight: 27,
    furColor: 'חום-זהוב',
    photos: [
      'https://placedog.net/500/600?id=13',
      'https://placedog.net/500/600?id=14',
    ],
    personality: ['❤️ אוהבני', '⚡ אנרגטי', '🏔️ הרפתקן', '🧠 חכם'],
    energyLevel: 5,
    goodWithDogs: true,
    goodWithKids: true,
    goodWithCats: false,
    trained: 'basic',
    activities: ['ריצה', 'שחייה', 'ציד', 'טיולים'],
    lookingFor: ['friends', 'walks', 'breeding'],
    searchRadius: 25,
    bio: 'אריה הוא ויזלה אנרגטי וחייכן שדורש הרבה פעילות. מחפש כלבים לריצות בוקר ולשחייה בים. פתוח גם לזיווג אחראי עם בדיקות מתאימות.',
    ownerName: 'יואב',
    ownerCity: 'תל אביב',
  },
  {
    id: 'dog_008',
    name: 'נמרה',
    breed: 'דלמטי',
    birthDate: '2020-12-01',
    gender: 'female',
    isNeutered: true,
    size: 'l',
    weight: 24,
    furColor: 'מנוקד',
    photos: [
      'https://placedog.net/500/600?id=15',
      'https://placedog.net/500/600?id=16',
    ],
    personality: ['🎾 שובבי', '⚡ אנרגטי', '🤗 חברותי', '🎵 מוצלח'],
    energyLevel: 4,
    goodWithDogs: true,
    goodWithKids: true,
    goodWithCats: true,
    trained: 'advanced',
    activities: ['ריצה', 'אגיליטי', 'שחייה', 'פריסבי'],
    lookingFor: ['walks', 'friends'],
    searchRadius: 18,
    bio: 'נמרה היא דלמטי בולטת ואנרגטית. אלופת אגיליטי מזה שנתיים. מחפשת ריצות ארוכות ואתגרים חדשים. היא מתחברת מעולה עם כל כלב שאוהב לזוז.',
    ownerName: 'מאיה',
    ownerCity: 'גבעתיים',
  },
  {
    id: 'dog_009',
    name: 'טוביה',
    breed: 'פודל מיניאטורי',
    birthDate: '2018-08-25',
    gender: 'male',
    isNeutered: true,
    size: 's',
    weight: 7,
    furColor: 'שחור',
    photos: [
      'https://placedog.net/500/600?id=17',
      'https://placedog.net/500/600?id=18',
    ],
    personality: ['🧠 חכם', '😊 ידידותי', '🎵 מוצלח', '🤗 חברותי'],
    energyLevel: 3,
    goodWithDogs: true,
    goodWithKids: true,
    goodWithCats: true,
    trained: 'advanced',
    activities: ['אילוף', 'הנחה', 'טיולים', 'סנופרינג'],
    lookingFor: ['friends'],
    searchRadius: 10,
    bio: 'טוביה הוא פודל מיניאטורי חכם ומשכיל. יודע לבצע טריקים מרשימים ומסיים כל מה שמתחיל. מחפש חברים חדשים לטיולים ולשיחות בפארק.',
    ownerName: 'נועה',
    ownerCity: 'רמת השרון',
  },
  {
    id: 'dog_010',
    name: 'ג\'ינג\'ר',
    breed: 'קוקר ספנייל',
    birthDate: '2021-02-14',
    gender: 'female',
    isNeutered: true,
    size: 'm',
    weight: 13,
    furColor: 'זהוב',
    photos: [
      'https://placedog.net/500/600?id=19',
      'https://placedog.net/500/600?id=20',
    ],
    personality: ['😊 ידידותי', '🌊 אוהב מים', '🤗 חברותי', '🙈 ביישן'],
    energyLevel: 3,
    goodWithDogs: true,
    goodWithKids: true,
    goodWithCats: true,
    trained: 'basic',
    activities: ['שחייה', 'טיולים', 'הנחה'],
    lookingFor: ['friends', 'walks'],
    searchRadius: 8,
    bio: 'ג\'ינג\'ר היא קוקר ספנייל מתוקה שמאוהבת במים. כל יום שישי שחייה בנחל. מחפשת כלבים שאוהבים מים ונסיעות לטבע.',
    ownerName: 'ליאת',
    ownerCity: 'כפר סבא',
  },
  {
    id: 'dog_011',
    name: 'רוקי',
    breed: 'בוקסר',
    birthDate: '2022-07-07',
    gender: 'male',
    isNeutered: false,
    size: 'l',
    weight: 30,
    furColor: 'חום',
    photos: [
      'https://placedog.net/500/600?id=21',
      'https://placedog.net/500/600?id=22',
    ],
    personality: ['⚡ אנרגטי', '😊 ידידותי', '🎾 שובבי', '🛡️ מגן'],
    energyLevel: 5,
    goodWithDogs: true,
    goodWithKids: true,
    goodWithCats: false,
    trained: 'basic',
    activities: ['ריצה', 'טיולים', 'פריסבי'],
    lookingFor: ['friends', 'walks', 'breeding'],
    searchRadius: 15,
    bio: 'רוקי הוא בוקסר עם אנרגיה אינסופית וחיוך תמידי. ילד שמח שאוהב לשחק עם כולם. מחפש כלבים גדולים לריצות ולמשחקים. פתוח לזיווג אחראי.',
    ownerName: 'בן',
    ownerCity: 'בת ים',
  },
  {
    id: 'dog_012',
    name: 'ברונו',
    breed: 'לברדור רטריבר',
    birthDate: '2019-11-11',
    gender: 'male',
    isNeutered: true,
    size: 'l',
    weight: 35,
    furColor: 'שחור',
    photos: [
      'https://placedog.net/500/600?id=23',
      'https://placedog.net/500/600?id=24',
    ],
    personality: ['😊 ידידותי', '🤗 חברותי', '🌊 אוהב מים', '👶 אוהב ילדים'],
    energyLevel: 3,
    goodWithDogs: true,
    goodWithKids: true,
    goodWithCats: true,
    trained: 'advanced',
    activities: ['שחייה', 'טיולים', 'הנחה', 'ריצה'],
    lookingFor: ['friends', 'walks'],
    searchRadius: 20,
    bio: 'ברונו הוא לברדור שחור עם לב זהב. כלב משפחה מושלם שאוהב כל אחד. מחפש חברים לטיולים בחוף ולשחייה. הוא הכי מאושר כשכולם מסביבו.',
    ownerName: 'גל',
    ownerCity: 'תל אביב',
  },
];

// Helper to calculate age in months from ISO date
export function getAgeInMonths(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  return (
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth())
  );
}

// Helper to get human-readable age string (Hebrew)
export function getAgeString(birthDate: string): string {
  const months = getAgeInMonths(birthDate);
  if (months < 12) {
    return `${months} חודשים`;
  }
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) {
    return `${years} ${years === 1 ? 'שנה' : 'שנים'}`;
  }
  return `${years} ${years === 1 ? 'שנה' : 'שנים'} ו-${rem} חודשים`;
}

// Compatibility score between two dogs (0-100)
export function compatibilityScore(dogA: Dog, dogB: Dog): number {
  let score = 50;

  // Shared activities
  const sharedActivities = dogA.activities.filter(a => dogB.activities.includes(a));
  score += sharedActivities.length * 5;

  // Shared personality
  const sharedPersonality = dogA.personality.filter(p => dogB.personality.includes(p));
  score += sharedPersonality.length * 4;

  // Energy level proximity
  const energyDiff = Math.abs(dogA.energyLevel - dogB.energyLevel);
  score += (4 - energyDiff) * 3;

  // Good with dogs
  if (dogA.goodWithDogs && dogB.goodWithDogs) score += 5;

  // Shared goals
  const sharedGoals = dogA.lookingFor.filter(g => dogB.lookingFor.includes(g));
  score += sharedGoals.length * 5;

  return Math.min(100, Math.max(40, score));
}
