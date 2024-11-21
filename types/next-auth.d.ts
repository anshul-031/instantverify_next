import 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      firstName: string;
      lastName: string;
      language: string;
      phone: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    language: string;
    phone: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    language: string;
    phone: string;
  }
}
