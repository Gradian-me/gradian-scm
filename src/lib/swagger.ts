const API_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0';
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

const successResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string', nullable: true },
  },
};

const errorResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: { type: 'string' },
    message: { type: 'string', nullable: true },
  },
};

export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Gradian API',
    description:
      'REST API for the Gradian workspace platform. Endpoints are grouped by domain-specific tags for easier discovery.',
    version: API_VERSION,
    contact: {
      name: 'Gradian Engineering',
      url: 'https://gradian.me',
    },
  },
  servers: [
    {
      url: BASE_SERVER_URL,
      description: 'Primary server',
    },
    {
      url: 'http://localhost:3000',
      description: 'Local development',
    },
  ],
  tags: [
    {
      name: 'Auth',
      description: 'Authentication, session, and token management endpoints.',
    },
    {
      name: 'Builders',
      description: 'Builder catalog management with CRUD operations.',
    },
    {
      name: 'Schemas',
      description: 'Schema registry endpoints for forms and dynamic pages.',
    },
  ],
  paths: {
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate user credentials',
        description: 'Validates user credentials and issues short-lived and refresh tokens.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              examples: {
                default: {
                  value: {
                    email: 'admin@gradian.me',
                    password: 'StrongPassword123!',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Logged in successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
          },
          400: {
            description: 'Email or password missing.',
            content: { 'application/json': { schema: errorResponse } },
          },
          401: {
            description: 'Authentication failed.',
            content: { 'application/json': { schema: errorResponse } },
          },
          500: {
            description: 'Unexpected error.',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Invalidate session tokens',
        description: 'Revokes active session cookies and removes refresh/access tokens.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Tokens removed successfully.',
            content: { 'application/json': { schema: successResponse } },
          },
          401: {
            description: 'Missing or invalid credentials.',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
    '/api/auth/token/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh an access token',
        description:
          'Generates a new access token using a valid refresh token supplied via body, cookies, or the Authorization header.',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Token refreshed successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RefreshTokenResponse' },
              },
            },
          },
          400: {
            description: 'Missing refresh token.',
            content: { 'application/json': { schema: errorResponse } },
          },
          401: {
            description: 'Refresh token invalid or expired.',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
    '/api/builders': {
      get: {
        tags: ['Builders'],
        summary: 'List builders',
        description: 'Returns a filtered list of builders stored in `data/all-builders.json`.',
        parameters: [
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Full-text search on builder id, title, and description.',
          },
        ],
        responses: {
          200: {
            description: 'List of builders.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    count: { type: 'integer', example: 3 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Builder' },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Storage failure.',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
      post: {
        tags: ['Builders'],
        summary: 'Create builder',
        description: 'Registers a new builder tile with UI metadata and optional stats.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BuilderRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Builder created successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Builder' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation failed.',
            content: { 'application/json': { schema: errorResponse } },
          },
          409: {
            description: 'Builder already exists.',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
    '/api/builders/{builderId}': {
      parameters: [
        {
          name: 'builderId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Unique identifier (matches `all-builders.json` id).',
        },
      ],
      get: {
        tags: ['Builders'],
        summary: 'Retrieve builder',
        responses: {
          200: {
            description: 'Builder found.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Builder' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Builder not found.',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
      put: {
        tags: ['Builders'],
        summary: 'Update builder metadata',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BuilderRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Builder updated.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Builder' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Builder not found.',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
      delete: {
        tags: ['Builders'],
        summary: 'Delete builder',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Builder deleted.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Builder' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Builder not found.',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
    '/api/schemas': {
      get: {
        tags: ['Schemas'],
        summary: 'List schemas or fetch by query',
        description:
          'Returns all schemas or a subset filtered by query string. Each schema describes form sections and actions used by the builder UI.',
        parameters: [
          {
            name: 'id',
            in: 'query',
            schema: { type: 'string' },
            description: 'Return a single schema by id.',
          },
          {
            name: 'schemaIds',
            in: 'query',
            schema: { type: 'string' },
            description: 'Comma separated list of schema ids.',
          },
          {
            name: 'summary',
            in: 'query',
            schema: { type: 'boolean', default: false },
            description: 'Return summarized schema metadata (counts, identifiers).',
          },
        ],
        responses: {
          200: {
            description: 'Schemas retrieved successfully.',
            headers: {
              'Cache-Control': { schema: { type: 'string' } },
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      oneOf: [
                        { $ref: '#/components/schemas/Schema' },
                        {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Schema' },
                        },
                      ],
                    },
                    meta: {
                      type: 'object',
                      nullable: true,
                      description: 'Only returned when filtering by ids.',
                      properties: {
                        requestedIds: {
                          type: 'array',
                          items: { type: 'string' },
                        },
                        returnedCount: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Schemas not found.',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
      post: {
        tags: ['Schemas'],
        summary: 'Create schema',
        description: 'Registers a new schema definition and clears caches.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Schema' },
            },
          },
        },
        responses: {
          201: {
            description: 'Schema created.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Schema' },
                  },
                },
              },
            },
          },
          409: {
            description: 'Schema already exists.',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
    '/api/schemas/{schemaId}': {
      parameters: [
        {
          name: 'schemaId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Identifier defined in `all-schemas.json`.',
        },
      ],
      get: {
        tags: ['Schemas'],
        summary: 'Retrieve single schema',
        responses: {
          200: {
            description: 'Schema returned.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Schema' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Schema not found.',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
      put: {
        tags: ['Schemas'],
        summary: 'Update schema',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Schema' },
            },
          },
        },
        responses: {
          200: {
            description: 'Schema updated.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Schema' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Schema not found.',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
      delete: {
        tags: ['Schemas'],
        summary: 'Delete schema',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Schema deleted.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Schema' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Schema not found.',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'admin@gradian.me',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'StrongPassword123!',
          },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          user: {
            type: 'object',
            description: 'Subset of the user profile returned by `authenticateUser`.',
            properties: {
              id: { type: 'string' },
              email: { type: 'string', format: 'email' },
              name: { type: 'string' },
              roles: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
          tokens: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
              expiresIn: { type: 'integer' },
            },
          },
          message: { type: 'string' },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        properties: {
          refreshToken: { type: 'string', description: 'JWT refresh token' },
        },
      },
      RefreshTokenResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          accessToken: { type: 'string' },
          expiresIn: { type: 'integer', example: 900 },
          message: { type: 'string' },
        },
      },
      BuilderRequest: {
        type: 'object',
        required: ['id', 'title', 'description'],
        properties: {
          id: { type: 'string', example: 'vendors' },
          title: { type: 'string', example: 'Vendor Registry' },
          description: { type: 'string', example: 'Create and manage vendors.' },
          icon: { type: 'string', example: 'Settings' },
          href: { type: 'string', example: '/builder/vendors' },
          color: { type: 'string', example: '#8B5CF6' },
          features: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
              },
            },
          },
          stats: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                value: { type: 'string' },
                trend: { type: 'number' },
              },
            },
          },
        },
      },
      Builder: {
        allOf: [
          { $ref: '#/components/schemas/BuilderRequest' },
          {
            type: 'object',
            description: 'Materialized builder with derived defaults.',
          },
        ],
      },
      Schema: {
        type: 'object',
        required: ['id', 'title'],
        properties: {
          id: { type: 'string', example: 'vendors' },
          title: { type: 'string', example: 'Vendor onboarding' },
          description: { type: 'string' },
          version: { type: 'string', example: '1.0.0' },
          fields: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                label: { type: 'string' },
                type: { type: 'string' },
                required: { type: 'boolean' },
              },
            },
          },
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                label: { type: 'string' },
                description: { type: 'string' },
                fields: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
          },
          actions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                label: { type: 'string' },
                type: { type: 'string' },
                target: { type: 'string' },
              },
            },
          },
          metadata: {
            type: 'object',
            additionalProperties: true,
          },
        },
      },
    },
  },
};

export type SwaggerDocument = typeof swaggerDocument;


