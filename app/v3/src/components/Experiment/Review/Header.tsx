import DropdownModel from "../../UI/DropdownModel";
import { MIP } from "../../../types";
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

  private handleSaveModel1 = () => {
    const { handleSaveModel } = this.props;
    handleSaveModel({ title: this.input.current.value });
  };

  public render() {
    const {
      models,
      modelName,
      isMock,
      handleGoBackToExplore,
      handleRunAnalysis,
      handleSelectModel
    } = this.props;

    return (
      <Panel>
        <Panel.Body>
          <h3>
            Interactive Analysis{" "}
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
                  onKeyDown={this.handleKeyPress}
                />
              </div>
            )}
            {isMock && (
              <div className="item">
                <Button
                  onClick={this.handleSaveModel1}
                  bsStyle={"info"}
                  type="submit"
                  disabled={
                    this.input.current && this.input.current.value === ""
                  }
                  title={
                    this.input.current && this.input.current.value === ""
                      ? "Please enter a title for your model"
                      : ""
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
                title={
                  this.input.current && this.input.current.value === ""
                    ? "Please enter a title for your model"
                    : ""
                }
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
  private handleKeyPress = (event: any) => {
    const code = event.keyCode || event.charCode;
    if (code === 13) {
      event.preventDefault();
      event.stopPropagation();
      this.handleSaveModel1();
    }
  };
}
