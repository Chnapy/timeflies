/// <reference types="timeflies-react-scripts" />

declare namespace NodeJS {
    interface ProcessEnv {

        // TODO remove react-app constraint
        /**
         * @example https://something.com
         */
        readonly REACT_APP_SERVER_URL?: string;
    }
}
