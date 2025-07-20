export class User {
  name!: string;
  email!: string;
  password!: string;
  aktiv!: boolean;
  avatar!: string;
  userId!: string;
 
  userstorage!: string;;

  constructor(obj?: any) {

    this.name = obj ? obj.name : '';
    this.email = obj ? obj.email : '';
    this.password = obj ? obj.password : '';
    this.avatar = obj ? obj.avatar : '';
    this.userId! = obj ? obj.id : '';
    this.userstorage = obj ? obj.userstorage : '' ;
    this.aktiv = obj ? obj.aktiv : false;
  }

  public toJSON() {
    return {
      name: this.name,
      email: this.email,
      aktiv: this.aktiv,
      password: this.password,
      avatar: this.avatar,
      userId: this.userId,
      userstorage: this.userstorage
    }
  }
}