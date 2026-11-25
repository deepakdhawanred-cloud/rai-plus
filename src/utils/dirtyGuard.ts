/**
 * Lightweight shared dirty-form registry so navigating between workspace tabs
 * warns staff before accidentally discarding unsaved attendance or notebook rosters.
 */
const dirtySources = new Map<string, string>();

export function setWorkspaceDirtyState(sourceId: string, label: string | null) {
  if (!label) {
    dirtySources.delete(sourceId);
  } else {
    dirtySources.set(sourceId, label);
  }
}

export function getActiveDirtyWarning(): string | null {
  if (dirtySources.size === 0) return null;
  const labels = Array.from(dirtySources.values());
  return `You have unsaved changes in ${labels.join(' & ')}. Save before switching sections, or discard?`;
}

export function clearAllDirtyStates() {
  dirtySources.clear();
}
