import request from 'request-promise-native';
import { Container } from 'unstated';

import { backendURL } from '../API';

export interface User {
  fullname: string;
  username: string;
}

export interface State {
  error?: string;
  user?: User;
}

class UserContainer extends Container<State> {
  public state: State = {};

  private options: request.Options;
  private backendURL: string;

  constructor(config: any) {
    super();
    this.options = config.options;
    this.backendURL = backendURL;
  }

  public user = async () => {
    try {
      const data = await request.get(`${this.backendURL}/user`, this.options);
      const json = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error
        });
      }

      return await this.setState({
        error: undefined,
        user: json
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };
}

export default UserContainer;
