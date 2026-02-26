const userRepository = require('../repositories/userRepository');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const MasterData = require('../models/MasterData');
const { AppError } = require('../middleware/errorHandler');

class UserService {
  async createUser(userData) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      throw new AppError('Email already exists', 400);
    }

    const user = await User.create(userData);
    return user;
  }

  async updateUser(id, updateData) {
    // Don't allow email update to prevent conflicts
    if (updateData.email) {
      const existing = await User.findOne({ email: updateData.email, _id: { $ne: id } });
      if (existing) {
        throw new AppError('Email already exists', 400);
      }
    }

    // Don't allow password update through this endpoint
    delete updateData.password;

    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async createUserWithAssignment(userData, assetIds, notes) {
    const user = await this.createUser(userData);

    if (assetIds && assetIds.length > 0) {
      const assignments = [];
      for (const assetId of assetIds) {
        const asset = await MasterData.findById(assetId);
        if (!asset) {
          throw new AppError(`Asset ${assetId} not found`, 404);
        }
        if (asset.assetType === 'non-assignable') {
          throw new AppError(`Asset ${asset.name} is non-assignable`, 400);
        }
        if (asset.status !== 'available') {
          throw new AppError(`Asset ${asset.name} is not available (status: ${asset.status})`, 400);
        }

        // Check for active assignment
        const activeAssignment = await Assignment.findOne({ assetId, status: 'active' });
        if (activeAssignment) {
          throw new AppError(`Asset ${asset.name} is already assigned`, 400);
        }

        const assignment = await Assignment.create({
          assetId,
          userId: user._id,
          status: 'active',
          assignedDate: new Date(),
          notes: notes || ''
        });

        asset.status = 'assigned';
        asset.assignedTo = user._id;
        await asset.save();

        assignments.push(assignment);
      }

      return { user, assignments };
    }

    return { user, assignments: [] };
  }

  async getAllUsers(filters) {
    return await userRepository.findAll(filters);
  }

  async getUserById(id) {
    return await userRepository.findById(id);
  }

  async deleteUser(id) {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}

module.exports = new UserService();
