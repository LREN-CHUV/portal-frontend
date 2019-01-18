import * as React from "react";
import { Button, Glyphicon, Panel } from "react-bootstrap";

interface IProps {
  handleGoBackToExplore: () => void;
  handleRunAnalysis: () => void;
  handleSaveOrUpdateModel: (name: string | undefined) => void;
  modelName?: string;
}
export default class Header extends React.Component<IProps> {
  private input: any;

  constructor(props: IProps) {
    super(props);
    this.input = React.createRef();
  }

  public render() {
    const {
      handleGoBackToExplore,
      handleRunAnalysis,
      handleSaveOrUpdateModel
    } = this.props;

    return (
      <Panel>
        <Panel.Body>
          <h3>Interactive Analysis</h3>
          <div className="actions status">
            
            <div className="item">
              <Button
                //tslint:disable
                onClick={handleGoBackToExplore}
                bsStyle="info"
                type="submit"
              >
                <Glyphicon glyph="chevron-left" />{" "}Explore
              </Button>
            </div>
            <div className="item text">&nbsp;</div>
            <div className="item">
              <input
                type="text"
                ref={this.input}
                className={"form-control"}
                defaultValue={this.props.modelName}
              />
            </div>
            <div className="item">
              <Button
                //tslint:disable
                onClick={() =>
                  handleSaveOrUpdateModel(this.input.current.value)
                }
                // onKeyDown={event => {
                //   if (event.key === "Enter") {
                //     handleRunAnalysis(this.input.current.value);
                //   }
                // }}
                bsStyle="info"
                type="submit"
                // disabled={this.input.current.value === undefined}
              >
                Save model
              </Button>
            </div>
            <div className="item">
              <Button
                //tslint:disable
                onClick={handleRunAnalysis}
                // onKeyDown={event => {
                //   if (event.key === "Enter") {
                //     handleRunAnalysis(this.input.current.value);
                //   }
                // }}
                bsStyle="info"
                type="submit"
                // disabled={this.input.current.value === undefined}
              >
                RUN MACHINE LEARNING EXPERIMENT {" "} <Glyphicon glyph="chevron-right" />{" "}
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
