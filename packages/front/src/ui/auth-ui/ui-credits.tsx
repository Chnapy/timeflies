import { Link, LinkProps } from '@material-ui/core';
import React from 'react';
import { UITypography } from '../ui-components/typography/ui-typography';

const ExternalLink: React.FC<Omit<LinkProps, 'rel' | 'target'>> = props => <Link {...props} target='_blank' rel='noopener' />;

export const UICredits: React.FC = () => {


    return <>

        <UITypography variant='h2' gutterBottom>Credits</UITypography>

        <UITypography variant='body1' gutterBottom>
            Games can be complex and hard projects, especially when they're done alone.
            <br />This is why for Timeflies I used several external assets which helped me a lot.
        </UITypography>

        <UITypography variant='body1' gutterBottom>
            <ul style={{ listStyle: 'square' }}>
                <li>
                    <ExternalLink href='https://pita.itch.io/rpg-dungeon-tileset'>
                        RPG Dungeon Tileset
                        </ExternalLink> and <ExternalLink href='https://pita.itch.io/rpg-monster-pack'>
                        RPG Monster Pack
                            </ExternalLink> (tileset and characters spritesheets) by <ExternalLink href='https://pita.itch.io/'>Pita</ExternalLink>
                </li>
                <li>
                    <ExternalLink href='https://www.gamedevmarket.net/asset/100-pixel-icons-3836/'>
                        100 Pixel Icons
                            </ExternalLink> (spells icons) by <ExternalLink href='https://www.gamedevmarket.net/member/Frostwindz/'>Frostwindz</ExternalLink>
                </li>
                <li>
                    <ExternalLink href='https://datagoblin.itch.io/monogram'>
                        monogram
                            </ExternalLink> (font) by <ExternalLink href='https://datagoblin.itch.io/'>V. Menezio</ExternalLink>
                </li>
            </ul>
        </UITypography>

        <UITypography variant='body1' gutterBottom>
            Thanks to them !!
        </UITypography>
    </>;
};
