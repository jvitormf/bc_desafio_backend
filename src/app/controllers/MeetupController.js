import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, subHours } from 'date-fns';
import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
    async index(req, res) {
        const user = req.body;

        return res.json();
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            title: Yup.string().required(),
            description: Yup.string().required(),
            location: Yup.string().required(),
            date: Yup.date().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation failed!' });
        }

        const { title, description, location, date } = req.body;
        const planner = req.userId;

        const isPlanner = await User.findOne({
            where: { id: planner, planner: true },
        });

        if (!isPlanner) {
            return res.status(401).json({
                error: 'You must have a planner aconunt to create meetups!',
            });
        }

        // check for past dates
        const hourStart = startOfHour(parseISO(date));

        if (isBefore(hourStart, new Date())) {
            return res
                .status(400)
                .json({ error: 'Past dates are not permitted' });
        }

        // check Availability
        const checkAvailability = await Meetup.findOne({
            where: {
                planner_id: planner,
                date: hourStart,
            },
        });

        if (checkAvailability) {
            return res
                .status(400)
                .json({ error: 'Meetup date is not available!' });
        }

        const data = req.body;
        data.planner_id = planner;

        const meetup = await Meetup.create(data);

        return res.json(meetup);
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            title: Yup.string(),
            description: Yup.string(),
            location: Yup.string(),
            date: Yup.date(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation failed!' });
        }

        const meetup = await Meetup.findByPk(req.params.id);

        if (meetup.planner_id !== req.userId) {
            return res.status(401).json({
                error: 'You do not have permission to update this Meetup!',
            });
        }

        const { date } = req.body;

        // check for past dates
        const hourStart = startOfHour(parseISO(date));

        if (isBefore(hourStart, new Date())) {
            return res.status(400).json({
                error: 'Past dates are not permitted!',
            });
        }

        const { id, title, description, location } = await meetup.update(
            req.body
        );

        return res.json({
            id,
            title,
            description,
            location,
            date,
        });
    }

    async delete(req, res) {
        const meetup = await Meetup.findByPk(req.params.id);

        if (meetup.planner_id !== req.userId) {
            return res.status(401).json({
                error: 'You do not have permission to delete this Meetup!',
            });
        }

        const dateWithSub = subHours(meetup.date, 2);

        if (isBefore(dateWithSub, new Date())) {
            return res.status(401).json({
                error: 'You can only cancel meetups 2 hours in advance!',
            });
        }

        meetup.destroy();

        return res.status(200).json({ msg: 'Meetup canceled!' });
    }
}

export default new MeetupController();
