const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "ycsbj5",

  e2e: {
    baseUrl: 'https://localhost',
    env: {
      environment: 'local',
      test_user: 'bobby',
      test_user_pass: '123',
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
