import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env.API_PORT || 4000;
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3001',
    /^http:\/\/.*\.localhost:3001$/
  ],
  credentials: true
}));
app.use(express.json());

// Validation schema
const createTenantSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Tenant name must be at least 2 characters')
    .max(64, 'Tenant name must not exceed 64 characters')
});

// Utility functions
function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s'"`]/g, '-')
    .replace(/[\s'"`]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function ensureUniqueSlug(baseSlug, prismaClient) {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prismaClient.tenant.findUnique({
      where: { slug }
    });

    if (!existing) {
      return slug;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get tenant by slug
app.get('/api/tenants/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const tenant = await prisma.tenant.findUnique({
      where: { slug }
    });
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    res.json({ tenant });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tenants', async (req, res) => {
  try {
    // Validate request body
    const validation = createTenantSchema.safeParse(req.body);
    
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'Tenant name is required';
      return res.status(400).json({ error: errorMessage });
    }

    const { name } = validation.data;

    // Generate base slug
    const baseSlug = slugify(name);
    
    if (!baseSlug) {
      return res.status(400).json({ error: 'Invalid tenant name' });
    }

    // Ensure slug uniqueness and create tenant in transaction
    const result = await prisma.$transaction(async (tx) => {
      const uniqueSlug = await ensureUniqueSlug(baseSlug, tx);
      
      const tenant = await tx.tenant.create({
        data: {
          name,
          slug: uniqueSlug
        }
      });

      // Optional: Create audit log entry
      await tx.auditLog.create({
        data: {
          action: 'CREATE',
          resource: 'tenant',
          resourceId: tenant.id,
          metadata: { name, slug: uniqueSlug }
        }
      });

      return tenant;
    });

    // Return success response
    res.status(201).json({
      tenant: {
        id: result.id,
        name: result.name,
        slug: result.slug,
        status: result.status,
        createdAt: result.createdAt
      },
      urlHint: `${result.slug}.cavyor.com`
    });

  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
