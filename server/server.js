const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/db");

async function startServer() {
  await connectDB();

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`TrackHire API running in ${env.nodeEnv} mode on port ${env.port}`);
  });
}

startServer();
