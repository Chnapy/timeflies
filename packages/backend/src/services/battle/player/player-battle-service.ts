import { CharacterId, PlayerId, StaticPlayer, waitMs } from '@timeflies/common';
import { logger } from '@timeflies/devtools';
import { BattleLeaveMessage, BattleLoadMessage, BattlePlayerDisconnectMessage, BattlePlayerDisconnectRemoveMessage } from '@timeflies/socket-messages';
import { SocketCell } from '@timeflies/socket-server';
import { produceStateDisconnectedPlayers } from '@timeflies/spell-effects';
import { Battle, BattleId } from '../battle';
import { BattleAbstractService } from '../battle-abstract-service';

export class PlayerBattleService extends BattleAbstractService {
    afterSocketConnect = (socketCell: SocketCell, currentPlayerId: PlayerId) => {
        this.addBattleLoadMessageListener(socketCell, currentPlayerId);
        this.addBattleLeaveMessageListener(socketCell, currentPlayerId);

        socketCell.addDisconnectListener(this.getPlayerDisconnectFn(currentPlayerId));
    };

    checkLeavedAndDisconnectedPlayers = async (battleId: BattleId) => {
        const battle = this.getBattleById(battleId);

        const playersToRemove = Object.entries(battle.disconnectedPlayers)
            .filter(([ playerId, disconnectedTime ]) => disconnectedTime && Date.now() - disconnectedTime > 30_000)
            .map<PlayerId>(([ playerId ]) => playerId);
        playersToRemove.push(...battle.leavedPlayers.values());

        if (!playersToRemove.length) {
            return;
        }

        battle.leavedPlayers.clear();
        playersToRemove.forEach(playerId => {
            delete battle.disconnectedPlayers[ playerId ];
            delete this.globalEntitiesNoServices.currentBattleMap.mapByPlayerId[ playerId ];
        });

        // add new state
        const newState = produceStateDisconnectedPlayers(
            this.getCurrentState(battle),
            Date.now(),
            playersToRemove,
            battle.staticCharacters.reduce<{ [ characterId in CharacterId ]: PlayerId }>((acc, { characterId, playerId }) => {
                acc[ characterId ] = playerId;
                return acc;
            }, {})
        );

        await this.addNewState(battle, newState, Date.now());

        // send removed players
        this.sendToEveryPlayersExcept(
            BattlePlayerDisconnectRemoveMessage({
                playersToRemove,
                time: newState.time
            }),
            battle.staticPlayers
        );
    };

    private addBattleLoadMessageListener = (socketCell: SocketCell, currentPlayerId: PlayerId) => socketCell.addMessageListener<typeof BattleLoadMessage>(BattleLoadMessage, async ({ payload, requestId }, send) => {
        const battle = this.getBattleById(payload.battleId);

        if (battle.staticState.players[ currentPlayerId ]) {

            battle.waitingPlayerList.delete(currentPlayerId);

            battle.leavedPlayers.delete(currentPlayerId);
            delete battle.disconnectedPlayers[ currentPlayerId ];
        } else {

            this.addSpectator(battle, currentPlayerId);
        }

        const { roomId, staticPlayers, staticCharacters, staticSpells, cycleInfos } = battle;

        send(BattleLoadMessage.createResponse(requestId, {
            roomId,
            tiledMapInfos: this.getMapInfosFrontend(battle),
            staticPlayers,
            staticCharacters,
            staticSpells,
            initialSerializableState: this.getCurrentState(battle),
            cycleInfos
        }));

        this.globalEntitiesNoServices.currentBattleMap.mapByPlayerId[ currentPlayerId ] = battle;

        if (this.canStartBattle(battle)) {
            await this.startBattle(battle);
        }
    });

    private canStartBattle = ({ cycleEngine, waitingPlayerList }: Battle) => !cycleEngine.isStarted() && waitingPlayerList.size === 0;

    private startBattle = async (battle: Battle) => {
        // let some time for client to setup listeners
        await waitMs(1000);

        logger.info('Battle [' + battle.battleId + '] start');

        return this.services.cycleBattleService.start(battle);
    };

    private addSpectator = ({ playerIdList, staticPlayers, staticState }: Battle, playerId: PlayerId) => {

        const player: StaticPlayer = {
            playerId,
            playerName: this.globalEntitiesNoServices.playerCredentialsMap.mapById[ playerId ].playerName,
            teamColor: null,
            type: 'spectator'
        };

        playerIdList.add(playerId);

        staticPlayers.push(player);
        staticState.players[ playerId ] = player;
    };

    private addBattleLeaveMessageListener = (socketCell: SocketCell, currentPlayerId: PlayerId) => socketCell.addMessageListener(BattleLeaveMessage, async (message, send) => {
        const battle = this.globalEntitiesNoServices.currentBattleMap.mapByPlayerId[ currentPlayerId ];
        if (!battle) {
            return;
        }

        delete this.globalEntitiesNoServices.currentBattleMap.mapByPlayerId[ currentPlayerId ];

        if (battle.staticState.players[ currentPlayerId ].type === 'player') {
            battle.leavedPlayers.add(currentPlayerId);

        } else {

            this.removeSpectator(battle, currentPlayerId);
        }
    });

    private getPlayerDisconnectFn = (currentPlayerId: PlayerId) => () => {
        const battle = this.globalEntitiesNoServices.currentBattleMap.mapByPlayerId[ currentPlayerId ];
        if (!battle) {
            return;
        }

        if (battle.staticState.players[ currentPlayerId ].type === 'player') {
            battle.disconnectedPlayers[ currentPlayerId ] = Date.now();

        } else {

            this.removeSpectator(battle, currentPlayerId);
        }

        this.sendToEveryPlayersExcept(
            BattlePlayerDisconnectMessage({ playerId: currentPlayerId }),
            battle.staticPlayers,
            currentPlayerId
        );
    };

    private removeSpectator = ({ playerIdList, staticPlayers, staticState }: Battle, playerId: PlayerId) => {
        playerIdList.delete(playerId);

        staticPlayers.splice(
            staticPlayers.findIndex(c => c.playerId === playerId),
            1
        );
        delete staticState.players[ playerId ];
    };
}
