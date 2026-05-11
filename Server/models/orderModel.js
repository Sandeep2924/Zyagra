const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    orderItems: [
      {
        name:    { type: String, required: true },
        qty:     { type: Number, required: true },
        image:   { type: String, required: true },
        price:   { type: Number, required: true },
        product: {
          type:     mongoose.Schema.Types.ObjectId,
          required: true,
          ref:      "Product",
        },
      },
    ],
    shippingAddress: {
      address:    { type: String, required: true },
      city:       { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    phone:         { type: String, required: true, default: "0000000000" },
    paymentMethod: { type: String, required: true, default: "Cash on Delivery" },
    totalPrice:    { type: Number, required: true, default: 0.0 },

    isPaid:      { type: Boolean, required: true, default: false },
    paidAt:      { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },

    // ── Full order status pipeline ─────────────────────────────────────────
    // Admin moves the order forward through these stages one at a time.
    // "cancelled" is a terminal state reachable from placed/confirmed/packed.
    status: {
      type:    String,
      enum:    ["placed", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"],
      default: "placed",
    },

    // Admin note — visible to the customer on their order tracking page.
    // Can be updated any time before the order is packed.
    adminNote: {
      type:    String,
      default: "",
      maxlength: 500,
    },

    cancelReason: {
      type:    String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
