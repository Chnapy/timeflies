import { Viewport } from 'pixi-viewport';
import { CanvasContext } from '../../../canvas/CanvasContext';

export type ViewportListener = ReturnType<typeof createViewportListener>;

export const createViewportListener = (viewport: Viewport) => {

    const getScale = ({ scale }: Viewport) => scale.x;

    return {
        onScaleChange: (onChange: (scaleValue: number) => void) => {

            let currentScale;
            const contextResources = CanvasContext.consumer();

            function handleChange(vp: Viewport) {
                const nextScale = getScale(vp);
                if (nextScale !== currentScale) {
                    currentScale = nextScale;

                    CanvasContext.provider(
                        contextResources,
                        () => onChange(currentScale)
                    );
                }
            }

            viewport.on('zoomed-end', handleChange);

            const unsubscribe = () => viewport.off('zoomed-end', handleChange);

            handleChange(viewport);

            return unsubscribe;
        },
        getCurrentScale: () => getScale(viewport)
    };
};
