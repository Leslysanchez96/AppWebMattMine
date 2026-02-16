@echo off
SETLOCAL
SET PGPASSWORD=admin1234

echo Creando base de datos BD-MattMine...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -f db\crear_bd.sql

echo.
echo Creando tablas en BD-MattMine...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d BD-MattMine -f db\schema.sql

echo.
echo Proceso completado.
SET PGPASSWORD=
ENDLOCAL
pause
