// src/components/CheckoutContent.tsx
"use client"; // Required for Next.js client-side features

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { CartItem, saveShippingInfo } from "../../store/features/cartSlice"; // Import CartItem and saveShippingInfo
import CustomSelect from "../select/CustomSelect";
import PaymentModal from "../modal/PaymentModal";
import { toast } from "react-toastify";
import { useLoginMutation, useRegisterMutation } from "../../store/api/authApi";
import { setUser, setIsAuthenticated, setToken } from "../../store/features/userSlice";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useCreateNewOrderMutation, useRazorpayCheckoutSessionMutation, useRazorpayWebhookMutation } from "../../store/api/orderApi";
import { clearCart } from "../../store/features/cartSlice";

interface FormEventHandler {
  (event: React.FormEvent<HTMLFormElement>): void;
}

const CheckoutContent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state: RootState) => state.cart?.cartItems ?? []); // Use cartItems, not items
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);  const [isFormValid, setIsFormValid] = useState(false);
  const [login, { isLoading: isLoginLoading, error: loginError }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading, error: registerError }] = useRegisterMutation();
  const [createNewOrder, { isLoading: isCreatingOrder }] = useCreateNewOrderMutation();
  const [razorpayCheckoutSession, { isLoading: isCreatingSession }] = useRazorpayCheckoutSessionMutation();
  const [razorpayWebhook] = useRazorpayWebhookMutation();
  const user = useSelector((state: RootState) => state.user.user);
  const shippingInfo = useSelector((state: RootState) => state.cart.shippingInfo);

  const subtotal = cartItems.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 0),
    0
  );

  const persons = [
    { value: "1", label: "Australia" },
    { value: "2", label: "Canada" },
    { value: "3", label: "China" },
    { value: "4", label: "Japan" },
    { value: "5", label: "Bangladesh" },
  ];  const handleForm: FormEventHandler = (event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const shippingInfo = {
      firstName: formData.get("f-name") as string,
      lastName: formData.get("l-name") as string,
      country: formData.get("select") as string,
      streetAddress: formData.get("st-address") as string,
      streetAddress2: formData.get("st-address2") as string,
      city: formData.get("t-city") as string,
      state: formData.get("st-country") as string,
      postcode: formData.get("postcode") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      comments: formData.get("comments") as string,
    };
    
    // Validate required fields
    if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.streetAddress || 
        !shippingInfo.city || !shippingInfo.state || !shippingInfo.postcode || !shippingInfo.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Check if user is authenticated before proceeding to payment
    if (!isAuthenticated) {
      dispatch(saveShippingInfo(shippingInfo));
      setIsFormValid(true);
      setShowLoginModal(true);
      return;
    }

    dispatch(saveShippingInfo(shippingInfo));
    setIsFormValid(true);
    setShowPaymentModal(true);
  };  const handleConfirmOrder = async (paymentMethod: string) => {
    try {      // Prepare order data
      const orderData = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          image: item.image || '', // Required field for Order schema
          uploadedImage: item.uploadedImage ? (Array.isArray(item.uploadedImage) ? item.uploadedImage : [item.uploadedImage]) : [],
          quantity: item.quantity,
          price: item.price.toString(),
          product: item.product
        })),
        shippingInfo: {
          fullName: `${shippingInfo?.firstName || ''} ${shippingInfo?.lastName || ''}`.trim(),
          address: shippingInfo?.streetAddress || '',
          email: shippingInfo?.email || user?.email || '',
          state: shippingInfo?.state || '',
          city: shippingInfo?.city || '',
          phoneNo: shippingInfo?.phone || '',
          zipCode: shippingInfo?.postcode || '',
          country: shippingInfo?.country || 'India',
        },
        itemsPrice: subtotal,
        taxAmount: 0, // You can calculate tax if needed
        shippingAmount: 0, // Free shipping as mentioned in UI
        totalAmount: subtotal,
        paymentMethod: paymentMethod === "cod" ? "COD" : "Online",
        paymentInfo: {
          id: paymentMethod === "cod" ? "" : "pending",
          status: paymentMethod === "cod" ? "COD" : "Pending",
        },
      };

      if (paymentMethod === "cod") {
        // For COD, create order directly
        const response = await createNewOrder(orderData).unwrap();
        
        if (response.success) {
          toast.success("Order placed successfully! You will pay on delivery.");
          dispatch(clearCart());
          navigate("/my-account");
        } else {
          toast.error("Failed to place order. Please try again.");
        }
      } else {
        // For online payment, create Razorpay session
        const sessionData = {
          orderData: {
            ...orderData,
            orderItems: cartItems,
            shippingInfo: orderData.shippingInfo
          }
        };

        const session = await razorpayCheckoutSession(sessionData).unwrap();
        
        if (session && session.id) {
          // Initialize Razorpay payment
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => {            const options = {
              key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key', // You should add this to env
              amount: session.amount,
              currency: session.currency,
              name: "LYF Bytes",
              description: "Order Payment",
              order_id: session.id,
              handler: async function (response: any) {
                try {
                  // Process payment success
                  const webhookData = {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    shippingInfo: orderData.shippingInfo,
                    cartItems: cartItems,
                    itemsPrice: subtotal,
                    shippingPrice: 0,
                    totalPrice: subtotal,
                    taxPrice: 0,
                    orderNotes: shippingInfo?.comments || '',
                    couponApplied: 'No'
                  };
                  
                  const webhookResponse = await razorpayWebhook(webhookData).unwrap();
                  
                  if (webhookResponse.success) {
                    toast.success("Payment successful! Order placed.");
                    dispatch(clearCart());
                    navigate("/my-account");
                  } else {
                    toast.error("Payment verification failed. Please contact support.");
                  }
                } catch (error: any) {
                  console.error("Payment verification error:", error);
                  toast.error("Payment verification failed. Please contact support.");
                }
              },
              prefill: {
                name: orderData.shippingInfo.fullName,
                email: orderData.shippingInfo.email,
                contact: orderData.shippingInfo.phoneNo
              },
              theme: {
                color: "#3399cc"
              },
              modal: {
                ondismiss: function() {
                  toast.error("Payment cancelled");
                }
              }
            };
            
            const razorpay = new (window as any).Razorpay(options);
            razorpay.open();
          };
          document.body.appendChild(script);
        } else {
          toast.error("Failed to initialize payment. Please try again.");
        }
      }
    } catch (error: any) {
      console.error("Order creation error:", error);
      toast.error(error.data?.message || "Failed to place order. Please try again.");
    }
    
    // Reset form state
    setIsFormValid(false);
    setShowPaymentModal(false);
  };

  // Login Form Modal
  const LoginModal = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      try {
        const response = await login({ email, password }).unwrap();
          // Handle current backend response structure
        if (response.token) {
          dispatch(setUser({
            id: response._id,  // Using _id from root
            name: response.name,
            email: response.email
          }));
          
          dispatch(setToken(response.token));
          dispatch(setIsAuthenticated(true));
          toast.success("Login Successful");
          setShowLoginModal(false);
          
          // After successful login, show payment modal if form was valid
          if (isFormValid) {
            setShowPaymentModal(true);
          }
        } else {
          toast.error("Login failed - invalid response");
        }
      } catch (error: any) {
        console.error("Login error:", error);
        toast.error(error.data?.message || "Login failed");
      }
    };

    return (
      <div className="modal fade show" style={{ display: "block" }} aria-modal="true" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Login to Continue</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowLoginModal(false)}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p className="text-muted mb-3">Please log in to complete your order.</p>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input
                    className="form-control"
                    placeholder="Email*"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    className="form-control"
                    placeholder="Password*"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                {loginError && (
                  <div className="alert alert-danger">
                    {(loginError as any).data?.message || "Login failed"}
                  </div>
                )}
                <button type="submit" className="btn btn-primary w-100" disabled={isLoginLoading}>
                  {isLoginLoading ? "Logging in..." : "Login & Continue"}
                </button>
              </form>
              <div className="mt-3 text-center">
                <p className="mt-2">
                  Don't have an account?{" "}
                  <button
                    className="btn btn-link p-0"
                    onClick={() => {
                      setShowLoginModal(false);
                      setShowRegisterModal(true);
                    }}
                  >
                    Register Now
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Register Form Modal
  const RegisterModal = () => {
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }

      try {
        const response = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }).unwrap();        if (response.token) {
          dispatch(setUser({
            id: response._id,
            name: response.name,
            email: response.email
          }));
          
          dispatch(setToken(response.token));
          dispatch(setIsAuthenticated(true));
          toast.success("Registration Successful");
          setShowRegisterModal(false);
          
          // After successful registration, show payment modal if form was valid
          if (isFormValid) {
            setShowPaymentModal(true);
          }
        } else {
          toast.error("Registration failed - invalid response");
        }
      } catch (error: any) {
        console.error("Register error:", error);
        toast.error(error.data?.message || "Registration failed");
      }
    };

    return (
      <div className="modal fade show" style={{ display: "block" }} aria-modal="true" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create Account</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowRegisterModal(false)}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p className="text-muted mb-3">Create an account to complete your order.</p>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input
                    className="form-control"
                    placeholder="Full Name*"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    className="form-control"
                    placeholder="Email*"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    className="form-control"
                    placeholder="Password*"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    className="form-control"
                    placeholder="Confirm Password*"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                </div>
                {registerError && (
                  <div className="alert alert-danger">
                    {(registerError as any).data?.message || "Registration failed"}
                  </div>
                )}
                <button type="submit" className="btn btn-primary w-100" disabled={isRegisterLoading}>
                  {isRegisterLoading ? "Creating Account..." : "Register & Continue"}
                </button>
              </form>
              <div className="mt-3 text-center">
                <p className="mt-2">
                  Already have an account?{" "}
                  <button
                    className="btn btn-link p-0"
                    onClick={() => {
                      setShowRegisterModal(false);
                      setShowLoginModal(true);
                    }}
                  >
                    Login
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="checkout-area default-padding">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <form className="checkout-form" onSubmit={handleForm}>
              <div className="row">
                <div className="col-lg-6">
                  <h3>Billing Details</h3>
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label htmlFor="f-name">First name *</label>
                        <input
                          className="form-control"
                          id="f-name"
                          name="f-name"
                          type="text"
                          autoComplete="given-name"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label htmlFor="l-name">Last name *</label>
                        <input
                          className="form-control"
                          id="l-name"
                          name="l-name"
                          type="text"
                          autoComplete="family-name"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="form-group">
                        <label htmlFor="select">Country / Region *</label>
                        <CustomSelect options={persons} selectValue="2" />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="form-group">
                        <label htmlFor="st-address">Street address *</label>
                        <input
                          className="form-control"
                          id="st-address"
                          name="st-address"
                          type="text"
                          placeholder="House number and street name"
                          autoComplete="street-address"
                          required
                        />
                        <input
                          className="form-control mt-2"
                          id="st-address2"
                          name="st-address2"
                          type="text"
                          placeholder="Apartment, suite, unit, etc. (optional)"
                          autoComplete="address-line2"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="form-group">
                        <label htmlFor="t-city">Town / City *</label>
                        <input
                          className="form-control"
                          id="t-city"
                          name="t-city"
                          type="text"
                          autoComplete="address-level2"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="form-group">
                        <label htmlFor="st-country">State / County *</label>
                        <input
                          className="form-control"
                          id="st-country"
                          name="st-country"
                          type="text"
                          autoComplete="address-level1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="form-group">
                        <label htmlFor="postcode">Postcode / ZIP *</label>
                        <input
                          className="form-control"
                          id="postcode"
                          name="postcode"
                          type="text"
                          autoComplete="postal-code"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="form-group">
                        <label htmlFor="phone">Phone (optional)</label>
                        <input
                          className="form-control"
                          id="phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="form-group">
                        <label htmlFor="email">Email address *</label>
                        <input
                          className="form-control"
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="form-group comments">
                        <label htmlFor="comments">Order Notes (Optional)</label>
                        <textarea
                          className="form-control"
                          id="comments"
                          name="comments"
                          placeholder="Notes about your order, e.g. special notes for delivery."
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="shop-cart-totals mt-50 mt-md-30 mt-xs-10">
                    <h2>Your Order</h2>
                    <div className="table-responsive table-bordered">
                      <table className="table" aria-label="Order Summary">
                        <thead>
                          <tr>
                            <th scope="col">Product</th>
                            <th scope="col">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartItems.length === 0 ? (
                            <tr>
                              <td colSpan={2}>Your cart is empty</td>
                            </tr>
                          ) : (
                            cartItems.map((item: CartItem) => (
                              <tr key={item.product}>
                                <td>
                                  {item.name} × {item.quantity}
                                </td>
                                <td>${(item.price * item.quantity).toFixed(2)}</td>
                              </tr>
                            ))
                          )}
                          <tr>
                            <th scope="row">Shipping</th>
                            <td>Free Shipping</td>
                          </tr>
                          <tr>
                            <th scope="row">Total</th>
                            <td>${subtotal.toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>                  <p className="woocommerce-info">
                    Complete your order by selecting a payment method below.
                  </p>
                  <button type="submit" name="submit" id="submit">
                    Place Order
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>      </div>
      
      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderTotal={subtotal}
        onConfirmOrder={handleConfirmOrder}
      />

      {/* Login Modal */}
      {showLoginModal && <LoginModal />}
      
      {/* Register Modal */}
      {showRegisterModal && <RegisterModal />}
    </div>
  );
};

export default CheckoutContent;