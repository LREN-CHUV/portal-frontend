import request from 'request-promise-native';
import { Container } from 'unstated';

import { backendURL } from '../API';

export interface User {
  fullname?: string;
  username?: string;
  email?: string;
  groups?: string;
  picture?: string;
}

export interface State {
  error?: string;
  forbidden?: boolean;
  user?: User;
  authenticated: boolean;
  agreeNDA: boolean;
  loading: boolean;
}

class UserContainer extends Container<State> {
  public state: State = {
    authenticated: false,
    agreeNDA: false,
    loading: true
  };

  private options: request.Options;
  private backendURL: string;

  constructor(config: any) {
    super();
    this.options = config.options;
    this.backendURL = backendURL;
  }

  public login = async (params: any): Promise<void> => {
    const loginURL = `${this.backendURL}/login/hbp${params}`;
    const data = await request.get(loginURL, this.options);

    return data;
  };

  public logout = async (): Promise<void> => {
    const logoutURL = `${this.backendURL}/logout`;
    const data = await request.post(logoutURL, this.options);

    return data;
  };

  public user = async (): Promise<void> => {
    console.log('Check user authorization');
    try {
      const data = await request.get(`${this.backendURL}/user`, this.options);
      const json = await JSON.parse(data);

      if (!json || (json && json.error)) {
        return await this.setState({
          authenticated: false,
          error: json.error,
          user: undefined,
          loading: false
        });
      }

      const details = json && json.userAuthentication.details;

      const user: User =
        (details && {
          email: details.email,
          fullname: details.name,
          groups: details.groups,
          username: details.preferred_username
        }) ||
        {};

      const authenticated =
        process.env.NODE_ENV !== 'production'
          ? true
          : details.preferred_username === 'anonymous'
          ? true
          : json.authenticated;

      return await this.setState({
        authenticated,
        error: undefined,
        loading: false,
        user
      });
    } catch (error) {
      return await this.setState({
        authenticated: false,
        error: error.message,
        forbidden: error.statusCode === 403,
        loading: false
      });
    }
  };

  public profile = async ({
    username = ''
  }: {
    username?: string;
  }): Promise<void> => {
    await this.setState({
      loading: true
    });

    try {
      const data = await request.get(
        `${this.backendURL}/users/${username}`,
        this.options
      );
      const json = await JSON.parse(data);

      if (!json || (json && json.error)) {
        return await this.setState({
          error: json.error,
          loading: false
        });
      }

      const user = this.state.user;
      const nextUser: User = {
        ...user,
        picture: json.picture
      };

      return await this.setState({
        agreeNDA: json.agreeNDA,
        error: undefined,
        loading: false,
        user: nextUser
      });
    } catch (error) {
      return await this.setState({
        error: error.message,
        loading: false
      });
    }
  };

  public acceptTOS = async (): Promise<void> => {
    try {
      await request.post(`${this.backendURL}/user?agreeNDA=true`, this.options);

      return this.setState({ agreeNDA: true });
    } catch (e) {
      console.log(e);
    }
  };
}

export default UserContainer;
