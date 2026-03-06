class User {
  id: string;
  name: string;
  admin: boolean;
  created: Date;

  constructor(id: string, name: string, admin: boolean, created: Date) {
    this.id = id;
    this.name = name;
    this.admin = admin;
    this.created = created;
  }
}

class SecretUser extends User {
  accessToken: string;

  constructor(id: string, name: string, admin: boolean, created: Date, accessToken: string) {
    super(id, name, admin, created);
    this.accessToken = accessToken;
  }
}

export { User, SecretUser };
