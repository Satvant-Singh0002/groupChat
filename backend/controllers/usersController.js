
const { Users, Group } = require('../models');
const { Op } = require('sequelize');

const getUsers = async (req, res) => {
    try {
        const loggedInUserId = req.user.userId;

        // Fetch individual users
        const users = await Users.findAll({
            where: {
                id: {
                    [Op.ne]: loggedInUserId
                }
            },
            attributes: ['id', 'name', 'email']
        });

        // Fetch groups where the logged-in user is a member
        const groups = await Group.findAll({
            include: [{
                model: Users,
                where: {
                    id: loggedInUserId
                },
                attributes: [],
                through: {
                    attributes: []
                },
                required: true
            }],
            attributes: ['id', 'groupName']
        });

        res.status(200).json({
            success: true,
            users,
            groups
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "unable to fetch users"
        });
    }
};

module.exports = {
    getUsers
};
