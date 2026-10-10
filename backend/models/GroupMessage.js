const {DataTypes}=require('sequelize');
const db=require('../utils/db-connection');

const GroupMessage = db.define('group_messages',{
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
    senderId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    message:{
        type:DataTypes.TEXT,
        allowNull:false
    }
   
});

module.exports=GroupMessage;