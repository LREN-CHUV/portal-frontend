import request from 'request-promise-native';
import { Container } from 'unstated';

import { backendURL } from '../API';

export interface User {
  fullname?: string;
  username: string;
  email?: string;
  groups?: string;
}

export interface State {
  error?: string;
  user?: User;
  authenticated: boolean;
}

class UserContainer extends Container<State> {
  public state: State = { authenticated: false };

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

  public user = async () => {
    console.log('Check user authorization');
    try {
      const data = await request.get(`${this.backendURL}/user`, this.options);
      const json = await JSON.parse(data);

      if (!json || (json && json.error)) {
        return await this.setState({
          authenticated: false,
          error: json.error,
          user: undefined
        });
      }

      if (process.env.NODE_ENV !== 'production') {
        return await this.setState({
          authenticated: true,
          error: undefined,
          user: undefined
        });
      }

      const details = json && json.userAuthentication.details;
      const user: User =
        (details && {
          fullname: details.name,
          username: details.preferred_username,
          email: details.email,
          groups: details.groups
        }) ||
        {};

      return await this.setState({
        authenticated: json.authenticated,
        error: undefined,
        user
      });
    } catch (error) {
      return await this.setState({
        authenticated: false,
        error: error.message
      });
    }
  };
}

export default UserContainer;
