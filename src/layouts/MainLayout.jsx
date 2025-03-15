// // src/layouts/MainLayout.jsx
// import React from "react";
// import { Outlet } from "react-router-dom";
// import Navbar from "../components/ui/Navbar"; // import the Navbar component
// import Sidebar from "../components/ui/Sidebar";
// import ChatBox from "../components/ui/ChatBox";

// const MainLayout = () => {
//     return (
//         <div>
//             <Navbar /> 
//             <Sidebar />
//             <ChatBox />
//             <h1>App Logo/Header</h1>
//             <Outlet />  {/* The nested routes will be rendered here */}
//         </div>
//     );
// };

// export default MainLayout;


// // src/layouts/MainLayout.jsx
// import React from "react";
// import { Outlet } from "react-router-dom";
// import Navbar from "../components/ui/Navbar";
// import Sidebar from "../components/ui/Sidebar";
// import ChatBox from "../components/ui/ChatBox";

// const MainLayout = () => {
//     return (
//         <div className="flex h-screen w-full overflow-hidden">
//             {/* Left panel - Navbar */}
//             <div className="w-48 border-r border-gray-200 h-full overflow-auto">
//                 <Navbar />
//             </div>
            
//             {/* Middle panel - Sidebar */}
//             <div className="w-64 border-r border-gray-200 h-full overflow-auto">
//                 <Sidebar />
//             </div>
            
//             {/* Right panel - ChatBox */}
//             <div className="flex-1 h-full overflow-auto">
//                 <ChatBox />
//                 <Outlet /> {/* The nested routes will be rendered here */}
//             </div>
//         </div>
//     );
// };

// export default MainLayout;


// src/layouts/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/ui/Navbar";
import Sidebar from "../components/ui/Sidebar";
import ChatBox from "../components/ui/ChatBox";

const MainLayout = () => {
    return (
        <div className="flex h-screen w-full overflow-hidden">
            {/* Left panel - Navbar with icons */}
            <div className="w-16 border-r border-gray-200 h-full overflow-auto bg-gray-50">
                <Navbar />
            </div>
            
            {/* Middle panel - Sidebar */}
            <div className="w-64 border-r border-gray-200 h-full overflow-auto">
                <Sidebar />
            </div>
            
            {/* Right panel - ChatBox */}
            <div className="flex-1 h-full overflow-auto">
                <ChatBox />
                {/* <Outlet /> The nested routes will be rendered here */}
            </div>
        </div>
    );
};

export default MainLayout;