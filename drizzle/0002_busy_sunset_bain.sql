CREATE TABLE `lottery_games` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`type` enum('mega_sena','lotomania','mais_milionaria') NOT NULL,
	`numbers` text NOT NULL,
	`analysis` text,
	`confidence` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lottery_games_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lottery_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('mega_sena','lotomania','mais_milionaria') NOT NULL,
	`draw_number` int NOT NULL,
	`numbers` text NOT NULL,
	`date` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lottery_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `lottery_games` ADD CONSTRAINT `lottery_games_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;