const STATUS_CONFIG = {
  CREATED: { tone: 'created', pulsing: false },
  PAID: { tone: 'success', pulsing: true },
  PAYMENT_FAILED: { tone: 'failure', pulsing: false },
  PAYMENT_PENDING: { tone: 'pending', pulsing: false },
  SUCCESS: { tone: 'success', pulsing: true },
  FAILURE: { tone: 'failure', pulsing: false },
  TIMEOUT: { tone: 'pending', pulsing: false },
};

function StatusBadge({ status = 'CREATED', loading = false, error = '' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.CREATED;
  const showPulse = config.pulsing && !loading && !error;

  return (
    <span className={`status-badge status-badge--${config.tone}`}>
      {showPulse ? <span className="status-badge__pulse" /> : <span className="status-badge__dot" />}
      <span className="status-badge__text">{loading ? 'LOADING' : error ? 'ERROR' : status}</span>
    </span>
  );
}

export default StatusBadge;