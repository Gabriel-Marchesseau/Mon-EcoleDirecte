@echo off
:: Usage : double-clic pour arreter le proxy en cours
PowerShell -ExecutionPolicy Bypass -File "%~dp0run.ps1" -stop
