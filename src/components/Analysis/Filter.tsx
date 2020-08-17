import $ from 'jquery';
import QueryBuilder from 'jQuery-QueryBuilder';
import * as React from 'react';
import { Button } from 'react-bootstrap';

interface Props {
  rules: any;
  filters: any;
  handleChangeFilter: any;
}

interface State {
  loading: boolean;
  rulesChanged: boolean;
}

class Filter extends React.Component<Props, State> {
  public state: State = { rulesChanged: false, loading: false };
  protected queryBuilder = QueryBuilder; // prevents ts-lint to complain about ununused inport
  private ref: any;

  public componentDidMount = (): void => {
    const { filters, rules } = this.props;

    if (!rules) {
      this.ref.queryBuilder({ filters });
    } else {
      this.ref.queryBuilder({ filters, rules });
    }

    this.onRulesChanged();
  };

  public componentDidUpdate = (nextProps: any): void => {
    if (this.state.rulesChanged) {
      return; // user is editing
    }

    const { filters: nextFilters, rules: nextRules } = nextProps;
    const { filters, rules } = this.props;

    if (
      this.compareKeys(
        filters.map((n: any) => n.id),
        nextFilters.map((n: any) => n.id)
      )
    ) {
      console.log('Filters changed');
      this.ref.queryBuilder('destroy');

      const changed = this.compareKeys(
        rules?.constructor.name === 'Object' &&
          rules.rules.map((n: any) => n.id),
        nextRules?.constructor.name === 'Object' &&
          nextRules.rules.map((n: any) => n.id)
      );

      if (changed) {
        this.ref.queryBuilder({ filters, rules });
        this.onRulesChanged();

        return;
      }

      this.ref.queryBuilder({ filters: nextFilters });
      this.onRulesChanged();
      this.setState({ rulesChanged: false });
    }
  };

  public componentWillUnmount = (): void => {
    this.ref.queryBuilder('destroy');
  };

  public handleSave = (): void => {
    this.setState({ loading: true, rulesChanged: false });
    const rules = this.ref.queryBuilder('getRules');
    const { handleChangeFilter } = this.props;
    handleChangeFilter(rules).then(() => {
      this.setState({ loading: false });
    });
  };

  public render = (): JSX.Element => {
    return (
      <div>
        <div id="query-builder" ref={this.createRef} />
        <div className={'save-filter'}>
          <Button
            variant={'info'}
            onClick={this.handleSave}
            disabled={!this.state.rulesChanged}
          >
            {this.state.loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    );
  };

  private createRef = (ref: HTMLDivElement): void => {
    if (!this.ref) {
      this.ref = $(ref) as any;
    }
  };

  private onRulesChanged = (): void => {
    this.ref.queryBuilder('on', 'rulesChanged', () => {
      this.setState({ rulesChanged: true });
    });
    setTimeout(() => {
      this.setState({ rulesChanged: false });
    }, 100);
  };

  private compareKeys = (keys: string[], nextKeys: string[]): boolean =>
    JSON.stringify(keys) !== JSON.stringify(nextKeys);
}

export default Filter;
