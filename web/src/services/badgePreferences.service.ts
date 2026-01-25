const buildKey = (userId: string, key: string) => `badgePrefs:${userId}:${key}`;

export const badgePreferencesService = {
  get(userId: string, key: 'saved' | 'list' | 'reqs'): boolean {
    const raw = localStorage.getItem(buildKey(userId, key));
    if (raw === null) return true;
    return raw === 'true';
  },
  set(userId: string, key: 'saved' | 'list' | 'reqs', value: boolean) {
    localStorage.setItem(buildKey(userId, key), value ? 'true' : 'false');
  },
};

