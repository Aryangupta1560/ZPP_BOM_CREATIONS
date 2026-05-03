import fioriTools from '@sap-ux/eslint-plugin-fiori-tools';

export default [
    ...fioriTools.configs.recommended,
    {
        rules: {
            "linebreak-style": 0 // This disables the LF vs CRLF check
        }
    }
];