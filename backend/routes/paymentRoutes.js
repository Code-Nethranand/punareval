const express = require("express");
const router = express.Router();
const moment = require("moment");
const axios = require("axios");
const Payment = require("../models/Payment");
const { verifyToken } = require("../middleware/auth");

// Environment variables
const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;
const CASHFREE_BASE_URL = process.env.CASHFREE_BASE_URL || 'https://sandbox.cashfree.com/pg';
const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;

if (!CASHFREE_CLIENT_ID || !CASHFREE_CLIENT_SECRET) {
  console.error("Missing required Cashfree environment variables");
  process.exit(1);
}

// Create payment order
router.post("/create-order", verifyToken, async (req, res) => {
  let orderId = null;
  
  try {
    console.log("=== Starting Payment Creation ===");
    console.log("Request body:", req.body);
    console.log("User:", req.user);

    const { amount, subjects } = req.body;
    const userId = req.user._id;

    // Input validation
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid amount" 
      });
    }
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid subjects selection" 
      });
    }

    // Generate a unique order ID
    orderId = `order_${Math.floor(Date.now() / 1000)}_${Math.random().toString(36).substr(2, 9)}`;
    console.log("Generated order ID:", orderId);

    // Create order payload
    const orderPayload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      order_note: "VTU Revaluation Payment",
      customer_details: {
        customer_id: userId.toString(),
        customer_name: req.user.name || "VTU Student",
        customer_email: req.user.email || "student@example.com",
        customer_phone: req.user.phone || "9999999999"
      },
      order_meta: {
        return_url: `${FRONTEND_URL}/payment/status?order_id={order_id}`,
        notify_url: `${BACKEND_URL}/api/payment/webhook`
      }
    };

    console.log("Creating Cashfree order:", orderPayload);
    console.log("Using Cashfree URL:", `${CASHFREE_BASE_URL}/orders`);
    console.log("Headers:", {
      'x-client-id': CASHFREE_CLIENT_ID,
      'x-api-version': '2022-09-01'
    });

    // Create order in Cashfree
    const orderResponse = await axios.post(
      `${CASHFREE_BASE_URL}/orders`,
      orderPayload,
      {
        headers: {
          'x-api-version': '2022-09-01',
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("Cashfree order response:", orderResponse.data);

    if (!orderResponse.data?.payment_session_id) {
      throw new Error("Failed to create order: No payment session ID received");
    }

    // Create payment record
    const payment = new Payment({
      userId,
      orderId,
      amount,
      subjects,
      status: "pending",
      paymentSessionId: orderResponse.data.payment_session_id,
      paymentDetails: orderResponse.data
    });

    await payment.save();
    console.log("Payment record created:", payment);

    res.json({
      success: true,
      order_id: orderId,
      payment_session_id: orderResponse.data.payment_session_id
    });

  } catch (error) {
    console.error("Payment Creation Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack,
      config: error.config
    });

    // Clean up payment record if it was created
    if (orderId) {
      try {
        await Payment.findOneAndDelete({ orderId });
      } catch (deleteError) {
        console.error("Error deleting payment record:", deleteError);
      }
    }

    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message || "Payment creation failed"
    });
  }
});

// Payment webhook
router.post("/webhook", async (req, res) => {
  try {
    const event = req.body;
    console.log("Received webhook:", event);

    // Verify webhook signature if needed
    // Update payment status
    if (event.order_id) {
      const payment = await Payment.findOne({ orderId: event.order_id });
      if (payment) {
        payment.status = event.order_status.toLowerCase();
        payment.paymentDetails = event;
        await payment.save();
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify payment
router.post("/verify", verifyToken, async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // Get order status from Cashfree
    const orderResponse = await axios.get(
      `${CASHFREE_BASE_URL}/orders/${orderId}`,
      {
        headers: {
          'x-api-version': '2022-09-01',
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET
        }
      }
    );

    // Update payment status
    const payment = await Payment.findOne({ orderId });
    if (payment) {
      payment.status = orderResponse.data.order_status.toLowerCase();
      payment.paymentDetails = orderResponse.data;
      await payment.save();
    }

    res.json({
      success: true,
      status: orderResponse.data.order_status,
      details: orderResponse.data
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.message || error.message 
    });
  }
});

// Get payment status
router.get('/status/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order status from Cashfree
    const orderResponse = await axios.get(
      `${CASHFREE_BASE_URL}/orders/${orderId}`,
      {
        headers: {
          'x-api-version': '2022-09-01',
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET
        }
      }
    );

    console.log('Cashfree order status response:', orderResponse.data);

    // Update payment record in our database
    const payment = await Payment.findOne({ orderId });
    if (payment) {
      payment.status = orderResponse.data.order_status.toLowerCase();
      payment.paymentDetails = orderResponse.data;
      await payment.save();
    }

    res.json({
      success: true,
      order: orderResponse.data
    });

  } catch (error) {
    console.error('Payment status error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to get payment status'
    });
  }
});

