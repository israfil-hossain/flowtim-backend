import swaggerJSDoc from 'swagger-jsdoc';
import { config } from './app.config';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FlowTim API',
      version: '1.0.0',
      description: 'API documentation for FlowTim project management system',
      contact: {
        name: 'FlowTim Team',
        email: 'support@flowtim.com',
      },
    },
    servers: [
      {
        url: config.BASE_URL,
        description: config.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
          description: 'Session-based authentication using cookies',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            avatar: {
              type: 'string',
              description: 'User avatar URL',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp',
            },
          },
        },
        Workspace: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Workspace ID',
            },
            name: {
              type: 'string',
              description: 'Workspace name',
            },
            description: {
              type: 'string',
              description: 'Workspace description',
            },
            inviteCode: {
              type: 'string',
              description: 'Workspace invite code',
            },
            createdBy: {
              type: 'string',
              description: 'User ID who created the workspace',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Workspace creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Workspace last update timestamp',
            },
          },
        },
        Project: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Project ID',
            },
            name: {
              type: 'string',
              description: 'Project name',
            },
            description: {
              type: 'string',
              description: 'Project description',
            },
            status: {
              type: 'string',
              enum: ['active', 'completed', 'archived'],
              description: 'Project status',
            },
            workspaceId: {
              type: 'string',
              description: 'Workspace ID this project belongs to',
            },
            createdBy: {
              type: 'string',
              description: 'User ID who created the project',
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Project start date',
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Project end date',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Project creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Project last update timestamp',
            },
          },
        },
        Task: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Task ID',
            },
            title: {
              type: 'string',
              description: 'Task title',
            },
            description: {
              type: 'string',
              description: 'Task description',
            },
            status: {
              type: 'string',
              enum: ['todo', 'in-progress', 'review', 'completed'],
              description: 'Task status',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Task priority',
            },
            assignedTo: {
              type: 'string',
              description: 'User ID assigned to this task',
            },
            projectId: {
              type: 'string',
              description: 'Project ID this task belongs to',
            },
            workspaceId: {
              type: 'string',
              description: 'Workspace ID this task belongs to',
            },
            dueDate: {
              type: 'string',
              format: 'date',
              description: 'Task due date',
            },
            estimatedHours: {
              type: 'number',
              description: 'Estimated hours to complete the task',
            },
            actualHours: {
              type: 'number',
              description: 'Actual hours spent on the task',
            },
            createdBy: {
              type: 'string',
              description: 'User ID who created the task',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Task creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Task last update timestamp',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error code',
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            path: {
              type: 'string',
              description: 'Request path',
            },
            method: {
              type: 'string',
              description: 'HTTP method',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Error timestamp',
            },
          },
        },
        Document: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Document ID',
            },
            title: {
              type: 'string',
              description: 'Document title',
            },
            content: {
              type: 'string',
              description: 'Document content',
            },
            category: {
              type: 'string',
              enum: ['general', 'meeting-notes', 'specification', 'manual', 'report', 'other'],
              description: 'Document category',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Document tags',
            },
            createdBy: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                avatar: { type: 'string' },
              },
              description: 'Document creator',
            },
            workspaceId: {
              type: 'string',
              description: 'Workspace ID',
            },
            projectId: {
              type: 'string',
              description: 'Project ID (optional)',
            },
            isPublic: {
              type: 'boolean',
              description: 'Whether document is public',
            },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  url: { type: 'string' },
                  size: { type: 'number' },
                  mimeType: { type: 'string' },
                  uploadedAt: { type: 'string', format: 'date-time' },
                },
              },
              description: 'Document attachments',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Document creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Document last update timestamp',
            },
          },
        },
        DocumentVersion: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Version ID',
            },
            documentId: {
              type: 'string',
              description: 'Document ID',
            },
            version: {
              type: 'number',
              description: 'Version number',
            },
            title: {
              type: 'string',
              description: 'Document title at this version',
            },
            content: {
              type: 'string',
              description: 'Document content at this version',
            },
            changes: {
              type: 'string',
              description: 'Description of changes',
            },
            createdBy: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                avatar: { type: 'string' },
              },
              description: 'Version creator',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Version creation timestamp',
            },
          },
        },
        DocumentShare: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Share ID',
            },
            documentId: {
              type: 'string',
              description: 'Document ID',
            },
            sharedWith: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                avatar: { type: 'string' },
              },
              description: 'User shared with',
            },
            sharedBy: {
              type: 'string',
              description: 'User who shared',
            },
            permission: {
              type: 'string',
              enum: ['view', 'comment', 'edit', 'admin'],
              description: 'Permission level',
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              description: 'Share expiration date',
            },
            isActive: {
              type: 'boolean',
              description: 'Whether share is active',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Share creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Share last update timestamp',
            },
          },
        },
        DocumentCollaborator: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Collaborator ID',
            },
            documentId: {
              type: 'string',
              description: 'Document ID',
            },
            userId: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                avatar: { type: 'string' },
              },
              description: 'Collaborating user',
            },
            isActive: {
              type: 'boolean',
              description: 'Whether user is actively collaborating',
            },
            lastSeenAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last activity timestamp',
            },
            cursorPosition: {
              type: 'number',
              description: 'Current cursor position',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Collaboration start timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Channel: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Channel ID',
            },
            name: {
              type: 'string',
              description: 'Channel name',
            },
            description: {
              type: 'string',
              description: 'Channel description',
            },
            type: {
              type: 'string',
              enum: ['public', 'private', 'direct'],
              description: 'Channel type',
            },
            workspaceId: {
              type: 'string',
              description: 'Workspace ID',
            },
            createdBy: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                avatar: { type: 'string' },
              },
              description: 'Channel creator',
            },
            isArchived: {
              type: 'boolean',
              description: 'Whether channel is archived',
            },
            lastMessageAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last message timestamp',
            },
            membersCount: {
              type: 'number',
              description: 'Number of members',
            },
            memberRole: {
              type: 'string',
              enum: ['admin', 'member'],
              description: 'User role in channel',
            },
            lastReadAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last read timestamp',
            },
            notificationsEnabled: {
              type: 'boolean',
              description: 'Whether notifications are enabled',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Channel creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Channel last update timestamp',
            },
          },
        },
        Message: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Message ID',
            },
            content: {
              type: 'string',
              description: 'Message content',
            },
            type: {
              type: 'string',
              enum: ['text', 'file', 'image', 'system'],
              description: 'Message type',
            },
            channelId: {
              type: 'string',
              description: 'Channel ID',
            },
            senderId: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                avatar: { type: 'string' },
              },
              description: 'Message sender',
            },
            replyToId: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                content: { type: 'string' },
                senderId: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
              },
              description: 'Replied to message',
            },
            threadCount: {
              type: 'number',
              description: 'Number of replies',
            },
            isEdited: {
              type: 'boolean',
              description: 'Whether message was edited',
            },
            isDeleted: {
              type: 'boolean',
              description: 'Whether message was deleted',
            },
            editedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Edit timestamp',
            },
            deletedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Delete timestamp',
            },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  fileName: { type: 'string' },
                  fileUrl: { type: 'string' },
                  fileSize: { type: 'number' },
                  mimeType: { type: 'string' },
                  uploadedAt: { type: 'string', format: 'date-time' },
                },
              },
              description: 'Message attachments',
            },
            mentions: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Mentioned user IDs',
            },
            reactions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/MessageReaction',
              },
              description: 'Message reactions',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Message creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Message last update timestamp',
            },
          },
        },
        MessageReaction: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Reaction ID',
            },
            messageId: {
              type: 'string',
              description: 'Message ID',
            },
            userId: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                avatar: { type: 'string' },
              },
              description: 'User who reacted',
            },
            emoji: {
              type: 'string',
              description: 'Unicode emoji',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Reaction creation timestamp',
            },
          },
        },
        ChannelMember: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Membership ID',
            },
            channelId: {
              type: 'string',
              description: 'Channel ID',
            },
            userId: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                avatar: { type: 'string' },
              },
              description: 'Channel member',
            },
            role: {
              type: 'string',
              enum: ['admin', 'member'],
              description: 'Member role',
            },
            joinedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Join timestamp',
            },
            lastReadAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last read timestamp',
            },
            isActive: {
              type: 'boolean',
              description: 'Whether membership is active',
            },
            notificationsEnabled: {
              type: 'boolean',
              description: 'Whether notifications are enabled',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Membership creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Membership last update timestamp',
            },
          },
        },
        UserStatus: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Status ID',
            },
            userId: {
              type: 'string',
              description: 'User ID',
            },
            workspaceId: {
              type: 'string',
              description: 'Workspace ID',
            },
            status: {
              type: 'string',
              enum: ['online', 'offline', 'away', 'busy'],
              description: 'User status',
            },
            lastSeenAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last seen timestamp',
            },
            isTyping: {
              type: 'boolean',
              description: 'Whether user is typing',
            },
            typingInChannel: {
              type: 'string',
              description: 'Channel ID where user is typing',
            },
            statusMessage: {
              type: 'string',
              description: 'Custom status message',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Status creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Status last update timestamp',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Success status',
            },
            message: {
              type: 'string',
              description: 'Success message',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
      },
    },
    security: [
      {
        sessionAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);