const getUsers=async()=>{
    try{
        const token=localStorage.getItem("token");

        const response = await axios.get('http://localhost:3000/users/getUsers',
            {
                headers:{
                    Authorization:token
                }
            });

            const users=response.data.users;
            displayUsers(users);

    }catch(error)
    {
        console.log("error",error);

    }
}
const displayUsers = (users)=>{
    const userList = document.getElementById('userList');
    userList.innerHTML="";

    users.forEach(user => {
        const userDiv=document.createElement("div");

        userDiv.classList.add("user-item");
        userDiv.innerHTML =`
        <span>${user.name}</span>
         <input 
                type="checkbox"
                class="user-checkbox"
                value="${user.id}"
            >


        `;
        userList.appendChild(userDiv);
        
    });

}
getUsers();
 const selectedUserIds=[];
const nextBtn=document.getElementById("nextBtn");
nextBtn.addEventListener("click",()=>{
   
    const loggedInUserId = localStorage.getItem("userId");
    selectedUserIds.push(Number(loggedInUserId));
    const checkboxes=document.querySelectorAll(".user-checkbox");
    


    checkboxes.forEach(checkbox=>{
        if(checkbox.checked){
            selectedUserIds.push(checkbox.value);
        }
    })
    console.log("Selected User IDs:", selectedUserIds);

})

nextBtn.addEventListener("click", () => {
    document.querySelector(".group-container").style.display = "none";

    document.getElementById("groupNameContainer").style.display = "block";
});

const createGroupBtn = document.getElementById("createGroupBtn");

createGroupBtn.addEventListener("click", async () => {

    const groupName = document.getElementById("groupName").value.trim();

    if (!groupName) {
        alert("Please enter group name");
        return;
    }

    console.log("Group Name:", groupName);
    console.log("Members:", selectedUserIds);

    try {

        const token = localStorage.getItem("token");

        const response = await axios.post(
            "http://localhost:3000/group/create",
            {
                groupName: groupName,
                userIds: selectedUserIds
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log(response.data);

        window.location.href="users.html";

    } catch (error) {
        console.log(error);
        alert("Failed to create group");
    }
});