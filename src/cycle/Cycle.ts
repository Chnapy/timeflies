import { Character } from '../entities/Character';

export class Cycle {

    readonly characters: Character[];

    currentIndex: number;
    lastTime?: number;

    constructor(characters: Character[]) {
        this.characters = characters;
        this.currentIndex = 0;
    }

    getCurrentCharacter(): Character {
        return this.characters[ this.currentIndex ];
    }

    update(time: number): void {
        if (!this.lastTime) {
            this.lastTime = time;
            this.currentIndex = 0;
            this.startTurn(this.getCurrentCharacter());
            return;
        }

        const currentCharacter = this.getCurrentCharacter();
        const elapsedTime = time - this.lastTime;
        const { actionTime } = currentCharacter;

        if (elapsedTime > actionTime) {
            this.endTurn(currentCharacter);

            this.lastTime += actionTime;
            this.currentIndex++;
            if (this.currentIndex >= this.characters.length) {
                this.currentIndex = 0;
            }

            this.startTurn(this.getCurrentCharacter());
        }
    }

    private startTurn(character: Character): void {
        console.log('START TURN - ', character.name);
    }

    private endTurn(character: Character): void {
        console.log('END TURN - ', character.name);
    }

}