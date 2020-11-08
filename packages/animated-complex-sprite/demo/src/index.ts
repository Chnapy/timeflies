import { AnimatedComplexSprite, FlipInfos } from 'animated-complex-sprite';
import { Application, IResourceDictionary, Loader, SCALE_MODES, settings, Sprite } from 'pixi.js';

const loader = Loader.shared;

settings.SCALE_MODE = SCALE_MODES.NEAREST;


type SpriteConfig = {
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
      default: [ 120, 80, 80, 80, 80, 240 ]
    }
  }
};

const app = new Application();

const name = 'spritesheet';

let sprite: AnimatedComplexSprite<SpriteConfig>;

const onLoad = (resources: IResourceDictionary) => {
  console.log(resources);
  const spritesheet = resources[ name ].spritesheet!;

  sprite = new AnimatedComplexSprite<SpriteConfig>(
    spritesheet,
    ({ role, state, orientation }) => {

      const getFlip = (): FlipInfos<SpriteConfig> | undefined => {
        if (orientation === 'left') {
          return {
            baseConfig: { role, state, orientation: 'right' },
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

      return {
        animationPath: getAnimationPath(),
        pingPong,
        framesOrder: getFramesOrder(),
        flip: getFlip(),
        framesDurations: getFramesDurations()
      };
    },
    {
      role: 'tacka',
      state: 'walk',
      orientation: 'right'
    }
  );

  sprite.position.set(100, 100);
  sprite.scale.set(4);

  app.stage.addChild(sprite);

  sprite.play();


  // @ts-ignore
  window.sprite = sprite;
};

const createButton = (name: string, fn: () => void) => {
  const button = document.createElement('button');
  button.innerText = name;
  button.onclick = fn;
  return button;
};

const createActionButton = (name: string, action: Partial<SpriteConfig>) => createButton(name, () => {
  sprite.setConfig(action);
});

[
  createButton('stop', () => sprite.stop()),
  createButton('destroy', () => sprite.destroy()),
  createButton('play', () => sprite.play()),

  createActionButton('tacka', { role: 'tacka' }),
  createActionButton('meti', { role: 'meti' }),
  createActionButton('vemo', { role: 'vemo' }),

  createActionButton('idle', { state: 'idle' }),
  createActionButton('walk', { state: 'walk' }),
  createActionButton('attack', { state: 'attack' }),
  createActionButton('hit', { state: 'hit' }),

  createActionButton('left', { orientation: 'left' }),
  createActionButton('right', { orientation: 'right' }),
  createActionButton('top', { orientation: 'top' }),
  createActionButton('bottom', { orientation: 'bottom' }),
]
  .forEach(button => document.body.appendChild(button));

document.body.appendChild(app.view);

if (loader.resources[ name ]) {
  onLoad(loader.resources);
} else {

  loader
    .add(name, 'assets/spritesheet-characters.json')
    .load((l, resources) => {
      onLoad(resources as any);
    });
}
