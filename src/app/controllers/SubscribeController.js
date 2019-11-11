import Op from 'sequelize';
import { isBefore } from 'date-fns';

import Meetup from '../models/Meetup';
import User from '../models/User';

class SubscribeController {
    async index(req, res) {
        const user = await User.findByPk(req.userId);

        try {
            const subscribeList = await Meetup.findAll({
                where: {
                    planner_id: {
                        [Op.ne]: user.id,
                    },
                },
                attributes: ['id', 'title', 'description', 'location', 'date'],
                include: [
                    {
                        model: User,
                        as: 'planner',
                        attributes: ['id', 'name'],
                    },
                ],
            });

            return res.json(subscribeList);
        } catch (error) {
            return res.json(error);
        }

        // return res.json(subscribeList);
    }

    async store(req, res) {
        const user = await User.findByPk(req.userId);
        const meetup = await Meetup.findByPk(req.body.meetup_id);

        if (user.id === meetup.planner_id) {
            return res.status(401).json({
                error: 'You can not subscribe in a Meetup created by you!',
            });
        }

        if (isBefore(meetup.date, new Date())) {
            return res.status(401).json({
                error:
                    'You can not subscribe in a Meetup with a date before today!',
            });
        }

        meetup.setUsers(user.id);

        return res.json(meetup);
    }
}

export default new SubscribeController();
