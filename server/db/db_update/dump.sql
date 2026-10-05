--
-- PostgreSQL database dump
--

\restrict 86P2Kh34GBcmtaJjsoTZFVsTgKydnKBDyABKXjZdcee671FXbm8o8q6fb7OHlFo

-- Dumped from database version 18.6 (4e955f5)
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA drizzle;


--
-- Name: day_of_week; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.day_of_week AS ENUM (
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: -
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: -
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: -
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account (
    id text NOT NULL,
    account_id text NOT NULL,
    provider_id text NOT NULL,
    user_id text NOT NULL,
    access_token text,
    refresh_token text,
    id_token text,
    access_token_expires_at timestamp without time zone,
    refresh_token_expires_at timestamp without time zone,
    scope text,
    password text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: break_times; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.break_times (
    id text NOT NULL,
    name text NOT NULL,
    start_time text NOT NULL,
    end_time text NOT NULL
);


--
-- Name: course_classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_classes (
    id text NOT NULL,
    course_code text NOT NULL,
    class_letter text NOT NULL,
    lecturers jsonb DEFAULT '[]'::jsonb NOT NULL
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id text NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    sks integer NOT NULL,
    semester text DEFAULT 'Both'::text NOT NULL,
    assigned_lecturer_name text,
    class_id text
);


--
-- Name: lecturers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lecturers (
    id text NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#6366f1'::text NOT NULL
);


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rooms (
    id text NOT NULL,
    name text NOT NULL
);


--
-- Name: schedule_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_slots (
    id text NOT NULL,
    lecturer_name text NOT NULL,
    room_id text NOT NULL,
    day public.day_of_week NOT NULL,
    time_slot text NOT NULL,
    course_id text NOT NULL,
    course_code text NOT NULL,
    course_title text NOT NULL,
    sks integer NOT NULL,
    room_name text NOT NULL,
    has_conflict boolean,
    conflict_reason text,
    class_id text DEFAULT ''::text NOT NULL,
    class_letter text DEFAULT ''::text NOT NULL
);


--
-- Name: semester_periods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.semester_periods (
    id text NOT NULL,
    year text NOT NULL,
    semester integer NOT NULL
);


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    id text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    token text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    ip_address text,
    user_agent text,
    user_id text NOT NULL,
    impersonated_by text
);


--
-- Name: sks_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sks_settings (
    id integer NOT NULL,
    duration_per_sks integer DEFAULT 50 NOT NULL,
    active_days jsonb DEFAULT '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::jsonb,
    day_start_time text DEFAULT '07:30'::text NOT NULL,
    day_end_time text DEFAULT '17:00'::text NOT NULL,
    current_period_id text,
    auto_conflict_detection boolean DEFAULT true NOT NULL
);


--
-- Name: sks_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sks_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sks_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sks_settings_id_seq OWNED BY public.sks_settings.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    image text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    role text,
    banned boolean DEFAULT false,
    ban_reason text,
    ban_expires timestamp without time zone
);


