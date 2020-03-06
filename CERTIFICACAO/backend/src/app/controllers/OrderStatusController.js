import { format, setHours, setMinutes } from 'date-fns';
import Orders from '../models/Orders';

class OrderStatusController {
  async update(req, res) {
    const { id_order } = req.params;
    const { start_date, end_date } = req.query;

    const order = await Orders.findOne({ where: { id: id_order } });

    if (!order) {
      return res.status(401).json({ error: 'User does not exist' });
    }

    // Start Check to start_hour >= 08:00 && start_hour <= 18:00
    const available = format(Number(start_date), 'HH:mm');
    const minHour = format(setMinutes(setHours(new Date(), 8), 0), 'HH:mm');
    const maxHour = format(setMinutes(setHours(new Date(), 18), 0), 'HH:mm');

    if (available <= minHour || available >= maxHour) {
      return res.status(401).json({ error: 'Time unavailable for pickup' });
    }
    // End Check

    // start_date and end_date
    if (start_date && order.end_date === null) {
      const start = format(Number(start_date), "yyyy-MM-dd'T'HH:mm:ssxxx");
      req.body.start_date = start;
    }

    if (end_date && start_date && Number(end_date) <= Number(start_date)) {
      return res.status(401).json({
        error: 'end date cannot be less than or equal to the start date',
      });
    }

    if (end_date && order.start_date !== null) {
      const end = format(Number(end_date), "yyyy-MM-dd'T'HH:mm:ssxxx");
      req.body.end_date = end;
    }

    if (end_date && order.start_date === null) {
      return res.status(401).json({ error: 'Please set start date before' });
    }

    const newOrder = await order.update(req.body);

    return res.json({ newOrder });
  }
}

export default new OrderStatusController();
