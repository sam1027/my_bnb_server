export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: string;
  }
  
  export interface StateWithUser {
    user?: AuthUser | null;
  }
  