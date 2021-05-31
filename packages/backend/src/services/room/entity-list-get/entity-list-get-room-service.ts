import { RoomEntityListGetMessage, RoomEntityListGetMessageData } from '@timeflies/socket-messages';
import { SocketCell } from '@timeflies/socket-server';
import { Service } from '../../service';

export class EntityListGetRoomService extends Service {
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
                    health: 100,
                    actionTime: 10000
                }
            },
            {
                characterRole: 'vemo',
                defaultSpellRole: 'switch',
                variables: {
                    health: 90,
                    actionTime: 10000
                }
            },
            {
                characterRole: 'meti',
                defaultSpellRole: 'move',
                variables: {
                    health: 100,
                    actionTime: 10000
                }
            }
        ],
        spellList: [
            {
                spellRole: 'move',
                characterRole: 'tacka',
                variables: {
                    duration: 800,
                    rangeArea: 10,
                    actionArea: 1,
                    lineOfSight: false
                }
            },
            {
                spellRole: 'simpleAttack',
                characterRole: 'tacka',
                variables: {
                    duration: 1500,
                    rangeArea: 5,
                    actionArea: 1,
                    lineOfSight: true,
                    attack: 20
                }
            },
            {
                spellRole: 'switch',
                characterRole: 'vemo',
                variables: {
                    duration: 800,
                    rangeArea: 2,
                    actionArea: 1,
                    lineOfSight: false
                }
            },
            {
                spellRole: 'simpleAttack',
                characterRole: 'vemo',
                variables: {
                    duration: 1000,
                    rangeArea: 4,
                    actionArea: 1,
                    lineOfSight: true,
                    attack: 15
                }
            },
            {
                spellRole: 'move',
                characterRole: 'meti',
                variables: {
                    duration: 1000,
                    rangeArea: 8,
                    actionArea: 1,
                    lineOfSight: false
                }
            },
            {
                spellRole: 'simpleAttack',
                characterRole: 'meti',
                variables: {
                    duration: 1000,
                    rangeArea: 4,
                    actionArea: 1,
                    lineOfSight: true,
                    attack: 10
                }
            },
        ]
    });
}
