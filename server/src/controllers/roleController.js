import Role from '../models/Role.js';
import { AppError } from '../utils/errors.js';

export const getAllRoles = async (req, res, next) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });

    res.json({
      status: 'success',
      results: roles.length,
      data: { roles },
    });
  } catch (error) {
    next(error);
  }
};

export const getRoleById = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      throw new AppError('Role not found', 404);
    }

    res.json({
      status: 'success',
      data: { role },
    });
  } catch (error) {
    next(error);
  }
};

export const createRole = async (req, res, next) => {
  try {
    const { name, permissions, description } = req.body;

    // Check if role exists
    const existingRole = await Role.findOne({ name: name.toLowerCase() });
    if (existingRole) {
      throw new AppError('Role already exists', 400);
    }

    const role = await Role.create({
      name: name.toLowerCase(),
      permissions: permissions || [],
      description,
    });

    res.status(201).json({
      status: 'success',
      data: { role },
    });
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const { name, permissions, description } = req.body;

    const role = await Role.findById(req.params.id);
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    if (name) role.name = name.toLowerCase();
    if (permissions) role.permissions = permissions;
    if (description !== undefined) role.description = description;

    await role.save();

    res.json({
      status: 'success',
      data: { role },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    await Role.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Role deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

