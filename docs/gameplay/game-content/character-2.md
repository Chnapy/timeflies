# Character #2

This character is focused in attack & heal.

## Attributes

| Attribute | Value |
| --- | --- |
| Life | 120 |
| Action time | 14s |

## Spells

### Move

This spell moves the character one tile. This is the basic move spell. 

| Attribute | Value |
| --- | --- |
| Duration | 1s |
| Range area | 1 |
| Allow obstacles | no |
| Line of sight | yes |
| Action area | 1 |

### Attack

This spell attacks enemies in an area, and heals allies in this same area.
Enemies damages are shared to allies as heal.

> For instance, if total damage rose to 20, and there is 2 allies in the area, each of them is healed to 10.

| Attribute | Value |
| --- | --- |
| Duration | 4s |
| Range area | 3 |
| Allow obstacles | no |
| Line of sight | yes |
| Action area | 3 |
| Attack | 20 |

### Attack

This spell attacks target and boosts close enemies. Enemies close to 3 tiles from target position are healed depending of damage, and there action time is boosted depending of spell duration.

> For instance, if total damage rose to 50, spell duration is 6s, and there is 2 enemies close to target, each of them is healed to 25, and action time boosted to 3s.

| Attribute | Value |
| --- | --- |
| Duration | 6s |
| Range area | 1 |
| Allow obstacles | no |
| Line of sight | yes |
| Action area | 1 (side effects: 3) |
| Attack | 60 |

### Heal

This spell heals allies and enemies, and change there orientation.
Orientation is set so as to be towards center of action area.

| Attribute | Value |
| --- | --- |
| Duration | 3s |
| Range area | 6 |
| Allow obstacles | no |
| Line of sight | yes |
| Action area | 2 |
| Heal | 20 |
