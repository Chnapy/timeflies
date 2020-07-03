# Spell

A spell is an action launchable by a character during its turn. This action can affect the character itself, or other ones. It can alter any mutable attributes of targeted characters.

## Attributes

Several attributes compose a spell. Some of them are statics, and cannot change during a battle. Others are dynamics, values can be modified.

**Statics**
- Name
- Description
- Role

    Works as characters roles, it defines what kind of spell it is, what kind of effects it does.

**Dynamics**
- Duration

    How long this spell takes on launch to apply its effects.

- Range area

    The range of the spell, how far it can be launch.

- Action area

    The area where effects are applied. Every characters in there are targeted.

- Attack

    When a character receive this spell, how many life points it removes (or add). Can be null, a spell doesn't necessarily have to attack/heal.

## Spell prepare & launch

When a spell is selected to be launched the range area is shown around the character. This area may use **lines of sight**, so if obstacles bars view, several tiles may be not targetable.

Player can then click on one of available tiles to launch the spell. At this moment action area show up on tiles around targeted tile, all characters in this area receive spell effects.

To launch a spell, some conditions should be respected:
- target tile should be in range area (this area may be virtually infinite)
- it should remains at least the spell duration as turn time
- it should be character turn

Any spell launched without respecting these condition will be rejected.

## Spell effects

Spells can affect many character attributes:
- Life
- Action time
- Position
- Orientation
- Character spells dynamic attributes

There effects can also depend of these attributes, from targets, of launcher. There are many possibilities, some random samples:
- an offensive spell that attacks a character, and absorb half of removed life points
- a placing spell that moves the launcher symmetrically from a pivot targeted character
- an offensive spell that triple its damages if target is from the back
- a support spell that boost others characters action time in exchange of its own life points