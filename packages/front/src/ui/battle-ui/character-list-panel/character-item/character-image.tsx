import { CharacterType } from '@timeflies/shared';
import React from 'react';
import { AssetMapKey } from '../../../../assetManager/AssetLoader';
import { Controller } from '../../../../Controller';
import { Avatar } from '@material-ui/core';

export type CharacterImageProps = {
    characterType: CharacterType;
};

const useAssetLoader = <K extends AssetMapKey>(key: K) => {
    const [resource, setResource] = React.useState(
        Controller.loader.get(key)
    );

    // TODO loader provider + suscribe

    return resource;
};

export const CharacterImage: React.FC<CharacterImageProps> = React.memo(({characterType}) => {

    const asset = useAssetLoader('characters');

    console.log(asset)

    return <Avatar>

    </Avatar>;
});
