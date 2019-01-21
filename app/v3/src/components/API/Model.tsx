import { MIP } from "@app/types";
import * as dotenv from "dotenv";
import request from "request-promise-native";
import { Container } from "unstated";

dotenv.config();

class Model extends Container<MIP.Store.IModelState> {
  public state: MIP.Store.IModelState = {};

  private options: request.Options;
  private baseUrl: string;

  constructor(config: any) {
    super();
    this.options = config.options;
    this.baseUrl = `${config.baseUrl}/models`;
  }

  public setMock = async (query: MIP.Internal.IQuery) => {
    const newModel: MIP.Internal.IModelMock = {
      isMock: true,
      query,
      title: "No title"
    };
    return await this.setState({
      error: undefined,
      model: newModel
    });
  };

  public one = async (slug: string) => {
    try {
      const data = await request.get(`${this.baseUrl}/${slug}`, this.options);
      const json: MIP.API.IModelResponse = await JSON.parse(data);
      if (json.error) {
        return await this.setState({
          error: json.error
        });
      }

      return await this.setState({
        error: undefined,
        model: json
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };

  // public create = async (params: any) => {
  //   try {
  //     const data = await request({
  //       body: JSON.stringify(params),
  //       headers: {
  //         ...this.options.headers,
  //         "Content-Type": "application/json;charset=UTF-8"
  //       },
  //       method: "POST",
  //       uri: `${this.baseUrl}`
  //     });
  //     const json = await JSON.parse(data);
  //     return await this.setState({
  //       error: undefined,
  //       model: json
  //     });
  //   } catch (error) {
  //     // console.log(error);
  //     return await this.setState({
  //       error: error.message
  //     });
  //   }
  // };

  public update = async ({ model }: { model: any }) => {
    try {
      const { slug } = model;
      const data = await request({
        body: JSON.stringify(model),
        headers: {
          ...this.options.headers,
          "Content-Type": "application/json;charset=UTF-8"
        },
        method: "PUT",
        uri: `${this.baseUrl}/${slug}`
      });
      const json = await JSON.parse(data);
      return await this.setState({
        error: undefined,
        model: json
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };

  public save = async ({
    model,
    title
  }: {
    model: any;
    title: string;
  }): Promise<any> => {
    const modelTemplate = {
      config: {
        title: {
          text: title
        }
      },
      createdAt: 1540561037000,
      dataset: {
        code: "DS1540825503020"
      },
      query: model.query,
      title,
      valid: true
    };

    try {
      const data = await request({
        body: JSON.stringify(modelTemplate),
        headers: {
          ...this.options.headers,
          "Content-Type": "application/json;charset=UTF-8"
        },
        method: "POST",
        uri: `${this.baseUrl}`
      });
      const json = await JSON.parse(data);
      await this.setState({
        error: undefined,
        model: json
      });

      return json.slug;
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };

  public all = async () => {
    try {
      const data = await request.get(`${this.baseUrl}`, this.options);
      const json: MIP.API.IModelResponse[] = await JSON.parse(data);

      return await this.setState({
        error: undefined,
        models: json
      });
    } catch (error) {
      return await this.setState({
        error: error.message
      });
    }
  };
}

export default Model;
