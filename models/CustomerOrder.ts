import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomerOrder extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  
  product: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
  createdBy: string;
}

const CustomerOrderSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  stateProvince: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { 
    type: String, 
    required: true, 
    enum: ['United States', 'Canada', 'Australia', 'Singapore', 'Hong Kong'] 
  },
  
  product: { 
    type: String, 
    required: true,
    enum: [
      'Fiber Internet 300 Mbps', 
      '5GUnlimited Mobile Plan', 
      'Fiber Internet 1 Gbps', 
      'Business Internet 500 Mbps', 
      'VoIP Corporate Package'
    ]
  },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  unitPrice: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    required: true, 
    default: 'Pending',
    enum: ['Pending', 'In progress', 'Completed'] 
  },
  createdBy: { 
    type: String, 
    required: true,
    enum: [
      'Mr. Michael Harris',
      'Mr. Ryan Cooper',
      'Ms. Olivia Carter',
      'Mr. Lucas Martin'
    ]
  }
}, { timestamps: true });

export default mongoose.model<ICustomerOrder>('CustomerOrder', CustomerOrderSchema);
