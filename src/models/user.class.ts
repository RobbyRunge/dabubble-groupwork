export class User {
  name!: string;
  lastname!: string;
  email!: string;
  password!: number;
  avatarImg!: string;
  userId!: string;
  chats : { data: { channel: string }; id: string }[] = [];
  channels: { data: { channel: string }; id: string }[] = [];

   constructor(obj?: any) {
        
        this.name = obj ? obj.name : '';
        this.lastname = obj ? obj.lastname : '';
        this.email = obj ? obj.email : '';
        this.password = obj ? obj.password : '';
        this.avatarImg = obj? obj.avatar : '';
        this.userId! = obj ? obj.id : '';
        this.chats = obj?.chats || [];
        this.channels = obj?.channels || [];
    }

     public toJSON() {
        return {
            name: this.name,
            lastname: this.lastname,
            email: this.email,
            password: this.password,
            avatarImg: this.avatarImg,
            userId: this.userId,
            chats: this.chats,
            channels: this.channels
        }
    }

}