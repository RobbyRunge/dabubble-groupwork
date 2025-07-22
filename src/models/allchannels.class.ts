export class Allchannels {
  channelname!: string;
  description?: string;
  channelId: string;

  constructor(obj?: any) {
    this.channelname = obj ? obj.channelname : '';
    this.description = obj ? obj.description : '';
    this.channelId = obj ? obj.channelId : '';
  }

  // public toJSON() {
  //     return {
  //         channelname: this.channelname,
  //         description: this.description,
  //         channelId: this.channelId
  //     }
  // }

  public toJSON(fields?: (keyof Allchannels)[]) {
    const json: any = {};
    const allFields:any  = {
      channelname: this.channelname,
      description: this.description,
      channelId: this.channelId,
    };
    if (!fields) return allFields;
    for (const key of fields) {
      json[key] = allFields[key];
    }
    return json;
  }
}