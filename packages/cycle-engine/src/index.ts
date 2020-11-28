export * from './cycle-engine';
export * from './listeners';

// inputs:
// - characters: { id: duration }
// - charactersList(order): id[]

// trigger:
// - battle start
// - battle end
// - round start
// - round end
// - turn start
// - turn end
// - duration change
// - character add/remove

// functions

// builder
// - addListener(triggerName, fn)
// - setCharacters(characters, charactersList)
// - start() => start cycle (not immediatly because of battle start delay)

// cycle => stop after each turn end, wait for sync()
// - sync(turnId, turnStartTime) => 
//      - frontend: on backend sync message, change inner start times, may trigger turn start/end
// - end() => end cycle, trigger battle end
// - disableCharacter(id) => can trigger turn end / round end / battle end
// - setCharacterDuration(id, duration) => can trigger turn end
// - setNextRoundCharactersOrder(charactersList) => effect on next round

// consts
// - battle start time
// - current turn infos: turn id, character id, start time, duration, end time
// - current round infos: round id, characters order

