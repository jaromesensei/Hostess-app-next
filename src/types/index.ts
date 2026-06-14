export interface Dog {
  id: string;
  name: string;
  breed: string;
  birthDate: string;        // ISO date
  gender: 'male' | 'female';
  isNeutered: boolean;
  size: 'xs' | 's' | 'm' | 'l' | 'xl';
  weight: number;           // kg
  furColor: string;
  photos: string[];         // local URIs or remote URLs
  personality: string[];    // tags
  energyLevel: 1 | 2 | 3 | 4 | 5;
  goodWithDogs: boolean;
  goodWithKids: boolean;
  goodWithCats: boolean;
  trained: 'none' | 'basic' | 'advanced';
  activities: string[];
  lookingFor: ('friends' | 'breeding' | 'walks')[];
  searchRadius: number;     // km
  bio: string;
  // owner info (stored alongside dog for MVP)
  ownerName?: string;
  ownerCity?: string;
  ownerPhoto?: string;
}

export interface HealthRecord {
  id: string;
  dogId: string;
  type: 'vaccine' | 'vet_visit' | 'medication' | 'other';
  title: string;
  date: string;
  nextDate?: string;
  notes?: string;
  vetName?: string;
}

export interface Reminder {
  id: string;
  dogId: string;
  type: 'food' | 'walk' | 'medication' | 'vaccine' | 'other';
  title: string;
  time: string;             // HH:MM
  days: string[];           // ['MON','TUE'...]
  isActive: boolean;
  notificationIds?: string[];
}

export interface Match {
  id: string;
  dog: Dog;
  matchedAt: string;
  messages: Message[];
  isRead: boolean;
}

export interface Message {
  id: string;
  senderId: string;         // 'me' or matched dog id
  text: string;
  timestamp: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  ownerName: string;
  photo: string;
  category: 'walker' | 'groomer' | 'trainer' | 'sitter' | 'vet';
  rating: number;
  reviewCount: number;
  priceFrom: number;
  pricePer: 'hour' | 'session' | 'day';
  location: string;
  distanceKm: number;
  isVerified: boolean;
  isAvailable: boolean;
  badges: string[];
  bio: string;
  services: { label: string; price: number; per: string }[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;            // ISO date
  time: string;            // HH:MM
  location: string;
  address: string;
  organizer: string;
  organizerDogPhoto: string;
  category: 'walk' | 'training' | 'meetup' | 'competition';
  emoji: string;
  color: string;
  attendees: number;
  maxAttendees?: number;
  isAttending: boolean;
}

export interface PostComment {
  id: string;
  authorDogName: string;
  authorDogPhoto: string;
  authorOwnerName: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  dogId: string;
  dogName: string;
  dogPhoto: string;
  ownerName: string;
  ownerCity: string;
  photo: string;
  caption: string;
  likes: number;
  likedByMe: boolean;
  comments: PostComment[];
  createdAt: string;
}

export interface Story {
  id: string;
  dogId: string;
  dogName: string;
  dogPhoto: string;
  seen: boolean;
  createdAt: string;
}

export interface PlaceOfInterest {
  id: string;
  name: string;
  category: 'vet' | 'park' | 'beach' | 'cafe' | 'store';
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  isOpen: boolean;
  phone?: string;
  description: string;
  emoji: string;
}

export interface AppState {
  dog: Dog | null;           // active dog (backward compat)
  dogs: Dog[];               // all dogs
  activeDogId: string | null;
  ownerName: string;
  ownerCity: string;
  ownerPhoto: string | null;
  healthRecords: HealthRecord[];
  reminders: Reminder[];
  matches: Match[];
  likedDogIds: string[];
  posts: Post[];               // user-created posts
  isOnboardingComplete: boolean;
  isAddingAnotherDog: boolean; // transient — never persisted
}

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  WelcomeMoment: undefined;
  MainApp: undefined;
};

export type OnboardingStackParamList = {
  Step1: undefined;
  Step2: undefined;
  Step3: undefined;
  Step4: undefined;
  Step5: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Discover: undefined;
  Map: undefined;
  MyDog: undefined;
  Messages: undefined;
};

export type MessagesStackParamList = {
  MatchesList: undefined;
  Chat: { matchId: string };
};

export type WelcomeAIContent = {
  compliment: string;
  tip: string;
  tipSource: string;
  funFact: string;
};
