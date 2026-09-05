CREATE TABLE "users" (
	"user_id"	BIGINT		NOT NULL,
	"profile_image_url"	VARCHAR(100)		NULL,
	"nickname"	VARCHAR(200)		NOT NULL,
	"user_role"	VARCHAR(20)	DEFAULT 'USER'	NOT NULL,
	"created_at"	TIMESTAMPTZ		NOT NULL,
	"updated_at"	TIMESTAMPTZ		NOT NULL,
	"deleted_at"	TIMESTAMPTZ		NULL,
	"user_status"	VARCHAR(20)	DEFAULT 'ACTIVE'	NOT NULL
);

CREATE TABLE "reports" (
	"report_id"	BIGINT		NOT NULL,
	"reporter_user_id"	BIGINT		NOT NULL,
	"reported_user_id"	BIGINT		NOT NULL,
	"reported_item_id"	BIGINT		NULL,
	"reported_chat_room_id"	BIGINT		NULL,
	"content"	VARCHAR(1000)		NOT NULL,
	"report_status"	VARCHAR(20)	DEFAULT 'RECEIVED'	NOT NULL,
	"created_at"	TIMESTAMPTZ		NOT NULL,
	"updated_at"	TIMESTAMPTZ		NULL
);

CREATE TABLE "search_histories" (
	"search_history_id"	BIGINT		NOT NULL,
	"user_id"	BIGINT		NOT NULL,
	"keyword"	VARCHAR(100)		NULL,
	"last_searched_at"	TIMESTAMPTZ		NOT NULL,
	"created_at"	TIMESTAMPTZ		NOT NULL
);

CREATE TABLE "group_members" (
	"group_members_id"	BIGINT		NOT NULL,
	"group_id"	BIGINT		NOT NULL,
	"user_id"	BIGINT		NOT NULL,
	"location_verified_at"	TIMESTAMPTZ		NOT NULL,
	"left_at"	TIMESTAMPTZ		NULL,
	"user_status"	VARCHAR(20)	DEFAULT 'ACTIVE'	NOT NULL,
	"created_at"	TIMESTAMPTZ		NOT NULL,
	"deleted_at"	TIMESTAMPTZ		NULL
);

CREATE TABLE "exchange_requests" (
	"exchange_request_id"	BIGINT		NOT NULL,
	"user_id"	BIGINT		NOT NULL,
	"item_id"	BIGINT		NOT NULL,
	"requested_quantity"	INTEGER	DEFAULT 1	NOT NULL,
	"requested_status"	VARCHAR(20)		NOT NULL,
	"created_at"	TIMESTAMPTZ		NOT NULL,
	"updated_at"	TIMESTAMPTZ		NULL,
	"deleted_at"	TIMESTAMPTZ		NULL
);

CREATE TABLE "item_stats" (
	"item_id"	BIGINT		NOT NULL,
	"view_count"	BIGINT	DEFAULT 0	NOT NULL,
	"like_count"	BIGINT	DEFAULT 0	NOT NULL,
	"created_at"	TIMESTAMPTZ		NOT NULL
);

CREATE TABLE "exchange_request_items" (
	"exchange_request_items_id"	BIGINT		NOT NULL,
	"exchange_request_id"	BIGINT		NOT NULL,
	"item_id"	BIGINT		NOT NULL,
	"quantity"	INTEGER	DEFAULT 1	NOT NULL,
	"created_at"	TIMESTAMPTZ		NOT NULL,
	"deleted_at"	TIMESTAMPTZ		NULL
);

CREATE TABLE "user_survey_answer" (
	"user_survey_id"	BIGINT		NOT NULL,
	"user_id"	BIGINT		NOT NULL,
	"question"	VARCHAR(20)		NOT NULL,
	"answer"	VARCHAR(20)		NOT NULL,
	"created_at"	TIMESTAMPTZ		NOT NULL
);

CREATE TABLE "chat_members" (
	"chat_members_id"	BIGINT		NOT NULL,
	"chat_room_id"	BIGINT		NOT NULL,
	"user_id"	BIGINT		NOT NULL,
	"member_role"	VARCHAR(20)		NOT NULL,
	"created_at"	TIMESTAMPTZ		NOT NULL,
	"left_at"	TIMESTAMPTZ		NULL
);

