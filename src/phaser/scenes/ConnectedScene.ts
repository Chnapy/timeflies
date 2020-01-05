
export interface ConnectedSceneConfig<K extends string> extends Omit<Phaser.Types.Scenes.SettingsConfig, 'key'> {
    key: K;
}

export abstract class ConnectedScene<K extends string, D extends {} | undefined = undefined> extends Phaser.Scene {

    readonly key: K;
    initData!: D;

    constructor(config: K | ConnectedSceneConfig<K>) {
        super(config);
        this.key = typeof config === 'string' ? config : config.key;
    }

    init(data: D): void {
        this.initData = data;
    }

    abstract preload(): void;

    abstract create(data: D): void;

    abstract update(time: number, delta: number): void;

    addScene<S extends ConnectedScene<any, any>>(
        key: S['key'],
        sceneConfig: S | Phaser.Types.Scenes.SettingsConfig | Phaser.Types.Scenes.CreateSceneFromObjectConfig | Function
    ): S {
        return this.scene.add(key, sceneConfig, false) as S;
    }

    start<S extends ConnectedScene<any, any>>(
        key: S['key'],
        data: S['initData']
    ): Phaser.Scenes.ScenePlugin {
        return this.scene.start(key, data);
    }

    launch<S extends ConnectedScene<any, any>>(
        key: S['key'],
        data: S['initData']
    ): Phaser.Scenes.ScenePlugin {
        return this.scene.launch(key, data);
    }

}
