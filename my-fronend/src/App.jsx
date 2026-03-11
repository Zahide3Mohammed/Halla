import { Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./context/ProtectRoute";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import TermsJourney from "./Elementes/terms";
import AskTest from "./Composants/Test/asktest";
import Questions from "./Composants/Test/Questions";
import Profile from "./Pages/profile";
import MainLayout from "./Elementes/MainLayout";
import Security from "./Composants/sideBarrePages/security";
import Settings from "./Composants/sideBarrePages/Parametre";
import GlobalLoader from "./Elementes/GlobalLoader";
import { useEffect } from "react";
import Chat from "./Composants/ChatPage/Chat";
import Club from "./Composants/Club/Club";
import FindFriends from "./Composants/Club/Friends/FindFriends";
import Notifications from "./Composants/sideBarrePages/Notification";
import PostDetails from "./Composants/Club/PostDetails";
import HotelAIFinder from "./Composants/accueil/accueil";
import Group from "./Composants/group/Group";


export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return <>   
   <BrowserRouter> 
  <GlobalLoader /> 
  <Routes>
      <Route path="/" element={<Home /> } />
      <Route path="/Login" element={<Login />} />
      <Route path="/Terms" element={<TermsJourney />} />
      <Route path="/intro-test" element={<ProtectedRoute ><AskTest /></ProtectedRoute>} />
      <Route path="/Questions" element={<ProtectedRoute ><Questions /></ProtectedRoute>} />
            <Route element={<MainLayout />}>
              <Route path="/Profile" element={<ProtectedRoute ><Profile /></ProtectedRoute>} />
              <Route path="/Settings" element={<ProtectedRoute ><Settings /></ProtectedRoute>} />
              <Route path="/Security" element={<ProtectedRoute ><Security /></ProtectedRoute>} />
              <Route path="/Notifications" element={<ProtectedRoute ><Notifications /></ProtectedRoute>} />
              <Route path="/home" element={<ProtectedRoute ><HotelAIFinder /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute ><Chat /> </ProtectedRoute>} />
              <Route path="/HallaClub" element={<ProtectedRoute ><Club /></ProtectedRoute>} />
              <Route path="/Groups" element={<ProtectedRoute ><Group /></ProtectedRoute>} />
              <Route path='/Find-Friends' element={<ProtectedRoute ><FindFriends /></ProtectedRoute>}/>
              <Route path="/post/:id" element={<PostDetails />} />
              <Route path="/profile/:id" element={<Profile />} />
            </Route>
             
    </Routes>
    </BrowserRouter>  
  </>
  
}