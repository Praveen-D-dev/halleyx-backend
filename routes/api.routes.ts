import { Router, Request, Response } from 'express';
import db from '../db/database';

const router = Router();

// Helper: map a SQLite row's integer id to _id for frontend compatibility
function mapOrder(row: any) {
  if (!row) return null;
  const { id, ...rest } = row;
  return { _id: String(id), ...rest };
}

function mapWidget(row: any) {
  if (!row) return null;
  const { id, dataSettings, styling, ...rest } = row;
  return {
    _id: String(id),
    dataSettings: JSON.parse(dataSettings || '{}'),
    styling: JSON.parse(styling || '{}'),
    ...rest,
  };
}

// ─── Customer Orders ──────────────────────────────────────────────────────────

router.get('/orders', (req: Request, res: Response) => {
  try {
    const rows = db
      .prepare('SELECT * FROM customer_orders ORDER BY createdAt DESC')
      .all();
    res.json(rows.map(mapOrder));
  } catch (error) {
    console.error('❌ GET /orders error:', error);
    res.status(500).json({ message: 'Error fetching orders', error: String(error) });
  }
});

router.post('/orders', (req: Request, res: Response) => {
  try {
    const {
      firstName, lastName, email, phone,
      streetAddress, city, stateProvince, postalCode, country,
      product, quantity, unitPrice, totalAmount, status, createdBy,
    } = req.body;

    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO customer_orders
        (firstName, lastName, email, phone, streetAddress, city, stateProvince,
         postalCode, country, product, quantity, unitPrice, totalAmount, status,
         createdBy, createdAt, updatedAt)
      VALUES
        (@firstName, @lastName, @email, @phone, @streetAddress, @city, @stateProvince,
         @postalCode, @country, @product, @quantity, @unitPrice, @totalAmount, @status,
         @createdBy, @createdAt, @updatedAt)
    `).run({
      firstName, lastName, email, phone,
      streetAddress, city, stateProvince, postalCode, country,
      product, quantity, unitPrice, totalAmount,
      status: status || 'Pending',
      createdBy,
      createdAt: now,
      updatedAt: now,
    });

    const newOrder = db
      .prepare('SELECT * FROM customer_orders WHERE id = ?')
      .get(result.lastInsertRowid);
    res.status(201).json(mapOrder(newOrder));
  } catch (error) {
    console.error('❌ POST /orders error:', error);
    res.status(400).json({ message: 'Error creating order', error: String(error) });
  }
});

router.put('/orders/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db
      .prepare('SELECT * FROM customer_orders WHERE id = ?')
      .get(Number(id));

    if (!existing) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const {
      firstName, lastName, email, phone,
      streetAddress, city, stateProvince, postalCode, country,
      product, quantity, unitPrice, totalAmount, status, createdBy,
    } = req.body;

    const updatedAt = new Date().toISOString();
    db.prepare(`
      UPDATE customer_orders SET
        firstName=@firstName, lastName=@lastName, email=@email, phone=@phone,
        streetAddress=@streetAddress, city=@city, stateProvince=@stateProvince,
        postalCode=@postalCode, country=@country, product=@product,
        quantity=@quantity, unitPrice=@unitPrice, totalAmount=@totalAmount,
        status=@status, createdBy=@createdBy, updatedAt=@updatedAt
      WHERE id=@id
    `).run({
      firstName, lastName, email, phone,
      streetAddress, city, stateProvince, postalCode, country,
      product, quantity, unitPrice, totalAmount, status, createdBy,
      updatedAt,
      id: Number(id),
    });

    const updated = db
      .prepare('SELECT * FROM customer_orders WHERE id = ?')
      .get(Number(id));
    res.json(mapOrder(updated));
  } catch (error) {
    console.error('❌ PUT /orders/:id error:', error);
    res.status(400).json({ message: 'Error updating order', error: String(error) });
  }
});

router.delete('/orders/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db
      .prepare('SELECT * FROM customer_orders WHERE id = ?')
      .get(Number(id));

    if (!existing) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    db.prepare('DELETE FROM customer_orders WHERE id = ?').run(Number(id));
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('❌ DELETE /orders/:id error:', error);
    res.status(500).json({ message: 'Error deleting order', error: String(error) });
  }
});

// ─── Dashboard Widgets ────────────────────────────────────────────────────────

router.get('/dashboard/config', (req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM dashboard_widgets').all();
    res.json(rows.map(mapWidget));
  } catch (error) {
    console.error('❌ GET /dashboard/config error:', error);
    res.status(500).json({ message: 'Error fetching dashboard config', error: String(error) });
  }
});

router.post('/dashboard/config', (req: Request, res: Response) => {
  try {
    const widgetData = req.body;
    const now = new Date().toISOString();
    let savedWidget: any;

    if (widgetData._id) {
      // Update existing
      db.prepare(`
        UPDATE dashboard_widgets SET
          title=@title, type=@type, description=@description,
          width=@width, height=@height, x=@x, y=@y,
          dataSettings=@dataSettings, styling=@styling, updatedAt=@updatedAt
        WHERE id=@id
      `).run({
        title: widgetData.title ?? 'Untitled',
        type: widgetData.type,
        description: widgetData.description ?? null,
        width: widgetData.width,
        height: widgetData.height,
        x: widgetData.x ?? 0,
        y: widgetData.y ?? 0,
        dataSettings: JSON.stringify(widgetData.dataSettings ?? {}),
        styling: JSON.stringify(widgetData.styling ?? {}),
        updatedAt: now,
        id: Number(widgetData._id),
      });
      savedWidget = db
        .prepare('SELECT * FROM dashboard_widgets WHERE id = ?')
        .get(Number(widgetData._id));
    } else {
      // Insert new
      const result = db.prepare(`
        INSERT INTO dashboard_widgets
          (title, type, description, width, height, x, y,
           dataSettings, styling, createdAt, updatedAt)
        VALUES
          (@title, @type, @description, @width, @height, @x, @y,
           @dataSettings, @styling, @createdAt, @updatedAt)
      `).run({
        title: widgetData.title ?? 'Untitled',
        type: widgetData.type,
        description: widgetData.description ?? null,
        width: widgetData.width,
        height: widgetData.height,
        x: widgetData.x ?? 0,
        y: widgetData.y ?? 0,
        dataSettings: JSON.stringify(widgetData.dataSettings ?? {}),
        styling: JSON.stringify(widgetData.styling ?? {}),
        createdAt: now,
        updatedAt: now,
      });
      savedWidget = db
        .prepare('SELECT * FROM dashboard_widgets WHERE id = ?')
        .get(result.lastInsertRowid);
    }

    res.status(200).json(mapWidget(savedWidget));
  } catch (error) {
    console.error('❌ POST /dashboard/config error:', error);
    res.status(400).json({ message: 'Error saving widget config', error: String(error) });
  }
});

router.delete('/dashboard/config/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db
      .prepare('SELECT * FROM dashboard_widgets WHERE id = ?')
      .get(Number(id));

    if (!existing) {
      res.status(404).json({ message: 'Widget config not found' });
      return;
    }

    db.prepare('DELETE FROM dashboard_widgets WHERE id = ?').run(Number(id));
    res.json({ message: 'Widget deleted successfully' });
  } catch (error) {
    console.error('❌ DELETE /dashboard/config/:id error:', error);
    res.status(500).json({ message: 'Error deleting widget', error: String(error) });
  }
});

router.post('/dashboard/config/bulk', (req: Request, res: Response) => {
  try {
    const { widgets } = req.body;

    // Delete all existing widgets in a transaction
    const bulkSave = db.transaction((widgetList: any[]) => {
      db.prepare('DELETE FROM dashboard_widgets').run();
      const now = new Date().toISOString();
      const insert = db.prepare(`
        INSERT INTO dashboard_widgets
          (title, type, description, width, height, x, y,
           dataSettings, styling, createdAt, updatedAt)
        VALUES
          (@title, @type, @description, @width, @height, @x, @y,
           @dataSettings, @styling, @createdAt, @updatedAt)
      `);

      for (const w of widgetList) {
        insert.run({
          title: w.title ?? 'Untitled',
          type: w.type,
          description: w.description ?? null,
          width: w.width,
          height: w.height,
          x: w.x ?? 0,
          y: w.y ?? 0,
          dataSettings: JSON.stringify(w.dataSettings ?? {}),
          styling: JSON.stringify(w.styling ?? {}),
          createdAt: now,
          updatedAt: now,
        });
      }
    });

    bulkSave(widgets && widgets.length > 0 ? widgets : []);

    const saved = db.prepare('SELECT * FROM dashboard_widgets').all();
    res.status(200).json(saved.map(mapWidget));
  } catch (error) {
    console.error('❌ POST /dashboard/config/bulk error:', error);
    res.status(400).json({ message: 'Error saving dashboard configurations in bulk', error: String(error) });
  }
});

export default router;
