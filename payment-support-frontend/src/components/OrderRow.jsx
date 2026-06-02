import { Link } from 'react-router-dom';
import PaymentAttemptRow from './PaymentAttemptRow';
import PaymentSimulator from './PaymentSimulator';
import StatusBadge from './StatusBadge';

function OrderRow({ order, expanded, onToggleExpand, onSimulate = () => {}, onRefresh, style }) {
  const attempts = Array.isArray(order.attempts) ? order.attempts : [];
  const attemptCount = attempts.length;

  const handleRowToggle = () => {
    onToggleExpand(order.id);
  };

  return (
    <>
      <tr className={`order-row ${expanded ? 'order-row--expanded' : ''}`} onClick={handleRowToggle} aria-expanded={expanded} style={style}>
        <td>
          <div className="order-row__id">#{order.id}</div>
        </td>
        <td>
          <div className="mono order-row__amount">
            {Number(order.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </td>
        <td>
          <span className="order-row__currency">{order.currency}</span>
        </td>
        <td>
          <StatusBadge status={order.status} />
        </td>
        <td className="order-row__created-at">{order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</td>
        <td>
          <span className="order-row__attempt-count">{attemptCount}</span>
        </td>
        <td className="order-row__actions order-row__actions--group">
          <button
            type="button"
            className="button button--small button--amber"
            onClick={(event) => {
              event.stopPropagation();
              onSimulate(order);
            }}
          >
            Simulate
          </button>
          <Link className="button button--small button--ghost" to={`/orders/${order.id}`} onClick={(event) => event.stopPropagation()}>
            View details
          </Link>
        </td>
      </tr>
      {expanded ? (
        <tr className="order-row__details">
          <td colSpan="7">
            <div className="order-row__panel">
              <div className="order-row__panel-top">
                <div>
                  <p className="section-eyebrow">Attempt history</p>
                  <h4>Latest payment activity</h4>
                </div>
                <Link className="button button--small button--primary" to={`/orders/${order.id}`}>
                  Open order
                </Link>
              </div>
              {attempts.length > 0 ? (
                <div className="attempt-list">
                  {attempts.slice(0, 3).map((attempt) => (
                    <PaymentAttemptRow key={attempt.id} attempt={attempt} compact />
                  ))}
                </div>
              ) : (
                <p className="muted">No payment attempts yet for this order.</p>
              )}
              <div className="order-row__simulator">
                <div className="panel__header">
                  <div>
                    <p className="section-eyebrow">Simulation</p>
                    <h4>Simulate payment</h4>
                  </div>
                </div>
                <PaymentSimulator
                  orderId={order.id}
                  onSuccess={async () => {
                    if (onRefresh) {
                      await onRefresh();
                    }
                  }}
                />
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

export default OrderRow;