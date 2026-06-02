import EmptyState from './EmptyState';
import OrderRow from './OrderRow';

function OrderTable({ orders, expandedOrderId, onToggleExpand, onCreateOrder, onSimulate, onRefresh }) {
  if (!orders.length) {
    return (
      <EmptyState
        title="No orders found"
        description="Create the first simulated payment order to start tracking merchant activity."
        actionLabel="Create order"
        onAction={onCreateOrder}
      />
    );
  }

  return (
    <section className="panel table-panel">
      <div className="panel__header">
        <div>
          <p className="section-eyebrow">Order feed</p>
          <h3>Payments overview</h3>
        </div>
        <p className="panel__subtext">Click a row to expand attempt history or launch the simulator.</p>
      </div>

      <div className="table-scroll">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Attempts</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <OrderRow
                key={order.id}
                order={order}
                expanded={expandedOrderId === order.id}
                onToggleExpand={onToggleExpand}
                onSimulate={onSimulate}
                onRefresh={onRefresh}
                style={{ '--row-delay': `${index * 60}ms` }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default OrderTable;