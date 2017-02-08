init:
	git submodule init
	git submodule update
	mkdir -p dist/css dist/archives
	yarn

build:
	node build.js
