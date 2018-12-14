import * as React from "react";
// tslint:disable jsx-no-lambda

import QueryBuilder from "react-querybuilder";

interface ICheckBox {
  field?: string;
  value?: string;
  operator?: string;
  className: string;
  level: number;
  handleOnChange?(value: any): void;
}

function customValueEditor(fields: any) {
  const editor = class MyCheckbox extends React.Component<ICheckBox> {
    public render() {
      const name = this.props.field;
      const field = fields.find((d: any) => d.name === name);

      if (field.enumerations) {
        return (
          <select
            id={`select-${name}`}
            onChange={e =>
              this.props.handleOnChange &&
              this.props.handleOnChange(e.target.value)
            }
          >
            <option value="">Choose an option--</option>
            {...field.enumerations.map((e: any) => (
              <option key={e.code} value={e.code}>
                {e.label}
              </option>
            ))}
          </select>
        );
      }

      return (
        <input
          type="text"
          value={this.props.value}
          // tslint:disable
          onChange={e =>
            this.props.handleOnChange &&
            this.props.handleOnChange(e.target.value)
          }
        />
      );
    }
  };
  return editor;
}

const Filter = ({
    fields,
    handleChangeFilter,
    query
}: {
  fields: any;
  handleChangeFilter: (args: any) => void;
  query: any
}) => {
  const controlElements = {
    valueEditor: customValueEditor(fields)
  };

  return (
    (fields && fields.length > 0 && (
      <QueryBuilder
        fields={fields}
        controlElements={controlElements}
        onQueryChange={handleChangeFilter}
        operators={[
          { name: "null", label: "Is Null" },
          { name: "notNull", label: "Is Not Null" },
          { name: "=", label: "=" },
          { name: "!=", label: "!=" },
          { name: "<", label: "<" },
          { name: ">", label: ">" },
          { name: "<=", label: "<=" },
          { name: ">=", label: ">=" }
        ]}
        query={query && query}
      />
    )) ||
    null
  );
};

export default Filter;
