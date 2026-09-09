CREATE TABLE `password_reset_tokens` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp,
	`expires_at` timestamp,
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`google_id` varchar(255),
	`phone_number` varchar(20),
	`address` text,
	`profile_picture` varchar(255),
	`password` varchar(255) NOT NULL,
	`is_verified` varchar(255),
	`email_verified_at` timestamp,
	`email_verification_code` varchar(255),
	`status` boolean NOT NULL DEFAULT true,
	`role` varchar(50) NOT NULL DEFAULT 'User',
	`otp` varchar(6),
	`otp_expires_at` timestamp,
	`remember_token` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`image` varchar(255),
	`secondary_image` varchar(255),
	`link` text,
	`parent_id` bigint unsigned,
	`status` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `category_attributes` (
	`category_id` bigint unsigned NOT NULL,
	`attribute_id` bigint unsigned NOT NULL,
	`has_images` boolean NOT NULL DEFAULT false,
	`is_primary` boolean NOT NULL DEFAULT false,
	CONSTRAINT `category_attributes_category_id_attribute_id_pk` PRIMARY KEY(`category_id`,`attribute_id`)
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`image1` varchar(255),
	`description1` text,
	`image2` varchar(255),
	`description2` text,
	`image3` varchar(255),
	`description3` text,
	`status` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brands_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attribute_values` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`value` varchar(255) NOT NULL,
	`description` varchar(255),
	`image` varchar(255),
	`show_image` boolean NOT NULL DEFAULT false,
	`attribute_id` bigint unsigned NOT NULL,
	`status` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attribute_values_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attributes` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attributes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `item_attributes` (
	`product_id` bigint unsigned NOT NULL,
	`attribute_id` bigint unsigned NOT NULL,
	`has_images` boolean NOT NULL DEFAULT false,
	`is_primary` boolean NOT NULL DEFAULT false,
	CONSTRAINT `item_attributes_product_id_attribute_id_pk` PRIMARY KEY(`product_id`,`attribute_id`)
);
--> statement-breakpoint
CREATE TABLE `product_attribute_values` (
	`product_id` bigint unsigned NOT NULL,
	`attribute_id` bigint unsigned NOT NULL,
	`attribute_value_id` bigint unsigned NOT NULL,
	CONSTRAINT `prod_attr_val_pk` PRIMARY KEY(`product_id`,`attribute_id`,`attribute_value_id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`item_code` varchar(255),
	`category_id` bigint unsigned NOT NULL,
	`brand_id` bigint unsigned,
	`status` boolean NOT NULL DEFAULT true,
	`feature_json` json,
	`detail_json` json,
	`image_url` varchar(255),
	`image_json` json,
	`is_new_arrival` boolean DEFAULT false,
	`hsn` varchar(15),
	`cgst` decimal(5,2),
	`sgst` decimal(5,2),
	`igst` decimal(5,2),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `variant_attribute_values` (
	`variant_id` bigint unsigned NOT NULL,
	`attribute_value_id` bigint unsigned NOT NULL,
	CONSTRAINT `variant_attribute_values_variant_id_attribute_value_id_pk` PRIMARY KEY(`variant_id`,`attribute_value_id`)
);
--> statement-breakpoint
CREATE TABLE `variants` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`title` varchar(255),
	`sku` varchar(255) NOT NULL,
	`mrp` decimal(10,2) NOT NULL,
	`sp` decimal(10,2) NOT NULL,
	`bp` decimal(10,2) NOT NULL,
	`stock` int NOT NULL DEFAULT 0,
	`image_url` varchar(255),
	`image_json` json,
	`product_id` bigint unsigned NOT NULL,
	`is_cod_allowed` boolean NOT NULL DEFAULT true,
	`is_returnable` boolean NOT NULL DEFAULT true,
	`return_window_days` int NOT NULL DEFAULT 7,
	`shipping_charges` decimal(10,2) NOT NULL DEFAULT '0.00',
	`status` boolean NOT NULL DEFAULT true,
	`deleted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `variants_id` PRIMARY KEY(`id`),
	CONSTRAINT `variants_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `carts` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`variant_id` bigint unsigned NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`price` decimal(10,2) DEFAULT '0.00',
	`selected_attributes` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`order_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`variant_id` bigint unsigned NOT NULL,
	`quantity` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`total` decimal(10,2) NOT NULL,
	`selected_attributes` json,
	`hsn` varchar(15),
	`tax_rate` decimal(5,2),
	`taxable_amount` decimal(10,2),
	`tax_amount` decimal(10,2),
	`cgst_rate` decimal(5,2),
	`cgst_amount` decimal(10,2),
	`sgst_rate` decimal(5,2),
	`sgst_amount` decimal(10,2),
	`igst_rate` decimal(5,2),
	`igst_amount` decimal(10,2),
	`is_cod_allowed` boolean DEFAULT true,
	`is_returnable` boolean DEFAULT true,
	`return_window_days` int DEFAULT 7,
	`shipping_charge` decimal(10,2) DEFAULT '0.00',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_tracking_records` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`order_id` bigint unsigned NOT NULL,
	`status` varchar(100) NOT NULL,
	`description` text,
	`location` varchar(255),
	`tracked_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `order_tracking_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`order_number` varchar(255) NOT NULL,
	`invoice_number` varchar(255),
	`user_id` bigint unsigned NOT NULL,
	`status` enum('pending','confirmed','processing','shipped','delivered','completed','cancelled') NOT NULL DEFAULT 'pending',
	`delivery_confirmation_token` varchar(255),
	`delivery_confirmed_at` timestamp,
	`delivery_confirmation_sent_at` timestamp,
	`payment_method` enum('cash_on_delivery','online') NOT NULL DEFAULT 'cash_on_delivery',
	`payment_status` enum('pending','paid','failed') NOT NULL DEFAULT 'pending',
	`transaction_id` varchar(255),
	`delhivery_waybill` varchar(255),
	`delhivery_status` varchar(255),
	`delhivery_status_updated_at` timestamp,
	`delhivery_tracking_data` json,
	`courier_name` varchar(255) DEFAULT 'Delhivery',
	`delivery_instructions` text,
	`subtotal` decimal(10,2) NOT NULL,
	`shipping_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
	`tax` decimal(10,2) NOT NULL DEFAULT '0.00',
	`total` decimal(10,2) NOT NULL,
	`shipping_address` text NOT NULL,
	`billing_address` text,
	`notes` text,
	`shipped_at` timestamp,
	`delivered_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_order_number_unique` UNIQUE(`order_number`),
	CONSTRAINT `orders_invoice_number_unique` UNIQUE(`invoice_number`)
);
--> statement-breakpoint
CREATE TABLE `return_request_items` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`return_request_id` bigint unsigned NOT NULL,
	`order_item_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`variant_id` bigint unsigned NOT NULL,
	`quantity` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`exchange_variant_id` bigint unsigned,
	`qc_status` enum('pending','passed','failed') NOT NULL DEFAULT 'pending',
	`qc_remarks` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `return_request_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `return_requests` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`return_number` varchar(255) NOT NULL,
	`order_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`status` enum('requested','approved','rejected','pickup_scheduled','picked_up','in_transit','received_at_warehouse','qc_pending','qc_passed','qc_failed','refund_pending','refund_processing','refunded','exchange_processing','completed','cancelled') NOT NULL DEFAULT 'requested',
	`return_type` enum('return','exchange') NOT NULL DEFAULT 'return',
	`reason` enum('defective_damaged','wrong_item_received','size_fit_issue','quality_not_expected','different_from_description','missing_parts','product_not_as_expected','other') NOT NULL DEFAULT 'defective_damaged',
	`reason_details` text,
	`customer_images` json,
	`refund_mode` enum('original_source','bank_transfer_upi','store_credit','manual_cash') NOT NULL DEFAULT 'original_source',
	`refund_status` enum('not_applicable','pending','processing','processed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`bank_details` json,
	`pickup_address` json,
	`reverse_waybill` varchar(255),
	`reverse_courier_name` varchar(255) DEFAULT 'Delhivery Reverse',
	`reverse_pickup_date` timestamp,
	`refund_amount` decimal(10,2) DEFAULT '0.00',
	`refund_transaction_id` varchar(255),
	`refund_failure_reason` text,
	`refund_attempts` int NOT NULL DEFAULT 0,
	`refunded_at` timestamp,
	`qc_status` enum('pending','passed','failed') NOT NULL DEFAULT 'pending',
	`qc_remarks` text,
	`qc_passed_at` timestamp,
	`qc_failed_at` timestamp,
	`exchange_requested` boolean NOT NULL DEFAULT false,
	`replacement_order_id` bigint unsigned,
	`admin_notes` text,
	`rejection_reason` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `return_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `return_requests_return_number_unique` UNIQUE(`return_number`)
);
--> statement-breakpoint
CREATE TABLE `return_tracking_events` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`return_request_id` bigint unsigned NOT NULL,
	`waybill` varchar(255) NOT NULL,
	`status` varchar(255) NOT NULL,
	`status_code` varchar(100),
	`location` varchar(255),
	`description` text,
	`event_time` timestamp NOT NULL DEFAULT (now()),
	`raw_response` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `return_tracking_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rto_cases` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`rto_number` varchar(255) NOT NULL,
	`order_id` bigint unsigned NOT NULL,
	`waybill` varchar(255) NOT NULL,
	`status` enum('ndr','reattempt_requested','rto_initiated','rto_in_transit','rto_received','qc_pending','qc_passed','qc_failed','restocked','completed') NOT NULL DEFAULT 'ndr',
	`ndr_attempts` int NOT NULL DEFAULT 1,
	`first_ndr_at` timestamp NOT NULL DEFAULT (now()),
	`last_ndr_at` timestamp NOT NULL DEFAULT (now()),
	`next_reattempt_at` timestamp,
	`ndr_action_taken` enum('reattempt_requested','address_updated','phone_updated','rto_approved','rescheduled'),
	`rto_reason` enum('customer_refused','customer_unreachable','incorrect_address','door_locked','pincode_unserviceable','fake_delivery_attempt','customer_not_available','other') NOT NULL DEFAULT 'customer_unreachable',
	`courier_status` varchar(255),
	`courier_remarks` text,
	`rto_initiated_at` timestamp,
	`rto_received_at` timestamp,
	`warehouse_qc_status` enum('pending','passed','failed') NOT NULL DEFAULT 'pending',
	`warehouse_qc_remarks` text,
	`inventory_action` enum('pending','restocked','damaged') NOT NULL DEFAULT 'pending',
	`inventory_action_at` timestamp,
	`admin_notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rto_cases_id` PRIMARY KEY(`id`),
	CONSTRAINT `rto_cases_rto_number_unique` UNIQUE(`rto_number`)
);
--> statement-breakpoint
CREATE TABLE `rto_tracking_events` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`rto_case_id` bigint unsigned NOT NULL,
	`waybill` varchar(255) NOT NULL,
	`status` varchar(255) NOT NULL,
	`location` varchar(255),
	`description` text,
	`event_time` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rto_tracking_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_transactions` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`variant_id` bigint unsigned NOT NULL,
	`order_id` bigint unsigned,
	`return_request_id` bigint unsigned,
	`rto_case_id` bigint unsigned,
	`transaction_type` enum('sale','cancelled_order','rto_restock','return_restock','return_damaged','rto_damaged','manual_adjustment') NOT NULL,
	`quantity` int NOT NULL,
	`previous_quantity` int NOT NULL,
	`new_quantity` int NOT NULL,
	`reason` varchar(255) NOT NULL,
	`notes` text,
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_audit_logs` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`admin_id` bigint unsigned,
	`action` varchar(255) NOT NULL,
	`entity_type` varchar(100) NOT NULL,
	`entity_id` bigint unsigned NOT NULL,
	`old_value` json,
	`new_value` json,
	`reason` text,
	`ip_address` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courier_webhook_events` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`courier` varchar(100) NOT NULL DEFAULT 'Delhivery',
	`event_id` varchar(255) NOT NULL,
	`waybill` varchar(255),
	`event_type` varchar(100) NOT NULL,
	`payload` json,
	`processed` boolean NOT NULL DEFAULT false,
	`processed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `courier_webhook_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `courier_event_idx` UNIQUE(`courier`,`event_id`)
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(50),
	`subject` varchar(255),
	`message` text NOT NULL,
	`is_read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `images` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`path` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `new_arrival_sliders` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`title` varchar(255),
	`image` varchar(255) NOT NULL,
	`link` text,
	`open_in_new_tab` boolean NOT NULL DEFAULT false,
	`description` text,
	`status` boolean NOT NULL DEFAULT true,
	`order` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `new_arrival_sliders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`rating` int NOT NULL DEFAULT 5,
	`review_text` text,
	`title` varchar(255),
	`images` json,
	`is_verified` boolean NOT NULL DEFAULT false,
	`is_approved` boolean NOT NULL DEFAULT true,
	`helpful_votes` json,
	`helpful_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `sliders` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`title` varchar(255),
	`image` varchar(255) NOT NULL,
	`link` text,
	`open_in_new_tab` boolean NOT NULL DEFAULT false,
	`description` text,
	`status` boolean NOT NULL DEFAULT true,
	`order` int NOT NULL DEFAULT 1,
	`show_buttons` boolean NOT NULL DEFAULT true,
	`button1_text` varchar(100),
	`button1_link` text,
	`button2_text` varchar(100),
	`button2_link` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sliders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_notification_preferences` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`in_app_orders` boolean NOT NULL DEFAULT true,
	`in_app_payments` boolean NOT NULL DEFAULT true,
	`in_app_inventory` boolean NOT NULL DEFAULT true,
	`in_app_returns` boolean NOT NULL DEFAULT true,
	`in_app_shipping` boolean NOT NULL DEFAULT true,
	`in_app_customers` boolean NOT NULL DEFAULT true,
	`in_app_system` boolean NOT NULL DEFAULT true,
	`email_orders` boolean NOT NULL DEFAULT false,
	`email_payments` boolean NOT NULL DEFAULT true,
	`email_inventory` boolean NOT NULL DEFAULT true,
	`email_returns` boolean NOT NULL DEFAULT true,
	`email_shipping` boolean NOT NULL DEFAULT true,
	`email_customers` boolean NOT NULL DEFAULT true,
	`email_system` boolean NOT NULL DEFAULT true,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_notification_preferences_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`in_app_orders` boolean NOT NULL DEFAULT true,
	`in_app_payments` boolean NOT NULL DEFAULT true,
	`in_app_shipping` boolean NOT NULL DEFAULT true,
	`in_app_returns` boolean NOT NULL DEFAULT true,
	`in_app_products` boolean NOT NULL DEFAULT true,
	`in_app_marketing` boolean NOT NULL DEFAULT true,
	`email_orders` boolean NOT NULL DEFAULT true,
	`email_payments` boolean NOT NULL DEFAULT true,
	`email_shipping` boolean NOT NULL DEFAULT true,
	`email_returns` boolean NOT NULL DEFAULT true,
	`email_products` boolean NOT NULL DEFAULT true,
	`email_marketing` boolean NOT NULL DEFAULT true,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned,
	`recipient_group` varchar(50) NOT NULL DEFAULT 'admin',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` varchar(50) NOT NULL DEFAULT 'system',
	`priority` varchar(20) NOT NULL DEFAULT 'NORMAL',
	`entity_type` varchar(50),
	`entity_id` bigint unsigned,
	`link` varchar(500),
	`is_read` boolean NOT NULL DEFAULT false,
	`read_at` timestamp,
	`reference_key` varchar(255),
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cities` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`state_id` bigint unsigned NOT NULL,
	`status` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `states` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`status` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `states_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `topbar_announcements` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`icon` varchar(100),
	`link_url` varchar(500),
	`status` enum('inactive','active') NOT NULL DEFAULT 'active',
	CONSTRAINT `topbar_announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `categories` ADD CONSTRAINT `categories_parent_id_categories_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `category_attributes` ADD CONSTRAINT `category_attributes_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `category_attributes` ADD CONSTRAINT `category_attributes_attribute_id_attributes_id_fk` FOREIGN KEY (`attribute_id`) REFERENCES `attributes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attribute_values` ADD CONSTRAINT `attribute_values_attribute_id_attributes_id_fk` FOREIGN KEY (`attribute_id`) REFERENCES `attributes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `item_attributes` ADD CONSTRAINT `item_attributes_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `item_attributes` ADD CONSTRAINT `item_attributes_attribute_id_attributes_id_fk` FOREIGN KEY (`attribute_id`) REFERENCES `attributes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_attribute_values` ADD CONSTRAINT `product_attribute_values_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_attribute_values` ADD CONSTRAINT `product_attribute_values_attribute_id_attributes_id_fk` FOREIGN KEY (`attribute_id`) REFERENCES `attributes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_attribute_values` ADD CONSTRAINT `pav_attr_val_fk` FOREIGN KEY (`attribute_value_id`) REFERENCES `attribute_values`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_brand_id_brands_id_fk` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `variant_attribute_values` ADD CONSTRAINT `variant_attribute_values_variant_id_variants_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `variant_attribute_values` ADD CONSTRAINT `vav_attr_val_fk` FOREIGN KEY (`attribute_value_id`) REFERENCES `attribute_values`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `variants` ADD CONSTRAINT `variants_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carts` ADD CONSTRAINT `carts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carts` ADD CONSTRAINT `carts_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carts` ADD CONSTRAINT `carts_variant_id_variants_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_variant_id_variants_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_tracking_records` ADD CONSTRAINT `order_tracking_records_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `return_request_items` ADD CONSTRAINT `return_request_items_return_request_id_return_requests_id_fk` FOREIGN KEY (`return_request_id`) REFERENCES `return_requests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `return_request_items` ADD CONSTRAINT `return_request_items_order_item_id_order_items_id_fk` FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `return_request_items` ADD CONSTRAINT `return_request_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `return_request_items` ADD CONSTRAINT `return_request_items_variant_id_variants_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `return_request_items` ADD CONSTRAINT `return_request_items_exchange_variant_id_variants_id_fk` FOREIGN KEY (`exchange_variant_id`) REFERENCES `variants`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `return_requests` ADD CONSTRAINT `return_requests_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `return_requests` ADD CONSTRAINT `return_requests_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `return_requests` ADD CONSTRAINT `return_requests_replacement_order_id_orders_id_fk` FOREIGN KEY (`replacement_order_id`) REFERENCES `orders`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `return_tracking_events` ADD CONSTRAINT `return_tracking_events_return_request_id_return_requests_id_fk` FOREIGN KEY (`return_request_id`) REFERENCES `return_requests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rto_cases` ADD CONSTRAINT `rto_cases_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rto_tracking_events` ADD CONSTRAINT `rto_tracking_events_rto_case_id_rto_cases_id_fk` FOREIGN KEY (`rto_case_id`) REFERENCES `rto_cases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_variant_id_variants_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_return_request_id_return_requests_id_fk` FOREIGN KEY (`return_request_id`) REFERENCES `return_requests`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_rto_case_id_rto_cases_id_fk` FOREIGN KEY (`rto_case_id`) REFERENCES `rto_cases`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_audit_logs` ADD CONSTRAINT `admin_audit_logs_admin_id_users_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `likes` ADD CONSTRAINT `likes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `likes` ADD CONSTRAINT `likes_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_notification_preferences` ADD CONSTRAINT `admin_notification_preferences_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cities` ADD CONSTRAINT `cities_state_id_states_id_fk` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON DELETE cascade ON UPDATE no action;