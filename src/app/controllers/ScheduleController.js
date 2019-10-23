import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import User from '../models/User';
import Meetup from '../models/Meetup';

class ScheduleController {
    async index(req, res) {
        const checkUserPlanner = await User.findOne({
            where: { id: req.userId, planner: true },
        });

        if (!checkUserPlanner) {
            return res.status(401).json({ error: 'User is not a planner' });
        }

        const { date } = req.query;
        const parsedDate = parseISO(date);

        const meetups = await Meetup.findAll({
            where: {
                planner_id: req.userId,
                date: {
                    [Op.between]: [
                        startOfDay(parsedDate),
                        endOfDay(parsedDate),
                    ],
                },
            },
            order: ['date'],
        });

        return res.json(meetups);
    }
}

export default new ScheduleController();
