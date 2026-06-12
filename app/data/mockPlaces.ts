export type PlaceCategory = 'vet' | 'park' | 'beach' | 'cafe';

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  address: string;
  rating: number;
  isOpen: boolean;
  emoji: string;
}

export const mockPlaces: Place[] = [
  {
    id: '1',
    name: 'Happy Paws Vet Clinic',
    category: 'vet',
    address: '14 Herzl St, Tel Aviv',
    rating: 4.8,
    isOpen: true,
    emoji: '🏥',
  },
  {
    id: '2',
    name: 'City Animal Hospital',
    category: 'vet',
    address: '7 Dizengoff St, Tel Aviv',
    rating: 4.6,
    isOpen: true,
    emoji: '🏥',
  },
  {
    id: '3',
    name: 'Dr. Bark Veterinary',
    category: 'vet',
    address: '22 Ben Yehuda St, Tel Aviv',
    rating: 4.5,
    isOpen: false,
    emoji: '🏥',
  },
  {
    id: '4',
    name: 'Hayarkon Dog Park',
    category: 'park',
    address: 'Hayarkon Park, Tel Aviv',
    rating: 4.9,
    isOpen: true,
    emoji: '🌳',
  },
  {
    id: '5',
    name: 'Sarona Green Space',
    category: 'park',
    address: 'Sarona Market, Tel Aviv',
    rating: 4.4,
    isOpen: true,
    emoji: '🌳',
  },
  {
    id: '6',
    name: 'Ramat Gan Dog Park',
    category: 'park',
    address: 'Safari Rd, Ramat Gan',
    rating: 4.7,
    isOpen: true,
    emoji: '🌳',
  },
  {
    id: '7',
    name: 'Gordon Beach Dog Zone',
    category: 'beach',
    address: 'Gordon Beach, Tel Aviv',
    rating: 4.6,
    isOpen: true,
    emoji: '🏖️',
  },
  {
    id: '8',
    name: 'Herzliya Dog Beach',
    category: 'beach',
    address: 'Marina Beach, Herzliya',
    rating: 4.8,
    isOpen: false,
    emoji: '🏖️',
  },
  {
    id: '9',
    name: 'Woof & Brew Cafe',
    category: 'cafe',
    address: '5 Sheinkin St, Tel Aviv',
    rating: 4.7,
    isOpen: true,
    emoji: '☕',
  },
  {
    id: '10',
    name: 'Pup Cup Coffee',
    category: 'cafe',
    address: '18 Rothschild Blvd, Tel Aviv',
    rating: 4.5,
    isOpen: true,
    emoji: '☕',
  },
];
