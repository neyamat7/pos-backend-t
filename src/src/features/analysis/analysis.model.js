import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  // Add your schema fields here
  
}, {
  timestamps: true,
});

export default mongoose.model('Analysis', analysisSchema);
