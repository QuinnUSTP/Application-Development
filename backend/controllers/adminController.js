/**
 * Admin Controller
 * Small operational endpoints for the admin dashboard (metrics/health etc.)
 */

const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Category = require('../models/Category');
const Cart = require('../models/Cart');
const AdminActivityLog = require('../models/AdminActivityLog');

// GET /api/admin/metrics (admin only)
exports.getMetrics = async (req, res) => {
  try {
    // Keep this lightweight (fast counts only)
    const [
      productsTotal,
      productsLowStock,
      ordersTotal,
      ordersPending,
      usersTotal,
      usersAdmins,
    ] = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ stock: { $lte: 5 } }),
      Order.countDocuments({}),
      Order.countDocuments({ status: 'pending' }),
      User.countDocuments({}),
      User.countDocuments({ role: 'admin' }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        products: {
          total: productsTotal,
          lowStock: productsLowStock,
          lowStockThreshold: 5,
        },
        orders: {
          total: ordersTotal,
          pending: ordersPending,
        },
        users: {
          total: usersTotal,
          admins: usersAdmins,
        },
        serverTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

function normalizeRequired(requiredValue) {
  if (Array.isArray(requiredValue)) return !!requiredValue[0];
  return !!requiredValue;
}

function inferRef(schemaType) {
  const directRef = schemaType?.options?.ref;
  if (directRef) return directRef;

  const casterRef = schemaType?.caster?.options?.ref;
  if (casterRef) return casterRef;

  const embeddedCasterRef = schemaType?.$embeddedSchemaType?.options?.ref;
  if (embeddedCasterRef) return embeddedCasterRef;

  return null;
}

function inferRelationshipType(field) {
  // ObjectId reference is typically many-to-one.
  // If FK is unique, treat as one-to-one.
  if (field.unique) return 'one-to-one';
  return 'many-to-one';
}

function serializeDefault(value) {
  if (typeof value === 'function') return `[Function:${value.name || 'anonymous'}]`;
  if (value === undefined) return null;
  return value;
}

function buildModelMetadata(model, countByModelName) {
  const schema = model.schema;
  const collection = model.collection?.collectionName || model.modelName.toLowerCase();

  const fields = Object.entries(schema.paths)
    .filter(([path]) => path !== '__v')
    .map(([path, schemaType]) => {
      const enumValues = Array.isArray(schemaType?.enumValues) ? schemaType.enumValues.filter(Boolean) : [];
      const ref = inferRef(schemaType);
      const instance = schemaType?.instance || 'Mixed';
      const isArray = instance === 'Array' || !!schemaType?.$isMongooseArray;

      return {
        name: path,
        type: instance,
        required: normalizeRequired(schemaType?.options?.required),
        unique: !!schemaType?.options?.unique,
        index: !!schemaType?._index,
        isPrimaryKey: path === '_id',
        isForeignKey: !!ref,
        references: ref,
        isArray,
        default: serializeDefault(schemaType?.options?.default),
        enumValues,
      };
    });

  const relationships = fields
    .filter((f) => f.isForeignKey)
    .map((f) => ({
      fromModel: model.modelName,
      fromCollection: collection,
      fromField: f.name,
      toModel: f.references,
      relationship: inferRelationshipType(f),
    }));

  return {
    model: model.modelName,
    collection,
    documentCount: countByModelName[model.modelName] || 0,
    fields,
    indexes: schema.indexes().map(([keys, options]) => ({ keys, options })),
    relationships,
  };
}

// GET /api/admin/schema (admin only)
exports.getSchema = async (req, res) => {
  try {
    const models = [User, Product, Category, Order, Cart, AdminActivityLog];

    const counts = await Promise.all(
      models.map(async (m) => ({ model: m.modelName, count: await m.countDocuments({}) }))
    );

    const countByModelName = counts.reduce((acc, row) => {
      acc[row.model] = row.count;
      return acc;
    }, {});

    const entities = models.map((m) => buildModelMetadata(m, countByModelName));
    const relationships = entities.flatMap((e) => e.relationships);

    return res.status(200).json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        database: {
          name: (Product.db && Product.db.name) || null,
        },
        entities,
        relationships,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
