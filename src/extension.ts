// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import PubspecCodeLensProvider from "./provider";

const key = "pubspec-dependency-open.baseUrl";
var baseUrl: string | undefined = vscode.workspace.getConfiguration().get(key);
if (undefined === baseUrl || baseUrl.trim().length < 1) {
  baseUrl = "https://pub.dev/";
}

function startSearch(packageName: string) {
  if (baseUrl === undefined) {
    return;
  }
  // https://pub.dev/packages/path
  var tempUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
  let searchUrl = tempUrl + "packages/" + encodeURI(packageName);
  vscode.env.openExternal(vscode.Uri.parse(searchUrl));
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.languages.registerCodeLensProvider("yaml", new PubspecCodeLensProvider()));

  let commandSearch = vscode.commands.registerTextEditorCommand(
    "extension.pubspecDependencyOpenerWithParameter",
    async (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, packageName: string) => {
      startSearch(packageName);
    }
  );
  context.subscriptions.push(commandSearch);

  let commandInput = vscode.commands.registerCommand("extension.pubspecDependencyOpener", () => {
    // The code you place here will be executed every time your command is executed
    vscode.window.showInputBox().then((text) => {
      if (text === undefined || text === "") {
        return;
      }
      startSearch(text);
    });
  });
  context.subscriptions.push(commandInput);
}

// this method is called when your extension is deactivated
export function deactivate() {}
