import DropdownModel from "@app/components/UI/DropdownModel";
import { MIP } from "@app/types";
import * as React from "react";
import { Button, Glyphicon, Panel } from "react-bootstrap";

interface IProps {
  handleGoBackToExplore: () => void;
  handleRunAnalysis: () => void;
  handleSaveModel: ({ title }: { title: string }) => void;
  handleSelectModel: (model: MIP.API.IModelResponse) => void;
  modelName?: string;
  models?: MIP.API.IModelResponse[];
  isMock?: boolean;
}
export default class Header extends React.Component<IProps> {
  private input: any;

  constructor(props: IProps) {
    super(props);
    this.input = React.createRef();
  }

  public render() {
    const {
      models,
      modelName,
      isMock,
      handleGoBackToExplore,
      handleRunAnalysis,
      handleSaveModel,
      handleSelectModel
    } = this.props;

    return (
      <Panel>
        <Panel.Body>
          <h3>
            Interactive Analysis{" "}
            {modelName && (
              <span>
                on{" "}
                {models && (
                  <DropdownModel
                    items={models}
                    title={modelName}
                    handleSelect={handleSelectModel}
                  />
                )}
              </span>
            )}
          </h3>
          <div className="actions status">
            <div className="item">
              <Button
                // tslint:disable
                onClick={handleGoBackToExplore}
                bsStyle="info"
                type="submit"
                // tslint:enable
              >
                <Glyphicon glyph="chevron-left" /> Explore
              </Button>
            </div>
            <div className="item text">&nbsp;</div>
            {isMock && (
              <div className="item">
                <input
                  type="text"
                  ref={this.input}
                  placeholder={"Your model name"}
                  className={"form-control"}
                />
              </div>
            )}
            {isMock && (
              <div className="item">
                <Button
                  // tslint:disable
                  onClick={() =>
                    handleSaveModel({ title: this.input.current.value })
                  }
                  // tslint:enable
                  bsStyle={"info"}
                  type="submit"
                  disabled={
                    this.input.current && this.input.current.value === ""
                  }
                >
                  Save model
                </Button>
              </div>
            )}
            <div className="item">
              <Button
                onClick={handleRunAnalysis}
                bsStyle="info"
                type="submit"
                disabled={isMock}
              >
                RUN MACHINE LEARNING EXPERIMENT{" "}
                <Glyphicon glyph="chevron-right" />{" "}
              </Button>
            </div>
          </div>
        </Panel.Body>
      </Panel>
    );
  }

  // private handleChangeModelName = (event: any) => {
  //   this.setState({
  //     modelName: event.target.value
  //   });
  // };
}
