import { UIButton, UIButtonProps } from '@timeflies/app-ui';
import React from 'react';
import { useHistory } from 'react-router-dom';

type ButtonLinkProps = UIButtonProps & {
    to: string;
};

export const ButtonLink: React.FC<ButtonLinkProps> = ({ to, onClick, ...buttonProps }) => {
    const history = useHistory();

    return (
        <UIButton
            onClick={(e) => {
                history.push(to);
                if (onClick) {
                    onClick(e);
                }
            }}
            {...buttonProps}
        />
    );
};
