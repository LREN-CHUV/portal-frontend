import request from "request-promise-native";
import { Container } from "unstated";
import { IMethodContainer, IMethodResult } from "../../types";

class MethodContainer extends Container<IMethodContainer> {
  public state: IMethodResult = {
    error: undefined,
    methods: undefined
  };

  private baseUrl: string;
  private options: any;

  constructor(config: any) {
    super();
    this.options = config.options;
    this.baseUrl = `${config.baseUrl}/methods`;
  }

  public load = async () => {
    try {
      const data = await request.get(`${this.baseUrl}`, this.options);
      const json = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error
        });
      }

      return await this.setState({
        error: undefined,
        methods: json
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };
}

export default MethodContainer;
