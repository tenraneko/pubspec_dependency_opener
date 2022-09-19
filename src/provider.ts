import * as vscode from "vscode";

function getLeftSpaceWidth(text: string) {
  let width = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (text.charAt(i) === " ") {
      width += 1;
    } else {
      break;
    }
  }
  return width;
}

function readDocumentLines(document: vscode.TextDocument) {
  if (!document.fileName.endsWith("pubspec.yaml")) {
    return [];
  }

  let inDependencyScope = false;
  let lastItemOK = false;
  let lastItemLeftSpaceWidth = 0;

  return new Array(document.lineCount)
    .fill("")
    .map((line, idx) => document.lineAt(idx))
    .filter((line) => {
      const { text } = line;

      if (text.trim().length === 0) {
        return false;
      }

      if (text.startsWith(" ") && inDependencyScope) {
        if (!text.includes(":")) {
          return false;
        }

        if (lastItemOK) {
          let currentWidth = getLeftSpaceWidth(text);
          if (currentWidth > lastItemLeftSpaceWidth) {
            return false;
          }
        }

        lastItemOK = true;
        lastItemLeftSpaceWidth = getLeftSpaceWidth(text);
        return true;
      }

      if (text.startsWith("dependencies:") && text.trim() === "dependencies:") {
        inDependencyScope = true;
      } else if (text.startsWith("dev_dependencies:") && text.trim() === "dev_dependencies:") {
        inDependencyScope = true;
      } else {
        inDependencyScope = false;
      }
      lastItemOK = false;
      return false;
    });
}

export default class PubspecCodeLensProvider implements vscode.CodeLensProvider {
  provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
    let lines = readDocumentLines(document);
    return lines.map((line) => {
      let packageName = line.text.trim().split(":")[0].trim();

      return new vscode.CodeLens(line.range, {
        title: `Open -> ${packageName}`,
        command: "extension.pubspecDependencyOpenerWithParameter",
        arguments: [packageName],
      });
    });
  }
}