CREATE TABLE "report_action" (
	"report_action_id"	BIGINT		NOT NULL,
	"user_id"	BIGINT		NOT NULL,
	"report_id"	BIGINT		NOT NULL,
	"action_type"	VARCHAR(20)		NOT NULL,
	"action_reason"	TEXT		NOT NULL,
	"action_started_at"	TIMESTAMPTZ		NULL,
	"action_ended_at"	TIMESTAMPTZ		NULL,
	"warning_count_at_action"	INTEGER		NULL,
	"created_at"	TIMESTAMPTZ		NOT NULL
);

CREATE TABLE "item_likes" (
	"item_like_id"	BIGINT		NOT NULL,
	"item_id"	BIGINT		NOT NULL,
	"user_id"	BIGINT		NOT NULL,
	"created_at"	TIMESTAMPTZ		NOT NULL
);

CREATE TABLE "inquiries" (
	"inquiry_id"	BIGINT		NOT NULL,
	"inquirer_user_id"	BIGINT		NOT NULL,
	"admin_user_id"	BIGINT		NULL,
	"title"	VARCHAR(50)		NOT NULL,
	"content"	VARCHAR(1000)		NOT NULL,
	"inquiry_status"	VARCHAR(20)	DEFAULT 'PENDING'	NOT NULL,
	"answer"	TEXT		NULL,
	"created_at"	TIMESTAMPTZ		NOT NULL,
	"updated_at"	TIMESTAMPTZ		NULL
);

CREATE TABLE "groups" (
	"group_id"	BIGINT		NOT NULL,
	"group_name"	VARCHAR(100)		NOT NULL,
	"road_address"	VARCHAR(100)		NOT NULL,
	"group_longitude"	NUMERIC(9, 6)		NOT NULL,
	"group_latitude"	NUMERIC(9, 6)		NOT NULL,
	"group_content"	TEXT		NOT NULL,
	"created_at"	TIMESTAMPTZ		NOT NULL
);

CREATE TABLE "item_views" (
	"item_view_id"	BIGINT		NOT NULL,
	"item_id"	BIGINT		NOT NULL,
	"user_id"	BIGINT		NOT NULL,
	"last_counted_at"	TIMESTAMPTZ		NOT NULL,
	"created_at"	TIMESTAMPTZ		NOT NULL
);

CREATE TABLE "group_items" (
	"group_item_id"	BIGINT		NOT NULL,
	"group_id"	BIGINT		NOT NULL,
	"item_id"	BIGINT		NOT NULL,
	"created_at"	TIMESTAMPTZ		NOT NULL,
	"deleted_at"	TIMESTAMPTZ		NULL
);

CREATE TABLE "refresh_tokens" (
	"refresh_token_id"	BIGINT		NOT NULL,
	"user_id"	BIGINT		NOT NULL,
	"token_hash"	VARCHAR(255)		NOT NULL,
	"expires_at"	TIMESTAMPTZ		NOT NULL,
	"created_at"	TIMESTAMPTZ		NOT NULL,
	"revoked_at"	TIMESTAMPTZ		NULL
);

CREATE TABLE "social_account" (
	"social_account_id"	BIGINT		NOT NULL,
	"user_id"	BIGINT		NOT NULL,
	"provider"	VARCHAR(20)		NOT NULL,
	"provider_user_id"	VARCHAR(255)		NOT NULL,
	"linked_at"	TIMESTAMPTZ		NOT NULL,
	"last_login_at"	TIMESTAMPTZ		NOT NULL
);

CREATE TABLE "items" (
	"item_id"	BIGINT		NOT NULL,
	"user_id"	BIGINT		NOT NULL,
	"quantity"	INTEGER	DEFAULT 1	NOT NULL,
	"item_state"	VARCHAR(20)	DEFAULT 'AVAILABLE'	NOT NULL,
	"title"	VARCHAR(100)		NOT NULL,
	"content"	VARCHAR(2000)		NOT NULL,
	"min_unit_price"	BIGINT	DEFAULT 0	NOT NULL,
	"max_unit_price"	BIGINT	DEFAULT 0	NOT NULL,
	"exchange_urgency_score"	NUMERIC(3, 2)	DEFAULT 0.50	NOT NULL,
	"value_gap_tolerance_score"	NUMERIC(3, 2)	DEFAULT 0.50	NOT NULL,
	"created_at"	TIMESTAMPTZ		NOT NULL,
	"updated_at"	TIMESTAMPTZ		NOT NULL,
	"deleted_at"	TIMESTAMPTZ		NULL
);

