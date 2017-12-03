compile:
	coffee -c -b javascripts/gear.coffee

install:
	npm install

run: compile
	npm start
start: run

anime: compile
	npm run anime

DMG=docs/Serencast-1.0.0.dmg
APP=docs/mac/Serencast.app/

# docsの下にdmgやappを生成
dmg: compile install
	npm run dmg

dmg-upload:
	scp ${DMG} Serencast.com:/home/masui/Serencast/public/Serencast.dmg

run-mac:
	open ${APP}

clean:
	/bin/rm -r -f node_modules docs *~
