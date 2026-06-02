import StatusBadge from './StatusBadge';

function PaymentAttemptRow({ attempt, compact = false }) {
  return (
    <div className={`attempt-row ${compact ? 'attempt-row--compact' : ''}`}>
      <div>
        <div className="attempt-row__top">
          <StatusBadge status={attempt.status} />
          <span className="attempt-row__meta">
            {attempt.attemptTime ? new Date(attempt.attemptTime).toLocaleString() : 'Pending'}
          </span>
        </div>
        <p className="attempt-row__message">{attempt.message || 'No message provided'}</p>
      </div>
      <div className="attempt-row__codes">
        <span>{attempt.errorCode || '—'}</span>
      </div>
    </div>
  );
}

export default PaymentAttemptRow;