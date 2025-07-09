export class User {
  name!: string;
  lastname!: string;
  email!: string;
  password!: number;
  aktiv!: boolean;
  avatar!: string;
  userId!: string;
  chats : { data: { channel: string }; id: string }[] = [];
  channels: { data: { channel: string }; id: string }[] = [];

   constructor(obj?: any) {
        
        this.name = obj ? obj.name : '';
        this.lastname = obj ? obj.lastname : '';
        this.email = obj ? obj.email : '';
        this.password = obj ? obj.password : '';
        this.avatar = obj? obj.avatar : '';
        this.userId! = obj ? obj.id : '';
        this.chats = obj?.chats || [];
        this.channels = obj?.channels || [];
        this.aktiv = obj?.aktiv
    }

     public toJSON() {
        return {
            name: this.name,
            lastname: this.lastname,
            email: this.email,
            password: this.password,
            avatar: this.avatar,
            userId: this.userId,
            chats: this.chats,
            channels: this.channels
        }
    }
  // mit avatar komponente erste erstellen?? Als leeres Array?
  // avatarImg?: string;
}