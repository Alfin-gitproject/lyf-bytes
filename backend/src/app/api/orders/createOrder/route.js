import dbConnect from "@/lib/db/connection";
import { isAuthenticatedUser } from "@/middlewares/auth";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import User from "@/models/User";
import { createShiprocketOrder } from "@/lib/shipRocket/createShipRocketOrder";
import mongoose from "mongoose";
export async function POST(req) {
  try {
    await dbConnect();
    const user = await isAuthenticatedUser(req);

    if (!user) return;

    const body = await req.json();    const {
      orderItems,
      shippingInfo,
      itemsPrice,
      taxAmount,
      shippingAmount,
      totalAmount,
      paymentMethod,
      paymentInfo,
    } = body;    // Validate and convert product IDs to ObjectIds
    const processedOrderItems = orderItems.map(item => {
      let productId = item.product;
      
      // If it's already a valid ObjectId, use it
      if (mongoose.Types.ObjectId.isValid(productId)) {
        productId = new mongoose.Types.ObjectId(productId);
      } else {
        // For static product data (like "1", "2"), generate a consistent ObjectId
        // We'll create a deterministic ObjectId based on the product ID
        const staticIdBuffer = Buffer.alloc(12);
        staticIdBuffer.write(productId.toString().padStart(12, '0'));
        productId = new mongoose.Types.ObjectId(staticIdBuffer);
        
        console.log(`Converted static product ID "${item.product}" to ObjectId: ${productId}`);
      }
      
      return {
        ...item,
        product: productId,
        // Ensure required fields are present
        image: item.image || item.uploadedImage?.[0] || '',
        uploadedImage: item.uploadedImage || []
      };
    });

    const order = await Order.create({
      orderItems: processedOrderItems,
      shippingInfo,
      itemsPrice,
      taxAmount,
      shippingAmount,
      totalAmount,
      paymentMethod,
      paymentInfo,
      user: user?._id,
    });

    const shiprocketPayload = {
      pickup_address: {
        address:
          "Hifi bags, Panakkal Tower, North Basin Road, Ernakulam, Broadway",
        city: "Kochi",
        pincode: "682031",
      },
      delivery_details: {
        name: shippingInfo.name || "Customer",
        mobile: shippingInfo.phoneNo,
        address: shippingInfo.address,
        city: shippingInfo.city,
        pincode: shippingInfo.pinCode,
      },
      product_details: orderItems.map((item) => ({
        name: item.name,
        unit_price: item.price,
        quantity: item.quantity,
        discount: 0,
        tax_rate: 18,
      })),
      // Map your paymentMethod to Shiprocket's expected values
      payment_method: paymentMethod === "COD" ? "COD" : "Prepaid",
      package_details: {
        dead_weight: 1.5,
        dimensions: {
          length: 34,
          width: 44,
          height: 6.5,
        },
      },
      other_details: {
        order_channel: "Custom",
        order_tag: "Standard",
        order_id: order._id.toString(),
        notes: "Handle with care",
      },
    };

    // Attempt Shiprocket integration but don't let it affect main response
    let shiprocketResult = null;
    try {
      const shiprocketResponse = await createShiprocketOrder(shiprocketPayload);
      if (shiprocketResponse.success) {
        order.shiprocketOrderId = shiprocketResponse.data.order_id;
        await order.save();
        console.log("Added shiprocket order", shiprocketResponse);

        shiprocketResult = shiprocketResponse.data;
      } else {
        console.warn(
          "Shiprocket integration failed:",
          shiprocketResponse.error
        );
      }
    } catch (shiprocketError) {
      console.warn("Shiprocket integration error:", shiprocketError.message);
    }

    return NextResponse.json(
      { success: true, order, shiprocketOrder: shiprocketResult },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
