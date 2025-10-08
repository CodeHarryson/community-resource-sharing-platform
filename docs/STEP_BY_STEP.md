Coogs R Us — Step-by-step setup and student lab guide
=====================================================

This guide walks students through cloning, building, running, and extending the Community Resource Sharing Platform locally using Docker and the project code in this repository.

Audience: Students in a lab or student org who want to run and modify the app locally on Windows (PowerShell examples included).

1) Prerequisites
-----------------
- Git (clone the repository)
- Docker Desktop (with Docker Compose)
- Node.js & npm (optional if you plan to run client/server locally without Docker)
- Python (optional for docs generation)

2) Clone the repo
------------------
Open PowerShell and run:

```powershell
# change to a folder where you'll keep projects
cd C:\Users\<you>\projects

# clone the repo
git clone https://github.com/CodeHarryson/community-resource-sharing-platform.git
cd community-resource-sharing-platform
```

3) Inspect the repository layout
---------------------------------
Key folders:
- `client/` — React frontend (Create React App), static images in `client/public/images`
- `server/` — Express server, DB init script `server/init.sql`
- `docker-compose.yml` — brings up Postgres, server, client

4) Start the app with Docker Compose (fastest, recommended)
-----------------------------------------------------------
This builds images and runs the three services: Postgres, server, and client (nginx serving built React app).

```powershell
# from repo root
# Optional: remove an old DB volume to start fresh (WARNING: deletes DB data)
# docker-compose down -v

docker-compose up -d --build
```

Wait a minute for all services to come up. Check status:

```powershell
docker-compose ps
```

Open the app in a browser:
- Frontend: http://localhost:3000
- Backend health: http://localhost:5000 (or call /api endpoints)

5) Register an account and test basic flow
------------------------------------------
- Register via the UI or use the API from PowerShell (node-fetch or curl).
- Create a resource from the "Create" page.
- Login as a different user and request the item.
- Approve/deny from the owner's dashboard and observe notifications.

6) Adding / updating images (how we handled images)
---------------------------------------------------
The frontend serves static images from `client/public/images`. Because the client is built into a static bundle (nginx), you must add files in the repo and rebuild the client image.

Example to add an image on Windows (PowerShell):

```powershell
# create images folder (if missing)
New-Item -ItemType Directory -Force -Path .\client\public\images

# copy your local file (watch for spaces in filenames)
Copy-Item -Path "Example" -Destination .\client\public\images\kids-bicycle.jpg -Force
```

Then rebuild the client and redeploy the client container so nginx serves the new file:

```powershell
docker-compose build client
docker-compose up -d --no-deps --build client
```

Tip: prefer filenames without spaces (use hyphens) like `kids-bicycle.jpg`. If you add images after the client image has been built, nginx will not serve them until you rebuild the client image.

7) Re-seeding the database (if you want the initial sample data)
----------------------------------------------------------------
- The initial `server/init.sql` runs only when Postgres starts with an empty data volume. To force it to run again, remove the DB volume and bring the stack up fresh (this deletes data):

```powershell
# WARNING: this deletes current DB data
docker-compose down -v
docker-compose up -d --build
```

- If you have an existing DB and want to add the seed rows without deleting the volume, run the script added to the server package:

```powershell
# run inside the server container (or from host using docker-compose exec)
docker-compose exec server node scripts/apply_seeds.js
```

8) Working with API endpoints manually (quick examples)
------------------------------------------------------
Use `curl` or a small node script to call endpoints. Example: register and login via curl (PowerShell):

```powershell
# register
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{ \"name\":\"Test User\", \"email\":\"test@example.com\", \"password\":\"password123\" }"

# login
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{ \"email\":\"test@example.com\", \"password\":\"password123\" }"
```

Use the returned JWT token in the `Authorization: Bearer <token>` header to call protected endpoints (create resource, requests, notifications).

9) How images are associated to resources (server-side behavior)
----------------------------------------------------------------
- Each resource row in the DB has an `image_filename` column (string). The API returns `image_url` based on this column: `/images/<image_filename>`.
- If `image_filename` is empty, the backend falls back to `/images/<category>.svg` (category lowercased).
- To change the image shown for a seeded row, update the DB field:

```powershell
# update inside db container
docker-compose exec db psql -U postgres -d resources_db -c "UPDATE resources SET image_filename='kids-bicycle.jpg' WHERE id=5;"
```

10) Making code changes and testing quickly
------------------------------------------
- For server changes, you can rebuild the server image (or run server locally with Node):

```powershell
docker-compose build server
docker-compose up -d --no-deps --build server
# or run locally
cd server
npm install
npm run dev
```

- For client changes, the easiest development mode is to run the React dev server locally (port 3000) instead of rebuilding the image. This allows fast edits without rebuilding the Docker image.

```powershell
# run client dev server (from repo root)
cd client
npm install
npm start
```

When running client dev server, update `client/src/api.js` baseURL if needed (e.g., http://localhost:5000/api).

11) Common troubleshooting
--------------------------
- Blank page in browser: open DevTools Console — runtime JS errors (missing imports or syntax errors) often cause a blank page.
- Server crashes: check logs with `docker-compose logs --tail=200 server` and read the Node stack traces.
- DB seed not present: you likely need to recreate the DB volume (see section 7).
- Images not served: make sure images exist in `client/public/images` and rebuild the client image.

12) Recommended lab exercises for students
-----------------------------------------
- Add an image upload endpoint (Express + multer) and wire a file input in CreateResource so users can upload images without rebuilding.
- Implement mark-all-read for notifications and a read/unread UI state.
- Add test coverage: API tests using Jest and Supertest; basic UI tests with React Testing Library.
- Add migrations (node-pg-migrate) and document schema changes.

13) Extra commands cheat sheet (PowerShell)
------------------------------------------
```powershell
# build and start everything
docker-compose up -d --build

# stop everything
docker-compose down

# stop everything and remove DB data (re-seed on next start)
docker-compose down -v

# rebuild only client
docker-compose build client
docker-compose up -d --no-deps --build client

# run server seed helper
docker-compose exec server node scripts/apply_seeds.js

# list files in images folder
Get-ChildItem .\client\public\images\
```

14) Want an automatic image uploader in the app?
------------------------------------------------
I can add a server endpoint and client UI for image upload (use `multer` to accept multipart uploads and store files in `server/uploads/` or forward to S3). This avoids rebuilding the client when adding images. Tell me if you want that and I will implement it as a follow-up.



If you want, I can now:
- Add speaker notes to the generated PPT with these step-by-step instructions, or
- Convert this markdown into additional PPT slides and re-run the generator to produce an updated presentation with these steps included.

Which would you like next?