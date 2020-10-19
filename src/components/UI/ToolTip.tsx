import * as React from 'react';
import { Badge, Popover } from 'react-bootstrap';

import MIPContext from '../App/MIPContext';

export enum TooltipPlacement {
  top,
  right,
  bottom,
  left
}

interface ITooltip {
  title: string;
  text: string;
  placement: TooltipPlacement;
  badge: string;
}

export const Tooltip = ({
  title,
  text,
  placement,
  badge
}: ITooltip): JSX.Element => (
  <MIPContext.Consumer>
    {(context): JSX.Element =>
      (context.showTooltips && (
        <div style={{ position: 'relative' }}>
          <Popover
            id={`popover-${title}`}
            title={
              <>
                <Badge pullRight={true}>{badge}</Badge>
                {title}
              </>
            }
            placement={TooltipPlacement[placement]}
            style={{ position: 'absolute' }}
          >
            <>{text}</>
          </Popover>
        </div>
      )) || <></>
    }
  </MIPContext.Consumer>
);
