const Users=require('./Users');
const Group = require('./group');
const GroupMembers = require('./GroupMembers');

// users to group 
// many to many association

Users.belongsToMany(Group,{
    through:GroupMembers,
    foreignKey:'userId',
     otherKey: 'groupId'
    
});
Group.belongsToMany(Users,{
    through:GroupMembers,
    foreignKey:'groupId',
    otherKey: 'userId'
   
});

module.exports={
    Users,
    Group,
    GroupMembers
}






