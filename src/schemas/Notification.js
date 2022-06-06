import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    // os tipos sao os mesmo do javascript
    content: {
      type: String,
      required: true,
    },

    user: {
      type: Number,
      required: true,
    },

    // se a notificacao foi lida ou nao
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
  },

  // para montar o created_at e updated_at
  {
    timestamps: true,
  }
);

export default mongoose.model('Notification', NotificationSchema);
