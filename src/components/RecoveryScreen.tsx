import { useState } from 'react';
import type { Recovery } from '../state/useExamStore';
import { ConfirmDialog } from './ConfirmDialog';

export function RecoveryScreen({ recovery, onReset }: { recovery: Recovery; onReset: () => void }) {
  const [confirm, setConfirm] = useState(false);

  const download = () => {
    const blob = new Blob([recovery.raw ?? ''], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gh300-practice-saved-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <h1 tabIndex={-1}>We couldn't load your saved progress</h1>
      <div className="alert alert-error" role="alert">
        <p>{recovery.message}</p>
        <p>
          Your saved data has not been changed. You can download a copy for safekeeping, then reset to start fresh.
          No results have been shown or created from the damaged data.
        </p>
      </div>
      <div className="actions">
        <button type="button" className="btn" onClick={download}>
          Download saved data
        </button>
        <button type="button" className="btn btn-danger" onClick={() => setConfirm(true)}>
          Reset saved data
        </button>
      </div>
      {confirm && (
        <ConfirmDialog
          title="Reset saved data?"
          confirmLabel="Reset"
          destructive
          onCancel={() => setConfirm(false)}
          onConfirm={() => {
            setConfirm(false);
            onReset();
          }}
        >
          <p>This permanently deletes the unreadable saved data, including any unfinished attempt and history.</p>
        </ConfirmDialog>
      )}
    </>
  );
}
