migrateup:
	npx prisma migrate dev --name $(name)
migratedown:
	npx prisma migrate reset

.PHONY: migrateup migratedown