# Vemo

This character is focused in placement & map control.

## Attributes

| Attribute | Value |
| --- | --- |
| Life | 80 |
| Action time | 10s |

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
| Attack | 15 (45 if from the back) |

### Pressure

This spell boosts the target, only if others characters are seeing him. For each character in the same lines of the target, and have there orientation toward the target, this last one gains a boost of action time. Launcher is counted in the condition.

For each character respecting this condition, target gains 1s of action time.

| Attribute | Value |
| --- | --- |
| Duration | 3s |
| Range area | 6 |
| Line of sight | no |
| Action area | 1 |
