import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createChatSession,
  getChatSessions,
  getChatMessages,
  addChatMessage,
} from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  chat: router({
    createSession: protectedProcedure
      .input(z.object({ title: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const sessionId = await createChatSession(ctx.user.id, input.title);
        return { sessionId };
      }),

    getSessions: protectedProcedure.query(async ({ ctx }) => {
      return getChatSessions(ctx.user.id);
    }),

    getMessages: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Validate ownership - get session and check userId
        const db = await import("./db").then(m => m.getDb);
        const dbInstance = await db();
        if (!dbInstance) throw new Error("Database not available");
        
        const { chatSessions } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const sessions = await dbInstance
          .select()
          .from(chatSessions)
          .where(eq(chatSessions.id, input.sessionId))
          .limit(1);
        
        if (sessions.length === 0 || sessions[0].userId !== ctx.user.id) {
          throw new Error("Unauthorized: session not found or does not belong to user");
        }
        
        return getChatMessages(input.sessionId);
      }),

    sendMessage: protectedProcedure
      .input(
        z.object({
          sessionId: z.number(),
          userMessage: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Validate ownership - get session and check userId
        const db = await import("./db").then(m => m.getDb);
        const dbInstance = await db();
        if (!dbInstance) throw new Error("Database not available");
        
        const { chatSessions } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const sessions = await dbInstance
          .select()
          .from(chatSessions)
          .where(eq(chatSessions.id, input.sessionId))
          .limit(1);
        
        if (sessions.length === 0 || sessions[0].userId !== ctx.user.id) {
          throw new Error("Unauthorized: session not found or does not belong to user");
        }
        // Save user message
        await addChatMessage(input.sessionId, "user", input.userMessage);

        // Get conversation history
        const messages = await getChatMessages(input.sessionId);

        // Prepare messages for LLM (convert to standard format)
        const llmMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
          {
            role: "system",
            content:
              "Você é o Agente Hermes, um assistente de inteligência artificial sofisticado especializado em análise de loterias e pesquisa de padrões matemáticos. Sua persona é a de um Pesquisador e Engenheiro de Dados com profundo conhecimento em estatística, probabilidade e análise de dados. Responda de forma precisa, profissional e educada.",
          },
          ...messages.map((msg) => ({
            role: msg.role === "hermes" ? ("assistant" as const) : ("user" as const),
            content: msg.content,
          })),
        ];

        // Invoke LLM
        const response = await invokeLLM({
          messages: llmMessages,
        });

        const messageContent = response.choices[0]?.message?.content;
        const assistantMessage = typeof messageContent === "string" 
          ? messageContent 
          : "Desculpe, não consegui gerar uma resposta.";

        // Save assistant message
        if (assistantMessage) {
          await addChatMessage(input.sessionId, "hermes", assistantMessage);
        }

        return { message: assistantMessage };
      }),
  }),
});

export type AppRouter = typeof appRouter;
