const Repository = require('../models/Repository');
const Document = require('../models/Document');

// @desc    Search repositories and documents
// @route   GET /api/search
exports.search = async (req, res) => {
  try {
    const { q, category, subject, minStars, sort, type } = req.query;

    if (!q && !category && !subject) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_QUERY',
          message: 'Please provide a search query or filter',
          statusCode: 400
        }
      });
    }

    // Build Repository Filter
    const repoFilter = { visibility: 'public' };

    if (q) {
      repoFilter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    if (category) repoFilter.category = category;
    if (subject) repoFilter.subjects = subject;
    if (minStars) repoFilter.starCount = { $gte: parseInt(minStars) };

    // Sort Options
    let sortOption = { createdAt: -1 };
    if (sort === 'stars') sortOption = { starCount: -1 };
    if (sort === 'updated') sortOption = { updatedAt: -1 };
    if (sort === 'relevance') sortOption = { starCount: -1, createdAt: -1 };

    // Search Repositories
    let repositories = [];
    if (!type || type === 'repository' || type === 'all') {
      repositories = await Repository.find(repoFilter)
        .populate('owner', 'username firstName lastName profilePicture')
        .sort(sortOption)
        .limit(20);
    }

    // Search Documents (only if query provided)
    let documents = [];
    if (q && (!type || type === 'document' || type === 'all')) {
      // First get all public repository IDs
      const publicRepos = await Repository.find({ visibility: 'public' }).select('_id');
      const publicRepoIds = publicRepos.map(r => r._id);

      documents = await Document.find({
        repositoryId: { $in: publicRepoIds },
        isDraft: false,
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { content: { $regex: q, $options: 'i' } }
        ]
      })
        .populate('author', 'username firstName lastName profilePicture')
        .populate('repositoryId', 'name category')
        .sort({ createdAt: -1 })
        .limit(20);
    }

    res.json({
      success: true,
      data: {
        repositories,
        documents,
        totalResults: repositories.length + documents.length
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_FAILED',
        message: error.message || 'Search failed',
        statusCode: 500
      }
    });
  }
};

// @desc    Get trending repositories (most stars in last 7 days)
// @route   GET /api/search/trending
exports.getTrending = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trending = await Repository.find({
      visibility: 'public',
      updatedAt: { $gte: sevenDaysAgo }
    })
      .populate('owner', 'username firstName lastName profilePicture')
      .sort({ starCount: -1 })
      .limit(10);

    res.json({ success: true, data: trending });
  } catch (error) {
    console.error('Trending error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: error.message,
        statusCode: 500
      }
    });
  }
};

// @desc    Get newest repositories
// @route   GET /api/search/new
exports.getNewRepositories = async (req, res) => {
  try {
    const repositories = await Repository.find({ visibility: 'public' })
      .populate('owner', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, data: repositories });
  } catch (error) {
    console.error('Get new repos error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: error.message,
        statusCode: 500
      }
    });
  }
};