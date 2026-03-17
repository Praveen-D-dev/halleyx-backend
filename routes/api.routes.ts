import { Router } from 'express';
import CustomerOrder from '../models/CustomerOrder';
import DashboardWidget from '../models/DashboardWidget';

const router = Router();

router.get('/orders', async (req, res) => {
  try {
    const orders = await CustomerOrder.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const newOrder = new CustomerOrder(req.body);
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error creating order', error });
  }
});

router.put('/orders/:id', async (req, res) => {
  try {
    const updatedOrder = await CustomerOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedOrder) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error updating order', error });
  }
});

router.delete('/orders/:id', async (req, res) => {
  try {
    const deletedOrder = await CustomerOrder.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error });
  }
});

router.get('/dashboard/config', async (req, res) => {
  try {
    const widgets = await DashboardWidget.find();
    res.json(widgets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard config', error });
  }
});

router.post('/dashboard/config', async (req, res) => {
  try {
    const widgetData = req.body;
    let savedWidget;

    if (widgetData._id) {
      savedWidget = await DashboardWidget.findByIdAndUpdate(
        widgetData._id,
        widgetData,
        { new: true, runValidators: true }
      );
    } else {
      const newWidget = new DashboardWidget(widgetData);
      savedWidget = await newWidget.save();
    }
    res.status(200).json(savedWidget);
  } catch (error) {
    res.status(400).json({ message: 'Error saving widget config', error });
  }
});

router.delete('/dashboard/config/:id', async (req, res) => {
  try {
    const deletedWidget = await DashboardWidget.findByIdAndDelete(req.params.id);
    if (!deletedWidget) {
      res.status(404).json({ message: 'Widget config not found' });
      return;
    }
    res.json({ message: 'Widget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting widget', error });
  }
});

router.post('/dashboard/config/bulk', async (req, res) => {
  try {
    const { widgets } = req.body;
    await DashboardWidget.deleteMany({});

    if (widgets && widgets.length > 0) {
      const mappedWidgets = widgets.map((w: any) => {
        const temp = { ...w };
        if (temp._id && String(temp._id).length !== 24) {
          delete temp._id;
        }
        return temp;
      });
      const savedWidgets = await DashboardWidget.insertMany(mappedWidgets);
      res.status(200).json(savedWidgets);
    } else {
      res.status(200).json([]);
    }

  } catch (error) {
    res.status(400).json({ message: 'Error saving dashboard configurations in bulk', error });
  }
});

export default router;
