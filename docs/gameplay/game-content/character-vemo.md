# Vemo

This character is focused in placement & map control.

## Attributes

| Attribute | Value |
| --- | --- |
| Life | 80 |
| Action time | 20s |

## Spells

### Switch

This spell moves the character in diagonal only, switching position with others characters if any.

| Attribute | Value |
| --- | --- |
| Duration | 2s |
| Range area | 2 |
| Line of sight | yes |
| Action area | 1 |

### Incitement

This spell moves target depending of its orientation. If he's looking right, he is moved to the right. If he's looking left, he is moved to the left. Etc.

Target is moved to 3 tiles. If any obstacle is encounter, move is interrupted at its current position.

| Attribute | Value |
| --- | --- |
| Duration | 3s |
| Range area | 5 |
| Line of sight | no |
| Action area | 1 |

### Treacherous blow

This spell attacks its target, removing life points. If target is from the back (from launcher point of view), then damages are considerably increased. Also change target orientation towards launcher.

| Attribute | Value |
| --- | --- |
| Duration | 5s |
| Range area | 1 |
| Line of sight | yes |
| Action area | 1 |
| Attack | 20 (50 if from the back) |

### Pressure

If target is an enemy, this spell removes life points from him. If target is an ally, this spell boosts him in action time.
This spell does nothing if target orientation is not toward launcher.

| Attribute | Value |
| --- | --- |
| Duration | 2s |
| Range area | 2 |
| Line of sight | yes |
| Action area | 1 |
| Attack (enemy) | 10 |
| Action time (ally) | 1s |
