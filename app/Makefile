program:
	coffee -c -b javascripts/gear.coffee

mac: program
	- cd ..; /bin/rm -r -f serencast-darwin-x64
	cd ..; make mac
#	mv ../serencast-darwin-x64 .

run: program
	electron .

anime: program
	electron . MasuiCast Anime
# npm run anime でもいい

dmg:
	electron-builder

dmg-upload:
	scp docs/Serencast-1.0.0.dmg Serencast.com:/home/masui/Serencast/public/Serencast.dmg
