import ReactDOM from 'react-dom';
import { createAssetLoader } from './assetManager/AssetLoader';
import './envManager';
import { createStoreManager } from './store-manager';
import { createView } from './view';

const storeManager = createStoreManager();

const assetLoader = createAssetLoader();

const view = createView({
    storeManager,
    assetLoader
});

ReactDOM.render(view, document.getElementById('root'));
