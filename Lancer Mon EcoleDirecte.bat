@echo off
:: Usage : double-clic pour lancer normalement
::         "Lancer Mon EcoleDirecte.bat" --debug pour le mode debug
if "%1"=="--debug" (
    PowerShell -ExecutionPolicy Bypass -File "%~dp0run.ps1" -debug
) else (
    PowerShell -ExecutionPolicy Bypass -File "%~dp0run.ps1"
)
