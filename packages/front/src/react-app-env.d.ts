/// <reference types="timeflies-react-scripts" />

declare namespace NodeJS {
    interface ProcessEnv {
        readonly REACT_APP_SERVER_URL?: string;
    }
}
