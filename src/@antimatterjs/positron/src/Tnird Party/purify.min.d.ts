export { }

declare global
{
    const DOMPurify: {
        sanitize(dirty: string | Node, config?: {
            ALLOWED_TAGS?: string[];
            ALLOWED_ATTR?: string[];
            ALLOWED_URI_REGEXP?: RegExp;
            [key: string]: unknown;
        }): string;
        addHook(entryPoint: string, cb: (node: Element) => void): void;
        version: string;
    };
}