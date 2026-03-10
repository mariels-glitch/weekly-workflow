import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { log } from "./index";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function verifyWorkstreamOwnership(workstreamId: string, userId: string): Promise<boolean> {
  const workstreams = await storage.getWorkstreams(userId);
  return workstreams.some(ws => ws.id === workstreamId);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/send-code", async (req, res) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);

      const code = generateCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await storage.createVerificationCode({
        email: email.toLowerCase(),
        code,
        expiresAt,
        used: false,
      });

      log(`Verification code for ${email}: ${code}`, "auth");

      res.json({ message: "Verification code sent. Check your email.", devCode: code });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email address" });
      }
      res.status(500).json({ message: "Failed to send verification code" });
    }
  });

  app.post("/api/auth/verify-code", async (req, res) => {
    try {
      const { email, code } = z.object({
        email: z.string().email(),
        code: z.string().length(6),
      }).parse(req.body);

      const validCode = await storage.getValidCode(email.toLowerCase(), code);
      if (!validCode) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }

      await storage.markCodeUsed(validCode.id);

      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({ email: email.toLowerCase() });
        await seedDefaultData(user.id);
      }

      req.session.regenerate((regenerateErr) => {
        if (regenerateErr) {
          return res.status(500).json({ message: "Session error" });
        }
        req.session.userId = user!.id;
        req.session.save((err) => {
          if (err) {
            return res.status(500).json({ message: "Session error" });
          }
          res.json({ user: { id: user!.id, email: user!.email } });
        });
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input" });
      }
      res.status(500).json({ message: "Verification failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    res.json({ id: user.id, email: user.email });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/workstreams", requireAuth, async (req, res) => {
    const result = await storage.getWorkstreams(req.session.userId!);
    res.json(result);
  });

  app.post("/api/workstreams", requireAuth, async (req, res) => {
    try {
      const data = z.object({
        name: z.string().min(1),
        color: z.string(),
        order: z.number().int().default(0),
        isActive: z.boolean().default(true),
      }).parse(req.body);

      const ws = await storage.createWorkstream({
        ...data,
        userId: req.session.userId!,
      });
      res.json(ws);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workstream data" });
      }
      res.status(500).json({ message: "Failed to create workstream" });
    }
  });

  app.patch("/api/workstreams/:id", requireAuth, async (req, res) => {
    try {
      const updates = z.object({
        name: z.string().min(1).optional(),
        color: z.string().optional(),
        order: z.number().int().optional(),
        isActive: z.boolean().optional(),
      }).parse(req.body);

      const ws = await storage.updateWorkstream(req.params.id, req.session.userId!, updates);
      if (!ws) return res.status(404).json({ message: "Not found" });
      res.json(ws);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workstream data" });
      }
      res.status(500).json({ message: "Failed to update workstream" });
    }
  });

  app.delete("/api/workstreams/:id", requireAuth, async (req, res) => {
    const deleted = await storage.deleteWorkstream(req.params.id, req.session.userId!);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  });

  app.put("/api/workstreams/reorder", requireAuth, async (req, res) => {
    try {
      const { orderedIds } = z.object({
        orderedIds: z.array(z.string()),
      }).parse(req.body);

      for (let i = 0; i < orderedIds.length; i++) {
        await storage.updateWorkstream(orderedIds[i], req.session.userId!, { order: i });
      }
      const result = await storage.getWorkstreams(req.session.userId!);
      res.json(result);
    } catch {
      res.status(500).json({ message: "Failed to reorder" });
    }
  });

  app.get("/api/labels", requireAuth, async (req, res) => {
    const result = await storage.getLabels(req.session.userId!);
    res.json(result);
  });

  app.post("/api/labels", requireAuth, async (req, res) => {
    try {
      const data = z.object({
        workstreamId: z.string(),
        name: z.string().min(1),
        color: z.string(),
      }).parse(req.body);

      const ownsWorkstream = await verifyWorkstreamOwnership(data.workstreamId, req.session.userId!);
      if (!ownsWorkstream) {
        return res.status(403).json({ message: "Workstream not found" });
      }

      const label = await storage.createLabel({
        ...data,
        userId: req.session.userId!,
      });
      res.json(label);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid label data" });
      }
      res.status(500).json({ message: "Failed to create label" });
    }
  });

  app.patch("/api/labels/:id", requireAuth, async (req, res) => {
    try {
      const updates = z.object({
        name: z.string().min(1).optional(),
        color: z.string().optional(),
        workstreamId: z.string().optional(),
      }).parse(req.body);

      if (updates.workstreamId) {
        const ownsWorkstream = await verifyWorkstreamOwnership(updates.workstreamId, req.session.userId!);
        if (!ownsWorkstream) {
          return res.status(403).json({ message: "Workstream not found" });
        }
      }

      const label = await storage.updateLabel(req.params.id, req.session.userId!, updates);
      if (!label) return res.status(404).json({ message: "Not found" });
      res.json(label);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid label data" });
      }
      res.status(500).json({ message: "Failed to update label" });
    }
  });

  app.delete("/api/labels/:id", requireAuth, async (req, res) => {
    const deleted = await storage.deleteLabel(req.params.id, req.session.userId!);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  });

  app.get("/api/tasks", requireAuth, async (req, res) => {
    const result = await storage.getTasks(req.session.userId!);
    res.json(result);
  });

  app.post("/api/tasks", requireAuth, async (req, res) => {
    try {
      const data = z.object({
        title: z.string().min(1),
        workstreamId: z.string(),
        dayIndex: z.number().int().min(-1).max(6),
        completed: z.boolean().default(false),
        labelIds: z.array(z.string()).default([]),
        priority: z.string().default("none"),
        description: z.string().default(""),
        externalLink: z.string().nullable().optional(),
        timeEstimate: z.string().nullable().optional(),
      }).parse(req.body);

      const ownsWorkstream = await verifyWorkstreamOwnership(data.workstreamId, req.session.userId!);
      if (!ownsWorkstream) {
        return res.status(403).json({ message: "Workstream not found" });
      }

      const task = await storage.createTask({
        ...data,
        userId: req.session.userId!,
      });
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const updates = z.object({
        title: z.string().min(1).optional(),
        workstreamId: z.string().optional(),
        dayIndex: z.number().int().min(-1).max(6).optional(),
        completed: z.boolean().optional(),
        labelIds: z.array(z.string()).optional(),
        priority: z.string().optional(),
        description: z.string().optional(),
        externalLink: z.string().nullable().optional(),
        timeEstimate: z.string().nullable().optional(),
      }).parse(req.body);

      if (updates.workstreamId) {
        const ownsWorkstream = await verifyWorkstreamOwnership(updates.workstreamId, req.session.userId!);
        if (!ownsWorkstream) {
          return res.status(403).json({ message: "Workstream not found" });
        }
      }

      const task = await storage.updateTask(req.params.id, req.session.userId!, updates);
      if (!task) return res.status(404).json({ message: "Not found" });
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid update data" });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", requireAuth, async (req, res) => {
    const deleted = await storage.deleteTask(req.params.id, req.session.userId!);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  });

  return httpServer;
}

async function seedDefaultData(userId: string) {
  const defaultWorkstreams = [
    { name: "Weekly / URGENT", color: "#32d74b", order: 0, isActive: true },
    { name: "Bugs / Incidents", color: "#ff453a", order: 1, isActive: true },
    { name: "Core Product", color: "#ff9f0a", order: 2, isActive: true },
    { name: "Strategy", color: "#64d2ff", order: 3, isActive: true },
    { name: "People / Hiring", color: "#bf5af2", order: 4, isActive: true },
  ];

  const createdWs: Record<string, string> = {};
  for (const ws of defaultWorkstreams) {
    const created = await storage.createWorkstream({ ...ws, userId });
    createdWs[ws.name] = created.id;
  }

  const defaultLabels = [
    { workstreamId: createdWs["Weekly / URGENT"], name: "Evergreen", color: "#32d74b" },
    { workstreamId: createdWs["Bugs / Incidents"], name: "Critical", color: "#ff453a" },
    { workstreamId: createdWs["Bugs / Incidents"], name: "Monitoring", color: "#ff9f0a" },
    { workstreamId: createdWs["Core Product"], name: "MVP", color: "#0a84ff" },
    { workstreamId: createdWs["Core Product"], name: "Tech Debt", color: "#8e8e93" },
    { workstreamId: createdWs["Strategy"], name: "Q4", color: "#64d2ff" },
    { workstreamId: createdWs["People / Hiring"], name: "Interview", color: "#bf5af2" },
    { workstreamId: createdWs["People / Hiring"], name: "Onboarding", color: "#30d158" },
  ];

  for (const label of defaultLabels) {
    await storage.createLabel({ ...label, userId });
  }
}
