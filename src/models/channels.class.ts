export class Channels {
    channel! : string;

      constructor(obj?: any) {
        this.channel = obj ? obj.channel : '';
    }
}