top: compile
	npm run top

compile:
	coffee -c -b javascripts/gear.coffee

install:
	npm install

run: compile
	npm start
start: run

anime: compile
	npm run anime

gyaon: compile
	npm run gyaon

DMG=bin/Serencast-1.0.0.dmg
APP=bin/mac/Serencast.app/

# binの下にdmgやappを生成
build: compile install
	npm run build

build-mac: build
	hdiutil create ${DMG} -volname "Serencast" -srcfolder ${APP}

install-mac:
	cp -r ${APP} /Applications

dmg-upload:
	scp ${DMG} Serencast.com:/home/masui/Serencast/public/Serencast.dmg

run-mac:
	open ${APP}

clean:
	/bin/rm -r -f node_modules docs bin *~
