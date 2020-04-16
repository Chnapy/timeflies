import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import { Controller } from './Controller';


Controller
    .init()
    .start(document.getElementById('root')!);
