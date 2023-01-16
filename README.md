# Secrets

Here are the steps to run Secrets app on your local system :-

## Prerequisites

- NodeJS
- Git
- NodeJS

## Installation

Run these commands in your terminal to install the app:

```sh
git clone https://github.com/Sheikh-JamirAlam/Secrets.git
npm i
```

Create a .env file and fill in with information:
```
SECRET= <String for excryption>
CLIENT_ID= <Google Client ID>
CLIENT_SECRET= <Google Client Secret>
FACEBOOK_APP_ID= <Facebook Client ID>
FACEBOOK_APP_SECRET= <Facebook Client Secret>
PASS= <MongoDB Password>
USER= <MongoDB Username>
```

## Deployment

Run this command in your terminal to run Secrets in your local system:

```sh
node app.js
```

Then open http://localhost:3000/ in your browser.