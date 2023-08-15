import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("meals", (table) => {
    table.uuid("id").primary();
    table.text("title").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.boolean("is_in_diet").defaultTo(true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("meals");
}
