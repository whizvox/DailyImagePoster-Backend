import { User } from "./user/user.ts";

const AuthLevel = {
  // not logged in
  GUEST: 1,
  // using Basic authorization (username:password)
  BASIC: 2,
  // using access token (default)
  BEARER: 3,
} as const;

type AuthLevel = (typeof AuthLevel)[keyof typeof AuthLevel];

class Authentication {
  user: User | null;
  level: AuthLevel;

  constructor(user: User | null, level: AuthLevel) {
    this.user = user;
    this.level = level;
  }
}

const guestAuth = () => {
  return new Authentication(null, AuthLevel.GUEST);
};

export { AuthLevel, Authentication, guestAuth };
