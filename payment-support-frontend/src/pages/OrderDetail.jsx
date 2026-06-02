import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import PaymentSimulator from '../components/PaymentSimulator';
import StatusBadge from '../components/StatusBadge';
import { useOrders } from '../hooks/useOrders';

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { order, loading, error, fetchOrder } = useOrders(false);

  useEffect(() => {
    if (id) {
      void fetchOrder(id);
    }
  }, [id, fetchOrder]);

  if (loading && !order) {
    return <EmptyState title="Loading order" description="Fetching the selected payment order and attempt history." />;
  }

  if (error && !order) {
    return (
      <EmptyState
        title="Order not available"
        description={error}
        actionLabel="Back to dashboard"
        onAction={() => navigate('/')}
      />
    );
  }

  if (!order) {
    return null;
  }

  const attempts = Array.isArray(order.attempts)
    ? [...order.attempts].sort((left, right) => {
        const leftTime = new Date(left.attemptTime || 0).getTime();
        const rightTime = new Date(right.attemptTime || 0).getTime();
        return rightTime - leftTime;
      })
    : [];

  const timelineTone = (status) => {
    if (status === 'SUCCESS' || status === 'PAID') {
      return 'success';
    }

    if (status === 'FAILURE' || status === 'PAYMENT_FAILED') {
      return 'failure';
    }

    return 'pending';
  };

  return (
    <div className="order-detail page-fade-in">
      <div className="detail-toolbar">
        <Link className="button button--ghost button--small" to="/">
          ← Back to Dashboard
        </Link>
        <div className="detail-toolbar__meta">
          <StatusBadge status={order.status} />
          <span className="muted">Order #{order.id}</span>
        </div>
      </div>

      <section className="panel order-detail__hero">
        <div>
          <p className="section-eyebrow">Order detail</p>
          <h1>Payment simulation record</h1>
          <div className="order-detail__id">ID #{order.id}</div>
          <p className="hero__text">Review the order, inspect payment attempts, and replay the gateway outcome.</p>
        </div>

        <div className="order-detail__summary">
          <div>
            <span className="hero__status-label">Amount</span>
            <strong className="mono">{Number(order.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency}</strong>
          </div>
          <div>
            <span className="hero__status-label">Created</span>
            <strong>{order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</strong>
          </div>
          <div>
            <span className="hero__status-label">Attempts</span>
            <strong>{attempts.length}</strong>
          </div>
        </div>
      </section>

      <section className="panel detail-grid">
        <div>
          <div className="panel__header">
            <div>
              <p className="section-eyebrow">Gateway control</p>
              <h3>Simulate new payment</h3>
            </div>
          </div>
          <PaymentSimulator
            orderId={order.id}
            onSuccess={async () => {
              await fetchOrder(order.id);
            }}
          />
        </div>

        <div>
          <div className="panel__header">
            <div>
              <p className="section-eyebrow">Attempts</p>
              <h3>Payment timeline</h3>
            </div>
          </div>

          {attempts.length ? (
            <div className="timeline">
              {attempts.map((attempt, index) => {
                const tone = timelineTone(attempt.status);

                return (
                  <article key={attempt.id} className={`timeline-item timeline-item--${tone}`}>
                    <div className="timeline-item__rail">
                      <span className="timeline-item__dot" />
                      {index < attempts.length - 1 ? <span className="timeline-item__line" /> : null}
                    </div>
                    <div className="timeline-item__content">
                      <div className="timeline-item__header">
                        <StatusBadge status={attempt.status} />
                        <span className="timeline-item__time">{attempt.attemptTime ? new Date(attempt.attemptTime).toLocaleString() : 'Pending'}</span>
                      </div>
                      <div className="timeline-item__meta">
                        <span>
                          <strong>Error code:</strong> {attempt.errorCode || '—'}
                        </span>
                        <span>
                          <strong>Message:</strong> {attempt.message || 'No message provided'}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No attempts yet" description="Run a simulation to record the first payment attempt." />
          )}
        </div>
      </section>
    </div>
  );
}

export default OrderDetail;