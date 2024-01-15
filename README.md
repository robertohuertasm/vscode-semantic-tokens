# vscode-semantic-tokens

[![NPM](https://nodei.co/npm/vscode-semantic-tokens.png?mini=true)](https://nodei.co/npm/vscode-semantic-tokens/)

Small utility to get the [semantic tokens](https://code.visualstudio.com/api/references/vscode-api#SemanticTokens) of a VS Code document in a more nicer format.

This basically computes the semantic tokens you would get from [DocumentSemanticTokensProvider.provideDocumentSemanticTokens method](https://code.visualstudio.com/api/references/vscode-api#DocumentSemanticTokensProvider.provideDocumentSemanticTokens).



## Usage

The API is fairly simple. You just need to pass a `TextDocument` and you will get an array of semantic tokens.

```ts
import { getSemanticTokens } from 'vscode-semantic-tokens';

// ...

const tokens = getSemanticTokens(document);
```

The semantic tokens have the following shape:

```ts
export type SemanticToken = {
  text: string;
  line: number;
  startChar: number;
  length: number;
  tokenType: string;
  tokenModifiers: string[];
};
```
