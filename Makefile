newmg:
	npx prisma migrate dev --name $(name)
migratedown:
	npx prisma migrate reset
migrateup:
	npx prisma db push
migratepull:
	npx prisma db pull

.PHONY: newmg migratedown migratepull migrateup