import { beforeAll, it, describe, afterAll, expect, beforeEach } from "vitest";
import { execSync } from "node:child_process";
import request from "supertest";
import { app } from "../src/app";

describe("Meals Routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should be able to create a new meal", async () => {
    await request(app.server)
      .post("/meals")
      .send({
        title: "New Meal",
        isInDiet: true,
        createdAt: "23112312",
      })
      .expect(201);
  });

  it("should be able to list all meals", async () => {
    const createMealsResponse = await request(app.server).post("/meals").send({
      title: "New Meal",
      isInDiet: true,
      createdAt: "23112312",
    });

    const cookies = createMealsResponse.get("Set-Cookie");
    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        title: "New Meal",
      }),
    ]);
  });

  it("should be able to list a specific meal", async () => {
    const createMealsResponse = await request(app.server).post("/meals").send({
      title: "New Meal",
      isInDiet: true,
      createdAt: "121212",
    });
    const cookies = createMealsResponse.get("Set-Cookie");
    const listTransactionsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealId = listTransactionsResponse.body.meals[0].id;

    const getMealsResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(getMealsResponse.body.meal).toEqual(
      expect.objectContaining({
        title: "New Meal",
      })
    );
  });

  it("should be able to delete a meal", async () => {
    const createMealsResponse = await request(app.server).post("/meals").send({
      title: "New Meal",
      isInDiet: true,
      createdAt: "121212",
    });

    const cookies = createMealsResponse.get("Set-Cookie");

    const listAllMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealId = listAllMealsResponse.body.meals[0].id;
    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .expect(200);

    const listMealsAfterDeletionResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    expect(listMealsAfterDeletionResponse.body.meals).toEqual([]);
  });

  it("should be able to list the metrics", async () => {
    const createMealsResponse = await request(app.server)
      .post("/meals")
      .send({
        title: "New Meal",
        isInDiet: true,
        createdAt: "121212",
      })
      .expect(201);

    const cookies = createMealsResponse.get("Set-Cookie");
    const listMetricsResponse = await request(app.server)
      .get("/meals/metrics")
      .set("Cookie", cookies)
      .expect(200);

    expect(listMetricsResponse.body).toEqual(
      expect.objectContaining({
        totalMealsRegistered: 1,
        mealsInDiet: {
          registeredCount: 1,
          percentageOfTotal: 100,
          mealsInDietRegistered: [
            expect.objectContaining({
              title: "New Meal",
            }),
          ],
        },
        mealsNotInDiet: {
          registeredCount: "N/A",
          percentageOfTotal: 0,
          mealsNotInDietRegistered: [],
        },
      })
    );
  });
});
