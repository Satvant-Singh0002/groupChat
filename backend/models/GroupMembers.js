const {DataTypes}=require('sequelize');
const db=require('../utils/db-connection');

const GroupMembers = db.define('group_members',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false
    },
    groupId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    userId:{
        type:DataTypes.INTEGER,
        allowNull:false
    }

});
module.exports=GroupMembers;