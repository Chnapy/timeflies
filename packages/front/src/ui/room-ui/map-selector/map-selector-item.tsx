import { makeStyles } from '@material-ui/styles';
import { assertIsDefined } from '@timeflies/shared';
import React from 'react';
import { useGameDispatch } from '../../hooks/useGameDispatch';
import { useGameStep } from '../../hooks/useGameStep';
import { MapSelectAction } from '../../reducers/room-reducers/map-select-reducer';
import { MyMapConfig } from './map-selector';

export interface MapSelectorItemProps {
    id: MyMapConfig[ 'id' ];
}

const useStyles = makeStyles({
    root: ({ isSelected }: { isSelected: boolean }) => ({
        display: 'flex',
        background: isSelected ? '#fff' : '#F8F8F8',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#888',
        cursor: isSelected ? undefined : 'pointer'
    }),
    leftSide: {
        width: '50%',
        flexShrink: 0
    },
    rightSide: {
        flexGrow: 1
    }
});

export const MapSelectorItem: React.FC<MapSelectorItemProps> = ({ id }) => {
    const { mapList, mapSelected } = useGameStep('room', room => room.map);

    const isSelected = mapSelected === id;

    const map = mapList.find(m => m.id === id);

    assertIsDefined(map);

    const { name, width, height, nbrTeams, nbrCharactersPerTeam } = map;

    const classes = useStyles({ isSelected });

    const { dispatchMapSelect } = useGameDispatch({
        dispatchMapSelect: (): MapSelectAction => ({
            type: 'room/map/select',
            mapSelected: id
        })
    });

    const onClick = () => {
        dispatchMapSelect();
    };

    return <button className={classes.root} onClick={onClick}>

        <div className={classes.leftSide}>

        </div>

        <div className={classes.rightSide}>

            <div><b>{name}</b></div>
            <div>{width}x{height}</div>
            <div>Teams: {nbrTeams}</div>
            <div>Characters: {nbrCharactersPerTeam * nbrTeams} ({nbrCharactersPerTeam}/team)</div>

        </div>

    </button>;
};
