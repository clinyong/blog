init:
	git submodule init
	git submodule update
	mkdir -p dist/css dist/archives
	yarn

build:
	node build.js

watch:
	@node server.js

publish:
	cd dist && git add . && git commit -m 'auto update blog' && git checkout master && git push
