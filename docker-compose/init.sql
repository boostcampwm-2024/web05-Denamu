-- denamu.admin definition

CREATE TABLE `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `login_id` varchar(255) NOT NULL,
  `password` varchar(60) NOT NULL,
  PRIMARY KEY (`id`)
);

-- denamu.rss definition

CREATE TABLE `rss` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `user_name` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `rss_url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);

-- denamu.rss_accept definition

CREATE TABLE `rss_accept` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `user_name` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `rss_url` varchar(255) NOT NULL,
  `blog_platform` varchar(255) NOT NULL DEFAULT 'etc',
  PRIMARY KEY (`id`),
  FULLTEXT KEY (`name`)
);

-- denamu.rss_reject definition

CREATE TABLE `rss_reject` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `user_name` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `rss_url` varchar(255) NOT NULL,
  `description` varchar(512) NOT NULL,
  PRIMARY KEY (`id`)
);

-- denamu.feed definition

CREATE TABLE `feed` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL,
  `title` varchar(255) NOT NULL,
  `view_count` int NOT NULL DEFAULT '0',
  `path` varchar(512) NOT NULL,
  `thumbnail` varchar(255) DEFAULT NULL,
  `blog_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`path`),
  KEY (`blog_id`),
  KEY (`created_at`),
  CONSTRAINT `FK_feed_blog_id` FOREIGN KEY (`blog_id`) REFERENCES `rss_accept` (`id`) ON UPDATE CASCADE,
  FULLTEXT KEY (`title`) /*!50100 WITH PARSER `ngram` */
);

INSERT INTO denamu.rss_accept (name,user_name,email,rss_url,blog_platform) VALUES
	 ('seok3765.log','조민석','seok3765@naver.com','https://v2.velog.io/rss/@seok3765','velog'),
	 ('나무보다 숲을','채준혁','cjh4302@gmail.com','https://laurent.tistory.com/rss','tistory'),
	 ('월성참치','정명기','jmk101711@naver.com','https://tunaspace.tistory.com/rss','tistory'),
	 ('해야지 뭐','안성윤','asn6878@gmail.com','https://asn6878.tistory.com/rss','tistory');

INSERT INTO feed (created_at,title,view_count,`path`,thumbnail,blog_id) VALUES
	 ('2024-12-15 15:20:23','[네이버 커넥트재단 부스트캠프 웹・모바일 9기] 날 것 그대로 작성하는 멤버십 수료 후기 - Web',0,'https://velog.io/@seok3765/네이버-커넥트재단-부스트캠프-웹・모바일-9기-날-것-그대로-작성하는-멤버십-수료-후기-Web','https://velog.velcdn.com/images/seok3765/post/a655dff9-58bc-436b-bdef-9e1195e5cbf6/image.png',1),
	 ('2024-08-14 14:07:49','[네이버 커넥트재단 부스트캠프 웹・모바일 9기] 날 것 그대로 작성하는 챌린지 수료 후기 - Web',0,'https://velog.io/@seok3765/네이버-커넥트재단-부스트캠프-웹・모바일-9기-날-것-그대로-작성하는-챌린지-수료-후기-Web','https://velog.velcdn.com/images/seok3765/post/2f863481-b594-46f8-9a28-7799afb58aa4/image.jpg',1),
	 ('2025-01-07 14:18:34','[TIL] 리눅스 입문 with 우분투 1일차 정리 (운영체제, 리눅스 찍먹)',1,'https://velog.io/@seok3765/리눅스-입문-with-우분투-1일차-정리','https://velog.velcdn.com/images/seok3765/post/e44c37ae-ffac-4528-87f6-cae3d6466919/image.png',1),
	 ('2025-01-07 17:54:16','[TIL] 리눅스 입문 with 우분투 2일차 정리 (우분투 설치)',3,'https://velog.io/@seok3765/리눅스-입문-with-우분투-2일차-정리','https://velog.velcdn.com/images/seok3765/post/e44c37ae-ffac-4528-87f6-cae3d6466919/image.png',1),
	 ('2025-01-08 15:32:49','[TIL] 리눅스 입문 with 우분투 3일차 정리 (터미널과 셸)',1,'https://velog.io/@seok3765/TIL-리눅스-입문-with-우분투-3일차-정리','https://velog.velcdn.com/images/seok3765/post/e44c37ae-ffac-4528-87f6-cae3d6466919/image.png',1),
	 ('2025-01-11 14:36:51','[TIL] 리눅스 입문 with 우분투 4일차 정리 (명령어, 파일, 디렉터리)',1,'https://velog.io/@seok3765/TIL-리눅스-입문-with-우분투-4일차-정리','https://velog.velcdn.com/images/seok3765/post/e44c37ae-ffac-4528-87f6-cae3d6466919/image.png',1),
	 ('2025-01-11 17:09:40','[서평] 코딩 자율학습 리눅스 입문 with 우분투',2,'https://velog.io/@seok3765/서평-코딩-자율학습-리눅스-입문-with-우분투','https://velog.velcdn.com/images/seok3765/post/e760d106-efda-4fae-93a9-11a41993de68/image.jpg',1),
	 ('2025-01-12 13:45:56','[TIL] 리눅스 입문 with 우분투 5일차 정리 (파일과 디렉터리, 링크)',3,'https://velog.io/@seok3765/TIL-리눅스-입문-with-우분투-5일차-정리','https://velog.velcdn.com/images/seok3765/post/70f0c8b6-95a0-4ed1-b057-5ece06202705/image.png',1),
	 ('2025-01-13 19:56:10','[TIL] 리눅스 입문 with 우분투 6일차 정리 (사용자, 그룹)',1,'https://velog.io/@seok3765/TIL-리눅스-입문-with-우분투-6일차-정리','https://velog.velcdn.com/images/seok3765/post/09ffddcc-f15e-437c-9b21-46f72e9d0795/image.png',1),
	 ('2025-01-14 13:58:59','[TIL] 리눅스 입문 with 우분투 7일차 정리 (소유권, 권한)',1,'https://velog.io/@seok3765/TIL-리눅스-입문-with-우분투-7일차-정리','https://velog.velcdn.com/images/seok3765/post/cbdfb185-2e8d-474c-a7f3-84a6400e3532/image.png',1);
INSERT INTO feed (created_at,title,view_count,`path`,thumbnail,blog_id) VALUES
	 ('2025-01-15 18:03:54','[Docker] 가상머신, 하이퍼바이저, 도커 전체 개념',5,'https://velog.io/@seok3765/Docker-도커-개념','https://velog.velcdn.com/images/seok3765/post/ef1c0705-92fe-4d09-b649-c111eb19e98c/image.png',1),
	 ('2025-01-18 16:12:01','[TIL] 리눅스 입문 with 우분투 8일차 정리 (컴퓨터 작동 원리, 프로세스 생명 주기)',3,'https://velog.io/@seok3765/TIL-리눅스-입문-with-우분투-8일차-정리','https://velog.velcdn.com/images/seok3765/post/d2314c99-5a5d-4a07-b5d7-c65a99e78b1b/image.png',1),
	 ('2025-01-18 20:58:34','[TIL] 리눅스 입문 with 우분투 9일차 정리 (파일 디스크립터, 포어그라운드, 백그라운드, IPC)',1,'https://velog.io/@seok3765/TIL-리눅스-입문-with-우분투-9일차-정리','https://velog.velcdn.com/images/seok3765/post/a75a45b0-f609-42bf-bec1-18d4b2a00756/image.png',1),
	 ('2025-01-19 14:28:55','[TIL] 리눅스 입문 with 우분투 10일차 정리 (시그널)',0,'https://velog.io/@seok3765/TIL-리눅스-입문-with-우분투-10일차-정리','https://velog.velcdn.com/images/seok3765/post/ae79f20a-b64c-4b6d-b246-6e501f9c868a/image.png',1),
	 ('2025-01-20 08:51:03','[TIL] 리눅스 입문 with 우분투 11일차 정리 (변수, 분기)',3,'https://velog.io/@seok3765/TIL-리눅스-입문-with-우분투-11일차-정리','https://velog.velcdn.com/images/seok3765/post/a9322793-f06a-46e2-b93f-0b7aa8d434fd/image.png',1),
	 ('2025-01-01 09:57:59','[컴퓨터학개론] AI시대의 컴퓨터 개론 - 내용 점검 문제 8장',2,'https://laurent.tistory.com/entry/컴퓨터학개론-AI시대의-컴퓨터-개론-내용-점검-문제-8장','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FEAc7h%2FbtsLCp0GjT6%2FxmRrt2mHV26Q5EZtnlIuYK%2Fimg.jpg',2),
	 ('2025-01-01 09:57:41','[컴퓨터학개론] AI시대의 컴퓨터 개론 - 내용 점검 문제 7장',1,'https://laurent.tistory.com/entry/컴퓨터학개론-AI시대의-컴퓨터-개론-내용-점검-문제-7장','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbra31r%2FbtsLBVyPlia%2FKUrcmpjWoQz72dl4hyhy40%2Fimg.jpg',2),
	 ('2025-01-01 09:57:27','[컴퓨터학개론] AI시대의 컴퓨터 개론 - 내용 점검 문제 6장',1,'https://laurent.tistory.com/entry/컴퓨터학개론-AI시대의-컴퓨터-개론-내용-점검-문제-6장','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbgHcoJ%2FbtsLCJq32Gz%2FqnoiJfT4R8kPVJZX0HkrE1%2Fimg.jpg',2),
	 ('2025-01-01 09:57:02','[컴퓨터학개론] AI시대의 컴퓨터 개론 - 내용 점검 문제 5장',1,'https://laurent.tistory.com/entry/컴퓨터학개론-AI시대의-컴퓨터-개론-내용-점검-문제-5장','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbmMIdF%2FbtsLCmiLLlz%2FJh3fcj0EE110gip0VbsKa0%2Fimg.jpg',2),
	 ('2025-01-01 09:56:42','[컴퓨터학개론] AI시대의 컴퓨터 개론 - 내용 점검 문제 4장',2,'https://laurent.tistory.com/entry/컴퓨터학개론-AI시대의-컴퓨터-개론-내용-점검-문제-4장','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FVk4f3%2FbtsLC6TTxJY%2Fgp2A3Zio9oNgaFwVOJhk50%2Fimg.jpg',2);
INSERT INTO feed (created_at,title,view_count,`path`,thumbnail,blog_id) VALUES
	 ('2025-01-01 09:56:17','[컴퓨터학개론] AI시대의 컴퓨터 개론 - 내용 점검 문제 3장',2,'https://laurent.tistory.com/entry/컴퓨터학개론-AI시대의-컴퓨터-개론-내용-점검-문제-3장','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FdHifmQ%2FbtsLCqSOiNu%2F9jz5XgKtqBGI4GVRmcqo81%2Fimg.jpg',2),
	 ('2025-01-01 09:55:52','[컴퓨터학개론] AI시대의 컴퓨터 개론 - 내용 점검 문제 2장',1,'https://laurent.tistory.com/entry/컴퓨터학개론-AI시대의-컴퓨터-개론-내용-점검-문제-2장','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbk5adg%2FbtsLCGBmBJQ%2F8wLoOtsuafBu4oyC7X24sk%2Fimg.jpg',2),
	 ('2025-01-01 09:55:19','[컴퓨터학개론] AI시대의 컴퓨터 개론 - 내용 점검 문제 1장',1,'https://laurent.tistory.com/entry/컴퓨터학개론-AI시대의-컴퓨터-개론-내용-점검-문제-1장','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FyP38X%2FbtsLC5tSTmB%2FQLJWCIezMTIMK4TI5DW3ck%2Fimg.jpg',2),
	 ('2024-12-31 13:29:55','2024년 회고',3,'https://laurent.tistory.com/entry/2024년-회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fb4PqwE%2FbtsLDoUaKl5%2FIzlJCnCQWJgUNihL0l5Sq1%2Fimg.png',3),
	 ('2024-12-29 14:58:45','[서평] 믿고보는 시리즈 - 소플의 처음 만난 AWS',0,'https://laurent.tistory.com/entry/서평-믿고보는-시리즈-소플의-처음-만난-AWS','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcglUxX%2FbtsLAycE6Oq%2FA76t3kFoRKww5Z3Y7tSMQK%2Fimg.png',2),
	 ('2024-12-24 14:59:11','[서평] 기초부터 배우는 최신 스토리지 입문',0,'https://laurent.tistory.com/entry/서평-기초부터-배우는-최신-스토리지-입문','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FmlbHE%2FbtsLxGg2crn%2FItBJRu6dK8d1ugjCH5pBoK%2Fimg.jpg',2),
	 ('2024-12-23 12:31:09','[React] 좋아요 기능 버그 해결 및 서버 데이터 활용',0,'https://laurent.tistory.com/entry/React-좋아요-기능-버그-해결-및-서버-데이터-활용','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fn9XvB%2FbtsLs2SSvXD%2FpX4jJqjYsN3Kvm6kVeCH9K%2Fimg.jpg',2),
	 ('2024-12-15 15:45:14','네이버 부스트캠프 9기 웹 풀스택 과정 후기',2,'https://laurent.tistory.com/entry/네이버-부스트캠프-9기-웹-풀스택-과정-후기','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fo4aHa%2FbtsLiZhAwKH%2FmuiPRCUCK5sVcm1U35KknK%2Fimg.png',2),
	 ('2024-12-12 17:11:51','[React] useEffect의 내부적인 동작',0,'https://laurent.tistory.com/entry/React-useEffect의-내부적인-동작','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FybzbA%2FbtsLgdtxOZ1%2FbPJG88Zopbg3GYCCv66UA1%2Fimg.jpg',2),
	 ('2024-12-01 14:20:33','[Javascript] 브라우저 팝업 차단으로 인한 문제와 해결책',0,'https://laurent.tistory.com/entry/Javascript-브라우저-팝업-차단으로-인한-문제와-해결책','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcvhYyL%2FbtsK2oa0BmV%2FvCOtbQW29hHJtDY1mdX8kk%2Fimg.jpg',2);
INSERT INTO feed (created_at,title,view_count,`path`,thumbnail,blog_id) VALUES
	 ('2024-11-30 09:14:29','2024년 11월 정기회고',0,'https://laurent.tistory.com/entry/2024년-11월-정기회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FlCF0Y%2FbtsK19rAVhX%2FkyiZZMCXaLKr4zTIQkVCK1%2Fimg.jpg',2),
	 ('2024-10-27 10:58:51','[서평] 올인원 개발 키트 - 헬로 Bun',0,'https://laurent.tistory.com/entry/서평-올인원-개발-키트-헬로-Bun','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FblruHt%2FbtsKlXYphWT%2Fqhkp0koc7ibgNJZAl6gGak%2Fimg.png',2),
	 ('2024-10-27 06:55:13','[서평] 클라우드 입문서 - 비전공자를 위한 AWS',0,'https://laurent.tistory.com/entry/서평-클라우드-입문서-비전공자를-위한-AWS','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FwwQQd%2FbtsKkhRx56w%2Fbry8wS93h3I3yfnZdPpK01%2Fimg.png',2),
	 ('2024-10-25 07:48:08','[서평] 효과적인 활용을 위해 - 이펙티브 러스트',0,'https://laurent.tistory.com/entry/서평-효과적인-활용을-위해-이펙티브-러스트','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcfMtYX%2FbtsKkbJzJtz%2F53JkhTBvH8ymeLjAB28K31%2Fimg.png',2),
	 ('2024-10-23 03:53:03','[부스트캠프 9기 멤버십] 8주차 회고록',0,'https://laurent.tistory.com/entry/부스트캠프-9기-멤버십-8주차-회고록','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F3pAmf%2FbtsKf6ajeYD%2FAYwELS26sfvhPQjXj4EQzk%2Fimg.png',2),
	 ('2024-10-13 11:51:15','[부스트캠프 9기 멤버십] 7주차 회고록',0,'https://laurent.tistory.com/entry/부스트캠프-9기-멤버십-7주차-회고록','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FtB2gg%2FbtsJ4pudcJS%2FvgwvJLtbNZHA5zj9I74S9k%2Fimg.png',2),
	 ('2024-10-05 16:13:14','[부스트캠프 9기 멤버십] 6주차 회고록',0,'https://laurent.tistory.com/entry/부스트캠프-9기-멤버십-6주차-회고록','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fc8dRVZ%2FbtsJV0V95O8%2FuWWxRXKOVGHf6hi5XIKON1%2Fimg.jpg',2),
	 ('2024-09-28 17:22:33','[부스트캠프 9기 멤버십] 5주차 회고록',0,'https://laurent.tistory.com/entry/부스트캠프-9기-멤버십-5주차-회고록','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FKnyGb%2FbtsJQ53m67B%2F4QKnbv1UJFLP7ioz7gGeyk%2Fimg.jpg',2),
	 ('2024-09-28 17:22:04','[부스트캠프 9기 멤버십] 3주차 회고록',0,'https://laurent.tistory.com/entry/부스트캠프-9기-멤버십-3주차-회고록','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbSbOGD%2FbtsJPTQx8Jn%2F9VKR5i6hYy83ZDAWnRczok%2Fimg.jpg',2),
	 ('2024-09-28 17:21:14','[부스트캠프 9기 멤버십] 1주차 회고록',0,'https://laurent.tistory.com/entry/부스트캠프-9기-멤버십-1주차-회고록','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FGreTN%2FbtsJQoCs5Iw%2FTOpUWIZ19vgFXXuN8p7Ctk%2Fimg.jpg',2);
INSERT INTO feed (created_at,title,view_count,`path`,thumbnail,blog_id) VALUES
	 ('2024-09-28 17:06:28','[서평] 중요한 내용만 빠르게 - 컴퓨터 구조와 운영체제 핵심 노트',0,'https://laurent.tistory.com/entry/서평-중요한-내용만-빠르게-컴퓨터-구조와-운영체제-핵심-노트','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbj2tZc%2FbtsJPmTlq81%2FKJ5hVNI4vpoDNCi1kLZh40%2Fimg.png',2),
	 ('2024-09-28 17:03:04','2024년 9월 정기회고',0,'https://laurent.tistory.com/entry/2024년-9월-정기회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FVJNy0%2FbtsJQD7u9mB%2FYtkPRWkjZG0Mcu88eD6zxK%2Fimg.jpg',2),
	 ('2024-09-28 11:21:19','[서평] CS 익힘책 - 이것이 취업을 위한 컴퓨터 과학이다',0,'https://laurent.tistory.com/entry/서평-CS-익힘책-이것이-취업을-위한-컴퓨터-과학이다','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbHi3fm%2FbtsJRcBiuc2%2Fg42a8KfGjBeYpg3xSdmZJK%2Fimg.png',2),
	 ('2024-09-19 12:20:31','[Typescript] 사진과 영상을 FormData로 서버에 전송하기',0,'https://laurent.tistory.com/entry/Typescript-사진과-영상을-FormData로-서버에-전송하기','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbnF8gk%2FbtsJElHhxEA%2FvEHYqgusACTezGW9kdXNc1%2Fimg.jpg',2),
	 ('2024-09-09 00:46:28','2024년 8월 정기회고',0,'https://laurent.tistory.com/entry/2024년-8월-정기회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F8rzkH%2FbtsJuXMqI8r%2Fk4zdUJzPj541WY81lx6MbK%2Fimg.png',2),
	 ('2024-09-03 16:22:28','[서평] 모던 자바 기능으로 전문가 되기 - 기본기가 탄탄한 자바 개발자',0,'https://laurent.tistory.com/entry/서평-모던-자바-기능으로-전문가-되기-기본기가-탄탄한-자바-개발자','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F5wDyE%2FbtsJqFdebVC%2FFgt1xtxl46o6PkEatQpSK0%2Fimg.jpg',2),
	 ('2024-09-03 16:12:27','[서평] 인공지능 시대의 경제 - 금융 AI의 이해',0,'https://laurent.tistory.com/entry/서평-인공지능-시대의-경제-금융-AI의-이해','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fc7fBGc%2FbtsJpKffzUM%2FOpZRjbdCJF6kNzqvEXtkV0%2Fimg.jpg',2),
	 ('2024-08-26 15:21:31','[Javascript] 이벤트 전파',0,'https://laurent.tistory.com/entry/Javascript-이벤트-전파','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FEQK4T%2FbtsJggL7myP%2F0uDMZyyPaQbxQzdvecI8h0%2Fimg.jpg',2),
	 ('2024-08-26 15:00:10','[Javascript] 이벤트 핸들러 등록',0,'https://laurent.tistory.com/entry/Javascript-이벤트-핸들러-등록','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FNhzEi%2FbtsJg9FmunA%2F0lbnnxPPU3XwEqFrx3Vzp1%2Fimg.jpg',2),
	 ('2024-08-22 12:04:41','[부스트캠프 9기 멤버십] 수료생과의 밋업',0,'https://laurent.tistory.com/entry/부스트캠프-9기-멤버십-수료생과의-밋업','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FMVDPH%2FbtsJb6iLOFj%2Fd1du0CyDy1djGk9Wf3ndbK%2Fimg.png',2);
INSERT INTO feed (created_at,title,view_count,`path`,thumbnail,blog_id) VALUES
	 ('2024-08-11 12:27:57','네이버 부스트캠프 9기 챌린지 회고',0,'https://laurent.tistory.com/entry/네이버-부스트캠프-9기-챌린지-회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FMMWks%2FbtsIZW2mVH8%2Fkksak8FH1k9zGfAAPo5NX0%2Fimg.jpg',2),
	 ('2024-08-11 05:50:17','[부스트캠프 9기 챌린지] 4주차 회고',0,'https://laurent.tistory.com/entry/부스트캠프-9기-챌린지-4주차-회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbHLEx6%2FbtsI1emPYnH%2FLa1V6pjwDoZHozoFiUVlm1%2Fimg.jpg',2),
	 ('2024-08-02 09:26:06','[부스트캠프 9기 챌린지] 3주차 회고',0,'https://laurent.tistory.com/entry/부스트캠프-9기-챌린지-3주차-회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fv0hjY%2FbtsITOvtlkj%2F0T0GXiGKr6plU9fkcOYwkk%2Fimg.jpg',2),
	 ('2024-07-31 17:06:41','2024년 7월 정기회고',0,'https://laurent.tistory.com/entry/2024년-7월-정기회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fq9IWm%2FbtsJjqnfLQl%2F4kohwz3l65AUmSFI4D2J20%2Fimg.jpg',2),
	 ('2024-07-28 14:03:03','[서평] 실무로 통하는 타입스크립트',0,'https://laurent.tistory.com/entry/서평-실무로-통하는-타입스크립트','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F8eX67%2FbtsIPlOC2IU%2F2nuAWVpbEXd1arAR9MRe71%2Fimg.jpg',2),
	 ('2024-07-26 10:24:54','[부스트캠프 9기 챌린지] 2주차 회고',0,'https://laurent.tistory.com/entry/부스트캠프-9기-챌린지-2주차-회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fc4CJ77%2FbtsIPUPOczX%2FMsyquWz74cKDMvbKGsi37K%2Fimg.jpg',2),
	 ('2024-07-20 15:43:33','[부스트캠프 9기 챌린지] 수료생과의 밋업',0,'https://laurent.tistory.com/entry/부스트캠프-9기-챌린지-수료생과의-밋업','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcRhljL%2FbtsIHJ1S6gh%2F78kj3yhIVSKGbGUOB91iVk%2Fimg.jpg',2),
	 ('2024-07-19 09:30:40','[부스트캠프 9기 챌린지] 1주차 회고',0,'https://laurent.tistory.com/entry/부스트캠프-9기-챌린지-1주차-회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FuGO8u%2FbtsIG9MY4ab%2F9WMLLYBS3tZzR6h3iKfuIK%2Fimg.jpg',2),
	 ('2024-07-19 03:00:27','[서평] 문제와 해설을 한 번에 - 이기적 정보처리기사 실기 핵심 600제',0,'https://laurent.tistory.com/entry/서평-문제와-해설을-한-번에-이기적-정보처리기사-실기-핵심-600제','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FYvw9l%2FbtsIDNLtYQL%2Fu7Fbx7VohtlFEXi90yk2M1%2Fimg.png',2),
	 ('2024-07-14 09:00:26','[C언어] 문자와 문자열',0,'https://laurent.tistory.com/entry/C언어-문자와-문자열','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FtXhp1%2FbtsIz9eJRwJ%2F4igdXEjgNN5OGKRpKuLKa0%2Fimg.jpg',2);
INSERT INTO feed (created_at,title,view_count,`path`,thumbnail,blog_id) VALUES
	 ('2024-07-13 05:37:07','[서평] 테스트 개론 - 프런트엔드 개발을 위한 테스트 입문',0,'https://laurent.tistory.com/entry/서평-테스트-개론-프런트엔드-개발을-위한-테스트-입문','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fn7gN3%2FbtsIy1uUESB%2FahrYTfKoelGqbDI6LqdPGK%2Fimg.png',2),
	 ('2024-07-12 11:28:43','인프콘 2024 랠릿 허브 등록 이벤트',0,'https://laurent.tistory.com/entry/인프콘-2024-랠릿-허브-등록-이벤트','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FqWtzj%2FbtsIy5jkhJQ%2F1AVJpBTtwKcyxliewua34K%2Fimg.jpg',2),
	 ('2024-07-06 15:00:42','네이버 부스트캠프 9기 베이직 + 2차 문제 해결력 테스트 회고',0,'https://laurent.tistory.com/entry/네이버-부스트캠프-9기-베이직-2차-문제-해결력-테스트-회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FmPLDo%2FbtsIo65xUjY%2FKA2gq1K4dkue2D1Bxt8xS1%2Fimg.jpg',2),
	 ('2024-07-04 18:22:54','[서평] 그림으로 쉽고 빠르게 배우는 - AWS 시스템 개발 스킬업',0,'https://laurent.tistory.com/entry/서평-그림으로-쉽고-빠르게-배우는-AWS-시스템-개발-스킬업','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FrBlJ2%2FbtsInLNet1p%2Fs0RCF5VbRNzywH9LxocHz0%2Fimg.png',2),
	 ('2024-06-30 13:00:59','2024년 6월 정기회고',0,'https://laurent.tistory.com/entry/2024년-6월-정기회고','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FCMgsb%2FbtsIixtRGu5%2FMb4UuXsK1Kliv6JE2A2q3k%2Fimg.jpg',2),
	 ('2025-01-08 11:57:16','프론트엔드 단위 테스트 이해하기',3,'https://laurent.tistory.com/entry/프론트엔드-단위-테스트-이해하기','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbi6Ai4%2FbtsLHpmHc17%2FPPfyHuka096AmSwXchKK21%2Fimg.jpg',2),
	 ('2025-01-11 06:28:52','[Network] OSI Model과 7 Layer 별 장비',1,'https://laurent.tistory.com/entry/Network-OSI-Model과-7-Layer-별-장비','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcnEMAv%2FbtsLJcn0jw1%2FZZZ3LXNzrEPCfFvvBCgN50%2Fimg.jpg',2),
	 ('2025-01-15 23:12:08','시나리오 구성 및 테스트 코드 작성',3,'https://laurent.tistory.com/entry/시나리오-구성-및-테스트-코드-작성','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FCGsNc%2FbtsLOXb7DRZ%2FAahZMI6epsYhKCYOLjnoHK%2Fimg.png',2),
	 ('2025-01-19 04:05:51','테스트 커버리지가 제대로 인식되지 않는 현상 해결',1,'https://laurent.tistory.com/entry/테스트-커버리지가-제대로-인식되지-않는-현상-해결','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbDOJJC%2FbtsLTHlFiOc%2FAUsjbbbcIRZ5r8CQZX6wJK%2Fimg.jpg',2),
	 ('2024-12-30 08:33:30','LeetCode - Numberof Different Integer in a String',0,'https://tunaspace.tistory.com/entry/LeetCode-Numberof-Different-Integer-in-a-String','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Ftistory_admin%2Fstatic%2Fimages%2FopenGraph%2Fopengraph.png',3);
INSERT INTO feed (created_at,title,view_count,`path`,thumbnail,blog_id) VALUES
	 ('2024-12-27 15:10:31','LeetCode - Restore IP Addresses',0,'https://tunaspace.tistory.com/entry/LeetCode-Restore-IP-Addresses','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Ftistory_admin%2Fstatic%2Fimages%2FopenGraph%2Fopengraph.png',3),
	 ('2024-12-25 14:22:20','LeetCode - Path Sum',0,'https://tunaspace.tistory.com/entry/LeetCode-Path-Sum','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Ftistory_admin%2Fstatic%2Fimages%2FopenGraph%2Fopengraph.png',3),
	 ('2024-12-23 12:50:04','LeetCode - Maximum Average Subarray 1',0,'https://tunaspace.tistory.com/entry/LeetCode-Maximum-Average-Subarray-1','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Ftistory_admin%2Fstatic%2Fimages%2FopenGraph%2Fopengraph.png',4),
	 ('2024-09-30 09:42:54','바닐라 JS로 리액트 만들기 - 4',0,'https://tunaspace.tistory.com/entry/바닐라-JS로-리액트-만들기-4','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Ftistory_admin%2Fstatic%2Fimages%2FopenGraph%2Fopengraph.png',3),
	 ('2024-09-24 14:57:44','바닐라 JS로 리액트 만들기 - 3',0,'https://tunaspace.tistory.com/entry/바닐라-JS로-리액트-만들기-3','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Ftistory_admin%2Fstatic%2Fimages%2FopenGraph%2Fopengraph.png',3),
	 ('2024-09-24 13:44:17','바닐라 JS로 리액트 만들기 - 2',0,'https://tunaspace.tistory.com/entry/바닐라-JS로-리액트-만들기-2','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Ftistory_admin%2Fstatic%2Fimages%2FopenGraph%2Fopengraph.png',3),
	 ('2024-09-24 13:16:56','바닐라 JS로 리액트 만들기 - 1',0,'https://tunaspace.tistory.com/entry/바닐라-JS로-리액트-만들기-1','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Ftistory_admin%2Fstatic%2Fimages%2FopenGraph%2Fopengraph.png',3),
	 ('2024-09-23 11:55:19','SPA란?',0,'https://tunaspace.tistory.com/entry/SPA란','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fd0TiaW%2FbtsJIftdEP2%2F4oyi8Qp8XKmNApDdQCvpP0%2Fimg.png',4),
	 ('2024-09-01 06:04:50','TASKIFY Day-5 학습정리',0,'https://tunaspace.tistory.com/entry/TASKIFY-Day-학습정리','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcSmcvY%2FbtsJnGwsPa6%2FZFfRmwJMhO1RZsTRq3mUEK%2Fimg.gif',3),
	 ('2025-01-02 12:44:14','LeetCode - Set Matrix Zeroes',1,'https://tunaspace.tistory.com/entry/LeetCode-Set-Matrix-Zeroes','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Ftistory_admin%2Fstatic%2Fimages%2FopenGraph%2Fopengraph.png',3);
INSERT INTO feed (created_at,title,view_count,`path`,thumbnail,blog_id) VALUES
	 ('2025-01-02 12:37:25','LeetCode - Minimum Add to Make Parentheses Valid',0,'https://tunaspace.tistory.com/entry/LeetCode-Minimum-Add-to-Make-Parentheses-Valid','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Ftistory_admin%2Fstatic%2Fimages%2FopenGraph%2Fopengraph.png',3),
	 ('2025-01-04 13:35:45','HTML의 역사',5,'https://tunaspace.tistory.com/entry/HTML의-역사','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FBDgk9%2FbtsLDO7Er25%2Fd5tF9fS5KYWrkoJ8sKv4CK%2Fimg.png',3),
	 ('2025-01-15 16:12:24','[네트워크] 네크워크 기초',6,'https://tunaspace.tistory.com/entry/네트워크-네크워크-기초','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FdZuK6y%2FbtsLP4Vv2dw%2FoKp9rKYtYglrzkdzxBzrWk%2Fimg.png',3),
	 ('2024-12-22 10:15:29','네이버 클라우드 플랫폼(Ncloud) 사용 후기',0,'https://asn6878.tistory.com/13','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fzmjo1%2FbtsLqzQ9Ovg%2FDXjqkrNmllwBqkxzKSPGJ1%2Fimg.png',4),
	 ('2024-12-11 13:23:29','부스트캠프 웹・모바일 9기 멤버십 과정 회고',0,'https://asn6878.tistory.com/12','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Frd4s6%2FbtsLd7tRHtG%2FzLdrkltHSjDkctSq1O9Rf1%2Fimg.png',4),
	 ('2024-09-22 23:00:51','자바스크립트의 구조와 실행 방식 (Ignition, TurboFan, EventLoop)',0,'https://asn6878.tistory.com/9','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F2wH52%2FbtsJIskiFgS%2FQlF4XqMVZsM8y51w67dxj1%2Fimg.png',4),
	 ('2024-08-15 17:37:32','부스트캠프 웹・모바일 9기 챌린지 과정 회고',0,'https://asn6878.tistory.com/8','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F5oZKx%2FbtsI2pi4Vdz%2FlK6ITtEr1foWfmEGGBBDW0%2Fimg.png',4),
	 ('2024-08-04 08:32:17','페어(짝) 프로그래밍에 대해서',0,'https://asn6878.tistory.com/7','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fo0I0n%2FbtsITiXYkG9%2FhpD50L7TcKlhU08D2jok4k%2Fimg.jpg',4),
	 ('2024-07-06 19:20:07','2024 네이버 부스트캠프 웹 · 모바일 2차 코딩테스트 후기',0,'https://asn6878.tistory.com/6','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FzvZIm%2FbtsIpvcWnzY%2FnkR2JuxsNhKIyeeKHnMo1k%2Fimg.png',4),
	 ('2024-05-22 16:19:34','코딩테스트 준비를 위한 Java 입출력 정리',0,'https://asn6878.tistory.com/5','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FYY34s%2FbtsHykim0k7%2FT7YBZJfvIEKvPmtLbXJkIk%2Fimg.png',4);
INSERT INTO feed (created_at,title,view_count,`path`,thumbnail,blog_id) VALUES
	 ('2024-05-03 16:30:23','[Docker] 간단한 도커 명령어 모음집',2,'https://asn6878.tistory.com/4','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcI3y45%2FbtsHcIbDPUe%2FpWNfGE2V3YX35MauB1Hb60%2Fimg.gif',4),
	 ('2024-03-10 08:49:55','Java record 에 대하여',0,'https://asn6878.tistory.com/3','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FddtCkc%2FbtsFGEvHLSY%2FIPqWLZZfYlojZyLCB4dPg1%2Fimg.gif',4),
	 ('2024-01-04 11:37:46','인증(Authentication)과 인가(Authorization)의 개념에 대해',0,'https://asn6878.tistory.com/2','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fb4Psk9%2FbtsC00h6SuP%2FZp2x8yPLdLLheMrGqJeHG0%2Fimg.png',4),
	 ('2025-01-16 19:29:50','NestJS + TypeORM + Testcontainers 를 사용한 통합 테스트 DB환경 구축하기',3,'https://asn6878.tistory.com/14','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F2GhHh%2FbtsLPtpiK1d%2FtKiZjT4WEVz1sy4LIgFDn1%2Fimg.png',4),
	 ('2025-01-18 07:12:05','자바 vs 노드 당신의 선택은?!',4,'https://asn6878.tistory.com/15','https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FdofQSP%2FbtsLKJyhso1%2FREdhKR9vDlzDYREytkK0v1%2Fimg.png',4);
