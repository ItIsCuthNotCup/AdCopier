import {
  TypeSafeClient,
  choice,
  noul,
  score,
  type Questions,
  type SystemOneResult,
} from "@typesafe-ai/sdk";

const client = new TypeSafeClient({
  apiKey: process.env.TYPESAFE_API_KEY,
  timeout: 20_000,
});

export { choice, noul, score };

export type { Questions };

export async function judge<Q extends Questions>(
  state: unknown,
  questions: Q
): Promise<SystemOneResult<Q>> {
  try {
    return await client.systemOne(
      {
        state: state as never,
        model: "jev-latest",
        questions,
      },
      { timeout: 20_000 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Jev request failed";
    throw new JevError(message);
  }
}

export class JevError extends Error {}
