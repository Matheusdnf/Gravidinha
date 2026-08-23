@echo off
echo =======================================================
echo Reiniciando o banco de dados (Docker) e aplicando o esquema.sql...
echo =======================================================

echo.
echo [1/3] Derrubando os containers e apagando o volume atual do banco...
docker-compose down -v

echo.
echo [2/3] Subindo o banco de dados novamente...
docker-compose up -d

echo.
echo [3/3] Aguardando a inicializacao...
timeout /t 3 /nobreak > NUL

echo.
echo =======================================================
echo PRONTO! O banco foi recriado com as alteracoes do esquema.sql.
echo =======================================================
