const {DataTypes}=require('sequelize');
const db=require('../utils/db-connection');

const Group = db.define('group',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false
    },
    groupName:{
        type:DataTypes.STRING,
        allowNull:false
    }

});
module.exports=Group;