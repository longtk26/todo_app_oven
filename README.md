# TODO APP 🏢

## About Project 📖
The project helps user manages their tasks in a day.
Feature of application:
1. User can register their account and login to use app.
2. Create task.
3. Set deadline and basic information of a task.
4. Verification email.
5. Send mail to remind user making their task before task is about start and before task is about end.


## Prerequisite ⚙️
- Docker: `version 28.0.1` 🐋
- NodeJS: `version 23.6.1` ｡🇯‌🇸‌
- Make: `version 4.3`

## How to run 🤔
1. Clone the repository
    ```
    git clone https://github.com/longtk26/todo_app_oven.git
    ```

2. Move to todo_app_oven directory
    ```
    cd ./todo_app_oven
    ```

3. Install packages
    ```
    npm i --legacy-peer-deps
    ```

4. Using docker to run tools (database, cache, pgadmin4...) from local
    ```
    docker compose -f docker-compose-dev.yml up -d
    ```

5. Prepare `.env` file
    ```
    Fill essential information in .env file based on .ex.env file
    ```
6. Prepare database
- Access to pgadmin: `http://localhost:5050` with username is `admin@gmail.com` password is `admin`
- Register a server:
    ![alt text](./docs/imgs/pgadmin.png)
- Fill name and connection:
    ![alt text](docs/imgs/pgadmin-general.png)
    ![alt text](docs/imgs/pgadmin-connection.png)
    ```
    Because all tools are running in container, you need to fill host of database is the name of container. Based on that pgadmin can find postgres database and connect to it.
    Username and password are given in docker-compose-dev.yml file.
    ```
- Create todo_app database:
    ![alt text](docs/imgs/pgadmin-create-database.png)

    You can change the name of database if you want. Only need to change the name of database in `.env` file. 

- Run migration:
    ```
    make migrateup
    ```
7. Run application
    ```
    npm start
    ```
    Now, the application will run at `http://localhost:<port>`. <br/>
    If you want to run app in docker container. You can see the guidline in `Step 7`

8. Run application in container (optional)
    After run essential tools in `docker-compose-dev.yml`, prepare `.env` file and `database` you can run application in container.<br/>
    ```
    docker compose -f docker-compose.yml up --build
    ```

    

## Swagger API document
Access to `http://localhost:<port>/api` to see OpenAPI docs.




