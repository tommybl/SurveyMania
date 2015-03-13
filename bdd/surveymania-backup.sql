--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: surveymania; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA surveymania;


SET search_path = surveymania, pg_catalog;

SET default_with_oids = false;

--
-- Name: achievements; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE achievements (
    id integer NOT NULL,
    name character varying(45) NOT NULL,
    image_path character varying(255) NOT NULL,
    description character varying(255) NOT NULL
);


--
-- Name: achievements_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE achievements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE achievements_id_seq OWNED BY achievements.id;


--
-- Name: answers; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE answers (
    id integer NOT NULL,
    user_id integer NOT NULL,
    question_option_id integer NOT NULL,
    answer_num integer,
    answer_text character varying(255) DEFAULT NULL::character varying
);


--
-- Name: answers_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE answers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: answers_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE answers_id_seq OWNED BY answers.id;


--
-- Name: cashier; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE cashier (
    id integer NOT NULL,
    organization_id integer NOT NULL,
    code character varying(15) NOT NULL,
    num integer NOT NULL,
    password character varying(255) NOT NULL
);


--
-- Name: cashier_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE cashier_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cashier_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE cashier_id_seq OWNED BY cashier.id;


--
-- Name: dashboards; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE dashboards (
    id integer NOT NULL,
    survey_id integer NOT NULL
);


--
-- Name: dashboards_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE dashboards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dashboards_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE dashboards_id_seq OWNED BY dashboards.id;


--
-- Name: discount; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE discount (
    id integer NOT NULL,
    discount_price integer NOT NULL,
    discount_perc integer,
    creation_dt timestamp without time zone NOT NULL,
    barcode integer NOT NULL,
    image_path character varying(255) DEFAULT NULL::character varying,
    available boolean NOT NULL
);


--
-- Name: discount_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE discount_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: discount_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE discount_id_seq OWNED BY discount.id;


--
-- Name: input_types; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE input_types (
    id integer NOT NULL,
    type_name character varying(45) NOT NULL
);


--
-- Name: input_types_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE input_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: input_types_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE input_types_id_seq OWNED BY input_types.id;


--
-- Name: option_choices; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE option_choices (
    id integer NOT NULL,
    option_group_id integer NOT NULL,
    choice_name character varying(45) NOT NULL
);


--
-- Name: option_choices_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE option_choices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: option_choices_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE option_choices_id_seq OWNED BY option_choices.id;


--
-- Name: option_groups; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE option_groups (
    id integer NOT NULL,
    group_name character varying(45) NOT NULL
);


--
-- Name: option_groups_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE option_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: option_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE option_groups_id_seq OWNED BY option_groups.id;


--
-- Name: organizations; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE organizations (
    id integer NOT NULL,
    name character varying(80) NOT NULL,
    description character varying(4096) NOT NULL,
    adress character varying(255) NOT NULL,
    telephone character varying(20) NOT NULL,
    logo_path character varying(255) NOT NULL,
    url_add_discount character varying(255) NOT NULL,
    url_verify_discount character varying(255) NOT NULL,
    url_remove_discount character varying(255) NOT NULL,
    current_points integer NOT NULL
);


--
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE organizations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE organizations_id_seq OWNED BY organizations.id;


--
-- Name: question_medias; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE question_medias (
    id integer NOT NULL,
    question_id integer NOT NULL,
    media_path character varying(255) NOT NULL,
    media_order integer NOT NULL,
    media_type character varying(5) NOT NULL
);


--
-- Name: question_medias_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE question_medias_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: question_medias_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE question_medias_id_seq OWNED BY question_medias.id;


--
-- Name: question_options; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE question_options (
    id integer NOT NULL,
    question_id integer NOT NULL,
    option_choice_id integer NOT NULL
);


--
-- Name: question_options_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE question_options_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: question_options_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE question_options_id_seq OWNED BY question_options.id;


--
-- Name: questions; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE questions (
    id integer NOT NULL,
    survey_section_id integer NOT NULL,
    input_type_id integer NOT NULL,
    option_group_id integer,
    unit_measure_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(500) DEFAULT NULL::character varying,
    required boolean NOT NULL,
    multiple_answers boolean NOT NULL
);


--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE questions_id_seq OWNED BY questions.id;


--
-- Name: survey_comments; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE survey_comments (
    id integer NOT NULL,
    header_id integer NOT NULL,
    user_id integer NOT NULL,
    comment character varying(4096) NOT NULL
);