CREATE TABLE "chat_rooms" (
	"chat_room_id"	BIGINT		NOT NULL,
	"exchange_request_id"	BIGINT		NOT NULL,
	"chat_room_status"	VARCHAR(20)	DEFAULT 'OPEN'	NOT NULL,
	"last_message_at"	TIMESTAMPTZ		NOT NULL,
	"created_at"	TIMESTAMPTZ		NOT NULL,
	"deleted_at"	TIMESTAMPTZ		NULL
);

CREATE TABLE "chat_messages" (
	"message_id"	BIGINT		NOT NULL,
	"chat_room_id"	BIGINT		NOT NULL,
	"user_id"	BIGINT		NOT NULL,
	"content"	TEXT		NOT NULL,
	"created_at"	TIMESTAMPTZ		NOT NULL,
	"message_type"	VARCHAR(20)	DEFAULT 'TEXT'	NOT NULL
);

CREATE TABLE "images" (
	"image_id"	BIGINT		NOT NULL,
	"item_id"	BIGINT		NULL,
	"report_id"	BIGINT		NULL,
	"image_url"	TEXT		NOT NULL,
	"created_at"	TIMESTAMPTZ		NOT NULL
);

CREATE TABLE "chat_member_read_states" (
	"chat_member_read_states_id"	BIGINT		NOT NULL,
	"chat_members_id"	BIGINT		NOT NULL,
	"message_id"	BIGINT		NOT NULL,
	"last_read_at"	TIMESTAMPTZ		NOT NULL
);

ALTER TABLE "users" ADD CONSTRAINT "PK_USERS" PRIMARY KEY (
	"user_id"
);

ALTER TABLE "reports" ADD CONSTRAINT "PK_REPORTS" PRIMARY KEY (
	"report_id"
);

ALTER TABLE "search_histories" ADD CONSTRAINT "PK_SEARCH_HISTORIES" PRIMARY KEY (
	"search_history_id"
);

ALTER TABLE "group_members" ADD CONSTRAINT "PK_GROUP_MEMBERS" PRIMARY KEY (
	"group_members_id"
);

ALTER TABLE "exchange_requests" ADD CONSTRAINT "PK_EXCHANGE_REQUESTS" PRIMARY KEY (
	"exchange_request_id"
);

ALTER TABLE "item_stats" ADD CONSTRAINT "PK_ITEM_STATS" PRIMARY KEY (
	"item_id"
);

ALTER TABLE "exchange_request_items" ADD CONSTRAINT "PK_EXCHANGE_REQUEST_ITEMS" PRIMARY KEY (
	"exchange_request_items_id"
);

ALTER TABLE "user_survey_answer" ADD CONSTRAINT "PK_USER_SURVEY_ANSWER" PRIMARY KEY (
	"user_survey_id"
);

ALTER TABLE "chat_members" ADD CONSTRAINT "PK_CHAT_MEMBERS" PRIMARY KEY (
	"chat_members_id"
);

ALTER TABLE "report_action" ADD CONSTRAINT "PK_REPORT_ACTION" PRIMARY KEY (
	"report_action_id"
);

ALTER TABLE "item_likes" ADD CONSTRAINT "PK_ITEM_LIKES" PRIMARY KEY (
	"item_like_id"
);

ALTER TABLE "inquiries" ADD CONSTRAINT "PK_INQUIRIES" PRIMARY KEY (
	"inquiry_id"
);

ALTER TABLE "groups" ADD CONSTRAINT "PK_GROUPS" PRIMARY KEY (
	"group_id"
);

ALTER TABLE "item_views" ADD CONSTRAINT "PK_ITEM_VIEWS" PRIMARY KEY (
	"item_view_id"
);

ALTER TABLE "group_items" ADD CONSTRAINT "PK_GROUP_ITEMS" PRIMARY KEY (
	"group_items_id"
);

