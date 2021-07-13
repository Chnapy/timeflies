import { RoomEntityListGetMessage, RoomEntityListGetMessageData } from '@timeflies/socket-messages';
import { SocketCell } from '@timeflies/socket-server';
import { RoomAbstractService } from '../room-abstract-service';

export class EntityListGetRoomService extends RoomAbstractService {
    protected afterSocketConnect = (socketCell: SocketCell) => {
        this.addRoomMapSelectMessageListener(socketCell);
    };

    private addRoomMapSelectMessageListener = (socketCell: SocketCell) => socketCell.addMessageListener<typeof RoomEntityListGetMessage>(
        RoomEntityListGetMessage, ({ requestId }, send) => {

            send(RoomEntityListGetMessage.createResponse(requestId, this.getEntityLists()));
        });

    getEntityLists = (): RoomEntityListGetMessageData => ({
        characterList: [
            {
                characterRole: 'tacka',
                defaultSpellRole: 'move',
                variables: {
                    health: 120,
                    actionTime: 15_000
                }
            },
            {
                characterRole: 'vemo',
                defaultSpellRole: 'switch',
                variables: {
                    health: 90,
                    actionTime: 15_000
                }
            },
            {
                characterRole: 'meti',
                defaultSpellRole: 'move',
                variables: {
                    health: 90,
                    actionTime: 15_000
                }
            }
        ],
        spellList: [
            {
                spellRole: 'move',
                characterRole: 'tacka',
                variables: {
                    duration: 700,
                    rangeArea: 10,
                    actionArea: 0,
                    lineOfSight: true
                }
            },
            {
                spellRole: 'sword-sting',
                characterRole: 'tacka',
                variables: {
                    duration: 2500,
                    rangeArea: 2,
                    actionArea: 0,
                    lineOfSight: true,
                    attack: 10
                }
            },
            {
                spellRole: 'side-attack',
                characterRole: 'tacka',
                variables: {
                    duration: 3000,
                    rangeArea: 1,
                    actionArea: 0,
                    lineOfSight: true,
                    attack: 15
                }
            },
            {
                spellRole: 'blood-sharing',
                characterRole: 'tacka',
                variables: {
                    duration: 2000,
                    rangeArea: 0,
                    actionArea: 2,
                    lineOfSight: true,
                    attack: 15
                }
            },

            {
                spellRole: 'switch',
                characterRole: 'vemo',
                variables: {
                    duration: 1000,
                    rangeArea: 2,
                    actionArea: 0,
                    lineOfSight: false
                }
            },
            {
                spellRole: 'treacherous-blow',
                characterRole: 'vemo',
                variables: {
                    duration: 5000,
                    rangeArea: 1,
                    actionArea: 0,
                    lineOfSight: true,
                    attack: 20
                }
            },
            {
                spellRole: 'attraction',
                characterRole: 'vemo',
                variables: {
                    duration: 3000,
                    rangeArea: 6,
                    actionArea: 0,
                    lineOfSight: false
                }
            },
            {
                spellRole: 'distraction',
                characterRole: 'vemo',
                variables: {
                    duration: 2000,
                    rangeArea: 6,
                    actionArea: 1,
                    lineOfSight: false
                }
            },

            {
                spellRole: 'move',
                characterRole: 'meti',
                variables: {
                    duration: 700,
                    rangeArea: 10,
                    actionArea: 0,
                    lineOfSight: true
                }
            },
            {
                spellRole: 'slump',
                characterRole: 'meti',
                variables: {
                    duration: 1000,
                    rangeArea: 5,
                    actionArea: 0,
                    lineOfSight: true,
                    attack: 5
                }
            },
            {
                spellRole: 'last-resort',
                characterRole: 'meti',
                variables: {
                    duration: 5000,
                    rangeArea: 2,
                    actionArea: 0,
                    lineOfSight: true,
                    attack: 5
                }
            },
            {
                spellRole: 'motivation',
                characterRole: 'meti',
                variables: {
                    duration: 1000,
                    rangeArea: 4,
                    actionArea: 1,
                    lineOfSight: true
                }
            }
        ]
    });
}
