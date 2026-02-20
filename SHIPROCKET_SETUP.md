# 🚀 Shiprocket Integration Setup Guide

## Overview
This guide will help you set up automated shipping with Shiprocket for your e-commerce platform.

---

## 📋 Prerequisites

1. **Shiprocket Account**
   - Sign up at [shiprocket.in](https://www.shiprocket.in/)
   - Complete KYC verification
   - Add pickup locations in your Shiprocket dashboard

2. **Required Information**
   - Shiprocket login email
   - Shiprocket login password
   - Pickup location name (as configured in Shiprocket dashboard)
   - Pickup location pincode

---

## ⚙️ Configuration

### Step 1: Add Environment Variables

Add the following to your `/server/.env` file:

```env
# Shiprocket API Configuration
SHIPROCKET_EMAIL=your_shiprocket_email@example.com
SHIPROCKET_PASSWORD=your_shiprocket_password
SHIPROCKET_PICKUP_LOCATION=Primary
SHIPROCKET_CHANNEL_ID=your_channel_id_optional
SHIPROCKET_PICKUP_PINCODE=110001
```

**Configuration Details:**
- `SHIPROCKET_EMAIL`: Your Shiprocket account email
- `SHIPROCKET_PASSWORD`: Your Shiprocket account password
- `SHIPROCKET_PICKUP_LOCATION`: Name of your pickup location (must match Shiprocket dashboard)
- `SHIPROCKET_CHANNEL_ID`: (Optional) Your channel ID from Shiprocket
- `SHIPROCKET_PICKUP_PINCODE`: Pincode of your pickup location

### Step 2: Configure Webhook (Important!)

1. Login to your Shiprocket dashboard
2. Go to **Settings** → **Webhooks**
3. Add a new webhook with URL:
   ```
   https://your-domain.com/api/v1/shiprocket/webhook
   ```
4. Select all events for real-time order tracking updates

---

## 🔄 How It Works

### Automatic Shipment Creation
When a customer completes payment:
1. Order is created in your database
2. Shipment is **automatically created** in Shiprocket
3. System attempts to auto-assign the cheapest courier
4. Pickup is automatically scheduled (if enabled)
5. Customer receives AWB tracking number

### Manual Shipment Management
Admins can manually:
- Create shipments
- Assign/reassign couriers
- Schedule pickups
- Cancel shipments
- Generate labels and invoices

---

## 📡 API Endpoints

### Base URL
```
/api/v1/shiprocket
```

### Admin Endpoints (Require Admin Authentication)

#### 1. Create Shipment
```http
POST /create-shipment
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "orderId": "order_id_here"
}
```

#### 2. Assign Courier
```http
POST /assign-courier
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "orderId": "order_id_here",
  "courierId": "optional_specific_courier_id"
}
```
*If `courierId` is not provided, automatically assigns cheapest courier*

#### 3. Schedule Pickup
```http
POST /schedule-pickup
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "orderId": "order_id_here",
  "pickupDate": "2024-12-25"
}
```

#### 4. Cancel Shipment
```http
POST /cancel-shipment
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "orderId": "order_id_here"
}
```

#### 5. Generate Shipping Label
```http
POST /generate-label
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "orderId": "order_id_here"
}
```
*Returns PDF URL for printing*

#### 6. Generate Invoice
```http
POST /generate-invoice
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "orderId": "order_id_here"
}
```
*Returns PDF URL for invoice*

### User Endpoints (Require User Authentication)

#### 7. Track Shipment
```http
GET /track/:orderId
Authorization: Bearer <user-token>
```

**Response:**
```json
{
  "success": true,
  "order": {
    "_id": "...",
    "shipment": {
      "awbCode": "1234567890",
      "courierName": "Delhivery",
      "status": "In Transit",
      "currentStatus": "Shipped",
      "pickupScheduled": true
    },
    "totalAmount": 1499
  },
  "tracking": {
    "tracking_data": {
      "track_status": 1,
      "shipment_status": "Shipped",
      "current_status": "In Transit"
    }
  }
}
```

### Public Endpoints (No Authentication)

#### 8. Check Serviceability
```http
GET /check-serviceability?pincode=110001&cod=false
```

**Response:**
```json
{
  "success": true,
  "serviceable": true,
  "availableCouriers": [
    {
      "courier_name": "Delhivery",
      "estimated_delivery_days": "3-5"
    }
  ]
}
```

#### 9. Webhook Endpoint (For Shiprocket)
```http
POST /webhook
Content-Type: application/json

{
  "order_id": "shiprocket_order_id",
  "shipment_id": "shipment_id",
  "awb": "awb_code",
  "current_status": "Delivered"
}
```
*This endpoint is called by Shiprocket to update order status*

---

## 🧪 Testing

### Test Authentication
```bash
curl -X POST http://localhost:8000/api/v1/shiprocket/check-serviceability?pincode=110001
```

### Test Shipment Creation (Manual)
1. Complete a test payment
2. Check order in database for shipment details
3. Verify shipment created in Shiprocket dashboard

### Test Webhook (Local Development)
Use ngrok or similar to expose your local server:
```bash
ngrok http 8000
```
Then configure the webhook URL in Shiprocket dashboard.

---

## 📊 Database Schema

### Order Model Extension
Each order now includes a `shipment` object:

```javascript
{
  shipment: {
    shiprocketOrderId: String,
    shipmentId: String,
    awbCode: String,
    courierId: String,
    courierName: String,
    status: String,
    statusCode: Number,
    currentStatus: String,
    pickupScheduled: Boolean,
    cancelled: Boolean,
    createdAt: Date,
    awbAssignedAt: Date,
    pickupScheduledAt: Date,
    cancelledAt: Date,
    lastUpdatedAt: Date
  }
}
```

---

## 🚨 Troubleshooting

### Issue: "Authentication failed"
- Verify `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` are correct
- Check if your Shiprocket account is active

### Issue: "Pickup location not found"
- Verify `SHIPROCKET_PICKUP_LOCATION` matches exactly with Shiprocket dashboard
- Check if pickup location is active

### Issue: "No couriers available"
- Verify pickup and delivery pincodes are serviceable
- Check product weight is configured

### Issue: "Webhook not receiving updates"
- Verify webhook URL is publicly accessible (use ngrok for local testing)
- Check webhook is configured correctly in Shiprocket dashboard
- Verify all events are selected

### Issue: "Auto-shipment creation failing"
- Check server logs for specific error
- Verify all required product fields (weight, dimensions) are set
- Manually create shipment via admin endpoint to debug

---

## 📈 Monitoring

### Logs to Monitor
- Authentication token refresh (every 10 days)
- Shipment creation success/failure
- Webhook events received
- Courier assignment

### Important Metrics
- Shipment creation success rate
- Average time to assign courier
- Pickup scheduling success rate
- Delivery success rate

---

## 🔐 Security Notes

1. **Never expose Shiprocket credentials** in frontend
2. **Webhook validation**: Shiprocket webhooks don't have signature verification by default - consider implementing IP whitelist
3. **Rate limiting**: API endpoints are protected by existing rate limiters
4. **Admin-only operations**: Ensure only admins can create/cancel shipments

---

## 📞 Support

- **Shiprocket API Docs**: [apidocs.shiprocket.in](https://apidocs.shiprocket.in/)
- **Shiprocket Support**: support@shiprocket.in
- **Dashboard**: [app.shiprocket.in](https://app.shiprocket.in/)

---

## ✅ Setup Checklist

- [ ] Shiprocket account created and verified
- [ ] Pickup locations added in Shiprocket dashboard
- [ ] Environment variables configured in `.env`
- [ ] Webhook URL configured in Shiprocket dashboard
- [ ] Test authentication successful
- [ ] Test shipment creation successful
- [ ] Webhook receiving updates
- [ ] Product weights and dimensions configured

---

**Your Shiprocket integration is now complete! 🎉**
