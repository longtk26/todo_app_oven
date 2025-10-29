newmg:
	prisma migrate dev --name $(name)
migratedown:
	prisma migrate reset  
migrateup:
	prisma db push
migratedev:
	prisma migrate dev
migratepull:
	prisma db pull

.PHONY: newmg migratedown migratepull migrateup migratedev