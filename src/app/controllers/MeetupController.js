import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, subHours } from 'date-fns';
import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
    async index(req, res) {
        const meetups = await Meetup.findAll({
            where: { user_id: req.userId },
            order: ['date'],
        });

        return res.json(meetups);
    }

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
                planner_id,
                date: hourStart,
            },
        });

        if (checkAvailability) {
            return res
                .status(400)
                .json({ error: 'Meetup date is not available!' });
        }

        const meetup = await Meetup.create({
            title,
            description,
            location,
            date: hourStart,
            planner_id,
        });

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

        const planner = await Meetup.findByPk(req.params.id);

        if (planner.planner_id !== req.userId) {
            return res.status(401).json({
                error: 'You do not have permission to update this Meetup!',
            });
        }

        const { planner_id, title, description, location, date } = req.body;

        // check for past dates
        const hourStart = startOfHour(parseISO(date));

        if (isBefore(hourStart, new Date())) {
            return res.status(400).json({
                error: 'Past dates are not permitted!',
            });
        }

        // check Availability
        const checkAvailability = await Meetup.findOne({
            where: {
                planner_id,
                date: hourStart,
            },
        });

        if (checkAvailability) {
            return res
                .status(400)
                .json({ error: 'Meetup date is not available!' });
        }

        try {
            const meetup = await Meetup.update(
                {
                    title,
                    description,
                    location,
                    date: hourStart,
                },
                {
                    where: { id: req.params.id },
                }
            );

            return res.json(meetup);
        } catch (err) {
            return res.json({ error: 'Update failed!' });
        }
    }

    async delete(req, res) {
        const meetup = await Meetup.findByPk(req.params.id);

        if (meetup.planner_id !== req.userId) {
            return res.status(401).json({
                error: 'You do not have permission to delete this Meetup!',
            });
        }

        // check for past dates
        const hourStart = startOfHour(parseISO(meetup.date));

        if (isBefore(hourStart, new Date())) {
            return res.status(400).json({
                error: 'Past dates are not permitted!',
            });
        }

        const dateWithSub = subHours(meetup.date, 2);

        if (isBefore(dateWithSub, new Date())) {
            return res.status(401).json({
                error: 'You can only cancel meetups 2 hours in advance!',
            });
        }

        try {
            const meetupDelete = Meetup.destroy({
                where: { id: meetup.id },
            });
            return res.json(meetupDelete);
        } catch (err) {
            return res.json({ error: 'Meetup delete failed!' });
        }
    }
}

export default new MeetupController();
