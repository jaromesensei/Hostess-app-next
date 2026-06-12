export type Personality = 'Friendly' | 'Playful' | 'Calm' | 'Energetic' | 'Shy' | 'Protective';

export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  gender: 'Male' | 'Female';
  ownerName: string;
  photo: string;
  distance: string;
  personality: Personality[];
  liked: boolean;
}

export const mockDogs: Dog[] = [
  {
    id: '1',
    name: 'Max',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'Male',
    ownerName: 'David',
    photo: 'https://placedog.net/500/500?id=1',
    distance: '0.3 km away',
    personality: ['Friendly', 'Playful', 'Energetic'],
    liked: false,
  },
  {
    id: '2',
    name: 'Luna',
    breed: 'Border Collie',
    age: 2,
    gender: 'Female',
    ownerName: 'Sarah',
    photo: 'https://placedog.net/500/500?id=2',
    distance: '0.5 km away',
    personality: ['Energetic', 'Playful'],
    liked: false,
  },
  {
    id: '3',
    name: 'Buddy',
    breed: 'Labrador',
    age: 4,
    gender: 'Male',
    ownerName: 'Mike',
    photo: 'https://placedog.net/500/500?id=3',
    distance: '0.7 km away',
    personality: ['Friendly', 'Calm'],
    liked: false,
  },
  {
    id: '4',
    name: 'Bella',
    breed: 'French Bulldog',
    age: 1,
    gender: 'Female',
    ownerName: 'Emma',
    photo: 'https://placedog.net/500/500?id=4',
    distance: '1.1 km away',
    personality: ['Playful', 'Shy'],
    liked: false,
  },
  {
    id: '5',
    name: 'Rocky',
    breed: 'German Shepherd',
    age: 5,
    gender: 'Male',
    ownerName: 'Tom',
    photo: 'https://placedog.net/500/500?id=5',
    distance: '1.4 km away',
    personality: ['Protective', 'Calm'],
    liked: false,
  },
  {
    id: '6',
    name: 'Daisy',
    breed: 'Poodle',
    age: 3,
    gender: 'Female',
    ownerName: 'Lisa',
    photo: 'https://placedog.net/500/500?id=6',
    distance: '1.6 km away',
    personality: ['Friendly', 'Calm', 'Shy'],
    liked: false,
  },
  {
    id: '7',
    name: 'Charlie',
    breed: 'Beagle',
    age: 2,
    gender: 'Male',
    ownerName: 'Jake',
    photo: 'https://placedog.net/500/500?id=7',
    distance: '1.9 km away',
    personality: ['Playful', 'Energetic', 'Friendly'],
    liked: false,
  },
  {
    id: '8',
    name: 'Coco',
    breed: 'Shih Tzu',
    age: 6,
    gender: 'Female',
    ownerName: 'Amy',
    photo: 'https://placedog.net/500/500?id=8',
    distance: '2.2 km away',
    personality: ['Calm', 'Shy'],
    liked: false,
  },
  {
    id: '9',
    name: 'Zeus',
    breed: 'Rottweiler',
    age: 4,
    gender: 'Male',
    ownerName: 'Chris',
    photo: 'https://placedog.net/500/500?id=9',
    distance: '2.5 km away',
    personality: ['Protective', 'Calm'],
    liked: false,
  },
  {
    id: '10',
    name: 'Mia',
    breed: 'Cavalier King Charles',
    age: 2,
    gender: 'Female',
    ownerName: 'Rachel',
    photo: 'https://placedog.net/500/500?id=10',
    distance: '2.8 km away',
    personality: ['Friendly', 'Playful', 'Calm'],
    liked: false,
  },
];
