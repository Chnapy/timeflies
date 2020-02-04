import React from 'react';
import { connect } from 'react-redux';
import { UIState, UIStateData } from './UIState';
import { BattleUI } from './battleUI/BattleUI';

interface UIProps {
    dataState: UIStateData['state'];
}

const stateComponentMap: Record<UIStateData['state'], React.ComponentType> = {
    'boot': () => null,
    'load': () => null,
    'battle': BattleUI
};

export const UI = connect<UIProps, {}, {}, UIState>(
    state => ({
        dataState: state.data.state
    })
)(class PUI extends React.PureComponent<UIProps> {

    render() {
        const { dataState } = this.props;

        const Component = stateComponentMap[dataState];

        return <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            pointerEvents: 'none'
        }}>

            <Component />

        </div>
    }
});


