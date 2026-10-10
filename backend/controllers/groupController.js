const Group=require('../models/group');
const GroupMembers=require('../models/GroupMembers');

exports.createGroup = async(req,res)=>{
    try{
        const {groupName,userIds}=req.body;

         if (!groupName || !userIds || userIds.length === 0) {
            return res.status(400).json({
                message: "Group name and users are required"
            });
        }

        // create group
        const group=await Group.create({
            groupName:groupName
        });

        // Add users to group
        const members = userIds.map(userId => ({
            groupId: group.id,
            userId: userId
        }));

         await GroupMembers.bulkCreate(members);

        res.status(201).json({
            message: "Group created successfully",
            group: group,
            members: members
        });


    }catch(error){
        console.error("Error creating group:", error);
        res.status(500).json({
            message: "Failed to create group"
        });
    }
}

const GroupMessages = require("../models/GroupMessage");

exports.getGroupMessages = async (req, res) => {
    try {
        const groupId = Number(req.params.groupId);

        if (!Number.isInteger(groupId) || groupId <= 0) {
            return res.status(400).json({
                message: "Invalid group ID"
            });
        }

        const messages = await GroupMessages.findAll({
            where: {
                groupId: groupId
            },
            order: [["createdAt", "ASC"]]
        });

        return res.status(200).json(messages);

    } catch (error) {
        console.error("Fetch group messages error:", error);

        return res.status(500).json({
            message: "Failed to fetch group messages"
        });
    }
};
