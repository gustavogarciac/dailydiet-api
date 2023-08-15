import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import { randomUUID } from "crypto";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export async function mealsRoutes(app: FastifyInstance) {
  app.post("/", async (req, res) => {
    const createMealsBodySchema = z.object({
      title: z.string(),
      isInDiet: z.boolean(),
      createdAt: z.string(),
    });

    const { title, isInDiet, createdAt } = createMealsBodySchema.parse(
      req.body
    );

    let sessionId = req.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();
      res.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex("meals").insert({
      id: randomUUID(),
      title,
      is_in_diet: isInDiet,
      session_id: sessionId,
      created_at: createdAt,
    });

    return res.status(201).send();
  });

  app.get(
    "/",
    {
      preHandler: checkSessionIdExists,
    },
    async (req, res) => {
      try {
        const { sessionId } = req.cookies;
        if (!sessionId) {
          throw new Error("Usuário inválido!");
        }
        const meals = await knex("meals")
          .where({ session_id: sessionId })
          .select("*")
          .orderBy("created_at");
        return res.status(200).send({ meals });
      } catch (error) {
        console.error(error);
        return res.status(400).send(error);
      }
    }
  );

  app.get(
    "/:id",
    {
      preHandler: checkSessionIdExists,
    },
    async (req, res) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      });
      const { id } = getMealParamsSchema.parse(req.params);
      const { sessionId } = req.cookies;

      const meal = await knex("meals")
        .where({ session_id: sessionId, id })
        .first();
      return res.status(200).send({ meal });
    }
  );
}
