import mongoose, { Schema, Document } from 'mongoose';

export interface IDashboardWidget extends Document {
  title: string;
  type: string;
  description?: string;
  width: number;
  height: number;
  x?: number; // X position in grid
  y?: number; // Y position in grid

  // Settings which are generic to handle KPI, Table, and Charts
  dataSettings: any;
  styling: any;
}

const DashboardWidgetSchema: Schema = new Schema({
  title: { type: String, required: true, default: 'Untitled' },
  type: { type: String, required: true }, // KPI, Bar chart, Line chart, etc.
  description: { type: String },
  width: { type: Number, required: true, min: 1 },
  height: { type: Number, required: true, min: 1 },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },

  dataSettings: { type: Schema.Types.Mixed, default: {} },
  styling: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default mongoose.model<IDashboardWidget>('DashboardWidget', DashboardWidgetSchema);
