import $ from "jquery";
import QueryBuilder from "jQuery-QueryBuilder";
import * as React from "react";
// tslint:disable jsx-no-lambda

console.log(QueryBuilder);

// function customValueEditor(fields: any) {
//   const editor = class MyCheckbox extends React.Component<ICheckBox> {
//     public render() {
//       const name = this.props.field;
//       const field = fields.find((d: any) => d.name === name);

//       if (name && field.enumerations) {
//         return (
//           <select
//             id={`select-${name}`}
//             onChange={e =>
//               this.props.handleOnChange &&
//               this.props.handleOnChange(e.target.value)
//             }
//           >
//             <option value="">Choose an option--</option>
//             {...field.enumerations.map((e: any) => (
//               <option key={e.code} value={e.code}>
//                 {e.label}
//               </option>
//             ))}
//           </select>
//         );
//       }

//       return (
//         <input
//           type="text"
//           value={this.props.value}
//           // tslint:disable
//           onChange={e =>
//             this.props.handleOnChange &&
//             this.props.handleOnChange(e.target.value)
//           }
//         />
//       );
//     }
//   };
//   return editor;
// }


interface IProps {
  rules: any;
  filters: any;
  handleChangeFilter: any;
}

class Filter extends React.Component<IProps> {
  public state: IProps;
  private queryBuilderRef: any;

  public componentDidMount = () => {
    const { filters, rules } = this.props;
    ($(this.queryBuilderRef) as any).queryBuilder({ filters, rules });
    // ($(this.queryBuilderRef) as any).queryBuilder('allow_groups', 1)
  };

  public componentWillUnmount = () => {
    if (this.queryBuilderRef) {
      ($(this.queryBuilderRef) as any).queryBuilder("destroy");
    }
  };

  public shouldComponentUpdate() {
    return false;
  }

  public handleGetRulesClick = () => {
    const rules = ($(this.queryBuilderRef) as any).queryBuilder("getRules");
    this.setState({ rules });
    this.forceUpdate();
  };

  public handleSetRulesClick = (newRules: any) => {
    ($(this.queryBuilderRef) as any).queryBuilder("setRules", newRules);
    this.setState({ rules: newRules });
  };

  public render = () => {
    return (
      <div>
        <div
          id="query-builder"
          ref={this.createRef}
        />
      </div>
    );
  };

  private createRef = (ref: HTMLDivElement) => {
    this.queryBuilderRef = ref;
  }
}

export default Filter;
