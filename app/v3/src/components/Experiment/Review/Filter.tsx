import $ from "jquery";
import QueryBuilder from "jQuery-QueryBuilder";
import * as React from "react";
import { Button } from "react-bootstrap";

interface IProps {
  rules: any;
  filters: any;
  handleChangeFilter: any;
}

interface IState {
  loading: boolean;
  rulesChanged: boolean;
}

class Filter extends React.Component<IProps, IState> {
  public state: IState = { rulesChanged: false, loading: false };
  protected queryBuilder = QueryBuilder; // prevents ts-lint to complain about ununused inport
  private ref: any;

  public componentDidMount = () => {
    const { filters, rules } = this.props;

    if (!rules) {
      this.ref.queryBuilder({ filters });
    } else {
      this.ref.queryBuilder({ filters, rules });
    }

    this.onRulesChanged();
  };

  public componentWillReceiveProps = (nextProps: any) => {
    if (this.state.rulesChanged) {
      return; // user is editing
    }

    const { filters: nextFilters, rules: nextRules } = nextProps;
    // const { filters, rules } = this.props;
    if (nextFilters) {
      // FIXME: && nextFilters !== filters) {
      this.ref.queryBuilder("destroy");

      if (nextRules) {
        // FIXME: && nextRules !== rules) {
        this.ref.queryBuilder({ filters: nextFilters, rules: nextRules });
        this.onRulesChanged();

        return;
      }

      this.ref.queryBuilder({ filters: nextFilters });
      this.onRulesChanged();
      this.setState({ rulesChanged: false });
    }
  };

  public componentWillUnmount = () => {
    this.ref.queryBuilder("destroy");
  };

  public handleSave = () => {
    this.setState({ loading: true, rulesChanged: false });
    const rules = this.ref.queryBuilder("getRules");
    const { handleChangeFilter } = this.props;
    handleChangeFilter(rules).then(() => {
      this.setState({ loading: false });
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
            disabled={!this.state.rulesChanged}
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

  private onRulesChanged = () => {
    this.ref.queryBuilder("on", "rulesChanged", () => {
      this.setState({ rulesChanged: true });
    });
    setTimeout(() => {
      this.setState({ rulesChanged: false });
    }, 100);
  };
}

export default Filter;
