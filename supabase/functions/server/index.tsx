import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-12045ef3/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== AUTHENTICATION ROUTES =====

// Sign Up endpoint
app.post("/make-server-12045ef3/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || '' },
      // Automatically confirm email since email server isn't configured
      email_confirm: true
    });

    if (error) {
      console.log(`Sign up error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile data in KV store
    if (data.user) {
      await kv.set(`user_profile:${data.user.id}`, {
        id: data.user.id,
        email: data.user.email,
        name: name || '',
        createdAt: new Date().toISOString(),
      });
    }

    return c.json({ 
      user: data.user,
      message: "Account created successfully"
    });
  } catch (error) {
    console.log(`Sign up exception: ${error}`);
    return c.json({ error: "Failed to create account" }, 500);
  }
});

// Sign In endpoint
app.post("/make-server-12045ef3/auth/signin", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Sign in with Supabase Auth (using admin client)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`Sign in error: ${error.message}`);
      return c.json({ error: "Invalid email or password" }, 401);
    }

    return c.json({ 
      session: data.session,
      user: data.user,
    });
  } catch (error) {
    console.log(`Sign in exception: ${error}`);
    return c.json({ error: "Failed to sign in" }, 500);
  }
});

// Get user profile
app.get("/make-server-12045ef3/auth/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get user profile from KV store
    const profile = await kv.get(`user_profile:${user.id}`);
    
    return c.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.name || '',
        createdAt: profile?.createdAt || user.created_at,
      }
    });
  } catch (error) {
    console.log(`Get profile exception: ${error}`);
    return c.json({ error: "Failed to get profile" }, 500);
  }
});

// Update user profile
app.put("/make-server-12045ef3/auth/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { name } = body;

    // Update profile in KV store
    const currentProfile = await kv.get(`user_profile:${user.id}`) || {};
    await kv.set(`user_profile:${user.id}`, {
      ...currentProfile,
      name,
      updatedAt: new Date().toISOString(),
    });

    return c.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.log(`Update profile exception: ${error}`);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

// ===== DOCUMENT ROUTES =====

// Save uploaded document
app.post("/make-server-12045ef3/documents", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { document } = body;

    if (!document || !document.id) {
      return c.json({ error: "Document data is required" }, 400);
    }

    // Store document in KV store
    await kv.set(`document:${user.id}:${document.id}`, {
      ...document,
      userId: user.id,
      createdAt: document.createdAt || new Date().toISOString(),
    });

    // Add document ID to user's document list
    const userDocs = await kv.get(`user_documents:${user.id}`) || { documentIds: [] };
    if (!userDocs.documentIds.includes(document.id)) {
      userDocs.documentIds.push(document.id);
      await kv.set(`user_documents:${user.id}`, userDocs);
    }

    return c.json({ message: "Document saved successfully" });
  } catch (error) {
    console.log(`Save document exception: ${error}`);
    return c.json({ error: "Failed to save document" }, 500);
  }
});

// Get all user documents
app.get("/make-server-12045ef3/documents", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get user's document list
    const userDocs = await kv.get(`user_documents:${user.id}`) || { documentIds: [] };
    
    // Fetch all documents
    const documents = await Promise.all(
      userDocs.documentIds.map(async (docId: string) => {
        const doc = await kv.get(`document:${user.id}:${docId}`);
        return doc;
      })
    );

    return c.json({ documents: documents.filter(doc => doc !== null) });
  } catch (error) {
    console.log(`Get documents exception: ${error}`);
    return c.json({ error: "Failed to get documents" }, 500);
  }
});

// Delete document
app.delete("/make-server-12045ef3/documents/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const docId = c.req.param('id');

    // Remove document from KV store
    await kv.del(`document:${user.id}:${docId}`);

    // Remove from user's document list
    const userDocs = await kv.get(`user_documents:${user.id}`) || { documentIds: [] };
    userDocs.documentIds = userDocs.documentIds.filter((id: string) => id !== docId);
    await kv.set(`user_documents:${user.id}`, userDocs);

    return c.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.log(`Delete document exception: ${error}`);
    return c.json({ error: "Failed to delete document" }, 500);
  }
});

// ===== CHAT HISTORY ROUTES =====

// Save chat message
app.post("/make-server-12045ef3/chat/messages", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { message, materialId } = body;

    if (!message) {
      return c.json({ error: "Message is required" }, 400);
    }

    // Store message in chat history
    const chatKey = `chat_history:${user.id}:${materialId || 'general'}`;
    const chatHistory = await kv.get(chatKey) || { messages: [] };
    chatHistory.messages.push({
      ...message,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 100 messages per conversation
    if (chatHistory.messages.length > 100) {
      chatHistory.messages = chatHistory.messages.slice(-100);
    }

    await kv.set(chatKey, chatHistory);

    return c.json({ message: "Message saved successfully" });
  } catch (error) {
    console.log(`Save chat message exception: ${error}`);
    return c.json({ error: "Failed to save message" }, 500);
  }
});

// Get chat history for a material
app.get("/make-server-12045ef3/chat/messages/:materialId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const materialId = c.req.param('materialId');
    const chatKey = `chat_history:${user.id}:${materialId}`;
    const chatHistory = await kv.get(chatKey) || { messages: [] };

    return c.json({ messages: chatHistory.messages });
  } catch (error) {
    console.log(`Get chat history exception: ${error}`);
    return c.json({ error: "Failed to get chat history" }, 500);
  }
});

// ===== CALENDAR ROUTES =====

// Get all calendar events for user
app.get("/make-server-12045ef3/calendar/events", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get user's event list
    const userEvents = await kv.get(`user_calendar_events:${user.id}`) || { eventIds: [] };
    
    // Fetch all events
    const events = await Promise.all(
      userEvents.eventIds.map(async (eventId: string) => {
        const event = await kv.get(`calendar_event:${user.id}:${eventId}`);
        return event;
      })
    );

    return c.json({ events: events.filter(event => event !== null) });
  } catch (error) {
    console.log(`Get calendar events exception: ${error}`);
    return c.json({ error: "Failed to get calendar events" }, 500);
  }
});

// Create new calendar event
app.post("/make-server-12045ef3/calendar/events", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { title, date, time, type, notes, location } = body;

    if (!title || !date || !type) {
      return c.json({ error: "Title, date, and type are required" }, 400);
    }

    // Generate event ID
    const eventId = `event_${Date.now()}`;

    // Store event in KV store
    const event = {
      id: eventId,
      title,
      date,
      time: time || null,
      type,
      notes: notes || null,
      location: location || null,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`calendar_event:${user.id}:${eventId}`, event);

    // Add event ID to user's event list
    const userEvents = await kv.get(`user_calendar_events:${user.id}`) || { eventIds: [] };
    if (!userEvents.eventIds.includes(eventId)) {
      userEvents.eventIds.push(eventId);
      await kv.set(`user_calendar_events:${user.id}`, userEvents);
    }

    return c.json({ event, message: "Event created successfully" });
  } catch (error) {
    console.log(`Create calendar event exception: ${error}`);
    return c.json({ error: "Failed to create event" }, 500);
  }
});

// Update calendar event
app.put("/make-server-12045ef3/calendar/events/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const eventId = c.req.param('id');
    const body = await c.req.json();
    const { title, date, time, type, notes, location } = body;

    // Get existing event
    const existingEvent = await kv.get(`calendar_event:${user.id}:${eventId}`);
    if (!existingEvent) {
      return c.json({ error: "Event not found" }, 404);
    }

    // Update event
    const updatedEvent = {
      ...existingEvent,
      title: title !== undefined ? title : existingEvent.title,
      date: date !== undefined ? date : existingEvent.date,
      time: time !== undefined ? time : existingEvent.time,
      type: type !== undefined ? type : existingEvent.type,
      notes: notes !== undefined ? notes : existingEvent.notes,
      location: location !== undefined ? location : existingEvent.location,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`calendar_event:${user.id}:${eventId}`, updatedEvent);

    return c.json({ event: updatedEvent, message: "Event updated successfully" });
  } catch (error) {
    console.log(`Update calendar event exception: ${error}`);
    return c.json({ error: "Failed to update event" }, 500);
  }
});

// Delete calendar event
app.delete("/make-server-12045ef3/calendar/events/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const eventId = c.req.param('id');

    // Remove event from KV store
    await kv.del(`calendar_event:${user.id}:${eventId}`);

    // Remove from user's event list
    const userEvents = await kv.get(`user_calendar_events:${user.id}`) || { eventIds: [] };
    userEvents.eventIds = userEvents.eventIds.filter((id: string) => id !== eventId);
    await kv.set(`user_calendar_events:${user.id}`, userEvents);

    return c.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.log(`Delete calendar event exception: ${error}`);
    return c.json({ error: "Failed to delete event" }, 500);
  }
});

// ===== MATERIALS ROUTES =====

// Get user's materials
app.get("/make-server-12045ef3/materials", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get user's materials from KV store
    const materials = await kv.get(`materials:${user.id}`);
    
    return c.json({ materials: materials || [] });
  } catch (error) {
    console.log(`Get materials exception: ${error}`);
    return c.json({ error: "Failed to get materials" }, 500);
  }
});

// Save user's materials
app.post("/make-server-12045ef3/materials", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { materials } = body;

    if (!materials || !Array.isArray(materials)) {
      return c.json({ error: "Invalid materials data" }, 400);
    }

    // Save materials to KV store with user ID
    await kv.set(`materials:${user.id}`, materials);
    
    return c.json({ message: "Materials saved successfully" });
  } catch (error) {
    console.log(`Save materials exception: ${error}`);
    return c.json({ error: "Failed to save materials" }, 500);
  }
});

Deno.serve(app.fetch);