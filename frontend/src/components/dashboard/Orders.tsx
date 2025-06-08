// src/components/othersPages/dashboard/Orders.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?.token) throw new Error("User not authenticated");
        const response = await axios.get("/api/orders", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setOrders(response.data.orders || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Error loading orders");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const isToday = (date: string) => {
    const today = new Date();
    const orderDate = new Date(date);
    return (
      orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="about-style-one-area default-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="about-style-one-info">
            <h4 className="sub-heading">Your Orders</h4>
            <h2 className="title">Order History</h2>
            <div className="wrap-account-order">
              {isLoading ? (
                <p>Loading orders...</p>
              ) : error ? (
                <p className="fs-3 text-danger text-center">{error}</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th className="fw-6">Order</th>
                      <th className="fw-6">Date</th>
                      <th className="fw-6">Status</th>
                      <th className="fw-6">Total</th>
                      <th className="fw-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? (
                      orders.map((order) => (
                        <tr key={order._id} className="tf-order-item">
                          <td>#{order._id?.slice(-6)}</td>
                          <td>
                            {order?.createdAt && (
                              <>
                                {new Date(order.createdAt).toLocaleDateString()}{" "}
                                {isToday(order.createdAt) && (
                                  <span className="badge badge-warning text-black">New</span>
                                )}
                              </>
                            )}
                          </td>
                          <td>{order?.orderStatus}</td>
                          <td>
                            ₹{order?.totalAmount} for {order?.orderItems?.length} items
                          </td>
                          <td>
                            <div className="d-flex gap-3">
                              <Link
                                to={`/my-account-orders-details?orderId=${order._id}`}
                                className="tf-btn btn-fill animate-hover-btn rounded-0 justify-content-center"
                              >
                                <span>View</span>
                              </Link>
                              <Link
                                to={`/invoice/${order._id}`}
                                className="tf-btn border-black animate-hover-btn rounded-0 justify-content-center"
                              >
                                <span>Invoice</span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-8">
                          <div>
                            <p className="text-lg mb-4">No orders found.</p>
                            <Link
                              to="/shop-default"
                              className="tf-btn btn-fill animate-hover-btn radius-3 justify-content-center"
                            >
                              Start Shopping
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}