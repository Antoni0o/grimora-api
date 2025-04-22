export default class AuthRequestModel {
  constructor(
    public email: string,
    public password: string,
    public name: string,
    public refreshToken?: string,
  ) {}
}
