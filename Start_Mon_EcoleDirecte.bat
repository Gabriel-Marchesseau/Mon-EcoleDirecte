@echo off
:: Usage : double-clic pour lancer normalement
::         "Start_Mon_EcoleDirecte.bat" --debug pour le mode debug
::         "Start_Mon_EcoleDirecte.bat" --stop  pour arreter le proxy
if "%1"=="--debug" (
    PowerShell -ExecutionPolicy Bypass -File "%~dp0run.ps1" -debug
) else if "%1"=="--stop" (
    PowerShell -ExecutionPolicy Bypass -File "%~dp0run.ps1" -stop
) else (
    PowerShell -ExecutionPolicy Bypass -File "%~dp0run.ps1"
)
