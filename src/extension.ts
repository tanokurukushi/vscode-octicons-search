import vscode, { ExtensionContext, QuickPickItem } from 'vscode';
import octicons from '@primer/octicons';

interface QuickPickIconItem extends QuickPickItem {
  heights: number[];
}

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('octiconsSearch.search', searchOcticons)
  );
}

async function searchOcticons() {
  const items = getOcticonItems();
  const selectedItem = await showIconQuickPick(items);
  if (!selectedItem) {
    return;
  }
  const selectedHeight = await showHeightQuickPick(selectedItem);
  if (!selectedHeight) {
    return;
  }
  await copySvgToClipboard(selectedItem.label, selectedHeight);
}

function getOcticonItems(): QuickPickIconItem[] {
  const icons = Object.values(octicons);
  return icons.map((icon) => {
    return {
      label: icon.symbol,
      description: icon.keywords.join(', '),
      heights: Object.keys(icon.heights).map((height) => parseInt(height, 10))
    };
  });
}

async function showIconQuickPick(
  items: QuickPickIconItem[]
): Promise<QuickPickIconItem | undefined> {
  return await vscode.window.showQuickPick(items, {
    placeHolder: 'Select an Octicon to copy its SVG to clipboard',
    matchOnDescription: true
  });
}

async function showHeightQuickPick(item: QuickPickIconItem): Promise<number | undefined> {
  const heightString = await vscode.window.showQuickPick(
    item.heights.map((height) => height.toString()),
    {
      placeHolder: 'Select a height for the SVG'
    }
  );
  if (!heightString) {
    return undefined;
  }
  return parseInt(heightString, 10);
}

async function copySvgToClipboard(label: string, height: number) {
  const selectedIcon = octicons[label as keyof typeof octicons];
  if (selectedIcon) {
    await vscode.env.clipboard.writeText(selectedIcon.toSVG({ height }));
    vscode.window.showInformationMessage(`Copied "${label}-${height}" SVG to clipboard.`);
  } else {
    vscode.window.showErrorMessage(`"${label}-${height}" not found.`);
  }
}
