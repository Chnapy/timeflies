import fs from 'fs';
import util from 'util';
import { Assets } from './assets';
import { characterRoleList, spellRoleList } from '@timeflies/common';
import { SpritesheetsUtils } from './spritesheets-utils';

const readFile = util.promisify(fs.readFile);

describe('# assets', () => {

    const loadAsset = (path: string) => readFile('./public' + path, 'utf-8');

    const loadSpritesheetEntities = async () => JSON.parse(await loadAsset(Assets.spritesheets.entities)) as {
        frames: unknown;
        animations: unknown;
    };

    it('check if all assets are presents', async () => {
        await expect(Promise.all(
            Object.values(Assets.spritesheets).map(loadAsset)
        )).resolves.toBeDefined();
    });

    it('check if all spell roles texture are presents', async () => {
        const schema = await loadSpritesheetEntities();

        for (const spellRole of spellRoleList) {
            if (spellRole === 'simpleAttack') continue;

            expect(schema.frames).toHaveProperty(
                [ SpritesheetsUtils.getSpellTextureKey(spellRole) ],
                expect.any(Object)
            );
        }
    });

    // TODO add missing assets
    it.skip('check if all characters animations are presents', async () => {
        const schema = await loadSpritesheetEntities();

        for (const characterRole of characterRoleList) {
            for (const characterSpriteState of SpritesheetsUtils.characterSpriteStateList) {

                expect(schema.animations).toHaveProperty(
                    [ SpritesheetsUtils.getCharacterAnimationPath({
                        role: characterRole,
                        state: characterSpriteState,
                        orientation: 'bottom'
                    }) ],
                    expect.any(Object)
                );
            }
        }
    });
});
