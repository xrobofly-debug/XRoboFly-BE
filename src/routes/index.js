import { Router } from "express";
import { transporter } from "../services/mailer.services.js";
import path from "path";
import hbs from "nodemailer-express-handlebars"
import authRoutes from "./auth.route.js";
import prodRoute from "./product.route.js";
import cartRoute from "./cart.route.js";
import couponRoute from "./coupon.route.js";
import payRouter from "./payment.route.js";
import addressRouter from "./address.route.js";
import billingAddressRouter from "./billingAddress.route.js";
import orderRouter from "./order.route.js";
import analyticsRouter from "./analytics.route.js";
import shiprocketRoutes from "./shiprocket.route.js";
import userRoutes from "./user.route.js";
import categoryRoutes from "./category.route.js";

const router = Router();

router.use("/auth",authRoutes);
router.use("/product",prodRoute);
router.use("/cart",cartRoute);
router.use("/payment", payRouter);
router.use("/coupon", couponRoute);
router.use("/address", addressRouter);
router.use("/billing-address", billingAddressRouter);
router.use("/orders", orderRouter);
router.use("/analytics", analyticsRouter);
router.use("/shipping", shiprocketRoutes);  // Changed from /shiprocket to /shipping (Shiprocket doesn't allow 'shiprocket' in webhook URL)
router.use("/user", userRoutes);
router.use("/category", categoryRoutes);



//handlebars
const hbsOptions = {
    viewEngine: {
        defaultLayout: false,
        partialsDir: path.resolve("src/Email/partials"), // Fixed: must be a string, not false
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true
        }
    },
    viewPath: path.resolve("src/Email"),
    extName: '.handlebars'
}

// Only configure handlebars if transporter exists (email is configured)
if (transporter) {
    transporter.use('compile', hbs(hbsOptions))
}

export default router



