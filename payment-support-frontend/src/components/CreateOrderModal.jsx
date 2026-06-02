import { useCallback, useEffect, useState } from 'react';

const DEFAULT_AMOUNT = '120.00';
const DEFAULT_CURRENCY = 'USD';

function CreateOrderModal({ isOpen, onClose, onSubmit, busy }) {
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  const resetForm = useCallback(() => {
    setAmount(DEFAULT_AMOUNT);
    setCurrency(DEFAULT_CURRENCY);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [handleClose, isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={handleClose}>
      <div className="modal modal--enter" role="dialog" aria-modal="true" aria-labelledby="create-order-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal__header">
          <div>
            <p className="section-eyebrow">New order</p>
            <h3 id="create-order-title">Create a payment order</h3>
          </div>
          <button type="button" className="icon-button" onClick={handleClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <form
          className="modal__form"
          onSubmit={async (event) => {
            event.preventDefault();
            await onSubmit({ amount, currency });
            resetForm();
          }}
        >
          <label>
            <span>Amount</span>
            <input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="0" step="0.01" inputMode="decimal" placeholder="120.00" />
          </label>

          <label>
            <span>Currency</span>
            <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="SGD">SGD</option>
            </select>
          </label>

          <div className="modal__actions">
            <button type="button" className="button button--ghost" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="button button--primary button--electric" disabled={busy}>
              Create order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateOrderModal;