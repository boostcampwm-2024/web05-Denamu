-- denamu.admin definition

CREATE TABLE `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(60) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email_notification` tinyint NOT NULL DEFAULT 1,
  `parent_admin_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_admin_name` (`name`),
  UNIQUE KEY `UQ_admin_email` (`email`),
    CONSTRAINT `FK_admin_parent_admin_id`
    FOREIGN KEY (`parent_admin_id`)
    REFERENCES `admin` (`id`)
    ON DELETE CASCADE
);

-- denamu.rss definition

CREATE TABLE `rss` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `user_name` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `rss_url` varchar(255) NOT NULL,
  `blog_url` varchar(255) NOT NULL DEFAULT '',
  `platform` varchar(255) NOT NULL DEFAULT 'etc',
  `image` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_rss_name` (`name`),
  UNIQUE KEY `UQ_rss_rss_url` (`rss_url`)
);

-- denamu.`user` definition

CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(60) DEFAULT NULL,
  `user_name` varchar(60) NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `introduction` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `totalViews` int NOT NULL DEFAULT '0',
  `currentStreak` int NOT NULL DEFAULT '0',
  `lastActiveDate` date DEFAULT NULL,
  `maxStreak` int NOT NULL DEFAULT '0',
  `marketing_email_agreed` tinyint NOT NULL DEFAULT 0,
  `marketing_email_agreed_at` datetime DEFAULT NULL,
  `inactivity_email_agreed` tinyint NOT NULL DEFAULT 0,
  `inactivity_email_agreed_at` datetime DEFAULT NULL,
  `notice_email_agreed` tinyint NOT NULL DEFAULT 0,
  `notice_email_agreed_at` datetime DEFAULT NULL,
  `profile_image_change_count` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_user_user_name` (`user_name`),
  UNIQUE KEY `UQ_user_email` (`email`)
);

-- denamu.rss_accept definition

CREATE TABLE `rss_accept` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `user_name` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `rss_url` varchar(255) NOT NULL,
  `blog_url` varchar(255) NOT NULL DEFAULT '',
  `platform` varchar(255) NOT NULL DEFAULT 'etc',
  `user_id` int DEFAULT NULL,
  `image` text,
  `suspension_count` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_rss_accept_name` (`name`),
  UNIQUE KEY `UQ_rss_accept_rss_url` (`rss_url`),
  KEY `FK_rss_accept_user_id` (`user_id`),
  FULLTEXT KEY `FT_rss_accept_name` (`name`),
  CONSTRAINT `FK_rss_accept_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- denamu.rss_reject definition

CREATE TABLE `rss_reject` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `user_name` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `rss_url` varchar(255) NOT NULL,
  `blog_url` varchar(255) NOT NULL DEFAULT '',
  `platform` varchar(255) NOT NULL DEFAULT 'etc',
  `description` varchar(512) NOT NULL,
  `image` text,
  PRIMARY KEY (`id`)
);

-- denamu.feed definition

CREATE TABLE `feed` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL,
  `title` varchar(255) NOT NULL,
  `view_count` int NOT NULL DEFAULT '0',
  `path` varchar(512) NOT NULL,
  `thumbnail` text,
  `blog_id` int NOT NULL,
  `summary` text,
  `like_count` int NOT NULL DEFAULT '0',
  `comment_count` int NOT NULL DEFAULT '0',
  `is_public` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_feed_path` (`path`),
  KEY `IDX_feed_created_at` (`created_at`),
  KEY `FK_feed_blog_id` (`blog_id`),
  FULLTEXT KEY `FT_feed_title` (`title`),
  CONSTRAINT `FK_feed_blog_id` FOREIGN KEY (`blog_id`) REFERENCES `rss_accept` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- denamu.activity definition

CREATE TABLE `activity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activity_date` date NOT NULL,
  `view_count` int NOT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_activity_user_id_activity_date` (`user_id`,`activity_date`),
  KEY `FK_activity_user_id` (`user_id`),
  CONSTRAINT `FK_activity_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
);

-- denamu.category definition

CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `display_order` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_category_name` (`name`)
);

-- denamu.tag definition

CREATE TABLE `tag` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `category_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_tag_name` (`name`),
  CONSTRAINT `FK_tag_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE SET NULL
);

-- denamu.tag_map definition

CREATE TABLE `tag_map` (
  `tag_id` int NOT NULL,
  `feed_id` int NOT NULL,
  PRIMARY KEY (`feed_id`,`tag_id`),
  KEY `FK_tag_map_feed_id` (`feed_id`),
  KEY `FK_tag_map_tag_id` (`tag_id`),
  CONSTRAINT `FK_tag_map_feed_id` FOREIGN KEY (`feed_id`) REFERENCES `feed` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_tag_map_tag_id` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`)
);

-- denamu.comment definition

CREATE TABLE `comment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  `is_admin_deleted` tinyint NOT NULL DEFAULT '0',
  `date` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `feed_id` int NOT NULL,
  `user_id` int NOT NULL,
  `parent_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_comment_feed_id` (`feed_id`),
  KEY `FK_comment_user_id` (`user_id`),
  KEY `FK_comment_parent_id` (`parent_id`),
  CONSTRAINT `FK_comment_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_comment_feed_id` FOREIGN KEY (`feed_id`) REFERENCES `feed` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_comment_parent_id` FOREIGN KEY (`parent_id`) REFERENCES `comment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- denamu.likes definition

CREATE TABLE `likes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `like_date` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `feed_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_likes_user_id_feed_id` (`user_id`,`feed_id`),
  KEY `FK_likes_feed_id` (`feed_id`),
  CONSTRAINT `FK_likes_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_likes_feed_id` FOREIGN KEY (`feed_id`) REFERENCES `feed` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- denamu.notification definition

CREATE TABLE `notification` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(20) NOT NULL,
  `is_read` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `recipient_user_id` int NOT NULL,
  `feed_id` int NULL,
  `rss_accept_id` int NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_notification_recipient_user_id_type_feed_id` (`recipient_user_id`,`type`,`feed_id`),
  UNIQUE KEY `IDX_notification_recipient_type_rss_accept` (`recipient_user_id`,`type`,`rss_accept_id`),
  KEY `IDX_notification_updated_at` (`updated_at`),
  KEY `FK_notification_feed_id` (`feed_id`),
  KEY `FK_notification_rss_accept_id` (`rss_accept_id`),
  CONSTRAINT `FK_notification_recipient_user_id` FOREIGN KEY (`recipient_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_notification_feed_id` FOREIGN KEY (`feed_id`) REFERENCES `feed` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_notification_rss_accept_id` FOREIGN KEY (`rss_accept_id`) REFERENCES `rss_accept` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- denamu.blocks definition

CREATE TABLE `blocks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `blocker_id` int NOT NULL,
  `blocked_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_blocks_blocker_id_blocked_id` (`blocker_id`,`blocked_id`),
  KEY `FK_blocks_blocked_id` (`blocked_id`),
  CONSTRAINT `FK_blocks_blocker_id` FOREIGN KEY (`blocker_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_blocks_blocked_id` FOREIGN KEY (`blocked_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- denamu.rss_blocks definition

CREATE TABLE `rss_blocks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `blocker_id` int NOT NULL,
  `blocked_rss_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_rss_blocks_blocker_id_blocked_rss_id` (`blocker_id`,`blocked_rss_id`),
  KEY `FK_rss_blocks_blocked_rss_id` (`blocked_rss_id`),
  CONSTRAINT `FK_rss_blocks_blocker_id` FOREIGN KEY (`blocker_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_rss_blocks_blocked_rss_id` FOREIGN KEY (`blocked_rss_id`) REFERENCES `rss_accept` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- denamu.subscription definition

CREATE TABLE `subscription` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subscribed_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `rss_accept_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_subscription_user_rss` (`user_id`,`rss_accept_id`),
  KEY `FK_subscription_rss` (`rss_accept_id`),
  CONSTRAINT `FK_subscription_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_subscription_rss` FOREIGN KEY (`rss_accept_id`) REFERENCES `rss_accept` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- denamu.file definition

CREATE TABLE `file` (
  `id` int NOT NULL AUTO_INCREMENT,
  `original_name` varchar(255) NOT NULL,
  `mimetype` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  `size` int NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_file_user_id` (`user_id`),
  CONSTRAINT `FK_file_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
);

-- denamu.provider definition

CREATE TABLE `provider` (
  `id` int NOT NULL AUTO_INCREMENT,
  `provider_type` varchar(255) NOT NULL,
  `provider_user_id` varchar(255) NOT NULL,
  `provider_user_name` varchar(255) DEFAULT NULL,
  `refresh_token` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_provider_type_user_id` (`provider_type`,`provider_user_id`),
  UNIQUE KEY `UQ_user_provider_type` (`user_id`,`provider_type`),
  KEY `FK_provider_user_id` (`user_id`),
  CONSTRAINT `FK_provider_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- denamu.report definition

CREATE TABLE `report` (
  `id` int NOT NULL AUTO_INCREMENT,
  `target_type` varchar(20) NOT NULL,
  `target_id` int NOT NULL,
  `reason` varchar(20) NOT NULL,
  `detail` text,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `reporter_id` int DEFAULT NULL,
  `reported_user_id` int DEFAULT NULL,
  `reported_rss_id` int DEFAULT NULL,
  `reported_comment_id` int DEFAULT NULL,
  `reported_feed_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_report_reporter_id_target_type_target_id` (`reporter_id`,`target_type`,`target_id`),
  KEY `FK_report_reported_user_id` (`reported_user_id`),
  KEY `FK_report_reported_rss_id` (`reported_rss_id`),
  KEY `FK_report_reported_comment_id` (`reported_comment_id`),
  KEY `FK_report_reported_feed_id` (`reported_feed_id`),
  CONSTRAINT `FK_report_reporter_id` FOREIGN KEY (`reporter_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_report_reported_user_id` FOREIGN KEY (`reported_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_report_reported_rss_id` FOREIGN KEY (`reported_rss_id`) REFERENCES `rss_accept` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_report_reported_comment_id` FOREIGN KEY (`reported_comment_id`) REFERENCES `comment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_report_reported_feed_id` FOREIGN KEY (`reported_feed_id`) REFERENCES `feed` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- denamu.board definition

CREATE TABLE `board` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `question` longtext,
  `status` varchar(20) NOT NULL DEFAULT 'DRAFT',
  `category` varchar(20) NOT NULL DEFAULT 'NOTICE',
  `is_pinned` tinyint NOT NULL DEFAULT 0,
  `start_at` datetime DEFAULT NULL,
  `end_at` datetime DEFAULT NULL,
  `author_admin_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_board_author_admin_id` (`author_admin_id`),
  CONSTRAINT `FK_board_author_admin_id` FOREIGN KEY (`author_admin_id`) REFERENCES `admin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE `marketing_email` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `recipient_count` int NOT NULL,
  `author_admin_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_marketing_email_author_admin_id` (`author_admin_id`),
  CONSTRAINT `FK_marketing_email_author_admin_id` FOREIGN KEY (`author_admin_id`) REFERENCES `admin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- denamu.qna definition

CREATE TABLE `qna` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `is_secret` tinyint NOT NULL DEFAULT 0,
  `password` varchar(60) DEFAULT NULL,
  `guest_name` varchar(60) DEFAULT NULL,
  `guest_email` varchar(255) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'PENDING',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_qna_user_id` (`user_id`),
  CONSTRAINT `FK_qna_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- denamu.qna_message definition

CREATE TABLE `qna_message` (
  `id` int NOT NULL AUTO_INCREMENT,
  `qna_id` int NOT NULL,
  `type` varchar(10) NOT NULL,
  `content` longtext NOT NULL,
  `admin_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_qna_message_qna_id` (`qna_id`),
  KEY `FK_qna_message_admin_id` (`admin_id`),
  CONSTRAINT `FK_qna_message_qna_id` FOREIGN KEY (`qna_id`) REFERENCES `qna` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_qna_message_admin_id` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- denamu.user_suspension definition

CREATE TABLE `user_suspension` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `admin_id` int DEFAULT NULL,
  `detail` text NOT NULL,
  `suspended_until` datetime DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_user_suspension_user_id` (`user_id`),
  KEY `FK_user_suspension_admin_id` (`admin_id`),
  KEY `IDX_user_suspension_suspended_until` (`suspended_until`),
  CONSTRAINT `FK_user_suspension_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_user_suspension_admin_id` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- denamu.withdrawn_user definition

CREATE TABLE `withdrawn_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `withdrawn_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_withdrawn_user_email` (`email`)
);

-- denamu.admin insert data
-- id: test1~test5@test.com (순서대로 museong, cjh4302, syoon123, jmk101711, Min:D)
-- password (all): test1234!
INSERT INTO `admin` (email,password,name,parent_admin_id,email_notification) VALUES
	('test1@test.com','$2b$10$lmNFQaXm6yVo3hGMRJk5SuwV2Wn..ej9my29rXOSpiVj7iMrSWau.','museong',NULL,1),
	('test2@test.com','$2b$10$lmNFQaXm6yVo3hGMRJk5SuwV2Wn..ej9my29rXOSpiVj7iMrSWau.','cjh4302',NULL,1),
	('test3@test.com','$2b$10$lmNFQaXm6yVo3hGMRJk5SuwV2Wn..ej9my29rXOSpiVj7iMrSWau.','syoon123',NULL,1),
	('test4@test.com','$2b$10$lmNFQaXm6yVo3hGMRJk5SuwV2Wn..ej9my29rXOSpiVj7iMrSWau.','jmk101711',NULL,1),
	('test5@test.com','$2b$10$lmNFQaXm6yVo3hGMRJk5SuwV2Wn..ej9my29rXOSpiVj7iMrSWau.','Min:D',NULL,1);

-- denamu.user insert data (11명, row 1 = 실제 운영 데이터: seok3765@naver.com / Min:D)
-- password (all, 로컬 시드용 고정값): test1234!
INSERT INTO `user` (email,password,user_name,profile_image,introduction,totalViews,currentStreak,lastActiveDate,maxStreak,marketing_email_agreed,marketing_email_agreed_at,inactivity_email_agreed,inactivity_email_agreed_at,notice_email_agreed,notice_email_agreed_at,profile_image_change_count) VALUES
	('test1@test.com','$2b$10$lmNFQaXm6yVo3hGMRJk5SuwV2Wn..ej9my29rXOSpiVj7iMrSWau.','Min:D','/objects/PROFILE_IMAGE/2026-08-07/178d7c64-b0cb-49cf-9424-d8b3d3de2271.webp','안녕하세요 Min:D 입니다.',13,2,'2026-08-31',2,1,'2026-08-01 14:22:38',1,'2026-08-07 14:14:30',1,'2026-08-01 14:23:11',0),
	('test2@test.com','$2b$10$lmNFQaXm6yVo3hGMRJk5SuwV2Wn..ej9my29rXOSpiVj7iMrSWau.','테스트 계정2','https://velog.velcdn.com/images/seok3765/profile/bfb84abe-3508-462a-9d07-e8e73c8da67c/image.png','안녕하세요 테스트2입니다.',0,0,NULL,0,0,NULL,0,NULL,0,NULL,0),
	('test3@test.com','$2b$10$lmNFQaXm6yVo3hGMRJk5SuwV2Wn..ej9my29rXOSpiVj7iMrSWau.','테스트 계정3',NULL,'안녕하세요 테스트3입니다.',0,0,NULL,0,0,NULL,0,NULL,0,NULL,0),
	('test4@test.com','$2b$10$lmNFQaXm6yVo3hGMRJk5SuwV2Wn..ej9my29rXOSpiVj7iMrSWau.','테스트 계정4',NULL,'안녕하세요 테스트4입니다.',12,3,'2026-08-10',5,0,NULL,0,NULL,0,NULL,0),
	('test5@test.com','$2b$10$lmNFQaXm6yVo3hGMRJk5SuwV2Wn..ej9my29rXOSpiVj7iMrSWau.','테스트 계정5',NULL,'안녕하세요 테스트5입니다.',0,0,NULL,0,0,NULL,0,NULL,0,NULL,0),
	('test6@test.com','$2b$10$lmNFQaXm6yVo3hGMRJk5SuwV2Wn..ej9my29rXOSpiVj7iMrSWau.','테스트 계정6',NULL,'안녕하세요 테스트6입니다.',34,7,'2026-08-11',10,0,NULL,0,NULL,0,NULL,0),
	('test7@test.com','$2b$10$lmNFQaXm6yVo3hGMRJk5SuwV2Wn..ej9my29rXOSpiVj7iMrSWau.','테스트 계정7',NULL,'안녕하세요 테스트7입니다.',5,1,'2026-08-05',2,0,NULL,0,NULL,0,NULL,0),
	('test8@test.com','$2b$10$lmNFQaXm6yVo3hGMRJk5SuwV2Wn..ej9my29rXOSpiVj7iMrSWau.','테스트 계정8',NULL,'안녕하세요 테스트8입니다.',0,0,NULL,0,0,NULL,0,NULL,0,NULL,0),
	('test9@test.com','$2b$10$lmNFQaXm6yVo3hGMRJk5SuwV2Wn..ej9my29rXOSpiVj7iMrSWau.','테스트 계정9',NULL,'안녕하세요 테스트9입니다.',21,2,'2026-08-09',4,0,NULL,0,NULL,0,NULL,0),
	('test10@test.com','$2b$10$lmNFQaXm6yVo3hGMRJk5SuwV2Wn..ej9my29rXOSpiVj7iMrSWau.','테스트 계정10',NULL,'안녕하세요 테스트10입니다.',8,0,'2026-07-20',3,0,NULL,0,NULL,0,NULL,0);

-- denamu.rss_accept insert data (운영 데이터 기준: denamu.sql/rss_accept)
INSERT INTO `rss_accept` (name,user_name,email,rss_url,platform,user_id,image,blog_url,suspension_count) VALUES
	('개발 인생 복구 센터','조민석','seok3765@naver.com','https://seok3765.tistory.com/rss','tistory',1,'https://tistory1.daumcdn.net/tistory/8709220/attach/22a2a2633a304b0c9fce20b4aa07ebcc','https://seok3765.tistory.com',0),
	('나무보다 숲을','채준혁','cjh4302@gmail.com','https://laurent.tistory.com/rss','tistory',NULL,'https://tistory1.daumcdn.net/tistory/1933172/attach/049fbacb3fce476fa2775ce2b4560a6a','https://laurent.tistory.com',0),
	('월성참치','정명기','jmk101711@naver.com','https://tunaspace.tistory.com/rss','tistory',NULL,'https://tistory1.daumcdn.net/tistory/7272540/attach/7854b493254e4d23bc965242072980e7','https://tunaspace.tistory.com',0),
	('해야지 뭐','안성윤','asn6878@gmail.com','https://asn6878.tistory.com/rss','tistory',NULL,'https://tistory1.daumcdn.net/tistory/6628453/attach/24a39b509258408894ac0e0bd41b1768','https://asn6878.tistory.com',0);

-- denamu.rss insert data (대기중인 등록 요청 mock)
INSERT INTO `rss` (name,user_name,email,rss_url,blog_url,platform) VALUES
	('대기중인 블로그','김대기','test3@test.com','https://pending-blog.tistory.com/rss','https://pending-blog.tistory.com','tistory');

-- denamu.rss_reject insert data (mock)
INSERT INTO `rss_reject` (name,user_name,email,rss_url,blog_url,description) VALUES
	('거절해주세요!','조민석','seok3765@naver.com','https://v2.velog.io/rss/@seok3766','https://velog.io/@seok3766','거절 요청에 따라 거절해드립니다~');

-- denamu.feed insert data (운영 데이터 기준: denamu.sql/feed, 4개 블로그分)
INSERT INTO `feed` (created_at,title,view_count,path,thumbnail,blog_id,summary,like_count,comment_count,is_public) VALUES
	('2024-12-15 15:20:23','[네이버 커넥트재단 부스트캠프 웹・모바일 9기] 날 것 그대로 작성하는 멤버십 수료 후기 - Web',3,'https://seok3765.tistory.com/entry/%EB%84%A4%EC%9D%B4%EB%B2%84-%EC%BB%A4%EB%84%A5%ED%8A%B8%EC%9E%AC%EB%8B%A8-%EB%B6%80%EC%8A%A4%ED%8A%B8%EC%BA%A0%ED%94%84-%EC%9B%B9%E3%83%BB%EB%AA%A8%EB%B0%94%EC%9D%BC-9%EA%B8%B0-%EB%82%A0-%EA%B2%83-%EA%B7%B8%EB%8C%80%EB%A1%9C-%EC%9E%91%EC%84%B1%ED%95%98%EB%8A%94-%EB%A9%A4%EB%B2%84%EC%8B%AD-%EC%88%98%EB%A3%8C-%ED%9B%84%EA%B8%B0-Web','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fw2SRl%2FdJMcacDBiVx%2FAAAAAAAAAAAAAAAAAAAAAJ0Nv2f4kBBqOlCLqg9wxlaUeHmIJfERCzJ3R-Y99vqQ%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D98KA0dmPAdcl%252FZfDOpW4uLuk20Q%253D',1,NULL,0,0,1),
	('2024-08-14 14:07:49','[네이버 커넥트재단 부스트캠프 웹・모바일 9기] 날 것 그대로 작성하는 챌린지 수료 후기 - Web',0,'https://seok3765.tistory.com/entry/%EB%84%A4%EC%9D%B4%EB%B2%84-%EC%BB%A4%EB%84%A5%ED%8A%B8%EC%9E%AC%EB%8B%A8-%EB%B6%80%EC%8A%A4%ED%8A%B8%EC%BA%A0%ED%94%84-%EC%9B%B9%E3%83%BB%EB%AA%A8%EB%B0%94%EC%9D%BC-9%EA%B8%B0-%EB%82%A0-%EA%B2%83-%EA%B7%B8%EB%8C%80%EB%A1%9C-%EC%9E%91%EC%84%B1%ED%95%98%EB%8A%94-%EC%B1%8C%EB%A6%B0%EC%A7%80-%EC%88%98%EB%A3%8C-%ED%9B%84%EA%B8%B0-Web','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FcmLbaf%2FdJMcaf1gdRY%2FAAAAAAAAAAAAAAAAAAAAAJ7-9ha3ex5IsmxbTIcDRUOae-pmwhvdjgGurEfa0Pyt%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3DPT9PNk5u8OXUsk2ar%252FZpbKDWLhM%253D',1,NULL,0,0,1),
	('2025-01-01 09:57:59','[컴퓨터학개론] AI시대의 컴퓨터 개론 - 내용 점검 문제 8장',2,'https://laurent.tistory.com/entry/컴퓨터학개론-AI시대의-컴퓨터-개론-내용-점검-문제-8장','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FEAc7h%2FbtsLCp0GjT6%2FxmRrt2mHV26Q5EZtnlIuYK%2Fimg.jpg',2,NULL,0,0,1),
	('2025-01-01 09:57:41','[컴퓨터학개론] AI시대의 컴퓨터 개론 - 내용 점검 문제 7장',1,'https://laurent.tistory.com/entry/컴퓨터학개론-AI시대의-컴퓨터-개론-내용-점검-문제-7장','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbra31r%2FbtsLBVyPlia%2FKUrcmpjWoQz72dl4hyhy40%2Fimg.jpg',2,NULL,0,0,1),
	('2025-01-01 09:57:27','[컴퓨터학개론] AI시대의 컴퓨터 개론 - 내용 점검 문제 6장',1,'https://laurent.tistory.com/entry/컴퓨터학개론-AI시대의-컴퓨터-개론-내용-점검-문제-6장','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbgHcoJ%2FbtsLCJq32Gz%2FqnoiJfT4R8kPVJZX0HkrE1%2Fimg.jpg',2,NULL,0,0,1),
	('2025-01-01 09:57:02','[컴퓨터학개론] AI시대의 컴퓨터 개론 - 내용 점검 문제 5장',1,'https://laurent.tistory.com/entry/컴퓨터학개론-AI시대의-컴퓨터-개론-내용-점검-문제-5장','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbmMIdF%2FbtsLCmiLLlz%2FJh3fcj0EE110gip0VbsKa0%2Fimg.jpg',2,NULL,0,0,1),
	('2025-01-01 09:56:42','[컴퓨터학개론] AI시대의 컴퓨터 개론 - 내용 점검 문제 4장',2,'https://laurent.tistory.com/entry/컴퓨터학개론-AI시대의-컴퓨터-개론-내용-점검-문제-4장','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FVk4f3%2FbtsLC6TTxJY%2Fgp2A3Zio9oNgaFwVOJhk50%2Fimg.jpg',2,NULL,0,0,1),
	('2025-01-01 09:56:17','[컴퓨터학개론] AI시대의 컴퓨터 개론 - 내용 점검 문제 3장',2,'https://laurent.tistory.com/entry/컴퓨터학개론-AI시대의-컴퓨터-개론-내용-점검-문제-3장','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FdHifmQ%2FbtsLCqSOiNu%2F9jz5XgKtqBGI4GVRmcqo81%2Fimg.jpg',2,NULL,0,0,1),
	('2025-01-01 09:55:52','[컴퓨터학개론] AI시대의 컴퓨터 개론 - 내용 점검 문제 2장',1,'https://laurent.tistory.com/entry/컴퓨터학개론-AI시대의-컴퓨터-개론-내용-점검-문제-2장','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbk5adg%2FbtsLCGBmBJQ%2F8wLoOtsuafBu4oyC7X24sk%2Fimg.jpg',2,NULL,0,0,1),
	('2025-01-01 09:55:19','[컴퓨터학개론] AI시대의 컴퓨터 개론 - 내용 점검 문제 1장',4,'https://laurent.tistory.com/entry/컴퓨터학개론-AI시대의-컴퓨터-개론-내용-점검-문제-1장','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FyP38X%2FbtsLC5tSTmB%2FQLJWCIezMTIMK4TI5DW3ck%2Fimg.jpg',2,NULL,0,0,1),
	('2024-12-31 13:29:55','2024년 회고',4,'https://laurent.tistory.com/entry/2024년-회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fb4PqwE%2FbtsLDoUaKl5%2FIzlJCnCQWJgUNihL0l5Sq1%2Fimg.png',2,NULL,0,0,1),
	('2024-12-29 14:58:45','[서평] 믿고보는 시리즈 - 소플의 처음 만난 AWS',0,'https://laurent.tistory.com/entry/서평-믿고보는-시리즈-소플의-처음-만난-AWS','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcglUxX%2FbtsLAycE6Oq%2FA76t3kFoRKww5Z3Y7tSMQK%2Fimg.png',2,NULL,0,0,1),
	('2024-12-24 14:59:11','[서평] 기초부터 배우는 최신 스토리지 입문',0,'https://laurent.tistory.com/entry/서평-기초부터-배우는-최신-스토리지-입문','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FmlbHE%2FbtsLxGg2crn%2FItBJRu6dK8d1ugjCH5pBoK%2Fimg.jpg',2,NULL,0,0,1),
	('2024-12-23 12:31:09','[React] 좋아요 기능 버그 해결 및 서버 데이터 활용',0,'https://laurent.tistory.com/entry/React-좋아요-기능-버그-해결-및-서버-데이터-활용','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fn9XvB%2FbtsLs2SSvXD%2FpX4jJqjYsN3Kvm6kVeCH9K%2Fimg.jpg',2,NULL,0,0,1),
	('2024-12-15 15:45:14','네이버 부스트캠프 9기 웹 풀스택 과정 후기',7,'https://laurent.tistory.com/entry/네이버-부스트캠프-9기-웹-풀스택-과정-후기','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fo4aHa%2FbtsLiZhAwKH%2FmuiPRCUCK5sVcm1U35KknK%2Fimg.png',2,NULL,0,0,1),
	('2024-12-12 17:11:51','[React] useEffect의 내부적인 동작',0,'https://laurent.tistory.com/entry/React-useEffect의-내부적인-동작','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FybzbA%2FbtsLgdtxOZ1%2FbPJG88Zopbg3GYCCv66UA1%2Fimg.jpg',2,NULL,0,0,1),
	('2024-12-01 14:20:33','[Javascript] 브라우저 팝업 차단으로 인한 문제와 해결책',0,'https://laurent.tistory.com/entry/Javascript-브라우저-팝업-차단으로-인한-문제와-해결책','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcvhYyL%2FbtsK2oa0BmV%2FvCOtbQW29hHJtDY1mdX8kk%2Fimg.jpg',2,NULL,0,0,1),
	('2024-11-30 09:14:29','2024년 11월 정기회고',0,'https://laurent.tistory.com/entry/2024년-11월-정기회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FlCF0Y%2FbtsK19rAVhX%2FkyiZZMCXaLKr4zTIQkVCK1%2Fimg.jpg',2,NULL,0,0,1),
	('2024-10-27 10:58:51','[서평] 올인원 개발 키트 - 헬로 Bun',0,'https://laurent.tistory.com/entry/서평-올인원-개발-키트-헬로-Bun','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FblruHt%2FbtsKlXYphWT%2Fqhkp0koc7ibgNJZAl6gGak%2Fimg.png',2,NULL,0,0,1),
	('2024-10-27 06:55:13','[서평] 클라우드 입문서 - 비전공자를 위한 AWS',0,'https://laurent.tistory.com/entry/서평-클라우드-입문서-비전공자를-위한-AWS','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FwwQQd%2FbtsKkhRx56w%2Fbry8wS93h3I3yfnZdPpK01%2Fimg.png',2,NULL,0,0,1),
	('2024-10-25 07:48:08','[서평] 효과적인 활용을 위해 - 이펙티브 러스트',0,'https://laurent.tistory.com/entry/서평-효과적인-활용을-위해-이펙티브-러스트','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcfMtYX%2FbtsKkbJzJtz%2F53JkhTBvH8ymeLjAB28K31%2Fimg.png',2,NULL,0,0,1),
	('2024-10-23 03:53:03','[부스트캠프 9기 멤버십] 8주차 회고록',0,'https://laurent.tistory.com/entry/부스트캠프-9기-멤버십-8주차-회고록','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F3pAmf%2FbtsKf6ajeYD%2FAYwELS26sfvhPQjXj4EQzk%2Fimg.png',2,NULL,0,0,1),
	('2024-10-13 11:51:15','[부스트캠프 9기 멤버십] 7주차 회고록',0,'https://laurent.tistory.com/entry/부스트캠프-9기-멤버십-7주차-회고록','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FtB2gg%2FbtsJ4pudcJS%2FvgwvJLtbNZHA5zj9I74S9k%2Fimg.png',2,NULL,0,0,1),
	('2024-10-05 16:13:14','[부스트캠프 9기 멤버십] 6주차 회고록',1,'https://laurent.tistory.com/entry/부스트캠프-9기-멤버십-6주차-회고록','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fc8dRVZ%2FbtsJV0V95O8%2FuWWxRXKOVGHf6hi5XIKON1%2Fimg.jpg',2,NULL,0,0,1),
	('2024-09-28 17:22:33','[부스트캠프 9기 멤버십] 5주차 회고록',0,'https://laurent.tistory.com/entry/부스트캠프-9기-멤버십-5주차-회고록','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FKnyGb%2FbtsJQ53m67B%2F4QKnbv1UJFLP7ioz7gGeyk%2Fimg.jpg',2,NULL,0,0,1),
	('2024-09-28 17:22:04','[부스트캠프 9기 멤버십] 3주차 회고록',0,'https://laurent.tistory.com/entry/부스트캠프-9기-멤버십-3주차-회고록','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbSbOGD%2FbtsJPTQx8Jn%2F9VKR5i6hYy83ZDAWnRczok%2Fimg.jpg',2,NULL,0,0,1),
	('2024-09-28 17:21:14','[부스트캠프 9기 멤버십] 1주차 회고록',0,'https://laurent.tistory.com/entry/부스트캠프-9기-멤버십-1주차-회고록','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FGreTN%2FbtsJQoCs5Iw%2FTOpUWIZ19vgFXXuN8p7Ctk%2Fimg.jpg',2,NULL,0,0,1),
	('2024-09-28 17:06:28','[서평] 중요한 내용만 빠르게 - 컴퓨터 구조와 운영체제 핵심 노트',0,'https://laurent.tistory.com/entry/서평-중요한-내용만-빠르게-컴퓨터-구조와-운영체제-핵심-노트','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbj2tZc%2FbtsJPmTlq81%2FKJ5hVNI4vpoDNCi1kLZh40%2Fimg.png',2,NULL,0,0,1),
	('2024-09-28 17:03:04','2024년 9월 정기회고',0,'https://laurent.tistory.com/entry/2024년-9월-정기회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FVJNy0%2FbtsJQD7u9mB%2FYtkPRWkjZG0Mcu88eD6zxK%2Fimg.jpg',2,NULL,0,0,1),
	('2024-09-28 11:21:19','[서평] CS 익힘책 - 이것이 취업을 위한 컴퓨터 과학이다',0,'https://laurent.tistory.com/entry/서평-CS-익힘책-이것이-취업을-위한-컴퓨터-과학이다','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbHi3fm%2FbtsJRcBiuc2%2Fg42a8KfGjBeYpg3xSdmZJK%2Fimg.png',2,NULL,0,0,1),
	('2024-09-19 12:20:31','[Typescript] 사진과 영상을 FormData로 서버에 전송하기',0,'https://laurent.tistory.com/entry/Typescript-사진과-영상을-FormData로-서버에-전송하기','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbnF8gk%2FbtsJElHhxEA%2FvEHYqgusACTezGW9kdXNc1%2Fimg.jpg',2,NULL,0,0,1),
	('2024-09-09 00:46:28','2024년 8월 정기회고',0,'https://laurent.tistory.com/entry/2024년-8월-정기회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F8rzkH%2FbtsJuXMqI8r%2Fk4zdUJzPj541WY81lx6MbK%2Fimg.png',2,NULL,0,0,1),
	('2024-09-03 16:22:28','[서평] 모던 자바 기능으로 전문가 되기 - 기본기가 탄탄한 자바 개발자',0,'https://laurent.tistory.com/entry/서평-모던-자바-기능으로-전문가-되기-기본기가-탄탄한-자바-개발자','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F5wDyE%2FbtsJqFdebVC%2FFgt1xtxl46o6PkEatQpSK0%2Fimg.jpg',2,NULL,0,0,1),
	('2024-09-03 16:12:27','[서평] 인공지능 시대의 경제 - 금융 AI의 이해',0,'https://laurent.tistory.com/entry/서평-인공지능-시대의-경제-금융-AI의-이해','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fc7fBGc%2FbtsJpKffzUM%2FOpZRjbdCJF6kNzqvEXtkV0%2Fimg.jpg',2,NULL,0,0,1),
	('2024-08-26 15:21:31','[Javascript] 이벤트 전파',0,'https://laurent.tistory.com/entry/Javascript-이벤트-전파','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FEQK4T%2FbtsJggL7myP%2F0uDMZyyPaQbxQzdvecI8h0%2Fimg.jpg',2,NULL,0,0,1),
	('2024-08-26 15:00:10','[Javascript] 이벤트 핸들러 등록',0,'https://laurent.tistory.com/entry/Javascript-이벤트-핸들러-등록','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FNhzEi%2FbtsJg9FmunA%2F0lbnnxPPU3XwEqFrx3Vzp1%2Fimg.jpg',2,NULL,0,0,1),
	('2024-08-22 12:04:41','[부스트캠프 9기 멤버십] 수료생과의 밋업',0,'https://laurent.tistory.com/entry/부스트캠프-9기-멤버십-수료생과의-밋업','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FMVDPH%2FbtsJb6iLOFj%2Fd1du0CyDy1djGk9Wf3ndbK%2Fimg.png',2,NULL,0,0,1),
	('2024-08-11 12:27:57','네이버 부스트캠프 9기 챌린지 회고',0,'https://laurent.tistory.com/entry/네이버-부스트캠프-9기-챌린지-회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FMMWks%2FbtsIZW2mVH8%2Fkksak8FH1k9zGfAAPo5NX0%2Fimg.jpg',2,NULL,0,0,1),
	('2024-08-11 05:50:17','[부스트캠프 9기 챌린지] 4주차 회고',0,'https://laurent.tistory.com/entry/부스트캠프-9기-챌린지-4주차-회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbHLEx6%2FbtsI1emPYnH%2FLa1V6pjwDoZHozoFiUVlm1%2Fimg.jpg',2,NULL,0,0,1),
	('2024-08-02 09:26:06','[부스트캠프 9기 챌린지] 3주차 회고',0,'https://laurent.tistory.com/entry/부스트캠프-9기-챌린지-3주차-회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fv0hjY%2FbtsITOvtlkj%2F0T0GXiGKr6plU9fkcOYwkk%2Fimg.jpg',2,NULL,0,0,1),
	('2024-07-31 17:06:41','2024년 7월 정기회고',0,'https://laurent.tistory.com/entry/2024년-7월-정기회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fq9IWm%2FbtsJjqnfLQl%2F4kohwz3l65AUmSFI4D2J20%2Fimg.jpg',2,NULL,0,0,1),
	('2024-07-28 14:03:03','[서평] 실무로 통하는 타입스크립트',0,'https://laurent.tistory.com/entry/서평-실무로-통하는-타입스크립트','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F8eX67%2FbtsIPlOC2IU%2F2nuAWVpbEXd1arAR9MRe71%2Fimg.jpg',2,NULL,0,0,1),
	('2024-07-26 10:24:54','[부스트캠프 9기 챌린지] 2주차 회고',0,'https://laurent.tistory.com/entry/부스트캠프-9기-챌린지-2주차-회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fc4CJ77%2FbtsIPUPOczX%2FMsyquWz74cKDMvbKGsi37K%2Fimg.jpg',2,NULL,0,0,1),
	('2024-07-20 15:43:33','[부스트캠프 9기 챌린지] 수료생과의 밋업',0,'https://laurent.tistory.com/entry/부스트캠프-9기-챌린지-수료생과의-밋업','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcRhljL%2FbtsIHJ1S6gh%2F78kj3yhIVSKGbGUOB91iVk%2Fimg.jpg',2,NULL,0,0,1),
	('2024-07-19 09:30:40','[부스트캠프 9기 챌린지] 1주차 회고',0,'https://laurent.tistory.com/entry/부스트캠프-9기-챌린지-1주차-회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FuGO8u%2FbtsIG9MY4ab%2F9WMLLYBS3tZzR6h3iKfuIK%2Fimg.jpg',2,NULL,0,0,1),
	('2024-07-19 03:00:27','[서평] 문제와 해설을 한 번에 - 이기적 정보처리기사 실기 핵심 600제',0,'https://laurent.tistory.com/entry/서평-문제와-해설을-한-번에-이기적-정보처리기사-실기-핵심-600제','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FYvw9l%2FbtsIDNLtYQL%2Fu7Fbx7VohtlFEXi90yk2M1%2Fimg.png',2,NULL,0,0,1),
	('2024-07-14 09:00:26','[C언어] 문자와 문자열',0,'https://laurent.tistory.com/entry/C언어-문자와-문자열','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FtXhp1%2FbtsIz9eJRwJ%2F4igdXEjgNN5OGKRpKuLKa0%2Fimg.jpg',2,NULL,0,0,1),
	('2024-07-13 05:37:07','[서평] 테스트 개론 - 프런트엔드 개발을 위한 테스트 입문',0,'https://laurent.tistory.com/entry/서평-테스트-개론-프런트엔드-개발을-위한-테스트-입문','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fn7gN3%2FbtsIy1uUESB%2FahrYTfKoelGqbDI6LqdPGK%2Fimg.png',2,NULL,0,0,1),
	('2024-07-12 11:28:43','인프콘 2024 랠릿 허브 등록 이벤트',0,'https://laurent.tistory.com/entry/인프콘-2024-랠릿-허브-등록-이벤트','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FqWtzj%2FbtsIy5jkhJQ%2F1AVJpBTtwKcyxliewua34K%2Fimg.jpg',2,NULL,0,0,1),
	('2024-07-06 15:00:42','네이버 부스트캠프 9기 베이직 + 2차 문제 해결력 테스트 회고',0,'https://laurent.tistory.com/entry/네이버-부스트캠프-9기-베이직-2차-문제-해결력-테스트-회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FmPLDo%2FbtsIo65xUjY%2FKA2gq1K4dkue2D1Bxt8xS1%2Fimg.jpg',2,NULL,0,0,1),
	('2024-07-04 18:22:54','[서평] 그림으로 쉽고 빠르게 배우는 - AWS 시스템 개발 스킬업',0,'https://laurent.tistory.com/entry/서평-그림으로-쉽고-빠르게-배우는-AWS-시스템-개발-스킬업','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FrBlJ2%2FbtsInLNet1p%2Fs0RCF5VbRNzywH9LxocHz0%2Fimg.png',2,NULL,0,0,1),
	('2024-06-30 13:00:59','2024년 6월 정기회고',0,'https://laurent.tistory.com/entry/2024년-6월-정기회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FCMgsb%2FbtsIixtRGu5%2FMb4UuXsK1Kliv6JE2A2q3k%2Fimg.jpg',2,NULL,0,0,1),
	('2024-12-30 08:33:30','LeetCode - Numberof Different Integer in a String',0,'https://tunaspace.tistory.com/entry/LeetCode-Numberof-Different-Integer-in-a-String','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Ftistory_admin%2Fstatic%2Fimages%2FopenGraph%2Fopengraph.png',3,NULL,0,0,1),
	('2024-12-27 15:10:31','LeetCode - Restore IP Addresses',2,'https://tunaspace.tistory.com/entry/LeetCode-Restore-IP-Addresses','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Ftistory_admin%2Fstatic%2Fimages%2FopenGraph%2Fopengraph.png',3,NULL,0,0,1),
	('2024-12-25 14:22:20','LeetCode - Path Sum',0,'https://tunaspace.tistory.com/entry/LeetCode-Path-Sum','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Ftistory_admin%2Fstatic%2Fimages%2FopenGraph%2Fopengraph.png',3,NULL,0,0,1),
	('2024-12-23 12:50:04','LeetCode - Maximum Average Subarray 1',0,'https://tunaspace.tistory.com/entry/LeetCode-Maximum-Average-Subarray-1','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Ftistory_admin%2Fstatic%2Fimages%2FopenGraph%2Fopengraph.png',3,NULL,0,0,1),
	('2024-09-30 09:42:54','바닐라 JS로 리액트 만들기 - 4',1,'https://tunaspace.tistory.com/entry/바닐라-JS로-리액트-만들기-4','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Ftistory_admin%2Fstatic%2Fimages%2FopenGraph%2Fopengraph.png',3,NULL,0,0,1),
	('2024-09-24 14:57:44','바닐라 JS로 리액트 만들기 - 3',0,'https://tunaspace.tistory.com/entry/바닐라-JS로-리액트-만들기-3','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Ftistory_admin%2Fstatic%2Fimages%2FopenGraph%2Fopengraph.png',3,NULL,0,0,1),
	('2024-09-24 13:44:17','바닐라 JS로 리액트 만들기 - 2',0,'https://tunaspace.tistory.com/entry/바닐라-JS로-리액트-만들기-2','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Ftistory_admin%2Fstatic%2Fimages%2FopenGraph%2Fopengraph.png',3,NULL,0,0,1),
	('2024-09-24 13:16:56','바닐라 JS로 리액트 만들기 - 1',2,'https://tunaspace.tistory.com/entry/바닐라-JS로-리액트-만들기-1','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Ftistory_admin%2Fstatic%2Fimages%2FopenGraph%2Fopengraph.png',3,NULL,0,0,1),
	('2024-09-23 11:55:19','SPA란?',0,'https://tunaspace.tistory.com/entry/SPA란','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fd0TiaW%2FbtsJIftdEP2%2F4oyi8Qp8XKmNApDdQCvpP0%2Fimg.png',3,NULL,0,0,1),
	('2024-09-01 06:04:50','TASKIFY Day-5 학습정리',0,'https://tunaspace.tistory.com/entry/TASKIFY-Day-학습정리','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcSmcvY%2FbtsJnGwsPa6%2FZFfRmwJMhO1RZsTRq3mUEK%2Fimg.gif',3,NULL,0,0,1),
	('2024-12-22 10:15:29','네이버 클라우드 플랫폼(Ncloud) 사용 후기',0,'https://asn6878.tistory.com/13','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fzmjo1%2FbtsLqzQ9Ovg%2FDXjqkrNmllwBqkxzKSPGJ1%2Fimg.png',4,NULL,0,0,1),
	('2024-12-11 13:23:29','부스트캠프 웹・모바일 9기 멤버십 과정 회고',0,'https://asn6878.tistory.com/12','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Frd4s6%2FbtsLd7tRHtG%2FzLdrkltHSjDkctSq1O9Rf1%2Fimg.png',4,NULL,0,0,1),
	('2024-09-22 23:00:51','자바스크립트의 구조와 실행 방식 (Ignition, TurboFan, EventLoop)',0,'https://asn6878.tistory.com/9','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F2wH52%2FbtsJIskiFgS%2FQlF4XqMVZsM8y51w67dxj1%2Fimg.png',4,NULL,0,0,1),
	('2024-08-15 17:37:32','부스트캠프 웹・모바일 9기 챌린지 과정 회고',0,'https://asn6878.tistory.com/8','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F5oZKx%2FbtsI2pi4Vdz%2FlK6ITtEr1foWfmEGGBBDW0%2Fimg.png',4,NULL,0,0,1),
	('2024-08-04 08:32:17','페어(짝) 프로그래밍에 대해서',0,'https://asn6878.tistory.com/7','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fo0I0n%2FbtsITiXYkG9%2FhpD50L7TcKlhU08D2jok4k%2Fimg.jpg',4,NULL,0,0,1),
	('2024-07-06 19:20:07','2024 네이버 부스트캠프 웹 · 모바일 2차 코딩테스트 후기',1,'https://asn6878.tistory.com/6','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FzvZIm%2FbtsIpvcWnzY%2FnkR2JuxsNhKIyeeKHnMo1k%2Fimg.png',4,NULL,0,0,1),
	('2024-05-22 16:19:34','코딩테스트 준비를 위한 Java 입출력 정리',0,'https://asn6878.tistory.com/5','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FYY34s%2FbtsHykim0k7%2FT7YBZJfvIEKvPmtLbXJkIk%2Fimg.png',4,NULL,0,0,1),
	('2024-05-03 16:30:23','[Docker] 간단한 도커 명령어 모음집',2,'https://asn6878.tistory.com/4','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcI3y45%2FbtsHcIbDPUe%2FpWNfGE2V3YX35MauB1Hb60%2Fimg.gif',4,NULL,0,0,1),
	('2024-03-10 08:49:55','Java record 에 대하여',1,'https://asn6878.tistory.com/3','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FddtCkc%2FbtsFGEvHLSY%2FIPqWLZZfYlojZyLCB4dPg1%2Fimg.gif',4,NULL,0,0,1),
	('2024-01-04 11:37:46','인증(Authentication)과 인가(Authorization)의 개념에 대해',0,'https://asn6878.tistory.com/2','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fb4Psk9%2FbtsC00h6SuP%2FZp2x8yPLdLLheMrGqJeHG0%2Fimg.png',4,NULL,0,0,1),
	('2025-01-02 12:44:14','LeetCode - Set Matrix Zeroes',1,'https://tunaspace.tistory.com/entry/LeetCode-Set-Matrix-Zeroes','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Ftistory_admin%2Fstatic%2Fimages%2FopenGraph%2Fopengraph.png',3,NULL,0,0,1),
	('2025-01-02 12:37:25','LeetCode - Minimum Add to Make Parentheses Valid',1,'https://tunaspace.tistory.com/entry/LeetCode-Minimum-Add-to-Make-Parentheses-Valid','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Ftistory_admin%2Fstatic%2Fimages%2FopenGraph%2Fopengraph.png',3,NULL,0,0,1),
	('2025-01-04 13:35:45','HTML의 역사',6,'https://tunaspace.tistory.com/entry/HTML의-역사','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FBDgk9%2FbtsLDO7Er25%2Fd5tF9fS5KYWrkoJ8sKv4CK%2Fimg.png',3,NULL,0,0,1),
	('2025-01-07 14:18:34','리눅스 입문 with 우분투 1일차 정리 (운영체제, 리눅스 찍먹)',2,'https://seok3765.tistory.com/entry/TIL-%EB%A6%AC%EB%88%85%EC%8A%A4-%EC%9E%85%EB%AC%B8-with-%EC%9A%B0%EB%B6%84%ED%88%AC-1%EC%9D%BC%EC%B0%A8-%EC%A0%95%EB%A6%AC-%EC%9A%B4%EC%98%81%EC%B2%B4%EC%A0%9C-%EB%A6%AC%EB%88%85%EC%8A%A4','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbSgj4e%2FdJMcagTNRt6%2FAAAAAAAAAAAAAAAAAAAAAO3I9_vQN6DvyaDzPoQtPdlF9uxUmDENJh2pwt26-Es_%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D8m%252FnK03brxzvSVJGG89W5E8JNy4%253D',1,NULL,0,0,1),
	('2025-01-07 17:54:16','리눅스 입문 with 우분투 2일차 정리 (우분투 설치)',3,'https://seok3765.tistory.com/entry/TIL-%EB%A6%AC%EB%88%85%EC%8A%A4-%EC%9E%85%EB%AC%B8-with-%EC%9A%B0%EB%B6%84%ED%88%AC-2%EC%9D%BC%EC%B0%A8-%EC%A0%95%EB%A6%AC-%EC%9A%B0%EB%B6%84%ED%88%AC-%EC%84%A4%EC%B9%98','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbSgj4e%2FdJMcagTNRt6%2FAAAAAAAAAAAAAAAAAAAAAO3I9_vQN6DvyaDzPoQtPdlF9uxUmDENJh2pwt26-Es_%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D8m%252FnK03brxzvSVJGG89W5E8JNy4%253D',1,NULL,0,0,1),
	('2025-01-08 11:57:16','프론트엔드 단위 테스트 이해하기',4,'https://laurent.tistory.com/entry/프론트엔드-단위-테스트-이해하기','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbi6Ai4%2FbtsLHpmHc17%2FPPfyHuka096AmSwXchKK21%2Fimg.jpg',2,NULL,0,0,1),
	('2025-01-08 15:32:49','리눅스 입문 with 우분투 3일차 정리 (터미널과 셸)',1,'https://seok3765.tistory.com/entry/TIL-%EB%A6%AC%EB%88%85%EC%8A%A4-%EC%9E%85%EB%AC%B8-with-%EC%9A%B0%EB%B6%84%ED%88%AC-3%EC%9D%BC%EC%B0%A8-%EC%A0%95%EB%A6%AC-%ED%84%B0%EB%AF%B8%EB%84%90%EA%B3%BC-%EC%85%B8','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbSgj4e%2FdJMcagTNRt6%2FAAAAAAAAAAAAAAAAAAAAAO3I9_vQN6DvyaDzPoQtPdlF9uxUmDENJh2pwt26-Es_%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D8m%252FnK03brxzvSVJGG89W5E8JNy4%253D',1,NULL,0,0,1),
	('2025-01-11 06:28:52','[Network] OSI Model과 7 Layer 별 장비',1,'https://laurent.tistory.com/entry/Network-OSI-Model과-7-Layer-별-장비','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcnEMAv%2FbtsLJcn0jw1%2FZZZ3LXNzrEPCfFvvBCgN50%2Fimg.jpg',2,NULL,0,0,1),
	('2025-01-11 14:36:51','리눅스 입문 with 우분투 4일차 정리 (명령어, 파일, 디렉터리)',1,'https://seok3765.tistory.com/entry/TIL-%EB%A6%AC%EB%88%85%EC%8A%A4-%EC%9E%85%EB%AC%B8-with-%EC%9A%B0%EB%B6%84%ED%88%AC-4%EC%9D%BC%EC%B0%A8-%EC%A0%95%EB%A6%AC-%EB%AA%85%EB%A0%B9%EC%96%B4-%ED%8C%8C%EC%9D%BC-%EB%94%94%EB%A0%89%ED%84%B0%EB%A6%AC','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbSgj4e%2FdJMcagTNRt6%2FAAAAAAAAAAAAAAAAAAAAAO3I9_vQN6DvyaDzPoQtPdlF9uxUmDENJh2pwt26-Es_%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D8m%252FnK03brxzvSVJGG89W5E8JNy4%253D',1,NULL,0,0,1),
	('2025-01-11 17:09:40','코딩 자율학습 리눅스 입문 with 우분투',2,'https://seok3765.tistory.com/entry/%EC%84%9C%ED%8F%89-%EC%BD%94%EB%94%A9-%EC%9E%90%EC%9C%A8%ED%95%99%EC%8A%B5-%EB%A6%AC%EB%88%85%EC%8A%A4-%EC%9E%85%EB%AC%B8-with-%EC%9A%B0%EB%B6%84%ED%88%AC','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbqQl11%2FdJMcagGjPZX%2FAAAAAAAAAAAAAAAAAAAAAIncjcHbsXhvUpr4udxoM1ATeZXFMBoFZB49OcNEn7Em%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3DnXUtPUBfc0H%252Bpm0mXStuqrfOYZ0%253D',1,NULL,0,0,1),
	('2025-01-12 13:45:56','리눅스 입문 with 우분투 5일차 정리 (파일과 디렉터리, 링크)',3,'https://seok3765.tistory.com/entry/TIL-%EB%A6%AC%EB%88%85%EC%8A%A4-%EC%9E%85%EB%AC%B8-with-%EC%9A%B0%EB%B6%84%ED%88%AC-5%EC%9D%BC%EC%B0%A8-%EC%A0%95%EB%A6%AC-%ED%8C%8C%EC%9D%BC%EA%B3%BC-%EB%94%94%EB%A0%89%ED%84%B0%EB%A6%AC-%EB%A7%81%ED%81%AC','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbSgj4e%2FdJMcagTNRt6%2FAAAAAAAAAAAAAAAAAAAAAO3I9_vQN6DvyaDzPoQtPdlF9uxUmDENJh2pwt26-Es_%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D8m%252FnK03brxzvSVJGG89W5E8JNy4%253D',1,NULL,0,0,1),
	('2025-01-13 19:56:10','리눅스 입문 with 우분투 6일차 정리 (사용자, 그룹)',1,'https://seok3765.tistory.com/entry/TIL-%EB%A6%AC%EB%88%85%EC%8A%A4-%EC%9E%85%EB%AC%B8-with-%EC%9A%B0%EB%B6%84%ED%88%AC-6%EC%9D%BC%EC%B0%A8-%EC%A0%95%EB%A6%AC-%EC%82%AC%EC%9A%A9%EC%9E%90-%EA%B7%B8%EB%A3%B9','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbSgj4e%2FdJMcagTNRt6%2FAAAAAAAAAAAAAAAAAAAAAO3I9_vQN6DvyaDzPoQtPdlF9uxUmDENJh2pwt26-Es_%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D8m%252FnK03brxzvSVJGG89W5E8JNy4%253D',1,NULL,0,0,1),
	('2025-01-14 13:58:59','리눅스 입문 with 우분투 7일차 정리 (소유권, 권한)',1,'https://seok3765.tistory.com/entry/TIL-%EB%A6%AC%EB%88%85%EC%8A%A4-%EC%9E%85%EB%AC%B8-with-%EC%9A%B0%EB%B6%84%ED%88%AC-7%EC%9D%BC%EC%B0%A8-%EC%A0%95%EB%A6%AC-%EC%86%8C%EC%9C%A0%EA%B6%8C-%EA%B6%8C%ED%95%9C','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbSgj4e%2FdJMcagTNRt6%2FAAAAAAAAAAAAAAAAAAAAAO3I9_vQN6DvyaDzPoQtPdlF9uxUmDENJh2pwt26-Es_%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D8m%252FnK03brxzvSVJGG89W5E8JNy4%253D',1,NULL,0,0,1),
	('2025-01-15 16:12:24','[네트워크] 네크워크 기초',14,'https://tunaspace.tistory.com/entry/네트워크-네크워크-기초','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FdZuK6y%2FbtsLP4Vv2dw%2FoKp9rKYtYglrzkdzxBzrWk%2Fimg.png',3,'**네트워크의 모든 것: LAN부터 DHCP까지 완벽 정리! 🌐**\\n\\n네트워크의 기초부터 심화까지, 한 눈에 들어오는 완벽 가이드! 🚀
LAN, WAN, MAN의 차이점부터 시작해서 네트워크 토폴로지의 다양한 구조까지! OSI 7계층을 쉽게 이해하고, IPv4와 IPv6의 특징을 비교해보세요.
특히 놓치기 쉬운 IP 주소 클래스와 서브넷팅, DNS와 DHCP의 작동원리까지 상세하게 설명! 🎯
실무에서 바로 활용 가능한 네트워크 지식을 한 번에 마스터하세요! ✨
이론부터 실전까지, 네트워크 전문가로 거듭나기 위한 필수 지식이 모두 담겨있습니다! 💡',0,0,1),
	('2025-01-15 18:03:54','가상머신, 하이퍼바이저, 도커 전체 개념',7,'https://seok3765.tistory.com/entry/%EA%B0%80%EC%83%81%EB%A8%B8%EC%8B%A0-%ED%95%98%EC%9D%B4%ED%8D%BC%EB%B0%94%EC%9D%B4%EC%A0%80-%EB%8F%84%EC%BB%A4-%EC%A0%84%EC%B2%B4-%EA%B0%9C%EB%85%90','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FdtfmWo%2FdJMcaaTz8mq%2FAAAAAAAAAAAAAAAAAAAAAIRpSJUtn88IDnYxhOJPFupoqC8CECY5qKdJ6jPT0_cQ%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3DJInzhkjfVv6KHz2bs6xBg%252FKyc0g%253D',1,NULL,0,0,1),
	('2025-01-15 23:12:08','시나리오 구성 및 테스트 코드 작성',6,'https://laurent.tistory.com/entry/시나리오-구성-및-테스트-코드-작성','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FCGsNc%2FbtsLOXb7DRZ%2FAahZMI6epsYhKCYOLjnoHK%2Fimg.png',2,NULL,0,0,1),
	('2025-01-16 19:29:50','NestJS + TypeORM + Testcontainers 를 사용한 통합 테스트 DB환경 구축하기',4,'https://asn6878.tistory.com/14','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F2GhHh%2FbtsLPtpiK1d%2FtKiZjT4WEVz1sy4LIgFDn1%2Fimg.png',4,'**NestJS + TypeORM에서 Testcontainers로 MySQL 테스트 환경 구축하기 🐳**
테스트는 프로덕션과 동일한 환경에서 진행되어야 신뢰할 수 있습니다! sqlite나 H2 같은 경량 DB 대신 실제 MySQL과 동일한 환경을 Docker로 구축해봅시다.
구현 단계 📝

필요한 의존성 설치: testcontainers와 @testcontainers/mysql
Jest 설정 추가: globalSetup과 globalTeardown 구성
MySQL 컨테이너 생성 및 환경변수 설정
DB 초기화 로직 작성 (테스트 격리를 위한 TestService)
TypeORM 모듈에 환경변수 전달

주요 코드 💻

컨테이너 생성 및 환경변수 설정
테스트 간 DB 초기화를 위한 cleanDatabase() 메소드
Jest 설정 파일 커스터마이징

🤔 흥미로운 점: GitHub Actions에서 실행 시간이 sqlite + 병렬 실행보다 약 2배 느려졌지만, 실제 프로덕션 환경과 동일한 테스트가 가능해졌습니다!
테스트 안정성과 신뢰도를 높이고 싶은 NestJS 개발자라면 꼭 도입해볼 만한 구성입니다! 🚀',0,0,1),
	('2025-01-18 07:12:05','자바 vs 노드 당신의 선택은?!',5,'https://asn6878.tistory.com/15','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FdofQSP%2FbtsLKJyhso1%2FREdhKR9vDlzDYREytkK0v1%2Fimg.png',4,'**Node.js와 Spring 프레임워크 비교 분석: 개발자의 선택은? 🤔**
현재 TypeScript와 NestJS로 프로젝트를 진행 중인 개발자가 Java/Spring과 Node.js 생태계의 차이점을 깊이 있게 분석했습니다.
채용 시장 현황 📊

잡코리아: Node.js(340건) vs Spring(1,023건)
원티드: Node.js(141건) vs Spring(215건)

Java/Spring의 장점 ☕

압도적인 국내 커뮤니티와 레퍼런스
대규모 엔터프라이즈 개발에 강점
안정적인 서비스와 확립된 코드 작성 규칙
멀티스레드 환경에서 고성능 (비용은 많이 들지만 대규모 환경에서 높은 속도)

Node.js의 장점 🚀

FE와 BE 개발 환경 공유 가능
싱글스레드+비동기+논블로킹으로 적은 리소스에서 효율적
비교적 저비용으로 적절한 성능 구현
TypeScript 등으로 단점 극복 노력

결국 상황에 맞는 도구를 선택하는 문제 해결력이 중요하다는 개발자의 통찰력 있는 회고입니다! 💡',0,0,1),
	('2025-01-18 16:12:01','리눅스 입문 with 우분투 8일차 정리 (컴퓨터 작동 원리, 프로세스 생명 주기)',4,'https://seok3765.tistory.com/entry/TIL-%EB%A6%AC%EB%88%85%EC%8A%A4-%EC%9E%85%EB%AC%B8-with-%EC%9A%B0%EB%B6%84%ED%88%AC-8%EC%9D%BC%EC%B0%A8-%EC%A0%95%EB%A6%AC-%EC%BB%B4%ED%93%A8%ED%84%B0-%EC%9E%91%EB%8F%99-%EC%9B%90%EB%A6%AC-%ED%94%84%EB%A1%9C%EC%84%B8%EC%8A%A4-%EC%83%9D%EB%AA%85-%EC%A3%BC%EA%B8%B0','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbSgj4e%2FdJMcagTNRt6%2FAAAAAAAAAAAAAAAAAAAAAO3I9_vQN6DvyaDzPoQtPdlF9uxUmDENJh2pwt26-Es_%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D8m%252FnK03brxzvSVJGG89W5E8JNy4%253D',1,NULL,0,0,1),
	('2025-01-18 20:58:34','리눅스 입문 with 우분투 9일차 정리 (파일 디스크립터, 포어그라운드, 백그라운드, IPC)',2,'https://seok3765.tistory.com/entry/TIL-%EB%A6%AC%EB%88%85%EC%8A%A4-%EC%9E%85%EB%AC%B8-with-%EC%9A%B0%EB%B6%84%ED%88%AC-9%EC%9D%BC%EC%B0%A8-%EC%A0%95%EB%A6%AC-%ED%8C%8C%EC%9D%BC-%EB%94%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%84%B0-%ED%8F%AC%EC%96%B4%EA%B7%B8%EB%9D%BC%EC%9A%B4%EB%93%9C-%EB%B0%B1%EA%B7%B8%EB%9D%BC%EC%9A%B4%EB%93%9C-IPC','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbSgj4e%2FdJMcagTNRt6%2FAAAAAAAAAAAAAAAAAAAAAO3I9_vQN6DvyaDzPoQtPdlF9uxUmDENJh2pwt26-Es_%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D8m%252FnK03brxzvSVJGG89W5E8JNy4%253D',1,NULL,0,0,1),
	('2025-01-19 04:05:51','테스트 커버리지가 제대로 인식되지 않는 현상 해결',3,'https://laurent.tistory.com/entry/테스트-커버리지가-제대로-인식되지-않는-현상-해결','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbDOJJC%2FbtsLTHlFiOc%2FAUsjbbbcIRZ5r8CQZX6wJK%2Fimg.jpg',2,NULL,0,0,1),
	('2025-01-19 14:28:55','리눅스 입문 with 우분투 10일차 정리 (시그널)',3,'https://seok3765.tistory.com/entry/TIL-%EB%A6%AC%EB%88%85%EC%8A%A4-%EC%9E%85%EB%AC%B8-with-%EC%9A%B0%EB%B6%84%ED%88%AC-10%EC%9D%BC%EC%B0%A8-%EC%A0%95%EB%A6%AC-%EC%8B%9C%EA%B7%B8%EB%84%90','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbSgj4e%2FdJMcagTNRt6%2FAAAAAAAAAAAAAAAAAAAAAO3I9_vQN6DvyaDzPoQtPdlF9uxUmDENJh2pwt26-Es_%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D8m%252FnK03brxzvSVJGG89W5E8JNy4%253D',1,NULL,0,0,1),
	('2025-01-20 08:51:03','리눅스 입문 with 우분투 11일차 정리 (변수, 분기)',5,'https://seok3765.tistory.com/entry/TIL-%EB%A6%AC%EB%88%85%EC%8A%A4-%EC%9E%85%EB%AC%B8-with-%EC%9A%B0%EB%B6%84%ED%88%AC-11%EC%9D%BC%EC%B0%A8-%EC%A0%95%EB%A6%AC-%EB%B3%80%EC%88%98-%EB%B6%84%EA%B8%B0','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbSgj4e%2FdJMcagTNRt6%2FAAAAAAAAAAAAAAAAAAAAAO3I9_vQN6DvyaDzPoQtPdlF9uxUmDENJh2pwt26-Es_%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D8m%252FnK03brxzvSVJGG89W5E8JNy4%253D',1,'**리눅스 입문 with 우분투: Bash 스크립트 기초 학습기 🐧**\\n\\n리눅스의 Bash 스크립트 학습 내용을 정리한 포스팅입니다! Bash 스크립트가 일반 프로그래밍 언어와 유사하면서도 독특한 특징들을 가지고 있음을 배웠습니다. 특히 변수 할당 시 띄어쓰기가 없어야 하고, 모든 데이터를 문자열로 처리한다는 점이 흥미롭습니다. 🖥️\\n\\n학습 내용:\\n- 변수 정의와 할당 방법 (변수_이름=값)\\n- 산술 연산을 위한 let과 expr 명령어 사용법\\n- 조건문과 if-then-else 구문 작성 방법\\n- 싱글 브래킷([])과 더블 브래킷([[]])의 차이점\\n- 이중 괄호 표현식 (())의 활용\\n\\n프로그래밍 경험이 있는 분들도 쿼팅이나 띄어쓰기 규칙에 당황할 수 있지만, 계속 사용하면 익숙해질 내용입니다! 😊',0,0,1),
	('2025-01-23 14:05:15','[네트워크] 네트워크 프로토콜',6,'https://tunaspace.tistory.com/entry/네트워크-네트워크-프로토콜','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbFVaFI%2FbtsLZjk0BLm%2FaQtpldpA8tMOre7gbZAZS1%2Fimg.png',3,'**TCP와 UDP: 네트워크 프로토콜의 완벽 가이드 🌐**\\n\\nTCP와 UDP의 세계로 떠나는 흥미진진한 여행! 🚀

데이터는 어떻게 안전하게 전달될까요? TCP의 3-Way Handshake부터 흐름제어, 오류제어까지 모든 것을 상세히 알아봅니다. 특히 재미있는 Sliding Window 방식으로 데이터가 마치 컨베이어 벨트처럼 움직이는 과정을 생생하게 설명합니다.

혼잡제어의 다양한 전략들과 함께, UDP의 속도 중심 접근방식까지! 네트워크 프로토콜의 A to Z를 쉽고 재미있게 배워보세요. 🎯

마지막으로 IPv4 헤더 구조까지 꼼꼼하게 살펴보는 완벽 가이드! 네트워크 기초 지식을 탄탄하게 다지고 싶은 분들에게 강력 추천합니다! ✨',0,0,1),
	('2025-01-23 20:07:31','이미지, Dockerfile 작성법, 컨테이너',4,'https://seok3765.tistory.com/entry/%EC%9D%B4%EB%AF%B8%EC%A7%80-Dockerfile-%EC%9E%91%EC%84%B1%EB%B2%95-%EC%BB%A8%ED%85%8C%EC%9D%B4%EB%84%88-%EB%AA%85%EB%A0%B9%EC%96%B4','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbucEee%2FdJMcaf8mroK%2FAAAAAAAAAAAAAAAAAAAAACKRayE2k8yApD8KtCtyfP3xn1xdS1HBxLzyJpmvwEFm%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3DFSLAaio4FS5Df%252FsAUm6VnrhQ9bQ%253D',1,NULL,0,0,1),
	('2025-01-24 12:50:59','Test Double과 객체 - Dummy, Fake, Stub, Mock, Spy',5,'https://laurent.tistory.com/entry/Test-Double과-객체-Dummy-Fake-Stub-Mock-Spy','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbanQfy%2FbtsL1VLng9A%2FTvirKYQmvtg6JipxTCRO2k%2Fimg.jpg',2,NULL,0,0,1),
	('2025-01-25 00:42:56','Websocket 과 Socket.io에 대하여',3,'https://asn6878.tistory.com/16','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F2vaZi%2FbtsL1DqLqdO%2FICZJ4l46xEpPOu9othgPLk%2Fimg.png',4,NULL,0,0,1),
	('2025-01-25 14:59:51','[JavaScript] 스코프(scope)란',2,'https://laurent.tistory.com/entry/JavaScript-스코프scope란','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbf9EXk%2FbtsL1gwtWfs%2FSqqf1OKYJVroj20ZpLi7m0%2Fimg.jpg',2,NULL,0,0,1),
	('2025-01-25 17:02:12','리눅스 입문 with 우분투 12일차 정리 (테스트 연산자, case)',0,'https://seok3765.tistory.com/entry/TIL-%EB%A6%AC%EB%88%85%EC%8A%A4-%EC%9E%85%EB%AC%B8-with-%EC%9A%B0%EB%B6%84%ED%88%AC-12%EC%9D%BC%EC%B0%A8-%EC%A0%95%EB%A6%AC-%ED%85%8C%EC%8A%A4%ED%8A%B8-%EC%97%B0%EC%82%B0%EC%9E%90-case','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbSgj4e%2FdJMcagTNRt6%2FAAAAAAAAAAAAAAAAAAAAAO3I9_vQN6DvyaDzPoQtPdlF9uxUmDENJh2pwt26-Es_%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D8m%252FnK03brxzvSVJGG89W5E8JNy4%253D',1,NULL,0,0,1),
	('2025-01-26 09:38:57','리눅스 입문 with 우분투 13일차 정리 (반복문, 함수)',0,'https://seok3765.tistory.com/entry/TIL-%EB%A6%AC%EB%88%85%EC%8A%A4-%EC%9E%85%EB%AC%B8-with-%EC%9A%B0%EB%B6%84%ED%88%AC-13%EC%9D%BC%EC%B0%A8-%EC%A0%95%EB%A6%AC-%EB%B0%98%EB%B3%B5%EB%AC%B8-%ED%95%A8%EC%88%98','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbSgj4e%2FdJMcagTNRt6%2FAAAAAAAAAAAAAAAAAAAAAO3I9_vQN6DvyaDzPoQtPdlF9uxUmDENJh2pwt26-Es_%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D8m%252FnK03brxzvSVJGG89W5E8JNy4%253D',1,NULL,0,0,1),
	('2025-01-26 10:43:28','[JavaScript] 스코프 체인 (scope chain)',1,'https://laurent.tistory.com/entry/JavaScript-스코프-체인-scope-chain','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcnBQ9r%2FbtsL1elcQcR%2F0kR3PD3wiCj8M6QJG7JR51%2Fimg.jpg',2,NULL,0,0,1),
	('2025-01-26 12:02:16','리눅스 입문 with 우분투 14일차 정리 (변수 심화, 배열, 쿼팅)',1,'https://seok3765.tistory.com/entry/TIL-%EB%A6%AC%EB%88%85%EC%8A%A4-%EC%9E%85%EB%AC%B8-with-%EC%9A%B0%EB%B6%84%ED%88%AC-14%EC%9D%BC%EC%B0%A8-%EC%A0%95%EB%A6%AC-%EB%B3%80%EC%88%98-%EC%8B%AC%ED%99%94-%EB%B0%B0%EC%97%B4-%EC%BF%BC%ED%8C%85','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbSgj4e%2FdJMcagTNRt6%2FAAAAAAAAAAAAAAAAAAAAAO3I9_vQN6DvyaDzPoQtPdlF9uxUmDENJh2pwt26-Es_%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D8m%252FnK03brxzvSVJGG89W5E8JNy4%253D',1,NULL,0,0,1),
	('2025-01-26 15:18:34','리눅스 입문 with 우분투 15일차 정리 (확장)',1,'https://seok3765.tistory.com/entry/TIL-%EB%A6%AC%EB%88%85%EC%8A%A4-%EC%9E%85%EB%AC%B8-with-%EC%9A%B0%EB%B6%84%ED%88%AC-15%EC%9D%BC%EC%B0%A8-%EC%A0%95%EB%A6%AC-%ED%99%95%EC%9E%A5','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbSgj4e%2FdJMcagTNRt6%2FAAAAAAAAAAAAAAAAAAAAAO3I9_vQN6DvyaDzPoQtPdlF9uxUmDENJh2pwt26-Es_%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D8m%252FnK03brxzvSVJGG89W5E8JNy4%253D',1,NULL,0,0,1),
	('2025-01-27 04:54:04','[백준 27111] 출입 기록 (python)',2,'https://laurent.tistory.com/entry/백준-27111-출입-기록-python','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FuJ12j%2FbtsL2yijfvl%2F7lLocDMkx64AzZvRhliom0%2Fimg.jpg',2,NULL,0,0,1),
	('2025-01-27 04:56:06','[백준 11899] 괄호 끼워넣기 (python)',2,'https://laurent.tistory.com/entry/백준-11899-괄호-끼워넣기-python','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fm0M9N%2FbtsL2TzKavY%2FMjp6e2CAmvLykD7AzfVDKk%2Fimg.jpg',2,NULL,0,0,1),
	('2025-01-27 04:55:31','[백준 17827] 달팽이 리스트 (python)',3,'https://laurent.tistory.com/entry/백준-17827-달팽이-리스트-python','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbeCCeX%2FbtsL22Dzo5U%2F1O4AkyoRyMzIfKgNR2qqS1%2Fimg.jpg',2,NULL,0,0,1),
	('2025-01-27 11:29:14','2025년 1월 회고, 신년 계획',10,'https://laurent.tistory.com/entry/2025년-1월-회고-신년-계획','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FnME4B%2FbtsL3izqKXD%2F7gYVnRUYtwYexQ7LNNgMX0%2Fimg.jpg',2,NULL,0,0,1),
	('2025-01-27 15:41:21','리눅스 입문 with 우분투 16일차 정리 (셸 옵션)',2,'https://seok3765.tistory.com/entry/TIL-%EB%A6%AC%EB%88%85%EC%8A%A4-%EC%9E%85%EB%AC%B8-with-%EC%9A%B0%EB%B6%84%ED%88%AC-16%EC%9D%BC%EC%B0%A8-%EC%A0%95%EB%A6%AC-%EC%85%B8-%EC%98%B5%EC%85%98','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbSgj4e%2FdJMcagTNRt6%2FAAAAAAAAAAAAAAAAAAAAAO3I9_vQN6DvyaDzPoQtPdlF9uxUmDENJh2pwt26-Es_%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D8m%252FnK03brxzvSVJGG89W5E8JNy4%253D',1,NULL,0,0,1),
	('2025-01-28 05:33:11','[React] Uncontrolled component, Controlled component',6,'https://laurent.tistory.com/entry/React-Uncontrolled-component-Controlled-component','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fcydjng%2FbtsL3jSMGNp%2FgteGveTk5lWggxQp92A8r0%2Fimg.jpg',2,NULL,0,0,1),
	('2025-01-28 17:31:16','리눅스 입문 with 우분투 17일차 정리 (리디렉션, 파이프라인)',3,'https://seok3765.tistory.com/entry/TIL-%EB%A6%AC%EB%88%85%EC%8A%A4-%EC%9E%85%EB%AC%B8-with-%EC%9A%B0%EB%B6%84%ED%88%AC-17%EC%9D%BC%EC%B0%A8-%EC%A0%95%EB%A6%AC-%EB%A6%AC%EB%94%94%EB%A0%89%EC%85%98-%ED%8C%8C%EC%9D%B4%ED%94%84%EB%9D%BC%EC%9D%B8','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbSgj4e%2FdJMcagTNRt6%2FAAAAAAAAAAAAAAAAAAAAAO3I9_vQN6DvyaDzPoQtPdlF9uxUmDENJh2pwt26-Es_%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D8m%252FnK03brxzvSVJGG89W5E8JNy4%253D',1,NULL,0,0,1),
	('2025-01-29 09:50:39','[React] React의 이벤트 시스템 이해하기',1,'https://laurent.tistory.com/entry/React-React의-이벤트-시스템-이해하기','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F4aWTr%2FbtsL1DrSG0n%2FG1v7KEkLxzVZfvcjrpUrk0%2Fimg.jpg',2,NULL,0,0,1),
	('2025-01-29 15:16:40','리눅스 입문 with 우분투 18일차 정리 (패키지 관리 시스템, systemd, .bashrc)',4,'https://seok3765.tistory.com/entry/TIL-%EB%A6%AC%EB%88%85%EC%8A%A4-%EC%9E%85%EB%AC%B8-with-%EC%9A%B0%EB%B6%84%ED%88%AC-18%EC%9D%BC%EC%B0%A8-%EC%A0%95%EB%A6%AC-%ED%8C%A8%ED%82%A4%EC%A7%80-%EA%B4%80%EB%A6%AC-%EC%8B%9C%EC%8A%A4%ED%85%9C-systemd-bashrc','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbSgj4e%2FdJMcagTNRt6%2FAAAAAAAAAAAAAAAAAAAAAO3I9_vQN6DvyaDzPoQtPdlF9uxUmDENJh2pwt26-Es_%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D8m%252FnK03brxzvSVJGG89W5E8JNy4%253D',1,NULL,0,0,1),
	('2025-01-30 09:51:13','리눅스 입문 with 우분투 19일차 정리 (필수 커멘드라인 툴 1)',5,'https://seok3765.tistory.com/entry/TIL-%EB%A6%AC%EB%88%85%EC%8A%A4-%EC%9E%85%EB%AC%B8-with-%EC%9A%B0%EB%B6%84%ED%88%AC-19%EC%9D%BC%EC%B0%A8-%EC%A0%95%EB%A6%AC-%ED%95%84%EC%88%98-%EC%BB%A4%EB%A7%A8%EB%93%9C%EB%9D%BC%EC%9D%B8-%ED%88%B4-1','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbSgj4e%2FdJMcagTNRt6%2FAAAAAAAAAAAAAAAAAAAAAO3I9_vQN6DvyaDzPoQtPdlF9uxUmDENJh2pwt26-Es_%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D8m%252FnK03brxzvSVJGG89W5E8JNy4%253D',1,'**리눅스 필수 커맨드라인 툴 완벽 정리! 🐧**\\n\\n리눅스의 핵심 커맨드라인 도구들을 한 번에 마스터하세요! 📚

grep으로 문자열 검색하기
find로 파일/디렉터리 찾기
stat으로 파일 상세 정보 확인하기
wc로 텍스트 파일 분석하기
df로 디스크 용량 체크하기

실무에서 자주 사용되는 리눅스 커맨드라인 도구들의 사용법과 실습 예제를 통해 리눅스 관리의 핵심을 배워보세요! 🚀 시스템 관리자로 가는 첫걸음이 여기 있습니다! ✨',0,0,1),
	('2025-01-30 10:43:00','[JavaScript] 함수 레벨 스코프와 블록 레벨 스코프',8,'https://laurent.tistory.com/entry/JavaScript-함수-레벨-스코프와-블록-레벨-스코프','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fd4WD2k%2FbtsL18ZtG4g%2Fx0QFb7Ccaksm1LKketTeR0%2Fimg.jpg',2,'**함수 레벨 스코프 vs 블록 레벨 스코프: var와 let/const의 결정적 차이! 🎯**\\n\\n변수 선언시 흔히 발생하는 스코프 관련 실수를 피하는 방법을 알아봅시다! var가 가진 특별한(?) 성질 때문에 발생할 수 있는 문제점과 그 해결책까지 🔍
핵심 포인트:

var는 함수 레벨 스코프만 인정 (if문, for문의 중괄호는 무시!)
다른 언어들은 모든 중괄호를 스코프로 인정하는 블록 레벨 스코프 채택
ES6의 let과 const로 이러한 문제 해결 가능 ✨

실제 코드 예제와 함께 var를 사용할 때 주의해야 할 점을 완벽하게 설명합니다! 💡',0,0,1),
	('2025-01-30 11:49:02','리눅스 입문 with 우분투 20일차 정리 (필수 커맨드라인 툴 2)',4,'https://seok3765.tistory.com/entry/TIL-%EB%A6%AC%EB%88%85%EC%8A%A4-%EC%9E%85%EB%AC%B8-with-%EC%9A%B0%EB%B6%84%ED%88%AC-20%EC%9D%BC%EC%B0%A8-%EC%A0%95%EB%A6%AC-%ED%95%84%EC%88%98-%EC%BB%A4%EB%A7%A8%EB%93%9C%EB%9D%BC%EC%9D%B8-%ED%88%B4-2','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbSgj4e%2FdJMcagTNRt6%2FAAAAAAAAAAAAAAAAAAAAAO3I9_vQN6DvyaDzPoQtPdlF9uxUmDENJh2pwt26-Es_%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D8m%252FnK03brxzvSVJGG89W5E8JNy4%253D',1,'**리눅스 명령어 마스터하기: du부터 tr까지! 🐧**\\n\\n리눅스의 핵심 명령어들을 깊이있게 파헤쳐봅니다! 디스크 사용량을 확인하는 du, 파일을 묶고 압축하는 tar의 진짜 의미, 그리고 숨은 꿀팁까지! 💡
특히 재미있는 부분은:

아카이브와 압축의 차이점 (약 7배의 용량 차이가 난다고?!)
read 명령어로 입력값을 받을 때의 꿀팁 (REPLY 변수의 비밀)
문자열 변환의 마법사 tr 명령어 완벽 가이드 ✨

20일간의 리눅스 여정 마지막 날, 현업에서 꼭 필요한 실용적인 명령어들을 총정리했습니다. 윈도우처럼 익숙해지는 방법도 함께! 🚀',0,0,1),
	('2025-01-31 10:35:57','코딩 자율 학습단 12기 리눅스 과정을 마치다.',5,'https://seok3765.tistory.com/entry/%EC%BD%94%EB%94%A9-%EC%9E%90%EC%9C%A8-%ED%95%99%EC%8A%B5%EB%8B%A8-12%EA%B8%B0-%EB%A6%AC%EB%88%85%EC%8A%A4-%EA%B3%BC%EC%A0%95%EC%9D%84-%EB%A7%88%EC%B9%98%EB%8B%A4','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FqXZBr%2FdJMcag0ufoz%2FAAAAAAAAAAAAAAAAAAAAALmbDxR8P0OUyhCrGuFz86owYpSp8oOeQTjSN_Iecfun%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3DG5jJJyZ9jKuKtYopQTX9vc169sE%253D',1,'**📚 길벗 코딩 자율 학습단 12기 리눅스 학습 후기**\\n\\n부스트캠프 수료 후에도 멈추지 않는 성장 스토리! 🌱\\n\\n💡 주요 내용:\\n- 리눅스 입문 with 우분투 도서 완독 도전기\\n- 1일 1활동 일지로 기록하는 학습 과정\\n- 실무에서 부족했던 리눅스/클라우드 역량 강화\\n- 입문자도 부담 없이 참여 가능한 4주 커리큘럼\\n\\n개발자의 필수 역량인 리눅스, 어떻게 시작해야 할지 고민이라면 이 글을 주목하세요! 🎯',0,0,1),
	('2025-02-01 02:08:34','[JavaScript] 이벤트 루프(Event Loop)와 비동기 통신',10,'https://laurent.tistory.com/entry/JavaScript-이벤트-루프Event-Loop와-비동기-통신','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FoddAw%2FbtsL3f5kEMY%2FQ8vfiTxnUiztyLyhW6gSlK%2Fimg.jpg',2,'**🔄 자바스크립트의 이벤트 루프와 비동기 처리의 모든 것!**\\n\\n싱글 스레드 언어인 자바스크립트가 어떻게 여러 작업을 동시에 처리할 수 있을까요? 🤔
이벤트 루프의 동작 원리부터 태스크 큐, 마이크로태스크 큐까지! 자바스크립트의 비동기 처리 메커니즘을 상세히 알아봅니다.
✨ 핵심 내용:

Web API와 비동기 처리의 관계
콜백과 프로미스의 실행 순서 차이
실제 코드로 보는 이벤트 루프의 동작

프론트엔드 개발자라면 반드시 알아야 할 자바스크립트의 핵심 개념, 지금 바로 확인하세요! 💡',0,0,1),
	('2025-02-01 13:10:13','코딩 자율 학습 자바 입문',11,'https://seok3765.tistory.com/entry/%EC%BD%94%EB%94%A9-%EC%9E%90%EC%9C%A8-%ED%95%99%EC%8A%B5-%EC%9E%90%EB%B0%94-%EC%9E%85%EB%AC%B8','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FBtPPg%2FdJMcacw6oZU%2FAAAAAAAAAAAAAAAAAAAAAO6jZYSGluqpqAHPWqExE6R917JcElW-Nz19aH3GqrJB%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D%252BzMJdQx0JZUUpl4ydzfp%252BPrbHRg%253D',1,'**📚 개발자의 자바 입문기: 코딩 자율학습 자바 입문 리뷰 및 학습 후기 ✨**\\n\\n초보 개발자의 눈으로 바라본 \'코딩 자율학습 자바 입문\' 도서 리뷰! 🎯
왜 자바로 시작하는게 좋을까? 🤔
Eclipse가 아닌 IntelliJ로 시작하는 신선한 접근,
컨벤션부터 제대로 배우는 실무 감각까지!
✅ 책의 특별한 점:

풍부한 그림 설명으로 쉽게 이해하는 메모리 구조
매 챕터 퀴즈와 셀프 체크로 완벽한 복습
현업에서 바로 쓸 수 있는 코딩 컨벤션 가이드

자바 입문자라면 놓치면 안 될 완벽 입문서! 👊',0,0,1),
	('2025-02-02 02:56:47','[JavaScript] V8 엔진',14,'https://laurent.tistory.com/entry/JavaScript-V8-엔진','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FSoO2B%2FbtsL4Kb8JXT%2FOGiI7YKfpBXop2fvpKtgkK%2Fimg.jpg',2,'**자바스크립트 V8 엔진의 진화와 웹 생태계의 혁신 🚀**\\n\\nV8 엔진의 탄생부터 현재까지의 여정을 흥미진진하게 살펴봅니다!



2008년, 구글의 게임체인저 V8 엔진 등장 💪

브라우저 전쟁이 가져온 혁신적인 변화들

Node.js를 통한 서버 사이드로의 확장 🌐

Ignition & TurboFan의 강력한 성능 최적화 기술

메모리 관리와 가비지 컬렉션의 비밀 🔍



자바스크립트가 어떻게 \'단순한 스크립트 언어\'에서 \'현대 웹의 핵심 언어\'로 성장했는지, 그 기술적 혁신의 이면을 만나보세요!',0,0,1),
	('2025-02-04 12:42:58','[Network] HTTP와 HTTPS',12,'https://laurent.tistory.com/entry/Network-HTTP와-HTTPS','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FdiOdrN%2FbtsL7vTmSKe%2FX99clb6KkFkJeO2mKoZoL1%2Fimg.jpg',2,'**HTTP vs HTTPS: 웹 보안의 기초와 현대적 변화**\\n\\n현대 웹 세계에서 필수가 된 HTTPS의 모든 것을 파헤쳐봅니다. HTTP의 치명적인 보안 취약점부터 HTTPS의 암호화 메커니즘, TLS 핸드셰이크의 작동 방식까지 상세히 설명합니다.

주요 내용:



HTTP의 보안 취약점과 중간자 공격의 위험성

SSL/TLS 인증서의 역할과 신뢰성 확보 방식

대칭키/비대칭키 암호화의 이해

HTTPS 도입의 장단점과 성능 영향

Let\'s Encrypt를 통한 무료 인증서 발급



보안과 성능, SEO까지 고려해야 하는 현대 웹 개발자라면 꼭 알아야 할 HTTPS의 핵심 내용을 총망라했습니다.',0,0,1),
	('2025-02-05 13:45:33','LeetCode - Convert Date to Binary',5,'https://tunaspace.tistory.com/entry/LeetCode-Convert-Date-to-Binary','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FR2QeE%2FbtsL7RiDayY%2FfmEFPP2zPj0weM6zWHcBe0%2Fimg.png',3,'**날짜 형식 문자열을 2진수로 변환하는 알고리즘 풀이**\\n\\n10진수 날짜 형식(yyyy-mm-dd)을 2진수로 변환하는 흥미로운 알고리즘 문제를 소개합니다. 스택을 활용한 효율적인 JavaScript 구현 방법과 함께, 시간복잡도 O(log N)의 최적화된 해결책을 상세히 설명합니다. 실제 코딩 테스트에서 자주 등장하는 진법 변환의 핵심 개념을 배울 수 있는 좋은 예제입니다.',0,0,1),
	('2025-02-07 18:26:35','볼륨 (Volume)',11,'https://seok3765.tistory.com/entry/%EB%B3%BC%EB%A5%A8-Volume','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FsFSGq%2FdJMcad3MRgY%2FAAAAAAAAAAAAAAAAAAAAAFNDpiaZsLube2IRZcGRxNNHNgPvOrERCGHy2v6dvjgG%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3DLFBtUzy3PmznzFZrjF36VPwNEpc%253D',1,'**도커 볼륨(Docker Volume)의 모든 것 - 컨테이너 데이터 영속성 완벽 가이드**  

도커 컨테이너는 재시작하면 모든 데이터가 \'태초마을\'로 돌아가버린다는 사실, 알고 계셨나요? 🤔

이 포스트에서는:



컨테이너 데이터를 영구적으로 저장하는 볼륨의 개념

3가지 볼륨 생성 방식과 2가지 연결 방식의 실전 활용법

MySQL, Redis와 같은 데이터베이스의 자동 볼륨 생성 원리

볼륨을 통한 컨테이너 간 데이터 공유 방법

다른 개발자와의 볼륨 공유 및 내보내기/가져오기 기능



까지 상세히 다루며, 실제 프로젝트에서 겪은 문제 해결 경험을 바탕으로 설명합니다. 도커를 사용하는 개발자라면 반드시 알아야 할 볼륨 활용법을 놓치지 마세요! 📚',0,0,1),
	('2025-02-08 03:50:16','Blocking, Non-Blocking/ Sync, Async 차이점',16,'https://tunaspace.tistory.com/entry/Blocking-Non-Blocking-Sync-Async-차이점','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbT3EwW%2FbtsMb2DQ0JJ%2FEvfm0lmARdUXnp77GjdOmK%2Fimg.gif',3,'**개발자를 위한 핵심 비동기 프로그래밍 가이드**\\n\\n모의면접에서 좌절했던 경험을 바탕으로, 블로킹/논블로킹과 동기/비동기의 개념을 쉽게 풀어낸 심층 해설입니다. 📘\\n\\n주요 포인트:\\n- Blocking과 Non-Blocking은 제어권의 문제\\n- Sync와 Async는 결과 처리 방식의 차이\\n- 실무에서 가장 효율적인 조합은 2가지\\n  1. 동기 + 블로킹\\n  2. 비동기 + 논블로킹 (Node.js 표준 방식)\\n\\n개발자의 코드 품질을 높이고 싶다면 꼭 읽어보세요! 🚀',0,0,1),
	('2025-02-08 07:42:52','Terraform으로 NCP(Naver Cloud Platform) 관리하기',22,'https://asn6878.tistory.com/17','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fc8HWbe%2FbtsMbIMjswJ%2FwGUFYgT02yi0bfcTm6Ksek%2Fimg.png',4,'**테라폼으로 NCP 인프라 관리하기: IaC의 첫걸음**\\n\\nHashiCorp의 테라폼(Terraform)을 활용해 NCP(Naver Cloud Platform) 인프라를 코드로 관리하는 방법을 자세히 알아봅니다. VPC 생성부터 서브넷 구성까지, 실제 적용 사례와 함께 테라폼의 기본 개념과 사용법을 단계별로 살펴봅니다.

특히 주목할 만한 내용:



테라폼의 Provider 구조와 NCP와의 연동 방식

실전 VPC 구축 예제 코드와 상세 설명

민감한 인증 정보 관리 방법

terraform init, plan, apply 등 핵심 명령어 활용법



인프라를 코드로 관리하고 싶은 개발자라면 꼭 읽어봐야 할 내용입니다.',0,0,1),
	('2025-02-13 13:20:39','네트워크 (Bridge, Host, None, Overlay, Ipvlan, Macvlan) 1편',13,'https://seok3765.tistory.com/entry/%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC-Bridge-Host-None-Overlay-Ipvlan-Macvlan-1%ED%8E%B8','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FsFSGq%2FdJMcad3MRgY%2FAAAAAAAAAAAAAAAAAAAAAFNDpiaZsLube2IRZcGRxNNHNgPvOrERCGHy2v6dvjgG%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3DLFBtUzy3PmznzFZrjF36VPwNEpc%253D',1,'**Docker 네트워크 드라이버의 모든 것: 6가지 방식 완벽 분석**

도커의 네트워크 드라이버는 Bridge, Host, None, Overlay, Ipvlan, Macvlan 등 6가지 방식으로 구성됩니다. 각 드라이버는 고유한 특성과 통신 방식을 가지고 있어 프로젝트 환경에 따라 적절한 네트워크 모드를 선택해야 합니다. 특히 성능과 격리, 통신 방식에 따라 드라이버를 다르게 적용할 수 있으며, 기본 드라이버인 Bridge 모드부터 고급 설정인 Overlay, Ipvlan까지 상세히 알아보겠습니다.',0,0,1),
	('2025-02-14 00:02:58','외래키 제약조건, 필수 입니까? (feat. 인덱스)',14,'https://asn6878.tistory.com/18','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FyKOex%2FbtsLBsJzJJr%2FCwE8Byo9A1XedcyYkbAdh1%2Fimg.jpg',4,'**데이터베이스의 외래키 제약조건, 사용할까 말까?**

데이터베이스에서 외래키 제약조건의 장단점을 깊이 있게 탐구하는 글입니다. 대용량 데이터 처리 시 성능, 데이터 무결성 유지, 조인 시 인덱스 영향 등 실제 테스트 결과를 바탕으로 외래키 제약조건의 사용 여부를 꼼꼼히 분석합니다. 단순히 기술적 설명을 넘어 실무에서 고려해야 할 중요한 포인트들을 제시하며, 개발자가 명확한 근거를 가지고 의사결정할 수 있도록 도와줍니다.',0,0,1),
	('2025-02-20 20:02:03','브라우저 동작 방식',14,'https://tunaspace.tistory.com/entry/브라우저-동작-방식','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FVzmOW%2FbtsMp8YdfaH%2F43U9N8KnmyeLvFZd8HkEAK%2Fimg.png',3,'**브라우저 렌더링 과정 완벽 분석! 🌐**\\n\\n면접관도 감탄할 브라우저의 8단계 동작 방식을 상세히 알아보았습니다! 네트워크 요청부터 JavaScript 실행까지, 브라우저가 웹 페이지를 그려내는 모든 과정을 깊이있게 다룹니다. 🚀\\n\\n혹시 아셨나요? 브라우저는 단순히 HTML, CSS, JavaScript 파일을 보여주는 도구가 아닙니다! 성능 최적화의 비밀이 숨어있는 렌더링 파이프라인의 세계로 함께 떠나볼까요? 🎨✨\\n\\n프론트엔드 개발자라면 꼭 알아야 할 필수 지식을 한 눈에 정리했습니다. 면접 준비에도 완벽한 이 글, 지금 바로 확인해보세요! 💡',0,0,1),
	('2025-02-22 08:19:10','[Network] HTTP/0.9',13,'https://laurent.tistory.com/entry/Network-HTTP09','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F7fH5a%2FbtsMt7dfp0P%2FRpvbmrzsSrGXmqjJBvkHKk%2Fimg.jpg',2,'**🌐 HTTP의 역사: 0.9 버전부터 시작된 웹 통신의 진화** HTTP/0.9는 웹 통신의 첫 걸음을 내딛은 초기 프로토콜입니다! 🚀 당시에는 단순히 HTML 문서를 주고받는 기능만 있었지만, 이후 급격히 발전하여 현대의 복잡한 웹 통신 시스템의 기반을 마련했습니다. 주요 특징: - 🔍 초기에는 텍스트 기반 웹 페이지 요청/응답만 가능 - 📬 검색 기능은 \'isindex\' 태그를 통해 구현 - 🔗 현대 HTTP의 기본 구조(메서드, 헤더, 바디, 상태 코드) 마련 이 버전은 웹의 시작점으로, 현재 우리가 사용하는 인터넷 통신 프로토콜의 씨앗이 되었습니다! 📡🌱',0,0,1),
	('2025-03-02 14:59:20','부스트캠프 리팩토링 기간 회고',15,'https://laurent.tistory.com/entry/부스트캠프-리팩토링-기간-회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FB7Gfh%2FbtsMArwfivD%2FkuUdGX2VlCmVKOkHEgfGs1%2Fimg.png',2,'**네이버 부스트캠프 9기 수료 후 리팩토링 주간 경험기 🚀**

6월부터 12월까지 진행된 네이버 부스트캠프 9기를 성공적으로 마친 개발자의 솔직한 회고입니다. 이번에는 특별히 **CS 리팩토링(3주)과 AI 리팩토링(3주)** 기간을 통해 프로젝트를 더욱 발전시킬 수 있었어요.

## 📝 CS 리팩토링 기간의 핵심
- **테스트 코드 도입**: React Testing Library를 활용해 사용자 관점의 테스트 작성
- 반복적인 수동 테스트의 비효율성 해결
- 컴포넌트 설계의 문제점 발견 (책임 과다, 복잡한 의존성)
- 처음부터 테스트하기 쉬운 구조로 설계했어야 했다는 아쉬움 😅

## 🤖 AI 리팩토링 기간의 성과
- **블로그 게시글 태그 자동 분류 기능 구현**
- 여러 모델 비교 후 **Claude Haiku** 선택 (비용 효율성 + 성능)
- 사용자가 태그와 요약으로 빠르게 콘텐츠를 파악할 수 있도록 개선
- 개인화 추천 시스템으로 확장할 기반 마련

## 💭 핵심 인사이트
테스트 코드와 AI 기능 구현 과정에서 \'기술적 구현\'을 넘어 **서비스의 진정한 가치가 무엇인지** 깊이 있게 고민하게 되었습니다. 완벽한 기술보다 사용자에게 실질적인 가치를 제공하는 방향성이 더 중요하다는 것을 배웠어요!

부스트캠프 이후에도 팀과 함께 이 프로젝트를 계속 발전시킬 계획이라고 합니다 🎯',0,0,1),
	('2025-03-05 15:15:02','[React] Scroll event부터 Intersection Observer API까지',10,'https://laurent.tistory.com/entry/React-Scroll-event부터-Intersection-Observer-API까지','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FOHJhB%2FbtsMBfRmwff%2FAyS7URx5HmM4YHseZkc4dk%2Fimg.jpg',2,'**🚀 무한 스크롤의 진화: 성능 최적화 여정!**

📝 웹 개발자가 직접 경험한 무한 스크롤 구현 방식의 흥미로운 기술적 여정을 소개합니다! 초기 scroll 이벤트 방식부터 최신 Intersection Observer API까지, 각 기술의 장단점과 성능 개선 과정을 생생하게 풀어냅니다.

🔍 주요 하이라이트:
- 전통적인 스크롤 이벤트의 성능 문제
- 스로틀링 기법으로 성능 개선
- Intersection Observer API의 혁신적인 접근
- 실제 성능 측정 및 비교 분석

💡 무한 스크롤을 구현하고 싶은 개발자들에게 꼭 필요한 인사이트를 제공합니다!',0,0,1),
	('2025-03-07 14:14:20','프로그래머스 - 완전범죄',6,'https://asn6878.tistory.com/19','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbcvt9Y%2FbtsMEjMqa1v%2FI41ctrVp5QGtvgw2aquN41%2Fimg.png',4,'**도둑의 흔적 최소화 알고리즘 🕵️‍♂️🔍**

복잡한 도둑질 문제를 다이나믹 프로그래밍으로 해결하는 흥미로운 알고리즘! 🏠💡

- A와 B 도둑이 물건을 훔칠 때 남기는 흔적을 최소화하는 문제
- 3차원 DP 배열을 사용해 각 물건 훔치기의 경우의 수 계산
- 모든 물건을 훔치면서 A 도둑의 누적 흔적을 최소로 유지하는 전략 

경찰에 걸리지 않고 모든 물건을 훔치는 방법을 찾아라! 🚨🤫',0,0,1),
	('2025-03-10 13:07:06','2025년 2월 회고',18,'https://laurent.tistory.com/entry/2025년-2월-회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FFoZqZ%2FbtsMEPSQCWO%2FUxccY0XoYoRhJ2rN1NbEtK%2Fimg.png',2,'**🚀 취업 준비의 굴곡: 인턴십 도전기와 성장의 순간들**

💡 여러 기업의 인턴십에 지원했지만 아쉽게도 연이어 탈락의 고배를 마셨다. 하지만 이 과정에서 중요한 깨달음을 얻었다. 이력서 작성, 기록의 중요성, 개발 경험 문서화 등 자기 개발의 필요성을 느꼈다. 특히 구름 인턴십 과정에서는 우연히 스팸메일함에서 과제 메일을 발견하는 해프닝도 겪었다. 

🌱 이 경험을 통해 앞으로는 개발일지를 꾸준히 작성하고, 자신의 경험을 효과적으로 표현하는 능력을 키우겠다는 다짐을 했다. 실패를 두려워하지 않고 계속해서 성장해 나가는 개발자의 여정을 엿볼 수 있는 진솔한 회고록이다.',0,0,1),
	('2025-03-12 16:17:39','네트워크 거시적으로 보기',15,'https://seok3765.tistory.com/entry/%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC-%EA%B1%B0%EC%8B%9C%EC%A0%81%EC%9C%BC%EB%A1%9C-%EB%B3%B4%EA%B8%B0','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fv8B0T%2FdJMcaasx0ZF%2FAAAAAAAAAAAAAAAAAAAAABrPHm-opHr96-sy9f3nBRPrbfuGWGe9CFDOEpMy4gUq%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3DocxhBP%252BsCEDo5UH%252BjNDBoYVIVl8%253D',1,'**📡 네트워크의 모든 것: 초보자를 위한 통신 세계 탐험기!**

🌐 이 글은 네트워크의 기본 개념부터 복잡한 통신 방식까지 쉽고 재미있게 설명합니다. 네트워크가 무엇인지, 어떻게 작동하는지 초보자도 이해할 수 있는 핵심 내용을 담고 있어요!

주요 포인트:
- 🔗 네트워크의 정의와 구조
- 🌍 LAN, WAN의 차이
- 📦 패킷 교환 방식의 작동 원리
- 🖥️ 서버와 클라이언트의 관계

개발자나 IT에 관심 있는 사람이라면 반드시 읽어볼 만한 안내서입니다! 네트워크의 기본기를 탄탄히 다지고 싶다면 이 글이 최고의 길잡이가 될 거예요. 🚀',0,0,1),
	('2025-03-14 07:03:06','GraphQL이란?',16,'https://tunaspace.tistory.com/entry/GraphQL이란','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FFGeHV%2FbtsMKqSolHB%2F95IzuWThrouEfEtMukjVV0%2Fimg.png',3,'**GraphQL 깊이 파보기: 모던 API 개발의 새로운 패러다임 🚀**

개발자들의 API 요청 방식을 혁신할 GraphQL의 매력적인 세계를 탐험해봅니다! 🌐 페이스북에서 개발한 이 혁신적인 쿼리 언어는 기존 REST API의 한계를 극복하고, 클라이언트가 원하는 정확한 데이터만 가져올 수 있는 유연한 방식을 제공합니다. 

📌 주요 특징:
- 클라이언트 주도의 데이터 요청
- 단일 엔드포인트로 모든 데이터 처리
- 명확한 타입 시스템

🔍 REST API와 달리 GraphQL은 불필요한 데이터 수신을 줄이고, API 요청의 효율성을 높여줍니다. 다만, 완벽한 솔루션은 없으므로 각 프로젝트의 특성에 맞는 최적의 API 전략을 선택하는 것이 중요합니다!',0,0,1),
	('2025-03-14 12:02:55','Typescript 데코레이터 알아보기 (feat. 클로저)',20,'https://asn6878.tistory.com/20','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FdQTGE0%2FbtsMFhUwHTX%2FGSkxrKBVh0qlTB8Qku5Kf0%2Fimg.png',4,'**🚀 Typescript 데코레이터와 클로저의 마법 같은 세계!**

📝 이 글은 Javascript와 Typescript에서 핵심적인 두 가지 개념을 깊이 있게 탐구합니다:

1. **함수의 일급 객체 특성**
 - 함수를 변수처럼 할당, 전달, 반환 가능

2. **클로저(Closure)**
 - 이미 종료된 함수의 컨텍스트에 접근하는 놀라운 메커니즘

3. **데코레이터의 마법**
 - 클래스, 메서드에 메타데이터와 동작을 동적으로 추가
 - NestJS에서 핵심적으로 사용되는 기법

💡 초보 개발자부터 중급 개발자까지, Javascript/Typescript의 심오한 기능을 쉽게 이해할 수 있는 완벽한 가이드!',0,0,1),
	('2025-03-24 17:34:07','네트워크 미시적으로 보기',5,'https://seok3765.tistory.com/entry/%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC-%EB%AF%B8%EC%8B%9C%EC%A0%81%EC%9C%BC%EB%A1%9C-%EB%B3%B4%EA%B8%B0','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FvxcQn%2FdJMcafgkECv%2FAAAAAAAAAAAAAAAAAAAAALQTi-tpGE5lO50VReyZQHvBR8lDyvEtIcm3qcQcNJjq%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3DydztDrNHjDhtZhFMRBTCiKl0POU%253D',1,'**🌐 네트워크 여행: 프로토콜과 계층의 비밀을 파헤치다!** 💡 이 포스트는 네트워크의 핵심 개념을 마치 택배를 주고받는 과정처럼 쉽고 재미있게 설명합니다. 주요 포인트: - 프로토콜은 통신의 약속, 지키지 않으면 통신 불가 - OSI 7계층과 TCP/IP 4계층의 구조와 역할 상세 설명 - 각 계층별 PDU(데이터 전송 단위)의 특징 - 캡슐화와 역캡슐화 과정 이해하기 🚀 네트워크의 복잡한 메커니즘을 쉽게 풀어내는 통찰력 있는 학습 노트!',0,0,1),
	('2025-03-27 15:06:44','[운영체제] 운영체제 기초',9,'https://tunaspace.tistory.com/entry/운영체제-운영체제-기초','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F20FDV%2FbtsMZir6kto%2FWRWPkFklpIaQEztfFzrRRK%2Fimg.png',3,'**🖥️ 운영체제의 모든 것: 컴퓨터 세계의 비밀 관리자!**

운영체제는 컴퓨터의 하드웨어와 소프트웨어를 관리하는 핵심 시스템입니다. 프로세스 관리부터 메모리 할당, 파일 시스템 관리까지 다양한 역할을 수행하죠! 🔧

주요 기능은 크게 5가지로 나눌 수 있어요:
- 프로세스 관리 
- 메모리 관리
- 파일 시스템 관리
- 입출력 관리
- 보안 및 접근 제어

운영체제는 커널 영역과 유저 모드로 구성되며, Windows, macOS, Linux 등 다양한 종류가 있습니다. 프로세스와 스레드의 동작 원리, 멀티프로세스와 멀티스레드의 장단점까지 꼼꼼히 설명합니다! 🌟',0,0,1),
	('2025-03-28 08:40:19','CSRF, XSS 완전 정리',15,'https://asn6878.tistory.com/21','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbDciuE%2FbtsM0JwMJbn%2FcEbHyEcmyo14k1NGbQXw1k%2Fimg.png',4,'**🔒 웹 보안의 양대산맥: CSRF와 XSS 파헤치기!**

개발자라면 반드시 알아야 할 웹 보안의 핵심 이슈들을 쉽고 재미있게 설명합니다! 🕵️‍♂️ CSRF와 XSS라는 두 가지 치명적인 해킹 기법의 작동 원리와 예방 방법을 실제 사례와 함께 생생하게 풀어냅니다. 

📌 주요 포인트:
- CSRF: 사용자 모르게 악의적인 요청 수행
- XSS: 악성 스크립트로 사용자 정보 탈취
- 예방 전략: 토큰 사용, 이스케이핑, 쿠키 보안 설정 등

해킹의 위험성을 알고 싶은 개발자들이 주목할 보안 가이드! 🛡️',0,0,1),
	('2025-04-11 12:41:26','Nextjs - TODO리스트-0',5,'https://tunaspace.tistory.com/entry/Nextjs-TODO리스트-0','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fq79jY%2FbtsNiuUw9Zg%2FMF5anUydcVjFvKkeEiPJC0%2Fimg.png',3,'**Next.js로 나만의 TODO 앱 만들기 🚀**

리액트만 고집하던 개발자의 새로운 도전! 취업 트렌드를 반영해 Next.js를 학습하며 풀스택 웹 애플리케이션 개발에 첫 발을 내딛습니다. 

🔍 프로젝트 하이라이트:
- SSR과 SSG의 강력한 기능 활용
- 로그인 기반 개인화 TODO 서비스
- 드래그 앤 드롭으로 할일 관리

🛠 기술 스택:
- Next.js
- Tailwind CSS
- Shadcn/ui
- PostgreSQL (Neon)
- DrizzleORM

초보 개발자의 Next.js 첫 도전, 과연 어떤 결과를 만들어낼까? 🤔',0,0,1),
	('2025-04-13 12:12:13','Java 입문 1주차',3,'https://seok3765.tistory.com/entry/Java-%EC%9E%85%EB%AC%B8-1%EC%A3%BC%EC%B0%A8','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FD0c21%2FdJMcadCDhUL%2FAAAAAAAAAAAAAAAAAAAAAOfN_pkLwhjk2zouMjosnxAy-M0lDf8XiX7IvOElOt9S%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3DenucyOOoER8e%252FOem2FEShj1Ea4s%253D',1,'**🚀 자바 입문: 프로그래밍의 새로운 세계로 떠나는 여행!**

💻 자바 학습 여정의 첫 걸음을 내딛다! 이 포스팅에서는 자바의 기본 개념부터 환경 설정, 실행 과정까지 꼼꼼하게 다룹니다. 특히 주목할 점은 🔍

- JDK의 중요성과 자바 컴파일 과정
- 클래스와 메서드의 기본 구조
- 입력과 출력 방법 (System.out, Scanner 활용)
- 변수와 자료형의 기본 원리

초보 개발자부터 프로그래밍에 관심 있는 사람들까지, 자바의 세계로 함께 모험을 떠나볼까요? 🌟',0,0,1),
	('2025-04-14 11:25:36','Nextjs - TODO리스트-1',6,'https://tunaspace.tistory.com/entry/Nextjs-TODO리스트-1','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FA7tcr%2FbtsNlla4m5L%2FdpRubCAyyTC0iPTQT0vFz1%2Fimg.png',3,'**🚀 Next.js 프로젝트 데이터베이스 구축 및 폴더 구조 설계**

개발자가 투두리스트 프로젝트를 위해 세심하게 폴더 구조를 설계하고, Neon PostgreSQL과 DrizzleORM을 활용해 데이터베이스를 구축한 과정을 소개합니다! 🛠️

주요 특징:
- User와 Todo 테이블 설계
- 상세한 폴더 구조 정의 (actions, components, db 등)
- UUID 기반 테이블 관계 정립
- 서버 액션 및 데이터베이스 마이그레이션 준비 완료 🌟

다음 단계로 회원가입과 로그인 기능 구현을 앞두고 있어 기대감 UP! 📈',0,0,1),
	('2025-04-17 16:43:40','[운영체제] CPU스케줄링과 동기화 기법',6,'https://tunaspace.tistory.com/entry/운영체제-CPU스케줄링과-동기화-기법','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fev4UH8%2FbtsNpvLexiu%2F4985aDNWhu7j3aluqAFkp1%2Fimg.png',3,'**🖥️ OS의 핵심: CPU 스케줄링과 동기화 기법 깊이 파헤치기!**

운영체제의 가장 중요한 두 가지 메커니즘을 한 번에 배울 수 있는 심층 가이드! 🚀

주요 포인트:
- CPU 스케줄링 알고리즘 (FCFS, SJF, Priority, RR)
- 각 알고리즘의 장단점 상세 분석
- 멀티프로세스 환경에서의 동기화 전략
- 교착상태(DeadLock)의 개념과 해결 방법

개발자와 컴퓨터 공학도라면 반드시 알아야 할 OS의 핵심 원리를 쉽고 명확하게 설명합니다! 💡',0,0,1),
	('2025-04-18 08:12:16','물리 계층과 데이터링크 계층 (1)',4,'https://seok3765.tistory.com/entry/%EB%AC%BC%EB%A6%AC-%EA%B3%84%EC%B8%B5%EA%B3%BC-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%A7%81%ED%81%AC-%EA%B3%84%EC%B8%B5-1','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FkwW4i%2FdJMcaixlg08%2FAAAAAAAAAAAAAAAAAAAAAHQIhe0u1XQnxCNkGai5DGetJ7Tmw8MAhu1mmZYbueCJ%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3DRmFb0NWWOHPl2FJE2H6DjtlZjcI%253D',1,'**🌐 네트워크의 심장, 이더넷 완전 정복!** 

📡 이 요약은 현대 유선 LAN 환경의 핵심 기술인 이더넷에 대한 깊이 있는 탐험입니다. 어떤 케이블을 써야 할지, MAC 주소의 비밀, 이더넷 프레임의 구조까지 - 네트워크 초보자도 쉽게 이해할 수 있는 완벽 가이드! 

🔍 주요 하이라이트:
- 이더넷의 표준 규격 (IEEE 802.3)
- MAC 주소의 작동 원리
- 트위스티드 페어 vs 광섬유 케이블
- 이더넷 프레임의 구조와 작동 방식

네트워크의 세계로 떠나는 흥미진진한 여행, 지금 바로 시작하세요! 🚀',0,0,1),
	('2025-04-18 09:26:07','웹 서버는 어떻게 통신을 할까? (Socket, I/O Multiplexing)',11,'https://asn6878.tistory.com/23','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FdE9enE%2FbtsNsbrU7cu%2F8k81nzoeZH9Bmao9GsIaC0%2Fimg.png',4,'**서버의 숨겨진 비밀: 소켓, 커널, 그리고 I/O 다중화의 마법✨**

개발자라면 한 번쯤 궁금했던 서버의 내부 작동 원리를 파헤치는 흥미진진한 여정! 🚀 OS의 커널 모드와 유저 모드, 소켓 통신의 비밀, 그리고 I/O 멀티플렉싱의 혁신적인 메커니즘을 쉽고 재미있게 설명합니다. 

주요 포인트:
- 🔍 커널과 프로세스의 관계
- 🌐 소켓 통신의 기본 원리
- 🔄 I/O 멀티플렉싱 기법
- 🚦 select, poll, epoll의 동작 방식

서버의 내부 세계를 들여다보고 싶은 개발자들에게 딱! 추천하는 글입니다. 🤓',0,0,1),
	('2025-04-20 01:09:41','[Network] TCP Congestion control',3,'https://laurent.tistory.com/entry/Network-TCP-Congestion-control','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FyEK80%2FbtsNtf84bUg%2FMgkHwUT8u7y3gZooSLoen0%2Fimg.jpg',2,'**TCP의 혼잡 제어: 네트워크 대역폭을 현명하게 탐색하는 비결** 🌐🚦 TCP는 네트워크 혼잡을 대처하는 놀라운 메커니즘을 가지고 있어요! AIMD 알고리즘을 통해 데이터 전송 속도를 똑똑하게 조절합니다. 🚀 주요 특징: - **Slow Start**: 지수적으로 빠르게 시작 🏁 - **Congestion Avoidance**: 네트워크 상황에 따라 신중하게 속도 조절 🐢 - **Fast Recovery**: 패킷 손실에 유연하게 대응 💡 TCP는 마치 교통 흐름을 조절하는 스마트한 시스템처럼 작동하며, 네트워크의 가용 대역폭을 최적화합니다. 데이터 전송의 숨겨진 영웅, TCP의 혼잡 제어 비결을 만나보세요! 🌈',0,0,1),
	('2025-04-20 01:43:51','[Network] Fairness',2,'https://laurent.tistory.com/entry/Network-Fairness','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcgOs7S%2FbtsNsm2cRXU%2FavXK0DskHZhdozHQ9n6TG1%2Fimg.jpg',2,'**TCP의 불공정한 세계: 네트워크 자원 분배의 비밀** 🌐🔗 TCP의 공정성(Fairness)에 대한 깊이 있는 탐구! 🕵️‍♂️ 네트워크에서 자원을 공평하게 나누는 것은 생각보다 복잡한 문제입니다. 주요 포인트: - 🚦 병목 링크에서 대역폭을 공정하게 나누는 메커니즘 - 🔄 AIMD 알고리즘의 작동 원리 - 🚨 UDP와 멀티 연결로 인한 공정성 도전 TCP는 연결 단위의 공정성은 제공하지만, 애플리케이션 간 진정한 공정성은 보장하지 못합니다. 네트워크의 숨겨진 경쟁과 협상의 세계를 들여다보세요! 🌈',0,0,1),
	('2025-04-20 02:24:06','[Network] multiplexing, demultiplexing',4,'https://laurent.tistory.com/entry/Network-multiplexing-demultiplexing','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbGVS2o%2FbtsNsn07y1C%2FAgENBDOymsiDbgKbyivsB0%2Fimg.jpg',2,'**네트워크의 비밀, 멀티플렉싱과 디멀티플렉싱 🌐📦**

네트워크의 복잡한 데이터 전송 과정을 마치 택배 시스템처럼 쉽게 설명해주는 글입니다! 🚚 여러 애플리케이션이 동시에 네트워크를 사용할 때 어떻게 데이터를 효율적으로 주고받는지, UDP와 TCP의 차이점은 무엇인지 알려줍니다. 🌟 네트워크의 작동 원리를 마치 이야기를 듣듯 재미있게 배울 수 있는 흥미진진한 설명이 기다리고 있어요!',0,0,1),
	('2025-04-20 04:25:25','[Network] UDP',1,'https://laurent.tistory.com/entry/Network-UDP','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fu1QjT%2FbtsNsRAKFeF%2FCkHYgacdWRcbY4ovU6evgK%2Fimg.jpg',2,'**⚡ UDP: 인터넷의 초고속 메신저** 📡 네트워크의 속도와 단순함을 원한다면 UDP가 답! 🚀 TCP와 달리 연결 없이 빠르고 가볍게 데이터를 전송하는 마법 같은 프로토콜입니다. 주요 특징: - 🔹 초고속 데이터 전송 - 🔹 최소한의 헤더 (8바이트) - 🔹 연결 설정 불필요 - 🔹 자유로운 데이터 전송 YouTube, Netflix, DNS 등 다양한 서비스에서 사용되는 UDP의 매력을 알아보세요! 💻🌐',0,0,1),
	('2025-04-20 05:07:45','[Network] reliable data transfer',6,'https://laurent.tistory.com/entry/Network-reliable-data-transfer','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FwN1Jt%2FbtsNtheF1G9%2Fdb57T9PzAJ4RH2ukEEE8y1%2Fimg.jpg',2,'**🌐 네트워크의 숨겨진 영웅: 신뢰성 있는 데이터 전송의 비밀**

데이터 전송의 완벽한 여정을 추적하는 흥미진진한 탐험! 🚀 불완전한 네트워크 환경에서 데이터를 안전하고 정확하게 전송하는 rdt(Reliable Data Transfer) 프로토콜의 진화 과정을 파헤칩니다. 

🔍 주요 포인트:
- rdt 1.0: 이상적인 완벽한 채널 모델
- rdt 2.0: 비트 오류 처리 도전
- rdt 3.0: 패킷 손실까지 극복하는 혁신적 접근

이 여정은 TCP의 토대를 이해하는 핵심 열쇠! 복잡한 네트워크 세계의 신뢰성 비밀을 풀어보세요. 🔐',0,0,1),
	('2025-04-20 06:22:13','[Network] Go-Back-N, Selective Repeat',9,'https://laurent.tistory.com/entry/Network-Go-Back-N-Selective-Repeat','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbzW4vJ%2FbtsNsR8B5j3%2FI7vB0NFTkAziTxVOd1kdw1%2Fimg.jpg',2,'**Go-Back-N: 네트워크 데이터 전송의 단순하고 강력한 방법** 🚀 패킷 전송 중 문제가 생기면 모든 데이터를 다시 보내는 Go-Back-N 프로토콜의 매력적인 비밀! 🤖 - 한 번에 여러 패킷 전송 가능 - 윈도우 크기 내에서 패킷 관리 - 순서 어긋난 패킷은 과감하게 버림 💥 - 빠르고 단순하지만, 재전송이 많을 수 있음 🔄 데이터 전송의 안정성과 효율성을 동시에 추구하는 네트워크 기술의 숨은 영웅! 👨‍💻',0,0,1),
	('2025-04-20 13:11:42','Nextjs - TODO리스트-2',8,'https://tunaspace.tistory.com/entry/Nextjs-TODO리스트-2','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbiVB5e%2FbtsNsozdAiX%2FMEQALku0F199X51GMP3Zo0%2Fimg.png',3,'**JWT 토큰 기반 회원가입/로그인 기능 완벽 구현! 🚀**

사용자 경험을 고려한 세부적인 인증 시스템 개발 과정을 소개합니다. 🔐

- Zod 라이브러리를 활용한 강력한 유효성 검증
- 클라이언트/서버 양측의 입력값 체크
- BCrypt를 이용한 안전한 비밀번호 해싱
- JWT 토큰 기반의 세션 관리
- 친절한 에러 메시지와 토스트 알림

개발자들의 꼼꼼한 인증 시스템 구현 과정을 확인해보세요! 🔍',0,0,1),
	('2025-04-22 09:04:23','[Network] HTTP/1.0, HTTP/1.1, HTTP/2.0, HTTP/3.0',8,'https://laurent.tistory.com/entry/Network-HTTP10-HTTP11-HTTP20-HTTP30','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FFJlqu%2FbtsNumblrjo%2FYKxLAdtL9yHLFJ9f8CxX3k%2Fimg.jpg',2,'**🌐 HTTP의 진화: 웹의 속도와 효율성을 높이다!**

웹의 근간이 되는 HTTP 프로토콜은 시간이 지남에 따라 놀라운 변화를 겪었습니다. HTTP/1.0부터 HTTP/3까지, 각 버전은 이전 버전의 한계를 극복하고 더 나은 성능을 추구했죠. 🚀

- **HTTP/1.0**: 기본적인 요청-응답 구조 정립
- **HTTP/1.1**: 지속적 연결(Persistent Connection) 도입
- **HTTP/2**: 멀티플렉싱과 바이너리 프로토콜로 성능 개선
- **HTTP/3**: UDP 기반 QUIC 프로토콜로 진정한 병렬 처리 실현

웹의 역사를 압축해 담은 기술적 여정, 지금 바로 확인해보세요! 🌈',0,0,1),
	('2025-04-22 10:16:52','[Network] HTTP Video Streaming, DASH',6,'https://laurent.tistory.com/entry/Network-HTTP-Video-Streaming-DASH','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbh9GwW%2FbtsNvUjv9yY%2F7M8ECaQm4Iqi3itEpSIdNk%2Fimg.jpg',2,'**📺 인터넷 비디오 스트리밍의 숨겨진 기술 대해부!**

🌐 현대 인터넷 트래픽의 주요 소비자인 비디오 서비스의 복잡한 세계를 탐험해보세요! 넷플릭스와 유튜브 같은 거대 플랫폼들이 어떻게 수십억 명의 사용자에게 매끄러운 시청 경험을 제공하는지 알아봅니다. 

🔍 주요 포인트:
- 네트워크 가변성 극복 전략
- 비디오 인코딩의 비밀
- DASH 기술을 통한 적응형 스트리밍
- 버퍼링의 중요성과 작동 원리

기술의 마법 같은 세계, 이 글에서 확인해보세요! 🚀',0,0,1),
	('2025-04-24 12:40:10','크롬 브라우저의 백그라운트 탭, UX향상이 가능할까?',25,'https://tunaspace.tistory.com/entry/크롬-브라우저의-백그라운트-탭-UX향상이-가능할까','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fkxozl%2FbtsNxCE2AYT%2FlMLcXCWBYAUTp5OpPLakMK%2Fimg.png',3,'**🌐 크롬 브라우저의 탭 숨겨진 비밀: 성능과 메모리 관리의 세계!**

프론트엔드 개발자라면 꼭 알아야 할 크롬 브라우저의 탭 관리 비밀을 파헤치는 흥미진진한 여정! 👀

✨ 주요 포인트:
- 브라우저 탭의 생명주기와 가시성 API 작동 원리
- 크롬의 메모리 최적화 전략 (쓰로틀링, 탭 DISCARD)
- Page Visibility API를 활용한 UX 개선 아이디어

🔍 특히 눈여겨 볼 부분:
1. 백그라운드 탭의 렌더링 및 타이머 제한
2. 메모리 부족 시 탭 자동 제거 메커니즘
3. 웹소켓과 탭 상태 관리 전략

개발자의 꼼꼼한 분석과 통찰로 브라우저의 숨겨진 작동 방식을 배울 수 있는 놀라운 글!',0,0,1),
	('2025-04-26 13:59:57',' Java 입문 3주차',4,'https://seok3765.tistory.com/entry/TIL-Java-%EC%9E%85%EB%AC%B8-3%EC%A3%BC%EC%B0%A8','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbSyWjP%2FdJMcaglVoj4%2FAAAAAAAAAAAAAAAAAAAAAH-_8ajyrLA408oJvt07n40-5u1OQbLiLV0sE9tS4lFz%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3Deh%252BGyJ%252BP7rYsfcu7kemde76YnZk%253D',1,'**🚀 자바 심화 학습: 클래스, 상속, 예외 처리의 모든 것!**

📘 길벗 코딩 자율 학습단 14기의 자바 입문 심화 학습 내용을 요약했습니다. 이 포스팅에서는 자바의 핵심 개념들을 깊이 있게 탐구합니다!

🔍 주요 학습 포인트:
- static 메서드와 main 메서드의 비밀
- 접근 제한자(public, private, protected)의 작동 원리
- 상속, 오버라이딩, 오버로딩의 차이점
- 업캐스팅과 다운캐스팅 개념
- 추상 클래스와 인터페이스의 활용

💡 특히 자바만의 고유한 특징인 throws, 어노테이션 등 흥미로운 개념들을 배울 수 있습니다. 프로그래밍에 관심 있는 개발자라면 놓치지 마세요!',0,0,1),
	('2025-05-01 17:04:18','물리 계층과 데이터링크 계층 (2)',5,'https://seok3765.tistory.com/entry/%EB%AC%BC%EB%A6%AC-%EA%B3%84%EC%B8%B5%EA%B3%BC-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%A7%81%ED%81%AC-%EA%B3%84%EC%B8%B5-2','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FvIHCf%2FdJMcaf1BZGh%2FAAAAAAAAAAAAAAAAAAAAANUwRbCitej7YR-_t90KuIA65rJJm63PpfmoFFZhVeDV%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3DvsFVJ1I85ad2dxkNMHcjuFetJuY%253D',1,'**🌐 네트워크의 비밀: 허브와 스위치의 놀라운 차이점!**

어느 네트워크 입문자의 흥미진진한 학습 여정을 담은 글입니다. 허브와 스위치의 동작 방식, MAC 주소 학습, CSMA/CD 프로토콜, VLAN 구축 등 네트워크의 핵심 개념을 재미있게 탐구합니다. 🕵️‍♀️🔍 

주요 발견:
- 허브는 모든 포트로 신호 전송
- 스위치는 MAC 주소 기반 효율적 통신
- VLAN 트렁킹으로 네트워크 확장 가능

초보자도 쉽게 이해할 수 있는 네트워크 학습 경험을 공유합니다! 🚀📚',0,0,1),
	('2025-05-03 09:32:28','SKT 해킹, BPF도어가 뭔데?',17,'https://asn6878.tistory.com/24','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Ft2dA3%2FbtsNK229EHv%2F8E2UEBk0eOKPqTOF4ltAi1%2Fimg.png',4,'**해킹의 비밀: BPF 도어와 악성코드의 숨막히는 세계** 🕵️‍♂️🔒 최근 SKT 해킹 사건을 통해 알려진 충격적인 BPF 도어 공격 기법을 파헤쳐봅니다! 🚨 - 커널 레벨에서 작동하는 초고도의 은밀한 해킹 기술 - 패킷 필터링을 통해 추적이 거의 불가능한 악성코드 - 해커들이 원격 쉘을 획득하는 치명적인 방법 소개 Low-level 코드 분석을 통해 네트워크 보안의 숨겨진 위험을 생생하게 들여다봅니다! 😱🔍',0,0,1),
	('2025-05-03 12:28:18','Java 입문 4주차',11,'https://seok3765.tistory.com/entry/TIL-Java-%EC%9E%85%EB%AC%B8-4%EC%A3%BC%EC%B0%A8','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2F1TNZL%2FdJMcagM6f5e%2FAAAAAAAAAAAAAAAAAAAAAGkz5eXWBntKPr6fheVFLce2PH_3QPZObzQXKJ40TNnH%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D4hC4L6EhHz%252FUh%252BGhX7yy6lG15kk%253D',1,'**🚀 길벗 코딩 자율 학습단: 자바 학습 여정의 핵심 정리**

📚 이번 학습에서는 자바의 다양한 컬렉션, 입출력 스트림, 람다, 스레드 등 핵심 개념들을 깊이 있게 탐구했습니다!

✨ 주요 학습 포인트:
- 컬렉션 프레임워크의 List, Set, Map 구조 이해
- 제네릭과 래퍼 클래스의 활용
- 입출력 스트림의 다양한 활용법
- 람다식과 함수형 인터페이스 학습
- 멀티스레딩의 기본 개념 탐구

🎯 목표는 Java와 Spring Framework를 활용한 웹 개발 실력 향상! 백엔드 신입 개발자로서의 역량을 키워나가는 중입니다. 💪',0,0,1),
	('2025-05-05 11:48:17','코딩 자율 학습단 14기 자바 입문 과정을 마치다.',11,'https://seok3765.tistory.com/entry/%EC%BD%94%EB%94%A9-%EC%9E%90%EC%9C%A8-%ED%95%99%EC%8A%B5%EB%8B%A8-14%EA%B8%B0-%EC%9E%90%EB%B0%94-%EC%9E%85%EB%AC%B8-%EA%B3%BC%EC%A0%95%EC%9D%84-%EB%A7%88%EC%B9%98%EB%8B%A4','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbeugxY%2FdJMcafgkoSu%2FAAAAAAAAAAAAAAAAAAAAAB6-ewoClksNArcuwN07R5VVrgR8K1sn9Rk9an4skXOC%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D%252FLr8e81a1qDN9ko%252Fr4rd%252FskGs9Q%253D',1,'**🚀 길벗 코딩 자율 학습단 14기, Java 입문의 여정!**

개발자의 열정과 학습 경험을 담은 코딩 자율 학습단 후기를 소개합니다! 💻 프로젝트와 병행하며 Java 언어의 기초를 탄탄하게 다진 저자의 생생한 이야기를 만나보세요. 🌟

📌 주요 하이라이트:
- Java 언어 기초 문법 학습
- IntelliJ IDE로 최신 문법 익히기
- 프로젝트와 함께하는 병행 학습
- 코딩 자율 학습단의 편안한 학습 경험

시간 관리와 꾸준함의 중요성을 깨달은 개발 입문기, 놓치면 후회할 멋진 성장 스토리! 👨‍💻🔥',0,0,1),
	('2025-05-07 12:41:00','[Denamu] API요청 최적화',8,'https://tunaspace.tistory.com/entry/Denamu-API요청-최적화','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fc4GZAz%2FbtsNNXt3VmR%2F0Oid5EjnX4xERVHjKj9W10%2Fimg.png',3,'**🚀 불필요한 API 요청 최적화로 서버 성능 대폭 개선!**

📊 데나무 프로젝트에서 서버 다운 문제를 해결하기 위해 두 가지 혁신적인 최적화 전략을 도입했습니다:

1️⃣ **동일 검색어 캐싱**
- Tanstack Query의 `staleTime` 활용
- 20회 요청 중 실제 서버 호출을 6회로 감소 (약 70% 감소)

2️⃣ **입력값 디바운싱**
- 연속 타이핑으로 인한 불필요한 요청 방지
- 10회 요청을 1회로 줄여 90% 요청 감소

💡 이 두 전략을 결합하여 서버 부하를 획기적으로 줄이고 사용자 경험을 크게 향상시켰습니다!',0,0,1),
	('2025-05-22 13:11:28','자바스크립트에서의 Map vs Object',15,'https://tunaspace.tistory.com/entry/자바스크립트에서의-Map-vs-Object','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FkKa34%2FbtsN76SZlUQ%2FGn7YMo2bs2wJnf5FBtj1PK%2Fimg.png',3,'**🚀 자바스크립트 객체의 메모리 저장 비밀: V8 엔진의 숨겨진 최적화 기법!** 이 글은 자바스크립트의 객체와 Map이 내부적으로 어떻게 작동하는지 파헤치는 흥미로운 탐구입니다. 🕵️‍♂️ 주요 포인트: - V8 엔진의 히든 클래스(Hidden Class) 메커니즘 - Fast Property와 Dictionary Mode의 차이 - 객체와 Map의 성능 비교 실험 결과 특히 저자는 동적 타입 언어인 자바스크립트가 어떻게 놀라운 성능을 달성하는지 상세히 설명하며, 개발자들에게 메모리 최적화의 중요성을 일깨워줍니다. 🧠💡 객체와 Map 중 어떤 자료구조를 언제 사용해야 할지 고민이라면, 이 글이 완벽한 해답을 제시합니다! 💯',0,0,1),
	('2025-06-03 12:40:02','코딩 자율 학습 컴퓨터 구조와 운영체제',5,'https://seok3765.tistory.com/entry/%EC%BD%94%EB%94%A9-%EC%9E%90%EC%9C%A8-%ED%95%99%EC%8A%B5-%EC%BB%B4%ED%93%A8%ED%84%B0-%EA%B5%AC%EC%A1%B0%EC%99%80-%EC%9A%B4%EC%98%81%EC%B2%B4%EC%A0%9C','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FFmfOh%2FdJMcacw6sVw%2FAAAAAAAAAAAAAAAAAAAAAMyLLaXH8yf_y7B_owQFdnQ-5F0uqh8Y4d-XMVsNjqlJ%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3DFRHfTmkYXDVFuL7bo1Fz%252Ffge3hM%253D',1,'**🖥️ 개발자의 CS 지식 필수 도서! 컴퓨터 구조와 운영체제 완전 정복** 📚 \'코딩 자율학습 컴퓨터 구조와 운영체제\' 도서 리뷰에 주목해보세요! 이 책은 단순한 기술서를 넘어 학습의 동기부여와 이해를 돕는 특별한 책입니다. 주요 특징은: - 🤔 학습 이유와 응용 방법 명확히 제시 - 📊 풍부한 도식과 시각적 자료로 복잡한 개념 쉽게 설명 - 🧩 매 소주제 마다 1분 퀴즈로 즉각적인 복습 가능 - 💻 CS 면접 대비와 성능 높은 애플리케이션 개발에 필수 개발자라면 반드시 알아야 할 운영체제와 컴퓨터 구조의 핵심을 한 권에 담았습니다!',0,0,1),
	('2025-06-10 18:28:24','TypeORM 의 Date String 반환 이슈',18,'https://asn6878.tistory.com/25','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FlJ1IG%2FbtsOuMTHZhJ%2F0l9Vk0Af3UE6XqFHHdpWYK%2Fimg.webp',4,'**TypeORM에서 날짜 타입 변환의 숨겨진 함정 🕰️**

개발자가 TypeORM에서 겪은 날짜 타입 매핑의 흥미로운 삽질 이야기! 😱 Entity의 Date 컬럼이 예상치 못한 문자열로 반환되는 황당한 상황을 만나고, transformer 옵션을 통해 멋지게 해결한 과정을 담았습니다. 개발 중 마주치는 예기치 못한 타입 변환의 재미있는 실제 사례를 통해 TypeScript와 TypeORM의 미묘한 작동 방식을 배울 수 있는 흥미로운 포스트입니다! 🚀',0,0,1),
	('2025-11-24 19:28:00','Postman에서 Socket.IO 연결하기',17,'https://seok3765.tistory.com/entry/Trouble-Postman%EC%97%90%EC%84%9C-SocketIO-%EC%97%B0%EA%B2%B0%ED%95%98%EA%B8%B0','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FcezPNY%2FdJMcadCD1S1%2FAAAAAAAAAAAAAAAAAAAAANbxrUFAlecuacIwhDgwQfRFQUq-T0NYGF4Pof3zCs6g%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D9vn00tirICBdVnZt1tKrye43N84%253D',1,NULL,0,0,1),
	('2026-01-05 19:06:44','서브 모듈 업데이트 자동화하기',20,'https://seok3765.tistory.com/entry/%EC%84%9C%EB%B8%8C-%EB%AA%A8%EB%93%88-%EC%97%85%EB%8D%B0%EC%9D%B4%ED%8A%B8-%EC%9E%90%EB%8F%99%ED%99%94%ED%95%98%EA%B8%B0','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FwGENL%2FdJMcad3MR4d%2FAAAAAAAAAAAAAAAAAAAAANHLmZTnxnZCtO8AwE7yQxwLHRw_JNiwRL3esEvaFmjN%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D5fVkgWzYhDQKMVIE6QBKk9j9Y0s%253D',1,'**🚀 Git Submodule로 포트폴리오 통합 및 자동화 여정** 개발자가 여러 레포지토리를 효율적으로 관리하기 위해 Git Submodule과 Github Actions를 활용한 흥미로운 해결책을 소개합니다! 📍 주요 도전 과제: - 3개의 서로 다른 레포지토리 관리 - 포트폴리오 링크 통합 - 서브 모듈 수동 업데이트의 번거로움 🛠️ 해결 방안: - Git Submodule로 레포지토리 통합 - Github Actions로 자동 업데이트 스크립트 구현 - 1시간마다 최신 상태 동기화 🌟 성과: - 포트폴리오 URL을 3개에서 1개로 단축 - 수동 업데이트 작업 자동화 이 혁신적인 접근법으로 개발 워크플로우를 한 단계 업그레이드했습니다! 🎉',0,0,1),
	('2026-01-14 15:29:06','Window 터미널을 예쁘게 꾸며보아요 💮🚀🌈🌻',10,'https://seok3765.tistory.com/entry/Window-%ED%84%B0%EB%AF%B8%EB%84%90%EC%9D%84-%EC%98%88%EC%81%98%EA%B2%8C-%EA%BE%B8%EB%A9%B0%EB%B3%B4%EC%95%84%EC%9A%94-%F0%9F%92%AE%F0%9F%9A%80%F0%9F%8C%88%F0%9F%8C%BB','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fc4RNSA%2FdJMcagM7dQ5%2FAAAAAAAAAAAAAAAAAAAAAHn8-XANbvCpcvCjOcX05hv-297cgdKWiV9N_-Qi_zXa%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3DZD8W36Iam8TwXDDZWWWkkbViP8M%253D',1,'**🖥️ 개발자의 터미널 설정 완벽 가이드: Windows 환경 최적화** 윈도우 환경에서 개발자를 위한 터미널 설정의 모든 것! 🚀 이 글은 다음과 같은 멋진 팁들을 포함하고 있어요: - Windows Terminal 기본 설정 - Git Bash와 WSL 비교 - Zsh와 Oh-My-Zsh 설치 및 설정 - Powerlevel10k 테마로 터미널 꾸미기 - 유용한 플러그인 추가 (자동완성, 문법 하이라이팅) - fastfetch로 시스템 정보 멋지게 표시하기 개발 환경을 한 단계 업그레이드하고 싶은 개발자들에게 딱! 추천합니다 🎉',0,0,1),
	('2026-02-03 17:51:17','MISE EN PLACE 환경 자동 관리',12,'https://seok3765.tistory.com/entry/MISE-EN-PLACE-%ED%99%98%EA%B2%BD-%EC%9E%90%EB%8F%99-%EA%B4%80%EB%A6%AC','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FPW8dC%2FdJMcahSDU07%2FAAAAAAAAAAAAAAAAAAAAANW4DHLOkSml0hnzgj3t9-nOGAIGeuD6dOlcImG9YIcD%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3DJulOrNF75PrKwRjsfEfAzN9xlr4%253D',1,'**🚀 프로젝트 환경 관리의 혁명, MISE EN PLACE!**

개발자들의 악몽 같은 버전 호환성 문제, 이제 한 방에 해결! 🔧 MISE EN PLACE는 다양한 프로그래밍 언어의 런타임과 도구 체인을 프로젝트 단위로 자동 관리해주는 놀라운 도구입니다. 

🌈 주요 특징:
- NodeJS, Python, Java 등 다중 언어 지원
- 프로젝트별 자동 환경 설정
- NVM, Volta보다 강력한 기능
- 환경 변수와 툴체인까지 통합 관리

윈도우 환경에서도 간단히 설치하고 mise.toml로 설정만 하면 끝! 이제 개발 환경 때문에 고민하지 마세요! 💻✨',0,0,1),
	('2026-02-16 12:31:44','Git Branch 전략',10,'https://seok3765.tistory.com/entry/%ED%98%91%EC%97%85-Git-Branch-%EC%A0%84%EB%9E%B5','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fckp1sH%2FdJMcabrq8ed%2FAAAAAAAAAAAAAAAAAAAAAD0whqmrblk3-Ca7ZV45S7nNJETiBgqCXJW86sxvhsnu%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3DLIVtiTc188IBrX6rwo6Jbfn%252B%252B2I%253D',1,'**🌳 Git Branch 전략, 당신의 팀에 꼭 맞는 선택은?**

📍 프로젝트의 성공은 적절한 Git 브랜치 전략 선택에 달려있습니다! 개발 팀의 규모, 안정성 요구사항, 배포 빈도에 따라 다양한 전략이 존재합니다.

🔍 주요 전략들:
- Git Flow: 안정성 최우선 (금융, 의료 분야 적합)
- Github Flow: 빠른 배포와 단순성
- Gitlab Flow: 안정성과 속도의 균형
- Trunk Based Development: 고도화된 CI/CD 환경 필요

🚀 핵심 조언: 팀의 현재 역량과 프로젝트 특성에 맞는 전략을 선택하세요! 초기 팀은 Github Flow부터 시작해 점진적으로 발전시키는 것을 추천합니다.',0,0,1),
	('2026-03-09 16:31:31','Claude Instruction, MCP, Sub Agent, Cowork, Plugin, Slash Commands',15,'https://seok3765.tistory.com/entry/Claude-Instruction-MCP-Sub-Agent-Cowork-Plugin-Slash-Commands','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbObbyF%2FdJMcagTPn1X%2FAAAAAAAAAAAAAAAAAAAAAMvtlIYIzpE6Sk4NA2jNq56pwfy6eJ5LEARiBi143WtU%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3DclOmKFs3G5hlvQEWlnbT%252Bdtn98E%253D',1,'**Claude 완벽 활용 가이드: 개발 생산성을 3배로 높이는 설정법** 🚀

3개월간 Claude 유료 사용으로 터득한 AI 개발 도구의 모든 것! 이 글은 Claude Desktop과 Claude Code의 차이부터 시작해서, MCP, Instructions, Skills, Agents, Hooks, Slash Commands, Plugins까지 모든 기능을 완벽하게 설명합니다.

**핵심 내용:**
- 🎯 **Claude vs ChatGPT vs Gemini** - 개발자를 위한 선택 기준
- 🛠️ **Instructions vs Skills vs Agents** - 각 기능의 명확한 차이와 활용법
- 🔗 **MCP 설정** - 프로젝트별로 토큰을 절약하는 방법
- ⚙️ **자동화 기능** - Hooks와 Slash Commands로 반복 작업 단축
- 💡 **개발 워크플로우 최적화** - Claude Code와 Cowork의 활용 팁

가장 중요한 통찰: **"AI는 뛰어난 도구지만, 100% 신뢰는 금지. 개발자의 비판적 검토가 필수다"** ⚠️

초보자는 기초부터, 숙련자는 고급 기능까지 모두를 다루는 완벽한 레퍼런스입니다!',0,0,1),
	('2026-06-15 00:57:00','[네이버 커넥트재단 부스트캠프 웹・모바일 9기] 날 것 그대로 작성하는 베이직 수료 후기 - Web',8,'https://seok3765.tistory.com/entry/%EB%84%A4%EC%9D%B4%EB%B2%84-%EC%BB%A4%EB%84%A5%ED%8A%B8%EC%9E%AC%EB%8B%A8-%EB%B6%80%EC%8A%A4%ED%8A%B8%EC%BA%A0%ED%94%84-%EC%9B%B9%E3%83%BB%EB%AA%A8%EB%B0%94%EC%9D%BC-9%EA%B8%B0-%EB%82%A0-%EA%B2%83-%EA%B7%B8%EB%8C%80%EB%A1%9C-%EC%9E%91%EC%84%B1%ED%95%98%EB%8A%94-%EB%B2%A0%EC%9D%B4%EC%A7%81-%EC%88%98%EB%A3%8C-%ED%9B%84%EA%B8%B0-Web','https://img1.daumcdn.net/thumb/R750x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbU20hA%2FdJMcagTpPqy%2FAAAAAAAAAAAAAAAAAAAAAEopOREZWuNzD7b4ZkQ5wqNf5hwUy2UmOPl4pNMbMJx8%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3DPI0FOJh5R4DT5oJ7%252Fk%252BSTprPE4E%253D',1,NULL,0,0,1),
	('2026-08-19 02:19:20','GA35DX에 X570-F 메인보드 바이오스 이식 수술 (1편 - 상황)',4,'https://seok3765.tistory.com/entry/GA35DX를-X570-F-메인보드로-바이오스-이식-해보기-1편-상황','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FQE4qN%2FdJMcacjShkr%2FAAAAAAAAAAAAAAAAAAAAAGl6JWC2Hs1NtGaJVWfKp54vBtoaf2e8us1iHpFOSikF%2Fimg.webp%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3DnL9XbnKWuMcqMtXyKb07ZsO0rj4%253D',1,'**GA35DX 메인보드 살리기 프로젝트: 2년 만의 도전기 🛠️**

2021년 코로나19로 전역한 후 그래픽카드 품귀 시대에 구매했던 ASUS ROG GA35DX 완제품 PC. 하지만 OEM 메인보드의 제한된 BIOS로 인해 메모리 전압 설정이 불가능했고, 결국 RAM 2666MHz의 저클럭으로 인한 성능 저하를 경험했습니다. 🎮

**이전의 실패 시도:**
- BIOS ROM을 직접 프로그래밍하려다 과정에서 CPU 무뽑, 칩 착오, 써멀 그리스 오염 등 여러 시행착오를 겪음
- 결국 메인보드를 X570 TUF Gaming으로 교체하고 GA35DX는 창고에 방치

**2년 후의 부활 계획:**
약 2년이 지난 지금, 남은 부품들을 활용해 다시 도전하기로 결심! 이번에는:
- 더 체계적인 검증 절차를 거쳐 기본 하드웨어부터 확인
- 1.8V 변환 어댑터를 사용해 ROM 칩(25Q256JWEQ)에 X570-F Gaming BIOS 직접 프로그래밍
- SMBus-DAC 납땜 작업까지 계획 중

**희망의 신호! 💡**
2026년 5월에 ASUS ROG 포럼에서 동일한 시도로 성공한 사례 발견! 메모리 전압 제어가 가능해졌다는 후기에 더욱 자극받은 상태입니다.

험난할 것 같지만, 성공하면 완전히 새로운 컴퓨터를 얻을 수 있다는 기대감으로 가득 찬 도전기입니다! ✨',1,0,1),
	('2026-08-20 15:55:49','코드로 시작하는 자바 첫 걸음',2,'https://seok3765.tistory.com/entry/코드로-시작하는-자바-첫-걸음','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbLxD6q%2FdJMcaiduxHn%2FAAAAAAAAAAAAAAAAAAAAAMDzl8a_clGKzeTyycN7oNgsj1PdVlZR2EmurkE_8pWi%2Ftfile.avif%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3DzIX7K3l6%252BvVkb6oqzefK7k5Wucw%253D',1,'**김영한의 자바 입문 강의 후기: TypeScript 백엔드 개발자가 Java를 배우다! 🚀**

이미 TypeScript와 NestJS로 백엔드 개발을 해오던 개발자가 국내 채용 시장의 Java/Spring 생태계를 이해하기 위해 입문 강의를 수강한 솔직한 후기입니다.

**📚 강의의 강점:**
- 변수, 연산자, 조건문, 반복문, 배열, 메서드 등 프로그래밍의 기본 개념을 직관적으로 설명
- 난이도 조절을 잘해서 입문자가 따라가기 쉬움
- "백문이 불여일타" - 실제 코드 작성으로 배우는 학습 방식
- IntelliJ IDEA 활용 팁과 단축키 제공
- **마지막 \'다음으로\' 파트에서 개발자로서의 성장 방향과 삶의 철학을 다룸** 💭

**👥 추천 대상:** 프로그래밍/Java 초보자, 대학 1학년  
**👋 비추천 대상:** 이미 다른 언어 경험이 있는 개발자 (필요 부분만 선택 수강 권장)

**💡 핵심 결론:**
Java 입문자에게 정말 좋은 강의! 무료라는 점이 최고의 장점. 😊',0,0,1),
	('2026-08-23 18:43:00','GA35DX에 X570-F 메인보드 바이오스 이식 수술 (2편 - 수리 시작)',3,'https://seok3765.tistory.com/entry/GA35DX에-X570-F-메인보드-바이오스-이식-수술-2편-수리-시작','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FUV3yK%2FdJMcabZKT4m%2FAAAAAAAAAAAAAAAAAAAAAIbEovcCEaSlfY5scbCTAAjmnbMVSOoCfjjNyDa_Gsy9%2Fimg.webp%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3D6%252Fc3NXBA53TVJR7CXtU8kSnyYPg%253D',1,'**GA35DX 메인보드 개조 프로젝트: 실패 후 배운 교훸 🔧** 

2년간 방치된 ASUS GA35DX 완제품 PC의 메인보드를 ROG Strix X570-F Gaming 바이오스로 교체하려던 야심찬 프로젝트! 💻 메모리 전압 제어 기능이 없는 OEM 커스텀 보드를 일반 판매용 제품으로 개조하기 위해 CH314B ROM Writer, 1.8V 어댑터, 여분의 ROM 칩 등을 준비했습니다.

**작업 과정의 주요 포인트:**
- UEFITool을 이용한 CAP 바이오스 파일을 ROM으로 변환
- NeoProgrammer를 통한 ROM 칩 기록
- CPU 소켓 청소 및 교체 시도

**아쉽게도 실패한 이유** 😔
경험 부족으로 CPU 소켓 분리 작업 중 메인보드 기판까지 손상시키게 됩니다. 너무 많은 열을 한 곳에 집중했고, 작업 순서를 잘못 정했다는 점이 가장 아쉬웠던 부분입니다.

**배운 교훈:**
✅ 현재 상태 최대한 보존  
✅ 가장 안전한 작업부터 진행  
✅ 위험 요소 사전 정리  
✅ 각 단계마다 정상 동작 확인  
✅ 납땜 작업은 가장 마지막에

비록 이번 도전은 실패했지만, 이 글이 비슷한 시도를 하는 다른 분들의 성공을 돕기를 바랍니다! 🙏',0,0,1),
	('2026-08-30 09:10:39','김영한의 실전 자바 - 기본편',1,'https://seok3765.tistory.com/entry/김영한의-실전-자바-기본편','https://blog.kakaocdn.net/dna/rh6ef/dJMcaf16f3q/AAAAAAAAAAAAAAAAAAAAAPizsGdRZJKEi6nkHR4Drj88eCofJwROYkdoFAU7XfOi/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1790780399&allow_ip=&allow_referer=&signature=l31Wn7erZjiiGdMVE4jVOTYN%2F%2FI%3D',1,'**김영한의 "실전 자바 - 기본편" 강의 후기 📚**

프로그래밍 경험이 있는 사람들을 위한 Java 강의 추천 리뷰입니다! 💻

**강의의 핵심 내용** ✨
- Java의 객체지향 프로그래밍(OOP) 개념 학습
- 메모리 구조와 참조값의 동작 방식 이해
- 다형성, 상속, 캡슐화 등 핵심 개념 습득
- OCP 원칙을 활용한 변경에 유연한 설계 방법

**이 강의가 추천되는 이유** 🎯
- C/C++ 등으로 메모리 구조를 이해한 경험자에게 최적
- 단순한 문법이 아닌 "왜"를 설명하는 강의 방식
- 메모리 구조를 시각적으로 단계별 설명
- 실제 코드 작성을 통한 실전 학습

**수강 정보** 💰
- 가격: 44,000원 (평균 할인가 약 33,000원)
- 어느 정도 코드 작성이 가능할 때까지 반복 학습 권장

강의 제작에 들인 정성이 느껴지는 우수한 강의라고 평가됩니다! 👍',0,0,1),
	('2026-08-30 11:54:03','김영한의 실전 자바 - 중급 1편',2,'https://seok3765.tistory.com/entry/김영한의-실전-자바-중급-1편','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FdV70XF%2FdJMcacqU92G%2FAAAAAAAAAAAAAAAAAAAAAEFUQsN3rDaT-8KBYdijmFYiJ63YZP4NyDhSuWuBsTz-%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1788188399%26allow_ip%3D%26allow_referer%3D%26signature%3Dy0ulv6IY%252F5Xz9OCrU%252FOUjyXscLE%253D',1,'**Java 중급 과정 강의 리뷰: 언어의 원리를 깊이 있게 학습하다! 🚀**

단순히 Java를 \'사용\'하는 것을 넘어 **언어 자체를 깊게 이해**하고 싶은 개발자들을 위한 중급 강의 수강 후기입니다! 📚

**주요 학습 내용** 💡
- Object 클래스, 불변 객체, String과 래퍼 클래스의 내부 동작 원리
- 열거형(enum)의 진화 과정 - 타입 안전 열거형 패턴을 직접 구현해보며 이해
- 중첩/내부 클래스의 메모리 동작 방식과 리플렉션
- 실무 중심의 예외 처리 및 try-with-resources 활용법

**강의의 강점** ⭐
코드가 메모리 내부에서 어떻게 동작하는지 **직관적인 그림으로 설명**해주고, 단순한 문법 학습을 넘어 **\'왜 이 기능을 사용해야 하는가?\'** 라는 실질적인 질문에 답합니다. 리팩토링 전후 코드 비교를 통해 각 문법의 필요성을 체감할 수 있습니다! ✨

**특별한 배움** 🎯
String의 문자열 풀, StringBuilder 최적화, 래퍼 클래스의 성능 비용, 지역변수 캡쳐 방식 등 다른 강의에서는 깊이 있게 다루지 않는 내용들을 습득할 수 있습니다.

**팁** 💡
중급편은 예제 코드가 누적되므로 **직접 코드를 작성**하며 학습할 것을 추천! Spring 학습 전 Java 언어를 충분히 이해하고 싶은 개발자에게 최적의 선택입니다! 🎓',0,0,1),
	('2026-09-06 11:07:07','NestJS Contributor 된 이야기',2,'https://seok3765.tistory.com/entry/NestJS-Contributor-된-이야기','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbfckCj%2FdJMcaiko9Hk%2FAAAAAAAAAAAAAAAAAAAAAOwAiU-KWfYJ9GIXZrgT7lzfnZotZjqt0uXduLnFlbxG%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1790780399%26allow_ip%3D%26allow_referer%3D%26signature%3DXo9A7F6TxHy%252F9uqU%252BsMXKDJnInk%253D',1,'**NestJS 오픈소스에 첫 기여하며 배운 것들 🚀**

데나무 프로젝트에서 파일 업로드 기능을 구현하던 중 발견한 문제가 **NestJS 오픈소스 기여**의 시작이 되었습니다!

### 🔍 발견한 문제
- MaxFileSizeValidator는 커스텀 오류 메시지 지원 (message 속성)
- FileTypeValidator는 동일한 기능 없음
- API 일관성 부족

### 💡 해결 과정
1. **Issue 작성**: 문제점과 해결책을 명확하게 제시
2. **기능 구현**: 테스트 코드까지 포함해서 작업
3. **코드 리뷰**: 두 번의 리뷰를 통해 점진적 개선
   - message → errorMessage로 명확화 (기존 API는 deprecated 처리)
   - 파일 객체와 Validator 설정을 인자로 활용 가능하도록 확장
4. **PR Merge**: 약 6일 만에 NestJS master에 병합됨 ✨

### 🎯 실제 프로젝트 적용
- NestJS 버전 업그레이드 (10.4.22 → 11.x)
- FileTypeValidator에서 errorMessage 활용
- 더욱 구체적인 오류 메시지 생성 가능

### 🏆 얻은 성과
- NestJS Contributor 등재 + Release Note에 이름 기록
- 오픈소스 개발 및 리뷰 과정 경험
- 프레임워크 내부 구조 이해
- **오픈소스 기여에 대한 두려움 극복** 💪',0,0,1),
	('2026-09-06 14:16:47','김영한의 실전 자바 - 중급 2편',1,'https://seok3765.tistory.com/entry/김영한의-실전-자바-중급-2편','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fct9iKK%2FdJMcaaGLbBl%2FAAAAAAAAAAAAAAAAAAAAANj-koV4kY1ZEn4xXnVAw7piXS406ZCj38pFp5xCdSFh%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1790780399%26allow_ip%3D%26allow_referer%3D%26signature%3Di%252BQRU00%252Bf5SiuspaX2jJxBpvUXw%253D',1,'**Java 컬렉션 프레임워크 완벽 학습기 🎯**

Java의 List, Set, Map, Queue 등 컬렉션을 단순히 사용하는 것을 넘어, 직접 구현하며 내부 동작 원리까지 파악하는 심화 강의! 🚀

**강의의 핵심 포인트** ✨
- 제네릭부터 시작해 자료구조 기초 다지기
- 해시 충돌, 레드-블랙 트리 등 실제 동작 원리 이해
- Iterator, Comparable, Comparator 인터페이스 완벽 습득
- 상황별 최적 자료구조 선택 능력 배양

**수강 후 얻은 인사이트** 💡
- Stack보다 **Deque가 더 효율적**이라는 사실!
- ArrayList vs LinkedList: 이론과 실제 성능이 다르다!
- 사용자 정의 객체의 hashCode()와 equals() 구현이 얼마나 중요한지 깨달음
- Java의 정교한 설계에 대한 깊은 이해

**이런 분들께 강력 추천** 👍
Java 중급 1편을 수료한 후, 다음 단계로 나아가고 싶은 개발자들! Spring 학습 전에 데이터 처리 방식을 제대로 이해하고 싶다면 필수 강의입니다.',0,0,1);

-- denamu.category insert data (운영 데이터 기준: denamu.sql/category)
INSERT INTO `category` (name,display_order) VALUES
	('FrontEnd',1),
	('BackEnd',2),
	('회고',3),
	('데이터베이스',4),
	('인프라',5),
	('CS',6);

-- denamu.tag insert data (운영 데이터 기준: denamu.sql/tag)
INSERT INTO `tag` (name,category_id) VALUES
	('Backend',2),
	('Spring',2),
	('Frontend',1),
	('회고',3),
	('Java',2),
	('MySQL',4),
	('Network',6),
	('DB',4),
	('OS',6),
	('JavaScript',1),
	('Docker',5),
	('Infra',5),
	('React',1),
	('Algorithm',6),
	('TypeScript',1),
	('Nest.JS',2),
	('Next.JS',1),
	('PostgreSQL',4),
	('Express.JS',2),
	('Browser',1);

-- denamu.tag_map insert data (feed CSV의 실제 id 컬럼으로 운영 tag_map과 정확히 조인 후, 이 시드의 feed.id로 재배치함)
INSERT INTO `tag_map` (feed_id,tag_id) VALUES
	(86,7),
	(89,1),
	(89,6),
	(89,8),
	(89,15),
	(89,16),
	(90,1),
	(90,5),
	(90,10),
	(90,15),
	(95,1),
	(95,9),
	(96,7),
	(115,9),
	(116,10),
	(117,9),
	(118,4),
	(118,9),
	(119,3),
	(119,10),
	(120,4),
	(120,5),
	(121,1),
	(121,3),
	(121,10),
	(122,7),
	(123,10),
	(123,14),
	(124,11),
	(124,12),
	(125,1),
	(126,12),
	(127,7),
	(127,11),
	(127,12),
	(128,6),
	(128,8),
	(129,3),
	(130,1),
	(130,7),
	(131,3),
	(131,4),
	(131,13),
	(132,3),
	(132,10),
	(132,13),
	(133,14),
	(134,3),
	(134,4),
	(134,10),
	(135,7),
	(135,12),
	(136,1),
	(136,7),
	(137,10),
	(137,15),
	(138,1),
	(138,7),
	(139,9),
	(140,3),
	(140,7),
	(141,3),
	(141,13),
	(141,17),
	(142,1),
	(142,5),
	(143,1),
	(143,3),
	(143,15),
	(143,17),
	(143,18),
	(144,9),
	(144,14),
	(145,3),
	(145,7),
	(146,1),
	(146,7),
	(146,9),
	(147,7),
	(148,7),
	(149,7),
	(150,1),
	(150,7),
	(151,1),
	(151,7),
	(152,7),
	(153,3),
	(153,13),
	(153,15),
	(154,1),
	(154,7),
	(155,7),
	(155,12),
	(156,3),
	(156,10),
	(156,20),
	(157,1),
	(157,5),
	(158,7),
	(158,12),
	(159,7),
	(159,9),
	(160,1),
	(160,5),
	(161,4),
	(161,5),
	(162,3),
	(162,7),
	(162,13),
	(163,3),
	(163,10),
	(164,3),
	(164,9),
	(165,1),
	(165,15),
	(165,16),
	(167,1),
	(167,3),
	(167,12),
	(168,3),
	(168,9),
	(169,3),
	(169,12),
	(170,1),
	(170,3),
	(170,12),
	(171,1),
	(171,15),
	(174,1),
	(174,5),
	(176,1),
	(176,5),
	(177,1),
	(177,5),
	(178,1),
	(178,4),
	(178,15),
	(178,16),
	(179,5),
	(179,14);

-- denamu.comment insert data (mock, 운영 데이터 0건)
INSERT INTO `comment` (comment,date,feed_id,user_id,parent_id) VALUES
	('유익한 글 감사합니다~','2026-08-21 09:24:02.000000',167,2,NULL),
	('테라폼 처음 써보는데 도움 많이 됐습니다.','2026-08-22 11:03:10.000000',126,4,NULL),
	('한 해 정리 글 잘 보고 갑니다!','2026-08-23 20:15:44.000000',134,6,NULL),
	('TypeORM 이슈 저도 겪었어요 ㅠㅠ','2026-08-24 13:47:31.000000',165,9,NULL),
	('저도 궁금했던 주제네요!','2026-08-25 08:02:19.000000',156,1,NULL);

-- denamu.activity insert data (mock, 운영 activity는 비대상 유저 데이터라 재사용 불가)
INSERT INTO `activity` (activity_date,view_count,user_id) VALUES
	('2026-08-27',1,1),
	('2026-08-28',3,2),
	('2026-08-29',2,4),
	('2026-08-30',5,6),
	('2026-08-31',1,9);

-- denamu.likes insert data (mock, 운영 likes는 대상 외 블로그 게시글 1건뿐이라 재사용 불가)
INSERT INTO `likes` (feed_id,user_id,like_date) VALUES
	(167,1,'2026-08-21 09:30:00.000000'),
	(156,2,'2026-08-22 10:00:00.000000'),
	(126,4,'2026-08-23 11:00:00.000000'),
	(134,6,'2026-08-24 12:00:00.000000'),
	(165,9,'2026-08-25 13:00:00.000000'),
	(137,3,'2026-08-26 14:00:00.000000');

-- denamu.subscription insert data (mock, 운영 데이터 0건)
INSERT INTO `subscription` (user_id,rss_accept_id) VALUES
	(2,1),
	(2,2),
	(2,3),
	(1,2),
	(4,1),
	(6,3),
	(9,4);

-- denamu.notification insert data (mock, 운영 데이터 0건)
INSERT INTO `notification` (type,is_read,recipient_user_id,feed_id,rss_accept_id) VALUES
	('LIKE',0,1,167,NULL),
	('SUBSCRIBE',1,2,NULL,1),
	('COMMENT',0,1,167,NULL),
	('LIKE',1,4,126,NULL),
	('SUBSCRIBE',0,3,NULL,2);

-- denamu.blocks insert data (mock, 운영 데이터 0건)
INSERT INTO `blocks` (blocker_id,blocked_id) VALUES
	(3,2),
	(5,7),
	(8,3);

-- denamu.rss_blocks insert data (mock, 운영 데이터 0건)
INSERT INTO `rss_blocks` (blocker_id,blocked_rss_id) VALUES
	(3,4),
	(6,2),
	(9,1);

-- denamu.file insert data (row 1 = 실제 운영 데이터: Min:D 프로필 이미지)
INSERT INTO `file` (original_name,mimetype,path,size,created_at,user_id) VALUES
	('profile.png','image/webp','/objects/PROFILE_IMAGE/2026-08-07/178d7c64-b0cb-49cf-9424-d8b3d3de2271.webp',34122,'2026-08-07 11:59:21.000000',1),
	('avatar.png','image/png','/objects/PROFILE_IMAGE/2025-05-01/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png',20480,'2025-05-01 10:00:00.000000',2);

-- denamu.provider insert data (mock - 실제 OAuth refresh_token은 시드에 포함하지 않음)
INSERT INTO `provider` (provider_type,provider_user_id,refresh_token,created_at,updated_at,user_id,provider_user_name) VALUES
	('google','109876543210987654321',NULL,'2025-07-25 10:39:45.000000','2025-07-25 10:39:45.000000',1,'Min:D'),
	('google','109876543210987654322',NULL,'2025-08-04 16:52:42.000000','2025-08-04 16:52:42.000000',7,'테스트 계정7');

-- denamu.report insert data (mock, 운영 데이터 0건)
INSERT INTO `report` (target_type,target_id,reason,detail,reporter_id,reported_user_id,reported_feed_id) VALUES
	('FEED',156,'SPAM','광고성 게시글입니다.',3,NULL,156),
	('USER',7,'ABUSE','욕설 및 비방성 댓글을 반복적으로 작성합니다.',2,7,NULL);

-- denamu.board insert data (운영 데이터 기준: denamu.sql/board, 2건 그대로 - 1.0.0 릴리즈 공지 + 서비스 종료 예정 공지)
INSERT INTO `board` (title,content,question,status,category,is_pinned,start_at,end_at,author_admin_id) VALUES
	('🎋 데나무 1.0.0 버전 릴리즈 🎋','<p>안녕하세요. 데나무 운영진입니다.</p><p></p><p><strong>데나무는 네이버 커넥트 재단의 네이버 부스트 캠프 웹ㆍ모바일 9기 Web05 팀이 최종 프로젝트로 개발한 개발 블로그 큐레이션 서비스입니다.</strong></p><p>서비스 이름인 데나무는 대학 커뮤니티의 \'대나무 숲\'에서 모티브를 얻어, Developer(Dev)와 대나무 숲을 결합해 탄생한 이름으로, 개발자들이 자유롭게 정보를 공유하고 소통할 수 있는 공간이 되기를 바라는 의미를 담고 있습니다.</p><p>데나무는 2024년 11월 개발을 시작하여 약 1년 9개월간의 노력 끝에, 2026년 8월 1일 정식 서비스를 오픈하게 되었습니다.</p><p></p><p><strong>데나무는 "개발 블로그가 여러 플랫폼에 흩어져 있어 개발 게시글을 한 곳에서 접하기 어렵다."는 불편함에서 시작했습니다.</strong></p><p>이후 단순 큐레이션 서비스를 넘어 개인화 기능을 추가하고, 개발자들이 함께 소통할 수 있는 커뮤니티로 성장하기 위해 꾸준히 발전해왔습니다.</p><p>아직은 부족한 부분이 많지만, 앞으로도 다양한 커뮤니티 기능을 추가하여 개발자들이 정보를 공유하고 자유롭게 소통할 수 있는 공간으로 성장해 나가고자 합니다.</p><p></p><p><strong>오픈 베타 기간 동안 익명 채팅방에 남겨주신 응원의 한마디와 방문 기록은 저희에게 큰 힘이 되었습니다.</strong></p><p>많은 이용자는 아니었지만, 실제로 서비스를 찾아와 의견을 남겨주시는 분들이 있다는 사실만으로도 일회성 프로젝트 끝내지 않고 계속 개발하고 운영할 수 있는 원동력이 되었습니다.</p><p>베타 기간 동안 데나무를 이용해 주시고 따뜻한 응원을 보내주신 모든 분들께 진심으로 감사드립니다.</p><p></p><p><strong>개발 과정은 결코 순탄하지만은 않았습니다.</strong></p><p>프로젝트 기간이 예상보다 길어지면서 프로젝트를 지속하기 어려운 상황에 놓인 팀원도 있었고, 개인 일정과 취업 준비가 겹치면서 개발에 참여하기 어려운 상황도 생겼습니다.</p><p>결국 마지막에는 사실상 한 명의 개발 인력만 남아 디자인, 개발, 프로젝트 관리, 개인정보 보호 법률 검토까지 모두 담당하게 되었고, 그 과정에서 여러 차례 일정이 연기되기도 했습니다.</p><p></p><p><strong>프로젝트를 여기서 마무리해도 괜찮지 않을까 고민했던 순간도 많았습니다.</strong></p><p>하지만 서비스에 남겨진 이 기록 채팅을 보며, 단 한 분이라도 데나무를 찾아주시는 이용자가 있다는 사실이 프로젝트를 계속 이어갈 수 있었던 가장 큰 이유였습니다.</p><p>설령 이용자가 많지 않더라도, 이 프로젝트를 단순히 포트폴리오 속 하나의 결과물로 남기기보다 실제로 운영하며 더 많은 경험과 추억을 만들고 싶었습니다.</p><p></p><p>처음 운영하는 서비스인 만큼 아직 부족한 점도 많고, 예상하지 못한 버그나 불편한 부분이 있을 수 있습니다.</p><p>앞으로도 지속적인 개선과 업데이트를 통해 더 나은 서비스를 제공할 수 있도록 노력하겠습니다.</p><p>서비스를 이용하시면서 발견한 버그, 문의 사항, 개선 제안은 <a href="https://github.com/boostcampwm-2024/web05-Denamu/issues" rel="noopener noreferrer" target="_blank">GitHub Issue</a> 또는 <a href="mailto:boostcamp9web05@gmail.com" rel="noopener noreferrer" target="_blank">boostcamp9web05@gmail.com</a>으로 이메일을 보내주시면 하나하나 소중히 확인하여 서비스 개선에 적극 반영하겠습니다.</p><p></p><p>감사합니다.</p><p>- 데나무 운영진 드림</p><p></p><ul><li><a href="https://github.com/boostcampwm-2024/web05-Denamu" rel="noopener noreferrer" target="_blank">GitHub Repository</a></li><li><a href="https://github.com/boostcampwm-2024/web05-Denamu/issues" rel="noopener noreferrer" target="_blank">GitHub Issue</a></li><li><a href="https://github.com/boostcampwm-2024/web05-Denamu/releases/tag/v1.0.0" rel="noopener noreferrer" target="_blank">Release Note</a></li></ul>',NULL,'PUBLISHED','NOTICE',1,NULL,NULL,1),
	('🎋 데나무 서비스 종료 예정🎋','<p>안녕하세요 데나무 운영진입니다.</p>
<p> </p>
<p>데나무는 <strong>2024년 11월</strong> 개발을 시작하여, <strong>2026년 9월 14일</strong>까지 <strong>약 1년 10개월간</strong>의 여정을 끝으로 <span style="color:#e03e2d"><strong>서비스를 종료</strong></span>하게 되었습니다.</p>
<p>그동안 <strong>1.0.0 버전</strong>을 시작으로 <strong>1.0.4 버전</strong>까지 꾸준히 기능을 추가하고 버그를 수정하며, 보다 안정적인 서비스로 발전시켜 왔습니다. 하지만 운영 비용에 대한 부담과 지속적으로 서비스를 관리할 수 있는 인력 부족 등의 현실적인 문제로 인해 서비스 종료를 결정하게 되었습니다.</p>
<p> </p>
<p>정식 서비스를 시작한 지 오래되지 않은 시점에 종료 소식을 전하게 되어 더욱 아쉬운 마음입니다.</p>
<p>그동안 데나무를 찾아주시고 이용해주신 모든 사용자분들께 진심으로 감사드립니다.</p>
<p> </p>
<p>특히 데나무에 쌓인 게시글 <strong>616건</strong>과 직접 블로그를 등록해주신 <strong>21분</strong>의 기록은 저희에게도 잊지 못할 소중한 흔적입니다.</p>
<p>무엇보다 정식 배포를 하기 전부터 직접 블로그를 등록해주신 분들이 계셨기에, 다양한 플랫폼의 블로그를 실제 환경에서 확인하며 플랫폼에 관계없이 게시글을 수집하고 제공하는 기능을 보다 수월하게 개발할 수 있었습니다.</p>
<p>많은 숫자는 아닐 수 있지만, 누군가에게는 자신의 글을 공유하고 새로운 글을 발견하는 공간이었고, 저희에게는 서비스를 계속 만들어갈 수 있었던 이유였습니다.</p>
<p>데나무를 이용해주시고 직접 참여해주신 모든 분들을 잊지 않겠습니다.</p>
<p> </p>
<p>여유가 있었다면 조금 더 서비스를 유지하고 운영하고 싶었습니다. 그만큼 데나무에 많은 시간과 노력을 쏟았고, 지금도 아쉬움이 남습니다.</p>
<p>하지만 현재의 상황에서 서비스를 계속 유지하기는 어렵다고 판단하여, 아쉽지만 여기서 데나무의 여정을 마무리하고자 합니다.</p>
<p> </p>
<p><strong>서비스 종료일</strong>은 <strong>2026년 9월 14일</strong>이며, 종료와 함께 서비스 내 <strong>모든 데이터는 지체 없이 파기될 예정</strong>입니다.</p>
<p> </p>
<p>그동안 데나무와 함께해주셔서 진심으로 감사드립니다.</p>',NULL,'PUBLISHED','NOTICE',1,'2026-09-09 00:00:00',NULL,1);

-- denamu.marketing_email insert data (mock, 운영 데이터 0건)
INSERT INTO `marketing_email` (subject,content,recipient_count,author_admin_id) VALUES
	('데나무 8월 소식지','<p>이번 달 인기 게시글과 업데이트 소식을 전해드립니다.</p>',128,1),
	('신규 기능 안내: 좋아요 알림','<p>좋아요/댓글 알림 기능이 추가되었습니다.</p>',96,1);

-- denamu.qna insert data (mock, 운영 데이터 0건)
INSERT INTO `qna` (title,is_secret,password,guest_name,guest_email,user_id,status) VALUES
	('RSS 등록 문의드립니다',0,NULL,'홍길동','guest@test.com',NULL,'PENDING'),
	('탈퇴 절차가 궁금합니다',0,NULL,NULL,NULL,2,'ANSWERED'),
	('마이페이지 프로필 이미지가 안 바뀌어요',0,NULL,NULL,NULL,6,'PENDING'),
	('비공개 문의드립니다',1,'$2b$10$lmNFQaXm6yVo3hGMRJk5SuwV2Wn..ej9my29rXOSpiVj7iMrSWau.','익명사용자','anon@test.com',NULL,'PENDING');

-- denamu.qna_message insert data (mock, 운영 데이터 0건)
INSERT INTO `qna_message` (qna_id,type,content,admin_id) VALUES
	(1,'QUESTION','RSS 등록은 어떻게 진행하나요?',NULL),
	(2,'QUESTION','탈퇴 절차를 알려주세요.',NULL),
	(2,'ANSWER','마이페이지 > 회원 탈퇴에서 진행 가능합니다.',1),
	(3,'QUESTION','프로필 이미지 변경이 반영되지 않습니다.',NULL),
	(4,'QUESTION','문의 내용은 비공개로 부탁드립니다.',NULL);

-- denamu.user_suspension insert data (mock, 운영 데이터 0건)
INSERT INTO `user_suspension` (user_id,admin_id,detail,suspended_until) VALUES
	(7,1,'반복적인 스팸성 댓글 작성으로 인한 7일 정지','2026-08-19 00:00:00'),
	(9,2,'커뮤니티 가이드라인 위반(부적절한 게시글)',NULL);

-- denamu.withdrawn_user insert data (mock, 운영 데이터 0건)
INSERT INTO `withdrawn_user` (email,withdrawn_at) VALUES
	('withdrawn1@test.com','2026-06-01 12:00:00');

