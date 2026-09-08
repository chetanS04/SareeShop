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
ALTER TABLE `products` ADD `hsn` varchar(15);--> statement-breakpoint
ALTER TABLE `products` ADD `cgst` decimal(5,2);--> statement-breakpoint
ALTER TABLE `products` ADD `sgst` decimal(5,2);--> statement-breakpoint
ALTER TABLE `products` ADD `igst` decimal(5,2);--> statement-breakpoint
ALTER TABLE `variants` ADD `is_cod_allowed` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `variants` ADD `is_returnable` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `variants` ADD `return_window_days` int DEFAULT 7 NOT NULL;--> statement-breakpoint
ALTER TABLE `variants` ADD `shipping_charges` decimal(10,2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE `order_items` ADD `hsn` varchar(15);--> statement-breakpoint
ALTER TABLE `order_items` ADD `tax_rate` decimal(5,2);--> statement-breakpoint
ALTER TABLE `order_items` ADD `taxable_amount` decimal(10,2);--> statement-breakpoint
ALTER TABLE `order_items` ADD `tax_amount` decimal(10,2);--> statement-breakpoint
ALTER TABLE `order_items` ADD `cgst_rate` decimal(5,2);--> statement-breakpoint
ALTER TABLE `order_items` ADD `cgst_amount` decimal(10,2);--> statement-breakpoint
ALTER TABLE `order_items` ADD `sgst_rate` decimal(5,2);--> statement-breakpoint
ALTER TABLE `order_items` ADD `sgst_amount` decimal(10,2);--> statement-breakpoint
ALTER TABLE `order_items` ADD `igst_rate` decimal(5,2);--> statement-breakpoint
ALTER TABLE `order_items` ADD `igst_amount` decimal(10,2);--> statement-breakpoint
ALTER TABLE `order_items` ADD `is_cod_allowed` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `order_items` ADD `is_returnable` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `order_items` ADD `return_window_days` int DEFAULT 7;--> statement-breakpoint
ALTER TABLE `order_items` ADD `shipping_charge` decimal(10,2) DEFAULT '0.00';--> statement-breakpoint
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
ALTER TABLE `categories` DROP COLUMN `hsn`;--> statement-breakpoint
ALTER TABLE `categories` DROP COLUMN `cgst`;--> statement-breakpoint
ALTER TABLE `categories` DROP COLUMN `sgst`;--> statement-breakpoint
ALTER TABLE `categories` DROP COLUMN `igst`;