import path from 'path';
import { Loader, LoaderResource, SCALE_MODES, settings } from "pixi.js";
import React from 'react';
import { AnimatedComplexSpriteProps, AnimatedComplexSpriteReact, FlipInfos, FramesInfos } from '../../src';

const loader = Loader.shared;

settings.SCALE_MODE = SCALE_MODES.NEAREST;

export type SpriteConfig = {
  role: 'vemo' | 'tacka' | 'meti';
  state: 'idle' | 'walk' | 'attack' | 'hit';
  orientation: 'left' | 'right' | 'top' | 'bottom';
};

const framesDurations: {
  [ role in SpriteConfig[ 'role' ] ]?: {
    [ state in SpriteConfig[ 'state' ] ]?: {
      [ orientation in SpriteConfig[ 'orientation' ] ]?: number[];
    } & {
      default?: number[];
    };
  }
} = {
  tacka: {
    idle: {
      bottom: [ 640, 80, 640 ],
      default: [ 940, 820 ]
    },
    walk: { default: [ 100 ] },
    attack: {
      default: [ 300, 100, 100, 200 ]
    },
    hit: {
      default: [ 120, 80, 80, 80, 80, 120 ]
    }
  }
};

const name = 'spritesheet';

export type CanvasProps = {
  run: boolean;
  state: SpriteConfig;
  pos: { x: number; y: number };
};

export const InnerCanvas: React.FC<CanvasProps> = ({ run, state, pos }) => {
  const [ spritesheetRes, setSpritesheetRes ] = React.useState<LoaderResource | undefined>(loader.resources[ name ]);

  React.useEffect(() => {
    if (!spritesheetRes) {
      loader
        .add(name, path.join(process.env.PUBLIC_URL, 'assets', 'spritesheet-characters.json'))
        .load((l, resources) => {
          setSpritesheetRes(resources[ name ]);
        });
    }
  }, [ spritesheetRes ]);

  const spritesheet = spritesheetRes?.spritesheet ?? null;

  const getFramesInfos = ({ role, state, orientation }: SpriteConfig): FramesInfos => {

    const getFlip = (): FlipInfos | undefined => {
      if (orientation === 'left') {
        return {
          baseFramesInfos: getFramesInfos({ role, state, orientation: 'right' }),
          direction: 'horizontal'
        };
      }
    };

    const getAnimationPath = () => {
      return `${role}/${state}/${orientation}/${role}_${state}_${orientation}`;
    };

    const pingPong = role === 'tacka' && state === 'idle';

    const getFramesOrder = () => {
      if (role === 'tacka' && state === 'hit') {
        return [ 1, 2, 3, 2, 3, 4 ];
      }
    };

    const getFramesDurations = (): number[] => {

      const globalDefault = [ 400 ];

      const lvRole = framesDurations[ role ];
      const lvState = lvRole && lvRole[ state ];
      if (lvState) {
        return lvState[ orientation ] ?? lvState.default ?? globalDefault;
      }
      return globalDefault;
    };

    function removeUndefined<O>(o: O) {
      return Object.entries(o)
        .filter(([ key, value ]) => value !== undefined)
        .reduce((acc, [ key, value ]) => {

          acc[ key ] = value;

          return acc;
        }, {}) as O;
    }

    return removeUndefined({
      animationPath: getAnimationPath(),
      pingPong,
      framesOrder: getFramesOrder(),
      flip: getFlip(),
      framesDurations: getFramesDurations()
    });
  };

  const props: AnimatedComplexSpriteProps | undefined = spritesheet && {
    spritesheet,
    run,
    ...getFramesInfos(state)
  };

  return (
    props && <AnimatedComplexSpriteReact {...props} position={[ pos.x, pos.y ]} anchor={1 / 3} />
  );
};
