import User from '../models/User.js';
import Role from '../models/Role.js';
import { generateAccessToken, generateRefreshToken } from '../config/jwt.js';
import { resolveUserPermissions } from '../utils/permissions.js';
import { AppError } from '../utils/errors.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash: password, // Will be hashed by pre-save hook
    });

    // Generate tokens 
    const accessToken = generateAccessToken({ userId: user._id });
    const refreshToken = generateRefreshToken({ userId: user._id });

    // Get user permissions
    const permissions = await resolveUserPermissions(user, Role);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissionsOverride: user.permissionsOverride,
          isSuperAdmin: user.isSuperAdmin,
        },
        permissions,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and populate role
    const user = await User.findOne({ email }).populate('role');
    
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is inactive', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user._id });
    const refreshToken = generateRefreshToken({ userId: user._id });

    // Get user permissions
    const permissions = await resolveUserPermissions(user, Role);

    res.json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissionsOverride: user.permissionsOverride,
          isSuperAdmin: user.isSuperAdmin,
        },
        permissions,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    // Verify refresh token
    const { verifyRefreshToken } = await import('../config/jwt.js');
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Get user
    const user = await User.findById(decoded.userId).populate('role');
    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    // Generate new access token
    const { generateAccessToken } = await import('../config/jwt.js');
    const newAccessToken = generateAccessToken({ userId: user._id });

    // Get permissions
    const permissions = await resolveUserPermissions(user, Role);

    res.json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissionsOverride: user.permissionsOverride,
          isSuperAdmin: user.isSuperAdmin,
        },
        permissions,
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('role');
    const permissions = await resolveUserPermissions(user, Role);

    res.json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissionsOverride: user.permissionsOverride,
          isSuperAdmin: user.isSuperAdmin,
        },
        permissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

