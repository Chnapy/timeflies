import React from 'react';
import ReactDOMServer from 'react-dom/server'; import * as PIXI from 'pixi.js';
import { UIThemeProvider } from '../../../ui/ui-theme-provider';
import { graphicTheme } from './graphic-theme';


const cache: Map<string, PIXI.Texture> = new Map();

export const ReactToGraphicSprite = (reactElement: React.ReactElement, width: number, height) => {

    const sprite = new PIXI.Sprite();

    getTexture(reactElement, width, height).then(texture => sprite.texture = texture);

    return sprite;
};

const getHTMLString = (strElement: string): string => {
    const html = React.createElement('html', {},
        React.createElement('body', {},
            React.createElement(UIThemeProvider, {},
                React.createElement('div', {
                    dangerouslySetInnerHTML: {
                        __html: strElement
                    }
                })
            )
        )
    );

    const htmlStr = ReactDOMServer.renderToStaticMarkup(html);

    return '<foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">'
        + htmlStr
        + '</div></foreignObject>';
};

const getTexture = async (reactElement: React.ReactElement, width: number, height: number): Promise<PIXI.Texture> => {

    const strElement = ReactDOMServer.renderToStaticMarkup(reactElement);

    const type = strElement.startsWith('<svg') ? 'svg' : 'html';

    const strContent = type === 'html'
        ? getHTMLString(strElement)
        : strElement;

    if (cache.has(strContent)) {
        return cache.get(strContent)!;
    }


    const dataUrl = await getHTMLDataURL(strContent, width, height);

    const baseTexture = new PIXI.BaseTexture(dataUrl);
    const texture = new PIXI.Texture(baseTexture);

    cache.set(strContent, texture);

    return texture;
};

const getHTMLDataURL = (strContent: string, width: number, height: number): Promise<string> => new Promise(r => {
    const { typography } = graphicTheme;

    const headStyles = Array.from(document.head.getElementsByTagName('style'))
        .map(style => style.outerHTML)
        .join('')
        + `<style>
            body {
                background-color: transparent;
            }
        </style>`

    // console.log(strContent)
    // console.log(headStyles)

    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    c.width = width;
    c.height = height;

    const rootFontSize = typography.fontSize + 'px';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" style="font-size: ${rootFontSize}">`
        + headStyles
        + strContent
        + `</svg>`;

    const tempImg = document.createElement('img');
    tempImg.addEventListener('load', onTempImageLoad);
    tempImg.src = 'data:image/svg+xml,' + encodeURIComponent(svg);

    // document.body.insertAdjacentHTML('afterbegin', svg);

    function onTempImageLoad(e: Event) {
        ctx!.drawImage(e.target as CanvasImageSource, 0, 0);
        r(c.toDataURL());
    }
});

