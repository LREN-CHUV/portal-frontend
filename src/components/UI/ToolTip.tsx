import * as React from 'react';
import { Badge, Popover } from 'react-bootstrap';
import styled from 'styled-components';

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

const ColoredBadge = styled(Badge)`
  background-color: #d9534f;
`;

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
                <ColoredBadge pullRight={true}>{badge}</ColoredBadge>
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
