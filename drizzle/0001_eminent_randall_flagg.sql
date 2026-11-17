CREATE TABLE `availability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`therapistId` int NOT NULL,
	`weekday` int NOT NULL,
	`startTime` varchar(5) NOT NULL,
	`endTime` varchar(5) NOT NULL,
	`breakStart` varchar(5),
	`breakEnd` varchar(5),
	CONSTRAINT `availability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicCode` varchar(32) NOT NULL,
	`businessId` int NOT NULL,
	`serviceId` int NOT NULL,
	`therapistId` int NOT NULL,
	`clientId` int NOT NULL,
	`startsAt` datetime NOT NULL,
	`endsAt` datetime NOT NULL,
	`status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
	`depositClp` int NOT NULL,
	`totalClp` int NOT NULL,
	`holdExpiresAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `bookings_publicCode_unique` UNIQUE(`publicCode`)
);
--> statement-breakpoint
CREATE TABLE `businesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`name` varchar(160) NOT NULL,
	`timezone` varchar(64) NOT NULL DEFAULT 'America/Santiago',
	`location` varchar(160) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `businesses_id` PRIMARY KEY(`id`),
	CONSTRAINT `businesses_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`zone` varchar(120) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`stripeCheckoutSessionId` varchar(255),
	`stripePaymentIntentId` varchar(255),
	`amountClp` int NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'clp',
	`status` enum('processing','paid','failed','refunded') NOT NULL DEFAULT 'processing',
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `processedStripeEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` varchar(255) NOT NULL,
	`eventType` varchar(120) NOT NULL,
	`processedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `processedStripeEvents_id` PRIMARY KEY(`id`),
	CONSTRAINT `processedStripeEvents_eventId_unique` UNIQUE(`eventId`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`slug` varchar(80) NOT NULL,
	`name` varchar(180) NOT NULL,
	`category` varchar(80) NOT NULL,
	`description` text NOT NULL,
	`durationMinutes` int NOT NULL,
	`priceClp` int NOT NULL,
	`depositClp` int NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `therapists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`initials` varchar(8) NOT NULL,
	`specialty` varchar(180) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `therapists_id` PRIMARY KEY(`id`)
);
