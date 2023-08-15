import { Knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    meals: {
      id: string;
      title: string;
      created_at: string;
      is_in_diet: number | boolean;
      session_id?: string;
    };
  }
}
