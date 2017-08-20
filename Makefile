init:
	git submodule init
	git submodule update
	mkdir -p dist/css dist/archives
	yarn

build:
	node ./bin/build.js

watch:
	@node ./bin/server.js

publish:build
	cd dist && git add . && git commit -m 'auto update blog' && git checkout master && git push
	git add dist && git commit -m 'update submodule'
	git push

post:
	@node ./bin/post.js ${name}
