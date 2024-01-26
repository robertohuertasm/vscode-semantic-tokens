import * as vscode from 'vscode';

export type SemanticToken = {
  text: string;
  line: number;
  startChar: number;
  length: number;
  tokenType: string;
  tokenModifiers: string[];
};

export async function getSemanticTokens(document: vscode.TextDocument) {
  const [legends, tokens] = (await Promise.all([
    vscode.commands.executeCommand(
      'vscode.provideDocumentSemanticTokensLegend',
      document.uri,
    ),
    vscode.commands.executeCommand(
      'vscode.provideDocumentSemanticTokens',
      document.uri,
    ),
  ])) as [vscode.SemanticTokensLegend, vscode.SemanticTokens];
  // enrich tokens with legend information
  return buildTokens(tokens, legends, document);
}

function buildTokens(
  tokens: vscode.SemanticTokens,
  legends: vscode.SemanticTokensLegend,
  document: vscode.TextDocument,
): SemanticToken[] {
  const richTokens: SemanticToken[] = [];

  if (!tokens) {
    return richTokens;
  }

  let prev: SemanticToken | undefined;

  for (let i = 0, len = tokens.data.length; i < len; i += 5) {
    const deltaLine = tokens.data[i];
    const deltaStart = tokens.data[i + 1];
    const length = tokens.data[i + 2];
    const tokenType = tokens.data[i + 3];
    const tokenModifiers = tokens.data[i + 4];

    const currentLine = (prev?.line || 0) + deltaLine;

    const currentStart =
      (prev?.line || 0) === currentLine
        ? (prev?.startChar || 0) + deltaStart
        : deltaStart;

    const text = document
      .lineAt(currentLine)
      .text.substring(currentStart, currentStart + length);

    const currentToken: SemanticToken = {
      line: currentLine,
      startChar: currentStart,
      length: length,
      tokenType: legends.tokenTypes[tokenType],
      tokenModifiers: buildModifiers(tokenModifiers, legends.tokenModifiers),
      text,
    };

    richTokens.push(currentToken);
    prev = currentToken;
  }
  return richTokens;
}

function buildModifiers(modifiers: number, tokenModifiers: string[]): string[] {
  const binary = modifiers.toString(2);
  const reversed = binary.split('').reverse();

  return reversed.reduce((acc, _cur, i) => {
    if (reversed[i] === '1') {
      return [...acc, tokenModifiers[i]];
    }
    return acc;
  }, [] as string[]);
}
