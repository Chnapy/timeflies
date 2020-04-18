
declare namespace NodeJS {
    interface ProcessEnv {

        readonly PORT?: string;

        /**
         * @example https://something.com
         */
        readonly HOST_URL?: string;
    }
}
