
// src/components/layouts/SidebarInfo.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SocialShareV3 from "../social/SocialShareV3";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { FaUser } from "react-icons/fa";
import { useLogoutMutation, useLoginMutation, useRegisterMutation } from "../../store/api/authApi"; // Added login, register
import { clearUser, setUser, setIsAuthenticated } from "../../store/features/userSlice"; // Updated to @
import { removeCartItem, clearCart } from "../../store/features/cartSlice";

interface HeaderSearchProps {
  closeInfoBar?: () => void;
  isInfoOpen?: boolean;
  toggleSubMenu?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}


interface FormEventHandler {
  (event: React.FormEvent<HTMLFormElement>): void;
}

const handleForm: FormEventHandler = (event) => {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  form.reset();
  toast.success("Thanks For Your Message");
};

const SidebarInfo: React.FC<HeaderSearchProps> = ({ closeInfoBar, isInfoOpen, toggleSubMenu }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated); // Updated to user
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [logout] = useLogoutMutation();
  const [login, { isLoading: isLoginLoading, error: loginError }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading, error: registerError }] = useRegisterMutation();

  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

  const handleRemove = (productId: string) => {
    dispatch(removeCartItem(productId));
    toast.error("Product removed from cart");
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(clearUser());
      dispatch(clearCart());
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.data?.message || "Logout failed");
      dispatch(clearUser());
      dispatch(clearCart());
      navigate("/");
    }
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
        email: response.email,
        token: response.token
      }));
      
      dispatch(setIsAuthenticated(true));
      toast.success("Login Successful");
      setShowLoginModal(false);
      
      // Force a state update if needed
      setTimeout(() => {
        navigate("/my-account");
      }, 0);
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
              <h5 className="modal-title">Login</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowLoginModal(false)}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
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
                  {isLoginLoading ? "Logging in..." : "Login"}
                </button>
              </form>
              <div className="mt-3 text-center">
                <h6 className="mb-2">Or Login With</h6>
                <ul className="list-inline">
                  <li className="list-inline-item">
                    <Link to="#" className="btn btn-outline-primary">
                      <i className="fab fa-google me-2"></i> Google
                    </Link>
                  </li>
                  <li className="list-inline-item">
                    <Link to="#" className="btn btn-outline-primary">
                      <i className="fab fa-facebook-f me-2"></i> Facebook
                    </Link>
                  </li>
                </ul>
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
        toast.error("Passwords don't match");
        return;
      }

      try {
        const  response = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }).unwrap();
        dispatch(setUser({
        // id: response._id,  // Using _id from root
        name: response.name,
        email: response.email,
       password:response.password,
        token: response.token
      }));
      
        toast.success("Registration successful!");
        setShowRegisterModal(false);
        navigate("/my-accounts");
      } catch (error: any) {
        console.error("Registration error:", error);
        toast.error(error.data?.error || "Registration failed");
      }
    };

    return (
      <div className="modal fade show" style={{ display: "block" }} aria-modal="true" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Register</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowRegisterModal(false)}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input
                    className="form-control"
                    placeholder="Name*"
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
                  {isRegisterLoading ? "Registering..." : "Register"}
                </button>
              </form>
              <div className="mt-3 text-center">
                <h6 className="mb-2">Or Register With</h6>
                <ul className="list-inline">
                  <li className="list-inline-item">
                    <Link to="#" className="btn btn-outline-primary">
                      <i className="fab fa-google me-2"></i> Google
                    </Link>
                  </li>
                  <li className="list-inline-item">
                    <Link to="#" className="btn btn-outline-primary">
                      <i className="fab fa-facebook-f me-2"></i> Facebook
                    </Link>
                  </li>
                </ul>
                <p className="mt-2">
                  Already have an account?{" "}
                  <button
                    className="btn btn-link p-0"
                    onClick={() => {
                      setShowRegisterModal(false);
                      setShowLoginModal(true);
                    }}
                  >
                    Login Now
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
    <>
      <div className="attr-right">
        <div className="attr-nav attr-box">
          <ul>
            {/* User Dropdown */}
            <li className="dropdown">
              <Link to="#" className="dropdown-toggle" data-bs-toggle="dropdown" onClick={toggleSubMenu}>
                <FaUser className="user-icon" />
              </Link>
              <ul className="dropdown-menu">
                {isAuthenticated ? (
                  <>
                    <li>
                      <Link className="dropdown-item hover:bg-gray-200" to="/my-accounts">
                        My Account
                      </Link>
                    </li>
                    <li>
                      <button className="dropdown-item hover:bg-gray-200" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <button
                        className="dropdown-item hover:bg-gray-100"
                        onClick={() => setShowLoginModal(true)}
                      >
                        Login
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item hover:bg-gray-100"
                        onClick={() => setShowRegisterModal(true)}
                      >
                        Register
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </li>

            {/* Cart Dropdown */}
            <li className="dropdown">
              <Link to="#" className="dropdown-toggle" data-bs-toggle="dropdown">
                <i className="far fa-shopping-cart" />
                <span className="badge">{totalItems}</span>
              </Link>
              <ul className="dropdown-menu cart-list">
                {cartItems.length > 0 ? (
                  <>
                    <ul>
                      {cartItems.map((item) => (
                        <li key={item.product}>
                          <div className="thumb">
                            <span className="photo">
                              <img src={`/assets/img/shop/${item.image}`} alt={item.name} />
                            </span>
                            <Link to="#" className="remove-product" onClick={() => handleRemove(item.product)}>
                              <i className="fas fa-times" />
                            </Link>
                          </div>
                          <div className="info">
                            <h6>{item.name}</h6>
                            <p>
                              {item.quantity}x - <span className="price">${item.price}</span>
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <li className="total mt-2 px-3">
                      <span className="pull-right">
                        <strong>Total</strong>: ${totalAmount.toFixed(2)}
                      </span>
                      <Link to="/cart" className="btn btn-default btn-cart mr-2">
                        Cart
                      </Link>
                      <Link to="/checkout" className="btn btn-default btn-cart mr-2">
                        Checkout
                      </Link>
                    </li>
                  </>
                ) : (
                  <li className="total">
                    <p>Your cart is empty.</p>
                  </li>
                )}
              </ul>
            </li>
          </ul>
        </div>
      </div>

      <div className={`side ${isInfoOpen ? "on" : ""}`}>
        <Link to="#" className="close-side" onClick={closeInfoBar}>
          <i className="fa fa-times"></i>
        </Link>
        <div className="widget">
          <p>
            Arrived compass prepare an on as. Reasonable particular on my it in sympathize. Size now
            easy eat hand how. Unwilling he departure elsewhere dejection at. Heart large seems may
            purse means few blind.
          </p>
        </div>
        <div className="widget address">
          <div>
            <ul>
              <li>
                <div className="content">
                  <p>Address</p>
                  <strong>California, TX 70240</strong>
                </div>
              </li>
              <li>
                <div className="content">
                  <p>Email</p>
                  <strong>support@validtheme.com</strong>
                </div>
              </li>
              <li>
                <div className="content">
                  <p>Contact</p>
                  <strong>+44-20-7328-4499</strong>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="widget newsletter">
          <h4 className="title">Get Subscribed!</h4>
          <form onSubmit={handleForm}>
            <div className="input-group stylish-input-group">
              <input
                type="email"
                placeholder="Enter your e-mail"
                className="form-control"
                name="email"
                autoComplete="off"
                required
              />
              <span className="input-group-addon">
                <button type="submit">
                  <i className="fas fa-arrow-right" />
                </button>
              </span>
            </div>
          </form>
        </div>
        <div className="widget social">
          <ul className="link">
            <SocialShareV3 />
          </ul>
        </div>
      </div>

      {showLoginModal && <LoginModal />}
      {showRegisterModal && <RegisterModal />}
    </>
  );
};

export default SidebarInfo;
