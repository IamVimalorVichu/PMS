declare module 'hypher' {
    export default class Hypher {
        constructor(language: { patterns: any; leftmin?: number; rightmin?: number; });
        hyphenate(word: string): string[];
    }
}

declare module 'hyphenation.en-us' {
    const patterns: {
        patterns: any;
        leftmin?: number;
        rightmin?: number;
    };
    export default patterns;
}