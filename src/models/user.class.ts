export class User {
  name!: string;
  lastname!: string;
  email!: string;
  password!: number;
  // mit avatar komponente erste erstellen?? Als leeres Array?
  // avatarImg?: string;
  id!: string;
  chats! : string;
  channels: { data: any; id: string }[] = [];

   constructor(obj?: any) {
        
        this.name = obj ? obj.name : '';
        this.lastname = obj ? obj.lastname : '';
        this.email = obj ? obj.email : '';
        this.password = obj ? obj.password : '';
        this.id = obj ? obj.id : '';
        this.chats = obj ? obj.chats : '';
        this.channels = obj?.channels || [];
    }

}