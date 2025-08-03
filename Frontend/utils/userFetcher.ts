interface User {
  id: string;
  name: string;
  username: string;
}

interface UserResponse {
  user: User;
}

interface UsersResponse {
  users: User[];
}

class UserFetcher {
  private static cache = new Map<string, User>();
  private static pendingRequests = new Map<string, Promise<User>>();

  /**
   * Fetch a single user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    // Check cache first
    if (this.cache.has(userId)) {
      return this.cache.get(userId)!;
    }

    // Check if there's already a pending request for this user
    if (this.pendingRequests.has(userId)) {
      return this.pendingRequests.get(userId)!;
    }

    // Create new request
    const request = this.fetchUserFromAPI(userId);
    this.pendingRequests.set(userId, request);

    try {
      const user = await request;
      this.cache.set(userId, user);
      return user;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    } finally {
      this.pendingRequests.delete(userId);
    }
  }

  /**
   * Fetch multiple users by IDs
   */
  static async getUsersByIds(userIds: string[]): Promise<User[]> {
    if (userIds.length === 0) return [];

    // Filter out cached users
    const uncachedIds = userIds.filter(id => !this.cache.has(id));
    const cachedUsers = userIds
      .filter(id => this.cache.has(id))
      .map(id => this.cache.get(id)!);

    if (uncachedIds.length === 0) {
      return cachedUsers;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getUsers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds: uncachedIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UsersResponse = await response.json();
      
      // Cache the new users
      data.users.forEach(user => {
        this.cache.set(user.id, user);
      });

      return [...cachedUsers, ...data.users];
    } catch (error) {
      console.error('Error fetching users:', error);
      return cachedUsers; // Return cached users even if API fails
    }
  }

  /**
   * Clear the cache (useful for testing or when user data might be stale)
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Remove a specific user from cache
   */
  static removeFromCache(userId: string): void {
    this.cache.delete(userId);
  }

  private static async fetchUserFromAPI(userId: string): Promise<User> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getUser/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: UserResponse = await response.json();
    return data.user;
  }
}

export default UserFetcher;
export type { User }; 