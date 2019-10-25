import Meetup from '../models/Meetup';
import File from '../models/File';

class PlannerController {
    async index(req, res) {
        const meetups = await Meetup.findAll({
            where: { planner_id: req.userId },
            order: ['date'],
            include: [
                {
                    model: File,
                    as: 'banner',
                    attributes: ['name', 'path', 'url'],
                },
            ],
        });

        return res.json(meetups);
    }
}

export default new PlannerController();
