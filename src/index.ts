import * as vscode from "vscode";

export type SemanticToken = {
  text: string;
  line: number;
  startChar: number;
  length: number;
  tokenType: string;
  tokenModifiers: string[];
};

// overloads
export async function getSemanticTokens(
  document: vscode.TextDocument,
): Promise<SemanticToken[]>;
export async function getSemanticTokens(
  uri: vscode.Uri,
  content: string,
): Promise<SemanticToken[]>;

//implementation
export async function getSemanticTokens(
  arg1: vscode.TextDocument | vscode.Uri,
  arg2?: string,
): Promise<SemanticToken[]> {
  const uri: vscode.Uri = arg1 instanceof vscode.Uri ? arg1 : arg1.uri;
  const content = arg1 instanceof vscode.Uri ? arg2 : arg1.getText();

  const [legends, tokens] = (await Promise.all([
    vscode.commands.executeCommand(
      "vscode.provideDocumentSemanticTokensLegend",
      uri,
    ),
    vscode.commands.executeCommand("vscode.provideDocumentSemanticTokens", uri),
  ])) as [vscode.SemanticTokensLegend, vscode.SemanticTokens];
  // enrich tokens with legend information
  return buildTokens(tokens, legends, content);
}

function buildTokens(
  tokens: vscode.SemanticTokens,
  legends: vscode.SemanticTokensLegend,
  content: string,
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

    const text = getTextFromContent(
      content,
      new vscode.Range(
        currentLine,
        currentStart,
        currentLine,
        currentStart + length,
      ),
    );

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
  const result: string[] = [];
  for (let i = tokenModifiers.length - 1; i >= 0; i--) {
    const mask = 1 << i;
    if ((modifiers & mask) === mask) {
      result.push(tokenModifiers[i]);
    }
  }
  return result;
}

function getTextFromContent(content: string, range: vscode.Range): string {
  const lines = content.split("\n"); // Split the content into lines

  const startLine = range.start.line;
  const startCharacter = range.start.character;
  const endLine = range.end.line;
  const endCharacter = range.end.character;

  // If the range spans a single line
  if (startLine === endLine) {
    return lines[startLine].slice(startCharacter, endCharacter);
  }

  // If the range spans multiple lines
  const selectedLines = lines.slice(startLine, endLine + 1);
  selectedLines[0] = selectedLines[0].slice(startCharacter); // Trim the first line
  selectedLines[selectedLines.length - 1] = selectedLines[
    selectedLines.length - 1
  ].slice(0, endCharacter); // Trim the last line

  return selectedLines.join("\n"); // Join the selected lines with newlines
}
