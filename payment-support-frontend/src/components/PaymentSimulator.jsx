import { useEffect, useRef, useState } from 'react';
import { simulatePayment } from '../api/orderApi';

const ACTIONS = [
  {
    mode: 'SUCCESS',
    label: 'Simulate Success',
    toast: 'Payment succeeded! ✓',
    tone: 'success',
    buttonClass: 'button--success',
    symbol: '✓',
  },
  {
    mode: 'FAILURE',
    label: 'Simulate Failure',
    toast: 'Payment failed. ✗',
    tone: 'failure',
    buttonClass: 'button--danger',
    symbol: '✗',
  },
  {
    mode: 'TIMEOUT',
    label: 'Simulate Timeout',
    toast: 'Payment timed out. ⏱',
    tone: 'pending',
    buttonClass: 'button--amber',
    symbol: '⏱',
  },
];

function PaymentSimulator({ orderId, onSuccess, onSimulate, busy = false }) {
  const [pendingMode, setPendingMode] = useState('');
  const [toast, setToast] = useState(null);
  const [toastLeaving, setToastLeaving] = useState(false);
  const hideTimerRef = useRef(null);
  const removeTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      window.clearTimeout(hideTimerRef.current);
      window.clearTimeout(removeTimerRef.current);
    };
  }, []);

  const showToast = (message, tone) => {
    window.clearTimeout(hideTimerRef.current);
    window.clearTimeout(removeTimerRef.current);
    setToastLeaving(false);
    setToast({ message, tone });

    hideTimerRef.current = window.setTimeout(() => {
      setToastLeaving(true);
      removeTimerRef.current = window.setTimeout(() => {
        setToast(null);
        setToastLeaving(false);
      }, 240);
    }, 3000);
  };

  const handleSimulate = async (action) => {
    if (pendingMode || busy) {
      return;
    }

    setPendingMode(action.mode);

    try {
      if (orderId != null) {
        await simulatePayment(orderId, action.mode);
      } else if (onSimulate) {
        await onSimulate(action.mode);
      }

      showToast(action.toast, action.tone);
      if (onSuccess) {
        await onSuccess(action.mode);
      }
    } catch {
      showToast('Unable to run simulation.', 'failure');
    } finally {
      setPendingMode('');
    }
  };

  return (
    <section className="simulator">
      <div className="simulator__header">
        <h3>Payment Simulator</h3>
        <p>Trigger a synthetic gateway outcome for the selected order.</p>
      </div>

      <div className="simulator__actions">
        {ACTIONS.map((action) => {
          const isPending = pendingMode === action.mode;

          return (
            <button
              key={action.mode}
              type="button"
              className={`button ${action.buttonClass} simulator__button ${isPending ? 'simulator__button--loading' : ''}`}
              onClick={() => handleSimulate(action)}
              disabled={busy || Boolean(pendingMode)}
            >
              <span className={`simulator__button-icon ${isPending ? 'simulator__button-icon--hidden' : ''}`} aria-hidden="true">
                {action.symbol}
              </span>
              <span>{action.label}</span>
              {isPending ? <span className="spinner" aria-label="Loading" /> : null}
            </button>
          );
        })}
      </div>

      {toast ? (
        <div className={`toast toast--${toast.tone} ${toastLeaving ? 'toast--exit' : 'toast--enter'}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      ) : null}
    </section>
  );
}

export default PaymentSimulator;