import { characterRoleList, Orientation, spellRoleList } from '@timeflies/common';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { Assets } from './assets';
import { SpritesheetsUtils } from './spritesheets-utils';

const readFile = util.promisify(fs.readFile);

describe('# assets', () => {

    const loadAsset = (assetPath: string) => readFile(path.join(__dirname, '..', 'public' + assetPath), 'utf-8');

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

    it('check if all characters animations are presents', async () => {
        const schema = await loadSpritesheetEntities();

        for (const characterRole of characterRoleList) {
            for (const characterSpriteState of SpritesheetsUtils.characterSpriteStateList) {
                for (const orientation of ['top', 'bottom', 'right'] as Orientation[]) {

                    expect(schema.animations).toHaveProperty(
                        [ SpritesheetsUtils.getCharacterAnimationPath({
                            role: characterRole,
                            state: characterSpriteState,
                            orientation
                        }) ],
                        expect.any(Object)
                    );
                }
            }
        }
    });
});
