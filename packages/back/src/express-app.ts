import bodyParser from 'body-parser';
import cors from "cors";
import express from 'express';
import { staticPostURL } from './config';

/**
 * Express app with all middlewares
 */
export const expressApp = () => {

    const app = express();
    
    app.use(
      cors({ allowedHeaders: '*' }),
      bodyParser.urlencoded({ extended: false }),
      bodyParser.json()
    );
    
    app.use(staticPostURL, express.static('public'));

    return app;
};
