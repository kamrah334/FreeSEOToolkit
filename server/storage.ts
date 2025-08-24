// Simple storage interface for SEO toolbox
// Since we don't need user authentication for this app,
// this file is kept minimal

export interface IStorage {
  // This can be extended later if needed
}

export class MemStorage implements IStorage {
  constructor() {
    // Storage implementation can be added here if needed
  }
}

export const storage = new MemStorage();
