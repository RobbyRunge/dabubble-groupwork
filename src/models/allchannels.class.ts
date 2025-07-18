export class Allchannels {

    channelname!: string;
    description?: string;
    channelId: string;

     constructor(obj?: any) {
        
        this.channelname = obj ? obj.channelname : '';
        this.description = obj ? obj.description : '';
        this.channelId = obj ? obj.channelId : '';
    }

    public toJSON() {
        return {
            channelname: this.channelname,
            description: this.description,
            channelId: this.channelId
        }
    }

}