import Notification from '../models/Notification.js';

// @desc    Get notifications for the logged-in user (role-based and user-specific)
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user._id;

    let query = {};
    if (role.toLowerCase() === 'student') {
      query = {
        $or: [
          { recipientId: userId },
          { studentId: req.user.studentId },
          { recipientRole: 'student' }
        ]
      };
    } else {
      // For Admin, Caretaker, Sanction Authority
      const normalizedRole = role === 'sanctionAuthority' ? 'sanctionAuthority' : role.toLowerCase();
      query = {
        $or: [
          { recipientId: userId },
          { recipientRole: normalizedRole }
        ]
      };
    }

    const notifications = await Notification.find({ ...query, isRead: false })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a notification (so it's gone when viewed/dismissed)
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Verify ownership/role permission
    const role = req.user.role;
    const userId = req.user._id.toString();
    const normalizedRole = role === 'sanctionAuthority' ? 'sanctionAuthority' : role.toLowerCase();

    const isRecipient = notification.recipientId && notification.recipientId.toString() === userId;
    const isRoleRecipient = notification.recipientRole === normalizedRole;
    const isStudentRecipient = role.toLowerCase() === 'student' && notification.studentId === req.user.studentId;

    if (!isRecipient && !isRoleRecipient && !isStudentRecipient) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear/Delete all notifications for the current user
// @route   DELETE /api/notifications
// @access  Private
export const clearAllNotifications = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user._id;

    let query = {};
    if (role.toLowerCase() === 'student') {
      query = {
        $or: [
          { recipientId: userId },
          { studentId: req.user.studentId },
          { recipientRole: 'student' }
        ]
      };
    } else {
      const normalizedRole = role === 'sanctionAuthority' ? 'sanctionAuthority' : role.toLowerCase();
      query = {
        $or: [
          { recipientId: userId },
          { recipientRole: normalizedRole }
        ]
      };
    }

    await Notification.deleteMany(query);
    res.json({ message: 'All notifications cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
