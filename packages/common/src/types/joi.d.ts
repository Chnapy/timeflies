import 'joi';

declare module 'joi' {

    type SchemaMapRequired<TSchema = any> = {
        [ key in keyof TSchema ]: SchemaLike | SchemaLike[];
    };

    interface Root {

        /**
         * Fix schema optional keys.
         * Schema is required, all its keys too.
         * Otherwise returned value is 'never'.
         * 
         * @see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/45501
         */
        object<TSchema = any, T = TSchema>(schema: SchemaMapRequired<T>): ObjectSchema<TSchema>;
        object<TSchema = any, T = TSchema>(schema?: SchemaMap<T>): never;
    }
}
