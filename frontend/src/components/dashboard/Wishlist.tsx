// src/components/othersPages/dashboard/Wishlist.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProductCardWishlist } from "@/components/shopCards/ProductCardWishlist";
import { useContextElement } from "@/context/Context";
import { allProducts } from "@/data/products";

export default function Wishlist() {
  const { wishList } = useContextElement();
  const [wishListItems, setWishListItems] = useState<any[]>([]);

  useEffect(() => {
    if (wishList) {
      setWishListItems(allProducts.filter((el) => wishList.includes(el.id)));
    }
  }, [wishList]);

  return (
    <div className="about-style-one-area default-padding">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="about-style-one-info">
            <h4 className="sub-heading">Your Wishlist</h4>
            <h2 className="title">Wishlist</h2>
            <div className="grid-layout wrapper-shop" data-grid="grid-3">
              {wishListItems.slice(0, 3).map((elm, i) => (
                <ProductCardWishlist product={elm} key={i} />
              ))}
            </div>
            {!wishListItems.length && (
              <div className="text-center py-8">
                <div className="mb-4">
                  <p className="text-lg mb-4">Your wishlist is empty</p>
                  <Link
                    to="/shop-default"
                    className="tf-btn btn-fill animate-hover-btn radius-3 justify-content-center"
                  >
                    Explore Products!
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}