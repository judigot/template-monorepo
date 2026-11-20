# Works both from the monorepo root (via its Makefile) and apps/travel.
TRAVEL_APP_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
TRAVEL_CLI := $(TRAVEL_APP_DIR)/scripts/travel.sh

.DEFAULT_GOAL := help
.PHONY: help doctor setup install dev start dev-go tunnel web build apk build-android build-web eas-login eas-init test check

help:
	@bash "$(TRAVEL_CLI)" help

doctor:
	@bash "$(TRAVEL_CLI)" doctor

setup install:
	@bash "$(TRAVEL_CLI)" setup

dev start:
	@bash "$(TRAVEL_CLI)" dev

dev-go:
	@bash "$(TRAVEL_CLI)" dev-go

tunnel:
	@bash "$(TRAVEL_CLI)" tunnel

web:
	@bash "$(TRAVEL_CLI)" web

build apk build-android:
	@bash "$(TRAVEL_CLI)" build

build-web:
	@bash "$(TRAVEL_CLI)" build-web

eas-login:
	@bash "$(TRAVEL_CLI)" eas-login

eas-init:
	@bash "$(TRAVEL_CLI)" eas-init

test:
	@bash "$(TRAVEL_CLI)" test

check:
	@bash "$(TRAVEL_CLI)" check
