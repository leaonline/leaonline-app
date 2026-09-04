export const ErrorBaseSchema = {
  userId: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date,
    optional: true
  },
  isFatal: {
    type: Boolean,
    optional: true
  },
  name: {
    type: String,
    optional: true
  },
  title: {
    type: String,
    optional: true
  },
  type: {
    type: String,
    optional: true
  },
  message: {
    type: String,
    optional: true
  },
  reason: {
    type: String,
    optional: true
  },
  details: {
    type: Object,
    blackbox: true,
    optional: true
  },
  stack: {
    type: String,
    optional: true
  }
}
