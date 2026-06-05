const Dataset = require('../models/datasetModel');

/**
 * Get the distribution of records per repository.
 * Uses MongoDB Aggregation Pipeline to group by repo_name and count.
 */
exports.getRepositoryDistribution = async () => {
  const stats = await Dataset.aggregate([
    {
      $group: {
        _id: '$metadata.repo_name',
        count: { $sum: 1 },
        types: { $addToSet: '$metadata.type' }
      }
    },
    { $sort: { count: -1 } },
    {
      $project: {
        _id: 0,
        repo_name: '$_id',
        count: 1,
        types: 1
      }
    }
  ]);

  return stats;
};

/**
 * Get language/source_type metrics.
 * Groups records by programming language and provides count + avg text length.
 */
exports.getLanguageMetrics = async () => {
  const stats = await Dataset.aggregate([
    {
      $group: {
        _id: '$metadata.source_type',
        count: { $sum: 1 },
        avgInstructionLength: { $avg: { $strLenCP: '$instruction' } },
        avgOutputLength: { $avg: { $strLenCP: '$output' } }
      }
    },
    { $sort: { count: -1 } },
    {
      $project: {
        _id: 0,
        source_type: '$_id',
        count: 1,
        avgInstructionLength: { $round: ['$avgInstructionLength', 0] },
        avgOutputLength: { $round: ['$avgOutputLength', 0] }
      }
    }
  ]);

  return stats;
};

/**
 * Get overall dataset statistics.
 * Returns total records, type breakdown, and data volume metrics.
 */
exports.getOverallStats = async () => {
  const stats = await Dataset.aggregate([
    {
      $facet: {
        totalRecords: [{ $count: 'count' }],
        byType: [
          { $group: { _id: '$metadata.type', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        byDocType: [
          { $group: { _id: '$metadata.doc_type', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        readmeStats: [
          {
            $group: {
              _id: '$metadata.is_readme',
              count: { $sum: 1 }
            }
          }
        ],
        avgLengths: [
          {
            $group: {
              _id: null,
              avgInstructionLength: { $avg: { $strLenCP: '$instruction' } },
              avgOutputLength: { $avg: { $strLenCP: '$output' } }
            }
          }
        ]
      }
    }
  ]);

  const result = stats[0];
  return {
    totalRecords: result.totalRecords[0]?.count || 0,
    byType: result.byType,
    byDocType: result.byDocType,
    readmeStats: result.readmeStats,
    avgLengths: result.avgLengths[0] || {}
  };
};

/**
 * Bulk import an array of dataset records.
 * Uses insertMany with ordered: false for maximum throughput.
 */
exports.bulkImport = async (records, userId) => {
  // Attach createdBy to each record if userId is provided
  if (userId) {
    records = records.map(record => ({ ...record, createdBy: userId }));
  }

  const result = await Dataset.insertMany(records, { ordered: false });
  return {
    insertedCount: result.length,
    records: result
  };
};
