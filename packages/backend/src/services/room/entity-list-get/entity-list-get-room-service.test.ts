import { RoomEntityListGetMessage, RoomEntityListGetMessageData, RoomListCharacter, RoomListSpell } from '@timeflies/socket-messages';
import { getFakeRoomEntities } from '../room-service-test-utils';
import { EntityListGetRoomService } from './entity-list-get-room-service';

describe('entity list get room service', () => {

    const getEntities = () => getFakeRoomEntities(EntityListGetRoomService);

    describe('on entities list get message', () => {
        it('answers with entities list', async () => {
            const { socketCellP1, connectSocket } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomEntityListGetMessage);

            await listener(RoomEntityListGetMessage({}).get(), socketCellP1.send);

            expect(socketCellP1.send).toHaveBeenCalledWith(RoomEntityListGetMessage.createResponse(
                expect.anything(),
                expect.objectContaining<RoomEntityListGetMessageData>({
                    characterList: expect.arrayContaining([
                        expect.objectContaining<RoomListCharacter>({
                            characterRole: expect.any(String),
                            defaultSpellRole: expect.any(String),
                            variables: {
                                health: expect.any(Number),
                                actionTime: expect.any(Number)
                            }
                        })
                    ]),
                    spellList: expect.arrayContaining([
                        expect.objectContaining<RoomListSpell>({
                            spellRole: expect.any(String),
                            characterRole: expect.any(String),
                            variables: {
                                duration: expect.any(Number),
                                rangeArea: expect.any(Number),
                                actionArea: expect.any(Number),
                                lineOfSight: expect.any(Boolean),
                                attack: expect.any(Number)
                            }
                        })
                    ]),
                })
            ));
        });
    });

});
