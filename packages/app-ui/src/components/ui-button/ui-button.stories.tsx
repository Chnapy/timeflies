import { Box } from '@material-ui/core';
import { Meta } from '@storybook/react/types-6-0';
import React from 'react';
import { UIButton } from './ui-button';

export default {
    title: 'UI/Button',
} as Meta;

export const Default: React.FC = () => {

    return (
        <Box p={2}>

            <div>
                <UIButton>
                    create room
        </UIButton>
            </div>

            <div>
                <UIButton variant='primary'>
                    play
        </UIButton>
            </div>

            <div>
                <UIButton disabled>
                    create room
        </UIButton>
            </div>

            <div>
                <UIButton variant='primary' disabled>
                    play
        </UIButton>
            </div>

        </Box>
    );
};
