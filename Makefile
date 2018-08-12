export PATH := $(shell pwd)/node_modules/.bin:$(PATH)
SHELL := /bin/bash

init:
	yarn

build:
	npm run build && node ./bin/createSitemap.js

dev:
	npm start

publish:build
	cd ../blog-deploy && git add . && git commit -m 'auto update blog' && git checkout master && git push
	git push

post:
	@node ./bin/post.js ${name}
