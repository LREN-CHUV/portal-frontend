import $ from "jquery";
import QueryBuilder from "jQuery-QueryBuilder";
import * as React from "react";
import { Button } from "react-bootstrap";

console.log(QueryBuilder); // prevents ts-lint to complain about ununused inport

interface IProps {
  rules: any;
  filters: any;
  handleChangeFilter: any;
}

interface IState {
  loading: boolean;
  saveDisabled: boolean;
}

class Filter extends React.Component<IProps, IState> {
  public state: IState = { saveDisabled: true, loading: false };
  private ref: any;

  public componentDidMount = () => {
    const { filters, rules } = this.props;

    if (!rules) {
      this.ref.queryBuilder({ filters });
    } else {
      this.ref.queryBuilder({ filters, rules });
    }

    this.ref.queryBuilder("on", "rulesChanged", () => {
      this.setState({ saveDisabled: false });
    });
  };

  public componentWillReceiveProps = (nextProps: any) => {
    const { filters: nextFilters, rules: nextRules } = nextProps;
    const { filters, rules } = this.props;
    if (nextFilters && nextFilters !== filters) {
      this.ref.queryBuilder("destroy");

      if (nextRules && nextRules !== rules) {
        this.ref.queryBuilder({ filters: nextFilters, rules: nextRules });
        return;
      }

      this.ref.queryBuilder({ filters: nextFilters });
    }
  };

  public componentWillUnmount = () => {
    this.ref.queryBuilder("destroy");
  };

  public handleSave = () => {
    this.setState({ loading: true, saveDisabled: true });
    const rules = this.ref.queryBuilder("getRules");
    const { handleChangeFilter } = this.props;
    handleChangeFilter(rules).then(() => {
      this.setState({ loading: false, saveDisabled: false });
    });
  };

  public render = () => {
    return (
      <div>
        <div id="query-builder" ref={this.createRef} />
        <div className={"save-filter"}>
          <Button
            bsStyle={"primary"}
            onClick={this.handleSave}
            disabled={this.state.saveDisabled}
          >
            {this.state.loading ? "Saving..." : "Save"}
          </Button>
        </div>
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
