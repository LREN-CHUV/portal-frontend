import request from 'request-promise-native';
import { Container } from 'unstated';

import { backendURL } from '../API';

export interface User {
  fullname?: string;
  username: string;
  email?: string;
  picture?: string;
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
    // console.log('login', loginURL, this.options);
    return await request.get(loginURL, this.options);
  };

  public user = async () => {
    try {
      const data = await request.get(`${this.backendURL}/user`, this.options);
      const json = await JSON.parse(data);

      if (json.error) {
        return await this.setState({
          authenticated: false,
          error: json.error,
          user: undefined
        });
      }

      if (json && json.name) {
        if (json.name === 'anonymous') {
          await this.setState({
            authenticated: true,
            error: undefined,
            user: json
          });
        }

        const userData = await request.get(
          `${this.backendURL}/users/${json.name}`,
          this.options
        );
        const newJson = await JSON.parse(userData);
        if (newJson.error) {
          return await this.setState({
            authenticated: false,
            error: newJson.error,
            user: undefined
          });
        }

        return await this.setState({
          authenticated: true,
          error: undefined,
          user: newJson
        });
      }

      return await this.setState({
        authenticated: json.authenticated,
        error: undefined,
        user: json
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
