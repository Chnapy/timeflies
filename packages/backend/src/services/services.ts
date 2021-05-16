import { GlobalEntitiesNoServices } from '../main/global-entities';
import { cycleBattleService } from './battle/cycle/cycle-battle-service';
import { joinBattleService } from './battle/join/join-battle-service';
import { spellActionBattleService } from './battle/spell-action/spell-action-battle-service';

export type Services = ReturnType<typeof createServices>;

export const createServices = (globalEntitiesNoServices: GlobalEntitiesNoServices) => ({
    joinBattleService: joinBattleService(globalEntitiesNoServices),
    cycleBattleService: cycleBattleService(globalEntitiesNoServices),
    spellActionBattleService: spellActionBattleService(globalEntitiesNoServices)
});
