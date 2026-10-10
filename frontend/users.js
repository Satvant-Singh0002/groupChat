const getUsers=async()=>{
    try {
        
        const token=localStorage.getItem('token');
        console.log("Token:", token);
        const response = await axios.get("http://localhost:3000/users/getUsers",
            {

            headers :{
                Authorization:token
            }
        }
        );
        console.log('response.data',response.data);
        const users=response.data.users || [];
        const groups=response.data.groups || [];
        displayUsers(users,groups);
        
    } catch (error) {
        console.log(error);
        
    }
}

const displayUsers=(users,groups)=>{

    const usersList=document.getElementById('userList');
    usersList.innerHTML="";
     users.forEach(user => {

        const userDiv = document.createElement("div");

        userDiv.classList.add("user-item");

        userDiv.innerHTML = `
            <div class="user-name">
                ${user.name}
            </div>
        `;

        userDiv.addEventListener("click", () => {

            

            // Store selected receiver
            localStorage.setItem("chatType", "individual");
             localStorage.setItem("selectedUserId", user.id);
              localStorage.setItem("selectedUserName", user.name);
               localStorage.setItem("selectedUserEmail", user.email);

            window.location.href = "chatwindow.html";

           

        });

        usersList.appendChild(userDiv);

    });

    // Display groups belonging to the logged-in user
    groups.forEach(group =>{
        const groupDiv = document.createElement("div");
        groupDiv.classList.add("user-item","group-item");

        groupDiv.innerHTML=`
        <div class="user-name">
            👥 ${group.groupName}
        </div>
        `;

        groupDiv.addEventListener("click",()=>{
              localStorage.setItem("chatType", "group");
            localStorage.setItem("selectedGroupId", group.id);
        localStorage.setItem("selectedGroupName", group.groupName);

        // We'll create this page for group messaging
        window.location.href = "chatwindow.html";
        });
        userList.appendChild(groupDiv);
    })
    
}


getUsers();

const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');
const createGroup=document.getElementById('createGroup');

menuBtn.addEventListener('click',()=>{
    console.log("Three dot clicked");

    if (menu.style.display === "block") {
        menu.style.display = "none";
    } else {
        menu.style.display = "block";
    }

    menu.classList.toggle('show');

});
createGroup.addEventListener("click",()=>{
    window.location.href="creategroup.html";
});