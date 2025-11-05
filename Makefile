newmg:
	prisma migrate dev --name $(name)
migratedown:
	prisma migrate reset  
migrateup:
	prisma db push
migratedeploy:
	prisma migrate deploy
migratedev:
	prisma migrate dev
migratepull:
	prisma db pull

.PHONY: newmg migratedown migratepull migrateup migratedev migratedeploy