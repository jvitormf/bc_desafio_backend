module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('meetups_users', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            meetup_id: {
                type: Sequelize.INTEGER,
                references: { model: 'meetups', key: 'id' },
                onDelete: 'CASCADE',
                allowNull: false,
            },
            user_id: {
                type: Sequelize.INTEGER,
                references: { model: 'users', key: 'id' },
                onDelete: 'CASCADE',
                allowNull: false,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });
    },

    down: queryInterface => {
        return queryInterface.dropTable('meetupUser');
    },
};
