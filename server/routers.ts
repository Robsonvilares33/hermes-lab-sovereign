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
  createLotteryGame,
  getLotteryGames,
  createVaultDocument,
  getVaultDocuments,
  getVaultDocumentById,
  updateVaultDocument,
  deleteVaultDocument,
  addLotteryResult,
  getLotteryResults,
} from "./db";
import { invokeLLM } from "./_core/llm";
import { GameGenerator30 } from "./lottery/game-generator-30";
import { calculateMegaSenaStatistics, parseNumbersJson } from "./lottery/statistics";
import { syncLatestMegaSenaResult, syncMegaSenaHistory } from "./lottery/sync";

function isMegaSenaResult(value: unknown): value is { drawNumber: number; numbers: string } {
  return Boolean(
    value &&
      typeof value === "object" &&
      "drawNumber" in value &&
      "numbers" in value &&
      typeof (value as { drawNumber: unknown }).drawNumber === "number" &&
      typeof (value as { numbers: unknown }).numbers === "string"
  );
}

async function getMegaSenaStatistics() {
  const stored = await getLotteryResults("mega_sena");
  const draws = stored.filter(isMegaSenaResult).map((result) => ({
    drawNumber: result.drawNumber,
    numbers: parseNumbersJson(result.numbers),
  }));
  return calculateMegaSenaStatistics(draws);
}

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

  vault: router({
    createDocument: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          content: z.string(),
          category: z.string().optional(),
          tags: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createVaultDocument(
          ctx.user.id,
          input.title,
          input.content,
          input.category,
          input.tags
        );
        return { success: true };
      }),

    getDocuments: protectedProcedure
      .input(
        z.object({
          category: z.string().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        return getVaultDocuments(ctx.user.id, input.category);
      }),

    getDocument: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return getVaultDocumentById(ctx.user.id, input.id);
      }),

    updateDocument: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          content: z.string().optional(),
          category: z.string().optional(),
          tags: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await updateVaultDocument(
          ctx.user.id,
          input.id,
          input.title,
          input.content,
          input.category,
          input.tags
        );
        return { success: true };
      }),

    deleteDocument: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteVaultDocument(ctx.user.id, input.id);
        return { success: true };
      }),
  }),

  results: router({
    syncLatest: protectedProcedure.mutation(async () => {
      return syncLatestMegaSenaResult();
    }),

    syncHistory: protectedProcedure.mutation(async () => {
      return syncMegaSenaHistory();
    }),

    getStatistics: protectedProcedure.query(async () => {
      const statistics = await getMegaSenaStatistics();
      return {
        drawCount: statistics.drawCount,
        frequency: Object.fromEntries(statistics.frequency),
        delay: Object.fromEntries(statistics.delay),
      };
    }),

    addResult: protectedProcedure
      .input(
        z.object({
          type: z.enum(["mega_sena", "lotomania", "mais_milionaria"]),
          drawNumber: z.number(),
          numbers: z.array(z.number()),
          date: z.date(),
        })
      )
      .mutation(async ({ input }) => {
        await addLotteryResult(input.type, input.drawNumber, input.numbers, input.date);
        return { success: true };
      }),

    getResults: publicProcedure
      .input(
        z.object({
          type: z.enum(["mega_sena", "lotomania", "mais_milionaria"]).optional(),
        })
      )
      .query(async ({ input }) => {
        return getLotteryResults(input.type);
      }),
  }),

  lottery: router({
    generateGame: protectedProcedure
      .input(
        z.object({
          type: z.enum(["mega_sena", "lotomania", "mais_milionaria"]),
          count: z.number().default(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Generate random numbers based on lottery type
        const ranges: Record<string, number> = {
          mega_sena: 60,
          lotomania: 100,
          mais_milionaria: 50,
        };

        const max = ranges[input.type];
        const count =
          input.type === "mega_sena"
            ? 6
            : input.type === "lotomania"
              ? 50
              : 6;

        const numbers = new Set<number>();
        while (numbers.size < count) {
          numbers.add(Math.floor(Math.random() * max) + 1);
        }

        const numbersArray = Array.from(numbers).sort((a, b) => a - b);
        const confidence = Math.floor(Math.random() * 30) + 60; // 60-90%

        // Save to database
        await createLotteryGame(
          ctx.user.id,
          input.type,
          numbersArray,
          `Gerado automaticamente pelo Agente Hermes`,
          confidence
        );

        return {
          numbers: numbersArray,
          confidence,
        };
      }),

    generate30Games: protectedProcedure.mutation(async ({ ctx }) => {
      const statistics = await getMegaSenaStatistics();
      const generator = new GameGenerator30(statistics.frequency, statistics.delay);
      const games = generator.generate30Games();

      for (const game of games) {
        await createLotteryGame(
          ctx.user.id,
          "mega_sena",
          game.numbers,
          `Categoria ${game.category} (${game.profile}); score heurístico, não probabilidade de prêmio.`,
          game.confidence
        );
      }

      return {
        drawCountUsed: statistics.drawCount,
        games,
        agentNote:
          "Hermes: os 30 jogos ampliam a cobertura de combinações, mas não alteram a probabilidade matemática de cada combinação individual.",
      };
    }),

    getGames: protectedProcedure
      .input(
        z.object({
          type: z.enum(["mega_sena", "lotomania", "mais_milionaria"]).optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        return getLotteryGames(ctx.user.id, input.type);
      }),
  }),
});
export type AppRouter = typeof appRouter;