// Get payment history
router.get("/history", verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payment history:", {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: error.message });
  }
});

// Get payment status for a user
router.get('/status', verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .sort({ createdAt: -1 }); // Most recent first

    // For each payment, get latest status from Cashfree
    const updatedPayments = await Promise.all(payments.map(async (payment) => {
      try {
        const response = await axios.get(
          `${CASHFREE_BASE_URL}/orders/${payment.orderId}`,
          {
            headers: {
              'x-client-id': CASHFREE_CLIENT_ID,
              'x-client-secret': CASHFREE_CLIENT_SECRET,
              'Content-Type': 'application/json'
            }
          }
        );

        // Update payment status in database if it's different
        if (response.data.order_status !== payment.status) {
          payment.status = response.data.order_status;
          payment.transactionId = response.data.transaction_id || payment.transactionId;
          payment.paymentMethod = response.data.payment_method || payment.paymentMethod;
          await payment.save();
        }

        return {
          id: payment._id,
          orderId: payment.orderId,
          amount: payment.amount,
          status: payment.status,
          transactionId: payment.transactionId,
          paymentMethod: payment.paymentMethod,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt
        };
      } catch (error) {
        console.error(`Error fetching status for order ${payment.orderId}:`, error);
        // Return existing payment data if Cashfree API fails
        return {
          id: payment._id,
          orderId: payment.orderId,
          amount: payment.amount,
          status: payment.status,
          transactionId: payment.transactionId,
          paymentMethod: payment.paymentMethod,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt
        };
      }
    }));

    res.json(updatedPayments);
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ message: 'Error fetching payment status' });
  }
});

// Get payment history for a user
router.get('/history', verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .sort({ createdAt: -1 }); // Most recent first

    // Format the response
    const formattedPayments = payments.map(payment => ({
      id: payment._id,
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status,
      transactionId: payment.transactionId,
      paymentMethod: payment.paymentMethod,
      subjects: payment.subjects,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt
    }));

    res.json(formattedPayments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Error fetching payment history' });
  }
});

// Refresh payment status
router.post('/refresh-status', verifyToken, async (req, res) => {
  try {
    const { paymentId } = req.body;
    
    // Get payment from database
    const payment = await Payment.findOne({ 
      _id: paymentId,
      userId: req.user.id 
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Get latest status from Cashfree
    const response = await axios.get(
      `${CASHFREE_BASE_URL}/orders/${payment.orderId}`,
      {
        headers: {
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
          'Content-Type': 'application/json'
        }
      }
    );

    // Check if payment is processed
    const bbpsResponse = await axios.get(
      `https://sandbox.cashfree.com/bbps/biller/bill/status/${payment.transactionId}`,
      {
        headers: {
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
          'Content-Type': 'application/json'
        }
      }
    );

    // Update payment status
    let newStatus = response.data.order_status;
    if (newStatus === 'PAID' && bbpsResponse.data.status === 'PROCESSED') {
      newStatus = 'PROCESSED';
    }

    // Update payment in database
    payment.status = newStatus;
    payment.transactionId = response.data.transaction_id || payment.transactionId;
    payment.paymentMethod = response.data.payment_method || payment.paymentMethod;
    await payment.save();

    // Return updated payment
    res.json({
      id: payment._id,
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status,
      transactionId: payment.transactionId,
      paymentMethod: payment.paymentMethod,
      subjects: payment.subjects,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt
    });
  } catch (error) {
    console.error('Error refreshing payment status:', error);
    res.status(500).json({ message: 'Error refreshing payment status' });
  }
});

module.exports = router;
