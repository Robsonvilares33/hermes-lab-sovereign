import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Chat queries
export async function createChatSession(userId: number, title: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { chatSessions } = await import("../drizzle/schema");
  const result = await db.insert(chatSessions).values({
    userId,
    title,
  });

  return result[0]?.insertId || 0;
}

export async function getChatSessions(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { chatSessions } = await import("../drizzle/schema");
  return db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.userId, userId))
    .orderBy((t) => t.updatedAt);
}

export async function getChatMessages(sessionId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { chatMessages } = await import("../drizzle/schema");
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy((t) => t.timestamp);
}

export async function addChatMessage(
  sessionId: number,
  role: "user" | "hermes",
  content: string
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { chatMessages } = await import("../drizzle/schema");
  await db.insert(chatMessages).values({
    sessionId,
    role,
    content,
  });
}

// Lottery queries
export async function createLotteryGame(
  userId: number,
  type: "mega_sena" | "lotomania" | "mais_milionaria",
  numbers: number[],
  analysis?: string,
  confidence?: number
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { lotteryGames } = await import("../drizzle/schema");
  await db.insert(lotteryGames).values({
    userId,
    type,
    numbers: JSON.stringify(numbers),
    analysis,
    confidence,
  });
}

export async function getLotteryGames(userId: number, type?: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { lotteryGames } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  
  if (type) {
    return db
      .select()
      .from(lotteryGames)
      .where(and(eq(lotteryGames.userId, userId), eq(lotteryGames.type, type as any)));
  }

  return db
    .select()
    .from(lotteryGames)
    .where(eq(lotteryGames.userId, userId));
}

export async function addLotteryResult(
  type: "mega_sena" | "lotomania" | "mais_milionaria",
  drawNumber: number,
  numbers: number[],
  date: Date
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { lotteryResults } = await import("../drizzle/schema");
  await db.insert(lotteryResults).values({
    type,
    drawNumber,
    numbers: JSON.stringify(numbers),
    date,
  });
}

export async function getLotteryResults(type?: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { lotteryResults } = await import("../drizzle/schema");
  
  if (type) {
    return db
      .select()
      .from(lotteryResults)
      .where(eq(lotteryResults.type, type as any));
  }

  return db
    .select()
    .from(lotteryResults);
}

// Vault queries
export async function createVaultDocument(
  userId: number,
  title: string,
  content: string,
  category?: string,
  tags?: string[]
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { vaultDocuments } = await import("../drizzle/schema");
  await db.insert(vaultDocuments).values({
    userId,
    title,
    content,
    category,
    tags: tags ? JSON.stringify(tags) : null,
  });
}

export async function getVaultDocuments(userId: number, category?: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { vaultDocuments } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  
  if (category) {
    return db
      .select()
      .from(vaultDocuments)
      .where(and(eq(vaultDocuments.userId, userId), eq(vaultDocuments.category, category)));
  }

  return db
    .select()
    .from(vaultDocuments)
    .where(eq(vaultDocuments.userId, userId));
}

export async function getVaultDocumentById(userId: number, documentId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { vaultDocuments } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  const result = await db
    .select()
    .from(vaultDocuments)
    .where(and(eq(vaultDocuments.userId, userId), eq(vaultDocuments.id, documentId)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateVaultDocument(
  userId: number,
  documentId: number,
  title?: string,
  content?: string,
  category?: string,
  tags?: string[]
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { vaultDocuments } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  const updateData: Record<string, any> = {};

  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (category !== undefined) updateData.category = category;
  if (tags !== undefined) updateData.tags = JSON.stringify(tags);

  await db
    .update(vaultDocuments)
    .set(updateData)
    .where(and(eq(vaultDocuments.userId, userId), eq(vaultDocuments.id, documentId)));
}

export async function deleteVaultDocument(userId: number, documentId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { vaultDocuments } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  await db
    .delete(vaultDocuments)
    .where(and(eq(vaultDocuments.userId, userId), eq(vaultDocuments.id, documentId)));
}
