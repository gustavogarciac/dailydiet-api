import fastify from "fastify";
import { env } from "./env";
import cookie from "@fastify/cookie";
import { mealsRoutes } from "./routes/meals";

const app = fastify();

app.register(cookie);

app.register(mealsRoutes, {
  prefix: "meals",
});

const port = env.PORT;
app
  .listen({
    port,
  })
  .then(() => console.log("🚀 HTTP Server running"));
