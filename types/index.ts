export enum Role {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  role: Role;
  createdAt: string;
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
}

export enum SwimLevel {
  TOP = 'TOP',
  MIDDLE = 'MIDDLE',
  BOTTOM = 'BOTTOM',
  ALL = 'ALL',
}

export interface FishCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
}

export interface Fish {
  id: string;
  slug: string;
  nameVi: string;
  nameEn?: string;
  scientificName?: string;
  images?: string[];
  categoryId: string;
  category?: FishCategory;
  sizeMin?: number;
  sizeMax?: number;
  lifespan?: string;
  difficulty: DifficultyLevel;
  tempMin?: number;
  tempMax?: number;
  phMin?: number;
  phMax?: number;
  ghMin?: number;
  ghMax?: number;
  khMin?: number;
  khMax?: number;
  minTankSize?: number;
  swimLevel: SwimLevel;
  temperament?: string;
  diet?: string;
  compatibleFish?: string;
  incompatibleFish?: string;
  commonDiseases?: string;
  description?: string;
  createdAt: string;
}

export interface Tank {
  id: string;
  name: string;
  ownerId: string;
  owner?: User;
  coverImage?: string;
  length?: number;
  width?: number;
  height?: number;
  volume?: number;
  ph?: number;
  temperature?: number;
  isPublic: boolean;
  description?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  content: string;
  category?: string;
  images?: string[];
  authorId: string;
  author?: User;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt: string;
}

export interface Question {
  id: string;
  title: string;
  slug: string;
  content: string;
  images?: string[];
  authorId: string;
  author?: User;
  tags?: string[];
  answersCount: number;
  viewsCount: number;
  isSolved: boolean;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category?: string;
  coverImage?: string;
  authorId: string;
  author?: User;
  viewsCount: number;
  publishedAt: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  data: T;
  message?: string;
}

export enum ListingStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  REJECTED = 'REJECTED',
  HIDDEN = 'HIDDEN',
}

export enum ListingCondition {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  USED = 'USED',
}

export enum PriceType {
  FIXED = 'FIXED',
  NEGOTIABLE = 'NEGOTIABLE',
  CONTACT = 'CONTACT',
  GIVEAWAY = 'GIVEAWAY',
}

export interface ListingCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  createdAt?: string;
}

export interface ListingComment {
  id: string;
  content: string;
  userId: string;
  user?: User;
  listingId: string;
  parentId?: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  priceType: PriceType;
  condition: ListingCondition;
  status: ListingStatus;
  images?: string[];
  videoUrl?: string;
  contactName: string;
  contactPhone: string;
  contactZalo?: string;
  province: string;
  district: string;
  ward?: string;
  streetAddress?: string;
  oldAddressNote?: string;
  shippingAvailable: boolean;
  shippingNote?: string;
  views: number;
  likesCount: number;
  commentsCount: number;
  isPinned: boolean;
  isLiked?: boolean;
  userId: string;
  user?: User;
  categoryId?: string;
  category?: ListingCategory;
  comments?: ListingComment[];
  createdAt: string;
  updatedAt: string;
}
