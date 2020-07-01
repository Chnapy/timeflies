# Cycle

Each battle follows a game loop with each character playing after the other: they play **turns**.

There is characters turns, but also **global turns**. A global turn contains all the characters turns.
When all these characters turns end, the global turn ends too and another one starts.

Imagine a battle with two characters: *Toto* and *Tata*.

This gives us that:
1. First global turn
    1. Toto turn
    2. Tata turn
2. Second global turn
    1. Toto turn
    2. Tata turn
3. etc

## Character turn

> Also simply named as **turn**.

A character turn begins on battle start, or after a previous ended character turn. In the two case it's after a little delay.
A dead character cannot play its turn.

A turn has a duration, which is equal to the character **action time**.
Since turn has started nothing can alterate this value.

A turn ends at the exact moment of one of these condition is repected:
- Turn duration is elapsed
- Character playing the turn dies
- Battle is finished
