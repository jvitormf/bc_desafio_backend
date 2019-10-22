import * as Yup from 'yup';
import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
    async store(req, res) {
        const schema = Yup.object().shape({
            title: Yup.string().required(),
            description: Yup.string().required(),
            location: Yup.string().required(),
            date: Yup.date().required(),
            planner_id: Yup.number().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation failed!' });
        }

        const { planner_id, title, description, location, date } = req.body;

        const isPlanner = await User.findOne({
            where: { id: planner_id, planner: true },
        });

        if (!isPlanner) {
            return res
                .status(401)
                .json({ error: 'You can only create meetups with planners' });
        }

        const meetup = await Meetup.create({
            title,
            description,
            location,
            date,
            planner_id,
        });

        return res.json(meetup);
    }
}

export default new MeetupController();
