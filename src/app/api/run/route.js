import { runCpp } from "../../../lib/runner";

export async function POST(req) {
  try {
    const { code, input } = await req.json();

    const output = await runCpp(code, input);

    return new Response(JSON.stringify({ output }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}