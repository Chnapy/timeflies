
module.exports = {
    extends: [ "react-app" ],
    parser: "@typescript-eslint/parser",
    plugins: [ "@typescript-eslint" ],
    parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
    },
    rules: {
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                args: "none",
                varsIgnorePattern: "^_"
            }
        ],
        "@typescript-eslint/no-floating-promises": "error"
    }
}