// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  // SERVER_URL: "http://localhost/api/",
  // SERVER_URL_81: "http://localhost:81/api/",
  // WEBSOCKET: "http://localhost:81",
  SERVER_URL: "http://localhost:3001/api/",
  WEBSOCKET: "http://localhost:3001",
  // SERVER_URL: "https://gc-portal-server-c7324e603bcc.herokuapp.com/api/",
  // WEBSOCKET: "https://gc-portal-server-c7324e603bcc.herokuapp.com",
};
