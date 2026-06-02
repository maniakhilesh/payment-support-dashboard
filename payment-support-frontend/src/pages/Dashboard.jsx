import { useCallback, useEffect, useMemo, useState } from 'react';
import CreateOrderModal from '../components/CreateOrderModal';
import OrderTable from '../components/OrderTable';
import PaymentSimulator from '../components/PaymentSimulator';
import StatCard from '../components/StatCard';
import { createOrder, getOrders } from '../api/orderApi';

const REFRESH_INTERVAL_MS = 10000;

const STATUS_GROUPS = {
  success: new Set(['PAID', 'SUCCESS']),
  failed: new Set(['PAYMENT_FAILED', 'FAILURE', 'TIMEOUT']),
  pending: new Set(['CREATED', 'PAYMENT_PENDING']),
};

function getErrorMessage(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'Unable to load payment orders right now.';
}

function formatAmount(amount) {
  return Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const loadOrders = useCallback(async ({ initial = false } = {}) => {
    if (initial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError('');

    try {
      const response = await getOrders();
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (fetchError) {
      setError(getErrorMessage(fetchError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initialLoadId = window.setTimeout(() => {
      void loadOrders({ initial: true });
    }, 0);

    const intervalId = window.setInterval(() => {
      void loadOrders();
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearTimeout(initialLoadId);
      window.clearInterval(intervalId);
    };
  }, [loadOrders]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((left, right) => {
      const leftTime = new Date(left.createdAt || 0).getTime();
      const rightTime = new Date(right.createdAt || 0).getTime();
      return rightTime - leftTime;
    });
  }, [orders]);

  const summary = useMemo(() => {
    const total = orders.length;
    const successfulPayments = orders.filter((order) => STATUS_GROUPS.success.has(order.status)).length;
    const failedPayments = orders.filter((order) => STATUS_GROUPS.failed.has(order.status)).length;
    const pendingOrders = orders.filter((order) => STATUS_GROUPS.pending.has(order.status)).length;

    return {
      total,
      successfulPayments,
      failedPayments,
      pendingOrders,
    };
  }, [orders]);

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) {
      return null;
    }

    return sortedOrders.find((order) => order.id === selectedOrderId) || null;
  }, [selectedOrderId, sortedOrders]);

  const hasOrders = sortedOrders.length > 0;

  const handleCreateOrder = async (payload) => {
    setActionBusy(true);
    setError('');

    try {
      await createOrder(payload);
      setIsModalOpen(false);
      await loadOrders();
    } catch (createError) {
      setError(getErrorMessage(createError));
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <div className="dashboard page-fade-in">
      <section className="dashboard__hero panel panel--hero">
        <div className="dashboard__hero-copy">
          <div className="dashboard__title-row">
            <div>
              <p className="section-eyebrow">Payment Operations</p>
              <h1 className="dashboard__title">Payment Support Dashboard</h1>
            </div>

            <div className="dashboard__live" aria-label="Live status">
              <span className="dashboard__live-dot" />
              <span>Live</span>
            </div>
          </div>

          <p className="dashboard__subtitle">Monitor and debug merchant payment integrations</p>

          <div className="dashboard__actions">
            <button type="button" className="button button--primary button--electric" onClick={() => setIsModalOpen(true)}>
              New Order
            </button>
            <button type="button" className="button button--ghost" onClick={() => loadOrders()} disabled={loading || refreshing}>
              {refreshing ? 'Refreshing…' : 'Refresh now'}
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      ) : null}

      <section className="stats-grid">
        <StatCard title="Total Orders" value={summary.total} color="blue" icon="🧾" note="All orders currently in the support queue." />
        <StatCard title="Successful Payments" value={summary.successfulPayments} color="green" icon="✅" note="Orders that completed successfully." />
        <StatCard title="Failed Payments" value={summary.failedPayments} color="red" icon="⛔" note="Orders that resolved with a failure." />
        <StatCard title="Pending Orders" value={summary.pendingOrders} color="amber" icon="⏳" note="Orders still waiting for a final state." />
      </section>

      {loading && !hasOrders ? (
        <section className="panel dashboard-skeleton" aria-label="Loading orders">
          <div className="dashboard-skeleton__hero">
            <div className="skeleton skeleton--line skeleton--wide" />
            <div className="skeleton skeleton--line skeleton--medium" />
            <div className="dashboard-skeleton__actions">
              <div className="skeleton skeleton--button" />
              <div className="skeleton skeleton--button skeleton--ghost" />
            </div>
          </div>
          <div className="dashboard-skeleton__table">
            <div className="dashboard-skeleton__table-head" aria-hidden="true">
              {Array.from({ length: 7 }).map((_, index) => (
                <span key={index} className="skeleton skeleton--label" />
              ))}
            </div>
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="dashboard-skeleton__row" key={index}>
                <div className="skeleton skeleton--line skeleton--short" />
                <div className="skeleton skeleton--line skeleton--medium" />
                <div className="skeleton skeleton--line skeleton--short" />
                <div className="skeleton skeleton--pill" />
                <div className="skeleton skeleton--line skeleton--wide" />
                <div className="skeleton skeleton--line skeleton--short" />
                <div className="skeleton skeleton--button skeleton--small" />
              </div>
            ))}
          </div>
        </section>
      ) : !hasOrders ? (
        <section className="dashboard-empty panel">
          <div className="dashboard-empty__icon" aria-hidden="true">
            💳
          </div>
          <h3>No orders yet. Create your first order to get started.</h3>
          <p>Use the new order flow to create a payment record, then simulate gateway outcomes and inspect attempts inline.</p>
          <button type="button" className="button button--primary button--electric" onClick={() => setIsModalOpen(true)}>
            Create Order
          </button>
        </section>
      ) : (
        <OrderTable
          orders={sortedOrders}
          expandedOrderId={expandedOrderId}
          onToggleExpand={(id) => setExpandedOrderId((current) => (current === id ? null : id))}
          onCreateOrder={() => setIsModalOpen(true)}
          onRefresh={loadOrders}
          onSimulate={(order) => {
            setSelectedOrderId(order.id);
            setIsSimulatorOpen(true);
          }}
        />
      )}

      <CreateOrderModal isOpen={isModalOpen} busy={actionBusy} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateOrder} />

      {isSimulatorOpen && selectedOrder ? (
        <div className="modal-overlay" role="presentation" onClick={() => setIsSimulatorOpen(false)}>
          <div className="modal modal--simulator" role="dialog" aria-modal="true" aria-labelledby="simulate-order-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal__header">
              <div>
                <p className="section-eyebrow">Payment simulation</p>
                <h3 id="simulate-order-title">Order #{selectedOrder.id}</h3>
              </div>
              <button type="button" className="icon-button" onClick={() => setIsSimulatorOpen(false)} aria-label="Close simulation modal">
                ×
              </button>
            </div>

            <div className="modal__summary">
              <div>
                <span>Amount</span>
                <strong>{formatAmount(selectedOrder.amount)}</strong>
              </div>
              <div>
                <span>Currency</span>
                <strong>{selectedOrder.currency}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{selectedOrder.status}</strong>
              </div>
            </div>

            <PaymentSimulator
              orderId={selectedOrder.id}
              busy={actionBusy}
              onSuccess={async () => {
                await loadOrders();
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Dashboard;