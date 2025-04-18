export default class SystemModel {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public isRulesActive: boolean,
    public version: string,
    public isPublic: boolean,
    public createdBy: string,
  ) {}
}
