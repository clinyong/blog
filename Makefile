export PATH := $(shell pwd)/node_modules/.bin:$(PATH)
SHELL := /bin/bash

init:
	git submodule init
	git submodule update
	yarn

build:
	npm run build && node ./bin/createSitemap.js

dev:
	npm start

publish:build
	cd dist && git add . && git commit -m 'auto update blog' && git checkout master && git push
	git add dist && git commit -m 'update submodule'
	git push

post:
	@node ./bin/post.js ${name}
