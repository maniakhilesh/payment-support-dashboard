import { useCallback, useEffect, useState } from 'react';
import { createOrder, getOrder, getOrders, simulatePayment } from '../api/orderApi';

function parseApiError(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'Something went wrong while contacting the backend.';
}

export function useOrders(autoLoad = true) {
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busyAction, setBusyAction] = useState(false);
  const [error, setError] = useState('');

  const refreshOrders = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getOrders();
      setOrders(response.data ?? []);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrder = useCallback(async (id) => {
    setLoading(true);
    setError('');

    try {
      const response = await getOrder(id);
      setOrder(response.data ?? null);
      return response.data;
    } catch (err) {
      setError(parseApiError(err));
      setOrder(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitOrder = useCallback(async (payload) => {
    setBusyAction(true);
    setError('');

    try {
      await createOrder(payload);
      await refreshOrders();
      return true;
    } catch (err) {
      setError(parseApiError(err));
      return false;
    } finally {
      setBusyAction(false);
    }
  }, [refreshOrders]);

  const runPaymentSimulation = useCallback(async (id, mode) => {
    setBusyAction(true);
    setError('');

    try {
      const response = await simulatePayment(id, mode);
      await refreshOrders();
      return response.data;
    } catch (err) {
      setError(parseApiError(err));
      return null;
    } finally {
      setBusyAction(false);
    }
  }, [refreshOrders]);

  useEffect(() => {
    if (autoLoad) {
      const loadOrdersOnMount = async () => {
        setLoading(true);
        setError('');

        try {
          const response = await getOrders();
          setOrders(response.data ?? []);
        } catch (err) {
          setError(parseApiError(err));
        } finally {
          setLoading(false);
        }
      };

      void loadOrdersOnMount();
    }
  }, [autoLoad, refreshOrders]);

  return {
    orders,
    order,
    loading,
    busyAction,
    error,
    refreshOrders,
    fetchOrder,
    submitOrder,
    runPaymentSimulation,
    setError,
    setOrder,
  };
}

export default useOrders;