--
-- Name: survey_comments_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE survey_comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: survey_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE survey_comments_id_seq OWNED BY survey_comments.id;


--
-- Name: survey_headers; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE survey_headers (
    id integer NOT NULL,
    organization_id integer NOT NULL,
    theme_id integer NOT NULL,
    name character varying(80) NOT NULL,
    instructions character varying(4096) DEFAULT NULL::character varying,
    info character varying(255) DEFAULT NULL::character varying,
    points integer NOT NULL
);


--
-- Name: survey_headers_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE survey_headers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: survey_headers_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE survey_headers_id_seq OWNED BY survey_headers.id;


--
-- Name: survey_sections; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE survey_sections (
    id integer NOT NULL,
    header_id integer NOT NULL,
    title character varying(80) NOT NULL,
    subtitle character varying(80) DEFAULT NULL::character varying,
    required boolean NOT NULL
);


--
-- Name: survey_sections_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE survey_sections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: survey_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE survey_sections_id_seq OWNED BY survey_sections.id;


--
-- Name: survey_themes; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE survey_themes (
    id integer NOT NULL,
    theme_name character varying(45) NOT NULL
);


--
-- Name: survey_themes_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE survey_themes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: survey_themes_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE survey_themes_id_seq OWNED BY survey_themes.id;


--
-- Name: surveys_discounts; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE surveys_discounts (
    id integer NOT NULL,
    survey_id integer NOT NULL,
    discount_id integer NOT NULL
);


--
-- Name: surveys_discounts_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE surveys_discounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: surveys_discounts_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE surveys_discounts_id_seq OWNED BY surveys_discounts.id;


--
-- Name: units_measure; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE units_measure (
    id integer NOT NULL,
    measure_name character varying(45) NOT NULL
);


--
-- Name: units_measure_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE units_measure_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: units_measure_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE units_measure_id_seq OWNED BY units_measure.id;


--
-- Name: user_achievements; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE user_achievements (
    id integer NOT NULL,
    user_id integer NOT NULL,
    achiev_id integer NOT NULL,
    recieved_dt timestamp without time zone NOT NULL
);


--
-- Name: user_achievements_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE user_achievements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE user_achievements_id_seq OWNED BY user_achievements.id;


--
-- Name: user_discounts; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE user_discounts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    discount_id integer NOT NULL,
    recieved_dt timestamp without time zone NOT NULL,
    used_dt timestamp without time zone,
    used boolean NOT NULL
);


--
-- Name: user_discounts_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE user_discounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_discounts_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE user_discounts_id_seq OWNED BY user_discounts.id;


--
-- Name: user_survey_sections; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE user_survey_sections (
    id integer NOT NULL,
    user_id integer NOT NULL,
    section_id integer NOT NULL,
    completed timestamp without time zone,
    last_modification timestamp without time zone NOT NULL,
    duration integer DEFAULT 0 NOT NULL
);


--
-- Name: user_survey_sections_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE user_survey_sections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_survey_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE user_survey_sections_id_seq OWNED BY user_survey_sections.id;


--
-- Name: user_surveys; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE user_surveys (
    id integer NOT NULL,
    user_id integer NOT NULL,
    survey_header_id integer NOT NULL,
    completed timestamp without time zone
);


--
-- Name: user_surveys_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE user_surveys_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_surveys_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE user_surveys_id_seq OWNED BY user_surveys.id;


--
-- Name: user_tokens; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE user_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    creation_dt timestamp without time zone NOT NULL,
    expiration_dt timestamp without time zone NOT NULL,
    valide boolean NOT NULL
);


--
-- Name: user_tokens_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE user_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE user_tokens_id_seq OWNED BY user_tokens.id;


--
-- Name: user_types; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE user_types (
    id integer NOT NULL,
    type_name character varying(45) NOT NULL
);


--
-- Name: user_types_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE user_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_types_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE user_types_id_seq OWNED BY user_types.id;


--
-- Name: user_verifications; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE user_verifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    code character varying(255) NOT NULL,
    creation_dt timestamp without time zone NOT NULL
);


--
-- Name: user_verifications_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE user_verifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_verifications_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE user_verifications_id_seq OWNED BY user_verifications.id;


--
-- Name: users; Type: TABLE; Schema: surveymania; Owner: -
--

