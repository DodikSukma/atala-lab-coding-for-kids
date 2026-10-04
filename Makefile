.PHONY: setup dev start stop status restart

setup:
	npm install

dev:
	@node scripts/local.mjs dev

start:
	@node scripts/local.mjs start

stop:
	@node scripts/local.mjs stop

status:
	@node scripts/local.mjs status

restart:
	@node scripts/local.mjs restart
