# Cycle

Each battle follows a game loop with each character playing after the other: they play **turns**.

There is characters turns, but also **rounds**. A round contains all the characters turns.
When all these characters turns end, the round ends too and another one starts.

Imagine a battle with two characters: *Tomato* and *Ketchup*.

This gives us that:
1. First round
    1. Tomato turn
    2. Ketchup turn
2. Second round
    1. Tomato turn
    2. Ketchup turn
3. etc

## Character turn

> Also simply named as **turn**.

A character turn begins on battle start, or after a previous ended character turn. In the two case it's after a little delay.
A dead character cannot play its turn.

A turn has a duration, which is equal to the character **action time**.
Since turn has started nothing can alterate this value.

A turn ends at the exact moment of one of these condition is respected:
- Turn duration is elapsed
- Character playing the turn dies
- Battle is finished
