const Repository = require('../models/Repository');

// @desc    Create a new repository
// @route   POST /api/repositories
exports.createRepository = async (req, res) => {
  try {
    const { name, description, category, subjects, visibility, license } = req.body;

    const existingRepo = await Repository.findOne({ 
      name, 
      owner: req.user._id 
    });

    if (existingRepo) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_REPO',
          message: 'You already have a repository with this name',
          statusCode: 409
        }
      });
    }

    const repository = new Repository({
      name,
      description,
      owner: req.user._id,
      category,
      subjects: subjects || [],
      visibility: visibility || 'public',
      license: license || 'MIT',
      contributors: [req.user._id]
    });

    await repository.save();

    req.user.stats.repositoriesCreated += 1;
    await req.user.save();

    res.status(201).json({
      success: true,
      data: repository
    });
  } catch (error) {
    console.error('Create repository error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPO_CREATION_FAILED',
        message: error.message || 'Failed to create repository',
        statusCode: 500
      }
    });
  }
};

// @desc    Get all repositories
// @route   GET /api/repositories
exports.getRepositories = async (req, res) => {
  try {
    const { category, subject, search, sort } = req.query;
    const filter = { visibility: 'public' };

    if (category) filter.category = category;
    if (subject) filter.subjects = subject;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'stars') sortOption = { starCount: -1 };
    if (sort === 'updated') sortOption = { updatedAt: -1 };

    const repositories = await Repository.find(filter)
      .populate('owner', 'username firstName lastName profilePicture')
      .sort(sortOption)
      .limit(20);

    res.json({
      success: true,
      data: repositories,
      count: repositories.length
    });
  } catch (error) {
    console.error('Get repositories error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch repositories',
        statusCode: 500
      }
    });
  }
};

// @desc    Get repository by ID
// @route   GET /api/repositories/:repoId
exports.getRepositoryById = async (req, res) => {
  try {
    const repository = await Repository.findById(req.params.repoId)
      .populate('owner', 'username firstName lastName profilePicture')
      .populate('contributors', 'username firstName lastName');

    if (!repository) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Repository not found',
          statusCode: 404
        }
      });
    }

    if (repository.visibility === 'private') {
      const isOwner = repository.owner._id.toString() === req.user?._id?.toString();
      const isContributor = repository.contributors.some(
        c => c._id.toString() === req.user?._id?.toString()
      );
      
      if (!isOwner && !isContributor) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied. This repository is private.',
            statusCode: 403
          }
        });
      }
    }

    res.json({
      success: true,
      data: repository
    });
  } catch (error) {
    console.error('Get repository error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch repository',
        statusCode: 500
      }
    });
  }
};

// @desc    Update repository
// @route   PATCH /api/repositories/:repoId
exports.updateRepository = async (req, res) => {
  try {
    const { name, description, subjects, visibility, license } = req.body;
    
    const repository = await Repository.findById(req.params.repoId);
    
    if (!repository) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Repository not found',
          statusCode: 404
        }
      });
    }

    if (repository.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only the owner can update this repository',
          statusCode: 403
        }
      });
    }

    if (name) repository.name = name;
    if (description) repository.description = description;
    if (subjects) repository.subjects = subjects;
    if (visibility) repository.visibility = visibility;
    if (license) repository.license = license;

    await repository.save();

    res.json({
      success: true,
      data: repository
    });
  } catch (error) {
    console.error('Update repository error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: 'Failed to update repository',
        statusCode: 500
      }
    });
  }
};

// @desc    Delete repository
// @route   DELETE /api/repositories/:repoId
exports.deleteRepository = async (req, res) => {
  try {
    const repository = await Repository.findById(req.params.repoId);
    
    if (!repository) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Repository not found',
          statusCode: 404
        }
      });
    }

    if (repository.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only the owner can delete this repository',
          statusCode: 403
        }
      });
    }

    await repository.deleteOne();

    res.json({
      success: true,
      message: 'Repository deleted successfully'
    });
  } catch (error) {
    console.error('Delete repository error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: 'Failed to delete repository',
        statusCode: 500
      }
    });
  }
};

// @desc    Star a repository
// @route   POST /api/repositories/:repoId/star
exports.starRepository = async (req, res) => {
  try {
    const repository = await Repository.findById(req.params.repoId);
    
    if (!repository) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Repository not found',
          statusCode: 404
        }
      });
    }

    repository.starCount += 1;
    await repository.save();

    res.json({
      success: true,
      data: { starCount: repository.starCount }
    });
  } catch (error) {
    console.error('Star repository error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STAR_FAILED',
        message: 'Failed to star repository',
        statusCode: 500
      }
    });
  }
};