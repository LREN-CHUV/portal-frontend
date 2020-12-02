import axios, { AxiosRequestConfig } from 'axios';
import { Container } from 'unstated';
import { backendURL } from '../API';

export interface User {
  fullname?: string;
  username?: string;
  email?: string;
  agreeNDA?: boolean;
}

export interface State {
  error?: string;
  forbidden?: boolean;
  user?: User;
  authenticated: boolean;
  loading: boolean;
}

class UserContainer extends Container<State> {
  public state: State = {
    authenticated: false,
    loading: true
  };

  private options: AxiosRequestConfig;
  private backendURL: string;

  constructor(config: any) {
    super();
    this.options = config.options;
    this.backendURL = backendURL;
  }

  public login = async (params: any): Promise<void> => {
    const loginURL = `${this.backendURL}/login/hbp${params}`;
    const response = await axios.get(loginURL, this.options);

    return response.data;
  };

  public logout = async (): Promise<void> => {
    const logoutURL = `${this.backendURL}/logout`;
    const response = await axios.post(logoutURL, this.options);

    return response.data;
  };

  public user = async (): Promise<void> => {
    console.log('Check user authorization');
    try {
      const response = await axios.get(
        `${this.backendURL}/activeUser `,
        this.options
      );
      const user = response.data;

      if (!user) {
        return await this.setState({
          authenticated: false,
          error: "The server didn't get any response from the API",
          user: undefined,
          loading: false
        });
      }

      return await this.setState({
        authenticated: true,
        error: undefined,
        loading: false,
        user
      });
    } catch (error) {
      return await this.setState({
        authenticated: false,
        error: error.message,
        forbidden: error.statusCode !== undefined,
        loading: false
      });
    }
  };

  public acceptTOS = async (): Promise<void> => {
    try {
      const response = await axios.post(
        `${this.backendURL}/activeUser/agreeNDA`,
        this.options
      );
      const user = response.data;
      if (!user) {
        return await this.setState({
          authenticated: false,
          error: "The server didn't get any response from the API",
          user: undefined,
          loading: false
        });
      }

      return this.setState({ user });
    } catch (e) {
      console.log(e);
    }
  };
}

export default UserContainer;
