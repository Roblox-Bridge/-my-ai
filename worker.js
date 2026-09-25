export default {
  async fetch(request, env, ctx) {
    return new Response(
      "AETHERAI WORKER IS RUNNING",
      {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=UTF-8"
        }
      }
    );
  }
};
