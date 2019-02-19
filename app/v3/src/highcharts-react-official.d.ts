declare module "highcharts-react-official" {
    import * as React from "react";
    import * as Highcharts from "highcharts";

    /**
     * Represents a "constructor" function for a ChartObject.
     * Not technically a constructor, as it's not called with `new`.
     */
    type Constructor = (
        renderTo: HTMLElement,
        options: Highcharts.Options,
    ) => Highcharts.ChartObject;
    /**
     * Represents all of the strings that are keys of T that map to a Constructor function.
     */
    type ConstructorName<T> = {
        [K in keyof T]: T[K] extends Constructor ? K : never
    }[keyof T];

    export interface HighchartsReactProps<TContainerProps = {}> {
        highcharts?: Highcharts.Static;
        constructorType?: ConstructorName<Highcharts.Static>;
        update?: boolean;
        options: Highcharts.Options;
        containerProps?: TContainerProps;
    }
    export class HighchartsReact<TContainerProps = {}> extends React.Component<
        HighchartsReactProps<TContainerProps>
    > {}

    export default HighchartsReact;
}
