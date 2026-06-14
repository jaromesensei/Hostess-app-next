import { Event } from '@/types';

const now = Date.now();
const future = (days: number, hour = 8) =>
  new Date(now + days * 86_400_000).toISOString().split('T')[0] +
  `T${String(hour).padStart(2, '0')}:00:00.000Z`;

export const MOCK_EVENTS: Event[] = [
  {
    id: 'ev_1',
    title: 'טיול בוקר בפארק הירקון',
    description:
      'מפגש בוקר לכלבים ובעליהם בפארק הירקון. נתחיל מהכניסה הצפונית, נלך שעה ביחד ונגמור עם קפה. כלבים מכל הגדלים מוזמנים!',
    date: future(2, 7),
    time: '07:30',
    location: 'פארק הירקון – כניסה צפונית',
    address: 'פארק הירקון, תל אביב',
    organizer: 'מיכל ולונה',
    organizerDogPhoto: 'https://placedog.net/100/100?id=3',
    category: 'walk',
    emoji: '🌅',
    color: '#4CAF7D',
    attendees: 23,
    maxAttendees: 40,
    isAttending: false,
  },
  {
    id: 'ev_2',
    title: 'מפגש כלבים גדולים',
    description:
      'בפעם הרביעית! מפגש מיוחד לכלבים גדולים (מעל 20 ק"ג) — לברדורים, גולדנים, האסקים וחברים. שטח פתוח ומגודר, מים ועמדות משחק.',
    date: future(3, 17),
    time: '17:00',
    location: 'פארק מנשיה',
    address: 'שדרות חרברט סמואל, תל אביב',
    organizer: 'יוסי ומקס',
    organizerDogPhoto: 'https://placedog.net/100/100?id=5',
    category: 'meetup',
    emoji: '🐕',
    color: '#E8734A',
    attendees: 31,
    maxAttendees: 50,
    isAttending: true,
  },
  {
    id: 'ev_3',
    title: 'סדנת אג׳יליטי למתחילים',
    description:
      'סדנה בסיסית לאג׳יליטי בהדרכת מאמן מוסמך. מתאים לכלבים שמעולם לא ניסו. ציוד מסופק. הגעה 10 דקות לפני כדי להירשם.',
    date: future(5, 16),
    time: '16:00',
    location: 'מגרש אג׳יליטי רמת גן',
    address: 'פארק רמת גן, קרוב לשער C',
    organizer: 'נועה וקופר',
    organizerDogPhoto: 'https://placedog.net/100/100?id=11',
    category: 'training',
    emoji: '🏆',
    color: '#F5C842',
    attendees: 8,
    maxAttendees: 12,
    isAttending: false,
  },
  {
    id: 'ev_4',
    title: 'בוקר חוף לכלבים',
    description:
      'שעות הבוקר המוקדמות הן הזמן הכי טוב לחוף עם הכלב! נפגש בחוף גורדון לפני שמתחיל הצפוף. גלים, חול ובעלי כלבים כיפיים.',
    date: future(7, 6),
    time: '06:30',
    location: 'חוף גורדון',
    address: 'שדרות נורדאו, תל אביב',
    organizer: 'אבי וריילי',
    organizerDogPhoto: 'https://placedog.net/100/100?id=9',
    category: 'walk',
    emoji: '🏖️',
    color: '#3B8EC5',
    attendees: 14,
    isAttending: false,
  },
  {
    id: 'ev_5',
    title: 'יום הולדת זואי 🎂',
    description:
      'זואי בת שנה! מזמינים את כל הכלבים לחגוג איתנו. יהיה עוגה לכלבים, משחקים ופינוקים. תתלבשו יפה!',
    date: future(10, 15),
    time: '15:00',
    location: 'הגינה שלנו – חיפה',
    address: 'שדרות בן גוריון 12, חיפה',
    organizer: 'דנה וזואי',
    organizerDogPhoto: 'https://placedog.net/100/100?id=13',
    category: 'meetup',
    emoji: '🎂',
    color: '#E85D4A',
    attendees: 19,
    maxAttendees: 25,
    isAttending: false,
  },
  {
    id: 'ev_6',
    title: 'ריצה עם הכלב – 5 ק"מ',
    description:
      'לבעלי כלבים שאוהבים לרוץ! מסלול של 5 ק"מ לאורך הנמל. כלבים שיכולים לרוץ בנוחות יותר מ-30 דקות — בבקשה בואו!',
    date: future(4, 6),
    time: '06:00',
    location: 'נמל תל אביב',
    address: 'נמל תל אביב, שדרות נמל תל אביב',
    organizer: 'דניאל ונודי',
    organizerDogPhoto: 'https://placedog.net/100/100?id=1',
    category: 'walk',
    emoji: '🏃',
    color: '#2C4A3E',
    attendees: 11,
    maxAttendees: 20,
    isAttending: false,
  },
  {
    id: 'ev_7',
    title: 'תחרות כלבים חמודים',
    description:
      'תחרות ידידותית — מי הכלב הכי חמוד? קטגוריות: גורים, כלבים בינוניים, כלבים גדולים וכלבים מגיל שנה. פרסים לכולם!',
    date: future(14, 11),
    time: '11:00',
    location: 'כיכר דיזנגוף, תל אביב',
    address: 'כיכר דיזנגוף, תל אביב',
    organizer: 'שירה ובלה',
    organizerDogPhoto: 'https://placedog.net/100/100?id=7',
    category: 'competition',
    emoji: '🥇',
    color: '#F5C842',
    attendees: 42,
    maxAttendees: 60,
    isAttending: false,
  },
];

export function formatEventDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const weekdays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const weekday = weekdays[d.getDay()];
  return `${weekday} ${day}.${month}`;
}
