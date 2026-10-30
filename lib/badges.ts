export interface Badge {
  id: string;
  name: string;
  detail: string;
  earned: boolean;
}

/** Badges are worked out from data the account already has, so nothing extra is stored. */
export function computeBadges(input: {
  createdAt: string;
  universesJoined: number;
  favourites: number;
  hasAvatar: boolean;
  hasName: boolean;
}): Badge[] {
  const year = new Date(input.createdAt).getFullYear();
  return [
    { id: 'founding', name: 'Founding fan', detail: 'Joined in the first year of MySparkthunder.', earned: year <= 2026 },
    { id: 'universe', name: 'Universe traveller', detail: 'Joined a Sparkthunder universe.', earned: input.universesJoined >= 1 },
    { id: 'multi', name: 'Multiverse member', detail: 'Joined two or more universes.', earned: input.universesJoined >= 2 },
    { id: 'collector', name: 'Collector', detail: 'Saved 10 favourites.', earned: input.favourites >= 10 },
    { id: 'profile', name: 'Face to the name', detail: 'Added a display name and picture.', earned: input.hasAvatar && input.hasName },
  ];
}
