class User {
  id: string;
  name: string;
  admin: boolean;
  created: Date;
  tokenExpires: Date | null;

  constructor(id: string, name: string, admin: boolean, created: Date, tokenExpires: Date | null) {
    this.id = id;
    this.name = name;
    this.admin = admin;
    this.created = created;
    this.tokenExpires = tokenExpires;
  }
}

class SecretUser extends User {
  password: string;
  accessToken: string | null;

  constructor(
    id: string,
    name: string,
    password: string,
    admin: boolean,
    created: Date,
    accessToken: string | null,
    tokenExpires: Date | null,
  ) {
    super(id, name, admin, created, tokenExpires);
    this.password = password;
    this.accessToken = accessToken;
  }
}

interface TokenInfo {
  token: string;
  expires: Date;
}

export { User, SecretUser, TokenInfo };