ALTER TABLE "refresh_tokens" ADD CONSTRAINT "PK_REFRESH_TOKENS" PRIMARY KEY (
	"refresh_token_id"
);

ALTER TABLE "social_account" ADD CONSTRAINT "PK_SOCIAL_ACCOUNT" PRIMARY KEY (
	"social_account_id"
);

ALTER TABLE "items" ADD CONSTRAINT "PK_ITEMS" PRIMARY KEY (
	"item_id"
);

ALTER TABLE "chat_rooms" ADD CONSTRAINT "PK_CHAT_ROOMS" PRIMARY KEY (
	"chat_room_id"
);

ALTER TABLE "chat_messages" ADD CONSTRAINT "PK_CHAT_MESSAGES" PRIMARY KEY (
	"message_id"
);

ALTER TABLE "images" ADD CONSTRAINT "PK_IMAGES" PRIMARY KEY (
	"image_id"
);

ALTER TABLE "chat_member_read_states" ADD CONSTRAINT "PK_CHAT_MEMBER_READ_STATES" PRIMARY KEY (
	"chat_member_read_states_id"
);

ALTER TABLE "reports" ADD CONSTRAINT "FK_users_TO_reports_1" FOREIGN KEY (
	"reporter_user_id"
)
REFERENCES "users" (
	"user_id"
);

ALTER TABLE "reports" ADD CONSTRAINT "FK_users_TO_reports_2" FOREIGN KEY (
	"reported_user_id"
)
REFERENCES "users" (
	"user_id"
);

ALTER TABLE "reports" ADD CONSTRAINT "FK_items_TO_reports_1" FOREIGN KEY (
	"reported_item_id"
)
REFERENCES "items" (
	"item_id"
);

ALTER TABLE "reports" ADD CONSTRAINT "FK_chat_rooms_TO_reports_1" FOREIGN KEY (
	"reported_chat_room_id"
)
REFERENCES "chat_rooms" (
	"chat_room_id"
);

ALTER TABLE "search_histories" ADD CONSTRAINT "FK_users_TO_search_histories_1" FOREIGN KEY (
	"user_id"
)
REFERENCES "users" (
	"user_id"
);

ALTER TABLE "group_members" ADD CONSTRAINT "FK_groups_TO_group_members_1" FOREIGN KEY (
	"group_id"
)
REFERENCES "groups" (
	"group_id"
);

ALTER TABLE "group_members" ADD CONSTRAINT "FK_users_TO_group_members_1" FOREIGN KEY (
	"user_id"
)
REFERENCES "users" (
	"user_id"
);

ALTER TABLE "exchange_requests" ADD CONSTRAINT "FK_users_TO_exchange_requests_1" FOREIGN KEY (
	"user_id"
)
REFERENCES "users" (
	"user_id"
);

ALTER TABLE "exchange_requests" ADD CONSTRAINT "FK_items_TO_exchange_requests_1" FOREIGN KEY (
	"item_id"
)
REFERENCES "items" (
	"item_id"
);

ALTER TABLE "item_stats" ADD CONSTRAINT "FK_items_TO_item_stats_1" FOREIGN KEY (
	"item_id"
)
REFERENCES "items" (
	"item_id"
);

ALTER TABLE "exchange_request_items" ADD CONSTRAINT "FK_exchange_requests_TO_exchange_request_items_1" FOREIGN KEY (
	"exchange_request_id"
)
REFERENCES "exchange_requests" (
	"exchange_request_id"
);

ALTER TABLE "exchange_request_items" ADD CONSTRAINT "FK_items_TO_exchange_request_items_1" FOREIGN KEY (
	"item_id"
)
REFERENCES "items" (
	"item_id"
);

ALTER TABLE "user_survey_answer" ADD CONSTRAINT "FK_users_TO_user_survey_answer_1" FOREIGN KEY (
	"user_id"
)
REFERENCES "users" (
	"user_id"
);

ALTER TABLE "chat_members" ADD CONSTRAINT "FK_chat_rooms_TO_chat_members_1" FOREIGN KEY (
	"chat_room_id"
)
REFERENCES "chat_rooms" (
	"chat_room_id"
);

