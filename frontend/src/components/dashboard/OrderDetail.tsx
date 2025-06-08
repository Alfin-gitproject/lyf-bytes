// src/components/othersPages/dashboard/OrderDetails.tsx
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import ImageModal from "@/components/modal/ImageModal"; // Ensure file exists
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function OrderDetails() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("Order History");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentImage, setCurrentImage] = useState<string[]>([]);

  const openModal = (imageurl: string | string[]) => {
    const urls = Array.isArray(imageurl) ? imageurl : [imageurl];
    setCurrentImage(urls);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  };

  const addDate = (dateString: string, daysToAdd: number = 0) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    date.setDate(date.getDate() + daysToAdd);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setIsLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?.token) throw new Error("User not authenticated");
        const response = await axios.get(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setOrderDetails(response.data.order);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch order");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    const tabs = () => {
      document.querySelectorAll(".widget-tabs").forEach((widgetTab) => {
        const titles = widgetTab.querySelectorAll(".widget-menu-tab .item-title");
        titles.forEach((title, index) => {
          title.addEventListener("click", () => {
            titles.forEach((item) => item.classList.remove("active"));
            title.classList.add("active");
            const contentItems = widgetTab.querySelectorAll(".widget-content-tab > *");
            contentItems.forEach((content) => content.classList.remove("active"));
            const contentActive = contentItems[index];
            contentActive?.classList.add("active");
            contentActive.style.display = "block";
            contentActive.style.opacity = "0";
            setTimeout(() => (contentActive.style.opacity = "1"), 0);
            contentItems.forEach((content, idx) => {
              if (idx !== index) content.style.display = "none";
            });
          });
        });
      });
    };
    tabs();
    return () => {
      document.querySelectorAll(".widget-menu-tab .item-title").forEach((title) => {
        title.removeEventListener("click", () => {});
      });
    };
  }, []);

  if (isLoading) {
    return (
      <div className="about-style-one-area default-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="about-style-one-area default-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-red-500 mb-4">Error: {error}</p>
            <Link
              to="/my-account-orders"
              className="tf-btn btn-fill animate-hover-btn radius-3 justify-content-center"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="about-style-one-area default-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="about-style-one-info">
            <h4 className="sub-heading">Order Details</h4>
            <h2 className="title">Order #{orderDetails?._id?.slice(-6)}</h2>
            <div className="w-100 mb-4">
              <Link
                to="/my-account-orders"
                className="tf-btn rounded-circle btn-fill animate-hover-btn rounded-0 justify-content-center p-2"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </Link>
            </div>
            {orderDetails && (
              <div className="wd-form-order">
                <div className="order-head">
                  <figure className="img-product">
                    {orderDetails.orderItems?.[0]?.image && (
                      <img
                        alt="product"
                        src={orderDetails.orderItems[0].image}
                        width={720}
                        height={1005}
                        loading="lazy"
                      />
                    )}
                  </figure>
                  <div className="content">
                    <div className="badge">{orderDetails.orderStatus}</div>
                    <h6 className="mt-8 fw-5">Order #{orderDetails._id?.slice(-6)}</h6>
                  </div>
                </div>
                <div className="tf-grid-layout md-col-2 gap-15">
                  <div className="item">
                    <div className="text-2 text_black-2">Start Time</div>
                    <div className="text-2 mt_4 fw-6">{formatDate(orderDetails.createdAt)}</div>
                  </div>
                  <div className="item">
                    <div className="text-2 text_black-2">Address</div>
                    <div className="text-2 mt_4 fw-6">{orderDetails.shippingInfo?.address || "N/A"}</div>
                  </div>
                </div>
                <div className="widget-tabs style-has-border widget-order-tab">
                  <ul className="widget-menu-tab">
                    <li
                      className={`item-title ${activeTab === "Order History" ? "active" : ""}`}
                      onClick={() => handleTabClick("Order History")}
                    >
                      <span className="inner">Order History</span>
                    </li>
                    <li
                      className={`item-title ${activeTab === "Item Details" ? "active" : ""}`}
                      onClick={() => handleTabClick("Item Details")}
                    >
                      <span className="inner">Item Details</span>
                    </li>
                  </ul>
                  <div className="widget-content-tab">
                    <div className={`widget-content-inner ${activeTab === "Order History" ? "active" : ""}`}>
                      <div className="widget-timeline">
                        <ul className="timeline">
                          {["Processing", "Shipped", "Delivered"].includes(orderDetails.orderStatus) && (
                            <li>
                              <div className="timeline-badge success" />
                              <div className="timeline-box">
                                <a className="timeline-panel" href="#">
                                  <div className="text-2 fw-6">Product Processing</div>
                                </a>
                                <p>
                                  <strong>Estimated Delivery Date: </strong>
                                  {addDate(orderDetails.createdAt, 7)}
                                </p>
                              </div>
                            </li>
                          )}
                          {["Shipped", "Delivered"].includes(orderDetails.orderStatus) && (
                            <li>
                              <div className="timeline-badge success" />
                              <div className="timeline-box">
                                <a className="timeline-panel" href="#">
                                  <div className="text-2 fw-6">Product Shipped</div>
                                  <span>{formatDate(orderDetails.updatedAt)}</span>
                                </a>
                              </div>
                            </li>
                          )}
                          {["Delivered"].includes(orderDetails.orderStatus) && (
                            <li>
                              <div className="timeline-badge success" />
                              <div className="timeline-box">
                                <a className="timeline-panel" href="#">
                                  <div className="text-2 fw-6">Product Delivered</div>
                                  <span>{formatDate(orderDetails.updatedAt)}</span>
                                </a>
                              </div>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                    <div className={`widget-content-inner ${activeTab === "Item Details" ? "active" : ""}`}>
                      {orderDetails.orderItems?.map((item: any, i: number) => (
                        <div className="order-head" key={i}>
                          <figure className="img-product">
                            <img
                              alt="product"
                              src={item.image}
                              width={720}
                              height={1005}
                              loading="lazy"
                            />
                          </figure>
                          <div className="content">
                            <div className="text-2 fw-6">{item.name}</div>
                            <div className="mt_4">
                              <span className="fw-6">Price: </span>
                              {`₹${item.price}${item.quantity > 1 ? ` * ${item.quantity}` : ""}`}
                            </div>
                            <div>
                              <button
                                style={{ textDecoration: "underline" }}
                                onClick={() => openModal(Array.isArray(item.uploadedImage) ? item.uploadedImage : [item.uploadedImage])}
                                className="fw-6 border-0 text-brand-primary bg-transparent"
                              >
                                Uploaded image
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <ul>
                        <li className="d-flex justify-content-between text-2">
                          <span>Total Price</span>
                          <span className="fw-6">₹{orderDetails?.itemsPrice?.toFixed(2)}</span>
                        </li>
                        {orderDetails?.couponApplied !== "No" && (
                          <li className="d-flex justify-content-between text-2 mt_4 pb_8 line">
                            <span>Total Discounts</span>
                            <span className="fw-6">
                              - ₹{(orderDetails?.itemsPrice - orderDetails?.totalAmount?.toFixed(2))?.toFixed(2)}
                            </span>
                          </li>
                        )}
                        <li className="d-flex justify-content-between text-2 mt_8">
                          <span>Order Total</span>
                          <span className="fw-6">₹{orderDetails?.totalAmount?.toFixed(2)}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <ImageModal isOpen={isOpen} imageUrls={currentImage} onClose={closeModal} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}