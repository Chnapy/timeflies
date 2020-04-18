import { Controller } from './Controller';
import './envManager';

Controller
    .init()
    .start(document.getElementById('root')!);