CREATE TABLE users (
    id integer NOT NULL,
    email character varying(45) NOT NULL,
    password character varying(255) NOT NULL,
    user_type integer NOT NULL,
    user_organization integer,
    name character varying(45) NOT NULL,
    lastname character varying(45) NOT NULL,
    telephone character varying(45) DEFAULT NULL::character varying,
    adress character varying(255) DEFAULT NULL::character varying,
    creation_dt timestamp without time zone NOT NULL,
    last_dt timestamp without time zone NOT NULL,
    invite_dt timestamp without time zone,
    inviter_id integer,
    points integer DEFAULT 0 NOT NULL,
    verified boolean NOT NULL,
    verified_dt timestamp without time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: surveymania; Owner: -
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: surveymania; Owner: -
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY achievements ALTER COLUMN id SET DEFAULT nextval('achievements_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY answers ALTER COLUMN id SET DEFAULT nextval('answers_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY cashier ALTER COLUMN id SET DEFAULT nextval('cashier_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY dashboards ALTER COLUMN id SET DEFAULT nextval('dashboards_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY discount ALTER COLUMN id SET DEFAULT nextval('discount_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY input_types ALTER COLUMN id SET DEFAULT nextval('input_types_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY option_choices ALTER COLUMN id SET DEFAULT nextval('option_choices_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY option_groups ALTER COLUMN id SET DEFAULT nextval('option_groups_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY organizations ALTER COLUMN id SET DEFAULT nextval('organizations_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY question_medias ALTER COLUMN id SET DEFAULT nextval('question_medias_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY question_options ALTER COLUMN id SET DEFAULT nextval('question_options_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY questions ALTER COLUMN id SET DEFAULT nextval('questions_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY survey_comments ALTER COLUMN id SET DEFAULT nextval('survey_comments_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY survey_headers ALTER COLUMN id SET DEFAULT nextval('survey_headers_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY survey_sections ALTER COLUMN id SET DEFAULT nextval('survey_sections_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY survey_themes ALTER COLUMN id SET DEFAULT nextval('survey_themes_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY surveys_discounts ALTER COLUMN id SET DEFAULT nextval('surveys_discounts_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY units_measure ALTER COLUMN id SET DEFAULT nextval('units_measure_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_achievements ALTER COLUMN id SET DEFAULT nextval('user_achievements_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_discounts ALTER COLUMN id SET DEFAULT nextval('user_discounts_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_survey_sections ALTER COLUMN id SET DEFAULT nextval('user_survey_sections_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_surveys ALTER COLUMN id SET DEFAULT nextval('user_surveys_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_tokens ALTER COLUMN id SET DEFAULT nextval('user_tokens_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_types ALTER COLUMN id SET DEFAULT nextval('user_types_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_verifications ALTER COLUMN id SET DEFAULT nextval('user_verifications_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Data for Name: achievements; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: achievements_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('achievements_id_seq', 1, false);


--
-- Data for Name: answers; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: answers_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('answers_id_seq', 1, false);


--
-- Data for Name: cashier; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: cashier_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('cashier_id_seq', 1, false);


--
-- Data for Name: dashboards; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: dashboards_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('dashboards_id_seq', 1, false);


--
-- Data for Name: discount; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: discount_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('discount_id_seq', 1, false);


--
-- Data for Name: input_types; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: input_types_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('input_types_id_seq', 1, false);


--
-- Data for Name: option_choices; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: option_choices_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('option_choices_id_seq', 1, false);


--
-- Data for Name: option_groups; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: option_groups_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('option_groups_id_seq', 1, false);


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: organizations_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('organizations_id_seq', 1, false);


--
-- Data for Name: question_medias; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: question_medias_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('question_medias_id_seq', 1, false);


--
-- Data for Name: question_options; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: question_options_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('question_options_id_seq', 1, false);


--
-- Data for Name: questions; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: questions_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('questions_id_seq', 1, false);


--
-- Data for Name: survey_comments; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: survey_comments_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('survey_comments_id_seq', 1, false);


--
-- Data for Name: survey_headers; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: survey_headers_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('survey_headers_id_seq', 1, false);


--
-- Data for Name: survey_sections; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: survey_sections_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('survey_sections_id_seq', 1, false);


--
-- Data for Name: survey_themes; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: survey_themes_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('survey_themes_id_seq', 1, false);


--
-- Data for Name: surveys_discounts; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: surveys_discounts_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('surveys_discounts_id_seq', 1, false);


--
-- Data for Name: units_measure; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: units_measure_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('units_measure_id_seq', 1, false);


--
-- Data for Name: user_achievements; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: user_achievements_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('user_achievements_id_seq', 1, false);


--
-- Data for Name: user_discounts; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: user_discounts_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('user_discounts_id_seq', 1, false);


--
-- Data for Name: user_survey_sections; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: user_survey_sections_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('user_survey_sections_id_seq', 1, false);


--
-- Data for Name: user_surveys; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: user_surveys_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('user_surveys_id_seq', 1, false);


--
-- Data for Name: user_tokens; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: user_tokens_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('user_tokens_id_seq', 1, false);


--
-- Data for Name: user_types; Type: TABLE DATA; Schema: surveymania; Owner: -
--

INSERT INTO user_types VALUES (1, 'user');
INSERT INTO user_types VALUES (2, 'admin');
INSERT INTO user_types VALUES (3, 'shop_owner');
INSERT INTO user_types VALUES (4, 'shop_admin');


--
-- Name: user_types_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('user_types_id_seq', 4, true);


--
-- Data for Name: user_verifications; Type: TABLE DATA; Schema: surveymania; Owner: -
--



--
-- Name: user_verifications_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('user_verifications_id_seq', 1, false);


--
-- Data for Name: users; Type: TABLE DATA; Schema: surveymania; Owner: -
--

INSERT INTO users VALUES (2, 'tommyblopes@msn.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 1, NULL, 'Tommy', 'Lopes', '0659301096', '18 allée Henri Sellier 92800 Puteaux', '2015-03-12 18:05:06', '2015-03-12 18:05:06', NULL, NULL, 50, true, '2015-03-12 18:30:06');


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: surveymania; Owner: -
--

SELECT pg_catalog.setval('users_id_seq', 2, true);


--
-- Name: achievements_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- Name: answers_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY answers
    ADD CONSTRAINT answers_pkey PRIMARY KEY (id);


--
-- Name: cashier_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY cashier
    ADD CONSTRAINT cashier_pkey PRIMARY KEY (id);


--
-- Name: dashboards_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY dashboards
    ADD CONSTRAINT dashboards_pkey PRIMARY KEY (id);


--
-- Name: discount_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY discount
    ADD CONSTRAINT discount_pkey PRIMARY KEY (id);


--
-- Name: input_types_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY input_types
    ADD CONSTRAINT input_types_pkey PRIMARY KEY (id);


--
-- Name: option_choices_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY option_choices
    ADD CONSTRAINT option_choices_pkey PRIMARY KEY (id);


--
-- Name: option_groups_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY option_groups
    ADD CONSTRAINT option_groups_pkey PRIMARY KEY (id);


--
-- Name: organizations_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: question_medias_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY question_medias
    ADD CONSTRAINT question_medias_pkey PRIMARY KEY (id);


--
-- Name: question_options_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY question_options
    ADD CONSTRAINT question_options_pkey PRIMARY KEY (id);


--
-- Name: questions_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: survey_comments_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY survey_comments
    ADD CONSTRAINT survey_comments_pkey PRIMARY KEY (id);


--
-- Name: survey_headers_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY survey_headers
    ADD CONSTRAINT survey_headers_pkey PRIMARY KEY (id);


--
-- Name: survey_sections_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY survey_sections
    ADD CONSTRAINT survey_sections_pkey PRIMARY KEY (id);


--
-- Name: survey_themes_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY survey_themes
    ADD CONSTRAINT survey_themes_pkey PRIMARY KEY (id);


--
-- Name: surveys_discounts_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY surveys_discounts
    ADD CONSTRAINT surveys_discounts_pkey PRIMARY KEY (id);


--
-- Name: units_measure_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY units_measure
    ADD CONSTRAINT units_measure_pkey PRIMARY KEY (id);


--
-- Name: user_achievements_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: user_discounts_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_discounts
    ADD CONSTRAINT user_discounts_pkey PRIMARY KEY (id);


--
-- Name: user_survey_sections_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_survey_sections
    ADD CONSTRAINT user_survey_sections_pkey PRIMARY KEY (id);


--
-- Name: user_surveys_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_surveys
    ADD CONSTRAINT user_surveys_pkey PRIMARY KEY (id);


--
-- Name: user_tokens_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_tokens
    ADD CONSTRAINT user_tokens_pkey PRIMARY KEY (id);


--
-- Name: user_types_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_types
    ADD CONSTRAINT user_types_pkey PRIMARY KEY (id);


--
-- Name: user_verifications_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_verifications
    ADD CONSTRAINT user_verifications_pkey PRIMARY KEY (id);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: fk_achiev_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_achievements
    ADD CONSTRAINT fk_achiev_id FOREIGN KEY (achiev_id) REFERENCES achievements(id);


--
-- Name: fk_discount_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_discounts
    ADD CONSTRAINT fk_discount_id FOREIGN KEY (discount_id) REFERENCES discount(id);


--
-- Name: fk_discount_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY surveys_discounts
    ADD CONSTRAINT fk_discount_id FOREIGN KEY (discount_id) REFERENCES discount(id);


--
-- Name: fk_header_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY survey_sections
    ADD CONSTRAINT fk_header_id FOREIGN KEY (header_id) REFERENCES survey_headers(id);


--
-- Name: fk_header_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY survey_comments
    ADD CONSTRAINT fk_header_id FOREIGN KEY (header_id) REFERENCES survey_headers(id);


--
-- Name: fk_input_type_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY questions
    ADD CONSTRAINT fk_input_type_id FOREIGN KEY (input_type_id) REFERENCES input_types(id);


--
-- Name: fk_option_choice_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY question_options
    ADD CONSTRAINT fk_option_choice_id FOREIGN KEY (option_choice_id) REFERENCES option_choices(id);


--
-- Name: fk_option_group_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY questions
    ADD CONSTRAINT fk_option_group_id FOREIGN KEY (option_group_id) REFERENCES option_groups(id);


--
-- Name: fk_option_group_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY option_choices
    ADD CONSTRAINT fk_option_group_id FOREIGN KEY (option_group_id) REFERENCES option_groups(id);


--
-- Name: fk_organization_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY survey_headers
    ADD CONSTRAINT fk_organization_id FOREIGN KEY (organization_id) REFERENCES organizations(id);


--
-- Name: fk_organization_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY cashier
    ADD CONSTRAINT fk_organization_id FOREIGN KEY (organization_id) REFERENCES organizations(id);


--
-- Name: fk_question_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY question_options
    ADD CONSTRAINT fk_question_id FOREIGN KEY (question_id) REFERENCES questions(id);


--
-- Name: fk_question_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY question_medias
    ADD CONSTRAINT fk_question_id FOREIGN KEY (question_id) REFERENCES questions(id);


--
-- Name: fk_question_option_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY answers
    ADD CONSTRAINT fk_question_option_id FOREIGN KEY (question_option_id) REFERENCES question_options(id);


--
-- Name: fk_section_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_survey_sections
    ADD CONSTRAINT fk_section_id FOREIGN KEY (section_id) REFERENCES survey_sections(id);


--
-- Name: fk_survey_header_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_surveys
    ADD CONSTRAINT fk_survey_header_id FOREIGN KEY (survey_header_id) REFERENCES survey_headers(id);


--
-- Name: fk_survey_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY surveys_discounts
    ADD CONSTRAINT fk_survey_id FOREIGN KEY (survey_id) REFERENCES survey_headers(id);


--
-- Name: fk_survey_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY dashboards
    ADD CONSTRAINT fk_survey_id FOREIGN KEY (survey_id) REFERENCES survey_headers(id);


--
-- Name: fk_survey_section_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY questions
    ADD CONSTRAINT fk_survey_section_id FOREIGN KEY (survey_section_id) REFERENCES survey_sections(id);


--
-- Name: fk_theme_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY survey_headers
    ADD CONSTRAINT fk_theme_id FOREIGN KEY (theme_id) REFERENCES survey_themes(id);


--
-- Name: fk_unit_measure_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY questions
    ADD CONSTRAINT fk_unit_measure_id FOREIGN KEY (unit_measure_id) REFERENCES units_measure(id);


--
-- Name: fk_user_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY survey_comments
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: fk_user_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_survey_sections
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: fk_user_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY answers
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: fk_user_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_surveys
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: fk_user_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_discounts
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: fk_user_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_tokens
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: fk_user_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_achievements
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: fk_user_id; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY user_verifications
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: fk_user_organization; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT fk_user_organization FOREIGN KEY (user_organization) REFERENCES organizations(id);


--
-- Name: fk_user_type; Type: FK CONSTRAINT; Schema: surveymania; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT fk_user_type FOREIGN KEY (user_type) REFERENCES user_types(id);


--
-- PostgreSQL database dump complete
--

