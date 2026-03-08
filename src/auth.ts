import { User } from "./user/user";

enum AuthLevel {
  // not logged in
  GUEST = 1,
  // using Basic authorization (username:password)
  BASIC,
  // using access token (default)
  BEARER,
}

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