ALTER TABLE "chat_members" ADD CONSTRAINT "FK_users_TO_chat_members_1" FOREIGN KEY (
	"user_id"
)
REFERENCES "users" (
	"user_id"
);

ALTER TABLE "report_action" ADD CONSTRAINT "FK_users_TO_report_action_1" FOREIGN KEY (
	"user_id"
)
REFERENCES "users" (
	"user_id"
);

ALTER TABLE "report_action" ADD CONSTRAINT "FK_reports_TO_report_action_1" FOREIGN KEY (
	"report_id"
)
REFERENCES "reports" (
	"report_id"
);

ALTER TABLE "item_likes" ADD CONSTRAINT "FK_items_TO_item_likes_1" FOREIGN KEY (
	"item_id"
)
REFERENCES "items" (
	"item_id"
);

ALTER TABLE "item_likes" ADD CONSTRAINT "FK_users_TO_item_likes_1" FOREIGN KEY (
	"user_id"
)
REFERENCES "users" (
	"user_id"
);

ALTER TABLE "inquiries" ADD CONSTRAINT "FK_users_TO_inquiries_1" FOREIGN KEY (
	"inquirer_user_id"
)
REFERENCES "users" (
	"user_id"
);

ALTER TABLE "inquiries" ADD CONSTRAINT "FK_users_TO_inquiries_2" FOREIGN KEY (
	"admin_user_id"
)
REFERENCES "users" (
	"user_id"
);

ALTER TABLE "item_views" ADD CONSTRAINT "FK_items_TO_item_views_1" FOREIGN KEY (
	"item_id"
)
REFERENCES "items" (
	"item_id"
);

ALTER TABLE "item_views" ADD CONSTRAINT "FK_users_TO_item_views_1" FOREIGN KEY (
	"user_id"
)
REFERENCES "users" (
	"user_id"
);

ALTER TABLE "group_items" ADD CONSTRAINT "FK_groups_TO_group_items_1" FOREIGN KEY (
	"group_id"
)
REFERENCES "groups" (
	"group_id"
);

ALTER TABLE "group_items" ADD CONSTRAINT "FK_items_TO_group_items_1" FOREIGN KEY (
	"item_id"
)
REFERENCES "items" (
	"item_id"
);

ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_users_TO_refresh_tokens_1" FOREIGN KEY (
	"user_id"
)
REFERENCES "users" (
	"user_id"
);

ALTER TABLE "social_account" ADD CONSTRAINT "FK_users_TO_social_account_1" FOREIGN KEY (
	"user_id"
)
REFERENCES "users" (
	"user_id"
);

ALTER TABLE "items" ADD CONSTRAINT "FK_users_TO_items_1" FOREIGN KEY (
	"user_id"
)
REFERENCES "users" (
	"user_id"
);

ALTER TABLE "chat_rooms" ADD CONSTRAINT "FK_exchange_requests_TO_chat_rooms_1" FOREIGN KEY (
	"exchange_request_id"
)
REFERENCES "exchange_requests" (
	"exchange_request_id"
);

ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_chat_rooms_TO_chat_messages_1" FOREIGN KEY (
	"chat_room_id"
)
REFERENCES "chat_rooms" (
	"chat_room_id"
);

ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_users_TO_chat_messages_1" FOREIGN KEY (
	"user_id"
)
REFERENCES "users" (
	"user_id"
);

ALTER TABLE "images" ADD CONSTRAINT "FK_items_TO_images_1" FOREIGN KEY (
	"item_id"
)
REFERENCES "items" (
	"item_id"
);

ALTER TABLE "images" ADD CONSTRAINT "FK_reports_TO_images_1" FOREIGN KEY (
	"report_id"
)
REFERENCES "reports" (
	"report_id"
);

ALTER TABLE "chat_member_read_states" ADD CONSTRAINT "FK_chat_members_TO_chat_member_read_states_1" FOREIGN KEY (
	"chat_members_id"
)
REFERENCES "chat_members" (
	"chat_members_id"
);

ALTER TABLE "chat_member_read_states" ADD CONSTRAINT "FK_chat_messages_TO_chat_member_read_states_1" FOREIGN KEY (
	"message_id"
)
REFERENCES "chat_messages" (
	"message_id"
);

