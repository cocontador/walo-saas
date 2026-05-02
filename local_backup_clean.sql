--
-- PostgreSQL database dump
--


-- Dumped from database version 16.13 (Debian 16.13-1.pgdg13+1)
-- Dumped by pg_dump version 16.13 (Debian 16.13-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: walo
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO walo;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: walo
--

COMMENT ON SCHEMA public IS '';


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: walo
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--