--
-- Name: verification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verification (
    id text NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: sks_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sks_settings ALTER COLUMN id SET DEFAULT nextval('public.sks_settings_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: -
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
\.


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.account (id, account_id, provider_id, user_id, access_token, refresh_token, id_token, access_token_expires_at, refresh_token_expires_at, scope, password, created_at, updated_at) FROM stdin;
uLpnZGEELLU3WIrToyj924MOYIKFhepM	dJmvATIBvyNASAxpfkG1XGt2AFfD5IGo	credential	dJmvATIBvyNASAxpfkG1XGt2AFfD5IGo	\N	\N	\N	\N	\N	\N	222374d67c6a975e1863b7065bbe5e53:7e96e98afdb46d4a2a6e60b781d7f26f2da285da24a19f8862c11bdf6aaed8154bc56180012c52b7f55587590fd352ca048284b00fe678a5ca958853de051425	2026-07-28 08:16:19.39	2026-07-28 08:16:19.39
ywBzB8axP6tRtT5c3aibXkntLenzEOJQ	B9D6ZZchcnthfbPiWqjxzexZTqtFwWpL	credential	B9D6ZZchcnthfbPiWqjxzexZTqtFwWpL	\N	\N	\N	\N	\N	\N	dcb29cb942580402ba2ed1c61f3d40a6:219834cf0e559970f3cf318b19ebf14ed1332281ca86dd2116b0e7ffff23ade9c6826f6510ddfe993f5b6400648fc0c9f64842273550642106b6e89cc9dc14a9	2026-08-04 01:03:39.557	2026-08-04 01:03:39.557
6kIHZrPpViIEdYXl6BNpf2PjZpjhnlee	ydqqqZFhDV87MagYgHgjLNOLMqgVKMP6	credential	ydqqqZFhDV87MagYgHgjLNOLMqgVKMP6	\N	\N	\N	\N	\N	\N	8434da6a223614e3575a1221ea9a2b59:4a54c13c258e5f5e6fc4bbf83bec65162f82a69cd25d8bef1dc2d8829c083d8b73045dd8ab2b2cf8fe6261c34e1873b11f1da493a890c7a6759bbced3a9252f4	2026-08-04 06:12:44.989	2026-08-04 06:12:44.989
\.


--
-- Data for Name: break_times; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.break_times (id, name, start_time, end_time) FROM stdin;
b1	Istirahat	12:00	13:00
\.


--
-- Data for Name: course_classes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.course_classes (id, course_code, class_letter, lecturers) FROM stdin;
cc13	STKIM42201	A	["Bibiana Dho Tawa, S.Si., M.Sc"]
cc14	STKIM42101	A	["Hermania Em Wogo, S.Si.,M.Si"]
cc19	STKIM42206	A	["Odi Th. Selan, S.Si.,M.Sc"]
cc39	STKIM44101	A	["Mesakh T. W. Boikh, S.Pd, M.Sc"]
cc41	STKIM44103	A	["Hermania Em Wogo, S.Si.,M.Si"]
fe60ac3a-757d-42b8-9d07-21110c26d015	STKIM41201	C	["Mesakh T. W. Boikh, S.Pd, M.Sc"]
cc2	STKIM41201	A	["Dr. Brian Juned Septory, S.Pd., M.Pd"]
965776fd-7ef0-4682-87de-fb32891c5bae	STKIM41201	B	["Robertus Dole Guntur, S.Si., M. Math.Sc. GC-RESIM., PhD"]
cc56	STKIM43208	A	["Marlon J.R. Benu.,S.Si.,M.Si", "Hermania Em Wogo, S.Si.,M.Si"]
cc3	STKIM41202	A	["Dr. Alfred Dima, M.Si"]
cc66	STKIM46206	A	["Luther Kadang, S.TP, M.Si"]
cc8	STKIM41205	A	["Jehunias L. Tanesib, S.Si., M.Sc"]
cc20	MKU112147201	A	["Boli Tonda Baso, S.Sos., M.Si"]
cc5	STKIM41301	A	["Dr. Suwari, S.Pd, M.Si"]
2aa9139b-1379-4577-b1ed-5e05c81f4d79	STKIM41202	B	["Dr. Refli, M.Sc"]
cc9	STKIM41206	A	["Dr. Dodi Darmakusuma, S.Si, M.Si", "Since D. Baunsele, S.Si.,M.Ling"]
cc6	STKIM41101	A	["Pius Dore Ola, S.Si, M.Si., Ph.D"]
cc4	STKIM41203	A	["Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D", "ADI BERCI ESTI RACHMANI HANDRAYANI LIU, S.Si.,M.Sc"]
cc7	STKIM41204	A	["David Tambaru, S.Si., M.Chem.Sc., Ph.D."]
cc21	MKP16147201x	A	["Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D"]
cc22	STKIM43201	A	["Titus Lapailaka, S.Si., M.Si", "Dr. Imanuel Gauru, S.Si.,,M.Si"]
cc23	STKIM43202	A	["Prof. Dr. Febri O. Nitbani, S.Si, M.Si", "Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc"]
cc24	STKIM43203	A	["Bibiana Dho Tawa, S.Si., M.Sc", "Marlon J.R. Benu.,S.Si.,M.Si"]
cc25	STKIM43204	A	["Sherly M. F. Ledoh, S.Si.,M.Sc", "Pius Dore Ola, S.Si, M.Si., Ph.D"]
cc26	STKIM43205	A	["Dr. Theodore Y. K. Lulan, S.Si, M.Sc"]
cc27	STKIM43206	A	["Dr. Suwari, S.Pd, M.Si", "Since D. Baunsele, S.Si.,M.Ling"]
cc28	STKIM43207	A	["Dr. Suwari, S.Pd, M.Si"]
cc29	STKIM43101	A	["Mesakh T. W. Boikh, S.Pd, M.Sc"]
cc30	STKIM43102	A	["Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D"]
cc31	STKIM43103	A	["Sherly M. F. Ledoh, S.Si.,M.Sc"]
cc44	STKIM45202	A	["Dr. Theodore Y. K. Lulan, S.Si, M.Sc"]
cc45	STKIM45203	A	["Titus Lapailaka, S.Si., M.Si", "Odi Th Selan, S.Si., M.Sc., Ph.D"]
cc46	STKIM45204	A	["Titus Lapailaka, S.Si., M.Si", "Dr. Imanuel Gauru, S.Si.,,M.Si"]
cc47	STKIM45205	A	["Dr. Suwari, S.Pd, M.Si", "Dr. Dodi Darmakusuma, S.Si, M.Si"]
cc48	STKIM45206	A	["Mesakh T. W. Boikh, S.Pd, M.Sc", "Bibiana Dho Tawa, S.Si., M.Sc"]
cc49	STKIM45207	A	["Odi Th Selan, S.Si., M.Sc., Ph.D", "Dr. Imanuel Gauru, S.Si.,,M.Si"]
cc50	STKIM45208	A	["Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D", "Since D. Baunsele, S.Si.,M.Ling"]
cc51	STKIM45209	A	["Bibiana Dho Tawa, S.Si., M.Sc"]
cc52	STKIM45210	A	["Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D"]
cc58	STKIM43211	A	["Mesakh T. W. Boikh, S.Pd, M.Sc", "Marlon J.R. Benu.,S.Si.,M.Si"]
cc59	STKIM43213	A	["Mesakh T. W. Boikh, S.Pd, M.Sc", "Bibiana Dho Tawa, S.Si., M.Sc"]
cc68	STKIM47207	A	["Bibiana Dho Tawa, S.Si., M.Sc", "Fidelis Nitti, S.Si., M.Sc., Ph.D"]
cc10	MKU112247201	A	["Lisky Th. Subu Taopan, S.Pd., M.Hum"]
6e431070-a0ae-4dd1-8b7b-61358bbede02	STKIM 43209	A	["Dr. Dodi Darmakusuma, S.Si, M.Si"]
cc43	STKIM45201	A	["Prof. Dr. Febri O. Nitbani, S.Si, M.Si"]
0813767e-4d93-414f-8f8e-9f60330e6e86	STKIM 45216	A	["Dr. Imanuel Gauru, S.Si.,,M.Si", "Titus Lapailaka, S.Si., M.Si"]
c56372fa-0a17-43c7-ad84-d7191a5ab1a5	STKIM 43212	A	["Dr. Theodore Y. K. Lulan, S.Si, M.Sc"]
cebb879e-7414-4593-91aa-8c459297bb60	STKIM 43210	A	["Bibiana Dho Tawa, S.Si., M.Sc", "Odi Th Selan, S.Si., M.Sc., Ph.D"]
8ee626e2-79ca-474b-adf5-14bdb1695083	MKP16147201x	B	["Prof. Dr. Febri O. Nitbani, S.Si, M.Si"]
f90b86bd-3a76-45bb-9fde-145510c82f31	STKIM 45212	A	["Luther Kadang, S.TP, M.Si"]
06290503-178d-4d50-b533-a2ea04ebae05	STKIM 45212	B	["Luther Kadang, S.TP, M.Si"]
f18bc797-88cb-4f1c-a30f-0bcd8a298ad3	STKIM 45212	C	["Luther Kadang, S.TP, M.Si"]
77b6fb90-bcf6-4e4f-9a46-d421cc28f36e	STKIM 45211	A	["Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc"]
42ac8c14-e324-4dbc-83ea-616986a89031	STKIM 45212	D	["Luther Kadang, S.TP, M.Si"]
2cddefb2-7d8c-4720-ae5b-c3001aa2edff	STKIM45201	B	["Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D"]
5a3260dc-9273-49b9-90c6-ecbb623bf5d0	STKIM43201	B	["Odi Th Selan, S.Si., M.Sc., Ph.D", "Hermania Em Wogo, S.Si.,M.Si"]
2a452a0a-ab66-43ba-8617-edb86a510cc7	STKIM43202	B	["Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D", "Dr. Theodore Y. K. Lulan, S.Si, M.Sc"]
115f0121-171b-48a9-a6cc-09c20d5a8fa3	STKIM43203	B	["Mesakh T. W. Boikh, S.Pd, M.Sc", "Bibiana Dho Tawa, S.Si., M.Sc"]
9d99e015-b31b-454d-a719-dab3202bd958	STKIM41203	C	["Dr. Imanuel Gauru, S.Si.,,M.Si", "ADI BERCI ESTI RACHMANI HANDRAYANI LIU, S.Si.,M.Sc"]
33959c54-5d02-4b3d-80d1-366183975bd8	STKIM41203	B	["Dr. Imanuel Gauru, S.Si.,,M.Si"]
69f46c5c-a497-41f4-876e-5b848deaa810	STKIM43204	B	["Luther Kadang, S.TP, M.Si", "David Tambaru, S.Si., M.Chem.Sc., Ph.D."]
4c8de055-c24e-4c3b-afaf-6d9b0acae28e	STKIM43205	B	["Dr. Dodi Darmakusuma, S.Si, M.Si"]
53570412-4530-4a99-9982-825cbfe90f7d	STKIM43206	B	["Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D", "Luther Kadang, S.TP, M.Si"]
1118545d-9733-427e-8c0c-e496c373effc	STKIM41101	C	["Since D. Baunsele, S.Si.,M.Ling"]
a8cf127e-94fb-4fd9-ba8e-d3f0bf6c9ef6	STKIM41101	B	["David Tambaru, S.Si., M.Chem.Sc., Ph.D."]
903c88a5-e22a-448b-b269-60e365dc4ae4	STKIM41301	B	["Drs. Theodorus Da Cunha, M.Si", "Bibiana Dho Tawa, S.Si., M.Sc"]
4c988fa8-ebae-4ae3-b659-7c43dbe36108	STKIM41301	C	["David Tambaru, S.Si., M.Chem.Sc., Ph.D.", "Pius Dore Ola, S.Si, M.Si., Ph.D"]
6d349b25-8a4d-4d48-a69d-6d4179802dca	STKIM43207	B	["David Tambaru, S.Si., M.Chem.Sc., Ph.D.", "Pius Dore Ola, S.Si, M.Si., Ph.D"]
c6659c76-ac7b-4573-b44b-3e918c1e6a40	STKIM41204	B	["Odi Th Selan, S.Si., M.Sc., Ph.D"]
7b0b96e7-69ad-4e49-aff6-396b64c1e8a5	STKIM41204	C	["Fidelis Nitti, S.Si., M.Sc., Ph.D"]
cef0addd-c3b8-4630-95fa-931a635ab002	STKIM41206	C	["Luther Kadang, S.TP, M.Si"]
c93013e9-a395-4b33-9e45-fa156689540a	STKIM41206	B	["Drs. Theodorus Da Cunha, M.Si", "Mesakh T. W. Boikh, S.Pd, M.Sc"]
852524a0-c69c-4f4c-be27-468c8b723ffe	STKIM43101	B	["Marlon J.R. Benu.,S.Si.,M.Si"]
0ae013f0-9380-4df3-99f2-d3c3b76c880f	STKIM43102	B	["Dr. Theodore Y. K. Lulan, S.Si, M.Sc"]
57f281d6-6f92-48dd-b2c1-7a1ac57c53c3	STKIM43103	B	["Luther Kadang, S.TP, M.Si"]
dd71c364-8320-4219-b82b-df5bccecb1b8	STKIM45202	B	["Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc"]
20acaf07-16b4-43ac-8bad-53b4a193fb28	STKIM45203	B	["Hermania Em Wogo, S.Si.,M.Si", "Dr. Imanuel Gauru, S.Si.,,M.Si"]
61719335-7592-4049-8b07-3fb762582653	STKIM45204	B	["Odi Th Selan, S.Si., M.Sc., Ph.D", "Hermania Em Wogo, S.Si.,M.Si"]
fcf097e5-6496-42d3-90c4-85761cd9629f	STKIM45205	B	["Fidelis Nitti, S.Si., M.Sc., Ph.D", "Pius Dore Ola, S.Si, M.Si., Ph.D"]
b78b401c-3c9e-4be3-a403-926d7ddbd6ae	STKIM45206	B	["Marlon J.R. Benu.,S.Si.,M.Si", "Since D. Baunsele, S.Si.,M.Ling"]
df8ac9b7-51c3-4a8f-bd5a-2b0cbe84eec8	STKIM45207	B	["Hermania Em Wogo, S.Si.,M.Si", "Titus Lapailaka, S.Si., M.Si"]
9aad33db-92bb-4ee8-af4b-2561697d0e3c	STKIM45208	B	["Luther Kadang, S.TP, M.Si"]
586d9ec6-3eb7-4558-b152-5e890e4b10b9	STKIM45209	B	["Fidelis Nitti, S.Si., M.Sc., Ph.D"]
e9438816-48bd-475a-a956-49f3ace430b6	STKIM45210	B	["Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc"]
ccf221b3-1872-4d6e-8d08-af6f9bacd7c9	STKIM 45213	A	["Since D. Baunsele, S.Si.,M.Ling", "Prof. Dr. Febri O. Nitbani, S.Si, M.Si"]
87751a88-c82a-47c2-b028-d22508b0f39e	STKIM 45214	A	["Mesakh T. W. Boikh, S.Pd, M.Sc", "Marlon J.R. Benu.,S.Si.,M.Si"]
5c50e4e1-42b3-4d67-9bee-ea91b7d7aaea	STKIM 45218	A	["Dr. Imanuel Gauru, S.Si.,,M.Si", "Odi Th Selan, S.Si., M.Sc., Ph.D"]
27b7a0ca-44fc-4d36-89ec-f46a98fbba43	STKIM 45220	A	["Prof. Dr. Febri O. Nitbani, S.Si, M.Si", "Bibiana Dho Tawa, S.Si., M.Sc"]
21485682-dbb0-42f5-bec8-a661f45be8c1	STKIM41202	C	["Dr. Refli, M.Sc"]
ccf4561c-6bc0-483b-bd40-92579c6293d5	STKIM 45215	A	["Since D. Baunsele, S.Si.,M.Ling"]
028189ca-f17f-41c4-bdac-f1bb69b36d90	STKIM47203	A	["Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D"]
56f000bf-1c8c-4702-af5c-1526a239f720	STKIM47204	A	["David Tambaru, S.Si., M.Chem.Sc., Ph.D."]
4c813ccf-9700-4c0c-8a93-8acb8d7b6ae5	STKIM47205	A	["Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D"]
77cafaa1-929b-4b93-9659-bac9b8ec97ab	 STKIM47206	A	["Sherly M. F. Ledoh, S.Si.,M.Sc", "Dr. Suwari, S.Pd, M.Si"]
a24eed56-af2d-4587-b77a-a4a29e26f4b3	STKIM47208	A	["Marlon J.R. Benu.,S.Si.,M.Si", "Mesakh T. W. Boikh, S.Pd, M.Sc"]
8bcf59eb-6838-4e62-9cef-b58482e8ef85	STKIM47209 	A	["Odi Th Selan, S.Si., M.Sc., Ph.D", "Dr. Imanuel Gauru, S.Si.,,M.Si"]
c79a1874-146c-468b-a7d7-09495a8d2130	STKIM47210	A	["Pius Dore Ola, S.Si, M.Si., Ph.D"]
d33c819c-6d2a-4f29-9dd9-9af721c66943	STKIM41205	B	["Christine Mbiliyora, S.Si., M.Si"]
a1d9e4cb-471f-4126-8d8c-09de0e242c37	STKIM41205	C	["Hanna Azmi Fathin, S.Si., M.Si"]
78ba1525-0933-4a3e-9ed4-cd4e680615dd	STKIM 47201	A	["Since D. Baunsele, S.Si.,M.Ling"]
b8b85eb3-75ad-48d1-bae3-5ceb24dc58bf	STKIM47202	A	["Dr. Suwari, S.Pd, M.Si", "Since D. Baunsele, S.Si.,M.Ling"]
22101488-5284-4084-8a1b-8fe21d0cc929	MKU112147201	B	["Boli Tonda Baso, S.Sos., M.Si"]
73fd0ac3-626f-456f-aa6a-bc21e0a6a1e7	MKU112247201	C	["Lisky Th. Subu Taopan, S.Pd., M.Hum"]
19e8199f-6bf6-444b-9b33-748609ad86f2	MKU112247201	B	["Lisky Th. Subu Taopan, S.Pd., M.Hum"]
ae92cffd-fac3-4e05-b2fc-d38eb9d87ffd	MKU 1223	KRISTEN PROTESTAN	["Pdt Yudith, S.Th"]
5ea361eb-65de-47a1-8f1c-85b59f6366df	MKU 1223	KRISTEN KATOLIK	["Drs. Herman Yosep Utang, L.Ph"]
a3f140b2-9da9-48a1-849a-df032da2ccba	MKU 1223	ISLAM	["Jainudin Oumo, MAg"]
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.courses (id, code, title, sks, semester, assigned_lecturer_name, class_id) FROM stdin;
cour13	STKIM42201	Praktikum Kimia Organik dan Analitik	1	Both	Bibiana Dho Tawa, S.Si., M.Sc	cc13
cour14	STKIM42101	Praktikum Kimia Dasar II	1	Both	Hermania Em Wogo, S.Si.,M.Si	cc14
cour39	STKIM44101	Praktikum Analisis Instrumen	1	Both	Mesakh T. W. Boikh, S.Pd, M.Sc	cc39
cour41	STKIM44103	Praktikum Anorganik Lahan Kering	1	Both	Hermania Em Wogo, S.Si.,M.Si	cc41
cour2	STKIM41201	Matematika Dasar	3	Both	Dr. Brian Juned Septory, S.Pd., M.Pd	cc2
cour20	MKU112147201	Pendidikan Kewarganegaraan	2	Ganjil	Boli Tonda Baso, S.Sos., M.Si	cc20
cour3	STKIM41202	Biologi Dasar	2	Ganjil	Dr. Alfred Dima, M.Si	cc3
cour56	STKIM43208	Geokimia	2	Ganjil	Marlon J.R. Benu.,S.Si.,M.Si	cc56
cour4	STKIM41203	Pengantar Komputasi Kimia	2	Ganjil	Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D	cc4
cour5	STKIM41301	Kimia Dasar I	3	Ganjil	Dr. Suwari, S.Pd, M.Si	cc5
cour6	STKIM41101	Praktikum Kimia Dasar I	1	Ganjil	Pius Dore Ola, S.Si, M.Si., Ph.D	cc6
cour19	STKIM42206	Praktikum Kimia Anorganik dan Kimia Fisik	1	Both	\N	cc19
cour7	STKIM41204	Bahasa Inggris Untuk Kimia	2	Ganjil	David Tambaru, S.Si., M.Chem.Sc., Ph.D.	cc7
cour59	STKIM43213	Kimia Inti dan Radiokimia	2	Ganjil	Mesakh T. W. Boikh, S.Pd, M.Sc	cc59
cour9	STKIM41206	Pengelolaan Lab	2	Ganjil	Dr. Dodi Darmakusuma, S.Si, M.Si	cc9
cour21	MKP16147201x	Pendidikan Anti Korupsi	1	Ganjil	Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D	cc21
cour22	STKIM43201	Kimia Anorganik 2	2	Ganjil	Titus Lapailaka, S.Si., M.Si	cc22
cour23	STKIM43202	Kimia Organik 2	2	Ganjil	Prof. Dr. Febri O. Nitbani, S.Si, M.Si	cc23
cour24	STKIM43203	Kimia Fisik 2	2	Ganjil	Bibiana Dho Tawa, S.Si., M.Sc	cc24
cour25	STKIM43204	Kimia Analitik 2	2	Ganjil	Sherly M. F. Ledoh, S.Si.,M.Sc	cc25
cour26	STKIM43205	Biokimia I	2	Ganjil	Dr. Theodore Y. K. Lulan, S.Si, M.Sc	cc26
cour27	STKIM43206	Kimia Lingkungan	2	Ganjil	Dr. Suwari, S.Pd, M.Si	cc27
cour28	STKIM43207	Teknik Sampling dan Penanganan Sampel	2	Ganjil	Dr. Suwari, S.Pd, M.Si	cc28
cour29	STKIM43101	Praktikum Kimia Fisik Lahan Kering	1	Ganjil	Mesakh T. W. Boikh, S.Pd, M.Sc	cc29
cour30	STKIM43102	Praktikum Kimia Organik Lahan Kering	1	Ganjil	Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D	cc30
cour31	STKIM43103	Praktikum Kimia Analitik Lahan Kering	1	Ganjil	Sherly M. F. Ledoh, S.Si.,M.Sc	cc31
cour44	STKIM45202	Elusidasi Struktur Senyawa Organik	2	Ganjil	Dr. Theodore Y. K. Lulan, S.Si, M.Sc	cc44
cour45	STKIM45203	Elusidasi Struktur Senyawa Anorganik	2	Ganjil	Titus Lapailaka, S.Si., M.Si	cc45
cour46	STKIM45204	Sintesis Senyawa Anorganik	2	Ganjil	Titus Lapailaka, S.Si., M.Si	cc46
cour47	STKIM45205	Metodologi Penelitian	2	Ganjil	Dr. Suwari, S.Pd, M.Si	cc47
cour48	STKIM45206	Kimia Material dan Katalis	2	Ganjil	Mesakh T. W. Boikh, S.Pd, M.Sc	cc48
cour49	STKIM45207	Kimia Anorganik Fisik	2	Ganjil	Odi Th Selan, S.Si., M.Sc., Ph.D	cc49
cour50	STKIM45208	Pengelolaan dan Pemantauan Lingkungan	2	Ganjil	Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D	cc50
cour51	STKIM45209	Kinetika Kimia	2	Ganjil	Bibiana Dho Tawa, S.Si., M.Sc	cc51
cour52	STKIM45210	Kimia Heterosiklik dan Medisinal	2	Ganjil	Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D	cc52
cour58	STKIM43211	Matematika Kimia	2	Ganjil	Mesakh T. W. Boikh, S.Pd, M.Sc	cc58
cour8	STKIM41205	Fisika untuk Kimia	2	Both	Jehunias L. Tanesib, S.Si., M.Sc	cc8
cour10	MKU112247201	Bahasa Indonesia	2	Ganjil	Lisky Th. Subu Taopan, S.Pd., M.Hum	cc10
cour43	STKIM45201	Sintesis Senyawa Organik	2	Ganjil	Since D. Baunsele, S.Si.,M.Ling	cc43
739a46b6-4382-4af4-b248-803c054f0986	STKIM 45212	Stereokimia	2	Ganjil	Luther Kadang, S.TP, M.Si	f90b86bd-3a76-45bb-9fde-145510c82f31
f6cb0a21-8a39-4889-afda-4b5c60a6ed39	STKIM 45215	Proses Industri Kimia	2	Ganjil	Since D. Baunsele, S.Si.,M.Ling	ccf4561c-6bc0-483b-bd40-92579c6293d5
a43fa770-38e6-4afb-af33-44caf6432edf	STKIM 45213	Enzim untuk Pangan	2	Ganjil	Since D. Baunsele, S.Si.,M.Ling	ccf221b3-1872-4d6e-8d08-af6f9bacd7c9
9207d900-95e1-4cab-894e-33adc42a75c9	STKIM 45214	Nanomaterial	2	Ganjil	Mesakh T. W. Boikh, S.Pd, M.Sc	87751a88-c82a-47c2-b028-d22508b0f39e
13c7610c-fb12-4ecc-a2d6-185f1123a5de	STKIM 45218	Kristalografi	2	Ganjil	Dr. Imanuel Gauru, S.Si.,,M.Si	5c50e4e1-42b3-4d67-9bee-ea91b7d7aaea
a19b0ced-522e-42a8-9de9-cb3e38296683	STKIM47203	Toksikologi Lingkungan	2	Ganjil	\N	\N
775798e1-3934-4fde-9f48-097ad1f97f01	STKIM47203	Toksikologi Lingkungan	2	Ganjil	\N	\N
d2257c8e-cabb-4ead-a364-7043d9364dc0	STKIM47203	Toksikologi Lingkungan	2	Ganjil	\N	\N
eaaca306-a02d-4a56-b57f-d37def41c4dd	STKIM47203	Toksikologi Lingkungan	2	Ganjil	\N	\N
0ba221ca-647c-46ca-8f53-c2a9fb55ef43	STKIM 45220	Biofuel Lahan Kering	2	Ganjil	Prof. Dr. Febri O. Nitbani, S.Si, M.Si	27b7a0ca-44fc-4d36-89ec-f46a98fbba43
1e35fd96-36b4-4927-8e07-996e34747f66	STKIM 47201	Analisis Air, Tanah, dan Udara	2	Ganjil	Since D. Baunsele, S.Si.,M.Ling	78ba1525-0933-4a3e-9ed4-cd4e680615dd
54c4176d-b107-44a0-999c-8c9b1ffdd85c	STKIM47202	Penyusunan Dokumen Lingkungan	2	Ganjil	Dr. Suwari, S.Pd, M.Si	b8b85eb3-75ad-48d1-bae3-5ceb24dc58bf
f792c82b-0d79-4ed3-908c-ceb04fefbea9	STKIM47203	Toksikologi Lingkungan	2	Ganjil	Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D	028189ca-f17f-41c4-bdac-f1bb69b36d90
1e402f01-0b56-43dc-88c1-eaf720f1e13d	STKIM 45216	Semikonduktor dan Sel Surya	2	Ganjil	Dr. Imanuel Gauru, S.Si.,,M.Si	0813767e-4d93-414f-8f8e-9f60330e6e86
9fa7d279-f69b-4a9d-a709-378c41cab77b	MKU 1223	Agama	2	Ganjil	Luther Kadang, S.TP, M.Si	5ea361eb-65de-47a1-8f1c-85b59f6366df
5df4d7ec-1f29-4e76-96c0-5b2dd5c23d47	STKIM 43209	Mikrobiologi	2	Ganjil	Luther Kadang, S.TP, M.Si	6e431070-a0ae-4dd1-8b7b-61358bbede02
cour66	STKIM46206	Kimia Pangan	2	Both	Luther Kadang, S.TP, M.Si	cc66
ac550fa8-e467-454f-abb4-1d909c24d460	STKIM47203	Toksikologi Lingkungan	2	Ganjil	\N	\N
64b6b814-1738-4d60-ad85-47f4454f9160	STKIM47203	Toksikologi Lingkungan	2	Ganjil	\N	\N
20480f30-c5af-4f71-bcf4-572c765dce52	STKIM47203	Toksikologi Lingkungan	2	Ganjil	\N	\N
6af154d8-006e-4609-8e98-e94ff385e664	STKIM47203	Toksikologi Lingkungan	2	Ganjil	\N	\N
b0edab39-bfb4-4fd4-b152-ced183d5ff59	STKIM47203	Toksikologi Lingkungan	2	Ganjil	\N	\N
c5da67e3-bf10-4d74-98f0-11d7ee6d6c58	STKIM47204	Sensor Kimia	2	Ganjil	David Tambaru, S.Si., M.Chem.Sc., Ph.D.	56f000bf-1c8c-4702-af5c-1526a239f720
79118f12-e691-4360-bcf8-d9f83591d640	STKIM47204	Sensor Kimia	2	Ganjil	\N	\N
30e763c7-a49b-471c-859f-1ebc15fd770b	STKIM47205	Teknologi Daur Ulang	2	Ganjil	Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D	4c813ccf-9700-4c0c-8a93-8acb8d7b6ae5
ce751cde-40bd-42f2-8123-29ff89e78569	 STKIM47206	Teknologi Remediasi	2	Ganjil	Sherly M. F. Ledoh, S.Si.,M.Sc	77cafaa1-929b-4b93-9659-bac9b8ec97ab
cour68	STKIM47207	Kimia Polimer	2	Ganjil	Bibiana Dho Tawa, S.Si., M.Sc	cc68
0b260f83-151d-41ae-94ce-6cb39b6148a1	STKIM47208	Kimia Bahan Berpori	2	Ganjil	Marlon J.R. Benu.,S.Si.,M.Si	a24eed56-af2d-4587-b77a-a4a29e26f4b3
f0066f7e-3e65-4f57-8f89-4d154d9bdd4b	STKIM47209 	Kimia Organologam	2	Ganjil	Odi Th Selan, S.Si., M.Sc., Ph.D	8bcf59eb-6838-4e62-9cef-b58482e8ef85
0b26dc96-0601-4c8e-bc71-d2aace0d22fa	STKIM47210	Kimia Zat Warna Lahan Kering	2	Ganjil	Pius Dore Ola, S.Si, M.Si., Ph.D	c79a1874-146c-468b-a7d7-09495a8d2130
36200fd0-77eb-4f36-835a-d33033ef68de	STKIM 43210	Elektrokimia	2	Ganjil	Bibiana Dho Tawa, S.Si., M.Sc	cebb879e-7414-4593-91aa-8c459297bb60
57f3693b-bc70-4710-b218-3cecb5795edd	MKU 1223	Agama Islam	2	Ganjil	\N	\N
6ac9c722-2b7c-4446-8663-bb4397370bd0	MKU 1223	Agama Islam	2	Ganjil	\N	\N
3d37e66d-6063-42ac-bd86-76b219ccf06d	MKU 1223	Agama Islam	2	Ganjil	\N	\N
56903841-da21-4bbd-9590-c12aa9a68b90	MKU 1223	Agama Islam	2	Ganjil	\N	\N
36e8c3d8-44d6-4cd3-94a7-9326721df967	MKU 1223	Agama Islam	2	Ganjil	\N	\N
d6f4916e-2ae2-4558-8393-78bc7699a2f4	MKU 1223	Agama Islam	2	Ganjil	\N	\N
1a307906-f6cc-432f-b588-bc583a82ac1e	MKU 1223	Agama Islam	2	Ganjil	\N	\N
24731d62-0c1f-4bf0-9f86-99552f88ca74	MKU 1223	Agama Islam	2	Ganjil	\N	\N
4f897709-bae5-44b4-b12d-1ee2f647ef83	STKIM 43212	Kewirausahaan	2	Ganjil	Dr. Theodore Y. K. Lulan, S.Si, M.Sc	c56372fa-0a17-43c7-ad84-d7191a5ab1a5
81a27b4c-501a-461f-ba4a-796ee5685d63	STKIM 45211	Kimia Minyak Atsiri Lahan Kering	2	Ganjil	Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc	77b6fb90-bcf6-4e4f-9a46-d421cc28f36e
\.


--
-- Data for Name: lecturers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lecturers (id, name, color) FROM stdin;
l11	Luther Kadang, S.TP, M.Si	#65a30d
c51baefe-1d64-454d-b86a-aa69f409bb5f	Dr. Imanuel Gauru, S.Si.,,M.Si	#7c3aed
bfc858f5-4e0f-42eb-b792-502c3f0a4ae8	ADI BERCI ESTI RACHMANI HANDRAYANI LIU, S.Si.,M.Sc	#0891b2
ee5c516e-3b08-4d30-9f92-ed1c4229d678	Drs. Theodorus Da Cunha, M.Si	#fb923c
c6e0729c-7dc8-468f-8c07-402e083d8227	Odi Th Selan, S.Si., M.Sc., Ph.D	#0d9488
0863c154-978b-4756-9179-7625c2c9f5dd	Robertus Dole Guntur, S.Si., M. Math.Sc. GC-RESIM., PhD	#059669
7081765c-d2bd-4c48-aa33-79a00b8f8df0	Dr. Brian Juned Septory, S.Pd., M.Pd	#34d399
fb26ea24-91e4-4136-bb45-fbeeaefd2fed	Drs. Herman Yosep Utang, L.Ph	#0d9488
1fc568fb-6da8-4476-8ac6-612f317dc2be	Pdt Yudith, S.Th	#34d399
1101c7c4-6b70-4b59-afde-69bac3d39923	Jainudin Oumo, MAg	#ec4899
4bbe79d9-fb48-4e0a-ad9c-0399147ab5f8	Dr. Refli, M.Sc	#22d3ee
9499a5e4-47e1-47a7-a37c-22a483a66c0c	Dr. Alfred Dima, M.Si	#059669
2f82401f-47e7-4670-9fef-f2de6f0af32d	Boli Tonda Baso, S.Sos., M.Si	#fbbf24
1cb33afc-2ccd-4d84-b819-9b7fa7a75fcf	Lisky Th. Subu Taopan, S.Pd., M.Hum	#f472b6
4ad86e75-a5d6-4fc9-bcf6-7715fa01fc3c	Jehunias L. Tanesib, S.Si., M.Sc	#22d3ee
8ad07198-21ad-456f-ad43-7efc88b68280	Christine Mbiliyora, S.Si., M.Si	#84cc16
f7879470-63e1-41fd-879e-3326d36cc68e	Hanna Azmi Fathin, S.Si., M.Si	#ea580c
l1	Prof. Dr. Febri O. Nitbani, S.Si, M.Si	#818cf8
l2	Pius Dore Ola, S.Si, M.Si., Ph.D	#fb7185
l3	Sherly M. F. Ledoh, S.Si.,M.Sc	#34d399
l4	Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D	#fbbf24
l5	Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D	#22d3ee
l6	Fidelis Nitti, S.Si., M.Sc., Ph.D	#a78bfa
l7	Titus Lapailaka, S.Si., M.Si	#fb923c
l8	Dr. Theodore Y. K. Lulan, S.Si, M.Sc	#2dd4bf
l9	Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc	#f472b6
l10	Dr. Dodi Darmakusuma, S.Si, M.Si	#a3e635
l12	Dr. Suwari, S.Pd, M.Si	#f43f5e
l13	David Tambaru, S.Si., M.Chem.Sc., Ph.D.	#10b981
l14	Since D. Baunsele, S.Si.,M.Ling	#f59e0b
l15	Marlon J.R. Benu.,S.Si.,M.Si	#06b6d4
l16	Mesakh T. W. Boikh, S.Pd, M.Sc	#8b5cf6
l17	Bibiana Dho Tawa, S.Si., M.Sc	#f97316
l18	Hermania Em Wogo, S.Si.,M.Si	#14b8a6
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rooms (id, name) FROM stdin;
r1	KIM A.1.3
r3	KIM B.2.1
r4	KIM C.1.1
r5	Biosains
r2	KIM A.2.6
b10ac7da-fe7e-40ec-8bb0-d4b9c5e6c423	Kim A.2.1
\.


--
-- Data for Name: schedule_slots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.schedule_slots (id, lecturer_name, room_id, day, time_slot, course_id, course_code, course_title, sks, room_name, has_conflict, conflict_reason, class_id, class_letter) FROM stdin;
52bc74c6-9d91-408a-871a-f66f32717210	Dr. Suwari, S.Pd, M.Si	r1	Thursday	09:30 - 10:20 SKS 3	cour5	STKIM41301	Kimia Dasar I	3	KIM A.1.3	f		cc5	A
b5390304-40c7-4c89-97da-72e6eb29d058	Titus Lapailaka, S.Si., M.Si	r2	Thursday	07:50 - 08:40 SKS 1	cour46	STKIM45204	Sintesis Senyawa Anorganik	2	KIM A.2.6	f		cc46	A
ccf4ce29-3f59-438e-a9c8-063beb94715a	Prof. Dr. Febri O. Nitbani, S.Si, M.Si	b10ac7da-fe7e-40ec-8bb0-d4b9c5e6c423	Thursday	07:50 - 08:40 SKS 1	0ba221ca-647c-46ca-8f53-c2a9fb55ef43	STKIM 45220	Biofuel Lahan Kering	2	Kim A.2.1	f		27b7a0ca-44fc-4d36-89ec-f46a98fbba43	A
01a1b61b-87e5-4cb9-8a34-30398a3e257d	Dr. Alfred Dima, M.Si	r4	Thursday	07:50 - 08:40 SKS 1	cour3	STKIM41202	Biologi Dasar	2	KIM C.1.1	f		cc3	A
ff2f211e-2df9-4f76-a96f-e48a569dc0f3	Prof. Dr. Febri O. Nitbani, S.Si, M.Si	r2	Thursday	09:30 - 10:20 SKS 3	cour23	STKIM43202	Kimia Organik 2	2	KIM A.2.6	f		cc23	A
38cf8df1-6cf4-4802-bf98-67deb3ed1fbf	Pdt Yudith, S.Th	r4	Tuesday	13:00 - 13:50 SKS 6	87e5b0b1-5676-4321-b35b-d991c796be1f	MKU 1223	Pendidikan Agama	2	KIM C.1.1	f		ae92cffd-fac3-4e05-b2fc-d38eb9d87ffd	KRISTEN PROTESTAN
651abc86-04bc-4046-a431-5f169d454610	Dr. Theodore Y. K. Lulan, S.Si, M.Sc	b10ac7da-fe7e-40ec-8bb0-d4b9c5e6c423	Thursday	09:30 - 10:20 SKS 3	4f897709-bae5-44b4-b12d-1ee2f647ef83	STKIM 43212	Kewirausahaan	2	Kim A.2.1	f		c56372fa-0a17-43c7-ad84-d7191a5ab1a5	A
2d3878a1-701f-444f-8c1c-77fc28af8680	Lisky Th. Subu Taopan, S.Pd., M.Hum	r4	Thursday	09:30 - 10:20 SKS 3	cour10	MKU112247201	Bahasa Indonesia	2	KIM C.1.1	f		73fd0ac3-626f-456f-aa6a-bc21e0a6a1e7	C
d7861fe3-618e-49c6-b717-1a69b707dae5	Boli Tonda Baso, S.Sos., M.Si	r4	Wednesday	13:00 - 13:50 SKS 6	cour20	MKU112147201	Pendidikan Kewarganegaraan	2	KIM C.1.1	f		22101488-5284-4084-8a1b-8fe21d0cc929	B
a94d7907-4664-4444-a4ae-000ef9a199ad	Mesakh T. W. Boikh, S.Pd, M.Sc	b10ac7da-fe7e-40ec-8bb0-d4b9c5e6c423	Wednesday	13:00 - 13:50 SKS 6	cour59	STKIM43213	Kimia Inti dan Radiokimia	2	Kim A.2.1	f		cc59	A
9ae3efde-3e2d-4e95-a2d9-9098008b6dd7	Fidelis Nitti, S.Si., M.Sc., Ph.D	r1	Monday	14:40 - 15:30 SKS 8	cour51	STKIM45209	Kinetika Kimia	2	KIM A.1.3	f		586d9ec6-3eb7-4558-b152-5e890e4b10b9	B
5e557f50-2a01-4761-9c08-c32def8cd800	Drs. Herman Yosep Utang, L.Ph	r4	Monday	14:40 - 15:30 SKS 8	9fa7d279-f69b-4a9d-a709-378c41cab77b	MKU 1223	Agama	2	KIM C.1.1	f		5ea361eb-65de-47a1-8f1c-85b59f6366df	KRISTEN KATOLIK
9551ea2f-3432-4950-bab7-fd37fe56acd1	Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D	r4	Thursday	14:40 - 15:30 SKS 8	cour50	STKIM45208	Pengelolaan dan Pemantauan Lingkungan	2	KIM C.1.1	f		cc50	A
e89556bd-da4a-43ff-a6eb-132e2b9450d2	Fidelis Nitti, S.Si., M.Sc., Ph.D	r3	Thursday	13:00 - 13:50 SKS 6	cour7	STKIM41204	Bahasa Inggris Untuk Kimia	2	KIM B.2.1	f		7b0b96e7-69ad-4e49-aff6-396b64c1e8a5	C
498b00c4-b8ad-44a8-8fde-5d2780db882e	David Tambaru, S.Si., M.Chem.Sc., Ph.D.	r1	Tuesday	07:50 - 08:40 SKS 1	cour8	STKIM41205	Fisika untuk Kimia	2	KIM A.1.3	f		cc8	A
df801c3e-cda7-4d6b-ab9a-41964514f765	Mesakh T. W. Boikh, S.Pd, M.Sc	r3	Tuesday	07:50 - 08:40 SKS 1	cour2	STKIM41201	Matematika Dasar	3	KIM B.2.1	f		fe60ac3a-757d-42b8-9d07-21110c26d015	C
305a6403-9a52-4d57-88f5-ce919f22e4df	David Tambaru, S.Si., M.Chem.Sc., Ph.D.	r2	Wednesday	13:00 - 13:50 SKS 6	cour7	STKIM41204	Bahasa Inggris Untuk Kimia	2	KIM A.2.6	f		cc7	A
85098324-e50c-4776-b607-0393892de988	Odi Th Selan, S.Si., M.Sc., Ph.D	r3	Tuesday	10:20 - 11:10 SKS 4	cour22	STKIM43201	Kimia Anorganik 2	2	KIM B.2.1	f		5a3260dc-9273-49b9-90c6-ecbb623bf5d0	B
3ce1f56c-3b91-46e6-b63a-57bc29d70a07	Dr. Brian Juned Septory, S.Pd., M.Pd	r1	Thursday	13:00 - 13:50 SKS 6	cour2	STKIM41201	Matematika Dasar	3	KIM A.1.3	f		cc2	A
756f632b-0cf5-4c46-83fd-87dfab1eb452	Luther Kadang, S.TP, M.Si	r5	Wednesday	07:50 - 08:40 SKS 1	cour25	STKIM43204	Kimia Analitik 2	2	Biosains	f		69f46c5c-a497-41f4-876e-5b848deaa810	B
b8102bdb-be09-48d0-8bc2-ff1d383290eb	Odi Th Selan, S.Si., M.Sc., Ph.D	r3	Thursday	14:40 - 15:30 SKS 8	cour7	STKIM41204	Bahasa Inggris Untuk Kimia	2	KIM B.2.1	f		c6659c76-ac7b-4573-b44b-3e918c1e6a40	B
8c8c44d4-0809-4545-8f97-ef7bfb6ada4c	Lisky Th. Subu Taopan, S.Pd., M.Hum	r4	Monday	10:20 - 11:10 SKS 4	cour10	MKU112247201	Bahasa Indonesia	2	KIM C.1.1	f		19e8199f-6bf6-444b-9b33-748609ad86f2	B
d79afbb3-546e-4555-b91b-7455efd05dae	Dr. Dodi Darmakusuma, S.Si, M.Si	r5	Wednesday	13:00 - 13:50 SKS 6	cour9	STKIM41206	Pengelolaan Lab	2	Biosains	f		cc9	A
2b826ce0-fb5e-4e7f-9a05-5071624d82db	Sherly M. F. Ledoh, S.Si.,M.Sc	r1	Tuesday	09:30 - 10:20 SKS 3	cour25	STKIM43204	Kimia Analitik 2	2	KIM A.1.3	f		cc25	A
8288ea19-f634-4e9f-ae01-d57081215de1	Titus Lapailaka, S.Si., M.Si	r5	Tuesday	10:20 - 11:10 SKS 4	cour22	STKIM43201	Kimia Anorganik 2	2	Biosains	f		cc22	A
d7e5c034-f8aa-4653-ad69-f6d4cad7fa76	Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D	r4	Monday	09:30 - 10:20 SKS 3	cour21	MKP16147201x	Pendidikan Anti Korupsi	1	KIM C.1.1	f		cc21	A
7b50d246-aa93-4f02-bcc7-6427cfbf5758	Dr. Dodi Darmakusuma, S.Si, M.Si	r5	Wednesday	14:40 - 15:30 SKS 8	5df4d7ec-1f29-4e76-96c0-5b2dd5c23d47	STKIM 43209	Mikrobiologi	2	Biosains	f		6e431070-a0ae-4dd1-8b7b-61358bbede02	A
17cf18ad-c313-44a3-8e98-1062412b5978	Drs. Theodorus Da Cunha, M.Si	r1	Monday	07:50 - 08:40 SKS 1	cour5	STKIM41301	Kimia Dasar I	3	KIM A.1.3	f		903c88a5-e22a-448b-b269-60e365dc4ae4	B
6646011d-3498-40a2-a484-24f26ebc4be4	Robertus Dole Guntur, S.Si., M. Math.Sc. GC-RESIM., PhD	r4	Wednesday	07:50 - 08:40 SKS 1	cour2	STKIM41201	Matematika Dasar	3	KIM C.1.1	f		965776fd-7ef0-4682-87de-fb32891c5bae	B
c1d47838-afce-4606-ba2a-eb603f9f3f1c	David Tambaru, S.Si., M.Chem.Sc., Ph.D.	r2	Monday	07:50 - 08:40 SKS 1	cour5	STKIM41301	Kimia Dasar I	3	KIM A.2.6	f		4c988fa8-ebae-4ae3-b659-7c43dbe36108	C
7639606e-7db2-4e20-aa99-f01770d68f9e	Dr. Dodi Darmakusuma, S.Si, M.Si	r5	Monday	13:00 - 13:50 SKS 6	cour26	STKIM43205	Biokimia I	2	Biosains	f		4c8de055-c24e-4c3b-afaf-6d9b0acae28e	B
ee753c1b-dd05-4420-baf0-680bb77acef8	Luther Kadang, S.TP, M.Si	r5	Thursday	07:50 - 08:40 SKS 1	cour9	STKIM41206	Pengelolaan Lab	2	Biosains	f		cef0addd-c3b8-4630-95fa-931a635ab002	C
f05bbf9a-6408-4bfb-99cb-3cc10da1eb8f	Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D	r1	Monday	10:20 - 11:10 SKS 4	cour23	STKIM43202	Kimia Organik 2	2	KIM A.1.3	f		2a452a0a-ab66-43ba-8617-edb86a510cc7	B
914e67f3-de70-482b-91b0-9497f1d3e4af	Dr. Suwari, S.Pd, M.Si	r5	Tuesday	07:50 - 08:40 SKS 1	cour28	STKIM43207	Teknik Sampling dan Penanganan Sampel	2	Biosains	f		cc28	A
45e48926-31b8-454b-ac91-18c14e9a8c32	David Tambaru, S.Si., M.Chem.Sc., Ph.D.	r1	Thursday	07:50 - 08:40 SKS 1	cour28	STKIM43207	Teknik Sampling dan Penanganan Sampel	2	KIM A.1.3	f		6d349b25-8a4d-4d48-a69d-6d4179802dca	B
3af68b62-0ee7-480d-8ed0-99ea9bb20033	Dr. Suwari, S.Pd, M.Si	r5	Monday	14:40 - 15:30 SKS 8	cour47	STKIM45205	Metodologi Penelitian	2	Biosains	f		cc47	A
15f17b3e-8ebb-47ed-88f0-db9b26c7de23	Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc	r5	Monday	07:50 - 08:40 SKS 1	cour44	STKIM45202	Elusidasi Struktur Senyawa Organik	2	Biosains	f		dd71c364-8320-4219-b82b-df5bccecb1b8	B
dfe76128-cd5d-414c-9afc-6ebecf52d215	Bibiana Dho Tawa, S.Si., M.Sc	r3	Thursday	09:30 - 10:20 SKS 3	cour51	STKIM45209	Kinetika Kimia	2	KIM B.2.1	f		cc51	A
da47345b-9189-417e-874a-534f62de3226	Titus Lapailaka, S.Si., M.Si	r3	Wednesday	09:30 - 10:20 SKS 3	cour45	STKIM45203	Elusidasi Struktur Senyawa Anorganik	2	KIM B.2.1	f		cc45	A
1343e75e-b651-422b-9576-5a78d96a90e3	Fidelis Nitti, S.Si., M.Sc., Ph.D	r1	Monday	13:00 - 13:50 SKS 6	cour47	STKIM45205	Metodologi Penelitian	2	KIM A.1.3	f		fcf097e5-6496-42d3-90c4-85761cd9629f	B
d0a337d2-d7b7-4975-9a62-6dd2157b3767	Dr. Theodore Y. K. Lulan, S.Si, M.Sc	r2	Wednesday	07:50 - 08:40 SKS 1	cour44	STKIM45202	Elusidasi Struktur Senyawa Organik	2	KIM A.2.6	f		cc44	A
94baab55-1fba-4c2b-964e-5ccb3b8664f1	Hermania Em Wogo, S.Si.,M.Si	r2	Thursday	13:00 - 13:50 SKS 6	cour49	STKIM45207	Kimia Anorganik Fisik	2	KIM A.2.6	f		df8ac9b7-51c3-4a8f-bd5a-2b0cbe84eec8	B
4fbd8e62-04cd-4e25-ad7f-1dab002c9b8c	Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc	r5	Wednesday	09:30 - 10:20 SKS 3	cour52	STKIM45210	Kimia Heterosiklik dan Medisinal	2	Biosains	f		e9438816-48bd-475a-a956-49f3ace430b6	B
718e331e-35d9-425c-9ca8-efe44305b2a3	Mesakh T. W. Boikh, S.Pd, M.Sc	r2	Tuesday	13:00 - 13:50 SKS 6	cour48	STKIM45206	Kimia Material dan Katalis	2	KIM A.2.6	f		cc48	A
40286c03-1fa6-48c6-9105-aabb621ba06d	Mesakh T. W. Boikh, S.Pd, M.Sc	r4	Monday	07:50 - 08:40 SKS 1	cour24	STKIM43203	Kimia Fisik 2	2	KIM C.1.1	f		115f0121-171b-48a9-a6cc-09c20d5a8fa3	B
888f67d5-bb2b-4b11-950a-ee277b3c5b80	Odi Th Selan, S.Si., M.Sc., Ph.D	r3	Thursday	07:50 - 08:40 SKS 1	cour46	STKIM45204	Sintesis Senyawa Anorganik	2	KIM B.2.1	f		61719335-7592-4049-8b07-3fb762582653	B
2ca8df33-930b-495d-bba8-99f873658077	Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D	r4	Tuesday	07:50 - 08:40 SKS 1	30e763c7-a49b-471c-859f-1ebc15fd770b	STKIM47205	Teknologi Daur Ulang	2	KIM C.1.1	f		4c813ccf-9700-4c0c-8a93-8acb8d7b6ae5	A
b4608b3f-60c7-4038-b49f-347369a584fd	Boli Tonda Baso, S.Sos., M.Si	r3	Tuesday	13:00 - 13:50 SKS 6	cour20	MKU112147201	Pendidikan Kewarganegaraan	2	KIM B.2.1	f		cc20	A
1bd4f6fc-5f50-4001-9aa7-cf52e4e8ec26	Sherly M. F. Ledoh, S.Si.,M.Sc	r5	Tuesday	13:00 - 13:50 SKS 6	ce751cde-40bd-42f2-8123-29ff89e78569	 STKIM47206	Teknologi Remediasi	2	Biosains	f		77cafaa1-929b-4b93-9659-bac9b8ec97ab	A
edd2323b-1cf1-4ca1-964d-9f39fbd34447	Since D. Baunsele, S.Si.,M.Ling	r5	Monday	11:10 - 12:00 SKS 5	cour6	STKIM41101	Praktikum Kimia Dasar I	1	Biosains	f		1118545d-9733-427e-8c0c-e496c373effc	C
5a20dce6-d9c2-40c6-bad8-1b84a8168bc0	Marlon J.R. Benu.,S.Si.,M.Si	r3	Wednesday	11:10 - 12:00 SKS 5	cour29	STKIM43101	Praktikum Kimia Fisik Lahan Kering	1	KIM B.2.1	f		852524a0-c69c-4f4c-be27-468c8b723ffe	B
278c283d-2406-4798-af0a-6475e99d7adf	Luther Kadang, S.TP, M.Si	r3	Monday	16:20 - 17:10 SKS 10	cour31	STKIM43103	Praktikum Kimia Analitik Lahan Kering	1	KIM B.2.1	f		57f281d6-6f92-48dd-b2c1-7a1ac57c53c3	B
a1f9e60b-b719-469a-a942-330cee633b11	David Tambaru, S.Si., M.Chem.Sc., Ph.D.	r1	Tuesday	11:10 - 12:00 SKS 5	cour6	STKIM41101	Praktikum Kimia Dasar I	1	KIM A.1.3	f		a8cf127e-94fb-4fd9-ba8e-d3f0bf6c9ef6	B
ea849f7a-f79d-4f84-9eb0-d24a85f5b35a	Mesakh T. W. Boikh, S.Pd, M.Sc	r5	Wednesday	11:10 - 12:00 SKS 5	cour29	STKIM43101	Praktikum Kimia Fisik Lahan Kering	1	Biosains	f		cc29	A
d5330073-bafa-4dc2-9171-48f2247fb27b	Pius Dore Ola, S.Si, M.Si., Ph.D	r3	Monday	11:10 - 12:00 SKS 5	cour6	STKIM41101	Praktikum Kimia Dasar I	1	KIM B.2.1	f		cc6	A
04a53143-8c76-40d0-9780-5fb8c6017498	Sherly M. F. Ledoh, S.Si.,M.Sc	r1	Monday	16:20 - 17:10 SKS 10	cour31	STKIM43103	Praktikum Kimia Analitik Lahan Kering	1	KIM A.1.3	f		cc31	A
2aaebd1a-6596-4a39-abd8-0c3e59a3f76f	Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D	r1	Wednesday	11:10 - 12:00 SKS 5	cour30	STKIM43102	Praktikum Kimia Organik Lahan Kering	1	KIM A.1.3	f		cc30	A
b4c7c6da-6785-4e6a-8cef-ef29bd54c661	Mesakh T. W. Boikh, S.Pd, M.Sc	r4	Tuesday	10:20 - 11:10 SKS 4	9207d900-95e1-4cab-894e-33adc42a75c9	STKIM 45214	Nanomaterial	2	KIM C.1.1	f		87751a88-c82a-47c2-b028-d22508b0f39e	A
59efb08b-85f7-4abc-a043-e80b42461ac6	Marlon J.R. Benu.,S.Si.,M.Si	b10ac7da-fe7e-40ec-8bb0-d4b9c5e6c423	Monday	14:40 - 15:30 SKS 8	cour56	STKIM43208	Geokimia	2	Kim A.2.1	f		cc56	A
3bf2607b-8da9-47be-ac77-e9806cbff577	Mesakh T. W. Boikh, S.Pd, M.Sc	b10ac7da-fe7e-40ec-8bb0-d4b9c5e6c423	Monday	07:50 - 08:40 SKS 1	cour58	STKIM43211	Matematika Kimia	2	Kim A.2.1	f		cc58	A
09ab8757-0297-43d5-806b-5f1ab72ec308	Hanna Azmi Fathin, S.Si., M.Si	r3	Wednesday	07:50 - 08:40 SKS 1	cour8	STKIM41205	Fisika untuk Kimia	2	KIM B.2.1	f		a1d9e4cb-471f-4126-8d8c-09de0e242c37	C
f6be45ff-5e69-4475-96ed-3b4609fc1313	Luther Kadang, S.TP, M.Si	r5	Thursday	13:00 - 13:50 SKS 6	cour50	STKIM45208	Pengelolaan dan Pemantauan Lingkungan	2	Biosains	f		9aad33db-92bb-4ee8-af4b-2561697d0e3c	B
a588550e-8179-4def-9a65-36484f9fcb96	Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc	b10ac7da-fe7e-40ec-8bb0-d4b9c5e6c423	Thursday	14:40 - 15:30 SKS 8	81a27b4c-501a-461f-ba4a-796ee5685d63	STKIM 45211	Kimia Minyak Atsiri Lahan Kering	2	Kim A.2.1	f		77b6fb90-bcf6-4e4f-9a46-d421cc28f36e	A
a386a722-ad0a-46b7-9c59-145fb12148b5	Bibiana Dho Tawa, S.Si., M.Sc	b10ac7da-fe7e-40ec-8bb0-d4b9c5e6c423	Monday	13:00 - 13:50 SKS 6	cour68	STKIM47207	Kimia Polimer	2	Kim A.2.1	f		cc68	A
977876bc-2b8c-4039-8741-05b98c70c33f	Pius Dore Ola, S.Si, M.Si., Ph.D	b10ac7da-fe7e-40ec-8bb0-d4b9c5e6c423	Tuesday	13:00 - 13:50 SKS 6	0b26dc96-0601-4c8e-bc71-d2aace0d22fa	STKIM47210	Kimia Zat Warna Lahan Kering	2	Kim A.2.1	f		c79a1874-146c-468b-a7d7-09495a8d2130	A
c2144757-602a-48c2-aebd-f1513b42b369	Marlon J.R. Benu.,S.Si.,M.Si	b10ac7da-fe7e-40ec-8bb0-d4b9c5e6c423	Monday	09:30 - 10:20 SKS 3	0b260f83-151d-41ae-94ce-6cb39b6148a1	STKIM47208	Kimia Bahan Berpori	2	Kim A.2.1	f		a24eed56-af2d-4587-b77a-a4a29e26f4b3	A
195f6426-e3e9-45aa-a0c6-0c0454956c9e	David Tambaru, S.Si., M.Chem.Sc., Ph.D.	r1	Tuesday	13:00 - 13:50 SKS 6	c5da67e3-bf10-4d74-98f0-11d7ee6d6c58	STKIM47204	Sensor Kimia	2	KIM A.1.3	f		56f000bf-1c8c-4702-af5c-1526a239f720	A
54d9bd69-76b8-46aa-bbf3-8bb2a350e534	Since D. Baunsele, S.Si.,M.Ling	b10ac7da-fe7e-40ec-8bb0-d4b9c5e6c423	Wednesday	14:40 - 15:30 SKS 8	f6cb0a21-8a39-4889-afda-4b5c60a6ed39	STKIM 45215	Proses Industri Kimia	2	Kim A.2.1	f		ccf4561c-6bc0-483b-bd40-92579c6293d5	A
82745be3-96fe-48d2-aad0-a5c73fd54455	Hermania Em Wogo, S.Si.,M.Si	r1	Tuesday	14:40 - 15:30 SKS 8	1e402f01-0b56-43dc-88c1-eaf720f1e13d	STKIM 45216	Semikonduktor dan Sel Surya	2	KIM A.1.3	f		0813767e-4d93-414f-8f8e-9f60330e6e86	A
48fbc197-eb91-4ab9-bca9-7159440852c1	Marlon J.R. Benu.,S.Si.,M.Si	r3	Tuesday	14:40 - 15:30 SKS 8	cour48	STKIM45206	Kimia Material dan Katalis	2	KIM B.2.1	f		b78b401c-3c9e-4be3-a403-926d7ddbd6ae	B
3638b69b-0a00-4a2c-aade-bff6bcebc35d	Dr. Refli, M.Sc	r4	Tuesday	14:40 - 15:30 SKS 8	cour3	STKIM41202	Biologi Dasar	2	KIM C.1.1	f		21485682-dbb0-42f5-bec8-a661f45be8c1	C
0df4a1c9-02d1-4233-9e74-0d4e786b38ac	Dr. Suwari, S.Pd, M.Si	r5	Tuesday	14:40 - 15:30 SKS 8	cour27	STKIM43206	Kimia Lingkungan	2	Biosains	f		cc27	A
43fa4bf7-86f8-4beb-bacf-7a997c0b98b3	Drs. Theodorus Da Cunha, M.Si	r2	Tuesday	14:40 - 15:30 SKS 8	cour9	STKIM41206	Pengelolaan Lab	2	KIM A.2.6	f		c93013e9-a395-4b33-9e45-fa156689540a	B
be781377-9efd-4da6-a7b9-231009096355	Luther Kadang, S.TP, M.Si	r5	Thursday	09:30 - 10:20 SKS 3	cour66	STKIM46206	Kimia Pangan	2	Biosains	f		cc66	A
e2072b0d-5ee2-4187-9187-e0e540211c47	Since D. Baunsele, S.Si.,M.Ling	b10ac7da-fe7e-40ec-8bb0-d4b9c5e6c423	Thursday	13:00 - 13:50 SKS 6	a43fa770-38e6-4afb-af33-44caf6432edf	STKIM 45213	Enzim untuk Pangan	2	Kim A.2.1	f		ccf221b3-1872-4d6e-8d08-af6f9bacd7c9	A
3eef314a-8838-4d71-a1e0-dcc328284db3	Prof. Dr. Febri O. Nitbani, S.Si, M.Si	r3	Monday	07:50 - 08:40 SKS 1	cour43	STKIM45201	Sintesis Senyawa Organik	2	KIM B.2.1	f		cc43	A
5843e0c7-b153-41fe-91cc-e174e95d592a	Bibiana Dho Tawa, S.Si., M.Sc	r3	Monday	09:30 - 10:20 SKS 3	cour24	STKIM43203	Kimia Fisik 2	2	KIM B.2.1	f		cc24	A
f63d29ae-76c5-4146-8ef6-927752d14b58	Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D	r3	Monday	13:00 - 13:50 SKS 6	cour52	STKIM45210	Kimia Heterosiklik dan Medisinal	2	KIM B.2.1	f		cc52	A
c8426d30-1a3c-4282-b692-1de96b666a8f	Dr. Imanuel Gauru, S.Si.,,M.Si	r2	Monday	10:20 - 11:10 SKS 4	13c7610c-fb12-4ecc-a2d6-185f1123a5de	STKIM 45218	Kristalografi	2	KIM A.2.6	f		5c50e4e1-42b3-4d67-9bee-ea91b7d7aaea	A
eef48f57-0681-4470-b56e-53d7aeb1d904	Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D	r4	Monday	13:00 - 13:50 SKS 6	f792c82b-0d79-4ed3-908c-ceb04fefbea9	STKIM47203	Toksikologi Lingkungan	2	KIM C.1.1	f		028189ca-f17f-41c4-bdac-f1bb69b36d90	A
57fc3141-5fec-49ca-9932-8c3bb7207601	Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D	r5	Monday	09:30 - 10:20 SKS 3	cour4	STKIM41203	Pengantar Komputasi Kimia	2	Biosains	f		cc4	A
c826cef8-6f86-4d7b-8b15-cef8c537eae3	Prof. Dr. Febri O. Nitbani, S.Si, M.Si	r2	Tuesday	07:50 - 08:40 SKS 1	cour21	MKP16147201x	Pendidikan Anti Korupsi	1	KIM A.2.6	f		8ee626e2-79ca-474b-adf5-14bdb1695083	B
7844fc57-c211-4d00-b768-f3d06116d4eb	Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D	r2	Tuesday	08:40 - 09:30 SKS 2	cour43	STKIM45201	Sintesis Senyawa Organik	2	KIM A.2.6	f		2cddefb2-7d8c-4720-ae5b-c3001aa2edff	B
c2dc0066-7733-40d1-8dd5-9e115a96d85e	Dr. Suwari, S.Pd, M.Si	b10ac7da-fe7e-40ec-8bb0-d4b9c5e6c423	Tuesday	10:20 - 11:10 SKS 4	54c4176d-b107-44a0-999c-8c9b1ffdd85c	STKIM47202	Penyusunan Dokumen Lingkungan	2	Kim A.2.1	f		b8b85eb3-75ad-48d1-bae3-5ceb24dc58bf	A
923a2682-0592-4a2c-b241-35f332c39908	Jainudin Oumo, MAg	r2	Tuesday	10:20 - 11:10 SKS 4	9fa7d279-f69b-4a9d-a709-378c41cab77b	MKU 1223	Agama	2	KIM A.2.6	f		a3f140b2-9da9-48a1-849a-df032da2ccba	ISLAM
c7c1ff1f-e897-4ada-8568-b69c2b6561ad	Dr. Imanuel Gauru, S.Si.,,M.Si	r2	Monday	13:00 - 13:50 SKS 6	cour4	STKIM41203	Pengantar Komputasi Kimia	2	KIM A.2.6	f		33959c54-5d02-4b3d-80d1-366183975bd8	B
46937abd-519c-41c6-8e6c-24d59aeaa3c9	Hermania Em Wogo, S.Si.,M.Si	r1	Wednesday	07:50 - 08:40 SKS 1	cour45	STKIM45203	Elusidasi Struktur Senyawa Anorganik	2	KIM A.1.3	f		20acaf07-16b4-43ac-8bad-53b4a193fb28	B
85681e79-f06b-4266-8950-289a85fb500d	Bibiana Dho Tawa, S.Si., M.Sc	r4	Thursday	13:00 - 13:50 SKS 6	36200fd0-77eb-4f36-835a-d33033ef68de	STKIM 43210	Elektrokimia	2	KIM C.1.1	f		cebb879e-7414-4593-91aa-8c459297bb60	A
dd41c4f2-9149-4c85-97a1-56e1a42d9c2b	Dr. Theodore Y. K. Lulan, S.Si, M.Sc	r1	Wednesday	09:30 - 10:20 SKS 3	cour26	STKIM43205	Biokimia I	2	KIM A.1.3	f		cc26	A
38593154-6b79-450a-9fad-6438f454808e	Since D. Baunsele, S.Si.,M.Ling	b10ac7da-fe7e-40ec-8bb0-d4b9c5e6c423	Wednesday	07:50 - 08:40 SKS 1	1e35fd96-36b4-4927-8e07-996e34747f66	STKIM 47201	Analisis Air, Tanah, dan Udara	2	Kim A.2.1	f		78ba1525-0933-4a3e-9ed4-cd4e680615dd	A
ced85519-fce2-4236-af9c-b300ecdab49c	Dr. Imanuel Gauru, S.Si.,,M.Si	r2	Wednesday	09:30 - 10:20 SKS 3	cour4	STKIM41203	Pengantar Komputasi Kimia	2	KIM A.2.6	f		9d99e015-b31b-454d-a719-dab3202bd958	C
fc16b4f2-d47d-4b8a-a3f1-352fdcdae0cd	Christine Mbiliyora, S.Si., M.Si	r4	Wednesday	10:20 - 11:10 SKS 4	cour8	STKIM41205	Fisika untuk Kimia	2	KIM C.1.1	f		d33c819c-6d2a-4f29-9dd9-9af721c66943	B
09f9260e-7437-4dbc-a680-2f48281b98aa	Odi Th Selan, S.Si., M.Sc., Ph.D	r1	Wednesday	13:00 - 13:50 SKS 6	f0066f7e-3e65-4f57-8f89-4d154d9bdd4b	STKIM47209 	Kimia Organologam	2	KIM A.1.3	f		8bcf59eb-6838-4e62-9cef-b58482e8ef85	A
7667ffc6-560e-4503-b4c7-7d074631a5c8	Odi Th Selan, S.Si., M.Sc., Ph.D	r3	Wednesday	13:00 - 13:50 SKS 6	cour49	STKIM45207	Kimia Anorganik Fisik	2	KIM B.2.1	f		cc49	A
c89f2dc7-fe36-4d49-a810-6401e7a19232	Dr. Theodore Y. K. Lulan, S.Si, M.Sc	r2	Wednesday	16:20 - 17:10 SKS 10	cour30	STKIM43102	Praktikum Kimia Organik Lahan Kering	1	KIM A.2.6	f		0ae013f0-9380-4df3-99f2-d3c3b76c880f	B
434700f5-51ab-4bd1-8602-b199e958d6c2	Dr. Refli, M.Sc	r3	Wednesday	14:40 - 15:30 SKS 8	cour3	STKIM41202	Biologi Dasar	2	KIM B.2.1	f		2aa9139b-1379-4577-b1ed-5e05c81f4d79	B
62b0a3a8-dff9-4401-a4d4-c22c22ac9c4f	Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D	r1	Wednesday	14:40 - 15:30 SKS 8	cour27	STKIM43206	Kimia Lingkungan	2	KIM A.1.3	f		53570412-4530-4a99-9982-825cbfe90f7d	B
640c9131-e6d7-46ba-bcaa-9fddd8454b7e	Lisky Th. Subu Taopan, S.Pd., M.Hum	r4	Wednesday	14:40 - 15:30 SKS 8	cour10	MKU112247201	Bahasa Indonesia	2	KIM C.1.1	f		cc10	A
\.


--
-- Data for Name: semester_periods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.semester_periods (id, year, semester) FROM stdin;
0610dc58-ef7e-47fd-9e2a-aff1c8873661	2025	1
3d8f2e07-d875-4ddf-85f7-ae329045c347	2025	2
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (id, expires_at, token, created_at, updated_at, ip_address, user_agent, user_id, impersonated_by) FROM stdin;
Nj10WnxqNmFX7YH14LslcDkOfHJIKP15	2026-08-04 08:16:19.502	sl3vpNjuXK4cUirSbtquaiAXtbHGlYkx	2026-07-28 08:16:19.502	2026-07-28 08:16:19.502			dJmvATIBvyNASAxpfkG1XGt2AFfD5IGo	\N
7I9AE2GZghY7EnF2b9Yxsasa9Rj6wnsX	2026-08-04 10:22:44.375	uqCDGAuUXUE1rQC5nTLita1XfJ0zxhLb	2026-07-28 10:22:44.375	2026-07-28 10:22:44.375		Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	dJmvATIBvyNASAxpfkG1XGt2AFfD5IGo	\N
H9u6ztGBnNvwEd1jLG0TF9vMiBP59kke	2026-08-09 02:06:29.578	uHpn829tg3FnrQI5dWWqj7BP78jV5vzp	2026-08-02 02:06:29.58	2026-08-02 02:06:29.58	182.8.226.221	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	dJmvATIBvyNASAxpfkG1XGt2AFfD5IGo	\N
a75D3sFBWytZhMPGb6ea2clQzaOgSNkW	2026-08-11 06:56:45.585	lQBmLxonTdLeryaa7ryp2ccuUodC9OxM	2026-08-04 06:56:45.586	2026-08-04 06:56:45.586		Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	ydqqqZFhDV87MagYgHgjLNOLMqgVKMP6	\N
piQXAeBKUqLNk3Ufct6dWGV6vpTPoFvQ	2026-08-19 04:03:30.591	2RgQpyb8ApXPKz4VyAl89yzJpSEj5c5c	2026-08-11 01:38:43.857	2026-08-12 04:03:30.591	103.82.166.2	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	B9D6ZZchcnthfbPiWqjxzexZTqtFwWpL	\N
TqhEKYJlw0J4u0FkeHGuqEpjZ0TMurlv	2026-08-19 06:41:02.344	2Q19rqJoNrJiU8JKEtIu6YPIRxYpqhCV	2026-08-04 11:07:26.279	2026-08-12 06:41:02.344		Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	dJmvATIBvyNASAxpfkG1XGt2AFfD5IGo	\N
sR7JXITL1ssq6voEpZggOzDhnwiOFNyt	2026-08-20 05:50:59.202	8cYPr4VVqJJX1ydvW0IhBVr0HwiNlg4K	2026-08-13 05:50:59.202	2026-08-13 05:50:59.202	180.248.85.56	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	dJmvATIBvyNASAxpfkG1XGt2AFfD5IGo	\N
Z6T3HAwXF2YCWAsBJe4je4c1DR6sZkTM	2026-08-21 04:48:25.531	Af2IglJggezNLwNoVZ62F7rtKDVMr50C	2026-08-10 22:40:24.891	2026-08-14 04:48:25.531	36.79.90.182	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	ydqqqZFhDV87MagYgHgjLNOLMqgVKMP6	\N
GFEWDQuvS0x08u0WVqXf5Au46iuDoKt0	2026-08-27 06:43:26.805	VEDEuHX3IyBVfKpkUU6FBP2Ulnk4KXmI	2026-08-20 06:43:26.807	2026-08-20 06:43:26.807	103.82.166.2	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	ydqqqZFhDV87MagYgHgjLNOLMqgVKMP6	\N
pFJhCGBFwy5vRGR0KPncnqPqnCAWEVNp	2026-08-27 07:17:55.942	TjmC5DgCwr6dynXSV0bgAeD2VNaAJ8Jc	2026-08-20 07:17:55.943	2026-08-20 07:17:55.943	103.82.166.2	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	B9D6ZZchcnthfbPiWqjxzexZTqtFwWpL	\N
p8ah4eTB562epgig4fp43CHn0VvgR9ng	2026-09-21 01:05:05.895	ytCrohXaJnsvzXxYpMsSUMueo52TqC71	2026-09-14 01:05:05.897	2026-09-14 01:05:05.897	118.96.73.237	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	dJmvATIBvyNASAxpfkG1XGt2AFfD5IGo	\N
\.


--
-- Data for Name: sks_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sks_settings (id, duration_per_sks, active_days, day_start_time, day_end_time, current_period_id, auto_conflict_detection) FROM stdin;
1	50	["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]	07:50	17:30	0610dc58-ef7e-47fd-9e2a-aff1c8873661	t
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."user" (id, name, email, email_verified, image, created_at, updated_at, role, banned, ban_reason, ban_expires) FROM stdin;
dJmvATIBvyNASAxpfkG1XGt2AFfD5IGo	Admin	admin@kimia.com	f	\N	2026-07-28 08:16:19.195	2026-07-28 08:16:20.018	admin	f	\N	\N
ydqqqZFhDV87MagYgHgjLNOLMqgVKMP6	samuel bertolens jacob	samuelbjacob@kimia.com	f	\N	2026-08-04 06:12:44.648	2026-08-04 06:12:44.648	user	f	\N	\N
B9D6ZZchcnthfbPiWqjxzexZTqtFwWpL	Reinner Ishaq Lerrick	reinnerilerrick@kimia.com	f	\N	2026-08-04 01:03:39.216	2026-08-04 06:13:58.33	admin	f	\N	\N
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.verification (id, identifier, value, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: -
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, false);


--
-- Name: sks_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sks_settings_id_seq', 1, false);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: break_times break_times_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.break_times
    ADD CONSTRAINT break_times_pkey PRIMARY KEY (id);


--
-- Name: course_classes course_classes_code_letter_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_classes
    ADD CONSTRAINT course_classes_code_letter_unique UNIQUE (course_code, class_letter);


--
-- Name: course_classes course_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_classes
    ADD CONSTRAINT course_classes_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: lecturers lecturers_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_name_unique UNIQUE (name);


--
-- Name: lecturers lecturers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_pkey PRIMARY KEY (id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- Name: schedule_slots schedule_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_slots
    ADD CONSTRAINT schedule_slots_pkey PRIMARY KEY (id);


--
-- Name: semester_periods semester_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.semester_periods
    ADD CONSTRAINT semester_periods_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session session_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_token_key UNIQUE (token);


--
-- Name: sks_settings sks_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sks_settings
    ADD CONSTRAINT sks_settings_pkey PRIMARY KEY (id);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: account_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "account_userId_idx" ON public.account USING btree (user_id);


--
-- Name: session_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "session_userId_idx" ON public.session USING btree (user_id);


--
-- Name: verification_identifier_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX verification_identifier_idx ON public.verification USING btree (identifier);


--
-- Name: account account_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: courses courses_class_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_class_fk FOREIGN KEY (class_id) REFERENCES public.course_classes(id) ON DELETE SET NULL;


--
-- Name: courses courses_lecturer_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_lecturer_fk FOREIGN KEY (assigned_lecturer_name) REFERENCES public.lecturers(name) ON DELETE SET NULL;


--
-- Name: session session_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: sks_settings sks_settings_current_period_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sks_settings
    ADD CONSTRAINT sks_settings_current_period_fk FOREIGN KEY (current_period_id) REFERENCES public.semester_periods(id) ON DELETE SET NULL;


--
-- Name: schedule_slots slots_lecturer_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_slots
    ADD CONSTRAINT slots_lecturer_fk FOREIGN KEY (lecturer_name) REFERENCES public.lecturers(name) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 86P2Kh34GBcmtaJjsoTZFVsTgKydnKBDyABKXjZdcee671FXbm8o8q6fb7OHlFo

