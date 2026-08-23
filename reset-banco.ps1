Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Reiniciando o banco de dados (Docker) e aplicando o esquema.sql..." -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

Write-Host "`n[1/3] Derrubando os containers e apagando o volume atual do banco..." -ForegroundColor Yellow
docker-compose down -v

Write-Host "`n[2/3] Subindo o banco de dados novamente..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "`n[3/3] Aguardando a inicializacao..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "`n=======================================================" -ForegroundColor Green
Write-Host "PRONTO! O banco foi recriado com as alteracoes do esquema.sql." -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
