export type MagnetColor =
  | "coral"
  | "pink"
  | "blue"
  | "amber"
  | "teal"
  | "purple";

export interface Profile {
  id: string;
  name: string;
  email: string;
  homeLat: number;
  homeLng: number;
  homeLabel: string;
  mapPublic: boolean;
  fridgeId?: string; // Unique fridge ID like "fridge-4234"
}

export interface Magnet {
  id: string;
  userId: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  caption: string;
  instagramUrl?: string;
  /** Data URL or remote URL of the background-removed cutout. */
  photoUrl: string;
  /** Optional trip photo displayed full-screen in the story viewer. */
  tripPhotoUrl?: string;
  /** Placeholder accent color used before a photo exists. */
  color: MagnetColor;
  verified: boolean;
  /** Slight hand-placed rotation, degrees. */
  rotation: number;
  /** Size multiplier chosen when the magnet was made (1 = default). */
  scale?: number;
  /**
   * Persisted position of the tile's center on the fridge door, as a fraction
   * [0,1] of the door canvas (posX = left→right, posY = top→bottom). Assigned a
   * random, non-overlapping spot the first time the fridge is viewed; updated
   * when the owner long-presses and drags the magnet. Undefined for magnets
   * created before this feature — they get placed on next view.
   */
  posX?: number;
  posY?: number;
  createdAt: number;
}

/** A public fridge as surfaced on the shared map. */
export interface PublicFridge {
  profile: Profile;
  magnets: Magnet[];
}
