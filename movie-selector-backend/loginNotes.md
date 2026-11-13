For the login, you will need to download firebase-admin. It should be included in the package-lock.json.

You will also need to add the firebase credentials to your personal .env file. If those are not present, it will not work.

You also will need to download the serviceAccountKey. To do this in Firebase follow these steps:
- Go to Firebase console
- Click the gear icon
- Click project settings
- Open the service accounts tab
- Click generate a new key
- Download the file and move it into the movie-selector-backend folder
- Rename the file to serviceAccountKey.json