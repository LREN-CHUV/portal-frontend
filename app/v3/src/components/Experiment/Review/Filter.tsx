import $ from "jquery";
import QueryBuilder from "jQuery-QueryBuilder";
import * as React from "react";
import { Button } from "react-bootstrap";

console.log(QueryBuilder);

interface IProps {
  rules: any;
  filters: any;
  handleChangeFilter: any;
}

class Filter extends React.PureComponent<IProps> {
  private ref: any;

  public componentDidMount = () => {
    const { filters, rules } = this.props;
    this.ref.queryBuilder({ filters, rules });
    // this.ref.queryBuilder("rulesChanged", console.log)
  };

  public componentWillUnmount = () => {
    this.ref.queryBuilder("destroy");
  };

  public handleGetRulesClick = () => {
    const rules = this.ref.queryBuilder("getRules");
    const { handleChangeFilter } = this.props;
    handleChangeFilter(JSON.stringify(rules));
  };

  public render = () => {
    return (
      <div>
        <div id="query-builder" ref={this.createRef} />
        <Button bsStyle={"primary"} onClick={this.handleGetRulesClick}>
          SAVE
        </Button>
      </div>
    );
  };

  private createRef = (ref: HTMLDivElement) => {
    if (!this.ref) {
      this.ref = $(ref) as any;
    }
  };
}

export default Filter;
