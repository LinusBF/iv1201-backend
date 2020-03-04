# Application Platform Backend-End
This project contains the back-end of a fictive job application platform.  It was created as part of a school-project at KTH.

## Motivation
The project contains two repo's; this one and one for a front-end web server and client running on Google's Cloud Run infrastructure.
This project contains a Express JS server for making API calls to the previously mentioned front-end.
The project is built in a Node.JS environment using Yarn as package manager.

**Technologies**
- Environment: Node JS
- Package manager: Yarn
- Test frameworks: Chai, Proxyquire
- Hooks: Husky
- Linter: ES Lint
- Code formatter: Prettier JS
- Vulnerability checker: Snyk

### Server-side
The server-side is built using Express. It's main responsibility is to act as layer in-between the front-end and the database.
This setup with both services running in Google's Cloud Run service allows us to hide the back-end API, and with that the database connection from the public internet.

**Technologies** 
 - Web application framework: Express JS
 - User backend authentication: Firebase Auth

## .env Skeleton
To run this service locally, you need to create a `.env` file in the root of the project.
This is an example of that file:
```
JOB_APPLICATION_KIND_DEV=TestKind # The FireStore 'kind' that will be used to save any job applications that are created with the local server
USER_FIELD_NAME=userId # What field the user is identified by
SORT_FIELD_NAME=applyDate # What field job applications are sorted on by default
STATUS_FIELD_NAME=approved # What field is used in a job application to mark the status of the application

#For Migration Only
FIREBASE_API=YOUR_WEB_API_KEY_HERE
```

## Package manager commands

```
yarn dev    //Run local development
yarn test   //Run tests
yarn add    //Add dependancies

//Husky hooks connected
"pre-commit": "lint-staged && snyk test && yarn test",
"post-merge": "yarn install"
```

## API

### POST /application
Adds a new job application to the database
#### Expected Format
```json
{
  
}
```
#### Responses
The application was successfully put in the database
##### 200
```json
{
  
}
```
##### 400
The submitted request body did not match the expected schema.
`errors` contains paths to all invalid values of the request as per npm package [validate](https://www.npmjs.com/package/validate)
```json
{
  "errors": {}
}
```
##### 500
Something else went wrong.
```
Something failed! Check the logs!
```

### GET /application
This endpoint returns a number of job applications
#### Query Parameters
```
count: Number of job applications to return (default 20)
offset: The offset to start the count from (default 0)
```
#### Responses
The application was successfully put in the database
##### 200
```json
{
  "applications": [
    {},
    {},
    {}
  ]
}
```
##### 400
The submitted request body did not match the expected schema.
```
Please specify count and offset query parameters to be numbers or leave them undefined!
```
##### 500
Something else went wrong.
```
Something failed! Check the logs!
```

### GET /application/:applicationId
This endpoint returns the job application specified in the URL
#### Responses
The application was successfully put in the database
##### 200
```json
{
  "application": {
    "applyDate": "",
    
  }
}
```
##### 400
The submitted request body did not match the expected schema.
```json
{
  
}
```
##### 500
Something else went wrong.
```
Something failed! Check the logs!
```

### POST /application/:applicationId/status
This endpoint...
#### Expected Format
```json
{
  
}
```
#### Responses
The application was successfully put in the database
##### 200
```json
{
  
}
```
##### 400
The submitted request body did not match the expected schema.
```json
{
  
}
```
##### 500
Something else went wrong.
```
Something failed! Check the logs!
```


### GET /user/:userId/application
This endpoint...
#### Expected Format
```json
{
  
}
```
#### Responses
The application was successfully put in the database
##### 200
```json
{
  
}
```
##### 400
The submitted request body did not match the expected schema.
```json
{
  
}
```
##### 500
Something else went wrong.
```
Something failed! Check the logs!
```


### GET /user/:userId/user-status
This endpoint...
#### Expected Format
```json
{
  
}
```
#### Responses
The application was successfully put in the database
##### 200
```json
{
  
}
```
##### 400
The submitted request body did not match the expected schema.
```json
{
  
}
```
##### 500
Something else went wrong.
```
Something failed! Check the logs!
```

