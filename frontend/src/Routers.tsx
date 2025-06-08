import { Route, Routes } from "react-router-dom";

import Home1 from "./pages/homePages/Home1";
import Home2Page from "./pages/homePages/Home2";
import Home3Page from "./pages/homePages/Home3";
import Home4Page from "./pages/homePages/Home4";
import Home5Page from "./pages/homePages/Home5";
import Home6Page from "./pages/homePages/Home6";

import HomeDarkPage from "./pages/homePages/HomeDark";
import Home2DarkPage from "./pages/homePages/Home2DarkPage";
import Home3DarkPage from "./pages/homePages/Home3DarkPage";
import Home4DarkPage from "./pages/homePages/Home4DarkPage";
import Home5DarkPage from "./pages/homePages/Home5DarkPage";
import Home6DarkPage from "./pages/homePages/Home6DarkPage";

import AboutUsPage from "./pages/innerPages/AboutUsPage";
import ChefPage from "./pages/innerPages/ChefPage";
import ReservationPage from "./pages/innerPages/ReservationPage";
import ContactPage from "./pages/innerPages/ContactPage";
import RegisterPage from "./pages/innerPages/RegisterPage";
import LoginPage from "./pages/innerPages/LoginPage";

import FoodMenuPage from "./pages/FoodPage/FoodMenu";
import FoodMenu2Page from "./pages/FoodPage/FoodMenu2";
import FoodMenu3Page from "./pages/FoodPage/FoodMenu3";

import BlogStandardPage from "./pages/blogPages/BlogStandardPage";
import BlogWithSidebarPage from "./pages/blogPages/BlogWithSidebarPage";
import Blog2ColumnPage from "./pages/blogPages/Blog2ColumnPage";
import Blog3ColumnPage from "./pages/blogPages/Blog3ColumnPage";
import BlogSinglePage from "./pages/blogPages/BlogSinglePage";
import BlogSingleWithSidebarPage from "./pages/blogPages/BlogSingleWithSidebar";

import ShopPage from "./pages/shopPage/ShopPage";
import ShopSingleThumbPage from "./pages/shopPage/ShopSingleThumbPage";
import ShopSinglePage from "./pages/shopPage/ShopSinglePage";
import CartPage from "./pages/shopPage/CartPage";
import CheckoutPage from "./pages/shopPage/CheckoutPage";
import OrdersPage from "./components/shop/OrdersPage"; // Import OrdersPage
import OrderDetailsPage from "./components/shop/OrderDetailsPage"; // Import OrderDetailsPage

import NotFoundPage from "./pages/innerPages/NotFoundPage";
import ChefDetailsPage from "./pages/innerPages/ChefDetailsPage";
import PrivacyPolicyPage from "./pages/privacy-policy/PrivacyPolicy";

import DeliveryReturnPage from "./pages/delivery-return/DeliveryReturnPage";
import TermsConditionsPage from "./pages/terms-conditions/termsCondition";
import MyAccountPage from "./pages/my-accounts/MyAccount";

const Routers = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home1 />} />
        <Route path="/home-2" element={<Home2Page />} />
        <Route path="/home-3" element={<Home3Page />} />
        <Route path="/home-4" element={<Home4Page />} />
        <Route path="/home-5" element={<Home5Page />} />
        <Route path="/home-6" element={<Home6Page />} />

        <Route path="/home-dark" element={<HomeDarkPage />} />
        <Route path="/home-2-dark" element={<Home2DarkPage />} />
        <Route path="/home-3-dark" element={<Home3DarkPage />} />
        <Route path="/home-4-dark" element={<Home4DarkPage />} />
        <Route path="/home-5-dark" element={<Home5DarkPage />} />
        <Route path="/home-6-dark" element={<Home6DarkPage />} />
<Route path="/delivery-return" element={<DeliveryReturnPage/>}/>
        <Route path="/terms-conditions" element={<TermsConditionsPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/chef" element={<ChefPage />} />
        <Route path="/chef-details/:id" element={<ChefDetailsPage />} />
        {/* <Route path="/reservation" element={<ReservationPage />} /> */}
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
<Route path="/privacy-policy" element={<PrivacyPolicyPage/>} />
        <Route path="/food-menu" element={<FoodMenuPage />} />
        <Route path="/food-menu-2" element={<FoodMenu2Page />} />
        <Route path="/food-menu-3" element={<FoodMenu3Page />} />
        <Route path="/my-accounts" element={<MyAccountPage/>}/>
        <Route path="/blog-standard" element={<BlogStandardPage />} />
        <Route path="/blog-standard?:page?" element={<BlogStandardPage />} />
        <Route path="/blog-with-sidebar" element={<BlogWithSidebarPage />} />
        <Route path="/blog-with-sidebar?:page?" element={<BlogWithSidebarPage />} />
        <Route path="/blog-2-column" element={<Blog2ColumnPage />} />
        <Route path="/blog-2-column?:page?" element={<Blog2ColumnPage />} />
        <Route path="/blog-3-column" element={<Blog3ColumnPage />} />
        <Route path="/blog-3-column?:page?" element={<Blog3ColumnPage />} />
        <Route path="/blog-single/:id" element={<BlogSinglePage />} />
        <Route path="/blog-single-with-sidebar/:id" element={<BlogSingleWithSidebarPage />} />

        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop?:page?" element={<ShopPage />} />
        <Route path="/shop-single/:id" element={<ShopSinglePage />} />
        <Route path="/shop-single-thumb/:id" element={<ShopSingleThumbPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} /> {/* Add OrdersPage route */}
        <Route path="/order/:orderId" element={<OrderDetailsPage />} /> {/* Add OrderDetailsPage route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

export default Routers;