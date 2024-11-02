import vscode, { ExtensionContext, QuickPickItem } from 'vscode';
import octicons from '@primer/octicons';

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('octiconsSearch.search', searchOcticons)
  );
}

async function searchOcticons() {
  const items = getOcticonItems();
  const selectedItem = await showQuickPick(items);
  if (selectedItem) {
    await copySvgToClipboard(selectedItem.label);
  }
}

function getOcticonItems(): QuickPickItem[] {
  const icons = Object.values(octicons);
  return icons.map((icon) => {
    return {
      label: icon.symbol,
      description: icon.keywords.join(', ')
    };
  });
}

async function showQuickPick(items: QuickPickItem[]): Promise<QuickPickItem | undefined> {
  return await vscode.window.showQuickPick(items, {
    placeHolder: 'Select an Octicon to copy its SVG to clipboard',
    matchOnDescription: true
  });
}

async function copySvgToClipboard(label: string) {
  const selectedIcon = octicons[label as keyof typeof octicons];
  if (selectedIcon) {
    await vscode.env.clipboard.writeText(selectedIcon.toSVG());
    vscode.window.showInformationMessage(`Copied "${label}" SVG to clipboard.`);
  }
}
