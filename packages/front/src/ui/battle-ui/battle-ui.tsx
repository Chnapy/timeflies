import React from "react";
import { SpellPanel } from "./spell-panel/spell-panel";
import { TimePanel } from "./time-panel/time-panel";
import { CharacterListPanel } from "./character-list-panel/character-list-panel";
import { Box } from '@material-ui/core';


export const BattleUI: React.FC = () => {

    return <Box display='flex' alignItems='flex-end' justifyContent='space-between' width='100%' height='100%' p={1}>

        <Box display='flex' maxHeight='100%' mr={1}>
            <CharacterListPanel />
        </Box>

        <Box display='flex' flexDirection='column' alignItems='center' minWidth={500}>

            <Box width='100%' mb={1}>
                <TimePanel />
            </Box>

            <SpellPanel />

        </Box>

        <Box/>

    </Box>;
};
