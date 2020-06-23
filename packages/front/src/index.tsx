import ReactDOM from 'react-dom';
import { createAssetLoader } from './assetManager/AssetLoader';
import './envManager';
import { createStoreManager } from './store/store-manager';
import { createView } from './view';

const assetLoader = createAssetLoader();

const storeManager = createStoreManager({ assetLoader });

const view = createView({
    storeManager,
    assetLoader
});

ReactDOM.render(view, document.getElementById('root'));
