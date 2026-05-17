-- Включение расширения PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- 1. Здания (полигоны)
DROP TABLE IF EXISTS buildings CASCADE;
CREATE TABLE buildings (
    id SERIAL PRIMARY KEY,
    geom geometry(Polygon, 4326),
    osm_id TEXT,
    building TEXT,
    building_levels TEXT,
    addr_housenumber TEXT,
    addr_place TEXT,
    addr_district TEXT,
    user_edit TEXT,
    timestamp TIMESTAMPTZ,
    version INTEGER,
    changeset TEXT
);

-- 2. Дороги (линии)
DROP TABLE IF EXISTS roads CASCADE;
CREATE TABLE roads (
    id SERIAL PRIMARY KEY,
    geom geometry(LineString, 4326),чк
    osm_id TEXT,
    highway TEXT,
    name TEXT,
    name_ru TEXT,
    surface TEXT,
    tracktype TEXT,
    user_edit TEXT,
    timestamp TIMESTAMPTZ,
    version INTEGER,
    changeset TEXT
);

-- 3. POI (точки) 
DROP TABLE IF EXISTS pois CASCADE;
CREATE TABLE pois (
    id SERIAL PRIMARY KEY,
    geom geometry(Point, 4326),
    osm_id TEXT,
    name TEXT,
    amenity TEXT,
    shop TEXT,
    user_edit TEXT,
    timestamp TIMESTAMPTZ
);

-- Создание пространственных индексов
CREATE INDEX idx_buildings_geom ON buildings USING GIST (geom);
CREATE INDEX idx_roads_geom ON roads USING GIST (geom);
CREATE INDEX idx_pois_geom ON pois USING GIST (geom);

-- Комментарии к таблицам
COMMENT ON TABLE buildings IS 'Здания СНТ Сокский-1';
COMMENT ON TABLE roads IS 'Дороги СНТ Сокский-1 и прилегающие';
COMMENT ON TABLE pois IS 'Точки интереса (POI)';

-- Вывод информации о созданных таблицах
SELECT 
    tablename, 
    obj_description(oid) as description
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('buildings', 'roads', 'pois');