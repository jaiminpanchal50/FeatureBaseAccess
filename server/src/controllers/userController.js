import User from '../models/User.js';
import { AppError } from '../utils/errors.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .populate('role', 'name permissions')
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      results: users.length,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('role', 'name permissions')
      .select('-passwordHash');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, email, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    const updatedUser = await User.findById(user._id)
      .populate('role', 'name permissions')
      .select('-passwordHash');

    res.json({
      status: 'success',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      throw new AppError('You cannot delete your own account', 400);
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

