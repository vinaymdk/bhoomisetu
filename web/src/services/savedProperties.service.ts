const buildKey = (userId: string) => `savedPropertyIds:${userId}`;

export const savedPropertiesService = {
  getSavedIds(userId: string): string[] {
    try {
      const raw = localStorage.getItem(buildKey(userId));
      if (!raw) return [];
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  },
  isSaved(userId: string, propertyId: string): boolean {
    const ids = this.getSavedIds(userId);
    return ids.includes(propertyId);
  },
  save(userId: string, propertyId: string) {
    const ids = this.getSavedIds(userId);
    if (!ids.includes(propertyId)) {
      ids.push(propertyId);
      localStorage.setItem(buildKey(userId), JSON.stringify(ids));
    }
  },
  remove(userId: string, propertyId: string) {
    const ids = this.getSavedIds(userId).filter((id) => id !== propertyId);
    localStorage.setItem(buildKey(userId), JSON.stringify(ids));
  },
  toggle(userId: string, propertyId: string): boolean {
    const ids = this.getSavedIds(userId);
    if (ids.includes(propertyId)) {
      const next = ids.filter((id) => id !== propertyId);
      localStorage.setItem(buildKey(userId), JSON.stringify(next));
      return false;
    }
    ids.push(propertyId);
    localStorage.setItem(buildKey(userId), JSON.stringify(ids));
    return true;
  },
};

