export class Channel {
    channelname!: string;
    description?: string;

     constructor(obj?: any) {
        
        this.channelname = obj ? obj.channelname : '';
        this.description = obj ? obj.description : '';
    }

    public toJSON() {
        return {
            channelname: this.channelname,
            description: this.description,
        }
    }

}