import React from 'react';
import { MapBoard } from './map-board/map-board';
import { EntityTree } from './entity-tree/entity-tree';
import { MapSelector } from './map-selector/map-selector';


export const UIRoom: React.FC = () => {

    /**
     * List players (name)
     *  List characters (type, face)
     * Team
     */

    return (
        <div>
            
            <MapBoard/>

            <MapSelector/>

            <EntityTree/>

        </div>
    );
};
